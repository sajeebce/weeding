import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { getVendorPlanStatus, VendorPlanTier } from "@/lib/vendor-plan";

// GET /api/vendor/plan — returns current vendor's plan status
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      planTier: true,
      trialEndsAt: true,
      isApproved: true,
      status: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const planStatus = getVendorPlanStatus({
    planTier: profile.planTier as VendorPlanTier,
    trialEndsAt: profile.trialEndsAt,
    isApproved: profile.isApproved,
    status: profile.status,
  });

  return NextResponse.json({ plan: planStatus });
}
