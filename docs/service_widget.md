# Service Card Widget - Complete Specification

> **Widget Type:** `service-card`
> **Category:** Commerce
> **Status:** Planned
> **Document Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Current Design Analysis](#current-design-analysis)
3. [2025 Design Trends Research](#2025-design-trends-research)
4. [Card Style Variants](#card-style-variants)
5. [Data Flow Architecture](#data-flow-architecture)
6. [TypeScript Interface](#typescript-interface)
7. [CSS Implementation Examples](#css-implementation-examples)
8. [Implementation Plan](#implementation-plan)
9. [File Structure](#file-structure)

---

## Overview

Service Card Widget হলো একটি dynamic widget যা database থেকে services fetch করে এবং admin-selected visual style এ display করে।

**Key Principle:** Widget শুধু **visual presentation** control করে। Data সব `/admin/services` থেকে আসে।

### Features at a Glance

| Feature | Description |
|---------|-------------|
| **Dynamic Data** | Services from Prisma database via API |
| **6 Card Styles** | Minimal, Elevated, Glassmorphism, Gradient Border, Spotlight, Neon Glow |
| **Hover Effects** | Lift, Glow, Scale, Border Color change |
| **Icon Animations** | Bounce, Rotate, Scale, Pulse |
| **Responsive** | 1-4 columns, mobile-friendly |
| **Filtering** | Category, limit, sort, popular only |

---

## Current Design Analysis

### Existing Implementation

**File:** `src/components/sections/services-grid.tsx`

```
┌─────────────────────────────┐
│  ┌─────┐     [Popular]      │  ← Badge (absolute positioned)
│  │ 📄  │                    │  ← Icon (static, primary/10 bg)
│  └─────┘                    │
│  LLC Formation              │  ← Title
│  Form your US LLC...        │  ← Description (no truncation)
│  From $199        →         │  ← Price + Arrow
└─────────────────────────────┘
```

### Problems with Current Design

| Issue | Description |
|-------|-------------|
| Basic hover | Only shadow + border color change |
| Static icon | No animation on hover |
| Single style | No variety, no customization |
| No glassmorphism | Missing modern 2025 effects |
| Fixed description | No line-clamp control |
| No features preview | Can't show included items |
| Generic design | Looks like 2020 era |

---

## 2025 Design Trends Research

### Research Sources

- [10 Card UI Design Examples That Actually Work in 2025](https://bricxlabs.com/blogs/card-ui-design-examples)
- [Card UI Design Examples and Ideas](https://arounda.agency/blog/card-ui-design-examples-and-ideas)
- [60 CSS Glassmorphism Examples](https://freefrontend.com/css-glassmorphism/)
- [Glassmorphism CSS Generator](https://ui.glass/generator/)
- [CSS Hover Effects: 40 Engaging Animations](https://prismic.io/blog/css-hover-effects)

### Key Trends Summary

| Trend | Description |
|-------|-------------|
| **Glassmorphism** | Frosted glass effect with `backdrop-filter: blur()` (Apple WWDC 2025 "Liquid Glass") |
| **Gradient Borders** | Animated gradient borders on hover using `::before` pseudo-element |
| **Glow Effects** | Subtle `box-shadow` glow matching brand color |
| **Micro-interactions** | Icon bounce, scale, rotate on hover |
| **Progressive Disclosure** | Show more content (features) on hover |
| **Emotion-driven Design** | Warm colors, friendly feel, not clinical |
| **Dark Theme Support** | Premium positioning with dark card variants |

### Visual Hierarchy Techniques (from research)

- **Typography Scale:** Headlines 20-96px, body minimum 16px
- **Separation Methods:** Borders, subtle shadows, rounded corners (8-16px radius)
- **Consistent Spacing:** 4px grid system for padding/margins
- **Full-Card Clickability:** Entire card acts as interactive surface
- **Hover Elevation:** Shadow shifts signaling interactivity

---

## Card Style Variants

### Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  STYLE VARIANTS                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. MINIMAL              2. ELEVATED           3. GLASSMORPHISM     │
│  ┌─────────────┐         ┌─────────────┐       ┌─────────────┐      │
│  │   📄        │         │   📄        │       │ ░░░░░░░░░░░ │      │
│  │   Title     │         │   Title     │       │ ░ 📄 Title ░ │      │
│  │   $199  →   │         │   $199  →   │       │ ░  $199 →  ░ │      │
│  └─────────────┘         └─════════════┘       └─────────────┘      │
│   Clean, flat             Deep shadow           Blur + opacity       │
│                                                                      │
│  4. GRADIENT BORDER      5. SPOTLIGHT          6. NEON GLOW         │
│  ┌┈┈┈┈┈┈┈┈┈┈┈┈┈┐         ┌─────────────┐       ╭─────────────╮      │
│  ┊   📄        ┊         │ ◉ 📄        │       │   📄        │══    │
│  ┊   Title     ┊         │   Title     │       │   Title     │      │
│  ┊   $199  →   ┊         │   $199  →   │       │   $199  →   │      │
│  └┈┈┈┈┈┈┈┈┈┈┈┈┈┘         └─────────────┘       ╰─────────────╯      │
│   Animated border         Cursor spotlight      Glowing border       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Style Descriptions

| Style | Description | Best For |
|-------|-------------|----------|
| **minimal** | Clean, flat design with subtle border | Professional, corporate |
| **elevated** | Deep shadow, lifted feel | Trust, premium feel |
| **glassmorphism** | Frosted glass with backdrop blur | Modern, trendy |
| **gradient-border** | Animated gradient border on hover | Eye-catching, premium |
| **spotlight** | Light follows cursor on hover | Interactive, engaging |
| **neon-glow** | Glowing border/shadow effect | Bold, tech-forward |

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCE                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Database (Prisma)                                                  │
│   └── Services Table                                                 │
│       ├── id, name, slug                                            │
│       ├── description, shortDescription                             │
│       ├── price, originalPrice                                      │
│       ├── icon, category                                            │
│       ├── isPopular, isActive                                       │
│       └── features[], packages[]                                    │
│                                                                      │
│                    ↓ API Call                                        │
│                                                                      │
│   GET /api/services?category=formation&limit=8&popular=true         │
│                                                                      │
│                    ↓                                                 │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  SERVICE CARD WIDGET (Page Builder)                          │   │
│   │                                                              │   │
│   │  Settings Panel (Admin controls):                            │   │
│   │  ┌───────────────────────────────────────────────────────┐  │   │
│   │  │ Data Source: [Dynamic ▼]                              │  │   │
│   │  │ Category Filter: [All] [Formation] [Amazon] [Tax]     │  │   │
│   │  │ Limit: [8]                                            │  │   │
│   │  │ Sort By: [Popular ▼]                                  │  │   │
│   │  │ ─────────────────────────────────────────────────────│  │   │
│   │  │ Card Style: [Elevated ▼]                              │  │   │
│   │  │ Columns: [4]                                          │  │   │
│   │  │ Icon Animation: [Bounce ▼]                            │  │   │
│   │  │ Hover Effect: [Glow ▼]                                │  │   │
│   │  └───────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│                    ↓ Renders                                         │
│                                                                      │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│   │ LLC     │ │ EIN     │ │ Amazon  │ │ Brand   │                   │
│   │ $199    │ │ $99     │ │ $349    │ │ $299    │                   │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Admin Experience Summary

Admin শুধু control করে:

1. **কোন services দেখাবে** - Category filter, limit, sort
2. **কিভাবে দেখাবে** - Card style, columns, colors
3. **কি কি দেখাবে** - Icon, description, price, badge, features

**Data entry করতে হবে না!** সব `/admin/services` থেকে আসবে।

---

## TypeScript Interface

### Main Widget Settings

```typescript
interface ServiceCardWidgetSettings {
  // === DATA FILTERS (FROM DATABASE) ===
  filters: {
    categories: string[];           // ["formation", "amazon", "compliance", "tax-finance"]
    limit: number;                  // 4, 6, 8, 12
    sortBy: "popular" | "price-asc" | "price-desc" | "name";
    popularOnly: boolean;
    activeOnly: boolean;            // Default: true
  };

  // === CARD STYLE ===
  cardStyle:
    | "minimal"           // Clean, flat design
    | "elevated"          // Deep shadow, lifted feel
    | "glassmorphism"     // Frosted glass effect
    | "gradient-border"   // Animated gradient border
    | "spotlight"         // Hover spotlight effect
    | "neon-glow";        // Glowing border effect

  // === LAYOUT ===
  layout: {
    columns: 1 | 2 | 3 | 4;
    gap: number;                    // Gap in pixels (16, 20, 24, 32)
    cardAlignment: "stretch" | "start" | "center";
  };

  // === ICON SETTINGS ===
  icon: {
    show: boolean;
    style: "rounded" | "circle" | "square" | "gradient-bg" | "outline";
    size: "sm" | "md" | "lg";
    position: "top-left" | "top-center" | "inline";
    backgroundColor?: string;
    iconColor?: string;
    hoverAnimation: "none" | "bounce" | "rotate" | "scale" | "shake" | "pulse";
  };

  // === CONTENT DISPLAY ===
  content: {
    showDescription: boolean;
    descriptionLines: 1 | 2 | 3;    // Line clamp
    showPrice: boolean;
    pricePosition: "bottom" | "top-right" | "badge";
    showBadge: boolean;             // "Popular" badge
    badgePosition: "top-right" | "top-left" | "inline";
    showFeatures: boolean;          // Quick feature list
    maxFeatures: 2 | 3 | 4;
    showCategory: boolean;
    showArrow: boolean;
  };

  // === HOVER EFFECTS ===
  hover: {
    effect: "none" | "lift" | "glow" | "border-color" | "scale";
    iconEffect: "none" | "invert" | "scale" | "bounce";
    transitionDuration: number;     // ms (200, 300, 400)
    glowColor?: string;
  };

  // === COLORS (Optional overrides) ===
  colors: {
    cardBackground?: string;
    borderColor?: string;
    titleColor?: string;
    descriptionColor?: string;
    priceColor?: string;
    hoverBorderColor?: string;
    gradientFrom?: string;          // For gradient border
    gradientTo?: string;
    gradientVia?: string;           // Middle color for gradient
  };

  // === BORDER & RADIUS ===
  borderRadius: number;             // 8, 12, 16, 20, 24
  borderWidth: number;              // 0, 1, 2

  // === RESPONSIVE ===
  responsive: {
    tablet: {
      columns: 1 | 2 | 3;
    };
    mobile: {
      columns: 1 | 2;
    };
  };
}
```

### Default Settings

```typescript
const DEFAULT_SERVICE_CARD_SETTINGS: ServiceCardWidgetSettings = {
  filters: {
    categories: [],                 // All categories
    limit: 8,
    sortBy: "popular",
    popularOnly: false,
    activeOnly: true,
  },
  cardStyle: "elevated",
  layout: {
    columns: 4,
    gap: 24,
    cardAlignment: "stretch",
  },
  icon: {
    show: true,
    style: "rounded",
    size: "md",
    position: "top-left",
    hoverAnimation: "scale",
  },
  content: {
    showDescription: true,
    descriptionLines: 2,
    showPrice: true,
    pricePosition: "bottom",
    showBadge: true,
    badgePosition: "top-right",
    showFeatures: false,
    maxFeatures: 3,
    showCategory: false,
    showArrow: true,
  },
  hover: {
    effect: "lift",
    iconEffect: "scale",
    transitionDuration: 200,
  },
  colors: {},
  borderRadius: 12,
  borderWidth: 1,
  responsive: {
    tablet: { columns: 2 },
    mobile: { columns: 1 },
  },
};
```

---

## CSS Implementation Examples

### Style 1: Minimal

```css
.service-card-minimal {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  transition: border-color 0.2s ease;
}

.service-card-minimal:hover {
  border-color: hsl(var(--primary));
}
```

### Style 2: Elevated

```css
.service-card-elevated {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.service-card-elevated:hover {
  border-color: hsl(var(--primary));
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 6px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
```

### Style 3: Glassmorphism

```css
.service-card-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.service-card-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Dark mode variant */
.dark .service-card-glass {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}
```

### Style 4: Gradient Border

```css
.service-card-gradient-border {
  position: relative;
  background: hsl(var(--card));
  border-radius: 12px;
  z-index: 1;
}

.service-card-gradient-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg,
    hsl(var(--primary)),
    #ec4899,
    #8b5cf6,
    hsl(var(--primary))
  );
  background-size: 300% 300%;
  border-radius: 14px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card-gradient-border:hover::before {
  opacity: 1;
  animation: gradient-rotate 3s ease infinite;
}

@keyframes gradient-rotate {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### Style 5: Spotlight

```css
.service-card-spotlight {
  position: relative;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.service-card-spotlight::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    hsla(var(--primary), 0.15) 0%,
    transparent 70%
  );
  transform: translate(
    calc(var(--mouse-x, 0) - 100px),
    calc(var(--mouse-y, 0) - 100px)
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.service-card-spotlight:hover::after {
  opacity: 1;
}

.service-card-spotlight:hover {
  border-color: hsl(var(--primary));
}
```

### Style 6: Neon Glow

```css
.service-card-neon {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  transition: all 0.3s ease;
}

.service-card-neon:hover {
  border-color: hsl(var(--primary));
  box-shadow:
    0 0 20px hsla(var(--primary), 0.3),
    0 0 40px hsla(var(--primary), 0.2),
    0 0 60px hsla(var(--primary), 0.1);
}
```

### Icon Hover Animations

```css
/* Bounce */
@keyframes icon-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.icon-bounce:hover .icon {
  animation: icon-bounce 0.5s ease infinite;
}

/* Rotate */
.icon-rotate:hover .icon {
  transform: rotate(10deg);
  transition: transform 0.2s ease;
}

/* Scale */
.icon-scale:hover .icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Shake */
@keyframes icon-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
.icon-shake:hover .icon {
  animation: icon-shake 0.3s ease infinite;
}

/* Pulse */
@keyframes icon-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.icon-pulse:hover .icon {
  animation: icon-pulse 1s ease infinite;
}
```

---

## Implementation Plan

### Phase 1: Core Structure (Day 1)

- [ ] Add `service-card` to widget types (`types.ts`)
- [ ] Create widget registration (`register-widgets.ts`)
- [ ] Create default settings (`defaults.ts`)
- [ ] Create base widget component (`service-card-widget.tsx`)
- [ ] Implement API route for fetching services

### Phase 2: Card Styles (Day 2)

- [ ] Implement `minimal` style
- [ ] Implement `elevated` style
- [ ] Implement `glassmorphism` style
- [ ] Implement `gradient-border` style
- [ ] Implement `spotlight` style (with mouse tracking)
- [ ] Implement `neon-glow` style

### Phase 3: Settings Panel (Day 3)

- [ ] Create settings panel component
- [ ] Data filters section (categories, limit, sort)
- [ ] Card style selector with preview
- [ ] Layout controls (columns, gap)
- [ ] Icon settings
- [ ] Content display toggles
- [ ] Hover effects configuration

### Phase 4: Animations & Polish (Day 4)

- [ ] Icon hover animations
- [ ] Card hover effects
- [ ] Responsive behavior
- [ ] Dark mode support
- [ ] Loading states
- [ ] Error handling

### Phase 5: Testing & Documentation (Day 5)

- [ ] Test all card styles
- [ ] Test responsive breakpoints
- [ ] Test with different service data
- [ ] Performance optimization
- [ ] Update WIDGET_SLOT_SYSTEM.md

---

## File Structure

```
src/
├── lib/
│   └── page-builder/
│       ├── types.ts                    # Add ServiceCardWidgetSettings
│       ├── defaults.ts                 # Add DEFAULT_SERVICE_CARD_SETTINGS
│       └── register-widgets.ts         # Register service-card widget
│
├── components/
│   └── page-builder/
│       ├── widgets/
│       │   └── commerce/
│       │       └── service-card-widget.tsx    # Main widget component
│       │
│       └── settings/
│           └── service-card-settings-panel.tsx # Settings panel
│
└── app/
    └── api/
        └── services/
            └── route.ts               # API for fetching services (if not exists)
```

---

## Changelog

### v1.0 (2026-01-13)
- Initial specification document
- 6 card style variants defined
- TypeScript interfaces created
- CSS implementation examples
- Implementation plan outlined

---

*Document maintained by: Development Team*
*Last updated: 2026-01-13*
