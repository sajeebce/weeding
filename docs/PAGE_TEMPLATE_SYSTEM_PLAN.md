# Page Template System Plan

## Overview

This document outlines the plan to transform the current page builder from a "direct homepage editor" into a **WordPress-like Page Template System** where:

1. Users can create multiple page layouts/templates in the admin panel
2. Each template can be assigned to specific page types (Home, Service Details, etc.)
3. The assigned template determines how that page type renders on the frontend

---

## Current System Analysis

### How It Works Now

**Admin URL:** `/admin/appearance/landing-page`

**Current Behavior:**
- The page builder directly edits a single page with slug `"homepage"`
- Changes made in the builder immediately affect the live homepage
- There's no concept of creating multiple pages/templates
- Service details pages are hardcoded in `src/app/(marketing)/services/[slug]/page.tsx`

**Database Structure:**
```
LandingPage (slug: "homepage")
├── id, slug, name, isActive, isDefault
├── blocks: LandingPageBlock[]
│   └── type: "widget-page-sections"
│   └── settings: Section[] (JSON)
└── metaTitle, metaDescription, ogImage
```

**Homepage Rendering Logic** (`src/app/(marketing)/page.tsx`):
1. Fetches widget sections from `LandingPage` where `slug = "homepage"`
2. Falls back to old block system if no widgets
3. Falls back to static components if no blocks

---

## Proposed System: WordPress-Style Page Templates

### Core Concept

Inspired by [WordPress Template Hierarchy](https://developer.wordpress.org/themes/basics/template-hierarchy/), the new system will:

1. **Create Pages** - Admin can create multiple page layouts using the widget page builder
2. **Assign Templates** - Each page can be assigned as a template for a specific page type
3. **Dynamic Rendering** - Frontend routes check for assigned templates and render accordingly

### Page Types (Template Targets)

| Page Type | Route | Description |
|-----------|-------|-------------|
| `home` | `/` | Main homepage |
| `service_details` | `/services/[slug]` | Individual service pages |
| `services_list` | `/services` | Services listing page |
| `blog_post` | `/blog/[slug]` | Individual blog posts |
| `blog_list` | `/blog` | Blog listing page |
| `about` | `/about` | About page |
| `contact` | `/contact` | Contact page |
| `checkout` | `/checkout/*` | Checkout pages |
| `custom` | Custom slug | Custom standalone pages |

---

## Database Schema Changes

### Option A: Add PageType to LandingPage Model (Recommended)

```prisma
model LandingPage {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  isActive        Boolean  @default(true)

  // NEW: Template assignment
  pageType        PageType?  // Which page type this template serves
  isTemplateFor   String?    // "home", "service_details", etc.

  // SEO
  metaTitle       String?
  metaDescription String?
  ogImage         String?

  // Relations
  blocks          LandingPageBlock[]

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedAt     DateTime?
  version         Int      @default(1)

  @@index([slug])
  @@index([isActive, pageType])
  @@index([isTemplateFor])
}

enum PageType {
  HOME
  SERVICE_DETAILS
  SERVICES_LIST
  BLOG_POST
  BLOG_LIST
  ABOUT
  CONTACT
  CHECKOUT
  CUSTOM
}
```

### Option B: Separate PageTemplate Model

```prisma
model PageTemplate {
  id              String   @id @default(cuid())
  pageType        PageType @unique  // Only one template per type
  landingPageId   String   @unique
  landingPage     LandingPage @relation(fields: [landingPageId], references: [id])
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([pageType, isActive])
}
```

**Recommendation:** Option A is simpler and avoids an extra table.

---

## Admin UI Changes

### 1. New Admin Route Structure

```
/admin/appearance/pages/              → List all pages
/admin/appearance/pages/new           → Create new page
/admin/appearance/pages/[id]          → Edit page with widget builder
/admin/appearance/pages/[id]/settings → Page settings & template assignment
```

### 2. Pages List View (`/admin/appearance/pages/`)

**Features:**
- Table showing all created pages
- Columns: Name, Slug, Template Assignment, Status, Last Updated, Actions
- "Create New Page" button
- Filter by: All, Active, Draft, Template Type
- Search by name

**Template Assignment Column:**
- Shows badge if page is assigned as template
- Examples: "🏠 Home Template", "📦 Service Details Template", "—" (not assigned)

### 3. Create/Edit Page View (`/admin/appearance/pages/[id]`)

**Layout:** Same as current widget page builder but with:

**Header Bar:**
- Page name input (editable inline)
- Status toggle (Draft/Published)
- "Settings" button → Opens settings drawer/modal
- "Preview" button → Opens preview in new tab
- "Save" button

**Settings Panel (drawer or modal):**
```
┌────────────────────────────────────────┐
│ Page Settings                          │
├────────────────────────────────────────┤
│ Basic Info                             │
│ ├─ Name: [_______________]             │
│ ├─ Slug: [_______________]             │
│ └─ Status: [Published ▾]               │
├────────────────────────────────────────┤
│ Template Assignment                    │
│ ├─ Use as template for: [Select... ▾]  │
│ │   ○ None (Custom Page)               │
│ │   ○ Home Page                        │
│ │   ○ Service Details                  │
│ │   ○ Services List                    │
│ │   ○ Blog Post                        │
│ │   ○ Blog List                        │
│ │   └─ ... etc                         │
│ │                                      │
│ └─ ⚠️ Warning: Selecting this will     │
│      replace the current Home template │
├────────────────────────────────────────┤
│ SEO                                    │
│ ├─ Meta Title: [_______________]       │
│ ├─ Meta Description: [________]        │
│ └─ OG Image: [Upload]                  │
└────────────────────────────────────────┘
```

### 4. Template Assignment Logic

When user selects a template type:

1. **Check existing assignment** - Is another page already assigned?
2. **Show confirmation** - "Page X is currently the Home template. Replace it?"
3. **Update assignments** - Remove old assignment, set new one
4. **Validate** - Ensure only one page per template type

---

## Dynamic Placeholders for Service Details Template

### The Challenge

For `service_details` template, the layout needs to display **dynamic content** from the service being viewed (name, description, packages, FAQs, etc.).

### Solution: Special Placeholder Widgets

Create new widget types that render dynamic content:

| Widget Type | Description | Data Source |
|-------------|-------------|-------------|
| `service-hero` | Dynamic hero with service name, description, icon | Service model |
| `service-features` | Features list from service | ServiceFeature[] |
| `service-packages` | Package comparison table | Package[] |
| `service-faqs` | FAQs accordion | ServiceFAQ[] |
| `service-related` | Related services grid | Service[] (related) |
| `service-description` | Long description HTML | Service.description |
| `service-cta` | CTA with dynamic checkout link | Service checkout URL |

### Widget Configuration

Each dynamic widget can have styling options but pulls data dynamically:

```typescript
interface ServiceHeroWidgetSettings {
  // Layout options
  layout: 'centered' | 'left-aligned' | 'split';
  showIcon: boolean;
  showPrice: boolean;
  showProcessingTime: boolean;

  // Styling
  backgroundColor: string;
  textColor: string;
  padding: SpacingSettings;

  // CTA Buttons
  primaryButton: {
    text: string;  // Can include {serviceName}, {price} placeholders
    style: ButtonStyle;
  };
  secondaryButton: {
    show: boolean;
    text: string;
    link: string;
  };
}
```

### Template Preview with Sample Data

When editing a service details template, show a preview with sample service data:

```typescript
const SAMPLE_SERVICE_DATA: ServiceData = {
  name: "LLC Formation",
  shortDesc: "Form your US LLC quickly and easily",
  icon: "Building2",
  startingPrice: 149,
  processingTime: "2-3 business days",
  features: ["State Filing", "Operating Agreement", "EIN Application"],
  packages: [
    { name: "Basic", price: 149 },
    { name: "Standard", price: 299 },
    { name: "Premium", price: 499 },
  ],
  faqs: [
    { question: "How long does it take?", answer: "2-3 business days" }
  ]
};
```

---

## Frontend Rendering Changes

### 1. Homepage Route (`src/app/(marketing)/page.tsx`)

```typescript
export default async function HomePage() {
  // Find page assigned as HOME template
  const homeTemplate = await prisma.landingPage.findFirst({
    where: {
      isActive: true,
      isTemplateFor: 'home',  // or pageType: 'HOME'
    },
    include: { blocks: { where: { isActive: true } } }
  });

  if (homeTemplate) {
    const sections = extractSections(homeTemplate);
    return <WidgetSectionsRenderer sections={sections} />;
  }

  // Fallback to static components
  return <StaticHomepage />;
}
```

### 2. Service Details Route (`src/app/(marketing)/services/[slug]/page.tsx`)

```typescript
export default async function ServicePage({ params }) {
  const { slug } = await params;

  // Fetch service data
  const service = await getService(slug);
  if (!service) notFound();

  // Find SERVICE_DETAILS template
  const template = await prisma.landingPage.findFirst({
    where: {
      isActive: true,
      isTemplateFor: 'service_details',
    },
    include: { blocks: { where: { isActive: true } } }
  });

  if (template) {
    const sections = extractSections(template);
    return (
      <ServiceTemplateRenderer
        sections={sections}
        service={service}
      />
    );
  }

  // Fallback to current hardcoded layout
  return <StaticServicePage service={service} />;
}
```

### 3. ServiceTemplateRenderer Component

```typescript
interface ServiceTemplateRendererProps {
  sections: Section[];
  service: ServiceData;
}

export function ServiceTemplateRenderer({ sections, service }: ServiceTemplateRendererProps) {
  return (
    <ServiceContext.Provider value={service}>
      {sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          // Pass service data to dynamic widgets
          context={{ service }}
        />
      ))}
    </ServiceContext.Provider>
  );
}
```

---

## Implementation Phases

### Phase 1: Database & API Foundation

**Tasks:**
1. Add `pageType` and `isTemplateFor` fields to `LandingPage` model
2. Create migration
3. Update Prisma client
4. Create API endpoints:
   - `GET /api/admin/pages` - List all pages
   - `POST /api/admin/pages` - Create new page
   - `GET /api/admin/pages/[id]` - Get page details
   - `PUT /api/admin/pages/[id]` - Update page
   - `DELETE /api/admin/pages/[id]` - Delete page
   - `PUT /api/admin/pages/[id]/template` - Assign as template

### Phase 2: Admin Pages List UI

**Tasks:**
1. Create `/admin/appearance/pages/page.tsx` - Pages list view
2. Add DataTable with columns: Name, Slug, Template, Status, Actions
3. Implement filters and search
4. Add "Create New Page" functionality
5. Update sidebar navigation

### Phase 3: Page Editor Updates

**Tasks:**
1. Move current builder to `/admin/appearance/pages/[id]/page.tsx`
2. Add page settings panel/drawer
3. Implement template assignment UI
4. Add template assignment validation (one per type)
5. Add page status (draft/published) toggle

### Phase 4: Dynamic Service Widgets

**Tasks:**
1. Create `service-hero` widget
2. Create `service-features` widget
3. Create `service-packages` widget
4. Create `service-faqs` widget
5. Create `service-related` widget
6. Create `service-description` widget
7. Create `service-cta` widget
8. Register all in widget registry
9. Create settings panels for each

### Phase 5: Frontend Template Rendering

**Tasks:**
1. Update homepage route to check for HOME template
2. Create `ServiceContext` for passing service data
3. Create `ServiceTemplateRenderer` component
4. Update service details route to use template if assigned
5. Implement fallback logic for missing templates

### Phase 6: Testing & Polish

**Tasks:**
1. Test template assignment/unassignment
2. Test frontend rendering with templates
3. Test fallback scenarios
4. Add loading states
5. Add error handling
6. Add success notifications

---

## API Endpoints Design

### GET /api/admin/pages

```typescript
// Response
{
  pages: [
    {
      id: "cuid123",
      name: "Homepage Layout",
      slug: "homepage-v2",
      pageType: "HOME",
      isTemplateFor: "home",
      isActive: true,
      updatedAt: "2025-01-13T...",
      sectionsCount: 5
    },
    // ...
  ],
  total: 10
}
```

### POST /api/admin/pages

```typescript
// Request
{
  name: "New Page",
  slug: "new-page",  // Auto-generated if not provided
  pageType: null,    // Optional
}

// Response
{
  id: "cuid456",
  name: "New Page",
  slug: "new-page",
  // ...
}
```

### PUT /api/admin/pages/[id]/template

```typescript
// Request
{
  templateFor: "home"  // or "service_details", null to unassign
}

// Response
{
  success: true,
  previousTemplate: {
    pageId: "cuid789",
    pageName: "Old Homepage"
  },  // If there was a previous assignment
  newTemplate: {
    pageId: "cuid456",
    pageName: "New Page"
  }
}
```

---

## Component Structure

```
src/
├── app/
│   ├── admin/
│   │   └── appearance/
│   │       ├── pages/
│   │       │   ├── page.tsx              # Pages list
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Create new page
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # Page editor (widget builder)
│   │       │       └── components/
│   │       │           ├── page-settings-drawer.tsx
│   │       │           └── template-selector.tsx
│   │       └── landing-page/
│   │           └── page.tsx              # DEPRECATED: Redirect to /pages
│   └── (marketing)/
│       ├── page.tsx                      # Uses HOME template
│       └── services/
│           └── [slug]/
│               └── page.tsx              # Uses SERVICE_DETAILS template
├── components/
│   ├── page-builder/
│   │   └── widgets/
│   │       ├── service-hero-widget.tsx
│   │       ├── service-features-widget.tsx
│   │       ├── service-packages-widget.tsx
│   │       ├── service-faqs-widget.tsx
│   │       ├── service-related-widget.tsx
│   │       └── service-description-widget.tsx
│   └── landing-page/
│       ├── service-template-renderer.tsx
│       └── service-context.tsx
└── lib/
    └── page-builder/
        ├── types.ts                      # Add PageType enum
        └── service-widgets-defaults.ts   # Default settings for service widgets
```

---

## Migration Strategy

### Preserving Existing Data

1. The existing `"homepage"` LandingPage will be migrated to have `isTemplateFor: "home"`
2. No data loss - all existing sections preserved
3. Old `/admin/appearance/landing-page` route redirects to new `/admin/appearance/pages/[homepage-id]`

### Backwards Compatibility

1. If no template is assigned for a page type, fallback to static components
2. Old homepage route continues working during transition
3. Service details pages use hardcoded layout until template assigned

---

## No Template Assigned: Setup Guide Page

When no template is assigned for a page type, instead of showing a broken/empty page, display a beautiful **instructional setup guide** that helps admins understand what to do.

### Design Concept

A full-page, visually appealing guide with step-by-step instructions:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                         ┌──────────────┐                            │
│                         │   📄 + ✨    │                            │
│                         └──────────────┘                            │
│                                                                     │
│              No Template Assigned for This Page                     │
│                                                                     │
│     This page doesn't have a template yet. Follow the steps         │
│     below to create and assign a template.                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Step 1: Go to Page Builder                                 │   │
│  │  ─────────────────────────────────────                      │   │
│  │  Navigate to Admin Panel → Appearance → Pages               │   │
│  │                                                             │   │
│  │  [→ Open Page Builder]                                      │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Step 2: Create a New Page                                  │   │
│  │  ──────────────────────────────                             │   │
│  │  Click "Create New Page" and design your layout using       │   │
│  │  the drag-and-drop widget builder.                          │   │
│  │                                                             │   │
│  │  💡 Tip: Use "Service Hero", "Service Packages" widgets     │   │
│  │     for dynamic content that pulls from service data.       │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Step 3: Assign as Template                                 │   │
│  │  ──────────────────────────────                             │   │
│  │  Open Page Settings and select "Service Details" from       │   │
│  │  the "Use as template for" dropdown.                        │   │
│  │                                                             │   │
│  │  ┌─────────────────────────────────┐                        │   │
│  │  │ Use as template for:            │                        │   │
│  │  │ ┌─────────────────────────────┐ │                        │   │
│  │  │ │ ● Service Details        ▾ │ │                        │   │
│  │  │ └─────────────────────────────┘ │                        │   │
│  │  └─────────────────────────────────┘                        │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                           │                                         │
│                           ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  Step 4: Publish & Done!                                    │   │
│  │  ───────────────────────                                    │   │
│  │  Save your page and it will automatically be used for       │   │
│  │  all service detail pages.                                  │   │
│  │                                                             │   │
│  │              ✅ Your template is now live!                  │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ───────────────────────────────────────────────────────────────   │
│                                                                     │
│     🔒 This message is only visible to administrators.              │
│        Visitors will see a fallback page.                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Role-Based Display Logic

Different users see different content when no template is assigned:

| Role | What They See | Reason |
|------|---------------|--------|
| **Admin** | Setup Guide | Can create & assign templates |
| **Content Manager** | Setup Guide | Can manage page content |
| **Sales Agent** | Coming Soon Page | Cannot edit templates |
| **Support Agent** | Coming Soon Page | Cannot edit templates |
| **Customer** | Coming Soon Page | Regular visitor |
| **Guest (not logged in)** | Coming Soon Page | Regular visitor |

### Component: `TemplateSetupGuide`

```typescript
interface TemplateSetupGuideProps {
  pageType: 'home' | 'service_details' | 'blog_post' | etc;
  currentPath: string;  // For context
}

// Roles that can access page builder and see setup instructions
const PAGE_BUILDER_ROLES = ['admin', 'content_manager'];

export function TemplateSetupGuide({ pageType, currentPath }: TemplateSetupGuideProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Check if user can access page builder
  const canAccessPageBuilder = PAGE_BUILDER_ROLES.includes(userRole);

  if (!canAccessPageBuilder) {
    // Show "Coming Soon" page for regular visitors and non-admin staff
    return <ComingSoonPage pageType={pageType} />;
  }

  const config = SETUP_GUIDE_CONFIG[pageType];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            No Template Assigned for {config.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {config.description}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {config.steps.map((step, index) => (
            <SetupStep
              key={index}
              number={index + 1}
              title={step.title}
              description={step.description}
              tip={step.tip}
              action={step.action}
              isLast={index === config.steps.length - 1}
            />
          ))}
        </div>

        {/* Admin Notice */}
        <div className="mt-12 p-4 rounded-lg bg-muted/50 border border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>
              This setup guide is only visible to administrators.
              Regular visitors will see a fallback page.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Configuration per Page Type

```typescript
const SETUP_GUIDE_CONFIG = {
  home: {
    title: 'Homepage',
    description: 'Create a stunning homepage to welcome your visitors.',
    steps: [
      {
        title: 'Go to Page Builder',
        description: 'Navigate to Admin Panel → Appearance → Pages',
        action: { label: 'Open Page Builder', href: '/admin/appearance/pages' }
      },
      {
        title: 'Create a New Page',
        description: 'Click "Create New Page" and design your homepage layout.',
        tip: 'Use Hero, Services Grid, Testimonials widgets for a great homepage.'
      },
      {
        title: 'Assign as Homepage Template',
        description: 'In Page Settings, select "Home Page" from the template dropdown.',
      },
      {
        title: 'Publish & Done!',
        description: 'Save your page and it will become your new homepage.',
      }
    ]
  },

  service_details: {
    title: 'Service Details Pages',
    description: 'Design how individual service pages look across your site.',
    steps: [
      {
        title: 'Go to Page Builder',
        description: 'Navigate to Admin Panel → Appearance → Pages',
        action: { label: 'Open Page Builder', href: '/admin/appearance/pages' }
      },
      {
        title: 'Create a New Page',
        description: 'Click "Create New Page" and design your service page layout.',
        tip: 'Use dynamic widgets like "Service Hero", "Service Packages", "Service FAQs" to pull content from each service automatically.'
      },
      {
        title: 'Assign as Service Details Template',
        description: 'In Page Settings, select "Service Details" from the template dropdown.',
      },
      {
        title: 'Publish & Done!',
        description: 'All service pages will now use this template automatically.',
      }
    ]
  },

  blog_post: {
    title: 'Blog Posts',
    description: 'Design how individual blog posts appear to readers.',
    steps: [
      // Similar structure...
    ]
  },

  // ... other page types
};
```

### Visual Design Elements

**Color Scheme:**
- Background: Subtle gradient from `muted/30` to `background`
- Steps: White/card background with subtle shadow
- Connector lines: Dashed or dotted vertical lines between steps
- Icons: Primary color with light background

**Step Card Design:**
```
┌──────────────────────────────────────────────────┐
│  ①  Step Title                                   │
│      ──────────────────────────────────────      │
│      Description text explaining what to do.     │
│                                                  │
│      💡 Tip: Helpful hint for this step          │
│                                                  │
│      [→ Action Button]                           │
└──────────────────────────────────────────────────┘
         │
         │ (dashed connector line)
         ▼
```

**Animations:**
- Steps can fade in sequentially on page load
- Hover effects on action buttons
- Subtle pulse on the main icon

### Implementation in Routes

**Service Details Page:**
```typescript
// src/app/(marketing)/services/[slug]/page.tsx

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) notFound();

  const template = await getServiceDetailsTemplate();

  if (template) {
    return <ServiceTemplateRenderer sections={template.sections} service={service} />;
  }

  // No template assigned - show setup guide for admins, fallback for visitors
  return (
    <TemplateSetupGuide
      pageType="service_details"
      fallback={<StaticServicePage service={service} />}
    />
  );
}
```

**Homepage:**
```typescript
// src/app/(marketing)/page.tsx

export default async function HomePage() {
  const template = await getHomeTemplate();

  if (template) {
    return <WidgetSectionsRenderer sections={template.sections} />;
  }

  // No template assigned
  return (
    <TemplateSetupGuide
      pageType="home"
      fallback={<StaticHomepage />}
    />
  );
}
```

### Benefits of This Approach

1. **Clear Guidance** - Admins immediately understand what to do
2. **No Broken Pages** - Visitors see a proper fallback, not an error
3. **Reduced Support** - Self-explanatory UI reduces confusion
4. **Professional UX** - Beautiful design maintains brand quality
5. **Contextual Help** - Tips specific to each page type
6. **Direct Actions** - Buttons link directly to relevant admin pages

---

## Coming Soon Page (For Visitors)

When no template is assigned and a regular visitor (customer, guest, or non-admin staff) visits the page, show a beautiful "Coming Soon" page instead of hardcoded content. This is essential for a CMS product (like CodeCanyon) where no default content should be hardcoded.

### Design Concept

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                                                                         │
│                          ┌─────────────────┐                            │
│                          │                 │                            │
│                          │    🚀 ✨        │                            │
│                          │                 │                            │
│                          └─────────────────┘                            │
│                                                                         │
│                                                                         │
│                     We're Building Something                            │
│                           Amazing                                       │
│                                                                         │
│                                                                         │
│          This page is currently being designed. Please check            │
│                    back soon for updates!                               │
│                                                                         │
│                                                                         │
│               ┌──────────────┐    ┌──────────────┐                      │
│               │  Contact Us  │    │    Home      │                      │
│               └──────────────┘    └──────────────┘                      │
│                                                                         │
│                                                                         │
│         ─────────────────────────────────────────────────               │
│                                                                         │
│              📧 Subscribe to get notified when we launch                │
│                                                                         │
│              ┌─────────────────────────┐  ┌──────────┐                  │
│              │  Enter your email...    │  │ Notify Me│                  │
│              └─────────────────────────┘  └──────────┘                  │
│                                                                         │
│                                                                         │
│                        Follow us on social media                        │
│                     [Twitter] [Facebook] [LinkedIn]                     │
│                                                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component: `ComingSoonPage`

```typescript
interface ComingSoonPageProps {
  pageType: 'home' | 'service_details' | 'blog_post' | etc;
  // Optional: Pass dynamic data for context (e.g., service name)
  context?: {
    title?: string;  // e.g., "LLC Formation" for service pages
  };
}

export function ComingSoonPage({ pageType, context }: ComingSoonPageProps) {
  const config = COMING_SOON_CONFIG[pageType];

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        {/* Animated Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 animate-pulse">
            <Rocket className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {config.title}
        </h1>

        {/* Dynamic Subtitle (if context provided) */}
        {context?.title && (
          <p className="text-xl text-muted-foreground mb-2">
            {context.title}
          </p>
        )}

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          {config.description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Button asChild>
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Email Subscription (Optional) */}
        <div className="bg-muted/30 rounded-2xl p-6 mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            📧 Get notified when this page is ready
          </p>
          <form className="flex gap-2 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="Enter your email..."
              className="flex-1"
            />
            <Button type="submit">
              Notify Me
            </Button>
          </form>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="#" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="#" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="#" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Configuration per Page Type

```typescript
const COMING_SOON_CONFIG = {
  home: {
    title: "We're Building Something Amazing",
    description: "Our website is currently under construction. Please check back soon for an amazing experience!",
    icon: Rocket,
  },

  service_details: {
    title: "Service Coming Soon",
    description: "We're preparing detailed information about this service. Check back soon or contact us for more details.",
    icon: Package,
  },

  services_list: {
    title: "Services Coming Soon",
    description: "We're curating our list of services. Stay tuned for what we have to offer!",
    icon: Grid,
  },

  blog_post: {
    title: "Article Coming Soon",
    description: "This article is being prepared. Subscribe to get notified when it's published.",
    icon: FileText,
  },

  blog_list: {
    title: "Blog Coming Soon",
    description: "Our blog is under construction. Subscribe to be the first to read our articles!",
    icon: Newspaper,
  },

  about: {
    title: "About Us - Coming Soon",
    description: "We're crafting our story. Check back soon to learn more about us!",
    icon: Users,
  },

  contact: {
    title: "Contact Page Coming Soon",
    description: "Our contact page is being set up. In the meantime, email us at support@example.com",
    icon: Mail,
  },
};
```

### Visual Design Elements

**Color Scheme:**
- Background: Subtle gradient from `background` to `muted/20`
- Icon container: Primary color with low opacity (`primary/10`)
- Text: Gradient text for heading, muted for description
- Buttons: Primary for main CTA, outline for secondary

**Animations:**
- Icon container: Gentle pulse animation
- Page load: Fade in from bottom
- Buttons: Hover scale effect
- Email input: Focus ring animation

**Responsive Design:**
```
Mobile (< 640px):
- Single column layout
- Smaller icon (w-20 h-20)
- Stacked buttons
- Full-width email form

Tablet/Desktop (≥ 640px):
- Centered layout with max-width
- Larger icon (w-24 h-24)
- Inline buttons
- Compact email form
```

### Service Details Page - Special Handling

For service detail pages, we can show the service name dynamically even without a template:

```typescript
// src/app/(marketing)/services/[slug]/page.tsx

export default async function ServicePage({ params }) {
  const { slug } = await params;

  // Fetch minimal service data (just name and basic info)
  const service = await prisma.service.findUnique({
    where: { slug, isActive: true },
    select: { name: true, shortDesc: true }
  });

  if (!service) notFound();

  const template = await getServiceDetailsTemplate();

  if (template) {
    const fullService = await getFullServiceData(slug);
    return <ServiceTemplateRenderer sections={template.sections} service={fullService} />;
  }

  // No template - show Coming Soon with service name
  return (
    <ComingSoonPage
      pageType="service_details"
      context={{ title: service.name }}
    />
  );
}
```

This shows:
```
┌─────────────────────────────────────┐
│                                     │
│         Service Coming Soon         │
│                                     │
│           LLC Formation             │  ← Dynamic service name
│                                     │
│   We're preparing detailed info...  │
│                                     │
└─────────────────────────────────────┘
```

### Admin Panel Settings (Future Enhancement)

Allow admins to customize the Coming Soon page from the admin panel:

```typescript
interface ComingSoonSettings {
  // Branding
  title: string;
  description: string;
  icon: 'rocket' | 'construction' | 'clock' | 'sparkles';

  // Features
  showEmailSubscription: boolean;
  showSocialLinks: boolean;
  showContactButton: boolean;

  // Social Links
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };

  // Colors
  backgroundColor?: string;
  accentColor?: string;

  // Custom Content
  customMessage?: string;
  estimatedLaunchDate?: Date;
}
```

### Benefits of Coming Soon Page

| Benefit | Description |
|---------|-------------|
| **No Hardcoded Content** | Perfect for CMS products sold on CodeCanyon |
| **Professional Look** | Visitors see a polished page, not broken content |
| **Brand Consistency** | Uses site's theme colors and styling |
| **Lead Capture** | Email subscription captures interested visitors |
| **SEO Friendly** | Proper meta tags, no duplicate content issues |
| **Dynamic Context** | Can show service name, category, etc. |
| **Customizable** | Admin can modify text and settings |

---

## UI/UX Considerations

### Visual Indicators

1. **Template Badge** - Clear visual indication when a page is assigned as template
2. **Warning Icons** - Show warnings when reassigning templates
3. **Preview Mode** - Allow previewing templates with sample data

### Error Prevention

1. **Confirmation Dialogs** - Confirm before replacing existing template
2. **Validation** - Prevent deleting pages that are assigned as templates
3. **Undo** - Allow quick undo after template reassignment

### User Guidance

1. **Empty State** - Guide users to create their first page
2. **Template Help** - Tooltips explaining each template type
3. **Sample Templates** - Option to start from pre-built templates

---

## Future Enhancements

### Version History
- Save versions of pages
- Revert to previous versions
- Compare versions

### A/B Testing
- Create multiple templates for same page type
- Random or rule-based template selection
- Analytics integration

### Template Marketplace
- Pre-built templates
- Import/export templates
- Share templates between installations

### Dynamic Content Slots
- More placeholder widgets for other page types
- Blog post placeholders (title, content, author, etc.)
- Custom field placeholders

---

## Summary

This plan transforms the page builder from a single-page editor into a flexible **Page Template System** inspired by WordPress. Key benefits:

1. **Multiple Pages** - Create and manage many page layouts
2. **Template Assignment** - Assign pages as templates for specific page types
3. **Dynamic Content** - Service details and other dynamic pages use templates with placeholders
4. **Flexibility** - Mix static and dynamic content in templates
5. **Scalability** - Easily extend to new page types in the future

The implementation is divided into 6 phases, ensuring incremental delivery while maintaining backwards compatibility with the existing system.
