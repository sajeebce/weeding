import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/admin/customers/:id/orders
 * Get all orders for a specific customer
 * Used for linking tickets to orders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get customer's orders with items
    const orders = await prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
        },
      },
    });

    // Transform the data
    const result = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      serviceName: order.items[0]?.name || "Service",
      status: order.status,
      amount: Number(order.totalUSD),
      createdAt: order.createdAt.toISOString(),
    }));

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      orders: result,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders" },
      { status: 500 }
    );
  }
}
