import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requirePluginAccess } from "@/lib/plugin-guard";
import { z } from "zod";

// GET - List tickets with filters and pagination
export async function GET(request: NextRequest) {
  try {
    // Plugin access check
    await requirePluginAccess("livesupport-pro");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const assignedToId = searchParams.get("assignedToId");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        { guestName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({
      data: tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

// POST - Create a new ticket
const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  initialMessage: z.string().min(1, "Message is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  category: z.string().nullable().optional(),
  // Customer identification (existing or guest)
  customerId: z.string().optional(),
  guestName: z.string().nullable().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().nullable().optional(),
  // Optional order link
  orderId: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Plugin access check
    await requirePluginAccess("livesupport-pro");

    const body = await request.json();
    const data = createTicketSchema.parse(body);

    // Generate ticket number
    const count = await prisma.supportTicket.count();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const ticketNumber = `SUP-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    // If customerId provided, get customer name for message
    let senderName = data.guestName || "Customer";
    if (data.customerId) {
      const customer = await prisma.user.findUnique({
        where: { id: data.customerId },
        select: { name: true },
      });
      senderName = customer?.name || "Customer";
    }

    // Create ticket with initial message
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: data.subject,
        priority: data.priority,
        category: data.category,
        customerId: data.customerId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        orderId: data.orderId,
        status: "OPEN",
        messages: {
          create: {
            content: data.initialMessage,
            senderType: "CUSTOMER",
            senderName,
            senderId: data.customerId,
            type: "TEXT",
          },
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        order: {
          select: { id: true, orderNumber: true },
        },
        messages: true,
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    // Check if it's a plugin access error
    if ((error as { status?: number }).status === 403) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 403 }
      );
    }

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
