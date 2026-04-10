"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Users, Download, X, ChevronDown, ChevronLeft, ChevronRight, Eye, UtensilsCrossed, Lock } from "lucide-react";
import { usePlannerTier, isPremiumOrElite, isElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";
import { cn } from "@/lib/utils";
import { CeremonyDiagram, ReceptionDiagram } from "@/components/planner/venue-diagrams";
import {
  getLocalSeatingLayouts, LocalSeatingLayout, LocalSeatingTable,
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
  dietary?: string | null;
}

const isLocal = (id: string) => id.startsWith("local-");
async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
  return res.json();
}

// ─── Inspiration gallery photos per tab ───────────────────────────────────────

const GALLERY: Record<string, string[]> = {
  ceremony: [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=384&h=352&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=384&h=352&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=384&h=352&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=384&h=352&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=384&h=352&fit=crop&q=80",
  ],
  reception: [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=192&h=256&fit=crop&q=80",
  ],
  cards: [
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524824267900-2b3a7db14ee5?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=192&h=256&fit=crop&q=80",
  ],
  "name-cards": [
    "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524824267900-2b3a7db14ee5?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=192&h=256&fit=crop&q=80",
  ],
  "table-numbers": [
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=192&h=256&fit=crop&q=80",
  ],
  menu: [
    "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=192&h=256&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=192&h=256&fit=crop&q=80",
  ],
};

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

// Elite-only stationery tabs
const ELITE_TABS = ["name-cards", "table-numbers", "menu"];

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

// ─── Ceremony layout preview (renders saved localStorage elements) ────────────

interface PreviewElement {
  id: string;
  kind: "arch" | "aisle" | "row"
    | "table-long" | "table-square" | "table-round" | "table-ellipse" | "table-halfround"
    | "buffet-long" | "buffet-square" | "buffet-round" | "buffet-ellipse"
    | "asset";
  x: number; y: number; width: number; height?: number; angle: number;
  seats?: number; spacing?: number; name?: string; borderColor?: string;
  guestIds?: (string | null)[];
  assetType?: string;
}

const PREV_W = 590;
const PREV_H = 1010;
const PREV_CHAIR_R = 11;
function prevSpPx(s: number) { return s * 0.62; }

function CeremonyLayoutPreview({ elements, guests, svgId = "ceremony-layout-svg", venueImage, venueOpacity = 0.35 }: { elements: PreviewElement[]; guests?: { id: string; firstName: string; lastName: string | null }[]; svgId?: string; venueImage?: string | null; venueOpacity?: number }) {
  function guestLabel(guestIds: (string | null)[] | undefined, i: number): string {
    if (!guests || !guestIds) return `${i + 1}`;
    const gid = guestIds[i];
    if (!gid) return `${i + 1}`;
    const g = guests.find(x => x.id === gid);
    return g ? g.firstName.slice(0, 5) : `${i + 1}`;
  }

  function prevTableSeats(kind: string, w: number, h: number, n: number): { cx: number; cy: number }[] {
    const pos: { cx: number; cy: number }[] = [];
    const PAD = 18;
    if (kind === "table-long") {
      const half = Math.ceil(n / 2); const rest = n - half;
      for (let i = 0; i < half; i++) pos.push({ cx: (i + 0.5) * (w / half), cy: -PAD });
      for (let i = 0; i < rest; i++) pos.push({ cx: (i + 0.5) * (w / rest), cy: h + PAD });
    } else if (kind === "table-round") {
      const r = w / 2 + PAD;
      for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI - Math.PI / 2; pos.push({ cx: w / 2 + r * Math.cos(a), cy: h / 2 + r * Math.sin(a) }); }
    } else if (kind === "table-ellipse") {
      for (let i = 0; i < n; i++) { const a = (i / n) * 2 * Math.PI - Math.PI / 2; pos.push({ cx: w / 2 + (w / 2 + PAD) * Math.cos(a), cy: h / 2 + (h / 2 + PAD) * Math.sin(a) }); }
    } else if (kind === "table-square") {
      const ps = Math.ceil(n / 4);
      const sides = [
        ...Array.from({ length: ps }, (_, i) => ({ cx: (i + 0.5) * (w / ps), cy: -PAD })),
        ...Array.from({ length: ps }, (_, i) => ({ cx: w + PAD, cy: (i + 0.5) * (h / ps) })),
        ...Array.from({ length: ps }, (_, i) => ({ cx: w - (i + 0.5) * (w / ps), cy: h + PAD })),
        ...Array.from({ length: ps }, (_, i) => ({ cx: -PAD, cy: h - (i + 0.5) * (h / ps) })),
      ];
      pos.push(...sides.slice(0, n));
    } else if (kind === "table-halfround") {
      const r = w / 2 + PAD;
      for (let i = 0; i < n; i++) { const a = Math.PI + (i / Math.max(n - 1, 1)) * Math.PI; pos.push({ cx: w / 2 + r * Math.cos(a), cy: h / 2 + r * Math.sin(a) }); }
    }
    return pos;
  }

  return (
    <svg id={svgId} viewBox={`0 0 ${PREV_W} ${PREV_H}`} className="w-full h-auto">
      <rect width={PREV_W} height={PREV_H} fill="white" />
      {venueImage && (
        <image href={venueImage} x={0} y={0} width={PREV_W} height={PREV_H} preserveAspectRatio="xMidYMid meet" opacity={venueOpacity} />
      )}
      <defs>
        <linearGradient id="pvAg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fdf4ec" stopOpacity="0.7" />
          <stop offset="50%"  stopColor="#fdf4ec" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fdf4ec" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {elements.map(el => {
        if (el.kind === "arch") {
          const w = el.width;
          const h = Math.round(w * 1.05);
          const mx = w / 2;
          const aw = w * 0.33;
          const ax0 = mx - aw / 2;
          const ax1 = mx + aw / 2;
          const baseY = h * 0.9;
          const peakY = h * 0.12;
          const c = el.borderColor || "#111";
          return (
            <g key={el.id} transform={`translate(${el.x},${el.y})`}>
              <path d={`M${ax0-9} ${baseY} L${ax0-9} ${baseY-(baseY-peakY)*0.72} Q${ax0-9} ${peakY-18} ${mx} ${peakY-18} Q${ax1+9} ${peakY-18} ${ax1+9} ${baseY-(baseY-peakY)*0.72} L${ax1+9} ${baseY}`} fill="none" stroke={c} strokeWidth="2.5" />
              <path d={`M${ax0+7} ${baseY} L${ax0+7} ${baseY-(baseY-peakY)*0.58} Q${ax0+7} ${peakY+12} ${mx} ${peakY+12} Q${ax1-7} ${peakY+12} ${ax1-7} ${baseY-(baseY-peakY)*0.58} L${ax1-7} ${baseY}`} fill="none" stroke={c} strokeWidth="2" />
            </g>
          );
        }
        if (el.kind === "aisle") {
          const h = el.height ?? 200;
          const cx2 = el.x + el.width / 2;
          const cy2 = el.y + h / 2;
          return (
            <g key={el.id} transform={el.angle ? `rotate(${el.angle},${cx2},${cy2})` : undefined}>
              <rect x={el.x} y={el.y} width={el.width} height={h} fill="url(#pvAg)" />
              {el.name && (
                <text x={cx2} y={cy2} textAnchor="middle" fontSize="11" fill="#bbb" fontFamily="serif" fontStyle="italic">{el.name}</text>
              )}
            </g>
          );
        }
        if (el.kind === "row") {
          const seats = el.seats ?? 5;
          const sp = prevSpPx(el.spacing ?? 60);
          const rowW = (seats - 1) * sp + PREV_CHAIR_R * 2;
          const pivotX = el.x + rowW / 2;
          const pivotY = el.y + PREV_CHAIR_R;
          return (
            <g key={el.id} transform={el.angle ? `rotate(${el.angle},${pivotX},${pivotY})` : undefined}>
              <line x1={el.x + PREV_CHAIR_R} y1={el.y + PREV_CHAIR_R} x2={el.x + rowW - PREV_CHAIR_R} y2={el.y + PREV_CHAIR_R} stroke="#e5e7eb" strokeWidth="1" />
              {Array.from({ length: seats }, (_, i) => {
                const cx2 = el.x + PREV_CHAIR_R + i * sp;
                const cy2 = el.y + PREV_CHAIR_R;
                const label = guestLabel(el.guestIds, i);
                const hasGuest = el.guestIds?.[i];
                return (
                  <g key={i}>
                    <circle cx={cx2} cy={cy2} r={PREV_CHAIR_R} fill="white" stroke={hasGuest ? "#a78bfa" : "#d1d5db"} strokeWidth={hasGuest ? 1.5 : 1.2} />
                    <text x={cx2} y={cy2 + 4} textAnchor="middle" fontSize="8" fill={hasGuest ? "#6d28d9" : "#aaa"}>{label}</text>
                  </g>
                );
              })}
            </g>
          );
        }
        if (el.kind.startsWith("table-")) {
          const w = el.width;
          const h = el.height ?? el.width;
          const seats = el.seats ?? 8;
          const seatPos = prevTableSeats(el.kind, w, h, seats);
          const cx2 = el.x + w / 2;
          const cy2 = el.y + h / 2;
          const tableBody = el.kind === "table-round"
            ? <circle cx={el.x + w / 2} cy={el.y + h / 2} r={w / 2} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />
            : el.kind === "table-ellipse"
            ? <ellipse cx={el.x + w / 2} cy={el.y + h / 2} rx={w / 2} ry={h / 2} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />
            : el.kind === "table-halfround"
            ? <path d={`M${el.x} ${el.y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${el.x + w} ${el.y + w / 2} Z`} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />
            : <rect x={el.x} y={el.y} width={w} height={h} rx="3" fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />;
          return (
            <g key={el.id} transform={el.angle ? `rotate(${el.angle},${cx2},${cy2})` : undefined}>
              {tableBody}
              {seatPos.map((pos, i) => {
                const label = guestLabel(el.guestIds, i);
                const hasGuest = el.guestIds?.[i];
                return (
                  <g key={i}>
                    <circle cx={el.x + pos.cx} cy={el.y + pos.cy} r={PREV_CHAIR_R} fill="white" stroke={hasGuest ? "#a78bfa" : "#d1d5db"} strokeWidth={hasGuest ? 1.5 : 1.2} />
                    <text x={el.x + pos.cx} y={el.y + pos.cy + 4} textAnchor="middle" fontSize="8" fill={hasGuest ? "#6d28d9" : "#aaa"}>{label}</text>
                  </g>
                );
              })}
            </g>
          );
        }
        if (el.kind === "buffet-long" || el.kind === "buffet-square" || el.kind === "buffet-round" || el.kind === "buffet-ellipse") {
          const w = el.width; const h = el.height ?? el.width;
          const cx2 = el.x + w / 2; const cy2 = el.y + h / 2;
          const body = el.kind === "buffet-round"
            ? <circle cx={cx2} cy={cy2} r={w / 2} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />
            : el.kind === "buffet-ellipse"
            ? <ellipse cx={cx2} cy={cy2} rx={w / 2} ry={h / 2} fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />
            : <rect x={el.x} y={el.y} width={w} height={h} rx="3" fill="#f5efe6" stroke="#8b7355" strokeWidth="1.5" />;
          return (
            <g key={el.id} transform={el.angle ? `rotate(${el.angle},${cx2},${cy2})` : undefined}>
              {body}
              <text x={cx2} y={cy2 + 4} textAnchor="middle" fontSize="9" fill="#b0967a">Buffet</text>
            </g>
          );
        }
        if (el.kind === "asset") {
          const w = el.width; const h = el.height ?? w;
          const cx2 = el.x + w / 2; const cy2 = el.y + h / 2;
          return (
            <g key={el.id} transform={el.angle ? `rotate(${el.angle},${cx2},${cy2})` : undefined}>
              <rect x={el.x} y={el.y} width={w} height={h} rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
              <text x={cx2} y={cy2 + 4} textAnchor="middle" fontSize="8" fill="#9ca3af">{el.assetType?.slice(0, 5) ?? ""}</text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
}

// ─── Layout panel (shared structure for ceremony/reception) ───────────────────

function downloadLayoutPDF(svgId: string, title: string) {
  const svgEl = document.getElementById(svgId);
  if (!svgEl) {
    alert("Please open the ceremony tab to load the layout before downloading.");
    return;
  }
  const svgContent = svgEl.outerHTML;
  const printWin = window.open("", "_blank", "width=700,height=1100");
  if (!printWin) { alert("Please allow popups to download the PDF."); return; }
  printWin.document.write(`<!DOCTYPE html>
<html>
<head>
<title>${title}</title>
<style>
  @page { size: A1 portrait; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; display: flex; justify-content: center; }
  svg { width: 100%; height: auto; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
${svgContent}
<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 300);
  });
</script>
</body>
</html>`);
  printWin.document.close();
}

function LayoutPanel({
  title, subtitle, diagram, onEdit, photos = [], wide = false, pdfSvgId,
}: {
  title: string; subtitle: string; diagram: React.ReactNode; onEdit: () => void;
  photos?: string[]; wide?: boolean; pdfSvgId?: string;
}) {
  const [activePhoto, setActivePhoto] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToPhoto(i: number) {
    setActivePhoto(i);
    const el = scrollRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return (
    <div className={cn("mx-auto", wide ? "max-w-3xl" : "max-w-xl")}>
      {/* Title */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>

      {/* Preview card */}
      <div className={cn("mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm", wide ? "w-full" : "max-w-xs")}>
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
        <button
          onClick={() => pdfSvgId ? downloadLayoutPDF(pdfSvgId, title) : window.print()}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4 text-purple-500" />
          Download PDF file
        </button>
        <span className="text-xs text-gray-400">←</span>
      </div>

      {/* Recommendation */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-1.5 text-sm font-semibold text-gray-800">Recommendation</p>
        <p className="text-xs leading-relaxed text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of{" "}
          <span className="text-purple-500">subtly colored, textured card stock or paper.</span>
        </p>
      </div>

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-center text-sm font-medium text-gray-600">
            Elegant {title.toLowerCase()} seating chart
          </h3>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {photos.map((src, i) => (
              <div
                key={i}
                onClick={() => scrollToPhoto(i)}
                className={cn(
                  "relative h-44 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all",
                  wide ? "w-48" : "w-32",
                  i === activePhoto ? "ring-2 ring-purple-400 ring-offset-1 opacity-100" : "opacity-85 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${title} inspiration ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPhoto(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activePhoto ? "w-5 bg-gray-600" : "w-1.5 bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      )}
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

// ─── Seating Cards by Table — full panel (reference design) ──────────────────

function ClipboardHanger() {
  return (
    <svg width="110" height="34" viewBox="0 0 110 34">
      <path d="M 32 32 Q 32 7 55 7 Q 78 7 78 32"
        stroke="#d1d5db" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="15" y1="32" x2="95" y2="32"
        stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SeatingCardsPanel({
  tables, currentIndex, onPrev, onNext, onEdit,
}: {
  tables: { name: string; guestNames: string[] }[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
}) {
  const fallback = { name: "Table 1", guestNames: Array.from({ length: 6 }, (_, j) => `Guest name ${j + 1}`) };
  const table = tables[currentIndex] ?? fallback;
  const total = tables.length;
  const numDisplay = /^Table\s+\S+$/i.test(table.name)
    ? table.name.replace(/^Table\s+/i, "")
    : table.name;

  return (
    <div className="mx-auto max-w-sm">
      {/* Title */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">Seating Cards by Table</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-gray-400">
          Create and print table cards using the seating plan, then place them on the
          seating board to help guests quickly find where they&apos;re seated.
        </p>
      </div>

      {/* Card + left/right arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex-shrink-0 rounded-full bg-white p-2.5 shadow-md transition-all hover:bg-gray-50 disabled:opacity-20"
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>

        <div className="flex flex-1 flex-col items-center">
          {/* Hanger decoration */}
          <ClipboardHanger />

          {/* Card body */}
          <div
            className="w-full rounded-2xl border border-gray-200 bg-white px-8 pb-8 pt-5 text-center shadow-lg"
            style={{ marginTop: -2 }}
          >
            {/* Load Dancing Script font inline */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600&display=swap');`}</style>

            {/* "Table" in script */}
            <div
              style={{
                fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
                fontSize: 52,
                fontWeight: 400,
                color: "#1a1a2e",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              Table
            </div>

            {/* Number / name — large bold */}
            <div
              style={{
                fontFamily: "sans-serif",
                fontSize: numDisplay.length <= 3 ? 68 : 28,
                fontWeight: 800,
                color: "#1a1a2e",
                lineHeight: 1,
                marginBottom: 14,
              }}
            >
              {numDisplay}
            </div>

            {/* Divider */}
            <div className="mx-auto mb-4 w-3/4 border-t border-gray-200" />

            {/* Guest names */}
            <div className="space-y-1">
              {table.guestNames.map((name, i) => (
                <div key={i} style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#6b7280" }}>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onNext}
          disabled={total === 0 || currentIndex >= total - 1}
          className="flex-shrink-0 rounded-full bg-white p-2.5 shadow-md transition-all hover:bg-gray-50 disabled:opacity-20"
        >
          <ChevronRight className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Edit link + format */}
      <div className="mt-5 text-center">
        <button
          onClick={onEdit}
          className="text-sm font-medium text-purple-600 underline underline-offset-2 transition-colors hover:text-purple-800"
        >
          Click here to edit layout
        </button>
        <p className="mt-1 text-xs text-gray-400">Format 4.33 inch × 7.87 inch</p>
        {total > 0 && (
          <p className="mt-0.5 text-xs text-gray-400">Total {total} table card{total !== 1 ? "s" : ""}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-4 flex flex-col items-center gap-2.5">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-5 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
        >
          <Eye className="h-4 w-4" /> Preview Result
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
            <Download className="h-4 w-4 text-purple-500" /> Download PDF file
          </button>
          <span className="text-xs text-gray-400">←</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-1.5 text-sm font-semibold text-gray-800">Recommendation</p>
        <p className="text-xs leading-relaxed text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of{" "}
          <span className="text-purple-500">subtly colored, textured card stock or paper.</span>
        </p>
      </div>
    </div>
  );
}

// ─── Classic Name Cards — full panel (reference design) ───────────────────────

type NameCardTemplate = "classic" | "classic-circle" | "classic-triangle" | "simple";

const NAME_CARD_TEMPLATES: { id: NameCardTemplate; label: string }[] = [
  { id: "classic",          label: "Template — Classic card" },
  { id: "classic-circle",   label: "Template — Classic & Circle" },
  { id: "classic-triangle", label: "Template — Classic & Triangle" },
  { id: "simple",           label: "Template — Simple card" },
];

function NameCardSvg({ name, template, showTable, tableLabel }: {
  name: string; template: NameCardTemplate; showTable: boolean; tableLabel: string;
}) {
  if (template === "classic-triangle") {
    return (
      <svg viewBox="0 0 280 300" className="w-full h-auto">
        <rect width="280" height="300" fill="#f9f8fb" />
        {/* Card body */}
        <rect x="30" y="20" width="220" height="260" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        {/* Triangle fold hint */}
        <path d="M 30 145 L 140 35 L 250 145" fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="5 4" />
        {/* Scissors icon (scissors path) */}
        <text x="46" y="60" fontSize="13" fill="#d1d5db">✂</text>
        {/* Rotation hint */}
        <text x="220" y="60" fontSize="11" fill="#d1d5db">↻</text>
        {/* Fold line */}
        <line x1="30" y1="145" x2="250" y2="145" stroke="#e9d5f5" strokeWidth="1" strokeDasharray="6 4" />
        {/* Name */}
        <text x="140" y="218" textAnchor="middle" fontSize="26" fill="#374151" fontFamily="Georgia,serif" fontStyle="italic">{name || "Guest Name"}</text>
        {showTable && <text x="140" y="248" textAnchor="middle" fontSize="12" fill="#9ca3af">{tableLabel}</text>}
      </svg>
    );
  }
  if (template === "classic-circle") {
    return (
      <svg viewBox="0 0 280 220" className="w-full h-auto">
        <rect width="280" height="220" fill="#f9f8fb" />
        <rect x="25" y="15" width="230" height="190" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx="140" cy="68" r="32" fill="none" stroke="#e9d5f5" strokeWidth="1.5" />
        <circle cx="140" cy="68" r="22" fill="none" stroke="#f3e8ff" strokeWidth="1" />
        <text x="140" y="73" textAnchor="middle" fontSize="10" fill="#c4b5d0" fontStyle="italic">✦</text>
        <line x1="31" y1="110" x2="249" y2="110" stroke="#e9d5f5" strokeWidth="0.8" strokeDasharray="5 4" />
        <text x="140" y="158" textAnchor="middle" fontSize="22" fill="#374151" fontFamily="Georgia,serif" fontStyle="italic">{name || "Guest Name"}</text>
        {showTable && <text x="140" y="182" textAnchor="middle" fontSize="12" fill="#9ca3af">{tableLabel}</text>}
      </svg>
    );
  }
  if (template === "simple") {
    return (
      <svg viewBox="0 0 280 160" className="w-full h-auto">
        <rect width="280" height="160" fill="#f9f8fb" />
        <rect x="25" y="15" width="230" height="130" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
        <text x="140" y="90" textAnchor="middle" fontSize="24" fill="#374151" fontFamily="Georgia,serif" fontStyle="italic">{name || "Guest Name"}</text>
        {showTable && <text x="140" y="118" textAnchor="middle" fontSize="12" fill="#9ca3af">{tableLabel}</text>}
      </svg>
    );
  }
  // Classic (default)
  return (
    <svg viewBox="0 0 280 200" className="w-full h-auto">
      <rect width="280" height="200" fill="#f9f8fb" />
      <rect x="25" y="15" width="230" height="170" rx="4" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <line x1="45" y1="36" x2="235" y2="36" stroke="#e9d5f5" strokeWidth="0.8" />
      <line x1="45" y1="42" x2="235" y2="42" stroke="#f3e8ff" strokeWidth="0.5" />
      <line x1="31" y1="100" x2="249" y2="100" stroke="#e9d5f5" strokeWidth="0.8" strokeDasharray="5 4" />
      <text x="140" y="150" textAnchor="middle" fontSize="22" fill="#374151" fontFamily="Georgia,serif" fontStyle="italic">{name || "Guest Name"}</text>
      {showTable && <text x="140" y="174" textAnchor="middle" fontSize="12" fill="#9ca3af">{tableLabel}</text>}
    </svg>
  );
}

function NameCardsPanel({ guests, layouts, projectId }: { guests: Guest[]; layouts: Layout[]; projectId: string }) {
  const STORAGE_KEY = `name-cards-settings-${projectId}`;

  const [template, setTemplate] = useState<NameCardTemplate>(() => {
    try { return (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").template as NameCardTemplate) || "classic-triangle"; } catch { return "classic-triangle"; }
  });
  const [templateOpen, setTemplateOpen] = useState(false);
  const [showHonorific, setShowHonorific] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").showHonorific ?? false; } catch { return false; }
  });
  const [showTableNumber, setShowTableNumber] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").showTableNumber ?? false; } catch { return false; }
  });
  const [showCourseIcon, setShowCourseIcon] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").showCourseIcon ?? false; } catch { return false; }
  });
  const [confirmedOnly, setConfirmedOnly] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").confirmedOnly ?? false; } catch { return false; }
  });
  const [printEmpty, setPrintEmpty] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}").printEmpty ?? false; } catch { return false; }
  });
  const [cardIndex, setCardIndex] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ template, showHonorific, showTableNumber, showCourseIcon, confirmedOnly, printEmpty }));
    } catch {}
  }, [STORAGE_KEY, template, showHonorific, showTableNumber, showCourseIcon, confirmedOnly, printEmpty]);

  const tableMap = buildGuestTableMap(layouts);

  const displayGuests = confirmedOnly
    ? guests.filter(g => g.rsvpStatus === "ATTENDING")
    : guests;

  const total = printEmpty ? Math.max(displayGuests.length, 1) : displayGuests.length;
  const safeIndex = displayGuests.length > 0 ? Math.min(cardIndex, displayGuests.length - 1) : 0;
  const current = displayGuests[safeIndex] ?? null;

  const displayName = current
    ? [showHonorific ? current.title : null, current.firstName, current.lastName]
        .filter(Boolean).join(" ")
    : printEmpty ? "" : "";

  const tableLabel = current
    ? (tableMap.get(current.id) ?? (current.tableNumber != null ? `Table ${current.tableNumber}` : "—"))
    : "—";

  return (
    <div className="mx-auto max-w-xl">
      {/* Title */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">Classic Name Cards</h2>
        <p className="text-sm text-gray-400">Create and print name cards for every guest so they can easily find their seat.</p>
      </div>

      {/* Card preview with navigation */}
      <div className="relative flex items-center justify-center px-10">
        <button
          onClick={() => setCardIndex(i => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ‹
        </button>

        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <NameCardSvg
            name={displayName}
            template={template}
            showTable={showTableNumber}
            tableLabel={tableLabel}
          />
        </div>

        <button
          onClick={() => setCardIndex(i => Math.min(total - 1, i + 1))}
          disabled={safeIndex >= total - 1}
          className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ›
        </button>
      </div>

      {/* Settings panel */}
      <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Template dropdown */}
        <div className="relative border-b border-gray-100">
          <button
            onClick={() => setTemplateOpen(v => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-500 text-xs">This style applies to all name cards</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">{NAME_CARD_TEMPLATES.find(t => t.id === template)?.label}</span>
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", templateOpen && "rotate-180")} />
            </div>
          </button>
          {templateOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTemplateOpen(false)} />
              <div className="absolute left-0 right-0 top-full z-20 overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-white shadow-lg">
                {NAME_CARD_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTemplate(t.id); setTemplateOpen(false); }}
                    className={cn(
                      "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                      t.id === template ? "bg-blue-600 text-white font-medium" : "text-purple-600 hover:bg-gray-50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-2.5 border-b border-gray-100 px-4 py-3">
          {([
            { key: "honorific", label: "Add honorific (Mr., Mrs., Ms.)",  val: showHonorific,  fn: () => setShowHonorific((v: boolean) => !v) },
            { key: "table",     label: "Display table number",             val: showTableNumber, fn: () => setShowTableNumber((v: boolean) => !v) },
            { key: "course",    label: "Display the main course icon",     val: showCourseIcon,  fn: () => setShowCourseIcon((v: boolean) => !v) },
          ]).map(({ key, label, val, fn }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2.5" onClick={fn}>
              <div className={cn(
                "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                val ? "border-purple-500" : "border-gray-300"
              )}>
                {val && <div className="h-2 w-2 rounded-full bg-purple-500" />}
              </div>
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>

        {/* Count */}
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-medium text-gray-700">Total {total} place cards</p>
          {displayGuests.length === 0 && (
            <p className="mt-1 text-xs text-purple-500 underline cursor-pointer">Let&apos;s add more guests to the list</p>
          )}
        </div>

        {/* Radio options */}
        <div className="space-y-2 border-b border-gray-100 px-4 py-3">
          <label className="flex cursor-pointer items-center gap-2.5" onClick={() => { setConfirmedOnly((v: boolean) => !v); setPrintEmpty(false); }}>
            <div className={cn("flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors", confirmedOnly ? "border-purple-500" : "border-gray-300")}>
              {confirmedOnly && <div className="h-2 w-2 rounded-full bg-purple-500" />}
            </div>
            <span className="text-sm text-gray-600">Include only guests who confirmed attendance</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5" onClick={() => { setPrintEmpty((v: boolean) => !v); setConfirmedOnly(false); }}>
            <div className={cn("mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors", printEmpty ? "border-purple-500" : "border-gray-300")}>
              {printEmpty && <div className="h-2 w-2 rounded-full bg-purple-500" />}
            </div>
            <span className="text-sm text-gray-600">Print empty cards<br /><span className="text-xs text-gray-400">(in case of filling in names by hand)</span></span>
          </label>
        </div>

        {/* Download */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 text-purple-500" />
            Download PDF file
          </button>
          <span className="text-xs text-gray-400">←</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-gray-800">Recommendation</p>
        <p className="text-xs leading-relaxed text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of{" "}
          <span className="text-purple-500">subtly colored, textured card stock or paper.</span>
        </p>
      </div>

      {/* Gallery */}
      <div className="mt-6">
        <h3 className="mb-3 text-center text-sm font-medium text-gray-600">
          Elegant name card inspiration
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {GALLERY["name-cards"].map((src, i) => (
            <div key={i} className="relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-xl opacity-85 hover:opacity-100 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Name card inspiration ${i + 1}`} className="h-full w-full object-cover" loading="lazy"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Table Numbers panel ──────────────────────────────────────────────────────

type TableNumTemplate = "standard" | "wide" | "tall";

const TN_NUMBER_FONTS = [
  { name: "Xarrovv",       family: "'Dancing Script', cursive" },
  { name: "Georgia",       family: "Georgia, serif" },
  { name: "Playfair",      family: "'Playfair Display', serif" },
  { name: "Cinzel",        family: "Georgia, serif" },
  { name: "Cormorant",     family: "'Cormorant Garamond', serif" },
  { name: "Serif",         family: "serif" },
];
const TN_HASHTAG_FONTS = [
  { name: "Fira Sans",      family: "'Fira Sans', sans-serif" },
  { name: "Sans-serif",     family: "sans-serif" },
  { name: "Georgia",        family: "Georgia, serif" },
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Playfair",       family: "'Playfair Display', serif" },
];

function TableNumberCardSvg({ tableLabel, template, topText, bottomText, numberFont, hashtagFont, cornerRadius }: {
  tableLabel: string; template: TableNumTemplate;
  topText: string; bottomText: string;
  numberFont: string; hashtagFont: string; cornerRadius: number;
}) {
  const numMatch = tableLabel.match(/\d+/);
  const displayNum = numMatch ? numMatch[0] : tableLabel;

  // Card dimensions per template
  const cw = template === "wide" ? 260 : template === "tall" ? 170 : 210;
  const ch = template === "wide" ? 230 : template === "tall" ? 300 : 250;
  const rx = template === "wide" ? Math.min(cw, ch) / 2 : Math.min(cornerRadius, Math.min(cw, ch) / 2);
  const cx = cw / 2;
  const standTop = ch + 2;
  const totalH = ch + 90;

  const numY = template === "tall" ? ch * 0.55 : ch * 0.58;
  const numSize = template === "wide" ? 100 : template === "tall" ? 110 : 95;

  return (
    <svg viewBox={`0 0 ${cw} ${totalH}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <filter id="tnShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0001" />
        </filter>
      </defs>
      {/* Card */}
      <rect x={0} y={0} width={cw} height={ch} rx={rx} ry={rx}
        fill="white" stroke="#e5e7eb" strokeWidth="1" filter="url(#tnShadow)" />
      {/* Inner decorative dashed border */}
      <rect x={8} y={8} width={cw - 16} height={ch - 16} rx={Math.max(rx - 6, 2)} ry={Math.max(rx - 6, 2)}
        fill="none" stroke="#e9d5f5" strokeWidth="0.8" strokeDasharray="4 3" />
      {/* "Table" text */}
      <text x={cx} y={ch * 0.22} textAnchor="middle" fontSize="16" fontFamily="Georgia, serif" fill="#374151">{topText}</text>
      {/* Large number */}
      <text x={cx} y={numY} textAnchor="middle" fontSize={numSize} fontFamily={numberFont} fill="#111827" fontWeight="400">{displayNum}</text>
      {/* Hashtag text */}
      <text x={cx} y={ch - 22} textAnchor="middle" fontSize="13" fontFamily={hashtagFont} fill="#6b7280">#{bottomText}</text>
      {/* Stand: circle connector */}
      <circle cx={cx} cy={standTop + 14} r={13} fill="none" stroke="#d1d5db" strokeWidth="1.5" />
      {/* Vertical rod */}
      <line x1={cx} y1={standTop + 27} x2={cx} y2={standTop + 55} stroke="#d1d5db" strokeWidth="2" />
      {/* Base plates */}
      <rect x={cx - 32} y={standTop + 55} width={64} height={9} rx={2} fill="none" stroke="#d1d5db" strokeWidth="1.5" />
      <rect x={cx - 24} y={standTop + 63} width={48} height={7} rx={2} fill="none" stroke="#d1d5db" strokeWidth="1.5" />
    </svg>
  );
}

function TableNumbersPanel({ projectId }: { projectId: string }) {
  const STORAGE_KEY = `table-numbers-settings-${projectId}`;
  const load = <T,>(key: string, def: T): T => {
    try { const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")[key]; return v !== undefined ? v : def; } catch { return def; }
  };

  const [template,      setTemplate]      = useState<TableNumTemplate>(() => load("template", "standard"));
  const [templateOpen,  setTemplateOpen]  = useState(false);
  const [topText,       setTopText]       = useState<string>(() => load("topText", "Table"));
  const [bottomText,    setBottomText]    = useState<string>(() => load("bottomText", "hashtag"));
  const [numFontIdx,    setNumFontIdx]    = useState<number>(() => load("numFontIdx", 0));
  const [hashFontIdx,   setHashFontIdx]   = useState<number>(() => load("hashFontIdx", 0));
  const [cornerRadius,  setCornerRadius]  = useState<number>(() => load("cornerRadius", 20));
  const [cardIndex,     setCardIndex]     = useState(0);
  const [tables,        setTables]        = useState<string[]>([]);

  // Load table names from reception layout localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`reception-layout-${projectId}`);
      if (raw) {
        const els: PreviewElement[] = JSON.parse(raw);
        const TABLE_KINDS = ["table-long", "table-square", "table-round", "table-ellipse", "table-halfround"];
        const names = els
          .filter(el => TABLE_KINDS.includes(el.kind))
          .map((el, i) => el.name || `Table ${i + 1}`);
        if (names.length > 0) { setTables(names); return; }
      }
    } catch {}
    setTables(["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"]);
  }, [projectId]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ template, topText, bottomText, numFontIdx, hashFontIdx, cornerRadius }));
    } catch {}
  }, [STORAGE_KEY, template, topText, bottomText, numFontIdx, hashFontIdx, cornerRadius]);

  const total    = tables.length || 5;
  const safeIdx  = Math.min(cardIndex, total - 1);
  const current  = tables[safeIdx] ?? `Table ${safeIdx + 1}`;

  const templateLabel = { standard: "Standard", wide: "Wide", tall: "Tall" }[template];

  function buildCardsHtml() {
    const allTables = tables.length > 0 ? tables : ["Table 1","Table 2","Table 3","Table 4","Table 5"];
    const cw = template === "wide" ? 260 : template === "tall" ? 170 : 210;
    const ch = template === "wide" ? 230 : template === "tall" ? 300 : 250;
    const rx = template === "wide" ? Math.min(cw, ch) / 2 : Math.min(cornerRadius, Math.min(cw, ch) / 2);
    const cx = cw / 2;
    const standTop = ch + 2;
    const totalH = ch + 90;
    const numSize = template === "wide" ? 100 : template === "tall" ? 110 : 95;
    const numY = template === "tall" ? ch * 0.55 : ch * 0.58;
    const nf = TN_NUMBER_FONTS[numFontIdx].family;
    const hf = TN_HASHTAG_FONTS[hashFontIdx].family;
    return { allTables, cw, ch, cards: allTables.map(t => {
      const n = t.match(/\d+/)?.[0] ?? t;
      return `<div style="display:inline-block;margin:16px;page-break-inside:avoid;">
        <svg viewBox="0 0 ${cw} ${totalH}" width="${cw}" height="${totalH}">
          <rect x="0" y="0" width="${cw}" height="${ch}" rx="${rx}" ry="${rx}" fill="white" stroke="#e5e7eb" stroke-width="1"/>
          <rect x="8" y="8" width="${cw-16}" height="${ch-16}" rx="${Math.max(rx-6,2)}" ry="${Math.max(rx-6,2)}" fill="none" stroke="#e9d5f5" stroke-width="0.8" stroke-dasharray="4 3"/>
          <text x="${cx}" y="${ch*0.22}" text-anchor="middle" font-size="16" font-family="Georgia,serif" fill="#374151">${topText}</text>
          <text x="${cx}" y="${numY}" text-anchor="middle" font-size="${numSize}" font-family="${nf}" fill="#111827">${n}</text>
          <text x="${cx}" y="${ch-22}" text-anchor="middle" font-size="13" font-family="${hf}" fill="#6b7280">#${bottomText}</text>
          <circle cx="${cx}" cy="${standTop+14}" r="13" fill="none" stroke="#d1d5db" stroke-width="1.5"/>
          <line x1="${cx}" y1="${standTop+27}" x2="${cx}" y2="${standTop+55}" stroke="#d1d5db" stroke-width="2"/>
          <rect x="${cx-32}" y="${standTop+55}" width="64" height="9" rx="2" fill="none" stroke="#d1d5db" stroke-width="1.5"/>
          <rect x="${cx-24}" y="${standTop+63}" width="48" height="7" rx="2" fill="none" stroke="#d1d5db" stroke-width="1.5"/>
        </svg>
      </div>`;
    }).join("") };
  }

  function handlePreviewResult() {
    const { allTables, cards } = buildCardsHtml();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Table Numbers Preview</title>
      <style>body{margin:24px;background:#f5f3fa;font-family:sans-serif;text-align:center;}
      h2{color:#6b21a8;margin-bottom:8px;}p{color:#6b7280;margin-bottom:24px;}</style></head>
      <body><h2>Table Numbers — ${templateLabel} Template</h2>
      <p>${allTables.length} table cards</p>
      <div>${cards}</div></body></html>`);
    win.document.close();
  }

  function handleDownloadPDF() {
    const { allTables, cards } = buildCardsHtml();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Table Numbers PDF</title>
      <style>body{margin:0;background:white;text-align:center;}
      @media print{@page{margin:10mm;size:A4;}}</style></head>
      <body><div style="padding:16px">${cards}</div>
      <script>window.onload=function(){window.print();}<\/script></body></html>`);
    win.document.close();
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Dashed connector */}
      <div className="flex flex-col items-center">
        <svg width="2" height="32" viewBox="0 0 2 32">
          <line x1="1" y1="0" x2="1" y2="32" stroke="#c4b5d0" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
        <div className="w-2 h-2 rounded-full border border-purple-300" />
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Table Numbers</h2>
        <p className="text-sm text-gray-500 mt-1">Design and print table number cards for each table based on the seating plan.</p>
      </div>

      {/* Navigation + Card */}
      <div className="flex items-start gap-6 w-full justify-center">
        <button
          onClick={() => setCardIndex(i => Math.max(0, i - 1))}
          disabled={safeIdx === 0}
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-shrink-0" style={{ width: template === "wide" ? 240 : template === "tall" ? 160 : 200 }}>
          <TableNumberCardSvg
            tableLabel={current}
            template={template}
            topText={topText}
            bottomText={bottomText}
            numberFont={TN_NUMBER_FONTS[numFontIdx].family}
            hashtagFont={TN_HASHTAG_FONTS[hashFontIdx].family}
            cornerRadius={cornerRadius}
          />
        </div>

        <button
          onClick={() => setCardIndex(i => Math.min(total - 1, i + 1))}
          disabled={safeIdx >= total - 1}
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 disabled:opacity-30 transition-colors flex-shrink-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Settings panel */}
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 overflow-visible">
        {/* Header toggle */}
        <button
          onClick={() => setTemplateOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 rounded-xl"
        >
          <span>This style applies to all cards</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Template — {templateLabel}</span>
            <ChevronDown size={15} className={`transition-transform ${templateOpen ? "rotate-180" : ""}`} />
          </div>
        </button>

        {/* Template dropdown */}
        {templateOpen && (
          <div className="border-t border-gray-100">
            {(["standard", "wide", "tall"] as TableNumTemplate[]).map(t => (
              <button
                key={t}
                onClick={() => { setTemplate(t); setTemplateOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm ${template === t ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
              >
                Template — {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Settings rows (when dropdown closed) */}
        {!templateOpen && (
          <div className="border-t border-gray-100 px-4 py-2 space-y-1">
            {/* Number font */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Font — {TN_NUMBER_FONTS[numFontIdx].name}</span>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <button onClick={() => setNumFontIdx(i => (i - 1 + TN_NUMBER_FONTS.length) % TN_NUMBER_FONTS.length)} className="hover:text-purple-600">◄</button>
                <button onClick={() => setNumFontIdx(i => (i + 1) % TN_NUMBER_FONTS.length)} className="hover:text-purple-600">►</button>
              </div>
            </div>
            {/* Top text */}
            <div className="py-1.5 border-b border-gray-100">
              <input
                value={topText}
                onChange={e => setTopText(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-300"
              />
            </div>
            {/* Bottom text */}
            <div className="py-1.5 border-b border-gray-100">
              <input
                value={bottomText}
                onChange={e => setBottomText(e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-300"
              />
            </div>
            {/* Hashtag font */}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Font — {TN_HASHTAG_FONTS[hashFontIdx].name}</span>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <button onClick={() => setHashFontIdx(i => (i - 1 + TN_HASHTAG_FONTS.length) % TN_HASHTAG_FONTS.length)} className="hover:text-purple-600">◄</button>
                <button onClick={() => setHashFontIdx(i => (i + 1) % TN_HASHTAG_FONTS.length)} className="hover:text-purple-600">►</button>
              </div>
            </div>
            {/* Rounded corners */}
            <div className="py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Rounded corners</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">0</span>
                <input
                  type="range" min={0} max={130} value={cornerRadius}
                  onChange={e => setCornerRadius(Number(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-xs text-gray-500 w-8 text-right">{cornerRadius}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <p className="text-lg font-medium text-gray-700">Total {total} table cards</p>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={handlePreviewResult}
          className="w-full flex items-center justify-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full py-2.5 text-sm font-medium transition-colors"
        >
          <Eye size={16} />
          Preview Result
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            <Download size={15} />
            Download PDF file
          </button>
          <span className="text-gray-400 text-sm">←</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700 mb-1">Recommendation</p>
        <p className="text-xs text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of subtly colored,
          slightly textured paper for an elevated aesthetic.
        </p>
      </div>

      {/* Gallery */}
      <div className="w-full max-w-2xl">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Gallery</h3>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {GALLERY["table-numbers"].map((src, i) => (
            <div key={i} className="relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-xl opacity-85 hover:opacity-100 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
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

// ─── Reception Menu Panel ─────────────────────────────────────────────────────

function ReceptionMenuPanel({ projectId, onEdit }: { projectId: string; onEdit: () => void }) {
  interface Sec { id: string; type: string; text: string; }
  interface Cfg {
    mainHeadingFont: string; mainHeadingSize: number;
    secondHeadingFont: string; secondHeadingSize: number;
    paragraphFont: string; paragraphSize: number;
  }
  const DEF_CFG: Cfg = {
    mainHeadingFont: "Overlock", mainHeadingSize: 73,
    secondHeadingFont: "Overlock", secondHeadingSize: 30,
    paragraphFont: "Georgia", paragraphSize: 20,
  };
  const DEF_SECS: Sec[] = [
    { id: "s1",  type: "flourish",       text: "" },
    { id: "s2",  type: "second-heading", text: "Appetizer" },
    { id: "s3",  type: "paragraph",      text: "Shrimp risotto balls\nGoat cheese and lamb phyllo cups\nSmoked bacon and chicken skewers" },
    { id: "s4",  type: "second-heading", text: "Salad" },
    { id: "s5",  type: "paragraph",      text: "Fresh greens\nwith marinated cucumbers\ngarlic croutons,\nroasted tomatoes, raspberry dressing" },
    { id: "s6",  type: "second-heading", text: "Entrees" },
    { id: "s7",  type: "paragraph",      text: "Fire grilled beef filet\nand red wine sauce,\nand creamy lobster sauce,\nseasonal vegetables, roasted red potatoes\n\nOR\n\nstuffed with forest mushrooms\ntopped with butter poached lobster\nseasonal vegetables, roasted red potatoes" },
    { id: "s8",  type: "second-heading", text: "Dessert" },
    { id: "s9",  type: "paragraph",      text: "Assorted dessert bites\nProsecco for toasting" },
    { id: "s10", type: "main-heading",   text: "Heading" },
  ];

  const [secs, setSecs] = useState<Sec[]>(DEF_SECS);
  const [cfg,  setCfg]  = useState<Cfg>(DEF_CFG);

  useEffect(() => {
    try {
      const rs = localStorage.getItem(`menu-sections-${projectId}`);
      const rc = localStorage.getItem(`menu-settings-${projectId}`);
      if (rs) setSecs(JSON.parse(rs));
      if (rc) setCfg(c => ({ ...c, ...JSON.parse(rc) }));
    } catch {}
  }, [projectId]);

  const mainPx   = Math.round(cfg.mainHeadingSize  * 0.60);
  const secondPx = Math.round(cfg.secondHeadingSize * 0.50);
  const paraPx   = Math.round(cfg.paragraphSize    * 0.70);

  return (
    <div className="mx-auto max-w-xl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Overlock:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital@0;1&family=Dancing+Script&display=swap');`}</style>

      {/* Title */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">Reception Menu</h2>
        <p className="text-sm text-gray-400">Print a beautiful menu card for each guest at the reception.</p>
      </div>

      {/* Menu card — renders actual saved content */}
      <div
        className="mx-auto rounded-2xl shadow-lg bg-white"
        style={{ width: "100%", maxWidth: 480, border: "1px solid #e9d5f5", position: "relative" }}
      >
        <div style={{ position: "absolute", inset: 12, border: "1px solid #f3e8ff", borderRadius: 10, pointerEvents: "none" }} />
        <div style={{ padding: "48px 64px", textAlign: "center" }}>
          {/* Fixed header */}
          <p style={{ fontSize: 11, letterSpacing: 5, color: "#c4b5d0", fontFamily: "sans-serif" }}>RECEPTION</p>
          <p style={{ fontFamily: `${cfg.mainHeadingFont}, serif`, fontStyle: "italic", fontSize: mainPx, color: "#7c6f8a", lineHeight: 1.05, marginTop: 4 }}>Menu</p>
          <p style={{ fontSize: 13, color: "#c4b5d0", letterSpacing: 6, marginTop: 6 }}>✦ ✦ ✦</p>

          {/* Dynamic sections from localStorage */}
          {secs.map(sec => {
            if (sec.type === "flourish") {
              return <div key={sec.id} style={{ fontSize: 12, color: "#ddd6e8", letterSpacing: 6, margin: "16px 0" }}>✦ ✦ ✦</div>;
            }
            if (sec.type === "main-heading") {
              return (
                <div key={sec.id} style={{ marginTop: 18 }}>
                  <span style={{ fontFamily: `${cfg.mainHeadingFont}, serif`, fontSize: Math.round(mainPx * 0.6), fontWeight: 700, color: "#374151" }}>
                    {sec.text}
                  </span>
                </div>
              );
            }
            if (sec.type === "second-heading") {
              return (
                <div key={sec.id} style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 10, letterSpacing: 4, color: "#9ca3af", fontFamily: "sans-serif" }}>
                    {sec.text.toUpperCase()}
                  </p>
                </div>
              );
            }
            if (sec.type === "paragraph") {
              return (
                <div key={sec.id} style={{ marginTop: 6, marginBottom: 4 }}>
                  {sec.text.split("\n").map((line, i) => (
                    <p key={i} style={{
                      fontFamily: `${cfg.paragraphFont}, serif`,
                      fontSize: paraPx,
                      color: line === "OR" ? "#9ca3af" : "#7c6f8a",
                      fontStyle: /^(with |and |topped|seasonal|stuffed)/.test(line) ? "italic" : "normal",
                      lineHeight: 1.6,
                    }}>{line || "\u00A0"}</p>
                  ))}
                </div>
              );
            }
            return null;
          })}

          <div style={{ marginTop: 20, fontSize: 12, color: "#ddd6e8", letterSpacing: 6 }}>✦ ✦ ✦</div>
        </div>
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

      {/* Download + arrow */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4 text-purple-500" />
          Download PDF file
        </button>
        <span className="text-xs text-gray-400">←</span>
      </div>

      {/* Recommendation */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-1.5 text-sm font-semibold text-gray-800">Recommendation</p>
        <p className="text-xs leading-relaxed text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of{" "}
          <span className="text-purple-500">subtly colored, textured card stock or paper.</span>
        </p>
      </div>

      {/* Gallery */}
      <div className="mt-6">
        <h3 className="mb-3 text-center text-sm font-medium text-gray-600">
          Design your reception menu
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {GALLERY.menu.map((src, i) => (
            <div key={i} className="relative h-44 w-32 flex-shrink-0 overflow-hidden rounded-xl opacity-85 hover:opacity-100 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Menu inspiration ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Atlas Layout Settings ─────────────────────────────────────────────────────

interface AtlasSettings {
  displayMode: "alphabetical" | "table";
  groupBy: "first" | "last";
  nameFormat: "first-only" | "full" | "last-first";
  sortWithin: "last" | "first";
  alphabetFont: string;
  namesFont: string;
  autoColumns: boolean;
  underlineNames: boolean;
  blockSpacing: number;
  columnGap: number;
  headlineSpacing: number;
  nameSpacing: number;
  alphabetFontSize: number;
  namesFontSize: number;
}

const DEFAULT_ATLAS_SETTINGS: AtlasSettings = {
  displayMode: "alphabetical",
  groupBy: "last",
  nameFormat: "last-first",
  sortWithin: "last",
  alphabetFont: "Poiret One",
  namesFont: "serif",
  autoColumns: true,
  underlineNames: false,
  blockSpacing: 50,
  columnGap: 56,
  headlineSpacing: 15,
  nameSpacing: 8,
  alphabetFontSize: 21,
  namesFontSize: 13,
};

const ALPHABET_FONTS = ["Poiret One", "Playfair Display", "Dancing Script", "Georgia", "serif", "sans-serif"];
const NAMES_FONTS = ["serif", "sans-serif", "Georgia", "Palatino", "Garamond", "Verdana"];

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
  settings,
  onEditLayout,
}: {
  guests: Guest[];
  layouts: Layout[];
  settings: AtlasSettings;
  onEditLayout: () => void;
}) {
  const tableMap = buildGuestTableMap(layouts);
  const seatedCount = guests.filter(g => tableMap.has(g.id)).length;
  const [activePhoto, setActivePhoto] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const photos = GALLERY.cards;

  function scrollToPhoto(i: number) {
    setActivePhoto(i);
    const el = scrollRef.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page subtitle */}
      <div className="mb-5 text-center">
        <h2 className="text-lg font-light text-gray-700">Alphabetical Guest Atlas</h2>
        <p className="text-sm text-gray-400">This layout is automatically generated from the reception layout.</p>
      </div>

      {/* Printable document card */}
      <div className="mx-auto w-fit overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ zoom: 0.95 }}>
        <AtlasPreviewDoc guests={guests} layouts={layouts} settings={settings} />
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
      <div className="mt-2 text-center text-sm text-gray-600">
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

      {/* Recommendation */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-1.5 text-sm font-semibold text-gray-800">Recommendation</p>
        <p className="text-xs leading-relaxed text-gray-500">
          For printing, opt for thick paper! You&apos;re welcome to select any variety of{" "}
          <span className="text-purple-500">subtly colored, textured card stock or paper.</span>
        </p>
      </div>

      {/* Gallery */}
      <div className="mt-6">
        <h3 className="mb-3 text-center text-sm font-medium text-gray-600">
          Elegant alphabetical guest atlas seating chart
        </h3>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {photos.map((src, i) => (
            <div
              key={i}
              onClick={() => scrollToPhoto(i)}
              className={cn(
                "relative h-44 w-32 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all",
                i === activePhoto ? "ring-2 ring-purple-400 ring-offset-1 opacity-100" : "opacity-85 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Alphabetical guest atlas inspiration ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPhoto(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === activePhoto ? "w-5 bg-gray-600" : "w-1.5 bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── Atlas Preview Document (live, reflects settings) ─────────────────────────

function AtlasPreviewDoc({
  guests, layouts, settings,
}: {
  guests: Guest[];
  layouts: Layout[];
  settings: AtlasSettings;
}) {
  const tableMap = buildGuestTableMap(layouts);

  // Build grouped sections based on displayMode
  let grouped: Record<string, Guest[]>;
  let letters: string[];

  if (settings.displayMode === "table") {
    // Group by table name/number
    grouped = {};
    const tableSorted = [...guests].sort((a, b) => {
      const ta = tableMap.get(a.id) ?? (a.tableNumber != null ? String(a.tableNumber) : "~Unassigned");
      const tb = tableMap.get(b.id) ?? (b.tableNumber != null ? String(b.tableNumber) : "~Unassigned");
      return ta.localeCompare(tb, undefined, { numeric: true });
    });
    for (const g of tableSorted) {
      const key = tableMap.get(g.id) ?? (g.tableNumber != null ? `Table ${g.tableNumber}` : "Unassigned");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(g);
    }
    letters = Object.keys(grouped).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  } else {
    // Alphabetical grouping
    const sorted = [...guests].sort((a, b) => {
      const ka = settings.sortWithin === "last"
        ? (a.lastName || a.firstName).toLowerCase()
        : a.firstName.toLowerCase();
      const kb = settings.sortWithin === "last"
        ? (b.lastName || b.firstName).toLowerCase()
        : b.firstName.toLowerCase();
      return ka.localeCompare(kb);
    });
    grouped = {};
    for (const g of sorted) {
      const key = (settings.groupBy === "last"
        ? (g.lastName || g.firstName)[0]
        : g.firstName[0] || "#"
      ).toUpperCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(g);
    }
    letters = Object.keys(grouped).sort();
  }

  function formatName(g: Guest): string {
    switch (settings.nameFormat) {
      case "first-only": return g.firstName;
      case "full": return [g.firstName, g.lastName].filter(Boolean).join(" ");
      case "last-first": return g.lastName ? `${g.lastName}, ${g.firstName}` : g.firstName;
    }
  }

  return (
    <div
      className="bg-white"
      style={{
        width: "595px",
        minHeight: "842px",
        padding: "40px 40px 48px",
        fontFamily: settings.namesFont,
        boxSizing: "border-box",
      }}
    >
      {/* Document header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "26px", color: "#555", marginBottom: "6px" }}>
          Please find your seat!
        </div>
        <div style={{ fontSize: "12px", color: "#aaa" }}>Event date</div>
        <div style={{ fontSize: "12px", color: "#aaa" }}>Bride name &amp; Groom name</div>
      </div>

      {guests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#aaa", fontSize: "13px" }}>
          No guests yet. Add guests from the Guest List page.
        </div>
      ) : (
        <div
          style={{
            columns: settings.autoColumns ? "auto" : "3",
            columnGap: `${settings.columnGap}px`,
          }}
        >
          {letters.map(letter => (
            <div
              key={letter}
              className="break-inside-avoid"
              style={{ marginBottom: `${settings.blockSpacing}px` }}
            >
              <div style={{
                borderBottom: "1px solid #e5e7eb",
                marginBottom: `${settings.headlineSpacing}px`,
                paddingBottom: "2px",
              }}>
                <span style={{
                  fontSize: `${settings.alphabetFontSize}px`,
                  fontFamily: settings.alphabetFont,
                  fontWeight: "bold",
                  color: "#6d28d9",
                }}>
                  {letter}
                </span>
              </div>
              {grouped[letter].map(g => {
                const tableLabel = tableMap.has(g.id)
                  ? tableMap.get(g.id)!
                  : g.tableNumber != null ? String(g.tableNumber) : "—";
                return (
                  <div
                    key={g.id}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "2px",
                      fontSize: `${settings.namesFontSize}px`,
                      marginBottom: `${settings.nameSpacing}px`,
                      fontFamily: settings.namesFont,
                      textDecoration: settings.underlineNames ? "underline" : "none",
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ flexShrink: 0, maxWidth: "65%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#374151" }}>
                      {formatName(g)}
                    </span>
                    <span style={{ flex: 1, color: "#d1d5db", overflow: "hidden", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {" "}............
                    </span>
                    <span style={{ flexShrink: 0, color: "#6b7280" }}>{tableLabel}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Atlas Layout Editor (full-screen overlay) ────────────────────────────────

function AtlasLayoutEditor({
  guests, layouts, settings, onClose, onSettingsChange,
}: {
  guests: Guest[];
  layouts: Layout[];
  settings: AtlasSettings;
  onClose: () => void;
  onSettingsChange: (s: AtlasSettings) => void;
}) {
  function set<K extends keyof AtlasSettings>(key: K, value: AtlasSettings[K]) {
    onSettingsChange({ ...settings, [key]: value });
  }

  function cycleFont(fonts: string[], current: string, dir: 1 | -1) {
    const idx = fonts.indexOf(current);
    const next = (idx + dir + fonts.length) % fonts.length;
    return fonts[next];
  }

  const sliders: { key: keyof AtlasSettings; label: string; min: number; max: number }[] = [
    { key: "blockSpacing",     label: "Block spacing",      min: 0, max: 300 },
    { key: "columnGap",        label: "Column gap",         min: 0, max: 300 },
    { key: "headlineSpacing",  label: "Headline spacing",   min: 0, max: 50  },
    { key: "nameSpacing",      label: "Name spacing",       min: 0, max: 50  },
    { key: "alphabetFontSize", label: "Alphabet font size", min: 10, max: 100 },
    { key: "namesFontSize",    label: "Names font size",    min: 8,  max: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#f0ebf4" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <X className="h-3.5 w-3.5" /> Close
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const el = document.getElementById("atlas-preview-doc");
              if (!el) return;
              const printWin = window.open("", "_blank", "width=700,height=1000");
              if (!printWin) { alert("Allow popups to download PDF."); return; }
              printWin.document.write(`<!DOCTYPE html><html><head><title>Guest Atlas</title><style>@page{size:A4 portrait;margin:0}body{margin:0;background:white}*{box-sizing:border-box}@media print{body{margin:0}}</style></head><body>${el.outerHTML}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),300));<\/script></body></html>`);
              printWin.document.close();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-200"
          >
            <Download className="h-3.5 w-3.5 text-purple-500" /> File
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white bg-purple-600 hover:bg-purple-700">
            <Plus className="h-3.5 w-3.5" /> Add element
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document preview */}
        <div className="flex-1 overflow-auto flex items-start justify-center py-10 px-6">
          <div id="atlas-preview-doc">
            <AtlasPreviewDoc guests={guests} layouts={layouts} settings={settings} />
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="w-56 flex-shrink-0 overflow-y-auto bg-white border-l border-gray-200 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Guest list</h3>

          {/* Display mode */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Display mode</p>
            <select
              value={settings.displayMode}
              onChange={e => set("displayMode", e.target.value as AtlasSettings["displayMode"])}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="table">By table</option>
            </select>
          </div>

          {/* Group by */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Group by</p>
            <select
              value={settings.groupBy}
              onChange={e => set("groupBy", e.target.value as AtlasSettings["groupBy"])}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
            >
              <option value="first">First name</option>
              <option value="last">Last name</option>
            </select>
          </div>

          {/* Name format */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Name format</p>
            <select
              value={settings.nameFormat}
              onChange={e => set("nameFormat", e.target.value as AtlasSettings["nameFormat"])}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
            >
              <option value="first-only">First name only</option>
              <option value="full">Full name</option>
              <option value="last-first">Last name, First</option>
            </select>
          </div>

          {/* Sort within group */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Sort within group</p>
            <select
              value={settings.sortWithin}
              onChange={e => set("sortWithin", e.target.value as AtlasSettings["sortWithin"])}
              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:outline-none"
            >
              <option value="first">By first name</option>
              <option value="last">By last name</option>
            </select>
          </div>

          {/* Alphabet font */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Alphabet font</p>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-1 py-1">
              <button
                onClick={() => set("alphabetFont", cycleFont(ALPHABET_FONTS, settings.alphabetFont, -1))}
                className="rounded p-0.5 hover:bg-gray-100 text-gray-500 text-base leading-none"
              >‹</button>
              <span className="flex-1 text-center text-xs text-gray-700 truncate">{settings.alphabetFont}</span>
              <button
                onClick={() => set("alphabetFont", cycleFont(ALPHABET_FONTS, settings.alphabetFont, 1))}
                className="rounded p-0.5 hover:bg-gray-100 text-gray-500 text-base leading-none"
              >›</button>
            </div>
          </div>

          {/* Names font */}
          <div>
            <p className="text-xs text-gray-400 mb-1">Names font</p>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 px-1 py-1">
              <button
                onClick={() => set("namesFont", cycleFont(NAMES_FONTS, settings.namesFont, -1))}
                className="rounded p-0.5 hover:bg-gray-100 text-gray-500 text-base leading-none"
              >‹</button>
              <span className="flex-1 text-center text-xs text-gray-700 truncate">{settings.namesFont}</span>
              <button
                onClick={() => set("namesFont", cycleFont(NAMES_FONTS, settings.namesFont, 1))}
                className="rounded p-0.5 hover:bg-gray-100 text-gray-500 text-base leading-none"
              >›</button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5">
            {([
              { key: "autoColumns",    label: "Auto columns"    },
              { key: "underlineNames", label: "Underline names" },
            ] as { key: keyof AtlasSettings; label: string }[]).map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-xs text-gray-600">{label}</span>
                <button
                  onClick={() => set(key, !settings[key] as AtlasSettings[typeof key])}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                    settings[key] ? "bg-purple-500" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                    settings[key] ? "translate-x-4" : "translate-x-1"
                  )} />
                </button>
              </label>
            ))}
          </div>

          {/* Sliders */}
          {sliders.map(({ key, label, min, max }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">{label}</p>
                <span className="text-xs font-medium text-gray-700 bg-gray-100 rounded px-1.5 py-0.5">
                  {settings[key] as number}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-300">{min}</span>
                <input
                  type="range" min={min} max={max}
                  value={settings[key] as number}
                  onChange={e => set(key, Number(e.target.value) as AtlasSettings[typeof key])}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-[10px] text-gray-300">{max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CSV Export helper ────────────────────────────────────────────────────────

function parseDietary(dietary: string | null | undefined): string {
  if (!dietary) return "Standard";
  const d = dietary.toLowerCase();
  if (d.includes("vegan")) return "Vegan";
  if (d.includes("gluten")) return "Gluten-free";
  if (d.includes("vegetarian")) return "Vegetarian";
  return "Standard";
}

function exportGuestCSV(elements: PreviewElement[], guests: Guest[]) {
  const TABLE_KINDS = ["table-long", "table-square", "table-round", "table-ellipse", "table-halfround"];
  const rows: string[] = [];
  rows.push(["Guest Name", "Table Name", "Seat #", "Dietary", "RSVP Status"].join(","));

  let tableIndex = 0;
  for (const el of elements) {
    if (!TABLE_KINDS.includes(el.kind)) continue;
    const tableName = el.name || `Table ${tableIndex + 1}`;
    tableIndex++;
    const guestIds = el.guestIds ?? [];
    for (let s = 0; s < guestIds.length; s++) {
      const gid = guestIds[s];
      const g = gid ? guests.find(x => x.id === gid) : null;
      const name = g ? `${g.firstName}${g.lastName ? " " + g.lastName : ""}` : "(Empty seat)";
      const dietary = g ? parseDietary(g.dietary) : "";
      const rsvp = g ? g.rsvpStatus : "";
      rows.push([
        `"${name.replace(/"/g, '""')}"`,
        `"${tableName.replace(/"/g, '""')}"`,
        String(s + 1),
        `"${dietary}"`,
        `"${rsvp}"`,
      ].join(","));
    }
  }

  const csvContent = "\uFEFF" + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "seating-chart.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Catering summary helper ──────────────────────────────────────────────────

interface CateringSummaryRow {
  tableName: string;
  total: number;
  vegan: number;
  glutenFree: number;
  vegetarian: number;
  standard: number;
}

function buildCateringSummary(elements: PreviewElement[], guests: Guest[]): CateringSummaryRow[] {
  const TABLE_KINDS = ["table-long", "table-square", "table-round", "table-ellipse", "table-halfround"];
  const rows: CateringSummaryRow[] = [];
  let idx = 0;
  for (const el of elements) {
    if (!TABLE_KINDS.includes(el.kind)) continue;
    const tableName = el.name || `Table ${idx + 1}`;
    idx++;
    const guestIds = (el.guestIds ?? []).filter(Boolean);
    let vegan = 0, glutenFree = 0, vegetarian = 0, standard = 0;
    for (const gid of guestIds) {
      const g = guests.find(x => x.id === gid);
      const cat = parseDietary(g?.dietary);
      if (cat === "Vegan") vegan++;
      else if (cat === "Gluten-free") glutenFree++;
      else if (cat === "Vegetarian") vegetarian++;
      else standard++;
    }
    rows.push({ tableName, total: guestIds.length, vegan, glutenFree, vegetarian, standard });
  }
  return rows;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeatingPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const local = isLocal(projectId);

  const { tier } = usePlannerTier(projectId);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeTab, setUpgradeTab] = useState<"premium" | "elite">("premium");

  function openUpgrade(requiredTier: "premium" | "elite") {
    setUpgradeTab(requiredTier);
    setShowUpgrade(true);
  }

  const [activeTab, setActiveTab] = useState("reception");
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ceremonyElements, setCeremonyElements] = useState<PreviewElement[] | null>(null);
  const [ceremonyVenueBg, setCeremonyVenueBg] = useState<string | null>(null);
  const [receptionVenueBg, setReceptionVenueBg] = useState<string | null>(null);
  const [atlasEditMode, setAtlasEditMode] = useState(false);
  const [cateringMode, setCateringMode] = useState(false);
  const [atlasSettings, setAtlasSettings] = useState<AtlasSettings>(() => {
    try {
      const raw = localStorage.getItem(`atlas-settings-${projectId}`);
      if (raw) return { ...DEFAULT_ATLAS_SETTINGS, ...JSON.parse(raw) } as AtlasSettings;
    } catch {}
    return DEFAULT_ATLAS_SETTINGS;
  });
  const [receptionElements, setReceptionElements] = useState<PreviewElement[] | null>(null);
  const [cardsIndex, setCardsIndex] = useState(0);
  const [cardsTables, setCardsTables] = useState<{ name: string; guestNames: string[] }[]>([]);

  const activeLayout = layouts.find(l => l.id === activeLayoutId) ?? null;

  // Load saved ceremony layout + venue bg from localStorage for preview
  useEffect(() => {
    if (activeTab !== "ceremony") return;
    try {
      const raw = localStorage.getItem(`ceremony-layout-${projectId}`);
      if (raw) setCeremonyElements(JSON.parse(raw) as PreviewElement[]);
      else setCeremonyElements(null);
    } catch {}
    setCeremonyVenueBg(localStorage.getItem(`venue-bg-ceremony-${projectId}`));
  }, [projectId, activeTab]);

  // Load saved reception layout + venue bg from localStorage for preview
  useEffect(() => {
    if (activeTab !== "reception") return;
    try {
      const raw = localStorage.getItem(`reception-layout-${projectId}`);
      if (raw) setReceptionElements(JSON.parse(raw) as PreviewElement[]);
      else setReceptionElements(null);
    } catch {}
    setReceptionVenueBg(localStorage.getItem(`venue-bg-reception-${projectId}`));
  }, [projectId, activeTab]);

  // Load table cards from reception layout
  useEffect(() => {
    if (activeTab !== "cards") return;
    try {
      const raw = localStorage.getItem(`reception-layout-${projectId}`);
      if (!raw) { setCardsTables([]); return; }
      const elements: PreviewElement[] = JSON.parse(raw);
      const TABLE_KINDS = ["table-long", "table-square", "table-round", "table-ellipse", "table-halfround"];
      const tables = elements
        .filter(el => TABLE_KINDS.includes(el.kind))
        .map((el, i) => ({
          name: el.name || `Table ${i + 1}`,
          guestNames: Array.from({ length: el.seats ?? 6 }, (_, j) => `Guest name ${j + 1}`),
        }));
      setCardsTables(tables);
      setCardsIndex(0);
    } catch {}
  }, [projectId, activeTab]);

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

  // ── Atlas layout editor mode ────────────────────────────────────────────────

  if (atlasEditMode) {
    return (
      <AtlasLayoutEditor
        guests={guests}
        layouts={layouts}
        settings={atlasSettings}
        onClose={() => setAtlasEditMode(false)}
        onSettingsChange={(s) => {
          setAtlasSettings(s);
          try { localStorage.setItem(`atlas-settings-${projectId}`, JSON.stringify(s)); } catch {}
        }}
      />
    );
  }

  // ── Preview / reference design mode ──────────────────────────────────────────

  const activeTabIndex = TABS.findIndex(t => t.id === activeTab);

  return (
    <>
    <div className="min-h-full bg-[#ede9f0] px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Seating Chart &amp; Supplies</h1>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-gray-500">
            These tools make it easy to design your seating chart and all the related details.
            Everything is connected through your guest list, so changes update automatically.
          </p>
          <div className="mt-3 flex items-center justify-center">
            <button
              onClick={() => {
                try {
                  const raw = localStorage.getItem(`reception-layout-${projectId}`);
                  if (raw) exportGuestCSV(JSON.parse(raw) as PreviewElement[], guests);
                } catch {}
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 text-purple-500" />
              Export Guest List CSV
            </button>
          </div>
        </div>

        {/* Tab cards */}
        <div className="grid grid-cols-7 gap-2">
          {TABS.map((tab, i) => {
            const isEliteTab = ELITE_TABS.includes(tab.id);
            const locked = isEliteTab && !isElite(tier);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (locked) { openUpgrade("elite"); return; }
                  setActiveTab(tab.id);
                }}
                className={cn(
                  "relative rounded-xl border px-2 py-3 text-center text-xs leading-snug transition-colors",
                  activeTab === tab.id
                    ? "border-gray-700 bg-white font-semibold text-gray-800 shadow-sm"
                    : "border-gray-200 bg-white/70 text-gray-500 hover:bg-white hover:text-gray-700"
                )}
              >
                {tab.lines.map((line, li) => <div key={li}>{line}</div>)}
                {locked && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500">
                    <Lock className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dashed curve connector */}
        <TabConnector tabIndex={activeTabIndex} />

        {/* Tab content */}
        {activeTab === "ceremony" && (
          <LayoutPanel
            title="Ceremony Layout"
            subtitle="Prepare and print your ceremony layout."
            diagram={
              ceremonyElements && ceremonyElements.length > 0
                ? <CeremonyLayoutPreview elements={ceremonyElements} guests={guests} venueImage={ceremonyVenueBg} />
                : <CeremonyDiagram />
            }
            onEdit={() => isPremiumOrElite(tier) ? router.push(`/planner/${projectId}/seating/ceremony-layout-edit`) : openUpgrade("premium")}
            photos={GALLERY.ceremony}
            pdfSvgId="ceremony-layout-svg"
            wide
          />
        )}
        {activeTab === "reception" && (
          <div>
            <LayoutPanel
              title="Reception Layout"
              subtitle="Prepare and print your reception layout."
              diagram={
                receptionElements && receptionElements.length > 0
                  ? <CeremonyLayoutPreview elements={receptionElements} guests={guests} svgId="reception-layout-svg" venueImage={receptionVenueBg} />
                  : <ReceptionDiagram />
              }
              onEdit={() => isPremiumOrElite(tier) ? router.push(`/planner/${projectId}/seating/reception-layout-edit`) : openUpgrade("premium")}
              photos={GALLERY.reception}
              pdfSvgId="reception-layout-svg"
              wide
            />

            {/* Export CSV button */}
            <div className="mx-auto mt-4 max-w-3xl flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (receptionElements) exportGuestCSV(receptionElements, guests);
                }}
                disabled={!receptionElements || receptionElements.length === 0}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                <Download className="h-4 w-4 text-purple-500" />
                Export Guest CSV
              </button>
            </div>

            {/* Catering Mode toggle */}
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold text-gray-700">Catering Mode</span>
                </div>
                <button
                  onClick={() => setCateringMode(m => !m)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    cateringMode ? "bg-purple-500" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                    cateringMode ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Show a dietary breakdown per table for catering staff.</p>

              {cateringMode && receptionElements && (
                <div className="mt-4 overflow-x-auto">
                  {(() => {
                    const summary = buildCateringSummary(receptionElements, guests);
                    if (summary.length === 0) return <p className="text-xs text-gray-400">No tables found in the reception layout.</p>;
                    return (
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-1.5 text-start font-medium">Table</th>
                            <th className="py-1.5 text-center font-medium">Total</th>
                            <th className="py-1.5 text-center font-medium">Vegan</th>
                            <th className="py-1.5 text-center font-medium">Gluten-free</th>
                            <th className="py-1.5 text-center font-medium">Vegetarian</th>
                            <th className="py-1.5 text-center font-medium">Standard</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.map((row, i) => (
                            <tr key={i} className={cn("border-b border-gray-100", i % 2 === 0 ? "bg-gray-50" : "bg-white")}>
                              <td className="py-1.5 pr-2 text-gray-700 font-medium">{row.tableName}</td>
                              <td className="py-1.5 text-center text-gray-600">{row.total}</td>
                              <td className="py-1.5 text-center text-green-600">{row.vegan || "—"}</td>
                              <td className="py-1.5 text-center text-amber-600">{row.glutenFree || "—"}</td>
                              <td className="py-1.5 text-center text-blue-600">{row.vegetarian || "—"}</td>
                              <td className="py-1.5 text-center text-gray-500">{row.standard || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* QR Entrance Mode */}
            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold text-gray-700">QR Entrance Mode</p>
              <p className="mb-3 text-xs text-gray-400">Share this link with venue staff to look up guests on arrival.</p>
              <div className="flex items-start gap-4">
                <div className="flex-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                  <p className="break-all font-mono text-xs text-gray-600">{`${typeof window !== "undefined" ? window.location.origin : ""}/seat-finder/${projectId}`}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/seat-finder/${projectId}`;
                      navigator.clipboard.writeText(url).catch(() => {});
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Copy link
                  </button>
                  <a
                    href={`/seat-finder/${projectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                  >
                    Open Entrance Scanner
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "atlas" && (
          <AlphabeticalAtlasPanel
            guests={guests}
            layouts={layouts}
            settings={atlasSettings}
            onEditLayout={() => setAtlasEditMode(true)}
          />
        )}
        {activeTab === "cards" && (
          <SeatingCardsPanel
            tables={cardsTables}
            currentIndex={cardsIndex}
            onPrev={() => setCardsIndex(i => Math.max(0, i - 1))}
            onNext={() => setCardsIndex(i => Math.min(Math.max(cardsTables.length - 1, 0), i + 1))}
            onEdit={() => isPremiumOrElite(tier) ? router.push(`/planner/${projectId}/seating/cards-edit`) : openUpgrade("premium")}
          />
        )}
        {activeTab === "name-cards" && (
          <NameCardsPanel guests={guests} layouts={layouts} projectId={projectId} />
        )}
        {activeTab === "table-numbers" && (
          <TableNumbersPanel projectId={projectId} />
        )}
        {activeTab === "menu" && (
          <ReceptionMenuPanel
            projectId={projectId}
            onEdit={() => isElite(tier) ? router.push(`/planner/${projectId}/seating/menu-edit`) : openUpgrade("elite")}
          />
        )}

      </div>
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab={upgradeTab} />
    </>
  );
}
