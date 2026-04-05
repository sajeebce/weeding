"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Eye, EyeOff, Globe, Link2, ChevronDown, ChevronRight,
  Plus, Trash2, ArrowUp, ArrowDown, Settings2, X, Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getLocalWebsite, saveLocalWebsite,
  createWebsiteBlock,
  getLocalProject, getLocalVenue,
  type LocalWeddingWebsite,
  type WeddingBlock,
  type WebsiteBlockType,
} from "@/lib/planner-storage";
import { usePlannerCouple } from "@/lib/planner-context";

// ── helpers ───────────────────────────────────────────────────────────────────

const isLocal = (id: string) => id.startsWith("local-");

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── theme definitions ─────────────────────────────────────────────────────────

const THEMES = {
  modern:  { label: "Modern",  primary: "#7c3aed", accent: "#ede9fe", font: "Inter",            emoji: "💜" },
  floral:  { label: "Floral",  primary: "#be185d", accent: "#fce7f3", font: "Georgia",          emoji: "🌸" },
  rustic:  { label: "Rustic",  primary: "#92400e", accent: "#fef3c7", font: "Georgia",          emoji: "🌿" },
  minimal: { label: "Minimal", primary: "#1f2937", accent: "#f9fafb", font: "Inter",            emoji: "◻️" },
} as const;

// ── block meta ────────────────────────────────────────────────────────────────

const BLOCK_META: Record<WebsiteBlockType, { label: string; icon: string; description: string }> = {
  "cover":      { label: "Cover Photo",        icon: "🖼️", description: "Full-screen photo with couple names & date" },
  "hero":       { label: "Hero / Cover",       icon: "🏠", description: "Main banner with couple names & date" },
  "our-story":  { label: "Our Story",          icon: "💌", description: "Your love story in your words" },
  "venue":      { label: "Venue & Time",        icon: "📍", description: "Ceremony and reception details" },
  "schedule":   { label: "Schedule",           icon: "📅", description: "Day-of timeline" },
  "gallery":    { label: "Photo Gallery",      icon: "🖼️", description: "Engagement & pre-wedding photos" },
  "rsvp":       { label: "RSVP",               icon: "✉️", description: "Guest RSVP call-to-action" },
  "registry":   { label: "Registry",           icon: "🎁", description: "Gift registry links" },
  "people":     { label: "Wedding Party",      icon: "👥", description: "Bridesmaids, groomsmen & VIPs" },
  "countdown":  { label: "Countdown",          icon: "⏰", description: "Days until the big day" },
  "guestbook":  { label: "Guestbook",          icon: "📖", description: "Guest messages & wishes" },
};

// ── block settings form ────────────────────────────────────────────────────────

function BlockSettingsForm({
  block, onChange,
}: {
  block: WeddingBlock;
  onChange: (settings: Record<string, unknown>) => void;
}) {
  const s = block.settings;
  const set = (key: string, val: unknown) => onChange({ ...s, [key]: val });

  switch (block.type) {
    case "cover": {
      const rawLinks = (s.navLinks as unknown[]) ?? [];
      const navLinks: { label: string; href: string }[] = rawLinks.map(l =>
        typeof l === "string" ? { label: l, href: "" } : (l as { label: string; href: string })
      );
      return (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 pb-1">Couple & Date</p>
          <Field label="Bride's Name" value={s.brideName as string} onChange={v => set("brideName", v)} placeholder="e.g. Sarah" />
          <Field label="Groom's Name" value={s.groomName as string} onChange={v => set("groomName", v)} placeholder="e.g. John" />
          <Field label="Date (displayed as-is)" value={s.date as string} onChange={v => set("date", v)} placeholder="e.g. March 31, 2026" />
          <Field label="Tagline / Quote" value={s.quote as string} onChange={v => set("quote", v)} placeholder="e.g. We're Getting Married!" />
          <p className="text-xs font-medium text-gray-500 pt-1">Background Image</p>
          <div className="space-y-2">
            <Field label="Image URL" value={(s.backgroundImage as string) ?? ""} onChange={v => set("backgroundImage", v || null)} placeholder="https://..." />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">or</span>
              <label className="cursor-pointer text-xs text-violet-600 border border-violet-300 rounded px-3 py-1 hover:bg-violet-50 transition">
                Upload from device
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => set("backgroundImage", ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {(s.backgroundImage as string) && (
                <button onClick={() => set("backgroundImage", null)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              )}
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 pt-1">Navigation Links</p>
          <p className="text-xs text-gray-400">Use anchor IDs like <code className="bg-gray-100 px-1 rounded">#hero</code>, <code className="bg-gray-100 px-1 rounded">#our-story</code>, <code className="bg-gray-100 px-1 rounded">#venue</code>, <code className="bg-gray-100 px-1 rounded">#rsvp</code>, etc.</p>
          {navLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={link.label} onChange={e => { const n=[...navLinks]; n[i]={...n[i],label:e.target.value}; set("navLinks",n); }}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Label" />
              <input value={link.href} onChange={e => { const n=[...navLinks]; n[i]={...n[i],href:e.target.value}; set("navLinks",n); }}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="#section or URL" />
              <button onClick={() => set("navLinks", navLinks.filter((_,j) => j!==i))}
                className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5"/></button>
            </div>
          ))}
          <button onClick={() => set("navLinks", [...navLinks, { label: "", href: "" }])}
            className="text-xs text-violet-600 flex items-center gap-1">
            <Plus className="h-3 w-3"/> Add nav link
          </button>
        </div>
      );
    }
    case "hero":
      return (
        <div className="space-y-3">
          <Field label="Title" value={s.title as string} onChange={v => set("title", v)} />
          <Field label="Subtitle" value={s.subtitle as string} onChange={v => set("subtitle", v)} />
          <Field label="Wedding Date (YYYY-MM-DD)" value={s.date as string} onChange={v => set("date", v)} />
          <Field label="Location" value={s.location as string} onChange={v => set("location", v)} />
        </div>
      );
    case "our-story":
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <AreaField label="Your Story" value={s.content as string} onChange={v => set("content", v)} rows={5} />
        </div>
      );
    case "venue":
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <p className="text-xs font-medium text-gray-500 pt-1">Ceremony</p>
          <Field label="Venue Name" value={s.ceremonyName as string} onChange={v => set("ceremonyName", v)} />
          <Field label="Address" value={s.ceremonyAddress as string} onChange={v => set("ceremonyAddress", v)} />
          <Field label="Time" value={s.ceremonyTime as string} onChange={v => set("ceremonyTime", v)} placeholder="e.g. 4:00 PM" />
          <p className="text-xs font-medium text-gray-500 pt-1">Reception</p>
          <Field label="Venue Name" value={s.receptionName as string} onChange={v => set("receptionName", v)} />
          <Field label="Address" value={s.receptionAddress as string} onChange={v => set("receptionAddress", v)} />
          <Field label="Time" value={s.receptionTime as string} onChange={v => set("receptionTime", v)} placeholder="e.g. 7:00 PM" />
        </div>
      );
    case "schedule": {
      const items = (s.items as { time: string; title: string }[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <p className="text-xs font-medium text-gray-500">Schedule Items</p>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={item.time} onChange={e => { const n=[...items]; n[i]={...n[i],time:e.target.value}; set("items",n); }}
                className="w-24 border rounded px-2 py-1 text-sm" placeholder="4:00 PM" />
              <input value={item.title} onChange={e => { const n=[...items]; n[i]={...n[i],title:e.target.value}; set("items",n); }}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Event name" />
              <button onClick={() => set("items", items.filter((_,j) => j!==i))}
                className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5"/></button>
            </div>
          ))}
          <button onClick={() => set("items", [...items, { time: "", title: "" }])}
            className="text-xs text-violet-600 flex items-center gap-1">
            <Plus className="h-3 w-3"/> Add item
          </button>
        </div>
      );
    }
    case "gallery": {
      const images = (s.images as string[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <p className="text-xs font-medium text-gray-500">Image URLs</p>
          {images.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={url} onChange={e => { const n=[...images]; n[i]=e.target.value; set("images",n); }}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="https://..." />
              <button onClick={() => set("images", images.filter((_,j) => j!==i))}
                className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5"/></button>
            </div>
          ))}
          <button onClick={() => set("images", [...images, ""])}
            className="text-xs text-violet-600 flex items-center gap-1">
            <Plus className="h-3 w-3"/> Add image URL
          </button>
        </div>
      );
    }
    case "rsvp":
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <Field label="RSVP Deadline" value={s.deadline as string} onChange={v => set("deadline", v)} placeholder="e.g. February 28, 2026" />
          <AreaField label="Message" value={s.message as string} onChange={v => set("message", v)} />
        </div>
      );
    case "registry": {
      const items = (s.items as { name: string; url: string }[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <p className="text-xs font-medium text-gray-500">Registry Links</p>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={item.name} onChange={e => { const n=[...items]; n[i]={...n[i],name:e.target.value}; set("items",n); }}
                className="w-32 border rounded px-2 py-1 text-sm" placeholder="Store name" />
              <input value={item.url} onChange={e => { const n=[...items]; n[i]={...n[i],url:e.target.value}; set("items",n); }}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="https://..." />
              <button onClick={() => set("items", items.filter((_,j) => j!==i))}
                className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5"/></button>
            </div>
          ))}
          <button onClick={() => set("items", [...items, { name: "", url: "" }])}
            className="text-xs text-violet-600 flex items-center gap-1">
            <Plus className="h-3 w-3"/> Add registry
          </button>
        </div>
      );
    }
    case "people": {
      const people = (s.people as { name: string; role: string }[]) ?? [];
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <p className="text-xs font-medium text-gray-500">Wedding Party Members</p>
          {people.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={p.name} onChange={e => { const n=[...people]; n[i]={...n[i],name:e.target.value}; set("people",n); }}
                className="flex-1 border rounded px-2 py-1 text-sm" placeholder="Full name" />
              <input value={p.role} onChange={e => { const n=[...people]; n[i]={...n[i],role:e.target.value}; set("people",n); }}
                className="w-36 border rounded px-2 py-1 text-sm" placeholder="Role" />
              <button onClick={() => set("people", people.filter((_,j) => j!==i))}
                className="text-gray-400 hover:text-red-500"><X className="h-3.5 w-3.5"/></button>
            </div>
          ))}
          <button onClick={() => set("people", [...people, { name: "", role: "" }])}
            className="text-xs text-violet-600 flex items-center gap-1">
            <Plus className="h-3 w-3"/> Add person
          </button>
        </div>
      );
    }
    case "countdown":
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <Field label="Wedding Date (YYYY-MM-DD)" value={s.targetDate as string} onChange={v => set("targetDate", v)} />
        </div>
      );
    case "guestbook":
      return (
        <div className="space-y-3">
          <Field label="Section Title" value={s.title as string} onChange={v => set("title", v)} />
          <AreaField label="Invitation Message" value={s.message as string} onChange={v => set("message", v)} />
        </div>
      );
    default:
      return <p className="text-sm text-gray-400">No settings for this block.</p>;
  }
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <Input value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );
}

function AreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full border border-input rounded-md px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-400" />
    </div>
  );
}

// ── website preview renderer ──────────────────────────────────────────────────

function WebsitePreview({ site }: { site: LocalWeddingWebsite }) {
  const theme = THEMES[site.theme];
  const primaryHex = site.primaryColor || theme.primary;
  const accentHex  = site.accentColor  || theme.accent;
  const font       = site.fontFamily   || theme.font;

  function fmtDate(d: string) {
    try { const dt = new Date(d); return dt.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" }); }
    catch { return d; }
  }

  function daysLeft(target: string) {
    try { return Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)); }
    catch { return null; }
  }

  return (
    <div style={{ fontFamily: font }} className="min-h-screen bg-white text-gray-800">
      {site.blocks
        .filter(b => b.visible)
        .sort((a, b) => a.order - b.order)
        .map(block => {
          const s = block.settings;
          switch (block.type) {
            case "cover": {
              const rawLinks = (s.navLinks as unknown[]) ?? [];
              const navLinks: { label: string; href: string }[] = rawLinks.map(l =>
                typeof l === "string" ? { label: l, href: "" } : (l as { label: string; href: string })
              );
              const bgImg = s.backgroundImage as string | null;
              const brideName = (s.brideName as string) || "Bride Name";
              const groomName = (s.groomName as string) || "Groom Name";
              const coupleNames = `${brideName} & ${groomName}`;
              return (
                <div key={block.id} id="cover" className="relative min-h-screen flex flex-col overflow-hidden">
                  {bgImg
                    ? <img src={bgImg} alt="" className="absolute inset-0 w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                    : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${primaryHex}44, ${accentHex})` }} />
                  }
                  {bgImg && <div className="absolute inset-0 bg-black/40" />}
                  {/* Nav */}
                  {navLinks.length > 0 && (
                    <nav className="relative z-10 flex items-center justify-center gap-6 px-6 py-5 flex-wrap">
                      {navLinks.map((link, i) => (
                        <a key={i} href={link.href || undefined}
                          className={`text-sm font-medium tracking-wide cursor-pointer ${bgImg ? "text-white/90 hover:text-white" : "hover:opacity-70"}`}
                          style={!bgImg ? { color: primaryHex } : undefined}>
                          {link.label}
                        </a>
                      ))}
                    </nav>
                  )}
                  {/* Center content */}
                  <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 py-16">
                    {(s.date as string) && (
                      <div className={`border px-5 py-1.5 mb-5 text-base font-light tracking-wide ${bgImg ? "border-white/50 text-white/90" : ""}`}
                        style={!bgImg ? { borderColor: primaryHex + "66", color: primaryHex } : undefined}>
                        {s.date as string}
                      </div>
                    )}
                    {(s.quote as string) && (
                      <p className={`text-base mb-4 ${bgImg ? "text-white/80" : "text-gray-500"}`}>{s.quote as string}</p>
                    )}
                    <h1 className={`text-4xl sm:text-5xl font-bold leading-tight ${bgImg ? "text-white" : ""}`}
                      style={!bgImg ? { color: primaryHex } : undefined}>
                      {coupleNames}
                    </h1>
                  </div>
                </div>
              );
            }
            case "hero":
              return (
                <div key={block.id} id="hero" style={{ background: `linear-gradient(135deg, ${primaryHex}22, ${accentHex})` }}
                  className="py-24 px-6 text-center">
                  <p className="text-sm uppercase tracking-widest mb-4" style={{ color: primaryHex }}>
                    You&apos;re invited
                  </p>
                  <h1 className="text-5xl font-light mb-4" style={{ color: primaryHex }}>
                    {(s.title as string) || "Our Wedding"}
                  </h1>
                  {(s.subtitle as string) && (
                    <p className="text-lg text-gray-600 mb-6">{s.subtitle as string}</p>
                  )}
                  {(s.date as string) && (
                    <p className="text-base font-medium" style={{ color: primaryHex }}>
                      {fmtDate(s.date as string)}
                    </p>
                  )}
                  {(s.location as string) && (
                    <p className="text-sm text-gray-500 mt-2">📍 {s.location as string}</p>
                  )}
                </div>
              );
            case "our-story":
              return (
                <div key={block.id} id="our-story" className="max-w-2xl mx-auto py-16 px-6 text-center">
                  <h2 className="text-3xl font-light mb-6" style={{ color: primaryHex }}>
                    {(s.title as string) || "Our Story"}
                  </h2>
                  <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: primaryHex }} />
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{s.content as string}</p>
                </div>
              );
            case "venue":
              return (
                <div key={block.id} id="venue" style={{ background: accentHex }} className="py-16 px-6">
                  <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-light mb-8" style={{ color: primaryHex }}>
                      {(s.title as string) || "When & Where"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {(s.ceremonyName as string) && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Ceremony</p>
                          <p className="font-medium" style={{ color: primaryHex }}>{s.ceremonyName as string}</p>
                          {(s.ceremonyAddress as string) && <p className="text-sm text-gray-500 mt-1">{s.ceremonyAddress as string}</p>}
                          {(s.ceremonyTime as string) && <p className="text-sm font-medium mt-2">{s.ceremonyTime as string}</p>}
                        </div>
                      )}
                      {(s.receptionName as string) && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Reception</p>
                          <p className="font-medium" style={{ color: primaryHex }}>{s.receptionName as string}</p>
                          {(s.receptionAddress as string) && <p className="text-sm text-gray-500 mt-1">{s.receptionAddress as string}</p>}
                          {(s.receptionTime as string) && <p className="text-sm font-medium mt-2">{s.receptionTime as string}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            case "schedule": {
              const items = (s.items as { time: string; title: string }[]) ?? [];
              return (
                <div key={block.id} id="schedule" className="max-w-xl mx-auto py-16 px-6">
                  <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                    {(s.title as string) || "Schedule"}
                  </h2>
                  <div className="relative">
                    <div className="absolute left-[76px] top-0 bottom-0 w-px" style={{ background: accentHex }} />
                    {items.map((item, i) => (
                      <div key={i} className="flex items-start gap-6 mb-6">
                        <span className="w-[76px] text-right text-sm font-medium" style={{ color: primaryHex }}>
                          {item.time}
                        </span>
                        <div className="h-3 w-3 rounded-full mt-0.5 flex-shrink-0 z-10" style={{ background: primaryHex }} />
                        <span className="text-gray-700">{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            case "gallery": {
              const images = (s.images as string[]).filter(Boolean);
              if (images.length === 0) return null;
              return (
                <div key={block.id} id="gallery" className="py-16 px-6">
                  <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                    {(s.title as string) || "Our Photos"}
                  </h2>
                  <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="w-full h-48 object-cover rounded-xl" />
                    ))}
                  </div>
                </div>
              );
            }
            case "rsvp":
              return (
                <div key={block.id} id="rsvp" style={{ background: `${primaryHex}11` }} className="py-16 px-6 text-center">
                  <h2 className="text-3xl font-light mb-4" style={{ color: primaryHex }}>
                    {(s.title as string) || "RSVP"}
                  </h2>
                  <p className="text-gray-600 mb-2">{s.message as string}</p>
                  {(s.deadline as string) && (
                    <p className="text-sm text-gray-400 mb-6">RSVP by {s.deadline as string}</p>
                  )}
                  <button
                    style={{ background: primaryHex }}
                    className="px-8 py-3 rounded-full text-white font-medium hover:opacity-90 transition"
                  >
                    RSVP Now
                  </button>
                </div>
              );
            case "registry": {
              const items = (s.items as { name: string; url: string }[]).filter(i => i.name);
              return (
                <div key={block.id} id="registry" className="py-16 px-6">
                  <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                    {(s.title as string) || "Registry"}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                    {items.map((item, i) => (
                      <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                        style={{ borderColor: primaryHex, color: primaryHex }}
                        className="border-2 rounded-full px-6 py-2 font-medium hover:opacity-80 transition text-sm">
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            }
            case "people": {
              const people = (s.people as { name: string; role: string }[]).filter(p => p.name);
              return (
                <div key={block.id} id="people" style={{ background: accentHex }} className="py-16 px-6">
                  <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                    {(s.title as string) || "Wedding Party"}
                  </h2>
                  <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
                    {people.map((p, i) => (
                      <div key={i} className="text-center">
                        <div className="h-16 w-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl"
                          style={{ background: primaryHex + "22" }}>
                          👤
                        </div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            case "countdown": {
              const days = daysLeft(s.targetDate as string);
              return (
                <div key={block.id} id="countdown" className="py-16 px-6 text-center">
                  <h2 className="text-2xl font-light mb-6 text-gray-600">{s.title as string}</h2>
                  {days !== null ? (
                    <div className="inline-flex flex-col items-center">
                      <span className="text-7xl font-light" style={{ color: primaryHex }}>{days}</span>
                      <span className="text-sm uppercase tracking-widest text-gray-400 mt-2">Days to go</span>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Set your wedding date to see the countdown</p>
                  )}
                </div>
              );
            }
            case "guestbook":
              return (
                <div key={block.id} id="guestbook" style={{ background: accentHex }} className="py-16 px-6 text-center">
                  <h2 className="text-3xl font-light mb-4" style={{ color: primaryHex }}>
                    {(s.title as string) || "Guestbook"}
                  </h2>
                  <p className="text-gray-600 mb-6">{s.message as string}</p>
                  <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto shadow-sm">
                    <textarea rows={3} placeholder="Leave a message for the couple..."
                      className="w-full text-sm border-none outline-none resize-none text-gray-600" readOnly />
                    <div className="flex justify-end mt-3">
                      <button style={{ background: primaryHex }}
                        className="px-5 py-2 rounded-full text-white text-sm">Send</button>
                    </div>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
      {/* Footer */}
      <div className="py-8 text-center text-xs text-gray-400" style={{ borderTop: `1px solid ${accentHex}` }}>
        Made with ♥ using Ceremoney
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function WebsitePage() {
  const { id } = useParams<{ id: string }>();
  const local = isLocal(id);

  const [site, setSite] = useState<LocalWeddingWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  // Project data for auto-filling cover block
  const { brideName: projectBrideName, groomName: projectGroomName } = usePlannerCouple();
  const [projectDate, setProjectDate] = useState("");
  const [projectLocation, setProjectLocation] = useState("");

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load
  useEffect(() => {
    // Load project date for auto-fill
    if (local) {
      const proj = getLocalProject(id);
      if (proj?.eventDate) {
        try {
          const d = new Date(proj.eventDate);
          setProjectDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
        } catch { setProjectDate(""); }
      }
      // Also check ceremony venue for a date + location override
      const venue = getLocalVenue(id, "CEREMONY");
      if (venue.date) {
        try {
          const d = new Date(venue.date);
          setProjectDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
        } catch { /* keep project date */ }
      }
      // Build location string from ceremony venue
      const locParts = [venue.city, venue.country].filter(Boolean);
      if (locParts.length) {
        setProjectLocation(locParts.join(", "));
      } else if (venue.address) {
        setProjectLocation(venue.address);
      }
    } else {
      // For API mode, fetch project + ceremony data
      apiFetch(`/api/planner/projects/${id}`).then(data => {
        const proj = data.project;
        if (!proj) return;
        if (proj.eventDate) {
          try {
            const d = new Date(proj.eventDate);
            setProjectDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
          } catch { /* ignore */ }
        }
      }).catch(() => {});
      apiFetch(`/api/planner/projects/${id}/venues?type=CEREMONY`).then(data => {
        const venue = data.venue;
        if (!venue) return;
        if (venue.date) {
          try {
            const d = new Date(venue.date);
            setProjectDate(d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
          } catch { /* ignore */ }
        }
        const locParts = [venue.city, venue.country].filter(Boolean);
        if (locParts.length) {
          setProjectLocation(locParts.join(", "));
        } else if (venue.address) {
          setProjectLocation(venue.address);
        }
      }).catch(() => {});
    }

    async function load() {
      setLoading(true);
      try {
        if (local) {
          setSite(getLocalWebsite(id));
        } else {
          const data = await apiFetch(`/api/planner/projects/${id}/website`);
          if (data.website) {
            setSite({ ...data.website, blocks: Array.isArray(data.website.blocks) ? data.website.blocks : [] });
          } else {
            // First time — create from defaults
            const defaults = {
              slug: `wedding-${id.slice(-8)}`,
              published: false, theme: "modern",
              primaryColor: "#7c3aed", accentColor: "#ede9fe",
              fontFamily: "Inter", blocks: [], password: null,
            };
            const saved2 = await apiFetch(`/api/planner/projects/${id}/website`, {
              method: "PUT", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(defaults),
            });
            setSite(saved2.website);
          }
        }
      } catch (e) {
        console.error("[website load]", e);
        if (local) {
          setSite(getLocalWebsite(id));
        } else {
          setLoadError(true);
        }
      } finally { setLoading(false); }
    }
    load();
  }, [id, local]);

  // Auto-save with 800ms debounce
  const persist = useCallback((next: LocalWeddingWebsite) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        if (local) {
          saveLocalWebsite(id, next);
        } else {
          await apiFetch(`/api/planner/projects/${id}/website`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
        }
        setSaved(true);
        setSaveError(false);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        console.error("[website save]", e);
        setSaveError(true);
        setTimeout(() => setSaveError(false), 4000);
      }
      finally { setSaving(false); }
    }, 800);
  }, [id, local]);

  function update(patch: Partial<LocalWeddingWebsite>) {
    if (!site) return;
    const next = { ...site, ...patch };
    setSite(next);
    persist(next);
  }

  function updateBlock(blockId: string, settings: Record<string, unknown>) {
    if (!site) return;
    const next = { ...site, blocks: site.blocks.map(b => b.id === blockId ? { ...b, settings } : b) };
    setSite(next);
    persist(next);
  }

  function toggleBlockVisibility(blockId: string) {
    if (!site) return;
    const next = { ...site, blocks: site.blocks.map(b => b.id === blockId ? { ...b, visible: !b.visible } : b) };
    setSite(next);
    persist(next);
  }

  function moveBlock(blockId: string, dir: "up" | "down") {
    if (!site) return;
    const sorted = [...site.blocks].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(b => b.id === blockId);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sorted.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const newOrder = sorted[swapIdx].order;
    sorted[swapIdx] = { ...sorted[swapIdx], order: sorted[idx].order };
    sorted[idx]     = { ...sorted[idx],     order: newOrder };
    const next = { ...site, blocks: sorted };
    setSite(next);
    persist(next);
  }

  function deleteBlock(blockId: string) {
    if (!site) return;
    const next = { ...site, blocks: site.blocks.filter(b => b.id !== blockId) };
    setSite(next);
    persist(next);
    if (expandedBlock === blockId) setExpandedBlock(null);
  }

  function addBlock(type: WebsiteBlockType) {
    if (!site) return;
    const maxOrder = site.blocks.reduce((m, b) => Math.max(m, b.order), -1);
    const block = createWebsiteBlock(type, maxOrder + 1);
    // Auto-fill cover/hero block with project data from ceremony
    if (type === "cover") {
      block.settings = {
        ...block.settings,
        brideName: projectBrideName,
        groomName: projectGroomName,
        date: projectDate,
      };
    }
    if (type === "hero") {
      block.settings = {
        ...block.settings,
        date: projectDate,
        location: projectLocation,
      };
    }
    const next = { ...site, blocks: [...site.blocks, block] };
    setSite(next);
    persist(next);
    setShowAddBlock(false);
    setExpandedBlock(block.id);
  }

  function copyLink() {
    const url = local ? window.location.href : `${window.location.origin}/wedding/${site?.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowLinkCopied(true);
      setTimeout(() => setShowLinkCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <p className="text-red-600 font-medium">Failed to load website data.</p>
        <p className="text-sm text-gray-500">Please refresh the page. If the problem persists, check your connection.</p>
      </div>
    );
  }

  if (!site) return null;

  const sortedBlocks = [...site.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Wedding Website</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              site.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {site.published ? "Published" : "Draft"}
            </span>
            {!local && site.published && (
              <a href={`/wedding/${site.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-violet-600 flex items-center gap-1 hover:underline">
                <ExternalLink className="h-3 w-3"/> /wedding/{site.slug}
              </a>
            )}
            {saving    && <span className="text-xs text-gray-400">Saving…</span>}
            {saved     && <span className="text-xs text-green-500 flex items-center gap-1"><Check className="h-3 w-3"/>Saved</span>}
            {saveError && <span className="text-xs text-red-500">Save failed — check console</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
            <Link2 className="h-3.5 w-3.5"/>
            {showLinkCopied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="gap-1.5">
            <Eye className="h-3.5 w-3.5"/> Preview
          </Button>
          <Button
            size="sm"
            className={`gap-1.5 ${site.published ? "bg-gray-700 hover:bg-gray-800" : "bg-violet-600 hover:bg-violet-700"} text-white`}
            onClick={() => update({ published: !site.published })}
          >
            <Globe className="h-3.5 w-3.5"/>
            {site.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {/* ── Theme & Settings ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ThemeSection site={site} onUpdate={update} />
      </div>

      {/* ── Blocks ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Page Blocks</h2>
          <span className="text-xs text-gray-400">{sortedBlocks.length} blocks</span>
        </div>

        {sortedBlocks.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-gray-400">
            No blocks yet. Add your first block below.
          </p>
        )}

        <div className="divide-y divide-gray-50">
          {sortedBlocks.map((block, idx) => {
            const meta = BLOCK_META[block.type];
            const isExpanded = expandedBlock === block.id;
            return (
              <div key={block.id}>
                {/* Block row */}
                <div className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors ${!block.visible ? "opacity-50" : ""}`}>
                  {/* Visibility toggle */}
                  <button onClick={() => toggleBlockVisibility(block.id)}
                    className="text-gray-400 hover:text-violet-600 transition-colors flex-shrink-0" title={block.visible ? "Hide block" : "Show block"}>
                    {block.visible ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
                  </button>

                  {/* Icon + label */}
                  <button className="flex-1 flex items-center gap-3 text-left min-w-0"
                    onClick={() => setExpandedBlock(isExpanded ? null : block.id)}>
                    <span className="text-lg flex-shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{meta.label}</p>
                      <p className="text-xs text-gray-400 truncate">{meta.description}</p>
                    </div>
                  </button>

                  {/* Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => moveBlock(block.id, "up")} disabled={idx === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20">
                      <ArrowUp className="h-3.5 w-3.5"/>
                    </button>
                    <button onClick={() => moveBlock(block.id, "down")} disabled={idx === sortedBlocks.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20">
                      <ArrowDown className="h-3.5 w-3.5"/>
                    </button>
                    <button onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                      className={`p-1 transition-colors ${isExpanded ? "text-violet-600" : "text-gray-400 hover:text-gray-600"}`}>
                      <Settings2 className="h-3.5 w-3.5"/>
                    </button>
                    <button onClick={() => deleteBlock(block.id)}
                      className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                    <button onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                      className="p-1 text-gray-400">
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5"/> : <ChevronRight className="h-3.5 w-3.5"/>}
                    </button>
                  </div>
                </div>

                {/* Expanded settings */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-gray-50/50 border-t border-gray-100">
                    <BlockSettingsForm block={block} onChange={settings => updateBlock(block.id, settings)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add block */}
        <div className="px-5 py-4 border-t border-gray-100">
          {showAddBlock ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Choose a block to add</p>
                <button onClick={() => setShowAddBlock(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4"/>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(BLOCK_META) as WebsiteBlockType[]).map(type => {
                  const meta = BLOCK_META[type];
                  return (
                    <button key={type} onClick={() => addBlock(type)}
                      className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-colors text-left">
                      <span className="text-lg">{meta.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{meta.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddBlock(true)}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors">
              <Plus className="h-4 w-4"/> Add Block
            </button>
          )}
        </div>
      </div>

      {/* ── Preview Modal ────────────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
          <div className="bg-white flex items-center justify-between px-4 py-2 shadow-sm flex-shrink-0">
            <p className="text-sm font-medium text-gray-700">Website Preview</p>
            <button onClick={() => setShowPreview(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <X className="h-4 w-4"/>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <WebsitePreview site={site} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── theme section (extracted for clarity) ─────────────────────────────────────

function ThemeSection({
  site, onUpdate,
}: {
  site: LocalWeddingWebsite;
  onUpdate: (patch: Partial<LocalWeddingWebsite>) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button className="w-full flex items-center gap-2 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
        onClick={() => setOpen(o => !o)}>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400"/> : <ChevronRight className="h-4 w-4 text-gray-400"/>}
        <span className="font-semibold text-gray-800">Theme & Settings</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
          {/* Theme selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 mt-4">Theme</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(THEMES) as (keyof typeof THEMES)[]).map(key => {
                const th = THEMES[key];
                const active = site.theme === key;
                return (
                  <button key={key} onClick={() => onUpdate({ theme: key, primaryColor: th.primary, accentColor: th.accent, fontFamily: th.font })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm ${
                      active ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-gray-200"
                    }`}>
                    <div className="h-8 w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${th.primary}, ${th.accent})` }} />
                    <span className={`text-xs font-medium ${active ? "text-violet-700" : "text-gray-600"}`}>
                      {th.emoji} {th.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color customization */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Primary Color</p>
              <div className="flex items-center gap-2">
                <input type="color" value={site.primaryColor} onChange={e => onUpdate({ primaryColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-200 p-0.5" />
                <Input value={site.primaryColor} onChange={e => onUpdate({ primaryColor: e.target.value })}
                  className="h-9 text-sm font-mono" maxLength={7} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Accent Color</p>
              <div className="flex items-center gap-2">
                <input type="color" value={site.accentColor} onChange={e => onUpdate({ accentColor: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-200 p-0.5" />
                <Input value={site.accentColor} onChange={e => onUpdate({ accentColor: e.target.value })}
                  className="h-9 text-sm font-mono" maxLength={7} />
              </div>
            </div>
          </div>

          {/* Font selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Font Family</p>
            <select value={site.fontFamily} onChange={e => onUpdate({ fontFamily: e.target.value })}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="Inter">Inter (Modern)</option>
              <option value="Georgia">Georgia (Classic)</option>
              <option value="Merriweather">Merriweather (Elegant)</option>
              <option value="Playfair Display">Playfair Display (Romantic)</option>
            </select>
          </div>

          {/* Slug */}
          {!isLocal(site.projectId) && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Public URL Slug</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 whitespace-nowrap">/wedding/</span>
                <Input value={site.slug} onChange={e => onUpdate({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  className="h-9 text-sm font-mono" />
              </div>
            </div>
          )}

          {/* Password protection */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Password Protection (optional)</p>
            <Input value={site.password ?? ""} onChange={e => onUpdate({ password: e.target.value || null })}
              type="password" placeholder="Leave empty for no password"
              className="h-9 text-sm max-w-sm" />
          </div>
        </div>
      )}
    </>
  );
}
