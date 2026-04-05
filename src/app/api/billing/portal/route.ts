import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createCustomerPortalSession } from "@/lib/stripe";

// POST /api/billing/portal — returns Stripe Customer Portal URL
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 404 }
    );
  }

  const portalSession = await createCustomerPortalSession({
    customerId: user.stripeCustomerId,
  });

  return NextResponse.json({ url: portalSession.url });
}
