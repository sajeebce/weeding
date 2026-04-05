"use client";

import { useState, useEffect } from "react";
import { Send, BookOpen } from "lucide-react";

interface GuestbookEntry {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

interface Props {
  websiteId: string;
  title?: string;
  message?: string;
  primaryColor: string;
  accentColor: string;
  initialEntries: GuestbookEntry[];
}

export default function GuestbookSection({
  websiteId,
  title,
  message,
  primaryColor,
  accentColor,
  initialEntries,
}: Props) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Refresh entries from server
    fetch(`/api/guestbook/${websiteId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.entries) setEntries(data.entries); })
      .catch(() => {});
  }, [websiteId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) { setError("Please fill in your name and message."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/guestbook/${websiteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: name.trim(), message: text.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to submit. Please try again.");
        return;
      }
      const data = await res.json();
      setEntries(prev => [data.entry, ...prev]);
      setName("");
      setText("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return ""; }
  };

  return (
    <section id="guestbook" style={{ background: accentColor }} className="py-16 px-6 text-center">
      <h2 className="text-3xl font-light mb-4" style={{ color: primaryColor }}>
        {title || "Guestbook"}
      </h2>
      {message && <p className="text-gray-600 mb-8">{message}</p>}

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 max-w-lg mx-auto shadow-sm text-left mb-8">
        {success ? (
          <div className="flex flex-col items-center py-4 gap-2">
            <BookOpen className="w-8 h-8" style={{ color: primaryColor }} />
            <p className="text-sm font-medium text-gray-700">Your message has been added!</p>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs underline mt-1"
              style={{ color: primaryColor }}
            >
              Leave another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-3">Leave a message for the couple</p>
            <div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
              />
            </div>
            <div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write your wishes here…"
                rows={4}
                maxLength={1000}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
              />
              <p className="text-[11px] text-gray-300 text-right mt-0.5">{text.length}/1000</p>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ background: primaryColor }}
            >
              {submitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting ? "Sending…" : "Sign Guestbook"}
            </button>
          </form>
        )}
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3 text-left">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-xl px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-800">{entry.authorName}</span>
                <span className="text-xs text-gray-400">{formatDate(entry.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{entry.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
