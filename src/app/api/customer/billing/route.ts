import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Fetch payment methods and billing history
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get payment methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        type: true,
        brand: true,
        last4: true,
        expiryMonth: true,
        expiryYear: true,
        cardholderName: true,
        isDefault: true,
        createdAt: true,
      },
    });

    // Get billing history (paid orders)
    const billingHistory = await prisma.order.findMany({
      where: {
        userId,
        paymentStatus: "PAID",
      },
      orderBy: { paidAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        totalUSD: true,
        currency: true,
        paymentMethod: true,
        paidAt: true,
        items: {
          select: {
            name: true,
          },
          take: 1,
        },
      },
    });

    const formattedHistory = billingHistory.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      description: order.items[0]?.name || "Order",
      amount: `$${order.totalUSD.toNumber().toFixed(2)}`,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      date: order.paidAt?.toISOString().split("T")[0] || "",
    }));

    return NextResponse.json({
      paymentMethods,
      billingHistory: formattedHistory,
    });
  } catch (error) {
    console.error("Billing fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 }
    );
  }
}
