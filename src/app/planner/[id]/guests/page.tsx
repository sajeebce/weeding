"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Upload, Plus, Trash2, ChevronDown, FileSpreadsheet, FileText, Link2, Copy, Check, X, QrCode, Star, Users, UserCheck, CheckSquare, Square, Table2, MessageSquarePlus, Smartphone, UtensilsCrossed } from "lucide-react";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import {
  getLocalGuests,
  addLocalGuest,
  updateLocalGuest,
  deleteLocalGuest,
  getLocalFamilies,
  addLocalFamily,
  updateLocalFamily,
  deleteLocalFamily,
  type LocalGuestFamily,
} from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerCouple } from "@/lib/planner-context";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";

type ViewMode = "two-sides" | "alphabetic" | "full-table" | "by-family";

type GuestRelation =
  | "BRIDE" | "GROOM"
  | "MAID_OF_HONOR" | "MATRON_OF_HONOR" | "BRIDESMAID"
  | "BEST_MAN" | "GROOMSMAN"
  | "PARENT" | "CLOSE_RELATIVE" | "RELATIVE"
  | "CLOSE_FRIEND" | "FRIEND" | "PARTNER" | "OTHER";

type GuestSide = "BRIDE" | "GROOM";
type RsvpStatus = "PENDING" | "ATTENDING" | "NOT_ATTENDING";

interface Guest {
  id: string;
  projectId: string;
  firstName: string;
  lastName: string | null;
  title: string | null;
  side: GuestSide;
  relation: GuestRelation;
  email: string | null;
  phone: string | null;
  dietary: string | null;
  rsvpStatus: RsvpStatus;
  tableNumber: number | null;
  notes: string | null;
  rsvpToken: string | null;
  // Task 22 — Plus-one
  hasPlusOne: boolean;
  plusOneName: string | null;
  plusOneMeal: string | null;
  // Task 23 — Chief guest
  isChiefGuest: boolean;
  // Task 24 — Family grouping
  familyId: string | null;
  // Task 26 — Table invitation
  invitationCode: string | null;
  invitationSent: boolean;
  invitationSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type RsvpQuestionType = "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

interface RsvpQuestion {
  id: string;
  projectId: string;
  text: string;
  type: RsvpQuestionType;
  options: string[] | null;
  required: boolean;
  order: number;
}

// ── RSVP Link Modal ────────────────────────────────────────────────────────────
function RsvpLinkModal({
  guestName,
  url,
  onClose,
}: {
  guestName: string;
  url: string;
  onClose: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 240, margin: 2 })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch(console.error);
  }, [url]);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">RSVP Link</h3>
            <p className="mt-0.5 text-xs text-gray-400">{guestName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* QR Code */}
        {qrDataUrl ? (
          <div className="mb-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="RSVP QR Code" className="h-40 w-40 rounded-xl" />
          </div>
        ) : (
          <div className="mb-4 flex h-40 items-center justify-center">
            <QrCode className="h-8 w-8 animate-pulse text-gray-300" />
          </div>
        )}

        {/* URL + Copy */}
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
          <span className="flex-1 truncate text-xs text-gray-500">{url}</span>
          <button
            onClick={handleCopy}
            className={cn(
              "flex-shrink-0 rounded-lg p-1.5 transition-colors",
              copied ? "bg-green-100 text-green-600" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-gray-400">
          Share this link or QR code with your guest so they can RSVP online.
        </p>
      </div>
    </>
  );
}

type TFunc = (key: string) => string;

function getBrideRelations(t: TFunc): { value: GuestRelation; label: string }[] {
  return [
    { value: "BRIDE",          label: t("rel.bride") },
    { value: "MAID_OF_HONOR",  label: t("rel.maidOfHonor") },
    { value: "MATRON_OF_HONOR",label: t("rel.matronOfHonor") },
    { value: "BRIDESMAID",     label: t("rel.bridesmaid") },
    { value: "PARENT",         label: t("rel.parent") },
    { value: "CLOSE_RELATIVE", label: t("rel.closeRelative") },
    { value: "RELATIVE",       label: t("rel.relative") },
    { value: "CLOSE_FRIEND",   label: t("rel.closeFriend") },
    { value: "FRIEND",         label: t("rel.friend") },
    { value: "PARTNER",        label: t("rel.partner") },
    { value: "OTHER",          label: t("rel.other") },
  ];
}

function getGroomRelations(t: TFunc): { value: GuestRelation; label: string }[] {
  return [
    { value: "GROOM",          label: t("rel.groom") },
    { value: "BEST_MAN",       label: t("rel.bestMan") },
    { value: "GROOMSMAN",      label: t("rel.groomsman") },
    { value: "PARENT",         label: t("rel.parent") },
    { value: "CLOSE_RELATIVE", label: t("rel.closeRelative") },
    { value: "RELATIVE",       label: t("rel.relative") },
    { value: "CLOSE_FRIEND",   label: t("rel.closeFriend") },
    { value: "FRIEND",         label: t("rel.friend") },
    { value: "PARTNER",        label: t("rel.partner") },
    { value: "OTHER",          label: t("rel.other") },
  ];
}

function getTitles(t: TFunc): string[] {
  return [
    t("title.rev"), t("title.dr"), t("title.sir"),
    t("title.mr"), t("title.mister"),
    t("title.mrs"), t("title.ms"), t("title.miss"),
    t("title.madam"), t("rel.noFormalities"),
  ];
}

const RSVP_COLORS: Record<RsvpStatus, string> = {
  PENDING: "text-gray-400",
  ATTENDING: "text-green-600",
  NOT_ATTENDING: "text-red-500",
};

function relationLabel(rel: GuestRelation, t: TFunc): string {
  const key: Record<GuestRelation, string> = {
    BRIDE: "rel.bride", GROOM: "rel.groom",
    MAID_OF_HONOR: "rel.maidOfHonor", MATRON_OF_HONOR: "rel.matronOfHonor", BRIDESMAID: "rel.bridesmaid",
    BEST_MAN: "rel.bestMan", GROOMSMAN: "rel.groomsman",
    PARENT: "rel.parent", CLOSE_RELATIVE: "rel.closeRelative", RELATIVE: "rel.relative",
    CLOSE_FRIEND: "rel.closeFriend", FRIEND: "rel.friend", PARTNER: "rel.partner", OTHER: "rel.other",
  };
  return t(key[rel] ?? rel);
}

function displayFullName(g: Guest) {
  return [g.title, g.firstName, g.lastName].filter(Boolean).join(" ");
}

// ── Title Dropdown ────────────────────────────────────────────────────────────
function TitleDropdown({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const titles = getTitles(t);
  const noFormalitiesLabel = t("rel.noFormalities");
  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-0.5 border-r border-gray-200 px-2 py-1 text-sm text-gray-500 hover:text-black bg-gray-50 rounded-l transition-colors"
      >
        <span>{value || "…"}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
            {titles.map((title) => (
              <button
                key={title}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(title === noFormalitiesLabel ? null : title); setOpen(false); }}
                className={cn(
                  "flex w-full items-center px-4 py-1.5 text-sm hover:bg-gray-50",
                  (value === title || (title === noFormalitiesLabel && !value)) ? "bg-gray-50 font-semibold text-black" : "text-gray-700"
                )}
              >
                {title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Add Guest Dropdown ────────────────────────────────────────────────────────
function AddGuestButton({ side, onSelect }: { side: GuestSide; onSelect: (rel: GuestRelation) => void }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const relations = side === "BRIDE" ? getBrideRelations(t) : getGroomRelations(t);
  return (
    <div className="relative mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 transition-colors py-1"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("guests.addGuest")}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
            {relations.map((rel) => (
              <button
                key={rel.value}
                onClick={() => { onSelect(rel.value); setOpen(false); }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
              >
                {rel.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Combined Add Guest Button (single button with bride/groom submenus) ────────
function AddGuestButtonCombined({ onSelect }: { onSelect: (side: GuestSide, rel: GuestRelation) => void }) {
  const [open, setOpen] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<GuestSide | null>(null);
  const { t } = useLanguage();

  const sides = [
    { side: "BRIDE" as GuestSide, label: t("guests.brideGuests"), relations: getBrideRelations(t) },
    { side: "GROOM" as GuestSide, label: t("guests.groomGuests"), relations: getGroomRelations(t) },
  ];

  return (
    <div className="relative mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 transition-colors py-1"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("guests.addGuest")}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setHoveredSide(null); }} />
          <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
            {sides.map(({ side, label, relations }) => (
              <div
                key={side}
                className="relative"
                onMouseEnter={() => setHoveredSide(side)}
                onMouseLeave={() => setHoveredSide(null)}
              >
                <button className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black">
                  {label}
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-gray-400" />
                </button>
                {hoveredSide === side && (
                  <div className="absolute left-full top-0 z-30 ml-0.5 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    {relations.map((rel) => (
                      <button
                        key={rel.value}
                        onClick={() => { onSelect(side, rel.value); setOpen(false); setHoveredSide(null); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black"
                      >
                        {rel.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Guest Row ─────────────────────────────────────────────────────────────────
function GuestRow({
  guest,
  onUpdate,
  onDelete,
  onShareRsvp,
}: {
  guest: Guest;
  onUpdate: (id: string, data: Partial<Guest>) => void;
  onDelete: (id: string) => void;
  onShareRsvp?: (guest: Guest) => void;
}) {
  const isEmpty = !guest.firstName;
  const [editing, setEditing] = useState(isEmpty);
  const { t } = useLanguage();
  const [fullName, setFullName] = useState([guest.firstName, guest.lastName].filter(Boolean).join(" ") || "");
  const [title, setTitle] = useState<string | null>(guest.title ?? null);
  const [plusOneExpanded, setPlusOneExpanded] = useState(guest.hasPlusOne);
  const [plusOneName, setPlusOneName] = useState(guest.plusOneName ?? "");
  const [plusOneMeal, setPlusOneMeal] = useState(guest.plusOneMeal ?? "");

  function handleTitleChange(v: string | null) {
    setTitle(v);
    onUpdate(guest.id, { title: v });
  }

  function save() {
    const trimmed = fullName.trim();
    if (!trimmed) return;
    const parts = trimmed.split(" ");
    onUpdate(guest.id, { firstName: parts[0], lastName: parts.slice(1).join(" ") || null, title });
    setEditing(false);
  }

  function cycleRsvp() {
    const order: RsvpStatus[] = ["PENDING", "ATTENDING", "NOT_ATTENDING"];
    const next = order[(order.indexOf(guest.rsvpStatus) + 1) % order.length];
    onUpdate(guest.id, { rsvpStatus: next });
  }

  const DIETARY_OPTIONS = [null, "Vegetarian", "Vegan", "Gluten-free", "Halal"];
  const DIETARY_COLORS: Record<string, string> = {
    "Vegetarian": "text-green-600",
    "Vegan": "text-emerald-600",
    "Gluten-free": "text-orange-500",
    "Halal": "text-blue-500",
  };
  function cycleDietary() {
    const cur = guest.dietary ?? null;
    const idx = DIETARY_OPTIONS.findIndex(o => o === cur);
    const next = DIETARY_OPTIONS[(idx + 1) % DIETARY_OPTIONS.length];
    onUpdate(guest.id, { dietary: next });
  }

  function toggleChiefGuest() {
    onUpdate(guest.id, { isChiefGuest: !guest.isChiefGuest });
  }

  function togglePlusOne() {
    const newVal = !guest.hasPlusOne;
    setPlusOneExpanded(newVal);
    onUpdate(guest.id, { hasPlusOne: newVal, plusOneName: newVal ? plusOneName || null : null, plusOneMeal: newVal ? plusOneMeal || null : null });
  }

  function savePlusOne() {
    onUpdate(guest.id, { plusOneName: plusOneName.trim() || null, plusOneMeal: plusOneMeal.trim() || null });
  }

  return (
    <div className="group border-b border-gray-100 last:border-0 py-2.5">
      <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
        {relationLabel(guest.relation, t)}
        {guest.isChiefGuest && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
            <Star className="h-2.5 w-2.5 fill-amber-500" /> Chief
          </span>
        )}
      </p>
      {editing ? (
        <div className="flex items-center rounded border border-gray-200 focus-within:border-indigo-300">
          <TitleDropdown value={title} onChange={handleTitleChange} />
          <input
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="First and last name"
            className="flex-1 px-2 py-1 text-sm text-black outline-none bg-transparent"
          />
          <button
            onMouseDown={(e) => { e.preventDefault(); onDelete(guest.id); }}
            className="px-2 text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-gray-800 hover:text-indigo-600 text-left transition-colors"
          >
            {displayFullName(guest) || <span className="italic text-gray-300">—</span>}
            {guest.hasPlusOne && (
              <span className="ml-1.5 text-[10px] text-indigo-400 font-medium">+1{guest.plusOneName ? ` (${guest.plusOneName})` : ""}</span>
            )}
          </button>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Chief guest toggle */}
            <button
              onClick={toggleChiefGuest}
              title={guest.isChiefGuest ? "Remove chief guest" : "Mark as chief guest"}
              className={cn("transition-colors", guest.isChiefGuest ? "text-amber-500" : "text-gray-300 hover:text-amber-400")}
            >
              <Star className={cn("h-3.5 w-3.5", guest.isChiefGuest && "fill-amber-500")} />
            </button>
            {/* Plus-one toggle */}
            <button
              onClick={togglePlusOne}
              title={guest.hasPlusOne ? "Remove +1" : "Add +1"}
              className={cn("text-xs font-bold transition-colors", guest.hasPlusOne ? "text-indigo-500" : "text-gray-300 hover:text-indigo-400")}
            >
              +1
            </button>
            {/* Dietary toggle */}
            <button
              onClick={cycleDietary}
              title={`Dietary: ${guest.dietary ?? "None"} — click to cycle`}
              className={cn("flex items-center gap-0.5 text-xs font-medium transition-colors", guest.dietary ? DIETARY_COLORS[guest.dietary] ?? "text-gray-500" : "text-gray-300 hover:text-green-500")}
            >
              <UtensilsCrossed className="h-3 w-3" />
              {guest.dietary ? <span>{guest.dietary}</span> : null}
            </button>
            <button onClick={cycleRsvp} className={cn("text-xs font-medium transition-colors", RSVP_COLORS[guest.rsvpStatus])}>
              {guest.rsvpStatus === "PENDING" ? t("guests.pending") : guest.rsvpStatus === "ATTENDING" ? t("guests.attending") : t("guests.declined")}
            </button>
            {onShareRsvp && (
              <button onClick={() => onShareRsvp(guest)} className="text-gray-300 hover:text-indigo-400 transition-colors" title="RSVP Link">
                <Link2 className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={() => onDelete(guest.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Plus-one expanded section */}
      {plusOneExpanded && (
        <div className="mt-2 ml-3 flex items-center gap-2 rounded-lg bg-indigo-50/60 px-3 py-2">
          <UserCheck className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" />
          <input
            value={plusOneName}
            onChange={(e) => setPlusOneName(e.target.value)}
            onBlur={savePlusOne}
            onKeyDown={(e) => e.key === "Enter" && savePlusOne()}
            placeholder="+1 name"
            className="flex-1 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
          />
          <span className="text-gray-300">·</span>
          <input
            value={plusOneMeal}
            onChange={(e) => setPlusOneMeal(e.target.value)}
            onBlur={savePlusOne}
            onKeyDown={(e) => e.key === "Enter" && savePlusOne()}
            placeholder="Meal preference"
            className="w-28 bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none"
          />
        </div>
      )}
    </div>
  );
}

// ── Guidelines Panel ──────────────────────────────────────────────────────────
const GUIDELINES = [
  {
    id: "intro",
    emoji: "🔔",
    title: "Introduction",
    content: (
      <>
        <p>The <strong>guest list</strong> is the core of your wedding project. It helps you manage everyone invited to your special day — tracking RSVPs, relations, table numbers, and dietary needs.</p>
        <p className="mt-2">The guest list is split into two sides: <strong>Bride&apos;s guests</strong> and <strong>Groom&apos;s guests</strong>. You can switch between three views to work the way you prefer.</p>
      </>
    ),
  },
  {
    id: "views",
    emoji: "👁️",
    title: "Views",
    content: (
      <>
        <p>The guest list has three views — they all show the same data, just in a different layout:</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><strong>Two Sides</strong> — Shows bride&apos;s and groom&apos;s guests in two side-by-side columns. Great for adding guests quickly.</li>
          <li><strong>Alphabetic</strong> — Groups all guests A–Z. Useful for finding someone fast.</li>
          <li><strong>Full Table</strong> — Shows every guest in a table with their side, relation, and RSVP status at a glance.</li>
        </ul>
      </>
    ),
  },
  {
    id: "adding",
    emoji: "➕",
    title: "Adding guests",
    content: (
      <>
        <p>In the <strong>Two Sides</strong> view, click <strong>+ Add guest</strong> under either column. A dropdown lets you choose the guest&apos;s relation to the bride or groom (e.g. Parent, Friend, Bridesmaid).</p>
        <p className="mt-2">Type the guest&apos;s full name and press <strong>Enter</strong> to save. You can also pick a title (Mr., Mrs., Dr., etc.) from the dropdown.</p>
      </>
    ),
  },
  {
    id: "import",
    emoji: "📥",
    title: "Import a guest list",
    content: (
      <>
        <p>Already have your list in a spreadsheet? Click <strong>Import guest list</strong> and upload a <strong>CSV or XLS/XLSX</strong> file.</p>
        <p className="mt-2">Your file must have a <strong>First Name</strong> column (or <code className="rounded bg-gray-100 px-1 text-xs">first_name</code> / <code className="rounded bg-gray-100 px-1 text-xs">name</code>). Other supported columns:</p>
        <ul className="mt-1 space-y-0.5 text-sm text-gray-500">
          <li>Last Name · Title · Side (BRIDE or GROOM)</li>
          <li>Email · Phone · Dietary · Notes</li>
        </ul>
        <p className="mt-2 text-xs text-gray-400">All imported guests get RSVP status "Pending" by default. Guests without a Side are assigned to Bride.</p>
      </>
    ),
  },
  {
    id: "export",
    emoji: "📤",
    title: "Export guest list",
    content: (
      <>
        <p>Use the download buttons at the bottom of the page to export:</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><strong>Download PDF</strong> — A formatted A4 document with two sections (bride/groom), RSVP colors, and an attendance summary. Great for printing or sharing.</li>
          <li><strong>Download XLS</strong> — A full spreadsheet with all guest fields for further editing.</li>
          <li><strong>Export CSV</strong> — A plain-text comma-separated file compatible with any app.</li>
        </ul>
      </>
    ),
  },
  {
    id: "rsvp",
    emoji: "✅",
    title: "Managing RSVPs",
    content: (
      <>
        <p>Each guest has one of three RSVP statuses:</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li><span className="font-medium text-gray-400">Pending</span> — No response yet (default).</li>
          <li><span className="font-medium text-green-600">Attending</span> — Guest confirmed they will come.</li>
          <li><span className="font-medium text-red-500">Declined</span> — Guest cannot attend.</li>
        </ul>
        <p className="mt-2">Hover over a guest&apos;s name in any view and click their RSVP status to cycle through the three options. In the Full Table view, the status is always visible.</p>
      </>
    ),
  },
  {
    id: "search",
    emoji: "🔍",
    title: "Search & Filter",
    content: (
      <>
        <p>Use the <strong>search box</strong> to find a guest by name or email instantly.</p>
        <p className="mt-2">Use the <strong>RSVP filter</strong> buttons (All / Attending / Pending / Declined) to focus on a specific group — for example, to quickly see who still hasn&apos;t responded.</p>
        <p className="mt-2 text-xs text-gray-400">The summary at the bottom always shows total counts from your <em>full</em> list, not just the filtered view.</p>
      </>
    ),
  },
];

function GuidelinesPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold leading-snug text-gray-900 pr-4">
            Guidelines on How to Use the Guest List
          </h2>
          <button
            onClick={onClose}
            className="mt-0.5 flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-gray-600">
          {/* Table of contents */}
          <ul className="mb-6 space-y-1">
            {GUIDELINES.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => {
                    setActiveSection(g.id);
                    document.getElementById(`guide-${g.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-gray-50",
                    activeSection === g.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-500"
                  )}
                >
                  <span className="text-base">{g.emoji}</span>
                  {g.title}
                </button>
              </li>
            ))}
          </ul>

          {/* Sections */}
          <div className="space-y-8">
            {GUIDELINES.map((g) => (
              <div key={g.id} id={`guide-${g.id}`}>
                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-800">
                  <span>{g.emoji}</span>
                  {g.title}
                </h3>
                <div className="leading-relaxed text-gray-600">{g.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Bride SVG (human silhouette: head + veil + dress) ─────────────────────────
function BrideIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Veil — flows from head to the right */}
      <path d="M33 5 Q47 3 50 17 Q48 21 45 19 Q45 11 36 8 L33 6Z" fill="url(#brdF)" opacity="0.45"/>
      {/* Head */}
      <circle cx="31" cy="11" r="7" fill="url(#brdF)"/>
      {/* Neck */}
      <rect x="29" y="18" width="4" height="5" rx="1.5" fill="url(#brdF)"/>
      {/* Left arm */}
      <path d="M24 26 C21 30 18 35 17 40 L20 41 C21 36 24 31 27 28Z" fill="url(#brdF)"/>
      {/* Right arm */}
      <path d="M38 26 C41 30 44 35 45 40 L42 41 C41 36 38 31 35 28Z" fill="url(#brdF)"/>
      {/* Dress: fitted bodice narrowing to waist, then wide bell skirt */}
      <path d="M25 23 C23 27 21 31 22 36 L6 61 L56 61 L42 36 C43 31 41 27 39 23 Q35 27 31 27 Q27 27 25 23Z" fill="url(#brdF)"/>
      {/* Waist ribbon */}
      <path d="M22 36 Q31.5 40 42 36" stroke="url(#brdS)" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Bouquet (small cluster of circles) */}
      <circle cx="15" cy="42" r="3" fill="url(#brdF)" opacity="0.6"/>
      <circle cx="12" cy="39" r="2" fill="url(#brdF)" opacity="0.4"/>
      <circle cx="18" cy="39" r="2" fill="url(#brdF)" opacity="0.45"/>
      <defs>
        <linearGradient id="brdF" x1="6" y1="0" x2="56" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fda4af"/><stop offset="1" stopColor="#c084fc"/>
        </linearGradient>
        <linearGradient id="brdS" x1="6" y1="36" x2="56" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f43f5e"/><stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Groom SVG (human silhouette: head + suit + two legs) ──────────────────────
function GroomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="32" cy="10" r="7" fill="url(#grmF)"/>
      {/* Neck + collar points */}
      <path d="M29 17 L27 23 L32 21 L37 23 L35 17Z" fill="url(#grmF)"/>
      {/* Left arm */}
      <path d="M22 25 C18 30 15 36 14 42 L17 43 C18 37 21 31 25 27Z" fill="url(#grmF)"/>
      {/* Right arm */}
      <path d="M42 25 C46 30 49 36 50 42 L47 43 C46 37 43 31 39 27Z" fill="url(#grmF)"/>
      {/* Jacket body */}
      <path d="M22 23 L18 43 L46 43 L42 23 Q37 27 32 27 Q27 27 22 23Z" fill="url(#grmF)"/>
      {/* Left trouser leg */}
      <path d="M18 43 L16 62 L29 62 L30 43Z" fill="url(#grmF)"/>
      {/* Right trouser leg */}
      <path d="M34 43 L35 62 L48 62 L46 43Z" fill="url(#grmF)"/>
      {/* Left lapel */}
      <path d="M27 23 L23 35 L32 30Z" fill="url(#grmD)"/>
      {/* Right lapel */}
      <path d="M37 23 L41 35 L32 30Z" fill="url(#grmD)"/>
      {/* Bow tie */}
      <path d="M29 22 L32 25 L35 22 L32 19Z" fill="white" opacity="0.85"/>
      {/* Shirt buttons */}
      <circle cx="32" cy="36" r="1.2" fill="white" opacity="0.6"/>
      <circle cx="32" cy="42" r="1.2" fill="white" opacity="0.6"/>
      <defs>
        <linearGradient id="grmF" x1="14" y1="0" x2="50" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#93c5fd"/><stop offset="1" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="grmD" x1="14" y1="20" x2="50" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6"/><stop offset="1" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GuestListPage() {
  const params = useParams();
  const projectId = params.id as string;
  const isLocal = projectId.startsWith("local-");

  const { t } = useLanguage();
  const { brideName, groomName, updateBrideName, updateGroomName } = usePlannerCouple();
  const { tier } = usePlannerTier(projectId);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("alphabetic");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [families, setFamilies] = useState<LocalGuestFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<"ALL" | RsvpStatus>("ALL");
  const [rsvpModal, setRsvpModal] = useState<{ guestName: string; url: string } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  // Task 24 — Family modal
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState("");
  const [editingFamily, setEditingFamily] = useState<LocalGuestFamily | null>(null);
  // Task 25 — Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTableInput, setBulkTableInput] = useState("");
  const [bulkFamilyId, setBulkFamilyId] = useState("");
  // Task 9 — RSVP Questions
  const [rsvpQuestions, setRsvpQuestions] = useState<RsvpQuestion[]>([]);
  const [rsvpQuestionsOpen, setRsvpQuestionsOpen] = useState(false);
  const [newQText, setNewQText] = useState("");
  const [newQType, setNewQType] = useState<RsvpQuestionType>("SHORT_TEXT");
  const [newQRequired, setNewQRequired] = useState(false);
  const [newQOptions, setNewQOptions] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<RsvpQuestion | null>(null);
  const [editQText, setEditQText] = useState("");
  const [editQOptions, setEditQOptions] = useState("");
  const [editQRequired, setEditQRequired] = useState(false);
  // Task 11 — SMS sending state
  const [smsSending, setSmsSending] = useState<string | null>(null); // guestId

  const loadGuests = useCallback(async () => {
    if (isLocal) {
      setGuests(getLocalGuests(projectId) as Guest[]);
      setFamilies(getLocalFamilies(projectId) as LocalGuestFamily[]);
      setLoading(false);
      return;
    }
    try {
      const [gRes, fRes] = await Promise.all([
        fetch(`/api/planner/projects/${projectId}/guests`),
        fetch(`/api/planner/projects/${projectId}/families`),
      ]);
      if (gRes.ok) setGuests((await gRes.json()).guests);
      if (fRes.ok) setFamilies((await fRes.json()).families);
    } catch {}
    setLoading(false);
  }, [projectId, isLocal]);

  useEffect(() => { loadGuests(); }, [loadGuests]);

  const loadRsvpQuestions = useCallback(async () => {
    if (isLocal) return;
    try {
      const res = await fetch(`/api/planner/projects/${projectId}/rsvp-questions`);
      if (res.ok) setRsvpQuestions((await res.json()).questions);
    } catch {}
  }, [projectId, isLocal]);

  useEffect(() => { loadRsvpQuestions(); }, [loadRsvpQuestions]);

  async function handleAddQuestion() {
    if (!newQText.trim()) return;
    const needsOptions = newQType === "SINGLE_CHOICE" || newQType === "MULTIPLE_CHOICE";
    const options = needsOptions
      ? newQOptions.split("\n").map((o) => o.trim()).filter(Boolean)
      : null;
    const res = await fetch(`/api/planner/projects/${projectId}/rsvp-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newQText, type: newQType, options, required: newQRequired }),
    });
    if (res.ok) {
      const data = await res.json();
      setRsvpQuestions((p) => [...p, data.question]);
      setNewQText("");
      setNewQOptions("");
      setNewQRequired(false);
      setNewQType("SHORT_TEXT");
    }
  }

  async function handleUpdateQuestion(q: RsvpQuestion) {
    const needsOptions = q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE";
    const options = needsOptions
      ? editQOptions.split("\n").map((o) => o.trim()).filter(Boolean)
      : null;
    const res = await fetch(
      `/api/planner/projects/${projectId}/rsvp-questions/${q.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editQText, options, required: editQRequired }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      setRsvpQuestions((p) => p.map((x) => (x.id === q.id ? data.question : x)));
      setEditingQuestion(null);
    }
  }

  async function handleDeleteQuestion(id: string) {
    const res = await fetch(
      `/api/planner/projects/${projectId}/rsvp-questions/${id}`,
      { method: "DELETE" }
    );
    if (res.ok) setRsvpQuestions((p) => p.filter((q) => q.id !== id));
  }

  async function handleSendSms(guest: Guest) {
    if (!guest.phone) {
      alert("This guest has no phone number saved.");
      return;
    }
    setSmsSending(guest.id);
    try {
      const res = await fetch(
        `/api/planner/projects/${projectId}/guests/${guest.id}/sms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseUrl: window.location.origin }),
        }
      );
      const data = await res.json();
      if (!res.ok) alert(data.error ?? "SMS failed");
      else alert(`SMS sent to ${data.to}`);
    } catch {
      alert("SMS delivery failed");
    } finally {
      setSmsSending(null);
    }
  }

  // Sync context brideName → BRIDE guest display (overview → guest list)
  useEffect(() => {
    if (!brideName) return;
    setGuests(prev => prev.map(g => {
      if (g.relation !== "BRIDE") return g;
      const parts = brideName.trim().split(" ").filter(Boolean);
      const newFirst = parts[0] || g.firstName;
      const newLast = parts.slice(1).join(" ") || null;
      if (newFirst === g.firstName && newLast === g.lastName) return g;
      return { ...g, firstName: newFirst, lastName: newLast };
    }));
  }, [brideName]);

  useEffect(() => {
    if (!groomName) return;
    setGuests(prev => prev.map(g => {
      if (g.relation !== "GROOM") return g;
      const parts = groomName.trim().split(" ").filter(Boolean);
      const newFirst = parts[0] || g.firstName;
      const newLast = parts.slice(1).join(" ") || null;
      if (newFirst === g.firstName && newLast === g.lastName) return g;
      return { ...g, firstName: newFirst, lastName: newLast };
    }));
  }, [groomName]);

  async function handleAdd(side: GuestSide, relation: GuestRelation) {
    if (isLocal) {
      const g = addLocalGuest(projectId, {
        firstName: "", lastName: null, title: null, side, relation, email: null,
        phone: null, dietary: null, rsvpStatus: "PENDING", tableNumber: null, notes: null,
        hasPlusOne: false, plusOneName: null, plusOneMeal: null,
        isChiefGuest: false, familyId: null,
        invitationCode: null, invitationSent: false, invitationSentAt: null,
      }) as Guest;
      setGuests((p) => [...p, g]);
      return;
    }
    try {
      const res = await fetch(`/api/planner/projects/${projectId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: "", side, relation }),
      });
      if (res.ok) { const data = await res.json(); setGuests((p) => [...p, data.guest]); }
    } catch {}
  }

  async function handleUpdate(guestId: string, data: Partial<Guest>) {
    setGuests((p) => p.map((g) => g.id === guestId ? { ...g, ...data } : g));

    // Sync BRIDE/GROOM name to context (guest list → overview)
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const guest = guests.find(g => g.id === guestId);
      if (guest) {
        const updated = { ...guest, ...data };
        const fullName = [updated.firstName, updated.lastName].filter(Boolean).join(" ");
        if (guest.relation === "BRIDE") updateBrideName(fullName, projectId, isLocal);
        else if (guest.relation === "GROOM") updateGroomName(fullName, projectId, isLocal);
      }
    }

    if (isLocal) { updateLocalGuest(projectId, guestId, data); return; }
    try {
      await fetch(`/api/planner/projects/${projectId}/guests/${guestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {}
  }

  async function handleDelete(guestId: string) {
    setGuests((p) => p.filter((g) => g.id !== guestId));
    if (isLocal) { deleteLocalGuest(projectId, guestId); return; }
    try {
      await fetch(`/api/planner/projects/${projectId}/guests/${guestId}`, { method: "DELETE" });
    } catch {}
  }

  async function handleShareRsvp(guest: Guest) {
    if (isLocal) return; // RSVP links require DB-backed guests
    try {
      // Use cached token if already fetched, or request from server
      let token = guest.rsvpToken;
      if (!token) {
        const res = await fetch(`/api/planner/projects/${projectId}/guests/${guest.id}/token`, { method: "POST" });
        if (!res.ok) return;
        const data = await res.json();
        token = data.token;
        // Cache in local state
        setGuests((p) => p.map((g) => g.id === guest.id ? { ...g, rsvpToken: token as string } : g));
      }
      const guestName = [guest.title, guest.firstName, guest.lastName].filter(Boolean).join(" ");
      const url = `${window.location.origin}/rsvp/${token}`;
      setRsvpModal({ guestName, url });
    } catch {}
  }

  // ── Family CRUD ────────────────────────────────────────────────────────────
  async function handleCreateFamily() {
    const name = newFamilyName.trim();
    if (!name) return;
    if (isLocal) {
      const f = addLocalFamily(projectId, name) as LocalGuestFamily;
      setFamilies((p) => [...p, f]);
    } else {
      try {
        const res = await fetch(`/api/planner/projects/${projectId}/families`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) { const data = await res.json(); setFamilies((p) => [...p, data.family]); }
      } catch {}
    }
    setNewFamilyName("");
    setFamilyModalOpen(false);
  }

  async function handleRenameFamily(familyId: string, name: string) {
    if (isLocal) {
      const f = updateLocalFamily(projectId, familyId, name);
      if (f) setFamilies((p) => p.map((x) => x.id === familyId ? f as LocalGuestFamily : x));
    } else {
      try {
        const res = await fetch(`/api/planner/projects/${projectId}/families/${familyId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) setFamilies((p) => p.map((x) => x.id === familyId ? { ...x, name } : x));
      } catch {}
    }
    setEditingFamily(null);
  }

  async function handleDeleteFamily(familyId: string) {
    if (isLocal) {
      deleteLocalFamily(projectId, familyId);
      setGuests((p) => p.map((g) => g.familyId === familyId ? { ...g, familyId: null } : g));
    } else {
      try {
        await fetch(`/api/planner/projects/${projectId}/families/${familyId}`, { method: "DELETE" });
        setGuests((p) => p.map((g) => g.familyId === familyId ? { ...g, familyId: null } : g));
      } catch {}
    }
    setFamilies((p) => p.filter((f) => f.id !== familyId));
  }

  // ── Bulk Actions ───────────────────────────────────────────────────────────
  function toggleSelect(guestId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(guestId) ? next.delete(guestId) : next.add(guestId);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map((g) => g.id)));
    }
  }

  async function handleBulkAction(action: string) {
    const guestIds = Array.from(selectedIds);
    if (guestIds.length === 0) return;

    if (action === "delete") {
      if (!confirm(`Delete ${guestIds.length} selected guest(s)?`)) return;
    }

    if (isLocal) {
      if (action === "assign_table" && bulkTableInput) {
        const t = Number(bulkTableInput);
        guestIds.forEach((id) => updateLocalGuest(projectId, id, { tableNumber: t }));
        setGuests((p) => p.map((g) => selectedIds.has(g.id) ? { ...g, tableNumber: t } : g));
      } else if (action === "assign_family" && bulkFamilyId) {
        guestIds.forEach((id) => updateLocalGuest(projectId, id, { familyId: bulkFamilyId }));
        setGuests((p) => p.map((g) => selectedIds.has(g.id) ? { ...g, familyId: bulkFamilyId } : g));
      } else if (action === "delete") {
        guestIds.forEach((id) => deleteLocalGuest(projectId, id));
        setGuests((p) => p.filter((g) => !selectedIds.has(g.id)));
      } else if (action === "mark_attending") {
        guestIds.forEach((id) => updateLocalGuest(projectId, id, { rsvpStatus: "ATTENDING" }));
        setGuests((p) => p.map((g) => selectedIds.has(g.id) ? { ...g, rsvpStatus: "ATTENDING" } : g));
      } else if (action === "mark_not_attending") {
        guestIds.forEach((id) => updateLocalGuest(projectId, id, { rsvpStatus: "NOT_ATTENDING" }));
        setGuests((p) => p.map((g) => selectedIds.has(g.id) ? { ...g, rsvpStatus: "NOT_ATTENDING" } : g));
      } else if (action === "mark_pending") {
        guestIds.forEach((id) => updateLocalGuest(projectId, id, { rsvpStatus: "PENDING" }));
        setGuests((p) => p.map((g) => selectedIds.has(g.id) ? { ...g, rsvpStatus: "PENDING" } : g));
      }
    } else {
      try {
        const body: Record<string, unknown> = { guestIds, action };
        if (action === "assign_table") body.tableNumber = Number(bulkTableInput);
        if (action === "assign_family") body.familyId = bulkFamilyId;
        const res = await fetch(`/api/planner/projects/${projectId}/guests/bulk`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) await loadGuests();
      } catch {}
    }
    setSelectedIds(new Set());
    setBulkTableInput("");
    setBulkFamilyId("");
  }

  // ── Export as CSV ──────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = [
      ["Title", "First Name", "Last Name", "Side", "Relation", "Email", "Phone", "Dietary", "RSVP", "Table #", "Notes"],
      ...guests.map((g) => [
        g.title ?? "",
        g.firstName,
        g.lastName ?? "",
        g.side,
        relationLabel(g.relation, t),
        g.email ?? "",
        g.phone ?? "",
        g.dietary ?? "",
        g.rsvpStatus,
        g.tableNumber ?? "",
        g.notes ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Export as XLS ──────────────────────────────────────────────────────────
  function exportXLS() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    const data = guests.map((g) => ({
      Title: g.title ?? "",
      "First Name": g.firstName,
      "Last Name": g.lastName ?? "",
      Side: g.side,
      Relation: relationLabel(g.relation, t),
      Email: g.email ?? "",
      Phone: g.phone ?? "",
      Dietary: g.dietary ?? "",
      RSVP: g.rsvpStatus,
      "Table #": g.tableNumber ?? "",
      Notes: g.notes ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guests");
    XLSX.writeFile(wb, "guest-list.xlsx");
  }

  // ── Export as PDF ──────────────────────────────────────────────────────────
  async function exportPDF() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");

    const styles = StyleSheet.create({
      page:      { padding: 32, fontFamily: "Helvetica", fontSize: 10, color: "#1f2937" },
      title:     { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#111827" },
      subtitle:  { fontSize: 10, color: "#6b7280", marginBottom: 20 },
      section:   { marginBottom: 16 },
      sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 6, color: "#6366f1", textTransform: "uppercase", letterSpacing: 1 },
      tableRow:  { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 5 },
      headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingVertical: 5, backgroundColor: "#f9fafb" },
      colName:   { width: "35%", paddingHorizontal: 4 },
      colRel:    { width: "30%", paddingHorizontal: 4 },
      colRsvp:   { width: "20%", paddingHorizontal: 4 },
      colTable:  { width: "15%", paddingHorizontal: 4 },
      headerText:{ fontWeight: "bold", fontSize: 9, color: "#6b7280", textTransform: "uppercase" },
      cell:      { fontSize: 10, color: "#374151" },
      rsvpAttending: { color: "#16a34a" },
      rsvpDeclined:  { color: "#dc2626" },
      rsvpPending:   { color: "#9ca3af" },
      summary:   { marginTop: 20, flexDirection: "row", gap: 20 },
      summaryBox:{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 6, padding: 10, alignItems: "center" },
      summaryNum:{ fontSize: 20, fontWeight: "bold", color: "#111827" },
      summaryLbl:{ fontSize: 9, color: "#6b7280", marginTop: 2 },
    });

    function rsvpColor(s: RsvpStatus) {
      if (s === "ATTENDING") return styles.rsvpAttending;
      if (s === "NOT_ATTENDING") return styles.rsvpDeclined;
      return styles.rsvpPending;
    }
    function rsvpText(s: RsvpStatus) {
      if (s === "ATTENDING") return "Attending";
      if (s === "NOT_ATTENDING") return "Declined";
      return "Pending";
    }

    function GuestTable({ guestList }: { guestList: Guest[] }) {
      return (
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.colName,  styles.headerText]}>Name</Text>
            <Text style={[styles.colRel,   styles.headerText]}>Relation</Text>
            <Text style={[styles.colRsvp,  styles.headerText]}>RSVP</Text>
            <Text style={[styles.colTable, styles.headerText]}>Table</Text>
          </View>
          {guestList.map((g) => (
            <View key={g.id} style={styles.tableRow}>
              <Text style={[styles.colName,  styles.cell]}>{displayFullName(g) || "—"}</Text>
              <Text style={[styles.colRel,   styles.cell]}>{relationLabel(g.relation, t)}</Text>
              <Text style={[styles.colRsvp,  styles.cell, rsvpColor(g.rsvpStatus)]}>{rsvpText(g.rsvpStatus)}</Text>
              <Text style={[styles.colTable, styles.cell]}>{g.tableNumber ?? "—"}</Text>
            </View>
          ))}
        </View>
      );
    }

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Wedding Guest List</Text>
          <Text style={styles.subtitle}>
            Total: {guests.length} guests · Bride: {brideGuests.length} · Groom: {groomGuests.length}
            {guests.filter(g => g.hasPlusOne).length > 0 ? ` · Plus-ones: +${guests.filter(g => g.hasPlusOne).length}` : ""}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bride&apos;s Guests ({brideGuests.length})</Text>
            <GuestTable guestList={brideGuests} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Groom&apos;s Guests ({groomGuests.length})</Text>
            <GuestTable guestList={groomGuests} />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNum}>{guests.filter(g => g.rsvpStatus === "ATTENDING").length}</Text>
              <Text style={styles.summaryLbl}>Attending</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNum}>{guests.filter(g => g.rsvpStatus === "PENDING").length}</Text>
              <Text style={styles.summaryLbl}>Pending</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNum}>{guests.filter(g => g.rsvpStatus === "NOT_ATTENDING").length}</Text>
              <Text style={styles.summaryLbl}>Declined</Text>
            </View>
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Import CSV / XLS ───────────────────────────────────────────────────────
  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    let imported = 0;
    let failed = 0;
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });

      for (const row of rows) {
        const firstName = (row["First Name"] || row["first_name"] || row["name"] || "").trim();
        if (!firstName) continue;
        const side: GuestSide = (row["Side"] || "").toUpperCase() === "GROOM" ? "GROOM" : "BRIDE";
        const guestData = {
          firstName,
          lastName: (row["Last Name"] || row["last_name"] || "").trim() || null,
          title: (row["Title"] || row["title"] || "").trim() || null,
          side,
          relation: "OTHER" as GuestRelation,
          email: (row["Email"] || row["email"] || "").trim() || null,
          phone: (row["Phone"] || row["phone"] || "").trim() || null,
          dietary: (row["Dietary"] || row["dietary"] || "").trim() || null,
          rsvpStatus: "PENDING" as RsvpStatus,
          tableNumber: null,
          notes: (row["Notes"] || row["notes"] || "").trim() || null,
          hasPlusOne: false,
          plusOneName: null,
          plusOneMeal: null,
          isChiefGuest: false,
          familyId: null,
          invitationCode: null,
          invitationSent: false,
          invitationSentAt: null,
        };

        if (isLocal) {
          const g = addLocalGuest(projectId, guestData) as Guest;
          setGuests((p) => [...p, g]);
          imported++;
        } else {
          try {
            const res = await fetch(`/api/planner/projects/${projectId}/guests`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(guestData),
            });
            if (res.ok) {
              imported++;
            } else {
              const err = await res.json().catch(() => ({}));
              console.error("Guest import error:", res.status, err);
              failed++;
            }
          } catch (err) {
            console.error("Guest import network error:", err);
            failed++;
          }
        }
      }
    } catch (err) {
      console.error("Import failed:", err);
      alert("Import failed. Please check the file format and try again.");
    }
    setImporting(false);
    if (importRef.current) importRef.current.value = "";

    // Refresh guest list from server after import
    await loadGuests();

    if (imported > 0 && failed === 0) {
      alert(`${imported} guest${imported > 1 ? "s" : ""} imported successfully!`);
    } else if (imported > 0 && failed > 0) {
      alert(`${imported} imported, ${failed} failed. Check console for details.`);
    } else if (failed > 0) {
      alert(`Import failed for all ${failed} rows. Make sure you are logged in and the file has a "First Name" column.`);
    } else {
      alert('No guests found. Make sure the file has a "First Name" (or "first_name" / "name") column.');
    }
  }

  // Filter guests by search + RSVP filter
  const filteredGuests = guests.filter((g) => {
    const matchesSearch = !search || `${g.firstName} ${g.lastName ?? ""} ${g.email ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesRsvp = rsvpFilter === "ALL" || g.rsvpStatus === rsvpFilter;
    return matchesSearch && matchesRsvp;
  });

  const brideGuests = filteredGuests.filter((g) => g.side === "BRIDE");
  const groomGuests = filteredGuests.filter((g) => g.side === "GROOM");

  // Alphabetic grouping
  const sortedAll = [...filteredGuests].sort((a, b) =>
    `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`)
  );
  const alphaGroups: Record<string, Guest[]> = {};
  for (const g of sortedAll) {
    const letter = (g.firstName?.[0] || "#").toUpperCase();
    if (!alphaGroups[letter]) alphaGroups[letter] = [];
    alphaGroups[letter].push(g);
  }

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: "two-sides", label: t("guests.viewTwoSides") },
    { id: "alphabetic", label: t("guests.viewAlphabetic") },
    { id: "full-table", label: t("guests.viewFullTable") },
    { id: "by-family", label: "By Family" },
  ];

  // Render heading description with {guidelineLink} and {importLink} replaced
  function renderHeadingDesc() {
    const raw = t("guests.headingDesc");
    const [before, afterGuideline] = raw.split("{guidelineLink}");
    const [between, after] = (afterGuideline ?? "").split("{importLink}");
    return (
      <>
        {before}
        <button onClick={() => setGuidelinesOpen(true)} className="text-indigo-500 underline hover:text-indigo-700 transition-colors">
          {t("guests.guidelineLink")}
        </button>
        {between}
        <button onClick={() => importRef.current?.click()} className="text-indigo-500 underline hover:text-indigo-700 transition-colors">
          {t("guests.importLink")}
        </button>
        {after}
      </>
    );
  }

  return (
    <>
    <div className="max-w-3xl mx-auto pb-16">
      {/* RSVP Link Modal */}
      {rsvpModal && (
        <RsvpLinkModal
          guestName={rsvpModal.guestName}
          url={rsvpModal.url}
          onClose={() => setRsvpModal(null)}
        />
      )}

      {/* Guidelines panel */}
      <GuidelinesPanel open={guidelinesOpen} onClose={() => setGuidelinesOpen(false)} />

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">{t("guests.heading")}</h1>
        <p className="mt-1 text-sm text-gray-400">{renderHeadingDesc()}</p>
      </div>

      {/* Search + Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("guests.searchPlaceholder")}
          className="h-8 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none flex-1 min-w-36"
        />
        <div className="flex items-center rounded-md border border-gray-200 bg-white overflow-hidden text-sm">
          {(["ALL", "ATTENDING", "PENDING", "NOT_ATTENDING"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRsvpFilter(f === "PENDING" ? "PENDING" : f === "NOT_ATTENDING" ? "NOT_ATTENDING" : f === "ATTENDING" ? "ATTENDING" : "ALL")}
              className={cn("px-3 py-1.5 font-medium transition-colors border-r border-gray-200 last:border-0 text-xs",
                rsvpFilter === f ? "bg-indigo-500 text-white" : "text-gray-500 hover:text-black hover:bg-gray-50")}
            >
              {f === "ALL" ? t("guests.filterAll") : f === "ATTENDING" ? t("guests.filterAttending") : f === "PENDING" ? t("guests.filterPending") : t("guests.filterDeclined")}
            </button>
          ))}
        </div>
      </div>

      {/* RSVP Questions Modal */}
      {rsvpQuestionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Custom RSVP Questions</h2>
              <button onClick={() => setRsvpQuestionsOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {rsvpQuestions.length === 0 && (
                <p className="text-sm text-gray-400">No custom questions yet. Add one below.</p>
              )}
              {rsvpQuestions.map((q) => (
                <div key={q.id} className="rounded-xl border border-gray-100 p-3">
                  {editingQuestion?.id === q.id ? (
                    <div className="space-y-2">
                      <input
                        value={editQText}
                        onChange={(e) => setEditQText(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-300 focus:outline-none"
                      />
                      {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && (
                        <textarea
                          value={editQOptions}
                          onChange={(e) => setEditQOptions(e.target.value)}
                          rows={3}
                          placeholder="One option per line"
                          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-300 focus:outline-none resize-none"
                        />
                      )}
                      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={editQRequired} onChange={(e) => setEditQRequired(e.target.checked)} className="rounded" />
                        Required
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateQuestion(q)} className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600">Save</button>
                        <button onClick={() => setEditingQuestion(null)} className="rounded-lg border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{q.text}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 uppercase">{q.type.replace("_", " ")}</span>
                          {q.required && <span className="text-[10px] font-medium text-rose-500">Required</span>}
                        </div>
                        {q.options && (q.options as string[]).length > 0 && (
                          <p className="mt-1 text-xs text-gray-400">{(q.options as string[]).join(" · ")}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingQuestion(q); setEditQText(q.text); setEditQOptions((q.options as string[] | null)?.join("\n") ?? ""); setEditQRequired(q.required); }}
                          className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                        >Edit</button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="rounded-lg border border-red-100 px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add new question */}
            <div className="border-t border-gray-100 px-5 py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Add question</p>
              <input
                value={newQText}
                onChange={(e) => setNewQText(e.target.value)}
                placeholder="Question text…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none"
              />
              <div className="flex gap-2 items-center">
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as RsvpQuestionType)}
                  className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-indigo-300 focus:outline-none"
                >
                  <option value="SHORT_TEXT">Short text</option>
                  <option value="LONG_TEXT">Long text</option>
                  <option value="SINGLE_CHOICE">Single choice</option>
                  <option value="MULTIPLE_CHOICE">Multiple choice</option>
                </select>
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={newQRequired} onChange={(e) => setNewQRequired(e.target.checked)} className="rounded" />
                  Required
                </label>
              </div>
              {(newQType === "SINGLE_CHOICE" || newQType === "MULTIPLE_CHOICE") && (
                <textarea
                  value={newQOptions}
                  onChange={(e) => setNewQOptions(e.target.value)}
                  rows={3}
                  placeholder="One option per line"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-300 focus:outline-none resize-none"
                />
              )}
              <button
                onClick={handleAddQuestion}
                disabled={!newQText.trim()}
                className="w-full rounded-xl bg-indigo-500 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-40 transition-colors"
              >
                <Plus className="inline h-4 w-4 mr-1" />Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mb-6 flex items-center justify-between gap-3">
        {/* View toggle */}
        <div className="flex items-center rounded-md border border-gray-200 bg-white overflow-hidden text-sm">
          {viewModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              className={cn(
                "px-3.5 py-1.5 font-medium transition-colors border-r border-gray-200 last:border-0",
                viewMode === m.id ? "bg-indigo-500 text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {!isLocal && (
          <button
            onClick={() => setRsvpQuestionsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            RSVP Questions{rsvpQuestions.length > 0 ? ` (${rsvpQuestions.length})` : ""}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
        </div>
      ) : (
        <>
          {/* ── TWO SIDES ── */}
          {viewMode === "two-sides" && (
            <div className="grid gap-8 md:grid-cols-2">
              {/* Bride */}
              <div>
                <div className="mb-4 flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                    <BrideIcon className="h-7 w-7" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-700">{t("guests.brideGuests")}</h2>
                </div>
                <div>
                  {brideGuests.map((g) => (
                    <GuestRow key={g.id} guest={g} onUpdate={handleUpdate} onDelete={handleDelete} onShareRsvp={isLocal ? undefined : handleShareRsvp} />
                  ))}
                </div>
                <AddGuestButton side="BRIDE" onSelect={(rel) => handleAdd("BRIDE", rel)} />
              </div>

              {/* Groom */}
              <div>
                <div className="mb-4 flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <GroomIcon className="h-7 w-7" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-700">{t("guests.groomGuests")}</h2>
                </div>
                <div>
                  {groomGuests.map((g) => (
                    <GuestRow key={g.id} guest={g} onUpdate={handleUpdate} onDelete={handleDelete} onShareRsvp={isLocal ? undefined : handleShareRsvp} />
                  ))}
                </div>
                <AddGuestButton side="GROOM" onSelect={(rel) => handleAdd("GROOM", rel)} />
              </div>
            </div>
          )}

          {/* ── ALPHABETIC ── */}
          {viewMode === "alphabetic" && (
            <div>
              {/* Bride + Groom fixed rows at top */}
              {[...brideGuests.filter(g => g.relation === "BRIDE"), ...groomGuests.filter(g => g.relation === "GROOM")].map((g) => (
                <GuestRow key={g.id} guest={g} onUpdate={handleUpdate} onDelete={handleDelete} onShareRsvp={isLocal ? undefined : handleShareRsvp} />
              ))}

              {/* Letter groups */}
              {Object.keys(alphaGroups).sort().map((letter) => (
                <div key={letter} className="mt-4">
                  <p className="mb-1 text-lg font-bold text-gray-800">{letter}</p>
                  {alphaGroups[letter]
                    .filter(g => g.relation !== "BRIDE" && g.relation !== "GROOM")
                    .map((g) => (
                      <GuestRow key={g.id} guest={g} onUpdate={handleUpdate} onDelete={handleDelete} onShareRsvp={isLocal ? undefined : handleShareRsvp} />
                    ))}
                </div>
              ))}

              {guests.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">{t("guests.noGuestsAlpha")}</p>
              )}

              {/* Add guest (both sides) */}
              <div className="mt-4">
                <AddGuestButtonCombined onSelect={(side, rel) => handleAdd(side, rel)} />
              </div>
            </div>
          )}

          {/* ── FULL TABLE ── */}
          {viewMode === "full-table" && (
            <div className="rounded-lg border border-gray-100 bg-white overflow-hidden">
              {guests.length === 0 ? (
                <p className="p-10 text-center text-sm text-gray-400">{t("guests.noGuests")}</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                      <th className="px-3 py-3">
                        <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indigo-500 transition-colors">
                          {selectedIds.size === filteredGuests.length && filteredGuests.length > 0
                            ? <CheckSquare className="h-4 w-4 text-indigo-500" />
                            : <Square className="h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3">{t("guests.colName")}</th>
                      <th className="px-4 py-3">{t("guests.colSide")}</th>
                      <th className="px-4 py-3">{t("guests.colRelation")}</th>
                      <th className="px-4 py-3">{t("guests.colRsvp")}</th>
                      <th className="px-4 py-3">Invitation</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredGuests].sort((a,b) => `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`)).map((g) => (
                      <tr key={g.id} className={cn("border-b border-gray-100 last:border-0 hover:bg-gray-50 group", selectedIds.has(g.id) && "bg-indigo-50/40")}>
                        <td className="px-3 py-3">
                          <button onClick={() => toggleSelect(g.id)} className="text-gray-400 hover:text-indigo-500 transition-colors">
                            {selectedIds.has(g.id) ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          <span className="flex items-center gap-1.5">
                            {g.isChiefGuest && <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
                            {displayFullName(g) || <span className="italic text-gray-300">—</span>}
                            {g.hasPlusOne && <span className="text-[10px] font-medium text-indigo-400">+1</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            g.side === "BRIDE" ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500")}>
                            {g.side === "BRIDE" ? t("guests.bride") : t("guests.groom")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{relationLabel(g.relation, t)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              const order: RsvpStatus[] = ["PENDING", "ATTENDING", "NOT_ATTENDING"];
                              handleUpdate(g.id, { rsvpStatus: order[(order.indexOf(g.rsvpStatus) + 1) % order.length] });
                            }}
                            className={cn("text-xs font-medium transition-colors", RSVP_COLORS[g.rsvpStatus])}
                          >
                            {g.rsvpStatus === "PENDING" ? t("guests.pending") : g.rsvpStatus === "ATTENDING" ? t("guests.attending") : t("guests.declined")}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              defaultValue={g.invitationCode ?? ""}
                              onBlur={(e) => handleUpdate(g.id, { invitationCode: e.target.value.trim() || null })}
                              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                              placeholder="INV-001"
                              className="w-20 rounded border border-gray-100 px-1.5 py-0.5 text-xs text-gray-600 placeholder:text-gray-300 focus:border-indigo-300 focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdate(g.id, { invitationSent: !g.invitationSent, invitationSentAt: !g.invitationSent ? new Date().toISOString() : null })}
                              title={g.invitationSent ? "Mark as not sent" : "Mark as sent"}
                              className={cn("transition-colors text-xs font-medium", g.invitationSent ? "text-emerald-600" : "text-gray-300 hover:text-emerald-500")}
                            >
                              {g.invitationSent ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            {!isLocal && (
                              <button onClick={() => handleShareRsvp(g)} className="text-gray-300 hover:text-indigo-400 transition-colors" title="RSVP Link">
                                <Link2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {!isLocal && g.phone && (
                              <button
                                onClick={() => handleSendSms(g)}
                                disabled={smsSending === g.id}
                                title="Send RSVP via SMS"
                                className="text-gray-300 hover:text-emerald-500 transition-colors disabled:opacity-50"
                              >
                                {smsSending === g.id
                                  ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-500" />
                                  : <Smartphone className="h-3.5 w-3.5" />}
                              </button>
                            )}
                            <button onClick={() => handleDelete(g.id)} className="text-gray-200 hover:text-red-400 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── BY FAMILY ── */}
          {viewMode === "by-family" && (
            <div>
              {/* Family management header */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">{families.length} {families.length === 1 ? "family" : "families"}</p>
                <button
                  onClick={() => setFamilyModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> New Family
                </button>
              </div>

              {/* Unassigned guests */}
              {(() => {
                const unassigned = filteredGuests.filter((g) => !g.familyId);
                return unassigned.length > 0 ? (
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Unassigned ({unassigned.length})</p>
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-3">
                      {unassigned.map((g) => (
                        <div key={g.id} className="flex items-center justify-between py-1.5 group">
                          <span className="text-sm text-gray-700">{displayFullName(g) || <span className="italic text-gray-300">—</span>}</span>
                          <select
                            value=""
                            onChange={(e) => { if (e.target.value) handleUpdate(g.id, { familyId: e.target.value }); }}
                            className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <option value="">Assign to family…</option>
                            {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Family groups */}
              {families.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
                  <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">No families yet.</p>
                  <button onClick={() => setFamilyModalOpen(true)} className="mt-2 text-xs text-indigo-500 hover:underline">Create your first family group</button>
                </div>
              ) : (
                families.map((family) => {
                  const members = filteredGuests.filter((g) => g.familyId === family.id);
                  return (
                    <div key={family.id} className="mb-5">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-indigo-400" />
                          {editingFamily?.id === family.id ? (
                            <input
                              autoFocus
                              defaultValue={family.name}
                              onBlur={(e) => handleRenameFamily(family.id, e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleRenameFamily(family.id, (e.target as HTMLInputElement).value); if (e.key === "Escape") setEditingFamily(null); }}
                              className="text-sm font-semibold text-gray-800 border-b border-indigo-300 outline-none bg-transparent"
                            />
                          ) : (
                            <button onClick={() => setEditingFamily(family)} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors">
                              {family.name}
                            </button>
                          )}
                          <span className="text-xs text-gray-400">({members.length})</span>
                        </div>
                        <button onClick={() => handleDeleteFamily(family.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-white p-3">
                        {members.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No members yet. Assign guests from above.</p>
                        ) : (
                          members.map((g) => (
                            <div key={g.id} className="flex items-center justify-between py-1.5 group">
                              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                                {g.isChiefGuest && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                                {displayFullName(g)}
                                {g.hasPlusOne && <span className="text-[10px] text-indigo-400">+1</span>}
                              </span>
                              <button
                                onClick={() => handleUpdate(g.id, { familyId: null })}
                                className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove from family"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ── Bulk Actions Floating Bar ── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-2xl">
          <div className="rounded-2xl bg-gray-900 px-4 py-3 shadow-2xl flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-white flex-shrink-0">
              {selectedIds.size} selected
            </span>
            <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 hover:text-white transition-colors ml-0.5">
              <X className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0" />

            {/* Assign table */}
            <div className="flex items-center gap-1.5">
              <Table2 className="h-3.5 w-3.5 text-gray-400" />
              <input
                value={bulkTableInput}
                onChange={(e) => setBulkTableInput(e.target.value)}
                placeholder="Table #"
                type="number"
                min={1}
                className="w-16 rounded-lg bg-gray-800 px-2 py-1 text-xs text-white placeholder:text-gray-500 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleBulkAction("assign_table")}
                disabled={!bulkTableInput}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
              >
                Assign
              </button>
            </div>

            {/* Assign family */}
            {families.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <select
                  value={bulkFamilyId}
                  onChange={(e) => setBulkFamilyId(e.target.value)}
                  className="rounded-lg bg-gray-800 px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Family…</option>
                  {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                <button
                  onClick={() => handleBulkAction("assign_family")}
                  disabled={!bulkFamilyId}
                  className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                >
                  Assign
                </button>
              </div>
            )}

            {/* RSVP shortcuts */}
            <button onClick={() => handleBulkAction("mark_attending")} className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600 transition-colors">Attending</button>
            <button onClick={() => handleBulkAction("mark_not_attending")} className="rounded-lg bg-red-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors">Declined</button>
            <button onClick={() => handleBulkAction("mark_pending")} className="rounded-lg bg-gray-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-600 transition-colors">Pending</button>

            {/* Delete */}
            <button onClick={() => handleBulkAction("delete")} className="rounded-lg bg-red-900/60 px-2.5 py-1 text-xs font-medium text-red-300 hover:bg-red-900 transition-colors flex items-center gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Family Create Modal ── */}
      {familyModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={() => setFamilyModalOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-semibold text-gray-900">New Family Group</h3>
            <input
              autoFocus
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFamily()}
              placeholder="e.g. Smith Family"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-indigo-300 focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreateFamily}
                disabled={!newFamilyName.trim()}
                className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setFamilyModalOpen(false); setNewFamilyName(""); }}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      <div className="mt-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t("guests.ratioBySides")}</p>
        <p className="mt-1 text-4xl font-bold text-gray-900">{guests.filter(g => g.side === "BRIDE").length}/{guests.filter(g => g.side === "GROOM").length}</p>
        <p className="mt-1 text-sm text-gray-400">
          {t("guests.weddingParty")} <span className="font-semibold text-gray-700">{guests.length}</span>
          <span className="mx-2 text-gray-200">·</span>
          {t("guests.totalGuests")} <span className="font-semibold text-gray-700">{guests.filter(g => g.relation !== "BRIDE" && g.relation !== "GROOM").length}</span>
          {guests.filter(g => g.hasPlusOne).length > 0 && (
            <>
              <span className="mx-2 text-gray-200">·</span>
              Plus-ones <span className="font-semibold text-indigo-600">+{guests.filter(g => g.hasPlusOne).length}</span>
            </>
          )}
        </p>
        {guests.filter(g => g.hasPlusOne).length > 0 && (
          <p className="mt-0.5 text-xs text-gray-400">
            Total attending (incl. +1s):{" "}
            <span className="font-semibold text-emerald-600">
              {guests.filter(g => g.rsvpStatus === "ATTENDING").length + guests.filter(g => g.rsvpStatus === "ATTENDING" && g.hasPlusOne).length}
            </span>
          </p>
        )}
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            {t("guests.filterAttending")} <span className="ml-1 font-semibold text-gray-600">{guests.filter(g => g.rsvpStatus === "ATTENDING").length}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            {t("guests.filterPending")} <span className="ml-1 font-semibold text-gray-600">{guests.filter(g => g.rsvpStatus === "PENDING").length}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            {t("guests.filterDeclined")} <span className="ml-1 font-semibold text-gray-600">{guests.filter(g => g.rsvpStatus === "NOT_ATTENDING").length}</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {/* Hidden file input */}
        <input
          ref={importRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={handleImportFile}
        />

        {/* Import button */}
        <button
          onClick={() => importRef.current?.click()}
          disabled={importing}
          className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-black transition-colors shadow-sm disabled:opacity-50"
        >
          {importing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {importing ? t("guests.importing") : t("guests.import")}
        </button>

        {/* Download buttons — stacked on mobile, row on sm+ */}
        <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row">
          <button
            onClick={exportPDF}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm"
          >
            <FileText className="h-4 w-4" />
            {t("guests.exportPdf")}
          </button>
          <button
            onClick={exportXLS}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-green-200 hover:text-green-600 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t("guests.exportXls")}
          </button>
        </div>

        {/* CSV link */}
        <button onClick={exportCSV} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {t("guests.exportCsv")}
        </button>
      </div>
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}
