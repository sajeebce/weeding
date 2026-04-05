export interface LocalGuest {
  id: string;
  projectId: string;
  firstName: string;
  lastName: string | null;
  title: string | null;
  side: "BRIDE" | "GROOM";
  relation: string;
  email: string | null;
  phone: string | null;
  dietary: string | null;
  rsvpStatus: "PENDING" | "ATTENDING" | "NOT_ATTENDING";
  tableNumber: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalProject {
  id: string;
  title: string;
  role: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  brideName?: string | null;
  groomName?: string | null;
  createdAt: string;
  updatedAt: string;
}

const INDEX_KEY = "planner_projects_index";

function projectKey(id: string) {
  return `planner_project_${id}`;
}

export function createLocalProject(role: string): LocalProject {
  const id = `local-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const project: LocalProject = {
    id,
    title: "Untitled",
    role,
    eventType: "WEDDING",
    eventDate: null,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };
  localStorage.setItem(projectKey(id), JSON.stringify(project));
  const index = getAllLocalProjectIds();
  localStorage.setItem(INDEX_KEY, JSON.stringify([...index, id]));
  return project;
}

export function getLocalProject(id: string): LocalProject | null {
  const raw = localStorage.getItem(projectKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalProject;
  } catch {
    return null;
  }
}

export function updateLocalProject(
  id: string,
  data: Partial<Omit<LocalProject, "id" | "createdAt">>
): LocalProject | null {
  const project = getLocalProject(id);
  if (!project) return null;
  const updated: LocalProject = {
    ...project,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(projectKey(id), JSON.stringify(updated));
  return updated;
}

export function deleteLocalProject(id: string): void {
  localStorage.removeItem(projectKey(id));
  const index = getAllLocalProjectIds().filter((i) => i !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export function getAllLocalProjectIds(): string[] {
  const raw = localStorage.getItem(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function getAllLocalProjects(): LocalProject[] {
  return getAllLocalProjectIds()
    .map(getLocalProject)
    .filter((p): p is LocalProject => p !== null)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

// ── Guest helpers (localStorage for anonymous projects) ──────────────────────

function guestsKey(projectId: string) {
  return `planner_guests_${projectId}`;
}

export function getLocalGuests(projectId: string): LocalGuest[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(guestsKey(projectId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LocalGuest[];
  } catch {
    return [];
  }
}

export function addLocalGuest(
  projectId: string,
  data: Omit<LocalGuest, "id" | "projectId" | "createdAt" | "updatedAt">
): LocalGuest {
  const now = new Date().toISOString();
  const guest: LocalGuest = {
    id: `lg-${crypto.randomUUID()}`,
    projectId,
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  const guests = getLocalGuests(projectId);
  localStorage.setItem(guestsKey(projectId), JSON.stringify([...guests, guest]));
  return guest;
}

export function updateLocalGuest(
  projectId: string,
  guestId: string,
  data: Partial<Omit<LocalGuest, "id" | "projectId" | "createdAt">>
): LocalGuest | null {
  const guests = getLocalGuests(projectId);
  const idx = guests.findIndex((g) => g.id === guestId);
  if (idx === -1) return null;
  const updated = { ...guests[idx], ...data, updatedAt: new Date().toISOString() };
  guests[idx] = updated;
  localStorage.setItem(guestsKey(projectId), JSON.stringify(guests));
  return updated;
}

export function deleteLocalGuest(projectId: string, guestId: string): void {
  const guests = getLocalGuests(projectId).filter((g) => g.id !== guestId);
  localStorage.setItem(guestsKey(projectId), JSON.stringify(guests));
}

// ── Budget helpers ────────────────────────────────────────────────────────────

export interface LocalBudgetItem {
  id: string;
  categoryId: string;
  projectId: string;
  description: string;
  planned: number;
  actual: number;
  paid: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  notes: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocalBudgetCategory {
  id: string;
  projectId: string;
  name: string;
  planned: number;
  color: string;
  order: number;
  items: LocalBudgetItem[];
  createdAt: string;
  updatedAt: string;
}

function budgetKey(projectId: string) { return `planner_budget_${projectId}`; }

export function getLocalBudget(projectId: string): LocalBudgetCategory[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(budgetKey(projectId)) || "[]"); } catch { return []; }
}

function saveBudget(projectId: string, cats: LocalBudgetCategory[]) {
  localStorage.setItem(budgetKey(projectId), JSON.stringify(cats));
}

export function addLocalBudgetCategory(projectId: string, data: Pick<LocalBudgetCategory, "name" | "planned" | "color">): LocalBudgetCategory {
  const cats = getLocalBudget(projectId);
  const now = new Date().toISOString();
  const cat: LocalBudgetCategory = { id: `lbc-${crypto.randomUUID()}`, projectId, items: [], order: cats.length, createdAt: now, updatedAt: now, ...data };
  saveBudget(projectId, [...cats, cat]);
  return cat;
}

export function updateLocalBudgetCategory(projectId: string, catId: string, data: Partial<Pick<LocalBudgetCategory, "name" | "planned" | "color">>): void {
  const cats = getLocalBudget(projectId).map(c => c.id === catId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c);
  saveBudget(projectId, cats);
}

export function deleteLocalBudgetCategory(projectId: string, catId: string): void {
  saveBudget(projectId, getLocalBudget(projectId).filter(c => c.id !== catId));
}

export function addLocalBudgetItem(projectId: string, catId: string, data: Omit<LocalBudgetItem, "id" | "categoryId" | "projectId" | "order" | "createdAt" | "updatedAt">): LocalBudgetItem {
  const cats = getLocalBudget(projectId);
  const now = new Date().toISOString();
  const cat = cats.find(c => c.id === catId);
  if (!cat) throw new Error("Category not found");
  const item: LocalBudgetItem = { id: `lbi-${crypto.randomUUID()}`, categoryId: catId, projectId, order: cat.items.length, createdAt: now, updatedAt: now, ...data };
  cat.items = [...cat.items, item];
  saveBudget(projectId, cats);
  return item;
}

export function updateLocalBudgetItem(projectId: string, catId: string, itemId: string, data: Partial<Omit<LocalBudgetItem, "id" | "categoryId" | "projectId" | "createdAt">>): void {
  const cats = getLocalBudget(projectId).map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...data, updatedAt: new Date().toISOString() } : i) } : c);
  saveBudget(projectId, cats);
}

export function deleteLocalBudgetItem(projectId: string, catId: string, itemId: string): void {
  const cats = getLocalBudget(projectId).map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c);
  saveBudget(projectId, cats);
}

// ── Checklist helpers ─────────────────────────────────────────────────────────

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface LocalChecklistTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  subtasks: SubTask[];
  dueMonths: number | null;
  category: string | null;
  completed: boolean;
  completedAt: string | null;
  isDefault: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

function checklistKey(projectId: string) { return `planner_checklist_${projectId}`; }

export function getLocalChecklist(projectId: string): LocalChecklistTask[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(checklistKey(projectId)) || "[]"); } catch { return []; }
}

function saveChecklist(projectId: string, tasks: LocalChecklistTask[]) {
  localStorage.setItem(checklistKey(projectId), JSON.stringify(tasks));
}

export function addLocalChecklistTask(projectId: string, data: Omit<LocalChecklistTask, "id" | "projectId" | "order" | "createdAt" | "updatedAt">): LocalChecklistTask {
  const tasks = getLocalChecklist(projectId);
  const now = new Date().toISOString();
  const task: LocalChecklistTask = { id: `lct-${crypto.randomUUID()}`, projectId, order: tasks.length, createdAt: now, updatedAt: now, ...data };
  saveChecklist(projectId, [...tasks, task]);
  return task;
}

export function updateLocalChecklistTask(projectId: string, taskId: string, data: Partial<Omit<LocalChecklistTask, "id" | "projectId" | "createdAt">>): void {
  saveChecklist(projectId, getLocalChecklist(projectId).map(t => t.id === taskId ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
}

export function deleteLocalChecklistTask(projectId: string, taskId: string): void {
  saveChecklist(projectId, getLocalChecklist(projectId).filter(t => t.id !== taskId));
}

export function seedLocalChecklist(projectId: string, tasks: Omit<LocalChecklistTask, "id" | "projectId" | "order" | "createdAt" | "updatedAt">[], reset = false): void {
  const existing = getLocalChecklist(projectId);
  if (existing.length > 0 && !reset) return;
  const now = new Date().toISOString();
  const seeded = tasks.map((t, i) => ({ id: `lct-${crypto.randomUUID()}`, projectId, order: i, createdAt: now, updatedAt: now, ...t }));
  saveChecklist(projectId, seeded);
}

// ── Itinerary helpers ─────────────────────────────────────────────────────────

export interface LocalItineraryEvent {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  location: string | null;
  category: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

function itineraryKey(projectId: string) { return `planner_itinerary_${projectId}`; }

export function getLocalItinerary(projectId: string): LocalItineraryEvent[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(itineraryKey(projectId)) || "[]"); } catch { return []; }
}

function saveItinerary(projectId: string, events: LocalItineraryEvent[]) {
  localStorage.setItem(itineraryKey(projectId), JSON.stringify(events));
}

export function addLocalItineraryEvent(projectId: string, data: Omit<LocalItineraryEvent, "id" | "projectId" | "order" | "createdAt" | "updatedAt">): LocalItineraryEvent {
  const events = getLocalItinerary(projectId);
  const now = new Date().toISOString();
  const event: LocalItineraryEvent = { id: `lie-${crypto.randomUUID()}`, projectId, order: events.length, createdAt: now, updatedAt: now, ...data };
  saveItinerary(projectId, [...events, event].sort((a, b) => a.startTime.localeCompare(b.startTime)));
  return event;
}

export function updateLocalItineraryEvent(projectId: string, eventId: string, data: Partial<Omit<LocalItineraryEvent, "id" | "projectId" | "createdAt">>): void {
  saveItinerary(projectId, getLocalItinerary(projectId).map(e => e.id === eventId ? { ...e, ...data, updatedAt: new Date().toISOString() } : e).sort((a, b) => a.startTime.localeCompare(b.startTime)));
}

export function deleteLocalItineraryEvent(projectId: string, eventId: string): void {
  saveItinerary(projectId, getLocalItinerary(projectId).filter(e => e.id !== eventId));
}

// ── Notes helpers ─────────────────────────────────────────────────────────────

export interface LocalNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

function notesKey(projectId: string) { return `planner_notes_${projectId}`; }

export function getLocalNotes(projectId: string): LocalNote[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(notesKey(projectId)) || "[]"); } catch { return []; }
}

function saveNotes(projectId: string, notes: LocalNote[]) {
  localStorage.setItem(notesKey(projectId), JSON.stringify(notes));
}

export function addLocalNote(projectId: string, data: Pick<LocalNote, "title" | "content">): LocalNote {
  const notes = getLocalNotes(projectId);
  const now = new Date().toISOString();
  const note: LocalNote = { id: `ln-${crypto.randomUUID()}`, projectId, order: notes.length, createdAt: now, updatedAt: now, ...data };
  saveNotes(projectId, [...notes, note]);
  return note;
}

export function updateLocalNote(projectId: string, noteId: string, data: Partial<Pick<LocalNote, "title" | "content">>): void {
  saveNotes(projectId, getLocalNotes(projectId).map(n => n.id === noteId ? { ...n, ...data, updatedAt: new Date().toISOString() } : n));
}

export function deleteLocalNote(projectId: string, noteId: string): void {
  saveNotes(projectId, getLocalNotes(projectId).filter(n => n.id !== noteId));
}

// ── Seating Chart helpers ─────────────────────────────────────────────────────

export interface LocalSeatingTable {
  id: string;
  layoutId: string;
  projectId: string;
  name: string;
  type: "ROUND" | "RECTANGULAR" | "SQUARE" | "OBLONG" | "HALF_ROUND" | "CHAIRS_ROW" | "BUFFET";
  x: number;
  y: number;
  seats: number;
  rotation: number;
  color: string;
  guestIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LocalSeatingLayout {
  id: string;
  projectId: string;
  name: string;
  type: "CEREMONY" | "RECEPTION";
  width: number;
  height: number;
  bgColor: string;
  tables: LocalSeatingTable[];
  createdAt: string;
  updatedAt: string;
}

function seatingKey(projectId: string) { return `planner_seating_${projectId}`; }

export function getLocalSeatingLayouts(projectId: string): LocalSeatingLayout[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(seatingKey(projectId)) || "[]"); } catch { return []; }
}

function saveSeating(projectId: string, layouts: LocalSeatingLayout[]) {
  localStorage.setItem(seatingKey(projectId), JSON.stringify(layouts));
}

export function addLocalSeatingLayout(projectId: string, data: Pick<LocalSeatingLayout, "name" | "type">): LocalSeatingLayout {
  const layouts = getLocalSeatingLayouts(projectId);
  const now = new Date().toISOString();
  const layout: LocalSeatingLayout = {
    id: `sl-${crypto.randomUUID()}`, projectId,
    name: data.name, type: data.type,
    width: 1200, height: 800, bgColor: "#f5f5f0",
    tables: [], createdAt: now, updatedAt: now,
  };
  saveSeating(projectId, [...layouts, layout]);
  return layout;
}

export function updateLocalSeatingLayout(projectId: string, layoutId: string, data: Partial<Pick<LocalSeatingLayout, "name" | "bgColor" | "width" | "height">>): void {
  saveSeating(projectId, getLocalSeatingLayouts(projectId).map(l =>
    l.id === layoutId ? { ...l, ...data, updatedAt: new Date().toISOString() } : l
  ));
}

export function deleteLocalSeatingLayout(projectId: string, layoutId: string): void {
  saveSeating(projectId, getLocalSeatingLayouts(projectId).filter(l => l.id !== layoutId));
}

export function addLocalSeatingTable(projectId: string, layoutId: string, data: Omit<LocalSeatingTable, "id" | "layoutId" | "projectId" | "createdAt" | "updatedAt">): LocalSeatingTable {
  const layouts = getLocalSeatingLayouts(projectId);
  const now = new Date().toISOString();
  const table: LocalSeatingTable = { id: `st-${crypto.randomUUID()}`, layoutId, projectId, createdAt: now, updatedAt: now, ...data };
  saveSeating(projectId, layouts.map(l =>
    l.id === layoutId ? { ...l, tables: [...l.tables, table], updatedAt: now } : l
  ));
  return table;
}

export function updateLocalSeatingTable(projectId: string, layoutId: string, tableId: string, data: Partial<Omit<LocalSeatingTable, "id" | "layoutId" | "projectId" | "createdAt">>): void {
  const now = new Date().toISOString();
  saveSeating(projectId, getLocalSeatingLayouts(projectId).map(l =>
    l.id === layoutId
      ? { ...l, tables: l.tables.map(t => t.id === tableId ? { ...t, ...data, updatedAt: now } : t), updatedAt: now }
      : l
  ));
}

export function deleteLocalSeatingTable(projectId: string, layoutId: string, tableId: string): void {
  const now = new Date().toISOString();
  saveSeating(projectId, getLocalSeatingLayouts(projectId).map(l =>
    l.id === layoutId
      ? { ...l, tables: l.tables.filter(t => t.id !== tableId), updatedAt: now }
      : l
  ));
}

// ── Venue helpers (Ceremony & Reception) ─────────────────────────────────────

export interface LocalVenueDetails {
  projectId: string;
  type: "CEREMONY" | "RECEPTION";
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
  updatedAt: string;
}

function venueKey(projectId: string, type: "CEREMONY" | "RECEPTION") {
  return `planner_venue_${projectId}_${type.toLowerCase()}`;
}

function emptyVenue(projectId: string, type: "CEREMONY" | "RECEPTION"): LocalVenueDetails {
  return {
    projectId, type,
    venueName: null, address: null, city: null, country: null,
    date: null, time: null, capacity: null,
    description: null, notes: null, layoutNotes: null,
    updatedAt: new Date().toISOString(),
  };
}

export function getLocalVenue(projectId: string, type: "CEREMONY" | "RECEPTION"): LocalVenueDetails {
  if (typeof window === "undefined") return emptyVenue(projectId, type);
  try {
    const raw = localStorage.getItem(venueKey(projectId, type));
    if (!raw) return emptyVenue(projectId, type);
    return JSON.parse(raw) as LocalVenueDetails;
  } catch {
    return emptyVenue(projectId, type);
  }
}

export function updateLocalVenue(
  projectId: string,
  type: "CEREMONY" | "RECEPTION",
  data: Partial<Omit<LocalVenueDetails, "projectId" | "type">>
): LocalVenueDetails {
  const current = getLocalVenue(projectId, type);
  const updated: LocalVenueDetails = { ...current, ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(venueKey(projectId, type), JSON.stringify(updated));
  return updated;
}

// ── Wedding Website helpers ───────────────────────────────────────────────────

export type WebsiteBlockType =
  | "cover" | "hero" | "our-story" | "venue" | "schedule"
  | "gallery" | "rsvp" | "registry" | "people" | "countdown" | "guestbook";

export interface WeddingBlock {
  id: string;
  type: WebsiteBlockType;
  order: number;
  visible: boolean;
  settings: Record<string, unknown>;
}

export interface LocalWeddingWebsite {
  projectId: string;
  slug: string;
  published: boolean;
  theme: "modern" | "floral" | "rustic" | "minimal";
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  blocks: WeddingBlock[];
  password: string | null;
  updatedAt: string;
}

function websiteKey(pid: string) { return `planner_website_${pid}`; }

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

const BLOCK_DEFAULTS: Record<WebsiteBlockType, Record<string, unknown>> = {
  "cover":      { quote: "We're Getting Married!", brideName: "", groomName: "", date: "", backgroundImage: null, navLinks: ["Wedding", "Our Story", "Travel & Stay", "RSVP"] },
  "hero":       { title: "Our Wedding", subtitle: "Join us to celebrate our special day", date: "", location: "", backgroundImage: null },
  "our-story":  { title: "Our Story", content: "We met, we fell in love, and now we're getting married. We can't wait to celebrate with you!" },
  "venue":      { title: "When & Where", ceremonyName: "", ceremonyAddress: "", ceremonyTime: "", receptionName: "", receptionAddress: "", receptionTime: "" },
  "schedule":   { title: "Schedule", items: [{ time: "4:00 PM", title: "Ceremony" }, { time: "5:00 PM", title: "Cocktail Hour" }, { time: "7:00 PM", title: "Reception & Dinner" }] },
  "gallery":    { title: "Our Photos", images: [] as string[] },
  "rsvp":       { title: "RSVP", deadline: "", message: "Please let us know if you can make it!" },
  "registry":   { title: "Wedding Registry", items: [{ name: "Amazon", url: "" }, { name: "Williams-Sonoma", url: "" }] as { name: string; url: string }[] },
  "people":     { title: "Wedding Party", people: [{ name: "", role: "Maid of Honor" }, { name: "", role: "Best Man" }] as { name: string; role: string }[] },
  "countdown":  { title: "Counting Down to Our Big Day", targetDate: "" },
  "guestbook":  { title: "Guestbook", message: "Leave us a note!" },
};

export function createWebsiteBlock(type: WebsiteBlockType, order: number): WeddingBlock {
  return { id: `wb-${uid()}`, type, order, visible: true, settings: { ...BLOCK_DEFAULTS[type] } };
}

function defaultWebsite(projectId: string): LocalWeddingWebsite {
  const raw = projectId.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const slug = `wedding-${raw.slice(-8) || "event"}`;
  return {
    projectId, slug,
    published: false,
    theme: "modern",
    primaryColor: "#7c3aed",
    accentColor: "#ede9fe",
    fontFamily: "Inter",
    blocks: [
      createWebsiteBlock("hero",      0),
      createWebsiteBlock("our-story", 1),
      createWebsiteBlock("venue",     2),
      createWebsiteBlock("schedule",  3),
      createWebsiteBlock("rsvp",      4),
    ],
    password: null,
    updatedAt: new Date().toISOString(),
  };
}

export function getLocalWebsite(projectId: string): LocalWeddingWebsite {
  if (typeof window === "undefined") return defaultWebsite(projectId);
  try {
    const raw = localStorage.getItem(websiteKey(projectId));
    if (!raw) return defaultWebsite(projectId);
    return JSON.parse(raw) as LocalWeddingWebsite;
  } catch { return defaultWebsite(projectId); }
}

export function saveLocalWebsite(
  projectId: string,
  data: Partial<Omit<LocalWeddingWebsite, "projectId">>
): LocalWeddingWebsite {
  const current = getLocalWebsite(projectId);
  const updated: LocalWeddingWebsite = { ...current, ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(websiteKey(projectId), JSON.stringify(updated));
  return updated;
}

// ── Vendor helpers ────────────────────────────────────────────────────────────

export type VendorCategory =
  | "VENUE" | "PHOTOGRAPHY" | "VIDEOGRAPHY" | "CATERING" | "MUSIC_DJ"
  | "FLOWERS" | "DRESS_ATTIRE" | "RINGS" | "DECORATIONS" | "TRANSPORTATION"
  | "HAIR_MAKEUP" | "WEDDING_PLANNER" | "OTHER";

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  VENUE:           "Venue",
  PHOTOGRAPHY:     "Photography",
  VIDEOGRAPHY:     "Videography",
  CATERING:        "Catering",
  MUSIC_DJ:        "Music / DJ",
  FLOWERS:         "Flowers",
  DRESS_ATTIRE:    "Dress & Attire",
  RINGS:           "Rings",
  DECORATIONS:     "Decorations",
  TRANSPORTATION:  "Transportation",
  HAIR_MAKEUP:     "Hair & Makeup",
  WEDDING_PLANNER: "Wedding Planner",
  OTHER:           "Other",
};

export interface LocalVendor {
  id: string;
  projectId: string;
  name: string;
  category: VendorCategory;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function vendorsKey(projectId: string) { return `planner_vendors_${projectId}`; }

function vendorUid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return `v-${crypto.randomUUID().slice(0, 8)}`;
  return `v-${Math.random().toString(36).slice(2, 10)}`;
}

export function getLocalVendors(projectId: string): LocalVendor[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(vendorsKey(projectId));
    if (!raw) return [];
    return JSON.parse(raw) as LocalVendor[];
  } catch { return []; }
}

export function addLocalVendor(
  projectId: string,
  data: Omit<LocalVendor, "id" | "projectId" | "createdAt" | "updatedAt">
): LocalVendor {
  const vendors = getLocalVendors(projectId);
  const now = new Date().toISOString();
  const vendor: LocalVendor = { id: vendorUid(), projectId, ...data, createdAt: now, updatedAt: now };
  localStorage.setItem(vendorsKey(projectId), JSON.stringify([...vendors, vendor]));
  return vendor;
}

export function updateLocalVendor(
  projectId: string,
  vendorId: string,
  data: Partial<Omit<LocalVendor, "id" | "projectId" | "createdAt">>
): LocalVendor | null {
  const vendors = getLocalVendors(projectId);
  const idx = vendors.findIndex(v => v.id === vendorId);
  if (idx === -1) return null;
  const updated: LocalVendor = { ...vendors[idx], ...data, updatedAt: new Date().toISOString() };
  vendors[idx] = updated;
  localStorage.setItem(vendorsKey(projectId), JSON.stringify(vendors));
  return updated;
}

export function deleteLocalVendor(projectId: string, vendorId: string): void {
  const vendors = getLocalVendors(projectId).filter(v => v.id !== vendorId);
  localStorage.setItem(vendorsKey(projectId), JSON.stringify(vendors));
}

