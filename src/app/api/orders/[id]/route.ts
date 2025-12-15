import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        items: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            package: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        notes: {
          orderBy: { createdAt: "desc" },
        },
        documents: true,
        invoices: {
          orderBy: { createdAt: "desc" },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            country: true,
          },
        },
        coupon: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// Comprehensive order update schema
const orderItemSchema = z.object({
  id: z.string().optional(), // If provided, update existing; otherwise create new
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  priceUSD: z.number(),
  stateFee: z.number().nullable().optional(),
  quantity: z.number().default(1),
  serviceId: z.string().optional(),
  packageId: z.string().nullable().optional(),
});

const updateOrderSchema = z.object({
  // Status fields
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

  // Payment fields
  paymentMethod: z.string().nullable().optional(),
  paymentId: z.string().nullable().optional(),

  // LLC Details
  llcName: z.string().nullable().optional(),
  llcState: z.string().nullable().optional(),
  llcType: z.string().nullable().optional(),

  // Customer Information
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().nullable().optional(),
  customerCountry: z.string().nullable().optional(),

  // Pricing
  subtotalUSD: z.number().optional(),
  discountUSD: z.number().optional(),
  totalUSD: z.number().optional(),
  currency: z.string().optional(),
  exchangeRate: z.number().nullable().optional(),

  // Order Items (for full item management)
  items: z.array(orderItemSchema).optional(),

  // Internal note
  note: z.string().optional(),
});

// Update order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = updateOrderSchema.parse(body);

    // Find order with items
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    // Status fields
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.paymentStatus !== undefined) {
      updateData.paymentStatus = data.paymentStatus;
      if (data.paymentStatus === "PAID" && !existingOrder.paidAt) {
        updateData.paidAt = new Date();
      }
    }

    // Payment fields
    if (data.paymentMethod !== undefined) {
      updateData.paymentMethod = data.paymentMethod;
    }
    if (data.paymentId !== undefined) {
      updateData.paymentId = data.paymentId;
    }

    // LLC Details
    if (data.llcName !== undefined) {
      updateData.llcName = data.llcName;
    }
    if (data.llcState !== undefined) {
      updateData.llcState = data.llcState;
    }
    if (data.llcType !== undefined) {
      updateData.llcType = data.llcType;
    }

    // Customer Information
    if (data.customerName !== undefined) {
      updateData.customerName = data.customerName;
    }
    if (data.customerEmail !== undefined) {
      updateData.customerEmail = data.customerEmail;
    }
    if (data.customerPhone !== undefined) {
      updateData.customerPhone = data.customerPhone;
    }
    if (data.customerCountry !== undefined) {
      updateData.customerCountry = data.customerCountry;
    }

    // Pricing
    if (data.subtotalUSD !== undefined) {
      updateData.subtotalUSD = data.subtotalUSD;
    }
    if (data.discountUSD !== undefined) {
      updateData.discountUSD = data.discountUSD;
    }
    if (data.totalUSD !== undefined) {
      updateData.totalUSD = data.totalUSD;
    }
    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }
    if (data.exchangeRate !== undefined) {
      updateData.exchangeRate = data.exchangeRate;
    }

    // Update order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: existingOrder.id },
        data: updateData,
      });

      // Handle order items if provided
      if (data.items !== undefined) {
        const existingItemIds = existingOrder.items.map((item) => item.id);
        const newItemIds = data.items
          .filter((item) => item.id && !item.id.startsWith("new-"))
          .map((item) => item.id as string);

        // Delete items that are no longer in the list
        const itemsToDelete = existingItemIds.filter((id) => !newItemIds.includes(id));
        if (itemsToDelete.length > 0) {
          await tx.orderItem.deleteMany({
            where: {
              id: { in: itemsToDelete },
              orderId: existingOrder.id,
            },
          });
        }

        // Update existing or create new items
        for (const item of data.items) {
          if (item.id && !item.id.startsWith("new-") && existingItemIds.includes(item.id)) {
            // Update existing item
            await tx.orderItem.update({
              where: { id: item.id },
              data: {
                name: item.name,
                description: item.description,
                priceUSD: item.priceUSD,
                stateFee: item.stateFee,
                quantity: item.quantity,
              },
            });
          } else {
            // Create new item - need a service ID
            let serviceId = item.serviceId;

            // If no service ID provided, find or create a default service
            if (!serviceId) {
              const defaultService = await tx.service.findFirst({
                where: { isActive: true },
              });

              if (defaultService) {
                serviceId = defaultService.id;
              } else {
                // Create a generic service
                const newService = await tx.service.create({
                  data: {
                    name: "Custom Service",
                    slug: `custom-service-${Date.now()}`,
                    shortDesc: "Custom service item",
                    description: "Custom service item",
                    isActive: true,
                  },
                });
                serviceId = newService.id;
              }
            }

            await tx.orderItem.create({
              data: {
                orderId: existingOrder.id,
                serviceId,
                packageId: item.packageId,
                name: item.name,
                description: item.description,
                priceUSD: item.priceUSD,
                stateFee: item.stateFee,
                quantity: item.quantity,
              },
            });
          }
        }
      }

      // Add note if provided
      if (data.note) {
        await tx.orderNote.create({
          data: {
            orderId: existingOrder.id,
            content: data.note,
            isInternal: true,
          },
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          action: "ORDER_UPDATED",
          entity: "Order",
          entityId: existingOrder.id,
          metadata: {
            orderNumber: existingOrder.orderNumber,
            changes: Object.keys(updateData),
            itemsUpdated: data.items !== undefined,
          },
        },
      });

      return updatedOrder;
    });

    // Fetch updated order with all relations
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        notes: {
          orderBy: { createdAt: "desc" },
        },
        documents: true,
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
    });

    return NextResponse.json({
      success: true,
      order: fullOrder,
    });
  } catch (error) {
    console.error("Update order error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find order
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Delete order (cascade will delete items, notes, etc.)
    await prisma.order.delete({
      where: { id: existingOrder.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "ORDER_DELETED",
        entity: "Order",
        entityId: existingOrder.id,
        metadata: {
          orderNumber: existingOrder.orderNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
