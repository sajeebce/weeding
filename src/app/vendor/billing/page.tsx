"use client";

import { useState, useEffect } from "react";
import { Crown, Zap, XCircle, Check, Clock, Loader2, ExternalLink } from "lucide-react";
import type { VendorPlanStatus } from "@/lib/vendor-plan";

const BUSINESS_FEATURES = [
  "Listed in public vendor directory",
  "Receive unlimited inquiries from couples",
  "Full business profile page with custom URL",
  "Portfolio photos & video showcase",
  "Reviews & ratings system",
  "Google-indexed dofollow backlink",
  "Smart search placement (category + geo)",
  "Analytics: profile views & inquiry stats",
  "Availability calendar on profile",
  "Notified when added to wedding projects",
];

export default function VendorBillingPage() {
  const [plan, setPlan] = useState<VendorPlanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vendor/plan")
      .then((r) => r.json())
      .then((d) => setPlan(d.plan ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/vendor/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setUpgrading(false);
    }
  }

  async function handleManagePortal() {
    setManagingPortal(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open portal");
      window.location.href = data.url;
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setManagingPortal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const isActive = plan?.isActive;
  const tier = plan?.tier ?? "TRIAL";
  const daysLeft = plan?.daysLeft;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan & Billing</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your vendor listing plan</p>
      </div>

      {/* Current plan status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Plan</h2>
        {tier === "BUSINESS" && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Business Plan</p>
              <p className="text-sm text-gray-500">$19 / month · Full directory listing active</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        )}
        {tier === "TRIAL" && isActive && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Free Trial</p>
              <p className="text-sm text-gray-500">
                {daysLeft != null ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining` : "Trial active"} · All Business features unlocked
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> Trial
            </span>
          </div>
        )}
        {(tier === "EXPIRED" || (tier === "TRIAL" && !isActive)) && (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Plan Expired</p>
              <p className="text-sm text-gray-500">Your listing is hidden from the directory</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5" /> Expired
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Upgrade card — shown for non-Business tiers */}
      {tier !== "BUSINESS" && (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Business Plan</span>
              </div>
              <p className="text-3xl font-bold">$19<span className="text-lg font-normal text-purple-200">/month</span></p>
              <p className="text-sm text-purple-200 mt-1">30-day free trial included · Cancel anytime</p>
            </div>
          </div>

          <ul className="space-y-2.5 mb-6">
            {BUSINESS_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-purple-100">
                <Check className="w-4 h-4 text-green-300 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full py-3 bg-white text-purple-700 font-semibold rounded-xl text-sm hover:bg-purple-50 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to checkout…</>
            ) : (
              <>Upgrade to Business — $19/mo <ExternalLink className="w-4 h-4" /></>
            )}
          </button>
          <p className="text-xs text-center text-purple-300 mt-2">
            Secure payment via Stripe · Cancel anytime from billing portal
          </p>
        </div>
      )}

      {/* Active business plan — manage section */}
      {tier === "BUSINESS" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Manage Subscription</h2>
          <p className="text-sm text-gray-600 mb-4">
            Update payment method, view invoices, or cancel your subscription through the Stripe billing portal.
          </p>
          <button
            onClick={handleManagePortal}
            disabled={managingPortal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {managingPortal ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Opening portal…</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> Manage billing</>
            )}
          </button>
        </div>
      )}

      {/* Feature list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">What&apos;s included in Business</h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {BUSINESS_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 px-6 py-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-gray-700">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
