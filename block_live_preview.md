# Landing Page Builder - Elementor-Style Redesign Specification

## Table of Contents
1. [Current Problems](#current-problems)
2. [Elementor Design Analysis](#elementor-design-analysis)
3. [Proposed Two-Panel Layout](#proposed-two-panel-layout)
4. [Block Browser Panel (Browse Mode)](#block-browser-panel-browse-mode)
5. [Block Settings Panel (Edit Mode) - Elementor Style](#block-settings-panel-edit-mode---elementor-style)
6. [Live Preview Canvas](#live-preview-canvas)
7. [State Management Flow](#state-management-flow)
8. [Component Specifications](#component-specifications)
9. [Implementation Phases](#implementation-phases)

---

## Current Problems

### 1. Three-Column Layout Issues
```
┌──────────────┬──────────────────┬──────────────┐
│ Block Browser│   Page Blocks    │ Block Settings│
│   (Left)     │    (Middle)      │   (Right)    │
└──────────────┴──────────────────┴──────────────┘
```
- User এর attention তিন জায়গায় split হচ্ছে
- Cognitive load বেশি
- Screen space inefficient ব্যবহার

### 2. No Live Preview
- Settings change করলে real-time দেখা যায় না
- "Preview" button এ click করতে হয়
- Edit-Preview cycle slow

### 3. Cluttered Settings Panel
- Right sidebar cramped
- Multiple tabs (Layout, Content, Trust, Style) overwhelming
- Settings hierarchy unclear

---

## Elementor Design Analysis

### Key Design Principles from Elementor

#### 1. Two-Panel Architecture
```
┌─────────────────┬─────────────────────────────────────────┐
│                 │                                         │
│   LEFT PANEL    │           LIVE PREVIEW                  │
│   (Dynamic)     │           (Full Width)                  │
│   ~320-360px    │           Remaining Space               │
│                 │                                         │
└─────────────────┴─────────────────────────────────────────┘
```

#### 2. Context-Aware Left Panel
- **Browse Mode**: Widget/Block library দেখায়
- **Edit Mode**: Selected block এর settings দেখায়
- Smooth transition between modes

#### 3. Settings Panel Structure (From Screenshot Analysis)

```
┌─────────────────────────────────────────┐
│         HEADER BAR                      │
│  ┌─────┐                                │
│  │ ← X │  Edit Text Editor              │  ← Back/Close + Block Name
│  └─────┘                                │
├─────────────────────────────────────────┤
│                                         │
│     ✏️           ◐           ⚙️        │
│   Content      Style      Advanced      │  ← Horizontal Icon Tabs
│     ───                                 │     (Active = underline)
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ▼ Text Editor            ✨ Edit with AI│  ← Accordion Section
│  ─────────────────────────────────────  │     + AI Action Button
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 🎨 Add Media    [Visual][Code] ≡   ││  ← Toolbar Row
│  ├─────────────────────────────────────┤│
│  │ Paragraph ▼     B  I  U            ││  ← Formatting Bar
│  │ ≡  ≡  🔗  ⤢  ⌨                    ││
│  ├─────────────────────────────────────┤│
│  │                                     ││
│  │  Lorem ipsum dolor sit amet,       ││  ← Rich Text Editor
│  │  consectetur adipiscing elit...    ││
│  │                                     ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Drop Cap                    ○────      │  ← Toggle Options
│                                Off      │
│                                         │
│  Columns      🖥️     [Default     ▼]   │  ← Responsive + Dropdown
│                                         │
│  Columns Gap  🖥️              px ▼     │  ← Unit Selector
│                                         │
└─────────────────────────────────────────┘
```

#### 4. Key UI Patterns from Elementor

| Pattern | Description |
|---------|-------------|
| **Icon Tabs** | Content/Style/Advanced as icons with labels |
| **Accordion Sections** | Collapsible groups for related settings |
| **Responsive Indicators** | 🖥️ icon shows which settings are responsive |
| **Toggle Switches** | On/Off for boolean options |
| **Dropdown Selects** | For predefined options |
| **Color Pickers** | Inline color selection |
| **Unit Selectors** | px, em, %, vh dropdown |
| **AI Integration** | "Edit with AI" contextual button |
| **Visual/Code Toggle** | For rich text content |

---

## Proposed Two-Panel Layout

### Main Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────┐                                                                  │
│  │ ≡  │  Landing Page Builder    📱 💻    👁️ Preview   💾 Save         │
│  └────┘  ─── Homepage                                                    │
├──────────────────┬───────────────────────────────────────────────────────┤
│                  │                                                       │
│                  │                                                       │
│   LEFT PANEL     │              LIVE PREVIEW CANVAS                      │
│   (360px)        │              (Fluid Width)                            │
│                  │                                                       │
│   Dynamic:       │              - Real-time updates                      │
│   - Browse Mode  │              - Interactive blocks                     │
│   - Edit Mode    │              - Responsive preview                     │
│   - Layers Mode  │              - In-canvas editing                      │
│                  │                                                       │
│                  │                                                       │
│                  │                                                       │
└──────────────────┴───────────────────────────────────────────────────────┘
```

---

## Block Browser Panel (Browse Mode)

### When No Block is Selected

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Blocks  │ │ Layers  │ │ Global  │   │  ← Top Navigation
│  │  ███    │ │   ≡     │ │   ⚙️    │   │
│  └────┬────┘ └─────────┘ └─────────┘   │
│       │                                 │
├───────┴─────────────────────────────────┤
│                                         │
│  🔍 Search blocks...                    │  ← Search Input
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ▼ Hero                            (4)  │  ← Category Accordion
│  ┌─────────────────────────────────────┐│
│  │ ┌───────┐  ┌───────┐  ┌───────┐    ││
│  │ │  📐   │  │  ◧    │  │  📊   │    ││  ← Block Grid (2-3 cols)
│  │ │Centered│  │ Split │  │ Dash  │    ││
│  │ └───────┘  └───────┘  └───────┘    ││
│  │ ┌───────┐                          ││
│  │ │  ─    │                          ││
│  │ │Minimal│                          ││
│  │ └───────┘                          ││
│  └─────────────────────────────────────┘│
│                                         │
│  ▶ Content                         (6)  │  ← Collapsed Category
│                                         │
│  ▶ Social Proof                    (4)  │
│                                         │
│  ▶ CTA                             (3)  │
│                                         │
│  ▶ Media                           (4)  │
│                                         │
│  ▶ Forms                           (2)  │
│                                         │
└─────────────────────────────────────────┘
```

### Block Card Design

```
┌─────────────────┐
│                 │
│    [Preview     │  ← Thumbnail/Icon (60x60)
│     Image]      │
│                 │
├─────────────────┤
│   Block Name    │  ← Label (12-14px)
└─────────────────┘

Hover State:
┌─────────────────┐
│  ╔═══════════╗  │
│  ║  Preview  ║  │  ← Blue border highlight
│  ║   Image   ║  │
│  ╚═══════════╝  │
├─────────────────┤
│   Block Name    │
│   ───────────   │  ← Underline on hover
└─────────────────┘
```

---

## Block Settings Panel (Edit Mode) - Elementor Style

### Complete Settings Panel Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  ← Back          Hero - Centered    ⋮   │  ← Header: Back + Name + Menu
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    ┌──────┐   ┌──────┐   ┌──────┐      │
│    │  ✏️  │   │  ◐   │   │  ⚙️  │      │  ← Icon Tabs (Horizontal)
│    │      │   │      │   │      │      │
│    │Content│  │Style │   │Adv.  │      │
│    └──┬───┘   └──────┘   └──────┘      │
│       │                                 │
│    ═══╧═══                              │  ← Active Tab Indicator
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ▼ Headline                             │  ← Accordion Section Header
│  ─────────────────────────────────────  │
│                                         │
│  Text                                   │
│  ┌─────────────────────────────────────┐│
│  │ Start Your US LLC Today            ││  ← Text Input
│  └─────────────────────────────────────┘│
│                                         │
│  HTML Tag                               │
│  ┌─────────────────────────────────────┐│
│  │ H1                              ▼  ││  ← Dropdown Select
│  └─────────────────────────────────────┘│
│                                         │
│  Alignment                    🖥️        │  ← Responsive Indicator
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ≡≡≡ │ │ ≡≡≡ │ │ ≡≡≡ │ │ ≡≡≡ │       │  ← Icon Button Group
│  │Left │ │Center│ │Right│ │Just.│       │     (Left/Center/Right/Justify)
│  └─────┘ └──┬──┘ └─────┘ └─────┘       │
│             │                           │
│           ══╧══                         │  ← Selected Indicator
│                                         │
│  ─────────────────────────────────────  │  ← Section Divider
│                                         │
│  ▼ Subheadline                          │
│  ─────────────────────────────────────  │
│                                         │
│  Text                     ✨ Edit with AI│  ← AI Button (contextual)
│  ┌─────────────────────────────────────┐│
│  │ Form your company in minutes with  ││
│  │ our expert guidance and support... ││  ← Textarea
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Primary Button                       │
│  ─────────────────────────────────────  │
│                                         │
│  Text                                   │
│  ┌─────────────────────────────────────┐│
│  │ Get Started                        ││
│  └─────────────────────────────────────┘│
│                                         │
│  Link                                   │
│  ┌─────────────────────────────────────┐│
│  │ /services/llc-formation       🔗   ││  ← Link Input with Icon
│  └─────────────────────────────────────┘│
│                                         │
│  Open in New Tab              ○────     │  ← Toggle Switch
│                                  Off    │
│                                         │
│  Icon                                   │
│  ┌───────┐ ┌───────────────────────────┐│
│  │  →    │ │ ArrowRight           ▼   ││  ← Icon Picker
│  └───────┘ └───────────────────────────┘│
│                                         │
│  Icon Position                          │
│  ┌───────────┐ ┌───────────┐           │
│  │  ◀ Before │ │ After ▶  │           │  ← Toggle Buttons
│  └───────────┘ └─────┬─────┘           │
│                      │                  │
│                    ══╧══                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▶ Secondary Button (collapsed)         │
│                                         │
│  ▶ Trust Badges (collapsed)             │
│                                         │
│  ▶ Background Media (collapsed)         │
│                                         │
└─────────────────────────────────────────┘
```

### Style Tab Content

```
┌─────────────────────────────────────────┐
│                                         │
│  ← Back          Hero - Centered    ⋮   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    ┌──────┐   ┌──────┐   ┌──────┐      │
│    │  ✏️  │   │  ◐   │   │  ⚙️  │      │
│    │      │   │      │   │      │      │
│    │Content│  │Style │   │Adv.  │      │
│    └──────┘   └──┬───┘   └──────┘      │
│                  │                      │
│               ═══╧═══                   │  ← Style Tab Active
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ▼ Background                           │
│  ─────────────────────────────────────  │
│                                         │
│  Background Type                        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ 🎨  │ │ 🌈  │ │ 🖼️  │ │ 🎬  │       │
│  │Color│ │Grad.│ │Image│ │Video│       │
│  └─────┘ └──┬──┘ └─────┘ └─────┘       │
│             │                           │
│           ══╧══                         │  ← Gradient Selected
│                                         │
│  Gradient                               │
│  ┌─────────────────────────────────────┐│
│  │ ○──────────────●────────────────○  ││  ← Gradient Bar
│  │ #FF6B00      #FF8533      #FFB366  ││
│  └─────────────────────────────────────┘│
│                                         │
│  Angle                                  │
│  ┌─────────────────────────────────────┐│
│  │ ○─────────────────────●             ││  ← Slider
│  │                              135°   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Headline Style                       │
│  ─────────────────────────────────────  │
│                                         │
│  Text Color                             │
│  ┌──────┐ ┌─────────────────────────────┐
│  │██████│ │ #FFFFFF                 🎨 ││  ← Color Picker
│  │White │                              ││
│  └──────┘ └─────────────────────────────┘
│                                         │
│  Typography                      🖥️     │
│  ┌─────────────────────────────────────┐│
│  │ 📝 Edit Typography              ▼  ││  ← Typography Popover
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─ Typography Popover ────────────────┐│
│  │                                     ││
│  │  Font Family                        ││
│  │  ┌─────────────────────────────────┐││
│  │  │ Inter                       ▼  │││
│  │  └─────────────────────────────────┘││
│  │                                     ││
│  │  Font Size              Weight      ││
│  │  ┌─────────────┐  ┌─────────────┐  ││
│  │  │ 48      px ▼│  │ 700 Bold  ▼│  ││
│  │  └─────────────┘  └─────────────┘  ││
│  │                                     ││
│  │  Line Height        Letter Spacing  ││
│  │  ┌─────────────┐  ┌─────────────┐  ││
│  │  │ 1.2      em ▼│  │ -0.02   em ▼│  ││
│  │  └─────────────┘  └─────────────┘  ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Button Style                         │
│  ─────────────────────────────────────  │
│                                         │
│  Button Variant                         │
│  ┌───────┐ ┌───────┐ ┌───────┐         │
│  │▓▓▓▓▓▓▓│ │ ────  │ │ Ghost │         │
│  │ Solid │ │Outline│ │       │         │
│  └───┬───┘ └───────┘ └───────┘         │
│      │                                  │
│    ══╧══                                │
│                                         │
│  Background Color                       │
│  ┌──────┐ ┌─────────────────────────────┐
│  │██████│ │ #FF6B00                 🎨 ││
│  │Orange│                              ││
│  └──────┘ └─────────────────────────────┘
│                                         │
│  Text Color                             │
│  ┌──────┐ ┌─────────────────────────────┐
│  │██████│ │ #FFFFFF                 🎨 ││
│  │White │                              ││
│  └──────┘ └─────────────────────────────┘
│                                         │
│  Border Radius                   🖥️     │
│  ┌─────────────────────────────────────┐│
│  │ ○──────────●─────────────────────   ││
│  │                              8px    ││
│  └─────────────────────────────────────┘│
│                                         │
│  Padding                                │
│  ┌───────┐ ┌───────┐                   │
│  │ 🔗    │ │  12   │ px    (Linked)    │  ← Linked Dimensions
│  └───────┘ └───────┘                   │
│                                         │
│  Hover Effects                          │
│  ┌─────────────────────────────────────┐│
│  │ Normal        │      Hover         ││  ← State Tabs
│  │               │ ════════════       ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Advanced Tab Content

```
┌─────────────────────────────────────────┐
│                                         │
│  ← Back          Hero - Centered    ⋮   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    ┌──────┐   ┌──────┐   ┌──────┐      │
│    │  ✏️  │   │  ◐   │   │  ⚙️  │      │
│    │      │   │      │   │      │      │
│    │Content│  │Style │   │Adv.  │      │
│    └──────┘   └──────┘   └──┬───┘      │
│                             │           │
│                          ═══╧═══        │  ← Advanced Tab Active
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ▼ Layout                               │
│  ─────────────────────────────────────  │
│                                         │
│  Min Height                      🖥️     │
│  ┌─────────────────────────────────────┐│
│  │ 100                          vh  ▼ ││  ← Unit Dropdown
│  └─────────────────────────────────────┘│
│                                         │
│  Content Width                          │
│  ┌───────────┐ ┌───────────┐           │
│  │  ◀▶ Full  │ │ ▢ Boxed  │           │
│  └─────┬─────┘ └───────────┘           │
│        │                                │
│      ══╧══                              │
│                                         │
│  Content Position                       │
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │  ↖  │ │  ↑  │ │  ↗  │               │
│  └─────┘ └─────┘ └─────┘               │  ← 3x3 Position Grid
│  ┌─────┐ ┌─────┐ ┌─────┐               │
│  │  ←  │ │  ●  │ │  →  │               │     (Center selected)
│  └─────┘ └──┬──┘ └─────┘               │
│  ┌─────┐ ┌──┴──┐ ┌─────┐               │
│  │  ↙  │ │  ↓  │ │  ↘  │               │
│  └─────┘ └─────┘ └─────┘               │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Spacing                              │
│  ─────────────────────────────────────  │
│                                         │
│  Padding                         🖥️     │
│  ┌─────────────────────────────────────┐│
│  │         ┌─────────┐                 ││
│  │         │   64    │ ← Top           ││
│  │         └─────────┘                 ││
│  │ ┌─────┐             ┌─────┐         ││  ← Visual Padding Control
│  │ │ 24  │     🔗      │ 24  │         ││
│  │ └─────┘             └─────┘         ││
│  │   Left              Right           ││
│  │         ┌─────────┐                 ││
│  │         │   64    │ ← Bottom        ││
│  │         └─────────┘                 ││
│  └─────────────────────────────────────┘│
│                                         │
│  Margin                          🖥️     │
│  ┌─────────────────────────────────────┐│
│  │ Top: 0    Right: 0   Bottom: 0      ││
│  │ Left: 0              Unit: px ▼     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Motion Effects                       │
│  ─────────────────────────────────────  │
│                                         │
│  Entrance Animation              🖥️     │
│  ┌─────────────────────────────────────┐│
│  │ Fade In Up                      ▼  ││
│  └─────────────────────────────────────┘│
│                                         │
│  Animation Duration                     │
│  ┌─────────────────────────────────────┐│
│  │ ○──────────●─────────────────────   ││
│  │                            500ms    ││
│  └─────────────────────────────────────┘│
│                                         │
│  Animation Delay                        │
│  ┌─────────────────────────────────────┐│
│  │ ○───●────────────────────────────   ││
│  │                            100ms    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Responsive                           │
│  ─────────────────────────────────────  │
│                                         │
│  Hide on Desktop             ○────      │
│                                Off      │
│                                         │
│  Hide on Tablet              ○────      │
│                                Off      │
│                                         │
│  Hide on Mobile              ○────      │
│                                Off      │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Custom CSS                           │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ /* Add custom CSS here */          ││
│  │                                     ││  ← Code Editor (Monaco)
│  │ .hero-section {                     ││
│  │   /* Your styles */                 ││
│  │ }                                   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ▼ Custom Attributes                    │
│  ─────────────────────────────────────  │
│                                         │
│  ID                                     │
│  ┌─────────────────────────────────────┐│
│  │ hero-section                       ││
│  └─────────────────────────────────────┘│
│                                         │
│  CSS Classes                            │
│  ┌─────────────────────────────────────┐│
│  │ custom-hero animate-fade           ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

---

## Live Preview Canvas

### Canvas Structure

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  Viewport: [📱 375px] [📱 768px] [💻 1440px]    Zoom: [100% ▼]  🔄       │
│                                                                           │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐   │
│  │                                                                   │   │
│  │                        [HEADER PREVIEW]                           │   │
│  │                                                                   │   │
│  ├───────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │   ┌─────────────────────────────────────────────────────────┐    │   │
│  │   │                                                         │    │   │
│  │   │                    HERO BLOCK                           │    │   │
│  │   │              (Selected - Blue Border)                   │    │   │
│  │   │                                                         │    │   │
│  │   │   ════════════════════════════════════════════════     │    │   │
│  │   │              Start Your US LLC Today                    │    │   │
│  │   │   ════════════════════════════════════════════════     │    │   │
│  │   │                                                         │    │   │
│  │   │     Form your company in minutes with our expert       │    │   │
│  │   │              guidance and support                       │    │   │
│  │   │                                                         │    │   │
│  │   │         ┌──────────────┐  ┌──────────────┐             │    │   │
│  │   │         │ Get Started  │  │ Learn More   │             │    │   │
│  │   │         └──────────────┘  └──────────────┘             │    │   │
│  │   │                                                         │    │   │
│  │   │  ┌──────────────────────────┐                          │    │   │
│  │   │  │ ⋮⋮  ⚙️  📋  🗑️         │  ← Block Actions Toolbar  │    │   │
│  │   │  └──────────────────────────┘                          │    │   │
│  │   │                                                         │    │   │
│  │   └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                   │   │
│  │                    ┌─────────────────┐                           │   │
│  │                    │     + Add       │  ← Add Block Button       │   │
│  │                    └─────────────────┘                           │   │
│  │                                                                   │   │
│  │   ┌─────────────────────────────────────────────────────────┐    │   │
│  │   │                                                         │    │   │
│  │   │                  FEATURES BLOCK                         │    │   │
│  │   │               (Hover for actions)                       │    │   │
│  │   │                                                         │    │   │
│  │   └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                   │   │
│  │                    ┌─────────────────┐                           │   │
│  │                    │     + Add       │                           │   │
│  │                    └─────────────────┘                           │   │
│  │                                                                   │   │
│  │   ┌─────────────────────────────────────────────────────────┐    │   │
│  │   │                                                         │    │   │
│  │   │                TESTIMONIALS BLOCK                       │    │   │
│  │   │                                                         │    │   │
│  │   └─────────────────────────────────────────────────────────┘    │   │
│  │                                                                   │
│  │                        [FOOTER PREVIEW]                           │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Block Interaction States

#### Hover State
```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗  │
│ ║                      HERO BLOCK                       ║  │  ← Light blue border
│ ║                                                       ║  │
│ ║   ┌─────────────────────────────────────┐            ║  │
│ ║   │ ⋮⋮   ⚙️   📋   🗑️                  │            ║  │  ← Floating Toolbar
│ ║   └─────────────────────────────────────┘            ║  │
│ ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
```

#### Selected State
```
┌─────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════╗  │
│ ║█████████████████████████████████████████████████████ ║  │  ← Bold blue border
│ ║                      HERO BLOCK                       ║  │
│ ║                                                       ║  │
│ ║   Content editable inline...                         ║  │
│ ║                                                       ║  │
│ ║   ┌─────────────────────────────────────┐            ║  │
│ ║   │ ⋮⋮   ⚙️   📋   🗑️   ↑   ↓         │            ║  │  ← Extended Toolbar
│ ║   └─────────────────────────────────────┘            ║  │     with move arrows
│ ║█████████████████████████████████████████████████████ ║  │
│ ╚═══════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────┘
```

#### Dragging State
```
        ┌────────────────────────────────────┐
        │        HERO BLOCK (dragging)       │  ← Semi-transparent
        │         with shadow effect         │
        └────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  ═══════════════════════════════════════════════════════   │  ← Drop indicator line
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   FEATURES BLOCK                       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
                         ┌─────────────────┐
                         │   PAGE LOAD     │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │      BROWSE MODE         │
                    │   (Block Library View)   │
                    └────────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Drag block to  │    │  Click block    │    │  Click existing │
│     canvas      │    │   in library    │    │  canvas block   │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       │
┌─────────────────┐    ┌─────────────────┐              │
│ Add block to    │    │ Add block to    │              │
│ page + select   │    │ page + select   │              │
└────────┬────────┘    └────────┬────────┘              │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       EDIT MODE          │
                    │  (Block Settings View)   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌─────────────────┐       ┌─────────────────┐
          │  Click "Back"   │       │ Click outside   │
          │    button       │       │   any block     │
          └────────┬────────┘       └────────┬────────┘
                   │                         │
                   └───────────┬─────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │      BROWSE MODE         │
                    │   (Block Library View)   │
                    └──────────────────────────┘
```

### Panel State Management

```typescript
type PanelMode = 'browse' | 'edit' | 'layers' | 'global';

interface PanelState {
  mode: PanelMode;
  selectedBlockId: string | null;
  activeTab: 'content' | 'style' | 'advanced';
  expandedSections: string[];
}

// State Transitions:
// browse -> edit: when block is selected
// edit -> browse: when back clicked or click outside
// any -> layers: when layers tab clicked
// any -> global: when global settings clicked
```

---

## Component Specifications

### 1. Settings Panel Header

```tsx
interface SettingsPanelHeaderProps {
  blockName: string;
  blockType: string;
  onBack: () => void;
  onMoreOptions: () => void;
}

// Visual:
// ┌─────────────────────────────────────────┐
// │  ←  │  Hero - Centered              ⋮  │
// └─────────────────────────────────────────┘
```

### 2. Icon Tabs

```tsx
interface IconTabsProps {
  tabs: Array<{
    id: string;
    icon: LucideIcon;
    label: string;
  }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}

// Visual:
// ┌──────┐   ┌──────┐   ┌──────┐
// │  ✏️  │   │  ◐   │   │  ⚙️  │
// │Content│  │Style │   │Adv.  │
// └──┬───┘   └──────┘   └──────┘
//    │
// ═══╧═══
```

### 3. Accordion Section

```tsx
interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode; // e.g., "Edit with AI" button
  children: React.ReactNode;
}

// Visual:
// ▼ Section Title          ✨ Action
// ─────────────────────────────────────
//
// [Section Content]
```

### 4. Form Controls

```tsx
// Text Input
interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
}

// Color Picker
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  showOpacity?: boolean;
}

// Slider
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit?: string;
  responsive?: boolean;
}

// Toggle Switch
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// Icon Button Group
interface IconButtonGroupProps {
  label: string;
  options: Array<{
    value: string;
    icon: LucideIcon;
    tooltip: string;
  }>;
  value: string;
  onChange: (value: string) => void;
}

// Unit Input
interface UnitInputProps {
  label: string;
  value: number;
  unit: 'px' | 'em' | '%' | 'vh' | 'vw';
  onChange: (value: number, unit: string) => void;
  responsive?: boolean;
}
```

### 5. Responsive Indicator

```tsx
interface ResponsiveIndicatorProps {
  currentBreakpoint: 'desktop' | 'tablet' | 'mobile';
  hasResponsiveValue: boolean;
  onClick: () => void;
}

// Visual: 🖥️ (colored if has responsive override)
```

---

## Implementation Phases

### Phase 1: Core Layout Restructure
- [ ] Remove right sidebar
- [ ] Implement two-panel layout
- [ ] Create panel mode switching (browse/edit)
- [ ] Basic live preview canvas

### Phase 2: Browse Mode Panel
- [ ] Block categories with accordion
- [ ] Block grid with thumbnails
- [ ] Search functionality
- [ ] Drag to canvas

### Phase 3: Edit Mode Panel (Elementor Style)
- [ ] Header with back button
- [ ] Icon tabs (Content/Style/Advanced)
- [ ] Accordion sections
- [ ] Basic form controls

### Phase 4: Advanced Form Controls
- [ ] Color picker with gradients
- [ ] Typography popover
- [ ] Spacing visual control
- [ ] Responsive indicators
- [ ] Unit selectors

### Phase 5: Canvas Interactions
- [ ] Block selection highlighting
- [ ] Hover toolbar
- [ ] Drag & drop reordering
- [ ] Add block between blocks
- [ ] In-canvas text editing

### Phase 6: Polish & Optimization
- [ ] Animations & transitions
- [ ] Keyboard shortcuts
- [ ] Undo/Redo
- [ ] Autosave
- [ ] Performance optimization

---

## UI Theme Specifications

### Color Palette (Dark Theme - Elementor Style)

```css
:root {
  /* Panel Background */
  --panel-bg: #1E1E1E;
  --panel-bg-secondary: #2D2D2D;

  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  /* Accent Colors */
  --accent-primary: #9333EA;      /* Purple */
  --accent-secondary: #7C3AED;
  --accent-hover: #A855F7;

  /* Border Colors */
  --border-default: #374151;
  --border-hover: #4B5563;
  --border-active: #9333EA;

  /* Input Colors */
  --input-bg: #374151;
  --input-border: #4B5563;
  --input-focus: #9333EA;

  /* Success/Error */
  --success: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;
}
```

### Typography

```css
:root {
  /* Font Family */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-lg: 14px;
  --text-xl: 16px;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing

```css
:root {
  /* Panel Spacing */
  --panel-padding: 16px;
  --section-gap: 16px;
  --control-gap: 12px;

  /* Component Spacing */
  --input-padding-x: 12px;
  --input-padding-y: 8px;
  --button-padding-x: 16px;
  --button-padding-y: 8px;
}
```

---

## Summary: Key Changes from Current Design

| Current | Proposed (Elementor Style) |
|---------|---------------------------|
| 3-column layout | 2-column layout |
| Right sidebar for settings | Left panel (context-aware) |
| Horizontal tabs in sidebar | Icon tabs with labels |
| Flat settings list | Accordion sections |
| No visual hierarchy | Clear section headers |
| Limited form controls | Rich form controls (color picker, typography, etc.) |
| No responsive indicators | 🖥️ icons for responsive settings |
| No live preview | Full-width live preview |
| Click "Preview" button | Always visible real-time preview |
| Static block cards | Interactive canvas with inline editing |

এই redesign implement করলে LLCPad এর Landing Page Builder Elementor এর মতো professional এবং intuitive হবে।
