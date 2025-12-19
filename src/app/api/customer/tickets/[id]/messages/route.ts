import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { triggerMessageNew, isPusherConfiguredAsync } from "@/lib/pusher-server";

// POST - Send message to ticket
const sendMessageSchema = z.object({
  content: z.string().min(1, "Message is required"),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      })
    )
    .optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id,
        customerId: session.user.id,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = sendMessageSchema.parse(body);

    // Create message
    const message = await prisma.supportMessage.create({
      data: {
        ticketId: id,
        content: data.content,
        senderType: "CUSTOMER",
        senderName: session.user.name || "Customer",
        senderId: session.user.id,
        type: data.attachments && data.attachments.length > 0 ? "DOCUMENT" : "TEXT",
        attachments: data.attachments
          ? {
              create: data.attachments.map((att) => ({
                fileName: att.fileName,
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileSize: att.fileSize,
              })),
            }
          : undefined,
      },
      include: {
        attachments: true,
      },
    });

    // Update ticket status to WAITING_FOR_AGENT
    await prisma.supportTicket.update({
      where: { id },
      data: {
        status: "WAITING_FOR_AGENT",
        updatedAt: new Date(),
      },
    });

    // Trigger real-time event
    if (await isPusherConfiguredAsync()) {
      await triggerMessageNew(id, {
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

    return NextResponse.json({ message }, { status: 201 });
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
