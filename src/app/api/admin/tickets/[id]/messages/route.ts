import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
    };

    // Set first response time if not set
    if (!ticket.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
    });

    // TODO: Trigger Pusher event for real-time update

    // TODO: Send email notification to customer if enabled
    if (data.sendEmailNotification) {
      const customerEmail = ticket.customer?.email || ticket.guestEmail;
      if (customerEmail) {
        // TODO: Call email service
        console.log(`Would send email to ${customerEmail}`);
      }
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
