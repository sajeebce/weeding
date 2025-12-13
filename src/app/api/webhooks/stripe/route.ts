import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import prisma from "@/lib/db";
import Stripe from "stripe";

// Disable body parsing, we need raw body for webhook verification
export const runtime = "nodejs";

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const metadata = session.metadata;

  if (!metadata?.orderId) {
    console.log("Checkout session without orderId metadata, skipping");
    return;
  }

  const orderId = metadata.orderId;

  try {
    // Update order payment status
    const order = await prisma.order.update({
      where: { orderNumber: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "stripe",
        paymentId: session.payment_intent as string,
        paidAt: new Date(),
        status: "PROCESSING",
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
          gateway: "stripe",
          sessionId: session.id,
          paymentIntentId: typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
        },
      },
    });

    console.log(`Order ${orderId} payment completed via Stripe`);
  } catch (error) {
    console.error(`Failed to update order ${orderId}:`, error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  console.log("Payment succeeded:", paymentIntent.id);

  // Find order by payment ID and update if exists
  try {
    const order = await prisma.order.findFirst({
      where: { paymentId: paymentIntent.id },
    });

    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
        },
      });
      console.log(`Order ${order.orderNumber} marked as paid`);
    }
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  // Find order by payment ID and update if exists
  try {
    const order = await prisma.order.findFirst({
      where: { paymentId: paymentIntent.id },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
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
            gateway: "stripe",
            paymentIntentId: paymentIntent.id,
            failureCode: paymentIntent.last_payment_error?.code,
            failureMessage: paymentIntent.last_payment_error?.message,
          },
        },
      });

      console.log(`Order ${order.orderNumber} payment failed`);
    }
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = await constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        console.log("Subscription event:", event.type);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        console.log("Invoice event:", event.type);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
