import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/billing/subscription — returns current couple plan tier + status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plannerTier: true,
      plannerStatus: true,
      plannerPeriodEnd: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    tier: user.plannerTier ?? "basic",
    status: user.plannerStatus ?? "active",
    periodEnd: user.plannerPeriodEnd,
    hasSubscription: !!user.stripeSubscriptionId,
  });
}
