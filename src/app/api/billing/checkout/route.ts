import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  createSubscriptionCheckout,
  getOrCreateStripeCustomer,
  PLANNER_PLANS,
  type PlannerTier,
} from "@/lib/stripe";

// POST /api/billing/checkout
// Body: { tier: "premium" | "elite" }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const tier = (body.tier as PlannerTier) ?? "premium";

  if (!["premium", "elite"].includes(tier)) {
    return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
  }

  const plan = PLANNER_PLANS[tier];
  if (!plan.priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured. Set STRIPE_PRICE_PREMIUM / STRIPE_PRICE_ELITE env vars." },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, stripeCustomerId: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Get or create Stripe customer and persist the ID
  const customerId = await getOrCreateStripeCustomer({
    email: user.email,
    name: user.name ?? undefined,
    existingCustomerId: user.stripeCustomerId,
  });

  if (!user.stripeCustomerId) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await createSubscriptionCheckout({
    priceId: plan.priceId,
    customerId,
    metadata: {
      userId: session.user.id,
      plannerTier: tier,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
