import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { constructWebhookEvent } from "@/lib/stripe";
import prisma from "@/lib/db";
import Stripe from "stripe";

export const runtime = "nodejs";

// ─── One-time payment handlers (existing LLCPad orders) ──────────────────────

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;

  // Route by plan type
  if (metadata?.plannerTier) {
    await handlePlannerSubscriptionActivated(session);
    return;
  }
  if (metadata?.planType === "vendor_business") {
    await handleVendorSubscriptionActivated(session);
    return;
  }

  // Existing order payment flow
  if (!metadata?.orderId) {
    console.log("Checkout session without orderId metadata, skipping");
    return;
  }

  const orderId = metadata.orderId;

  try {
    const existingOrder = await prisma.order.findUnique({ where: { orderNumber: orderId } });
    if (existingOrder?.paymentStatus === "PAID") return;

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

    await prisma.invoice.updateMany({
      where: { orderId: order.id, status: { not: "PAID" } },
      data: { status: "PAID", paidAt: new Date() },
    });

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

// ─── Planner subscription handlers ───────────────────────────────────────────

async function handlePlannerSubscriptionActivated(session: Stripe.Checkout.Session) {
  const { userId, plannerTier } = session.metadata ?? {};
  if (!userId || !plannerTier) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plannerTier,
      plannerStatus: "active",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
  });
  console.log(`Planner plan activated: user=${userId} tier=${plannerTier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const meta = subscription.metadata;

  if (meta?.planType === "vendor_business") {
    await handleVendorSubscriptionUpdated(subscription);
    return;
  }

  // Couple planner subscription
  const userId = meta?.userId;
  if (!userId) return;

  const tier = meta?.plannerTier ?? "basic";
  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : subscription.status === "past_due"
      ? "past_due"
      : "canceled";

  const periodEnd = subscription.items.data[0]?.["current_period_end"]
    ? new Date((subscription.items.data[0] as unknown as { current_period_end: number }).current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plannerTier: status === "canceled" ? "basic" : tier,
      plannerStatus: status,
      plannerPeriodEnd: periodEnd,
      stripeSubscriptionId: subscription.id,
    },
  });
  console.log(`Planner subscription updated: user=${userId} status=${status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const meta = subscription.metadata;

  if (meta?.planType === "vendor_business") {
    await handleVendorSubscriptionDeleted(subscription);
    return;
  }

  const userId = meta?.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      plannerTier: "basic",
      plannerStatus: "canceled",
      stripeSubscriptionId: null,
    },
  });
  console.log(`Planner subscription canceled: user=${userId}`);
}

// ─── Vendor subscription handlers ────────────────────────────────────────────

async function handleVendorSubscriptionActivated(session: Stripe.Checkout.Session) {
  const { vendorProfileId } = session.metadata ?? {};
  if (!vendorProfileId) return;

  await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: {
      planTier: "BUSINESS",
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
    },
  });
  console.log(`Vendor Business plan activated: vendor=${vendorProfileId}`);
}

async function handleVendorSubscriptionUpdated(subscription: Stripe.Subscription) {
  const vendorProfileId = subscription.metadata?.vendorProfileId;
  if (!vendorProfileId) return;

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: {
      planTier: isActive ? "BUSINESS" : "EXPIRED",
      stripeSubscriptionId: subscription.id,
    },
  });
  console.log(`Vendor subscription updated: vendor=${vendorProfileId} active=${isActive}`);
}

async function handleVendorSubscriptionDeleted(subscription: Stripe.Subscription) {
  const vendorProfileId = subscription.metadata?.vendorProfileId;
  if (!vendorProfileId) return;

  await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: {
      planTier: "EXPIRED",
      stripeSubscriptionId: null,
    },
  });
  console.log(`Vendor subscription canceled: vendor=${vendorProfileId}`);
}

// ─── Existing payment handlers ────────────────────────────────────────────────

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const order = await prisma.order.findFirst({ where: { paymentId: paymentIntent.id } });
    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", paidAt: new Date() },
      });
      console.log(`Order ${order.orderNumber} marked as paid`);
    }
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const order = await prisma.order.findFirst({ where: { paymentId: paymentIntent.id } });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
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
    }
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
  }
}

// ─── Main webhook handler ─────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = await constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        console.log("Invoice paid:", (event.data.object as Stripe.Invoice).id);
        break;

      case "invoice.payment_failed":
        console.log("Invoice payment failed:", (event.data.object as Stripe.Invoice).id);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
