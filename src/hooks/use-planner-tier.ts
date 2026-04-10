import { useState, useEffect } from "react";

export type PlannerTier = "basic" | "premium" | "elite";

interface TierState {
  tier: PlannerTier;
  loading: boolean;
}

// Module-level cache so the fetch fires only once per page load
let cached: PlannerTier | null = null;
let inflight: Promise<PlannerTier> | null = null;

async function fetchTier(): Promise<PlannerTier> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = fetch("/api/billing/subscription")
    .then((res) => {
      if (!res.ok) return "basic" as PlannerTier;
      return res.json();
    })
    .then((data) => {
      const tier = (data?.tier ?? "basic") as PlannerTier;
      cached = tier;
      inflight = null;
      return tier;
    })
    .catch(() => {
      inflight = null;
      return "basic" as PlannerTier;
    });

  return inflight;
}

/**
 * Returns the current user's planner tier.
 * - Anonymous projects (local- prefix) → always "basic"
 * - Unauthenticated / API error → always "basic"
 */
export function usePlannerTier(projectId?: string): TierState {
  const isLocal = projectId?.startsWith("local-");

  const [state, setState] = useState<TierState>({
    tier: "basic",
    loading: !isLocal,
  });

  useEffect(() => {
    if (isLocal) return;

    fetchTier().then((tier) => {
      setState({ tier, loading: false });
    });
  }, [isLocal]);

  if (isLocal) return { tier: "basic", loading: false };

  return state;
}

export function isPremiumOrElite(tier: PlannerTier): boolean {
  return tier === "premium" || tier === "elite";
}

export function isElite(tier: PlannerTier): boolean {
  return tier === "elite";
}
