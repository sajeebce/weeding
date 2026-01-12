import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { triggerTyping, isPusherConfiguredAsync } from "@/lib/pusher-server";

// Simple in-memory cache for typing indicators (works without Pusher)
// This is stored in-memory and will reset on server restart
// In production, consider using Redis for multi-instance support
declare global {
  // eslint-disable-next-line no-var
  var typingCache: Map<string, { isTyping: boolean; userName: string; expiresAt: number }> | undefined;
}

if (!global.typingCache) {
  global.typingCache = new Map();
}

// Clean up expired typing indicators periodically
function cleanupTypingCache() {
  const now = Date.now();
  for (const [key, value] of global.typingCache!.entries()) {
    if (value.expiresAt < now) {
      global.typingCache!.delete(key);
    }
  }
}

// POST - Send typing indicator
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

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

    // Store typing status in cache (for polling-based real-time)
    const typingKey = `typing:${ticketId}:${user.type.toLowerCase()}`;
    if (isTyping) {
      global.typingCache!.set(typingKey, {
        isTyping: true,
        userName: user.name,
        expiresAt: Date.now() + 5000, // Expires in 5 seconds
      });
    } else {
      global.typingCache!.delete(typingKey);
    }

    // Clean up old entries
    cleanupTypingCache();

    // Also trigger Pusher if configured
    try {
      if (await isPusherConfiguredAsync()) {
        await triggerTyping(ticketId, user, isTyping);
      }
    } catch {
      // Pusher errors are non-fatal
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending typing indicator:", error);
    return NextResponse.json(
      { error: "Failed to send typing indicator" },
      { status: 500 }
    );
  }
}

// GET - Check typing status (for polling)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;
    const { searchParams } = new URL(request.url);
    const checkType = searchParams.get("type") || "customer"; // customer or agent

    const typingKey = `typing:${ticketId}:${checkType}`;
    const typingData = global.typingCache?.get(typingKey);

    // Check if typing indicator has expired
    const isTyping = typingData && typingData.expiresAt > Date.now();

    return NextResponse.json({
      isTyping: !!isTyping,
      userName: isTyping ? typingData?.userName : null,
    });
  } catch (error) {
    console.error("Error checking typing status:", error);
    return NextResponse.json({ isTyping: false });
  }
}
