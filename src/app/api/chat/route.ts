import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateTicketNumber } from "@/lib/utils";
import { z } from "zod";

// Start a new chat / create ticket
const startChatSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  subject: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const data = startChatSchema.parse(body);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber(prisma);

    // Get IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: data.subject || `Chat from ${data.name}`,
        status: "OPEN",
        priority: "MEDIUM",
        source: "LIVE_CHAT",
        ipAddress,
        userAgent,
        // If logged in, link to user
        ...(session?.user?.id
          ? { customerId: session.user.id }
          : {
              guestName: data.name,
              guestEmail: data.email,
              guestPhone: data.phone,
            }),
        // Create first message
        messages: {
          create: {
            content: data.message,
            senderType: "CUSTOMER",
            senderName: session?.user?.name || data.name,
            senderId: session?.user?.id,
            type: "TEXT",
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        customer: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Generate a session token for guest users
    const sessionToken = !session?.user?.id
      ? Buffer.from(`${ticket.id}:${Date.now()}`).toString("base64")
      : null;

    return NextResponse.json(
      {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        sessionToken,
        messages: ticket.messages,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error starting chat:", error);
    return NextResponse.json(
      { error: "Failed to start chat" },
      { status: 500 }
    );
  }
}

// Get chat status (online/offline)
export async function GET() {
  try {
    // Check if any support agent is online
    // For now, we'll use a simple check based on business hours
    // TODO: Implement real online status with Pusher presence

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Business hours: Mon-Fri 9am-6pm, Sat 10am-3pm
    let isOnline = false;
    if (day >= 1 && day <= 5) {
      // Monday to Friday
      isOnline = hour >= 9 && hour < 18;
    } else if (day === 6) {
      // Saturday
      isOnline = hour >= 10 && hour < 15;
    }

    // TODO: Check actual agent presence from database or Pusher

    return NextResponse.json({
      online: isOnline,
      status: isOnline ? "online" : "offline",
      estimatedResponseTime: isOnline ? "Usually replies in a few minutes" : "We'll respond within 24 hours",
      operatingHours: {
        timezone: "GMT+6",
        weekdays: "9:00 AM - 6:00 PM",
        saturday: "10:00 AM - 3:00 PM",
        sunday: "Closed",
      },
    });
  } catch (error) {
    console.error("Error getting chat status:", error);
    return NextResponse.json(
      { error: "Failed to get chat status" },
      { status: 500 }
    );
  }
}
