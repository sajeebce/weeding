"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, LayoutTemplate, Download, CloudUpload } from "lucide-react";
import { getLocalVenue, updateLocalVenue, LocalVenueDetails } from "@/lib/planner-storage";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";

const isLocal = (id: string) => id.startsWith("local-");

type VenueForm = {
  venueName: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  date: string | null;
  time: string | null;
  capacity: number | null;
  description: string | null;
  notes: string | null;
  layoutNotes: string | null;
};

function emptyForm(): VenueForm {
  return {
    venueName: null, address: null, city: null, country: null,
    date: null, time: null, capacity: null,
    description: null, notes: null, layoutNotes: null,
  };
}

function venueToForm(v: LocalVenueDetails | null): VenueForm {
  if (!v) return emptyForm();
  return {
    venueName:   v.venueName   ?? null,
    address:     v.address     ?? null,
    city:        v.city        ?? null,
    country:     v.country     ?? null,
    date:        v.date        ? (v.date.includes("T") ? v.date.split("T")[0] : v.date) : null,
    time:        v.time        ?? null,
    capacity:    v.capacity    ?? null,
    description: v.description ?? null,
    notes:       v.notes       ?? null,
    layoutNotes: v.layoutNotes ?? null,
  };
}

function formatDate(dateStr: string | null, fallback: string): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

function formatLocation(city: string | null, country: string | null, address: string | null, fallback: string): string {
  const parts = [address, city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

async function saveVenue(id: string, local: boolean, form: VenueForm) {
  if (local) {
    updateLocalVenue(id, "RECEPTION", form);
  } else {
    await fetch(`/api/planner/projects/${id}/reception`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  }
}

export default function ReceptionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const local = isLocal(id);
  const { t } = useLanguage();
  const { tier } = usePlannerTier(id);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [form, setForm] = useState<VenueForm>(emptyForm());
  const [loading, setLoading] = useState(true);

  const [editingLocation, setEditingLocation] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [locPopupOpen, setLocPopupOpen] = useState(false);
  const descSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadVenue = useCallback(async () => {
    setLoading(true);
    try {
      if (local) {
        setForm(venueToForm(getLocalVenue(id, "RECEPTION")));
      } else {
        const res = await fetch(`/api/planner/projects/${id}/reception`);
        if (res.ok) {
          const data = await res.json();
          setForm(venueToForm(data.venue));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id, local]);

  useEffect(() => { loadVenue(); }, [loadVenue]);

  async function saveField(updatedForm: VenueForm) {
    try { await saveVenue(id, local, updatedForm); } catch { /* silent */ }
  }

  function handleDescriptionChange(value: string) {
    const updated = { ...form, description: value || null };
    setForm(updated);
    if (descSaveTimer.current) clearTimeout(descSaveTimer.current);
    descSaveTimer.current = setTimeout(() => saveField(updated), 800);
  }

  async function commitDate(value: string) {
    const updated = { ...form, date: value || null };
    setForm(updated);
    await saveField(updated);
  }

  async function commitLocation(city: string, country: string, address: string) {
    const updated = { ...form, city: city || null, country: country || null, address: address || null };
    setForm(updated);
    setEditingLocation(false);
    setLocPopupOpen(false);
    await saveField(updated);
  }

  async function handleDownloadPDF() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
    const styles = StyleSheet.create({
      page:    { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
      badge:   { fontSize: 9, color: "#0891b2", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
      title:   { fontSize: 22, fontWeight: "bold", color: "#0c4a6e", marginBottom: 4 },
      divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginBottom: 20, marginTop: 8 },
      section: { marginBottom: 16 },
      label:   { fontSize: 9, color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 },
      value:   { fontSize: 11, color: "#374151", lineHeight: 1.6 },
      row:     { flexDirection: "row", gap: 24, marginBottom: 16 },
      col:     { flex: 1 },
    });
    const f = form;
    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.badge}>Reception Details</Text>
          <Text style={styles.title}>{f.venueName || "Reception Venue"}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{f.date ? new Date(f.date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{f.time || "—"}</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{[f.address, f.city, f.country].filter(Boolean).join(", ") || "—"}</Text>
          </View>
          {f.description && <View style={styles.section}><Text style={styles.label}>Description</Text><Text style={styles.value}>{f.description}</Text></View>}
          {f.layoutNotes && <View style={styles.section}><Text style={styles.label}>Layout Notes</Text><Text style={styles.value}>{f.layoutNotes}</Text></View>}
        </Page>
      </Document>
    );
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "reception-details.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#ede9f0]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-full bg-[#ede9f0] px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-700">{t("reception.title")}</h1>
          <p className="mt-1.5 text-sm text-gray-500">{t("reception.desc")}</p>
        </div>

        {/* Three info cards */}
        <div className="mb-4 grid grid-cols-3 gap-3">

          {/* Date card */}
          <div
            className="relative cursor-pointer rounded-xl border border-gray-200 bg-white/80 px-4 py-4 hover:bg-white transition-colors"
            onClick={() => { setDatePickerOpen(v => !v); setLocPopupOpen(false); setEditingLocation(false); }}
          >
            <p className="mb-1 text-xs text-gray-400">{t("reception.date")}</p>
            <p className={`text-sm font-medium ${form.date ? "text-purple-600" : "text-purple-400"}`}>
              {formatDate(form.date, t("reception.setDate"))}
            </p>
            {/* Calendar icon — click to open date picker */}
            <div className="absolute bottom-2 right-2" onClick={e => e.stopPropagation()}>
              <Calendar
                className="h-12 w-12 text-purple-200 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => { setDatePickerOpen(v => !v); setLocPopupOpen(false); setEditingLocation(false); }}
              />
              {datePickerOpen && (
                <DatePickerPopup
                  date={form.date}
                  onSave={date => { commitDate(date); setDatePickerOpen(false); }}
                  onClose={() => setDatePickerOpen(false)}
                  t={t}
                />
              )}
            </div>
          </div>

          {/* Location card */}
          <div
            className="relative cursor-pointer rounded-xl border border-gray-200 bg-white/80 px-4 py-4 hover:bg-white transition-colors"
            onClick={() => { setEditingLocation(true); setDatePickerOpen(false); setLocPopupOpen(false); }}
          >
            <p className="mb-1 text-xs text-gray-400">{t("reception.location")}</p>
            {editingLocation ? (
              <LocationEditInline
                city={form.city ?? ""}
                country={form.country ?? ""}
                address={form.address ?? ""}
                onCommit={commitLocation}
                onCancel={() => setEditingLocation(false)}
                t={t}
              />
            ) : (
              <p className={`text-sm font-medium truncate ${(form.city || form.country || form.address) ? "text-purple-600" : "text-purple-400"}`}>
                {formatLocation(form.city, form.country, form.address, t("reception.setLocation"))}
              </p>
            )}
            {/* MapPin icon — click to open location popup */}
            <div className="absolute bottom-2 right-2" onClick={e => e.stopPropagation()}>
              <MapPin
                className="h-12 w-12 text-purple-200 cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => { setLocPopupOpen(v => !v); setDatePickerOpen(false); setEditingLocation(false); }}
              />
              {locPopupOpen && (
                <LocationPopup
                  city={form.city ?? ""}
                  country={form.country ?? ""}
                  address={form.address ?? ""}
                  onCommit={commitLocation}
                  onClose={() => setLocPopupOpen(false)}
                  t={t}
                />
              )}
            </div>
          </div>

          {/* Layout card */}
          <div
            className="relative cursor-pointer rounded-xl border border-gray-200 bg-white/80 px-4 py-4 hover:bg-white transition-colors"
            onClick={() => router.push(`/planner/${id}/seating?tab=reception&src=reception`)}
          >
            <p className="mb-1 text-xs text-gray-400">{t("reception.layout")}</p>
            <p className="text-sm font-medium text-purple-600">{t("reception.planLayout")}</p>
            <LayoutTemplate className="absolute bottom-2 right-2 h-12 w-12 text-purple-200" />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white/80 px-4 py-3">
          <textarea
            rows={4}
            value={form.description ?? ""}
            onChange={e => handleDescriptionChange(e.target.value)}
            placeholder={t("reception.descPlaceholder")}
            className="w-full resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Photo upload area */}
        <div className="mb-6 rounded-xl border-2 border-dashed border-purple-200 bg-white/60 px-6 py-10 text-center">
          <CloudUpload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="mb-1 text-sm font-semibold text-gray-600">{t("reception.uploadPhotos")}</p>
          <p className="mb-1 text-xs text-gray-400">{t("reception.dropPhotos")}</p>
          <p className="mb-4 text-xs font-semibold text-gray-500">
            {t("reception.photoLimit")} <span className="text-purple-500">{t("reception.photoSize")}</span>
          </p>
          <button
            onClick={() => alert(t("reception.photoDeferred"))}
            className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            {t("reception.upload")}
          </button>
        </div>

        {/* Download PDF */}
        <div className="flex justify-center">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 text-purple-500" />
            {t("reception.downloadPdf")}
          </button>
        </div>

      </div>
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}

// ── Date picker popup ─────────────────────────────────────────────────────────

function DatePickerPopup({ date, onSave, onClose, t }: {
  date: string | null;
  onSave: (date: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [val, setVal] = useState(date ?? "");
  return (
    <div className="absolute bottom-full right-0 mb-1 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-xl p-3">
      <p className="mb-2 text-xs font-medium text-gray-500">{t("reception.selectDate")}</p>
      <input
        autoFocus
        type="date"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => onSave(val)} className="flex-1 rounded-lg bg-purple-600 py-1.5 text-xs font-medium text-white hover:bg-purple-700">{t("reception.save")}</button>
        <button onClick={onClose} className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs text-gray-500 hover:bg-gray-200">{t("reception.cancel")}</button>
      </div>
    </div>
  );
}

// ── Location popup ────────────────────────────────────────────────────────────

function LocationPopup({ city, country, address, onCommit, onClose, t }: {
  city: string; country: string; address: string;
  onCommit: (city: string, country: string, address: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [c, setC] = useState(city);
  const [co, setCo] = useState(country);
  const [a, setA] = useState(address);

  return (
    <div className="absolute bottom-full right-0 mb-1 z-50 w-64 rounded-xl border border-gray-200 bg-white shadow-xl p-3">
      <p className="mb-2 text-xs font-medium text-gray-500">{t("reception.locationDetails")}</p>
      <div className="space-y-1.5">
        <input autoFocus value={a} onChange={e => setA(e.target.value)} placeholder={t("reception.streetAddress")}
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-purple-400" />
        <input value={c} onChange={e => setC(e.target.value)} placeholder={t("reception.city")}
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-purple-400" />
        <input value={co} onChange={e => setCo(e.target.value)} placeholder={t("reception.country")}
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-purple-400" />
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={() => onCommit(c, co, a)} className="flex-1 rounded-lg bg-purple-600 py-1.5 text-xs font-medium text-white hover:bg-purple-700">{t("reception.save")}</button>
        <button onClick={onClose} className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs text-gray-500 hover:bg-gray-200">{t("reception.cancel")}</button>
      </div>
    </div>
  );
}

// ── Inline location editor (card click) ──────────────────────────────────────

function LocationEditInline({
  city, country, address, onCommit, onCancel, t,
}: {
  city: string; country: string; address: string;
  onCommit: (city: string, country: string, address: string) => void;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const [c, setC] = useState(city);
  const [co, setCo] = useState(country);
  const [a, setA] = useState(address);

  return (
    <div className="space-y-1" onClick={e => e.stopPropagation()}>
      <input autoFocus value={a} onChange={e => setA(e.target.value)} placeholder={t("reception.streetAddress")}
        className="w-full rounded border border-purple-300 bg-transparent px-2 py-0.5 text-xs text-purple-700 focus:outline-none" />
      <div className="flex gap-1">
        <input value={c} onChange={e => setC(e.target.value)} placeholder={t("reception.city")}
          className="w-full rounded border border-purple-300 bg-transparent px-2 py-0.5 text-xs text-purple-700 focus:outline-none" />
        <input value={co} onChange={e => setCo(e.target.value)} placeholder={t("reception.country")}
          className="w-full rounded border border-purple-300 bg-transparent px-2 py-0.5 text-xs text-purple-700 focus:outline-none" />
      </div>
      <div className="flex gap-1 pt-0.5">
        <button onClick={() => onCommit(c, co, a)}
          className="rounded bg-purple-600 px-2 py-0.5 text-xs text-white hover:bg-purple-700">{t("reception.save")}</button>
        <button onClick={onCancel}
          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-200">{t("reception.cancel")}</button>
      </div>
    </div>
  );
}
