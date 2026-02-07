# Service Details Page Redesign Plan

## LLCPad - Dynamic Template System for Service Pages

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [2025 Design Trends & Best Practices](#2025-design-trends--best-practices)
4. [Competitor Analysis](#competitor-analysis)
5. [Architecture: Smart Context Widgets](#architecture-smart-context-widgets)
6. [Existing Infrastructure](#existing-infrastructure)
7. [Service Widget Catalog](#service-widget-catalog)
8. [Enhanced Existing Widgets](#enhanced-existing-widgets)
9. [Admin UX: Template Preview](#admin-ux-template-preview)
10. [Default Template Structure](#default-template-structure)
11. [Implementation Phases](#implementation-phases)
12. [File Structure](#file-structure)
13. [Data Flow](#data-flow)

---

## Executive Summary

Transform the current static service details page into a **dynamic template system** using the existing Page Builder. Instead of building a separate block system per service, we extend the Page Builder with **"Smart Context Widgets"** -- widgets that automatically pull data from the current service's context, like WordPress/Elementor's Theme Builder.

### Key Insight

**80% of the infrastructure already exists.** The Page Builder already has `PageTemplateType.SERVICE_DETAILS`, `ServiceProvider` context, placeholder resolution (`{{service.name}}`), and template rendering. What's missing are the **service-specific widget components** and **admin preview UX**.

### Architecture Decision

**Template-based approach** (ONE template for ALL services) vs the old per-service block approach:

| Aspect | Old Plan (Per-Service Blocks) | New Plan (Template System) |
|--------|-------------------------------|---------------------------|
| Database | New `ServicePageBlock` model per service | No new models needed |
| Admin UX | Separate builder per service | Reuse existing Page Builder |
| Layout | Unique layout per service | ONE template, dynamic data |
| Maintenance | N layouts to maintain | 1 template to maintain |
| Consistency | Risk of inconsistency | Guaranteed consistency |
| Code | New registry, new renderer | Reuse existing widget system |

### Goals

- **Template Reuse**: ONE layout template applies to ALL service pages
- **Dynamic Data**: Service data (title, price, features, packages, FAQs) fills in automatically per slug
- **Zero New Models**: Reuse existing `LandingPage` + `LandingPageBlock` tables
- **Backward Compatible**: Existing static pages and widgets work unchanged
- **Per-Service Customization**: `displayOptions` JSON field controls section visibility per service
- **Admin Preview**: Select a sample service to preview real data while editing template
- **Conversion Optimized**: 2025 best practices built into widget designs

---

## Current State Analysis

### Frontend Structure (`/services/[slug]/page.tsx`)

| Section | Description | Customizable? |
|---------|-------------|---------------|
| Breadcrumb | Back link to services | No |
| Hero | Icon, title, short desc, CTA buttons | Partially (text only) |
| What's Included | Feature grid with checkmarks | Yes (features list) |
| Package Comparison | Interactive pricing table | Yes (packages/features) |
| Long Description | Rich HTML content | Yes (rich text) |
| FAQs | Accordion-style Q&A | Yes (FAQ list) |
| Related Services | Card grid | Auto-generated |

### Current Limitations

1. **Fixed Section Order** - Cannot reorder or hide sections
2. **No Section Variants** - Each section has only one design option
3. **No Custom Sections** - Cannot add testimonials, process steps, trust badges, etc.
4. **No Per-Service Customization** - All services use identical layout
5. **No Visual Editor** - Text-only editing in admin panel

### What Already Works

The service details page (`services/[slug]/page.tsx`) already has **two rendering modes**:

```
Mode A: Template Mode (if SERVICE_DETAILS template exists)
  ├── Fetches active template via getActiveTemplateForType("SERVICE_DETAILS")
  ├── Wraps in ServiceProvider context
  ├── Filters sections by displayOptions
  └── Renders via PageBuilderRenderer

Mode B: Fallback Mode (no template)
  └── Hardcoded JSX layout (current default)
```

---

## 2025 Design Trends & Best Practices

### High-Converting Service Page Elements

Based on research from [Unbounce](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/), [KlientBoost](https://www.klientboost.com/landing-pages/saas-landing-page/), and [Apexure](https://www.apexure.com/blog/best-saas-landing-pages-with-analysis):

| Element | Impact | Priority |
|---------|--------|----------|
| Social Proof | +34% conversions | Critical |
| Single CTA Focus | +266% vs multiple offers | Critical |
| Above-fold Value Prop | Instant impact | Critical |
| Mobile Optimization | Reduce bounce | Critical |
| Trust Signals | Builds credibility | High |
| Process Steps | Reduces anxiety | High |
| Video Content | Increases engagement | Medium |
| Live Chat | Real-time support | Medium |

### Trust Signal Placement Strategy

```
TRUST SIGNALS should be placed:
├── Hero section (above fold)
├── Near pricing (reduce purchase anxiety)
├── Above CTA buttons
└── Footer (reinforcement)
```

### Color Psychology (Midnight Orange Theme)

- **Orange** (#F97316) - Action, energy, urgency (CTAs)
- **Green** (#22C55E) - Success, trust, checkmarks
- **Midnight** (#0A0F1E) - Authority, premium feel
- **White** (#FFFFFF) - Clean, professional content areas

---

## Competitor Analysis

### Common Page Structure Across Competitors (Bizee, ZenBusiness, LegalZoom)

```
┌─────────────────────────────────────────────────────────────┐
│  1. TRUST BAR (Trustpilot, BBB, security badges)           │
├─────────────────────────────────────────────────────────────┤
│  2. HERO (Title, subtitle, main CTA, trust text)           │
├─────────────────────────────────────────────────────────────┤
│  3. FEATURES GRID (What's Included)                        │
├─────────────────────────────────────────────────────────────┤
│  4. PRICING TABLE (comparison, sticky sidebar)             │
├─────────────────────────────────────────────────────────────┤
│  5. PROCESS STEPS (what happens after purchase)            │
├─────────────────────────────────────────────────────────────┤
│  6. DESCRIPTION (detailed rich text)                       │
├─────────────────────────────────────────────────────────────┤
│  7. TESTIMONIALS / REVIEWS                                 │
├─────────────────────────────────────────────────────────────┤
│  8. FAQ ACCORDION                                          │
├─────────────────────────────────────────────────────────────┤
│  9. FINAL CTA                                              │
├─────────────────────────────────────────────────────────────┤
│  10. RELATED SERVICES                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture: Smart Context Widgets

### Core Concept

Service widgets use `useOptionalServiceContext()` to detect if they're inside a service page:
- **Context available** (live page): Pull real data from the current service
- **No context** (admin preview without selection): Show placeholder UI
- **Context from preview selector** (admin with service selected): Show real sample data

This matches the existing `service-hero` widget pattern.

### How It Works

```
Admin creates SERVICE_DETAILS template in Page Builder
         ↓
Adds service widgets: Hero, Features, Pricing, FAQ, etc.
         ↓
Each widget reads data from ServiceContext (auto mode)
         ↓
Template saved to LandingPage table (templateType = SERVICE_DETAILS)
         ↓
User visits /services/llc-formation
         ↓
Server fetches:
  1. Service data (LLC Formation) from Service table
  2. Active SERVICE_DETAILS template from LandingPage table
         ↓
Wraps template in <ServiceProvider service={llcFormationData}>
         ↓
PageBuilderRenderer renders sections/widgets
         ↓
Each service widget reads from context → displays LLC Formation data
         ↓
User visits /services/ein-number → SAME template, DIFFERENT data
```

### Widget Categories

```
SERVICE WIDGETS (Dynamic - pull from ServiceContext)
├── service-hero          - Title, description, icon, CTAs [EXISTS]
├── service-features      - What's Included grid [NEW]
├── service-description   - Rich HTML description [NEW]
├── service-breadcrumb    - Dynamic breadcrumb nav [NEW]
└── related-services      - Related service cards [NEW]

ENHANCED EXISTING WIDGETS (Support both static + dynamic modes)
├── pricing-table         - Add "auto" mode (slug from context) [ENHANCE]
└── faq                   - Add "service" source (FAQs from context) [ENHANCE]

STATIC WIDGETS (Already work in templates - no changes needed)
├── trust-badges          - Trust badges display
├── stats-section         - Statistics with animated counters
├── testimonials-carousel - Customer testimonials
├── process-steps         - How It Works section
├── heading               - Advanced heading
├── text-block            - Rich text editor
├── image                 - Image with effects
├── image-slider          - Hero slider
├── lead-form             - Contact form
├── divider               - Section divider
└── ... (all existing widgets)
```

---

## Existing Infrastructure

### Already Built (No Changes Needed)

| Component | Location | Purpose |
|-----------|----------|---------|
| `PageTemplateType.SERVICE_DETAILS` | `prisma/schema.prisma` | Template type enum |
| `LandingPage.templateType` | `prisma/schema.prisma` | Template assignment field |
| `LandingPage.isTemplateActive` | `prisma/schema.prisma` | Active template flag |
| `ServiceProvider` | `src/lib/page-builder/contexts/service-context.tsx` | React context for service data |
| `useServiceContext()` | Same file | Required context hook |
| `useOptionalServiceContext()` | Same file | Optional context hook (for preview) |
| `resolvePlaceholders()` | Same file | `{{service.xxx}}` template strings |
| `filterSectionsByDisplayOptions()` | Same file | Per-service section visibility |
| `ServiceData` type | Same file | Full service data interface |
| Template rendering | `src/app/(marketing)/services/[slug]/page.tsx` | Already checks for template |
| `getActiveTemplateForType()` | `src/lib/data/templates.ts` | Fetches active template |
| `PageBuilderRenderer` | `src/components/page-builder/renderer/` | Renders sections/widgets |
| `WidgetRegistry` | `src/lib/page-builder/widget-registry.ts` | Widget registration system |
| `service-hero` widget | `src/components/page-builder/widgets/service/service-hero.tsx` | Dynamic hero (working example) |
| Widget type declarations | `src/lib/page-builder/types.ts` | `service-features`, `service-faq`, etc. already in union |

### ServiceContext Data Shape

```typescript
interface ServiceData {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;        // Rich HTML
  icon?: string | null;
  image?: string | null;
  startingPrice: number;
  processingTime?: string | null;
  isPopular: boolean;
  category?: { id, name, slug } | null;
  packages: PackageData[];     // Pricing tiers
  features: ServiceFeatureData[];  // What's Included items
  faqs: ServiceFAQData[];     // Service-specific FAQs
  displayOptions: Partial<ServiceDisplayOptions>;
}
```

### Per-Service Display Options

Each service has a `displayOptions` JSON field that controls which template sections are visible:

```typescript
interface ServiceDisplayOptions {
  showHero: boolean;          // service-hero widget
  showFeatures: boolean;      // service-features widget
  showPricing: boolean;       // pricing-table (auto mode)
  showProcessSteps: boolean;  // process-steps widget
  showFaq: boolean;           // faq widget (service source)
  showRequirements: boolean;
  showDeliverables: boolean;
  showTimeline: boolean;
  showRelatedServices: boolean;
  showTestimonials: boolean;
  showCtaBanner: boolean;
}
```

This means: ONE template, but each service can hide/show specific sections. For example, a simple service might hide the pricing table, while LLC Formation shows everything.

---

## Service Widget Catalog

### 1. Service Hero (EXISTS)

**File:** `src/components/page-builder/widgets/service/service-hero.tsx`

Already built and working. Pulls title, description, icon, price from `ServiceContext`.

Settings:
- Title source: auto (from service) | custom
- Subtitle source: auto | custom
- Price badge: show/hide, custom text with `{{service.startingPrice}}`
- Primary CTA: text, link (supports `{{service.slug}}`), show price
- Secondary CTA: show/hide, text, link
- Background: none | solid | gradient | image
- Text alignment, title size, spacing

### 2. Service Features (NEW)

**File:** `src/components/page-builder/widgets/service/service-features.tsx`

Reads `service.features[]` from context. Renders "What's Included" section.

```typescript
interface ServiceFeaturesWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string;           // Default: "What's Included"
  layout: "grid" | "list" | "cards";
  columns: 1 | 2 | 3 | 4;
  showIcons: boolean;
  iconStyle: "check" | "circle-check" | "badge-check" | "custom";
  iconColor: string;              // Default: "#22C55E" (green)
}
```

**Data source:** `useServiceContext().service.features` (no API call needed)

**Preview placeholder:** Shows 6 sample feature items with checkmark icons.

### 3. Service Description (NEW)

**File:** `src/components/page-builder/widgets/service/service-description.tsx`

Reads `service.description` (HTML) from context. Renders rich text with prose styling.

```typescript
interface ServiceDescriptionWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string;           // Default: "About {{service.name}}"
  showTitle: boolean;
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
  fontSize: "sm" | "md" | "lg";
  textColor?: string;
  backgroundColor?: string;
  padding: number;
  borderRadius: number;
}
```

**Data source:** `useServiceContext().service.description` (no API call needed)

**Preview placeholder:** Shows lorem ipsum with prose typography.

### 4. Service Breadcrumb (NEW)

**File:** `src/components/page-builder/widgets/service/service-breadcrumb.tsx`

Renders dynamic breadcrumb: Home > Services > {Category?} > {Service Name}

```typescript
interface ServiceBreadcrumbWidgetSettings {
  separator: "chevron" | "slash" | "arrow" | "dot";
  showHome: boolean;
  homeLabel: string;              // Default: "Home"
  showCategory: boolean;
  fontSize: "xs" | "sm" | "md";
  textColor?: string;
  activeColor?: string;
  linkColor?: string;
  alignment: "left" | "center";
}
```

**Data source:** `useServiceContext().service.{name, slug, category}` (no API call)

### 5. Related Services (NEW)

**File:** `src/components/page-builder/widgets/service/related-services.tsx`

Fetches related services via API, excluding current service.

```typescript
interface RelatedServicesWidgetSettings {
  titleSource: "auto" | "custom";
  customTitle?: string;           // Default: "Related Services"
  subtitleSource: "auto" | "custom";
  customSubtitle?: string;
  maxItems: number;               // Default: 4
  layout: "grid" | "carousel";
  columns: 2 | 3 | 4;
  showPrice: boolean;
  showDescription: boolean;
  cardStyle: "minimal" | "elevated" | "bordered";
}
```

**Data source:** Hybrid. Gets current slug from `useServiceContext()`, then fetches `GET /api/services/related?slug={slug}&limit={n}` via API.

**API Route (NEW):** `src/app/api/services/related/route.ts`

---

## Enhanced Existing Widgets

### Pricing Table - Auto Mode

**File:** `src/components/page-builder/widgets/commerce/pricing-table-widget.tsx`

Current behavior: Requires hardcoded `serviceSlug` in `dataSource` settings.

Enhancement: Add `dataSource.mode: "manual" | "auto"`:
- **"manual"** (default): Uses `dataSource.serviceSlug` -- current behavior, unchanged
- **"auto"**: Reads slug from `useOptionalServiceContext()`, fetches same API

```typescript
// Enhanced dataSource settings
dataSource: {
  type: "service" | "manual";
  mode: "manual" | "auto";     // NEW
  serviceSlug?: string;         // Used when mode === "manual"
}
```

**Backward compatible:** Default `mode: "manual"` means all existing pricing-table widgets work unchanged.

### FAQ Widget - Service Source

**File:** `src/components/page-builder/widgets/layout/faq-accordion-widget.tsx`

Current behavior: `source: "all" | "category"` -- fetches global FAQs via API.

Enhancement: Add `source: "service"`:
- **"all"** / **"category"**: Unchanged API fetch behavior
- **"service"** (NEW): Reads `service.faqs` from `useServiceContext()` directly (no API call)

```typescript
source: "all" | "category" | "service";  // "service" is NEW
```

**Backward compatible:** Default `source: "all"` means all existing FAQ widgets work unchanged.

---

## Admin UX: Template Preview

### "Preview as Service" Dropdown

When editing a page with `templateType === "SERVICE_DETAILS"`, the admin toolbar shows a service selector dropdown.

```
┌─────────────────────────────────────────────────────────────┐
│  Page Builder: Service Details Template                      │
│  ═══════════════════════════════════════════════════════    │
│                                                             │
│  [Desktop] [Mobile]  Preview as: [LLC Formation ▼]  [Save] │
│                                                             │
│  ┌─────────────┐  ┌────────────────────────────────────┐   │
│  │ WIDGETS     │  │                                    │   │
│  │             │  │  [service-breadcrumb]              │   │
│  │ Service     │  │  Home > Services > LLC Formation   │   │
│  │ ├ Hero      │  │                                    │   │
│  │ ├ Features  │  ├────────────────────────────────────┤   │
│  │ ├ Pricing   │  │                                    │   │
│  │ ├ FAQ       │  │  [service-hero]                    │   │
│  │ ├ Descript  │  │  LLC Formation                     │   │
│  │ ├ Breadcr   │  │  Get Started - From $0             │   │
│  │ └ Related   │  │                                    │   │
│  │             │  ├────────────────────────────────────┤   │
│  │ Content     │  │                                    │   │
│  │ ├ Heading   │  │  [service-features]                │   │
│  │ ├ Text      │  │  ✓ Free Formation  ✓ EIN Setup    │   │
│  │ └ Process   │  │  ✓ Operating Agreement  ...       │   │
│  │             │  │                                    │   │
│  │ Commerce    │  ├────────────────────────────────────┤   │
│  │ ├ Pricing   │  │  [pricing-table mode:auto]         │   │
│  │ └ Services  │  │  Basic $0 | Standard $199 | ...   │   │
│  │             │  │                                    │   │
│  └─────────────┘  └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
1. New component: `src/components/admin/ui/service-preview-selector.tsx`
2. Fetches service list from `GET /api/services/public`
3. When selected, fetches full service data and wraps canvas with `<ServiceProvider>`
4. All service widgets receive real data in builder preview

---

## Default Template Structure

When creating a new SERVICE_DETAILS template, pre-populate with this structure:

```
Section 1: Full-width, layout "1"
  └── service-breadcrumb (Home > Services > {name})

Section 2: Full-width, layout "1", py-16
  └── service-hero (center aligned, auto title/subtitle)

Section 3: Layout "1", py-12, light background
  └── service-features (grid, 3 columns, green checkmarks)

Section 4: Layout "1", py-16
  └── pricing-table (mode: "auto", view: table comparison)

Section 5: Layout "1", py-12
  └── service-description (with title "About {{service.name}}")

Section 6: Layout "1", py-12, light background
  └── faq (source: "service", style: cards)

Section 7: Layout "1", py-12
  └── related-services (4 items, grid layout)
```

This is generated via `createDefaultServiceDetailsTemplate()` in `src/lib/page-builder/template-defaults.ts`, using existing `createSection()` and `createWidget()` helpers from the widget registry.

---

## Implementation Phases

### Phase 1: Types & Defaults

**Files:**
- `src/lib/page-builder/types.ts` -- Add `"service-description"`, `"service-breadcrumb"` to WidgetType union; add new widget settings interfaces; enhance pricing-table dataSource with `mode` field; enhance FAQ source with `"service"` option
- `src/lib/page-builder/defaults.ts` -- Add defaults for 4 new widgets, update pricing-table defaults

**No breaking changes.** All additions are backward compatible.

### Phase 2: Context-Only Widgets

Build widgets that read directly from ServiceContext (no API calls):

- `service-features` -- Grid of service features with checkmarks
- `service-description` -- Rich HTML description with prose styling
- `service-breadcrumb` -- Dynamic breadcrumb navigation

Each follows the `service-hero` pattern: `useOptionalServiceContext()` + placeholder when no context.

**Files:** Widget components + settings panels in `src/components/page-builder/widgets/service/` and `src/components/page-builder/settings/`

### Phase 3: Enhance Existing Widgets

Add dynamic modes to existing widgets:

- `pricing-table` -- Add `dataSource.mode: "auto"` that reads slug from ServiceContext
- `faq` -- Add `source: "service"` that reads `service.faqs` from context

**Backward compatible.** Defaults preserve current behavior.

### Phase 4: Related Services Widget + API

Build `related-services` widget and its API route (`GET /api/services/related`).

### Phase 5: Admin UX - Template Preview

Add "Preview as Service" dropdown to page editor when editing SERVICE_DETAILS template. Wraps canvas with `ServiceProvider` using selected service's data.

### Phase 6: Registration & Wiring

Register all new widgets, add to renderer map, add settings panels to builder panel, update barrel exports.

### Phase 7: Default Template (Optional)

Create `createDefaultServiceDetailsTemplate()` factory function for pre-populating new SERVICE_DETAILS templates.

---

## File Structure

### New Files

```
src/components/page-builder/widgets/service/
  service-features.tsx            # Features grid from context
  service-description.tsx         # Rich HTML description from context
  service-breadcrumb.tsx          # Dynamic breadcrumb
  related-services.tsx            # Related services cards via API

src/components/page-builder/settings/
  service-features-settings.tsx   # Settings panel
  service-description-settings.tsx
  service-breadcrumb-settings.tsx
  related-services-settings.tsx

src/components/admin/ui/
  service-preview-selector.tsx    # "Preview as Service" dropdown

src/app/api/services/related/
  route.ts                        # GET /api/services/related

src/lib/page-builder/
  template-defaults.ts            # Default template factory
```

### Modified Files

```
src/lib/page-builder/types.ts                    # New types + enhanced types
src/lib/page-builder/defaults.ts                 # New defaults
src/lib/page-builder/register-widgets.ts         # Register 4 new widgets
src/components/page-builder/widgets/service/index.ts  # Barrel exports
src/components/page-builder/renderer/widget-renderer.tsx  # Widget map
src/components/page-builder/widgets/commerce/pricing-table-widget.tsx  # Auto mode
src/components/page-builder/widgets/layout/faq-accordion-widget.tsx    # Service source
src/app/admin/appearance/pages/[id]/page.tsx      # Preview selector
src/app/admin/appearance/landing-page/components/widget-builder-panel.tsx  # Settings panels
```

---

## Data Flow

### Live Page Rendering

```
User visits /services/llc-formation
         ↓
Server: getService("llc-formation") → ServiceData from DB
Server: getActiveTemplateForType("SERVICE_DETAILS") → Template sections
         ↓
<ServiceProvider service={llcFormationData}>
  <PageBuilderRenderer sections={visibleSections} />
</ServiceProvider>
         ↓
Each widget reads from ServiceContext:
  service-hero      → service.name, service.shortDesc, service.icon
  service-features  → service.features[]
  pricing-table     → fetches /api/services/llc-formation (auto mode)
  service-description → service.description (HTML)
  faq               → service.faqs[] (service source)
  related-services  → fetches /api/services/related?slug=llc-formation
```

### Admin Template Editing

```
Admin opens Page Builder for SERVICE_DETAILS template
         ↓
Selects "LLC Formation" from "Preview as Service" dropdown
         ↓
Fetches full service data → wraps canvas with <ServiceProvider>
         ↓
All service widgets show real LLC Formation data
Admin adjusts layout, styling, widget settings
         ↓
Saves template → applies to ALL service detail pages
```

### Per-Service Visibility Control

```
Admin edits "EIN Number" service in Admin > Services > Edit
  → displayOptions: { showPricing: false, showFaq: true, ... }
         ↓
User visits /services/ein-number
  → Template loaded, but pricing section filtered out
  → FAQ section still visible
```

---

## Migration Strategy

### No Database Migration Needed

The new architecture reuses existing tables:
- `LandingPage` with `templateType = SERVICE_DETAILS`
- `LandingPageBlock` for storing widget sections
- `Service.displayOptions` JSON field for per-service visibility

### Rollback Plan

- Original hardcoded layout remains as fallback (Mode B in service page)
- If no SERVICE_DETAILS template exists or has no sections, fallback renders automatically
- Template can be deactivated at any time via `isTemplateActive = false`

---

## Summary

This redesign transforms LLCPad's service pages into a dynamic template system by extending the existing Page Builder:

- **Zero new DB models** -- reuses `LandingPage` + `LandingPageBlock`
- **5 new service widgets** -- pull data from ServiceContext automatically
- **2 enhanced widgets** -- pricing-table and FAQ gain dynamic modes
- **Admin preview** -- "Preview as Service" dropdown for real data in builder
- **Backward compatible** -- all existing pages and widgets work unchanged
- **Per-service control** -- `displayOptions` controls section visibility per service

---

## References

- [Unbounce - SaaS Landing Pages](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/)
- [KlientBoost - High-Converting SaaS Landing Pages](https://www.klientboost.com/landing-pages/saas-landing-page/)
- [Magic UI - SaaS Landing Page Best Practices 2025](https://magicui.design/blog/saas-landing-page-best-practices)
- [Kinsta - Gutenberg vs Elementor](https://kinsta.com/blog/gutenberg-vs-elementor/)
- [Attention Insight - Psychology of Trust in UX](https://attentioninsight.com/the-psychology-of-trust-in-ux-what-encourages-customer-loyalty/)
- [LogRocket - Trust-Driven UX Examples](https://blog.logrocket.com/ux-design/trust-driven-ux-examples/)
- [Bizee LLC Formation](https://bizee.com)
- [CNBC - Bizee Review 2025](https://www.cnbc.com/select/bizee-review/)
