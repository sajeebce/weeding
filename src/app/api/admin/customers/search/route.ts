import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/admin/customers/search
 * Search customers by name, email, or phone
 * Returns customer info with recent order and ticket stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    if (!query || query.length < 2) {
      return NextResponse.json({ customers: [] });
    }

    // Search customers by name, email, or phone
    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            items: {
              take: 1,
            },
          },
        },
        customerTickets: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            orders: true,
            customerTickets: true,
          },
        },
      },
      take: limit,
      orderBy: [{ name: "asc" }],
    });

    // Transform the data for the response
    const result = customers.map((customer) => ({
      id: customer.id,
      name: customer.name || "Unknown",
      email: customer.email,
      phone: customer.phone || undefined,
      avatar: customer.image || undefined,
      totalOrders: customer._count.orders,
      lastOrder: customer.orders[0]
        ? {
            id: customer.orders[0].id,
            orderNumber: customer.orders[0].orderNumber,
            serviceName: customer.orders[0].items[0]?.name || "Service",
            amount: Number(customer.orders[0].totalUSD),
            createdAt: customer.orders[0].createdAt.toISOString(),
          }
        : undefined,
      totalTickets: customer._count.customerTickets,
      lastTicketAt: customer.customerTickets[0]?.createdAt?.toISOString() || undefined,
    }));

    return NextResponse.json({ customers: result });
  } catch (error) {
    console.error("Error searching customers:", error);
    return NextResponse.json(
      { error: "Failed to search customers" },
      { status: 500 }
    );
  }
}
