"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { PlusCircle, Trash2, ChevronDown, ChevronRight, Download, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";
import {
  getLocalBudget,
  addLocalBudgetCategory,
  updateLocalBudgetCategory,
  deleteLocalBudgetCategory,
  addLocalBudgetItem,
  updateLocalBudgetItem,
  deleteLocalBudgetItem,
  LocalBudgetCategory,
  LocalBudgetItem,
} from "@/lib/planner-storage";

const DEFAULT_COLOR = "#6366f1";
const isLocal = (id: string) => id.startsWith("local-");

const DEFAULT_CATEGORIES = [
  { name: "Venue", color: "#6366f1" },
  { name: "Catering & Food", color: "#8b5cf6" },
  { name: "Photography & Video", color: "#ec4899" },
  { name: "Music & Entertainment", color: "#f43f5e" },
  { name: "Flowers & Decorations", color: "#f97316" },
  { name: "Dress & Attire", color: "#eab308" },
  { name: "Beauty & Hair", color: "#22c55e" },
  { name: "Transportation", color: "#14b8a6" },
  { name: "Cake & Sweets", color: "#3b82f6" },
  { name: "Rings & Jewelry", color: "#06b6d4" },
  { name: "Stationery & Invites", color: "#6366f1" },
  { name: "Miscellaneous", color: "#8b5cf6" },
];

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function BudgetPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const local = isLocal(id);

  const [categories, setCategories] = useState<LocalBudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");

  // Inline editing state
  const [inlineActuals, setInlineActuals] = useState<Record<string, string>>({});
  const [inlinePlanned, setInlinePlanned] = useState<Record<string, string>>({});
  const [inlineDescs, setInlineDescs] = useState<Record<string, string>>({});
  const [inlineCatNames, setInlineCatNames] = useState<Record<string, string>>({});

  // New item state per category
  const [addingItemCatId, setAddingItemCatId] = useState<string | null>(null);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPlanned, setNewItemPlanned] = useState("");
  const [newItemActual, setNewItemActual] = useState("");
  const newItemDescRef = useRef<HTMLInputElement>(null);

  // New category state
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const newCatRef = useRef<HTMLInputElement>(null);

  // Editable total budget goal
  const budgetGoalKey = `planner-${id}-budget-goal`;
  const [budgetGoal, setBudgetGoal] = useState<number>(0);
  const [editingBudgetGoal, setEditingBudgetGoal] = useState(false);
  const [budgetGoalInput, setBudgetGoalInput] = useState("");

  // Track whether budgetGoal has been loaded from source of truth
  const budgetGoalLoadedRef = useRef(false);

  // Feature gating
  const { tier } = usePlannerTier(id);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const loadBudget = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (local) {
        setCategories(getLocalBudget(id));
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/budget`);
        setCategories(data.categories ?? []);
        // Only load budgetGoal from API on first fetch — never overwrite user edits mid-session
        if (!budgetGoalLoadedRef.current) {
          budgetGoalLoadedRef.current = true;
          setBudgetGoal(data.budgetGoal ?? 0);
        }
      }
    } catch (e) {
      setCategories([]);
      setError(e instanceof Error ? e.message : "Failed to load budget");
    } finally {
      setLoading(false);
    }
  }, [id, local]);

  useEffect(() => { loadBudget(); }, [loadBudget]);

  // For local projects only: load budgetGoal from localStorage
  useEffect(() => {
    if (!local) return;
    const stored = localStorage.getItem(budgetGoalKey);
    if (stored && !budgetGoalLoadedRef.current) {
      budgetGoalLoadedRef.current = true;
      setBudgetGoal(parseFloat(stored) || 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetGoalKey, local]);

  const autoSeededRef = useRef(false);
  useEffect(() => {
    if (!loading && categories.length === 0 && !autoSeededRef.current) {
      autoSeededRef.current = true;
      loadDefaults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, categories.length]);

  // Sync inline states when categories load
  useEffect(() => {
    setInlineActuals(prev => {
      const next = { ...prev };
      categories.forEach(cat => cat.items.forEach(item => {
        if (!(item.id in next)) next[item.id] = item.actual.toString();
      }));
      return next;
    });
    setInlineDescs(prev => {
      const next = { ...prev };
      categories.forEach(cat => cat.items.forEach(item => {
        if (!(item.id in next)) next[item.id] = item.description;
      }));
      return next;
    });
    setInlinePlanned(prev => {
      const next = { ...prev };
      categories.forEach(cat => cat.items.forEach(item => {
        if (!(item.id in next)) next[item.id] = item.planned.toString();
      }));
      return next;
    });
    setInlineCatNames(prev => {
      const next = { ...prev };
      categories.forEach(cat => {
        if (!(cat.id in next)) next[cat.id] = cat.name;
      });
      return next;
    });
  }, [categories]);

  // Focus new item input when addingItemCatId changes
  useEffect(() => {
    if (addingItemCatId && newItemDescRef.current) {
      setTimeout(() => newItemDescRef.current?.focus(), 50);
    }
  }, [addingItemCatId]);

  // Focus new category input
  useEffect(() => {
    if (showNewCat && newCatRef.current) {
      setTimeout(() => newCatRef.current?.focus(), 50);
    }
  }, [showNewCat]);

  async function loadDefaults() {
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const { name, color } = DEFAULT_CATEGORIES[i];
      if (local) {
        addLocalBudgetCategory(id, { name, planned: 0, color });
      } else {
        try {
          await apiFetch(`/api/planner/projects/${id}/budget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, planned: 0, color }),
          });
        } catch { /* skip */ }
      }
    }
    await loadBudget();
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const getItemActual = (item: LocalBudgetItem) =>
    parseFloat(inlineActuals[item.id] ?? "") || item.actual;

  const totalPlanned = categories.reduce((s, c) => {
    const itemSum = c.items.reduce((ss, i) => ss + i.planned, 0);
    return s + (c.planned > 0 ? c.planned : itemSum);
  }, 0);
  const totalActual = categories.reduce(
    (s, c) => s + c.items.reduce((ss, i) => ss + getItemActual(i), 0), 0
  );
  const totalPaid = categories.reduce(
    (s, c) => s + c.items.reduce((ss, i) => ss + i.paid, 0), 0
  );

  function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── Category actions ──────────────────────────────────────────────────────
  async function saveCatName(catId: string, newName: string) {
    const cat = categories.find(c => c.id === catId);
    if (!cat || !newName.trim() || newName.trim() === cat.name) return;
    try {
      if (local) {
        updateLocalBudgetCategory(id, catId, { name: newName.trim(), planned: cat.planned, color: cat.color });
      } else {
        await apiFetch(`/api/planner/projects/${id}/budget/${catId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName.trim(), planned: cat.planned, color: cat.color }),
        });
      }
      await loadBudget();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  }

  async function deleteCat(catId: string) {
    if (!confirm(t("budget.deleteConfirm"))) return;
    if (local) { deleteLocalBudgetCategory(id, catId); }
    else { await apiFetch(`/api/planner/projects/${id}/budget/${catId}`, { method: "DELETE" }); }
    await loadBudget();
  }

  async function addNewCategory() {
    if (!newCatName.trim()) { setShowNewCat(false); return; }
    try {
      const data = { name: newCatName.trim(), planned: 0, color: DEFAULT_COLOR };
      if (local) {
        const cat = addLocalBudgetCategory(id, data);
        setExpanded(e => ({ ...e, [cat.id]: true }));
      } else {
        const res = await apiFetch(`/api/planner/projects/${id}/budget`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
        setExpanded(e => ({ ...e, [res.category.id]: true }));
      }
      setNewCatName("");
      setShowNewCat(false);
      await loadBudget();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add category");
    }
  }

  // ── Item actions ──────────────────────────────────────────────────────────
  async function saveInlineActual(catId: string, item: LocalBudgetItem, val: string) {
    const newActual = parseFloat(val) || 0;
    if (newActual === item.actual) return;
    const data = { description: item.description, planned: item.planned, actual: newActual, paid: item.paid, status: item.status, notes: item.notes ?? null };
    try {
      if (local) { updateLocalBudgetItem(id, catId, item.id, data); }
      else {
        await apiFetch(`/api/planner/projects/${id}/budget/${catId}/items/${item.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
      }
      await loadBudget();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
  }

  async function saveInlinePlanned(catId: string, item: LocalBudgetItem, val: string) {
    const newPlanned = parseFloat(val) || 0;
    if (newPlanned === item.planned) return;
    const data = { description: item.description, planned: newPlanned, actual: item.actual, paid: item.paid, status: item.status, notes: item.notes ?? null };
    try {
      if (local) { updateLocalBudgetItem(id, catId, item.id, data); }
      else {
        await apiFetch(`/api/planner/projects/${id}/budget/${catId}/items/${item.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
      }
      await loadBudget();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
  }

  async function saveInlineDesc(catId: string, item: LocalBudgetItem, newDesc: string) {
    if (!newDesc.trim() || newDesc.trim() === item.description) return;
    const data = { description: newDesc.trim(), planned: item.planned, actual: item.actual, paid: item.paid, status: item.status, notes: item.notes ?? null };
    try {
      if (local) { updateLocalBudgetItem(id, catId, item.id, data); }
      else {
        await apiFetch(`/api/planner/projects/${id}/budget/${catId}/items/${item.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
      }
      await loadBudget();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
  }

  async function deleteItem(catId: string, itemId: string) {
    if (local) { deleteLocalBudgetItem(id, catId, itemId); }
    else { await apiFetch(`/api/planner/projects/${id}/budget/${catId}/items/${itemId}`, { method: "DELETE" }); }
    setInlineActuals(prev => { const next = { ...prev }; delete next[itemId]; return next; });
    setInlineDescs(prev => { const next = { ...prev }; delete next[itemId]; return next; });
    await loadBudget();
  }

  async function commitNewItem(catId: string) {
    if (!newItemDesc.trim()) { setAddingItemCatId(null); setNewItemDesc(""); setNewItemPlanned(""); setNewItemActual(""); return; }
    try {
      const data = { description: newItemDesc.trim(), planned: parseFloat(newItemPlanned) || 0, actual: 0, paid: 0, status: "UNPAID" as const, notes: null };
      if (local) { addLocalBudgetItem(id, catId, data); }
      else {
        await apiFetch(`/api/planner/projects/${id}/budget/${catId}/items`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
        });
      }
      setNewItemDesc(""); setNewItemPlanned(""); setNewItemActual(""); setAddingItemCatId(null);
      await loadBudget();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to add item"); }
  }

  // ── PDF export ────────────────────────────────────────────────────────────
  async function exportBudgetPDF() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
    const styles = StyleSheet.create({
      page: { padding: 40, fontFamily: "Helvetica" },
      title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#1e1b4b" },
      catHeader: { fontSize: 12, fontWeight: "bold", color: "#ffffff", backgroundColor: "#6366f1", padding: "6 10", marginTop: 16, marginBottom: 0 },
      row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 5, paddingHorizontal: 10 },
      rowAlt: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 5, paddingHorizontal: 10, backgroundColor: "#f9fafb" },
      colDesc: { flex: 1, fontSize: 9, color: "#374151" },
      colNum: { width: 80, fontSize: 9, color: "#374151", textAlign: "right" },
      tableHead: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 10, backgroundColor: "#f3f4f6" },
      colHeadDesc: { flex: 1, fontSize: 8, fontWeight: "bold", color: "#9ca3af" },
      colHead: { width: 80, fontSize: 8, fontWeight: "bold", color: "#9ca3af", textAlign: "right" },
      paidBadge: { fontSize: 7, fontWeight: "bold", color: "#16a34a", marginLeft: 5 },
      summaryBox: { marginTop: 24, borderTopWidth: 2, borderTopColor: "#6366f1", paddingTop: 12 },
      summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
      summaryLabel: { fontSize: 10, color: "#6b7280" },
      summaryValue: { fontSize: 10, fontWeight: "bold", color: "#111827" },
    });
    const fmtNum = (n: number) => `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const pdfTotalSpent = categories.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.planned, 0), 0);
    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Wedding Budget</Text>
          {categories.map(cat => (
            <View key={cat.id}>
              <Text style={{ ...styles.catHeader, backgroundColor: cat.color }}>{cat.name}</Text>
              {cat.items.length > 0 && (
                <>
                  <View style={styles.tableHead}>
                    <Text style={styles.colHeadDesc}>Title</Text>
                    <Text style={styles.colHead}>Cost</Text>
                  </View>
                  {cat.items.map((item, idx) => (
                    <View key={item.id} style={idx % 2 === 0 ? styles.row : styles.rowAlt}>
                      <Text style={styles.colDesc}>
                        {item.description}
                        {item.paid > 0 && <Text style={styles.paidBadge}>  Paid</Text>}
                      </Text>
                      <Text style={styles.colNum}>{fmtNum(item.planned)}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={styles.summaryValue}>{fmtNum(budgetGoal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>{fmtNum(pdfTotalSpent)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Paid</Text>
              <Text style={styles.summaryValue}>{fmtNum(totalPaid)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining</Text>
              <Text style={styles.summaryValue}>{budgetGoal - pdfTotalSpent < 0 ? "-" : ""}{fmtNum(budgetGoal - pdfTotalSpent)}</Text>
            </View>
          </View>
        </Page>
      </Document>
    );
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wedding-budget.pdf"; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredCategories = filter.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(i =>
          i.description.toLowerCase().includes(filter.toLowerCase()) ||
          cat.name.toLowerCase().includes(filter.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0 || cat.name.toLowerCase().includes(filter.toLowerCase()))
    : categories;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("budget.heading")}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportBudgetPDF}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => setShowNewCat(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            {t("budget.addCategory")}
          </button>
        </div>
      </div>

      {/* Totals bar */}
      {(() => {
        const remaining = budgetGoal - totalPlanned;
        const overBudget = remaining < 0;
        return (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Total Budget — editable */}
            <div
              className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-center shadow-sm cursor-pointer group"
              onClick={() => { if (!editingBudgetGoal) { setBudgetGoalInput(budgetGoal > 0 ? budgetGoal.toString() : ""); setEditingBudgetGoal(true); } }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t("budget.totalBudget")}</p>
              {editingBudgetGoal ? (
                <input
                  autoFocus
                  type="number"
                  value={budgetGoalInput}
                  onChange={e => setBudgetGoalInput(e.target.value)}
                  onBlur={async () => {
                    const v = parseFloat(budgetGoalInput) || 0;
                    setBudgetGoal(v);
                    if (local) {
                      localStorage.setItem(budgetGoalKey, v.toString());
                    } else {
                      try {
                        await apiFetch(`/api/planner/projects/${id}/budget`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ budgetGoal: v }),
                        });
                      } catch { /* silent */ }
                    }
                    setEditingBudgetGoal(false);
                  }}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur(); }}
                  className="mt-1 w-full bg-transparent text-xl font-bold text-indigo-600 text-center focus:outline-none border-b-2 border-indigo-400"
                  placeholder="0"
                />
              ) : (
                <p className="mt-1 text-xl font-bold text-indigo-600">
                  ${budgetGoal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  <span className="ml-1 text-[10px] font-normal text-indigo-300 group-hover:text-indigo-400">✎</span>
                </p>
              )}
            </div>

            {/* Total Spent */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t("budget.totalSpent")}</p>
              <p className="mt-1 text-xl font-bold text-gray-800">
                ${totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Total Paid */}
            <div className="rounded-2xl border border-gray-100 bg-emerald-50 px-4 py-4 text-center shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t("budget.totalPaid")}</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">
                ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Remaining */}
            <div className={`rounded-2xl border border-gray-100 px-4 py-4 text-center shadow-sm ${overBudget ? "bg-red-50" : "bg-amber-50"}`}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t("budget.remaining")}</p>
              <p className={`mt-1 text-xl font-bold ${overBudget ? "text-red-500" : "text-amber-600"}`}>
                {overBudget ? "-$" : "$"}{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 border border-red-100">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-indigo-400 focus:outline-none shadow-sm"
        />
      </div>

      {/* New category input */}
      {showNewCat && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DEFAULT_COLOR }} />
          <input
            ref={newCatRef}
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onBlur={addNewCategory}
            onKeyDown={e => { if (e.key === "Enter") addNewCategory(); if (e.key === "Escape") { setShowNewCat(false); setNewCatName(""); } }}
            placeholder="Category name…"
            className="flex-1 bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCategories.map(cat => {
            const catActualTotal = cat.items.reduce((s, i) => s + (parseFloat(inlinePlanned[i.id] ?? "") || i.planned), 0);
            const isExpanded = expanded[cat.id] ?? true;

            return (
              <div key={cat.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Category header */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    onClick={() => setExpanded(e => ({ ...e, [cat.id]: !isExpanded }))}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <input
                    value={inlineCatNames[cat.id] ?? cat.name}
                    onChange={e => setInlineCatNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    onBlur={e => saveCatName(cat.id, e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    className="flex-1 bg-transparent font-semibold text-gray-800 text-sm focus:outline-none focus:border-b focus:border-indigo-300"
                  />
                  <button
                    onClick={() => deleteCat(cat.id)}
                    className="flex-shrink-0 rounded-lg p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Column headers */}
                    <div className="flex items-center px-4 py-2 bg-gray-50">
                      <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Title</span>
                      <span className="w-40 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Cost</span>
                    </div>

                    {/* Item rows */}
                    {cat.items.map(item => {
                      const costVal = parseFloat(inlinePlanned[item.id] ?? "") || item.planned;
                      const isZero = costVal === 0;
                      const isPaid = item.paid > 0;
                      return (
                        <div key={item.id} className={`group flex items-center px-4 py-2.5 border-t border-gray-100 hover:bg-gray-50/50 transition-colors ${isPaid ? "bg-emerald-50/30" : ""}`}>
                          {/* Paid checkbox */}
                          <input
                            type="checkbox"
                            checked={isPaid}
                            title="Mark as paid"
                            onChange={async e => {
                              const newPaid = e.target.checked ? (parseFloat(inlinePlanned[item.id] ?? "") || item.planned) : 0;
                              const data = { description: item.description, planned: item.planned, actual: item.actual, paid: newPaid, status: e.target.checked ? "PAID" as const : "UNPAID" as const, notes: item.notes ?? null };
                              try {
                                if (local) { updateLocalBudgetItem(id, cat.id, item.id, data); }
                                else {
                                  await apiFetch(`/api/planner/projects/${id}/budget/${cat.id}/items/${item.id}`, {
                                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
                                  });
                                }
                                await loadBudget();
                              } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
                            }}
                            className="mr-2 flex-shrink-0 h-3.5 w-3.5 accent-emerald-500 cursor-pointer"
                          />
                          {/* Description */}
                          <input
                            value={inlineDescs[item.id] ?? item.description}
                            onChange={e => setInlineDescs(prev => ({ ...prev, [item.id]: e.target.value }))}
                            onBlur={e => saveInlineDesc(cat.id, item, e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            className={`flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none focus:border-b focus:border-indigo-300 truncate ${isPaid ? "text-gray-400 line-through" : "text-indigo-600"}`}
                          />
                          {/* Delete (hover) */}
                          <button
                            onClick={() => deleteItem(cat.id, item.id)}
                            className="mx-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-gray-300 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {/* Cost (planned → feeds Total Budget) */}
                          <div className="flex items-center gap-1 w-40 justify-end flex-shrink-0">
                            <span className={`text-sm ${isZero ? "text-gray-300" : "text-gray-500"}`}>$</span>
                            <input
                              type="number"
                              value={inlinePlanned[item.id] ?? item.planned.toString()}
                              onChange={e => setInlinePlanned(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onBlur={e => saveInlinePlanned(cat.id, item, e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className={`w-28 bg-transparent text-sm tabular-nums text-right focus:outline-none focus:bg-white focus:border focus:border-indigo-300 focus:rounded-lg px-1 py-0.5 transition-colors ${isZero ? "text-gray-300" : "font-medium text-gray-700"}`}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* New item inline row */}
                    {addingItemCatId === cat.id && (
                      <div className="flex items-center px-4 py-2.5 border-t border-indigo-100 bg-indigo-50/20 gap-2">
                        <input
                          ref={newItemDescRef}
                          value={newItemDesc}
                          onChange={e => setNewItemDesc(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") (e.currentTarget.nextElementSibling?.querySelector("input") as HTMLInputElement | null)?.focus();
                            if (e.key === "Escape") { setAddingItemCatId(null); setNewItemDesc(""); setNewItemPlanned(""); }
                          }}
                          placeholder="Item description…"
                          className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none border-b border-indigo-300"
                        />
                        <div className="flex items-center gap-1 w-40 justify-end flex-shrink-0">
                          <span className="text-sm text-gray-400">$</span>
                          <input
                            type="number"
                            value={newItemPlanned}
                            onChange={e => setNewItemPlanned(e.target.value)}
                            onBlur={() => commitNewItem(cat.id)}
                            onKeyDown={e => {
                              if (e.key === "Enter") commitNewItem(cat.id);
                              if (e.key === "Escape") { setAddingItemCatId(null); setNewItemDesc(""); setNewItemPlanned(""); }
                            }}
                            placeholder="0"
                            className="w-28 bg-transparent text-sm tabular-nums text-right focus:outline-none border-b border-indigo-300 px-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Category footer */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setAddingItemCatId(cat.id);
                          setNewItemDesc(""); setNewItemPlanned(""); setNewItemActual("");
                        }}
                        className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 transition-colors"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add new item
                      </button>
                      <span className={`text-sm font-semibold tabular-nums ${catActualTotal === 0 ? "text-gray-300" : "text-gray-700"}`}>
                        $ {fmt(catActualTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom summary */}
      {categories.length > 0 && (() => {
        const remaining = budgetGoal - totalPlanned;
        const overBudget = remaining < 0;
        return (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-500">{t("budget.totalBudget")}</span>
                <span className="text-sm font-semibold text-indigo-600">${budgetGoal.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-500">{t("budget.totalSpent")}</span>
                <span className="text-sm font-semibold text-gray-800">${totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-500">{t("budget.totalPaid")}</span>
                <span className="text-sm font-semibold text-emerald-600">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50/60">
                <span className="text-sm font-semibold text-gray-700">{t("budget.remaining")}</span>
                <span className={`text-sm font-bold ${overBudget ? "text-red-500" : "text-amber-600"}`}>
                  {overBudget ? "-$" : "$"}{Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {categories.length} {categories.length === 1 ? "category" : "categories"} · {categories.reduce((s, c) => s + c.items.length, 0)} items
              </p>
              <button
                onClick={exportBudgetPDF}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="h-4 w-4 text-gray-500" />
                Download PDF
              </button>
            </div>
          </div>
        );
      })()}
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}
