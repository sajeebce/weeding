import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Get messages for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get ticket to verify access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        customerId: true,
        guestEmail: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Verify access - must be owner or have session token
    const sessionToken = request.headers.get("x-session-token");
    const isOwner =
      session?.user?.id === ticket.customerId ||
      (sessionToken && Buffer.from(sessionToken, "base64").toString().startsWith(ticketId));

    if (!isOwner && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get messages
    const messages = await prisma.supportMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        attachments: true,
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, -1) : messages;

    return NextResponse.json({
      messages: items.reverse(), // Return in chronological order
      hasMore,
      nextCursor: hasMore ? items[0]?.id : null,
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return NextResponse.json(
      { error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

// Send a new message (customer)
const attachmentSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, "Message is required"),
  type: z.enum(["TEXT", "IMAGE", "DOCUMENT"]).optional().default("TEXT"),
  attachments: z.array(attachmentSchema).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const session = await auth();
    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Get ticket to verify access and get sender name
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        customerId: true,
        guestName: true,
        guestEmail: true,
        status: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Verify access
    const sessionToken = request.headers.get("x-session-token");
    const isOwner =
      session?.user?.id === ticket.customerId ||
      (sessionToken && Buffer.from(sessionToken, "base64").toString().startsWith(ticketId));

    if (!isOwner && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine sender name
    const senderName = session?.user?.name || ticket.guestName || "Guest";

    // Determine message type based on attachments
    let messageType = data.type;
    if (data.attachments && data.attachments.length > 0) {
      const hasImage = data.attachments.some((a) => a.fileType === "image");
      messageType = hasImage ? "IMAGE" : "DOCUMENT";
    }

    // Create message with attachments
    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content: data.content,
        senderType: "CUSTOMER",
        senderName,
        senderId: session?.user?.id,
        type: messageType,
        // Create attachments if provided
        ...(data.attachments && data.attachments.length > 0 && {
          attachments: {
            create: data.attachments.map((attachment) => ({
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
            })),
          },
        }),
      },
      include: {
        attachments: true,
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update ticket status if it was waiting for customer
    if (ticket.status === "WAITING_FOR_CUSTOMER") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "OPEN" },
      });
    }

    // TODO: Trigger Pusher event for real-time update
    // TODO: Send email notification to admin

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
