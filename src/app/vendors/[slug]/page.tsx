"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  Calendar,
  Building2,
  Camera,
  Music,
  Flower2,
  Car,
  Scissors,
  CalendarHeart,
  Gem,
  UtensilsCrossed,
  Video,
  Shirt,
  Sparkles,
  Package,
} from "lucide-react";

type VendorCategory =
  | "VENUE"
  | "PHOTOGRAPHY"
  | "VIDEOGRAPHY"
  | "CATERING"
  | "MUSIC_DJ"
  | "FLOWERS"
  | "DRESS_ATTIRE"
  | "RINGS"
  | "DECORATIONS"
  | "TRANSPORTATION"
  | "HAIR_MAKEUP"
  | "WEDDING_PLANNER"
  | "OTHER";

const CATEGORY_META: Record<VendorCategory, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  VENUE: { label: "Venues", icon: <Building2 className="w-5 h-5" />, color: "text-purple-700", bg: "bg-purple-50" },
  PHOTOGRAPHY: { label: "Photography", icon: <Camera className="w-5 h-5" />, color: "text-pink-700", bg: "bg-pink-50" },
  VIDEOGRAPHY: { label: "Videography", icon: <Video className="w-5 h-5" />, color: "text-red-700", bg: "bg-red-50" },
  CATERING: { label: "Catering", icon: <UtensilsCrossed className="w-5 h-5" />, color: "text-orange-700", bg: "bg-orange-50" },
  MUSIC_DJ: { label: "Music & DJ", icon: <Music className="w-5 h-5" />, color: "text-yellow-700", bg: "bg-yellow-50" },
  FLOWERS: { label: "Flowers", icon: <Flower2 className="w-5 h-5" />, color: "text-green-700", bg: "bg-green-50" },
  DRESS_ATTIRE: { label: "Dress & Attire", icon: <Shirt className="w-5 h-5" />, color: "text-teal-700", bg: "bg-teal-50" },
  RINGS: { label: "Rings & Jewelry", icon: <Gem className="w-5 h-5" />, color: "text-cyan-700", bg: "bg-cyan-50" },
  DECORATIONS: { label: "Decorations", icon: <Sparkles className="w-5 h-5" />, color: "text-indigo-700", bg: "bg-indigo-50" },
  TRANSPORTATION: { label: "Transportation", icon: <Car className="w-5 h-5" />, color: "text-blue-700", bg: "bg-blue-50" },
  HAIR_MAKEUP: { label: "Hair & Makeup", icon: <Scissors className="w-5 h-5" />, color: "text-rose-700", bg: "bg-rose-50" },
  WEDDING_PLANNER: { label: "Wedding Planner", icon: <CalendarHeart className="w-5 h-5" />, color: "text-violet-700", bg: "bg-violet-50" },
  OTHER: { label: "Other", icon: <Package className="w-5 h-5" />, color: "text-gray-700", bg: "bg-gray-100" },
};

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdAt: string;
}

interface Vendor {
  id: string;
  slug: string;
  businessName: string;
  category: VendorCategory;
  description: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  country: string;
  photos: string[];
  videoUrls: string[];
  startingPrice: number | null;
  currency: string;
  yearsInBusiness: number | null;
  languages: string[];
  isFeatured: boolean;
  reviews: Review[];
  avgRating: number | null;
}

interface InquiryForm {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  message: string;
  budget: string;
}

const EVENT_TYPES = [
  "Wedding",
  "Engagement Party",
  "Bridal Shower",
  "Rehearsal Dinner",
  "Anniversary",
  "Other",
];

export default function VendorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [form, setForm] = useState<InquiryForm>({
    name: "",
    email: "",
    phone: "",
    eventType: "Wedding",
    eventDate: "",
    message: "",
    budget: "",
  });
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Auto-fill name/email when logged in
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  // Load couple's projects when logged in
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/planner/projects")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.projects) setProjects(data.projects);
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    fetch(`/api/vendors/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setVendor(data.vendor);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  function updateForm(field: keyof InquiryForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    setSubmitting(true);
    setInquiryError("");
    try {
      // If logged-in couple selected a project, use planner conversations API
      if (selectedProjectId && session?.user?.id) {
        const res = await fetch(`/api/planner/projects/${selectedProjectId}/conversations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId: vendor.id,
            message: form.message || `Hi ${vendor.businessName}, I'm interested in your services for my ${form.eventType}.`,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          setInquiryError(d.error || "Failed to send. Please try again.");
          return;
        }
        setLinkedProjectId(selectedProjectId);
        setInquirySubmitted(true);
        return;
      }

      // Anonymous inquiry path
      const res = await fetch(`/api/vendors/${slug}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eventDate: form.eventDate || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setInquiryError(d.error || "Failed to send. Please try again.");
        return;
      }
      const data = await res.json();
      setConversationId(data.conversationId ?? null);
      setInquirySubmitted(true);
    } catch {
      setInquiryError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (notFound || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😔</div>
        <h1 className="text-2xl font-bold text-gray-800">Vendor not found</h1>
        <Link href="/vendors" className="text-purple-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </Link>
      </div>
    );
  }

  const meta = CATEGORY_META[vendor.category];
  const photos = vendor.photos.length > 0 ? vendor.photos : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link
            href="/vendors"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Vendors
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Photo gallery */}
              {photos.length > 0 ? (
                <div className="relative h-72 sm:h-96 bg-gray-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos[photoIdx]}
                    alt={`${vendor.businessName} photo ${photoIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setPhotoIdx((i) => (i + 1) % photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPhotoIdx(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i === photoIdx ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {/* Thumbnail strip */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 overflow-x-auto bg-gradient-to-t from-black/40">
                      {photos.slice(0, 8).map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setPhotoIdx(i)}
                          className={`shrink-0 w-12 h-10 rounded overflow-hidden border-2 transition-colors ${
                            i === photoIdx ? "border-white" : "border-transparent"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`h-48 ${meta.bg} flex items-center justify-center`}>
                  <span className={`${meta.color}`}>
                    {meta.icon}
                  </span>
                </div>
              )}

              {/* Business info */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${meta.bg} ${meta.color} text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      {vendor.isFeatured && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
                    {vendor.tagline && (
                      <p className="text-gray-600 mt-1">{vendor.tagline}</p>
                    )}
                  </div>
                  {vendor.avgRating !== null && (
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(vendor.avgRating!) ? "fill-yellow-400" : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {vendor.avgRating.toFixed(1)} ({vendor.reviews.length} review{vendor.reviews.length !== 1 ? "s" : ""})
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick info row */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  {(vendor.city || vendor.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {vendor.yearsInBusiness && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {vendor.yearsInBusiness} years in business
                    </span>
                  )}
                  {vendor.startingPrice && (
                    <span className="font-semibold text-purple-700">
                      From {vendor.currency} {vendor.startingPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Contact links */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone}`}
                      className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <Phone className="w-4 h-4" /> {vendor.phone}
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> {vendor.email}
                    </a>
                  )}
                  {vendor.website && (
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-purple-600 transition-colors"
                    >
                      <Globe className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {vendor.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{vendor.description}</p>
              </div>
            )}

            {/* Languages */}
            {vendor.languages.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Languages Spoken</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.languages.map((lang) => (
                    <span key={lang} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {vendor.reviews.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Reviews ({vendor.reviews.length})
                </h2>
                <div className="space-y-4">
                  {vendor.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{review.authorName}</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      )}
                      {review.reply && (
                        <div className="mt-2 pl-3 border-l-2 border-purple-200">
                          <p className="text-xs text-gray-500 mb-0.5">Vendor reply:</p>
                          <p className="text-gray-600 text-sm">{review.reply}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Inquiry form sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {inquirySubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Message Sent!</h3>
                    <p className="text-gray-600 text-sm">
                      {vendor.businessName} will get back to you shortly.
                    </p>
                    {linkedProjectId && (
                      <Link
                        href={`/planner/${linkedProjectId}/vendors`}
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> View in your planner
                      </Link>
                    )}
                    {conversationId && !linkedProjectId && (
                      <Link
                        href={`/conversation/${conversationId}`}
                        className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> View Conversation
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setInquirySubmitted(false);
                        setConversationId(null);
                        setLinkedProjectId(null);
                        setForm({
                          name: session?.user?.name || "", email: session?.user?.email || "",
                          phone: "", eventType: "Wedding", eventDate: "", message: "", budget: "",
                        });
                      }}
                      className="mt-3 block text-purple-600 text-sm hover:underline"
                    >
                      Send another inquiry
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Request Pricing</h2>
                    <p className="text-gray-500 text-sm mb-4">
                      Get a personalized quote from {vendor.businessName}
                    </p>

                    {/* Project link — for logged-in couples */}
                    {projects.length > 0 && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <label className="block text-xs font-medium text-purple-700 mb-1.5">
                          Link to your wedding project (optional)
                        </label>
                        <select
                          value={selectedProjectId}
                          onChange={e => setSelectedProjectId(e.target.value)}
                          className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="">— Send as anonymous inquiry —</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                        {selectedProjectId && (
                          <p className="text-[11px] text-purple-600 mt-1.5">
                            Message will appear in your planner&apos;s Vendor Messages tab
                          </p>
                        )}
                      </div>
                    )}

                    {inquiryError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                        {inquiryError}
                      </div>
                    )}

                    <form onSubmit={submitInquiry} className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => updateForm("name", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateForm("phone", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Event Type *
                        </label>
                        <select
                          required
                          value={form.eventType}
                          onChange={(e) => updateForm("eventType", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          {EVENT_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={form.eventDate}
                          onChange={(e) => updateForm("eventDate", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Budget (optional)
                        </label>
                        <input
                          type="text"
                          value={form.budget}
                          onChange={(e) => updateForm("budget", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                          placeholder="e.g. SEK 5,000–10,000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={form.message}
                          onChange={(e) => updateForm("message", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                          placeholder="Tell them about your event and what you're looking for..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {submitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {submitting ? "Sending..." : "Send Inquiry"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
