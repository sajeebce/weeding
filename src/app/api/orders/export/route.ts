import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Export orders as CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const format = searchParams.get("format") || "csv";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus.toUpperCase();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    // Fetch orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") {
      return NextResponse.json({
        orders,
        exportedAt: new Date().toISOString(),
        totalCount: orders.length,
      });
    }

    // Generate CSV
    const csvHeaders = [
      "Order Number",
      "Status",
      "Payment Status",
      "Payment Method",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Customer Country",
      "LLC Name",
      "LLC State",
      "LLC Type",
      "Subtotal (USD)",
      "Discount (USD)",
      "Total (USD)",
      "Currency",
      "Items",
      "Paid At",
      "Created At",
      "Updated At",
    ];

    const csvRows = orders.map((order) => [
      order.orderNumber,
      order.status,
      order.paymentStatus,
      order.paymentMethod || "",
      order.customerName,
      order.customerEmail,
      order.customerPhone || "",
      order.customerCountry || "",
      order.llcName || "",
      order.llcState || "",
      order.llcType || "",
      order.subtotalUSD.toString(),
      order.discountUSD.toString(),
      order.totalUSD.toString(),
      order.currency,
      order.items.map((item) => item.name).join("; "),
      order.paidAt ? new Date(order.paidAt).toISOString() : "",
      new Date(order.createdAt).toISOString(),
      new Date(order.updatedAt).toISOString(),
    ]);

    // Escape CSV values
    const escapeCSV = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      csvHeaders.map(escapeCSV).join(","),
      ...csvRows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "ORDERS_EXPORTED",
        entity: "Order",
        metadata: {
          format,
          orderCount: orders.length,
          filters: { status, paymentStatus, startDate, endDate },
        },
      },
    });

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export orders error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
