"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, ExternalLink, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface SubscriptionInfo {
  tier: "basic" | "premium" | "elite";
  status: string;
  periodEnd: string | null;
  hasSubscription: boolean;
}

type PlanId = "basic" | "premium" | "elite";

const BASIC_FEATURES = [
  "Guest list",
  "RSVPs",
  "Wedding website",
  "Checklist",
  "Budget",
  "Event Itinerary",
  "Vendors & Venues",
  "Notes",
  "Post-Wedding (30 photos)",
  "Custom vendors",
];

const PREMIUM_FEATURES = [
  { text: "Unlimited export", bold: "Unlimited export", rest: " to PDF & Excel" },
  { text: "All seating chart & supplies features in high resolution", bold: "All seating chart & supplies", rest: " features in high resolution" },
  { text: "Advanced wedding website features", bold: "Advanced wedding website features", rest: "" },
  { text: "Memories! Extra storage space in the Post-Wedding section allows your guests to upload up to 1000 photos of your beautiful day", bold: "storage space", rest: "" },
];

const ELITE_FEATURES = [
  "Everything in Premium",
  "Printable stationery: place cards, menus, table cards",
  "QR entrance mode (staff check-in)",
  "Unlimited collaborator access",
  "SMS credit bundles",
  "Priority support",
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "premium" | "elite";
}

export function UpgradeModal({ open, onClose, defaultTab }: UpgradeModalProps) {
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [managingPortal, setManagingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"premium" | "elite">(defaultTab ?? "premium");

  useEffect(() => {
    if (open && defaultTab) setSelectedTab(defaultTab);
  }, [open, defaultTab]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/billing/subscription")
      .then((r) => r.json())
      .then((d) => setSub(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  async function handleUpgrade(tier: PlanId) {
    if (tier === "basic") return;
    setUpgrading(tier);
    setError(null);
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
      setError(e instanceof Error ? e.message : "Something went wrong");
      setUpgrading(null);
    }
  }

  async function handleManagePortal() {
    setManagingPortal(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setManagingPortal(false);
    }
  }

  const currentTier = sub?.tier ?? "basic";
  const isPremium = currentTier === "premium";
  const isElite = currentTier === "elite";
  const hasPaid = isPremium || isElite;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl gap-0 [&>button]:hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row min-h-[480px]">
          {/* Left — Basic */}
          <div className="flex flex-col items-center px-8 py-10 bg-gray-50 border-r border-gray-100 sm:w-[45%]">
            {/* Drop icon */}
            <div className="mb-4">
              <svg width="56" height="72" viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 0C28 0 4 26 4 44C4 57.25 14.75 68 28 68C41.25 68 52 57.25 52 44C52 26 28 0 28 0Z" fill="#E5E7EB" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic</h2>
            <ul className="space-y-2.5 w-full mb-auto">
              {BASIC_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 text-2xl font-bold text-gray-500 tracking-wide">FREE</div>
          </div>

          {/* Right — Premium / Elite */}
          <div className="flex flex-col px-8 py-10 bg-white sm:w-[55%]">
            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedTab("premium")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedTab === "premium"
                    ? "bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Premium
              </button>
              <button
                onClick={() => setSelectedTab("elite")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedTab === "elite"
                    ? "bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Elite
              </button>
            </div>

            {/* Star icon */}
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={selectedTab === "premium" ? "#f43f5e" : "#8b5cf6"} />
                      <stop offset="100%" stopColor={selectedTab === "premium" ? "#a855f7" : "#ec4899"} />
                    </linearGradient>
                  </defs>
                  <path d="M36 6L43.5 27H66L48 40.5L55.5 61.5L36 48L16.5 61.5L24 40.5L6 27H28.5L36 6Z" fill="url(#starGrad)" />
                </svg>
                {/* Sparkles */}
                <span className="absolute -top-1 -left-2 text-purple-400 text-lg">✦</span>
                <span className="absolute -top-2 right-0 text-rose-300 text-sm">✦</span>
                <span className="absolute bottom-0 -right-2 text-purple-300 text-xs">✦</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">
              {selectedTab === "premium" ? "Premium" : "Elite"}
            </h2>
            <p className="text-center text-sm font-semibold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent mb-5">
              {selectedTab === "premium"
                ? "Make wedding planning even easier"
                : "The complete wedding experience"}
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-auto">
              {selectedTab === "premium"
                ? PREMIUM_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        <strong>{f.bold}</strong>{f.rest}
                      </span>
                    </li>
                  ))
                : ELITE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
            </ul>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Price & CTA */}
            <div className="mt-6">
              {hasPaid && currentTier === selectedTab ? (
                <div className="text-center">
                  <div className="mb-3 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                    Your current plan
                  </div>
                  {sub?.hasSubscription && (
                    <button
                      onClick={handleManagePortal}
                      disabled={managingPortal}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      {managingPortal ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Opening…</>
                      ) : (
                        <><ExternalLink className="w-4 h-4" /> Manage billing</>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-center gap-1 mb-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {selectedTab === "premium" ? "299" : "499"}
                    </span>
                    <span className="text-sm text-gray-500">SEK / month</span>
                  </div>
                  <p className="text-center text-xs text-gray-400 mb-4">Prices include VAT · Cancel anytime</p>
                  <button
                    onClick={() => handleUpgrade(selectedTab)}
                    disabled={!!upgrading || loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                  >
                    {upgrading === selectedTab ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                    ) : (
                      `Unlock ${selectedTab === "premium" ? "Premium" : "Elite"} — ${selectedTab === "premium" ? "299" : "499"} SEK/mo`
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
