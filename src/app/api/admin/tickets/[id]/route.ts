import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { TicketStatus, TicketPriority } from "@prisma/client";

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

// GET - Get single ticket with full details
export async function GET(
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

    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            country: true,
            createdAt: true,
          },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalUSD: true,
            llcName: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            attachments: true,
            sender: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        internalNotes: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Get previous tickets for this customer
    let previousTickets: Array<{
      id: string;
      ticketNumber: string;
      subject: string;
      status: TicketStatus;
      createdAt: Date;
    }> = [];

    if (ticket.customerId || ticket.guestEmail) {
      previousTickets = await prisma.supportTicket.findMany({
        where: {
          id: { not: ticket.id },
          OR: [
            ticket.customerId ? { customerId: ticket.customerId } : {},
            ticket.guestEmail ? { guestEmail: ticket.guestEmail } : {},
          ].filter((o) => Object.keys(o).length > 0),
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      });
    }

    // Mark customer messages as read
    await prisma.supportMessage.updateMany({
      where: {
        ticketId: id,
        senderType: "CUSTOMER",
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      ...ticket,
      previousTickets,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

// PUT - Update ticket
const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_AGENT", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  orderId: z.string().nullable().optional(),
});

export async function PUT(
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

    const { id } = await params;
    const body = await request.json();
    const data = updateTicketSchema.parse(body);

    // Check if ticket exists
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (data.status) {
      updateData.status = data.status as TicketStatus;
      // Set resolved/closed timestamps
      if (data.status === "RESOLVED" && !existingTicket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (data.status === "CLOSED" && !existingTicket.closedAt) {
        updateData.closedAt = new Date();
      }
    }

    if (data.priority) {
      updateData.priority = data.priority as TicketPriority;
    }

    if (data.category !== undefined) {
      updateData.category = data.category;
    }

    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
    }

    if (data.orderId !== undefined) {
      updateData.orderId = data.orderId;
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, email: true, image: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // TODO: Send notification if status changed or assigned

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket
export async function DELETE(
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

    // Only ADMIN can delete tickets
    if (accessCheck.session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete tickets" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.supportTicket.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
