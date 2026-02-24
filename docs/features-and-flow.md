# NestifyPro — Features & Flow

> **Technical Implementation**: See [implementation-plan.md](./implementation-plan.md) for tech stack, architecture, database schema, and development phases.
>
> **Sync Rule**: If this document is updated, reflect the relevant changes in [implementation-plan.md](./implementation-plan.md) as well.

### Market Context

- **Product**: Property Management System for CodeCanyon
- **Name**: NestifyPro (nestifypro.com)
- **Strategy**: Core ($49-59) + Separate Addons
- **Competitors**: Zaiproty (~502 sales, $49, Laravel), Smart Tenant (~198 sales, $59, Laravel)
- **Differentiators**: Next.js (no competitor uses it), modern UI, quality docs, responsive support
- **Market**: $3.6-7.1B globally, 7-9.3% CAGR

### Product Ecosystem

```
NestifyPro Core ($49-59)              → v1.0 Initial Release
├── NestifyPro SaaS Addon ($79-99)    → v2.0 Post-launch
├── NestifyPro Listing Addon ($29)    → v2.0 Post-launch
├── NestifyPro Bulk SMS/Email ($19)   → v2.0 Post-launch
└── NestifyPro Mobile App ($39-49)    → Future
```

### User Roles

| Role | Description | Access Level |
|---|---|---|
| **Super Admin** | System administrator, full access | Everything |
| **Owner/Manager** | Property owner or manager | Own properties + tenants + finances |
| **Tenant** | Renter occupying a unit | Own unit, payments, maintenance requests |
| **Staff** | Office/admin staff | Assigned properties, read-only finances |
| **Maintainer** | Maintenance worker | Assigned maintenance tasks only |

### Sidebar Navigation Tree

```
Dashboard                         /dashboard
│   KPI Cards, Charts, Alerts, Activity Feed
│   👤 ALL ROLES (role-based content)
│
├── Properties                    /properties
│   ├── All Properties            /properties
│   │   └── Dashboard stats (10 KPIs) + Grid/Compact/List views
│   │       + Search, filter (type, status), sort, unit filter
│   ├── Add Property              /properties/new
│   │   └── 4 sections: General Info → Address → Unit Management
│   │       → Amenities & Features → Property Images
│   ├── Available Units           /properties/available-units
│   │   └── Dashboard stats (5 KPIs) + Grid/Compact/List views
│   │       + Search, filter (type, beds, baths), sort
│   ├── All Units                 /properties/all-units
│   │   └── Dashboard stats (5 KPIs) + Grid/Compact/List views
│   │       + Search, filter (type, status, beds, baths), sort
│   └── [Property Detail]         /properties/[id]
│       ├── Edit Property         /properties/[id]/edit
│       │   └── Same 4-section form as Add (with inline unit CRUD)
│       ├── Tabs: [Overview] [Units] [Expenses] [Documents]
│       └── Units                 /properties/[id]/units
│           └── [Unit Detail]     /properties/[id]/units/[unitId]
│               └── Tabs: [Overview] [Maintenance] [Documents]
│   👤 SUPER_ADMIN, OWNER
│
├── Tenants                       /tenants
│   ├── Tenant List               /tenants
│   ├── Add Tenant                /tenants/new
│   └── [Tenant Profile]          /tenants/[id]
│       └── Tabs: [Overview] [Lease] [Payments] [Documents]
│   👤 SUPER_ADMIN, OWNER, STAFF
│
├── Leases                        /leases
│   ├── All / Active / Expiring / Expired (tabs)
│   ├── Create Lease              /leases/new
│   └── [Lease Detail]            /leases/[id]
│       ├── Tabs: [Details] [Invoices] [Documents]
│       └── E-Signature (sign/view status)
│   👤 SUPER_ADMIN, OWNER (TENANT can sign)
│
├── Maintenance                   /maintenance
│   ├── All Requests              /maintenance
│   ├── New Request               /maintenance/new
│   └── [Request Detail]          /maintenance/[id]
│       └── Tabs: [Details] [Comments] [Photos/Docs]
│   👤 ALL ROLES (varies by role)
│
├── Inspections                   /inspections
│   ├── All Inspections           /inspections
│   ├── New Inspection            /inspections/new
│   ├── [Inspection Detail]       /inspections/[id]
│   └── Compare (move-in vs out)  /inspections/compare
│   👤 SUPER_ADMIN, OWNER, STAFF
│
├── Invoices                      /invoices
│   ├── Invoice List              /invoices
│   ├── Create Invoice            /invoices/new
│   └── [Invoice Detail]          /invoices/[id]
│   👤 SUPER_ADMIN, OWNER, TENANT
│
├── Payments                      /payments
│   ├── All Payments              /payments
│   └── Overdue Payments          /payments/overdue
│   👤 SUPER_ADMIN, OWNER, TENANT
│
├── Expenses                      /expenses
│   ├── Expense List              /expenses
│   └── Add Expense               /expenses/new
│   👤 SUPER_ADMIN, OWNER
│
├── Reports                       /reports
│   ├── Income / Expense / P&L / Occupancy
│   ├── Tenant History / Maintenance Summary
│   ├── Overdue Payments / Inspection Reports
│   └── Export (CSV / PDF)
│   👤 SUPER_ADMIN, OWNER
│
├── Documents (utility section)   /documents
│   └── Global search, filter, bulk actions
│   👤 SUPER_ADMIN, OWNER
│
├── Messages                      /messages
│   ├── Conversations List        /messages
│   └── [Conversation Thread]     /messages/[id]
│   👤 ALL ROLES
│
├── Notices                       /notices
│   └── Notice Board (create/view)
│   👤 ALL ROLES (create: SUPER_ADMIN, OWNER only)
│
└── Settings                      /settings
    ├── General                   /settings           (company, timezone, currency)
    ├── Payment                   /settings/payment   (Stripe keys, gateway config)
    ├── Email                     /settings/email     (SMTP config)
    ├── Storage                   /settings/storage   (Cloudflare R2 config)
    ├── Plugins                   /settings/plugins   (activate/deactivate addons)
    └── Profile                   /settings/profile   (name, email, password, avatar)
    👤 System settings: SUPER_ADMIN only
    👤 Profile: ALL ROLES

─── Plugin Menus (appear when activated) ────────────────

├── SaaS Multi-Tenancy            (addon $79-99)
│   ├── Tenants (SaaS)            /saas/tenants
│   ├── Plans & Pricing           /saas/plans
│   ├── Landing Page              /saas/landing
│   └── SaaS Settings             /settings/saas
│
├── Bulk SMS/Email                (addon $19)
│   └── (bulk messaging routes)
│
└── Property Listings             (addon $29)
    └── (public listing routes)
```

**Summary**: 14 core menu sections + 3 plugin sections (hidden by default). ~35+ pages total.

### Core Features (v1.0)

#### 1. Dashboard
- **Role-based KPI cards**: Total Properties, Total Units, Tenants, Occupancy Rate, Monthly Revenue, Overdue Payments, Collection Rate, Active Maintenance, Vacant Units, Average Rent, Lease Renewals, Recent Events
- **Alert banners** (top): Overdue Payments count, Urgent Maintenance count, Expiring Leases count
- **Revenue & Expenses chart**: Monthly bar/line chart with year selector
- **Recent Activity feed**: Latest actions across the portfolio
- **Property Distribution chart**: Pie chart by property type
- **Payment Status summary**: Collected vs Pending vs Overdue
- **Upcoming Tasks**: Next due items requiring attention

**Flow**: User logs in → redirected to role-appropriate dashboard → sees relevant KPIs and alerts → clicks through to detail pages

#### 2. Properties & Units Management

**Properties List Page (`/properties`):**
- **Dashboard stats** (2 rows of 5 stat cards):
  - Row 1: Total Properties, Available Properties, Occupied Properties, Average Rent, Under Maintenance
  - Row 2: Total Rent Value, Total Units, Available Units, Occupied Units, Units in Maintenance
- **3 view modes**: Grid (default), Compact (horizontal cards), List (table rows) — toggle with icon buttons
- **Filters**: Search (name/address/city), Type dropdown (All/Residential/Commercial/Mixed), Status dropdown (All/Active/Inactive/Archived), Sort dropdown (Newest First/Oldest First/Name A-Z/Name Z-A/Most Units), Unit filter (All/Has Available/Fully Occupied)
- **Property cards** show: status badge (top-left), type badge (top-right), image/placeholder, name, description snippet, location, unit count with status breakdown (e.g., "3 Units · 2 occupied · 1 available"), unit types, rent range (min-max from units), 3-dot action menu (View, Edit, Delete)
- **Refresh button** + **Add Property button** (top right)

**Add Property (`/properties/new`) — Enhanced 4-Section Form:**
1. **General Information**: Property name, Property type (dropdown), Property status (dropdown: Active/Inactive), Description (textarea)
   - 2-column grid layout
2. **Address**: Street address (full-width), City + State/Province (2-col), ZIP/Postal code + Country (2-col, country defaults to "United States")
3. **Unit Management** (inline with property creation):
   - Blue info banner: "Smart Unit Management — Your property will automatically be configured as single or multi-unit based on the number of units you add."
   - Per-unit fields: Unit number, Unit type (dropdown), Floor, Bedrooms, Bathrooms, Square footage, Rent amount, Security deposit, Status (dropdown)
   - 3-column grid layout per row
   - Unit Images upload per unit (PNG, JPG, GIF; up to 10MB each; max 15 per unit)
   - "+ Add Unit" button to add more units
   - Remove (X) button per unit card
   - All units created in single transaction with property
4. **Amenities & Features**: 4-column checkbox grid — Parking, In-unit laundry, Air conditioning, Central heating, High-speed Wi-Fi, Furnished, Hardwood Floors, Dishwasher, Balcony/Terrace, Walk-in Closets, Pet-friendly, Swimming pool, Fitness Center, Elevator, Storage, Fireplace
   - Custom amenity input with + button
   - Amenities applied to all units during creation
5. **Property Images**: Drag & drop upload zone — PNG, JPG, GIF; up to 10MB each; max 20 images
   - "Choose Files" button as alternative
- **Bottom actions**: Cancel + Create Property buttons

**Edit Property (`/properties/[id]/edit`):**
- Same 4-section form as Add Property, pre-filled with existing data
- Unit Management section loads existing units with inline edit/add/remove
- Delete unit shows confirmation if unit has active leases

**Available Units Page (`/properties/available-units`):**
- **Dashboard stats** (5 stat cards): Available Units (count, "Across X properties"), Average Rent (currency, "Range: $X - $Y"), Most Common Type (e.g., "Apartment"), Popular Layout (e.g., "1 Bedroom"), Unique Properties (count with available units)
- **Section heading**: "Available Units — Individual units currently available for rent"
- **3 view modes**: Grid/Compact/List
- **Filters**: Search (property name/unit number/city), Type dropdown, Beds dropdown (Any/0/1/2/3+), Baths dropdown (Any/1/2/3+), Sort (Default/Lowest Rent/Highest Rent)
- **Unit cards** show: "Available" badge (green), type badge, property image/placeholder, title "{Property Name} - Unit {Number}", property description, location "{City}, {State}", bed/bath/area/floor icons, rent per month, 3-dot action menu

**All Units Page (`/properties/all-units`):**
- **Dashboard stats** (5 stat cards): Total Units, Occupied Units, Available Units, Under Maintenance, Average Rent
- **Same layout as Available Units** but shows ALL units (not just vacant)
- **Additional filter**: Status dropdown (All/Vacant/Occupied/Maintenance/Reserved)
- **Status badge colors**: Vacant=green, Occupied=blue, Maintenance=yellow, Reserved=purple

**Units (within a property):**
- List all units with status badges (Vacant/Occupied/Maintenance/Reserved)
- Add unit: unit number, type (Apartment/House/Condo/Office/Shop/Studio/Other), floor, bedrooms, bathrooms, area (sqft), rent amount, amenities (multi-select), images
- Edit/Delete unit
- Unit detail showing current tenant, lease info, maintenance history

**Flow**: Properties list → Click property → Property detail with units tab → Click unit → Unit detail with tenant/lease/history
**Alternative Flow**: Sidebar → Available Units → Browse vacant units → Click unit → Unit detail
**Alternative Flow**: Sidebar → All Units → Browse all units → Filter by status → Click unit → Unit detail

#### 3. Tenant Management
- List view with search, filter (by property, status)
- Add tenant: personal info, emergency contact, ID document upload
- Tenant profile page: contact info, current unit, lease details, payment history, documents
- Invite tenant via email (sends registration link)
- Move-in/Move-out tracking with dates
- Associate tenant with unit + lease

**Flow**: Tenants list → Add/Select tenant → Tenant profile → View/manage lease & payments → Invite via email

#### 4. Lease Management
- List view: All Leases, Active, Expiring Soon, Expired
- Create lease: select unit + tenant, start date, end date, rent amount, security deposit, payment day (1-28), terms, upload lease document
- Lease detail: dates, financials, associated invoices, renewal history
- **Auto-alerts**: 30/60/90 days before expiry (configurable)
- **Renewal workflow**: Create renewal from existing lease → adjust dates/rent → approve
- **E-Signatures (built-in)**:
  - Owner/Manager and Tenant can sign lease documents digitally
  - Signature methods: Canvas draw (finger/mouse) or Typed signature
  - Each party signs independently; both signatures required to finalize
  - Signed lease stored as PDF with embedded signatures + timestamps
  - Signature status on lease: Unsigned → Partially Signed → Fully Signed
  - Email notification sent to tenant when lease is ready to sign
  - Signed document auto-linked to lease, tenant, and property in Documents
- Status flow: Pending → Active → (Renewed/Expired/Terminated)

**Flow**: Leases list → Create lease (pick unit + tenant) → Send for signature → Tenant signs → Owner signs → Lease Active → Expiring alert → Renew or Terminate

#### 5. Maintenance Requests
- List view with filters: status, priority, property, assigned to
- Create request: select unit, title, description, category (Plumbing/Electrical/HVAC/Appliance/Structural/Pest/General), priority (Low/Medium/High/Urgent), image uploads
- Assign to maintainer/staff
- Comment thread per request (landlord/tenant/maintainer can all comment)
- Cost tracking per request
- Status flow: Open → In Progress → Completed (or Cancelled)

**Flow**: Tenant submits request → Owner/Admin sees in list → Assigns to maintainer → Maintainer updates status → Comments for communication → Mark complete with cost

#### 6. Move-in/Move-out Inspections
- Create inspection linked to unit + tenant
- Inspection type: Move-in or Move-out
- Checklist of areas/items: rooms, fixtures, appliances, exterior (customizable template)
- Per-item fields: condition rating (Good/Fair/Poor/Damaged), notes, photo uploads
- Side-by-side comparison: move-in vs move-out report for the same unit+tenant
- PDF report generation with photos and condition ratings
- Used for security deposit dispute resolution (evidence-based)
- Inspection linked to Documents (auto-stored)
- Mobile-friendly: snap photos during walkthrough from phone

**Flow**: Owner/Staff creates inspection → Walks through unit with checklist → Rates each item + takes photos → Saves report → At move-out, creates move-out inspection → System generates comparison report → Used for deposit resolution

#### 7. Payments & Invoicing
**Invoices:**
- Auto-generate monthly rent invoices (on payment day from lease)
- Manual invoice creation for: Security Deposit, Late Fee, Maintenance charge, Other
- Invoice detail: amount, due date, paid amount, balance, payment history
- Status: Pending → Paid/Overdue/Partially Paid/Cancelled

**Payments:**
- Tenant pays via Stripe (or configured gateway)
- Admin can record manual/offline payments
- Payment receipt generation
- Transaction history per tenant

**Late Fees:**
- Configurable rules: grace period (days), fee type (fixed $ or % of rent), max fee cap
- Auto-applied after grace period

**Flow**: Auto-invoice generated → Tenant notified → Tenant pays online → Receipt generated → If late → Late fee auto-added → Overdue alert to admin

#### 8. Expense Tracking
- Record expenses per property/unit
- Categories: Maintenance, Insurance, Tax, Utility, Management Fee, Legal, Other
- Fields: description, amount, date, vendor, receipt upload
- Monthly/Yearly summary by property

**Flow**: Admin adds expense → Categorize → Upload receipt → View in reports

#### 9. Reports
- **Income Report**: Revenue by property/unit, date range filter
- **Expense Report**: Expenses by category/property, date range
- **Profit & Loss**: Income minus expenses, per property or overall
- **Occupancy Report**: Occupied vs vacant units over time
- **Tenant History**: Payment history, lease history per tenant
- **Maintenance Summary**: Requests by status/priority/category, costs
- **Overdue Payments**: All overdue invoices with tenant details
- **Export**: CSV and PDF for all reports

**Flow**: Reports page → Select report type → Apply filters (date, property) → View data → Export

#### 10. Document Management (Hub + Spoke)

**Architecture**: Documents are stored once but accessible from multiple entry points — a centralized Documents page for global search/audit PLUS contextual Documents tabs on every entity detail page.

**Contextual Documents (primary access — where users spend 90% of time):**
- **Tenant Profile** → [Overview] [Lease] [Payments] [Documents] tabs — ID copies, signed leases, correspondence
- **Property Detail** → [Overview] [Units] [Expenses] [Documents] tabs — insurance, contracts, photos
- **Unit Detail** → [Overview] [Maintenance] [Documents] tabs — inspection reports, floor plans
- **Lease Detail** → [Details] [Invoices] [Documents] tabs — lease agreement, addenda, signed copies
- **Maintenance Request** → [Details] [Comments] [Photos/Docs] — before/after photos, invoices
- Upload directly from any entity page → auto-linked to that entity

**Global Documents Page (secondary — admin/audit tool):**
- Sidebar menu item (under utility section, not primary nav)
- Search all documents across the entire account
- Filter by: entity type (property/tenant/lease/unit), property, category, date range, uploaded by
- Bulk actions: download, delete, re-categorize
- Serves Super Admin + Owner for cross-entity search and auditing

**Single data model:**
- One Document record stored once → linked to property/tenant/lease/unit
- Same lease PDF appears on tenant profile, property page, AND lease detail simultaneously
- Role-based access: tenants see only their own documents

**File types**: PDF, images (JPG/PNG), Word docs (.docx)

**Flow (contextual)**: User is on tenant profile → Documents tab → Upload or view tenant's documents → No navigation away from context
**Flow (global)**: Admin needs to find all expired insurance docs → Documents page → Filter by category "Insurance" + date range → Download/manage

#### 11. In-App Messaging
> **Priority: Medium** — Research shows users prefer Phone > Email > Text > In-app portals. Primary value is compliance/documentation (date-stamped paper trail for disputes), not replacing email. Keep implementation simple — no real-time/WebSocket, async threads only.

- Async conversation threads between any two users
- Subject-based (e.g., "Rent question for Unit 3B")
- Read/Unread indicators
- Notification badge in sidebar
- Role-based: Tenants message their landlord, staff messages admin, etc.

**Flow**: User starts conversation → Select recipient → Type message → Recipient sees notification → Reply in thread

#### 12. Notice Board
> **Priority: Low-Medium** — Useful for multi-unit properties but rarely requested by buyers. Keep implementation basic — no rich text editor, no attachments, just simple text announcements.

- Admin/Owner posts announcements
- Target audience: All, Tenants only, Staff only, specific property
- Priority: Normal, Important, Urgent
- Optional expiry date
- Pinned notices at top

**Flow**: Admin creates notice → Selects target → Published → Users see on dashboard/notices page → Expires automatically

#### 13. Settings
- **General**: Company name, logo, address, timezone, currency, date format, language
- **Payment**: Configure gateways (Stripe keys, etc.), default gateway, currency
- **Email**: SMTP host, port, user, password, from address
- **Storage**: Cloudflare R2 endpoint, access key, secret, bucket name
- **Profile**: User's own name, email, password, avatar

#### 14. Multilingual / i18n
- **Library**: `next-intl` (built for Next.js App Router + Server Components)
- **Locale strategy**: Cookie-based (`NEXT_LOCALE` cookie) — NO URL prefix like `/en/dashboard`
- **Route structure**: Unchanged — `/properties`, `/tenants`, etc. (no `[locale]` segment)
- **Language switcher**: Globe icon dropdown in topbar + auth pages
- **User preference**: Each user can set preferred language in Profile settings (stored in DB `User.locale`)
- **System default**: Admin sets default language in Settings → General
- **RTL support**: Arabic and other RTL languages flip the entire layout via `dir="rtl"` on `<html>`
- **Date/number/currency formatting**: Locale-aware via `Intl.DateTimeFormat` / `Intl.NumberFormat`
- **Email language**: Emails sent in the recipient's preferred language
- **Adding new languages**: CodeCanyon buyers copy `messages/en.json` → `messages/xx.json` and add locale code to config

**Initial languages (shipped with v1.0):**

| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | LTR |
| `ar` | العربية (Arabic) | RTL |
| `es` | Español (Spanish) | LTR |
| `fr` | Français (French) | LTR |
| `pt` | Português (Portuguese) | LTR |
| `bn` | বাংলা (Bengali) | LTR |

**Translation file structure:**
```
messages/
├── en.json    ← Master file (~620-700 keys, namespaced by feature)
├── ar.json
├── es.json
├── fr.json
├── pt.json
└── bn.json
```

**Namespaces inside each JSON:** `common`, `nav`, `auth`, `dashboard`, `properties`, `tenants`, `leases`, `maintenance`, `invoices`, `payments`, `expenses`, `messages`, `notices`, `reports`, `documents`, `inspections`, `settings`, `validation`, `emails`

**Flow**: User opens app → Cookie/Accept-Language detects locale → UI renders in that language → User can switch via globe icon → Preference saved to DB + cookie → Page refreshes in new language

#### 15. Plugin System (Admin)
- **Plugin Page**: Admin sees list of all available modules (SaaS, Bulk SMS, Listing, etc.)
- Each plugin card shows: name, description, version, status (Active/Inactive)
- **Activate**: Admin enters activation key (purchased from CodeCanyon as separate addon) → key verified → plugin enabled
- **Deactivate**: Admin can deactivate anytime → features hidden, data preserved
- **No rebuild required**: All plugin code ships pre-bundled with core. Activation is DB-driven feature flag only.
- **Why this approach**: Next.js requires full rebuild on code changes. WordPress-style "upload zip → activate" causes version conflicts and page breaks. Pre-bundled + DB feature flags = zero-downtime activation.

**Plugins available (inactive by default in v1.0):**

| Plugin | Status in v1.0 | Sold As |
|---|---|---|
| SaaS Multi-tenancy | Pre-bundled, inactive | Separate addon ($79-99) |
| Bulk SMS/Email | Pre-bundled, inactive | Separate addon ($19) |
| Property Listings | Pre-bundled, inactive | Separate addon ($29) |

**Flow**: Admin → Settings → Plugins → See available modules → Enter activation key → Plugin activates instantly → New sidebar items, routes, features appear

### Role-Based Permissions Matrix

| Feature | Super Admin | Owner/Manager | Tenant | Staff | Maintainer |
|---|---|---|---|---|---|
| Dashboard | Full KPIs | Own property KPIs | Own unit summary | Assigned work | Assigned tasks |
| Properties | CRUD all | CRUD own | View own unit's property | View assigned | View assigned |
| Units | CRUD all | CRUD own | View own | View assigned | View assigned |
| Tenants | CRUD all | CRUD own | View self profile | View assigned | — |
| Leases + E-Sign | CRUD all + sign | CRUD own + sign | View + sign own | View assigned | — |
| Inspections | CRUD all | CRUD own | View own unit's | Create + View assigned | — |
| Maintenance | CRUD all | CRUD own | Create + View own | View + Update assigned | Update assigned |
| Payments | View all, record | View own, record | Pay + View own | View assigned | — |
| Invoices | CRUD all | CRUD own | View + Pay own | View assigned | — |
| Expenses | CRUD all | CRUD own | — | View assigned | — |
| Documents (global) | All | Own properties | — | — | — |
| Documents (contextual) | All | Own properties | Own documents | Assigned | — |
| Messages | All | Send/Receive | Send/Receive | Send/Receive | Send/Receive |
| Reports | All | Own properties | — | — | — |
| Settings | Full system | Own profile | Own profile | Own profile | Own profile |
| Notices | CRUD all | Create + View | View | View | View |

### Email Notifications (Automated)

| Event | Recipients | Timing |
|---|---|---|
| Invoice Generated | Tenant | On creation |
| Payment Due Reminder | Tenant | 3 days before due date |
| Payment Overdue | Tenant + Owner | 1 day after due date |
| Payment Received | Tenant + Owner | Immediately |
| Lease Expiring | Tenant + Owner | 30/60/90 days before |
| Lease Ready to Sign | Tenant | When owner sends for signature |
| Lease Fully Signed | Tenant + Owner | When both parties have signed |
| Inspection Scheduled | Tenant | When move-in/move-out inspection created |
| Inspection Completed | Tenant + Owner | When inspection report finalized |
| Maintenance Submitted | Owner + Assigned Staff | Immediately |
| Maintenance Updated | Tenant + Owner | On status change |
| Tenant Invited | New Tenant | On invite |
| Notice Posted | Target audience | Immediately |

### API-First Architecture

> **v1.0 theke shob data operations REST API diye hobe (Server Actions noy).** Ei decision er karon:

| Benefit | Detail |
|---|---|
| **Third-Party Integrations** | QuickBooks, CRMs, accounting software — shobai same `/api/*` endpoints call korbe |
| **Future Mobile App** | Flutter/React Native app same API use korbe — kono backend change lagbe na |
| **Webhook Support** | Stripe, payment gateways, tenant screening services POST korbe amader API te |
| **Extensibility** | CodeCanyon buyers nijer custom integrations build korte parbe existing API diye |
| **Testability** | curl/Postman/automated tests diye API independently test kora jay |

**Pattern**: Server Components read data directly via Prisma (fast). All writes/mutations go through `/api/*` routes (RESTful, reusable).

### What's NOT in v1.0 (Future/Addons)

**v1.1 Planned (post-launch priority):**

| Feature | Priority | Reason |
|---|---|---|
| Additional Payment Gateways (PayPal, Razorpay, Paystack) | High | Regional buyers need local gateways; Zaiproty has 28+ |
| Tenant Screening Integration (US market) | Medium-High | 65% firms use it; requires TransUnion/Experian API |
| QuickBooks Export Compatibility | Medium | Many landlords use QuickBooks for taxes — API-first architecture makes this easy |
| Calendar View | Medium | Lease/maintenance calendar — frequently requested |
| CRM Integration (HubSpot, Zoho) | Low-Medium | Tenant/lead data sync via existing REST API |

**Addons (sold separately):**

| Feature | Release | Reason |
|---|---|---|
| SaaS Multi-tenancy | Addon ($79-99) | Separate product for buyers who want to resell |
| Landing Page CMS | With SaaS addon | Only needed for SaaS landing page |
| Property Listing Page | Addon ($29) | Public-facing listing for vacant units |
| Bulk SMS/Email | Addon ($19) | Mass communication to tenants |

**Future (no timeline):**

| Feature | Reason |
|---|---|
| Full Live Chat (WebSocket) | In-app messaging is sufficient; live chat is over-engineering |
| Mobile App ($39-49) | Flutter app for tenants + owners |
| AI Chatbot | Automated tenant inquiry handling |
| Vendor/Contractor Portal | Separate portal for vendors |
| Google/Facebook OAuth | Email/password only in v1.0 |
| 2FA | Two-factor authentication |
| Page Builder | Full drag-and-drop too complex for core |
