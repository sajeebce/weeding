"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Plus, Trash2, Users, Download, ChevronDown, X, Check,
  Circle, Square, RectangleHorizontal, ArrowLeft, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CeremonyDiagram, ReceptionDiagram } from "@/components/planner/venue-diagrams";
import {
  getLocalSeatingLayouts, addLocalSeatingLayout,
  deleteLocalSeatingLayout, addLocalSeatingTable, updateLocalSeatingTable,
  deleteLocalSeatingTable, LocalSeatingLayout, LocalSeatingTable,
  getLocalGuests,
} from "@/lib/planner-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

type TableType = "ROUND" | "RECTANGULAR" | "SQUARE" | "OBLONG" | "HALF_ROUND" | "CHAIRS_ROW" | "BUFFET";
type LayoutType = "CEREMONY" | "RECEPTION";

interface SeatTable extends LocalSeatingTable { type: TableType; }
interface Layout extends LocalSeatingLayout { type: LayoutType; tables: SeatTable[]; }
interface Guest {
  id: string; firstName: string; lastName: string | null; title: string | null;
  side: "BRIDE" | "GROOM"; rsvpStatus: "PENDING" | "ATTENDING" | "NOT_ATTENDING";
  tableNumber?: number | null;
}

const isLocal = (id: string) => id.startsWith("local-");
async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json();
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "ceremony",      lines: ["Ceremony", "Layout"] },
  { id: "reception",     lines: ["Reception", "Layout"] },
  { id: "atlas",         lines: ["Alphabetical", "Guest Atlas"] },
  { id: "cards",         lines: ["Seating Cards", "by Table"] },
  { id: "name-cards",    lines: ["Classic Name", "Cards"] },
  { id: "table-numbers", lines: ["Table", "Numbers"] },
  { id: "menu",          lines: ["Reception", "Menu"] },
];

// ─── Dashed curve connector ───────────────────────────────────────────────────

function TabConnector({ tabIndex }: { tabIndex: number }) {
  const vbW = 700;
  const tabW = vbW / TABS.length;
  const sx = tabW * tabIndex + tabW / 2;
  const ex = vbW / 2;
  const h = 72;
  return (
    <svg viewBox={`0 0 ${vbW} ${h}`} width="100%" height={h} className="overflow-visible">
      <path
        d={`M ${sx} 2 C ${sx} ${h * 0.68} ${ex} ${h * 0.32} ${ex} ${h - 10}`}
        fill="none" stroke="#c4b5d0" strokeWidth="1.5" strokeDasharray="5 4"
      />
      <circle cx={ex} cy={h - 5} r={5} fill="white" stroke="#c4b5d0" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Layout panel (shared structure for ceremony/reception) ───────────────────

function LayoutPanel({
  title, subtitle, diagram, onEdit,
}: {
  title: string; subtitle: string; diagram: React.ReactNode; onEdit: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      {/* Title */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>

      {/* Preview card */}
      <div className="mx-auto max-w-xs overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {diagram}
      </div>

      {/* Edit link + size */}
      <div className="mt-4 text-center">
        <button
          onClick={onEdit}
          className="text-sm font-medium text-purple-600 underline underline-offset-2 hover:text-purple-800 transition-colors"
        >
          Click here to edit layout
        </button>
        <p className="mt-1 text-xs text-gray-400">A1 portrait 23.4 inch × 33.1 inch</p>
      </div>

      {/* Download + arrow hint */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4 text-purple-500" />
          Download PDF file
        </button>
        <span className="text-xs text-gray-400">←</span>
      </div>

      {/* Recommendation */}
      <div className="mt-6 rounded-xl border border-purple-100 bg-white/70 px-5 py-4">
        <p className="text-sm font-semibold text-gray-700">Recommendation</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of subtly colored,
          textured card stock or paper.
        </p>
      </div>

      {/* Gallery */}
      <div className="mt-6">
        <h3 className="mb-3 text-center text-sm font-medium text-gray-600">
          Elegant {title.toLowerCase()} seating chart
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex h-28 w-24 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white/60"
            >
              <ImageIcon className="h-6 w-6 text-gray-300" />
              <span className="text-[10px] text-gray-300">Photo</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-gray-400" : "bg-gray-200")} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Alphabetical Guest Atlas diagram ────────────────────────────────────────

function GuestAtlasDiagram() {
  const sections = [
    { letter: "A", guests: [{ name: "Adams, John", table: "T3" }, { name: "Anderson, Mary", table: "T1" }] },
    { letter: "B", guests: [{ name: "Brown, Sarah", table: "T5" }, { name: "Butler, James", table: "T2" }] },
    { letter: "C", guests: [{ name: "Carter, Lisa", table: "T4" }, { name: "Collins, Mark", table: "T6" }] },
    { letter: "D", guests: [{ name: "Davis, Emma", table: "T1" }] },
    { letter: "E", guests: [{ name: "Evans, Grace", table: "T3" }, { name: "Edwards, Tom", table: "T2" }] },
    { letter: "F", guests: [{ name: "Foster, Anna", table: "T5" }] },
    { letter: "G", guests: [{ name: "Green, Paul", table: "T4" }, { name: "Garcia, Maria", table: "T6" }] },
  ];
  const rows: { y: number; letter?: string; name?: string; table?: string }[] = [];
  let y = 42;
  for (const sec of sections) {
    rows.push({ y, letter: sec.letter });
    y += 20;
    for (const g of sec.guests) {
      rows.push({ y, name: g.name, table: g.table });
      y += 15;
    }
    y += 5;
  }
  const totalH = y + 20;
  return (
    <svg viewBox={`0 0 280 ${totalH}`} className="w-full h-auto">
      <rect width="280" height={totalH} fill="white" />
      <text x={140} y={18} textAnchor="middle" fontSize="13" fill="#555" fontFamily="serif" fontStyle="italic" fontWeight="500">Guest List</text>
      <line x1={20} y1={24} x2={260} y2={24} stroke="#e5e7eb" strokeWidth="0.8" />
      <text x={20} y={36} fontSize="8" fill="#9ca3af">Name</text>
      <text x={252} y={36} textAnchor="end" fontSize="8" fill="#9ca3af">Table</text>
      {rows.map((row, i) => (
        <g key={i}>
          {row.letter && (
            <>
              <rect x={20} y={row.y - 12} width={14} height={14} rx="2" fill="#f3f0f5" />
              <text x={27} y={row.y - 2} textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="700">{row.letter}</text>
              <line x1={36} y1={row.y - 5} x2={260} y2={row.y - 5} stroke="#e5e7eb" strokeWidth="0.5" />
            </>
          )}
          {row.name && (
            <>
              <text x={30} y={row.y} fontSize="8.5" fill="#6b7280">{row.name}</text>
              <text x={252} y={row.y} textAnchor="end" fontSize="8" fill="#9ca3af">{row.table}</text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

// ─── Seating Cards by Table diagram ──────────────────────────────────────────

function TableCardsDiagram() {
  const tables = [
    { num: "1", guests: ["John Adams", "Mary Anderson"] },
    { num: "2", guests: ["Sarah Brown", "James Butler"] },
    { num: "3", guests: ["Lisa Carter", "Grace Evans"] },
    { num: "4", guests: ["Emma Davis", "Paul Green"] },
  ];
  const cardW = 118; const cardH = 76; const gap = 10;
  const cols = 2; const rows2 = 2;
  const totalW = cols * cardW + (cols - 1) * gap + 40;
  const totalH = rows2 * cardH + (rows2 - 1) * gap + 40;
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto">
      <rect width={totalW} height={totalH} fill="white" />
      {tables.map((t, i) => {
        const col = i % cols; const row = Math.floor(i / cols);
        const x = 20 + col * (cardW + gap); const y = 20 + row * (cardH + gap);
        return (
          <g key={i}>
            <rect x={x} y={y} width={cardW} height={cardH} rx="5" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* fold line */}
            <line x1={x} y1={y + cardH / 2} x2={x + cardW} y2={y + cardH / 2} stroke="#f0eaf5" strokeWidth="0.8" strokeDasharray="3 2" />
            {/* table number top half */}
            <text x={x + cardW / 2} y={y + cardH / 2 - 10} textAnchor="middle" fontSize="18" fill="#ddd6e8" fontWeight="700">{t.num}</text>
            <text x={x + cardW / 2} y={y + cardH / 2 - 2} textAnchor="middle" fontSize="7" fill="#c4b5d0">TABLE</text>
            {/* guest names bottom half */}
            {t.guests.map((g, gi) => (
              <text key={gi} x={x + cardW / 2} y={y + cardH / 2 + 14 + gi * 13} textAnchor="middle" fontSize="7.5" fill="#9ca3af" fontFamily="serif">{g}</text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Classic Name Cards diagram ───────────────────────────────────────────────

function NameCardsDiagram() {
  const names = [
    "John Adams", "Mary Anderson", "Sarah Brown", "James Butler",
    "Lisa Carter", "Grace Evans", "Emma Davis", "Paul Green",
  ];
  const cardW = 110; const cardH = 52; const gap = 8;
  const cols = 2; const rows2 = 4;
  const totalW = cols * cardW + (cols - 1) * gap + 40;
  const totalH = rows2 * cardH + (rows2 - 1) * gap + 40;
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto">
      <rect width={totalW} height={totalH} fill="white" />
      {names.map((name, i) => {
        const col = i % cols; const row = Math.floor(i / cols);
        const x = 20 + col * (cardW + gap); const y = 20 + row * (cardH + gap);
        return (
          <g key={i}>
            <rect x={x} y={y} width={cardW} height={cardH} rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* fold line */}
            <line x1={x + 6} y1={y + cardH / 2} x2={x + cardW - 6} y2={y + cardH / 2} stroke="#f0eaf5" strokeWidth="0.7" strokeDasharray="3 2" />
            {/* decorative top */}
            <line x1={x + 14} y1={y + 8} x2={x + cardW - 14} y2={y + 8} stroke="#e9d5f5" strokeWidth="0.6" />
            <text x={x + cardW / 2} y={y + 16} textAnchor="middle" fontSize="8" fill="#c4b5d0" fontStyle="italic">✦</text>
            {/* name */}
            <text x={x + cardW / 2} y={y + cardH / 2 + 12} textAnchor="middle" fontSize="9" fill="#7c6f8a" fontFamily="serif">{name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Table Numbers diagram ────────────────────────────────────────────────────

function TableNumbersDiagram() {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const cardW = 70; const cardH = 88; const gap = 10;
  const cols = 3;
  const totalW = cols * cardW + (cols - 1) * gap + 40;
  const totalH = 3 * cardH + 2 * gap + 40;
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} className="w-full h-auto">
      <rect width={totalW} height={totalH} fill="white" />
      {numbers.map((n, i) => {
        const col = i % cols; const row = Math.floor(i / cols);
        const x = 20 + col * (cardW + gap); const y = 20 + row * (cardH + gap);
        const cx2 = x + cardW / 2;
        return (
          <g key={i}>
            <rect x={x} y={y} width={cardW} height={cardH} rx="5" fill="white" stroke="#e5e7eb" strokeWidth="1" />
            {/* fold line */}
            <line x1={x + 4} y1={y + cardH / 2} x2={x + cardW - 4} y2={y + cardH / 2} stroke="#f0eaf5" strokeWidth="0.7" strokeDasharray="3 2" />
            {/* top half: number */}
            <text x={cx2} y={y + cardH / 2 - 8} textAnchor="middle" fontSize="28" fill="#ddd6e8" fontWeight="700" fontFamily="serif">{n}</text>
            {/* bottom half: mirrored */}
            <g transform={`rotate(180, ${cx2}, ${y + cardH * 0.75})`}>
              <text x={cx2} y={y + cardH / 2 + 10 + 28 / 2} textAnchor="middle" fontSize="28" fill="#ede9f4" fontWeight="700" fontFamily="serif">{n}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Reception Menu diagram ───────────────────────────────────────────────────

function ReceptionMenuDiagram() {
  return (
    <svg viewBox="0 0 280 400" className="w-full h-auto">
      <rect width="280" height="400" fill="white" />
      {/* Decorative border */}
      <rect x={14} y={14} width={252} height={372} rx="3" fill="none" stroke="#e9d5f5" strokeWidth="1" />
      <rect x={20} y={20} width={240} height={360} rx="2" fill="none" stroke="#f3e8ff" strokeWidth="0.5" />
      {/* Header */}
      <text x={140} y={55} textAnchor="middle" fontSize="9" fill="#c4b5d0" letterSpacing="3">RECEPTION</text>
      <text x={140} y={76} textAnchor="middle" fontSize="22" fill="#7c6f8a" fontFamily="serif" fontStyle="italic">Menu</text>
      <line x1={60} y1={86} x2={220} y2={86} stroke="#e9d5f5" strokeWidth="0.8" />
      <text x={140} y={98} textAnchor="middle" fontSize="7" fill="#c4b5d0" letterSpacing="1">✦ ✦ ✦</text>
      {/* Appetizer */}
      <text x={140} y={118} textAnchor="middle" fontSize="8" fill="#9ca3af" letterSpacing="2">APPETIZER</text>
      <text x={140} y={132} textAnchor="middle" fontSize="9" fill="#7c6f8a" fontFamily="serif">Garden Salad</text>
      <text x={140} y={144} textAnchor="middle" fontSize="8" fill="#bbb" fontStyle="italic">with vinaigrette dressing</text>
      <line x1={80} y1={154} x2={200} y2={154} stroke="#f3e8ff" strokeWidth="0.5" />
      {/* Main */}
      <text x={140} y={172} textAnchor="middle" fontSize="8" fill="#9ca3af" letterSpacing="2">MAIN COURSE</text>
      <text x={140} y={186} textAnchor="middle" fontSize="9" fill="#7c6f8a" fontFamily="serif">Grilled Salmon</text>
      <text x={140} y={198} textAnchor="middle" fontSize="8" fill="#bbb" fontStyle="italic">with lemon butter sauce</text>
      <text x={140} y={216} textAnchor="middle" fontSize="9" fill="#7c6f8a" fontFamily="serif">Roasted Chicken</text>
      <text x={140} y={228} textAnchor="middle" fontSize="8" fill="#bbb" fontStyle="italic">with herb jus</text>
      <line x1={80} y1={238} x2={200} y2={238} stroke="#f3e8ff" strokeWidth="0.5" />
      {/* Dessert */}
      <text x={140} y={256} textAnchor="middle" fontSize="8" fill="#9ca3af" letterSpacing="2">DESSERT</text>
      <text x={140} y={270} textAnchor="middle" fontSize="9" fill="#7c6f8a" fontFamily="serif">Wedding Cake</text>
      <text x={140} y={282} textAnchor="middle" fontSize="8" fill="#bbb" fontStyle="italic">vanilla & raspberry</text>
      <line x1={80} y1={292} x2={200} y2={292} stroke="#f3e8ff" strokeWidth="0.5" />
      {/* Beverages */}
      <text x={140} y={310} textAnchor="middle" fontSize="8" fill="#9ca3af" letterSpacing="2">BEVERAGES</text>
      <text x={140} y={324} textAnchor="middle" fontSize="9" fill="#7c6f8a" fontFamily="serif">Wine · Champagne</text>
      <text x={140} y={338} textAnchor="middle" fontSize="8" fill="#bbb" fontStyle="italic">Soft drinks & coffee</text>
      {/* Footer */}
      <text x={140} y={362} textAnchor="middle" fontSize="7" fill="#ddd6e8" letterSpacing="1">✦ ✦ ✦</text>
    </svg>
  );
}

// ─── Atlas helpers ─────────────────────────────────────────────────────────────

function buildGuestTableMap(layouts: Layout[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const layout of layouts) {
    for (const table of layout.tables) {
      for (const gid of table.guestIds) {
        map.set(gid, table.name);
      }
    }
  }
  return map;
}

// ─── Alphabetical Atlas Panel (real data, matches reference design) ───────────

function AlphabeticalAtlasPanel({
  guests,
  layouts,
  onEditLayout,
}: {
  guests: Guest[];
  layouts: Layout[];
  onEditLayout: () => void;
}) {
  const tableMap = buildGuestTableMap(layouts);

  // Sort alphabetically by last name then first name
  const sorted = [...guests].sort((a, b) => {
    const la = (a.lastName || a.firstName).toLowerCase();
    const lb = (b.lastName || b.firstName).toLowerCase();
    return la.localeCompare(lb);
  });

  // Group by first letter of last name (or first name if no last name)
  const grouped: Record<string, Guest[]> = {};
  for (const g of sorted) {
    const key = ((g.lastName || g.firstName)[0] || "#").toUpperCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(g);
  }
  const letters = Object.keys(grouped).sort();
  const seatedCount = guests.filter(g => tableMap.has(g.id)).length;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Page subtitle */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">Alphabetical Guest Atlas</h2>
        <p className="text-sm text-gray-400">This layout is automatically generated from the reception layout.</p>
      </div>

      {/* Printable document card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Document header */}
        <div className="border-b border-gray-100 px-8 py-6 text-center">
          <h3 className="font-serif text-2xl text-gray-700" style={{ fontStyle: "italic" }}>
            Please find your seat!
          </h3>
          <p className="mt-1 text-xs text-gray-400">Event date</p>
          <p className="text-xs text-gray-400">Bride name &amp; Groom name</p>
        </div>

        {/* Guest columns */}
        {guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-400">No guests yet.</p>
            <p className="mt-1 text-xs text-gray-400">Add guests from the Guest List page to see them here.</p>
          </div>
        ) : (
          <div
            className="px-8 py-6"
            style={{ columns: 4, columnGap: "28px", columnRuleWidth: 0 }}
          >
            {letters.map(letter => (
              <div key={letter} className="mb-4 break-inside-avoid">
                {/* Letter header */}
                <div className="mb-1 border-b border-gray-200 pb-0.5">
                  <span className="text-xs font-bold text-purple-700">{letter}</span>
                </div>
                {/* Guests in this section */}
                {grouped[letter].map(g => {
                  const displayName = g.lastName
                    ? `${g.lastName}, ${g.firstName}`
                    : g.firstName;
                  const tableLabel = tableMap.has(g.id)
                    ? tableMap.get(g.id)!
                    : g.tableNumber != null
                    ? String(g.tableNumber)
                    : "—";
                  return (
                    <div
                      key={g.id}
                      className="flex items-baseline gap-0.5 text-[11px] leading-[1.6] text-gray-600"
                    >
                      <span className="shrink-0 max-w-[60%] truncate">{displayName}</span>
                      <span
                        className="min-w-0 flex-1 overflow-hidden text-gray-300"
                        style={{ letterSpacing: "0.08em" }}
                      >
                        {" "}............
                      </span>
                      <span className="shrink-0 text-gray-500">{tableLabel}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit link + paper size */}
      <div className="mt-4 text-center">
        <button
          onClick={onEditLayout}
          className="text-sm font-medium text-purple-600 underline underline-offset-2 hover:text-purple-800 transition-colors"
        >
          Click here to edit layout
        </button>
        <p className="mt-1 text-xs text-gray-400">A1 landscape 33.1 inch × 23.4 inch</p>
      </div>

      {/* Stats */}
      <div className="mt-3 text-center text-sm text-gray-600">
        <p>Total {guests.length} guests</p>
        <p className="mt-0.5">Seated {seatedCount} guests</p>
        {seatedCount < guests.length && (
          <button
            onClick={onEditLayout}
            className="mt-1 text-xs text-purple-500 underline underline-offset-1 hover:text-purple-700"
          >
            Let&apos;s seat more guests on the layout
          </button>
        )}
      </div>

      {/* Download + arrow */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4 text-purple-500" />
          Download PDF file
        </button>
        <span className="text-xs text-gray-400">←</span>
      </div>
    </div>
  );
}

// ─── Table config ─────────────────────────────────────────────────────────────

const TABLE_TYPES: { type: TableType; label: string; defaultSeats: number }[] = [
  { type: "ROUND",       label: "Round",       defaultSeats: 8  },
  { type: "RECTANGULAR", label: "Rectangular", defaultSeats: 10 },
  { type: "SQUARE",      label: "Square",      defaultSeats: 8  },
  { type: "OBLONG",      label: "Oblong",      defaultSeats: 12 },
  { type: "HALF_ROUND",  label: "Half-Round",  defaultSeats: 6  },
  { type: "CHAIRS_ROW",  label: "Row",         defaultSeats: 10 },
  { type: "BUFFET",      label: "Buffet",      defaultSeats: 0  },
];

const SeatingCanvas = dynamic(() => import("@/components/planner/seating-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-stone-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
    </div>
  ),
});

// ─── Guest assign modal ───────────────────────────────────────────────────────

function AssignModal({ table, allGuests, onClose, onSave }: {
  table: SeatTable; allGuests: Guest[]; onClose: () => void; onSave: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(table.guestIds);
  const [search, setSearch] = useState("");
  const filtered = allGuests.filter(g =>
    !search || `${g.firstName} ${g.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );
  function toggle(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < table.seats ? [...prev, id] : prev
    );
  }
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Assign Guests — {table.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{selected.length} of {table.seats} seats filled</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 pt-3">
          <div className="h-1.5 rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${(selected.length / Math.max(table.seats, 1)) * 100}%` }} />
          </div>
        </div>
        <div className="px-5 pt-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
          {filtered.length === 0 && <p className="py-6 text-center text-xs text-gray-400">No guests found</p>}
          {filtered.map(g => {
            const isSelected = selected.includes(g.id);
            const isFull = !isSelected && selected.length >= table.seats;
            return (
              <button key={g.id} onClick={() => toggle(g.id)} disabled={isFull}
                className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                  isSelected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700",
                  isFull && "opacity-40 cursor-not-allowed"
                )}>
                <div className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all",
                  isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-300")}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <span className="flex-1 text-sm">{[g.title, g.firstName, g.lastName].filter(Boolean).join(" ")}</span>
                <span className={cn("text-[10px] font-medium",
                  g.rsvpStatus === "ATTENDING" ? "text-green-500" : g.rsvpStatus === "NOT_ATTENDING" ? "text-red-400" : "text-gray-400")}>
                  {g.rsvpStatus === "ATTENDING" ? "✓" : g.rsvpStatus === "NOT_ATTENDING" ? "✗" : "?"}
                </span>
                <span className={cn("text-[10px]", g.side === "BRIDE" ? "text-rose-400" : "text-blue-400")}>
                  {g.side === "BRIDE" ? "B" : "G"}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 border-t border-gray-100 p-4">
          <button onClick={() => setSelected([])} className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">Clear all</button>
          <button onClick={() => onSave(selected)} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save assignment</button>
        </div>
      </div>
    </>
  );
}

// ─── Table icon + type picker ─────────────────────────────────────────────────

function TableIcon({ type, size = 16 }: { type: TableType; size?: number }) {
  const s = { width: size, height: size };
  if (type === "ROUND" || type === "HALF_ROUND") return <Circle style={s} className="flex-shrink-0 text-gray-500" />;
  if (type === "SQUARE") return <Square style={s} className="flex-shrink-0 text-gray-500" />;
  return <RectangleHorizontal style={s} className="flex-shrink-0 text-gray-500" />;
}

function TableTypePicker({ onAdd }: { onAdd: (type: TableType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
        <Plus className="h-3.5 w-3.5" /> Add Table <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            {TABLE_TYPES.map(tt => (
              <button key={tt.type} onClick={() => { onAdd(tt.type); setOpen(false); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <TableIcon type={tt.type} />
                {tt.label}
                <span className="ml-auto text-xs text-gray-400">{tt.defaultSeats > 0 ? `${tt.defaultSeats} seats` : "—"}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeatingPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const local = isLocal(projectId);

  const [activeTab, setActiveTab] = useState("reception");
  const [editMode, setEditMode] = useState(false);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<SeatTable | null>(null);
  const [creatingLayout, setCreatingLayout] = useState(false);

  const stageRef = useRef<{ downloadImage: () => void } | null>(null);
  const activeLayout = layouts.find(l => l.id === activeLayoutId) ?? null;

  // Sync tab with URL ?tab= param (read on mount, write on change)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && TABS.some(t => t.id === tab)) setActiveTab(tab);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === "reception") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    const newSearch = params.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
    window.history.replaceState(null, "", newUrl);
  }, [activeTab]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (local) {
        setLayouts(getLocalSeatingLayouts(projectId) as Layout[]);
        setGuests(getLocalGuests(projectId) as unknown as Guest[]);
      } else {
        const [seatingData, guestData] = await Promise.all([
          apiFetch(`/api/planner/projects/${projectId}/seating`),
          apiFetch(`/api/planner/projects/${projectId}/guests`),
        ]);
        setLayouts(seatingData.layouts ?? []);
        setGuests(guestData.guests ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load seating data");
    } finally {
      setLoading(false);
    }
  }, [projectId, local]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!activeLayoutId && layouts.length > 0) setActiveLayoutId(layouts[0].id);
  }, [layouts, activeLayoutId]);

  async function createLayout(type: LayoutType) {
    setCreatingLayout(true);
    try {
      const name = type === "CEREMONY" ? "Ceremony" : "Reception";
      if (local) {
        const l = addLocalSeatingLayout(projectId, { name, type });
        setLayouts(prev => [...prev, l as Layout]);
        setActiveLayoutId(l.id);
      } else {
        const data = await apiFetch(`/api/planner/projects/${projectId}/seating`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type }),
        });
        setLayouts(prev => [...prev, data.layout]);
        setActiveLayoutId(data.layout.id);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to create layout"); }
    setCreatingLayout(false);
  }

  async function deleteLayout(layoutId: string) {
    if (!confirm("Delete this layout and all its tables?")) return;
    try {
      if (local) deleteLocalSeatingLayout(projectId, layoutId);
      else await apiFetch(`/api/planner/projects/${projectId}/seating/${layoutId}`, { method: "DELETE" });
      setLayouts(prev => prev.filter(l => l.id !== layoutId));
      if (activeLayoutId === layoutId) setActiveLayoutId(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to delete layout"); }
  }

  async function addTable(type: TableType) {
    if (!activeLayoutId) return;
    const cfg = TABLE_TYPES.find(t => t.type === type) ?? TABLE_TYPES[0];
    const data = {
      name: `Table ${(activeLayout?.tables.length ?? 0) + 1}`,
      type, seats: cfg.defaultSeats,
      x: 150 + Math.random() * 300, y: 150 + Math.random() * 200,
      rotation: 0, color: "#ffffff", guestIds: [],
    };
    try {
      if (local) {
        const t = addLocalSeatingTable(projectId, activeLayoutId, data);
        setLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tables: [...l.tables, t as SeatTable] } : l));
      } else {
        const res = await apiFetch(`/api/planner/projects/${projectId}/seating/${activeLayoutId}/tables`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        setLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tables: [...l.tables, res.table] } : l));
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to add table"); }
  }

  async function moveTable(tableId: string, x: number, y: number) {
    if (!activeLayoutId) return;
    setLayouts(prev => prev.map(l =>
      l.id === activeLayoutId ? { ...l, tables: l.tables.map(t => t.id === tableId ? { ...t, x, y } : t) } : l
    ));
    try {
      if (local) updateLocalSeatingTable(projectId, activeLayoutId, tableId, { x, y });
      else await apiFetch(`/api/planner/projects/${projectId}/seating/${activeLayoutId}/tables/${tableId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ x, y }),
      });
    } catch { /* silent */ }
  }

  async function deleteTable(tableId: string) {
    if (!activeLayoutId) return;
    setLayouts(prev => prev.map(l => l.id === activeLayoutId ? { ...l, tables: l.tables.filter(t => t.id !== tableId) } : l));
    setSelectedTableId(null);
    try {
      if (local) deleteLocalSeatingTable(projectId, activeLayoutId, tableId);
      else await apiFetch(`/api/planner/projects/${projectId}/seating/${activeLayoutId}/tables/${tableId}`, { method: "DELETE" });
    } catch { await loadData(); }
  }

  async function saveGuestAssignment(tableId: string, guestIds: string[]) {
    if (!activeLayoutId) return;
    setLayouts(prev => prev.map(l =>
      l.id === activeLayoutId ? { ...l, tables: l.tables.map(t => t.id === tableId ? { ...t, guestIds } : t) } : l
    ));
    setAssignModal(null);
    try {
      if (local) updateLocalSeatingTable(projectId, activeLayoutId, tableId, { guestIds });
      else await apiFetch(`/api/planner/projects/${projectId}/seating/${activeLayoutId}/tables/${tableId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestIds }),
      });
    } catch { await loadData(); }
  }

  function guestName(guestId: string) {
    const g = guests.find(x => x.id === guestId);
    return g ? [g.title, g.firstName, g.lastName].filter(Boolean).join(" ") : guestId;
  }

  const selectedTable = activeLayout?.tables.find(t => t.id === selectedTableId) ?? null;
  const totalSeated   = activeLayout?.tables.reduce((s, t) => s + t.guestIds.length, 0) ?? 0;
  const totalCapacity = activeLayout?.tables.reduce((s, t) => s + t.seats, 0) ?? 0;

  // ── Canvas editor mode ───────────────────────────────────────────────────────

  if (editMode) {
    // Auto-create a layout if none exists
    const editorLayouts = layouts;

    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(false)}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <span className="text-gray-200">|</span>
            {editorLayouts.map(l => (
              <button key={l.id} onClick={() => { setActiveLayoutId(l.id); setSelectedTableId(null); }}
                className={cn("group relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  l.id === activeLayoutId ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50"
                )}>
                {l.type === "CEREMONY" ? "⛪" : "🥂"} {l.name}
                <span onClick={e => { e.stopPropagation(); deleteLayout(l.id); }}
                  className="ml-1 hidden cursor-pointer rounded p-0.5 text-gray-400 hover:text-red-400 group-hover:flex">
                  <X className="h-3 w-3" />
                </span>
              </button>
            ))}
            <button onClick={() => createLayout(editorLayouts.some(l => l.type === "CEREMONY") ? "RECEPTION" : "CEREMONY")}
              className="ml-1 rounded-lg px-2 py-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {activeLayout && (
              <>
                <span className="hidden text-xs text-gray-400 sm:block">
                  <Users className="inline h-3.5 w-3.5 mr-1" />{totalSeated}/{totalCapacity} seated
                </span>
                <TableTypePicker onAdd={addTable} />
                <button onClick={() => stageRef.current?.downloadImage()}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <Download className="h-3.5 w-3.5" /><span className="hidden sm:block">PNG</span>
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="mx-4 mt-2 rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600">{error}</div>}

        {/* Empty state */}
        {!loading && editorLayouts.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800">No seating layouts yet</h2>
              <p className="mt-1 text-sm text-gray-400">Create a layout to start arranging tables.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => createLayout("CEREMONY")} disabled={creatingLayout}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                ⛪ Ceremony Layout
              </button>
              <button onClick={() => createLayout("RECEPTION")} disabled={creatingLayout}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
                🥂 Reception Layout
              </button>
            </div>
          </div>
        )}

        {/* Canvas editor */}
        {activeLayout && (
          <div className="flex flex-1 overflow-hidden">
            <div className="relative flex-1 overflow-hidden bg-stone-100">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
                </div>
              ) : (
                <SeatingCanvas
                  ref={stageRef}
                  layout={activeLayout}
                  guests={guests}
                  selectedTableId={selectedTableId}
                  onSelectTable={setSelectedTableId}
                  onMoveTable={moveTable}
                  onAssignGuests={table => setAssignModal(table as SeatTable)}
                />
              )}
            </div>
            <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-gray-100 bg-white">
              {selectedTable ? (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-800">{selectedTable.name}</h3>
                    <button onClick={() => deleteTable(selectedTable.id)}
                      className="rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mb-3 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Type</span><span className="font-medium text-gray-700 capitalize">{selectedTable.type.toLowerCase().replace("_", " ")}</span></div>
                    <div className="flex justify-between"><span>Seats</span><span className="font-medium text-gray-700">{selectedTable.seats}</span></div>
                    <div className="flex justify-between"><span>Assigned</span><span className="font-medium text-gray-700">{selectedTable.guestIds.length}</span></div>
                  </div>
                  <button onClick={() => setAssignModal(selectedTable)}
                    className="w-full rounded-xl bg-indigo-50 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
                    <Users className="mr-1.5 inline h-3.5 w-3.5" /> Assign Guests
                  </button>
                  {selectedTable.guestIds.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Seated</p>
                      <div className="space-y-1">
                        {selectedTable.guestIds.map(gid => (
                          <div key={gid} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />{guestName(gid)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Tables</p>
                  {activeLayout.tables.length === 0 ? (
                    <p className="py-6 text-center text-xs text-gray-400">Click &quot;Add Table&quot; to start.</p>
                  ) : (
                    <div className="space-y-1">
                      {activeLayout.tables.map(t => (
                        <button key={t.id} onClick={() => setSelectedTableId(t.id)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-gray-50">
                          <TableIcon type={t.type} />
                          <span className="flex-1 font-medium text-gray-700">{t.name}</span>
                          <span className="text-gray-400">{t.guestIds.length}/{t.seats}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {activeLayout.tables.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs">
                      <div className="flex justify-between text-gray-500"><span>Tables</span><span className="font-medium text-gray-700">{activeLayout.tables.length}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Capacity</span><span className="font-medium text-gray-700">{totalCapacity}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Seated</span><span className="font-medium text-green-600">{totalSeated}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Empty seats</span><span className="font-medium text-gray-700">{totalCapacity - totalSeated}</span></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {assignModal && (
          <AssignModal
            table={assignModal} allGuests={guests}
            onClose={() => setAssignModal(null)}
            onSave={ids => saveGuestAssignment(assignModal.id, ids)}
          />
        )}
      </div>
    );
  }

  // ── Preview / reference design mode ──────────────────────────────────────────

  const activeTabIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <div className="min-h-full bg-[#ede9f0] px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Seating Chart &amp; Supplies</h1>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-gray-500">
            These tools make it easy to design your seating chart and all the related details.
            Everything is connected through your guest list, so changes update automatically.
          </p>
        </div>

        {/* Tab cards */}
        <div className="grid grid-cols-7 gap-2">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-xl border px-2 py-3 text-center text-xs leading-snug transition-colors",
                activeTab === tab.id
                  ? "border-gray-700 bg-white font-semibold text-gray-800 shadow-sm"
                  : "border-gray-200 bg-white/70 text-gray-500 hover:bg-white hover:text-gray-700"
              )}
            >
              {tab.lines.map((line, li) => <div key={li}>{line}</div>)}
            </button>
          ))}
        </div>

        {/* Dashed curve connector */}
        <TabConnector tabIndex={activeTabIndex} />

        {/* Tab content */}
        {activeTab === "ceremony" && (
          <LayoutPanel
            title="Ceremony Layout"
            subtitle="Prepare and print your ceremony layout."
            diagram={<CeremonyDiagram />}
            onEdit={() => setEditMode(true)}
          />
        )}
        {activeTab === "reception" && (
          <LayoutPanel
            title="Reception Layout"
            subtitle="Prepare and print your reception layout."
            diagram={<ReceptionDiagram />}
            onEdit={() => setEditMode(true)}
          />
        )}
        {activeTab === "atlas" && (
          <AlphabeticalAtlasPanel
            guests={guests}
            layouts={layouts}
            onEditLayout={() => setEditMode(true)}
          />
        )}
        {activeTab === "cards" && (
          <LayoutPanel
            title="Seating Cards by Table"
            subtitle="Print folded seating cards grouped by table for easy distribution."
            diagram={<TableCardsDiagram />}
            onEdit={() => setEditMode(true)}
          />
        )}
        {activeTab === "name-cards" && (
          <LayoutPanel
            title="Classic Name Cards"
            subtitle="Print elegant tent-fold name cards for each guest."
            diagram={<NameCardsDiagram />}
            onEdit={() => setEditMode(true)}
          />
        )}
        {activeTab === "table-numbers" && (
          <LayoutPanel
            title="Table Numbers"
            subtitle="Print double-sided table number cards for every table."
            diagram={<TableNumbersDiagram />}
            onEdit={() => setEditMode(true)}
          />
        )}
        {activeTab === "menu" && (
          <LayoutPanel
            title="Reception Menu"
            subtitle="Print a beautiful menu card for each guest at the reception."
            diagram={<ReceptionMenuDiagram />}
            onEdit={() => setEditMode(true)}
          />
        )}

      </div>
    </div>
  );
}
