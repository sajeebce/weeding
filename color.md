# LLCPad Brand Design System
## "Midnight Orange" - Bizee-Inspired Clean Design

---

## Executive Summary

LLCPad adopts a **clean, minimal, high-contrast** design inspired by Bizee - using only **3 core colors** for maximum clarity and professional appeal.

---

## The Palette: "Midnight Orange"

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Dark** | Midnight | `#0A0F1E` | Hero bg, Footer bg |
| **Light** | White | `#FFFFFF` | Content sections, Cards |
| **Accent** | Orange | `#F97316` | CTAs, Buttons, Links, Highlights |

### Why This Palette?

- **Bizee-proven** - Clean, professional, converts well
- **High contrast** - Easy to read, accessible
- **Minimal** - No color confusion, clear hierarchy
- **Trust** - Dark = authority, Orange = action/energy

---

## Core Color Tokens

### Primary: Midnight (Dark Sections)
```
┌─────────────────────────────────────────────────────────────┐
│  MIDNIGHT SCALE                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  midnight-950  #0A0F1E  ████████  Hero bg, Footer bg   ⭐   │
│  midnight-900  #111827  ████████  Darker elements          │
│  midnight-800  #1E2642  ████████  Cards on dark bg         │
│  midnight-700  #2D3A5C  ████████  Borders on dark          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Accent: Orange (All CTAs & Highlights)
```
┌─────────────────────────────────────────────────────────────┐
│  ORANGE SCALE                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  orange-600   #EA580C  ████████  Hover state               │
│  orange-500   #F97316  ████████  Primary CTA button    ⭐   │
│  orange-400   #FB923C  ████████  Light accent              │
│  orange-100   #FFEDD5  ████████  Light backgrounds         │
│  orange-50    #FFF7ED  ████████  Subtle highlights         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Neutrals: Slate (Content & UI)
```
┌─────────────────────────────────────────────────────────────┐
│  SLATE SCALE                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  slate-900  #0F172A  ████████  Headings (light bg)         │
│  slate-800  #1E293B  ████████  Body text (light bg)        │
│  slate-600  #475569  ████████  Secondary text              │
│  slate-500  #64748B  ████████  Muted text                  │
│  slate-400  #94A3B8  ████████  Muted text (dark bg)        │
│  slate-300  #CBD5E1  ████████  Borders                     │
│  slate-200  #E2E8F0  ████████  Dividers                    │
│  slate-100  #F1F5F9  ████████  Light backgrounds           │
│  slate-50   #F8FAFC  ████████  Lightest surface            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Semantic Colors (Minimal Use)
```
┌─────────────────────────────────────────────────────────────┐
│  SEMANTIC TOKENS                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SUCCESS   #22C55E  (green-500)  - Checkmarks, success     │
│  WARNING   #F59E0B  (amber-500)  - Alerts                  │
│  ERROR     #EF4444  (red-500)    - Errors                  │
│  STAR      #FBBF24  (amber-400)  - Rating stars only       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Page Layout Color Application

### Overview
```
┌─────────────────────────────────────────────────────────────┐
│  ANNOUNCEMENT BAR (optional)                                │
│  Background: #7C2D12 (brown/copper) or #F97316 (orange)    │
│  Text: #FFFFFF                                              │
├─────────────────────────────────────────────────────────────┤
│  HEADER                                                     │
│  Background: #FFFFFF (scrolled) or transparent (on hero)   │
│  Nav Links: #1E293B                                         │
│  CTA Button: #F97316 bg, #FFFFFF text                      │
├─────────────────────────────────────────────────────────────┤
│  HERO SECTION                                    ← DARK    │
│  Background: #0A0F1E                                        │
│  Title: #FFFFFF                                             │
│  Subtitle: #94A3B8                                          │
│  CTA Button: #F97316 bg, #FFFFFF text                      │
│  Secondary Button: transparent, #FFFFFF border             │
├─────────────────────────────────────────────────────────────┤
│  CONTENT SECTIONS                                ← LIGHT   │
│  Background: #FFFFFF or #F8FAFC (alternating)              │
│  Headings: #0F172A                                          │
│  Body text: #1E293B                                         │
│  Links/Accents: #F97316                                     │
├─────────────────────────────────────────────────────────────┤
│  FOOTER                                          ← DARK    │
│  Background: #0A0F1E                                        │
│  Headings: #FFFFFF                                          │
│  Links: #94A3B8 → #FFFFFF on hover                         │
│  CTA Button: #F97316                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. HEADER

### Light Header (Default/Scrolled)
```
┌─────────────────────────────────────────────────────────────┐
│  Background: #FFFFFF                                        │
│  Shadow: 0 1px 3px rgba(0,0,0,0.1)                         │
│  Border Bottom: 1px #E2E8F0                                │
│                                                             │
│  Logo: Full color                                           │
│  Nav Links: #1E293B                                         │
│  Nav Hover: #F97316                                         │
│  Nav Active: #F97316 with underline                        │
│                                                             │
│  Login Button: transparent, #1E293B text                   │
│  CTA Button: #F97316 bg, #FFFFFF text, rounded-full        │
│  CTA Hover: #EA580C bg                                      │
└─────────────────────────────────────────────────────────────┘
```

### Transparent Header (On Dark Hero)
```
┌─────────────────────────────────────────────────────────────┐
│  Background: transparent                                    │
│                                                             │
│  Logo: White version                                        │
│  Nav Links: #FFFFFF                                         │
│  Nav Hover: #F97316                                         │
│                                                             │
│  Login Button: transparent, #FFFFFF text                   │
│  CTA Button: #F97316 bg, #FFFFFF text                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. HERO SECTION

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  DARK HERO (Like Bizee announcement area extended)         │
│  ══════════════════════════════════════════════            │
│                                                             │
│  Background: #0A0F1E                                        │
│                                                             │
│  Optional decorative:                                       │
│  ├── Subtle grid pattern at 3% opacity                     │
│  └── No gradient orbs (keep it clean)                      │
│                                                             │
│  Content:                                                   │
│  ├── Badge (optional):                                     │
│  │   └── #F97316/20 bg, #F97316 text                      │
│  │                                                          │
│  ├── Headline: #FFFFFF                                      │
│  │   └── Key word highlighted: #F97316                     │
│  │   └── Example: "Start Your Business With Confidence"   │
│  │                              ^^^^^^^^^^^ orange         │
│  │                                                          │
│  ├── Subheadline: #94A3B8                                  │
│  │                                                          │
│  ├── Form Card (Bizee-style):                              │
│  │   ├── Background: #FFFFFF                               │
│  │   ├── Border-radius: 12px                               │
│  │   ├── Shadow: 0 20px 40px rgba(0,0,0,0.2)              │
│  │   ├── Labels: #1E293B                                   │
│  │   ├── Inputs: Standard styling                          │
│  │   └── CTA: #F97316 bg, #FFFFFF text                    │
│  │       └── "START MY BUSINESS"                           │
│  │                                                          │
│  └── Trust text below:                                     │
│      └── #94A3B8 with #F97316 highlights                  │
│      └── "Founder Led Since 2004. 1,000,000+ Served!"     │
│                      ^^^^         ^^^^^^^^^^ orange        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. CONTENT SECTIONS (Light Background)

### Services / Features Section
```
┌─────────────────────────────────────────────────────────────┐
│  Background: #FFFFFF or #F8FAFC                            │
│                                                             │
│  Section Header:                                            │
│  ├── Eyebrow: #F97316 (optional)                           │
│  ├── Title: #0F172A                                        │
│  └── Subtitle: #64748B                                     │
│                                                             │
│  Service Cards:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Background: #FFFFFF                                 │   │
│  │  Border: 1px #E2E8F0                                 │   │
│  │  Border Radius: 8px                                  │   │
│  │  Shadow: 0 1px 3px rgba(0,0,0,0.05)                 │   │
│  │                                                      │   │
│  │  Icon: #F97316                                       │   │
│  │  Title: #0F172A                                      │   │
│  │  Description: #64748B                                │   │
│  │  Price: #F97316 (prominent)                          │   │
│  │  Arrow: #64748B → #F97316 on hover                  │   │
│  │                                                      │   │
│  │  HOVER:                                              │   │
│  │  ├── Border: 1px #F97316                            │   │
│  │  └── Shadow: 0 4px 12px rgba(249,115,22,0.15)       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Tabs (Entity selector like Bizee):                        │
│  ├── Container: #F1F5F9 bg, rounded-full                   │
│  ├── Active: #F97316 bg, #FFFFFF text                     │
│  └── Inactive: transparent, #64748B text                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pricing Section
```
┌─────────────────────────────────────────────────────────────┐
│  Background: #FFFFFF                                        │
│                                                             │
│  State Selector:                                            │
│  ├── Background: #FFFFFF                                   │
│  ├── Border: 1px #E2E8F0                                   │
│  └── Focus: #F97316 border                                 │
│                                                             │
│  Pricing Cards:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  BASIC                                               │   │
│  │  ├── Background: #FFFFFF                            │   │
│  │  ├── Border: 1px #E2E8F0                            │   │
│  │  ├── Title: #0F172A                                 │   │
│  │  ├── Price: #0F172A                                 │   │
│  │  ├── Checkmarks: #22C55E (green)                    │   │
│  │  └── CTA: #0F172A outline                           │   │
│  │                                                      │   │
│  │  STANDARD (Recommended) ⭐                           │   │
│  │  ├── Border: 2px #F97316                            │   │
│  │  ├── Ribbon: "Most Popular" #F97316 bg             │   │
│  │  ├── Price: #F97316                                 │   │
│  │  ├── Checkmarks: #22C55E                            │   │
│  │  └── CTA: #F97316 solid                             │   │
│  │                                                      │   │
│  │  PREMIUM                                             │   │
│  │  ├── Background: #0A0F1E                            │   │
│  │  ├── Title: #FFFFFF                                 │   │
│  │  ├── Price: #F97316                                 │   │
│  │  ├── Checkmarks: #22C55E                            │   │
│  │  └── CTA: #F97316 solid                             │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Testimonials
```
┌─────────────────────────────────────────────────────────────┐
│  Background: #F8FAFC                                        │
│                                                             │
│  Card:                                                      │
│  ├── Background: #FFFFFF                                   │
│  ├── Border: 1px #E2E8F0                                   │
│  ├── Quote: #0F172A                                        │
│  ├── Stars: #FBBF24 (amber-400)                           │
│  ├── Name: #0F172A                                         │
│  └── Title: #64748B                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. FOOTER

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  MAIN FOOTER                                                │
│  Background: #0A0F1E                                        │
│                                                             │
│  Logo: White version                                        │
│  Tagline: #94A3B8                                          │
│                                                             │
│  Social Icons:                                              │
│  ├── Default: #64748B                                      │
│  └── Hover: #F97316                                        │
│                                                             │
│  Column Titles: #FFFFFF                                    │
│  Links: #94A3B8                                            │
│  Link Hover: #FFFFFF                                       │
│                                                             │
│  Newsletter:                                                │
│  ├── Input bg: #1E2642                                     │
│  ├── Input border: #334155                                 │
│  ├── Input focus: #F97316                                  │
│  └── Button: #F97316 bg                                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  BOTTOM BAR                                                 │
│  Background: #050810                                        │
│  Copyright: #64748B                                         │
│  Legal links: #94A3B8                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. BUTTONS

### Primary CTA (Bizee Style)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────┐                       │
│  │     START MY BUSINESS           │  ← Bizee button       │
│  └─────────────────────────────────┘                       │
│                                                             │
│  Specs:                                                     │
│  ├── Background: #F97316                                   │
│  ├── Text: #FFFFFF                                         │
│  ├── Font: 14-16px, font-medium, uppercase                 │
│  ├── Padding: 12px 24px                                    │
│  ├── Border-radius: 6px (or rounded-full for pills)       │
│  ├── Shadow: none or subtle                                │
│  │                                                          │
│  ├── Hover:                                                │
│  │   ├── Background: #EA580C                               │
│  │   └── Transform: none (clean, no scale)                │
│  │                                                          │
│  └── Active: #C2410C                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Secondary Button
```
┌─────────────────────────────────────────────────────────────┐
│  Background: transparent                                    │
│  Border: 1px #1E293B                                       │
│  Text: #1E293B                                             │
│  Hover: #F8FAFC bg                                         │
└─────────────────────────────────────────────────────────────┘
```

### Ghost Button (On Dark)
```
┌─────────────────────────────────────────────────────────────┐
│  Background: transparent                                    │
│  Border: 1px #FFFFFF/30                                    │
│  Text: #FFFFFF                                             │
│  Hover: #FFFFFF/10 bg                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. FORM ELEMENTS

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  INPUT FIELDS                                               │
│  ├── Background: #FFFFFF                                   │
│  ├── Border: 1px #E2E8F0                                   │
│  ├── Border-radius: 6px                                    │
│  ├── Text: #0F172A                                         │
│  ├── Placeholder: #94A3B8                                  │
│  ├── Focus Border: #F97316                                 │
│  ├── Focus Ring: #F97316/20                                │
│  └── Error Border: #EF4444                                 │
│                                                             │
│  CHECKBOXES & RADIOS                                        │
│  ├── Unchecked: #E2E8F0 border                             │
│  ├── Checked: #F97316 bg, #FFFFFF checkmark                │
│  └── Focus: Ring #F97316/30                                │
│                                                             │
│  SELECT/DROPDOWN                                            │
│  ├── Same as input                                         │
│  ├── Option hover: #FFF7ED (orange-50)                     │
│  └── Option selected: #F97316/10 bg                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. CSS VARIABLES

```css
:root {
  /* Dark (Hero, Footer) */
  --color-midnight: #0A0F1E;
  --color-midnight-light: #1E2642;

  /* Accent (All CTAs) */
  --color-orange: #F97316;
  --color-orange-hover: #EA580C;
  --color-orange-light: #FFF7ED;

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-slate-50: #F8FAFC;
  --color-slate-100: #F1F5F9;
  --color-slate-200: #E2E8F0;
  --color-slate-400: #94A3B8;
  --color-slate-500: #64748B;
  --color-slate-800: #1E293B;
  --color-slate-900: #0F172A;

  /* Semantic (minimal use) */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-star: #FBBF24;

  /* Theme */
  --color-primary: #F97316;
  --color-primary-foreground: #FFFFFF;
  --color-background: #FFFFFF;
  --color-foreground: #0F172A;
}
```

---

## 8. TAILWIND CONFIG

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#0A0F1E',
          light: '#1E2642',
        },
        brand: {
          orange: {
            DEFAULT: '#F97316',
            hover: '#EA580C',
            light: '#FFF7ED',
          },
        },
      },
    },
  },
}
```

---

## Summary

| Element | Color |
|---------|-------|
| Hero Background | `#0A0F1E` |
| Footer Background | `#0A0F1E` |
| Content Background | `#FFFFFF` / `#F8FAFC` |
| All CTA Buttons | `#F97316` |
| CTA Hover | `#EA580C` |
| Headings (light bg) | `#0F172A` |
| Body text (light bg) | `#1E293B` |
| Text on dark | `#FFFFFF` / `#94A3B8` |
| Links | `#F97316` |
| Checkmarks | `#22C55E` |
| Stars | `#FBBF24` |

**Simple. Clean. Converts.**
Bizee Button বানাতে যা করতে হবে:
Settings:

bgColor: #F97316 (orange-500)
hoverBgColor: #EA580C (orange-600)
textColor: #FFFFFF
borderRadius: 24 (rounded-full জন্য)
borderWidth: 0
hoverEffect: "darken" বা "none"
এই settings দিয়ে Admin → Appearance → Header বা Footer এ গিয়ে CTA button এ apply করলেই Bizee style button পাবেন।