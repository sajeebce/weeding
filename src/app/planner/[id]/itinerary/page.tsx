"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { FileText, RotateCcw, Plus, MoreVertical, X, Check, Table2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";
import {
  getLocalItinerary,
  getLocalProject,
  addLocalItineraryEvent,
  updateLocalItineraryEvent,
  deleteLocalItineraryEvent,
  LocalItineraryEvent,
} from "@/lib/planner-storage";

const isLocal = (id: string) => id.startsWith("local-");

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Wedding icons ─────────────────────────────────────────────────────────────
const S = "currentColor";
const ICONS: Array<{ id: string; label: string; svg: React.ReactNode }> = [
  { id: "couple-arch", label: "Ceremony",
    svg: <><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="none" stroke={S} strokeWidth="1.2"/><path d="M6 21v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3M4 8c4-4 12-4 16 0" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "camera", label: "Photography",
    svg: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="12" cy="13" r="4" fill="none" stroke={S} strokeWidth="1.2"/></> },
  { id: "car", label: "Transport",
    svg: <><rect x="1" y="9" width="15" height="10" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><path d="M1 12l3-3h9l3 3" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><circle cx="5" cy="19" r="2" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="13" cy="19" r="2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M16 13h4a2 2 0 0 1 2 2v3h-2" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "church", label: "Church",
    svg: <><rect x="6" y="10" width="12" height="11" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><path d="M12 2v6M9 5h6" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M6 10 L12 5 L18 10" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><rect x="10" y="16" width="4" height="5" fill="none" stroke={S} strokeWidth="1.2"/></> },
  { id: "rings", label: "Rings",
    svg: <><circle cx="8" cy="14" r="5" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="16" cy="14" r="5" fill="none" stroke={S} strokeWidth="1.2"/><path d="M12 10c0-2.2-1.8-4-4-4s-4 1.8-4 4" fill="none" stroke={S} strokeWidth="1" strokeDasharray="1 1"/></> },
  { id: "table", label: "Reception",
    svg: <><path d="M3 6h18M5 6v12M19 6v12" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M8 18h8" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="4" r="1.5" fill="none" stroke={S} strokeWidth="1.1"/><circle cx="16" cy="4" r="1.5" fill="none" stroke={S} strokeWidth="1.1"/></> },
  { id: "cloche", label: "Catering",
    svg: <><path d="M3 13h18M4 17h16a1 1 0 0 0 1-1 9 9 0 1 0-18 0 1 1 0 0 0 1 1z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 5V3M12 5V3M14 5V3" stroke={S} strokeWidth="1.1" strokeLinecap="round"/></> },
  { id: "cake", label: "Wedding Cake",
    svg: <><rect x="3" y="13" width="18" height="8" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><rect x="6" y="8" width="12" height="5" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><path d="M12 3v2M10 5c0 1.1.9 2 2 2s2-.9 2-2" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M7 13c0-1.4 2-2 2-3.5M12 13c0-1.4 2-2 2-3.5" stroke={S} strokeWidth="1" strokeLinecap="round"/></> },
  { id: "dancing", label: "First Dance",
    svg: <><circle cx="8" cy="4" r="1.5" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="16" cy="4" r="1.5" fill="none" stroke={S} strokeWidth="1.2"/><path d="M6 8l2 4-2 4M10 16l-2 2M18 8l-2 4 2 4M14 16l2 2" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12c1.3.7 4.7.7 8 0" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "bouquet", label: "Flowers",
    svg: <><path d="M12 22V12" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="9" r="3" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="7" cy="7" r="2.5" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="17" cy="7" r="2.5" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="9" cy="13" r="2" fill="none" stroke={S} strokeWidth="1.1"/><circle cx="15" cy="13" r="2" fill="none" stroke={S} strokeWidth="1.1"/></> },
  { id: "hearts", label: "Romance",
    svg: <><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke={S} strokeWidth="1.2"/></> },
  { id: "sparkles", label: "Fireworks",
    svg: <><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke={S} strokeWidth="1.3" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill="none" stroke={S} strokeWidth="1.2"/></> },
  { id: "arch-flowers", label: "Floral Arch",
    svg: <><path d="M5 21V11a7 7 0 0 1 14 0v10" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M9 21V14a3 3 0 0 1 6 0v7" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="5" cy="8" r="2" fill="none" stroke={S} strokeWidth="1.1"/><circle cx="19" cy="8" r="2" fill="none" stroke={S} strokeWidth="1.1"/></> },
  { id: "woman", label: "Bride",
    svg: <><circle cx="12" cy="5" r="3" fill="none" stroke={S} strokeWidth="1.2"/><path d="M8 10c0 0 1 2 4 2s4-2 4-2v2l2 9H8l2-9v-2z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 8c-1 1-2 2-2 4" stroke={S} strokeWidth="1" strokeLinecap="round"/><path d="M17 8c1 1 2 2 2 4" stroke={S} strokeWidth="1" strokeLinecap="round"/></> },
  { id: "man", label: "Groom",
    svg: <><circle cx="12" cy="5" r="3" fill="none" stroke={S} strokeWidth="1.2"/><path d="M9 10h6l1 3-4 2-4-2 1-3z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 15l-1 7h10l-1-7" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M12 15v3" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "clipboard", label: "Planning",
    svg: <><rect x="5" y="4" width="14" height="17" rx="2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M9 4V2h6v2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M8 10h8M8 14h6M8 18h4" stroke={S} strokeWidth="1.1" strokeLinecap="round"/></> },
  { id: "pin", label: "Location",
    svg: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="12" cy="10" r="3" fill="none" stroke={S} strokeWidth="1.2"/></> },
  { id: "music", label: "Music",
    svg: <><path d="M9 18V5l12-2v13" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><circle cx="6" cy="18" r="3" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="18" cy="16" r="3" fill="none" stroke={S} strokeWidth="1.2"/></> },
  { id: "fork-spoon", label: "Food",
    svg: <><path d="M8 3v18M8 9c-2 0-4-1-4-3V3M12 3c0 0 4 2 4 6 0 3-2 4-4 4v8" stroke={S} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "champagne", label: "Toast",
    svg: <><path d="M8 2l-3 9h6L8 2zM16 2l-3 9h6L16 2z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 11v3a4 4 0 0 0 8 0v-3" fill="none" stroke={S} strokeWidth="1.2"/><path d="M10 17l-2 4h8l-2-4" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 14l8 0" stroke={S} strokeWidth="1" strokeLinecap="round"/></> },
  { id: "mic", label: "Speeches",
    svg: <><rect x="9" y="2" width="6" height="11" rx="3" fill="none" stroke={S} strokeWidth="1.2"/><path d="M19 10a7 7 0 0 1-14 0M12 19v3M8 22h8" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "envelope", label: "Invitations",
    svg: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke={S} strokeWidth="1.2"/><path d="M22 6l-10 7L2 6" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/></> },
  { id: "gift", label: "Gifts",
    svg: <><rect x="3" y="10" width="18" height="11" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><path d="M21 10H3V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3z" fill="none" stroke={S} strokeWidth="1.2"/><path d="M12 6V21M8 6c0-2 1-3 2-3s2 1 2 3M14 6c0-2 1-3 2-3s2 1 2 3" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/></> },
  { id: "scissors", label: "Hair & Beauty",
    svg: <><circle cx="6" cy="6" r="3" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="6" cy="18" r="3" fill="none" stroke={S} strokeWidth="1.2"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "hotel", label: "Hotel",
    svg: <><rect x="2" y="5" width="20" height="16" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><path d="M2 10h20" stroke={S} strokeWidth="1.1" strokeLinecap="round"/><rect x="7" y="13" width="3" height="3" fill="none" stroke={S} strokeWidth="1.1"/><rect x="14" y="13" width="3" height="3" fill="none" stroke={S} strokeWidth="1.1"/><path d="M12 2v3" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "luggage", label: "Honeymoon",
    svg: <><rect x="5" y="7" width="14" height="14" rx="2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M9 7V5a2 2 0 0 1 4 0v2M15 7V5" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M5 13h14M9 17h6" stroke={S} strokeWidth="1.1" strokeLinecap="round"/></> },
  { id: "bus", label: "Guest Bus",
    svg: <><rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M2 10h20" stroke={S} strokeWidth="1.1"/><circle cx="7" cy="19" r="1.5" fill="none" stroke={S} strokeWidth="1.2"/><circle cx="17" cy="19" r="1.5" fill="none" stroke={S} strokeWidth="1.2"/><path d="M7 5v5M17 5v5M12 5v5" stroke={S} strokeWidth="1" strokeLinecap="round"/></> },
  { id: "sailboat", label: "Honeymoon Trip",
    svg: <><path d="M12 3v14M4 17h16" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M12 3L4 17h8" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M4 20c1 1.5 4 2 8 2s7-.5 8-2" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "sunrise", label: "Morning",
    svg: <><path d="M12 2v4M4.22 10.22l2.83 2.83M1 18h4M19 18h4M17.95 13.05l2.83-2.83" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M5 18a7 7 0 0 1 14 0" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M2 22h20" stroke={S} strokeWidth="1.2" strokeLinecap="round"/></> },
  { id: "handshake", label: "Vows",
    svg: <><path d="M6 9H2v8l4.5 3 7-3 4.5 1 4-3V9h-4L12 6 6 9z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M12 6v14" stroke={S} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/></> },
  { id: "clock", label: "Schedule",
    svg: <><circle cx="12" cy="12" r="10" fill="none" stroke={S} strokeWidth="1.2"/><path d="M12 6v6l4 2" stroke={S} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "cocktail", label: "Cocktails",
    svg: <><path d="M8 2h8l-4 8-4-8z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M12 10v10M8 20h8" stroke={S} strokeWidth="1.2" strokeLinecap="round"/><path d="M12 14l3-2" stroke={S} strokeWidth="1.1" strokeLinecap="round"/></> },
  { id: "candle", label: "Ambiance",
    svg: <><rect x="9" y="9" width="6" height="13" rx="1" fill="none" stroke={S} strokeWidth="1.2"/><path d="M12 3c0 0-1.5 2-1.5 3.5S10.5 9 12 9s1.5-1 1.5-2.5S12 3 12 3z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M7 22h10" stroke={S} strokeWidth="1.1" strokeLinecap="round"/></> },
  { id: "walk", label: "Send Off",
    svg: <><circle cx="8" cy="4" r="2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M6 8l2 5h4l2 7M8 13l-2 7" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="4" r="2" fill="none" stroke={S} strokeWidth="1.2"/><path d="M15 8l-2 5h4l1.5 7M17 13l1.5 7" fill="none" stroke={S} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></> },
  { id: "vase", label: "Decor",
    svg: <><path d="M8 3h8l1 5c.5 2 .5 4 0 6L16 21H8l-1-7c-.5-2-.5-4 0-6L8 3z" fill="none" stroke={S} strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 3c0 0-1 3 2 4s2 4 2 4" fill="none" stroke={S} strokeWidth="1" strokeLinecap="round"/></> },
];

// Default events seeded on first visit
const DEFAULT_EVENTS = [
  { title: "Photo Session",           startTime: "01:30", endTime: "02:30", category: "camera",       description: null, location: null },
  { title: "Wake Up, Shower",         startTime: "08:00", endTime: "08:40", category: "sunrise",      description: null, location: null },
  { title: "Breakfast",               startTime: "08:40", endTime: "09:10", category: "cloche",       description: null, location: null },
  { title: "Hair and makeup",         startTime: "09:10", endTime: "11:10", category: "scissors",     description: null, location: null },
  { title: "Everyone gets dressed",   startTime: "11:10", endTime: "11:40", category: "woman",        description: null, location: null },
  { title: "Lunch or Snack",          startTime: "11:40", endTime: "12:00", category: "fork-spoon",   description: null, location: null },
  { title: "Grand Exit",              startTime: "12:30", endTime: "13:00", category: "walk",         description: null, location: null },
  { title: "Arrive at Ceremony",      startTime: "13:00", endTime: "13:30", category: "church",       description: null, location: null },
  { title: "Pre-ceremony Photos",     startTime: "13:30", endTime: "14:30", category: "camera",       description: null, location: null },
  { title: "Ceremony Begins",         startTime: "14:30", endTime: "15:30", category: "couple-arch",  description: null, location: null },
  { title: "Group Photos",            startTime: "15:45", endTime: "16:15", category: "camera",       description: null, location: null },
  { title: "Cocktails and Photos",    startTime: "16:15", endTime: "16:35", category: "cocktail",     description: null, location: null },
  { title: "All travel to reception", startTime: "16:35", endTime: "17:15", category: "car",          description: null, location: null },
  { title: "Grand Entrance",          startTime: "17:15", endTime: "17:35", category: "sparkles",     description: null, location: null },
  { title: "First Dance",             startTime: "17:35", endTime: "17:50", category: "dancing",      description: null, location: null },
  { title: "Dinner",                  startTime: "18:00", endTime: "18:40", category: "table",        description: null, location: null },
  { title: "Toasts & Prayers",        startTime: "18:40", endTime: "19:20", category: "champagne",    description: null, location: null },
  { title: "Party Time!",             startTime: "19:20", endTime: "21:00", category: "music",        description: null, location: null },
  { title: "Cut Cake",                startTime: "21:00", endTime: "22:00", category: "cake",         description: null, location: null },
  { title: "Firework & Send Off",     startTime: "22:00", endTime: "22:30", category: "sparkles",     description: null, location: null },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fromMin(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getDuration(start: string, end: string | null): number {
  if (!end) return 0;
  return Math.max(0, toMin(end) - toMin(start));
}

function timeParts(t: string, use24h: boolean): { hm: string; ampm: string } {
  const [h, m] = t.split(":").map(Number);
  if (use24h) return { hm: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, ampm: "" };
  const ampm = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return { hm: `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`, ampm };
}

function toggleAmPm(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return fromMin((h < 12 ? h + 12 : h - 12) * 60 + m);
}

function IconSvg({ iconId, size = 40 }: { iconId: string | null; size?: number }) {
  const icon = ICONS.find(i => i.id === iconId) ?? ICONS.find(i => i.id === "clock")!;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-[#5a5880]">
      {icon.svg}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const local = isLocal(id);
  const { tier } = usePlannerTier(id);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [events, setEvents] = useState<LocalItineraryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [use24h, setUse24h] = useState(false);

  // Inline editing states
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [editingTimeId, setEditingTimeId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");
  const [editingDurationId, setEditingDurationId] = useState<string | null>(null);
  const [tempDuration, setTempDuration] = useState("");
  const [iconPickerFor, setIconPickerFor] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // New event
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: "New Event", startTime: "10:00", duration: "60" });
  const [savingNew, setSavingNew] = useState(false);

  const autoSeededRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      if (local) {
        setEvents(getLocalItinerary(id));
        const proj = getLocalProject(id);
        setEventDate(proj?.eventDate ?? null);
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/itinerary`);
        setEvents(data.events ?? []);
        try {
          const r = await fetch(`/api/planner/projects/${id}`);
          if (r.ok) setEventDate((await r.json()).project?.eventDate ?? null);
        } catch { /* ignore */ }
      }
    } catch { setEvents([]); } finally { setLoading(false); }
  }, [id, local]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Auto-seed defaults
  useEffect(() => {
    if (!loading && events.length === 0 && !autoSeededRef.current) {
      autoSeededRef.current = true;
      seedDefaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, events.length]);

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function seedDefaults() {
    for (const ev of DEFAULT_EVENTS) {
      if (local) addLocalItineraryEvent(id, ev);
      else {
        try { await apiFetch(`/api/planner/projects/${id}/itinerary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ev) }); }
        catch { /* skip */ }
      }
    }
    await loadEvents();
  }

  async function resetAll() {
    if (!confirm("Delete all events and reload the default itinerary?")) return;
    for (const ev of events) {
      if (local) deleteLocalItineraryEvent(id, ev.id);
      else { try { await apiFetch(`/api/planner/projects/${id}/itinerary/${ev.id}`, { method: "DELETE" }); } catch { /* skip */ } }
    }
    autoSeededRef.current = false;
    await loadEvents();
  }

  // ── Update helpers ─────────────────────────────────────────────────────────
  async function patchEvent(ev: LocalItineraryEvent, patch: Partial<LocalItineraryEvent>) {
    const updated = { ...ev, ...patch };
    const payload = { title: updated.title, description: updated.description, startTime: updated.startTime, endTime: updated.endTime, location: updated.location, category: updated.category };
    if (local) updateLocalItineraryEvent(id, ev.id, payload);
    else {
      try { await apiFetch(`/api/planner/projects/${id}/itinerary/${ev.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
      catch { /* ignore */ }
    }
    await loadEvents();
  }

  // ── Inline title ───────────────────────────────────────────────────────────
  function openTitle(ev: LocalItineraryEvent) {
    setEditingTimeId(null); setEditingDurationId(null); setIconPickerFor(null);
    setTempTitle(ev.title);
    setEditingTitleId(ev.id);
  }
  async function saveTitle(ev: LocalItineraryEvent) {
    if (tempTitle.trim()) await patchEvent(ev, { title: tempTitle.trim() });
    setEditingTitleId(null);
  }

  // ── Inline time ────────────────────────────────────────────────────────────
  function openTime(ev: LocalItineraryEvent) {
    setEditingTitleId(null); setEditingDurationId(null); setIconPickerFor(null);
    setTempTime(ev.startTime);
    setEditingTimeId(ev.id);
  }
  async function saveTime(ev: LocalItineraryEvent) {
    if (!tempTime) { setEditingTimeId(null); return; }
    const dur = getDuration(ev.startTime, ev.endTime);
    const newEnd = dur > 0 ? fromMin(toMin(tempTime) + dur) : ev.endTime;
    await patchEvent(ev, { startTime: tempTime, endTime: newEnd });
    setEditingTimeId(null);
  }
  async function flipAmPm(ev: LocalItineraryEvent) {
    const newStart = toggleAmPm(ev.startTime);
    const dur = getDuration(ev.startTime, ev.endTime);
    const newEnd = dur > 0 ? fromMin(toMin(newStart) + dur) : ev.endTime;
    await patchEvent(ev, { startTime: newStart, endTime: newEnd });
  }

  // ── Inline duration ────────────────────────────────────────────────────────
  function openDuration(ev: LocalItineraryEvent) {
    setEditingTitleId(null); setEditingTimeId(null); setIconPickerFor(null);
    setTempDuration(String(getDuration(ev.startTime, ev.endTime)));
    setEditingDurationId(ev.id);
  }
  async function saveDuration(ev: LocalItineraryEvent) {
    const mins = Math.max(0, parseInt(tempDuration) || 0);
    const newEnd = mins > 0 ? fromMin(toMin(ev.startTime) + mins) : null;
    await patchEvent(ev, { endTime: newEnd });
    setEditingDurationId(null);
  }

  // ── Icon ───────────────────────────────────────────────────────────────────
  async function pickIcon(ev: LocalItineraryEvent, iconId: string) {
    await patchEvent(ev, { category: iconId });
    setIconPickerFor(null);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function deleteEvent(eventId: string) {
    setMenuFor(null);
    if (local) deleteLocalItineraryEvent(id, eventId);
    else { try { await apiFetch(`/api/planner/projects/${id}/itinerary/${eventId}`, { method: "DELETE" }); } catch { /* ignore */ } }
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }

  // ── Add new event ──────────────────────────────────────────────────────────
  async function saveNewEvent() {
    if (!newForm.title.trim()) return;
    setSavingNew(true);
    const dur = parseInt(newForm.duration) || 0;
    const endTime = dur > 0 ? fromMin(toMin(newForm.startTime) + dur) : null;
    const payload = { title: newForm.title.trim(), startTime: newForm.startTime, endTime, description: null, location: null, category: "clock" };
    if (local) addLocalItineraryEvent(id, payload);
    else {
      try { await apiFetch(`/api/planner/projects/${id}/itinerary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
      catch { /* ignore */ }
    }
    setAddingNew(false);
    setNewForm({ title: "New Event", startTime: "10:00", duration: "60" });
    await loadEvents();
    setSavingNew(false);
  }

  const sorted = [...events].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @page { size: A4; margin: 1.5cm 2cm; }
        @media print {
          html, body { visibility: hidden !important; }
          .print-only { visibility: visible !important; display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; }
          .print-only * { visibility: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print view */}
      <div className="print-only" style={{ display: "none", fontFamily: "Arial, sans-serif", fontSize: "11pt" }}>
        <h1 style={{ fontSize: "18pt", fontWeight: "bold", marginBottom: "4px" }}>Event Itinerary</h1>
        {formattedDate && <p style={{ fontSize: "10pt", color: "#555", marginBottom: "16px" }}>Wedding Date: {formattedDate}</p>}
        <hr style={{ border: "none", borderTop: "1.5px solid #222", marginBottom: "16px" }} />
        {sorted.map(ev => {
          const dur = getDuration(ev.startTime, ev.endTime);
          const { hm, ampm } = timeParts(ev.startTime, use24h);
          return (
            <div key={ev.id} style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
              <div style={{ width: "90px", flexShrink: 0 }}>
                <span style={{ fontWeight: "bold" }}>{hm}</span>
                {ampm && <span style={{ fontSize: "9pt", marginLeft: "2px" }}>{ampm}</span>}
                {dur > 0 && <div style={{ fontSize: "9pt", color: "#888" }}>{dur} min</div>}
              </div>
              <div><span style={{ fontWeight: "600" }}>{ev.title}</span></div>
            </div>
          );
        })}
      </div>

      {/* Icon picker modal */}
      {iconPickerFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setIconPickerFor(null)}>
          <div className="rounded-2xl bg-white shadow-2xl w-80 p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">Choose icon</h3>
              <button onClick={() => setIconPickerFor(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {ICONS.map(icon => {
                const ev = events.find(e => e.id === iconPickerFor);
                const selected = ev?.category === icon.id;
                return (
                  <button
                    key={icon.id}
                    onClick={() => { const ev = events.find(e => e.id === iconPickerFor); if (ev) pickIcon(ev, icon.id); }}
                    title={icon.label}
                    className={`flex items-center justify-center rounded-lg p-1.5 transition-colors ${selected ? "bg-indigo-100 ring-2 ring-indigo-400" : "hover:bg-gray-100"}`}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#5a5880]">
                      {icon.svg}
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main page */}
      <div className="no-print min-h-screen bg-[#ebe8f1]">
        <div className="mx-auto max-w-xl px-4 py-8">

          {/* Heading */}
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-semibold text-[#2d2b4a] tracking-tight">{t("itinerary.heading")}</h1>
            <p className="mt-2 text-sm text-[#6b6890] leading-relaxed max-w-sm mx-auto">
              Make and{" "}
              <button onClick={() => { if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; } window.print(); }} className="text-[#4f46bd] hover:underline">print</button>
              {" "}a schedule for the big day. From wake-up to{" "}
              <span className="text-[#4f46bd]">I dos</span>
              , create a complete itinerary that walks you through the day.
            </p>
            {formattedDate && (
              <p className="mt-3 text-sm text-[#6b6890]">
                Wedding Date:{" "}
                <span className="text-[#4f46bd] underline decoration-dotted cursor-default">{formattedDate}</span>
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="mb-5 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                role="switch" aria-checked={use24h}
                onClick={() => setUse24h(v => !v)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${use24h ? "bg-[#4f46bd]" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${use24h ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className="text-xs text-[#6b6890]">24-Hour Clock</span>
            </label>
            {events.length > 0 && (
              <button onClick={resetAll} className="flex items-center gap-1 text-xs text-[#4f46bd] hover:text-indigo-800">
                <RotateCcw className="h-3 w-3" /> Reset entire itinerary
              </button>
            )}
          </div>

          {/* Loading */}
          {loading || (!loading && events.length === 0) ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4f46bd]/30 border-t-[#4f46bd]" />
            </div>
          ) : (
            <>
              {/* Section heading */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold text-[#2d2b4a]">The Big Day</h2>
                <div className="mx-auto mt-1 h-0.5 w-8 rounded bg-[#4f46bd]/40" />
              </div>

              {/* Timeline */}
              <div>
                {sorted.map((ev, idx) => {
                  const dur = getDuration(ev.startTime, ev.endTime);
                  const { hm, ampm } = timeParts(ev.startTime, use24h);
                  const highlighted = idx % 3 === 0;

                  return (
                    <div key={ev.id} className={`group flex items-stretch relative ${highlighted ? "bg-white/60 rounded-xl" : ""}`} style={{ minHeight: 72 }}>

                      {/* LEFT: icon + time + duration */}
                      <div className="flex w-[45%] flex-shrink-0 items-center gap-2 px-3 py-3">
                        {/* Clickable icon */}
                        <button
                          onClick={() => setIconPickerFor(ev.id)}
                          className="flex-shrink-0 rounded-lg p-1 hover:bg-white/60 transition-colors"
                          title="Change icon"
                        >
                          <IconSvg iconId={ev.category} size={38} />
                        </button>

                        {/* Time + duration */}
                        <div className="min-w-0">
                          {editingTimeId === ev.id ? (
                            <input
                              autoFocus
                              type="time"
                              value={tempTime}
                              onChange={e => setTempTime(e.target.value)}
                              onBlur={() => saveTime(ev)}
                              onKeyDown={e => { if (e.key === "Enter") saveTime(ev); if (e.key === "Escape") setEditingTimeId(null); }}
                              className="rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm focus:outline-none w-28"
                            />
                          ) : (
                            <div className="flex items-baseline gap-0.5">
                              <button
                                onClick={() => openTime(ev)}
                                className="text-[1.9rem] font-bold leading-none tracking-tight text-[#2d2b4a] hover:text-[#4f46bd] transition-colors tabular-nums"
                              >
                                {hm}
                              </button>
                              {ampm && (
                                <button
                                  onClick={() => flipAmPm(ev)}
                                  className="ml-1 text-sm font-medium text-[#2d2b4a]/70 hover:text-[#4f46bd] transition-colors"
                                  title="Toggle am/pm"
                                >
                                  {ampm}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Duration row */}
                          {editingDurationId === ev.id ? (
                            <div className="mt-0.5 flex items-center gap-1">
                              <input
                                autoFocus
                                type="number"
                                min="0"
                                value={tempDuration}
                                onChange={e => setTempDuration(e.target.value)}
                                onBlur={() => saveDuration(ev)}
                                onKeyDown={e => { if (e.key === "Enter") saveDuration(ev); if (e.key === "Escape") setEditingDurationId(null); }}
                                className="w-16 rounded border border-indigo-300 bg-white px-1.5 py-0.5 text-xs focus:outline-none tabular-nums"
                              />
                              <span className="text-[11px] text-[#9995b8]">min</span>
                              <button onClick={() => saveDuration(ev)} className="text-indigo-500 hover:text-indigo-700">
                                <Check className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openDuration(ev)}
                              className="mt-0.5 block text-[11px] text-[#9995b8] hover:text-[#4f46bd] transition-colors"
                            >
                              Duration {dur} min
                            </button>
                          )}
                        </div>
                      </div>

                      {/* CENTER: dotted vertical line */}
                      <div className="relative flex w-4 flex-shrink-0 flex-col items-center">
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px border-l border-dashed border-[#b0acd0]" />
                        <div className="relative z-10 mt-7 h-2 w-2 rounded-full border border-[#b0acd0] bg-[#ebe8f1]" />
                      </div>

                      {/* RIGHT: title + menu */}
                      <div className="flex flex-1 items-center px-3 py-3 gap-2">
                        <div className="flex-1 min-w-0">
                          {editingTitleId === ev.id ? (
                            <input
                              autoFocus
                              value={tempTitle}
                              onChange={e => setTempTitle(e.target.value)}
                              onBlur={() => saveTitle(ev)}
                              onKeyDown={e => { if (e.key === "Enter") saveTitle(ev); if (e.key === "Escape") setEditingTitleId(null); }}
                              className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm text-[#4f46bd] focus:outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => openTitle(ev)}
                              className="block w-full text-left text-sm font-medium text-[#4f46bd] hover:text-indigo-900 transition-colors truncate"
                            >
                              {ev.title}
                            </button>
                          )}
                          <div className="mt-0.5 h-px w-full bg-[#d6d3e8]" />
                        </div>

                        {/* ⋮ three-dot menu */}
                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" ref={menuFor === ev.id ? menuRef : undefined}>
                          <button
                            onClick={() => setMenuFor(menuFor === ev.id ? null : ev.id)}
                            className="rounded p-0.5 text-[#b0acd0] hover:text-[#4f46bd] hover:bg-white/60"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {menuFor === ev.id && (
                            <div className="absolute right-0 top-6 z-20 w-32 rounded-xl border border-gray-100 bg-white shadow-lg py-1">
                              <button
                                onClick={() => deleteEvent(ev.id)}
                                className="w-full px-3 py-1.5 text-left text-xs text-red-500 hover:bg-red-50 transition-colors"
                              >
                                Delete event
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add event form */}
                {addingNew && (
                  <div className="mt-3 rounded-xl border border-indigo-200 bg-white/80 p-3 space-y-2 shadow-sm">
                    <input
                      autoFocus
                      value={newForm.title}
                      onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") saveNewEvent(); if (e.key === "Escape") setAddingNew(false); }}
                      placeholder="Event title"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Start time</label>
                        <input type="time" value={newForm.startTime} onChange={e => setNewForm(f => ({ ...f, startTime: e.target.value }))}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-0.5">Duration (min)</label>
                        <input type="number" min="0" value={newForm.duration} onChange={e => setNewForm(f => ({ ...f, duration: e.target.value }))}
                          className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-indigo-400 focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={saveNewEvent} disabled={savingNew || !newForm.title.trim()}
                        className="flex items-center gap-1 rounded-lg bg-[#4f46bd] px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                        <Check className="h-3 w-3" /> Save
                      </button>
                      <button onClick={() => setAddingNew(false)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                        <X className="h-3 w-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* + Add event */}
                {!addingNew && (
                  <div className="mt-4 text-center">
                    <button onClick={() => setAddingNew(true)} className="text-sm text-[#4f46bd] hover:text-indigo-900 transition-colors">
                      <Plus className="inline h-4 w-4 -mt-0.5 mr-0.5" />
                      Add event
                    </button>
                  </div>
                )}
              </div>

              {/* Export buttons */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => { if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; } window.print(); }}
                  className="flex items-center gap-2 rounded-xl border border-[#c5c2db] bg-white/70 px-6 py-2.5 text-sm text-[#6b6890] shadow-sm hover:bg-white transition-colors"
                >
                  <FileText className="h-4 w-4 text-red-400" />
                  Download PDF file
                </button>
                <button
                  onClick={() => {
                    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
                    import("xlsx").then((XLSX) => {
                      const rows = sorted.map((ev) => {
                        const dur = getDuration(ev.startTime, ev.endTime);
                        const { hm, ampm } = timeParts(ev.startTime, use24h);
                        return {
                          Time: `${hm}${ampm ? " " + ampm : ""}`,
                          "Duration (min)": dur > 0 ? dur : "",
                          Event: ev.title,
                          Location: ev.location || "",
                        };
                      });
                      const ws = XLSX.utils.json_to_sheet(rows);
                      ws["!cols"] = [{ wch: 12 }, { wch: 16 }, { wch: 32 }, { wch: 24 }];
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Itinerary");
                      const filename = `wedding-itinerary${eventDate ? "-" + new Date(eventDate).toISOString().split("T")[0] : ""}.xlsx`;
                      XLSX.writeFile(wb, filename);
                    });
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#c5c2db] bg-white/70 px-6 py-2.5 text-sm text-[#6b6890] shadow-sm hover:bg-white transition-colors"
                >
                  <Table2 className="h-4 w-4 text-emerald-500" />
                  Download XLS file
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}
