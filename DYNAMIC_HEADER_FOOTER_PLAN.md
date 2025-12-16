# Dynamic Header & Footer Builder - Implementation Plan

## Executive Summary

এই plan অনুযায়ী LLCPad CMS-এ industry-standard, fully dynamic Header ও Footer Builder implement করা হবে। CodeCanyon-এ release করার জন্য এটি WordPress Elementor, Webflow, এবং Squarespace-এর মতো professional CMS গুলোর feature-set follow করবে।

---

## ✅ Approved: Admin Navigation Structure

**Option A Approved** - `/admin/appearance/` section

```
Admin Dashboard
├── Dashboard (Home)
├── Orders
├── Services
├── Blog
├── Users
├── Tickets (Support)
│
├── 🎨 Appearance  ← NEW SECTION
│   ├── Header Builder
│   │   ├── Layout & Style
│   │   ├── Menu Builder (Drag & Drop)
│   │   ├── Top Bar Settings
│   │   └── CTA Buttons
│   ├── Footer Builder
│   │   ├── Layout & Columns
│   │   ├── Widget Manager
│   │   └── Bottom Bar Settings
│   └── Theme Settings (future)
│       ├── Colors & Fonts
│       └── Custom CSS
│
├── ⚙️ Settings (Existing)
│   ├── General (Business Config)
│   ├── Lists (System/Custom)
│   ├── State Fees
│   ├── Payment Gateways
│   └── Email Templates
│
└── Profile
```

### Routes

| Route | Page |
|-------|------|
| `/admin/appearance` | Overview with quick links |
| `/admin/appearance/header` | Header Builder |
| `/admin/appearance/header/menu` | Menu Editor (Drag & Drop) |
| `/admin/appearance/footer` | Footer Builder |

**Why Option A:**
- Industry standard (WordPress, Shopify, Ghost)
- Clean separation of concerns
- Future-proof for Theme Settings, Custom CSS
- Familiar to CodeCanyon users

---

## Research Findings (2025 Trends)

### Industry Leaders Analysis

| CMS | Header Features | Footer Features |
|-----|----------------|-----------------|
| **Elementor (WordPress)** | Theme Builder, Sticky Headers, Mega Menu, Transparent Header | Widget Areas, Multi-column, Custom Templates |
| **Webflow** | Visual CSS Grid, Animations, Components | Flexible Layouts, Symbol System |
| **Squarespace** | WYSIWYG Editor, Multiple Layouts | Footer Blocks, Social Integration |
| **Active eCommerce (CodeCanyon)** | 6 Preset Styles, Customizable | Multi-column Widgets |

### 2025 UI/UX Best Practices

**Header:**
- Sticky/Floating navigation (30% lower bounce rate)
- Dynamic headers based on user behavior
- Mega menu with categories
- Mobile-first responsive design
- CTA buttons (Get Started, Contact)
- Search integration
- Language switcher support
- Announcement bar/Top bar

**Footer:**
- Multi-column widget areas (3-6 columns)
- Newsletter subscription form
- Social media links
- Contact information
- Legal links (Privacy, Terms, GDPR)
- Dark mode support
- Trust badges & certifications
- Quick links / Sitemap style

---

## Database Schema Design

```prisma
// ==========================================
// HEADER CONFIGURATION
// ==========================================

model HeaderConfig {
  id              String   @id @default(cuid())
  name            String   @default("Default Header")
  isActive        Boolean  @default(true)

  // Layout Settings
  layout          HeaderLayout @default(DEFAULT)
  sticky          Boolean  @default(true)
  transparent     Boolean  @default(false)

  // Top Bar
  topBarEnabled   Boolean  @default(false)
  topBarContent   Json?    // { text, links, showSocial }
  topBarBgColor   String?
  topBarTextColor String?

  // Logo Settings
  logoPosition    LogoPosition @default(LEFT)
  logoMaxHeight   Int      @default(40)

  // Navigation
  menuItems       Json     // Array of menu items
  megaMenuEnabled Boolean  @default(true)

  // CTA Buttons
  ctaButtons      Json?    // Array of { text, url, variant, icon }

  // Auth Buttons
  showAuthButtons Boolean  @default(true)
  loginText       String   @default("Sign In")
  registerText    String   @default("Get Started")
  registerUrl     String   @default("/services/llc-formation")

  // Search
  searchEnabled   Boolean  @default(false)
  searchPosition  String   @default("right") // left, center, right

  // Mobile Settings
  mobileBreakpoint Int     @default(1024)
  mobileLogo      String?

  // Styling
  bgColor         String?
  textColor       String?
  accentColor     String?
  borderColor     String?
  height          Int      @default(64)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum HeaderLayout {
  DEFAULT       // Logo left, Nav center, CTA right
  CENTERED      // Logo center, Nav below
  SPLIT         // Logo center, Nav split left/right
  MINIMAL       // Logo left, Hamburger right
  MEGA          // Full mega menu style
}

enum LogoPosition {
  LEFT
  CENTER
  RIGHT
}

// ==========================================
// NAVIGATION MENU ITEMS
// ==========================================

model MenuItem {
  id              String   @id @default(cuid())

  // Basic Info
  label           String
  url             String?
  target          String   @default("_self") // _self, _blank
  icon            String?  // Lucide icon name

  // Hierarchy
  parentId        String?
  parent          MenuItem?  @relation("MenuHierarchy", fields: [parentId], references: [id])
  children        MenuItem[] @relation("MenuHierarchy")

  // Mega Menu Content (for parent items)
  isMegaMenu      Boolean  @default(false)
  megaMenuColumns Int?     @default(4)
  megaMenuContent Json?    // Custom content blocks

  // Visibility
  isVisible       Boolean  @default(true)
  visibleOnMobile Boolean  @default(true)
  requiredRole    String?  // null = public, CUSTOMER, ADMIN

  // Badge/Label
  badge           String?  // "New", "Popular", "Sale"
  badgeColor      String?

  // Ordering
  sortOrder       Int      @default(0)

  // Relations
  headerId        String?
  footerId        String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([parentId])
  @@index([sortOrder])
}

// ==========================================
// FOOTER CONFIGURATION
// ==========================================

model FooterConfig {
  id              String   @id @default(cuid())
  name            String   @default("Default Footer")
  isActive        Boolean  @default(true)

  // Layout
  layout          FooterLayout @default(MULTI_COLUMN)
  columns         Int      @default(4)

  // Widgets/Sections
  widgets         Json     // Array of footer widgets

  // Newsletter
  newsletterEnabled    Boolean @default(true)
  newsletterTitle      String  @default("Subscribe to our newsletter")
  newsletterSubtitle   String?
  newsletterProvider   String? // mailchimp, convertkit, custom
  newsletterFormAction String?

  // Social Links (override from business config)
  showSocialLinks Boolean @default(true)
  socialPosition  String  @default("brand") // brand, bottom, separate-column

  // Contact Info
  showContactInfo Boolean @default(true)
  contactPosition String  @default("brand") // brand, separate-column

  // Bottom Bar
  bottomBarEnabled Boolean @default(true)
  copyrightText   String?
  showDisclaimer  Boolean @default(true)
  disclaimerText  String?
  bottomLinks     Json?   // Array of { label, url }

  // Trust Badges
  showTrustBadges Boolean @default(false)
  trustBadges     Json?   // Array of { image, alt, url }

  // Styling
  bgColor         String?
  textColor       String?
  accentColor     String?
  borderColor     String?

  // Spacing
  paddingTop      Int     @default(48)
  paddingBottom   Int     @default(32)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum FooterLayout {
  MULTI_COLUMN   // Traditional multi-column
  CENTERED       // Centered stacked
  MINIMAL        // Just copyright and links
  MEGA           // Full sitemap style
  WIDGET_BASED   // Flexible widget areas
}

// ==========================================
// FOOTER WIDGETS
// ==========================================

model FooterWidget {
  id              String   @id @default(cuid())
  footerId        String

  // Widget Type
  type            FooterWidgetType

  // Basic Settings
  title           String?
  showTitle       Boolean  @default(true)

  // Content based on type
  content         Json     // Varies by widget type

  // Position
  column          Int      @default(1) // 1-6
  sortOrder       Int      @default(0)

  // Styling
  customClass     String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([footerId])
  @@index([column, sortOrder])
}

enum FooterWidgetType {
  BRAND           // Logo + description
  LINKS           // Link list
  CONTACT         // Contact info
  NEWSLETTER      // Email subscription
  SOCIAL          // Social icons
  TEXT            // Custom text/HTML
  RECENT_POSTS    // Latest blog posts
  SERVICES        // Services list (auto-populated)
  STATES          // Popular states (auto-populated)
  CUSTOM_HTML     // Raw HTML
  IMAGE           // Image with optional link
  MAP             // Embedded map
}
```

---

## Admin Panel UI Design

### Header Builder Page (`/admin/appearance/header`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header Builder                                    [Preview] [Save] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LIVE PREVIEW AREA                         │   │
│  │  ┌─────────────────────────────────────────────────────────┐│   │
│  │  │ [Logo]  Home  Services▼  Pricing  Blog  Contact  [CTA] ││   │
│  │  └─────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐ ┌────────────────────────────────────────────┐   │
│  │   SETTINGS   │ │                                            │   │
│  │              │ │  Layout                                    │   │
│  │ ○ Layout     │ │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐      │   │
│  │ ○ Top Bar    │ │  │ □  │ │ □  │ │ □  │ │ □  │ │ □  │      │   │
│  │ ○ Logo       │ │  │DEF │ │CTR │ │SPL │ │MIN │ │MEG │      │   │
│  │ ○ Navigation │ │  └────┘ └────┘ └────┘ └────┘ └────┘      │   │
│  │ ○ CTA        │ │                                            │   │
│  │ ○ Mobile     │ │  [✓] Sticky Header                        │   │
│  │ ○ Styling    │ │  [ ] Transparent on Hero                  │   │
│  │              │ │                                            │   │
│  └──────────────┘ │  Header Height: [64]px                    │   │
│                   │                                            │   │
│                   └────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Menu Builder (Drag & Drop)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Navigation Menu                                          [+ Add]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ☰ Home                                              [Edit] [×]    │
│  ☰ Services ▼ (Mega Menu)                           [Edit] [×]    │
│    ├─ Formation & Legal                                            │
│    │   ├─ LLC Formation                             [Edit] [×]    │
│    │   ├─ EIN Application                           [Edit] [×]    │
│    │   └─ [+ Add Item]                                             │
│    ├─ Amazon Services                                              │
│    │   ├─ Amazon Seller Account                     [Edit] [×]    │
│    │   └─ [+ Add Item]                                             │
│    └─ [+ Add Column]                                               │
│  ☰ Pricing                                           [Edit] [×]    │
│  ☰ About                                             [Edit] [×]    │
│  ☰ Blog                                              [Edit] [×]    │
│  ☰ Contact                                           [Edit] [×]    │
│                                                                     │
│  [+ Add Menu Item]                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Footer Builder Page (`/admin/appearance/footer`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Footer Builder                                    [Preview] [Save] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Layout: [Multi-Column ▼]    Columns: [4]                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      LIVE PREVIEW                            │   │
│  │  ┌────────┬────────┬────────┬────────┐                      │   │
│  │  │ Brand  │Services│Company │ Legal  │                      │   │
│  │  │ ────── │ ────── │ ────── │ ────── │                      │   │
│  │  │ Logo   │ LLC    │ About  │Privacy │                      │   │
│  │  │ Desc   │ EIN    │ Blog   │Terms   │                      │   │
│  │  │ Social │ Amazon │ Contact│Refund  │                      │   │
│  │  └────────┴────────┴────────┴────────┘                      │   │
│  │  ─────────────────────────────────────                      │   │
│  │  © 2025 LLCPad           Disclaimer...                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Widget Areas:                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Column 1        │ Column 2        │ Column 3    │ Column 4   │  │
│  │ ┌────────────┐  │ ┌────────────┐  │┌──────────┐ │┌─────────┐ │  │
│  │ │ Brand      │  │ │ Links      │  ││ Links    │ ││ Links   │ │  │
│  │ │ Widget     │  │ │ Widget     │  ││ Widget   │ ││ Widget  │ │  │
│  │ │ [Edit]     │  │ │ [Edit]     │  ││ [Edit]   │ ││ [Edit]  │ │  │
│  │ └────────────┘  │ └────────────┘  │└──────────┘ │└─────────┘ │  │
│  │ [+ Add Widget]  │ [+ Add Widget]  │[+Add Widget]│[+Add Widg] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Database & API Foundation (Day 1-2)

1. **Prisma Schema Update** ✅ COMPLETED
   - Add HeaderConfig, MenuItem, FooterConfig, FooterWidget models ✅
   - Create migration ✅
   - Add seed data for default header/footer ✅
   - **Seeding Results:**
     - Header Config: 1
     - Menu Items: 52 (6 main + 4 categories + 21 services)
     - Footer Config: 1
     - Footer Widgets: 5 (Brand + 4 Link Lists)

2. **API Routes** ✅ COMPLETED
   ```
   /api/admin/header           ✅ GET, POST, PUT
   /api/admin/header/[id]      ✅ GET, DELETE
   /api/admin/header/menu      ✅ GET, POST, PUT, DELETE
   /api/admin/header/menu/reorder ✅ POST (drag & drop support)

   /api/admin/footer           ✅ GET, POST, PUT
   /api/admin/footer/[id]      ✅ GET, DELETE
   /api/admin/footer/widgets   ✅ GET, POST, PUT, DELETE
   /api/admin/footer/widgets/links   ✅ GET, POST, PUT, DELETE
   /api/admin/footer/widgets/reorder ✅ POST (drag & drop support)

   /api/header  ✅ (Public - 60s cache)
   /api/footer  ✅ (Public - 60s cache)
   ```

### Phase 2: Admin UI - Header Builder (Day 3-4) ✅ COMPLETED

1. **Header Settings Page** (`/admin/appearance/header`) ✅
   - Layout selector (visual cards) ✅
   - Top bar settings ✅
   - Logo settings ✅
   - Sticky/Transparent toggles ✅
   - Height & spacing controls ✅
   - Color pickers ✅
   - Live preview with desktop/mobile toggle ✅

2. **Menu Builder** (`/admin/appearance/header/menu`) ✅
   - Tree view with expand/collapse ✅
   - Add/Edit/Delete menu items ✅
   - Mega menu configuration ✅
   - Badge settings ✅
   - Category info for mega menu sections ✅
   - Visibility toggles ✅

3. **CTA Button Editor** ✅
   - Multiple buttons support ✅
   - Button variants (primary, secondary, outline) ✅
   - URL configuration ✅

### Phase 3: Admin UI - Footer Builder (Day 5-6) ✅ COMPLETED

1. **Footer Settings Page** (`/admin/appearance/footer`) ✅
   - Layout selector ✅
   - Column count slider (2-6 columns) ✅
   - Bottom bar settings ✅
   - Newsletter settings ✅
   - Styling controls (colors, padding) ✅

2. **Widget Builder** ✅
   - Visual widget areas by column ✅
   - Widget type selector (10 types) ✅
   - Widget-specific settings ✅
   - Add/Edit/Delete widgets ✅

3. **Widget Types Implementation** ✅
   - Brand widget (logo, description, contact)
   - Links widget (configurable link list)
   - Newsletter widget (form integration)
   - Social widget
   - Custom HTML widget
   - Auto-populated widgets (Services, States, Recent Posts)

### Phase 4: Frontend Integration (Day 7-8) ✅ COMPLETED

1. **Dynamic Header Component** ✅
   - Fetch config from API (with SWR caching) ✅
   - Render based on layout type ✅
   - Mobile responsive menu ✅
   - Mega menu support ✅
   - Sticky header behavior ✅
   - Fallback to hardcoded defaults on API failure ✅
   - Icon mapping for dynamic Lucide icons ✅

2. **Dynamic Footer Component** ✅
   - Fetch config from API ✅
   - Widget rendering system ✅
   - Newsletter form integration ✅
   - Responsive columns ✅
   - FooterWidgetRenderer component ✅
   - Fallback links when API fails ✅

3. **Performance Optimization** ✅
   - API response caching (60s) ✅
   - Loading states ✅
   - Graceful degradation with fallbacks ✅

### Phase 5: Advanced Styling & Theming (Day 9-10)

**Research Sources (2025 Trends):**
- [Elementor 2025 Web Design Trends](https://elementor.com/blog/2025-web-design-trends-best-practices/)
- [Awwwards - Gradients in Web Design](https://www.awwwards.com/gradients-in-web-design-elements.html)
- [EditorialGE - Dark Mode & Glassmorphism Trends](https://editorialge.com/web-design-trends-dark-mode-glassmorphism/)
- [CSS Author - 40+ CSS Hover Effects](https://cssauthor.com/css-hover-effects/)
- [MenuHover.com - Navbar Effects Library](https://menuhover.com/)
- [LambdaTest - Best CSS Button Hover Effects 2025](https://www.lambdatest.com/blog/best-css-button-hover-effects/)

#### 1. **Color System & Theme Engine**

**Background Colors:**
```typescript
interface BackgroundStyling {
  // Solid Colors
  backgroundColor: string;           // #ffffff, #1a1a1a
  backgroundOpacity: number;         // 0-100

  // Gradient Support (2025 Trend: Aurora/Multi-tone gradients)
  gradientEnabled: boolean;
  gradientType: 'linear' | 'radial' | 'conic';
  gradientAngle: number;             // 0-360 degrees
  gradientColors: GradientStop[];    // Multiple color stops
  gradientAnimation: boolean;        // Animated color transitions
  gradientAnimationSpeed: number;    // seconds

  // Glassmorphism (2025 Top Trend)
  glassmorphismEnabled: boolean;
  blurAmount: number;                // 5-15px recommended
  glassOpacity: number;              // 0-100
  glassBorder: boolean;              // Subtle border

  // Background Image
  backgroundImage: string;
  backgroundSize: 'cover' | 'contain' | 'auto';
  backgroundPosition: string;
  backgroundOverlay: string;         // Color overlay
  backgroundOverlayOpacity: number;
}

interface GradientStop {
  color: string;
  position: number;  // 0-100%
}
```

**Dark Mode Support:**
```typescript
interface DarkModeConfig {
  enabled: boolean;
  autoDetect: boolean;               // prefers-color-scheme
  adaptiveMode: boolean;             // Time-based switching

  // Dark Mode Colors
  darkBgColor: string;               // #121212, #1a1a1a recommended
  darkTextColor: string;             // #e0e0e0, soft whites
  darkAccentColor: string;
  darkBorderColor: string;

  // Toggle Settings
  showToggle: boolean;
  togglePosition: 'header' | 'footer' | 'floating';
}
```

#### 2. **Text & Typography Styling**

```typescript
interface TextStyling {
  // Basic Text Colors
  textColor: string;
  textColorHover: string;
  textColorActive: string;

  // Link Colors
  linkColor: string;
  linkHoverColor: string;
  linkActiveColor: string;
  linkVisitedColor: string;

  // Gradient Text (2025 Trend)
  gradientTextEnabled: boolean;
  gradientTextColors: string[];

  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}
```

#### 3. **Hover Effects & Micro-Interactions**

**Menu Item Hover Effects:**
```typescript
type MenuHoverEffect =
  | 'none'
  | 'underline-slide-left'      // Underline slides from left
  | 'underline-slide-right'     // Underline slides from right
  | 'underline-expand-center'   // Underline expands from center
  | 'underline-expand-edges'    // Underline expands from edges
  | 'double-underline'          // Above and below text
  | 'background-fill'           // Background fills on hover
  | 'background-slide'          // Background slides in
  | 'text-color-change'         // Just color change
  | 'scale-up'                  // Slight scale increase
  | 'glow'                      // Neon glow effect
  | 'flip-up';                  // 3D flip animation

interface MenuHoverConfig {
  effect: MenuHoverEffect;
  duration: number;              // ms (200-400 recommended)
  easing: string;                // ease, ease-in-out, cubic-bezier
  hoverColor: string;
  hoverBgColor: string;
  underlineColor: string;
  underlineThickness: number;    // px
  glowColor: string;             // For neon glow
  glowIntensity: number;         // 0-20px
}
```

**Button Hover Effects (CTA):**
```typescript
type ButtonHoverEffect =
  | 'none'
  | 'darken'                     // Darken background
  | 'lighten'                    // Lighten background
  | 'shadow-lift'                // Add shadow, appear raised
  | 'shadow-press'               // Reduce shadow, appear pressed
  | 'scale-up'                   // Grow slightly
  | 'scale-down'                 // Shrink slightly
  | 'slide-fill'                 // Background slides in
  | 'border-fill'                // Border fills to background
  | 'gradient-shift'             // Gradient animates
  | 'glow-pulse'                 // Pulsing glow
  | 'ripple';                    // Material ripple effect

interface ButtonStyling {
  // Normal State
  bgColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: string;

  // Hover State
  hoverEffect: ButtonHoverEffect;
  hoverBgColor: string;
  hoverTextColor: string;
  hoverBorderColor: string;
  hoverShadow: string;

  // Active/Click State
  activeBgColor: string;
  activeScale: number;           // 0.95-1.0

  // Animation
  transitionDuration: number;
  transitionEasing: string;
}
```

#### 4. **Border & Shadow System**

```typescript
interface BorderStyling {
  // Border
  borderWidth: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor: string;
  borderRadius: number;

  // Individual Borders
  borderTop: boolean;
  borderBottom: boolean;
  borderLeft: boolean;
  borderRight: boolean;

  // Divider Line
  showDivider: boolean;
  dividerColor: string;
  dividerWidth: number;
  dividerStyle: 'solid' | 'dashed' | 'gradient';
}

interface ShadowStyling {
  // Box Shadow
  shadowEnabled: boolean;
  shadowColor: string;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowSpread: number;

  // Multiple Shadows (layered depth)
  multipleShadows: Shadow[];

  // Inner Shadow
  innerShadowEnabled: boolean;
  innerShadowColor: string;

  // Hover Shadow
  hoverShadowEnabled: boolean;
  hoverShadow: Shadow;
}
```

#### 5. **Animation & Transition System**

```typescript
interface AnimationConfig {
  // Page Load Animations
  loadAnimation: 'none' | 'fade-in' | 'slide-down' | 'slide-up';
  loadAnimationDuration: number;
  loadAnimationDelay: number;

  // Scroll Animations
  scrollAnimation: boolean;
  stickyTransition: 'instant' | 'smooth' | 'slide';
  scrollColorChange: boolean;     // Header color change on scroll
  scrollShrink: boolean;          // Header shrinks on scroll
  scrollShadow: boolean;          // Add shadow on scroll

  // Mega Menu Animation
  megaMenuAnimation: 'none' | 'fade' | 'slide-down' | 'scale';
  megaMenuDuration: number;

  // Mobile Menu Animation
  mobileMenuAnimation: 'slide-left' | 'slide-right' | 'fade' | 'scale';
  mobileMenuDuration: number;
}
```

#### 6. **Admin UI Components**

**Color Picker with Presets:**
- Preset color palettes (Modern, Corporate, Creative, Dark, Light)
- Recent colors history
- Global color sync with design system
- Opacity slider
- Gradient builder with visual stops

**Hover Effect Preview:**
- Live preview of all hover effects
- Side-by-side comparison
- Mobile vs Desktop preview

**Theme Presets:**
- Light Professional
- Dark Modern
- Glassmorphism
- Gradient Aurora
- Minimal Clean
- Bold Contrast

#### 7. **Database Schema Additions**

```prisma
// Add to HeaderConfig
model HeaderConfig {
  // ... existing fields ...

  // Advanced Styling
  styling           Json?    // Full styling config
  darkModeConfig    Json?    // Dark mode settings
  hoverConfig       Json?    // Hover effects config
  animationConfig   Json?    // Animation settings

  // Theme
  themePreset       String?  // Preset name
}

// Add to FooterConfig
model FooterConfig {
  // ... existing fields ...

  // Advanced Styling
  styling           Json?
  darkModeConfig    Json?
  animationConfig   Json?

  // Theme
  themePreset       String?
}
```

#### 8. **CSS Generation System**

```typescript
// Generate CSS from config
function generateHeaderCSS(config: HeaderConfig): string {
  return `
    .site-header {
      background: ${config.styling.backgroundColor};
      ${config.styling.gradientEnabled ? `
        background: linear-gradient(
          ${config.styling.gradientAngle}deg,
          ${config.styling.gradientColors.map(c => `${c.color} ${c.position}%`).join(', ')}
        );
      ` : ''}
      ${config.styling.glassmorphismEnabled ? `
        backdrop-filter: blur(${config.styling.blurAmount}px);
        -webkit-backdrop-filter: blur(${config.styling.blurAmount}px);
        background-color: rgba(255, 255, 255, ${config.styling.glassOpacity / 100});
      ` : ''}
    }

    .nav-link {
      transition: all ${config.hoverConfig.duration}ms ${config.hoverConfig.easing};
    }

    .nav-link:hover {
      color: ${config.hoverConfig.hoverColor};
      ${getHoverEffectCSS(config.hoverConfig.effect)}
    }

    @media (prefers-color-scheme: dark) {
      ${config.darkModeConfig.autoDetect ? `
        .site-header {
          background: ${config.darkModeConfig.darkBgColor};
          color: ${config.darkModeConfig.darkTextColor};
        }
      ` : ''}
    }
  `;
}
```

#### 9. **Implementation Checklist**

- [ ] Color picker component with gradient builder
- [ ] Hover effect selector with live preview
- [ ] Dark mode toggle and auto-detect
- [ ] Glassmorphism configurator
- [ ] Animation timeline editor
- [ ] Theme preset selector
- [ ] CSS variable generation
- [ ] Real-time preview system
- [ ] Export custom CSS option

---

### Phase 6: Import/Export & Version Control (Day 11-12)

1. **Import/Export System**
   - Export header/footer config as JSON
   - Import from JSON file
   - Export as CSS file (generated styles)
   - Bulk export (header + footer + menu + widgets)
   - Reset to defaults with confirmation

2. **Configuration Versioning**
   - Save configuration versions/snapshots
   - Rollback to previous versions
   - Compare versions (diff view)
   - Auto-save drafts before publish
   - Version history with timestamps

3. **Multi-site Support (Future)**
   - Clone configuration to other sites
   - Sync settings across environments
   - Configuration sharing via URL/code

4. **Backup & Restore**
   - Scheduled automatic backups
   - One-click restore from backup
   - Export backup to cloud storage (S3/R2)

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── appearance/
│   │       ├── page.tsx              # Appearance overview
│   │       ├── header/
│   │       │   ├── page.tsx          # Header builder
│   │       │   └── menu/
│   │       │       └── page.tsx      # Menu builder
│   │       └── footer/
│   │           └── page.tsx          # Footer builder
│   └── api/
│       ├── admin/
│       │   ├── header/
│       │   │   ├── route.ts          # Header config CRUD
│       │   │   └── menu/
│       │   │       ├── route.ts      # Menu items CRUD
│       │   │       └── [id]/
│       │   │           └── route.ts  # Single menu item
│       │   └── footer/
│       │       ├── route.ts          # Footer config CRUD
│       │       └── widgets/
│       │           ├── route.ts      # Widgets CRUD
│       │           └── [id]/
│       │               └── route.ts  # Single widget
│       ├── header/
│       │   └── route.ts              # Public header API
│       └── footer/
│           └── route.ts              # Public footer API
│
├── components/
│   └── layout/
│       ├── header.tsx                # Dynamic header (updated)
│       ├── footer.tsx                # Dynamic footer (updated)
│       ├── header/
│       │   ├── header-default.tsx    # Default layout
│       │   ├── header-centered.tsx   # Centered layout
│       │   ├── header-split.tsx      # Split layout
│       │   ├── header-minimal.tsx    # Minimal layout
│       │   ├── header-mega.tsx       # Mega menu layout
│       │   ├── mega-menu.tsx         # Mega menu component
│       │   ├── mobile-menu.tsx       # Mobile menu
│       │   └── top-bar.tsx           # Announcement bar
│       └── footer/
│           ├── footer-multi-column.tsx
│           ├── footer-centered.tsx
│           ├── footer-minimal.tsx
│           └── widgets/
│               ├── brand-widget.tsx
│               ├── links-widget.tsx
│               ├── newsletter-widget.tsx
│               ├── social-widget.tsx
│               ├── contact-widget.tsx
│               └── custom-html-widget.tsx
│
├── hooks/
│   ├── use-header-config.ts          # Header config hook
│   └── use-footer-config.ts          # Footer config hook
│
└── lib/
    └── header-footer/
        ├── types.ts                  # TypeScript types
        ├── defaults.ts               # Default configurations
        └── presets.ts                # Preset templates
```

---

## API Response Examples

### GET /api/header

```json
{
  "layout": "DEFAULT",
  "sticky": true,
  "transparent": false,
  "height": 64,
  "topBar": {
    "enabled": true,
    "text": "Free consultation for new customers!",
    "links": [
      { "label": "Call Now", "url": "tel:+1234567890" }
    ],
    "bgColor": "#1e40af",
    "textColor": "#ffffff"
  },
  "logo": {
    "position": "LEFT",
    "maxHeight": 40,
    "url": "/logo.png",
    "text": "LP"
  },
  "menu": [
    {
      "id": "1",
      "label": "Home",
      "url": "/",
      "children": []
    },
    {
      "id": "2",
      "label": "Services",
      "url": "/services",
      "isMegaMenu": true,
      "megaMenuColumns": 4,
      "children": [
        {
          "id": "2-1",
          "label": "Formation & Legal",
          "icon": "building-2",
          "children": [
            { "id": "2-1-1", "label": "LLC Formation", "url": "/services/llc-formation", "badge": "Popular" },
            { "id": "2-1-2", "label": "EIN Application", "url": "/services/ein-application" }
          ]
        }
      ]
    }
  ],
  "cta": [
    { "text": "Get Started", "url": "/services/llc-formation", "variant": "primary" }
  ],
  "auth": {
    "showButtons": true,
    "loginText": "Sign In",
    "registerText": "Get Started",
    "registerUrl": "/services/llc-formation"
  },
  "styling": {
    "bgColor": "#ffffff",
    "textColor": "#1f2937",
    "accentColor": "#2563eb"
  }
}
```

### GET /api/footer

```json
{
  "layout": "MULTI_COLUMN",
  "columns": 4,
  "widgets": [
    {
      "id": "1",
      "type": "BRAND",
      "column": 1,
      "content": {
        "showLogo": true,
        "description": "Professional LLC formation services...",
        "showContact": true,
        "showSocial": true
      }
    },
    {
      "id": "2",
      "type": "LINKS",
      "column": 2,
      "title": "Services",
      "content": {
        "links": [
          { "label": "LLC Formation", "url": "/services/llc-formation" },
          { "label": "EIN Application", "url": "/services/ein-application" }
        ]
      }
    }
  ],
  "newsletter": {
    "enabled": true,
    "title": "Subscribe to our newsletter",
    "subtitle": "Get updates on new services and offers"
  },
  "bottomBar": {
    "enabled": true,
    "copyrightText": "© 2025 LLCPad. All rights reserved.",
    "showDisclaimer": true,
    "links": [
      { "label": "Privacy Policy", "url": "/privacy" },
      { "label": "Terms", "url": "/terms" }
    ]
  },
  "styling": {
    "bgColor": "#f9fafb",
    "textColor": "#6b7280"
  }
}
```

---

## CodeCanyon Selling Points

এই feature implement করলে CodeCanyon listing-এ এই points highlight করা যাবে:

1. **Visual Header Builder** - Drag & drop menu management
2. **5 Header Layouts** - Default, Centered, Split, Minimal, Mega
3. **Mega Menu Support** - Multi-column dropdown menus
4. **Top Bar/Announcement Bar** - Promotional messages
5. **Sticky & Transparent Headers** - Modern navigation styles
6. **Visual Footer Builder** - Widget-based customization
7. **10+ Footer Widgets** - Brand, Links, Newsletter, Social, etc.
8. **Multi-column Layouts** - 2-6 column support
9. **Newsletter Integration** - Built-in subscription form
10. **Preset Templates** - One-click professional designs
11. **Mobile Responsive** - Perfect on all devices
12. **No Coding Required** - Complete visual editing

---

## Sources

- [Eleken - 10 Modern Footer UX Patterns](https://www.eleken.co/blog-posts/footer-ux)
- [DarwinApps - Website Header Design Guide 2025](https://www.blog.darwinapps.com/blog/website-header-design-guide-2025-best-practices-to-boost-engagement)
- [BeetleBeetle - Modern Website Footer Design Guide](https://beetlebeetle.com/post/modern-website-footer-design-examples-practices)
- [Dorik - Best Practices for Website Header Design](https://dorik.com/blog/best-practices-for-website-header-design)
- [Elementor - Webflow Alternatives](https://elementor.com/blog/webflow-alternatives/)
- [DEV Community - 16 Best CMS Platforms 2025](https://dev.to/serveravatar/16-best-cms-platforms-for-websites-in-2025-46co)
- [CodeCanyon - Active eCommerce CMS](https://codecanyon.net/item/active-ecommerce-cms/23471405)
- [JetPack - WordPress Mega Menu Guide](https://jetpack.com/resources/wordpress-mega-menu/)
