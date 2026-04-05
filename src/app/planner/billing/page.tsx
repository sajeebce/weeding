"use client";

import { useState, useEffect } from "react";
import { Check, Crown, Zap, Star, Loader2, ExternalLink, CreditCard } from "lucide-react";

interface SubscriptionInfo {
  tier: "basic" | "premium" | "elite";
  status: string;
  periodEnd: string | null;
  hasSubscription: boolean;
}

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: "Free",
    priceNote: "Forever free",
    icon: <Zap className="w-5 h-5 text-gray-500" />,
    color: "border-gray-200",
    headerColor: "bg-gray-50",
    features: [
      "Event website (free subdomain)",
      "Basic RSVP form",
      "Basic checklist",
      "Vendor & venue directory",
      "Multi-language support",
    ],
    missing: [
      "Guest list manager",
      "Seating chart editor",
      "Custom domain",
      "Export PDF/XLS",
      "Advanced website templates",
      "Email invitations",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "299 SEK",
    priceNote: "per month",
    icon: <Crown className="w-5 h-5 text-rose-500" />,
    color: "border-rose-300",
    headerColor: "bg-rose-50",
    badge: "Most Popular",
    features: [
      "Everything in Basic",
      "Guest list manager (unlimited)",
      "Seating chart editor",
      "Custom domain for your site",
      "Export PDF & XLS for all modules",
      "Advanced website templates & themes",
      "Email invitations with tracking",
      "Ad-free experience",
    ],
    missing: [
      "Printable stationery assets",
      "QR entrance mode",
      "Collaborator access (unlimited)",
      "SMS credits",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: "499 SEK",
    priceNote: "per month",
    icon: <Star className="w-5 h-5 text-purple-500" />,
    color: "border-purple-300",
    headerColor: "bg-purple-50",
    features: [
      "Everything in Premium",
      "Printable stationery: place cards, menus, table cards",
      "QR entrance mode (staff check-in)",
      "Unlimited collaborator access",
      "SMS credit bundles",
      "Priority support",
    ],
    missing: [],
  },
] as const;

type PlanId = "basic" | "premium" | "elite";

export default function PlannerBillingPage() {
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [managinPortal, setManagingPortal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(tier: PlanId) {
    if (tier === "basic") return;
    setUpgrading(tier);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setUpgrading(null);
    }
  }

  async function handleManagePortal() {
    setManagingPortal(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setManagingPortal(false);
    }
  }

  const currentTier = sub?.tier ?? "basic";
  const periodEnd = sub?.periodEnd
    ? new Date(sub.periodEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plans & Billing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose the plan that fits your wedding planning needs
        </p>
      </div>

      {/* Current plan banner */}
      {!loading && sub && (
        <div className="flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800 capitalize">
                {currentTier} Plan
                {sub.status === "past_due" && (
                  <span className="ml-2 text-xs font-normal text-red-600">· Payment past due</span>
                )}
              </p>
              {periodEnd && (
                <p className="text-xs text-gray-500">Renews {periodEnd}</p>
              )}
            </div>
          </div>
          {sub.hasSubscription && (
            <button
              onClick={handleManagePortal}
              disabled={managinPortal}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-60"
            >
              {managinPortal ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
              ) : (
                <><ExternalLink className="w-4 h-4" /> Manage billing</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.id;
          const isHigher = ["premium", "elite"].indexOf(plan.id) > ["premium", "elite"].indexOf(currentTier);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 bg-white flex flex-col ${
                isCurrent ? "border-rose-400 shadow-md" : plan.color
              }`}
            >
              {/* Badge */}
              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`rounded-t-2xl px-5 py-5 ${plan.headerColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  {plan.icon}
                  <h2 className="font-bold text-gray-900">{plan.name}</h2>
                  {isCurrent && (
                    <span className="ml-auto text-xs font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {plan.price}
                  {plan.id !== "basic" && (
                    <span className="text-sm font-normal text-gray-500 ml-1">{plan.priceNote}</span>
                  )}
                </p>
                {plan.id === "basic" && (
                  <p className="text-sm text-gray-500">{plan.priceNote}</p>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 px-5 py-5">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
                      <span className="w-4 h-4 mt-0.5 shrink-0 text-center text-gray-300">–</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5">
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl bg-rose-100 text-rose-700 text-sm font-semibold text-center">
                    Your current plan
                  </div>
                ) : plan.id === "basic" ? (
                  <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold text-center">
                    Free forever
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id as PlanId)}
                    disabled={!!upgrading || loading}
                    className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {upgrading === plan.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                    ) : isHigher ? (
                      <>Upgrade to {plan.name}</>
                    ) : (
                      <>Switch to {plan.name}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400">
        Prices include VAT · Secure payment via Stripe · Cancel anytime
      </p>
    </div>
  );
}
