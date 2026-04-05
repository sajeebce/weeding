"use client";

import { useState, useEffect, use } from "react";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Heart,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const VENDOR_CATEGORY_LABELS: Record<string, string> = {
  VENUE: "Venue",
  PHOTOGRAPHY: "Photography",
  VIDEOGRAPHY: "Videography",
  CATERING: "Catering",
  MUSIC_DJ: "Music / DJ",
  FLOWERS: "Flowers",
  DRESS_ATTIRE: "Dress & Attire",
  RINGS: "Rings",
  DECORATIONS: "Decorations",
  TRANSPORTATION: "Transportation",
  HAIR_MAKEUP: "Hair & Makeup",
  WEDDING_PLANNER: "Wedding Planner",
  OTHER: "Other",
};

const ALL_CATEGORIES = Object.keys(VENDOR_CATEGORY_LABELS);

interface BriefData {
  title: string;
  brideName: string | null;
  groomName: string | null;
  eventDate: string | null;
  eventType: string;
  budgetGoal: number;
  totalPlanned: number;
  guestCount: number;
  ceremony: {
    venueName: string | null;
    city: string | null;
    country: string | null;
    date: string | null;
    time: string | null;
    capacity: number | null;
  } | null;
  reception: {
    venueName: string | null;
    city: string | null;
    country: string | null;
    date: string | null;
    time: string | null;
    capacity: number | null;
  } | null;
  confirmedVendorCategories: string[];
  generatedAt: string;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amount: number) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function EventBriefPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/brief/${token}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data?.brief) setBrief(data.brief); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (notFound || !brief) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-semibold text-gray-800">Brief not found</h1>
          <p className="text-sm text-gray-500 mt-1">
            This link may have been revoked or is invalid.
          </p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 mt-4 text-sm text-purple-600 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Browse vendors
          </Link>
        </div>
      </div>
    );
  }

  const coupleName =
    brief.brideName && brief.groomName
      ? `${brief.brideName} & ${brief.groomName}`
      : brief.brideName || brief.groomName || brief.title;

  const budgetDisplay = brief.budgetGoal
    ? formatCurrency(brief.budgetGoal)
    : brief.totalPlanned
    ? formatCurrency(brief.totalPlanned)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-500 fill-purple-500" />
            <span className="text-sm font-semibold text-purple-700">Ceremoney</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Save / Print
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Title card */}
        <div className="bg-white rounded-2xl border border-purple-100 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-purple-600 fill-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{coupleName}</h1>
          <p className="text-sm text-purple-500 mt-1 font-medium">
            {brief.eventType.charAt(0) + brief.eventType.slice(1).toLowerCase()} Event Brief
          </p>
          {brief.eventDate && (
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(brief.eventDate)}
            </p>
          )}
        </div>

        {/* Key details row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DetailCard
            icon={<Users className="w-4 h-4 text-blue-500" />}
            label="Guest Count"
            value={brief.guestCount ? `~${brief.guestCount} guests` : "Not set"}
            color="blue"
          />
          {budgetDisplay && (
            <DetailCard
              icon={<DollarSign className="w-4 h-4 text-green-500" />}
              label="Total Budget"
              value={budgetDisplay}
              color="green"
            />
          )}
          <DetailCard
            icon={<Calendar className="w-4 h-4 text-purple-500" />}
            label="Event Date"
            value={
              brief.eventDate
                ? new Date(brief.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "TBD"
            }
            color="purple"
          />
        </div>

        {/* Venues */}
        {(brief.ceremony?.venueName || brief.reception?.venueName) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Venues
            </h2>
            <div className="space-y-4">
              {brief.ceremony?.venueName && (
                <VenueRow
                  label="Ceremony"
                  venue={brief.ceremony}
                  color="purple"
                />
              )}
              {brief.reception?.venueName && (
                <VenueRow
                  label="Reception"
                  venue={brief.reception}
                  color="pink"
                />
              )}
            </div>
          </div>
        )}

        {/* Vendor checklist */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Vendor Checklist
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALL_CATEGORIES.map((cat) => {
              const confirmed = brief.confirmedVendorCategories.includes(cat);
              return (
                <div
                  key={cat}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    confirmed
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {confirmed ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                  )}
                  {VENDOR_CATEGORY_LABELS[cat]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Shared via Ceremoney &middot; Generated{" "}
          {new Date(brief.generatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "purple";
}) {
  const bg = { blue: "bg-blue-50", green: "bg-green-50", purple: "bg-purple-50" }[color];
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col gap-1`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function VenueRow({
  label,
  venue,
  color,
}: {
  label: string;
  venue: {
    venueName: string | null;
    city: string | null;
    country: string | null;
    date: string | null;
    time: string | null;
    capacity: number | null;
  };
  color: "purple" | "pink";
}) {
  const badge =
    color === "purple"
      ? "bg-purple-100 text-purple-700"
      : "bg-pink-100 text-pink-700";

  return (
    <div className="flex items-start gap-3">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge} shrink-0 mt-0.5`}>
        {label}
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">{venue.venueName}</p>
        {(venue.city || venue.country) && (
          <p className="text-xs text-gray-500">
            {[venue.city, venue.country].filter(Boolean).join(", ")}
          </p>
        )}
        {(venue.date || venue.time) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {venue.date ? formatDate(venue.date) : ""}{venue.time ? ` at ${venue.time}` : ""}
          </p>
        )}
        {venue.capacity && (
          <p className="text-xs text-gray-400">Capacity: {venue.capacity}</p>
        )}
      </div>
    </div>
  );
}
