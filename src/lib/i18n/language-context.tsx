"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Language definitions ───────────────────────────────────────────────────────
export const LANGUAGES = [
  { code: "en", label: "English",  nativeLabel: "English",  flagCode: "us", dir: "ltr" },
  { code: "sv", label: "Svenska",  nativeLabel: "Svenska",  flagCode: "se", dir: "ltr" },
  { code: "ar", label: "Arabic",   nativeLabel: "العربية",  flagCode: "sa", dir: "rtl" },
  { code: "bn", label: "Bengali",  nativeLabel: "বাংলা",    flagCode: "bd", dir: "ltr" }, // TEST — remove later
] as const;

/** Returns a flagcdn.com image URL for the given country code */
export function flagUrl(countryCode: string, width: 20 | 40 = 20): string {
  return `https://flagcdn.com/w${width}/${countryCode}.png`;
}

export type LangCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "llcpad_lang";

// ── Translations ───────────────────────────────────────────────────────────────
const translations: Record<LangCode, Record<string, string>> = {
  en: {
    // Footer
    "footer.copyright":             "© {year} {name}. All rights reserved.",
    "footer.disclaimer":            "{name} is not a law firm and does not provide legal advice.",
    "lang.choose":                  "Choose language",

    // Main navigation
    "nav.home":                     "Home",
    "nav.services":                 "Services",
    "nav.pricing":                  "Pricing",
    "nav.about":                    "About",
    "nav.blog":                     "Blog",
    "nav.contact":                  "Contact",

    // Common actions
    "common.getStarted":            "Get Started",
    "common.learnMore":             "Learn More",
    "common.signIn":                "Sign In",
    "common.signOut":               "Sign Out",
    "common.delete":                "Delete",
    "common.notSaved":              "Not saved",
    "common.settings":              "Settings",
    "common.profile":               "Profile",
    "common.dashboard":             "Dashboard",

    // Dashboard sidebar
    "dash.overview":                "Overview",
    "dash.orders":                  "Orders",
    "dash.invoices":                "Invoices",
    "dash.documents":               "Documents",
    "dash.support":                 "Support",
    "dash.weddingProjects":         "Wedding Projects",

    // Planner sidebar navigation
    "planner.nav.overview":         "Overview",
    "planner.nav.guestList":        "Guest List",
    "planner.nav.venuesVendors":    "VENUES & VENDORS",
    "planner.nav.ceremony":         "Ceremony",
    "planner.nav.reception":        "Reception",
    "planner.nav.allVendors":       "All Vendors",
    "planner.nav.planningTools":    "PLANNING TOOLS",
    "planner.nav.website":          "Website",
    "planner.nav.checklist":        "Checklist",
    "planner.nav.budget":           "Budget",
    "planner.nav.itinerary":        "Event Itinerary",
    "planner.nav.seating":          "Seating Chart & Supplies",
    "planner.nav.notes":            "Notes",
    "planner.nav.postWedding":      "Post-Wedding",
    "planner.nav.settings":         "Settings",

    // Planner header
    "planner.header.search":        "Find vendor or venue...",
    "planner.header.myProjects":    "My Projects",
    "planner.header.profileSettings": "Profile Settings",

    // Anonymous banner
    "planner.banner.notSaved":      "Your project is not saved.",
    "planner.banner.dataLost":      "Data will be lost if you clear your browser.",
    "planner.banner.loginToSave":   "Login to Save",

    // My Projects page
    "projects.title":               "My Projects",
    "projects.subtitle":            "Manage your wedding and event planning projects",
    "projects.newProject":          "New Project",
    "projects.noProjects":          "No projects yet",
    "projects.noProjectsDesc":      "Create your first wedding planning project to get started.",
    "projects.createNew":           "Create new wedding project",
    "projects.deleteConfirm":       "Are you sure you want to delete this project?",

    // Create project page
    "create.whoAreYou":             "Who are you?",
    "create.bride":                 "Bride",
    "create.groom":                 "Groom",
    "create.planner":               "Planner",
    "create.other":                 "Other",
    "create.createProject":         "Create new event project",
    "create.creating":              "Creating your project...",
    "create.termsAgree":            "By creating a new project you agree to the",
    "create.privacyTerms":          "Privacy & Legal Terms",
    "create.goToProjects":          "← Go to My projects list",

    // Overview page
    "overview.totalGuests":         "Total Guests",
    "overview.budget":              "Budget",
    "overview.tasksDone":           "Tasks Done",
    "overview.daysLeft":            "Days Left",
    "overview.quickActions":        "Quick Actions",
    "overview.addGuests":           "Add Guests",
    "overview.setBudget":           "Set Budget",
    "overview.viewChecklist":       "View Checklist",

    // Guest list page
    "guests.title":                 "Guest List",
    "guests.heading":               "Wedding Attendees",
    "guests.headingDesc":           "Read guideline {guidelineLink}. Also, you can {importLink} from CSV or XLS file.",
    "guests.guidelineLink":         "how to use the guest list",
    "guests.importLink":            "import a guest list",
    "guests.addGuest":              "Add guest",
    "guests.brideGuests":           "Bride's guests",
    "guests.groomGuests":           "Groom's guests",
    "guests.firstName":             "First name",
    "guests.lastName":              "Last name",
    "guests.noGuests":              "No guests added yet.",
    "guests.noGuestsAlpha":         "No guests yet. Add your first guest below.",
    "guests.import":                "Import guest list",
    "guests.importing":             "Importing...",
    "guests.exportCsv":             "Export CSV",
    "guests.exportXls":             "Download XLS",
    "guests.exportPdf":             "Download PDF",
    "guests.viewTwoSides":          "Two sides",
    "guests.viewAlphabetic":        "Alphabetic",
    "guests.viewFullTable":         "Full table",
    "guests.colName":               "Name",
    "guests.colSide":               "Side",
    "guests.colRelation":           "Relation",
    "guests.colRsvp":               "RSVP",
    "guests.bride":                 "Bride",
    "guests.groom":                 "Groom",
    "guests.total":                 "Total",
    "guests.attending":             "Attending",
    "guests.notAttending":          "Not Attending",
    "guests.declined":              "Declined",
    "guests.pending":               "Pending",

    // Guest relation labels
    "rel.bride":                    "Bride",
    "rel.groom":                    "Groom",
    "rel.maidOfHonor":              "Maid-of-honor",
    "rel.matronOfHonor":            "Matron-of-honor",
    "rel.bridesmaid":               "Bridesmaid",
    "rel.bestMan":                  "Best man",
    "rel.groomsman":                "Groomsman",
    "rel.parent":                   "Parent",
    "rel.closeRelative":            "Close relative",
    "rel.relative":                 "Relative",
    "rel.closeFriend":              "Close friend",
    "rel.friend":                   "Friend",
    "rel.partner":                  "Partner",
    "rel.other":                    "Other",
    "rel.noFormalities":            "No formalities",

    // Title honorifics
    "title.rev":                    "Rev.",
    "title.dr":                     "Dr.",
    "title.sir":                    "Sir.",
    "title.mr":                     "Mr.",
    "title.mister":                 "Mister",
    "title.mrs":                    "Mrs.",
    "title.ms":                     "Ms.",
    "title.miss":                   "Miss.",
    "title.madam":                  "Madam",

    // Guest search/filter
    "guests.searchPlaceholder":     "Search guests...",
    "guests.filterAll":             "All",
    "guests.filterAttending":       "Attending",
    "guests.filterPending":         "Pending",
    "guests.filterDeclined":        "Declined",
    "guests.ratioBySides":          "Ratio by sides",
    "guests.weddingParty":          "Wedding party",
    "guests.totalGuests":           "Total guests",

    // Budget page
    "budget.heading":               "Wedding Budget",
    "budget.headingDesc":           "Track your wedding expenses by category.",
    "budget.addCategory":           "Add Category",
    "budget.addItem":               "+ Add item",
    "budget.totalBudget":           "Total Budget",
    "budget.totalSpent":            "Total Spent",
    "budget.totalPaid":             "Total Paid",
    "budget.remaining":             "Remaining",
    "budget.colDescription":        "Description",
    "budget.colPlanned":            "Planned",
    "budget.colActual":             "Actual",
    "budget.colPaid":               "Paid",
    "budget.colStatus":             "Status",
    "budget.statusUnpaid":          "Unpaid",
    "budget.statusPartial":         "Partial",
    "budget.statusPaid":            "Paid",
    "budget.noCategories":          "No budget categories yet. Add your first category.",
    "budget.categoryName":          "Category name",
    "budget.plannedAmount":         "Planned amount",
    "budget.cancel":                "Cancel",
    "budget.save":                  "Save",
    "budget.overBudget":            "Over budget",
    "budget.editCategory":          "Edit Category",
    "budget.newCategory":           "New Category",
    "budget.deleteConfirm":         "Delete this category and all its items?",
    "budget.itemDescription":       "Item description",
    "budget.itemNotes":             "Notes (optional)",

    // Checklist page
    "checklist.heading":            "Planning Checklist",
    "checklist.headingDesc":        "Your 12-month wedding planning timeline.",
    "checklist.addTask":            "Add custom task",
    "checklist.addTaskPlaceholder": "Task description...",
    "checklist.months":             "{n} months before",
    "checklist.month":              "{n} month before",
    "checklist.weddingDay":         "Wedding Day",
    "checklist.noTasks":            "No tasks yet.",
    "checklist.completed":          "{done} of {total} completed",
    "checklist.customTask":         "Custom",
    "checklist.seedTasks":          "Load default tasks",
    "checklist.seeding":            "Loading...",

    // Itinerary page
    "itinerary.heading":            "Event Itinerary",
    "itinerary.headingDesc":        "Plan your wedding day hour by hour.",
    "itinerary.addEvent":           "Add Event",
    "itinerary.noEvents":           "No events yet. Add your first event.",
    "itinerary.startTime":          "Start time",
    "itinerary.endTime":            "End time (optional)",
    "itinerary.title":              "Event title",
    "itinerary.location":           "Location (optional)",
    "itinerary.description":        "Description (optional)",
    "itinerary.save":               "Save",
    "itinerary.cancel":             "Cancel",
    "itinerary.edit":               "Edit",
    "itinerary.delete":             "Delete",

    // Notes page
    "notes.heading":                "Notes",
    "notes.headingDesc":            "Write vows, speeches, ideas, and more.",
    "notes.addNote":                "New Note",
    "notes.untitled":               "Untitled",
    "notes.noNotes":                "No notes yet.",
    "notes.placeholder":            "Start writing...",
    "notes.titlePlaceholder":       "Note title",
    "notes.deleteConfirm":          "Delete this note?",

    // Coming soon
    "comingSoon":                   "This feature is coming in a future phase.",
  },

  sv: {
    // Footer
    "footer.copyright":             "© {year} {name}. Alla rättigheter förbehållna.",
    "footer.disclaimer":            "{name} är inte en advokatbyrå och ger inga juridiska råd.",
    "lang.choose":                  "Välj språk",

    // Main navigation
    "nav.home":                     "Hem",
    "nav.services":                 "Tjänster",
    "nav.pricing":                  "Priser",
    "nav.about":                    "Om oss",
    "nav.blog":                     "Blogg",
    "nav.contact":                  "Kontakt",

    // Common actions
    "common.getStarted":            "Kom igång",
    "common.learnMore":             "Läs mer",
    "common.signIn":                "Logga in",
    "common.signOut":               "Logga ut",
    "common.delete":                "Radera",
    "common.notSaved":              "Inte sparad",
    "common.settings":              "Inställningar",
    "common.profile":               "Profil",
    "common.dashboard":             "Kontrollpanel",

    // Dashboard sidebar
    "dash.overview":                "Översikt",
    "dash.orders":                  "Beställningar",
    "dash.invoices":                "Fakturor",
    "dash.documents":               "Dokument",
    "dash.support":                 "Support",
    "dash.weddingProjects":         "Bröllopprojekt",

    // Planner sidebar navigation
    "planner.nav.overview":         "Översikt",
    "planner.nav.guestList":        "Gästlista",
    "planner.nav.venuesVendors":    "LOKALER & LEVERANTÖRER",
    "planner.nav.ceremony":         "Ceremoni",
    "planner.nav.reception":        "Mottagning",
    "planner.nav.allVendors":       "Alla leverantörer",
    "planner.nav.planningTools":    "PLANERINGSVERKTYG",
    "planner.nav.website":          "Webbplats",
    "planner.nav.checklist":        "Checklista",
    "planner.nav.budget":           "Budget",
    "planner.nav.itinerary":        "Evenemangsschema",
    "planner.nav.seating":          "Bordplacering & tillbehör",
    "planner.nav.notes":            "Anteckningar",
    "planner.nav.postWedding":      "Efter bröllopet",
    "planner.nav.settings":         "Inställningar",

    // Planner header
    "planner.header.search":        "Hitta leverantör eller lokal...",
    "planner.header.myProjects":    "Mina projekt",
    "planner.header.profileSettings": "Profilinställningar",

    // Anonymous banner
    "planner.banner.notSaved":      "Ditt projekt är inte sparat.",
    "planner.banner.dataLost":      "Data går förlorad om du rensar din webbläsare.",
    "planner.banner.loginToSave":   "Logga in för att spara",

    // My Projects page
    "projects.title":               "Mina projekt",
    "projects.subtitle":            "Hantera dina bröllops- och eventplaneringsprojekt",
    "projects.newProject":          "Nytt projekt",
    "projects.noProjects":          "Inga projekt än",
    "projects.noProjectsDesc":      "Skapa ditt första bröllopsplaneringsprojekt för att komma igång.",
    "projects.createNew":           "Skapa nytt bröllopprojekt",
    "projects.deleteConfirm":       "Är du säker på att du vill ta bort det här projektet?",

    // Create project page
    "create.whoAreYou":             "Vem är du?",
    "create.bride":                 "Brud",
    "create.groom":                 "Brudgum",
    "create.planner":               "Planerare",
    "create.other":                 "Annan",
    "create.createProject":         "Skapa nytt eventprojekt",
    "create.creating":              "Skapar ditt projekt...",
    "create.termsAgree":            "Genom att skapa ett nytt projekt godkänner du",
    "create.privacyTerms":          "Integritets- och juridiska villkor",
    "create.goToProjects":          "← Gå till min projektlista",

    // Overview page
    "overview.totalGuests":         "Totalt antal gäster",
    "overview.budget":              "Budget",
    "overview.tasksDone":           "Avklarade uppgifter",
    "overview.daysLeft":            "Dagar kvar",
    "overview.quickActions":        "Snabbåtgärder",
    "overview.addGuests":           "Lägg till gäster",
    "overview.setBudget":           "Ange budget",
    "overview.viewChecklist":       "Visa checklista",

    // Guest list page
    "guests.title":                 "Gästlista",
    "guests.heading":               "Bröllopsgäster",
    "guests.headingDesc":           "Läs riktlinjerna {guidelineLink}. Du kan också {importLink} från CSV- eller XLS-fil.",
    "guests.guidelineLink":         "hur du använder gästlistan",
    "guests.importLink":            "importera en gästlista",
    "guests.addGuest":              "Lägg till gäst",
    "guests.brideGuests":           "Brudens gäster",
    "guests.groomGuests":           "Brudgummens gäster",
    "guests.firstName":             "Förnamn",
    "guests.lastName":              "Efternamn",
    "guests.noGuests":              "Inga gäster tillagda än.",
    "guests.noGuestsAlpha":         "Inga gäster än. Lägg till din första gäst nedan.",
    "guests.import":                "Importera gästlista",
    "guests.importing":             "Importerar...",
    "guests.exportCsv":             "Exportera CSV",
    "guests.exportXls":             "Ladda ned XLS",
    "guests.exportPdf":             "Ladda ned PDF",
    "guests.viewTwoSides":          "Två sidor",
    "guests.viewAlphabetic":        "Alfabetisk",
    "guests.viewFullTable":         "Fullständig tabell",
    "guests.colName":               "Namn",
    "guests.colSide":               "Sida",
    "guests.colRelation":           "Relation",
    "guests.colRsvp":               "OSA",
    "guests.bride":                 "Brud",
    "guests.groom":                 "Brudgum",
    "guests.total":                 "Totalt",
    "guests.attending":             "Deltar",
    "guests.notAttending":          "Deltar inte",
    "guests.declined":              "Avböjt",
    "guests.pending":               "Väntar",

    // Guest relation labels
    "rel.bride":                    "Brud",
    "rel.groom":                    "Brudgum",
    "rel.maidOfHonor":              "Tärnmor",
    "rel.matronOfHonor":            "Matron of honor",
    "rel.bridesmaid":               "Brudtärna",
    "rel.bestMan":                  "Besteman",
    "rel.groomsman":                "Groomsman",
    "rel.parent":                   "Förälder",
    "rel.closeRelative":            "Nära släkting",
    "rel.relative":                 "Släkting",
    "rel.closeFriend":              "Nära vän",
    "rel.friend":                   "Vän",
    "rel.partner":                  "Partner",
    "rel.other":                    "Annan",
    "rel.noFormalities":            "Inga formaliteter",

    // Title honorifics
    "title.rev":                    "Pastor",
    "title.dr":                     "Dr.",
    "title.sir":                    "Herr",
    "title.mr":                     "Hr.",
    "title.mister":                 "Herr",
    "title.mrs":                    "Fru",
    "title.ms":                     "Fru",
    "title.miss":                   "Fröken",
    "title.madam":                  "Madame",

    // Guest search/filter
    "guests.searchPlaceholder":     "Sök gäster...",
    "guests.filterAll":             "Alla",
    "guests.filterAttending":       "Deltar",
    "guests.filterPending":         "Väntar",
    "guests.filterDeclined":        "Avböjt",
    "guests.ratioBySides":          "Förhållande per sida",
    "guests.weddingParty":          "Bröllopssällskap",
    "guests.totalGuests":           "Totalt antal gäster",

    // Budget
    "budget.heading":               "Bröllopbudget",
    "budget.headingDesc":           "Spåra dina bröllopskostnader per kategori.",
    "budget.addCategory":           "Lägg till kategori",
    "budget.addItem":               "+ Lägg till post",
    "budget.totalBudget":           "Total budget",
    "budget.totalSpent":            "Totalt spenderat",
    "budget.totalPaid":             "Totalt betalt",
    "budget.remaining":             "Återstående",
    "budget.colDescription":        "Beskrivning",
    "budget.colPlanned":            "Planerat",
    "budget.colActual":             "Faktiskt",
    "budget.colPaid":               "Betalt",
    "budget.colStatus":             "Status",
    "budget.statusUnpaid":          "Obetalt",
    "budget.statusPartial":         "Delbetalt",
    "budget.statusPaid":            "Betalt",
    "budget.noCategories":          "Inga budgetkategorier än.",
    "budget.categoryName":          "Kategorinamn",
    "budget.plannedAmount":         "Planerat belopp",
    "budget.cancel":                "Avbryt",
    "budget.save":                  "Spara",
    "budget.overBudget":            "Över budget",
    "budget.editCategory":          "Redigera kategori",
    "budget.newCategory":           "Ny kategori",
    "budget.deleteConfirm":         "Ta bort denna kategori och alla dess poster?",
    "budget.itemDescription":       "Postbeskrivning",
    "budget.itemNotes":             "Anteckningar (valfritt)",

    // Checklist
    "checklist.heading":            "Planeringsplan",
    "checklist.headingDesc":        "Din 12-månaders bröllopstidslinje.",
    "checklist.addTask":            "Lägg till uppgift",
    "checklist.addTaskPlaceholder": "Uppgiftsbeskrivning...",
    "checklist.months":             "{n} månader innan",
    "checklist.month":              "{n} månad innan",
    "checklist.weddingDay":         "Bröllopsdagen",
    "checklist.noTasks":            "Inga uppgifter ännu.",
    "checklist.completed":          "{done} av {total} klara",
    "checklist.customTask":         "Anpassad",
    "checklist.seedTasks":          "Ladda standarduppgifter",
    "checklist.seeding":            "Laddar...",

    // Itinerary
    "itinerary.heading":            "Evenemangsschema",
    "itinerary.headingDesc":        "Planera din bröllopedag timme för timme.",
    "itinerary.addEvent":           "Lägg till evenemang",
    "itinerary.noEvents":           "Inga evenemang ännu.",
    "itinerary.startTime":          "Starttid",
    "itinerary.endTime":            "Sluttid (valfritt)",
    "itinerary.title":              "Evenemangsrubrik",
    "itinerary.location":           "Plats (valfritt)",
    "itinerary.description":        "Beskrivning (valfritt)",
    "itinerary.save":               "Spara",
    "itinerary.cancel":             "Avbryt",
    "itinerary.edit":               "Redigera",
    "itinerary.delete":             "Radera",

    // Notes
    "notes.heading":                "Anteckningar",
    "notes.headingDesc":            "Skriv löften, tal, idéer och mer.",
    "notes.addNote":                "Ny anteckning",
    "notes.untitled":               "Namnlös",
    "notes.noNotes":                "Inga anteckningar ännu.",
    "notes.placeholder":            "Börja skriva...",
    "notes.titlePlaceholder":       "Anteckningsrubrik",
    "notes.deleteConfirm":          "Ta bort den här anteckningen?",

    // Coming soon
    "comingSoon":                   "Den här funktionen kommer i en framtida fas.",
  },

  ar: {
    // Footer
    "footer.copyright":             "© {year} {name}. جميع الحقوق محفوظة.",
    "footer.disclaimer":            "{name} ليست شركة محاماة ولا تقدم استشارات قانونية.",
    "lang.choose":                  "اختر اللغة",

    // Main navigation
    "nav.home":                     "الرئيسية",
    "nav.services":                 "الخدمات",
    "nav.pricing":                  "الأسعار",
    "nav.about":                    "عن الشركة",
    "nav.blog":                     "المدونة",
    "nav.contact":                  "اتصل بنا",

    // Common actions
    "common.getStarted":            "ابدأ الآن",
    "common.learnMore":             "اعرف أكثر",
    "common.signIn":                "تسجيل الدخول",
    "common.signOut":               "تسجيل الخروج",
    "common.delete":                "حذف",
    "common.notSaved":              "غير محفوظ",
    "common.settings":              "الإعدادات",
    "common.profile":               "الملف الشخصي",
    "common.dashboard":             "لوحة التحكم",

    // Dashboard sidebar
    "dash.overview":                "نظرة عامة",
    "dash.orders":                  "الطلبات",
    "dash.invoices":                "الفواتير",
    "dash.documents":               "المستندات",
    "dash.support":                 "الدعم",
    "dash.weddingProjects":         "مشاريع الزفاف",

    // Planner sidebar navigation
    "planner.nav.overview":         "نظرة عامة",
    "planner.nav.guestList":        "قائمة الضيوف",
    "planner.nav.venuesVendors":    "الأماكن والموردون",
    "planner.nav.ceremony":         "مراسم الزفاف",
    "planner.nav.reception":        "حفل الاستقبال",
    "planner.nav.allVendors":       "جميع الموردين",
    "planner.nav.planningTools":    "أدوات التخطيط",
    "planner.nav.website":          "الموقع الإلكتروني",
    "planner.nav.checklist":        "قائمة المهام",
    "planner.nav.budget":           "الميزانية",
    "planner.nav.itinerary":        "جدول الفعاليات",
    "planner.nav.seating":          "مخطط الجلوس والمستلزمات",
    "planner.nav.notes":            "الملاحظات",
    "planner.nav.postWedding":      "ما بعد الزفاف",
    "planner.nav.settings":         "الإعدادات",

    // Planner header
    "planner.header.search":        "ابحث عن مورد أو مكان...",
    "planner.header.myProjects":    "مشاريعي",
    "planner.header.profileSettings": "إعدادات الملف الشخصي",

    // Anonymous banner
    "planner.banner.notSaved":      "مشروعك غير محفوظ.",
    "planner.banner.dataLost":      "ستُفقد البيانات إذا مسحت المتصفح.",
    "planner.banner.loginToSave":   "تسجيل الدخول للحفظ",

    // My Projects page
    "projects.title":               "مشاريعي",
    "projects.subtitle":            "إدارة مشاريع تخطيط حفلات الزفاف والمناسبات",
    "projects.newProject":          "مشروع جديد",
    "projects.noProjects":          "لا توجد مشاريع بعد",
    "projects.noProjectsDesc":      "قم بإنشاء أول مشروع لتخطيط حفل الزفاف للبدء.",
    "projects.createNew":           "إنشاء مشروع زفاف جديد",
    "projects.deleteConfirm":       "هل أنت متأكد أنك تريد حذف هذا المشروع؟",

    // Create project page
    "create.whoAreYou":             "من أنت؟",
    "create.bride":                 "العروس",
    "create.groom":                 "العريس",
    "create.planner":               "المخطط",
    "create.other":                 "أخرى",
    "create.createProject":         "إنشاء مشروع فعالية جديد",
    "create.creating":              "جارٍ إنشاء مشروعك...",
    "create.termsAgree":            "بإنشاء مشروع جديد، أنت توافق على",
    "create.privacyTerms":          "الشروط والسياسة الخاصة",
    "create.goToProjects":          "→ الذهاب إلى قائمة مشاريعي",

    // Overview page
    "overview.totalGuests":         "إجمالي الضيوف",
    "overview.budget":              "الميزانية",
    "overview.tasksDone":           "المهام المنجزة",
    "overview.daysLeft":            "الأيام المتبقية",
    "overview.quickActions":        "إجراءات سريعة",
    "overview.addGuests":           "إضافة ضيوف",
    "overview.setBudget":           "تحديد الميزانية",
    "overview.viewChecklist":       "عرض قائمة المهام",

    // Guest list page
    "guests.title":                 "قائمة الضيوف",
    "guests.heading":               "المدعوون للزفاف",
    "guests.headingDesc":           "اقرأ الدليل {guidelineLink}. يمكنك أيضًا {importLink} من ملف CSV أو XLS.",
    "guests.guidelineLink":         "كيفية استخدام قائمة الضيوف",
    "guests.importLink":            "استيراد قائمة الضيوف",
    "guests.addGuest":              "إضافة ضيف",
    "guests.brideGuests":           "ضيوف العروس",
    "guests.groomGuests":           "ضيوف العريس",
    "guests.firstName":             "الاسم الأول",
    "guests.lastName":              "اسم العائلة",
    "guests.noGuests":              "لم تتم إضافة أي ضيوف بعد.",
    "guests.noGuestsAlpha":         "لا ضيوف بعد. أضف أول ضيف أدناه.",
    "guests.import":                "استيراد قائمة الضيوف",
    "guests.importing":             "جارٍ الاستيراد...",
    "guests.exportCsv":             "تصدير CSV",
    "guests.exportXls":             "تنزيل XLS",
    "guests.exportPdf":             "تنزيل PDF",
    "guests.viewTwoSides":          "جانبان",
    "guests.viewAlphabetic":        "أبجدي",
    "guests.viewFullTable":         "جدول كامل",
    "guests.colName":               "الاسم",
    "guests.colSide":               "الجانب",
    "guests.colRelation":           "العلاقة",
    "guests.colRsvp":               "تأكيد الحضور",
    "guests.bride":                 "العروس",
    "guests.groom":                 "العريس",
    "guests.total":                 "المجموع",
    "guests.attending":             "سيحضر",
    "guests.notAttending":          "لن يحضر",
    "guests.declined":              "رفض",
    "guests.pending":               "في الانتظار",

    // Guest relation labels
    "rel.bride":                    "العروس",
    "rel.groom":                    "العريس",
    "rel.maidOfHonor":              "وصيفة الشرف الأولى",
    "rel.matronOfHonor":            "ربة الشرف",
    "rel.bridesmaid":               "وصيفة العروس",
    "rel.bestMan":                  "رفيق العريس الأول",
    "rel.groomsman":                "رفيق العريس",
    "rel.parent":                   "أحد الوالدين",
    "rel.closeRelative":            "قريب مقرب",
    "rel.relative":                 "قريب",
    "rel.closeFriend":              "صديق مقرب",
    "rel.friend":                   "صديق",
    "rel.partner":                  "شريك",
    "rel.other":                    "أخرى",
    "rel.noFormalities":            "بدون لقب",

    // Title honorifics
    "title.rev":                    "قسّيس",
    "title.dr":                     "د.",
    "title.sir":                    "سيد",
    "title.mr":                     "السيد",
    "title.mister":                 "السيد",
    "title.mrs":                    "السيدة",
    "title.ms":                     "السيدة",
    "title.miss":                   "الآنسة",
    "title.madam":                  "مدام",

    // Guest search/filter
    "guests.searchPlaceholder":     "ابحث عن ضيوف...",
    "guests.filterAll":             "الكل",
    "guests.filterAttending":       "سيحضر",
    "guests.filterPending":         "في الانتظار",
    "guests.filterDeclined":        "رفض",
    "guests.ratioBySides":          "النسبة حسب الجانب",
    "guests.weddingParty":          "حفل الزفاف",
    "guests.totalGuests":           "إجمالي الضيوف",

    // Budget
    "budget.heading":               "ميزانية الزفاف",
    "budget.headingDesc":           "تتبع نفقات زفافك حسب الفئة.",
    "budget.addCategory":           "إضافة فئة",
    "budget.addItem":               "+ إضافة بند",
    "budget.totalBudget":           "إجمالي الميزانية",
    "budget.totalSpent":            "إجمالي الإنفاق",
    "budget.totalPaid":             "إجمالي المدفوع",
    "budget.remaining":             "المتبقي",
    "budget.colDescription":        "الوصف",
    "budget.colPlanned":            "المخطط",
    "budget.colActual":             "الفعلي",
    "budget.colPaid":               "المدفوع",
    "budget.colStatus":             "الحالة",
    "budget.statusUnpaid":          "غير مدفوع",
    "budget.statusPartial":         "مدفوع جزئياً",
    "budget.statusPaid":            "مدفوع",
    "budget.noCategories":          "لا توجد فئات ميزانية بعد.",
    "budget.categoryName":          "اسم الفئة",
    "budget.plannedAmount":         "المبلغ المخطط",
    "budget.cancel":                "إلغاء",
    "budget.save":                  "حفظ",
    "budget.overBudget":            "تجاوز الميزانية",
    "budget.editCategory":          "تعديل الفئة",
    "budget.newCategory":           "فئة جديدة",
    "budget.deleteConfirm":         "حذف هذه الفئة وجميع بنودها؟",
    "budget.itemDescription":       "وصف البند",
    "budget.itemNotes":             "ملاحظات (اختياري)",

    // Checklist
    "checklist.heading":            "قائمة التخطيط",
    "checklist.headingDesc":        "جدولك الزمني لتخطيط الزفاف لمدة 12 شهراً.",
    "checklist.addTask":            "إضافة مهمة",
    "checklist.addTaskPlaceholder": "وصف المهمة...",
    "checklist.months":             "{n} أشهر قبل",
    "checklist.month":              "{n} شهر قبل",
    "checklist.weddingDay":         "يوم الزفاف",
    "checklist.noTasks":            "لا توجد مهام بعد.",
    "checklist.completed":          "{done} من {total} مكتمل",
    "checklist.customTask":         "مخصص",
    "checklist.seedTasks":          "تحميل المهام الافتراضية",
    "checklist.seeding":            "جارٍ التحميل...",

    // Itinerary
    "itinerary.heading":            "جدول الفعاليات",
    "itinerary.headingDesc":        "خطط يوم زفافك ساعة بساعة.",
    "itinerary.addEvent":           "إضافة فعالية",
    "itinerary.noEvents":           "لا توجد فعاليات بعد.",
    "itinerary.startTime":          "وقت البدء",
    "itinerary.endTime":            "وقت الانتهاء (اختياري)",
    "itinerary.title":              "عنوان الفعالية",
    "itinerary.location":           "الموقع (اختياري)",
    "itinerary.description":        "الوصف (اختياري)",
    "itinerary.save":               "حفظ",
    "itinerary.cancel":             "إلغاء",
    "itinerary.edit":               "تعديل",
    "itinerary.delete":             "حذف",

    // Notes
    "notes.heading":                "الملاحظات",
    "notes.headingDesc":            "اكتب وعوداً وخطاباً وأفكاراً والمزيد.",
    "notes.addNote":                "ملاحظة جديدة",
    "notes.untitled":               "بدون عنوان",
    "notes.noNotes":                "لا توجد ملاحظات بعد.",
    "notes.placeholder":            "ابدأ الكتابة...",
    "notes.titlePlaceholder":       "عنوان الملاحظة",
    "notes.deleteConfirm":          "هل تريد حذف هذه الملاحظة؟",

    // Coming soon
    "comingSoon":                   "هذه الميزة ستكون متاحة في مرحلة قادمة.",
  },

  bn: {
    // Footer
    "footer.copyright":             "© {year} {name}। সর্বস্বত্ব সংরক্ষিত।",
    "footer.disclaimer":            "{name} একটি আইন সংস্থা নয় এবং আইনি পরামর্শ দেয় না।",
    "lang.choose":                  "ভাষা বেছে নিন",

    // Main navigation
    "nav.home":                     "হোম",
    "nav.services":                 "সেবাসমূহ",
    "nav.pricing":                  "মূল্য তালিকা",
    "nav.about":                    "আমাদের সম্পর্কে",
    "nav.blog":                     "ব্লগ",
    "nav.contact":                  "যোগাযোগ",

    // Common actions
    "common.getStarted":            "শুরু করুন",
    "common.learnMore":             "আরও জানুন",
    "common.signIn":                "সাইন ইন",
    "common.signOut":               "সাইন আউট",
    "common.delete":                "মুছুন",
    "common.notSaved":              "সংরক্ষিত হয়নি",
    "common.settings":              "সেটিংস",
    "common.profile":               "প্রোফাইল",
    "common.dashboard":             "ড্যাশবোর্ড",

    // Dashboard sidebar
    "dash.overview":                "সংক্ষিপ্ত বিবরণ",
    "dash.orders":                  "অর্ডারসমূহ",
    "dash.invoices":                "ইনভয়েস",
    "dash.documents":               "নথিপত্র",
    "dash.support":                 "সহায়তা",
    "dash.weddingProjects":         "বিয়ের প্রকল্পসমূহ",

    // Planner sidebar navigation
    "planner.nav.overview":         "সংক্ষিপ্ত বিবরণ",
    "planner.nav.guestList":        "অতিথি তালিকা",
    "planner.nav.venuesVendors":    "ভেন্যু ও সরবরাহকারী",
    "planner.nav.ceremony":         "অনুষ্ঠান",
    "planner.nav.reception":        "রিসেপশন",
    "planner.nav.allVendors":       "সকল সরবরাহকারী",
    "planner.nav.planningTools":    "পরিকল্পনার সরঞ্জাম",
    "planner.nav.website":          "ওয়েবসাইট",
    "planner.nav.checklist":        "চেকলিস্ট",
    "planner.nav.budget":           "বাজেট",
    "planner.nav.itinerary":        "অনুষ্ঠান সূচি",
    "planner.nav.seating":          "আসন বিন্যাস ও সরঞ্জাম",
    "planner.nav.notes":            "নোট",
    "planner.nav.postWedding":      "বিয়ের পরে",
    "planner.nav.settings":         "সেটিংস",

    // Planner header
    "planner.header.search":        "সরবরাহকারী বা ভেন্যু খুঁজুন...",
    "planner.header.myProjects":    "আমার প্রকল্পসমূহ",
    "planner.header.profileSettings": "প্রোফাইল সেটিংস",

    // Anonymous banner
    "planner.banner.notSaved":      "আপনার প্রকল্প সংরক্ষিত হয়নি।",
    "planner.banner.dataLost":      "ব্রাউজার পরিষ্কার করলে তথ্য হারিয়ে যাবে।",
    "planner.banner.loginToSave":   "সংরক্ষণ করতে লগইন করুন",

    // My Projects page
    "projects.title":               "আমার প্রকল্পসমূহ",
    "projects.subtitle":            "আপনার বিয়ে ও ইভেন্ট পরিকল্পনার প্রকল্পগুলো পরিচালনা করুন",
    "projects.newProject":          "নতুন প্রকল্প",
    "projects.noProjects":          "এখনো কোনো প্রকল্প নেই",
    "projects.noProjectsDesc":      "শুরু করতে আপনার প্রথম বিয়ের পরিকল্পনার প্রকল্প তৈরি করুন।",
    "projects.createNew":           "নতুন বিয়ের প্রকল্প তৈরি করুন",
    "projects.deleteConfirm":       "আপনি কি নিশ্চিত এই প্রকল্পটি মুছে ফেলতে চান?",

    // Create project page
    "create.whoAreYou":             "আপনি কে?",
    "create.bride":                 "কনে",
    "create.groom":                 "বর",
    "create.planner":               "পরিকল্পনাকারী",
    "create.other":                 "অন্যান্য",
    "create.createProject":         "নতুন ইভেন্ট প্রকল্প তৈরি করুন",
    "create.creating":              "আপনার প্রকল্প তৈরি হচ্ছে...",
    "create.termsAgree":            "নতুন প্রকল্প তৈরি করে আপনি সম্মত হচ্ছেন",
    "create.privacyTerms":          "গোপনীয়তা ও আইনি শর্তাবলী",
    "create.goToProjects":          "← আমার প্রকল্প তালিকায় যান",

    // Overview page
    "overview.totalGuests":         "মোট অতিথি",
    "overview.budget":              "বাজেট",
    "overview.tasksDone":           "সম্পন্ন কাজ",
    "overview.daysLeft":            "বাকি দিন",
    "overview.quickActions":        "দ্রুত কার্যক্রম",
    "overview.addGuests":           "অতিথি যোগ করুন",
    "overview.setBudget":           "বাজেট নির্ধারণ করুন",
    "overview.viewChecklist":       "চেকলিস্ট দেখুন",

    // Guest list page
    "guests.title":                 "অতিথি তালিকা",
    "guests.heading":               "বিয়ের অতিথিরা",
    "guests.headingDesc":           "নির্দেশিকা পড়ুন {guidelineLink}। এছাড়াও আপনি CSV বা XLS ফাইল থেকে {importLink} করতে পারেন।",
    "guests.guidelineLink":         "অতিথি তালিকা কীভাবে ব্যবহার করবেন",
    "guests.importLink":            "অতিথি তালিকা আমদানি",
    "guests.addGuest":              "অতিথি যোগ করুন",
    "guests.brideGuests":           "কনের অতিথিরা",
    "guests.groomGuests":           "বরের অতিথিরা",
    "guests.firstName":             "প্রথম নাম",
    "guests.lastName":              "শেষ নাম",
    "guests.noGuests":              "এখনো কোনো অতিথি যোগ করা হয়নি।",
    "guests.noGuestsAlpha":         "এখনো কোনো অতিথি নেই। নিচে প্রথম অতিথি যোগ করুন।",
    "guests.import":                "অতিথি তালিকা আমদানি করুন",
    "guests.importing":             "আমদানি হচ্ছে...",
    "guests.exportCsv":             "CSV রপ্তানি করুন",
    "guests.exportXls":             "XLS ডাউনলোড করুন",
    "guests.exportPdf":             "PDF ডাউনলোড করুন",
    "guests.viewTwoSides":          "দুই পক্ষ",
    "guests.viewAlphabetic":        "বর্ণানুক্রমিক",
    "guests.viewFullTable":         "সম্পূর্ণ তালিকা",
    "guests.colName":               "নাম",
    "guests.colSide":               "পক্ষ",
    "guests.colRelation":           "সম্পর্ক",
    "guests.colRsvp":               "আরএসভিপি",
    "guests.bride":                 "কনে",
    "guests.groom":                 "বর",
    "guests.total":                 "মোট",
    "guests.attending":             "উপস্থিত থাকবেন",
    "guests.notAttending":          "উপস্থিত থাকবেন না",
    "guests.declined":              "প্রত্যাখ্যান",
    "guests.pending":               "অপেক্ষমাণ",

    // Guest relation labels
    "rel.bride":                    "কনে",
    "rel.groom":                    "বর",
    "rel.maidOfHonor":              "প্রধান সহচরী",
    "rel.matronOfHonor":            "সম্মানিত সহচরী",
    "rel.bridesmaid":               "বিবাহ সহচরী",
    "rel.bestMan":                  "বরের প্রধান বন্ধু",
    "rel.groomsman":                "বরের বন্ধু",
    "rel.parent":                   "অভিভাবক",
    "rel.closeRelative":            "ঘনিষ্ঠ আত্মীয়",
    "rel.relative":                 "আত্মীয়",
    "rel.closeFriend":              "ঘনিষ্ঠ বন্ধু",
    "rel.friend":                   "বন্ধু",
    "rel.partner":                  "সঙ্গী",
    "rel.other":                    "অন্যান্য",
    "rel.noFormalities":            "কোনো উপাধি নয়",

    // Title honorifics
    "title.rev":                    "রেভারেন্ড",
    "title.dr":                     "ড.",
    "title.sir":                    "স্যার",
    "title.mr":                     "জনাব",
    "title.mister":                 "মিস্টার",
    "title.mrs":                    "মিসেস",
    "title.ms":                     "মিজ",
    "title.miss":                   "মিস",
    "title.madam":                  "ম্যাডাম",

    // Guest search/filter
    "guests.searchPlaceholder":     "অতিথি খুঁজুন...",
    "guests.filterAll":             "সব",
    "guests.filterAttending":       "উপস্থিত",
    "guests.filterPending":         "অপেক্ষমাণ",
    "guests.filterDeclined":        "প্রত্যাখ্যাত",
    "guests.ratioBySides":          "পক্ষ অনুযায়ী অনুপাত",
    "guests.weddingParty":          "বিয়ের পার্টি",
    "guests.totalGuests":           "মোট অতিথি",

    // Budget
    "budget.heading":               "বিয়ের বাজেট",
    "budget.headingDesc":           "বিভাগ অনুযায়ী খরচ ট্র্যাক করুন।",
    "budget.addCategory":           "বিভাগ যোগ করুন",
    "budget.addItem":               "+ আইটেম যোগ করুন",
    "budget.totalBudget":           "মোট বাজেট",
    "budget.totalSpent":            "মোট খরচ",
    "budget.totalPaid":             "মোট পরিশোধ",
    "budget.remaining":             "অবশিষ্ট",
    "budget.colDescription":        "বিবরণ",
    "budget.colPlanned":            "পরিকল্পিত",
    "budget.colActual":             "প্রকৃত",
    "budget.colPaid":               "পরিশোধিত",
    "budget.colStatus":             "অবস্থা",
    "budget.statusUnpaid":          "অপরিশোধিত",
    "budget.statusPartial":         "আংশিক",
    "budget.statusPaid":            "পরিশোধিত",
    "budget.noCategories":          "এখনো কোনো বাজেট বিভাগ নেই।",
    "budget.categoryName":          "বিভাগের নাম",
    "budget.plannedAmount":         "পরিকল্পিত পরিমাণ",
    "budget.cancel":                "বাতিল",
    "budget.save":                  "সংরক্ষণ করুন",
    "budget.overBudget":            "বাজেট অতিক্রম",
    "budget.editCategory":          "বিভাগ সম্পাদনা",
    "budget.newCategory":           "নতুন বিভাগ",
    "budget.deleteConfirm":         "এই বিভাগ ও সব আইটেম মুছবেন?",
    "budget.itemDescription":       "আইটেমের বিবরণ",
    "budget.itemNotes":             "নোট (ঐচ্ছিক)",

    // Checklist
    "checklist.heading":            "পরিকল্পনার তালিকা",
    "checklist.headingDesc":        "আপনার ১২ মাসের বিয়ের পরিকল্পনার সময়সূচি।",
    "checklist.addTask":            "কাস্টম কাজ যোগ করুন",
    "checklist.addTaskPlaceholder": "কাজের বিবরণ...",
    "checklist.months":             "বিয়ের {n} মাস আগে",
    "checklist.month":              "বিয়ের {n} মাস আগে",
    "checklist.weddingDay":         "বিয়ের দিন",
    "checklist.noTasks":            "এখনো কোনো কাজ নেই।",
    "checklist.completed":          "{total} এর মধ্যে {done} সম্পন্ন",
    "checklist.customTask":         "কাস্টম",
    "checklist.seedTasks":          "ডিফল্ট কাজ লোড করুন",
    "checklist.seeding":            "লোড হচ্ছে...",

    // Itinerary
    "itinerary.heading":            "অনুষ্ঠান সূচি",
    "itinerary.headingDesc":        "ঘণ্টা অনুযায়ী আপনার বিয়ের দিনের পরিকল্পনা করুন।",
    "itinerary.addEvent":           "ইভেন্ট যোগ করুন",
    "itinerary.noEvents":           "এখনো কোনো ইভেন্ট নেই।",
    "itinerary.startTime":          "শুরুর সময়",
    "itinerary.endTime":            "শেষের সময় (ঐচ্ছিক)",
    "itinerary.title":              "ইভেন্টের শিরোনাম",
    "itinerary.location":           "স্থান (ঐচ্ছিক)",
    "itinerary.description":        "বিবরণ (ঐচ্ছিক)",
    "itinerary.save":               "সংরক্ষণ করুন",
    "itinerary.cancel":             "বাতিল",
    "itinerary.edit":               "সম্পাদনা",
    "itinerary.delete":             "মুছুন",

    // Notes
    "notes.heading":                "নোট",
    "notes.headingDesc":            "প্রতিজ্ঞা, বক্তৃতা, ধারণা এবং আরও লিখুন।",
    "notes.addNote":                "নতুন নোট",
    "notes.untitled":               "শিরোনামহীন",
    "notes.noNotes":                "এখনো কোনো নোট নেই।",
    "notes.placeholder":            "লেখা শুরু করুন...",
    "notes.titlePlaceholder":       "নোটের শিরোনাম",
    "notes.deleteConfirm":          "এই নোটটি মুছে ফেলবেন?",

    // Coming soon
    "comingSoon":                   "এই ফিচারটি ভবিষ্যৎ পর্যায়ে আসবে।",
  },
};

// ── Context ────────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
  currentLanguage: (typeof LANGUAGES)[number];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (stored && LANGUAGES.some((l) => l.code === stored)) {
        setLangState(stored);
        applyToDocument(stored);
      }
    } catch {}
  }, []);

  const setLang = useCallback((code: LangCode) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
    applyToDocument(code);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string>): string => {
    let str = translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, v);
      }
    }
    return str;
  }, [lang]);

  const currentLanguage = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: currentLanguage.dir as "ltr" | "rtl", currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

// ── Util ───────────────────────────────────────────────────────────────────────
function applyToDocument(code: LangCode) {
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang || typeof document === "undefined") return;
  document.documentElement.lang = code;
  document.documentElement.dir = lang.dir;
}
