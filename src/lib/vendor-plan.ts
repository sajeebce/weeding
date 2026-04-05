// src/lib/vendor-plan.ts
// Phase 5C: Plan-based feature gating for vendor marketplace

export type VendorPlanTier = "TRIAL" | "BUSINESS" | "EXPIRED";

export interface VendorPlanStatus {
  tier: VendorPlanTier;
  /** TRIAL (not yet expired) or BUSINESS → vendor has full feature access */
  isActive: boolean;
  /** Shown in public directory & can receive inquiries */
  isListed: boolean;
  /** Days remaining in trial; null for BUSINESS; 0 for EXPIRED */
  daysLeft: number | null;
  /** Trial expiry date; null for BUSINESS/EXPIRED */
  expiresAt: Date | null;
}

/**
 * Compute plan status for a vendor.
 * Call from API routes and UI components.
 */
export function getVendorPlanStatus(vendor: {
  planTier: VendorPlanTier;
  trialEndsAt: Date | null;
  isApproved: boolean;
  status: string;
}): VendorPlanStatus {
  const now = new Date();

  // Not yet approved by admin → no plan benefits regardless of tier
  if (!vendor.isApproved || vendor.status !== "APPROVED") {
    return {
      tier: vendor.planTier,
      isActive: false,
      isListed: false,
      daysLeft: null,
      expiresAt: null,
    };
  }

  if (vendor.planTier === "BUSINESS") {
    return {
      tier: "BUSINESS",
      isActive: true,
      isListed: true,
      daysLeft: null,
      expiresAt: null,
    };
  }

  if (vendor.planTier === "TRIAL") {
    const trialActive = vendor.trialEndsAt != null && now < vendor.trialEndsAt;
    const daysLeft = vendor.trialEndsAt
      ? Math.max(0, Math.ceil((vendor.trialEndsAt.getTime() - now.getTime()) / 86_400_000))
      : 0;
    return {
      tier: "TRIAL",
      isActive: trialActive,
      isListed: trialActive,
      daysLeft,
      expiresAt: vendor.trialEndsAt,
    };
  }

  // EXPIRED
  return {
    tier: "EXPIRED",
    isActive: false,
    isListed: false,
    daysLeft: 0,
    expiresAt: null,
  };
}

/**
 * Prisma `where` clause to include only vendors with an active plan
 * in the public directory.
 */
export function activePlanWhereClause() {
  const now = new Date();
  return {
    OR: [
      { planTier: "BUSINESS" as VendorPlanTier },
      {
        planTier: "TRIAL" as VendorPlanTier,
        trialEndsAt: { gt: now },
      },
    ],
  };
}
