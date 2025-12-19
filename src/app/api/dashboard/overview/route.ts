import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get order stats
    const [totalOrders, completedOrders, inProgressOrders, pendingOrders] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: "COMPLETED" } }),
      prisma.order.count({ where: { userId, status: "PROCESSING" } }),
      prisma.order.count({ where: { userId, status: "PENDING" } }),
    ]);

    // Get document count
    const documentCount = await prisma.document.count({
      where: {
        order: { userId },
      },
    });

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    // Get recent documents (last 5)
    const recentDocuments = await prisma.document.findMany({
      where: {
        order: { userId },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    });

    // Get orders requiring action (pending customer info, etc.)
    const actionRequiredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    // Format the response
    const stats = {
      totalOrders,
      completedOrders,
      inProgressOrders: inProgressOrders + pendingOrders,
      documentCount,
    };

    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      service: order.items[0]?.service?.name || order.items[0]?.name || "Service",
      state: order.llcState,
      status: order.status.toLowerCase(),
      date: order.createdAt.toISOString().split("T")[0],
      total: `$${order.totalUSD.toNumber()}`,
    }));

    const formattedDocuments = recentDocuments.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type || "Document",
      status: doc.status.toLowerCase(),
      date: doc.createdAt.toISOString().split("T")[0],
      url: doc.fileUrl,
      orderNumber: doc.order?.orderNumber,
    }));

    const alerts = actionRequiredOrders
      .filter((order) => order.status === "PENDING" || order.status === "PROCESSING")
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        service: order.items[0]?.service?.name || order.items[0]?.name || "Service",
        message: order.status === "PENDING"
          ? "Your order is pending payment or confirmation."
          : "Your order is being processed. We may need additional information.",
      }));

    return NextResponse.json({
      stats,
      recentOrders: formattedOrders,
      recentDocuments: formattedDocuments,
      alerts,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
