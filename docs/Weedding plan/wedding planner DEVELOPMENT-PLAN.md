# Ceremoney — MVP Development Plan

> **Version:** 4.5 | **Date:** 2026-04-03 | **Timeline:** 19–21 Weeks (+ 3 weeks UX/UI parallel)

---

## ⚠️ MANDATORY IMPLEMENTATION RULES

> These rules apply to **every single task** in every phase. **No exceptions. No shortcuts.**

---

### Rule 1 — Codebase Analysis First (ALWAYS)

**Before writing a single line of code**, you MUST:

1. Read and analyze ALL relevant existing files — models, API routes, components, types, hooks, layouts, middleware, `prisma/schema.prisma`, `planner-storage.ts`
2. Understand existing patterns — how auth works, how API routes are structured, how components are organized, how localStorage dual-mode works
3. Identify what already exists and can be reused vs what needs to be created from scratch
4. Identify potential conflicts or breaking changes with existing code

> ❌ **NEVER** start implementing without reading the codebase first
> ❌ **NEVER** assume you know the structure — always verify by reading
> ✅ **ALWAYS** analyze before coding, every single time, no exceptions

---

### Rule 2 — Fullstack Implementation Only (NO UI Mockups)

Every task must be implemented **end-to-end, fully functional**. Partial work is not acceptable.

| Layer | What to implement | Required? |
|-------|-----------------|-----------|
| **Database** | Prisma schema — new models, enums, indexes, relations | ✅ REQUIRED |
| **Migration** | Raw SQL script or `npx prisma db push` — schema must be applied to DB | ✅ REQUIRED |
| **Prisma Client** | Run `npx prisma generate` after schema changes | ✅ REQUIRED |
| **API Routes** | Route handlers (`/api/...`), request validation, error handling, auth checks | ✅ REQUIRED |
| **Backend Logic** | Data processing, business rules, helper functions in `/lib` | ✅ REQUIRED |
| **localStorage helpers** | `planner-storage.ts` CRUD helpers for anonymous/local projects | ✅ REQUIRED |
| **Frontend UI** | Full working React components — forms, lists, modals, all interaction states | ✅ REQUIRED |
| **State Management** | Loading, error, empty, populated, saving states — all handled | ✅ REQUIRED |
| **TypeScript Types** | Interfaces/types for all new data structures | ✅ REQUIRED |

> ❌ **NEVER** deliver a UI mockup, placeholder, or "coming soon" stub as a completed task
> ❌ **NEVER** skip the database layer or API layer
> ❌ **NEVER** build UI without a working backend behind it
> ❌ **NEVER** build backend without a working UI in front of it
> ✅ **ALWAYS** implement the full stack: DB schema → Migration → API → localStorage helpers → UI
> ✅ **ALWAYS** support both anonymous (localStorage) and authenticated (API/DB) modes

---

### Rule 3 — Checklist Verification After Every Task

After completing each task, verify **every item** before marking done:

- [ ] DB schema updated in `prisma/schema.prisma`
- [ ] Migration applied (raw SQL script run OR `npx prisma db push`)
- [ ] `npx prisma generate` run — Prisma client up to date
- [ ] API endpoints return correct responses (GET, POST, PUT, DELETE all tested)
- [ ] API returns 401 for unauthenticated requests (where auth required)
- [ ] localStorage helpers added to `planner-storage.ts` for local project mode
- [ ] UI renders correctly — loading state, error state, empty state, populated state
- [ ] Forms validate input and show error messages
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] No `console.log` or debug statements left in code
- [ ] Auth/permissions correct (local project vs DB project handled)
- [ ] Edge cases handled (empty data, invalid input, network errors)
- [ ] Mobile layout works (responsive)

> ❌ **NEVER** mark a task as done without passing every item on this checklist
> ✅ **ALWAYS** verify each item before moving to the next task

---

### Rule 4 — Codebase Cleanup After Every Phase

After all tasks in a phase are complete:

1. Remove all **stub/placeholder pages** (`ComingSoon` component) that were replaced
2. Remove all **unused imports**, variables, functions, components
3. Remove all **`console.log`** and debug statements
4. Remove all **dead code** — commented-out blocks, unreachable code, TODO comments
5. Verify **no duplicate logic** — consolidate if found
6. Run `npx tsc --noEmit` — **zero TypeScript errors** allowed
7. Run `npm run lint` — **zero ESLint errors** allowed

> ❌ **NEVER** leave stub pages, `ComingSoon` components, or unused code after a phase
> ❌ **NEVER** mark a phase done with TypeScript errors
> ✅ **ALWAYS** clean up before marking a phase as done

---

### Rule 5 — Phase Status Tracking

Use these exact status labels:

| Label | Meaning |
|-------|---------|
| `⬜ NOT STARTED` | Work has not begun |
| `🔄 IN PROGRESS` | Currently being implemented |
| `✅ IMPLEMENTATION DONE` | Fully implemented, checklist passed, codebase cleaned |

After completing a phase:
- Update the phase header to `✅ IMPLEMENTATION DONE` with the date
- List all files created/modified
- Note any deviations from the original plan

> ✅ Keep this document updated as the single source of truth for project status

---

## 1. Project Summary

**Ceremoney** is a multi-event digital planning platform (SaaS) — a "Planning Command Center" for weddings, baptisms, and events. Built with additional Swedish market features (Swish, Klarna, VAT/Moms, Arabic RTL).

### Core Product Pillars

| Pillar | Description |
|--------|-------------|
| **Guest Management** | Guest list + RSVP + dietary + groups + plus-ones — central data hub |
| **Visual Editors** | Seating chart (canvas drag-drop), website builder (block-based), invitation designer |
| **Planning Tools** | Budget tracker, 12-month checklist, event itinerary, notes/vows |
| **Vendor Discovery** | Directory search with geo/category/date filtering, vendor profiles, inquiry system |
| **Public Event Sites** | Mobile-first guest websites with RSVP, countdown, gallery, guestbook |
| **Collaboration** | Multi-user access, role-based permissions, real-time sync |

**Target Markets:** Sweden (primary), Global English, Arabic (full RTL)

---

## 2. Tech Stack (Mandated)

> ⚠ **Deviations from this stack require explicit written approval.**

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Shadcn/UI, Zustand (state) |
| Backend API | Node.js + Express.js — RESTful (public) + tRPC (internal type-safe client-server) |
| ORM | Prisma ORM (type-safe queries, migrations) |
| Database | PostgreSQL 16 (JSONB for flexible data, PostGIS for vendor geo-search) |
| Cache/Queue | Redis (caching, sessions, BullMQ job queue) |
| Real-time | Socket.io (collaborative editing, live builder preview) |
| Canvas/Editor | Konva.js (seating chart, invitation designer) |
| Drag & Drop | dnd-kit (website builder, checklist reorder) |
| Forms | react-hook-form + Zod (schema validation) |
| Server State | TanStack React Query (optimistic updates) |
| Payments | Stripe (global), Swish (SE mobile), Klarna (BNPL) |
| Email | SendGrid or AWS SES (transactional + invitation emails) |
| SMS | Twilio or 46elks (Swedish sender ID, credit-bundle model) |
| Maps | Google Maps JavaScript SDK (vendor search, venue locations) |
| Analytics | Google Analytics JavaScript SDK + Vercel Analytics |
| PDF | Puppeteer or React-PDF (stationery engine, background jobs via BullMQ) |
| QR Codes | qrcode.react (RSVP, entrance, invitation) |
| Storage | AWS S3 (media assets), CloudFront CDN (delivery), presigned URLs (direct upload) |
| i18n | next-intl (SE, EN, AR with RTL) |
| Typography | Inter (SE/EN), Cairo or IBM Plex Sans Arabic (AR) |
| Testing | Vitest + React Testing Library (unit, 80%), Vitest + MSW (integration, 60%), Playwright (E2E) |
| Monitoring | Sentry (errors), Pino (structured logging), Pingdom/UptimeRobot (uptime) |
| Deployment | Vercel (Next.js frontend), AWS ECS (API services), RDS (PostgreSQL), S3, CloudFront |
| CI/CD | GitHub Actions (lint → test → build → preview → staging → production → smoke tests) |

---

## 3. Pricing Model

### For Couples — 3-Tier Monthly Subscription

| Feature | Basic (Free) | Premium (299 SEK/mo) | Elite (499 SEK/mo) |
|---------|-------------|---------------------|-------------------|
| Event website (subdomain) | ✅ | ✅ + custom domain | ✅ + custom domain |
| RSVP form (basic) | ✅ | ✅ (advanced conditional) | ✅ (advanced) |
| Checklist (basic) | ✅ | ✅ | ✅ |
| Vendor & Venue directory | ✅ | ✅ | ✅ |
| Multi-language support | ✅ | ✅ | ✅ |
| **Guest List Manager** | ❌ | ✅ | ✅ |
| **Seating Chart Editor** | ❌ | ✅ | ✅ |
| Custom domain | ❌ | ✅ | ✅ |
| Export PDF/XLS | ❌ | ✅ | ✅ |
| Advanced website (templates, themes, password) | ❌ | ✅ | ✅ |
| Ad-free experience | ❌ | ✅ | ✅ |
| Notification system (email invites) | ❌ | ✅ | ✅ |
| **Printable Assets (Stationery Engine)** | ❌ | ❌ | ✅ |
| **QR Entrance Mode** | ❌ | ❌ | ✅ |
| **Collaborator access** | ❌ | ❌ | ✅ (unlimited) |
| **SMS credits** | ❌ | ❌ | ✅ (purchasable bundles) |
| Ads on event website | Shown (cannot disable) | Hidden | Hidden |
| **Dashboard ads toggle** | ❌ | ✅ (can toggle) | ✅ (can toggle) |

### For Vendors (Business Directory)

| Plan | Price | Features |
|------|-------|----------|
| **Business Profile** | $19/month | Business page, smart search listing, Google indexing, dofollow backlink, reviews, portfolio, 30-day free trial |

### White-Label (For Wedding Planners)

| Plan | Price | Features |
|------|-------|----------|
| **White-Label** | $120/month | Custom subdomain (weddings.YOUR-DOMAIN.com), your branding, auto-premium for all projects, 14-day free trial |

### Swedish Market Compliance

- **Swish** mobile payments for Swedish users
- **Klarna** BNPL/installment options (Pay Later / Slice It)
- **Auto PDF Kvitto** (receipts) with Company name, Org.nr, Moms (25% VAT), invoice date, invoice number
- **Stripe Tax** or manual VAT calculation for Swedish users
- **Stripe Customer Portal** — users manage subscription, billing history, download invoices

### SMS Credit System (Elite Tier)

- Purchase bundles: 50 / 100 / 250 credits
- 1 credit = 1 SMS to 1 recipient
- Provider: 46elks or Twilio with Swedish sender ID
- Low-credit warning at 10 remaining credits
- Used for: guest invitations, event day reminders, seating reminders

---

## 4. User Roles & Permissions

| Role | Access Level | Capabilities |
|------|-------------|-------------|
| **Super Admin** | Full platform | All settings, financials, user management, vendor approvals, ad management |
| **Admin** | Operational | User support, content moderation, vendor management |
| **Vendor** | Own profile | Edit business profile, view inquiries, manage availability, conversations |
| **Customer (Host)** | Own projects | Create/manage events, guests, website, billing |
| **Collaborator** | Shared project | View/edit guest list (restricted; granted by host) — Elite only |
| **Guest** | RSVP form only | Submit RSVP; view their own seating info via QR |

---

## 5. Supported Event Types

| Type | Specific Components |
|------|-------------------|
| **Wedding** | Ceremony + Reception, couple names, registry, "Our Story" widget, bridesmaid/groomsmen list |
| **Baptism** | Godparents, blessings, religious elements, godparent widget |
| **Party** | Birthday, anniversary, general celebration layouts |
| **Corporate** | Company events, conferences, formal templates |

### Event Creation Wizard (8 Steps)

1. Select Event Type (Wedding / Baptism / Party / Corporate)
2. Enter Event Details (name, date, location)
3. Add Host Names (couple names for wedding, host name for others)
4. Select Languages (SE / EN / AR)
5. Upload Logo (optional — PNG/SVG, max 2MB)
6. Choose Color Theme (solid color or CSS gradient)
7. Event Created (confirmation)
8. Redirect to Dashboard

---

## 6. Dashboard Structure

After login, the user sees **My Projects** (list of events). Selecting a project opens the dashboard with these tabs:

```
┌─────────────────────────────────────────┐
│  My Projects (List of Events)           │
│  Select Project / Create New Project    │
├─────────────────────────────────────────┤
│  Dashboard Tabs:                        │
│  ├── Overview (summary + stats)         │
│  ├── Guest List                         │
│  ├── Ceremony                           │
│  ├── Reception                          │
│  ├── All Vendors                        │
│  ├── Website                            │
│  ├── Checklist                          │
│  ├── Budget                             │
│  ├── Event Itinerary                    │
│  ├── Seating Chart & Supplies           │
│  ├── Notes                              │
│  ├── Files                              │
│  ├── Post-Event                         │
│  └── Settings                           │
└─────────────────────────────────────────┘
```

### Tab Details

#### Overview Tab
- **Progress Tracker:** Visual circle/ring showing planning % completion
- **"Big Three" Action Buttons:** [Edit Website], [Manage Guests], [Design Seating] — prominent CTAs
- **Upcoming Tasks:** Automated from checklist based on event date
- Event summary: Ceremony & Reception dates/locations
- Guest summary: Total, Confirmed, Pending, Declined
- Checklist progress: Completed / Pending tasks
- Budget summary: Planned vs Actual cost with pie chart
- Quick download: PDF/XLS reports
- Website visit analytics + RSVP progress tracking

#### Guest List Tab
- Add/edit guests manually or import CSV/XLS
- Fields: First name, Last name, Email, Phone, Group/Side (Bride/Groom), Table assignment, RSVP status, Dietary, Notes
- **Custom columns** — add as many as needed (dietary restrictions, allergies, plus-one status, rehearsal dinner confirmation)
- RSVP status values: Pending, Attending (Ceremony only / Reception only / Both), Not Attending
- **3 display modes:** Relationship-based (split by partner), Alphabetical view, Full table format
- Guest count summary bar: Total, Attending, Pending, Declined, gender breakdown, meal preferences
- Bulk actions: Export to CSV/XLS/PDF, Send invitation, Assign to table
- Search and filter by name, RSVP status, group, dietary, table
- Plus-one management with conditional visibility
- Chief guest assignment
- Family grouping feature
- Auto-sync with RSVP, seating chart, and invitations

#### RSVP System
- **Conditional form logic:** Fields shown/hidden based on attendance decision
- **When "Attending":** Email, guest count (slider/stepper), high chair needs, dietary restrictions (checkboxes: Vegetarian, Vegan, Gluten-free, Dairy-free, custom), meal selection, accommodation, transport, arrival date, song requests, personal message
- **When "Not Attending":** First name, last name, optional phone only
- **Custom questions framework:** Short Text, Long Text, Single Choice (Radio), Multiple Choice (Checkboxes) — drag-drop sortable order
- **Delivery methods:** Email (HTML + QR attachment), unique RSVP URL per guest, QR code for physical invitations, SMS (Elite), WhatsApp (Phase 2)
- Email notifications when guests respond
- Automatic guest list population from responses
- Manual confirm/auto-add options
- QR code generation linking directly to RSVP page
- GDPR consent checkbox on every submission

#### Ceremony & Reception Tabs
- Set date, location, layout, description for each
- Upload photos (30 max, 20MB each)
- Separate venue details and schedules
- Download PDF summaries

#### Vendors Tab
- Browse verified vendors by 13 categories: Venues, Photography, Videography, Catering, Music/DJ, Flowers, Dress & Attire, Rings, Decorations, Transportation, Hair & Makeup, Wedding Planner, Other
- **Smart matching:** Set event date → system filters available vendors near geolocation
- Sticky dropdown search bar with geo-location auto-detect
- **Map view + list view** toggle
- Filter by: Category, Location, Price range, Rating, Availability date, Distance
- Add custom vendor or import from file
- Invite vendors via link
- Recommended vendors near user
- Download vendor list PDF
- **Vendor profile page:** Gallery slideshow, about section, years in business, team size, specialties, pricing tab, availability calendar (color-coded open/booked dates), reviews & ratings (star + written), "Request Pricing" CTA, FAQ, social links
- **Vendor portal:** "Are You a Vendor?" CTA in main navigation, claim/create business profile
- **Booking request flow:** Step 1: Event type → Step 2: Wedding details (venue dropdown, searching, not listed) → Step 3: Submit → vendor gets notification
- Response SLA shown on profile ("Responds within 24 hours")

#### Website Builder Tab
- Create personalized website linked to project
- **Full-screen builder mode:** Left sidebar panel + live canvas (right)
- All changes update canvas in real-time via React state (no page refresh)
- Auto-save every 60 seconds; manual save button always visible
- **12 MVP widget/section types:**
  1. Header (hero image + overlaid names & date)
  2. Our Story (text + photos)
  3. Image + Text combination blocks
  4. Text + Image list layouts
  5. Location/Map (embedded maps + directions)
  6. People List (wedding party / event participants)
  7. Countdown timer
  8. YouTube video embed
  9. Image Gallery (lightbox viewing)
  10. RSVP Form (connected to Guest Management)
  11. Wishlist / Registry (links to Amazon, Zola, Honeyfund + contribution tracking)
  12. Guestbook (guest messages)
- **Additional sections:** Travel & Accommodation, Dress Code, Photo Upload (guests contribute)
- **10+ professional templates:** Modern, rustic, minimalist, floral themes — Wedding, Baptism, Party variations
- **Theme engine:**
  - Color Engine: Solid colors + CSS gradient support via CSS custom properties (`--color-primary`, etc.)
  - Font Engine: Google Fonts library picker
  - Logo Upload: PNG/SVG, max 2MB, dedicated branding slot
  - Live Preview: Instant updates on color/font/text changes
  - Change template anytime without losing content
- **Multilingual:** Floating language toggle widget on published sites, duplicate-and-translate flow
- **SEO module:** Meta title/description, OG image, canonical URL, GA tag, Google Search Console verification, sitemap.xml auto-gen
- **Responsive:** Mobile-friendly, all templates fully responsive
- Share link / QR code for the site
- Free subdomain; Premium gets custom domain + password protection + multiple websites

#### Checklist Tab
- **12-month personalized planning timeline** with intelligent task suggestions based on wedding date
- Pre-built milestones from 12 months out through wedding day:
  - 12mo: Budget, guest list draft, venue selection, date confirmation
  - 11mo: Book high-demand vendors (photographers, videographers, musicians, caterers)
  - 10mo: Wedding dress shopping, website creation, engagement photos, wedding party selection
  - 9mo: Save-the-dates, bridal dress ordering
  - 8mo: Florist, registry, bridesmaids dresses, rentals
  - 6-7mo: Hair/makeup pro, honeymoon, groom attire, rings, transport
  - 4-5mo: Accessories, decorations, cake, hair/makeup trials, invitations
  - 3mo: Wedding day schedule, seating chart, vow writing
  - 1mo: Final fittings, vendor payments, shoe break-in
  - 1wk: Beauty treatments, emergency kit, final logistics
- Add custom tasks by timeline (months/weeks/days)
- Drag-and-drop reorder
- Mark complete, set reminders
- Partner sharing + task delegation
- Export PDF/XLS

#### Budget Tab
- **Categories:** Venue, Catering, Entertainment, Dress & Attire, Rings, Decorations, Transportation, Gifts, and more with sub-categories
- Each item: Description, Planned cost, Actual cost, Paid amount, Payment status
- **Auto-calculation:** Individual amounts auto-totaled per category and grand total
- **Pie chart visualization** of expense breakdown
- **Overspending alerts** when approaching/exceeding budget
- **Contingency fund:** Recommended 12-15% of total budget
- **Cost per head analysis:** Venue budget ÷ guest count
- Drag-and-drop ordering
- Advanced mode for detailed options
- Multi-currency support (Premium)
- Export PDF/XLS

#### Event Itinerary Tab
- **Day-of timeline** with hour-by-hour scheduling
- Visual scheduling tools with templates
- Customizable event flow
- Add/edit/delete events
- Export PDF/XLS

#### Seating Chart & Supplies Tab
- **Interactive canvas editor** (Konva.js / SVG-based)
- **Two layout tabs:** Ceremony Layout and Reception Layout
- **Table types:** Round, Rectangular (Long), Square, Oblong, Half-round, Row of Chairs, Buffet tables
- **Start options:** Empty layout OR 6 starter templates (scattered rounds, classroom rows, banquet long, U-shape, etc.)
- **Upload venue SVG blueprint** as background layer
- **Add element panel:** Tables with seats, Buffet tables, Custom SVG, Text labels, Ruler tool
- **Sticky header toolbar:** Close | Seating | Catering | Start New Layout | File Menu | Add Element
- **File menu:** New (New Layout / Clear All Tables), Download PDF, Upload from PDF, Add custom SVG, History, Import/Export layout
- **Guest assignment:**
  - Import Excel guest list → click numbered circles → select name from guest list
  - Drag guests from unassigned list onto seats
  - "Add Guest" button always visible
  - Click seat → sidebar shows: Guest name, Release seat, Hide seat, Unassigned list, + Add guest quickly
  - Guest sidebar: Relation (Bride/Groom side), Family field, RSVP status, Table #, Meal choice, Dietary, Comment, Custom fields, Remove guest
- **Guest avatars:** Customizable by age group (adult, teen, infant), skin tone, gender, side color
- **History system:** Auto-save every 5min (last 24 hours), manual "Create Snapshot", timestamp + creator name, Restore button per snapshot
- **Catering mode:** Toggle between Seating view and Catering view — shows meal counts per table, confirmed/pending count, gender icons, meal counts popup
- **QR Entrance Mode (Premium/Elite):**
  - Unique Digital Layout URL (shareable with staff)
  - Staff search by guest name or seat number on mobile
  - Result: Table number, tablemates list, position highlighted on venue map
  - QR code on physical invitation links to guest's personal seat info
- **Exports:** PDF (full chart, table cards, place cards, name cards, menus), Excel (guest info columns), PNG
- **Supplies:** Table number cards, place cards, menus — auto-generated from layout data

#### Notes Tab
- Personal notes, vows, speeches, ideas, vendor questions
- Add multiple pages
- Export PDF

#### Files Tab
- File storage and organization
- Upload documents, contracts, inspiration images

#### Post-Event Tab
- Upload event photos (30 free, 1000+ Premium)
- Password-protected photo albums
- **Guest photo contributions** — guests upload their photos
- Slideshow embedding with captions
- QR code for guest photo upload access
- Add feedback/comments
- Platform remains accessible as celebration archive

#### Settings Tab
- Project title, date, type, currency, measurement unit, time format
- **Collaboration:** Full access / View-only permissions (5 free, unlimited Premium)
- Real-time syncing across devices
- Read-only preview sharing
- Share via link, email, QR code
- Archive, copy, delete project
- Activate accessibility mode
- Customize feature visibility (show/hide tabs)

---

## 7. Core Modules (13 Modules)

| # | Module | Plan Gate | Key Responsibilities |
|---|--------|-----------|---------------------|
| 1 | **Identity & Access** | All | Registration, login (email + OAuth), JWT auth, roles (Customer, Vendor, Collaborator, Admin, Super Admin), MFA, 2FA |
| 2 | **Project Management** | All | Multi-project support, 8-step event wizard (4 event types), settings, collaboration (Elite), sharing |
| 3 | **Planning Engine** | Basic+ (checklist), Premium+ (budget, itinerary) | Budget tracker, 12-month checklist, event itinerary, notes/vows |
| 4 | **Guest Management** | Premium+ | Guest CRUD, CSV/XLS import, custom columns, family groups, plus-ones, chief guest, 3 display modes, bulk actions |
| 5 | **RSVP Engine** | Basic+ (basic), Premium+ (advanced) | Conditional form logic, custom questions (4 types), multi-channel delivery (email/QR/SMS), tracking, notifications, GDPR consent |
| 6 | **Seating Chart Editor** | Premium+ | Canvas editor (Konva.js), 7 table types, 6 starter templates, SVG venue upload, guest avatars, history/snapshots, catering mode, QR entrance (Elite), PDF/PNG/XLS export |
| 7 | **Website Builder** | Basic+ | Block-based drag-drop builder, 16 widget types, 10+ templates (event-type-specific), theme engine (CSS vars + gradients), SEO module, multilingual toggle, guestbook, auto-save |
| 8 | **Stationery Engine** | Elite | Theme-matched printable PDF assets: table number cards, place cards, food menus, physical invitations — generated via BullMQ background jobs |
| 9 | **Vendor Marketplace** | All | 13-category directory, geo search + map view, vendor profiles (gallery, calendar, reviews), inquiry system, vendor portal ($19/mo), booking request flow |
| 10 | **Vendor Access & Portal** | Vendor role | Vendor registration (multi-step), admin approval flow, vendor dashboard (profile editor, calendar, analytics, team management), 30-day free trial, plan-based feature gating |
| 11 | **Conversation System** | Vendor Business plan | Couple-vendor messaging (text + attachments), inquiry-to-conversation flow, WebSocket real-time delivery, read receipts, typing indicators, quick-reply templates, auto-reply, response time tracking, email/push notifications |
| 12 | **Billing & Payments** | All | 3-tier subscription (Basic/Premium/Elite), vendor plans ($19/mo), white-label ($120/mo), Stripe/Swish/Klarna, PDF Kvitto (Swedish VAT) |
| 13 | **Marketing Website** | Public | Landing page (hero, featured venues, top vendors), vendor directory, inspiration hub, blog, planning tools showcase |

---

## 7c. Database Design Principles

- **UUID** primary keys on all tables
- **Soft deletes** (`deleted_at`) on all user/planning data — no hard deletes
- **JSONB** for: canvas layouts (`layout_json`), website block content (`content_json`), RSVP custom answers, dietary data, multilingual content (`{ "sv": "...", "en": "...", "ar": "..." }`)
- **Foreign key** integrity: `project_id` (not just wedding_id — multi-event support) on nearly every table
- **Key indexes:** `(project_id, rsvp_status)`, `(project_id, category)`, `(floor_plan_id, version)`, vendor `location_point` (PostGIS)

### Core Tables

```
Users, Projects (events/weddings), Collaborators,
Guests, GuestGroups, GuestCustomColumns, RsvpResponses, RsvpCustomQuestions,
FloorPlans, FloorPlanSnapshots, Seats,
BudgetCategories, BudgetItems,
ChecklistTasks, ItineraryEvents, Notes,
WebsitePages, WebsiteBlocks, WebsiteThemes,
VendorProfiles, VendorCategories, VendorReviews, VendorInquiries,
VendorLocations, VendorAvailability, VendorTeamMembers, VendorAnalytics,
Conversations, Messages, MessageAttachments, VendorQuickReplies,
Subscriptions, Invoices, Payments,
Invitations, InvitationTemplates,
Files, Photos (post-event),
Notifications, AdBanners
```

---

## 7d. API Architecture

- **Base URL:** `/api/v1/`
- **Auth:** Bearer JWT (15min access + 7-day refresh token rotation)
- **Response format:** `{ success: bool, data: {}, error: { code, message } }`
- **Pagination:** Page-based `?page=1&limit=20` for general use; **cursor-based** for large lists (guest list, messages, vendor search)
- **Rate limiting:** RSVP endpoints = 10 submissions/IP/hour

### Key Endpoint Groups

| Namespace | Operations |
|-----------|-----------|
| `/api/v1/auth/*` | Register, login, social OAuth, refresh, password reset, logout, 2FA |
| `/api/v1/projects/*` | CRUD, summary/stats, collaborators, settings, archive/copy/delete |
| `/api/v1/projects/:id/guests/*` | CRUD, bulk CSV/XLS import, custom columns, groups, search/filter, bulk actions |
| `/api/v1/projects/:id/rsvp/*` | Form config, custom questions, submit, tracking, notifications |
| `/api/v1/projects/:id/budget/*` | Categories, items CRUD, auto-totals, charts data, export |
| `/api/v1/projects/:id/checklist/*` | Tasks CRUD, reorder, suggestions, reminders |
| `/api/v1/projects/:id/itinerary/*` | Events CRUD, reorder, templates |
| `/api/v1/projects/:id/notes/*` | Pages CRUD |
| `/api/v1/projects/:id/floorplans/*` | Layout CRUD, history/snapshots, restore, catering data |
| `/api/v1/projects/:id/sites/*` | Pages CRUD, blocks, theme, publish toggle, SEO settings |
| `/api/v1/projects/:id/files/*` | Upload, list, delete |
| `/api/v1/projects/:id/photos/*` | Post-event photo management, guest upload |
| `/api/v1/projects/:id/invitations/*` | Template selection, customize, send (email/QR), tracking |
| `/api/v1/vendors/*` | Search (geo, category, date, rating), profiles, reviews, inquiry submit |
| `/api/v1/vendor-portal/*` | Profile CRUD, analytics, portfolio, availability calendar |
| `/api/v1/billing/*` | Checkout sessions, portal URL, webhook handlers, invoices |
| `/api/v1/public/:slug/*` | Public site render, RSVP submit, seat lookup, guestbook, language switch |
| `/api/v1/admin/*` | User/vendor management, reports, ads, feature flags, templates |

### WebSocket Events (Socket.io)

`section_updated`, `theme_changed`, `widget_added`, `widget_removed`, `guest_updated`, `rsvp_received`, collaborator sync, `new_message`, `message_read`, `typing`, `conversation_updated`, `unread_count`

---

## 8. Public Marketing Website (WeddingWire-style)

The main public-facing website (before login) serves as a marketing and vendor discovery platform.

### Header Navigation

`Weddings` | `Planning Tools` | `Venues` | `Vendors` | `Forums` | `Dresses` | `Ideas` | `Registry` | `Wedding Website` | **ARE YOU A VENDOR?** (Login/Join)

### Homepage Sections

| Section | Content |
|---------|---------|
| **Hero** | Video or interactive sliders showcasing Builder, Seating Chart, Guest tools — "All-in-One" value proposition |
| **Featured Venues** | Curated venue listings from vendor directory |
| **Top Vendors** | Highest-rated vendors by category |
| **Wedding Planning Tools** | Overview of platform tools with CTAs to register |
| **Blog / Ideas / Inspiration** | Articles, real weddings, inspiration gallery |
| **Wedding Registry** | Registry feature overview |
| **Footer** | Links to all pages, vendor portal, pricing, FAQs, about, jobs, media kit, contact, legal/privacy |

### Content Pages (Phase 2+)

- **Inspiration Hub:** Blog, real weddings gallery, ideas by category
- **Forums:** Community discussions (Phase 2)
- **Dresses:** Bridal shop directory (Phase 2)

---

## 9. Frontend Architecture

### Structure

- **Dashboard App** (SPA): Desktop-first, authenticated — planning tools, editors, management
- **Public Event Sites**: Mobile-first, SSR (Next.js ISR) — guest-facing pages, mobile-app-like experience (no download)
- **Component Design**: Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)

### State Management

| Concern | Tool |
|---------|------|
| Server state | React Query (TanStack Query) — optimistic updates |
| Local state | React hooks |
| Global state | Zustand (user prefs, theme) |

### Key Frontend Implementations

1. **Website Builder** — Full-screen mode, left sidebar + live canvas, dnd-kit blocks, CSS custom properties theming, auto-save 60s, responsive preview
2. **Seating Chart Editor** — Konva.js canvas, snap-to-grid, collision detection, drag-drop guest assignment with avatars, dual layouts (ceremony/reception), catering mode toggle, 60fps with 500+ objects
3. **RSVP Form** — Conditional field rendering, custom question types, multi-channel delivery tracking
4. **Guest List** — 3 display modes (relationship/alphabetical/table), custom columns, real-time sync with RSVP & seating
5. **Budget Tracker** — Pie chart visualization, overspending alerts, auto-calculations, cost-per-head
6. **RTL Support** — CSS logical properties only (no hardcoded left/right), `dir="rtl"` dynamic, `/sv/`, `/en/`, `/ar/` routing

### Responsive Strategy

| Breakpoint | Target |
|-----------|--------|
| 375px | Mobile (iPhone 12) — mobile-first for public sites |
| 768px | Tablet (iPad) |
| 1280px | Desktop |
| 1920px | Wide desktop |

- Builder: Full-featured on desktop; read-only preview on mobile with edit prompt
- Seating chart: Desktop optimized; mobile shows list view
- Tables/dashboards: Horizontally scrollable on mobile
- Offline access for checklists/guest lists (service worker)
- Push notifications for RSVPs/deadlines

---

## 10. Stationery Engine (Printable Assets)

The stationery engine generates high-quality PDF exports that **match the event website's chosen theme** (fonts, colors, gradients). All PDF generation runs as **background jobs** via BullMQ — never blocks the API request thread.

### Printable Assets

| Asset | Description | Format | Plan Gate |
|-------|------------|--------|-----------|
| **Table Number Cards** | Numbered cards (1, 2, 3...) matching theme | PDF (300 DPI) | Elite |
| **Place Cards** | Individual guest name cards matching theme | PDF (300 DPI) | Elite |
| **Food Menus** | Per-table menus pulled from website menu widget | PDF (300 DPI) | Elite |
| **Seating Chart** | Full venue layout with guest names on seats | PDF (A1 landscape) | Elite |
| **Table List View** | Head table + numbered tables with guest names | PDF | Premium+ |
| **Guest List** | All guest fields, RSVP status, table assignment | CSV, XLS, PDF | Premium+ |
| **Physical Invitations** | High-res invitation cards from selected template | PDF (300 DPI) | Elite |

---

## 11. Internationalization & 3-Language Translation System

Ceremoney supports **3 languages** across the entire platform: **Swedish (sv)**, **English (en)**, and **Arabic (ar)**. Users can select their preferred language at any time, and all UI, content, and public event sites translate accordingly.

> **⚠️ TEST NOTE (2026-03-30):** Bengali (`bn`) has been temporarily added as a 4th language for testing the language switching mechanism. It must be **removed** before production. To remove: delete the `bn` entry from `LANGUAGES` array and `translations` object in `src/lib/i18n/language-context.tsx`.

### Current Implementation Status (Phase 0 — Lightweight Context, pre-next-intl)

A lightweight client-side language system has been implemented as a stepping stone before full `next-intl` integration:

| File | Purpose |
|------|---------|
| `src/lib/i18n/language-context.tsx` | `LanguageProvider`, `useLanguage()` hook, `LANGUAGES` constant, translation strings |
| `src/components/layout/header/components/LanguageSwitcher.tsx` | Header dropdown switcher (uses context) |
| `src/components/layout/footer-language-switcher.tsx` | Footer modal-style picker (reference-image design, grid layout) |
| `src/app/layout.tsx` | Wrapped with `<LanguageProvider>` |

**How it works now:**
- Language stored in `localStorage` key `llcpad_lang`
- `document.documentElement.lang` and `dir` updated on switch (RTL for Arabic)
- `useLanguage()` exposes `t(key, vars?)` translation function
- Footer shows modal overlay with flag grid (matching design reference)
- Header switcher uses hover dropdown

**Migration path to next-intl (Phase 2+):**
1. Install `next-intl`, configure middleware for `/sv`, `/en`, `/ar` URL prefixes
2. Move translation strings from `language-context.tsx` → `/messages/{locale}/*.json` namespaces
3. Replace `useLanguage().t()` calls with `useTranslations()` from next-intl
4. Remove `LanguageProvider` wrapper — next-intl provides its own
5. Remove Bengali test language

### Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | `next-intl` | Server & client component translations, locale routing |
| Routing | `/sv/...`, `/en/...`, `/ar/...` | URL-based locale prefix, middleware auto-detection |
| Namespace Files | `/messages/{locale}/{namespace}.json` | Organized per-module (auth, dashboard, guests, seating, builder, vendor, etc.) |
| RTL Engine | CSS logical properties + `dir="rtl"` | Arabic layout mirroring without hardcoded left/right |
| Typography | Inter (SE/EN), Cairo / IBM Plex Sans Arabic (AR) | Locale-aware font loading via `next/font` |
| Content Storage | JSONB locale pattern in PostgreSQL | User-generated content stored with locale keys |

### Language Selection Flow

1. **First Visit** — Middleware detects browser `Accept-Language` header → redirects to best-match locale (`/sv/`, `/en/`, `/ar/`)
2. **Explicit Selection** — Language switcher dropdown in header/navbar (flag icons + language name in native script: Svenska, English, العربية)
3. **Preference Saved** — Selected locale stored in:
   - `localStorage` (immediate)
   - User profile `preferredLocale` field in DB (persistent across devices)
   - Cookie `NEXT_LOCALE` (SSR hydration)
4. **Session Continuity** — On next visit, preference cookie takes priority over browser header

### Translation Scope

| Layer | What Gets Translated | How |
|-------|---------------------|-----|
| **Platform UI** | All buttons, labels, menus, forms, error messages, tooltips | Static `next-intl` namespace JSON files — developer-maintained |
| **System Content** | Email templates, SMS templates, notification text, PDF labels | Per-locale template files with `{variable}` interpolation |
| **User-Generated Content** | Event website text, invitation wording, menu descriptions | JSONB locale pattern: `{ "sv": "Välkommen", "en": "Welcome", "ar": "مرحبا" }` |
| **Vendor Profiles** | Business name, description, services, FAQs | Vendor enters translations manually per locale in vendor dashboard |
| **Public Event Sites** | All blocks/widgets on published guest websites | Duplicate-and-translate workflow (see below) |

### JSONB Locale Pattern (User Content)

All user-editable text fields that appear on public-facing pages use a JSONB locale structure:

```typescript
// Prisma schema pattern
model WebsiteBlock {
  id        String @id @default(cuid())
  type      String // "hero", "rsvp", "menu", etc.
  content   Json   // { "sv": { "title": "...", "body": "..." }, "en": { ... }, "ar": { ... } }
  locale    String @default("sv") // primary editing locale
}

// Reading content for a specific locale with fallback
function getLocalizedContent(content: JsonValue, locale: string): string {
  return content[locale] ?? content['en'] ?? content['sv'] ?? '';
}
```

### Duplicate-and-Translate Flow (Event Websites)

When a couple builds their event website:

1. **Primary Language** — Couple writes content in their chosen primary language (e.g., Swedish)
2. **Add Translation** — Click "Add Language" button → select additional language(s)
3. **Content Duplication** — System duplicates all text blocks into the new locale's JSONB key
4. **Manual Edit** — Couple edits the duplicated text to write their own translation (NOT auto-translation — personal wedding wording must be hand-written)
5. **Preview Per Locale** — Builder shows locale tab switcher to preview each language version
6. **Publish** — All locale versions publish simultaneously

### Floating Language Toggle (Published Sites)

Published guest-facing event websites show a **floating language toggle** widget:

- **Position:** Bottom-right corner (bottom-left in RTL/Arabic mode)
- **Design:** Compact pill with flag icons (🇸🇪 🇬🇧 🇸🇦), expandable on tap
- **Behavior:** Switches all page content instantly (client-side locale swap, no page reload)
- **Only shows languages** that the couple has actually translated content for
- **Remembers** guest's language preference via localStorage for return visits

### RTL Rendering Pipeline (Arabic)

| Aspect | Implementation |
|--------|---------------|
| Layout Direction | `<html dir="rtl" lang="ar">` set dynamically per locale |
| CSS Strategy | `margin-inline-start`, `padding-inline-end`, `inset-inline-start` — ZERO `margin-left`/`padding-right` |
| Flexbox/Grid | `flex-direction` auto-reverses with `dir="rtl"` — no manual overrides needed |
| Icons | Directional icons (arrows, chevrons) flip via CSS `transform: scaleX(-1)` when `[dir="rtl"]` |
| Numbers | Remain LTR (Western Arabic numerals) — wrapped in `<bdi>` or `direction: ltr` spans |
| Forms | Input alignment follows `dir`, placeholder text in Arabic font |
| Seating Chart | Canvas (Konva.js) text rendering uses locale-aware `direction` property |
| Website Builder | Block alignment respects `dir` attribute, preview switches in real-time |

### next-intl Namespace Structure

```
/messages
  /sv
    common.json        # Shared: navigation, footer, buttons, errors
    auth.json          # Login, register, forgot password
    dashboard.json     # Dashboard overview, project cards
    guests.json        # Guest list, RSVP, dietary, groups
    seating.json       # Seating chart editor labels
    builder.json       # Website builder UI
    vendor.json        # Vendor directory, profiles, inquiry
    stationery.json    # Print assets labels
    admin.json         # Admin panel
    emails.json        # Email template strings
    sms.json           # SMS template strings
  /en
    (same files)
  /ar
    (same files)
```

### Translation Workflow for Developers

1. **Add Key** — Add new key to `/messages/en/{namespace}.json` (English is the source of truth)
2. **Translate** — Add corresponding keys to `/sv/` and `/ar/` namespace files
3. **Use in Code** — `const t = useTranslations('guests'); t('addGuest')` or server-side `getTranslations('guests')`
4. **CI Check** — GitHub Actions step runs `next-intl` lint to verify all 3 locales have matching keys (no missing translations)
5. **RTL Test** — Playwright E2E runs each critical flow in `ar` locale to verify layout integrity

---

## 12. Project File Structure

```
/apps
  /web
    /app
      /(public)          # Public-facing marketing pages
        page.tsx
        layout.tsx
      /(dashboard)       # Authenticated dashboard
        /projects
        /events/[eventId]
          /guests
          /seating
          /website
      /(admin)           # Admin panel
    /api                 # API routes
    /components          # Shared components (Atomic Design)
    /hooks               # Custom React hooks
    /lib                 # Utilities, constants
    /stores              # Zustand stores
    /types               # TypeScript types
    /styles              # Global styles
    /messages            # i18n translations
      /en
        common.json, auth.json, dashboard.json, guestList.json, seating.json, builder.json
      /sv
        common.json, auth.json, ...
      /ar
        common.json, auth.json, ...
/packages
  /database              # Prisma schema, client, migrations
  /api-client            # Shared API client (tRPC + REST)
  /ui                    # Shared UI components
  /services              # Backend services
/infrastructure          # Terraform, Docker, deployment configs
```

---

## 13. Git Workflow & Conventions

### Branch Strategy

```
main           — Production releases
develop        — Integration branch
feature/*      — New features (feature/guest-import)
bugfix/*       — Bug fixes (bugfix/rsvp-validation)
hotfix/*       — Emergency production fixes
release/*      — Release preparation
```

### Commit Convention

```
feat: add guest import functionality
fix: resolve RSVP form validation bug
docs: update API documentation
style: fix seating chart button alignment
refactor: simplify guest list filtering
test: add unit tests for auth service
chore: update dependencies
```

---

## 14. Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Authentication
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://ceremoney.se"

# AWS
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="ceremoney-assets"
AWS_REGION="eu-north-1"

# Stripe
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SENDGRID_API_KEY=""
EMAIL_FROM="noreply@ceremoney.se"

# Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_MAPS_API_KEY=""
GOOGLE_ANALYTICS_ID=""

# SMS
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Monitoring
SENTRY_DSN=""
```

---

## 15. Development Phases — Implementation Tracker

> **Platform:** Built within PracticeLMS (Next.js 15, App Router, Prisma 7, NextAuth v5)
> **Approach:** Each phase follows — Codebase Analysis → Fullstack Implementation (DB + API + UI) → Checklist Verification → Cleanup
> **Theme Binding:** Landing page content bound to active theme (reset-safe). App routes use theme colors via CSS variables.

---

### Phase 0: UX/UI Design — ⏭️ SKIPPED (using reference site planning.wedding)

> Using https://planning.wedding/ as the reference design. No separate wireframe phase needed.
> Shadcn/UI components already available in the codebase — will match reference site styling.

---

### Phase 1: Core Foundation — ✅ IMPLEMENTATION DONE (2026-03-29)

**Goal:** Project creation wizard, planner dashboard shell with sidebar, basic project management

> **What already exists (reused from PracticeLMS):**
> - ✅ Auth system (NextAuth v5, login/register, roles)
> - ✅ UI components (44+ Shadcn components, DataTable, StatCard, forms)
> - ✅ Layout patterns (sidebar + header + content)
> - ✅ Theme system (colors, branding, page builder for landing page)
> - ✅ Prisma + PostgreSQL setup
> - ✅ API route patterns

#### Phase 1A: Database Schema & API

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Codebase analysis | ✅ Done | Analyzed User model, auth patterns, sidebar/layout/header patterns |
| 2 | Prisma schema — `WeddingProject` model | ✅ Done | id, title, eventDate, eventType, status, userId, coverImage, settings (Json) |
| 3 | Prisma schema — `ProjectMember` model | ✅ Done | id, projectId, userId, role (BRIDE/GROOM/PLANNER/OTHER), displayName |
| 4 | Run migration | ✅ Done | `npx prisma db push` — schema synced, client generated |
| 5 | API — `POST /api/planner/projects` | ✅ Done | Create project + assign member role |
| 6 | API — `GET /api/planner/projects` | ✅ Done | List user's projects |
| 7 | API — `GET /api/planner/projects/[id]` | ✅ Done | Get single project with members |
| 8 | API — `PUT /api/planner/projects/[id]` | ✅ Done | Update project settings |

#### Phase 1B: Project Creation Wizard

| # | Task | Status | Details |
|---|------|--------|---------|
| 9 | Landing page — "Create new wedding project" CTA | ✅ Done | Hero widget in legal theme data.json with gradient CTA button → `/planner/create` |
| 10 | `/planner/create` — Role selection page | ✅ Done | "Who are you?" — Bride / Groom / Planner / Other cards |
| 11 | Project creation logic | ✅ Done | On role select → create project via API → redirect to success page |
| 12 | Success confirmation | ✅ Done | "We created a private wedding planning space for you" → "Open your project" button |

#### Phase 1C: Planner Dashboard Shell

| # | Task | Status | Details |
|---|------|--------|---------|
| 13 | `/app/planner/layout.tsx` | ✅ Done | Root layout with SessionProvider + project layout with sidebar/header |
| 14 | Planner sidebar component | ✅ Done | Overview, Guest List, VENUES & VENDORS group, PLANNING TOOLS group, Post-Wedding, Settings |
| 15 | Project header | ✅ Done | Search bar, "My Projects" link, create new button, user avatar dropdown |
| 16 | `/planner/[id]/page.tsx` — Overview | ✅ Done | Stats cards (guests, budget, tasks, days left) + quick actions + inline title editing |
| 17 | `/planner/[id]/guests/page.tsx` — Guest List stub | ✅ Done | "Two sides / Alphabetic / Full table" view toggle with placeholder data |
| 18 | Stub pages for remaining tabs | ✅ Done | 10 pages: Ceremony, Reception, Vendors, Website, Checklist, Budget, Itinerary, Seating, Notes, Post-Wedding |
| 19 | My Projects list page | ✅ Done | `/planner` — grid view with project cards, create new, delete |

#### Phase 1D: Theme Integration & Cleanup

| # | Task | Status | Details |
|---|------|--------|---------|
| 20 | Theme color binding | ✅ Done | Purple/pink gradient branding, uses theme CSS variables |
| 21 | Landing page CTA in theme data.json | ✅ Done | Hero section added to legal theme home page (persists on theme re-activate) |
| 22 | Verify reset persistence | ✅ Done | Theme data.json has CTA; planner routes are code-level (unaffected by reset) |
| 23 | Checklist verification | ✅ Done | TypeScript clean, pages return 200, API returns 401 without auth |
| 24 | Code cleanup | ✅ Done | No unused imports, types verified, consistent patterns |

**Deliverable:** User can click "Create new wedding project" → select role → see planner dashboard with full sidebar navigation

---

#### Phase 1E: Anonymous / No-Login Mode — ✅ IMPLEMENTATION DONE (2026-03-30)

**Goal:** Allow users to create and use the planner **without signing up**, exactly like https://planning.wedding/
**Reference:** planning.wedding lets anonymous users create a project instantly — no sign-up required

**Business Logic:**
- Anonymous users get full planner access — data stored in `localStorage`
- A persistent banner warns: *"Login to save your work permanently"*
- On login, localStorage data auto-syncs to the database
- If browser data is cleared, local project is lost (expected — user warned)

**Flow:**
```
Homepage → "Create New Wedding Project"
  └─ /planner/create  (NO login required)
        └─ Select role → "Create new event project"
              └─ Creates project in localStorage as "local-{uuid}"
                    └─ Redirects to /planner/local-{uuid}
                          └─ Full planner dashboard (localStorage-backed)
                                └─ Yellow banner: "Login to save your work"
                                      └─ User logs in
                                            └─ /planner/sync?from=local-{uuid}
                                                  └─ Sync localStorage → DB
                                                        └─ Redirect to /planner/{db-id}
```

**localStorage Data Structure:**
```ts
// Key: "planner_project_{id}"
interface LocalProject {
  id: string;            // "local-{uuid}"
  title: string;
  role: string;          // BRIDE | GROOM | PLANNER | OTHER
  eventType: string;     // default "WEDDING"
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
  guests: LocalGuest[];
  budget: LocalBudgetItem[];
  checklist: LocalChecklistItem[];
  vendors: LocalVendor[];
  notes: LocalNote[];
}
// Key: "planner_projects_index" → string[] of IDs
```

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Remove `/planner` from middleware protected routes | ✅ Done | Removed from `protectedRoutes` array + `matcher` config |
| 2 | Create `src/lib/planner-storage.ts` | ✅ Done | localStorage CRUD: `createLocalProject`, `getLocalProject`, `updateLocalProject`, `deleteLocalProject`, `getAllLocalProjects` |
| 3 | Create `src/app/api/planner/sync/route.ts` | ✅ Done | POST endpoint — creates DB project from local data, returns new project id |
| 4 | Update `/planner/create` page | ✅ Done | `useSession()` check — logged in → API, anonymous → localStorage → redirect to `/planner/local-{uuid}` |
| 5 | Create `src/components/planner/anonymous-banner.tsx` | ✅ Done | Amber warning bar, dismissible, "Login to Save" CTA → `/login?callbackUrl=/planner/sync?from=local-{id}` |
| 6 | Update `/planner/[id]/layout.tsx` | ✅ Done | Detects `local-*` prefix → reads localStorage; shows `AnonymousBanner`; falls back to API for DB projects |
| 7 | Update `/planner/[id]/page.tsx` (overview) | ✅ Done | Local project: reads/writes localStorage; DB project: uses API. "Not saved" badge shown for local |
| 8 | Update `/planner` (projects list) page | ✅ Done | Merges localStorage projects + DB projects (if logged in); "Not saved" badge on local ones |
| 9 | Update `header.tsx` | ✅ Done | Anonymous: shows "Sign In" button; Authenticated: shows user dropdown |
| 10 | Create `src/app/planner/sync/page.tsx` | ✅ Done | Post-login: reads `?from=local-{id}` → calls sync API → deletes local → redirects to `/planner/{db-id}` |
| 11 | TypeScript verification | ✅ Done | `npx tsc --noEmit` — zero errors |

**Files created/modified:**

| File | Action |
|------|--------|
| `src/middleware.ts` | Modified — removed `/planner` from protectedRoutes + matcher |
| `src/lib/planner-storage.ts` | **Created** — localStorage CRUD |
| `src/app/planner/create/page.tsx` | Modified — anonymous + authenticated creation |
| `src/app/planner/[id]/layout.tsx` | Modified — local vs DB detection, AnonymousBanner |
| `src/app/planner/[id]/page.tsx` | Modified — localStorage support for local projects |
| `src/app/planner/page.tsx` | Modified — merged local + DB project list |
| `src/components/planner/header.tsx` | Modified — Sign In button for anonymous users |
| `src/components/planner/anonymous-banner.tsx` | **Created** — amber warning banner |
| `src/app/api/planner/sync/route.ts` | **Created** — sync endpoint |
| `src/app/planner/sync/page.tsx` | **Created** — post-login sync handler |

**Phase 1E Status:** ✅ IMPLEMENTATION DONE (2026-03-30)

---

**Phase 1 Status:** ✅ IMPLEMENTATION DONE (Phase 1A–D + 1E)

**Files created:**
- `prisma/schema.prisma` — Added `WeddingProject`, `ProjectMember`, `EventType`, `ProjectStatus`, `MemberRole`
- `src/lib/planner-auth.ts` — Auth helper for planner routes
- `src/app/api/planner/projects/route.ts` — GET (list) + POST (create)
- `src/app/api/planner/projects/[id]/route.ts` — GET + PUT + DELETE
- `src/app/planner/layout.tsx` — Root layout with SessionProvider
- `src/app/planner/page.tsx` — My Projects list
- `src/app/planner/create/page.tsx` — Role selection wizard (3-step flow)
- `src/app/planner/[id]/layout.tsx` — Project dashboard layout (sidebar + header)
- `src/app/planner/[id]/page.tsx` — Dashboard overview
- `src/app/planner/[id]/guests/page.tsx` — Guest list with 3 view modes
- `src/app/planner/[id]/settings/page.tsx` — Project settings form
- `src/app/planner/[id]/{ceremony,reception,vendors,website,checklist,budget,itinerary,seating,notes,post-wedding}/page.tsx` — Stub pages
- `src/components/planner/sidebar.tsx` — Planner sidebar with grouped navigation
- `src/components/planner/header.tsx` — Planner header with search + user menu
- `src/components/planner/coming-soon.tsx` — Reusable "Coming Soon" stub
- `public/themes/legal/data.json` — Added wedding hero CTA section

---

### Phase 2: Planning Tools — ✅ IMPLEMENTATION DONE (2026-03-31)

**Goal:** Core planning features — guest management, budget, checklist, itinerary
**Depends on:** Phase 1 completed

#### Phase 2A: Guest List Manager — ✅ IMPLEMENTATION DONE (2026-03-30)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Codebase analysis | ✅ Done | Reviewed Phase 1 models, planned Guest schema |
| 2 | Prisma schema — `WeddingGuest` model | ✅ Done | firstName, lastName, title, side (BRIDE/GROOM), relation, email, phone, dietary, rsvpStatus, tableNumber, notes, projectId. Applied via raw SQL (no data loss). |
| 3 | Prisma schema — enums | ✅ Done | `GuestSide`, `GuestRelation` (14 values), `RsvpStatus` created |
| 4 | API — Guest CRUD endpoints | ✅ Done | `GET+POST /api/planner/projects/[id]/guests`, `PUT+DELETE /api/planner/projects/[id]/guests/[guestId]` |
| 5 | localStorage guest helpers | ✅ Done | `getLocalGuests`, `addLocalGuest`, `updateLocalGuest`, `deleteLocalGuest` in `planner-storage.ts` for anonymous projects |
| 6 | Guest list page — 3 display modes | ✅ Done | Two sides (Bride/Groom), Alphabetic, Full table — all working |
| 7 | Add guest flow | ✅ Done | Click "Add guest" → relation dropdown → inline editable row with title dropdown (Rev./Dr./Mr./Ms. etc.) + combined name field |
| 8 | RSVP inline toggle | ✅ Done | Click RSVP badge cycles Pending → Attending → Not Attending |
| 9 | Delete guest | ✅ Done | Hover row → X button appears |
| 10 | Anonymous mode support | ✅ Done | Local projects use localStorage; DB projects use API |
| 11 | Summary bar | ✅ Done | Bride/Groom ratio + attending/pending/declined counts shown at bottom |
| 12 | TypeScript check | ✅ Done | Zero errors |
| 13 | Import CSV/XLS | ✅ Done | XLSX library parses CSV/XLS/XLSX; guest list refreshes after import |
| 14 | Export CSV/XLS/PDF | ✅ Done | Export buttons for PDF and XLS |
| 15 | Search & filter | ✅ Done | Search by name/email, filter by RSVP status (All/Attending/Pending/Declined) |

**Phase 2A UI/UX Polish — ✅ DONE (2026-03-30)**

| # | Task | Status | Details |
|---|------|--------|---------|
| 16 | Bride/Groom SVG icons | ✅ Done | Custom human-silhouette SVGs — `BrideIcon` (dress+veil+bouquet, pink-purple gradient), `GroomIcon` (suit+legs, blue-indigo gradient) in `guests/page.tsx` |
| 17 | PDF download button | ✅ Done | "Download PDF" button using dynamic `@react-pdf/renderer` import — generates A4 PDF with Bride/Groom sections + summary boxes |
| 18 | Action buttons responsive | ✅ Done | Import + Download PDF + Download XLS buttons row, responsive layout |
| 19 | "How to use the guest list" guidelines panel | ✅ Done | Slide-in right drawer `GuidelinesPanel` with 7 sections (Introduction, Views, Adding Guests, Import, Export, RSVP, Search & Filter), table of contents, backdrop overlay |
| 20 | Bug fix — add guest on authenticated projects | ✅ Done | `POST /guests` returned 400 for empty `firstName`. Fixed: removed validation, now accepts empty string → user fills in inline. `src/app/api/planner/projects/[id]/guests/route.ts` |
| 21 | i18n keys | ✅ Done | Added `guests.headingDesc` with `{guidelineLink}` placeholder, `guests.guidelineLink`, `guests.exportPdf` in all 4 languages |

#### Phase 2B: RSVP Engine — ✅ IMPLEMENTATION DONE (2026-03-30)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | DB schema — `rsvpToken`, `rsvpMessage`, `rsvpSubmittedAt` on `WeddingGuest` | ✅ Done | Added via `scripts/add-rsvp-cols.mjs` raw SQL. `rsvpToken TEXT UNIQUE`, `rsvpMessage TEXT`, `rsvpSubmittedAt TIMESTAMPTZ`. Schema updated in `prisma/schema.prisma`. |
| 2 | Conditional RSVP form | ✅ Done | Attending → shows dietary + message fields. Not Attending → message only. |
| 3 | RSVP statuses | ✅ Done | Existing `RsvpStatus` enum used: PENDING / ATTENDING / NOT_ATTENDING |
| 4 | Unique RSVP URL per guest | ✅ Done | `POST /api/planner/projects/[id]/guests/[guestId]/token` generates `randomBytes(16).toString("hex")` token, stores in DB, returns URL `/rsvp/[token]` |
| 5 | QR code generation | ✅ Done | `qrcode` package installed. `RsvpLinkModal` component generates QR PNG via `QRCode.toDataURL()`. Modal shows QR + copy link button. Accessible from guest row (hover → link icon) and full-table view. |
| 6 | Public RSVP page | ✅ Done | `src/app/rsvp/[token]/page.tsx` — no auth required, shows event name + date, attending/declining toggle, dietary + message fields, confirmation screen |
| 7 | Email notifications | ⬜ Skipped (Phase 3) | Requires Nodemailer / SendGrid setup — deferred |
| 8 | Guest list integration | ✅ Done | Link icon button on hover in all 3 views. Calls token API once, caches in state. `isLocal` guests hide the button. |

**Files created/modified (Phase 2B):**
- `scripts/add-rsvp-cols.mjs` — raw SQL to add RSVP columns
- `prisma/schema.prisma` — `rsvpToken`, `rsvpMessage`, `rsvpSubmittedAt` added to `WeddingGuest`
- `src/app/api/rsvp/[token]/route.ts` — public GET (fetch guest info) + POST (submit RSVP)
- `src/app/api/planner/projects/[id]/guests/[guestId]/token/route.ts` — generate/get RSVP token
- `src/app/rsvp/[token]/page.tsx` — public RSVP form page
- `src/app/planner/[id]/guests/page.tsx` — `RsvpLinkModal`, `handleShareRsvp`, link icon in rows

#### Phase 2C: Budget Tracker — ✅ IMPLEMENTATION DONE (2026-03-31)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Prisma schema — `BudgetCategory`, `BudgetItem` | ✅ Done | `BudgetCategory` (name, planned, color, order), `BudgetItem` (description, planned, actual, paid, status, notes), `BudgetPaymentStatus` enum. Applied via raw SQL. |
| 2 | API routes | ✅ Done | `GET+POST /api/planner/projects/[id]/budget`, `PUT+DELETE /budget/[categoryId]`, `POST+PUT+DELETE /budget/[categoryId]/items/[itemId]` |
| 3 | localStorage helpers | ✅ Done | Full CRUD for categories and items in `planner-storage.ts` |
| 4 | Budget page UI | ✅ Done | Categories collapsible, chevron on left, colored dot, category name click-to-edit, trash only in header |
| 5 | Inline actual cost editing | ✅ Done | Each item row has a borderless `<input>` for actual cost — always editable, auto-saves on blur/Enter. Zero values shown in gray. Category total + global totals update live as you type. |
| 6 | UI redesign — match reference | ✅ Done | Redesigned to match planning.wedding reference: flat list style, Title \| Actual cost columns, category totals at bottom of each category, color dot + chevron header. |
| 7 | Responsive totals bar | ✅ Done | 4-card totals (Total Budget, Spent, Paid, Remaining) — 2×2 on mobile, 4 cols on desktop. Auto-calculation on add/remove. |
| 8 | Bottom summary + PDF | ✅ Done | Bottom section shows 4 totals + "Download PDF file" button. PDF generated via `@react-pdf/renderer`. PDF fixed (2026-04-01): was using `item.actual` (always 0); changed to `item.planned`. Added full summary section (Budget / Spent / Paid / Remaining) to PDF. |
| 9 | Auto-load default categories | ✅ Done | Removed manual "Load default categories" button — 12 default categories (Venue, Catering, Photography, etc.) auto-seeded on first visit via `autoSeededRef`. |
| 10 | Per-item paid checkbox | ✅ Done (2026-04-01) | Checkbox per item row: checked → `paid = planned` (item turns green + strikethrough on title); unchecked → `paid = 0`. Saves to DB (`PUT /budget/[catId]/items/[itemId]`) or localStorage. Reloads budget after save. Fixed bug: `catId` variable was undefined inside `.map()` — changed to `cat.id`. |
| 11 | Pie chart / Overspending alerts | ⬜ Pending | Polish items — future phase |

#### Phase 2D: Checklist, Itinerary & Notes — ✅ IMPLEMENTATION DONE (2026-03-30, updated 2026-03-31)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Prisma schema — `ChecklistTask`, `ItineraryEvent`, `ProjectNote` | ✅ Done | All 3 models added, applied via raw SQL |
| 2 | Prisma schema — checklist subtasks | ✅ Done | Added `description TEXT` and `subtasks JSONB DEFAULT '[]'` to `ChecklistTask` via ALTER TABLE |
| 3 | API routes | ✅ Done | Full CRUD for checklist, itinerary, and notes — `GET+POST /checklist`, `PUT+DELETE /checklist/[taskId]`, same pattern for itinerary and notes |
| 4 | API routes — subtasks | ✅ Done | PUT `/checklist/[taskId]` now supports partial updates: `title`, `completed`, `dueMonths`, `category`, `description`, `subtasks` |
| 5 | localStorage helpers | ✅ Done | `SubTask` interface + `description`/`subtasks` fields added to `LocalChecklistTask`; all CRUD helpers updated |
| 6 | 3-month checklist — redesign | ✅ Done | Replaced 12-month list with 5-group 3-month countdown (3mo → 2mo → 1mo → 1 week → Wedding Day). 18 tasks total. Reset-to-defaults button added. `dueMonths: 0.25` for 1-week group. |
| 7 | Task management | ✅ Done | Per-group "+ Add task", inline form, error feedback visible (no silent swallowing), optimistic toggle with revert |
| 8 | Subtask management | ✅ Done | Per-task expand → description + subtasks list; toggle subtask (strikethrough), add sub-task inline, delete subtask |
| 9 | Month labels | ✅ Done | Groups show actual calendar month (e.g. "March 2026") if wedding date is set; falls back to "X months before" |
| 10 | Progress bar | ✅ Done | Counts individual subtask completions (not just top-level tasks); shows X of Y + % |
| 11 | Event itinerary page (initial) | ✅ Done | Timeline view with start/end times, categories (Ceremony/Reception/etc.), location, description |
| 11a | Itinerary full redesign — match reference | ✅ Done | Complete rewrite to match planning.wedding reference. Lavender `bg-[#ebe8f1]` background. Two-column layout (time+icon left 45% | title right). Dotted center vertical line with circle markers. "The Big Day" section heading. 24h toggle. 20 default events auto-seeded on first visit. |
| 11b | Itinerary inline editing — all fields | ✅ Done | Every field individually editable in-place: icon (click → 36-icon SVG picker modal), time HH:MM (click → text input, preserves duration), am/pm (click → toggles ±12h preserving duration), title (click → text input), duration X min (click → number input). ⋮ menu on hover → "Delete event". + Add event button at bottom. `patchEvent(ev, patch)` helper for localStorage + API. |
| 11c | Itinerary auto-seed default events | ✅ Done | Removed manual seed button. `autoSeededRef` pattern auto-seeds 20 default wedding day events on first visit when list is empty. |
| 12 | Notes page | ✅ Done | Two-panel layout — note list sidebar + full editor; auto-save on type; create/delete notes; Download PDF button in toolbar (generates A4 PDF with title + date + content via `@react-pdf/renderer`) |
| 13 | Checklist PDF export | ✅ Done | "Download PDF file" button at bottom → `window.print()`. Clean print-only layout (hides all nav/sidebar via `visibility:hidden`). `@page A4` margins. Multi-page support. |
| 14 | Settings link + Wedding Date display | ✅ Done | Header shows "Wedding Date: [date]" from project eventDate. ⚙ Settings link top-right. ↺ Reset defaults button (left) replaces all tasks with 3-month list. |
| 15 | Checklist auto-seed on first visit | ✅ Done | Removed manual "Load default tasks" button. `autoSeededRef` pattern auto-seeds 18 default tasks on first visit when list is empty. |
| 16 | Overview stats | ✅ Done | Overview page now shows real guest count, budget spent, checklist progress |
| 17 | Overview page — reference redesign | ✅ Done | Added full reference-style section below Quick Actions. Lavender `bg-[#ebe8f1]` full-bleed background. "Overview" heading + subtitle (centered). 9 collapsible sections: Couple (SVG illustration + editable bride/groom names with dashed violet underline), Event information (ceremony date+location, map icon), Guests (bride/groom side person icons + stats bar), Checklist (progress bar + total/completed/remaining counts), Budget (budget+actual amounts + pink SVG bar chart per category), Event Itinerary (time+duration+circle+title list), Ceremony, Reception, Post-Wedding. Couple names stored as `brideName`/`groomName` in `LocalProject`. |

**Files created/modified (Phase 2C+2D):**
- `prisma/schema.prisma` — 5 new models + `BudgetPaymentStatus` enum
- `src/app/api/planner/projects/[id]/budget/route.ts`
- `src/app/api/planner/projects/[id]/budget/[categoryId]/route.ts`
- `src/app/api/planner/projects/[id]/budget/[categoryId]/items/route.ts`
- `src/app/api/planner/projects/[id]/budget/[categoryId]/items/[itemId]/route.ts`
- `src/app/api/planner/projects/[id]/checklist/route.ts`
- `src/app/api/planner/projects/[id]/checklist/[taskId]/route.ts`
- `src/app/api/planner/projects/[id]/itinerary/route.ts`
- `src/app/api/planner/projects/[id]/itinerary/[eventId]/route.ts`
- `src/app/api/planner/projects/[id]/notes/route.ts`
- `src/app/api/planner/projects/[id]/notes/[noteId]/route.ts`
- `src/app/planner/[id]/budget/page.tsx`
- `src/app/planner/[id]/checklist/page.tsx`
- `src/app/planner/[id]/itinerary/page.tsx`
- `src/app/planner/[id]/notes/page.tsx`
- `src/app/planner/[id]/page.tsx` — real stats from APIs/localStorage; reference redesign with 9 collapsible sections
- `src/lib/planner-storage.ts` — budget/checklist/itinerary/notes helpers; `brideName`/`groomName` added to `LocalProject`
- `src/lib/i18n/language-context.tsx` — budget/checklist/itinerary/notes translations (4 languages)

**Files modified (Checklist redesign — 2026-03-30):**
- `prisma/schema.prisma` — `description` + `subtasks Json` added to `ChecklistTask`
- `src/app/api/planner/projects/[id]/checklist/route.ts` — seed key fix + `description`/`subtasks` in create
- `src/app/api/planner/projects/[id]/checklist/[taskId]/route.ts` — partial update with all fields
- `src/app/planner/[id]/checklist/page.tsx` — full redesign with subtasks, month labels, error feedback
- `src/lib/planner-storage.ts` — `SubTask` interface, `description`/`subtasks` in `LocalChecklistTask`

**Deliverable:** Full planning dashboard — guest list, budget, checklist (with subtasks), itinerary, notes

---

#### Phase 2D Enhancement III: Dynamic Checklist Seeding Based on Ceremony Date — ✅ IMPLEMENTATION DONE (2026-04-03)

**Goal:** Checklist auto-seed only seeds task groups still in the future relative to today vs ceremony date.

**Logic:**
```
daysLeft > 90  → all groups (3mo + 2mo + 1mo + 1w + Wedding Day)
daysLeft 60–90 → 2mo + 1mo + 1w + Wedding Day
daysLeft 30–60 → 1mo + 1w + Wedding Day
daysLeft  7–30 → 1w + Wedding Day
daysLeft  < 7  → Wedding Day only
```

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | `daysLeft` derived value in `ChecklistPage` | ✅ Done | `Math.max(0, Math.ceil((new Date(eventDate).getTime() - Date.now()) / 86400000))` |
| 2 | `filterTasksByDaysLeft()` helper | ✅ Done | Module-level generic function, 5-threshold logic, reused by auto-seed + reset |
| 3 | `handleSeed()` — filtered tasks | ✅ Done | Both localStorage + API modes send only relevant tasks |
| 4 | API server-side filter | ✅ Done | `POST /api/.../checklist` filters `seedTasks` using `project.eventDate` before `createMany` |
| 5 | Reset defaults respects date | ✅ Done | `handleSeed(true)` also applies filter — stale past groups not re-added |
| 6 | Overdue badge | ✅ Done | Red "Overdue" pill on group header when `daysLeft < dueMonths * 30 - 2` |
| 7 | Auto-collapse past groups | ✅ Done | `collapsedGroups` state + `groupsInitializedRef` — overdue groups collapsed by default |
| 8 | TypeScript | ✅ Done | `npx tsc --noEmit` zero errors |

**Files modified:**
- `src/app/planner/[id]/checklist/page.tsx`
- `src/app/api/planner/projects/[id]/checklist/route.ts`

---

#### Phase 2C Enhancement I: Budget PDF — "Paid" Indicator — ✅ IMPLEMENTATION DONE (2026-04-03)

**Goal:** Budget PDF shows green "Paid" text next to items marked as paid (checkbox checked).

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | `paidBadge` PDF style | ✅ Done | `{ fontSize: 7, fontWeight: "bold", color: "#16a34a", marginLeft: 5 }` |
| 2 | Conditional `<Text>Paid</Text>` in item row | ✅ Done | `item.paid > 0` → nested `<Text style={paidBadge}>  Paid</Text>` inside description cell |
| 3 | TypeScript | ✅ Done | Zero errors |

**Files modified:**
- `src/app/planner/[id]/budget/page.tsx`

---

### Phase 2 Progress Summary

| Sub-phase | Feature | Status |
|-----------|---------|--------|
| 2A | Guest List (CRUD, import, export, search/filter, RSVP toggle) | ✅ DONE |
| 2A Polish | Bride/Groom icons, PDF download, Guidelines panel, add-guest bug fix | ✅ DONE |
| 2B | RSVP Engine (unique URLs, QR codes, conditional form) | ✅ DONE |
| 2C | Budget Tracker (categories, items, inline actual editing, reference UI) | ✅ DONE |
| 2C Polish | Responsive totals bar (2×2→4col), bottom summary + PDF, auto-load default categories | ✅ DONE |
| 2D | Checklist (subtasks, month groups, progress, PDF), Itinerary, Notes (PDF download) | ✅ DONE |
| 2D Polish | Checklist auto-seed on first visit, Itinerary full redesign (reference UI, 36 icons, full inline editing, auto-seed) | ✅ DONE |
| 2D Polish II | Overview page reference redesign — 9 collapsible sections, couple SVG, budget bar chart, couple names editable | ✅ DONE |
| 2C Enhancement I | Budget PDF — green "Paid" indicator next to paid items | ✅ DONE |
| 2D Enhancement III | Dynamic checklist seeding — date-aware filter, overdue badge, auto-collapse past groups | ✅ DONE |

**Phase 2 Status:** ✅ IMPLEMENTATION DONE (2026-04-03) — all sub-phases + enhancements complete

---

### Phase 3: Visual Editors — 🔄 IN PROGRESS (3A ✅ · 3B ✅ · 3C ✅ · 3D ⬜)

**Goal:** Build the 3 visual editor tools
**Depends on:** Phase 2 completed

#### Phase 3A: Seating Chart Editor — ✅ IMPLEMENTATION DONE (2026-03-31)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Canvas setup (Konva.js) | ✅ Done | Zoom/pan, draggable, responsive resize |
| 2 | Table types (7 types) | ✅ Done | Round, Rectangular, Square, Oblong, Half-round, Row, Buffet |
| 3 | Dual layouts | ✅ Done | Ceremony ⛪ + Reception 🥂 layout tabs, full CRUD |
| 4 | Starter templates (6) | ⬜ Deferred | Future enhancement |
| 5 | Guest assignment | ✅ Done | Search modal, bride/groom indicators, RSVP status |
| 6 | Guest avatars | ✅ Done | Colored dots (rose=bride, blue=groom) per occupied seat |
| 7 | History/snapshots | ⬜ Deferred | Future enhancement |
| 8 | Catering mode | ⬜ Deferred | Future enhancement |
| 9 | Export PNG | ✅ Done | Full canvas PNG via Konva toDataURL @2x |
| 10 | Checklist & cleanup | ✅ Done | All seating flows working (local + API modes) |
| 11 | Reference UI redesign — Seating Chart & Supplies | ✅ Done | Full page redesign matching planning.wedding reference. 7 tab cards (Ceremony Layout, Reception Layout, Alphabetical Guest Atlas, Seating Cards by Table, Classic Name Cards, Table Numbers, Reception Menu). Dashed SVG curve connector from selected tab to content. Ceremony tab: live SVG diagram (arch + curved near-arch rows + 8 numbered pew rows + center aisle gradient). Reception tab: SVG diagram (9 round tables + seats + dance floor). "Click here to edit layout" → toggles canvas editor inline with ← Back button. Download PDF button, Recommendation box, gallery placeholder row. Other 5 tabs: proper SVG preview diagrams. Default tab = Reception Layout on direct sidebar click. |
| 12 | Alphabetical Guest Atlas — real data | ✅ Done (2026-04-03) | Replaced hardcoded fake data with real guest list. `buildGuestTableMap()` builds `Map<guestId, tableName>` from all seating layout `guestIds`. Sorted alphabetically by last name → first name (`localeCompare`). Grouped by first letter. 4-column CSS layout with purple bold letter headers + dotted leader lines. Table lookup: seating layout guestIds first → falls back to guest `tableNumber` field. Empty state message. Stats: "Total X guests / Seated X guests / Let's seat more guests on the layout" link. Matches planning.wedding reference design exactly. |
| 13 | Tab URL sync | ✅ Done (2026-04-03) | Tab switch updates `?tab=atlas` (etc.) via `window.history.replaceState()`. Page reload preserves selected tab. Default (Reception Layout) keeps clean URL with no param. |
| 14 | Sidebar highlight fix — "Plan venue layout" navigation | ✅ Done (2026-04-03) | When navigating from Ceremony/Reception page "Plan venue layout" CTA → seating page, sidebar now correctly keeps "Ceremony"/"Reception" highlighted (not "Seating Chart & Supplies"). Implemented via `?src=ceremony` / `?src=reception` query param passed on navigation. Sidebar `isActive()` reads param via `useSearchParams()` (requires `Suspense` boundary — split into `SidebarInner` + `PlannerSidebar` wrapper). Seating page navigates with `router.push('/planner/${id}/seating?tab=ceremony&src=ceremony')`. |
| 15 | Shared SVG venue diagrams | ✅ Done (2026-04-03) | Extracted `CeremonyDiagram` + `ReceptionDiagram` into `src/components/planner/venue-diagrams.tsx` to avoid duplication between seating page and ceremony/reception pages. |

**Files created/modified:**
- `src/app/planner/[id]/seating/page.tsx` — **Rewrote** — reference-style preview design + existing canvas editor kept as inline `editMode` toggle; 7 tabs; SVG ceremony/reception diagrams; TabConnector; LayoutPanel; `AlphabeticalAtlasPanel` (real data); `buildGuestTableMap()`; URL tab sync; `Guest` interface updated with optional `tableNumber`
- `src/components/planner/venue-diagrams.tsx` — **Created (2026-04-03)** — shared `CeremonyDiagram` + `ReceptionDiagram` SVG components
- `src/components/planner/sidebar.tsx` — **Modified (2026-04-03)** — split into `SidebarInner` (uses `useSearchParams()`) + `PlannerSidebar` (Suspense wrapper); `isActive()` reads `?src=` param to suppress seating highlight when navigating from venue pages
- `src/app/planner/[id]/ceremony/page.tsx` — **Modified (2026-04-03)** — "Plan venue layout" navigates to `/seating?tab=ceremony&src=ceremony`
- `src/app/planner/[id]/reception/page.tsx` — **Modified (2026-04-03)** — "Plan venue layout" navigates to `/seating?tab=reception&src=reception`
- `src/components/planner/seating-canvas.tsx` — Konva canvas (zoom, pan, drag, 7 table shapes) — unchanged
- `src/app/api/planner/projects/[id]/seating/route.ts` — GET/POST layouts
- `src/app/api/planner/projects/[id]/seating/[layoutId]/route.ts` — PUT/DELETE layout
- `src/app/api/planner/projects/[id]/seating/[layoutId]/tables/route.ts` — POST table
- `src/app/api/planner/projects/[id]/seating/[layoutId]/tables/[tableId]/route.ts` — PUT/DELETE table
- `src/lib/planner-storage.ts` — added LocalSeatingLayout/LocalSeatingTable helpers
- `prisma/schema.prisma` — added SeatingLayout + SeatingTable models
- `scripts/add-seating-tables.mjs` — raw SQL migration script

#### Phase 3B: Ceremony & Reception Venue Details — ✅ IMPLEMENTATION DONE (2026-03-31)

**Goal:** Replace stub pages with fully functional fullstack venue detail pages for both Ceremony and Reception tabs.

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Codebase analysis | ✅ Done | Analyzed WeddingProject model, API route patterns (notes/itinerary/budget), planner-storage.ts helpers, stub pages |
| 2 | Prisma schema — `EventVenue` model | ✅ Done | id, projectId, type (VenueType), venueName, address, city, country, date, time, capacity, description, notes, layoutNotes. Unique: [projectId, type] |
| 3 | Prisma schema — `VenueType` enum | ✅ Done | `enum VenueType { CEREMONY RECEPTION }` |
| 4 | Run migration | ✅ Done | `scripts/add-venue-details.mjs` raw SQL — VenueType enum + EventVenue table created. `npx prisma generate` regenerated client. |
| 5 | API — `GET + PUT /api/planner/projects/[id]/ceremony` | ✅ Done | Auth check, project ownership check, upsert via `projectId_type` unique key |
| 6 | API — `GET + PUT /api/planner/projects/[id]/reception` | ✅ Done | Same pattern as ceremony, `type: RECEPTION` |
| 7 | localStorage helpers | ✅ Done | `LocalVenueDetails` interface, `getLocalVenue`, `updateLocalVenue` helpers in `planner-storage.ts` |
| 8 | Ceremony page — full UI | ✅ Done | Venue name, date, time, capacity, address/city/country, description, notes, layoutNotes. Loading/saving/error/saved states. Purple theme. |
| 9 | Reception page — full UI | ✅ Done | Same form structure. Purple theme. |
| 10 | PDF download — venue summary | ✅ Done | `@react-pdf/renderer` A4 PDF on both pages with all fields. Dynamic import. |
| 11 | Photo upload — deferred | ⬜ Deferred | Requires S3/R2. Placeholder shown: "Photo upload will be available after storage is configured." |
| 12 | Anonymous mode (localStorage) support | ✅ Done | `isLocal(id)` check on both pages — local projects use `getLocalVenue`/`updateLocalVenue`, DB projects use API |
| 13 | TypeScript verification | ✅ Done | `npx tsc --noEmit` — zero errors in new files (pre-existing `use-header-config.ts` error unrelated) |
| 14 | Codebase cleanup | ✅ Done | `ComingSoon` removed from ceremony/reception. Zero `console.log`. No unused imports. |
| 15 | UI polish — icon visibility fix | ✅ Done | Removed `overflow-hidden` from all 3 info cards on both pages — was clipping absolutely-positioned Calendar/MapPin/LayoutTemplate icons. Changed icon color from near-invisible `text-gray-300 opacity-40` → `text-purple-200`. |
| 16 | Calendar icon — date picker popup | ✅ Done | Calendar icon on Date card opens floating `DatePickerPopup` (date `<input>` + Save/Cancel) instead of a time picker. `datePickerOpen` state, `e.stopPropagation()` prevents card click. Applied to both ceremony and reception pages. |
| 17 | MapPin icon — location popup | ✅ Done | MapPin icon on Location card opens floating `LocationPopup` (address/city/country inputs + Save/Cancel). `locPopupOpen` state. Clicking the card still opens inline `LocationEditInline` as before. Applied to both pages. |
| 18 | "Plan venue layout" link — tab param | ✅ Done | Ceremony page links to `/planner/${id}/seating?tab=ceremony`, reception page links to `?tab=reception` so correct tab auto-selects. |

**Checklist:**
- [x] `EventVenue` model in schema, migration applied, Prisma client regenerated
- [x] `GET /api/.../ceremony` and `GET /api/.../reception` return 200 with venue data
- [x] `PUT /api/.../ceremony` and `PUT /api/.../reception` save changes correctly
- [x] Both pages return 401 if unauthenticated (DB projects); localStorage used for local projects
- [x] UI handles: loading state, error state, empty/new project state, populated state
- [x] Calendar icon → date picker popup; MapPin icon → location popup
- [x] PDF download generates correctly with all fields
- [x] TypeScript: zero errors in new code
- [x] No `console.log` in committed code
- [x] Stub (`ComingSoon`) removed from ceremony and reception pages

**Files created/modified:**
- `prisma/schema.prisma` — added `EventVenue` model + `VenueType` enum + `eventVenues` relation on `WeddingProject`
- `scripts/add-venue-details.mjs` — **Created** — raw SQL migration
- `src/app/api/planner/projects/[id]/ceremony/route.ts` — **Created** — GET + PUT
- `src/app/api/planner/projects/[id]/reception/route.ts` — **Created** — GET + PUT
- `src/app/planner/[id]/ceremony/page.tsx` — **Replaced stub** → full venue form → polished with DatePickerPopup + LocationPopup + icon visibility fix
- `src/app/planner/[id]/reception/page.tsx` — **Replaced stub** → full venue form → polished with DatePickerPopup + LocationPopup + icon visibility fix
- `src/lib/planner-storage.ts` — added `LocalVenueDetails`, `getLocalVenue`, `updateLocalVenue`

**Phase 3B Status:** ✅ IMPLEMENTATION DONE (2026-03-31)

---

#### Phase 3C: Website Builder — ✅ IMPLEMENTATION DONE (2026-03-31, bugs fixed 2026-03-31)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Wedding-specific blocks (11 types) | ✅ Done | Cover, Hero, Our Story, Venue, Schedule, Gallery, RSVP, Registry, Wedding Party, Countdown, Guestbook — all fully editable inline |
| 2 | Wedding themes (4 presets) | ✅ Done | Modern (violet), Floral (pink/Georgia), Rustic (brown/Georgia), Minimal (dark/Inter) — each preset sets primaryColor + accentColor + fontFamily |
| 3 | Theme engine | ✅ Done | Color customization (2 color pickers), font selector (4 options), slug editor — all auto-saved on change (800ms debounce) |
| 4 | Public site rendering | ✅ Done | Server component at `/wedding/[slug]` — SSR, mobile-first, renders all 11 block types with theme colors/fonts. `generateMetadata` for SEO. Returns 404 if unpublished. `force-dynamic` prevents stale cache. |
| 5 | Sharing (link + QR) | ✅ Done | "Copy Link" button + draft/published status badge + `/wedding/[slug]` public URL shown in builder |
| 6 | Builder page UI | ✅ Done | Block list with visibility toggle, move up/down, inline settings expand, delete. "Add Block" shows 11-type grid. Full-screen preview modal. |
| 7 | localStorage + API dual mode | ✅ Done | `getLocalWebsite`/`saveLocalWebsite` for local-* projects. `PUT /api/planner/projects/[id]/website` upserts `WeddingWebsite` record for API projects. |
| 8 | Auto-fill from project data | ✅ Done | Couple names auto-filled from project; ceremony date/location auto-filled from EventVenue |
| 9 | WeddingWebsite DB table | ✅ Done | Table created in PostgreSQL via direct pg client (raw SQL). Migration file: `prisma/migrations/20260331000000_add_wedding_website/migration.sql`. Prisma schema updated at `prisma/schema.prisma`. `npx prisma generate` run. |
| 10 | Error feedback (loadError / saveError) | ✅ Done | `loadError` state shows red error UI instead of silent empty state. `saveError` shows 4-second "Save failed" banner in header. |
| 11 | Null-safety on public page blocks | ✅ Done | `Array.isArray(site.blocks)` guard + `?? []` on gallery images, registry items, wedding party people — prevents `.filter()` crash when JSONB is null. |
| 12 | Nav links in Cover block | ✅ Done | Changed from `string[]` to `{ label, href }[]`; section IDs added to all block wrappers so anchor navigation works. |
| 13 | Checklist & cleanup | ✅ Done | TypeScript clean, no errors in new files |

**Bug Fixes Applied (2026-03-31):**

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Save silently failed | `WeddingWebsite` table missing from DB | Created table via direct pg client SQL; migration file added |
| After publish → Page Not Found | `published` flag not saving (table missing) | Table now exists; `published` correctly saves to DB |
| After refresh → always shows Draft | API 500 → silent fallback to localStorage default | Table now exists; API returns correct saved data |
| `/wedding/[slug]` "Something Went Wrong" | `site.blocks` was null → `.filter()` crashed | `Array.isArray()` guard + `?? []` on all block settings |
| Gallery/Registry/People crash | `.filter()` on null settings | Added `?? []` guards on `s.images`, `s.items`, `s.people` |
| Nav links in Cover block not working | `navLinks` was `string[]` | Changed to `{ label, href }[]`, added section IDs |
| Stale published cache | No `force-dynamic` on `/wedding/[slug]` | Added `export const dynamic = "force-dynamic"` |

**Files created/modified (Phase 3C):**
- `src/lib/planner-storage.ts` — `WeddingBlock`, `LocalWeddingWebsite`, `createWebsiteBlock`, `getLocalWebsite`, `saveLocalWebsite` added
- `src/app/api/planner/projects/[id]/website/route.ts` — GET/PUT route, upserts `WeddingWebsite` with slug uniqueness check
- `src/app/planner/[id]/website/page.tsx` — complete website builder; `loadError`/`saveError` states added
- `src/app/wedding/[slug]/page.tsx` — public wedding website (server component, SSR, force-dynamic, null-safe)
- `prisma/schema.prisma` — `WeddingWebsite` model added
- `prisma/migrations/20260331000000_add_wedding_website/migration.sql` — **Created** — table creation SQL

#### Phase 3D: Invitation Designer

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Template system (10+) | ⬜ Pending | Letterpress, rustic, elegant, minimalist |
| 2 | Customization editor | ⬜ Pending | Colors, fonts, logo, live preview |
| 3 | QR code per invitation | ⬜ Pending | Unique RSVP link |
| 4 | Multi-channel delivery | ⬜ Pending | Email, SMS, shareable link |
| 5 | Tracking dashboard | ⬜ Pending | Open/response tracking |
| 6 | Export (digital + print PDF) | ⬜ Pending | 300 DPI print-ready |
| 7 | Checklist & cleanup | ⬜ Pending | Verify all invitation flows |

**Deliverable:** Ceremony/Reception venue details, seating charts, wedding websites, and invitations functional
**Phase 3 Status:** 🔄 IN PROGRESS (3A ✅ · 3B ✅ · 3C ✅ · 3D ⬜ Pending)

> **Note:** Phase 3C includes the public wedding site at `/wedding/[slug]` which was originally planned under Phase 4. It is now fully implemented and all Phase 4 item #1 is done.

---

### Phase 4: Guest Experience & Public Sites — 🔄 IN PROGRESS

**Goal:** Public-facing guest interactions + post-event features
**Depends on:** Phase 3 completed

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Public site rendering (SSR) | ✅ Done | Implemented in Phase 3C — `/wedding/[slug]` renders all 11 block types, mobile-first, force-dynamic, SEO metadata |
| 2 | Public RSVP submission | ✅ Done | `/rsvp/[token]` page — unique token per guest, conditional form, updates DB. Implemented in Phase 2B. |
| 3 | Guestbook (public) | ✅ Done (2026-04-03) | `GET/POST /api/guestbook/[websiteId]` + `GuestbookSection` client component with live submit + entries list |
| 4 | Guest photo upload | ✅ Done (2026-04-03) | `GET/POST /api/guest-photos/[websiteId]` + `GuestPhotoUpload` component — client-side resize to 800px, base64 stored in DB, photo grid + lightbox |
| 5 | QR Seat Finder | ⬜ Pending | Search by name/seat → table + map position |
| 6 | Post-event module | ✅ Done (2026-04-03) | `/planner/[id]/post-wedding` — 3 tabs (Overview/Guestbook/Photos), RSVP bar chart, guestbook download, photo grid + lightbox |
| 7 | Push notifications | ⬜ Pending | RSVP received, deadline reminders |
| 8 | Checklist & cleanup | ⬜ Pending | Verify all public flows |

**Deliverable:** Guests can visit websites, RSVP, upload photos, find seats; post-event archive works
**Phase 4 Status:** 🔄 IN PROGRESS (items 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 6 ✅ done · items 5 · 7 · 8 ⬜ pending)

**Files created/modified (Phase 4 #3, #4, #6 — 2026-04-03):**
- `src/app/api/guestbook/[websiteId]/route.ts` — NEW: `GET` (list entries, public) + `POST` (submit message, validates name ≤100 / message ≤1000)
- `src/components/wedding/GuestbookSection.tsx` — NEW: client component, form + live entry list, fetches on mount, POST on submit
- `src/app/api/guest-photos/[websiteId]/route.ts` — NEW: `GET` (list photos) + `POST` (validates base64 data URI, max 1.5MB, stores in DB)
- `src/components/wedding/GuestPhotoUpload.tsx` — NEW: file picker, Canvas-based resize to max 800px at 0.8 JPEG quality, preview, photo grid + lightbox
- `src/app/wedding/[slug]/page.tsx` — updated: Prisma query includes `guestbookEntries` + `guestPhotos`; guestbook case renders `GuestbookSection`; `GuestPhotoUpload` always shown before footer
- `src/app/api/planner/projects/[id]/post-wedding/route.ts` — NEW: `GET` returns website info + all guestbook entries + guest photos + RSVP counts (attending/notAttending/noReply)
- `src/app/planner/[id]/post-wedding/page.tsx` — REWRITTEN: 3-tab layout (Overview with stat cards + RSVP bar chart, Guestbook with .txt export, Photos with lightbox)

**Build fixes (2026-04-03):**
- `next.config.ts` — added `experimental: { cpus: 1 }` to prevent OOM during production build
- `src/app/api/planner/projects/[id]/post-wedding/route.ts` — removed `MAYBE` rsvpStatus (not in `RsvpStatus` enum)
- `src/app/planner/[id]/post-wedding/page.tsx` — removed `maybe` from rsvpCounts type + RsvpBar
- `src/app/planner/sync/page.tsx` — wrapped `useSearchParams()` in `<Suspense>` boundary (required by Next.js 15)

---

### Phase 5: Marketplace, Messaging & Payments — 🔄 IN PROGRESS

**Goal:** Revenue-generating features, vendor ecosystem, couple-vendor communication
**Depends on:** Phase 4 completed

#### Phase 5A: Vendor Marketplace

> **Note:** Vendors tab = **2 separate concerns**:
> - **Part 0 — Couple's personal vendor list** (inside `/planner/[id]/vendors`): Add custom vendor, import CSV/XLS, copy invite link, show/hide suggested vendors. Simple CRUD — can be done BEFORE Phase 5 without marketplace infrastructure.
> - **Part 1 — Public vendor directory/marketplace**: Geo-search, map view, full vendor profiles, inquiry system. This is the full Phase 5A below.

##### Phase 5A-0: Couple's Vendor List — project dashboard tab (`/planner/[id]/vendors`) — ✅ IMPLEMENTATION DONE (2026-04-01)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | `WeddingVendor` DB model | ✅ Done | `prisma/schema.prisma` — id, projectId, name, category (VendorCategory enum 13 values), email, phone, website, notes. Table created via raw SQL. `npx prisma generate` run. |
| 2 | API — CRUD `/api/planner/projects/[id]/vendors` | ✅ Done | GET (list) + POST (create) in `route.ts`. PUT + DELETE in `[vendorId]/route.ts`. Auth + project ownership checks on all routes. |
| 3 | localStorage helpers | ✅ Done | `VendorCategory` type, `VENDOR_CATEGORY_LABELS`, `LocalVendor` interface, `getLocalVendors`, `addLocalVendor`, `updateLocalVendor`, `deleteLocalVendor` added to `planner-storage.ts` |
| 4 | Vendor list page UI | ✅ Done | Full redesign (2026-04-01): horizontal scroll row (public approved vendors as full-bleed gradient cards + "Search and Add Vendors" dashed CTA card) + private vendor grid below (couple's own vendors with contact info). |
| 5 | Add custom vendor | ✅ Done | Modal with form — name (required), category dropdown (13), phone, email, website, notes. Validation + saving state + error display. |
| 6 | Import from CSV/XLS | ✅ Done | `<input type="file">` with XLSX library, parses Name/Category/Email/Phone/Website/Notes columns. Template download for XLS and CSV. |
| 7 | Copy invite link for supplier | ✅ Done | Copies `{origin}/invite/vendor?project={id}` to clipboard |
| 8 | Search + Category filter | ✅ Removed | Search bar removed — replaced by "Search and Add Vendors" CTA card linking to `/vendors`. |
| 9 | Show/hide suggested vendors toggle | ✅ Done (2026-04-01) | Toggle implemented in Info section below vendor grid. Public vendors fetched from `/api/vendors?page=1` (isApproved + isActive). Always shows first 4 vendors + 1 "Search and Add Vendors" card. `CATEGORY_GRADIENTS` map per category. Card design: full-bleed `w-48 h-56` rounded card, dark overlay gradient, category badge top-left, vendor name overlaid at bottom. Header "All Vendors" centered. Trailing spacer div fixes right border clip on last card. |
| 10 | Download PDF | ✅ Done (2026-04-01) | "Download PDF file" button at bottom — generates PDF of all private vendors via `@react-pdf/renderer`. |
| 11 | Vendor cover photo upload | ✅ Done (2026-04-01) | `/vendor/profile` → Photos section: URL input + "Upload from device" (FileReader → base64) + thumbnail preview + Remove button. First photo = cover image shown in planner vendor cards. Admin `/admin/vendors` add/edit modal: same Cover Photo field with URL input + "Upload from device" + Remove. `photos[]` saved to DB via PUT `/api/admin/vendors/[id]`. |

**Files created/modified (Phase 5A-0):**
- `prisma/schema.prisma` — `WeddingVendor` model + `VendorCategory` enum + relation on `WeddingProject`
- `src/lib/planner-storage.ts` — `VendorCategory`, `VENDOR_CATEGORY_LABELS`, `LocalVendor`, 4 CRUD helpers
- `src/app/api/planner/projects/[id]/vendors/route.ts` — **Created** — GET + POST
- `src/app/api/planner/projects/[id]/vendors/[vendorId]/route.ts` — **Created** — PUT + DELETE
- `src/app/planner/[id]/vendors/page.tsx` — **Replaced stub** — full vendor management UI

##### Phase 5A-1: Public Vendor Directory & Marketplace — ✅ IMPLEMENTATION DONE (2026-04-01)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Vendor directory (13 categories) | ✅ Done | `/vendors` page — category pill filters, search (name/city), paginated grid |
| 2 | Map + list view | ⬜ Deferred | Deferred — requires Google Maps API key setup |
| 3 | Vendor profiles | ✅ Done | `/vendors/[slug]` — photo gallery, ratings, reviews, contact links |
| 4 | Inquiry system | ✅ Done | "Request Pricing" form → `POST /api/vendors/[slug]/inquiries` → DB |
| 5 | Booking request flow | ✅ Done | 7-field form: name, email, phone, event type, date, budget, message |
| 6 | Admin vendor management | ✅ Done | `GET/POST /api/admin/vendors` + `PUT/DELETE /api/admin/vendors/[id]`. Button renamed "View All Vendors" (was "View Public Directory"). Admin sidebar nav renamed "View All Vendors" (was "View Directory"). |
| 7 | Vendor plans ($19/mo) | ⬜ Deferred | Deferred to Phase 5C (billing & plan gating) |

**Files created (Phase 5A-1):**
- `prisma/schema.prisma` — Added `VendorProfile`, `VendorInquiry`, `VendorReview` models + `InquiryStatus` enum + `VENDOR` role in `UserRole`
- `scripts/add-vendor-marketplace.mjs` — SQL migration script (tables created)
- `src/app/api/vendors/route.ts` — `GET /api/vendors` (list with filters, pagination, avg rating)
- `src/app/api/vendors/[slug]/route.ts` — `GET /api/vendors/[slug]` (profile with reviews)
- `src/app/api/vendors/[slug]/inquiries/route.ts` — `POST /api/vendors/[slug]/inquiries`
- `src/app/api/admin/vendors/route.ts` — `GET/POST /api/admin/vendors`
- `src/app/api/admin/vendors/[id]/route.ts` — `PUT/DELETE /api/admin/vendors/[id]`
- `src/app/vendors/page.tsx` — Public directory listing (hero search, category filter pills, vendor card grid, pagination, CTA)
- `src/app/vendors/[slug]/page.tsx` — Vendor profile page (photo gallery, reviews, sticky inquiry sidebar form)
- `src/components/planner/header.tsx` — Search input replaced with "Find vendor or venue" → `/vendors` link
- `src/app/planner/[id]/vendors/page.tsx` — Added "Search and Add Vendors" dashed card linking to `/vendors`
- `src/components/admin/sidebar.tsx` — Added "Vendor Marketplace" → `/vendors` under Wedding Projects section

#### Phase 5B: Vendor Access & Onboarding System ✅ DONE

**Status:** Completed 2026-04-01

**Implemented Files:**
- `prisma/schema.prisma` — Added `VENDOR` to UserRole enum, `VendorStatus` enum, `userId` + `status` fields on VendorProfile, linked User → VendorProfile relation
- `scripts/add-vendor-status.mjs` — SQL migration: VendorStatus enum, userId column, status column on VendorProfile
- `src/middleware.ts` — Protect `/vendor/*` routes (VENDOR role only), `/vendor/register` is public, VENDOR users redirected to `/vendor/dashboard` on login
- `src/app/api/vendor/register/route.ts` — `POST /api/vendor/register` — creates User (VENDOR) + VendorProfile (PENDING) in a transaction, bcrypt password, 30-day trial
- `src/app/api/vendor/profile/route.ts` — `GET/PUT /api/vendor/profile` — vendor edits own profile
- `src/app/api/vendor/stats/route.ts` — `GET /api/vendor/stats` — inquiry count, new count, review count, avg rating
- `src/app/api/vendor/inquiries/route.ts` — `GET /api/vendor/inquiries` — paginated, filter by status
- `src/app/api/vendor/inquiries/[id]/route.ts` — `PUT /api/vendor/inquiries/[id]` — update status
- `src/app/api/admin/vendors/route.ts` — `GET/POST /api/admin/vendors` — admin list + create vendor profiles; GET now includes `user { email, phone, name }` relation so edit modal can show registration email/phone
- `src/app/api/admin/vendors/[id]/route.ts` — `PUT/DELETE` — admin edit/approve/delete vendor profiles (now includes `status` field)
- `src/app/admin/vendors/page.tsx` — Admin vendor management UI: stats cards, searchable table, approve/suspend buttons, add/edit modal; fixed edit modal pre-fill bug (`tagline`, `description`, `website`, `email`, `phone` now populated — email/phone fallback to `user.email/phone` if VendorProfile fields are empty)
- `src/app/vendor/register/page.tsx` — 3-step vendor registration form (Account → Business → Done)
- `src/app/vendor/layout.tsx` — Vendor portal sidebar layout with nav (Dashboard, Profile, Inquiries, Reviews, Settings)
- `src/app/vendor/dashboard/page.tsx` — Stats overview + recent inquiries + quick action cards; fixed stats bug (`data.stats` wrapper was missing — now reads `data.stats ?? data`)
- `src/app/vendor/profile/page.tsx` — Full profile editor (business info, category grid, location, contact, pricing, availability)
- `src/app/vendor/inquiries/page.tsx` — Inquiry list with status filter, expand/collapse, email reply, status update buttons
- `src/app/vendor/reviews/page.tsx` — Reviews list with rating distribution breakdown
- `src/app/vendor/settings/page.tsx` — Account settings (name, email display)
- `src/app/planner/create/page.tsx` — Added "Register as a Vendor" link → `/vendor/register` below "Go to My projects list"
- `src/lib/auth.ts` — Added `redirect` callback so NextAuth correctly follows `callbackUrl` after login
- `src/app/vendor/register/page.tsx` — "Sign in to your account" + "Already have an account? Sign in" both use `/login?callbackUrl=/vendor/dashboard` so vendors land on vendor dashboard after login

##### How Vendors Access the Platform

```
┌───────────────────────────────────────────────────────────────────┐
│                    VENDOR ACCESS FLOW                             │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. DISCOVERY                                                     │
│     ├── "Are You a Vendor?" CTA (main nav + footer)              │
│     ├── /business landing page (explains benefits)                │
│     └── Organic search / referral / admin invitation              │
│                                                                   │
│  2. REGISTRATION (/signup-business)                               │
│     ├── Step 1: Account creation (email, password, phone)         │
│     ├── Step 2: Business details                                  │
│     │   ├── Business name, Org.nr (Sweden), VAT number            │
│     │   ├── Primary category (Photographer, Florist, DJ, etc.)    │
│     │   ├── Secondary categories (optional)                       │
│     │   ├── Headquarters address + service radius (km)            │
│     │   ├── Branch locations (optional, multiple)                 │
│     │   ├── Website URL, social media links                       │
│     │   └── Years in business, team size, languages spoken        │
│     ├── Step 3: Portfolio upload                                  │
│     │   ├── Min 5 high-res photos (auto-compressed, quality kept) │
│     │   ├── Optional: YouTube/Vimeo video links                   │
│     │   └── Description / About section                           │
│     └── Step 4: Pricing & availability                            │
│         ├── Price list (downloadable PDF or itemized list)        │
│         ├── Starting price range (shown in search results)        │
│         └── Availability calendar setup                           │
│                                                                   │
│  3. VERIFICATION (Admin Review)                                   │
│     ├── Admin dashboard queue: new vendor applications            │
│     ├── Review: business legitimacy, photo quality, completeness  │
│     ├── Actions: Approve / Reject / Request More Info             │
│     ├── Auto-approve option for vendors with verified Org.nr      │
│     └── Email notification on status change                       │
│                                                                   │
│  4. ACTIVATION                                                    │
│     ├── 30-day FREE TRIAL starts (all paid features unlocked)     │
│     ├── Profile visible in directory immediately after approval   │
│     ├── Vendor Dashboard access granted                           │
│     └── Onboarding checklist shown (complete profile, add FAQ,    │
│         set availability, respond to first inquiry)               │
│                                                                   │
│  5. ONGOING ACCESS (Vendor Dashboard at /vendor)                  │
│     ├── Profile management (edit business info, photos, videos)   │
│     ├── Inbox / Messages (conversations with couples)             │
│     ├── Inquiry management (new leads, responded, archived)       │
│     ├── Availability calendar (block dates, mark booked)          │
│     ├── Reviews management (view, respond, dispute)               │
│     ├── Analytics (profile views, search appearances, inquiries)  │
│     ├── Subscription & billing management                         │
│     └── Notification settings (email, push, SMS preferences)      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

##### Vendor Dashboard Pages

| Page | Features |
|------|----------|
| **Dashboard Home** | Stats overview: profile views (30d), search appearances, inquiries received, review score, response rate, response time average |
| **Profile Editor** | Edit all business info, reorder photos, add/remove videos, update pricing, manage FAQ, preview as couple sees it |
| **Inbox** | All conversations with couples, unread count badge, quick reply, attachment support (quotes, contracts) |
| **Inquiries** | New inquiry notifications, inquiry details (event type, date, budget, message), accept/decline/respond actions, convert to conversation |
| **Calendar** | Monthly view, mark dates as available/booked/tentative, sync with Google Calendar (Phase 2), date ranges for recurring blocks |
| **Reviews** | All reviews with ratings breakdown, reply to reviews (public), dispute button → admin moderation, share review collection link |
| **Analytics** | Charts: profile views over time, search ranking position, inquiry conversion rate, top search terms that found you, geographic reach |
| **Billing** | Current plan, payment history, update payment method, cancel/upgrade, download invoices |
| **Settings** | Notification preferences, team member access (add staff accounts), business hours, auto-reply message, account deletion |

##### Vendor Database Schema (Additional Tables)

```sql
-- Vendor-specific tables (in addition to core VendorProfiles)

VendorLocations {
  id            UUID PK
  vendor_id     UUID FK → VendorProfiles
  type          ENUM('headquarters', 'branch')
  address       TEXT
  city          VARCHAR
  state         VARCHAR
  country       VARCHAR
  lat           DECIMAL(10,8)
  lng           DECIMAL(11,8)
  service_radius_km  INT
  created_at    TIMESTAMP
}

VendorAvailability {
  id            UUID PK
  vendor_id     UUID FK → VendorProfiles
  date          DATE
  status        ENUM('available', 'booked', 'tentative', 'blocked')
  note          TEXT?
  booking_ref   UUID? FK → VendorInquiries  -- if booked via platform
}

VendorTeamMembers {
  id            UUID PK
  vendor_id     UUID FK → VendorProfiles
  user_id       UUID FK → Users
  role          ENUM('owner', 'manager', 'staff')
  permissions   JSONB  -- { canReply: true, canEditProfile: false, ... }
  invited_at    TIMESTAMP
  accepted_at   TIMESTAMP?
}

VendorAnalytics {
  id            UUID PK
  vendor_id     UUID FK → VendorProfiles
  date          DATE
  profile_views INT DEFAULT 0
  search_appearances INT DEFAULT 0
  inquiry_count INT DEFAULT 0
  message_count INT DEFAULT 0
  -- aggregated daily, queried for charts
}
```

##### Vendor API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/vendor-portal/register` | POST | Vendor registration (multi-step form) |
| `/api/v1/vendor-portal/profile` | GET/PUT | Get/update own vendor profile |
| `/api/v1/vendor-portal/profile/preview` | GET | Preview profile as couples see it |
| `/api/v1/vendor-portal/photos` | POST/DELETE | Upload/remove portfolio photos |
| `/api/v1/vendor-portal/videos` | POST/DELETE | Add/remove video links |
| `/api/v1/vendor-portal/locations` | CRUD | Manage business locations |
| `/api/v1/vendor-portal/availability` | GET/PUT | Manage availability calendar |
| `/api/v1/vendor-portal/availability/bulk` | PUT | Bulk update date ranges |
| `/api/v1/vendor-portal/inquiries` | GET | List all inquiries (filterable) |
| `/api/v1/vendor-portal/inquiries/:id` | GET/PUT | View/respond to inquiry |
| `/api/v1/vendor-portal/reviews` | GET | List all reviews |
| `/api/v1/vendor-portal/reviews/:id/reply` | POST | Reply to a review |
| `/api/v1/vendor-portal/reviews/:id/dispute` | POST | Dispute a review → admin queue |
| `/api/v1/vendor-portal/analytics` | GET | Dashboard analytics data |
| `/api/v1/vendor-portal/analytics/export` | GET | Export analytics CSV |
| `/api/v1/vendor-portal/team` | CRUD | Manage team members |
| `/api/v1/vendor-portal/settings` | GET/PUT | Notification & account settings |
| `/api/v1/vendor-portal/billing` | GET | Subscription & invoice info |

#### Phase 5C: Plan-Based Vendor Access & Feature Gating — ✅ IMPLEMENTATION DONE (2026-04-03)

##### How Plans Control Vendor Access

```
┌──────────────────────────────────────────────────────────────────┐
│              VENDOR PLAN FEATURE MATRIX                           │
├──────────────────┬──────────────────┬────────────────────────────┤
│    Feature       │  Free (No Plan)  │  Business ($19/mo)         │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Profile in       │  ❌ Not listed    │  ✅ Listed in search       │
│ directory search │                  │     + Google indexed        │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Profile page     │  ❌ No public    │  ✅ Full business page     │
│                  │     page         │     with custom URL slug    │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Portfolio photos │  ❌              │  ✅ Unlimited high-res      │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Video showcase   │  ❌              │  ✅ YouTube/Vimeo embeds    │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Receive          │  ❌              │  ✅ Direct inquiries        │
│ inquiries        │                  │     from couples            │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Messaging        │  ❌              │  ✅ Full conversation       │
│                  │                  │     system with couples     │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Reviews          │  ❌              │  ✅ Collect & display       │
│                  │                  │     reviews + share link    │
├──────────────────┼──────────────────┼────────────────────────────┤
│ SEO backlink     │  ❌              │  ✅ Dofollow link to        │
│                  │                  │     vendor website          │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Analytics        │  ❌              │  ✅ Profile views, search   │
│                  │                  │     stats, inquiry metrics  │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Smart search     │  ❌              │  ✅ Appear in category +    │
│ placement        │                  │     geo-based results       │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Availability     │  ❌              │  ✅ Public calendar on      │
│ calendar         │                  │     profile                 │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Team members     │  ❌              │  ✅ Add staff accounts      │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Free trial       │  N/A             │  30 days (all features)     │
├──────────────────┼──────────────────┼────────────────────────────┤
│ Added to wedding │  ✅ Couples can  │  ✅ + vendor gets notified  │
│ projects         │  add as "custom  │     when added to project   │
│                  │  vendor" manually│                             │
└──────────────────┴──────────────────┴────────────────────────────┘
```

##### Plan Lifecycle & Vendor Access Flow

```
VENDOR SIGNS UP
      │
      ▼
┌─────────────┐     Admin approves      ┌──────────────────┐
│  PENDING     │ ──────────────────────► │  APPROVED        │
│  (No access) │                         │  (Dashboard only)│
└─────────────┘                          └────────┬─────────┘
                                                  │
                                         Starts free trial
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │  TRIAL (30 days) │
                                         │  ALL features    │
                                         │  unlocked        │
                                         └────────┬─────────┘
                                                  │
                                    ┌─────────────┴──────────────┐
                                    │                            │
                              Subscribes                   Trial expires
                                    │                            │
                                    ▼                            ▼
                           ┌────────────────┐        ┌───────────────────┐
                           │  ACTIVE ($19/m)│        │  EXPIRED          │
                           │  Full access   │        │  Profile hidden   │
                           │  Listed in     │        │  Dashboard access │
                           │  directory     │        │  only (read-only) │
                           └────────┬───────┘        │  Data preserved   │
                                    │                │  "Reactivate" CTA │
                              Cancels/fails          └───────────────────┘
                                    │
                                    ▼
                           ┌────────────────┐
                           │  GRACE PERIOD  │
                           │  (7 days)      │
                           │  Profile stays │
                           │  visible       │
                           │  "Renew" email │
                           └────────┬───────┘
                                    │
                              Doesn't renew
                                    │
                                    ▼
                           ┌────────────────┐
                           │  SUSPENDED     │
                           │  Profile hidden│
                           │  Conversations │
                           │  preserved     │
                           │  Can reactivate│
                           │  anytime       │
                           └────────────────┘
```

##### Feature Gating Implementation

```typescript
// Feature gating happens at 3 layers:

// 1. API Layer (Express middleware)
router.get('/inquiries',
  requireAuth,
  requirePlan('business'),  // custom middleware
  async (req, res) => { /* ... */ }
);

// 2. Frontend Layer (React component)
<PlanGate plan="business" fallback={<UpgradeCTA />}>
  <InquiryList />
</PlanGate>

// 3. Database Layer (Query filter)
// Vendor search only returns vendors with active subscription
WHERE vendor.subscription_status IN ('active', 'trial')
  AND vendor.approval_status = 'approved'
```

##### Plan-Gated Vendor Visibility in Couple's Project

When a couple adds vendors to their wedding project:

| Action | Free Vendor (No Plan) | Business Plan Vendor |
|--------|----------------------|---------------------|
| Couple searches vendor directory | Not listed | Listed with full profile |
| Couple adds vendor to project manually | ✅ As "custom vendor" (name + phone only) | ✅ Full profile linked |
| Vendor sees they were added | ❌ No notification | ✅ Notification + appears in their leads |
| Couple sends inquiry via platform | ❌ Not possible | ✅ Creates conversation thread |
| Couple sees vendor's reviews | ❌ Not available | ✅ Full reviews visible |
| Couple downloads vendor's price list | ❌ Not available | ✅ Downloadable from profile |
| Planner recommends vendor in templates | ❌ Not possible | ✅ Planner can add vendor to templates |

**Files created/modified (Phase 5C):**
- `prisma/schema.prisma` — added `VendorPlanTier` enum (`TRIAL`, `BUSINESS`, `EXPIRED`) + `planTier VendorPlanTier @default(TRIAL)` field on `VendorProfile`
- `scripts/add-vendor-plan-tier.mjs` — raw SQL migration (pg client); creates enum, adds column, back-fills expired trials; ran successfully
- `src/lib/vendor-plan.ts` — NEW: `getVendorPlanStatus()` + `activePlanWhereClause()` — plan gating logic + Prisma query filter
- `src/app/api/vendors/route.ts` — added `activePlanWhereClause()` to public directory `where` clause (BUSINESS or TRIAL active only)
- `src/app/api/vendors/[slug]/inquiries/route.ts` — plan check before accepting inquiry (403 if not active)
- `src/app/api/vendor/plan/route.ts` — NEW: `GET /api/vendor/plan` — returns current vendor's `VendorPlanStatus`
- `src/app/api/admin/vendors/[id]/route.ts` — added `planTier` to PUT body + Prisma update
- `src/app/vendor/dashboard/page.tsx` — added `PlanCard` component + `/api/vendor/plan` fetch (BUSINESS gradient, TRIAL days-left, EXPIRED upgrade CTA)
- `src/app/vendor/billing/page.tsx` — NEW: full billing page with plan status, upgrade card, feature list, disabled Stripe button (wired in 5E)
- `src/app/vendor/layout.tsx` — added "Plan & Billing" nav item (CreditCard icon) linking to `/vendor/billing`
- `src/app/admin/vendors/page.tsx` — added `planTier` to vendor interface, form, table column (color-coded badge), modal dropdown (TRIAL/BUSINESS/EXPIRED)

**Deviations from plan:**
- Stripe payment button is disabled (manual plan assignment via admin for now) — Stripe wiring deferred to Phase 5E
- Plan tiers implemented as 3-state: TRIAL / BUSINESS / EXPIRED (not separate "no plan" state — reused existing `trialEndsAt` logic)
- Migration script used `pg` client directly (not PrismaClient) — required because project uses `PrismaPg` adapter

#### Phase 5D: Couple-Vendor Conversation System — ✅ IMPLEMENTATION DONE (2026-04-03)

##### Messaging Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 CONVERSATION SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ENTRY POINTS (How a conversation starts):                  │
│  ├── 1. Couple clicks "Request a Quote" on vendor profile   │
│  │      → Creates inquiry → Auto-creates conversation       │
│  ├── 2. Couple clicks "Contact" / "Send Message"            │
│  │      → Direct message → Creates conversation             │
│  ├── 3. Couple submits booking request (3-step flow)        │
│  │      → Booking request → Auto-creates conversation       │
│  └── 4. Vendor replies to an inquiry                        │
│         → Converts inquiry into ongoing conversation        │
│                                                             │
│  CONVERSATION FEATURES:                                     │
│  ├── Text messages (rich text, links)                       │
│  ├── File attachments (quotes, contracts, PDFs, images)     │
│  │   └── Max 10MB per file, stored in S3                    │
│  ├── Quick-reply templates (vendor-side)                    │
│  │   └── "Thank you for your inquiry...",                   │
│  │       "Here's our pricing...",                           │
│  │       "That date is available!"                          │
│  ├── Read receipts (sender sees "Read" / "Delivered")       │
│  ├── Typing indicators (real-time via WebSocket)            │
│  ├── Image preview in chat (inline thumbnails)              │
│  ├── Inquiry context card (pinned at top of conversation)   │
│  │   └── Shows: event type, date, guest count, budget,     │
│  │       venue, couple's message                            │
│  └── Conversation status:                                   │
│      ├── Active — ongoing communication                     │
│      ├── Booked — couple confirmed booking                  │
│      ├── Archived — conversation ended (by either party)    │
│      └── Spam — flagged by vendor or admin                  │
│                                                             │
│  COUPLE SIDE (in project dashboard):                        │
│  ├── Vendors tab → "My Vendors" section                     │
│  ├── Each vendor card shows unread message count badge      │
│  ├── Click vendor → opens conversation thread               │
│  ├── Can attach: event details, reference photos            │
│  ├── Can mark vendor as "Booked" / "Not Interested"        │
│  └── Conversation history preserved even after event        │
│                                                             │
│  VENDOR SIDE (in vendor dashboard):                         │
│  ├── Inbox page → all conversations sorted by latest        │
│  ├── Filter: All / Unread / Inquiries / Booked / Archived  │
│  ├── Each thread shows: couple name, event date, category   │
│  ├── Quick actions: Reply, Send Quote, Mark Booked, Archive │
│  ├── Auto-reply: Set away message for off-hours             │
│  ├── Quick-reply templates (customizable)                   │
│  └── Response time tracked (shown on vendor profile)        │
│                                                             │
│  NOTIFICATIONS:                                             │
│  ├── In-app: Real-time badge on Inbox tab (WebSocket)       │
│  ├── Email: New message notification (configurable delay)   │
│  │   └── Batched: if no reply in 5min, send email digest    │
│  ├── Push: Browser push notification for new messages       │
│  └── SMS: Optional (Elite/paid add-on)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

##### Conversation Database Schema

```sql
Conversations {
  id              UUID PK
  project_id      UUID FK → Projects         -- couple's wedding project
  vendor_id       UUID FK → VendorProfiles    -- vendor in conversation
  couple_user_id  UUID FK → Users             -- couple who initiated
  status          ENUM('active', 'booked', 'archived', 'spam')
  inquiry_id      UUID? FK → VendorInquiries  -- original inquiry (if any)
  last_message_at TIMESTAMP                   -- for sorting inbox
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
  deleted_at      TIMESTAMP?                  -- soft delete

  UNIQUE(project_id, vendor_id)               -- one conversation per vendor per project
}

Messages {
  id              UUID PK
  conversation_id UUID FK → Conversations
  sender_id       UUID FK → Users             -- who sent it
  sender_role     ENUM('couple', 'vendor')     -- for quick filtering
  content         TEXT                          -- message body (sanitized HTML)
  message_type    ENUM('text', 'inquiry', 'quote', 'booking_request', 'system')
  metadata        JSONB?                       -- { inquiryData, quoteAmount, bookingDetails }
  read_at         TIMESTAMP?                   -- null = unread
  delivered_at    TIMESTAMP?
  created_at      TIMESTAMP
  deleted_at      TIMESTAMP?                   -- soft delete (hide, not destroy)
}

MessageAttachments {
  id              UUID PK
  message_id      UUID FK → Messages
  file_name       VARCHAR
  file_type       VARCHAR                      -- 'image/jpeg', 'application/pdf', etc.
  file_size       INT                          -- bytes
  s3_key          VARCHAR                      -- S3 storage path
  thumbnail_key   VARCHAR?                     -- S3 path for image thumbnail
  created_at      TIMESTAMP
}

VendorQuickReplies {
  id              UUID PK
  vendor_id       UUID FK → VendorProfiles
  title           VARCHAR                      -- "Pricing Info", "Date Available"
  content         TEXT                          -- template message body
  sort_order      INT
  created_at      TIMESTAMP
}

-- Indexes for performance
CREATE INDEX idx_conversations_vendor ON Conversations(vendor_id, status, last_message_at DESC);
CREATE INDEX idx_conversations_couple ON Conversations(couple_user_id, last_message_at DESC);
CREATE INDEX idx_messages_conversation ON Messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON Messages(conversation_id, read_at) WHERE read_at IS NULL;
```

##### Conversation API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| **Couple-side** | | | |
| `/api/v1/projects/:id/conversations` | GET | List all vendor conversations for project | Couple |
| `/api/v1/projects/:id/conversations` | POST | Start new conversation with vendor | Couple |
| `/api/v1/projects/:id/conversations/:convId/messages` | GET | Get messages (paginated, newest first) | Couple |
| `/api/v1/projects/:id/conversations/:convId/messages` | POST | Send message | Couple |
| `/api/v1/projects/:id/conversations/:convId/messages/:msgId/read` | PUT | Mark message as read | Couple |
| `/api/v1/projects/:id/conversations/:convId/status` | PUT | Update status (booked/archived) | Couple |
| `/api/v1/projects/:id/conversations/:convId/attachments` | POST | Upload file attachment | Couple |
| **Vendor-side** | | | |
| `/api/v1/vendor-portal/conversations` | GET | List all conversations (filterable) | Vendor |
| `/api/v1/vendor-portal/conversations/:convId/messages` | GET | Get messages (paginated) | Vendor |
| `/api/v1/vendor-portal/conversations/:convId/messages` | POST | Send message / reply | Vendor |
| `/api/v1/vendor-portal/conversations/:convId/messages/:msgId/read` | PUT | Mark as read | Vendor |
| `/api/v1/vendor-portal/conversations/:convId/status` | PUT | Update status (archived/spam) | Vendor |
| `/api/v1/vendor-portal/conversations/:convId/send-quote` | POST | Send quote (amount + details + PDF) | Vendor |
| `/api/v1/vendor-portal/quick-replies` | CRUD | Manage quick-reply templates | Vendor |
| `/api/v1/vendor-portal/auto-reply` | GET/PUT | Get/set auto-reply settings | Vendor |
| **Shared** | | | |
| `/api/v1/conversations/:convId/typing` | POST | Typing indicator (WebSocket preferred) | Both |

##### WebSocket Events (Messaging)

```typescript
// Socket.io events for real-time messaging

// Client → Server
socket.emit('join_conversation', { conversationId });
socket.emit('leave_conversation', { conversationId });
socket.emit('send_message', { conversationId, content, attachments? });
socket.emit('typing_start', { conversationId });
socket.emit('typing_stop', { conversationId });
socket.emit('mark_read', { conversationId, messageId });

// Server → Client
socket.on('new_message', { message, conversation });       // real-time message
socket.on('message_read', { messageId, readAt });           // read receipt
socket.on('typing', { conversationId, userId, isTyping });  // typing indicator
socket.on('conversation_updated', { conversation });        // status change
socket.on('unread_count', { total, byConversation: {} });   // badge count update
```

##### Messaging Flow Diagram

```
COUPLE                          SERVER                         VENDOR
  │                               │                              │
  │  1. "Request a Quote"         │                              │
  │  ─────────────────────────►   │                              │
  │                               │  Creates Conversation        │
  │                               │  + Inquiry Message           │
  │                               │  ─────────────────────────►  │
  │                               │  Email: "New inquiry from    │
  │                               │          Anna & Erik"        │
  │                               │  Push notification            │
  │                               │                              │
  │                               │  2. Vendor opens inbox       │
  │                               │  ◄─────────────────────────  │
  │                               │  Returns conversation +      │
  │                               │  inquiry context card        │
  │                               │                              │
  │                               │  3. Vendor types reply       │
  │  typing indicator ◄───────────│──◄── typing_start            │
  │                               │                              │
  │                               │  4. Vendor sends message     │
  │  new_message (WebSocket) ◄────│──◄── send_message            │
  │  + Email (if offline 5min)    │  Saves to DB                 │
  │                               │                              │
  │  5. Couple reads message      │                              │
  │  mark_read ──────────────────►│                              │
  │                               │──► message_read (WebSocket)  │
  │                               │                              │
  │  6. Couple replies            │                              │
  │  send_message ───────────────►│                              │
  │                               │──► new_message (WebSocket)   │
  │                               │──► Email (if offline 5min)   │
  │                               │                              │
  │  7. Vendor sends quote        │                              │
  │                               │◄── send_quote (PDF + amount) │
  │  new_message (type: quote) ◄──│                              │
  │  Shows inline: amount,        │                              │
  │  PDF download, accept/decline │                              │
  │                               │                              │
  │  8. Couple marks "Booked"     │                              │
  │  update_status('booked') ────►│                              │
  │                               │──► conversation_updated      │
  │                               │    Vendor sees "Booked" tag  │
  │                               │    Availability auto-blocked │
  └───────────────────────────────┴──────────────────────────────┘
```

**Files created/modified (Phase 5D):**
- `prisma/schema.prisma` — added `projectId String?` + `coupleUserId String?` to `VendorConversation` + `WeddingProject.vendorConversations` + `User.coupleConversations` back-relations
- `scripts/add-vendor-conversations.mjs` — extended with `ALTER TABLE ADD COLUMN IF NOT EXISTS` for new fields + indexes
- `src/app/api/planner/projects/[id]/conversations/route.ts` — NEW: `GET` (list project convos) + `POST` (start/get conversation with vendor)
- `src/app/api/planner/projects/[id]/conversations/[convId]/route.ts` — NEW: `GET` (thread + mark vendor msgs read) + `POST` (couple sends message) + `PUT` (archive/restore)
- `src/app/planner/[id]/vendors/page.tsx` — added `conversations` state, `loadConversations()`, `openConvPanel()`, "Message" buttons on public vendor cards, "Vendor Messages" section with unread badges, full slide-over panel (new conversation + thread view + reply compose)
- `src/app/vendors/[slug]/page.tsx` — added `useSession`, project dropdown (logged-in couples can link message to a project), `linkedProjectId` state, project-aware submit path (uses `/api/planner/projects/[id]/conversations`), "View in your planner" link on success

**Deviations from plan:**
- WebSocket/real-time: Using 15s polling instead (Socket.io requires server setup — deferred)
- File attachments: Deferred to Phase 5E (requires R2/S3 setup)
- Quote sending: Deferred to Phase 5E
- Response time tracking: Deferred (analytics feature)

##### Response Time Tracking

```
Vendor response time is calculated and displayed publicly:

- Formula: Average time from couple's first message to vendor's first reply
- Display: "Typically responds within X hours" on vendor profile
- Tiers:
  - ⚡ "Within 1 hour"     → Green badge
  - 🕐 "Within 24 hours"   → Default (no special badge)
  - 🕐 "Within 48 hours"   → Yellow warning
  - ⚠️  "Slow to respond"  → Red (>48h average, shown to admin only)
- Business hours considered: if vendor sets hours (9am-6pm),
  overnight messages don't count against response time
```

#### Phase 5E: Billing & Payments

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Stripe integration | ⬜ Pending | Checkout, subscriptions, Customer Portal |
| 2 | 3-tier subscription | ⬜ Pending | Basic (Free) / Premium / Elite with feature gating |
| 3 | Vendor billing ($19/mo) | ⬜ Pending | Business Profile plan |
| 4 | Invoice generation | ⬜ Pending | Auto PDF with VAT |
| 5 | Webhook handlers | ⬜ Pending | payment_intent.succeeded, subscription.deleted, invoice.paid |
| 6 | Checklist & cleanup | ⬜ Pending | Verify all payment flows |

#### Phase 5F: Event Brief Sharing — ✅ COMPLETE (Layer 1 ✅ · Layer 2 ✅)

**Goal:** Vendor যেন couple এর wedding plan এর relevant details সহজে দেখতে পায় — শুধু chat এ লেখা না, structured + shareable format এ।

**Research basis:** 2025/2026 industry best practice (The Knot Smart Fields + Zola RFQ + emerging shareable profile link pattern). Biggest gap across all platforms: no mainstream tool auto-generates a vendor-category-specific brief from couple's centralized planning data. This feature fills that gap.

**Architecture: 2-Layer Approach**

```
Layer 1 — Auto Smart Fields in Conversation (zero friction)
  Conversation thread এর top এ pinned card:
  → Couple names, wedding date, venue name, guest count, budget range
  → Project data থেকে auto-pull — couple কিছু type করতে হবে না
  → Conversation schema তে project_id আছে, শুধু join করে render করতে হবে

Layer 2 — Shareable Event Brief Link (couple controlled)
  Planner dashboard → vendor card → "Share Brief" button
  → Unique read-only token generate হবে (/brief/[token])
  → Couple chat এ paste করে vendor কে পাঠাবে
  → Vendor সেই page এ দেখবে: full relevant wedding details
  → Couple যেকোনো সময় token revoke করতে পারবে
  → Same page থেকে PDF download (already have @react-pdf/renderer)
```

##### Layer 1 — Conversation Auto Smart Card

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Conversation API update | ✅ Done (2026-04-05) | `GET /api/conversations/[id]` — project join added: couple names, date, venues, guest count, budget goal |
| 2 | Pinned context card UI — `/conversation/[id]` | ✅ Done (2026-04-05) | Collapsible purple card at top of public conversation thread. Shows project data if linked, falls back to inquiry data. Tested. |
| 3 | Pinned context card — vendor portal messages | ✅ Done (2026-04-05) | `/vendor/messages` — purple context card shows couple names, date, guest count, budget, ceremony venue. API updated to join project. Falls back to blue inquiry card if no project linked. |
| 4 | localStorage fallback | ✅ Done (N/A) | Local projects: N/A (brief sharing only works for DB projects — by design) |
| 5 | Checklist & cleanup | ✅ Done (2026-04-05) | TypeScript zero errors, build clean |

**Note (2026-04-05):** `/conversation/[id]` is the public inquiry page (anonymous users). Logged-in couples use the planner slide-out panel; vendors use `/vendor/messages`. Layer 1 card is most needed in `/vendor/messages`.

##### Layer 2 — Shareable Event Brief Page

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | DB schema — `EventBriefToken` model | ✅ Done (2026-04-05) | Added to `prisma/schema.prisma` — `id`, `projectId FK`, `token` (unique), `revokedAt?`, `createdAt` |
| 2 | Migration | ✅ Done (2026-04-05) | `scripts/add-event-brief-token.mjs` — raw SQL via pg client. Table + indexes + FK created. `npx prisma generate` run. |
| 3 | API — `POST /api/planner/projects/[id]/brief` | ✅ Done (2026-04-05) | Generates token, saves to DB. Auth required. |
| 4 | API — `GET /api/planner/projects/[id]/brief` | ✅ Done (2026-04-05) | Lists active (non-revoked) tokens for project. Auth required. |
| 5 | API — `DELETE /api/planner/projects/[id]/brief/[token]` | ✅ Done (2026-04-05) | Revokes token — sets `revokedAt = now()`. Auth required. |
| 6 | API — `GET /api/brief/[token]` | ✅ Done (2026-04-05) | Public endpoint. Validates token. Returns: couple names, date, venues, guest count, budget, confirmed vendor categories. 404 if revoked/invalid. |
| 7 | Brief page — `/brief/[token]` | ✅ Done (2026-04-05) | Public read-only page — couple name card, detail chips (guest/budget/date), venue section, vendor checklist (confirmed=green). "Save/Print" button. Mobile-friendly. Tested. |
| 8 | PDF export | ⬜ Pending | `@react-pdf/renderer` — browser print works via "Save/Print" button. Dedicated PDF download deferred. |
| 9 | "Share Event Brief" button in planner | ✅ Done (2026-04-05) | Action bar in `/planner/[id]/vendors` → modal with link + copy + preview + revoke. Hidden for local projects. Tested. |
| 10 | Checklist & cleanup | ✅ Done (2026-04-05) | TypeScript zero errors, build successful |

**Files created/modified (Phase 5F — 2026-04-05):**
- `prisma/schema.prisma` — `EventBriefToken` model + `briefTokens` relation on `WeddingProject`
- `scripts/add-event-brief-token.mjs` — raw SQL migration
- `src/app/api/planner/projects/[id]/brief/route.ts` — GET + POST
- `src/app/api/planner/projects/[id]/brief/[token]/route.ts` — DELETE (revoke)
- `src/app/api/brief/[token]/route.ts` — public GET
- `src/app/brief/[token]/page.tsx` — public brief page
- `src/app/api/conversations/[id]/route.ts` — added project join to GET
- `src/app/conversation/[id]/page.tsx` — added `ProjectContextRows` component + collapsible pinned card
- `src/app/planner/[id]/vendors/page.tsx` — added "Share Event Brief" button + brief modal
- `src/app/api/vendor/conversations/[id]/route.ts` — added project join (names, date, venues, guests) to GET
- `src/app/vendor/messages/page.tsx` — added purple event context card (Layer 1 vendor portal)

##### What the Brief Page Shows (`/brief/[token]`)

```
┌─────────────────────────────────────────────┐
│  ✦ Riya & Arif's Wedding                    │
│  "We are so excited to celebrate with you!" │
├─────────────────────────────────────────────┤
│  📅 12 June 2026, 6:00 PM                   │
│  🏛  Ceremony: The Regent, Dhaka            │
│  🥂  Reception: Radisson Blu, Dhaka         │
│  👥  180 Guests                             │
│  💰  Photography Budget: $1,500–$2,000      │
│  🎨  Theme: Rustic Floral · Blush & Gold    │
├─────────────────────────────────────────────┤
│  Confirmed Vendors                          │
│  ✓ Florist  ✓ Catering  ✗ Photographer     │
├─────────────────────────────────────────────┤
│  Notes from the couple                      │
│  "Looking for candid style photography,     │
│   outdoor shots preferred, golden hour."    │
├─────────────────────────────────────────────┤
│  [Download PDF]  [Contact the Couple →]     │
└─────────────────────────────────────────────┘
```

##### Data Privacy Rules

| Data | Shown on Brief | Reason |
|------|---------------|--------|
| Couple names | ✅ Yes | Vendor needs to address correctly |
| Wedding date & time | ✅ Yes | Core availability check |
| Venue name & city | ✅ Yes | Logistics |
| Guest count | ✅ Yes | Scope of service |
| Budget range for this vendor category | ✅ Yes | Qualification |
| Theme / style notes | ✅ Yes | Service alignment |
| Confirmed vendor list (categories only) | ✅ Yes | Coordination awareness |
| Full budget breakdown | ❌ No | Private financial data |
| Guest names / contact info | ❌ No | Privacy |
| Full address details | ❌ No | Security |
| Other vendor names/contacts | ❌ No | Privacy |

**Deliverable:** Vendor receives structured wedding context automatically in chat + couple can share a beautiful read-only brief link with full relevant details and PDF export.

**Phase 5 Status:** 🔄 IN PROGRESS (5A-0 ✅ · 5A-1 ✅ · 5B ✅ · 5C ✅ · 5D ✅ · 5E ⬜ · 5F ✅)

---

### Phase 6: Admin Panel, Polish & Launch — ⬜ NOT STARTED

**Goal:** Platform management + production readiness
**Depends on:** Phase 5 completed

#### Phase 6A: Admin Panel

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Wedding project management in admin | ⬜ Pending | List, search, manage all projects |
| 2 | Vendor approvals | ⬜ Pending | Review, approve, reject applications |
| 3 | Financial reporting | ⬜ Pending | Revenue, plan breakdown, refunds |
| 4 | Platform settings | ⬜ Pending | Templates, default content, email templates |

#### Phase 6B: Testing & Optimization

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Performance optimization | ⬜ Pending | Lighthouse ≥ 90, Core Web Vitals |
| 2 | Responsive testing | ⬜ Pending | Mobile (375px), Tablet (768px), Desktop (1280px) |
| 3 | Security audit | ⬜ Pending | OWASP Top 10, CSP headers, sanitization |
| 4 | Bundle analysis | ⬜ Pending | Optimize bundle size |

#### Phase 6C: Deployment

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Production deployment | ⬜ Pending | Vercel + database setup |
| 2 | Monitoring | ⬜ Pending | Error tracking, logging, uptime |
| 3 | Documentation | ⬜ Pending | Developer guides, API docs |

**Deliverable:** Production-ready platform, launched
**Phase 6 Status:** ⬜ NOT STARTED

---

### Buffer & Contingency — ⬜ NOT STARTED

- Bug fixes from UAT (User Acceptance Testing)
- Performance tuning based on real usage
- UX refinements from stakeholder feedback
- Edge case handling
- Template content creation (10+ website templates, 10+ invitation templates, 6 seating starter templates)

---

## 15a. Implementation Status Summary

| Phase | Name | Status | Sub-phases | Completed |
|-------|------|--------|------------|-----------|
| 0 | UX/UI Design | ⏭️ SKIPPED | — | Using planning.wedding reference |
| 1 | Core Foundation | ✅ DONE | 1A–1E | 5/5 sub-phases |
| 2 | Planning Tools | ✅ DONE | 2A ✅ · 2B ✅ · 2C ✅ · 2D ✅ | 4/4 sub-phases |
| 3 | Visual Editors | 🔄 IN PROGRESS | 3A ✅ · 3B ✅ · 3C ✅ · 3D ⬜ | 3/4 |
| 4 | Guest Experience | 🔄 IN PROGRESS | items 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 6 ✅ · items 5 · 7 · 8 ⬜ | 5/8 items |
| 5 | Marketplace & Payments | 🔄 IN PROGRESS | 5A-0 ✅ · 5A-1 ✅ · 5B ✅ · 5C ✅ · 5D ✅ · 5F ✅ · 5E ⬜ | 6/7 |
| 6 | Admin & Launch | ⬜ NOT STARTED | 6A–6C | 0/3 |

**Last Updated:** 2026-04-05 (session 2)
**Current Focus:** Phase 5F ✅ complete · Vendor bug fixes ✅ — next: Phase 5E (Billing & Payments / Stripe) or Phase 4 remaining items (#5 QR Seat Finder, #7 Push Notifications, #8 Checklist cleanup)

**Session log (2026-04-05, session 2 — Vendor portal fixes):**
- **Bug fix — Admin-added vendor cannot login:** `POST /api/admin/vendors` now accepts optional `password` field. If email + password provided, creates `User` record (role=VENDOR, bcrypt hash) + links `VendorProfile.userId`. If no password, profile-only (existing behavior).
- **New endpoint** `POST /api/admin/vendors/[id]/create-account`: Creates `User` login account for existing admin-added vendors that have no `userId`. Takes `password` param. Handles edge case: if email already in `User` table, links profile to existing user instead of creating duplicate.
- **Admin UI — "Add Vendor" form**: Added optional "Login Password" field (only shown when adding, not editing). Warning shown if email filled but password empty.
- **Admin UI — table actions**: 🔑 key icon button shown for vendors with `user === null` → opens "Create Login Account" modal with password input.
- **Bug fix — Vendor sidebar shows personal name instead of business name**: `src/app/vendor/layout.tsx` now fetches `GET /api/vendor/profile` on mount and shows `VendorProfile.businessName` in sidebar. Falls back to `session.user.name` if profile not yet loaded.
- Files modified: `src/app/api/admin/vendors/route.ts`, `src/app/api/admin/vendors/[id]/create-account/route.ts` (new), `src/app/admin/vendors/page.tsx`, `src/app/vendor/layout.tsx`

**Session log (2026-04-03, session 2 — Phase 5C):**
- DB schema: added `VendorPlanTier` enum + `planTier` field to `VendorProfile` in `prisma/schema.prisma`; ran `npx prisma generate`
- SQL migration: `scripts/add-vendor-plan-tier.mjs` using raw pg client — creates enum, adds column, back-fills expired trials (ran successfully, 0 rows back-filled)
- `src/lib/vendor-plan.ts`: `getVendorPlanStatus()` — 3-tier logic (BUSINESS always active; TRIAL active if `trialEndsAt > now`; EXPIRED never active; not approved → never active); `activePlanWhereClause()` for Prisma OR filter
- Public directory gated: `src/app/api/vendors/route.ts` now filters only BUSINESS or active TRIAL vendors
- Inquiry API gated: `src/app/api/vendors/[slug]/inquiries/route.ts` checks plan before accepting — 403 if expired
- `GET /api/vendor/plan` endpoint: new `src/app/api/vendor/plan/route.ts`
- Admin PUT extended: `planTier` included in `src/app/api/admin/vendors/[id]/route.ts`
- Vendor dashboard: `PlanCard` component added — purple gradient (BUSINESS), blue/orange with days-left (TRIAL), red (EXPIRED)
- `/vendor/billing` page created: plan status card, upgrade card with feature list, disabled Stripe button (Phase 5E)
- Vendor layout: "Plan & Billing" nav item added (CreditCard icon)
- Admin vendors page: `planTier` column (color-coded badge) + plan tier dropdown in edit modal
- TypeScript: `npx tsc --noEmit` — zero errors

**Session log (2026-04-03, session 1 — seating polish):**
- Seating page: replaced tabs 3–7 "coming soon" stubs with proper SVG preview diagrams (Alphabetical Guest Atlas, Seating Cards by Table, Classic Name Cards, Table Numbers, Reception Menu)
- Alphabetical Guest Atlas: replaced hardcoded fake data with real guest data; `buildGuestTableMap()` from seating layouts; 4-column CSS layout with letter headers; dotted leader lines; empty state; seated/total stats
- Tab URL sync: `window.history.replaceState()` on tab change; `?tab=` param read on mount to restore tab on reload; default (Reception Layout) has clean URL
- Sidebar highlight fix: when clicking "Plan venue layout" from Ceremony/Reception pages, those nav items stay highlighted instead of "Seating Chart & Supplies"; implemented with `?src=ceremony/reception` query param + `useSearchParams()` in sidebar; sidebar split into `SidebarInner` + `PlannerSidebar` (Suspense required for `useSearchParams()` in App Router)
- Shared venue diagrams: extracted `CeremonyDiagram` + `ReceptionDiagram` to `src/components/planner/venue-diagrams.tsx`
- Default seating tab changed from "ceremony" to "reception" on direct sidebar click

**Session log (2026-04-01):**
- Budget: fixed PDF $0 bug (`item.actual` → `item.planned`); added per-item paid checkbox (green + strikethrough); fixed `catId` undefined bug
- Vendor page: full redesign — horizontal scroll row with public approved vendors (full-bleed gradient cards, always 4 max) + "Search and Add Vendors" CTA; removed search bar; show/hide suggested vendors toggle; Download PDF button; header centered; trailing spacer fixes right border clip
- Admin: renamed "View Public Directory" → "View All Vendors" (button + sidebar nav)
- Vendor photos: `/vendor/profile` Photos section — URL + "Upload from device" (FileReader base64) + preview; admin add/edit modal same cover photo upload; `photos[0]` becomes coverPhoto in planner vendor cards
- Phase 3D (Invitation Designer): partially implemented then removed — not in reference site, was added to plan by mistake; stays ⬜ NOT STARTED
- Plan file: renamed `DEVELOPMENT-PLAN.md` → `wedding planner DEVELOPMENT-PLAN.md`
- Admin Vendor Marketplace bug fixes (2026-04-01):
  - Stats count (Approved/Pending) now queried directly from DB via `prisma.vendorProfile.count({ where: { status } })` — was incorrectly calculated from current page only
  - Status badge: changed `||` to `??` so `status="PENDING"` displays correctly
  - Approve/Suspend action buttons: condition changed from `v.isApproved` → `v.status` enum
  - Business name column: email now shows `v.email || v.user?.email` (fallback to user account email)

### What's Built So Far (Phase 1 + 2)

| Feature | Page | Notes |
|---------|------|-------|
| Anonymous mode (no login) | All planner pages | localStorage, works offline |
| Project creation wizard | `/planner/create` | Role, event type, date |
| Project overview | `/planner/[id]` | Live stats: guests, budget, checklist |
| Guest list | `/planner/[id]/guests` | CRUD, 3 views, RSVP toggle, import CSV/XLS, export PDF/XLS, search+filter |
| Budget tracker | `/planner/[id]/budget` | Categories + items, planned/actual/paid, progress bars |
| Planning checklist | `/planner/[id]/checklist` | 20 default tasks with subtasks, month grouping, progress % |
| Event itinerary | `/planner/[id]/itinerary` | Hour-by-hour timeline, categories, location |
| Notes | `/planner/[id]/notes` | Sidebar + editor, auto-save |
| i18n | All pages | English, Swedish, Arabic (RTL), Bengali |

---

## 16. Development Process

| Cadence | Activity |
|---------|---------|
| Weekly (Monday) | Written progress report |
| Every 10 days | Live review session (video call with stakeholders) |
| Per milestone | Sign-off required before next phase |
| Continuous | Lighthouse CI in deployment pipeline |

### Non-Negotiable Rules

1. **UX/UI design MUST be completed and approved before frontend development begins**
2. No tech stack deviations without explicit written approval
3. No hardcoded left/right CSS — logical properties only
4. PDF generation via background jobs (BullMQ) — never block request thread
5. All text strings must be translatable (no hardcoded strings in components)
6. GDPR consent on every RSVP submission
7. No ads, no data selling — privacy-first approach
8. Mobile-first design for public sites; desktop-first for dashboard editors

---

## 17. Security Checklist

- [ ] Passwords: bcrypt (min 12 rounds)
- [ ] JWT: 15min access + 7-day refresh rotation
- [ ] 2FA: Two-factor authentication support
- [ ] RSVP rate limit: 10/IP/hour
- [ ] File uploads: type validation + virus scan (ClamAV)
- [ ] SQL injection: Prisma parameterized queries
- [ ] XSS: CSP headers + DOMPurify
- [ ] HTTPS only: HSTS enforced
- [ ] Sensitive data: encrypted at rest (dietary info)
- [ ] GDPR: consent collection + data retention policy
- [ ] Password protection: sites, galleries, RSVP pages
- [ ] Advanced encryption (Premium tier)

---

## 18. Acceptance Criteria (Pre-Launch)

### Functional

- [ ] Register, login, password reset, 2FA working
- [ ] Multi-project support: create, archive, copy, delete projects
- [ ] Collaboration: invite with full access / view-only, real-time sync
- [ ] Guest list: 3 display modes, custom columns, CSV/XLS import without data loss
- [ ] RSVP: conditional fields, custom questions (4 types), email/QR delivery, auto-populate guest list
- [ ] Budget: categories + sub-categories, auto-calculations, pie chart, overspending alerts
- [ ] Checklist: 12-month auto-suggestions, drag-drop reorder, reminders, partner delegation
- [ ] Event itinerary: hour-by-hour timeline, templates
- [ ] Event creation: 8-step wizard supports all 4 event types (Wedding, Baptism, Party, Corporate)
- [ ] Website builder: 10+ event-type-specific templates, 16 blocks, live preview updates instantly, theme engine (gradients), SEO module
- [ ] Seating chart: 7 table types, dual layouts, SVG venue upload, guest avatars, history/snapshots, catering mode
- [ ] QR check-in: search by name/seat number, highlighted venue map position
- [ ] PDF exports: print-ready (300 DPI) for all modules
- [ ] Invitations: 10+ templates, multi-channel delivery, open/response tracking
- [ ] Vendor search: 13 categories, geo + date + rating filters, map/list view
- [ ] Vendor profiles: gallery, availability calendar, reviews, inquiry form, booking request flow
- [ ] Stripe subscription creates and activates site automatically
- [ ] Swish and Klarna payments complete successfully
- [ ] Auto-generated Kvitto PDF with Org.nr, Moms, correct amounts
- [ ] 3-tier subscription: Basic (free) → Premium (299 SEK) → Elite (499 SEK) with correct feature gating
- [ ] Vendor-couple conversation system: messaging, read receipts, quote sending, status tracking
- [ ] Admin: approve vendors, manage ads, view financials, feature flags

### Technical

- [ ] Lighthouse ≥ 90 (Performance, Accessibility, SEO)
- [ ] All pages pass RTL test in Arabic
- [ ] No hardcoded left/right CSS — logical properties throughout
- [ ] No OWASP Top 10 vulnerabilities
- [ ] Consistent API error format `{ success, data, error: { code, message } }`
- [ ] GDPR consent collected and stored on all RSVP submissions
- [ ] Mobile tested on 375px and 768px
- [ ] PDF generation confirmed as background job (BullMQ)
- [ ] All strings translatable (no hardcoded EN/SE strings)
- [ ] Offline access for checklists/guest lists (service worker)
- [ ] Push notifications working (RSVP, deadlines)
- [ ] 3 language support (SE/EN/AR) via next-intl namespaces
- [ ] Unit test coverage ≥ 80% (Vitest + RTL)
- [ ] Integration test coverage ≥ 60% (Vitest + MSW)
- [ ] E2E critical paths pass (Playwright)
- [ ] CI/CD pipeline: GitHub Actions lint → test → build → deploy
- [ ] Stripe webhook events handled: payment_intent.succeeded, subscription.deleted, invoice.paid

---

## 19. Future Phases (Post-MVP — Architecture Ready)

These are **out of MVP scope** but the database schema and API must support them without refactoring:

### Phase 2 (Post-Launch)

- Event Itinerary — hour-by-hour timeline with export (if not completed in MVP)
- Budget Manager — planned vs actual, categories, drag-sort (if not completed in MVP)
- Post-Event Module — photo uploads, memory wall, feedback
- Digital Memory Wall — guest photo uploads on event day
- Registry / Wishlist — affiliate links (Amazon, IKEA)
- WhatsApp invitation delivery (Business API)
- Legacy Mode — low-cost annual plan to archive live event site
- Advanced vendor analytics (profile views, inquiry conversion, revenue)
- Marketplace transactions (vendor booking payments via escrow)

### Phase 3 (Scale)

- Multi-currency support (full international pricing beyond SEK/USD/EUR)
- Accessibility Mode (high contrast, large font, screen reader optimized)
- Promoted Vendor Listings (self-serve ad purchase for vendors)
- Mobile App (iOS/Android — React Native)
- Collaborative real-time editing (full OT/CRDT)
- AI-powered vendor recommendations + AI insights
- Professional planner multi-event management
- White-label deployments at scale

---

## 20. Risk Matrix

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Seating chart performance with 500+ objects | High | Konva.js virtualization, canvas optimization, early load testing |
| RTL/Arabic rendering bugs | Medium | CSS logical properties from day 1, dedicated RTL test suite |
| Swedish payment integration complexity | Medium | Early Swish/Klarna sandbox testing, fallback to Stripe-only |
| PDF generation blocking API | High | BullMQ background jobs from the start, never synchronous |
| Scope creep in visual editors | High | Strict MVP feature list, phase gate sign-offs |
| Multi-language content management | Medium | JSONB locale pattern established early, translation workflow defined |
| 3-tier subscription complexity | Medium | Clear feature gating at all 3 layers (API guard, React PlanGate, DB query), thorough test coverage |
| Guest photo storage costs | Medium | S3 lifecycle policies, image compression, tier-based limits |
| Offline sync conflicts | Medium | Last-write-wins for simple data, conflict UI for complex edits |

---

*This plan synthesizes requirements from the Core Architecture Developer Guide (PDF), Master MVP Development Specification (PDF), Core Architecture Dev Guide (DOCX), and Development Blueprint (DOCX). All phases require stakeholder sign-off before progression.*
