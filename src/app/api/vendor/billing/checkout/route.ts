import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  createSubscriptionCheckout,
  getOrCreateStripeCustomer,
  VENDOR_PLAN,
} from "@/lib/stripe";

// POST /api/vendor/billing/checkout — create Stripe subscription checkout for vendor Business plan
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!VENDOR_PLAN.priceId) {
    return NextResponse.json(
      { error: "Stripe vendor price not configured. Set STRIPE_PRICE_VENDOR env var." },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      stripeCustomerId: true,
      vendorProfile: { select: { id: true, stripeCustomerId: true, stripeSubscriptionId: true } },
    },
  });
  if (!user?.vendorProfile) {
    return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
  }

  // Use vendor's own stripeCustomerId or fall back to user-level one
  const existingCustomerId = user.vendorProfile.stripeCustomerId ?? user.stripeCustomerId;

  const customerId = await getOrCreateStripeCustomer({
    email: user.email,
    name: user.name ?? undefined,
    existingCustomerId,
  });

  // Persist customerId on vendor profile if new
  if (!user.vendorProfile.stripeCustomerId) {
    await prisma.vendorProfile.update({
      where: { id: user.vendorProfile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const checkoutSession = await createSubscriptionCheckout({
    priceId: VENDOR_PLAN.priceId,
    customerId,
    metadata: {
      vendorProfileId: user.vendorProfile.id,
      userId: session.user.id,
      planType: "vendor_business",
    },
    successUrl: `${appUrl}/vendor/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${appUrl}/vendor/billing?cancelled=1`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
