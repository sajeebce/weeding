import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Get ticket statistics for dashboard
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowedRoles = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get counts by status
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      waitingTickets,
      resolvedTickets,
      closedTickets,
      urgentTickets,
      highPriorityTickets,
      unassignedTickets,
      todayTickets,
      weekTickets,
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({
        where: {
          status: { in: ["WAITING_FOR_CUSTOMER", "WAITING_FOR_AGENT"] },
        },
      }),
      prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
      prisma.supportTicket.count({ where: { status: "CLOSED" } }),
      prisma.supportTicket.count({ where: { priority: "URGENT" } }),
      prisma.supportTicket.count({ where: { priority: "HIGH" } }),
      prisma.supportTicket.count({ where: { assignedToId: null, status: { not: "CLOSED" } } }),
      prisma.supportTicket.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.supportTicket.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calculate average response time (for resolved tickets)
    const ticketsWithResponse = await prisma.supportTicket.findMany({
      where: {
        firstResponseAt: { not: null },
      },
      select: {
        createdAt: true,
        firstResponseAt: true,
      },
    });

    let avgResponseTimeMinutes = 0;
    if (ticketsWithResponse.length > 0) {
      const totalResponseTime = ticketsWithResponse.reduce((acc, ticket) => {
        if (ticket.firstResponseAt) {
          return (
            acc +
            (ticket.firstResponseAt.getTime() - ticket.createdAt.getTime())
          );
        }
        return acc;
      }, 0);
      avgResponseTimeMinutes = Math.round(
        totalResponseTime / ticketsWithResponse.length / 1000 / 60
      );
    }

    // Get unread message count
    const unreadMessages = await prisma.supportMessage.count({
      where: {
        senderType: "CUSTOMER",
        isRead: false,
      },
    });

    return NextResponse.json({
      overview: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        waiting: waitingTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
      },
      priority: {
        urgent: urgentTickets,
        high: highPriorityTickets,
      },
      workload: {
        unassigned: unassignedTickets,
        unreadMessages,
      },
      trends: {
        today: todayTickets,
        thisWeek: weekTickets,
      },
      performance: {
        avgResponseTimeMinutes,
        avgResponseTimeFormatted:
          avgResponseTimeMinutes > 60
            ? `${Math.round(avgResponseTimeMinutes / 60)}h ${avgResponseTimeMinutes % 60}m`
            : `${avgResponseTimeMinutes}m`,
      },
    });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket stats" },
      { status: 500 }
    );
  }
}
