import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateTicketNumber } from "@/lib/utils";
import { z } from "zod";
import { TicketStatus, TicketPriority, TicketSource } from "@prisma/client";

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

// GET - List all tickets
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status as TicketStatus;
    }
    if (priority && priority !== "all") {
      where.priority = priority as TicketPriority;
    }
    if (assignedTo) {
      where.assignedToId = assignedTo === "unassigned" ? null : assignedTo;
    }
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { guestName: { contains: search, mode: "insensitive" } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get tickets with pagination
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: [
          { status: "asc" }, // Open tickets first
          { priority: "desc" }, // High priority first
          { updatedAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          customer: {
            select: { id: true, name: true, email: true, image: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true, image: true },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              senderType: true,
              createdAt: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    // Calculate unread counts
    const ticketsWithUnread = await Promise.all(
      tickets.map(async (ticket) => {
        const unreadCount = await prisma.supportMessage.count({
          where: {
            ticketId: ticket.id,
            senderType: "CUSTOMER",
            isRead: false,
          },
        });
        return {
          ...ticket,
          unreadCount,
          lastMessage: ticket.messages[0] || null,
          messageCount: ticket._count.messages,
        };
      })
    );

    return NextResponse.json({
      tickets: ticketsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST - Create a new ticket (manually by admin)
const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.string().optional(),
  customerId: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  assignedToId: z.string().optional(),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;

    const body = await request.json();
    const data = createTicketSchema.parse(body);

    // Generate ticket number
    const ticketNumber = await generateTicketNumber(prisma);

    // Determine sender name
    let senderName = "Support Team";
    if (data.customerId) {
      const customer = await prisma.user.findUnique({
        where: { id: data.customerId },
        select: { name: true },
      });
      senderName = customer?.name || "Customer";
    } else if (data.guestName) {
      senderName = data.guestName;
    }

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: data.subject,
        priority: (data.priority as TicketPriority) || "MEDIUM",
        category: data.category,
        source: "MANUAL" as TicketSource,
        customerId: data.customerId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        assignedToId: data.assignedToId,
        orderId: data.orderId,
        messages: {
          create: {
            content: data.message,
            senderType: "CUSTOMER",
            senderName,
            senderId: data.customerId,
            type: "TEXT",
          },
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, image: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        messages: true,
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
