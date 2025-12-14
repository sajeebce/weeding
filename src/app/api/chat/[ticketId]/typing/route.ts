import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { triggerTyping, isPusherConfiguredAsync } from "@/lib/pusher-server";

// POST - Send typing indicator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    // Check if Pusher is configured
    if (!(await isPusherConfiguredAsync())) {
      return NextResponse.json({
        success: true,
        message: "Pusher not configured, typing indicator skipped",
      });
    }

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, guestName: true, guestEmail: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await request.json();
    const { isTyping, userId, userName, userType } = body;

    // Determine user info (for guests, use stored guest info)
    const user = {
      id: userId || ticket.guestEmail || "guest",
      name: userName || ticket.guestName || "Guest",
      type: (userType || "CUSTOMER") as "CUSTOMER" | "AGENT",
    };

    await triggerTyping(ticketId, user, isTyping);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    return NextResponse.json(
      { error: "Failed to send typing indicator" },
      { status: 500 }
    );
  }
}
