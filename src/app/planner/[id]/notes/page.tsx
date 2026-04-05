"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Download } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getLocalNotes,
  addLocalNote,
  updateLocalNote,
  deleteLocalNote,
  LocalNote,
} from "@/lib/planner-storage";

const isLocal = (id: string) => id.startsWith("local-");

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const local = isLocal(id);

  const [notes, setNotes] = useState<LocalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      if (local) {
        const n = getLocalNotes(id);
        setNotes(n);
        if (n.length > 0 && !activeId) setActiveId(n[0].id);
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/notes`);
        const n = data.notes ?? [];
        setNotes(n);
        if (n.length > 0 && !activeId) setActiveId(n[0].id);
      }
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [id, local]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const activeNote = notes.find(n => n.id === activeId) ?? null;

  async function createNote() {
    const data = { title: t("notes.untitled"), content: "" };
    if (local) {
      const note = addLocalNote(id, data);
      setNotes(prev => [note, ...prev]);
      setActiveId(note.id);
    } else {
      const res = await apiFetch(`/api/planner/projects/${id}/notes`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      setNotes(prev => [res.note, ...prev]);
      setActiveId(res.note.id);
    }
  }

  async function updateField(noteId: string, field: "title" | "content", value: string) {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, [field]: value } : n));
    setSaving(true);
    try {
      if (local) { updateLocalNote(id, noteId, { [field]: value }); }
      else {
        await apiFetch(`/api/planner/projects/${id}/notes/${noteId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }),
        });
      }
    } catch {/* ignore */} finally { setSaving(false); }
  }

  async function deleteNote(noteId: string) {
    if (!confirm(t("notes.deleteConfirm"))) return;
    if (local) { deleteLocalNote(id, noteId); }
    else { await apiFetch(`/api/planner/projects/${id}/notes/${noteId}`, { method: "DELETE" }); }
    const remaining = notes.filter(n => n.id !== noteId);
    setNotes(remaining);
    setActiveId(remaining.length > 0 ? remaining[0].id : null);
  }

  async function downloadPDF() {
    if (!activeNote) return;
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");

    const styles = StyleSheet.create({
      page: { padding: 48, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
      title: { fontSize: 20, fontWeight: "bold", color: "#1e1b4b", marginBottom: 6 },
      meta: { fontSize: 9, color: "#9ca3af", marginBottom: 24 },
      body: { fontSize: 11, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" },
    });

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{activeNote.title || "Untitled"}</Text>
          <Text style={styles.meta}>
            {new Date(activeNote.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </Text>
          <View>
            {(activeNote.content || "").split("\n").map((line, i) => (
              <Text key={i} style={styles.body}>{line || " "}</Text>
            ))}
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeNote.title || "note"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString();
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="flex w-56 flex-shrink-0 flex-col border-r border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">{t("notes.heading")}</span>
          <button onClick={createNote} className="rounded-lg p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
            </div>
          ) : notes.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">{t("notes.noNotes")}</p>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className={`group w-full px-4 py-2.5 text-left transition-colors ${
                  activeId === note.id ? "bg-white border-r-2 border-indigo-500" : "hover:bg-white"
                }`}
              >
                <p className="truncate text-sm font-medium text-gray-700">{note.title || t("notes.untitled")}</p>
                <p className="mt-0.5 truncate text-[10px] text-gray-400">{timeAgo(note.updatedAt)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeNote ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">{t("notes.noNotes")}</p>
              <button onClick={createNote}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                <Plus className="h-4 w-4" /> {t("notes.addNote")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Note header */}
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-3">
              <input
                value={activeNote.title}
                onChange={e => updateField(activeNote.id, "title", e.target.value)}
                placeholder={t("notes.titlePlaceholder")}
                className="flex-1 bg-transparent text-lg font-semibold text-gray-800 placeholder-gray-300 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                {saving && <span className="text-xs text-gray-400">Saving...</span>}
                <button
                  onClick={downloadPDF}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                  title="Download as PDF"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={() => deleteNote(activeNote.id)} className="rounded-lg p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Editor area */}
            <textarea
              value={activeNote.content}
              onChange={e => updateField(activeNote.id, "content", e.target.value)}
              placeholder={t("notes.placeholder")}
              className="flex-1 resize-none bg-white px-6 py-4 text-sm text-gray-700 placeholder-gray-300 focus:outline-none leading-relaxed"
            />
          </>
        )}
      </div>
    </div>
  );
}
