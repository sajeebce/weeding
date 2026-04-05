"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Search, MapPin, Users, Heart, Calendar, Loader2, QrCode } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  rsvpStatus: string;
}

interface Table {
  id: string;
  layoutId: string;
  name: string;
  type: string;
  seats: number;
  guests: Guest[];
}

interface Layout {
  id: string;
  name: string;
  type: string;
}

interface ProjectInfo {
  id: string;
  title: string;
  brideName: string | null;
  groomName: string | null;
  eventDate: string | null;
}

interface SeatData {
  project: ProjectInfo;
  tables: Table[];
  layouts: Layout[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SeatFinderPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [data, setData] = useState<SeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ table: Table; guest: Guest } | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/seat-finder/${projectId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Seating information not found.");
        return res.json();
      })
      .then((d: SeatData) => {
        setData(d);
        // Default to RECEPTION layout if available
        const reception = d.layouts.find((l) => l.type === "RECEPTION");
        setSelectedLayout(reception?.id ?? d.layouts[0]?.id ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !query.trim()) return;

    setSearched(true);
    const q = query.trim().toLowerCase();

    // Filter tables by selected layout
    const layoutTables = selectedLayout
      ? data.tables.filter((t) => t.layoutId === selectedLayout)
      : data.tables;

    // Find the first table containing a guest whose name matches
    for (const table of layoutTables) {
      const match = table.guests.find((g) => g.name.toLowerCase().includes(q));
      if (match) {
        setResult({ table, guest: match });
        return;
      }
    }
    setResult(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50">
        <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-rose-50 px-4 text-center">
        <QrCode className="mb-4 h-12 w-12 text-rose-300" />
        <h1 className="text-xl font-semibold text-gray-800">Seating Not Available</h1>
        <p className="mt-2 text-sm text-gray-500">{error ?? "Seating information could not be found."}</p>
      </div>
    );
  }

  const { project, layouts } = data;
  const eventDate = project.eventDate ? formatDate(project.eventDate) : null;
  const coupleNames =
    project.brideName && project.groomName
      ? `${project.brideName} & ${project.groomName}`
      : project.title;

  // Tables for selected layout
  const layoutTables = selectedLayout
    ? data.tables.filter((t) => t.layoutId === selectedLayout)
    : data.tables;

  const totalGuests = layoutTables.reduce((s, t) => s + t.guests.length, 0);

  return (
    <div className="min-h-screen bg-rose-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-rose-400" />
          <h1 className="text-2xl font-bold text-gray-900">{coupleNames}</h1>
          {eventDate && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{eventDate}</span>
            </div>
          )}
          <p className="mt-3 text-sm text-gray-500">
            Find your seat — type your name below
          </p>
        </div>

        {/* Layout selector (if both ceremony + reception) */}
        {layouts.length > 1 && (
          <div className="mb-4 flex gap-2 justify-center">
            {layouts.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLayout(l.id);
                  setResult(null);
                  setSearched(false);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  selectedLayout === l.id
                    ? "bg-rose-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-rose-300"
                }`}
              >
                {l.name || l.type.charAt(0) + l.type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searched) { setSearched(false); setResult(null); }
                }}
                placeholder="Enter your name…"
                className="w-full rounded-2xl border border-gray-200 bg-white pl-9 pr-4 py-3 text-sm shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim()}
              className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Find
            </button>
          </div>
        </form>

        {/* Result */}
        {searched && (
          <>
            {result ? (
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                    <MapPin className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Your seat</p>
                    <p className="text-xl font-bold text-gray-900">{result.table.name}</p>
                  </div>
                </div>

                <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3">
                  <p className="text-sm font-semibold text-rose-700">{result.guest.name}</p>
                  <p className="text-xs text-rose-500 mt-0.5">
                    {result.table.seats} seats · {result.table.guests.length} assigned
                  </p>
                </div>

                {/* Tablemates */}
                {result.table.guests.length > 1 && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>Sitting with you</span>
                    </div>
                    <div className="space-y-1.5">
                      {result.table.guests
                        .filter((g) => g.id !== result.guest.id)
                        .map((g) => (
                          <div
                            key={g.id}
                            className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2"
                          >
                            <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                              {g.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700">{g.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 shadow-lg text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="font-semibold text-gray-700">No seat found</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try a different spelling or contact the couple for help.
                </p>
              </div>
            )}
          </>
        )}

        {/* Stats footer */}
        {!searched && totalGuests > 0 && (
          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Users className="h-3.5 w-3.5" />
            <span>{totalGuests} guests assigned across {layoutTables.length} tables</span>
          </div>
        )}
      </div>
    </div>
  );
}
