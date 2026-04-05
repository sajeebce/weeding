# DEVELOPMENT-PLAN.md
# LLCPad — Full Project Development Tracker

**Project:** US LLC Formation & Amazon Seller Services Website
**Stack:** Next.js 16 + TypeScript 5.9 + Tailwind 4.1 + PostgreSQL 18 + Prisma 7
**Last Updated:** 2026-04-03 (Seating Chart — Alphabetical Guest Atlas real data + URL tab sync)
**Branch (current):** `tasrif` (Wedding Planner feature)

---

## OVERVIEW

| Area | Status | Notes |
|------|--------|-------|
| Core Marketing Site | ✅ Complete | All public pages live |
| Authentication System | ✅ Complete | Email/Password, OTP, Google OAuth |
| Customer Dashboard | ✅ Complete | Orders, Invoices, Docs, Profile |
| Admin Panel | ✅ Complete | Full CMS + Operations |
| Payment & Checkout | ✅ Complete | Stripe + SSLCommerz |
| Live Support (Tickets) | ✅ Complete | 8 phases, real-time Pusher |
| Leads / CRM | ✅ Complete | Pipeline, forms, analytics |
| Wedding Planner | ✅ Complete | All modules + Website builder |
| RSVP System | ✅ Complete | Token-based guest RSVP |
| Public Wedding Site | ✅ Complete | /wedding/[slug] with blocks |
| Vendor Marketplace | ✅ Complete | Public directory + vendor portal |

---

## PHASE 1 — Core Infrastructure & Auth
**Status: ✅ COMPLETE**

- ✅ Next.js 16 App Router setup
- ✅ Prisma 7 + PostgreSQL 18 database setup
- ✅ Tailwind 4.1 configuration
- ✅ NextAuth with email/password login
- ✅ Google OAuth integration
- ✅ OTP / Magic Link email login
- ✅ User roles: `customer`, `admin`, `content_manager`, `sales_agent`, `support_agent`
- ✅ Protected routes via middleware
- ✅ Password reset via email
- ✅ Session management (secure cookies)

**Pages:**
- ✅ `/login`
- ✅ `/register`
- ✅ `/forgot-password`

---

## PHASE 2 — Marketing / Public Site
**Status: ✅ COMPLETE**

- ✅ Homepage (Hero, Trust Bar, Services, Process, Packages, Testimonials, FAQ, CTA)
- ✅ Services listing page `/services`
- ✅ Individual service pages `/services/[slug]`
- ✅ Pricing page `/pricing` (dynamic from DB)
- ✅ State-wise LLC pages `/llc/[state]`
- ✅ Blog index `/blog`
- ✅ Blog post `/blog/[slug]`
- ✅ FAQ page `/faq`
- ✅ About page `/about`
- ✅ Contact page `/contact`
- ✅ Search page `/search`
- ✅ Legal pages: Privacy, Terms, Refund Policy, Disclaimer
- ✅ Dynamic CMS pages `/[slug]`

**Header/Footer:**
- ✅ Dynamic header with multiple layouts (Default, Centered, Split, Mega)
- ✅ Language switcher support
- ✅ Dynamic footer with admin-editable content
- ✅ CTA buttons (admin configurable)

---

## PHASE 3 — Admin Panel (CMS & Operations)
**Status: ✅ COMPLETE**

### Content Management
- ✅ Blog CRUD with rich editor `/admin/content/blog`
- ✅ Blog categories `/admin/content/blog-categories`
- ✅ Testimonials management `/admin/content/testimonials`
- ✅ FAQ management `/admin/content/faq`
- ✅ Legal pages editor `/admin/content/legal`

### Service Management
- ✅ Services CRUD `/admin/services`
- ✅ Service detail editor `/admin/services/[id]`
- ✅ Dynamic form builder per service `/admin/services/[id]/form-builder`
- ✅ Service categories `/admin/services/categories`
- ✅ Location-based pricing `/admin/location-pricing`
- ✅ State fees management `/admin/settings/state-fees`

### Orders & Customers
- ✅ Orders list `/admin/orders`
- ✅ Order detail `/admin/orders/[id]`
- ✅ Order edit `/admin/orders/[id]/edit`
- ✅ Customers list `/admin/customers`
- ✅ Customer profile `/admin/customers/[id]`
- ✅ Invoices `/admin/invoices`

### Appearance
- ✅ Header builder `/admin/appearance/header`
- ✅ Header menu editor `/admin/appearance/header/menu`
- ✅ Footer builder `/admin/appearance/footer`
- ✅ Theme selector & customizer `/admin/appearance/themes`
- ✅ Theme customize `/admin/appearance/themes/customize`
- ✅ Pages builder `/admin/appearance/pages`
- ✅ Page editor `/admin/appearance/pages/[id]`
- ✅ Landing page editor `/admin/appearance/landing-page`

### Settings
- ✅ General settings `/admin/settings`
- ✅ Email settings (Resend) `/admin/settings/email`
- ✅ Payment settings (Stripe, SSLCommerz) `/admin/settings/payments`
- ✅ Tracking settings (GA, GTM, Pixel) `/admin/settings/tracking`
- ✅ Plugins `/admin/settings/plugins`
- ✅ Media storage `/admin/settings/media-storage`
- ✅ Custom lists `/admin/settings/lists`
- ✅ Data management `/admin/settings/data`
- ✅ Newsletter `/admin/settings/newsletter`

### Users & Permissions
- ✅ User management `/admin/users`
- ✅ Role-based permissions `/admin/users/permissions`
- ✅ Admin profile `/admin/profile`

---

## PHASE 4 — Customer Dashboard
**Status: ✅ COMPLETE**

- ✅ Dashboard home `/dashboard` (overview, recent orders, quick actions)
- ✅ Orders list `/dashboard/orders`
- ✅ Order detail `/dashboard/orders/[id]`
- ✅ Invoices `/dashboard/invoices`
- ✅ Documents upload/download `/dashboard/documents`
- ✅ Billing `/dashboard/billing`
- ✅ Profile settings `/dashboard/profile`
- ✅ Help & Support `/dashboard/help`

---

## PHASE 5 — Checkout & Payments
**Status: ✅ COMPLETE**

- ✅ Service checkout `/checkout`
- ✅ Service-specific checkout `/checkout/[service]`
- ✅ Payment success `/checkout/success`
- ✅ Stripe integration (international, USD)
- ✅ SSLCommerz integration (Bangladesh, BDT)
- ✅ Order creation on payment success
- ✅ Invoice auto-generation
- ✅ Email confirmation on payment

---

## PHASE 6 — Live Support System (Tickets)
**Status: ✅ COMPLETE — All 8 sub-phases done**

- ✅ Phase 1: Database + basic CRUD (tickets, messages)
- ✅ Phase 2: Modern Messenger-style UI
- ✅ Phase 3: Rich features (file upload, emoji, formatting, canned responses)
- ✅ Phase 4: Live chat widget (floating button, pre-chat form, guest support)
- ✅ Phase 5: Real-time (Pusher, typing indicators, read receipts)
- ✅ Phase 6: Email notifications (Resend — 3 templates)
- ✅ Phase 7: Settings & admin (widget customization, operating hours)
- ✅ Phase 8: Polish (virtual scrolling, search, export, keyboard shortcuts, accessibility)

**Pages:**
- ✅ `/admin/tickets` — ticket list
- ✅ `/admin/tickets/[id]` — ticket detail (real-time)
- ✅ `/admin/tickets/settings` — chat settings
- ✅ `/admin/tickets/canned-responses`
- ✅ `/admin/tickets/analytics`
- ✅ `/admin/tickets/chat`

---

## PHASE 7 — Leads / CRM
**Status: ✅ COMPLETE**

- ✅ Lead capture forms (embeddable)
- ✅ Leads list with filters `/admin/leads`
- ✅ Lead detail with activity timeline `/admin/leads/[id]`
- ✅ Pipeline (Kanban-style) `/admin/leads/pipeline`
- ✅ Analytics & reporting `/admin/leads/analytics`
- ✅ Form templates `/admin/leads/forms`
- ✅ Duplicate detection `/admin/leads/duplicates`
- ✅ Lead settings `/admin/leads/settings`

---

## PHASE 8 — Wedding Planner (tasrif branch)
**Status: ✅ COMPLETE**

### Core Planner Modules
- ✅ Planner home — project list `/planner`
- ✅ Create project `/planner/create`
- ✅ Project dashboard `/planner/[id]`
- ✅ Sync (local → cloud) `/planner/sync`
- ✅ Project settings `/planner/[id]/settings`

### Event Management
- ✅ Ceremony venue `/planner/[id]/ceremony`
- ✅ Reception venue `/planner/[id]/reception`
- ✅ Itinerary (day-of schedule) `/planner/[id]/itinerary`
- ✅ Post-wedding tasks `/planner/[id]/post-wedding`

### Guest Management
- ✅ Guest list (CRUD, BRIDE/GROOM side) `/planner/[id]/guests`
- ✅ RSVP tracking per guest
- ✅ Guest RSVP public page `/rsvp/[token]`
- ✅ RSVP token generation per guest

### Budget & Finance
- ✅ Budget categories + items `/planner/[id]/budget`
- ✅ Fully inline editable — no modals (title left, cost right)
- ✅ Filter/search bar across categories and items
- ✅ User-set Total Budget (editable card, persisted to DB via PATCH)
- ✅ Total Spent = sum of item `planned` (Cost field, was wrongly using `item.actual`)
- ✅ Total Paid = sum of `item.paid` — set via checkbox per row (checked → `paid = planned`, unchecked → `paid = 0`)
- ✅ Remaining = Total Budget − Total Spent (red if over budget)
- ✅ Per-item paid checkbox: marks item green + strikethrough; saves to DB / localStorage
- ✅ PDF export: columns = Category / Item / Cost (using `item.planned`); full summary section (Budget / Spent / Paid / Remaining)
- ✅ `budgetGoal` field on `WeddingProject` (added via raw SQL ALTER TABLE + prisma generate)
- ✅ Budget goal persists across page refreshes (load-once ref pattern via `budgetGoalLoadedRef`)
- ✅ Overview page Budget card shows `budgetGoal` from API + `totalSpent` from item.planned sums

### Planning Tools
- ✅ Checklist (tasks with deadlines) `/planner/[id]/checklist`
- ✅ Notes (rich note taking) `/planner/[id]/notes`
- ✅ Vendor management `/planner/[id]/vendors` (full redesign — see Phase 9 details)

### Seating Chart & Supplies `/planner/[id]/seating`
**Status: ✅ COMPLETE (2026-04-03)**
- ✅ 7 tabs matching reference (planning.wedding) design exactly:
  1. **Ceremony Layout** — SVG arch + pew rows diagram, A1 portrait, Download PDF, Recommendation
  2. **Reception Layout** — SVG round tables + dance floor diagram
  3. **Alphabetical Guest Atlas** — Real guest data sorted A→Z with table assignments in 4-column layout (reference-exact)
  4. **Seating Cards by Table** — Folded tent card preview SVG (table number + guest names)
  5. **Classic Name Cards** — Individual tent-fold name card grid SVG
  6. **Table Numbers** — Double-sided number card grid SVG (1–9)
  7. **Reception Menu** — Menu card SVG (Appetizer / Main Course / Dessert / Beverages)
- ✅ Each tab: preview card + "Click here to edit layout" + paper size + Download PDF + Recommendation + gallery
- ✅ Dashed curved SVG connector from active tab to content
- ✅ Default tab = "Reception Layout" when arriving via sidebar direct click
- ✅ Canvas editor mode (Konva) for interactive table arrangement
- ✅ Guest assignment modal per table
- ✅ "Plan venue layout" from Ceremony page → `/seating?tab=ceremony&src=ceremony` (sidebar keeps "Ceremony" highlighted)
- ✅ "Plan venue layout" from Reception page → `/seating?tab=reception&src=reception` (sidebar keeps "Reception" highlighted)
- ✅ Sidebar `isActive` uses `useSearchParams()` + `src` param to suppress seating highlight when coming from venue pages
- ✅ Shared `CeremonyDiagram` + `ReceptionDiagram` in `src/components/planner/venue-diagrams.tsx`

### Alphabetical Guest Atlas (real data — 2026-04-03)
- ✅ `buildGuestTableMap()` — builds `Map<guestId, tableName>` from all seating layout tables
- ✅ Real guests fetched from API/localStorage (same source as `/planner/[id]/guests`)
- ✅ Sorted alphabetically: last name → first name (`localeCompare`)
- ✅ Grouped by first letter of last name (or first name if no last name)
- ✅ 4-column CSS layout with letter section headers (purple bold)
- ✅ Dotted leader lines between name and table number
- ✅ Table lookup: seating layout `guestIds` first → falls back to guest `tableNumber` field
- ✅ Empty state: "No guests yet. Add guests from the Guest List page."
- ✅ Stats: "Total X guests / Seated X guests / Let's seat more guests on the layout"
- ✅ URL sync: tab selection updates `?tab=atlas` via `window.history.replaceState()`
- ✅ Page reload preserves selected tab from URL param
- ✅ Default tab (Reception Layout) has clean URL with no query param

### Wedding Website Builder
**Status: ✅ COMPLETE (bugs fixed 2026-03-31)**
- ✅ Block-based website builder `/planner/[id]/website`
- ✅ 11 block types: Cover, Hero, Our Story, Venue, Schedule, Gallery, RSVP, Registry, Wedding Party, Countdown, Guestbook
- ✅ Theme selector (Modern, Floral, Rustic, Minimal)
- ✅ Custom primary/accent colors + font
- ✅ Auto-fill from ceremony date/location
- ✅ Auto-fill couple names from project
- ✅ Publish / Unpublish toggle
- ✅ Custom slug (`/wedding/[slug]`)
- ✅ Auto-save (800ms debounce → API → PostgreSQL)
- ✅ Save/load from DB (WeddingWebsite table)
- ✅ Error feedback for load/save failures
- ✅ Preview modal (in-editor preview)
- ✅ Navigation links with anchor IDs

### Public Wedding Site
**Status: ✅ COMPLETE (bugs fixed 2026-03-31)**
- ✅ Public page `/wedding/[slug]`
- ✅ Renders all 11 block types
- ✅ Theme + color + font applied
- ✅ Null-safety on all block settings
- ✅ `force-dynamic` (no stale cache)
- ✅ 404 if unpublished
- ✅ SEO metadata (`generateMetadata`)
- ✅ Responsive design

### Admin Planner View
- ✅ Admin can view all planner projects `/admin/planner`

---

## PHASE 9 — Vendor Marketplace
**Status: ✅ COMPLETE (2026-04-01)**

### Phase 9A — Couple's Vendor List (private, per-project)
- ✅ WeddingVendor model (separate from public VendorProfile)
- ✅ CRUD API `/api/planner/[id]/vendors`
- ✅ Vendor list UI `/planner/[id]/vendors` — full redesign (2026-04-01):
  - Horizontal scroll row: public approved vendors (full-bleed gradient cards) + "Search and Add Vendors" CTA
  - Public vendors fetched from `/api/vendors?page=1` (isApproved + isActive)
  - Per-category gradient colors (`CATEGORY_GRADIENTS` map)
  - Card design: full-bleed `w-48 h-56` rounded card, dark overlay, category badge top-left, vendor name overlaid at bottom
  - Private vendor grid below (couple's own vendors with contact info)
  - Action bar: Add custom vendor, Import from file (CSV/XLSX), Template download, Copy invite link
  - Info sections: custom vendor, invite supplier, hide/show suggested vendors
  - Download PDF of all private vendors (`@react-pdf/renderer`)
  - Search bar removed (replaced by "Search and Add Vendors" card)

### Phase 9B — Public Vendor Directory
- ✅ Public vendor listing `/vendors` (filterable by category, city, search)
- ✅ Individual vendor profile page `/vendors/[slug]`
- ✅ Inquiry form (sends to vendor + logged in DB)
- ✅ Star rating display
- ✅ Browse Vendors button in planner dashboard

### Phase 9C — Admin Vendor Management
- ✅ Admin vendor list `/admin/vendors` (approve, suspend, edit, delete)
- ✅ Add vendor from admin panel (manual entry)
- ✅ Vendor stats (inquiry count, review count)
- ✅ Admin sidebar: Vendor Marketplace subsection
- ✅ Inline status filter (Pending / Approved / Suspended)
- ✅ "View All Vendors" button (was "View Public Directory") → links to `/vendors`
- ✅ Admin sidebar nav: "View All Vendors" (was "View Directory")

### Phase 9D — Vendor Portal
- ✅ `VENDOR` role added to `UserRole` enum
- ✅ Vendor registration `/vendor/register` (4-step: account → business → preview → done)
- ✅ Vendor login redirects to `/vendor/dashboard` via `callbackUrl`
- ✅ Vendor portal layout with sidebar nav `/vendor/layout.tsx`
- ✅ Vendor dashboard `/vendor/dashboard` (stats: inquiries, reviews, rating)
- ✅ Vendor profile editor `/vendor/profile` (category, location, pricing, photos)
- ✅ Vendor inquiries `/vendor/inquiries` (view, reply via email, update status)
- ✅ Vendor reviews `/vendor/reviews` (rating distribution)
- ✅ Vendor settings `/vendor/settings`
- ✅ Middleware protects `/vendor/*` (VENDOR role only; `/vendor/register` public)
- ✅ "Register as a Vendor" link on `/planner/create`

**Database:**
- `VendorProfile` — public marketplace listing (userId nullable unique, status VendorStatus)
- `VendorInquiry` — inquiry from couple to vendor
- `VendorReview` — review + rating
- `VendorStatus` enum — PENDING, APPROVED, REJECTED, SUSPENDED
- `VENDOR` added to `UserRole` enum

**Bug Fixes:**
- Vendor registration "Network error" → cleared `.next` + `prisma generate` after schema change
- Stats showing 0 → API returns `{ stats: {...} }` wrapper; fixed dashboard to read `data.stats`
- Edit modal empty email/phone → included `user` relation in admin GET; fallback `v.email || v.user?.email`
- Vendor login → customer dashboard → added `redirect` callback in `auth.ts` + `callbackUrl` param

### Database (WeddingWebsite table)
- ✅ Table created in PostgreSQL (2026-03-31)
- ✅ Migration file: `prisma/migrations/20260331000000_add_wedding_website/`
- ✅ Prisma schema: `WeddingWebsite` model at `prisma/schema.prisma:1674`
- ✅ Prisma client regenerated

---

## KNOWN LIMITATIONS / NOT YET IMPLEMENTED

| Feature | Priority | Notes |
|---------|----------|-------|
| Password-protected wedding sites | Low | `password` field exists in DB, check not yet built |
| Custom domain for wedding site | Low | `customDomain` field in DB, routing not built |
| Real RSVP form on public wedding site | Medium | Currently links to guestbook; no actual RSVP submission |
| Guestbook submission (public) | Medium | UI shows textarea but it's read-only |
| Gallery image upload (cloud) | Medium | Currently URL-based; no direct file upload |
| Email notifications for wedding (RSVP received) | Low | Not wired |
| Docker deployment config | Low | Planned for VPS (Hetzner/Contabo) |

---

## BUG FIXES LOG

| Date | Bug | Fix |
|------|-----|-----|
| 2026-03-31 | WeddingWebsite table missing from DB | Created via pg client + migration file |
| 2026-03-31 | Save silently failed (no table) | Table now exists; added loadError/saveError UI states |
| 2026-03-31 | /wedding/[slug] "Something Went Wrong" | Array.isArray null-safety + force-dynamic |
| 2026-03-31 | Draft shown after refresh | Was API 500 fallback to localStorage; fixed with table creation |
| 2026-03-31 | Published → Page Not Found | published flag now actually saves to DB |
| 2026-03-31 | Nav links in Cover block not working | Changed from string[] to {label, href}[], added section IDs |
| 2026-03-31 | gallery/registry/people .filter() crash | Added ?? [] guards on block settings |
| 2026-04-01 | Budget goal reset to $0 on page refresh | `budgetGoalLoadedRef` — only load from API on first fetch, never overwrite on subsequent reloads |
| 2026-04-01 | `prisma migrate dev` failed (shadow DB error P3006) | Added `budgetGoal` column via raw SQL: `ALTER TABLE "WeddingProject" ADD COLUMN IF NOT EXISTS "budgetGoal" DOUBLE PRECISION NOT NULL DEFAULT 0` |
| 2026-04-01 | Total Spent not updating | Was summing `item.actual` (always 0); changed to `item.planned` (Cost field) |
| 2026-04-01 | Overview Budget card showing $0 | Fixed: reads `d.budgetGoal` from API for total; sums `i.planned` for spent |
| 2026-04-01 | PDF showing $0 for all costs | Was using `item.actual`; fixed to use `item.planned`; added full summary to PDF |
| 2026-04-01 | `catId` undefined in paid checkbox handler | Used undefined `catId` variable inside `.map()` scope; fixed to use `cat.id` |
| 2026-04-01 | Vendor cards not matching reference design | Old: gradient header (h-36) + white info section. New: full-bleed `w-48 h-56` card with gradient/image cover, dark overlay, text overlaid at bottom |
| 2026-04-01 | Admin "View Public Directory" button text | Renamed to "View All Vendors" in `/admin/vendors` page and admin sidebar |
| 2026-04-01 | Public vendors not shown on planner vendor page | Now fetches `/api/vendors?page=1` (approved vendors) and displays in horizontal scroll row above private vendor grid |
| 2026-04-03 | Seating tabs 3–7 showed "coming soon" placeholder | Replaced with proper LayoutPanel + SVG preview diagrams for all 7 tabs |
| 2026-04-03 | "Seating Chart & Supplies" highlighted when coming from ceremony/reception "Plan venue layout" | Sidebar uses `useSearchParams()` with `?src=ceremony/reception` param to keep venue items active instead |
| 2026-04-03 | Seating page defaulted to "ceremony" tab on direct sidebar click | Changed default `activeTab` to "reception" |
| 2026-04-03 | Alphabetical Guest Atlas showed hardcoded fake data | Replaced `GuestAtlasDiagram` with `AlphabeticalAtlasPanel` using real guests + `buildGuestTableMap()` from layouts |
| 2026-04-03 | Atlas tab URL did not update when switching tabs | Added `useEffect` on `activeTab` → `window.history.replaceState()` with `?tab=` param |

---

## TECH DEBT / FUTURE IMPROVEMENTS

- [ ] Run `prisma migrate dev` properly once schema drift is resolved
- [ ] Add E2E tests for checkout flow
- [ ] Add unit tests for planner storage utils
- [ ] Docker + nginx config for VPS deployment
- [ ] Cloudflare R2 for document/image storage (currently local `public/uploads`)
- [ ] Redis cache layer for high traffic (not needed yet for VPS single-server)
