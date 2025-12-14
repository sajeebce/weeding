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
    // Check operating hours config from database or use default
    let isOnline = true; // Default to online

    try {
      // Try to get operating hours config from database
      const operatingHoursConfig = await prisma.setting.findUnique({
        where: { key: "support.general.businessHours" },
      });

      if (operatingHoursConfig) {
        const config = JSON.parse(operatingHoursConfig.value);

        // If operating hours are disabled, always online
        if (!config.enabled) {
          isOnline = true;
        } else {
          // Check if current time is within operating hours
          const now = new Date();
          const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
          const currentDay = dayNames[now.getDay()];
          const dayConfig = config.schedule?.[currentDay];

          if (!dayConfig || !dayConfig.enabled) {
            isOnline = false;
          } else {
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeInMinutes = currentHours * 60 + currentMinutes;

            const [startHours, startMinutes] = (dayConfig.start || "09:00").split(":").map(Number);
            const startTimeInMinutes = startHours * 60 + startMinutes;

            const [endHours, endMinutes] = (dayConfig.end || "18:00").split(":").map(Number);
            const endTimeInMinutes = endHours * 60 + endMinutes;

            isOnline = currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
          }
        }
      }
    } catch {
      // If config fetch fails, default to online
      isOnline = true;
    }

    return NextResponse.json({
      isOnline,
      online: isOnline,
      status: isOnline ? "online" : "offline",
      estimatedResponseTime: isOnline ? "Usually replies in a few minutes" : "We'll respond within 24 hours",
    });
  } catch (error) {
    console.error("Error getting chat status:", error);
    return NextResponse.json(
      { error: "Failed to get chat status" },
      { status: 500 }
    );
  }
}
