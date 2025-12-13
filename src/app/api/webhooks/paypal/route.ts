import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyWebhookSignature, getPayPalWebhookId } from "@/lib/paypal";
import prisma from "@/lib/db";

export const runtime = "nodejs";

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    amount?: {
      currency_code: string;
      value: string;
    };
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{
          id: string;
          status: string;
          amount: {
            currency_code: string;
            value: string;
          };
        }>;
      };
    }>;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
  summary?: string;
  create_time: string;
}

async function handlePaymentCaptureCompleted(event: PayPalWebhookEvent) {
  const capture = event.resource;
  const orderId = capture.purchase_units?.[0]?.reference_id;

  if (!orderId) {
    console.log("PayPal capture without order reference, skipping");
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "paypal",
        paymentId: capture.id,
        paidAt: new Date(),
        status: "PROCESSING",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: order.userId,
        action: "payment_completed",
        entity: "order",
        entityId: order.id,
        metadata: {
          gateway: "paypal",
          captureId: capture.id,
          eventId: event.id,
          amount: capture.amount,
        },
      },
    });

    console.log(`Order ${orderId} payment completed via PayPal`);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}

async function handlePaymentCaptureDenied(event: PayPalWebhookEvent) {
  const capture = event.resource;
  const orderId = capture.purchase_units?.[0]?.reference_id;

  if (!orderId) {
    console.log("PayPal capture denied without order reference, skipping");
    return;
  }

  try {
    const order = await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: "FAILED",
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: order.userId,
        action: "payment_failed",
        entity: "order",
        entityId: order.id,
        metadata: {
          gateway: "paypal",
          captureId: capture.id,
          eventId: event.id,
          status: capture.status,
        },
      },
    });

    console.log(`Order ${orderId} payment denied via PayPal`);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
  }
}

async function handlePaymentCaptureRefunded(event: PayPalWebhookEvent) {
  const capture = event.resource;
  const orderId =
    capture.supplementary_data?.related_ids?.order_id ||
    capture.purchase_units?.[0]?.reference_id;

  if (!orderId) {
    console.log("PayPal refund without order reference, skipping");
    return;
  }

  try {
    // Find order by PayPal capture ID or order number
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ paymentId: capture.id }, { orderNumber: orderId }],
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "REFUNDED",
          status: "REFUNDED",
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: order.userId,
          action: "payment_refunded",
          entity: "order",
          entityId: order.id,
          metadata: {
            gateway: "paypal",
            eventId: event.id,
            amount: capture.amount,
          },
        },
      });

      console.log(`Order ${order.orderNumber} refunded via PayPal`);
    }
  } catch (error) {
    console.error(`Failed to process refund for ${orderId}:`, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();

    // Get PayPal webhook headers
    const authAlgo = headersList.get("paypal-auth-algo") || "";
    const certUrl = headersList.get("paypal-cert-url") || "";
    const transmissionId = headersList.get("paypal-transmission-id") || "";
    const transmissionSig = headersList.get("paypal-transmission-sig") || "";
    const transmissionTime = headersList.get("paypal-transmission-time") || "";

    // Get webhook ID from database settings
    let webhookId = "";
    try {
      webhookId = await getPayPalWebhookId();
    } catch {
      // Webhook ID not configured, skip verification
    }

    // Verify webhook signature (optional but recommended)
    if (webhookId && transmissionId) {
      const event = JSON.parse(body);
      const isValid = await verifyWebhookSignature({
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
        webhookId,
        webhookEvent: event,
      });

      if (!isValid) {
        console.error("PayPal webhook signature verification failed");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    const event: PayPalWebhookEvent = JSON.parse(body);

    console.log("PayPal webhook event:", event.event_type);

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentCaptureDenied(event);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        await handlePaymentCaptureRefunded(event);
        break;

      case "CHECKOUT.ORDER.APPROVED":
        console.log("Checkout order approved:", event.resource.id);
        break;

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
