# Pricing Table Widget & CMS Plan for CodeCanyon

> **Goal:** Build a modern, CodeCanyon-ready CMS with Elementor-style widget system focusing on Pricing/Comparison Tables with State-wise Fee Integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [2025 CMS Market Analysis](#2025-cms-market-analysis)
3. [Existing LLCPad Architecture Analysis](#existing-llcpad-architecture-analysis)
4. [Widget System Architecture](#widget-system-architecture)
5. [Pricing Table Widget Design](#pricing-table-widget-design)
6. [State Fees Integration](#state-fees-integration)
7. [Implementation Phases](#implementation-phases)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Admin UI Components](#admin-ui-components)
11. [CodeCanyon Submission Checklist](#codecanyon-submission-checklist)

---

## Executive Summary

### What We're Building

A **visual page builder CMS** with:
- Drag-and-drop widget system (Elementor-inspired)
- Advanced Pricing/Comparison Table widget
- State/Location-based dynamic pricing
- Reusable templates and presets
- CodeCanyon marketplace ready

### Key Differentiators

| Feature | Our CMS | Elementor | Webflow | Others |
|---------|---------|-----------|---------|--------|
| Pricing Table with State Fees | ✅ Built-in | ❌ Manual | ❌ Manual | ❌ |
| Dynamic Feature Mapping | ✅ 4 Value Types | ⚠️ Limited | ❌ | ❌ |
| Location-based Pricing | ✅ Native | ❌ | ❌ | ❌ |
| React/Next.js Native | ✅ | ❌ PHP | ✅ | Varies |
| Open Source Core | ✅ | ❌ | ❌ | Varies |

---

## 2025 CMS Market Analysis

### Top Platforms Comparison

| Platform | Type | Strengths | Weaknesses |
|----------|------|-----------|------------|
| **Elementor** | WordPress Builder | 18.1% market share, extensive widgets, huge ecosystem | PHP-based, WordPress dependent |
| **Webflow** | Visual CMS | Designer-friendly, clean output | Expensive, learning curve |
| **Wix** | Website Builder | Easy to use, AI features | Limited customization |
| **Builder.io** | Visual Headless | Framework-agnostic, enterprise | Complex setup |
| **Strapi** | Headless CMS | Developer-friendly, flexible | No visual builder |
| **Payload CMS** | Headless CMS | TypeScript, React admin | No drag-drop page builder |
| **Puck** | React Editor | Open-source, MIT license | Newer, smaller community |

### Key Insights from Elementor

**Widget Architecture:**
```
Section/Container → Columns → Widgets
```

**Widget Class Structure:**
- `get_name()` - Unique identifier
- `get_title()` - Display name
- `get_icon()` - Widget icon
- `get_categories()` - Grouping
- `register_controls()` - Settings/fields
- `render()` - Frontend output
- `content_template()` - Editor preview

**Controls System:**
- Content Tab (data)
- Style Tab (appearance)
- Advanced Tab (layout, animation)

### Elementor Pricing Table Features

1. **Header Section**: Title, description, HTML tag
2. **Price Section**: Currency, amount, sale price, period
3. **Features Section**: Draggable list, icons, tooltips
4. **Footer Section**: CTA button
5. **Ribbon**: Promotional badges
6. **Style Controls**: Full customization

---

## Existing LLCPad Architecture Analysis

### Database Models (Current)

```
Service (1) ──────┬──────── ServiceFeature (N) ← Master feature list
                  │                │
                  │                │
                  └──── Package (N)──────────── PackageFeatureMap (N)
                        │                       ↑ Junction table
                        │                       │
                        └───────────────────────┘
```

**FeatureValueType Enum:**
- `BOOLEAN` - ✓/✗ checkmark
- `TEXT` - Custom value text
- `ADDON` - "+ $XX" button
- `DASH` - Not applicable (—)

### State Fees System (Current)

```prisma
model StateFee {
  id              String   @id
  stateCode       String   @unique  // "CA", "WY"
  stateName       String
  llcFee          Decimal            // Formation fee
  annualFee       Decimal?           // Yearly renewal
  processingTime  String?
  isPopular       Boolean
  // SEO fields...
}
```

### Widget System (Current - Footer Only)

```prisma
model FooterWidget {
  type: FooterWidgetType  // BRAND, LINKS, CONTACT, etc.
  title: String
  content: Json           // Type-specific data
  column: Int
  sortOrder: Int
}
```

---

## Widget System Architecture

### Proposed Universal Widget System

#### Core Widget Interface

```typescript
interface Widget {
  id: string;
  type: WidgetType;
  name: string;

  // Display
  title?: string;
  icon: string;
  category: WidgetCategory;

  // Content
  content: Record<string, any>;

  // Layout
  column?: number;
  row?: number;
  width?: number;  // Grid units (1-24)
  height?: number;

  // Style
  style: WidgetStyle;
  customClass?: string;
  customCSS?: string;

  // Responsive
  responsive: {
    desktop: ResponsiveSettings;
    tablet: ResponsiveSettings;
    mobile: ResponsiveSettings;
  };

  // Meta
  sortOrder: number;
  isVisible: boolean;
  conditions?: DisplayCondition[];
}
```

#### Widget Categories

```typescript
enum WidgetCategory {
  // Layout
  LAYOUT = 'layout',           // Container, Section, Column, Spacer

  // Basic
  BASIC = 'basic',             // Text, Heading, Image, Button, Divider

  // Content
  CONTENT = 'content',         // Icon List, Accordion, Tabs, Toggle

  // Marketing
  MARKETING = 'marketing',     // Pricing Table, Comparison, Testimonial, CTA

  // Forms
  FORMS = 'forms',             // Contact Form, Newsletter, Search

  // Dynamic
  DYNAMIC = 'dynamic',         // Services List, Posts, States, Products

  // Interactive
  INTERACTIVE = 'interactive', // Carousel, Gallery, Video, Map

  // Commerce
  COMMERCE = 'commerce',       // Product Card, Cart, Checkout
}
```

#### Widget Types

```typescript
enum WidgetType {
  // Layout Widgets
  SECTION = 'section',
  CONTAINER = 'container',
  COLUMN = 'column',
  SPACER = 'spacer',
  DIVIDER = 'divider',

  // Basic Widgets
  HEADING = 'heading',
  TEXT = 'text',
  IMAGE = 'image',
  BUTTON = 'button',
  ICON = 'icon',

  // Marketing Widgets
  PRICING_TABLE = 'pricing_table',           // ⭐ Key Widget
  COMPARISON_TABLE = 'comparison_table',     // ⭐ Key Widget
  PRICING_TOGGLE = 'pricing_toggle',         // Monthly/Yearly switch
  TESTIMONIAL = 'testimonial',
  TESTIMONIAL_CAROUSEL = 'testimonial_carousel',
  CTA_BANNER = 'cta_banner',
  FEATURE_LIST = 'feature_list',

  // Dynamic Content
  SERVICES_GRID = 'services_grid',
  SERVICE_CARD = 'service_card',
  STATES_SELECTOR = 'states_selector',       // ⭐ Key Widget
  BLOG_POSTS = 'blog_posts',

  // Forms
  CONTACT_FORM = 'contact_form',
  NEWSLETTER = 'newsletter',

  // Interactive
  ACCORDION = 'accordion',
  TABS = 'tabs',
  CAROUSEL = 'carousel',
  GALLERY = 'gallery',
  VIDEO = 'video',
  MAP = 'map',
  COUNTDOWN = 'countdown',

  // Commerce
  PRODUCT_CARD = 'product_card',
  ADD_TO_CART = 'add_to_cart',
}
```

---

## Pricing Table Widget Design

### Widget Configuration

```typescript
interface PricingTableWidget extends Widget {
  type: 'pricing_table';
  content: {
    // Data Source
    dataSource: 'manual' | 'service' | 'api';
    serviceId?: string;  // If dataSource = 'service'

    // Layout
    layout: 'horizontal' | 'vertical' | 'cards';
    columnsDesktop: number;  // 2-5
    columnsTablet: number;
    columnsMobile: number;

    // State Fee Integration
    showStateFees: boolean;
    stateSelector: {
      enabled: boolean;
      position: 'top' | 'header' | 'inline';
      defaultState?: string;
      showPopularOnly: boolean;
    };

    // Packages
    packages: PricingPackage[];

    // Features (for comparison mode)
    features: PricingFeature[];
    featureMapping: FeatureMapping[];

    // Billing Toggle
    billingToggle: {
      enabled: boolean;
      options: ['monthly', 'yearly'] | ['monthly', 'quarterly', 'yearly'];
      discount: number;  // Yearly discount %
    };

    // CTA
    ctaButton: {
      text: string;
      style: 'filled' | 'outlined' | 'gradient';
      action: 'link' | 'modal' | 'checkout';
      link?: string;
    };
  };

  style: {
    // Card Style
    cardBackground: string;
    cardBorder: BorderStyle;
    cardShadow: ShadowStyle;
    cardRadius: string;
    cardPadding: string;
    cardGap: string;

    // Popular/Featured
    popularBadge: {
      show: boolean;
      text: string;
      position: 'top-left' | 'top-right' | 'corner' | 'ribbon';
      background: string;
      color: string;
    };
    popularHighlight: {
      scale: number;  // 1.05 = 5% larger
      borderColor: string;
      shadowIntensity: number;
    };

    // Header
    headerBackground: string;
    headerPadding: string;

    // Typography
    titleFont: TypographyStyle;
    priceFont: TypographyStyle;
    featureFont: TypographyStyle;

    // Icons
    checkIcon: IconStyle;
    crossIcon: IconStyle;
    addonIcon: IconStyle;

    // Animations
    hoverEffect: 'none' | 'lift' | 'glow' | 'scale';
    loadAnimation: 'none' | 'fade' | 'slide' | 'stagger';
  };
}
```

### Package Structure

```typescript
interface PricingPackage {
  id: string;
  name: string;
  description?: string;

  // Pricing
  price: number;
  originalPrice?: number;  // For sale/strikethrough
  currency: string;
  period: 'one-time' | 'monthly' | 'yearly' | 'custom';
  periodLabel?: string;  // "per month", "বার্ষিক"

  // State Fee
  includesStateFee: boolean;
  stateFeeLabel?: string;  // "+ $52 state fee"

  // Badge
  badge?: {
    text: string;
    color: string;
    background: string;
  };
  isPopular: boolean;

  // Processing
  processingTime?: string;
  processingIcon?: 'clock' | 'zap' | 'check';

  // CTA
  ctaText: string;
  ctaLink?: string;
  ctaStyle: 'primary' | 'secondary' | 'outline';

  // Features (simple list)
  features?: string[];

  // Addons
  availableAddons?: Addon[];
}
```

### Feature Mapping (Comparison Table)

```typescript
interface PricingFeature {
  id: string;
  text: string;
  description?: string;
  tooltip?: string;
  icon?: string;
  sortOrder: number;
}

interface FeatureMapping {
  packageId: string;
  featureId: string;
  valueType: 'BOOLEAN' | 'TEXT' | 'ADDON' | 'DASH';
  included?: boolean;      // For BOOLEAN
  customValue?: string;    // For TEXT
  addonPrice?: number;     // For ADDON
}
```

---

## State Fees Integration

### State Selector Widget

```typescript
interface StateSelectorWidget extends Widget {
  type: 'states_selector';
  content: {
    // Display Mode
    displayMode: 'dropdown' | 'grid' | 'map' | 'search';

    // Data
    showPopularFirst: boolean;
    popularLabel: string;  // "Popular States"
    allLabel: string;      // "All States"

    // Filtering
    showOnlyActive: boolean;
    excludeStates?: string[];  // ["PR", "VI"]

    // Price Display
    showFee: boolean;
    feeLabel: string;  // "Filing Fee: $X"

    // Selection
    defaultState?: string;
    allowMultiple: boolean;

    // Callbacks
    onSelect: 'updatePage' | 'emitEvent' | 'navigate';
    targetWidgetIds?: string[];  // Pricing tables to update
  };
}
```

### Dynamic State Fee Calculation

```typescript
// In Pricing Table Widget
interface StateFeePricing {
  // Fee Inclusion
  feeHandling: 'add' | 'include' | 'separate';

  // Display
  showAsSeparateLine: boolean;
  separateLineLabel: string;  // "State Filing Fee"

  // Calculation
  calculateTotal: boolean;

  // Responsive to State Selector
  linkedStateSelector?: string;  // Widget ID
}
```

### Admin UI: State Fees Management

```typescript
interface StateFeeAdmin {
  // List View
  columns: ['state', 'code', 'llcFee', 'annualFee', 'processingTime', 'popular'];

  // Bulk Actions
  bulkActions: ['setPopular', 'updateFees', 'export'];

  // Import
  importFormats: ['csv', 'json'];

  // Categories (optional grouping)
  categories: ['popular', 'low-fee', 'fast-processing', 'no-annual'];
}
```

---

## Implementation Phases

### Phase 1: Core Widget System (Week 1-2)

**Database:**
- [ ] Create `Widget` model
- [ ] Create `WidgetPreset` model
- [ ] Create `Page` model with widgets relation
- [ ] Create `PageTemplate` model

**API:**
- [ ] CRUD for widgets
- [ ] Widget reordering
- [ ] Widget duplication
- [ ] Preset management

**Admin UI:**
- [ ] Widget sidebar (categories + widgets list)
- [ ] Drag-drop canvas
- [ ] Widget settings panel
- [ ] Live preview

### Phase 2: Pricing Table Widget (Week 3-4)

**Features:**
- [ ] Manual package creation
- [ ] Service data binding
- [ ] Feature comparison mode
- [ ] 4 value types (Boolean, Text, Addon, Dash)
- [ ] Popular package highlight
- [ ] Badge/ribbon support

**Styling:**
- [ ] Card layouts (horizontal, vertical, cards)
- [ ] Typography controls
- [ ] Color customization
- [ ] Hover effects
- [ ] Responsive breakpoints

### Phase 3: State Fees Integration (Week 5)

**Features:**
- [ ] State selector widget
- [ ] Dynamic fee calculation
- [ ] State landing pages
- [ ] Fee comparison view
- [ ] API for fee lookup

**Admin:**
- [ ] Bulk fee update
- [ ] Import/export fees
- [ ] Fee history tracking

### Phase 4: Additional Widgets (Week 6-7)

**Marketing Widgets:**
- [ ] Testimonial widget
- [ ] Testimonial carousel
- [ ] CTA banner
- [ ] Feature list

**Dynamic Widgets:**
- [ ] Services grid
- [ ] Blog posts
- [ ] FAQ accordion

### Phase 5: Templates & Presets (Week 8)

**Features:**
- [ ] Page templates library
- [ ] Widget presets
- [ ] Global styles
- [ ] Import/export
- [ ] Version history

### Phase 6: Polish & CodeCanyon Prep (Week 9-10)

**Documentation:**
- [ ] User documentation
- [ ] Developer API docs
- [ ] Video tutorials
- [ ] Demo site

**Quality:**
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Security review
- [ ] Browser testing

---

## Database Schema

### New Tables

```prisma
// ============================================
// WIDGET SYSTEM
// ============================================

model Widget {
  id            String       @id @default(cuid())
  type          String       // WidgetType enum value
  name          String       // Display name

  // Content (JSON blob)
  content       Json         @default("{}")

  // Layout
  column        Int?
  row           Int?
  width         Int          @default(24)  // Grid units
  height        Int?

  // Style (JSON blob)
  style         Json         @default("{}")
  customClass   String?
  customCSS     String?      @db.Text

  // Responsive (JSON blob)
  responsive    Json         @default("{}")

  // Meta
  sortOrder     Int          @default(0)
  isVisible     Boolean      @default(true)
  conditions    Json?        // Display conditions

  // Relations
  pageId        String?
  page          Page?        @relation(fields: [pageId], references: [id], onDelete: Cascade)

  sectionId     String?
  section       Widget?      @relation("SectionWidgets", fields: [sectionId], references: [id])
  children      Widget[]     @relation("SectionWidgets")

  // Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([pageId])
  @@index([type])
}

model WidgetPreset {
  id            String       @id @default(cuid())
  type          String       // Widget type
  name          String
  description   String?
  thumbnail     String?

  // Configuration
  content       Json
  style         Json

  // Meta
  category      String       // "minimal", "modern", "bold"
  tags          String[]
  isBuiltIn     Boolean      @default(false)
  usageCount    Int          @default(0)

  // Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([type])
  @@index([category])
}

model Page {
  id            String       @id @default(cuid())
  title         String
  slug          String       @unique
  description   String?

  // Content
  widgets       Widget[]

  // SEO
  metaTitle     String?
  metaDesc      String?      @db.Text
  ogImage       String?

  // Settings
  layout        String       @default("full-width")
  headerStyle   String?
  footerStyle   String?

  // Status
  status        PageStatus   @default(DRAFT)
  publishedAt   DateTime?

  // Template
  templateId    String?
  template      PageTemplate? @relation(fields: [templateId], references: [id])

  // Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([slug])
  @@index([status])
}

model PageTemplate {
  id            String       @id @default(cuid())
  name          String
  description   String?
  thumbnail     String?

  // Content (JSON structure)
  structure     Json

  // Meta
  category      String       // "landing", "pricing", "about", "contact"
  tags          String[]
  isBuiltIn     Boolean      @default(false)
  usageCount    Int          @default(0)

  // Relations
  pages         Page[]

  // Timestamps
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([category])
}

enum PageStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED
}

// ============================================
// ENHANCED STATE FEES
// ============================================

model StateFeeCategory {
  id            String       @id @default(cuid())
  name          String       // "Low Fee States", "Fast Processing"
  slug          String       @unique
  description   String?
  icon          String?
  sortOrder     Int          @default(0)

  // Relations
  stateFees     StateFee[]   @relation("StateFeeCategories")

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

// Add to existing StateFee model:
// categories    StateFeeCategory[] @relation("StateFeeCategories")
// additionalFees Json?  // {"expedited": 50, "certified": 25}
```

---

## API Endpoints

### Widget APIs

```
# CRUD
GET    /api/widgets                    # List all widgets
POST   /api/widgets                    # Create widget
GET    /api/widgets/:id                # Get widget
PUT    /api/widgets/:id                # Update widget
DELETE /api/widgets/:id                # Delete widget

# Batch Operations
POST   /api/widgets/batch              # Create multiple
PUT    /api/widgets/reorder            # Reorder widgets
POST   /api/widgets/duplicate/:id      # Duplicate widget

# Presets
GET    /api/widget-presets             # List presets
GET    /api/widget-presets/:type       # Presets by type
POST   /api/widget-presets             # Create preset
POST   /api/widget-presets/:id/apply   # Apply preset to widget
```

### Page APIs

```
# CRUD
GET    /api/pages                      # List pages
POST   /api/pages                      # Create page
GET    /api/pages/:slug                # Get page by slug
PUT    /api/pages/:id                  # Update page
DELETE /api/pages/:id                  # Delete page

# Publishing
POST   /api/pages/:id/publish          # Publish page
POST   /api/pages/:id/unpublish        # Unpublish page
POST   /api/pages/:id/duplicate        # Duplicate page

# Templates
GET    /api/page-templates             # List templates
POST   /api/pages/:id/save-as-template # Save page as template
POST   /api/pages/from-template/:id    # Create from template
```

### State Fee APIs

```
# CRUD
GET    /api/state-fees                 # List all fees
GET    /api/state-fees/:code           # Get fee by state code
PUT    /api/state-fees/:id             # Update fee
POST   /api/state-fees/bulk-update     # Bulk update fees

# Categories
GET    /api/state-fee-categories       # List categories
POST   /api/state-fee-categories       # Create category

# Public
GET    /api/public/state-fees          # Public fee lookup
GET    /api/public/state-fees/popular  # Popular states only
```

---

## UI Design & Wireframes

### 1. Page Builder - Main Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ☰ CMS Admin          Page Builder: Homepage                    👁 Preview  💾  │
├────────────┬───────────────────────────────────────────────────┬────────────────┤
│            │                                                   │                │
│  WIDGETS   │              CANVAS / EDITOR                      │   SETTINGS     │
│            │                                                   │                │
│ ┌────────┐ │  ┌─────────────────────────────────────────────┐  │ ┌────────────┐ │
│ │🔍Search │ │  │                                             │  │ │  Content   │ │
│ └────────┘ │  │    [Section: Hero]                          │  │ │   Style    │ │
│            │  │    ┌─────────────────────────────────────┐  │  │ │  Advanced  │ │
│ ▼ Layout   │  │    │                                     │  │  │ └────────────┘ │
│   □ Section│  │    │   Welcome to Our Service            │  │  │                │
│   □ Column │  │    │   ════════════════════              │  │  │ PRICING TABLE  │
│   □ Spacer │  │    │   [Get Started Button]              │  │  │ ────────────── │
│            │  │    │                                     │  │  │                │
│ ▼ Basic    │  │    └─────────────────────────────────────┘  │  │ Data Source:   │
│   □ Heading│  │                                             │  │ ┌────────────┐ │
│   □ Text   │  │    [Section: Pricing] ← Selected            │  │ │ ○ Manual   │ │
│   □ Image  │  │    ┌─────────────────────────────────────┐  │  │ │ ● Service  │ │
│   □ Button │  │    │  ╔═══════════════════════════════╗  │  │  │ │ ○ API      │ │
│            │  │    │  ║   PRICING TABLE WIDGET        ║  │  │  │ └────────────┘ │
│ ▼ Marketing│  │    │  ║  ┌───────┬───────┬───────┐   ║  │  │  │                │
│ ⭐ Pricing │  │    │  ║  │ Basic │ Pro   │Premium│   ║  │  │  │ Service:       │
│   □ CTA    │  │    │  ║  │  $0   │ $299  │ $620  │   ║  │  │  │ ┌────────────┐ │
│   □ Review │  │    │  ║  │       │Popular│       │   ║  │  │  │ │LLC Form... ▼│ │
│            │  │    │  ║  ├───────┼───────┼───────┤   ║  │  │  │ └────────────┘ │
│ ▼ Dynamic  │  │    │  ║  │  ✓    │  ✓    │  ✓    │   ║  │  │  │                │
│ ⭐ States  │  │    │  ║  │ +$99  │  ✓    │  ✓    │   ║  │  │  │ State Fees:    │
│   □ Services│ │    │  ║  │  —    │ +$49  │  ✓    │   ║  │  │  │ ┌────────────┐ │
│   □ Posts  │  │    │  ║  └───────┴───────┴───────┘   ║  │  │  │ │ ☑ Enabled  │ │
│            │  │    │  ╚═══════════════════════════════╝  │  │  │ └────────────┘ │
│            │  │    └─────────────────────────────────────┘  │  │                │
│ ┌────────┐ │  │                                             │  │ [Edit Pkgs]    │
│ │+ Widget│ │  │    ┌ + Add Section ─────────────────────┐   │  │ [Edit Features]│
│ └────────┘ │  │    └────────────────────────────────────┘   │  │                │
│            │  │                                             │  │ ────────────── │
├────────────┴──┴─────────────────────────────────────────────┴──┴────────────────┤
│  Responsive: 🖥 Desktop │ 💻 Tablet │ 📱 Mobile     Zoom: 100% │ Undo │ Redo     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2. Widget Sidebar - Expanded View

```
┌──────────────────────────┐
│     WIDGETS              │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ 🔍 Search widgets... │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ All │Layout│Marketing││
│ └──────────────────────┘ │
│                          │
│ ▼ LAYOUT                 │
│ ┌──────────────────────┐ │
│ │ ⬜ ┃  Section         │ │
│ │    Full-width row    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ▤ ┃  Container       │ │
│ │    Boxed content     │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ▥ ┃  Columns         │ │
│ │    2-6 col layout    │ │
│ └──────────────────────┘ │
│                          │
│ ▼ MARKETING ⭐           │
│ ┌──────────────────────┐ │
│ │ 💰┃  Pricing Table   │ │
│ │    Compare packages  │ │
│ │    ★ Most Popular    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 📊┃  Comparison      │ │
│ │    Feature matrix    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🗺️┃  State Selector  │ │
│ │    Location pricing  │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 📢┃  CTA Banner      │ │
│ │    Call to action    │ │
│ └──────────────────────┘ │
│                          │
│ ▶ BASIC                  │
│ ▶ DYNAMIC                │
│ ▶ FORMS                  │
│ ▶ INTERACTIVE            │
│                          │
│ ┌──────────────────────┐ │
│ │  📁 Saved Widgets    │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │  📋 Templates        │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### 3. Widget Settings Panel - Pricing Table

```
┌─────────────────────────────────┐
│  PRICING TABLE SETTINGS         │
├─────────────────────────────────┤
│ ┌─────────┬────────┬──────────┐ │
│ │ Content │ Style  │ Advanced │ │
│ └─────────┴────────┴──────────┘ │
│ ════════════════════════════════│
│                                 │
│ DATA SOURCE                     │
│ ┌─────────────────────────────┐ │
│ │ ○ Manual    ● Service  ○ API│ │
│ └─────────────────────────────┘ │
│                                 │
│ Select Service:                 │
│ ┌─────────────────────────────┐ │
│ │ LLC Formation            ▼ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ─────────────────────────────── │
│ LAYOUT                          │
│                                 │
│ Display Mode:                   │
│ ┌─────────────────────────────┐ │
│ │ ☑ Horizontal Cards          │ │
│ │ ☐ Vertical Stack            │ │
│ │ ☐ Comparison Table          │ │
│ └─────────────────────────────┘ │
│                                 │
│ Columns:                        │
│ Desktop: [3 ▼]  Tablet: [2 ▼]  │
│ Mobile:  [1 ▼]                  │
│                                 │
│ ─────────────────────────────── │
│ STATE FEES                      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ☑ Enable State Fee Display  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Selector Position:              │
│ ┌─────────────────────────────┐ │
│ │ ● Above Table               │ │
│ │ ○ In Header                 │ │
│ │ ○ In Order Summary          │ │
│ └─────────────────────────────┘ │
│                                 │
│ Default State:                  │
│ ┌─────────────────────────────┐ │
│ │ Wyoming (WY) - $100      ▼ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ─────────────────────────────── │
│ PACKAGES                        │
│                                 │
│ ┌───┬─────────────┬───────────┐ │
│ │ ⋮ │ Basic       │ $0    ✎ 🗑│ │
│ ├───┼─────────────┼───────────┤ │
│ │ ⋮ │ Standard ⭐ │ $299  ✎ 🗑│ │
│ ├───┼─────────────┼───────────┤ │
│ │ ⋮ │ Premium     │ $620  ✎ 🗑│ │
│ └───┴─────────────┴───────────┘ │
│                                 │
│ [+ Add Package]                 │
│                                 │
│ ─────────────────────────────── │
│ BILLING TOGGLE                  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ☐ Enable Monthly/Yearly     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ─────────────────────────────── │
│ CTA BUTTON                      │
│                                 │
│ Text:                           │
│ ┌─────────────────────────────┐ │
│ │ Get Started                 │ │
│ └─────────────────────────────┘ │
│                                 │
│ Action:                         │
│ ┌─────────────────────────────┐ │
│ │ ● Link  ○ Modal  ○ Checkout │ │
│ └─────────────────────────────┘ │
│                                 │
│ ═════════════════════════════════│
│ [    Apply Changes    ]         │
└─────────────────────────────────┘
```

### 4. Package Edit Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Package: Standard                              ✕      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ BASIC INFO          │  │ PREVIEW             │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  Package Name:              ┌─────────────────────────┐    │
│  ┌─────────────────────┐    │     ┌───────────────┐   │    │
│  │ Standard            │    │     │   STANDARD    │   │    │
│  └─────────────────────┘    │     │   ──────────  │   │    │
│                              │     │    $299       │   │    │
│  Description:                │     │   one-time    │   │    │
│  ┌─────────────────────┐    │     │  + $100 state │   │    │
│  │ Most popular choice │    │     │               │   │    │
│  └─────────────────────┘    │     │  ⭐ Popular   │   │    │
│                              │     │               │   │    │
│  ─────────────────────       │     │ [Get Started] │   │    │
│  PRICING                     │     └───────────────┘   │    │
│                              └─────────────────────────┘    │
│  Price (USD):                                               │
│  ┌──────────┐  ┌──────────┐                                │
│  │ $  299   │  │ ৳ 35,000 │ BDT                            │
│  └──────────┘  └──────────┘                                │
│                                                             │
│  Original Price (for strikethrough):                        │
│  ┌──────────┐                                              │
│  │ $  399   │  Shows: ~~$399~~ $299                        │
│  └──────────┘                                              │
│                                                             │
│  Period:                                                    │
│  ┌───────────────────────────────────────┐                 │
│  │ ● One-time  ○ Monthly  ○ Yearly  ○ Custom              │
│  └───────────────────────────────────────┘                 │
│                                                             │
│  ─────────────────────                                      │
│  BADGE & HIGHLIGHT                                          │
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │ ☑ Mark as Popular                   │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  Badge Text:            Badge Color:                        │
│  ┌───────────────┐      ┌───────────────┐                  │
│  │ Popular       │      │ 🟠 Orange  ▼  │                  │
│  └───────────────┘      └───────────────┘                  │
│                                                             │
│  ─────────────────────                                      │
│  PROCESSING TIME                                            │
│                                                             │
│  Time:                  Icon:                               │
│  ┌───────────────┐      ┌───────────────┐                  │
│  │ 3 business day│      │ ⚡ Zap     ▼  │                  │
│  └───────────────┘      └───────────────┘                  │
│                                                             │
│  Note: (instead of 3 weeks)                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Expedited processing included                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          [Cancel]  [💾 Save Package]        │
└─────────────────────────────────────────────────────────────┘
```

### 5. Feature Mapping Grid (Comparison Table Editor)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FEATURE COMPARISON MAPPING                                    [Save All]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐                                                    │
│  │ 🔍 Search features..│  [+ Add Feature]                                   │
│  └─────────────────────┘                                                    │
│                                                                             │
│  ┌──────────────────────────────┬──────────┬──────────┬──────────┐         │
│  │ FEATURES                     │  BASIC   │ STANDARD │ PREMIUM  │         │
│  │                              │   $0     │  $299 ⭐ │  $620    │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ State Filing Fee      ⓘ   │   ✓      │    ✓     │    ✓     │         │
│  │                              │ [click]  │ [click]  │ [click]  │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ Registered Agent (1yr) ⓘ  │  +$99    │    ✓     │    ✓     │         │
│  │                              │ [ADDON]  │[BOOLEAN] │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ EIN Application        ⓘ  │  +$70    │    ✓     │    ✓     │         │
│  │                              │ [ADDON]  │[BOOLEAN] │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ BOI Filing             ⓘ  │  +$49    │    ✓     │    ✓     │         │
│  │                              │ [ADDON]  │[BOOLEAN] │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ Business Address       ⓘ  │  +$120   │  +$120   │    ✓     │         │
│  │                              │ [ADDON]  │ [ADDON]  │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ US Phone Number        ⓘ  │  +$60    │  +$60    │    ✓     │         │
│  │                              │ [ADDON]  │ [ADDON]  │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ Bank Account Setup     ⓘ  │    —     │  +$99    │    ✓     │         │
│  │                              │ [DASH]   │ [ADDON]  │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ Stripe Account         ⓘ  │    —     │  +$79    │    ✓     │         │
│  │                              │ [DASH]   │ [ADDON]  │[BOOLEAN] │         │
│  ├──────────────────────────────┼──────────┼──────────┼──────────┤         │
│  │                              │          │          │          │         │
│  │ ⋮ Documents Included     ⓘ  │  "5"     │  "15"    │ "All"    │         │
│  │                              │ [TEXT]   │ [TEXT]   │ [TEXT]   │         │
│  └──────────────────────────────┴──────────┴──────────┴──────────┘         │
│                                                                             │
│  LEGEND:  ✓ = Included   ✗ = Not Included   +$XX = Addon   — = N/A         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CELL EDIT POPOVER                   │
│ (appears on click)                  │
├─────────────────────────────────────┤
│                                     │
│ Value Type:                         │
│ ┌─────────────────────────────────┐ │
│ │ ○ Boolean (✓/✗)                │ │
│ │ ● Addon (+$XX)                 │ │
│ │ ○ Text (custom value)          │ │
│ │ ○ Dash (—)                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────── (for Addon) ─────── │
│                                     │
│ Addon Price:                        │
│ ┌──────────┐  ┌──────────┐         │
│ │ $   99   │  │ ৳ 11,500 │         │
│ └──────────┘  └──────────┘         │
│   USD            BDT                │
│                                     │
│ ───────────── (for Boolean) ─────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │      [OFF ◯────● ON]            │ │
│ │       Included                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────── (for Text) ──────── │
│                                     │
│ Custom Value:                       │
│ ┌─────────────────────────────────┐ │
│ │ 15 documents                    │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│              [Apply]                │
└─────────────────────────────────────┘
```

### 6. State Fees Admin Page

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ☰ CMS Admin  ›  Settings  ›  State Fees                               👤 Admin │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  STATE FILING FEES                                              [+ Add State]   │
│  ════════════════                                                               │
│                                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                    │
│  │ 📊 Total       │  │ ⭐ Popular     │  │ 💰 Avg Fee     │                    │
│  │    51          │  │    8           │  │    $125        │                    │
│  │    states      │  │    states      │  │    USD         │                    │
│  └────────────────┘  └────────────────┘  └────────────────┘                    │
│                                                                                 │
│  ┌─────────────────────────────────┐   ┌──────────────────┐  ┌────────────┐    │
│  │ 🔍 Search states...             │   │ Filter: All   ▼  │  │ Export CSV │    │
│  └─────────────────────────────────┘   └──────────────────┘  └────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ ☐ │ STATE            │ CODE │ LLC FEE  │ ANNUAL  │ PROCESSING │ ⭐│ ⋮  │   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │ ⭐ Wyoming       │  WY  │  $100    │   $60   │ 2-3 days   │ ⭐│ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │ ⭐ Delaware      │  DE  │   $90    │  $300   │ 3-5 days   │ ⭐│ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │ ⭐ New Mexico    │  NM  │   $50    │    —    │ 1-2 days   │ ⭐│ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │ ⭐ Nevada        │  NV  │  $425    │  $350   │ 3-5 days   │ ⭐│ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │    Alabama       │  AL  │  $200    │    —    │ 5-7 days   │   │ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │    Alaska        │  AK  │  $250    │  $100   │ 7-10 days  │   │ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │    Arizona       │  AZ  │   $50    │    —    │ 2-3 days   │   │ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │    Arkansas      │  AR  │   $45    │  $150   │ 5-7 days   │   │ ✎🗑│   │
│  ├───┼──────────────────┼──────┼──────────┼─────────┼────────────┼───┼────┤   │
│  │ ☐ │    California    │  CA  │   $70    │  $800   │ 3-5 days   │   │ ✎🗑│   │
│  └───┴──────────────────┴──────┴──────────┴─────────┴────────────┴───┴────┘   │
│                                                                                 │
│  ◀ Previous    Page 1 of 6    Next ▶        Showing 10 of 51                   │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  BULK ACTIONS:  [☑ Selected: 0]   [Set Popular]  [Update Fees]  [Delete]       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7. State Fee Edit Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Edit State Fee: Wyoming                             ✕      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BASIC INFORMATION                                          │
│  ─────────────────                                          │
│                                                             │
│  State Code:              State Name:                       │
│  ┌───────────────┐        ┌─────────────────────────────┐  │
│  │ WY            │ 🔒     │ Wyoming                     │  │
│  └───────────────┘        └─────────────────────────────┘  │
│                                                             │
│  FEES                                                       │
│  ─────────────────                                          │
│                                                             │
│  LLC Filing Fee: *        Annual Fee:                       │
│  ┌───────────────┐        ┌───────────────┐                │
│  │ $    100      │        │ $     60      │                │
│  └───────────────┘        └───────────────┘                │
│                                                             │
│  Processing Time:                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2-3 business days                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ADDITIONAL FEES (Optional)                                 │
│  ─────────────────                                          │
│                                                             │
│  Expedited:               Certified Copy:                   │
│  ┌───────────────┐        ┌───────────────┐                │
│  │ $     50      │        │ $     25      │                │
│  └───────────────┘        └───────────────┘                │
│                                                             │
│  DISPLAY SETTINGS                                           │
│  ─────────────────                                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Mark as Popular State                             │   │
│  │   (Shows in quick selection dropdown)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SEO (for state landing page)                               │
│  ─────────────────                                          │
│                                                             │
│  Meta Title:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Form an LLC in Wyoming - $100 Filing Fee | LLCPad   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Meta Description:                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Start your Wyoming LLC for just $100. No state      │   │
│  │ income tax, strong privacy laws. Fast processing... │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                           [Cancel]  [💾 Save Changes]       │
└─────────────────────────────────────────────────────────────┘
```

### 8. Frontend: Pricing Table Widget Output

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                        Choose Your LLC Package                                  │
│                 ─────────────────────────────────                               │
│                                                                                 │
│     Select State:  ┌──────────────────────────────────────┐                    │
│                    │  🔍 Wyoming (WY) - $100          ▼   │                    │
│                    └──────────────────────────────────────┘                    │
│                                                                                 │
│  ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐    │
│  │                      │ │    ⭐ POPULAR        │ │                      │    │
│  │        BASIC         │ │      STANDARD        │ │       PREMIUM        │    │
│  │     ───────────      │ │     ───────────      │ │     ───────────      │    │
│  │                      │ │                      │ │                      │    │
│  │         $0           │ │        $299          │ │        $620          │    │
│  │      one-time        │ │      one-time        │ │      one-time        │    │
│  │    + $100 state fee  │ │    + $100 state fee  │ │    + $100 state fee  │    │
│  │                      │ │                      │ │                      │    │
│  │    ───────────       │ │    ───────────       │ │    ───────────       │    │
│  │                      │ │                      │ │                      │    │
│  │  ✓ State Filing Fee  │ │  ✓ State Filing Fee  │ │  ✓ State Filing Fee  │    │
│  │                      │ │                      │ │                      │    │
│  │  ┌────────────────┐  │ │  ✓ Registered Agent  │ │  ✓ Registered Agent  │    │
│  │  │   + $99        │  │ │    (1 Year Free)     │ │    (1 Year Free)     │    │
│  │  │ Registered Agt │  │ │                      │ │                      │    │
│  │  └────────────────┘  │ │  ✓ EIN Application   │ │  ✓ EIN Application   │    │
│  │                      │ │                      │ │                      │    │
│  │  ┌────────────────┐  │ │  ✓ BOI Filing        │ │  ✓ BOI Filing        │    │
│  │  │   + $70        │  │ │                      │ │                      │    │
│  │  │ EIN Application│  │ │  ┌────────────────┐  │ │  ✓ Business Address  │    │
│  │  └────────────────┘  │ │  │   + $120       │  │ │                      │    │
│  │                      │ │  │ Business Addr  │  │ │  ✓ US Phone Number   │    │
│  │  ┌────────────────┐  │ │  └────────────────┘  │ │                      │    │
│  │  │   + $49        │  │ │                      │ │  ✓ Bank Account      │    │
│  │  │ BOI Filing     │  │ │  ┌────────────────┐  │ │                      │    │
│  │  └────────────────┘  │ │  │   + $99        │  │ │  ✓ Stripe Account    │    │
│  │                      │ │  │ Bank Account   │  │ │                      │    │
│  │  — Business Address  │ │  └────────────────┘  │ │    ───────────       │    │
│  │                      │ │                      │ │                      │    │
│  │  — US Phone          │ │  ⚡ 3 business days  │ │  ⚡ 3 business days   │    │
│  │                      │ │                      │ │                      │    │
│  │  🕐 3 weeks          │ │    ───────────       │ │    ───────────       │    │
│  │                      │ │                      │ │                      │    │
│  │    ───────────       │ │  ┌────────────────┐  │ │  ┌────────────────┐  │    │
│  │                      │ │  │                │  │ │  │                │  │    │
│  │  ┌────────────────┐  │ │  │  Get Started   │  │ │  │  Get Started   │  │    │
│  │  │                │  │ │  │                │  │ │  │                │  │    │
│  │  │  Get Started   │  │ │  └────────────────┘  │ │  └────────────────┘  │    │
│  │  │                │  │ │       ▲              │ │                      │    │
│  │  └────────────────┘  │ │   Primary CTA        │ │                      │    │
│  │                      │ │                      │ │                      │    │
│  └──────────────────────┘ └──────────────────────┘ └──────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ORDER SUMMARY                                              ───────────  │   │
│  │                                                                          │   │
│  │  Standard Package                                             $299.00   │   │
│  │  + Business Address                                           $120.00   │   │
│  │  + Wyoming State Fee                                          $100.00   │   │
│  │                                                              ─────────   │   │
│  │  TOTAL                                                        $519.00   │   │
│  │                                                                          │   │
│  │  [                    Proceed to Checkout                            ]   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 9. Mobile View: Pricing Table

```
┌─────────────────────────┐
│                         │
│   Choose Your Package   │
│   ───────────────────   │
│                         │
│  Select State:          │
│  ┌───────────────────┐  │
│  │ Wyoming - $100 ▼  │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │      BASIC        │  │
│  │   ───────────     │  │
│  │       $0          │  │
│  │   + $100 state    │  │
│  │                   │  │
│  │ ✓ State Filing    │  │
│  │ + $99 Reg Agent   │  │
│  │ + $70 EIN         │  │
│  │ + $49 BOI         │  │
│  │ — Business Addr   │  │
│  │                   │  │
│  │ 🕐 3 weeks        │  │
│  │                   │  │
│  │ [ Get Started ]   │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │   ⭐ POPULAR      │  │
│  │     STANDARD      │  │
│  │   ───────────     │  │
│  │      $299         │  │
│  │   + $100 state    │  │
│  │                   │  │
│  │ ✓ State Filing    │  │
│  │ ✓ Registered Agt  │  │
│  │ ✓ EIN Application │  │
│  │ ✓ BOI Filing      │  │
│  │ + $120 Address    │  │
│  │ + $99 Bank Acct   │  │
│  │                   │  │
│  │ ⚡ 3 business days │  │
│  │                   │  │
│  │ [█ Get Started █] │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │     PREMIUM       │  │
│  │   ───────────     │  │
│  │      $620         │  │
│  │   + $100 state    │  │
│  │                   │  │
│  │ ✓ Everything in   │  │
│  │   Standard, plus: │  │
│  │ ✓ Business Addr   │  │
│  │ ✓ US Phone        │  │
│  │ ✓ Bank Account    │  │
│  │ ✓ Stripe Account  │  │
│  │                   │  │
│  │ ⚡ 3 business days │  │
│  │                   │  │
│  │ [ Get Started ]   │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  ───────────────────    │
│  Sticky Order Summary   │
│  ┌───────────────────┐  │
│  │ Standard   $299   │  │
│  │ + Addons   $120   │  │
│  │ + State    $100   │  │
│  │ ─────────────────  │  │
│  │ Total:     $519   │  │
│  │                   │  │
│  │ [ Checkout ]      │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### 10. Style Tab - Visual Customization

```
┌─────────────────────────────────┐
│  PRICING TABLE SETTINGS         │
├─────────────────────────────────┤
│ ┌─────────┬────────┬──────────┐ │
│ │ Content │ Style  │ Advanced │ │
│ └─────────┴────────┴──────────┘ │
│ ═════════════════════════════════│
│                                 │
│ PRESETS                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐│
│ │ Min │ │ Mod │ │Bold │ │Dark ││
│ │ imal│ │ ern │ │     │ │     ││
│ └─────┘ └─────┘ └─────┘ └─────┘│
│                                 │
│ ─────────────────────────────── │
│ CARD STYLE                      │
│                                 │
│ Background:                     │
│ ┌─────────────────────────────┐ │
│ │ ⬜ #FFFFFF              🎨  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Border:                         │
│ ┌──────┐ ┌──────┐ ┌──────────┐ │
│ │ 1px  │ │solid │ │ #E5E7EB  │ │
│ └──────┘ └──────┘ └──────────┘ │
│                                 │
│ Border Radius:                  │
│ ┌─────────────────────────────┐ │
│ │ ●───────────○              │ │
│ │     12px                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ Shadow:                         │
│ ┌─────────────────────────────┐ │
│ │ ○ None  ● Subtle  ○ Medium │ │
│ │ ○ Strong  ○ Custom          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ─────────────────────────────── │
│ POPULAR CARD HIGHLIGHT          │
│                                 │
│ Scale:                          │
│ ┌─────────────────────────────┐ │
│ │ ○───────●─────────○        │ │
│ │     1.05x (5% larger)       │ │
│ └─────────────────────────────┘ │
│                                 │
│ Border Color:                   │
│ ┌─────────────────────────────┐ │
│ │ 🟠 #F97316              🎨  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Badge Style:                    │
│ Position: ┌───────────────────┐ │
│           │ Top Right      ▼  │ │
│           └───────────────────┘ │
│                                 │
│ ─────────────────────────────── │
│ TYPOGRAPHY                      │
│                                 │
│ Package Title:                  │
│ Font: ┌────────────────┐        │
│       │ Inter       ▼  │        │
│       └────────────────┘        │
│ Size: [20px]  Weight: [600]     │
│ Color: [#111827]                │
│                                 │
│ Price:                          │
│ Font: [Inter]  Size: [36px]     │
│ Weight: [700]  Color: [#111827] │
│                                 │
│ Features:                       │
│ Font: [Inter]  Size: [14px]     │
│ Color: [#4B5563]                │
│                                 │
│ ─────────────────────────────── │
│ ICONS                           │
│                                 │
│ Check Icon:                     │
│ ┌──────────────┐ ┌────────────┐ │
│ │ ✓ Checkmark▼ │ │ 🟢 #10B981 │ │
│ └──────────────┘ └────────────┘ │
│                                 │
│ Cross Icon:                     │
│ ┌──────────────┐ ┌────────────┐ │
│ │ ✗ X Mark  ▼  │ │ 🔴 #EF4444 │ │
│ └──────────────┘ └────────────┘ │
│                                 │
│ Addon Button:                   │
│ ┌──────────────┐ ┌────────────┐ │
│ │ + Plus    ▼  │ │ 🟠 #F97316 │ │
│ └──────────────┘ └────────────┘ │
│                                 │
│ ─────────────────────────────── │
│ ANIMATIONS                      │
│                                 │
│ Hover Effect:                   │
│ ┌─────────────────────────────┐ │
│ │ ○ None  ● Lift  ○ Glow     │ │
│ │ ○ Scale  ○ Border Glow      │ │
│ └─────────────────────────────┘ │
│                                 │
│ Load Animation:                 │
│ ┌─────────────────────────────┐ │
│ │ ○ None  ○ Fade  ● Slide Up │ │
│ │ ○ Stagger                   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ═════════════════════════════════│
│ [  Reset to Default  ]          │
└─────────────────────────────────┘
```

---

## Admin UI Components

### Widget Sidebar

```tsx
// components/admin/page-builder/WidgetSidebar.tsx
interface WidgetSidebarProps {
  onDragStart: (widgetType: WidgetType) => void;
  searchQuery: string;
  selectedCategory: WidgetCategory | 'all';
}

// Features:
// - Categorized widget list
// - Search/filter
// - Drag handle for each widget
// - Preview thumbnail
// - Quick-add button
```

### Widget Settings Panel

```tsx
// components/admin/page-builder/WidgetSettings.tsx
interface WidgetSettingsProps {
  widget: Widget;
  onUpdate: (updates: Partial<Widget>) => void;
}

// Tabs:
// - Content: Widget-specific fields
// - Style: Visual customization
// - Advanced: Classes, CSS, conditions
```

### Pricing Table Editor

```tsx
// components/admin/page-builder/widgets/PricingTableEditor.tsx
interface PricingTableEditorProps {
  widget: PricingTableWidget;
  onUpdate: (updates: Partial<PricingTableWidget>) => void;
}

// Sections:
// - Data Source (Manual / Service binding)
// - Packages (Add/Edit/Remove/Reorder)
// - Features (Master list for comparison)
// - Feature Mapping (Interactive grid)
// - State Fee Settings
// - Billing Toggle
// - CTA Configuration
// - Style Presets
```

### State Fee Manager

```tsx
// components/admin/state-fees/StateFeeManager.tsx
interface StateFeeManagerProps {
  fees: StateFee[];
  onUpdate: (fee: StateFee) => void;
  onBulkUpdate: (fees: StateFee[]) => void;
}

// Features:
// - Sortable table
// - Inline editing
// - Bulk actions
// - Import/Export
// - Category assignment
// - Search/Filter
```

---

## CodeCanyon Submission Checklist

### Documentation

- [ ] User Guide (PDF)
- [ ] Installation Guide
- [ ] API Documentation
- [ ] Video Tutorials (3-5 min each)
- [ ] FAQ/Troubleshooting
- [ ] Changelog

### Demo

- [ ] Live demo site
- [ ] Demo credentials
- [ ] Sample data
- [ ] Multiple page examples

### Code Quality

- [ ] ESLint/Prettier configured
- [ ] TypeScript strict mode
- [ ] No console.logs
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

### Security

- [ ] Input validation
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Auth/Authorization

### Performance

- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Caching strategy
- [ ] Database indexes

### Compatibility

- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive
- [ ] RTL support (optional)
- [ ] i18n ready

### Assets

- [ ] Preview image (590x300)
- [ ] Screenshots (minimum 3)
- [ ] Icon
- [ ] Logo variations

### Pricing Tiers (Suggestion)

| License | Price | Includes |
|---------|-------|----------|
| Regular | $49 | Single site, 6mo support |
| Extended | $199 | Unlimited sites, 12mo support, source |

---

## Technical Stack

```
Frontend:
├── Next.js 15 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS 4
├── Radix UI (primitives)
├── @dnd-kit (drag-drop)
├── Zustand (state)
└── React Query (data fetching)

Backend:
├── Next.js API Routes
├── Prisma ORM
├── PostgreSQL
└── NextAuth.js

Development:
├── ESLint
├── Prettier
├── Husky (git hooks)
└── Jest/Vitest (testing)
```

---

## Competitive Advantages

1. **Native State Fee Integration** - No other page builder has built-in location-based pricing
2. **4 Value Types** - Boolean, Text, Addon, Dash for flexible comparison tables
3. **Service Binding** - Connect pricing tables directly to service data
4. **React/Next.js Native** - Modern stack, not WordPress dependent
5. **Self-Hosted** - Full control, no subscription fees
6. **Open Source Core** - Extensible and customizable

---

## Next Steps

1. **Immediate**: Set up widget database schema
2. **Week 1**: Build core widget CRUD and canvas
3. **Week 2**: Implement drag-drop and settings panel
4. **Week 3**: Build Pricing Table widget
5. **Week 4**: State fees integration
6. **Week 5**: Additional widgets
7. **Week 6**: Templates and presets
8. **Week 7-8**: Polish and documentation
9. **Week 9**: CodeCanyon submission prep
10. **Week 10**: Launch!

---

*Document Version: 1.0*
*Created: January 2026*
*Author: Claude AI Assistant*
