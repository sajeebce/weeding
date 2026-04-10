"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  PlusCircle, Trash2, Pencil, X, Check, Phone, Mail,
  Globe, StickyNote, Upload, Link2, Plus, Download,
  MessageSquare, Send, ChevronLeft, Store, Archive,
  FileText, Copy, Trash,
} from "lucide-react";
import {
  getLocalVendors, addLocalVendor, updateLocalVendor, deleteLocalVendor,
  VENDOR_CATEGORY_LABELS, VendorCategory, LocalVendor,
} from "@/lib/planner-storage";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";

const isLocal = (id: string) => id.startsWith("local-");

const CATEGORIES = Object.entries(VENDOR_CATEGORY_LABELS) as [VendorCategory, string][];

type PublicVendor = {
  id: string; slug: string; businessName: string; category: string;
  tagline: string | null; city: string | null; country: string | null;
  coverPhoto: string | null; startingPrice: number | null; currency: string | null;
  isFeatured: boolean; reviewCount: number; avgRating: number | null;
};

interface ProjectConversation {
  id: string;
  status: "ACTIVE" | "ARCHIVED" | "SPAM";
  lastMessageAt: string;
  unreadCount: number;
  totalMessages: number;
  vendor: {
    id: string;
    businessName: string;
    category: string;
    slug: string;
    city: string | null;
    country: string | null;
    photos: string[];
  };
}

interface ConvMessage {
  id: string;
  senderRole: "VENDOR" | "GUEST";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConvThread {
  id: string;
  status: string;
  messages: ConvMessage[];
  vendor: {
    id: string;
    businessName: string;
    category: string;
    slug: string;
    city: string | null;
    country: string | null;
    photos: string[];
  };
}

const CATEGORY_GRADIENTS: Record<VendorCategory, string> = {
  VENUE:           "from-purple-500 to-indigo-700",
  PHOTOGRAPHY:     "from-pink-500 to-rose-600",
  VIDEOGRAPHY:     "from-rose-500 to-red-600",
  CATERING:        "from-orange-400 to-amber-600",
  MUSIC_DJ:        "from-yellow-400 to-orange-500",
  FLOWERS:         "from-green-400 to-emerald-600",
  DRESS_ATTIRE:    "from-fuchsia-500 to-pink-700",
  RINGS:           "from-amber-400 to-yellow-600",
  DECORATIONS:     "from-teal-400 to-cyan-600",
  TRANSPORTATION:  "from-blue-500 to-indigo-600",
  HAIR_MAKEUP:     "from-indigo-400 to-purple-600",
  WEDDING_PLANNER: "from-violet-500 to-purple-700",
  OTHER:           "from-gray-400 to-slate-600",
};

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type ApiVendor = {
  id: string; projectId: string; name: string; category: VendorCategory;
  email: string | null; phone: string | null; website: string | null;
  notes: string | null; createdAt: string; updatedAt: string;
};

function toLocal(v: ApiVendor): LocalVendor {
  return { ...v };
}

interface VendorForm {
  name: string;
  category: VendorCategory;
  email: string;
  phone: string;
  website: string;
  notes: string;
}

const emptyForm = (): VendorForm => ({
  name: "", category: "OTHER", email: "", phone: "", website: "", notes: "",
});

function VendorFormFields({ form, setForm }: {
  form: VendorForm;
  setForm: (f: VendorForm) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Vendor Name *</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="e.g. Sakura Photography"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value as VendorCategory })}
        >
          {CATEGORIES.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="+1 234 567 8900"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="vendor@example.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="https://vendor.com"
          value={form.website}
          onChange={e => setForm({ ...form, website: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea
          rows={2}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          placeholder="Any notes about this vendor..."
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
        />
      </div>
    </div>
  );
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function VendorsPage() {
  const { id } = useParams<{ id: string }>();
  const local = isLocal(id);
  const { tier } = usePlannerTier(id);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [vendors, setVendors] = useState<LocalVendor[]>([]);
  const [publicVendors, setPublicVendors] = useState<PublicVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideSuggested, setHideSuggested] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<VendorForm>(emptyForm());
  const [addError, setAddError] = useState<string | null>(null);
  const [addSaving, setAddSaving] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VendorForm>(emptyForm());
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // ── Brief state ──
  const [showBrief, setShowBrief] = useState(false);
  const [briefToken, setBriefToken] = useState<string | null>(null);
  const [briefGenerating, setBriefGenerating] = useState(false);
  const [briefRevoking, setBriefRevoking] = useState(false);
  const [briefCopied, setBriefCopied] = useState(false);

  async function handleGenerateBrief() {
    if (local) return;
    setBriefGenerating(true);
    try {
      const data = await apiFetch(`/api/planner/projects/${id}/brief`, { method: "POST" });
      setBriefToken(data.brief.token);
      setShowBrief(true);
    } catch {
      // silent
    } finally {
      setBriefGenerating(false);
    }
  }

  async function handleOpenBrief() {
    if (local) return;
    setBriefGenerating(true);
    try {
      const data = await apiFetch(`/api/planner/projects/${id}/brief`);
      const tokens: { token: string }[] = data.tokens ?? [];
      if (tokens.length > 0) {
        setBriefToken(tokens[0].token);
      } else {
        const created = await apiFetch(`/api/planner/projects/${id}/brief`, { method: "POST" });
        setBriefToken(created.brief.token);
      }
      setShowBrief(true);
    } catch {
      // silent
    } finally {
      setBriefGenerating(false);
    }
  }

  async function handleRevokeBrief() {
    if (!briefToken || local) return;
    setBriefRevoking(true);
    try {
      await apiFetch(`/api/planner/projects/${id}/brief/${briefToken}`, { method: "DELETE" });
      setBriefToken(null);
      setShowBrief(false);
    } catch {
      // silent
    } finally {
      setBriefRevoking(false);
    }
  }

  function handleCopyBriefLink() {
    if (!briefToken) return;
    const url = `${window.location.origin}/brief/${briefToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setBriefCopied(true);
      setTimeout(() => setBriefCopied(false), 2000);
    });
  }

  // ── Conversation state ──
  const [conversations, setConversations] = useState<ProjectConversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [msgPanelVendorId, setMsgPanelVendorId] = useState<string | null>(null); // active panel
  const [msgPanelVendorName, setMsgPanelVendorName] = useState("");
  const [thread, setThread] = useState<ConvThread | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [newMsgText, setNewMsgText] = useState(""); // for starting new conversation
  const [newMsgSending, setNewMsgSending] = useState(false);
  const [newMsgError, setNewMsgError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConversations = useCallback(async () => {
    if (local) return;
    setConvLoading(true);
    try {
      const data = await apiFetch(`/api/planner/projects/${id}/conversations`);
      setConversations(data.conversations ?? []);
    } catch {
      // silent
    } finally {
      setConvLoading(false);
    }
  }, [id, local]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (local) {
        setVendors(getLocalVendors(id));
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/vendors`);
        setVendors((data.vendors as ApiVendor[]).map(toLocal));
      }
      const pub = await apiFetch(`/api/vendors?page=1`);
      setPublicVendors(pub.vendors ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, [id, local]);

  useEffect(() => {
    load();
    loadConversations();
  }, [load, loadConversations]);

  const openConvPanel = useCallback(async (vendorId: string, vendorName: string) => {
    setMsgPanelVendorId(vendorId);
    setMsgPanelVendorName(vendorName);
    setThread(null);
    setMsgText("");
    setMsgError("");
    setNewMsgText("");
    setNewMsgError("");

    // Check if conversation exists for this vendor + project
    const existing = conversations.find(c => c.vendor.id === vendorId);
    if (existing) {
      setThreadLoading(true);
      try {
        const data = await apiFetch(`/api/planner/projects/${id}/conversations/${existing.id}`);
        setThread(data.conversation);
        // Mark unread as read in local state
        setConversations(prev => prev.map(c => c.id === existing.id ? { ...c, unreadCount: 0 } : c));
      } finally {
        setThreadLoading(false);
      }
    }
  }, [conversations, id]);

  // Poll for new messages when panel is open
  useEffect(() => {
    if (!msgPanelVendorId || !thread) return;
    const convId = thread.id;
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiFetch(`/api/planner/projects/${id}/conversations/${convId}`);
        setThread(data.conversation);
      } catch { /* silent */ }
    }, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [msgPanelVendorId, thread, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  async function sendNewMessage() {
    if (!msgPanelVendorId || !newMsgText.trim() || newMsgSending) return;
    setNewMsgSending(true);
    setNewMsgError("");
    try {
      const data = await apiFetch(`/api/planner/projects/${id}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: msgPanelVendorId, message: newMsgText.trim() }),
      });
      setNewMsgText("");
      // Load the thread
      const threadData = await apiFetch(`/api/planner/projects/${id}/conversations/${data.conversationId}`);
      setThread(threadData.conversation);
      await loadConversations();
    } catch (e) {
      setNewMsgError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setNewMsgSending(false);
    }
  }

  async function sendReply() {
    if (!thread || !msgText.trim() || msgSending) return;
    setMsgSending(true);
    setMsgError("");
    try {
      await apiFetch(`/api/planner/projects/${id}/conversations/${thread.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msgText.trim() }),
      });
      setMsgText("");
      const data = await apiFetch(`/api/planner/projects/${id}/conversations/${thread.id}`);
      setThread(data.conversation);
      await loadConversations();
    } catch (e) {
      setMsgError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setMsgSending(false);
    }
  }

  async function archiveConv(convId: string) {
    try {
      await apiFetch(`/api/planner/projects/${id}/conversations/${convId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      await loadConversations();
      if (thread?.id === convId) setThread(prev => prev ? { ...prev, status: "ARCHIVED" } : null);
    } catch { /* silent */ }
  }

  async function handleAdd() {
    if (!addForm.name.trim()) { setAddError("Name is required"); return; }
    setAddSaving(true);
    setAddError(null);
    try {
      const payload = {
        name: addForm.name.trim(),
        category: addForm.category,
        email: addForm.email.trim() || null,
        phone: addForm.phone.trim() || null,
        website: addForm.website.trim() || null,
        notes: addForm.notes.trim() || null,
      };
      if (local) {
        const v = addLocalVendor(id, payload);
        setVendors(prev => [...prev, v]);
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/vendors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setVendors(prev => [...prev, toLocal(data.vendor)]);
      }
      setShowAdd(false);
      setAddForm(emptyForm());
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add vendor");
    } finally {
      setAddSaving(false);
    }
  }

  function openEdit(v: LocalVendor) {
    setEditId(v.id);
    setEditForm({
      name: v.name,
      category: v.category,
      email: v.email ?? "",
      phone: v.phone ?? "",
      website: v.website ?? "",
      notes: v.notes ?? "",
    });
    setEditError(null);
  }

  async function handleEdit() {
    if (!editId) return;
    if (!editForm.name.trim()) { setEditError("Name is required"); return; }
    setEditSaving(true);
    setEditError(null);
    try {
      const patch = {
        name: editForm.name.trim(),
        category: editForm.category,
        email: editForm.email.trim() || null,
        phone: editForm.phone.trim() || null,
        website: editForm.website.trim() || null,
        notes: editForm.notes.trim() || null,
      };
      if (local) {
        updateLocalVendor(id, editId, patch);
        setVendors(prev => prev.map(v => v.id === editId ? { ...v, ...patch } : v));
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/vendors/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        setVendors(prev => prev.map(v => v.id === editId ? toLocal(data.vendor) : v));
      }
      setEditId(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(vendorId: string) {
    if (!confirm("Remove this vendor?")) return;
    try {
      if (local) {
        deleteLocalVendor(id, vendorId);
        setVendors(prev => prev.filter(v => v.id !== vendorId));
      } else {
        await apiFetch(`/api/planner/projects/${id}/vendors/${vendorId}`, { method: "DELETE" });
        setVendors(prev => prev.filter(v => v.id !== vendorId));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
      const added: LocalVendor[] = [];
      for (const row of rows) {
        const name = (row["Name"] || row["name"] || "").toString().trim();
        if (!name) continue;
        const rawCat = (row["Category"] || row["category"] || "OTHER")
          .toString().toUpperCase().replace(/[\s/&-]/g, "_");
        const category: VendorCategory =
          (Object.keys(VENDOR_CATEGORY_LABELS) as VendorCategory[]).includes(rawCat as VendorCategory)
            ? (rawCat as VendorCategory) : "OTHER";
        const payload = {
          name,
          category,
          email: (row["Email"] || row["email"] || "").trim() || null,
          phone: (row["Phone"] || row["phone"] || "").trim() || null,
          website: (row["Website"] || row["website"] || "").trim() || null,
          notes: (row["Notes"] || row["notes"] || "").trim() || null,
        };
        if (local) {
          added.push(addLocalVendor(id, payload));
        } else {
          const data = await apiFetch(`/api/planner/projects/${id}/vendors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          added.push(toLocal(data.vendor));
        }
      }
      setVendors(prev => [...prev, ...added]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
      if (fileRef2.current) fileRef2.current.value = "";
    }
  }

  async function handleDownloadTemplate(fmt: "csv" | "xlsx") {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([
      ["Name", "Category", "Email", "Phone", "Website", "Notes"],
      ["Example Photography", "PHOTOGRAPHY", "info@example.com", "+1 234 567 890", "https://example.com", "Booked for ceremony"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");
    XLSX.writeFile(wb, `vendors-template.${fmt}`);
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/invite/vendor?project=${id}`;
    navigator.clipboard.writeText(url).then(() => alert("Invite link copied!"));
  }

  async function handleDownloadPDF() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
    const styles = StyleSheet.create({
      page: { padding: 40, fontFamily: "Helvetica" },
      title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#1e1b4b" },
      cat: { fontSize: 9, color: "#7c3aed", marginBottom: 2 },
      name: { fontSize: 13, fontWeight: "bold", color: "#111827", marginBottom: 4 },
      info: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
      card: { marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
    });
    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>All Vendors</Text>
          {vendors.map(v => (
            <View key={v.id} style={styles.card}>
              <Text style={styles.cat}>{VENDOR_CATEGORY_LABELS[v.category]}</Text>
              <Text style={styles.name}>{v.name}</Text>
              {v.phone && <Text style={styles.info}>📞 {v.phone}</Text>}
              {v.email && <Text style={styles.info}>✉ {v.email}</Text>}
              {v.website && <Text style={styles.info}>🌐 {v.website}</Text>}
              {v.notes && <Text style={styles.info}>📝 {v.notes}</Text>}
            </View>
          ))}
        </Page>
      </Document>
    );
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "vendors.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  const totalUnread = conversations.reduce((n, c) => n + c.unreadCount, 0);

  return (
    <>
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">All Vendors</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-2xl mx-auto">
          Discover the perfect <strong>vendors</strong>, <strong>venues</strong>, and <strong>services</strong> for
          your wedding day by trying your luck in our extensive database of verified professionals. Additionally,
          you have the freedom to add a <strong>custom vendor</strong> to your personal list, ensuring that every
          aspect of your special day is tailored to your unique vision.
        </p>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setShowAdd(true); setAddForm(emptyForm()); setAddError(null); }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add custom vendor
        </button>

        <label className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          {importing ? "Importing…" : "Import from file"}
          <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleImport} />
        </label>

        <div className="flex items-center gap-1 text-xs">
          <button onClick={() => handleDownloadTemplate("xlsx")} className="text-purple-600 hover:underline px-2 py-2">
            Template XLS
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => handleDownloadTemplate("csv")} className="text-purple-600 hover:underline px-2 py-2">
            Template CSV
          </button>
        </div>

        <button
          onClick={handleCopyInvite}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors ml-auto"
        >
          <Link2 className="w-4 h-4" />
          Copy invite link for supplier
        </button>

        {!local && (
          <button
            onClick={handleOpenBrief}
            disabled={briefGenerating}
            className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {briefGenerating ? "Generating…" : "Share Event Brief"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className="mb-4 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">{error}</div>}

      {/* ── Horizontal row: public directory vendors ── */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {publicVendors.slice(0, 4).map(v => {
            const existingConv = conversations.find(c => c.vendor.id === v.id);
            return (
              <div key={v.id} className="flex-shrink-0 w-48 h-56 rounded-2xl overflow-hidden relative group shadow-sm hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-500 to-indigo-700">
                {v.coverPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.coverPhoto} alt={v.businessName} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  <span className="text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full leading-4">
                    {v.category.replace(/_/g, " ")}
                  </span>
                  {existingConv && existingConv.unreadCount > 0 && (
                    <span className="bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {existingConv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
                  <p className="text-white/70 text-[10px] font-medium mb-0.5">
                    {v.category.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <h3 className="text-white font-bold text-sm leading-snug mb-2">{v.businessName}</h3>
                  {!local && (
                    <button
                      onClick={() => openConvPanel(v.id, v.businessName)}
                      className="flex items-center gap-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors w-full justify-center"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {existingConv ? "Continue chat" : "Message"}
                    </button>
                  )}
                </div>
                <Link
                  href={`/vendors/${v.slug}`}
                  target="_blank"
                  className="absolute top-0 left-0 right-0 h-32"
                />
              </div>
            );
          })}

          {/* Search and Add Vendors */}
          <Link
            href="/vendors"
            className="flex-shrink-0 w-48 h-56 group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-purple-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full border-2 border-purple-300 group-hover:border-purple-500 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-purple-400 group-hover:text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-500 group-hover:text-purple-700 transition-colors text-center px-4">
              Search and Add Vendors
            </span>
          </Link>
          <div className="flex-shrink-0 w-1" />
        </div>
      )}

      {/* ── Private vendor grid ── */}
      {!loading && vendors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map(v => (
            <div key={v.id} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm group bg-white">
              <div className={`relative h-36 bg-gradient-to-br ${CATEGORY_GRADIENTS[v.category]}`}>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(v)} className="p-1.5 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="p-1.5 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-red-500/60 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="absolute top-3 left-3 text-xs font-medium bg-white/25 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full">
                  {VENDOR_CATEGORY_LABELS[v.category]}
                </span>
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/40 to-transparent">
                  <h3 className="text-white font-bold text-sm leading-tight">{v.name}</h3>
                </div>
              </div>
              <div className="px-3 py-2.5 space-y-1">
                {v.phone && (
                  <a href={`tel:${v.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                    <Phone className="w-3 h-3 flex-shrink-0" /><span className="truncate">{v.phone}</span>
                  </a>
                )}
                {v.email && (
                  <a href={`mailto:${v.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                    <Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{v.email}</span>
                  </a>
                )}
                {v.website && (
                  <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-600 transition-colors">
                    <Globe className="w-3 h-3 flex-shrink-0" /><span className="truncate">{v.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
                {v.notes && (
                  <div className="flex items-start gap-2 text-xs text-gray-400 mt-0.5">
                    <StickyNote className="w-3 h-3 flex-shrink-0 mt-0.5" /><span className="line-clamp-2">{v.notes}</span>
                  </div>
                )}
                {!v.phone && !v.email && !v.website && !v.notes && (
                  <p className="text-xs text-gray-300 py-1">No contact info</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor count */}
      {vendors.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} total
        </p>
      )}

      {/* ── Vendor Conversations ── */}
      {!local && (
        <div className="mt-10 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-gray-900">Vendor Messages</h2>
              {totalUnread > 0 && (
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          {convLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No vendor conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Click &quot;Message&quot; on a vendor above to start a conversation</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 transition-colors cursor-pointer group"
                  onClick={() => openConvPanel(conv.vendor.id, conv.vendor.businessName)}
                >
                  {conv.vendor.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={conv.vendor.photos[0]} alt={conv.vendor.businessName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Store className="w-4 h-4 text-purple-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{conv.vendor.businessName}</span>
                      {conv.status === "ARCHIVED" && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Archived</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {conv.vendor.category.replace(/_/g, " ")} · {conv.totalMessages} message{conv.totalMessages !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {conv.unreadCount > 0 && (
                      <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatTime(conv.lastMessageAt)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveConv(conv.id); }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 transition-all"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Info sections ── */}
      <div className="mt-10 space-y-6 border-t border-gray-100 pt-8">
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you haven&apos;t found the supplier you&apos;re looking for in our existing categories, you can
            easily <strong>add a custom vendor</strong> to the list. This feature helps you keep all your
            contacts and essential details organized in one convenient location, ensuring everything remains up
            to date.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => { setShowAdd(true); setAddForm(emptyForm()); setAddError(null); }}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add custom vendor
            </button>
            <span className="text-gray-400 text-sm">or</span>
            <label className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              Import from file
              <input ref={fileRef2} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you know a reliable and trustworthy supplier, venue, or wedding professional who would be a
            valuable addition to our platform, you can use the <strong>invite link below</strong> to recommend
            our platform.
          </p>
          <button
            onClick={handleCopyInvite}
            className="mt-3 flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            Copy invite link for supplier
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            We also display <strong>recommended vendors</strong> conveniently located near you or within your area.
          </p>
          <button
            onClick={() => setHideSuggested(h => !h)}
            className="mt-3 flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {hideSuggested ? "Show suggested vendors" : "Hide suggested vendors"}
          </button>
        </div>
      </div>

      {/* Download PDF */}
      <div className="mt-8">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-sm text-gray-700 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-gray-500" />
          Download PDF file
        </button>
      </div>

      {/* ── Share Event Brief Modal ── */}
      {showBrief && briefToken && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBrief(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Share Event Brief</h2>
              </div>
              <button onClick={() => setShowBrief(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Share this link with a vendor so they can see your event details — date, venue, guest count, budget, and confirmed vendors.
            </p>

            <div className="bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5 mb-4">
              <p className="text-xs text-gray-400 mb-1">Brief link</p>
              <p className="text-sm text-gray-700 font-mono break-all">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/brief/${briefToken}`
                  : `/brief/${briefToken}`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyBriefLink}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {briefCopied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={briefToken ? `/brief/${briefToken}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Preview
              </a>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <p className="text-xs text-gray-400 mb-2">
                Anyone with this link can view your event brief. Revoke to disable access.
              </p>
              <button
                onClick={handleRevokeBrief}
                disabled={briefRevoking}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash className="w-3.5 h-3.5" />
                {briefRevoking ? "Revoking…" : "Revoke this link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Vendor Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Custom Vendor</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <VendorFormFields form={addForm} setForm={setAddForm} />
            {addError && <p className="text-red-500 text-xs mt-3">{addError}</p>}
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={addSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {addSaving ? "Adding…" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Vendor Modal ── */}
      {editId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditId(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Vendor</h2>
              <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <VendorFormFields form={editForm} setForm={setEditForm} />
            {editError && <p className="text-red-500 text-xs mt-3">{editError}</p>}
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setEditId(null)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={editSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Conversation Slide-Over Panel ── */}
      {msgPanelVendorId && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={() => {
            setMsgPanelVendorId(null);
            if (pollRef.current) clearInterval(pollRef.current);
          }} />
          {/* Panel */}
          <div className="w-full max-w-md bg-white flex flex-col shadow-2xl h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
              <button
                onClick={() => {
                  setMsgPanelVendorId(null);
                  if (pollRef.current) clearInterval(pollRef.current);
                }}
                className="p-1.5 rounded text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{msgPanelVendorName}</p>
                <p className="text-xs text-gray-400">
                  {thread ? `${thread.messages.length} messages` : "Start a conversation"}
                </p>
              </div>
              {thread && thread.status === "ACTIVE" && (
                <button
                  onClick={() => archiveConv(thread.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </div>

            {threadLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
              </div>
            ) : thread ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {thread.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderRole === "GUEST" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.senderRole === "VENDOR" && (
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Store className="w-3 h-3 text-purple-500" />
                        </div>
                      )}
                      <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.senderRole === "GUEST"
                          ? "bg-purple-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.senderRole === "GUEST" ? "text-purple-200" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply compose */}
                {thread.status !== "ARCHIVED" ? (
                  <div className="border-t border-gray-100 px-4 py-3 shrink-0">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                        }}
                        rows={2}
                        placeholder="Type a message… (Enter to send)"
                        className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={sendReply}
                        disabled={msgSending || !msgText.trim()}
                        className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    {msgError && <p className="text-xs text-red-500 mt-1">{msgError}</p>}
                  </div>
                ) : (
                  <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400 shrink-0">
                    This conversation is archived.
                    <button
                      onClick={() => { if (thread) { archiveConv(thread.id); setThread(prev => prev ? { ...prev, status: "ACTIVE" } : null); } }}
                      className="ml-1 text-purple-600 underline"
                    >Restore</button>
                  </div>
                )}
              </>
            ) : (
              /* New conversation */
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-7 h-7 text-purple-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Start a conversation</p>
                    <p className="text-xs text-gray-400 mt-1">Send your first message to {msgPanelVendorName}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 px-4 py-3 shrink-0">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMsgText}
                      onChange={(e) => setNewMsgText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendNewMessage(); }
                      }}
                      rows={3}
                      placeholder={`Hi ${msgPanelVendorName}, I'm interested in your services for my wedding…`}
                      className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={sendNewMessage}
                      disabled={newMsgSending || !newMsgText.trim()}
                      className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  {newMsgError && <p className="text-xs text-red-500 mt-1">{newMsgError}</p>}
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    This message will appear in the vendor&apos;s inbox.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}
