"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Zap,
  Crown,
  XCircle,
} from "lucide-react";
import type { VendorPlanStatus } from "@/lib/vendor-plan";

interface Stats {
  inquiryCount: number;
  newInquiryCount: number;
  reviewCount: number;
  avgRating: number | null;
  profileViews: number;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  eventType: string;
  eventDate: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<string>("PENDING");
  const [plan, setPlan] = useState<VendorPlanStatus | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, inquiriesRes, profileRes, planRes] = await Promise.all([
          fetch("/api/vendor/stats"),
          fetch("/api/vendor/inquiries?page=1&limit=5"),
          fetch("/api/vendor/profile"),
          fetch("/api/vendor/plan"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats ?? data);
        }
        if (inquiriesRes.ok) {
          const data = await inquiriesRes.json();
          setRecentInquiries(data.inquiries || []);
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfileStatus(data.profile?.status || "PENDING");
        }
        if (planRes.ok) {
          const data = await planRes.json();
          setPlan(data.plan ?? null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const statusBadge = {
    APPROVED: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Approved" },
    PENDING: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending Review" },
    REJECTED: { color: "bg-red-100 text-red-700", icon: AlertCircle, label: "Rejected" },
    SUSPENDED: { color: "bg-gray-100 text-gray-600", icon: AlertCircle, label: "Suspended" },
  }[profileStatus] ?? { color: "bg-gray-100 text-gray-600", icon: Clock, label: profileStatus };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back to your vendor portal</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusBadge.label}
        </span>
      </div>

      {/* Pending notice */}
      {profileStatus === "PENDING" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <Clock className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Profile under review</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Your profile is being reviewed by our team. You'll be notified once approved and your
              listing goes live.{" "}
              <Link href="/vendor/profile" className="underline font-medium">
                Complete your profile
              </Link>{" "}
              in the meantime.
            </p>
          </div>
        </div>
      )}

      {/* Plan status card */}
      {plan && <PlanCard plan={plan} />}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inquiries"
          value={stats?.inquiryCount ?? 0}
          icon={MessageSquare}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          label="New Inquiries"
          value={stats?.newInquiryCount ?? 0}
          icon={TrendingUp}
          color="text-purple-600"
          bg="bg-purple-50"
          highlight={!!stats?.newInquiryCount}
        />
        <StatCard
          label="Reviews"
          value={stats?.reviewCount ?? 0}
          icon={Star}
          color="text-yellow-600"
          bg="bg-yellow-50"
        />
        <StatCard
          label="Avg Rating"
          value={stats?.avgRating ? stats.avgRating.toFixed(1) : "—"}
          icon={Star}
          color="text-orange-600"
          bg="bg-orange-50"
        />
      </div>

      {/* Recent inquiries */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Inquiries</h2>
          <Link
            href="/vendor/inquiries"
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No inquiries yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Once customers contact you, inquiries will appear here
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentInquiries.map((inq) => (
              <li key={inq.id} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">
                    {inq.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{inq.name}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        inq.status === "NEW"
                          ? "bg-blue-100 text-blue-700"
                          : inq.status === "VIEWED"
                          ? "bg-gray-100 text-gray-600"
                          : inq.status === "RESPONDED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{inq.message}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{inq.eventType}</span>
                    {inq.eventDate && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(inq.eventDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/vendor/profile"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-sm transition-all group"
        >
          <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
            Update Your Profile
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Add photos, pricing, and service details to attract more clients
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-purple-600 mt-3 font-medium">
            Edit profile <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/vendor/inquiries"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-sm transition-all group"
        >
          <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
            Manage Inquiries
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Respond to potential clients and update inquiry statuses
          </p>
          <span className="inline-flex items-center gap-1 text-sm text-purple-600 mt-3 font-medium">
            View inquiries <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: VendorPlanStatus }) {
  if (plan.tier === "BUSINESS") {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Business Plan</p>
            <p className="text-xs text-purple-200">Full directory listing · Inquiries active</p>
          </div>
        </div>
        <Link href="/vendor/billing" className="text-xs text-white/80 hover:text-white underline underline-offset-2">
          Manage plan
        </Link>
      </div>
    );
  }

  if (plan.tier === "TRIAL" && plan.isActive) {
    const urgent = (plan.daysLeft ?? 0) <= 5;
    return (
      <div className={`rounded-xl p-4 flex items-center justify-between border ${urgent ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${urgent ? "bg-orange-100" : "bg-blue-100"}`}>
            <Zap className={`w-5 h-5 ${urgent ? "text-orange-600" : "text-blue-600"}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${urgent ? "text-orange-800" : "text-blue-800"}`}>
              Free Trial — {plan.daysLeft} day{plan.daysLeft !== 1 ? "s" : ""} left
            </p>
            <p className={`text-xs ${urgent ? "text-orange-600" : "text-blue-600"}`}>
              {urgent ? "Trial ending soon! Upgrade to keep your listing live." : "Your listing is live in the directory."}
            </p>
          </div>
        </div>
        <Link href="/vendor/billing" className={`text-xs font-medium underline underline-offset-2 ${urgent ? "text-orange-700 hover:text-orange-900" : "text-blue-700 hover:text-blue-900"}`}>
          Upgrade →
        </Link>
      </div>
    );
  }

  // EXPIRED or TRIAL expired
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-800">Plan Expired</p>
          <p className="text-xs text-red-600">
            Your listing is hidden from the directory. Upgrade to go live again.
          </p>
        </div>
      </div>
      <Link href="/vendor/billing" className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
        Upgrade now
      </Link>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 ${highlight ? "border-purple-200" : "border-gray-200"}`}>
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
