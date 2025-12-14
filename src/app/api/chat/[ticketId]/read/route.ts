import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Mark messages as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const session = await auth();

    // Get ticket to verify access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        customerId: true,
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

    // Mark all agent messages as read (customer is reading)
    await prisma.supportMessage.updateMany({
      where: {
        ticketId,
        senderType: "AGENT",
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // TODO: Trigger Pusher event for read receipt

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
