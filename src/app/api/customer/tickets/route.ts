import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { generateTicketNumber } from "@/lib/utils";

// GET - List customer's tickets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {
      customerId: session.user.id,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { ticketNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });

    // Get counts by status
    const counts = await prisma.supportTicket.groupBy({
      by: ["status"],
      where: { customerId: session.user.id },
      _count: true,
    });

    const statusCounts: Record<string, number> = {};
    for (const count of counts) {
      statusCounts[count.status] = count._count;
    }

    return NextResponse.json({
      tickets,
      counts: statusCounts,
    });
  } catch (error) {
    console.error("Error fetching customer tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST - Create new ticket
const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  category: z.string().optional(),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createTicketSchema.parse(body);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber(prisma);

    // Create ticket with initial message
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: data.subject,
        status: "OPEN",
        priority: "MEDIUM",
        category: data.category,
        customerId: session.user.id,
        orderId: data.orderId || null,
        source: "MANUAL",
        messages: {
          create: {
            content: data.message,
            senderType: "CUSTOMER",
            senderName: session.user.name || "Customer",
            senderId: session.user.id,
            type: "TEXT",
          },
        },
      },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
