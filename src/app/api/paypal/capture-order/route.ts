import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { capturePayPalOrder } from "@/lib/paypal";
import prisma from "@/lib/db";

const captureOrderSchema = z.object({
  paypalOrderId: z.string().min(1),
  orderId: z.string().min(1),
});

// POST /api/paypal/capture-order - Capture a PayPal payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = captureOrderSchema.parse(body);

    // Capture the payment
    const result = await capturePayPalOrder(validatedData.paypalOrderId);

    if (!result.success) {
      return NextResponse.json(
        { error: "Payment capture failed", status: result.status },
        { status: 400 }
      );
    }

    // Update order in database
    const order = await prisma.order.update({
      where: {
        orderNumber: validatedData.orderId
      },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "paypal",
        paymentId: result.transactionId,
        paidAt: new Date(),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: order.userId,
        action: "payment_completed",
        entity: "order",
        entityId: order.id,
        metadata: {
          gateway: "paypal",
          transactionId: result.transactionId,
          amount: result.amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error capturing PayPal order:", error);
    const message = error instanceof Error ? error.message : "Failed to capture PayPal payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
