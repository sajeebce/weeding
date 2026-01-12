import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { triggerMessageNew, isPusherConfiguredAsync } from "@/lib/pusher-server";

// Global typing cache declaration (defined in typing route)
declare global {
  // eslint-disable-next-line no-var
  var typingCache: Map<string, { isTyping: boolean; userName: string; expiresAt: number }> | undefined;
}

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET - Fetch messages (for polling)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id: ticketId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor"); // Last message ID

    // Build query
    const whereClause: Record<string, unknown> = { ticketId };
    if (cursor) {
      // Get messages after the cursor
      const cursorMessage = await prisma.supportMessage.findUnique({
        where: { id: cursor },
        select: { createdAt: true },
      });
      if (cursorMessage) {
        whereClause.createdAt = { gt: cursorMessage.createdAt };
      }
    }

    const messages = await prisma.supportMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      include: {
        attachments: true,
      },
      take: 50,
    });

    // Check if customer is typing (from cache/memory - simple implementation)
    const typingKey = `typing:${ticketId}:customer`;
    const typingData = global.typingCache?.get(typingKey);
    const isCustomerTyping = typingData && typingData.expiresAt > Date.now();
    const customerTypingName = isCustomerTyping ? typingData?.userName : null;

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        senderType: m.senderType,
        senderName: m.senderName,
        createdAt: m.createdAt.toISOString(),
        attachments: m.attachments.map((att) => ({
          id: att.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
        })),
      })),
      isCustomerTyping: !!isCustomerTyping,
      customerTypingName,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a reply (admin/agent)
const sendReplySchema = z.object({
  content: z.string().min(1, "Message is required"),
  type: z.enum(["TEXT", "IMAGE", "DOCUMENT"]).optional().default("TEXT"),
  sendEmailNotification: z.boolean().optional().default(true),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;

    const { id: ticketId } = await params;
    const body = await request.json();
    const data = sendReplySchema.parse(body);

    // Get ticket to verify it exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        status: true,
        firstResponseAt: true,
        customerId: true,
        guestEmail: true,
        customer: {
          select: { email: true, name: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Create message
    const message = await prisma.supportMessage.create({
      data: {
        ticketId,
        content: data.content,
        senderType: "AGENT",
        senderName: session.user.name || "Support Agent",
        senderId: session.user.id,
        type: data.type,
      },
      include: {
        attachments: true,
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update ticket
    const updateData: Record<string, unknown> = {
      status: "WAITING_FOR_CUSTOMER",
      updatedAt: new Date(),
    };

    // Set first response time if not set
    if (!ticket.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // Trigger Pusher event for real-time update (non-blocking, errors won't affect response)
    try {
      const pusherConfigured = await isPusherConfiguredAsync();
      if (pusherConfigured) {
        await triggerMessageNew(ticketId, {
          id: message.id,
          content: message.content,
          senderType: message.senderType as "CUSTOMER" | "AGENT" | "SYSTEM",
          senderName: message.senderName,
          type: message.type,
          createdAt: message.createdAt.toISOString(),
          attachments: message.attachments.map((att) => ({
            id: att.id,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
            fileSize: att.fileSize,
          })),
        });
      }
    } catch (pusherError) {
      // Don't fail the request if Pusher fails
      console.error("Pusher error (non-fatal):", pusherError);
    }

    // TODO: Send email notification to customer if enabled
    if (data.sendEmailNotification) {
      const customerEmail = ticket.customer?.email || ticket.guestEmail;
      if (customerEmail) {
        // TODO: Call email service
        console.log(`Would send email to ${customerEmail}`);
      }
    }

    // Return message in format expected by frontend
    return NextResponse.json({
      id: message.id,
      content: message.content,
      senderType: message.senderType,
      senderName: message.senderName,
      createdAt: message.createdAt.toISOString(),
      attachments: message.attachments.map((att) => ({
        id: att.id,
        fileName: att.fileName,
        fileUrl: att.fileUrl,
        fileType: att.fileType,
        fileSize: att.fileSize,
      })),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Error sending reply:", errorMessage, errorStack);
    return NextResponse.json(
      { error: "Failed to send reply", details: errorMessage },
      { status: 500 }
    );
  }
}
