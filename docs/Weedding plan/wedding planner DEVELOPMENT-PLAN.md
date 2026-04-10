# Ceremoney — MVP Development Plan

> **Version:** 4.6 | **Date:** 2026-04-07 | **Timeline:** 19–21 Weeks (+ 3 weeks UX/UI parallel)

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

> **Platform:** Ceremoney — rebranded from LLCPad (Next.js 15, App Router, Prisma 7, NextAuth v5). Repo: https://github.com/sajeebce/weeding.git
> **Approach:** Each phase follows — Codebase Analysis → Fullstack Implementation (DB + API + UI) → Checklist Verification → Cleanup
> **Theme Binding:** Landing page content bound to active theme (reset-safe). App routes use theme colors via CSS variables.
> **DB:** PostgreSQL database `llcpad` (local dev) → will rename to `ceremoney` in production. Old LMS tables (Course, Certificate, Enrollment, etc.) dropped via `db push --accept-data-loss` on 2026-04-07.

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

**Phase 2A — Blueprint Features (Tasks 22–26) — ✅ IMPLEMENTATION DONE (2026-04-07)**

---

> ## ⛔ MANDATORY IMPLEMENTATION RULES — Tasks 22–26 এবং এরপরের প্রতিটি pending task
>
> ### ধাপ ১ — কাজ শুরুর আগে Codebase Analysis (বাধ্যতামূলক)
>
> প্রতিটি task শুরুর আগে নিচের **সব file পড়তে হবেই**:
> - `prisma/schema.prisma` — existing models, relations, enums
> - `src/lib/planner-storage.ts` — localStorage helpers ও existing types
> - `src/app/planner/[id]/guests/page.tsx` — current UI structure
> - `src/app/api/planner/projects/[id]/guests/route.ts` — existing API patterns
> - সংশ্লিষ্ট যেকোনো component, hook বা lib file
>
> ❌ File না পড়ে একটি লাইনও লেখা যাবে না।
> ❌ "আমি আগে দেখেছি" বলে skip করা যাবে না — প্রতিটি task-এর আগে আবার পড়তে হবে।
>
> ### ধাপ ২ — Fullstack Implementation (UI Mockup সম্পূর্ণ নিষিদ্ধ)
>
> প্রতিটি task-এ নিচের **সব layer একসাথে** implement করতে হবে:
>
> | Layer | কী করতে হবে |
> |-------|------------|
> | **DB Schema** | `prisma/schema.prisma` — নতুন model / field / enum / index যা লাগে |
> | **Migration** | `npx prisma db push` অথবা raw SQL script — schema অবশ্যই DB-তে apply করতে হবে |
> | **Prisma Client** | `npx prisma generate` run করতে হবে schema change-এর পর |
> | **API Routes** | GET / POST / PUT / DELETE — auth check, input validation, error handling সহ |
> | **localStorage Helpers** | `planner-storage.ts`-এ anonymous project mode-এর জন্য CRUD helpers |
> | **Frontend UI** | Form, list, modal — loading / error / empty / populated সব state কাজ করতে হবে |
> | **TypeScript Types** | সব নতুন data structure-এর জন্য interface / type define করতে হবে |
>
> ❌ শুধু UI বানিয়ে backend ছাড়া deliver করা যাবে না।
> ❌ শুধু API বানিয়ে UI ছাড়া deliver করা যাবে না।
> ❌ Anonymous mode (localStorage) support বাদ দেওয়া যাবে না।
> ❌ "Coming soon" বা placeholder stub দিয়ে task done mark করা যাবে না।
>
> ### ধাপ ৩ — প্রতিটি Task শেষে Checklist Verification
>
> প্রতিটি task complete করার পর নিচের **সব item verify করতে হবে**:
>
> - [ ] `prisma/schema.prisma` updated
> - [ ] Migration applied — `npx prisma db push` বা SQL script run হয়েছে
> - [ ] `npx prisma generate` run — Prisma client up to date
> - [ ] API endpoints কাজ করছে — GET / POST / PUT / DELETE tested
> - [ ] Unauthenticated request-এ API 401 return করছে
> - [ ] `planner-storage.ts`-এ localStorage helpers added / updated
> - [ ] UI সব state দেখাচ্ছে — loading, error, empty, populated
> - [ ] Form validation কাজ করছে + error messages দেখাচ্ছে
> - [ ] `npx tsc --noEmit` — zero TypeScript errors
> - [ ] কোনো `console.log` বা debug statement নেই
> - [ ] Mobile layout responsive কাজ করছে
>
> ❌ Checklist-এর একটি item বাদ দিয়ে task "done" mark করা যাবে না।
>
> ### ধাপ ৪ — সব Task শেষে Codebase Cleanup (phase/sub-phase শেষে)
>
> সব pending task complete হওয়ার পর:
>
> 1. সব stub / placeholder / `ComingSoon` component সরিয়ে ফেলতে হবে
> 2. Unused import, variable, function, component সরাতে হবে
> 3. সব `console.log` ও debug statement সরাতে হবে
> 4. Dead code — commented-out blocks, unreachable code, TODO comment সরাতে হবে
> 5. Duplicate logic থাকলে consolidate করতে হবে
> 6. `npx tsc --noEmit` — zero errors
> 7. `npm run lint` — zero ESLint errors
>
> ❌ Cleanup ছাড়া phase "done" mark করা যাবে না।

---

| # | Task | Status | Details |
|---|------|--------|---------|
| 22 | Plus-one management | ✅ Done (2026-04-07) | `hasPlusOne` bool + `plusOneName` + `plusOneMeal` fields on `WeddingGuest`. GuestRow: expandable +1 section with name/meal inputs. DB migration via raw SQL. API (POST/PUT guests routes) accept new fields. `LocalGuest` interface updated. Summary stats updated: shows "Plus-ones: +N" count + "Total attending (incl. +1s)" line when any guest has a plus-one. PDF export subtitle also includes plus-one count. |
| 23 | Chief guest assignment | ✅ Done (2026-04-07) | `isChiefGuest` bool on `WeddingGuest`. GuestRow: star icon toggle + "Chief Guest" badge in relation label. DB + API + localStorage + UI all updated. |
| 24 | Family grouping | ✅ Done (2026-04-07) | New `GuestFamily` model (DB + Prisma schema). `familyId` FK on `WeddingGuest`. `/api/planner/projects/[id]/families` (GET, POST) + `/families/[familyId]` (PUT, DELETE). `LocalGuestFamily` interface + `getLocalFamilies/addLocalFamily/updateLocalFamily/deleteLocalFamily` helpers. "By Family" view: family groups with member assignment, unassigned guests section, family create modal, rename/delete inline. |
| 25 | Bulk actions | ✅ Done (2026-04-07) | Checkbox column in Full Table view (select all / individual). `/api/planner/projects/[id]/guests/bulk` (POST) — actions: `assign_table`, `assign_family`, `delete`, `mark_attending`, `mark_not_attending`, `mark_pending`. Fixed floating bulk-action bar (dark overlay, bottom of screen). localStorage fallback uses existing CRUD helpers. |
| 26 | Table invitation assignment | ✅ Done (2026-04-07) | `invitationCode` (string) + `invitationSent` (bool) + `invitationSentAt` (DateTime) on `WeddingGuest`. Invitation column in Full Table view: code input field + sent toggle button. DB migration + API routes + `LocalGuest` interface updated. |

#### Phase 2B: RSVP Engine — ✅ IMPLEMENTATION DONE (2026-03-30, completed 2026-04-07)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | DB schema — `rsvpToken`, `rsvpMessage`, `rsvpSubmittedAt` on `WeddingGuest` | ✅ Done | Added via `scripts/add-rsvp-cols.mjs` raw SQL. `rsvpToken TEXT UNIQUE`, `rsvpMessage TEXT`, `rsvpSubmittedAt TIMESTAMPTZ`. Schema updated in `prisma/schema.prisma`. |
| 2 | Conditional RSVP form | ✅ Done + Tested (enhanced 2026-04-08) | Attending → dietary checkboxes (Vegetarian, Vegan, Gluten-free, Dairy-free, Halal) + custom text + message. Not Attending → message only. Comma-separated storage — backward compatible. **Tested 2026-04-08:** dietary checkboxes + "Other" free-text, submit → dietary shown in Guests list, dietary cycling icon (🍽️) on guest row ✓ |
| 3 | RSVP statuses | ✅ Done | Existing `RsvpStatus` enum used: PENDING / ATTENDING / NOT_ATTENDING |
| 4 | Unique RSVP URL per guest | ✅ Done | `POST /api/planner/projects/[id]/guests/[guestId]/token` generates `randomBytes(16).toString("hex")` token, stores in DB, returns URL `/rsvp/[token]` |
| 5 | QR code generation | ✅ Done | `qrcode` package installed. `RsvpLinkModal` component generates QR PNG via `QRCode.toDataURL()`. Modal shows QR + copy link button. Accessible from guest row (hover → link icon) and full-table view. |
| 6 | Public RSVP page | ✅ Done | `src/app/rsvp/[token]/page.tsx` — no auth required, shows event name + date, attending/declining toggle, dietary + message fields, confirmation screen |
| 7 | Email notifications | ✅ Done (2026-04-05) | Fire-and-forget after RSVP submission — couple gets HTML email with guest name, status, dietary, message via Nodemailer |
| 8 | Guest list integration | ✅ Done | Link icon button on hover in all 3 views. Calls token API once, caches in state. `isLocal` guests hide the button. |
| 9 | Custom RSVP questions | ✅ Done (2026-04-07) | New `RsvpQuestion` model (text, type: SHORT_TEXT/LONG_TEXT/SINGLE_CHOICE/MULTIPLE_CHOICE, options JSON, required, order) + `RsvpAnswer` model (guestId+questionId unique). DB migration via `scripts/add-rsvp-questions.mjs`. API: `GET+POST /rsvp-questions`, `PUT+DELETE /rsvp-questions/[questionId]`. Public RSVP API: GET returns questions + existing answers; POST accepts `answers` map + upserts. Planner UI: "RSVP Questions" button → modal. Public form: renders by type (input/textarea/radio/checkbox), pre-fills answers. |
| 10 | GDPR consent checkbox | ✅ Done (2026-04-07) | `gdprConsentAt DateTime?` on `WeddingGuest`. Required consent checkbox on public RSVP form (Shield icon) — disables submit until checked. POST sets `gdprConsentAt` when `gdprConsent: true`. Pre-filled on re-open. |
| 11 | SMS delivery (Elite) | ✅ Done (2026-04-07) | `POST /api/.../guests/[guestId]/sms` — supports `46elks` + `twilio` via `SMS_PROVIDER` env var. Returns 501 if unconfigured. Smartphone icon on Full Table row hover (guests with phone only). Required env vars: `SMS_PROVIDER`, provider credentials. |

**Files created/modified (Phase 2B):**
- `scripts/add-rsvp-cols.mjs` — raw SQL to add RSVP columns (original)
- `scripts/add-rsvp-questions.mjs` — raw SQL: RsvpQuestion + RsvpAnswer tables + gdprConsentAt column
- `prisma/schema.prisma` — `rsvpToken`, `rsvpMessage`, `rsvpSubmittedAt`, `gdprConsentAt` on `WeddingGuest`; new `RsvpQuestion`, `RsvpAnswer` models; `RsvpQuestionType` enum
- `src/app/api/rsvp/[token]/route.ts` — public GET (fetch guest info + questions + answers) + POST (submit RSVP)
- `src/app/api/planner/projects/[id]/guests/[guestId]/token/route.ts` — generate/get RSVP token
- `src/app/api/planner/projects/[id]/guests/[guestId]/sms/route.ts` — send RSVP link via SMS (46elks/Twilio)
- `src/app/api/planner/projects/[id]/rsvp-questions/route.ts` — GET+POST custom questions
- `src/app/api/planner/projects/[id]/rsvp-questions/[questionId]/route.ts` — PUT+DELETE custom question
- `src/app/rsvp/[token]/page.tsx` — public RSVP form (custom questions + GDPR consent)
- `src/app/planner/[id]/guests/page.tsx` — RSVP Questions manager modal + SMS button

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
| 11 | Pie chart visualization | ⬜ Pending | Budget breakdown by category as pie chart |
| 12 | Overspending alerts | ⬜ Pending | Blueprint: visual warning when actual > planned per category |
| 13 | Cost-per-head analysis | ⬜ Pending | Blueprint: total budget ÷ guest count — shows per-person cost live |
| 14 | Contingency fund recommendation | ⬜ Pending | Blueprint: suggest 12–15% buffer, shown as a recommendation card |
| 15 | Multi-currency support | ⬜ Pending | Blueprint: Premium feature — select currency per project (SEK, USD, EUR, GBP) |

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

**Phase 2 Status:** ✅ IMPLEMENTATION DONE (2026-04-07) — all sub-phases + enhancements complete (2F done)

> **Blueprint gap (not yet planned):** Phase 2B items #9–11 (custom RSVP questions, GDPR consent, SMS), Phase 2C items #12–15 (overspending alerts, cost-per-head, contingency fund, multi-currency) — to be planned in a future enhancement phase.
> ~~Phase 2A items #22–26 (plus-one, chief guest, family grouping, bulk actions, invitation assignment) — ✅ Done 2026-04-07~~

---

#### Phase 2E: Files Tab — ⬜ NOT STARTED

**Blueprint:** Dashboard has 13 tabs — "Files" is one of them (document storage). Currently missing from dev plan and not implemented.

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Prisma schema — `ProjectFile` model | ⬜ Pending | fileName, fileUrl, fileType, fileSize, uploadedAt, projectId |
| 2 | File upload API | ⬜ Pending | `POST /api/planner/projects/[id]/files` — upload to Cloudflare R2, save metadata to DB |
| 3 | File list API | ⬜ Pending | `GET /api/planner/projects/[id]/files` — list all uploaded files |
| 4 | File delete API | ⬜ Pending | `DELETE /api/planner/projects/[id]/files/[fileId]` — delete from R2 + DB |
| 5 | Files page UI | ⬜ Pending | `/planner/[id]/files` — drag-drop upload zone, file list with preview/download/delete |
| 6 | Sidebar nav item | ⬜ Pending | Add "Files" between Notes and Post-Event in sidebar (matching blueprint menu order) |

---

#### Phase 2F: Settings Tab & Blueprint Completions — ✅ IMPLEMENTATION DONE (2026-04-07)

**Goal:** Complete the Settings tab and remaining blueprint features not yet in any phase.

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Copy project | ✅ Done (2026-04-07) | Settings page → "Duplicate Project" button. DB: `POST /api/planner/projects/[id]/copy` copies guests (reset RSVP), budget categories+items, checklist (reset completion), itinerary, notes, venues, vendors. Local: copies all localStorage keys to new project UUID. Redirects to new project settings. |
| 2 | Accessibility mode toggle | ✅ Done (2026-04-07) | Settings page → toggle saved to `localStorage("planner-a11y")`. Applies `planner-a11y` class to `document.documentElement`. |
| 3 | Customize feature visibility | ✅ Done (2026-04-07) | Settings page → per-tab on/off toggles. Hidden tabs stored in `localStorage("planner-hidden-tabs-${projectId}")` as `string[]`. Also synced to `project.settings.hiddenTabs` for DB projects. Sidebar reads localStorage and filters nav items — groups with all children hidden are fully hidden. Overview and Settings always visible. |
| 4 | Share project | ✅ Done (2026-04-07) | `shareToken String? @unique` + `shareEnabled Boolean` added to WeddingProject. Settings page toggle + link display + copy button + QR code (via `qrcode` package). Public page at `/planner/share/[token]` shows read-only overview (couple names, date, venues, vendor list, guest count, checklist progress). Local projects: "Sign in to share" message. |
| 5 | Itinerary PDF/XLS export | ✅ Done (2026-04-07) | Itinerary page → "Download XLS file" button next to existing PDF button. Uses `xlsx` package (already installed). Exports: Time, Duration, Event, Location columns. Filename includes event date. |
| 6 | Ceremony/Reception PDF summary | ✅ Done (2026-03-31) | Already implemented in Phase 3B — `@react-pdf/renderer` A4 PDF on both ceremony + reception pages with all venue fields. |

**Files created/modified (Phase 2F — 2026-04-07):**
- `prisma/schema.prisma` — Added `shareToken String? @unique`, `shareEnabled Boolean @default(false)` to WeddingProject
- `scripts/add-project-sharing.mjs` — SQL migration script
- `src/app/api/planner/projects/[id]/copy/route.ts` — **Created** — POST copies full project
- `src/app/api/planner/projects/[id]/share/route.ts` — **Created** — GET share status, POST toggle sharing
- `src/app/api/planner/share/[token]/route.ts` — **Created** — GET public read-only project data (no auth)
- `src/app/planner/share/[token]/page.tsx` — **Created** — Public read-only project overview page
- `src/app/planner/[id]/settings/page.tsx` — **Modified** — Added Copy, Tab Visibility, Share, Accessibility sections
- `src/app/planner/[id]/itinerary/page.tsx` — **Modified** — Added XLS export button (xlsx library)
- `src/components/planner/sidebar.tsx` — **Modified** — Reads `planner-hidden-tabs-${projectId}` from localStorage, filters nav items + groups

---

### Phase 3: Visual Editors — 🔄 IN PROGRESS (3A ✅ · 3B ✅ · 3C ✅ · 3D ⬜)

> **3A Enhancement (2026-04-06):** Atlas Layout Editor added (tasks #25–27) — full-screen overlay editor for the Alphabetical Guest Atlas tab with live preview + 14 settings controls + by-table display mode + settings persist after close.
> **3A UI Polish (2026-04-06):** Atlas panel alignment fixed (tasks #28–29) — `zoom` instead of `transform`, `w-fit` container, `shadow-xl` removed, Recommendation box + Gallery section added. Preview now matches ceremony/reception tab structure exactly.
> **3A Name Cards Redesign (2026-04-06):** Classic Name Cards tab (task #32) — replaced static SVG grid with full `NameCardsPanel`: 4 SVG card templates, per-guest navigation arrows, template dropdown, honorific/table/course options, Download PDF button.
> **3A Table Numbers Redesign (2026-04-06):** Table Numbers tab (task #34) — replaced static grid with `TableNumbersPanel`: 3 SVG card templates (Standard/Wide/Tall), font selectors, editable text inputs, rounded corners slider, Preview Result (new tab view), Download PDF (auto-print), localStorage persistence.

**Goal:** Build the 3 visual editor tools
**Depends on:** Phase 2 completed

#### Phase 3A: Seating Chart Editor — ✅ IMPLEMENTATION DONE (2026-03-31, enhanced 2026-04-06, completed 2026-04-08)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Canvas setup (Konva.js) | ✅ Done | Zoom/pan, draggable, responsive resize |
| 2 | Table types (7 types) | ✅ Done | Round, Rectangular, Square, Oblong, Half-round, Row, Buffet |
| 3 | Dual layouts | ✅ Done | Ceremony ⛪ + Reception 🥂 layout tabs, full CRUD |
| 4 | Starter templates (6) | ✅ Done (2026-04-08) | 6 pre-built reception layout templates: Standard, Banquet (5 long tables), U-Shape (3 tables + dance area), Classroom (4×4 square tables), Theater (stage + 10 chair rows), Cocktail (6 round + 2 buffet). Templates button in reception editor toolbar. Modal with SVG previews. |
| 5 | Guest assignment | ✅ Done | Search modal, bride/groom indicators, RSVP status |
| 6 | Guest avatars | ✅ Done | Colored dots (rose=bride, blue=groom) per occupied seat |
| 7 | History/snapshots | ✅ Done (2026-04-08) | Manual snapshots (max 5) with timestamps. Clock icon in toolbar → History panel. Save/Restore buttons. Persisted to `snapshots-ceremony-{id}` / `snapshots-reception-{id}` localStorage. |
| 8 | Catering mode toggle | ✅ Done (2026-04-08) | Toggle in Reception tab. Per-table dietary summary: Table \| Total \| Vegan \| Gluten-free \| Vegetarian \| Standard. Guest dietary set via guest list hover → click UtensilsCrossed icon to cycle: None → Vegetarian → Vegan → Gluten-free → Halal. |
| 16 | QR Entrance Mode | ✅ Done (2026-04-08) | `/seat-finder/[projectId]` link shown in Reception tab with Copy button + "Open Entrance Scanner" new-tab link. Venue staff can search guests by name on mobile. |
| 17 | Upload venue SVG blueprint | ✅ Done (2026-04-08) | "Upload Blueprint" button in ceremony + reception editors. Image rendered as canvas background. Opacity slider (10–100%) in right panel. Persisted to `venue-bg-ceremony-{id}` / `venue-bg-reception-{id}` localStorage. Preview also shows blueprint on main seating page. |
| 18 | Export PDF — full set | ✅ Done (2026-04-08) | PDF via `downloadLayoutPDF()` (print-to-PDF). Guest CSV export: `exportGuestCSV()` — columns: Guest Name, Table Name, Seat #, Dietary, RSVP Status. BOM prefix for Excel compatibility. Filename: `seating-chart.csv`. |
| 19 | Export Excel | ✅ Done (2026-04-08) | CSV export covers XLS use-case (BOM-prefixed, opens correctly in Excel). |
| 9 | Export PNG | ✅ Done | Full canvas PNG via Konva toDataURL @2x |
| 10 | Checklist & cleanup | ✅ Done | All seating flows working (local + API modes) |
| 11 | Reference UI redesign — Seating Chart & Supplies | ✅ Done | Full page redesign matching planning.wedding reference. 7 tab cards (Ceremony Layout, Reception Layout, Alphabetical Guest Atlas, Seating Cards by Table, Classic Name Cards, Table Numbers, Reception Menu). Dashed SVG curve connector from selected tab to content. Ceremony tab: live SVG diagram (arch + curved near-arch rows + 8 numbered pew rows + center aisle gradient). Reception tab: SVG diagram (9 round tables + seats + dance floor). "Click here to edit layout" → toggles canvas editor inline with ← Back button. Download PDF button, Recommendation box, gallery placeholder row. Other 5 tabs: proper SVG preview diagrams. Default tab = Reception Layout on direct sidebar click. |
| 12 | Alphabetical Guest Atlas — real data | ✅ Done (2026-04-03) | Replaced hardcoded fake data with real guest list. `buildGuestTableMap()` builds `Map<guestId, tableName>` from all seating layout `guestIds`. Sorted alphabetically by last name → first name (`localeCompare`). Grouped by first letter. 4-column CSS layout with purple bold letter headers + dotted leader lines. Table lookup: seating layout guestIds first → falls back to guest `tableNumber` field. Empty state message. Stats: "Total X guests / Seated X guests / Let's seat more guests on the layout" link. Matches planning.wedding reference design exactly. |
| 13 | Tab URL sync | ✅ Done (2026-04-03) | Tab switch updates `?tab=atlas` (etc.) via `window.history.replaceState()`. Page reload preserves selected tab. Default (Reception Layout) keeps clean URL with no param. |
| 14 | Sidebar highlight fix — "Plan venue layout" navigation | ✅ Done (2026-04-03) | When navigating from Ceremony/Reception page "Plan venue layout" CTA → seating page, sidebar now correctly keeps "Ceremony"/"Reception" highlighted (not "Seating Chart & Supplies"). Implemented via `?src=ceremony` / `?src=reception` query param passed on navigation. Sidebar `isActive()` reads param via `useSearchParams()` (requires `Suspense` boundary — split into `SidebarInner` + `PlannerSidebar` wrapper). Seating page navigates with `router.push('/planner/${id}/seating?tab=ceremony&src=ceremony')`. |
| 15 | Shared SVG venue diagrams | ✅ Done (2026-04-03) | Extracted `CeremonyDiagram` + `ReceptionDiagram` into `src/components/planner/venue-diagrams.tsx` to avoid duplication between seating page and ceremony/reception pages. |
| 16 | Ceremony Layout Editor — full-screen canvas | ✅ Done (2026-04-06) | Separate dedicated editor page at `/planner/[id]/seating/ceremony-layout-edit`. Full-screen overlay (`fixed inset-0 z-50`) bypasses sidebar/header layout. Custom drag-and-drop via `mousedown`/`mousemove`/`mouseup`. Zoom wheel (0.25×–3×). Elements: arch (custom SVG), aisle, rows of chairs (numbered circles). Right-side context panel (Layout settings / Custom SVG / Aisle / Row of Chairs). Add Element dropdown. Auto-save to localStorage on every change. Close → `router.push(/planner/${id}/seating?tab=ceremony)`. Matches planning.wedding reference design. |
| 17 | Ceremony tab → new editor navigation | ✅ Done (2026-04-06) | `seating/page.tsx` ceremony tab "Click here to edit layout" now navigates to `/planner/[id]/seating/ceremony-layout-edit` via `router.push()`. Old `editMode` Konva canvas block fully removed (see task 24). |
| 18 | Add Element comprehensive panel | ✅ Done (2026-04-06) | Replaced simple dropdown with full-screen slide-in panel matching planning.wedding reference. 4 categories: Tables with seats (6), Tables without seats for buffet (4), Custom elements (2), Other assets (43). Search filter. SVG thumbnail grid (3 columns). `ElementKind` expanded to 13 types + `assetType` field. `handleAddElement()` creates correct defaults. |
| 19 | Ceremony layout preview — larger + guest names | ✅ Done (2026-04-06) | `wide` prop on `LayoutPanel` expands from `max-w-xs` → `w-full`. `CeremonyLayoutPreview` accepts `guests` prop, shows first names in seat circles. All 13 element types rendered in preview. `PreviewElement` interface updated. |
| 20 | PDF download — functional | ✅ Done (2026-04-06) | `downloadLayoutPDF()` opens new window with SVG + A1 landscape CSS + `window.print()` auto-trigger. `pdfSvgId` prop on `LayoutPanel`. Ceremony tab passes `pdfSvgId="ceremony-layout-svg"`. |
| 21 | Recommendation section — matches reference | ✅ Done (2026-04-06) | Clean white card with `border border-gray-200 rounded-xl bg-white` styling. Removed purple gradient border. Matches planning.wedding reference exactly. |
| 22 | Reception layout editor — dedicated page | ✅ Done (2026-04-06) | Created `src/app/planner/[id]/seating/reception-layout-edit/page.tsx` as full copy of ceremony editor with 5 differences: (1) storage key `reception-layout-${projectId}`, (2) default layout — 8 round tables in 3-2-3 pattern + dance floor asset + 1 long head table, (3) close → `?tab=reception`, (4) export name `ReceptionLayoutEditPage`, (5) paper label "A1 landscape 33.1 × 23.4 inch". |
| 23 | Reception tab wired up | ✅ Done (2026-04-06) | `seating/page.tsx` reception tab: `receptionElements` state loads from `reception-layout-${projectId}` localStorage on tab switch. Preview uses `CeremonyLayoutPreview` with `svgId="reception-layout-svg"` + `guests` prop (guest names in seats). `LayoutPanel` gets `wide`, `pdfSvgId="reception-layout-svg"`, `onEdit` → `router.push(.../reception-layout-edit)`. Falls back to `ReceptionDiagram` if no saved layout. `CeremonyLayoutPreview` updated with `svgId` prop to support both ceremony and reception SVG IDs. |
| 24 | Dead Konva canvas block removed | ✅ Done (2026-04-06) | Deleted entire `if (false) { ... }` unreachable block + all associated dead code from `seating/page.tsx`: helper components `TABLE_TYPES`, `SeatingCanvas` (dynamic import), `AssignModal`, `TableIcon`, `TableTypePicker`; state vars `selectedTableId`, `assignModal`, `creatingLayout`, `stageRef`; functions `createLayout`, `deleteLayout`, `addTable`, `moveTable`, `deleteTable`, `saveGuestAssignment`, `guestName`; const `selectedTable`, `totalSeated`, `totalCapacity`. Unused imports cleaned (`dynamic`, `Trash2`, `ChevronDown`, `Check`, `Circle`, `Square`, `RectangleHorizontal`, `ArrowLeft`, `addLocalSeatingLayout`, `deleteLocalSeatingLayout`, `addLocalSeatingTable`, `updateLocalSeatingTable`, `deleteLocalSeatingTable`). Zero TypeScript errors in seating files. |
| 25 | Atlas Layout Editor — full-screen overlay | ✅ Done (2026-04-06) | "Click here to edit layout" on the Alphabetical Guest Atlas tab now opens a full-screen overlay editor (`fixed inset-0 z-50`) matching the planning.wedding reference. Top bar: Close (returns to atlas tab, preserving settings), File (triggers print/PDF), + Add element buttons. Left/center area: scrollable live preview of the `AtlasPreviewDoc` document (595×842px white card, "Please find your seat!" header, guest list with dotted leader lines + table numbers). Right sidebar (224px): "Guest list" heading + full settings panel. New `AtlasSettings` interface with 14 settings fields. `DEFAULT_ATLAS_SETTINGS` constant. `atlasEditMode` + `atlasSettings` state in `SeatingPage`. `AtlasPreviewDoc` component (pure, reusable). `AtlasLayoutEditor` component (full-screen, stateless). |
| 26 | Atlas "Display mode" — By table grouping | ✅ Done (2026-04-06) | `AtlasPreviewDoc` now supports two display modes: **Alphabetical** (groups by first letter of last/first name based on "Group by" setting — existing behavior) and **By table** (groups guests by their assigned table name from `buildGuestTableMap()`, sorted numerically via `localeCompare({numeric:true})`; unassigned guests grouped under "Unassigned" at end). Selecting "By table" in the Display mode dropdown shows table names as group headers instead of letters. |
| 27 | Atlas main panel connected to `atlasSettings` | ✅ Done (2026-04-06) | `AlphabeticalAtlasPanel` now accepts `settings: AtlasSettings` prop and uses `AtlasPreviewDoc` for its preview card (scaled to 72% via CSS `transform: scale(0.72)` with negative bottom margin to collapse whitespace). Previously had hardcoded sorting/grouping logic. Now after closing the editor, all changes (fonts, spacing, display mode, name format, etc.) are reflected in the main seating tab preview. `atlasSettings` passed from `SeatingPage` to both `AlphabeticalAtlasPanel` and `AtlasLayoutEditor`. |
| 28 | Atlas panel — alignment fix + Recommendation + Gallery | ✅ Done (2026-04-06) | Fixed broken layout below atlas preview card. Root cause: `transform: scale(0.72)` does not affect document flow — element still occupied original height; `marginBottom: "-28%"` was a percentage-of-width hack that only partially compensated. Fix: replaced with `zoom: 0.72` (affects document flow correctly, no negative margin needed). Changed panel wrapper `max-w-4xl` → `max-w-xl` to match `LayoutPanel` width. Added `useState(0)` + `useRef` for gallery photo selection. Added **Recommendation box** (white card, "For printing, opt for thick paper...") matching `LayoutPanel` pattern. Added **Gallery section** (scrollable photo row with dot indicators, reuses `GALLERY.cards` photos). Atlas tab now structurally identical to ceremony/reception tabs below the preview card. |
| 29 | Atlas preview — size increase + right-side blur fix | ✅ Done (2026-04-06) | Two issues resolved: (1) Preview was smaller than needed — increased `zoom: 0.72` → `zoom: 0.95` and widened panel `max-w-xl` → `max-w-2xl` so the 595px A4 document displays at near full-size. (2) Visible blur/ghost line on right side of preview card — caused by `shadow-xl` on the inner `AtlasPreviewDoc` div bleeding through the `overflow-hidden` container when `zoom` is applied. Fix: removed `shadow-xl` from `AtlasPreviewDoc` (outer container's `shadow-sm` is sufficient). (3) Right-side gray gap between preview card and container — added `w-fit` to the preview wrapper div so it shrinks to content width (595px × 0.95 = ~565px) rather than expanding to fill `max-w-2xl` (672px). |
| 30 | Seating Cards by Table — dedicated editor page | ✅ Done (2026-04-06) | Created `src/app/planner/[id]/seating/cards-edit/page.tsx`. Two-mode full-screen editor: **Layout mode** (dark `#1c1b2e` header; canvas renders reception layout tables from `reception-layout-${projectId}` localStorage as SVG shapes — circles for round, rectangles for long/square; click any table → card mode; right panel: "How to display guests' names" orange header, 3 icon-style buttons (full/colored/generic), radio options, Font scheme/Color scheme/Paper expandable rows, tables list; settings saved to `cards-settings-${projectId}`). **Card mode** (white header; left/right nav arrows; large card preview — `SeatingCard` component with dashed border, "Table" in cursive script, bold table name, dashed separator, guest names; right panel: Table ID label, "You can edit table ID on the reception layout" note, font ◄►  selector across 6 fonts, font size input, dot-nav between tables, "← Back to layout" button). Routing fix: `cards` tab `onEdit` now routes to `/seating/cards-edit` (was incorrectly `/reception-layout-edit`). |
| 31 | Seating Cards by Table — preview redesign (reference match) | ✅ Done (2026-04-06) | `?tab=cards` preview on `seating/page.tsx` completely redesigned to match planning.wedding reference. Replaced old 4-card SVG grid with new `SeatingCardsPanel` + `ClipboardHanger` components. **Preview shows:** clipboard hanger SVG decoration at card top; "Table" in Dancing Script cursive font (loaded via inline `@import` Google Fonts); table number/name in very large (68px) bold — auto-extracts number from "Table X" pattern; thin divider; guest names in Georgia serif. **Navigation:** left/right arrow buttons (ChevronLeft/ChevronRight) to browse all tables. **Below card:** "Click here to edit layout" purple link; "Format 4.33 inch × 7.87 inch"; "Total X table cards" count; "Preview Result" button (purple/lavender, Eye icon); "Download PDF file" + ← arrow; Recommendation card. Tables loaded from `reception-layout-${projectId}` localStorage via new `cardsIndex` + `cardsTables` state + dedicated `useEffect`. Fallback: placeholder "Guest name 1–6" when no guests assigned. |
| 32 | Classic Name Cards — full redesign (reference match) | ✅ Done (2026-04-06) | `?tab=name-cards` completely redesigned to match planning.wedding reference. Replaced old static `NameCardsDiagram` SVG grid with new `NameCardsPanel` + `NameCardSvg` components. **New `NameCardSvg` component** — 4 SVG templates: `classic` (rounded card, bottom purple gradient bar, text area), `classic-circle` (circle cutout at top, purple gradient band), `classic-triangle` (triangle cutout at top — default), `simple` (plain card, no decoration). Renders guest name (first name only, full name, or last-first based on setting); optionally shows table label and honorific. **`NameCardsPanel` features:** large centered card preview (160×200 viewBox SVG); ‹/› navigation arrows to browse guests; `cardIndex` state; template dropdown (4 options, selected highlighted in blue-600); 3 option checkboxes (honorific prefix, table number, course icon); total guest count; 2 radio options (confirmed guests only / print one empty card); purple "Download PDF" button; "Recommendation" white card box (thick paper printing tip). No new API routes — purely client-side, uses existing `guests` + `layouts` props already loaded in `SeatingPage`. |
| 33 | Settings persistence — Name Cards + Atlas editor | ✅ Done (2026-04-06) | Both settings panels now persist across page refresh via `localStorage`. **Name Cards:** `NameCardsPanel` accepts `projectId` prop; all 5 settings (template, showHonorific, showTableNumber, showCourseIcon, confirmedOnly, printEmpty) lazily loaded from `name-cards-settings-${projectId}` on mount via `useState` initializer functions; `useEffect` saves to localStorage on every change. **Atlas editor:** `atlasSettings` state in `SeatingPage` lazily loaded from `atlas-settings-${projectId}` on mount (spread-merged with `DEFAULT_ATLAS_SETTINGS` as fallback for missing keys); `onSettingsChange` callback wraps `setAtlasSettings` + `localStorage.setItem` so every slider/toggle/select change in the editor is immediately persisted. Storage keys: `name-cards-settings-${projectId}`, `atlas-settings-${projectId}`. |
| 35 | Reception Menu tab — full implementation (reference match) | ✅ Done (2026-04-06) | `?tab=menu` preview redesigned + dedicated `/menu-edit` editor created. **`menu-edit/page.tsx`:** full-screen editor matching planning.wedding reference — clickable sections (each section is selectable; selected gets purple dashed outline); right panel switches dynamically — when element selected → shows type label (Paragraph / Second heading / etc.), editable textarea, `x: N  y: N` position (computed via `getBoundingClientRect` relative to card), red Delete button; when nothing selected → global style panel (Template dropdown: Basic/Elegant/Minimal; Main heading font ◄► + size slider 10–130; Second heading font ◄► + size 10–60; Paragraph font ◄► + size 10–40). "Add element" dropdown (Main heading / Second heading / Paragraph / Flourish) — newly added element auto-selects immediately (via `setSelectedId(newId)` + position-recompute `useEffect`). Default sections: Flourish → Appetizer → Salad → Entrees (with OR) → Dessert → Heading (10 sections). Card renders sections with font scale factors (mainPx = size×0.50, secondPx = size×0.65, paraPx = size×0.65). Google Fonts (Overlock, Playfair Display, Dancing Script) loaded via inline `<style>` tag. `localStorage` persistence: `menu-sections-${projectId}`, `menu-settings-${projectId}`. Close → `?tab=menu`. **`ReceptionMenuPanel` (in `seating/page.tsx`):** replaced hardcoded "Garden Salad / Grilled Salmon" static HTML with dynamic rendering from localStorage. `useEffect` loads `menu-sections-${projectId}` + `menu-settings-${projectId}` on mount; falls back to default 10 sections + default settings. Preview card (maxWidth 480px, HTML-based, not SVG) renders: fixed "RECEPTION" header + "Menu" title (italic, mainHeadingFont) + ✦ ✦ ✦; then maps each saved section — `second-heading` → uppercase letter-spaced label; `paragraph` → Georgia serif with italic detection; `main-heading` → bold heading; `flourish` → ✦ ✦ ✦. Font scaling: mainPx = size×0.60, secondPx = size×0.50, paraPx = size×0.70. Routing fix: `menu` tab `onEdit` now routes to `/seating/menu-edit` (was incorrectly `/reception-layout-edit`). `projectId` prop added to `ReceptionMenuPanel`. |
| 34 | Table Numbers tab — full redesign (reference match) | ✅ Done (2026-04-06) | `?tab=table-numbers` completely redesigned to match planning.wedding reference. Replaced old `TableNumbersDiagram` SVG grid + `LayoutPanel` with new `TableNumberCardSvg` + `TableNumbersPanel` components. **`TableNumberCardSvg`** — 3 templates: `standard` (rounded rect), `wide` (oval/near-circle), `tall` (narrow tall rect); inner decorative dashed border; "Table" text top; large number center; "#hashtag" text bottom; card stand SVG (circle connector + vertical rod + double base plate). **`TableNumbersPanel` features:** ‹/› navigation arrows (tables from `reception-layout-${projectId}` localStorage, fallback 5 placeholders); settings panel with header toggle — template dropdown (Standard/Wide/Tall, selected = blue-600); number font ◄► (6 fonts: Xarrovv/Georgia/Playfair/Cinzel/Cormorant/Serif); "Table" text input; hashtag text input; hashtag font ◄► (5 fonts); rounded corners slider (0–130); total count; **Preview Result** button (opens new tab, all cards shown, no auto-print); **Download PDF file** button (opens new tab, triggers `window.print()` auto for save-as-PDF); Recommendation box; Gallery section. All settings persist in `table-numbers-settings-${projectId}` localStorage. Container width adapts per template (wide=240px, tall=160px, standard=200px); `items-start` alignment prevents tall-card clipping. |

**Files created/modified:**
- `src/app/planner/[id]/seating/ceremony-layout-edit/page.tsx` — **Created (2026-04-06)** — full-screen ceremony layout canvas editor; **Rewritten (2026-04-06)** — expanded ElementKind (13 types), AddElementPanel (4 categories, 43+ items, search), TableCanvasElement, AssetCanvasElement, AssetIcon (40+ SVGs), getTableSeatPositions()
- `src/app/planner/[id]/seating/reception-layout-edit/page.tsx` — **Created (2026-04-06)** — full copy of ceremony editor with reception-specific defaults (8 round tables + dance floor + head table), storage key, close navigation, and export name
- `src/app/planner/[id]/seating/menu-edit/page.tsx` — **Created (2026-04-06)** — full-screen reception menu editor; clickable/selectable sections with dashed outline; right panel switches between element-specific (editable textarea + x/y + Delete) and global style (Template dropdown + 3 font/size controls); "Add element" dropdown auto-selects newly added element; localStorage persistence (`menu-sections-${projectId}`, `menu-settings-${projectId}`); Close → `?tab=menu`
- `src/app/planner/[id]/seating/cards-edit/page.tsx` — **Created (2026-04-06)** — two-mode full-screen seating cards editor (layout view + card view); reads reception layout from localStorage; saves settings to `cards-settings-${projectId}`
- `src/app/planner/[id]/seating/page.tsx` — **Rewrote** → full preview design; 7 tabs; SVG diagrams; TabConnector; LayoutPanel; AlphabeticalAtlasPanel; buildGuestTableMap(); URL tab sync. **Modified (2026-04-06)** × multiple passes — ceremony/reception editor navigation, PreviewElement 13 types + guestIds + assetType, CeremonyLayoutPreview svgId + guest names, wide LayoutPanel, PDF download (both tabs), receptionElements state + localStorage, recommendation restyled, dead Konva block + all associated code deleted, unused imports removed. Zero TypeScript errors. **Modified (2026-04-06, Atlas editor pass)** — Added `AtlasSettings` interface + `DEFAULT_ATLAS_SETTINGS` + `ALPHABET_FONTS` + `NAMES_FONTS` constants; `AtlasPreviewDoc` component; `AtlasLayoutEditor` component; `atlasEditMode` + `atlasSettings` state. **Modified (2026-04-06, Atlas UI polish pass)** — `zoom: 0.95`, `w-fit`, gallery, Recommendation box. **Modified (2026-04-06, Seating Cards pass)** — Added `ClipboardHanger` SVG + `SeatingCardsPanel` components; `cardsIndex` + `cardsTables` state; `useEffect` for loading tables from reception layout; `cards` tab replaced `LayoutPanel` with `SeatingCardsPanel`; routing fix (`cards-edit`); `ChevronLeft`, `ChevronRight`, `Eye` added to lucide imports. **Modified (2026-04-06, Classic Name Cards pass)** — Replaced static `NameCardsDiagram` SVG with `NameCardSvg` (4 templates) + `NameCardsPanel` components; `cardIndex` state + navigation arrows; template dropdown; honorific/table/course checkboxes; confirmed-only/empty-card radio; Download PDF button; Recommendation box. `name-cards` tab renders `NameCardsPanel` instead of `NameCardsDiagram`. **Modified (2026-04-06, settings persistence pass)** — `atlasSettings` state lazy-initialized from `atlas-settings-${projectId}` localStorage; `onSettingsChange` saves on every change. `NameCardsPanel` gains `projectId` prop; all settings lazy-loaded from `name-cards-settings-${projectId}`; `useEffect` auto-saves on every change. **Modified (2026-04-06, Table Numbers pass)** — Replaced `TableNumbersDiagram` + `LayoutPanel` for `table-numbers` tab with `TableNumberCardSvg` (3 templates, dashed inner border, stand SVG) + `TableNumbersPanel` (navigation, template dropdown, 2× font selectors, text inputs, rounded corners slider, Preview Result → new tab view, Download PDF → auto-print, localStorage persistence via `table-numbers-settings-${projectId}`). Navigation row changed to `items-start` to prevent tall-card clipping. `buildCardsHtml()` shared helper for preview + download.
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

#### Phase 3C: Website Builder — ✅ IMPLEMENTATION DONE (2026-03-31, enhanced 2026-04-08)

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
| 14 | SEO Module + Password enforcement (Spreadsheet #31) | ✅ Done + Tested (2026-04-08) | **Custom meta tags:** `generateMetadata` on `/wedding/[slug]` — generates `<title>` + `<meta name="description">` from site blocks. **Password/visibility:** `PasswordGate` client component — password prompt with show/hide toggle, Enter key submit, wrong-password error, sessionStorage persistence. **Tested 2026-04-08:** meta title visible in browser tab, correct/incorrect password, sessionStorage persistence on refresh, incognito tab ✓ |
| 15 | Logo upload — Cover block (Spreadsheet #28) | ✅ Done + Tested (2026-04-08) | `logoUrl` field in Cover block settings — URL input + file upload + remove. Logo rendered above couple names on public page. **Tested 2026-04-08:** upload PNG, live preview update, remove logo ✓ |
| 16 | Google Maps embed — Venue block (Spreadsheet #29) | ✅ Done + Tested (2026-04-08) | `ceremonyMapQuery` + `receptionMapQuery` fields in Venue block settings. Public page renders `<iframe>` maps via `maps.google.com/maps?q=...&output=embed` — no API key required. **Tested 2026-04-08:** ceremony + reception map queries, iframe renders on public page ✓ |
| 17 | Template System — 10 templates (Spreadsheet #26) | ✅ Done + Tested (2026-04-08) | 10 pre-built templates: Classic Elegance, Modern Romance, Rustic Garden, Minimalist Chic, Grand Celebration, Boho Dreams, Nordic Simple, Romantic Sunset, Garden Party, Story & Joy. Each template defines theme+colors+font+blocks. "Templates" button opens picker modal with mini thumbnail preview. Applying replaces blocks+theme. **Tested 2026-04-08:** Classic Elegance (5 blocks), Grand Celebration (9 blocks), Minimalist Chic (3 blocks) — preview updates immediately ✓ |
| 18 | Live Visual Editor (Spreadsheet #27) | ✅ Done + Tested (2026-04-08) | Two-column layout on lg+: left panel = scrollable block editor, right panel = always-visible live preview. Click any section in preview → auto-expands corresponding block settings + scrolls left panel. Hover highlight + active blue ring on selected block. Preview shows mock browser frame with URL bar. **Tested 2026-04-08:** hover ring, click-to-expand, real-time sync (800ms debounce), theme switch, mobile single-column, save/refresh persistence ✓ |

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

#### Phase 3D: Invitation Designer — ⬜ NOT STARTED

**Blueprint:** Full invitation design system — templates, customization, multi-channel delivery, tracking.

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Template system (10+) | ⬜ Pending | Blueprint: Letterpress, rustic, elegant, minimalist styles — theme engine matches wedding website |
| 2 | Customization editor | ⬜ Pending | Colors, fonts, logo upload, couple photo, live preview |
| 3 | QR code per invitation | ⬜ Pending | Each guest gets unique QR → RSVP link embedded in their invitation |
| 4 | Multi-channel delivery | ⬜ Pending | Email (HTML + attached PDF), shareable link, SMS (Elite) |
| 5 | Tracking dashboard | ⬜ Pending | Open rate, RSVP response rate, bounces |
| 6 | Export digital + print PDF | ⬜ Pending | 300 DPI print-ready A5/A4 PDF per guest |
| 7 | Checklist & cleanup | ⬜ Pending | Verify all invitation flows end-to-end |

**Deliverable:** Ceremony/Reception venue details, seating charts, wedding websites, and invitations functional
**Phase 3 Status:** 🔄 IN PROGRESS (3A ✅ · 3B ✅ · 3C ✅ · 3D ⬜ Pending)

> **Note:** Phase 3C includes the public wedding site at `/wedding/[slug]` which was originally planned under Phase 4. It is now fully implemented and all Phase 4 item #1 is done.

---

### Phase 4: Guest Experience & Public Sites — ✅ COMPLETE (2026-04-05)

**Goal:** Public-facing guest interactions + post-event features
**Depends on:** Phase 3 completed

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Public site rendering (SSR) | ✅ Done | Implemented in Phase 3C — `/wedding/[slug]` renders all 11 block types, mobile-first, force-dynamic, SEO metadata |
| 2 | Public RSVP submission | ✅ Done | `/rsvp/[token]` page — unique token per guest, conditional form, updates DB. Implemented in Phase 2B. |
| 3 | Guestbook (public) | ✅ Done (2026-04-03) | `GET/POST /api/guestbook/[websiteId]` + `GuestbookSection` client component with live submit + entries list |
| 4 | Guest photo upload | ✅ Done (2026-04-03) | `GET/POST /api/guest-photos/[websiteId]` + `GuestPhotoUpload` component — client-side resize to 800px, base64 stored in DB, photo grid + lightbox |
| 5 | QR Seat Finder | ✅ Done (2026-04-05) | `GET /api/public/seat-finder/[projectId]` (no auth) returns tables + guests. `/seat-finder/[projectId]` public page — search by name, shows table + tablemates |
| 6 | Post-event module | ✅ Done (2026-04-03, enhanced 2026-04-05) | `/planner/[id]/post-wedding` — 3 tabs (Overview/Guestbook/Photos), RSVP bar chart, guestbook download, photo grid + lightbox. **Enhancement (2026-04-05):** Overview page Post-Wedding section now fetches real data (`guestPhotos`, `guestbookEntries`, `rsvpCounts.attending`) from `/api/.../post-wedding` and shows live stats + link. Was previously hardcoded "Photos not added yet!" with no API call. |
| 7 | Push notifications | ⏭️ DEFERRED | Requires service workers + VAPID keys — complex infra, deferred to Phase 6. Email notifications implemented instead (item 8) |
| 8 | RSVP Email notifications | ✅ Done (2026-04-05) | `POST /api/rsvp/[token]` now sends email to couple after RSVP submission (fire-and-forget via Nodemailer). Guest name, status (✅/❌), dietary, message included in HTML email. |

**Deliverable:** Guests can visit websites, RSVP, upload photos, find seats; post-event archive works
**Phase 4 Status:** ✅ COMPLETE (items 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ · 7 ⏭️ deferred · 8 ✅)

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

### Phase 5: Marketplace, Messaging & Payments — ✅ COMPLETE (2026-04-05)

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

##### Phase 5A-1: Public Vendor Directory & Marketplace — ✅ IMPLEMENTATION DONE (2026-04-07)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Vendor directory (13 categories) | ✅ Done | `/vendors` page — category pill filters, search (name/city), paginated grid |
| 2 | Map + list view | ✅ Done (2026-04-07) | react-leaflet `VendorMap` component (OpenStreetMap, no API key). Dynamic import (`ssr: false`). List/Map toggle buttons on `/vendors` page. Leaflet icon fix (CDN URLs). Map centers on first vendor with lat/lng or defaults to Europe (54, 15). Popup: name, category, city, rating, price, "View Profile" link (emerald green). |
| 3 | Vendor profiles | ✅ Done | `/vendors/[slug]` — photo gallery, ratings, reviews, contact links |
| 4 | Inquiry system | ✅ Done | "Request Pricing" form → `POST /api/vendors/[slug]/inquiries` → DB |
| 5 | Booking request flow | ✅ Done | 7-field form: name, email, phone, event type, date, budget, message |
| 6 | Admin vendor management | ✅ Done | `GET/POST /api/admin/vendors` + `PUT/DELETE /api/admin/vendors/[id]`. Button renamed "View All Vendors" (was "View Public Directory"). Admin sidebar nav renamed "View All Vendors" (was "View Directory"). |
| 7 | Vendor plans ($19/mo) | ✅ Done (2026-04-05) | Implemented in Phase 5C (plan gating) + Phase 5E (Stripe checkout) |
| 8 | Map view toggle | ✅ Done (2026-04-07) | See Task 2 above |
| 9 | Filter: price range, rating, availability date, distance | ✅ Done (2026-04-07) | minPrice/maxPrice (Prisma `gte/lte` filter on `startingPrice`), minRating (post-filter after avgRating computed). Collapsible filter panel on `/vendors`. Active filter chips with "Clear all". |
| 10 | Vendor profile — FAQ section | ✅ Done (2026-04-07) | `faqItems Json?` on VendorProfile. Vendor dashboard: add/edit/delete FAQ items. Public profile: expand/collapse accordion (ChevronDown). |
| 11 | Vendor profile — social links | ✅ Done (2026-04-07) | `instagram`, `facebook`, `pinterest` String? on VendorProfile. Profile editor input fields. Public profile: icon links (Instagram pink, Facebook blue, Pinterest red SVG). |
| 12 | Response SLA badge | ✅ Done (2026-04-07) | `slaHours Int?` on VendorProfile. "Responds within Xh" badge — emerald green pill on directory cards (Clock icon) and public profile quick-info row. |
| 13 | Availability calendar (public) | ✅ Done (2026-04-07) | `VendorAvailability` model (date @db.Date, status AVAILABLE/BOOKED/TENTATIVE, note). `/api/vendor/availability` GET/POST/DELETE. Vendor editor: click-to-cycle pattern (blank→AVAILABLE→BOOKED→TENTATIVE→blank), saves immediately. Public profile: read-only color-coded calendar, month navigation, today ring. |
| +  | Lat/Lng for map pin | ✅ Done (2026-04-07) | `lat Float?` + `lng Float?` on VendorProfile (existed in schema). Added UI inputs to vendor profile editor with Google Maps helper text. |

**Files created/modified (Phase 5A-1 gap tasks — 2026-04-07):**
- `src/components/vendors/VendorMap.tsx` — **Created** — Leaflet map (react-leaflet), Marker/Popup per vendor, Leaflet icon fix, center/zoom logic
- `src/app/vendors/page.tsx` — **Modified** — dynamic import VendorMap, List/Map toggle, extended filter panel (minPrice/maxPrice/minRating), active filter chips, SLA badge on cards, lat/lng in VendorCard interface
- `src/app/vendors/[slug]/page.tsx` — **Modified** — SLA badge, social links (Instagram/Facebook/Pinterest), availability calendar (read-only), FAQ accordion
- `src/app/vendor/profile/page.tsx` — **Modified** — lat/lng inputs, Pinterest field, SLA Hours field, availability calendar (click-to-cycle), FAQ editor (add/edit/delete)
- `src/app/api/vendor/profile/route.ts` — **Modified** — added instagram, facebook, pinterest, slaHours, faqItems, lat, lng to PUT handler
- `src/app/api/vendor/availability/route.ts` — **Created** — GET/POST/DELETE availability entries
- `src/app/api/vendors/route.ts` — **Modified** — minPrice/maxPrice filter, minRating post-filter, lat/lng/slaHours in SELECT
- `src/app/api/vendors/[slug]/route.ts` — **Modified** — include availability (next 90 days)

**Files created (Phase 5A-1 original — 2026-04-01):**
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

#### Phase 5E: Billing & Payments — ✅ CORE COMPLETE (2026-04-05)

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Stripe subscription functions | ✅ Done (2026-04-05) | `src/lib/stripe.ts` — `createSubscriptionCheckout()`, `createCustomerPortalSession()`, `getOrCreateStripeCustomer()`. `PLANNER_PLANS` (basic/premium/elite) + `VENDOR_PLAN` constants. Env vars: `STRIPE_PRICE_BASIC/PREMIUM/ELITE/VENDOR` |
| 2 | DB migration — billing fields | ✅ Done (2026-04-05) | `scripts/add-billing-fields.mjs` — adds `plannerTier`, `plannerStatus`, `plannerPeriodEnd`, `stripeCustomerId`, `stripeSubscriptionId` to `User`; adds `stripeCustomerId`, `stripeSubscriptionId` to `VendorProfile`. Applied + `prisma generate` run. |
| 3 | 3-tier couple subscription | ✅ Done (2026-04-05, UI updated 2026-04-07) | Basic (free) / Premium (299 SEK/mo) / Elite (499 SEK/mo). `POST /api/billing/checkout` → Stripe checkout session. `POST /api/billing/portal` → Customer Portal URL. `GET /api/billing/subscription` → current tier + status. `/planner/billing` standalone pricing page (preserved). **UI redesign (2026-04-07):** Sidebar "Plans & Billing" link replaced with "Upgrade to Premium" button (bottom of sidebar) → opens `UpgradeModal` popup (planning.wedding-style 2-panel layout: Basic vs Premium/Elite). Full billing UI also embedded directly in `/planner/[id]/settings` page — removes dependency on `/planner/billing` standalone page for primary upgrade flow. |
| 4 | Vendor billing ($19/mo) | ✅ Done (2026-04-05) | `POST /api/vendor/billing/checkout` → Stripe checkout (subscription mode). `/vendor/billing` page updated — Stripe checkout button enabled (was disabled stub). Portal link added for active Business vendors. |
| 5 | Webhook handlers | ✅ Done (2026-04-05) | `POST /api/webhooks/stripe` updated — `checkout.session.completed` routes by metadata (planner/vendor/order), `customer.subscription.created/updated` updates `User.plannerTier`/`VendorProfile.planTier`, `customer.subscription.deleted` downgrades to basic/EXPIRED. All existing order flows preserved. |
| 6 | Invoice PDF generation | ⏭️ DEFERRED | Swedish VAT Kvitto PDF deferred to Phase 6 (requires @react-pdf/renderer template + VAT logic) |
| 7 | Feature gating | ⬜ Pending | Per-plan limits (guest export, seating, custom domain) — add in Phase 6 as feature flags |
| 8 | Swish payments (SE mobile) | ⬜ Pending | Blueprint: Swish integration for Swedish mobile payments |
| 9 | Klarna BNPL | ⬜ Pending | Blueprint: Klarna buy-now-pay-later option for couples |
| 10 | White-label tier ($120/mo) | ⬜ Pending | Blueprint: custom subdomain, auto-premium for their clients, 14-day free trial. Target: professional wedding planners |

#### Phase 5G: Stationery Engine — ⬜ NOT STARTED

**Blueprint:** Elite-tier printable assets — generated as background jobs (never blocks API). All assets match wedding website theme/colors.

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Table number cards | ⬜ Pending | 300 DPI PDF — styled table number cards, 1 per table. @react-pdf/renderer. |
| 2 | Place cards | ⬜ Pending | 300 DPI PDF — name card per guest, with table number |
| 3 | Food menus | ⬜ Pending | 300 DPI PDF — per-table menu, dietary variants highlighted |
| 4 | Seating chart A1 poster | ⬜ Pending | A1 landscape PDF — full seating layout for venue entrance display |
| 5 | Table list view PDF | ⬜ Pending | Printable table-by-table guest list for catering team |
| 6 | Background job queue | ⬜ Pending | Blueprint: BullMQ background job (never blocks API) — generate on demand |
| 7 | Download page | ⬜ Pending | `/planner/[id]/seating?tab=supplies` — shows all generated assets with download buttons |

> **Note:** This is an Elite plan feature. Blocked on: Feature gating (Phase 5E #7) being implemented first.

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

**Phase 5 Status:** ✅ COMPLETE (5A-0 ✅ · 5A-1 ✅ · 5B ✅ · 5C ✅ · 5D ✅ · 5E ✅ core · 5F ✅)

---

### Phase 5H: Feature Gating — ✅ IMPLEMENTATION DONE (2026-04-10)

**Goal:** Plan-based access control — Basic/Premium/Elite tiers properly enforced on all premium features. Subscription data already exists in DB (`plannerTier`), gating only missing on the client side.

**Context:** Pricing modal UI already exists (`upgrade-modal.tsx`) but not connected to any feature. All PDF exports, seating editor, and stationery tabs are currently accessible by Basic (free) users without payment.

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | `usePlannerTier` hook | ✅ Done (2026-04-10) | `src/hooks/use-planner-tier.ts` — fetches `/api/billing/subscription` once, caches per session. Anonymous (`local-` prefix) → always returns `"basic"`. |
| 2 | `UpgradeModal` — `defaultTab` prop | ✅ Done (2026-04-10) | `src/components/planner/upgrade-modal.tsx` — added optional `defaultTab?: "premium" \| "elite"` so modal opens on the correct tab based on which gate triggered it. |
| 3 | Budget PDF gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/budget/page.tsx` — `exportBudgetPDF()` gated — Basic users see upgrade modal instead. |
| 4 | Guest List PDF + XLS gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/guests/page.tsx` — `exportPDF()` and `exportXLS()` gated. CSV export stays free. |
| 5 | Seating editor gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/seating/page.tsx` — canvas editor nav buttons (ceremony/reception layout edit, cards edit) gated for Basic users. |
| 6 | Stationery tabs gate (Elite) | ✅ Done (2026-04-10) | `src/app/planner/[id]/seating/page.tsx` — `name-cards`, `table-numbers`, `menu` tabs gated for non-Elite users. Lock icon badge on tabs. Modal opens on Elite tab. |
| 7 | Checklist PDF gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/checklist/page.tsx` — `handleDownloadPdf()` gated. |
| 8 | Ceremony PDF gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/ceremony/page.tsx` — `handleDownloadPDF()` gated. |
| 9 | Reception PDF gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/reception/page.tsx` — `handleDownloadPDF()` gated. |
| 10 | Itinerary PDF + XLS gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/itinerary/page.tsx` — all 3 print/export triggers gated. |
| 11 | Vendors PDF gate (Premium) | ✅ Done (2026-04-10) | `src/app/planner/[id]/vendors/page.tsx` — `handleDownloadPDF()` gated. |

**Files created/modified:**
- `src/hooks/use-planner-tier.ts` — new hook
- `src/components/planner/upgrade-modal.tsx` — add `defaultTab` prop
- `src/app/planner/[id]/budget/page.tsx` — tier check
- `src/app/planner/[id]/guests/page.tsx` — tier check
- `src/app/planner/[id]/seating/page.tsx` — tier checks (Premium + Elite)
- `src/app/planner/[id]/checklist/page.tsx` — tier check
- `src/app/planner/[id]/ceremony/page.tsx` — tier check
- `src/app/planner/[id]/reception/page.tsx` — tier check
- `src/app/planner/[id]/itinerary/page.tsx` — tier check
- `src/app/planner/[id]/vendors/page.tsx` — tier check

**No DB/API/schema changes required** — `plannerTier` already in User model, `/api/billing/subscription` already working.

**Phase 5H Status:** ✅ IMPLEMENTATION DONE (2026-04-10)

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
| 5 | Forums page | ⬜ Pending | Blueprint: header nav "Forums" — community discussion board for couples, vendors, planners |
| 6 | Dresses directory | ⬜ Pending | Blueprint: header nav "Dresses" — bridal shop/dress designer directory (browse by style, price, location) |
| 7 | Blog / Ideas / Inspiration | ⬜ Pending | Blueprint: homepage section + content pages — articles, real weddings gallery, inspiration by category |
| 8 | Wedding Registry (standalone) | ⬜ Pending | Blueprint: homepage section — standalone registry page linking to Amazon/Zola/Honeyfund with contribution tracking |
| 9 | Recommended vendors near user | ⬜ Pending | Blueprint: Vendors tab → geo-location based vendor recommendations shown in dashboard (distinct from public marketplace search) |

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

| Phase | Name | Status | Sub-phases | Notes |
|-------|------|--------|------------|-------|
| 0 | UX/UI Design | ⏭️ SKIPPED | — | Using planning.wedding reference |
| 1 | Core Foundation | ✅ DONE | 1A–1E | 5/5 sub-phases ✅ |
| 2 | Planning Tools | ✅ CORE DONE | 2A ✅ · 2B ✅ · 2C ✅ · 2D ✅ · 2E ⬜ · 2F ✅ | 5/6 done. 2F (Settings: copy project, tab visibility, share link+QR, accessibility mode, itinerary XLS export) ✅ 2026-04-07. Remaining: 2E Files tab, budget analytics (2C #11–15) |
| 3 | Visual Editors | 🔄 IN PROGRESS | 3A ✅ · 3B ✅ · 3C ✅ · 3D ⬜ | 3/4 done. All 7 seating tabs complete. Phase 3A fully complete (2026-04-08): venue blueprint upload, history/snapshots, 6 starter templates, catering mode, CSV export, QR entrance. Remaining: Phase 3D (Invitation Designer) only. |
| 4 | Guest Experience | ✅ COMPLETE | 1 ✅ · 2 ✅ · 3 ✅ · 4 ✅ · 5 ✅ · 6 ✅ · 7 ⏭️ · 8 ✅ | 7/8 (push notifications deferred) |
| 5 | Marketplace & Payments | ✅ CORE DONE | 5A ✅ · 5B ✅ · 5C ✅ · 5D ✅ · 5E ✅ · 5F ✅ · 5G ⬜ · 5H ✅ | 7/8 done. 5G Stationery Engine: functionally complete via existing seating tabs. 5H Feature Gating: ✅ DONE (2026-04-10) — all 8 PDF pages + seating editor + stationery tabs gated. |
| 6 | Admin & Launch | ⬜ NOT STARTED | 6A–6C | 0/3 |

### Overall Implementation Progress

| Category | Done | Total | % |
|----------|------|-------|---|
| Core phases (Phase 1–5 sub-phases) | 20 | 26 | **77%** |
| Individual tasks (approx.) | ~185 | ~230 | **~80%** |
| **Major pending work** | — | — | Phase 2E (Files), Phase 3D (Invitation Designer), Phase 6 (Admin Panel), budget analytics, 5G Stationery Engine |

**What's done:** Full planner dashboard (guest list, RSVP, budget, checklist, itinerary, notes, ceremony, reception, website builder, seating chart editor × 7 tabs, vendor marketplace, vendor portal, couple-vendor messaging, billing/Stripe, public event sites, project share link+QR, tab visibility, project copy, accessibility mode.

**What's pending:** Admin panel (Phase 6), Files tab (2E), Invitation Designer (3D), budget analytics/multi-currency (2C #11–15), Stationery Engine (5G), White-label, Swish/Klarna payments.

**Last Updated:** 2026-04-10 (Phase 5H Feature Gating — all PDF exports, seating editor, stationery tabs gated by tier)
**Current Focus:** Phase 5H ✅ complete. Next candidates: Phase 6 (Admin Panel), Phase 2E (Files Tab), Phase 3D (Invitation Designer), or budget analytics (2C #11–15).

**Session log (2026-04-06, session 13 — Reception Menu tab editor + preview sync):**
- **`menu-edit/page.tsx` created:** Full-screen reception menu editor. Sections are clickable — click selects element (purple dashed outline), right panel shows element-specific: type label, editable `<textarea>`, `x: N  y: N` coords (via `getBoundingClientRect`), red Delete button. Blank canvas click deselects → right panel shows global style: Template dropdown (Basic/Elegant/Minimal), Main heading / Second heading / Paragraph each with font ◄► + size slider. "Add element" dropdown (Main heading, Second heading, Paragraph, Flourish) + auto-selects new element immediately via `setSelectedId(newId)` + position-recompute `useEffect`. Default 10 sections (Flourish → Appetizer → Salad → Entrees → Dessert → Heading). Google Fonts loaded inline. All saved to `menu-sections-${projectId}` + `menu-settings-${projectId}` localStorage. Close → `?tab=menu`.
- **`ReceptionMenuPanel` rewritten:** Replaced hardcoded "Garden Salad / Grilled Salmon" static HTML preview with dynamic rendering. `useEffect` loads actual saved sections + settings from localStorage on mount. Renders each `second-heading` as UPPERCASE letter-spaced label, `paragraph` as Georgia serif with italic detection, `main-heading` as bold heading, `flourish` as ✦ ✦ ✦. Font scaling uses saved `mainHeadingFont`/`secondHeadingFont`/`paragraphFont`. `projectId` prop added.
- **Routing fix:** `menu` tab `onEdit` now routes to `/seating/menu-edit` (was incorrectly `/reception-layout-edit`).
- **Edit → preview sync confirmed:** Changes made in `menu-edit` (new sections, text edits, font/size changes) are reflected in `?tab=menu` after Close.
- **TypeScript:** zero errors in all affected files.
- Files created: `src/app/planner/[id]/seating/menu-edit/page.tsx`
- Files modified: `src/app/planner/[id]/seating/page.tsx` (ReceptionMenuPanel rewrite, projectId prop, routing fix)

**Session log (2026-04-06, session 12 — Table Numbers tab redesign):**
- **Table Numbers tab (`?tab=table-numbers`) fully redesigned** to match planning.wedding reference. Replaced old `TableNumbersDiagram` SVG grid + generic `LayoutPanel` with dedicated `TableNumberCardSvg` + `TableNumbersPanel`.
- **`TableNumberCardSvg`:** 3 templates — Standard (rounded rect), Wide (oval/circle), Tall (narrow tall). Inner dashed decorative border. "Table" top, large number center (dancing script/display font), "#hashtag" bottom. Card stand SVG below (circle connector + rod + double base plate).
- **`TableNumbersPanel` settings:** template dropdown (3 options, selected = blue-600), number font ◄► (6 fonts), editable "Table" text input, editable "hashtag" text input, hashtag font ◄► (5 fonts), rounded corners slider (0–130). All settings persist in `table-numbers-settings-${projectId}` localStorage.
- **Tables loaded** from `reception-layout-${projectId}` localStorage (same `TABLE_KINDS` filter as `SeatingCardsPanel`); fallback: 5 placeholder tables.
- **Preview Result** → opens new tab showing all table cards (visual only, no auto-print).
- **Download PDF file** → opens new tab + triggers `window.print()` automatically for browser save-as-PDF.
- **Card clipping fix:** container width adapts per template (wide=240px, tall=160px, standard=200px); navigation row uses `items-start` so tall cards display without vertical clip.
- `buildCardsHtml()` shared helper extracts SVG card generation logic, used by both Preview and Download handlers.
- Files modified: `src/app/planner/[id]/seating/page.tsx`, `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md`

**Session log (2026-04-06, session 11 — Settings persistence):**
- **Name Cards settings persist:** `NameCardsPanel` now accepts `projectId` prop. All 6 settings (template, showHonorific, showTableNumber, showCourseIcon, confirmedOnly, printEmpty) use `useState` initializer functions to lazy-load from `name-cards-settings-${projectId}` localStorage on mount. `useEffect` saves all settings on every change. Page refresh or tab switch and return — settings stay.
- **Atlas editor settings persist:** `atlasSettings` state in `SeatingPage` now lazy-initializes from `atlas-settings-${projectId}` localStorage (spread-merged with `DEFAULT_ATLAS_SETTINGS` so missing keys fall back to defaults). `AtlasLayoutEditor`'s `onSettingsChange` callback now also calls `localStorage.setItem` on every change — Display mode, Group by, Name format, Sort, fonts, all sliders all persist immediately.
- Storage keys: `name-cards-settings-${projectId}`, `atlas-settings-${projectId}`
- Files modified: `src/app/planner/[id]/seating/page.tsx`, `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md`

**Session log (2026-04-06, session 10 — Classic Name Cards redesign):**
- **Classic Name Cards tab (`?tab=name-cards`) fully redesigned** to match planning.wedding reference. Replaced static `NameCardsDiagram` SVG with `NameCardsPanel` + `NameCardSvg` components in `seating/page.tsx`.
- **`NameCardSvg` component (4 templates):** `classic` (rounded card, purple gradient bottom bar), `classic-circle` (circle cutout at top), `classic-triangle` (triangle cutout — default, matching screenshot), `simple` (plain minimal card). Each renders guest name, optional honorific, optional table label.
- **`NameCardsPanel` features:** large centered card preview (SVG 160×200 viewBox); ‹/› left/right arrow navigation with `cardIndex` state; template dropdown (4 options, active option shown in blue-600); 3 option checkboxes (Include honorific prefix / Show table number / Show course icon); "Total X guests" count below card; 2 radio options (All confirmed guests / Print one empty card); purple "Download PDF" button; Recommendation white card box. Purely client-side — no new API routes.
- **`name-cards` tab render updated** in `SeatingPage`: `<NameCardsPanel guests={guests} layouts={layouts} />` replaces old `<NameCardsDiagram>` call.
- Files modified: `src/app/planner/[id]/seating/page.tsx`, `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md`

**Session log (2026-04-06, session 9 — Seating Cards by Table editor + preview redesign):**
- **Seating Cards editor created:** `src/app/planner/[id]/seating/cards-edit/page.tsx` — two-mode full-screen editor. **Layout mode:** dark header, SVG canvas rendering reception tables (circles/rectangles from `reception-layout-${projectId}` localStorage), right panel with "How to display guests' names" (full/colored/generic icons + radios), Font scheme / Color scheme / Paper expandable sections, tables list. **Card mode:** dotted-background, left/right nav arrows, large `SeatingCard` component (dashed border, "Table" in cursive, bold name, dashed separator, guest names in Georgia serif), right panel with Table ID, font ◄► selector (6 fonts), font size input, dot-navigation. Settings persisted to `cards-settings-${projectId}` localStorage. Close → `?tab=cards` in both modes.
- **Routing fix:** `cards` tab `onEdit` in `seating/page.tsx` now routes to `/seating/cards-edit` (was incorrectly pointing to `/reception-layout-edit`).
- **Seating Cards preview redesigned:** `?tab=cards` on main seating page completely rebuilt to match planning.wedding reference. New `ClipboardHanger` SVG component + `SeatingCardsPanel` component added. Preview shows: clipboard hanger decoration, "Table" in Dancing Script (loaded via inline Google Fonts `@import`), large bold table number (auto-extracted from "Table X"), divider, guest names. Left/right navigation arrows. Below: "Format 4.33 inch × 7.87 inch", "Total X table cards", "Preview Result" button (Eye icon), "Download PDF file" + arrow, Recommendation card. Tables loaded from reception layout localStorage via `cardsTables` state + `useEffect`.
- Files created: `src/app/planner/[id]/seating/cards-edit/page.tsx`
- Files modified: `src/app/planner/[id]/seating/page.tsx` (SeatingCardsPanel + ClipboardHanger + cardsIndex/cardsTables state + useEffect + routing fix + lucide imports), `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md`

**Session log (2026-04-06, session 8 — Reception Layout Editor + Dead Code Cleanup):**
- **Reception layout editor created:** `src/app/planner/[id]/seating/reception-layout-edit/page.tsx` — full copy of ceremony editor with 5 differences: storage key `reception-layout-${projectId}`, default layout (8 round tables in 3-2-3 pattern around dance floor asset + 1 long head table at bottom), close button routes to `?tab=reception`, export name `ReceptionLayoutEditPage`.
- **Reception tab fully wired:** `seating/page.tsx` — `receptionElements` state loads from localStorage on reception tab switch. `CeremonyLayoutPreview` given `svgId` prop (supports both `ceremony-layout-svg` and `reception-layout-svg`). Reception `LayoutPanel` gets `wide`, `pdfSvgId="reception-layout-svg"`, `onEdit` navigates to `/reception-layout-edit`. Falls back to static `ReceptionDiagram` if no saved layout.
- **Dead Konva canvas block removed:** The old `if (false) { ... }` unreachable block (originally `if (editMode)`) physically deleted from `seating/page.tsx`. All associated dead code removed: helper components `TABLE_TYPES`, `SeatingCanvas` (dynamic import), `AssignModal`, `TableIcon`, `TableTypePicker`; state vars `selectedTableId`, `assignModal`, `creatingLayout`, `stageRef`; async functions `createLayout`, `deleteLayout`, `addTable`, `moveTable`, `deleteTable`, `saveGuestAssignment`, `guestName`; derived consts `selectedTable`, `totalSeated`, `totalCapacity`. Unused imports removed (`dynamic`, `Trash2`, `ChevronDown`, `Check`, `Circle`, `Square`, `RectangleHorizontal`, `ArrowLeft`, `addLocalSeatingLayout`, `deleteLocalSeatingLayout`, `addLocalSeatingTable`, `updateLocalSeatingTable`, `deleteLocalSeatingTable`).
- **Result:** Zero TypeScript errors in seating files. `seating/page.tsx` is clean — no dead code, no unused state.
- Files created: `src/app/planner/[id]/seating/reception-layout-edit/page.tsx`
- Files modified: `src/app/planner/[id]/seating/page.tsx` (reception wiring + dead code removal + import cleanup), `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md`

**Session log (2026-04-10 — Phase 5H Extension: Full PDF gating across all planner pages):**
- **Problem:** Phase 5H initially gated Budget, Guests, and Seating pages. Five additional pages — Checklist, Ceremony, Reception, Itinerary, Vendors — still allowed Basic (free) users to download PDFs without any tier check.
- **Fix:** Added `usePlannerTier` + `isPremiumOrElite` to all 5 remaining pages. Each PDF/print handler now gates on tier before executing.
- **Checklist** (`checklist/page.tsx`): `handleDownloadPdf()` → `window.print()` gated.
- **Ceremony** (`ceremony/page.tsx`): `handleDownloadPDF()` → `@react-pdf/renderer` export gated. Fragment wrapper added to support `<UpgradeModal>` sibling.
- **Reception** (`reception/page.tsx`): `handleDownloadPDF()` → `@react-pdf/renderer` export gated. Fragment wrapper added.
- **Itinerary** (`itinerary/page.tsx`): All 3 print/export triggers gated — inline "print" link in heading text, "Download PDF file" button, "Download XLS file" button.
- **Vendors** (`vendors/page.tsx`): `handleDownloadPDF()` → `@react-pdf/renderer` export gated. Fragment wrapper added.
- **Pattern:** All pages follow identical pattern — `usePlannerTier(id)`, `[showUpgrade, setShowUpgrade]` state, gate check at top of each handler, `<UpgradeModal open={showUpgrade} onClose={...} defaultTab="premium" />` in JSX.
- **Anonymous users:** `local-` prefix → hook returns `"basic"` immediately without API call → modal shown → "Unlock" button redirects to login.
- **TypeScript:** No new errors introduced. All pre-existing errors in unrelated files remain unchanged.
- Files modified: `src/app/planner/[id]/checklist/page.tsx`, `src/app/planner/[id]/ceremony/page.tsx`, `src/app/planner/[id]/reception/page.tsx`, `src/app/planner/[id]/itinerary/page.tsx`, `src/app/planner/[id]/vendors/page.tsx`, `docs/Weedding plan/wedding planner DEVELOPMENT-PLAN.md`

**Session log (2026-04-07, session 15 — Auth system fixes: register API + login branding cleanup):**
- **Problem:** Registration form was a stub — `handleSubmit` had a `TODO` comment, `console.log` + fake `setTimeout(1000ms)` instead of any real API call. Users could "register" and land on `/dashboard` but no data was saved to DB. Subsequent login always failed with "Invalid email or password".
- **Auth layout branding fix:** `src/app/(auth)/layout.tsx` — removed hardcoded `"LLC<span>Pad</span>"` logo. Layout is now `async` server component — calls `getBusinessConfig()` from `src/lib/business-settings.ts`. If `config.logo.url` is set → renders `<Image>`. Otherwise → renders first letter icon + `config.name` (fallback: "Ceremoney"). No more hardcoded branding.
- **Register API created:** `src/app/api/auth/register/route.ts` — `POST` endpoint. Validates name/email/password presence + min length (8). Checks for existing email (`prisma.user.findUnique` — returns 409 if duplicate). Hashes password with `bcryptjs` (`hash(password, 12)`). Creates user with `role: "CUSTOMER"`. Returns 201 on success.
- **Register page wired up:** `src/app/(auth)/register/page.tsx` — `handleSubmit` now calls `POST /api/auth/register`. On success, immediately calls NextAuth `signIn("credentials", { email, password, redirect: false })` for auto-login. On auth success → `router.push("/dashboard")`. On auth error → `router.push("/login")`. Real error messages from API shown in UI.
- **Description updated:** "Start your US business journey today" → "Plan your perfect event — it only takes a minute"
- **TypeScript:** `npx tsc --noEmit` — exit code 0, zero errors.
- Files created: `src/app/api/auth/register/route.ts`
- Files modified: `src/app/(auth)/layout.tsx` (branding dynamic), `src/app/(auth)/register/page.tsx` (real API + auto-login)

**Session log (2026-04-07, session 3 — Phase 2F: Settings Tab & Blueprint Completions):**
- **Copy project:** Settings page → "Duplicate Project" button. `POST /api/planner/projects/[id]/copy` deep-copies all related data (guests, budget+items, checklist, itinerary, notes, venues, vendors). Local: copies all localStorage keys. Redirects to new project settings.
- **Tab visibility:** Per-tab on/off toggles in Settings. Stored in `planner-hidden-tabs-${projectId}` localStorage. Also synced to `project.settings.hiddenTabs` for DB projects. Sidebar reads localStorage and filters nav items — groups with all children hidden are fully hidden. Overview + Settings always visible.
- **Share project:** `shareToken String? @unique` + `shareEnabled Boolean` added to WeddingProject. `POST /api/planner/projects/[id]/share` toggles sharing + generates 32-char hex token once. `GET /api/planner/share/[token]` public no-auth endpoint returns read-only overview data. `/planner/share/[token]` public page shows couple names, date, venues, vendor list, guest count, checklist progress. Settings shows link input + copy button + QR code (via `qrcode` package). Local projects: "Sign in to share" message.
- **Accessibility mode:** Toggle saved to `planner-a11y` localStorage. Applies `planner-a11y` class to `document.documentElement`.
- **Itinerary XLS export:** "Download XLS file" button added next to existing PDF button using `xlsx` package. Columns: Time, Duration (min), Event, Location. Filename includes event date.
- **DB migration:** `npx prisma db push` applied `shareToken`/`shareEnabled` columns + unique index.
- **TypeScript:** `node --max-old-space-size=4096 node_modules/.bin/tsc --noEmit` — zero errors.
- Files created: `src/app/api/planner/projects/[id]/copy/route.ts`, `src/app/api/planner/projects/[id]/share/route.ts`, `src/app/api/planner/share/[token]/route.ts`, `src/app/planner/share/[token]/page.tsx`, `scripts/add-project-sharing.mjs`
- Files modified: `prisma/schema.prisma`, `src/app/planner/[id]/settings/page.tsx`, `src/app/planner/[id]/itinerary/page.tsx`, `src/components/planner/sidebar.tsx`

**Session log (2026-04-07, session 2 — Billing UI Redesign: Upgrade Modal + Settings Billing Embed):**
- **Sidebar — "Upgrade to Premium" button:** Removed the old "Plans & Billing" sidebar nav link (CreditCard icon → `/planner/billing`). Replaced with a dedicated "Upgrade to Premium" button pinned at the very bottom of the sidebar (star icon, rose-to-purple gradient background, border). On click → opens `UpgradeModal` popup. Collapses to icon-only when sidebar is in collapsed state.
- **New component — `UpgradeModal`:** `src/components/planner/upgrade-modal.tsx`. Full-screen modal (Dialog, `max-w-4xl`) with two-panel layout matching `planning.wedding` reference. Left panel: Basic plan (water drop SVG icon, feature bullet list, "FREE" label). Right panel: Premium/Elite tab switcher (star SVG with sparkles, gradient tagline, feature list with bold highlights, price + gradient CTA button "Unlock Premium — 299 SEK/mo"). Tab switcher between Premium and Elite with pill-style active state. Fetches subscription via `GET /api/billing/subscription` when opened. Upgrade via `POST /api/billing/checkout`. Manage billing via `POST /api/billing/portal`. Current plan shown with "Your current plan" badge.
- **Settings page — Billing embedded:** `src/app/planner/[id]/settings/page.tsx` — removed the "Plans & Billing" card that was a single link to `/planner/billing`. Replaced with full billing UI embedded inline: current plan banner (CreditCard icon + tier + renewal date + "Manage billing" portal link), error display, 3-column pricing card grid (Basic/Premium/Elite), VAT notice. Billing state (`sub`, `billingLoading`, `upgrading`, `managingPortal`, `billingError`) added to settings page. Subscription fetched in `useEffect` alongside project data.
- Files created: `src/components/planner/upgrade-modal.tsx`
- Files modified: `src/components/planner/sidebar.tsx` (removed billing nav link, added "Upgrade to Premium" button + `UpgradeModal`), `src/app/planner/[id]/settings/page.tsx` (embedded full billing UI, removed `/planner/billing` link card)

**Session log (2026-04-05, session 4 — Overview Post-Wedding section fix):**
- **Overview page — Post-Wedding section real data:** Overview page (`/planner/[id]/page.tsx`) এর Post-Wedding section আগে hardcoded `"Photos not added yet!"` দেখাত — কোনো API call ছিল না। এখন `fetchAll()` এ `GET /api/planner/projects/[id]/post-wedding` যোগ করা হয়েছে। Response থেকে `pwPhotos` (guest photo count), `pwGuestbook` (guestbook entry count), `pwAttending` (RSVP attending count) state এ store করা হয়। Section এখন: data থাকলে → 3টি stat + "View post-wedding memories →" link দেখায়; local project হলে → sign in বার্তা; DB project এ data না থাকলে → "Post-wedding memories will appear here..." দেখায়।
- Files modified: `src/app/planner/[id]/page.tsx` — added `pwPhotos`/`pwGuestbook`/`pwAttending` state, added `post-wedding` to `Promise.all()`, replaced hardcoded Post-Wedding section with data-driven UI

**Session log (2026-04-05, session 3 — Phase 4 remaining + Phase 5E Billing):**
- **Phase 4 #5 — QR Seat Finder:** `GET /api/public/seat-finder/[projectId]` (no auth) returns `SeatingLayout[]` + `SeatingTable[]` with guest names. `/seat-finder/[projectId]` client page — name search, shows table + tablemates with avatar initials. Layout selector (ceremony/reception) auto-defaults to RECEPTION.
- **Phase 4 #8 — RSVP Email Notification:** `POST /api/rsvp/[token]` now fire-and-forgets email to couple after submission. Fetches `project.user.email` via `include`. HTML email shows guest name, attending/declining status (✅/❌), dietary requirements, message. Uses existing Nodemailer `sendEmail()`.
- **Phase 5E — DB migration:** `scripts/add-billing-fields.mjs` — adds `plannerTier` (default: `basic`), `plannerStatus` (default: `active`), `plannerPeriodEnd`, `stripeCustomerId` (@unique), `stripeSubscriptionId` to `User`; adds `stripeCustomerId`, `stripeSubscriptionId` to `VendorProfile`. Applied to DB + `npx prisma generate` run.
- **Phase 5E — Stripe functions:** `src/lib/stripe.ts` extended with `PLANNER_PLANS` (basic/premium 299 SEK/elite 499 SEK), `VENDOR_PLAN` ($19/mo), `getOrCreateStripeCustomer()`, `createSubscriptionCheckout()` (mode: "subscription"), `createCustomerPortalSession()`. Env vars: `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_ELITE`, `STRIPE_PRICE_VENDOR`.
- **Phase 5E — Couple Billing APIs:** `GET /api/billing/subscription` (plan status), `POST /api/billing/checkout` (Stripe checkout for premium/elite), `POST /api/billing/portal` (Customer Portal URL).
- **Phase 5E — Vendor Billing API:** `POST /api/vendor/billing/checkout` → Stripe subscription checkout for $19/mo Business plan. Persists `stripeCustomerId` on VendorProfile.
- **Phase 5E — Webhook:** `POST /api/webhooks/stripe` fully updated. Routes `checkout.session.completed` by metadata type (plannerTier/planType=vendor_business/orderId). Handles `customer.subscription.created/updated/deleted` → updates `User.plannerTier`/`User.plannerStatus`/`VendorProfile.planTier`. Existing order payment flow preserved.
- **Phase 5E — Couple Billing Page:** `/planner/billing` — 3-column pricing page (Basic free / Premium 299 SEK / Elite 499 SEK) with feature comparison, current plan badge, upgrade buttons, Customer Portal link. Added "Plans & Billing" (`CreditCard` icon) to planner sidebar.
- **Phase 5E — Vendor Billing Page:** `/vendor/billing` updated — Stripe checkout button enabled (was disabled stub). Portal management link shown for active Business vendors.
- Files created: `src/app/api/public/seat-finder/[projectId]/route.ts`, `src/app/seat-finder/[projectId]/page.tsx`, `scripts/add-billing-fields.mjs`, `src/app/api/billing/checkout/route.ts`, `src/app/api/billing/portal/route.ts`, `src/app/api/billing/subscription/route.ts`, `src/app/api/vendor/billing/checkout/route.ts`, `src/app/planner/billing/page.tsx`
- Files modified: `src/app/api/rsvp/[token]/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/app/vendor/billing/page.tsx`, `src/lib/stripe.ts`, `src/components/planner/sidebar.tsx`, `prisma/schema.prisma`

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

**Session log (2026-04-06 — Ceremony Layout Editor):**
- **Problem:** Ceremony tab "Click here to edit layout" was opening the Konva table editor (designed for reception round tables) — wrong tool for ceremony chair layouts.
- **Fix:** Created a brand-new, dedicated full-screen ceremony layout editor at `/planner/[id]/seating/ceremony-layout-edit` that matches the planning.wedding reference design exactly.
- **Ceremony Layout Editor features:**
  - Full-screen overlay (`position: fixed; inset: 0; z-index: 50`) — bypasses planner sidebar/header without needing a separate layout file
  - SVG canvas (590×1010px paper) with pan + zoom (wheel, 0.25×–3×, keyboard shortcuts)
  - Default layout auto-built on first open: arch at top, 2 processional rows, center aisle gradient, 9 pew rows on each side (left + right), numbered chair circles
  - Elements: `arch` (custom SVG with decorative detail), `aisle` (gradient rectangle), `row` (bench line + numbered chair circles)
  - Drag-and-drop: custom implementation via `mousedown`/`mousemove`/`mouseup` — no external library
  - Add Element dropdown: "Row of Chairs" (adds new chair row at bottom), "Aisle" (adds aisle strip)
  - Right-side properties panel: context-sensitive — Layout settings (default), Custom SVG info (when arch selected), Aisle element (when aisle selected), Row settings (when row selected)
  - Auto-save: `useEffect` watches `elements` → `localStorage.setItem('ceremony-layout-{projectId}', JSON.stringify(elements))` on every change
  - Load: `useState` lazy initializer reads from localStorage on first render → no "flash of default content"
  - Close button: `router.push('/planner/${projectId}/seating?tab=ceremony')` → returns to correct tab
  - Zoom +/− buttons + crosshair reset
- **Navigation fix:** `seating/page.tsx` ceremony tab `onEdit` changed from `() => setEditMode(true)` → `() => router.push('/planner/${projectId}/seating/ceremony-layout-edit')`. Reception tab keeps existing `editMode` Konva canvas (unchanged).
- **Auto-save scope:** localStorage = per-browser (not per-user-account). If user logs in on a different device, layout data won't be there. Database-backed save can be added in a future enhancement.
- Files created: `src/app/planner/[id]/seating/ceremony-layout-edit/page.tsx`
- Files modified: `src/app/planner/[id]/seating/page.tsx`

**Session log (2026-04-06, session 7 — Ceremony Layout Enhancements: Add Element Panel, Preview, PDF, Recommendation):**

- **Add Element comprehensive panel (matches planning.wedding reference exactly):**
  - Replaced the simple 2-item dropdown ("Row of Chairs" / "Aisle") with a full-screen right-side slide-in panel
  - 4 categories with 3-column thumbnail grid (matches reference site layout):
    1. **Tables with seats** (6 types): Long rectangle, Round, Square, Oblong rectangle, Half-round, Row of chairs
    2. **Tables without seats for buffet** (4 types): Long buffet, Round buffet, Square buffet, Oblong buffet
    3. **Custom elements** (2 types): Upload SVG (custom shape upload), Ruler (measurement guide)
    4. **Other assets** (43 items): Text label, Pillar, Wall, Doors, Dance floor, Stage, Tent, Entry sign, Direction arrows, Compass, Fan/AC, AC unit, Heater, Water station, Light stand, Sound tower, Microphone, Smoke machine, Laser light, Fireworks, Wedding cake, Gift table, Power outlet, DJ booth, Grand piano, Upright piano, 8 tree variants, 3 hedge variants, Arch (ceremony), Aisle runner
  - Search bar filters elements by name across all categories in real-time
  - Each element has a labeled SVG preview thumbnail in the grid
  - `handleAddElement(def: ElementDef)` creates correct default state for each element kind and adds it to canvas
  - `ElementKind` type expanded from 3 types to 13: `arch | aisle | row | long-table | round-table | square-table | oblong-table | half-round-table | long-buffet | round-buffet | square-buffet | oblong-buffet | asset`
  - `assetType?: string` field added to `CeremonyElement` interface for the 43 asset icons
  - `getTableSeatPositions()` computes seat circle positions geometrically per table shape (long=top/bottom rows, round=circumference, square=4 sides, ellipse=perimeter, half-round=arc)
  - Canvas render loop updated to draw all 13 element types correctly

- **Ceremony layout preview — larger + guest names:**
  - Preview in `seating/page.tsx` ceremony tab was too small (`max-w-xs`) — guest names were unreadable
  - Added `wide` prop to `LayoutPanel` component — ceremony tab passes `wide={true}` → expands card from `max-w-xs` to `w-full` within `max-w-3xl` outer container
  - Gallery photo sizes adjusted for wide mode: `h-44 w-48` (was `h-32 w-24`)
  - `PreviewElement` interface updated: `kind` expanded to all 13 types, added `guestIds?: string[]`, `assetType?: string`
  - `CeremonyLayoutPreview` component updated to accept `guests` prop (passed from seating page)
  - Guest first names shown in seat circles in purple if `guestIds[i]` is assigned — reads from `guests` array lookup
  - All 13 element kinds rendered in preview SVG (tables with seats, buffet tables, assets)
  - `id="ceremony-layout-svg"` added to SVG element for PDF targeting

- **PDF download — working:**
  - "Download PDF file" button was non-functional (no handler)
  - Added `downloadLayoutPDF(svgId, title)` function: creates new window with just the SVG + CSS (`@page { size: A1 landscape; margin: 0 }`) + `window.print()` auto-trigger → browser's native Print-to-PDF dialog
  - `LayoutPanel` accepts `pdfSvgId` prop; ceremony tab passes `pdfSvgId="ceremony-layout-svg"`

- **Recommendation section — matches reference:**
  - Redesigned from purple-border card with gradient text to clean white card with light gray border (`border border-gray-200 rounded-xl bg-white`) matching planning.wedding reference exactly
  - Removed all custom purple styling from recommendation box

- **Gallery photos — higher quality:**
  - Ceremony gallery Unsplash photo URLs updated to `w=384&h=352` for higher resolution display

- Files modified:
  - `src/app/planner/[id]/seating/ceremony-layout-edit/page.tsx` — full rewrite: expanded ElementKind to 13 types, assetType field, getTableSeatPositions(), TableCanvasElement, AssetCanvasElement, AssetIcon (40+ SVGs), TablePreview, getElementCategories(), AddElementPanel, handleAddElement(), showAddPanel state, updated canvas render + right panel
  - `src/app/planner/[id]/seating/page.tsx` — PreviewElement interface updated, CeremonyLayoutPreview gets guests prop + shows guest names, wide LayoutPanel, larger gallery, PDF download function, pdfSvgId prop, recommendation section restyled

**Session log (2026-04-08 — Testing #26, #27, #28, #29, #30, #31, #34):**

All 8 spreadsheet items tested end-to-end and confirmed working:

- **#28 — Logo Upload (Cover block):** Upload PNG → live preview update above couple names → Remove logo. ✓
- **#29 — Google Maps Embed (Venue block):** Ceremony + reception map queries → `<iframe>` renders on public page. Note: map query fields are separate from Venue Name fields — must fill in the Map field explicitly. ✓
- **#30 — Countdown Timer & Photo Upload Gallery:** Countdown block (`countdown` type) — set target date → live days counter. Photo Upload Gallery — `GuestPhotoUpload` component on post-wedding page, guest photos via `/api/guest-photos/[websiteId]`. Both confirmed working. ✓
- **#31 — SEO Module (Custom meta tags + visibility/password):** `generateMetadata` on `/wedding/[slug]` generates `<title>` + `<meta name="description">`. Password gate: set password in Website settings → publish → incognito tab shows password gate → wrong password shows error → correct password grants access → sessionStorage skips prompt on refresh. ✓
- **#34 — Dietary Checkboxes (RSVP):** 5 checkboxes (Vegetarian/Vegan/Gluten-free/Dairy-free/Halal) + "Other" free-text → submit → dietary shown in Guests list → 🍽️ icon cycles dietary on guest row. ✓
- **#26 — Template System:** Templates modal opens → 10 cards → hover shows "Apply Template" → Classic Elegance (5 blocks), Grand Celebration (9 blocks), Minimalist Chic (3 blocks) all apply correctly with immediate preview update. ✓
- **#27 — Live Visual Editor:** Two-column layout (left=editor, right=preview) → hover ring on blocks → click-to-expand with auto-scroll in left panel → real-time sync on edit (800ms debounce) → theme switch updates preview → mobile single-column layout → save/refresh persistence. ✓

**Spreadsheet status after this session:** 28 tasks Complete, 14 Pending (~65%)

**Session log (2026-04-08 — Full i18n Coverage: Ceremony, Reception, Vendors, Settings + Bengali):**

Implemented full internationalization coverage across all previously untranslated planner pages. Language switcher now applies to 100% of client-side pages.

- **`src/lib/i18n/language-context.tsx`** — Added ~120 new translation keys to all 4 language blocks (en, sv, ar, bn):
  - `ceremony.*` (24 keys): title, desc, date, location, layout, planLayout, descPlaceholder, uploadPhotos, dropPhotos, photoLimit, photoSize, upload, photoDeferred, downloadPdf, setDate, setLocation, selectDate, save, cancel, locationDetails, streetAddress, city, country
  - `reception.*` (24 identical keys for reception context)
  - `vendors.*` (30 keys): title, subtitle, search/filter UI, categories (13 `vendors.cat.*` keys), CTA section, view toggles, rating options, filter panel
  - `settings.*` (37 keys): couple names, general fields, event type/status dropdowns, copy project, dashboard layout, share project, accessibility, plans & billing UI
  - `tab.*` (11 keys): all sidebar tab labels for the visibility toggle feature
- **`src/app/planner/[id]/ceremony/page.tsx`** — Added `useLanguage()`. Updated `formatDate()` + `formatLocation()` to accept `fallback` param. Replaced all hardcoded strings. Sub-components `DatePickerPopup`, `LocationPopup`, `LocationEditInline` now accept `t` as prop.
- **`src/app/planner/[id]/reception/page.tsx`** — Same treatment as ceremony, using `reception.*` keys.
- **`src/app/vendors/page.tsx`** — Renamed `CATEGORY_META` → `CATEGORY_CONFIG`, replaced `label` with `tKey`. Added `useLanguage()`. All search UI, filter panel, category pills, view toggles, vendor cards, CTA section translated.
- **`src/app/planner/[id]/settings/page.tsx`** — Changed `HIDEABLE_TABS` to use `tKey` instead of `label`. Added `useLanguage()`. All card titles, form labels, select options, buttons, billing UI translated.
- **Bengali (`bn`):** All new keys added with proper Bengali translations. Still marked as TEST — remove when instructed.
- **TypeScript:** Zero new errors introduced. All 4 files pass `tsc --noEmit`.

**Files modified:**
- `src/lib/i18n/language-context.tsx`
- `src/app/planner/[id]/ceremony/page.tsx`
- `src/app/planner/[id]/reception/page.tsx`
- `src/app/vendors/page.tsx`
- `src/app/planner/[id]/settings/page.tsx`

**Session log (2026-04-07, session 4 — Ceremoney Rebranding + DB Fix + Dashboard):**

- **Full Ceremoney rebranding:** Removed all LLCPad references across 80+ files. Updated: `package.json` (name/description/repo), `next.config.ts` (image domains → ceremoney.com, AWS), `.env.example` (added Swish, Klarna, 46elks, AWS S3/CloudFront, Redis), `src/lib/business-settings.ts` (default fallbacks), `src/lib/seo.ts`, `src/lib/email*.ts`, `src/lib/encryption.ts` (salt), `src/lib/i18n/language-context.tsx` (storage key), `src/lib/paypal.ts`, `src/app/layout.tsx` (metadata), `src/app/robots.ts`, `src/app/sitemap.ts`, `CLAUDE.md` (full rewrite), all marketing pages, admin files, seed files, data files.
- **Deleted:** `src/app/(marketing)/llc/` directory (all LLC state pages — not needed for Ceremoney).
- **Logo created:** `public/logo.svg` (interlocked wedding rings + sparkle + "Ceremoney" wordmark), `public/logo-icon.svg` (icon only). DB updated: `business.logo.url = /logo.svg`, `business.favicon.url = /logo-icon.svg`.
- **DB seeded with Ceremoney content:** Re-ran `npx tsx prisma/seed-header-footer.ts` → header nav (Home/Features/Vendors/Pricing/Blog/Contact), footer (5 widgets: Brand/Features/Event Types/Company/Legal), mega menu with 4 categories. Business settings updated: name=Ceremoney, currency=SEK, country=Sweden, etc.
- **DB schema sync (`npx prisma db push --accept-data-loss`):** Dropped old LMS tables (Course, Certificate, Enrollment, CourseCategory, Lesson, etc. — 18 tables). Added missing columns: `shareEnabled`, `shareToken` on `WeddingProject`. Added `@@unique([shareToken])` constraint. Fixed `UserRole` enum (removed `STUDENT`/`INSTRUCTOR`, added Ceremoney roles) via manual raw SQL migration.
- **Fixed "Failed to create project" bug:** Root cause was `WeddingProject.shareEnabled` column missing in DB (schema out of sync). Fixed by `npx prisma db push`. Also added try-catch error handling to `POST /api/planner/projects` so real error shows in UI.
- **Fixed project card refresh loop:** `src/app/planner/page.tsx` — changed `useEffect` dependency from `session` (object reference, re-renders on every mount) to `session?.user?.id` (only rerenders on login/logout).
- **Dashboard updated:** `src/app/dashboard/page.tsx` — replaced "Total Orders / Completed / In Progress / Documents" stats and "Recent Orders / Recent Documents" panels with project-based data. Now shows: Active Projects (total count), Completed count, In Progress (ACTIVE status) count; Recent Projects list (last 5 by updatedAt) with event type, date, status badge; Quick Actions (New Project, My Projects, Find Vendors, Support). Data fetched from `/api/planner/projects`.
- Files created: `public/logo.svg`, `public/logo-icon.svg`
- Files modified: 80+ files across codebase (see rebranding above) + `src/app/planner/page.tsx`, `src/app/api/planner/projects/route.ts`, `src/app/dashboard/page.tsx`

---

### What's Built So Far (Phase 1–5 + Rebranding)

| Feature | Page | Notes |
|---------|------|-------|
| Anonymous mode (no login) | All planner pages | localStorage, works offline |
| Project creation wizard | `/planner/create` | Role, event type, date |
| My Projects list | `/planner` | Grid view with project cards, create/delete |
| Project overview | `/planner/[id]` | Live stats: guests, budget, checklist, 9-section reference layout |
| Guest list | `/planner/[id]/guests` | CRUD, 3 views + family view, RSVP toggle, plus-ones, chief guest, bulk actions, import CSV/XLS, export PDF/XLS |
| RSVP engine | `/rsvp/[token]` | Conditional fields, custom questions, GDPR consent, QR, SMS |
| Budget tracker | `/planner/[id]/budget` | Categories + items, planned/actual/paid, auto-totals, PDF export |
| Planning checklist | `/planner/[id]/checklist` | 20 default tasks with subtasks, month grouping, dynamic seeding by date |
| Event itinerary | `/planner/[id]/itinerary` | Hour-by-hour timeline, 20 default events, inline editing |
| Notes | `/planner/[id]/notes` | Sidebar + editor, auto-save, PDF export |
| Seating chart (reception) | `/planner/[id]/seating` | Konva.js canvas, 7 table types, guest assignment, catering mode |
| Ceremony layout editor | `/planner/[id]/seating/ceremony-layout-edit` | SVG canvas, 13 element types, 43 assets, drag-drop, Add Element panel |
| Vendor marketplace | `/vendors` | Public directory, geo-search, 13 categories, profiles, inquiries |
| Vendor portal | `/vendor/*` | Profile editor, availability, portfolio, messaging, plan/billing |
| Admin panel | `/admin/*` | User/vendor management, content, settings, appearance |
| Dashboard | `/dashboard` | Project stats (active/completed/in-progress), recent projects list |
| Billing | `/planner/billing`, `/vendor/billing` | Stripe subscriptions, Basic/Premium/Elite, vendor plan |
| Ceremony & Reception | `/planner/[id]/ceremony`, `/planner/[id]/reception` | Venue details, photos, download PDF |
| Vendor list (per project) | `/planner/[id]/vendors` | Custom vendor list, CSV import, public directory cards |
| Sharing | `/planner/share/*` | Share project via token, collaborator access |
| i18n | All pages | English, Swedish, Arabic (RTL), Bengali (test — remove later). Full coverage: overview, guests, budget, checklist, itinerary, notes, ceremony, reception, vendors, settings, sidebar nav, planner header, anonymous banner, projects list, create wizard |

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
