"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Camera, Heart, Users, Download,
  ChevronRight, Image as ImageIcon, MessageSquare,
  ExternalLink,
} from "lucide-react";

const isLocal = (id: string) => id.startsWith("local-");

interface GuestbookEntry {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

interface GuestPhoto {
  id: string;
  uploaderName: string | null;
  caption: string | null;
  photoData: string;
  createdAt: string;
}

interface PostWeddingData {
  website: {
    id: string;
    slug: string;
    published: boolean;
  } | null;
  guestbookEntries: GuestbookEntry[];
  guestPhotos: GuestPhoto[];
  rsvpCounts: {
    attending: number;
    notAttending: number;
    noReply: number;
    total: number;
  };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export default function PostWeddingPage() {
  const { id } = useParams<{ id: string }>();
  const local = isLocal(id);
  const [data, setData] = useState<PostWeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "guestbook" | "photos">("overview");
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (local) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/planner/projects/${id}/post-wedding`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [id, local]);

  useEffect(() => { load(); }, [load]);

  if (local) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-20">
        <Heart className="w-12 h-12 text-purple-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Post-Wedding</h2>
        <p className="text-gray-500 text-sm">
          Post-wedding memories are available for saved projects.{" "}
          <Link href="/login" className="text-purple-600 underline">Sign in</Link> to save your project and access this feature.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
      </div>
    );
  }

  const website = data?.website;
  const entries = data?.guestbookEntries ?? [];
  const photos = data?.guestPhotos ?? [];
  const rsvp = data?.rsvpCounts ?? { attending: 0, notAttending: 0, noReply: 0, total: 0 };

  const TABS = [
    { id: "overview" as const, label: "Overview", icon: Heart },
    { id: "guestbook" as const, label: `Guestbook (${entries.length})`, icon: BookOpen },
    { id: "photos" as const, label: `Photos (${photos.length})`, icon: Camera },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Heart className="w-6 h-6 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Post-Wedding</h1>
        </div>
        <p className="text-sm text-gray-500">Relive your special day — guestbook messages, photos, and memories.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-5 h-5 text-purple-500" />} label="Attending" value={rsvp.attending} color="purple" />
            <StatCard icon={<MessageSquare className="w-5 h-5 text-pink-500" />} label="Guestbook" value={entries.length} color="pink" />
            <StatCard icon={<Camera className="w-5 h-5 text-rose-500" />} label="Photos" value={photos.length} color="rose" />
            <StatCard icon={<Heart className="w-5 h-5 text-red-400" />} label="Total RSVPs" value={rsvp.total} color="red" />
          </div>

          {/* RSVP breakdown */}
          {rsvp.total > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">RSVP Summary</h3>
              <div className="space-y-2">
                <RsvpBar label="Attending" count={rsvp.attending} total={rsvp.total} color="bg-green-400" />
                <RsvpBar label="Not Attending" count={rsvp.notAttending} total={rsvp.total} color="bg-red-300" />
                <RsvpBar label="No Reply" count={rsvp.noReply} total={rsvp.total} color="bg-gray-200" />
              </div>
            </div>
          )}

          {/* Quick access */}
          <div className="grid sm:grid-cols-2 gap-4">
            {entries.length > 0 && (
              <button
                onClick={() => setActiveTab("guestbook")}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:border-purple-200 hover:bg-purple-50/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-pink-500" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Latest Guestbook Message</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">&ldquo;{entries[0]?.message}&rdquo;</p>
                <p className="text-xs text-purple-500 mt-2">— {entries[0]?.authorName}</p>
              </button>
            )}

            {photos.length > 0 && (
              <button
                onClick={() => setActiveTab("photos")}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-left hover:border-purple-200 transition-colors group relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photos[0].photoData} alt="Latest photo" className="w-full h-32 object-cover" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">
                      {photos.length} Guest Photo{photos.length !== 1 ? "s" : ""}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Shared by your guests</p>
                </div>
              </button>
            )}
          </div>

          {/* Wedding website link */}
          {website && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Your Wedding Website</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {website.published ? "Published and accessible to guests" : "Not yet published"}
                </p>
              </div>
              <Link
                href={`/wedding/${website.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Visit site
              </Link>
            </div>
          )}

          {/* Empty state */}
          {entries.length === 0 && photos.length === 0 && rsvp.total === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Your post-wedding memories will appear here</p>
              <p className="text-xs text-gray-400 mt-1">
                Guestbook messages and guest photos from your wedding site will show up once guests submit them
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Guestbook Tab ── */}
      {activeTab === "guestbook" && (
        <div>
          {entries.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <BookOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No guestbook messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Guests can leave messages on your wedding website</p>
              {website && (
                <Link href={`/wedding/${website.slug}`} target="_blank"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-purple-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Visit your wedding site
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">{entries.length} message{entries.length !== 1 ? "s" : ""}</p>
                <button
                  onClick={() => {
                    const text = entries.map(e =>
                      `${e.authorName} (${formatDate(e.createdAt)})\n${e.message}`
                    ).join("\n\n---\n\n");
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = "guestbook.txt"; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700"
                >
                  <Download className="w-3.5 h-3.5" /> Download all
                </button>
              </div>
              <div className="space-y-3">
                {entries.map(entry => (
                  <div key={entry.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{entry.authorName}</span>
                      <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{entry.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Photos Tab ── */}
      {activeTab === "photos" && (
        <div>
          {photos.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No guest photos yet</p>
              <p className="text-xs text-gray-400 mt-1">Guests can upload photos from your wedding website</p>
              {website && (
                <Link href={`/wedding/${website.slug}`} target="_blank"
                  className="inline-flex items-center gap-1 mt-3 text-xs text-purple-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Visit your wedding site
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{photos.length} photo{photos.length !== 1 ? "s" : ""} shared by guests</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className="rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => setLightboxSrc(photo.photoData)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.photoData} alt={photo.caption || "Guest photo"} className="w-full aspect-square object-cover" />
                    {(photo.uploaderName || photo.caption) && (
                      <div className="px-2.5 py-2">
                        {photo.uploaderName && <p className="text-xs font-semibold text-gray-700 truncate">{photo.uploaderName}</p>}
                        {photo.caption && <p className="text-xs text-gray-400 truncate">{photo.caption}</p>}
                        <p className="text-[10px] text-gray-300 mt-0.5">{formatDate(photo.createdAt)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const bg: Record<string, string> = {
    purple: "bg-purple-50", pink: "bg-pink-50", rose: "bg-rose-50", red: "bg-red-50",
  };
  return (
    <div className={`${bg[color] ?? "bg-gray-50"} rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function RsvpBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
    </div>
  );
}
