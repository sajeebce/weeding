Hero Block Implementation Plan
User Decisions
Variants: Core 4 first (Centered, Split, Minimal, Split-Dashboard)
Preview: Real-time iframe preview
Slider: Embla Carousel
Overview
LANDING_PAGE_REDESIGN.md documentation onujayi Hero block implementation: Phase 1 - Core 4 Variants:
hero-centered (default)
hero-split
hero-minimal
hero-split-dashboard (shadcn Hero 23 style with animated words)
Phase 2 - Later (not in current scope):
hero-slider (image carousel)
hero-video
hero-with-form
Implementation Scope
Phase 1: Database & Core Architecture
Files to create:

prisma/schema.prisma (update)
├── LandingPage model
├── LandingPageBlock model
└── BlockTemplate model

src/lib/landing-blocks/
├── registry.ts              # Block registration system
├── types.ts                 # Shared TypeScript interfaces
├── defaults.ts              # Default hero configurations
└── validators/
    └── hero.ts              # Zod schema for hero settings
Database Models:

model LandingPage {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  metaTitle   String?
  metaDescription String?
  blocks      LandingPageBlock[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model LandingPageBlock {
  id            String   @id @default(cuid())
  landingPageId String
  type          String   // "hero"
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  settings      Json     // Hero settings JSON
  hideOnMobile  Boolean  @default(false)
  hideOnDesktop Boolean  @default(false)
  landingPage   LandingPage @relation(...)
}
Phase 2: Hero Block Components (Frontend)
Files to create:

src/components/landing-blocks/
├── hero/
│   ├── index.tsx              # Main hero component
│   ├── hero.types.ts          # TypeScript interfaces
│   └── variants/
│       ├── centered.tsx       # Default centered layout
│       ├── split.tsx          # Split layout (text + image)
│       ├── split-dashboard.tsx # Dashboard visual + animated words
│       ├── slider.tsx         # Image carousel slider
│       ├── video.tsx          # Video background
│       ├── with-form.tsx      # Inline form (state selector)
│       └── minimal.tsx        # Clean text-only
│
└── shared/
    ├── animated-words.tsx     # Rotating headline words
    ├── trust-badges.tsx       # Trust badge grid
    ├── stats-section.tsx      # Stats counter
    ├── hero-background.tsx    # Background handler
    └── dashboard-visual.tsx   # Dashboard preset visuals
Key Components:
HeroBlock - Main wrapper, selects variant
Each variant as separate component
Shared sub-components for reuse
Phase 3: Admin Panel - Hero Settings
Files to create:

src/app/admin/appearance/landing-page/
├── page.tsx                    # Main builder page
├── components/
│   ├── block-library.tsx       # Left sidebar (block selector)
│   ├── block-canvas.tsx        # Center area (block list)
│   ├── block-card.tsx          # Individual block card
│   ├── settings-panel.tsx      # Right sidebar (settings)
│   ├── toolbar.tsx             # Top bar (Save, Preview)
│   └── settings-forms/
│       └── hero-settings.tsx   # Hero-specific settings form
│           ├── LayoutTab       # Variant selector
│           ├── ContentTab      # Headlines, CTAs
│           ├── TrustTab        # Badges, stats
│           ├── SliderTab       # Slider settings (conditional)
│           └── StyleTab        # Background, colors
└── hooks/
    ├── use-blocks.ts           # Block state management
    └── use-landing-page.ts     # API interactions
Phase 4: API Routes
Files to create:

src/app/api/admin/landing-pages/
├── route.ts                    # GET (list), POST (create)
├── [id]/
│   ├── route.ts                # GET, PUT, DELETE
│   ├── blocks/
│   │   ├── route.ts            # GET (list), POST (add block)
│   │   ├── [blockId]/route.ts  # PUT, DELETE
│   │   └── reorder/route.ts    # POST (drag-drop reorder)
│   └── publish/route.ts        # POST (publish page)
Phase 5: Page Renderer
Files to create:

src/components/landing-page/
├── page-renderer.tsx           # Main renderer
├── block-wrapper.tsx           # Block container
└── json-ld-generator.ts        # SEO schema

src/app/(marketing)/page.tsx    # Update to use renderer
Implementation Order (Step-by-Step)
Step 1: Database Setup
Add LandingPage, LandingPageBlock models to schema.prisma
Run npx prisma migrate dev
Create seed data for default homepage
Step 2: Type System & Registry
Create src/lib/landing-blocks/types.ts with HeroSettings interface
Create src/lib/landing-blocks/validators/hero.ts Zod schema
Create src/lib/landing-blocks/registry.ts block registry
Create src/lib/landing-blocks/defaults.ts default settings
Step 3: Hero Frontend Components
Create hero.types.ts with full interface
Create variants/centered.tsx (convert from existing hero.tsx)
Create variants/split.tsx
Create variants/minimal.tsx
Create variants/with-form.tsx (with state selector)
Create variants/slider.tsx (with Embla carousel)
Create variants/video.tsx
Create variants/split-dashboard.tsx (animated words + dashboard)
Create shared components (animated-words, trust-badges, etc.)
Create main index.tsx that routes to variants
Step 4: API Routes
Create landing-pages CRUD routes
Create blocks sub-routes
Create reorder endpoint
Step 5: Admin UI
Create landing-page builder page
Create block-library sidebar
Create block-canvas with drag-drop (@dnd-kit)
Create settings-panel
Create hero-settings.tsx form
Wire up save/preview functionality
Step 6: Page Renderer
Create page-renderer.tsx
Update marketing page.tsx to use it
Add fallback to static content if no DB config
Key Dependencies
@dnd-kit/core, @dnd-kit/sortable - Drag & drop (already installed)
embla-carousel-react - Slider (for Phase 2, need to install later)
zod - Validation (already installed)
sonner - Toast notifications (already installed)
Real-time preview using iframe with postMessage API
Admin UI Layout (Based on Footer Builder Pattern)

┌──────────────────────────────────────────────────────────────┐
│  [← Back]  Landing Page Builder            [Preview] [Save]  │
├────────────┬─────────────────────────┬───────────────────────┤
│  ADD BLOCK │  BLOCK CANVAS           │  SETTINGS PANEL       │
│            │                         │                       │
│  Hero      │  ┌─────────────────┐   │  [Layout] [Content]   │
│  ├ Centered│  │ HERO BLOCK  [≡] │   │  [Trust] [Style]     │
│  ├ Split   │  │ Variant: Centered│   │                       │
│  ├ Slider  │  │ [Edit Settings]  │   │  Variant:            │
│  └ ...     │  └─────────────────┘   │  ○ Centered          │
│            │                         │  ○ Split             │
│            │  [+ Add Block]          │  ○ Slider            │
│            │                         │  ○ ...               │
└────────────┴─────────────────────────┴───────────────────────┘
Implementation Summary
What we're building:
Database models for landing page blocks
Block registry system with Zod validation
4 hero variants (Centered, Split, Minimal, Split-Dashboard)
Admin builder UI with drag-drop (@dnd-kit)
Settings panel with tabs (Layout, Content, Trust, Style)
Real-time preview iframe
API routes for CRUD operations
Page renderer for frontend
Expected Output:
Admin can create/edit landing pages with drag-drop blocks
Hero block with 4 variants, each fully customizable
Split-Dashboard variant with animated headline words
Real-time preview as settings change
Responsive design (mobile/desktop visibility controls)