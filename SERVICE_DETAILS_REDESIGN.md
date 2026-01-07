# Service Details Page Redesign Plan

## LLCPad - Fully Customizable CMS-Style Service Page Builder

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [2025 Design Trends & Best Practices](#2025-design-trends--best-practices)
4. [Competitor Analysis](#competitor-analysis)
5. [Block-Based CMS Architecture](#block-based-cms-architecture)
6. [Proposed Section Blocks](#proposed-section-blocks)
7. [Admin Panel Design](#admin-panel-design)
8. [Database Schema Changes](#database-schema-changes)
9. [Implementation Phases](#implementation-phases)
10. [Technical Specifications](#technical-specifications)

---

## Executive Summary

Transform the current static service details page into a **fully customizable, block-based page builder** inspired by WordPress/Elementor. Each service page can have unique layouts with drag-and-drop section management, inline editing, and real-time preview.

### Goals

- **Flexibility**: Admin can add/remove/reorder sections per service
- **Consistency**: Pre-built blocks ensure brand consistency
- **Performance**: Server-side rendering with minimal client JS
- **Conversion**: Optimized for 2025 best practices (social proof, trust signals, clear CTAs)
- **SEO**: Proper semantic HTML, JSON-LD schemas, meta control

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

### Current Admin Panel Tabs

- Basic Info (name, slug, descriptions, pricing)
- Features (master feature list for comparison)
- Packages (pricing tiers with feature mapping)
- FAQs (service-specific Q&A)
- SEO (meta title, description)

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

Based on [Attention Insight](https://attentioninsight.com/the-psychology-of-trust-in-ux-what-encourages-customer-loyalty/) and [LogRocket](https://blog.logrocket.com/ux-design/trust-driven-ux-examples/):

```
┌─────────────────────────────────────────────────────────────┐
│  F-PATTERN SCAN PATH                                        │
│  ════════════════════════════════════════════               │
│                                                             │
│  ████████████████████████████                              │
│  ████████████████████████████  ← Users scan here first     │
│  ██████████████████                                        │
│  ████████████                                              │
│  ██████████████████████████                                │
│  ████████████████                                          │
│  ████████                                                  │
│                                                             │
│  TRUST SIGNALS should be placed:                           │
│  ├── Hero section (above fold)                             │
│  ├── Near pricing (reduce purchase anxiety)                │
│  ├── Above CTA buttons                                     │
│  └── Footer (reinforcement)                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Color Psychology (Midnight Orange Theme)

- **Orange** (#F97316) - Action, energy, urgency (CTAs)
- **Green** (#22C55E) - Success, trust, checkmarks
- **Midnight** (#0A0F1E) - Authority, premium feel
- **White** (#FFFFFF) - Clean, professional content areas

---

## Competitor Analysis

### Bizee (LLC Formation Leader)

**Page Structure:**
1. Hero with trust badge (Trustpilot 4.7/5)
2. Six-step process accordion
3. Benefits grid (4 key advantages)
4. Compliance information
5. Large CTA with social proof
6. Rich footer

**Key Features:**
- "Bootstrapped, Founder Led Since 2004" - authenticity
- "Over 1,000,000 Entrepreneurs Served" - scale proof
- Accordion steps reduce overwhelm
- Free basic tier + upsells
- One-time fee messaging

**Pricing Tiers:**
- Basic: $0 (just state fees)
- Standard: $199 + state fees
- Premium: $299 + state fees

### ZenBusiness

- Clean, minimal design
- State selector prominent
- Package comparison table
- Money-back guarantee badge
- Live chat integration

### LegalZoom

- Premium pricing positioning
- "Attorney-drafted" messaging
- FAQ-heavy pages
- Corporate trust design

### Common Patterns Across Competitors

```
┌─────────────────────────────────────────────────────────────┐
│  1. TRUST BAR (Trustpilot, BBB, security badges)           │
├─────────────────────────────────────────────────────────────┤
│  2. HERO (Title, subtitle, main CTA, trust text)           │
├─────────────────────────────────────────────────────────────┤
│  3. STATE/ENTITY SELECTOR                                  │
├─────────────────────────────────────────────────────────────┤
│  4. PRICING TABLE (comparison, sticky sidebar)             │
├─────────────────────────────────────────────────────────────┤
│  5. PROCESS STEPS (what happens after purchase)            │
├─────────────────────────────────────────────────────────────┤
│  6. BENEFITS GRID                                          │
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

## Block-Based CMS Architecture

### Inspiration from WordPress/Elementor

Based on research from [Kinsta](https://kinsta.com/blog/gutenberg-vs-elementor/) and [WordPress Block Editor](https://wordpress.org/plugins/essential-blocks/):

**Gutenberg Approach:**
- Blocks are native, reusable components
- Each block has settings panel
- Drag-and-drop reordering
- JSON-based storage
- Server-side rendering for performance

**Elementor Approach:**
- Widget-based with extensive options
- Live preview editing
- Template library
- Global styles
- Responsive controls per breakpoint

### LLCPad Block Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       PAGE STRUCTURE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ServicePage                                                │
│  └── Blocks[] (ordered array)                              │
│       ├── Block 1: Hero                                    │
│       │   └── settings: { variant, title, showTrust... }  │
│       ├── Block 2: PricingTable                           │
│       │   └── settings: { layout, showStateFees... }      │
│       ├── Block 3: ProcessSteps                           │
│       │   └── settings: { steps[], icons, layout... }     │
│       └── Block N: ...                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Proposed Section Blocks

### Block Categories

```
┌─────────────────────────────────────────────────────────────┐
│  BLOCK CATEGORIES                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 CORE BLOCKS (Essential)                                │
│  ├── hero              - Service hero section              │
│  ├── pricing-table     - Package comparison               │
│  ├── features-grid     - What's included                  │
│  ├── faq-accordion     - FAQs                             │
│  └── description       - Rich text content                │
│                                                             │
│  🏆 TRUST BLOCKS                                           │
│  ├── trust-bar         - Badges, ratings, security        │
│  ├── testimonials      - Customer reviews carousel        │
│  ├── stats-counter     - "1M+ served" counters            │
│  ├── partner-logos     - "Featured in" logos             │
│  └── guarantee-badge   - Money-back guarantee             │
│                                                             │
│  📋 PROCESS BLOCKS                                         │
│  ├── process-steps     - Numbered steps                   │
│  ├── timeline          - Vertical timeline                │
│  ├── checklist         - What you'll get list             │
│  └── requirements      - What you need to provide         │
│                                                             │
│  🎯 CONVERSION BLOCKS                                      │
│  ├── cta-section       - Call-to-action banner            │
│  ├── comparison        - vs competitors                   │
│  ├── urgency-banner    - Limited offer, countdown         │
│  └── sticky-cta        - Fixed bottom CTA bar             │
│                                                             │
│  📊 DATA BLOCKS                                            │
│  ├── state-fees        - State fee table                  │
│  ├── entity-types      - LLC vs Corp comparison           │
│  └── documents-list    - What documents included          │
│                                                             │
│  🎨 CONTENT BLOCKS                                         │
│  ├── rich-text         - WYSIWYG content                  │
│  ├── video             - YouTube/Vimeo embed              │
│  ├── image-text        - Image + text side by side        │
│  ├── icon-grid         - Benefits with icons              │
│  └── tabs              - Tabbed content                   │
│                                                             │
│  🔗 NAVIGATION BLOCKS                                      │
│  ├── breadcrumb        - Navigation breadcrumb            │
│  ├── related-services  - Service cards                    │
│  └── jump-links        - In-page navigation               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Block Specifications

#### 1. Hero Block

```typescript
interface HeroBlock {
  type: "hero";
  settings: {
    // Layout
    variant: "centered" | "split" | "minimal" | "with-form";
    backgroundType: "solid" | "gradient" | "image";
    backgroundColor: string;
    backgroundImage?: string;

    // Content
    showIcon: boolean;
    showBadge: boolean;
    badgeText?: string;
    highlightWord?: string; // Word to highlight in title

    // CTA
    primaryCTA: {
      text: string;
      showPrice: boolean;
      variant: "solid" | "outline";
    };
    secondaryCTA?: {
      text: string;
      link: string;
    };

    // Trust
    showTrustBar: boolean;
    trustText?: string; // "1,000,000+ Served"
  };
}
```

**Variants:**

```
┌─────────────────────────────────────────────────────────────┐
│  HERO VARIANT: CENTERED (Default)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        [Icon]                               │
│                                                             │
│              Start Your LLC Today                           │
│              ═══════════════════                            │
│    Professional formation service for entrepreneurs        │
│                                                             │
│    [Get Started - From $0]  [Ask a Question]               │
│                                                             │
│         🏆 1,000,000+ Businesses Formed                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HERO VARIANT: WITH-FORM (Bizee Style)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Form Your LLC           ┌────────────────────────────┐   │
│   ════════════════        │  START YOUR BUSINESS       │   │
│   Join 1M+ entrepreneurs  │  ────────────────────────  │   │
│   who trust us.           │  Select your state:        │   │
│                           │  [Wyoming          ▼]      │   │
│   ✓ Free formation        │                            │   │
│   ✓ Expert support        │  [START MY LLC →]          │   │
│   ✓ Fast processing       │                            │   │
│                           └────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Pricing Table Block

```typescript
interface PricingTableBlock {
  type: "pricing-table";
  settings: {
    // Layout
    layout: "comparison" | "cards" | "horizontal";
    showStateFees: boolean;
    showOrderSummary: boolean; // Sticky sidebar

    // Display
    showProcessingTime: boolean;
    showAddons: boolean;
    highlightPopular: boolean;

    // State selector
    stateSelector: {
      position: "above" | "inline" | "hidden";
      defaultState?: string;
    };

    // CTA
    ctaText: string;
    ctaStyle: "per-package" | "single-bottom";
  };
}
```

#### 3. Process Steps Block

```typescript
interface ProcessStepsBlock {
  type: "process-steps";
  settings: {
    layout: "horizontal" | "vertical" | "accordion" | "timeline";
    showNumbers: boolean;
    showIcons: boolean;

    steps: Array<{
      icon: string;
      title: string;
      description: string;
      duration?: string; // "Day 1", "3-5 days"
    }>;
  };
}
```

**Layouts:**

```
┌─────────────────────────────────────────────────────────────┐
│  PROCESS STEPS: HORIZONTAL                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ①──────────②──────────③──────────④                     │
│   Submit     Review    File with    Receive               │
│   Info       Order     State        Documents             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PROCESS STEPS: ACCORDION (Bizee Style)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [▼] Step 1: Choose Your Business Name                    │
│       Select a unique name for your LLC...                 │
│   ─────────────────────────────────────────                │
│   [▶] Step 2: Provide Your Address                         │
│   ─────────────────────────────────────────                │
│   [▶] Step 3: Assign Registered Agent                      │
│   ─────────────────────────────────────────                │
│   [▶] Step 4: Submit Member Information                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4. Testimonials Block

```typescript
interface TestimonialsBlock {
  type: "testimonials";
  settings: {
    layout: "carousel" | "grid" | "featured" | "wall";
    showRating: boolean;
    showAvatar: boolean;
    showCompany: boolean;

    // Data source
    source: "manual" | "trustpilot" | "google";

    testimonials?: Array<{
      quote: string;
      author: string;
      company?: string;
      avatar?: string;
      rating: number;
    }>;
  };
}
```

#### 5. Trust Bar Block

```typescript
interface TrustBarBlock {
  type: "trust-bar";
  settings: {
    position: "top" | "floating" | "inline";

    items: Array<{
      type: "rating" | "badge" | "stat" | "logo";
      // For rating
      platform?: "trustpilot" | "google" | "bbb";
      rating?: number;
      reviews?: number;
      // For badge
      icon?: string;
      text?: string;
      // For stat
      value?: string;
      label?: string;
    }>;
  };
}
```

#### 6. CTA Section Block

```typescript
interface CTASectionBlock {
  type: "cta-section";
  settings: {
    variant: "banner" | "card" | "full-width";
    background: "dark" | "gradient" | "light" | "brand";

    headline: string;
    subheadline?: string;

    cta: {
      text: string;
      link: string;
      variant: "solid" | "outline";
    };

    showGuarantee: boolean;
    guaranteeText?: string;
  };
}
```

---

## Admin Panel Design

### Page Builder Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Admin > Services > LLC Formation > Page Builder           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [← Back]  LLC Formation                    [Preview] [Save]│
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  ┌─────────────┐  ┌────────────────────────────────────┐   │
│  │ ADD BLOCK   │  │                                    │   │
│  │             │  │  HERO BLOCK                   [≡]  │   │
│  │ Core        │  │  ────────────────────────────────  │   │
│  │ ├ Hero      │  │  Variant: Centered                 │   │
│  │ ├ Pricing   │  │  Background: Dark                  │   │
│  │ ├ Features  │  │  Show Trust: Yes                   │   │
│  │ └ FAQ       │  │  [Edit Block Settings]             │   │
│  │             │  │                                    │   │
│  │ Trust       │  ├────────────────────────────────────┤   │
│  │ ├ Trust Bar │  │                                    │   │
│  │ ├ Testimony │  │  PRICING TABLE BLOCK          [≡]  │   │
│  │ └ Stats     │  │  ────────────────────────────────  │   │
│  │             │  │  Layout: Comparison                │   │
│  │ Process     │  │  Show State Fees: Yes              │   │
│  │ ├ Steps     │  │  Show Sidebar: Yes                 │   │
│  │ └ Timeline  │  │  [Edit Block Settings]             │   │
│  │             │  │                                    │   │
│  │ Content     │  ├────────────────────────────────────┤   │
│  │ ├ Rich Text │  │                                    │   │
│  │ ├ Video     │  │  PROCESS STEPS BLOCK          [≡]  │   │
│  │ └ Icon Grid │  │  ────────────────────────────────  │   │
│  │             │  │  Layout: Accordion                 │   │
│  │ [+ More]    │  │  Steps: 6                          │   │
│  │             │  │  [Edit Block Settings]             │   │
│  └─────────────┘  │                                    │   │
│                   │  [+ Add Block]                     │   │
│                   │                                    │   │
│                   └────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Block Settings Panel

```
┌─────────────────────────────────────────────────────────────┐
│  Edit: Hero Block                              [×]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYOUT                                                     │
│  ─────────────────────────────────────────────────────────  │
│  Variant:       [Centered     ▼]                           │
│                 ○ Centered                                 │
│                 ○ Split (Image Left)                       │
│                 ○ With Form                                │
│                 ○ Minimal                                  │
│                                                             │
│  BACKGROUND                                                 │
│  ─────────────────────────────────────────────────────────  │
│  Type:          [Solid        ▼]                           │
│  Color:         [#0A0F1E      ] 🎨                         │
│                                                             │
│  CONTENT                                                    │
│  ─────────────────────────────────────────────────────────  │
│  Show Icon:     [✓]                                        │
│  Show Badge:    [✓]                                        │
│  Badge Text:    [Most Popular Service    ]                 │
│  Highlight:     [Today       ] ← Word to highlight orange  │
│                                                             │
│  PRIMARY CTA                                                │
│  ─────────────────────────────────────────────────────────  │
│  Text:          [Get Started                ]              │
│  Show Price:    [✓] "From $X"                              │
│  Variant:       [Solid        ▼]                           │
│                                                             │
│  SECONDARY CTA                                              │
│  ─────────────────────────────────────────────────────────  │
│  Text:          [Ask a Question            ]               │
│  Link:          [/contact                  ]               │
│                                                             │
│  TRUST SECTION                                              │
│  ─────────────────────────────────────────────────────────  │
│  Show Trust:    [✓]                                        │
│  Trust Text:    [Join 1,000,000+ entrepreneurs]            │
│                                                             │
│                              [Cancel]  [Save Block]        │
└─────────────────────────────────────────────────────────────┘
```

### Visual Preview Mode

```
┌─────────────────────────────────────────────────────────────┐
│  Preview Mode                    [Desktop] [Tablet] [Mobile]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │                    [LLC Icon]                         │ │
│  │                                                       │ │
│  │         Start Your LLC ████████                       │ │
│  │                   Today                               │ │
│  │    Professional formation service for entrepreneurs  │ │
│  │                                                       │ │
│  │       [Get Started - From $0]  [Ask a Question]      │ │
│  │                                                       │ │
│  │            🏆 1,000,000+ Businesses Formed           │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│        [Click block to edit]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### New Models

```prisma
// Page block definition
model ServicePageBlock {
  id          String   @id @default(cuid())
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  // Block identity
  type        String   // "hero", "pricing-table", "process-steps", etc.
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  // Block settings (JSON)
  settings    Json     // Type-specific settings

  // Responsive visibility
  hideOnMobile  Boolean @default(false)
  hideOnDesktop Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([serviceId, sortOrder])
}

// Block templates (reusable presets)
model BlockTemplate {
  id          String   @id @default(cuid())
  name        String   // "Bizee-style Hero"
  type        String   // Block type this template is for
  settings    Json     // Pre-configured settings
  thumbnail   String?  // Preview image
  isBuiltIn   Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Testimonials (for testimonials block)
model Testimonial {
  id          String   @id @default(cuid())
  quote       String   @db.Text
  author      String
  company     String?
  avatar      String?
  rating      Int      @default(5)
  serviceId   String?  // Optional: specific to a service
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  service     Service? @relation(fields: [serviceId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Process steps (for process-steps block)
model ProcessStep {
  id          String   @id @default(cuid())
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  icon        String?
  title       String
  description String   @db.Text
  duration    String?  // "Day 1", "3-5 days"
  sortOrder   Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([serviceId, sortOrder])
}

// Trust badges/items
model TrustItem {
  id          String   @id @default(cuid())
  type        String   // "rating", "badge", "stat", "logo"

  // For rating type
  platform    String?  // "trustpilot", "google", "bbb"
  rating      Decimal? @db.Decimal(2, 1)
  reviewCount Int?

  // For badge/stat type
  icon        String?
  text        String?
  value       String?
  label       String?

  // For logo type
  imageUrl    String?
  altText     String?
  link        String?

  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Update Service Model

```prisma
model Service {
  // ... existing fields ...

  // New relations
  pageBlocks    ServicePageBlock[]
  testimonials  Testimonial[]
  processSteps  ProcessStep[]

  // Page layout settings
  useCustomLayout Boolean @default(false) // If false, use default layout
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

1. **Database Schema**
   - Add new models (ServicePageBlock, BlockTemplate, etc.)
   - Migrate existing data
   - Create seed data for block templates

2. **Block Type System**
   - Define TypeScript interfaces for all blocks
   - Create block registry
   - Build block validation

3. **Basic API Routes**
   - CRUD for page blocks
   - Block reordering endpoint
   - Template management

### Phase 2: Admin UI (Week 3-4)

1. **Page Builder Interface**
   - Block list with drag-and-drop (use dnd-kit)
   - Add block sidebar
   - Block settings panel

2. **Block Settings Forms**
   - Dynamic form generation based on block type
   - Color pickers, icon selectors
   - Rich text integration

3. **Preview System**
   - Real-time preview
   - Responsive preview modes

### Phase 3: Block Components (Week 5-6)

1. **Core Blocks**
   - Hero (all variants)
   - Pricing Table (with existing comparison logic)
   - Features Grid
   - FAQ Accordion
   - Rich Text

2. **Trust Blocks**
   - Trust Bar
   - Testimonials
   - Stats Counter

3. **Process Blocks**
   - Process Steps (all layouts)
   - Timeline
   - Checklist

### Phase 4: Advanced Features (Week 7-8)

1. **Conversion Blocks**
   - CTA Section
   - Comparison Table
   - Sticky CTA Bar

2. **Data Blocks**
   - State Fees Table
   - Entity Types Comparison
   - Documents List

3. **Polish**
   - Animations and transitions
   - Performance optimization
   - Mobile responsiveness

### Phase 5: Template System (Week 9)

1. **Block Templates**
   - Pre-built block configurations
   - Template library UI
   - Quick-start templates

2. **Page Templates**
   - Full page layouts
   - Industry-specific templates
   - Import/export

---

## Technical Specifications

### Block Registry Pattern

```typescript
// src/lib/blocks/registry.ts

export interface BlockDefinition<T = unknown> {
  type: string;
  name: string;
  icon: string;
  category: BlockCategory;
  defaultSettings: T;
  settingsSchema: ZodSchema<T>;
  component: React.ComponentType<{ settings: T; service: Service }>;
  settingsPanel: React.ComponentType<{ settings: T; onChange: (s: T) => void }>;
}

export const blockRegistry = new Map<string, BlockDefinition>();

// Register a block
export function registerBlock<T>(definition: BlockDefinition<T>) {
  blockRegistry.set(definition.type, definition);
}

// Get block component
export function getBlockComponent(type: string) {
  return blockRegistry.get(type)?.component;
}
```

### Block Component Pattern

```typescript
// src/components/blocks/hero-block.tsx

import { BlockDefinition } from "@/lib/blocks/registry";

interface HeroBlockSettings {
  variant: "centered" | "split" | "with-form" | "minimal";
  backgroundColor: string;
  showIcon: boolean;
  showBadge: boolean;
  badgeText: string;
  primaryCTA: { text: string; showPrice: boolean };
  secondaryCTA?: { text: string; link: string };
  showTrust: boolean;
  trustText: string;
}

export const heroBlockDefinition: BlockDefinition<HeroBlockSettings> = {
  type: "hero",
  name: "Hero Section",
  icon: "Layout",
  category: "core",
  defaultSettings: {
    variant: "centered",
    backgroundColor: "#0A0F1E",
    showIcon: true,
    showBadge: false,
    badgeText: "",
    primaryCTA: { text: "Get Started", showPrice: true },
    showTrust: true,
    trustText: "Join 1,000,000+ entrepreneurs",
  },
  settingsSchema: heroSettingsSchema,
  component: HeroBlock,
  settingsPanel: HeroBlockSettings,
};

function HeroBlock({ settings, service }: BlockProps<HeroBlockSettings>) {
  const { variant, backgroundColor, showIcon, ... } = settings;

  return (
    <section
      className={cn("py-20", variants[variant])}
      style={{ backgroundColor }}
    >
      {/* Render based on variant */}
    </section>
  );
}
```

### Page Renderer

```typescript
// src/components/service-page/page-renderer.tsx

interface PageRendererProps {
  service: ServiceWithBlocks;
}

export function ServicePageRenderer({ service }: PageRendererProps) {
  // If no custom layout, use default blocks
  const blocks = service.useCustomLayout
    ? service.pageBlocks
    : getDefaultBlocks(service);

  return (
    <div className="service-page">
      {blocks
        .filter(b => b.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(block => {
          const BlockComponent = getBlockComponent(block.type);
          if (!BlockComponent) return null;

          return (
            <BlockComponent
              key={block.id}
              settings={block.settings}
              service={service}
            />
          );
        })}
    </div>
  );
}
```

### Admin Block Editor

```typescript
// src/app/admin/services/[id]/page-builder/page.tsx

"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function PageBuilderPage() {
  const [blocks, setBlocks] = useState<ServicePageBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      // Reorder blocks
      reorderBlocks(active.id, over?.id);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Block Library Sidebar */}
      <BlockLibrary onAddBlock={addBlock} />

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {blocks.map(block => (
              <SortableBlock
                key={block.id}
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Settings Panel */}
      {selectedBlock && (
        <BlockSettingsPanel
          block={blocks.find(b => b.id === selectedBlock)!}
          onUpdate={updateBlock}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
}
```

---

## Default Block Configuration

For services without custom layouts, provide sensible defaults:

```typescript
// src/lib/blocks/defaults.ts

export function getDefaultBlocks(service: Service): ServicePageBlock[] {
  return [
    {
      type: "hero",
      sortOrder: 0,
      settings: {
        variant: "centered",
        backgroundColor: "#0A0F1E",
        showIcon: true,
        showTrust: true,
      },
    },
    {
      type: "features-grid",
      sortOrder: 1,
      settings: {
        layout: "grid",
        columns: 3,
      },
    },
    {
      type: "pricing-table",
      sortOrder: 2,
      settings: {
        layout: "comparison",
        showStateFees: service.slug === "llc-formation",
        showOrderSummary: true,
      },
    },
    {
      type: "description",
      sortOrder: 3,
      settings: {},
    },
    {
      type: "faq-accordion",
      sortOrder: 4,
      settings: {
        expandFirst: true,
      },
    },
    {
      type: "related-services",
      sortOrder: 5,
      settings: {
        limit: 4,
      },
    },
  ];
}
```

---

## File Structure

```
src/
├── lib/
│   └── blocks/
│       ├── registry.ts           # Block registration system
│       ├── defaults.ts           # Default block configurations
│       ├── types.ts              # TypeScript interfaces
│       └── schemas/              # Zod validation schemas
│           ├── hero.ts
│           ├── pricing-table.ts
│           └── ...
│
├── components/
│   └── blocks/
│       ├── hero-block/
│       │   ├── index.tsx         # Block component
│       │   ├── variants/         # Different layouts
│       │   │   ├── centered.tsx
│       │   │   ├── split.tsx
│       │   │   └── with-form.tsx
│       │   └── settings.tsx      # Settings panel
│       ├── pricing-table-block/
│       ├── features-grid-block/
│       ├── process-steps-block/
│       ├── testimonials-block/
│       ├── trust-bar-block/
│       ├── cta-section-block/
│       └── ...
│
├── app/
│   └── admin/
│       └── services/
│           └── [id]/
│               └── page-builder/
│                   ├── page.tsx          # Main builder UI
│                   ├── block-library.tsx # Available blocks
│                   ├── block-canvas.tsx  # Drag-drop area
│                   └── settings-panel.tsx # Block settings
```

---

## Migration Strategy

### Data Migration

1. Create new tables without affecting existing functionality
2. Run migration script to populate default blocks for existing services
3. Add feature flag for new page builder
4. Gradually enable per-service

### Rollback Plan

- Keep original page component as fallback
- Feature flag controls which version renders
- Database changes are additive (no destructive changes)

---

## Summary

This redesign transforms LLCPad's service pages into a fully customizable, block-based system inspired by modern page builders. Key benefits:

- **Admin Flexibility**: Drag-and-drop block management per service
- **Design Consistency**: Pre-built blocks with brand styling
- **Conversion Optimized**: 2025 best practices built into block designs
- **Maintainable**: Modular architecture, easy to add new blocks
- **Performance**: Server-rendered blocks, minimal client JS

The phased implementation approach allows incremental delivery while maintaining stability.

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
