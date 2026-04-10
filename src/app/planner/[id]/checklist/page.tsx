"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ChevronDown, ChevronRight, Settings, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { usePlannerTier, isPremiumOrElite } from "@/hooks/use-planner-tier";
import { UpgradeModal } from "@/components/planner/upgrade-modal";
import {
  getLocalChecklist,
  getLocalProject,
  addLocalChecklistTask,
  updateLocalChecklistTask,
  deleteLocalChecklistTask,
  seedLocalChecklist,
  LocalChecklistTask,
  SubTask,
} from "@/lib/planner-storage";

const isLocal = (id: string) => id.startsWith("local-");

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

function newSubtaskId() { return `sub-${Math.random().toString(36).slice(2, 9)}`; }

// Default tasks — 3-month countdown
const DEFAULT_TASKS: Omit<LocalChecklistTask, "id" | "projectId" | "order" | "createdAt" | "updatedAt">[] = [
  // ── 3 months before ────────────────────────────────────────────────────────
  {
    title: "Confirm Your Final Guest List",
    description: "Set your RSVP deadline and lock in the final headcount so you can confirm numbers with your caterer and venue.",
    subtasks: [
      { id: newSubtaskId(), title: "Set and communicate RSVP deadline to all guests", completed: false },
      { id: newSubtaskId(), title: "Follow up with guests who haven't responded", completed: false },
      { id: newSubtaskId(), title: "Finalize total headcount for caterer & venue", completed: false },
    ],
    dueMonths: 3, category: "Guests", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Order Wedding Favours",
    description: "A little gift goes a long way. Research, personalise, and order early to avoid delays.",
    subtasks: [
      { id: newSubtaskId(), title: "Browse favour ideas and choose a style", completed: false },
      { id: newSubtaskId(), title: "Personalise or customise chosen favours", completed: false },
      { id: newSubtaskId(), title: "Place order and confirm delivery date", completed: false },
    ],
    dueMonths: 3, category: "Decor", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Plan Your Rehearsal Dinner",
    description: "The night before is just as special. Organise a gathering for close family and the wedding party.",
    subtasks: [
      { id: newSubtaskId(), title: "Decide on venue, size, and format", completed: false },
      { id: newSubtaskId(), title: "Send invitations to rehearsal dinner guests", completed: false },
      { id: newSubtaskId(), title: "Book restaurant or venue and confirm menu", completed: false },
    ],
    dueMonths: 3, category: "Planning", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Confirm Honeymoon Bookings",
    description: "Double-check flights, hotels, and travel documents are all in order.",
    subtasks: [
      { id: newSubtaskId(), title: "Reconfirm all flight and accommodation bookings", completed: false },
      { id: newSubtaskId(), title: "Check passport expiry and any visa requirements", completed: false },
      { id: newSubtaskId(), title: "Arrange travel insurance", completed: false },
    ],
    dueMonths: 3, category: "Honeymoon", completed: false, completedAt: null, isDefault: true,
  },

  // ── 2 months before ────────────────────────────────────────────────────────
  {
    title: "Plan Seating Arrangements",
    description: "Once RSVPs are in, create your seating plan and table assignments.",
    subtasks: [
      { id: newSubtaskId(), title: "Compile final RSVP count", completed: false },
      { id: newSubtaskId(), title: "Assign tables and create seating chart", completed: false },
      { id: newSubtaskId(), title: "Print place cards and table numbers", completed: false },
    ],
    dueMonths: 2, category: "Guests", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Confirm All Vendors",
    description: "Touch base with every vendor 4–6 weeks before to confirm timings and logistics.",
    subtasks: [
      { id: newSubtaskId(), title: "Send final guest count to caterer", completed: false },
      { id: newSubtaskId(), title: "Confirm arrival times with all vendors", completed: false },
      { id: newSubtaskId(), title: "Share venue map, parking info, and day-of contact", completed: false },
    ],
    dueMonths: 2, category: "Vendors", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Finalise Ceremony Details",
    description: "Lock in the order of service, readings, music, and any special moments.",
    subtasks: [
      { id: newSubtaskId(), title: "Confirm order of service with officiant", completed: false },
      { id: newSubtaskId(), title: "Choose ceremony music and give list to band/DJ", completed: false },
      { id: newSubtaskId(), title: "Confirm readings and brief the readers", completed: false },
    ],
    dueMonths: 2, category: "Ceremony", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Purchase Wedding Rings",
    description: "Allow time for resizing or engraving. Don't leave this one too late!",
    subtasks: [
      { id: newSubtaskId(), title: "Try on rings and confirm sizing", completed: false },
      { id: newSubtaskId(), title: "Order engraving if desired", completed: false },
      { id: newSubtaskId(), title: "Collect rings and store safely", completed: false },
    ],
    dueMonths: 2, category: "Attire", completed: false, completedAt: null, isDefault: true,
  },

  // ── 1 month before ─────────────────────────────────────────────────────────
  {
    title: "Final Dress / Suit Fitting",
    description: "Your final fitting ensures your outfit fits perfectly on the big day.",
    subtasks: [
      { id: newSubtaskId(), title: "Attend final fitting with shoes and accessories", completed: false },
      { id: newSubtaskId(), title: "Confirm collection or delivery date", completed: false },
    ],
    dueMonths: 1, category: "Attire", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Create Your Day-of Timeline",
    description: "A detailed schedule ensures your wedding day runs smoothly for everyone involved.",
    subtasks: [
      { id: newSubtaskId(), title: "Write a full hour-by-hour timeline", completed: false },
      { id: newSubtaskId(), title: "Share with all vendors and the wedding party", completed: false },
      { id: newSubtaskId(), title: "Assign a day-of coordinator or emergency contact", completed: false },
    ],
    dueMonths: 1, category: "Planning", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Write Your Personal Vows",
    description: "If you're writing personal vows, give yourself plenty of time to craft and practise them.",
    subtasks: [
      { id: newSubtaskId(), title: "Draft your vows and review with partner if sharing", completed: false },
      { id: newSubtaskId(), title: "Practise reading them aloud", completed: false },
      { id: newSubtaskId(), title: "Print on nice card or keepsake paper", completed: false },
    ],
    dueMonths: 1, category: "Ceremony", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Break In Your Wedding Shoes",
    description: "Avoid blisters on the big day — wear your shoes around the house to break them in.",
    subtasks: [
      { id: newSubtaskId(), title: "Wear shoes indoors for 30 min a day", completed: false },
      { id: newSubtaskId(), title: "Use insoles or blister plasters if needed", completed: false },
    ],
    dueMonths: 1, category: "Attire", completed: false, completedAt: null, isDefault: true,
  },

  // ── 1 week before ─────────────────────────────────────────────────────────
  {
    title: "Final Venue Walkthrough",
    description: "Visit the venue one last time to confirm room setup, décor placement, and logistics.",
    subtasks: [
      { id: newSubtaskId(), title: "Walk through ceremony and reception spaces", completed: false },
      { id: newSubtaskId(), title: "Confirm table layout matches seating plan", completed: false },
      { id: newSubtaskId(), title: "Verify AV, lighting, and sound setup", completed: false },
    ],
    dueMonths: 0.25, category: "Venue", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Prepare Your Wedding Emergency Kit",
    description: "Pack a small bag of essentials to handle any last-minute surprises on the day.",
    subtasks: [
      { id: newSubtaskId(), title: "Safety pins, needle & thread, fashion tape", completed: false },
      { id: newSubtaskId(), title: "Pain relief, plasters, and blister pads", completed: false },
      { id: newSubtaskId(), title: "Stain remover pen, breath mints, tissues", completed: false },
    ],
    dueMonths: 0.25, category: "Planning", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Confirm Morning Schedule",
    description: "Coordinate arrival times for hair, makeup, getting-ready, and pre-ceremony photos.",
    subtasks: [
      { id: newSubtaskId(), title: "Confirm hair & makeup artist arrival time", completed: false },
      { id: newSubtaskId(), title: "Share getting-ready schedule with bridal party", completed: false },
      { id: newSubtaskId(), title: "Book photographer for getting-ready shots", completed: false },
    ],
    dueMonths: 0.25, category: "Planning", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Arrange Guest Transportation",
    description: "Make sure everyone can get to the ceremony and reception without stress.",
    subtasks: [
      { id: newSubtaskId(), title: "Confirm shuttle or coach bookings", completed: false },
      { id: newSubtaskId(), title: "Share parking information with guests", completed: false },
      { id: newSubtaskId(), title: "Arrange transport for elderly or mobility guests", completed: false },
    ],
    dueMonths: 0.25, category: "Logistics", completed: false, completedAt: null, isDefault: true,
  },

  // ── Wedding Day ─────────────────────────────────────────────────────────────
  {
    title: "Wedding Rehearsal",
    description: "Practice the ceremony order the evening before so the big day flows perfectly.",
    subtasks: [
      { id: newSubtaskId(), title: "Schedule rehearsal at the ceremony venue", completed: false },
      { id: newSubtaskId(), title: "Brief the wedding party on their roles and timings", completed: false },
    ],
    dueMonths: 0, category: "Ceremony", completed: false, completedAt: null, isDefault: true,
  },
  {
    title: "Ring Out the Bells — You're Getting Married!",
    description: "This is it! Take a deep breath and enjoy every single moment of your special day.",
    subtasks: [
      { id: newSubtaskId(), title: "Prepare a wedding day emergency kit", completed: false },
      { id: newSubtaskId(), title: "Eat a good breakfast and stay hydrated", completed: false },
      { id: newSubtaskId(), title: "Enjoy your wedding day!", completed: false },
    ],
    dueMonths: 0, category: "Ceremony", completed: false, completedAt: null, isDefault: true,
  },
];

// Returns only tasks whose deadline hasn't passed yet relative to today.
// dueMonths=0 (Wedding Day) and null (custom) are always included.
function filterTasksByDaysLeft<T extends { dueMonths: number | null }>(
  tasks: T[],
  daysLeft: number | null
): T[] {
  if (daysLeft === null) return tasks;
  return tasks.filter((t) => {
    if (t.dueMonths === null || t.dueMonths === 0) return true;
    if (daysLeft > 90) return true;
    if (daysLeft > 60) return t.dueMonths <= 2;
    if (daysLeft > 30) return t.dueMonths <= 1;
    if (daysLeft >= 7) return t.dueMonths <= 0.25;
    return false;
  });
}

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const local = isLocal(id);
  const { tier } = usePlannerTier(id);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [tasks, setTasks] = useState<LocalChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [eventDate, setEventDate] = useState<string | null>(null);

  // Days remaining until wedding (null if no event date set)
  const daysLeft = eventDate
    ? Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / 86400000))
    : null;

  // Group-level collapse state — overdue groups start collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const groupsInitializedRef = useRef(false);

  // Add task form per group
  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Add subtask
  const [addingSubtaskFor, setAddingSubtaskFor] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState("");
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (local) {
        setTasks(getLocalChecklist(id));
        const proj = getLocalProject(id);
        setEventDate(proj?.eventDate ?? null);
      } else {
        const data = await apiFetch(`/api/planner/projects/${id}/checklist`);
        setTasks(data.tasks ?? []);
        const proj = await fetch(`/api/planner/projects/${id}`);
        if (proj.ok) {
          const d = await proj.json();
          setEventDate(d.project?.eventDate ?? null);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [id, local]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const autoSeededRef = useRef(false);
  useEffect(() => {
    if (!loading && !seeding && tasks.length === 0 && !autoSeededRef.current) {
      autoSeededRef.current = true;
      handleSeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, seeding, tasks.length]);

  // Auto-collapse overdue groups on first load
  useEffect(() => {
    if (!loading && !groupsInitializedRef.current && tasks.length > 0 && daysLeft !== null) {
      groupsInitializedRef.current = true;
      const initial: Record<string, boolean> = {};
      const seen = new Set<string>();
      tasks.forEach((t) => {
        const key = t.dueMonths !== null ? String(t.dueMonths) : "custom";
        if (!seen.has(key)) {
          seen.add(key);
          if (t.dueMonths !== null && t.dueMonths > 0 && daysLeft < t.dueMonths * 30 - 2) {
            initial[key] = true; // collapsed
          }
        }
      });
      setCollapsedGroups(initial);
    }
  }, [loading, tasks, daysLeft]);

  // Focus subtask input when opened
  useEffect(() => {
    if (addingSubtaskFor && subtaskInputRef.current) {
      subtaskInputRef.current.focus();
    }
  }, [addingSubtaskFor]);

  async function handleSeed(reset = false) {
    if (reset && !confirm("This will delete all existing tasks and replace them with the default list. Continue?")) return;
    setSeeding(true);
    setError(null);
    try {
      const filteredTasks = filterTasksByDaysLeft(DEFAULT_TASKS, daysLeft);
      if (local) {
        seedLocalChecklist(id, filteredTasks, reset);
      } else {
        await apiFetch(`/api/planner/projects/${id}/checklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seed: filteredTasks, reset }),
        });
      }
      await loadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to seed tasks");
    } finally { setSeeding(false); }
  }

  async function toggleTask(task: LocalChecklistTask) {
    const completed = !task.completed;
    const completedAt = completed ? new Date().toISOString() : null;
    const updated = { ...task, completed, completedAt };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    try {
      if (local) {
        updateLocalChecklistTask(id, task.id, { completed, completedAt });
      } else {
        await apiFetch(`/api/planner/projects/${id}/checklist/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed, completedAt }),
        });
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t)); // revert
    }
  }

  async function toggleSubtask(task: LocalChecklistTask, subId: string) {
    const subtasks = (task.subtasks as SubTask[]).map(s =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    const updated = { ...task, subtasks };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    try {
      if (local) {
        updateLocalChecklistTask(id, task.id, { subtasks });
      } else {
        await apiFetch(`/api/planner/projects/${id}/checklist/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks }),
        });
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  }

  async function addTask(groupKey: string) {
    if (!newTitle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const dueMonths = groupKey === "custom" ? null : parseFloat(groupKey);
      const data = {
        title: newTitle.trim(),
        description: null,
        subtasks: [],
        dueMonths: isNaN(dueMonths as number) ? null : dueMonths,
        category: null,
        completed: false,
        completedAt: null,
        isDefault: false,
      };
      if (local) { addLocalChecklistTask(id, data); }
      else {
        await apiFetch(`/api/planner/projects/${id}/checklist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      setNewTitle(""); setAddingGroup(null);
      await loadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add task");
    } finally { setSaving(false); }
  }

  async function addSubtask(task: LocalChecklistTask) {
    if (!newSubtask.trim()) return;
    const subtasks = [...(task.subtasks as SubTask[]), { id: newSubtaskId(), title: newSubtask.trim(), completed: false }];
    const updated = { ...task, subtasks };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    setNewSubtask(""); setAddingSubtaskFor(null);
    try {
      if (local) {
        updateLocalChecklistTask(id, task.id, { subtasks });
      } else {
        await apiFetch(`/api/planner/projects/${id}/checklist/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks }),
        });
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  }

  async function deleteSubtask(task: LocalChecklistTask, subId: string) {
    const subtasks = (task.subtasks as SubTask[]).filter(s => s.id !== subId);
    const updated = { ...task, subtasks };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    try {
      if (local) { updateLocalChecklistTask(id, task.id, { subtasks }); }
      else {
        await apiFetch(`/api/planner/projects/${id}/checklist/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subtasks }),
        });
      }
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    }
  }

  async function deleteTask(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      if (local) { deleteLocalChecklistTask(id, taskId); }
      else { await apiFetch(`/api/planner/projects/${id}/checklist/${taskId}`, { method: "DELETE" }); }
    } catch {
      await loadTasks(); // revert
    }
  }

  // Group tasks by dueMonths
  const groups = Array.from(
    tasks.reduce((map, task) => {
      const key = task.dueMonths !== null && task.dueMonths !== undefined ? String(task.dueMonths) : "custom";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
      return map;
    }, new Map<string, LocalChecklistTask[]>())
  ).sort(([a], [b]) => {
    const numA = a === "custom" ? -1 : parseFloat(a);
    const numB = b === "custom" ? -1 : parseFloat(b);
    return numB - numA;
  });

  // Compute actual month label from wedding date
  function groupLabel(key: string): { primary: string; secondary?: string } {
    if (key === "custom") return { primary: "Custom tasks" };
    const months = parseFloat(key);
    if (months === 0) return { primary: "Wedding Day" };
    if (months === 0.25) {
      if (eventDate) {
        const d = new Date(eventDate);
        d.setDate(d.getDate() - 7);
        return { primary: d.toLocaleString("default", { month: "long", year: "numeric" }), secondary: "1 week before" };
      }
      return { primary: "1 week before" };
    }
    if (eventDate) {
      const weddingDate = new Date(eventDate);
      weddingDate.setMonth(weddingDate.getMonth() - months);
      const monthName = weddingDate.toLocaleString("default", { month: "long", year: "numeric" });
      const secondary = months === 1 ? "1 month before" : `${months} months before`;
      return { primary: monthName, secondary };
    }
    if (months === 1) return { primary: "1 month before" };
    return { primary: `${months} months before` };
  }

  const totalDone = tasks.reduce((s, t) => {
    const subs = t.subtasks as SubTask[];
    return s + (subs.length > 0 ? subs.filter(s => s.completed).length : (t.completed ? 1 : 0));
  }, 0);
  const totalItems = tasks.reduce((s, t) => {
    const subs = t.subtasks as SubTask[];
    return s + (subs.length > 0 ? subs.length : 1);
  }, 0);
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  function handleDownloadPdf() {
    if (!isPremiumOrElite(tier)) { setShowUpgrade(true); return; }
    window.print();
  }

  // ── Print-only view (clean PDF layout) ────────────────────────────────────
  const PrintView = () => (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#111", fontSize: "11pt", lineHeight: 1.5 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.2rem" }}>
        <h1 style={{ fontSize: "20pt", fontWeight: "bold", margin: 0, fontFamily: "Arial, sans-serif" }}>Wedding Checklist</h1>
        {eventDate && (
          <p style={{ margin: "4px 0 0", fontSize: "11pt", color: "#555" }}>
            Wedding on {new Date(eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>
      <hr style={{ border: "none", borderTop: "1.5px solid #222", marginBottom: "1.2rem" }} />

      {/* Groups */}
      {groups.map(([groupKey, groupTasks]) => {
        const label = groupLabel(groupKey);
        return (
          <div key={groupKey} className="print-avoid-break" style={{ marginBottom: "1.4rem" }}>
            <h2 style={{ fontSize: "13pt", fontWeight: "bold", margin: "0 0 6px", fontFamily: "Arial, sans-serif" }}>
              {label.primary}
              {label.secondary && <span style={{ fontWeight: "normal", fontSize: "10pt", color: "#666", marginLeft: "8px" }}>({label.secondary})</span>}
            </h2>
            <hr style={{ border: "none", borderTop: "1px solid #ccc", marginBottom: "8px" }} />
            {groupTasks.map(task => {
              const subs = task.subtasks as SubTask[];
              return (
                <div key={task.id} style={{ marginBottom: "10px" }}>
                  {/* Main task */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ width: "13px", height: "13px", border: "1.5px solid #333", flexShrink: 0, marginTop: "2px", backgroundColor: task.completed ? "#333" : "white" }} />
                    <span style={{ fontWeight: "bold", textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "#888" : "#111" }}>
                      {task.title}
                    </span>
                  </div>
                  {/* Subtasks */}
                  {subs.map(sub => (
                    <div key={sub.id} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginLeft: "21px", marginTop: "4px" }}>
                      <div style={{ width: "11px", height: "11px", border: "1px solid #666", flexShrink: 0, marginTop: "2px", backgroundColor: sub.completed ? "#555" : "white" }} />
                      <span style={{ fontSize: "10pt", color: sub.completed ? "#aaa" : "#333", textDecoration: sub.completed ? "line-through" : "none" }}>
                        {sub.title}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
    <style>{`
      @page { size: A4; margin: 1.5cm 2cm; }
      @media print {
        html, body { visibility: hidden !important; }
        .print-only {
          visibility: visible !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          background: white !important;
        }
        .print-only * { visibility: visible !important; }
        .print-avoid-break { page-break-inside: avoid; }
      }
    `}</style>
    {/* Print-only clean PDF view */}
    <div className="print-only" style={{ display: "none" }}>
      <PrintView />
    </div>
    <div className="no-print mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-1 flex items-start justify-between gap-2">
        <button
          onClick={() => handleSeed(true)}
          disabled={seeding || tasks.length === 0}
          className="text-xs text-gray-400 hover:text-indigo-500 disabled:opacity-0 transition-colors whitespace-nowrap"
          title="Reset to 3-month default tasks"
        >
          ↺ Reset defaults
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("checklist.heading")}</h1>
        </div>
        <Link
          href={`/planner/${id}/settings`}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>
      <p className="mb-3 text-center text-sm text-gray-500">
        This is your personal to-do list. Add, remove, or complete any task and keep on top of your deadlines. Any changes? Just click to edit.
      </p>
      {eventDate && (
        <p className="mb-5 text-center text-sm text-gray-600">
          Wedding Date:{" "}
          <span className="text-indigo-600 underline decoration-dotted cursor-default">
            {new Date(eventDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </span>
        </p>
      )}

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
            <span>{t("checklist.completed").replace("{done}", String(totalDone)).replace("{total}", String(totalItems))}</span>
            <span className="font-semibold text-indigo-600">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([groupKey, groupTasks]) => {
            const label = groupLabel(groupKey);

            {
              const isGroupCollapsed = collapsedGroups[groupKey] ?? false;
              const isOverdue =
                daysLeft !== null &&
                groupKey !== "custom" &&
                parseFloat(groupKey) > 0 &&
                daysLeft < parseFloat(groupKey) * 30 - 2;

              return (
              <div key={groupKey}>
                {/* Group header */}
                <div className="mb-3 flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 text-left"
                    onClick={() => setCollapsedGroups(prev => ({ ...prev, [groupKey]: !isGroupCollapsed }))}
                  >
                    {isGroupCollapsed
                      ? <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-800">{label.primary}</h2>
                        {isOverdue && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-500">
                            Overdue
                          </span>
                        )}
                      </div>
                      {label.secondary && <p className="text-xs text-gray-400">{label.secondary}</p>}
                    </div>
                  </button>
                  <button
                    onClick={() => { setAddingGroup(groupKey); setNewTitle(""); }}
                    className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> {t("checklist.addTask")}
                  </button>
                </div>

                {!isGroupCollapsed && (
                <>
                {/* Add task form */}
                {addingGroup === groupKey && (
                  <div className="mb-2 flex gap-2">
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addTask(groupKey); if (e.key === "Escape") setAddingGroup(null); }}
                      placeholder={t("checklist.addTaskPlaceholder")}
                      className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                    <button onClick={() => addTask(groupKey)} disabled={saving || !newTitle.trim()}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                      {saving ? "..." : t("budget.save")}
                    </button>
                    <button onClick={() => setAddingGroup(null)}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50">
                      ✕
                    </button>
                  </div>
                )}

                {/* Tasks */}
                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  {groupTasks.map(task => {
                    const subs = task.subtasks as SubTask[];
                    const subDone = subs.filter(s => s.completed).length;
                    const subTotal = subs.length;
                    const isExpanded = expanded[task.id] ?? false;
                    const taskProgress = subTotal > 0 ? `${subDone}/${subTotal}` : null;

                    return (
                      <div key={task.id} className="group">
                        {/* Task row */}
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task)}
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                              task.completed
                                ? "border-indigo-500 bg-indigo-500 text-white"
                                : "border-gray-300 hover:border-indigo-400"
                            }`}
                          >
                            {task.completed && (
                              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>

                          {/* Title */}
                          <span
                            className={`flex-1 cursor-pointer text-sm font-medium transition-colors ${
                              task.completed ? "text-gray-400 line-through" : "text-gray-700 hover:text-indigo-600"
                            }`}
                            onClick={() => setExpanded(e => ({ ...e, [task.id]: !isExpanded }))}
                          >
                            {task.title}
                          </span>

                          {/* Subtask count + expand */}
                          <div className="flex items-center gap-2">
                            {taskProgress && (
                              <span className="text-xs text-gray-400">{taskProgress}</span>
                            )}
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setExpanded(e => ({ ...e, [task.id]: !isExpanded }))}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded
                                ? <ChevronDown className="h-4 w-4" />
                                : <ChevronRight className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="border-t border-gray-50 bg-gray-50/40 px-4 pb-3 pt-2">
                            {task.description && (
                              <p className="mb-3 text-xs leading-relaxed text-gray-500">{task.description}</p>
                            )}

                            {subTotal > 0 && (
                              <div className="mb-2">
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Subtasks</p>
                                <div className="space-y-1">
                                  {subs.map(sub => (
                                    <div key={sub.id} className="group/sub flex items-start gap-2">
                                      <button
                                        onClick={() => toggleSubtask(task, sub.id)}
                                        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                                          sub.completed
                                            ? "border-indigo-400 bg-indigo-400 text-white"
                                            : "border-gray-300 hover:border-indigo-400"
                                        }`}
                                      >
                                        {sub.completed && (
                                          <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </button>
                                      <span className={`flex-1 text-xs leading-relaxed ${sub.completed ? "text-gray-400 line-through" : "text-gray-600"}`}>
                                        {sub.title}
                                      </span>
                                      <button
                                        onClick={() => deleteSubtask(task, sub.id)}
                                        className="mt-0.5 opacity-0 group-hover/sub:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add subtask */}
                            {addingSubtaskFor === task.id ? (
                              <div className="mt-2 flex gap-2">
                                <input
                                  ref={subtaskInputRef}
                                  value={newSubtask}
                                  onChange={e => setNewSubtask(e.target.value)}
                                  onKeyDown={e => { if (e.key === "Enter") addSubtask(task); if (e.key === "Escape") { setAddingSubtaskFor(null); setNewSubtask(""); } }}
                                  placeholder="Subtask description..."
                                  className="flex-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                />
                                <button onClick={() => addSubtask(task)} disabled={!newSubtask.trim()}
                                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                                  Add
                                </button>
                                <button onClick={() => { setAddingSubtaskFor(null); setNewSubtask(""); }}
                                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-100">
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setAddingSubtaskFor(task.id); setNewSubtask(""); }}
                                className="mt-1 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600"
                              >
                                <Plus className="h-3 w-3" /> Add sub-task
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </>
                )}
              </div>
            );}
          })}

          {/* Add task to custom group */}
          <div className="text-center">
            <button
              onClick={() => { setAddingGroup("custom"); setNewTitle(""); }}
              className="text-sm text-indigo-500 hover:text-indigo-700"
            >
              <Plus className="inline h-4 w-4" /> {t("checklist.addTask")}
            </button>
            {addingGroup === "custom" && !groups.find(([k]) => k === "custom") && (
              <div className="mt-2 flex gap-2 max-w-sm mx-auto">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTask("custom"); if (e.key === "Escape") setAddingGroup(null); }}
                  placeholder={t("checklist.addTaskPlaceholder")}
                  className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
                <button onClick={() => addTask("custom")} disabled={saving || !newTitle.trim()}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "..." : t("budget.save")}
                </button>
                <button onClick={() => setAddingGroup(null)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500">✕</button>
              </div>
            )}
          </div>

          {/* Download PDF */}
          <div className="no-print flex justify-center pt-4">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-red-400" />
              Download PDF file
            </button>
          </div>
        </div>
      )}
    </div>
    <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} defaultTab="premium" />
    </>
  );
}
