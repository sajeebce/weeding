import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const bulkUpdateSchema = z.object({
  orderIds: z.array(z.string()).min(1, "At least one order ID is required"),
  action: z.enum(["updateStatus", "updatePaymentStatus", "delete"]),
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "IN_PROGRESS",
    "WAITING_FOR_INFO",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
  ]).optional(),
  paymentStatus: z.enum([
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]).optional(),
  note: z.string().optional(),
});

// Bulk update orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bulkUpdateSchema.parse(body);

    // Validate action-specific requirements
    if (data.action === "updateStatus" && !data.status) {
      return NextResponse.json(
        { error: "Status is required for updateStatus action" },
        { status: 400 }
      );
    }

    if (data.action === "updatePaymentStatus" && !data.paymentStatus) {
      return NextResponse.json(
        { error: "Payment status is required for updatePaymentStatus action" },
        { status: 400 }
      );
    }

    // Find orders (by id or orderNumber)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: { in: data.orderIds } },
          { orderNumber: { in: data.orderIds } },
        ],
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No orders found" },
        { status: 404 }
      );
    }

    const orderIdList = orders.map((o) => o.id);
    let updatedCount = 0;

    switch (data.action) {
      case "updateStatus": {
        // Update status for all orders
        const result = await prisma.order.updateMany({
          where: { id: { in: orderIdList } },
          data: { status: data.status },
        });
        updatedCount = result.count;

        // Add notes if provided
        if (data.note) {
          await prisma.orderNote.createMany({
            data: orderIdList.map((orderId) => ({
              orderId,
              content: data.note || `Bulk status update to ${data.status}`,
              isInternal: true,
            })),
          });
        }

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: "BULK_STATUS_UPDATE",
            entity: "Order",
            metadata: {
              orderCount: updatedCount,
              newStatus: data.status,
              orderNumbers: orders.map((o) => o.orderNumber),
            },
          },
        });
        break;
      }

      case "updatePaymentStatus": {
        // Update payment status for all orders
        const updateData: Record<string, unknown> = {
          paymentStatus: data.paymentStatus,
        };

        // Set paidAt if changing to PAID
        if (data.paymentStatus === "PAID") {
          updateData.paidAt = new Date();
        }

        const result = await prisma.order.updateMany({
          where: { id: { in: orderIdList } },
          data: updateData,
        });
        updatedCount = result.count;

        // Add notes if provided
        if (data.note) {
          await prisma.orderNote.createMany({
            data: orderIdList.map((orderId) => ({
              orderId,
              content: data.note || `Bulk payment status update to ${data.paymentStatus}`,
              isInternal: true,
            })),
          });
        }

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: "BULK_PAYMENT_STATUS_UPDATE",
            entity: "Order",
            metadata: {
              orderCount: updatedCount,
              newPaymentStatus: data.paymentStatus,
              orderNumbers: orders.map((o) => o.orderNumber),
            },
          },
        });
        break;
      }

      case "delete": {
        // Delete all orders
        const result = await prisma.order.deleteMany({
          where: { id: { in: orderIdList } },
        });
        updatedCount = result.count;

        // Log activity
        await prisma.activityLog.create({
          data: {
            action: "BULK_ORDER_DELETE",
            entity: "Order",
            metadata: {
              orderCount: updatedCount,
              orderNumbers: orders.map((o) => o.orderNumber),
            },
          },
        });
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${updatedCount} order(s)`,
      updatedCount,
    });
  } catch (error) {
    console.error("Bulk update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process bulk action" },
      { status: 500 }
    );
  }
}
