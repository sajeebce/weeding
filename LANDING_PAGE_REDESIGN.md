# Landing Page (Homepage) Redesign Plan

## LLCPad - Fully Customizable CMS-Style Landing Page Builder

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
11. [Unified Widget Architecture](#unified-widget-architecture-footer--landing-page)

---

## Executive Summary

Transform the current static homepage into a **fully customizable, block-based landing page builder** inspired by WordPress/Elementor. The landing page can have unique layouts with drag-and-drop section management, inline editing, and real-time preview - similar to how modern page builders work.

### Goals

- **Flexibility**: Admin can add/remove/reorder any section on the homepage
- **Conversion-Focused**: Every block designed for maximum conversion based on 2025 research
- **Performance**: Server-side rendering, optimized images, under 3-second load time
- **SEO**: Proper semantic HTML, JSON-LD schemas, meta control per page
- **Brand Consistency**: Pre-built blocks with Midnight Orange theme styling
- **A/B Testing Ready**: Support for multiple variants of each block

---

## Current State Analysis

### Frontend Structure (`/(marketing)/page.tsx`)

| Section | Description | Customizable? |
|---------|-------------|---------------|
| Hero | Badge, headline, features, CTAs, trust badges, stats | No (hardcoded) |
| ServicesGrid | Featured services + category grid | No (hardcoded) |
| HowItWorks | 4-step process | No (hardcoded) |
| PricingTable | 3 packages with state selector | Partially (state fees) |
| Testimonials | 6 customer reviews grid | Yes (from DB) |
| FAQSection | Accordion Q&A | Yes (from DB) |
| CTASection | Final call-to-action | No (hardcoded) |

### Current Limitations

1. **Fixed Section Order** - Cannot reorder or hide sections
2. **Hardcoded Content** - Most text is in component files, not editable
3. **No Section Variants** - Each section has only one design option
4. **No Custom Sections** - Cannot add partner logos, video, comparison tables, etc.
5. **No Per-Page Customization** - Single homepage layout
6. **No Visual Editor** - Must edit code to change layout
7. **No A/B Testing** - Cannot test different headlines or layouts

### Current Admin Capabilities

- Testimonials management (add/edit/delete)
- FAQ management (add/edit/delete)
- Limited to these two content types for homepage

---

## 2025 Design Trends & Best Practices

### Key Design Principles (Research-Based)

Based on research from [Unbounce](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/), [KlientBoost](https://www.klientboost.com/landing-pages/saas-landing-page/), [Apexure](https://www.apexure.com/blog/best-saas-landing-pages-with-analysis), and [HubSpot](https://blog.hubspot.com/marketing/saas-landing-page):

| Principle | Impact | Implementation |
|-----------|--------|----------------|
| Single CTA Focus | +266% vs multiple offers | One primary action per section |
| Social Proof | +34% conversions | Trust badges, testimonials, stats above fold |
| Minimalist Design | Reduced bounce rate | Clean layouts, strategic whitespace |
| Customer-Centric Copy | Higher engagement | Focus on benefits, not features |
| Mobile-First | 53% leave if >3s load | Responsive, optimized images |
| Above-Fold Clarity | First 5 seconds critical | Clear value prop + CTA visible immediately |

### Hero Section Best Practices

Based on [Prismic](https://prismic.io/blog/website-hero-section), [LogRocket](https://blog.logrocket.com/ux-design/hero-section-examples-best-practices/), and [Thrive Themes](https://thrivethemes.com/hero-section-examples/):

```
┌─────────────────────────────────────────────────────────────┐
│  HERO SECTION ESSENTIALS (Above the Fold)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. CLEAR HEADLINE                                          │
│     • Says what you do + why it matters                     │
│     • 6-10 words maximum                                    │
│     • Highlight key word with brand color                   │
│                                                             │
│  2. SUPPORTIVE SUB-HEADLINE                                 │
│     • More context or emotional connection                  │
│     • Benefits-focused, not features                        │
│                                                             │
│  3. PRIMARY CTA                                             │
│     • Specific action (not "Learn More")                    │
│     • High contrast button                                  │
│     • Shows price or value ("Start Free", "From $0")        │
│                                                             │
│  4. VISUAL ELEMENT                                          │
│     • Reinforces message                                    │
│     • Product screenshot, illustration, or video            │
│     • Optimized for fast loading                            │
│                                                             │
│  5. TRUST SIGNALS (Optional but recommended)                │
│     • Client logos, testimonial snippets                    │
│     • Star ratings, "X customers served"                    │
│     • Security badges                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Trust Signal Placement (F-Pattern)

Based on [Attention Insight](https://attentioninsight.com/the-psychology-of-trust-in-ux-what-encourages-customer-loyalty/) research:

```
┌─────────────────────────────────────────────────────────────┐
│  F-PATTERN SCAN PATH + TRUST PLACEMENT                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████████████                              │
│  ████████████████████████████  ← First horizontal scan     │
│  ██████████████████              (Headline + Trust Bar)    │
│  ████████████                                              │
│  ██████████████████████████                                │
│  ████████████████              ← Second horizontal scan    │
│  ████████                        (Sub-headline + CTA)      │
│                                                             │
│  OPTIMAL TRUST SIGNAL POSITIONS:                           │
│  ├── 1. Hero section (above fold) - CRITICAL               │
│  ├── 2. Below hero (logo bar, stats)                       │
│  ├── 3. Near pricing (reduces purchase anxiety)            │
│  ├── 4. Above CTA buttons                                  │
│  └── 5. Footer (reinforcement)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Page Load Performance

Research from [OneNine](https://onenine.com/homepage-design-best-practices/) shows:

- 53% of mobile visitors leave if page > 3 seconds
- Bounce rate: 8% at 3s, 24% at 4s, 38% at 5s
- Every 100KB in hero media = +1.8% bounce rate

**Implementation**: Lazy load below-fold sections, optimize images, minimal client JS

---

## Competitor Analysis

### Bizee (bizee.com)

**Homepage Structure:**
1. Trust bar (Trustpilot rating, security badges)
2. Hero with state selector form
3. "How It Works" 6-step accordion
4. Benefits grid (4 key advantages)
5. Social proof section ("1M+ Served")
6. Pricing comparison
7. Testimonials carousel
8. FAQ accordion
9. Final CTA
10. Rich footer

**Key Features:**
- "Bootstrapped, Founder Led Since 2004" - authenticity
- Form directly in hero for immediate action
- Accordion steps reduce information overwhelm
- Strong money-back guarantee messaging
- Clean, professional design

### ZenBusiness (zenbusiness.com)

**Homepage Structure:**
1. Navigation with "Start Your Business" CTA
2. Hero with animated illustrations
3. AI assistant (Velo) feature showcase
4. Services grid
5. Benefits with icons
6. Customer testimonials
7. Trust indicators (BBB, ratings)
8. State-specific content
9. Footer with resources

**Key Features:**
- AI-powered assistant (Velo) prominently featured
- Clean, modern design
- Interactive elements
- State selector for personalization
- Strong social proof integration

### Common Patterns Across LLC Formation Sites

```
┌─────────────────────────────────────────────────────────────┐
│  STANDARD LLC HOMEPAGE FLOW                                 │
├─────────────────────────────────────────────────────────────┤
│  1. NAVIGATION + TRUST BAR                                  │
│     • Logo, main nav, CTA button                           │
│     • Optional: Trustpilot/BBB badges                      │
├─────────────────────────────────────────────────────────────┤
│  2. HERO SECTION                                            │
│     • Strong headline with state personalization           │
│     • Sub-headline with key benefit                        │
│     • Primary CTA (often with price)                       │
│     • Trust text ("Join X entrepreneurs")                  │
├─────────────────────────────────────────────────────────────┤
│  3. LOGO BAR / TRUST STRIP                                  │
│     • "As seen in" or partner logos                        │
│     • Quick stats ("10,000+ served")                       │
├─────────────────────────────────────────────────────────────┤
│  4. SERVICES OVERVIEW                                       │
│     • Featured services with icons                         │
│     • Quick links to detail pages                          │
├─────────────────────────────────────────────────────────────┤
│  5. HOW IT WORKS                                            │
│     • 3-5 step process                                     │
│     • Visual timeline or cards                             │
├─────────────────────────────────────────────────────────────┤
│  6. PRICING SECTION                                         │
│     • Package comparison                                   │
│     • State fee calculator                                 │
├─────────────────────────────────────────────────────────────┤
│  7. SOCIAL PROOF                                            │
│     • Testimonials                                         │
│     • Review aggregation                                   │
├─────────────────────────────────────────────────────────────┤
│  8. FAQ SECTION                                             │
│     • Common questions                                     │
│     • Link to full FAQ                                     │
├─────────────────────────────────────────────────────────────┤
│  9. FINAL CTA                                               │
│     • Strong closing CTA                                   │
│     • Urgency or guarantee messaging                       │
├─────────────────────────────────────────────────────────────┤
│  10. FOOTER                                                 │
│      • Links, contact, legal                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Block-Based CMS Architecture

### Elementor/WordPress Inspiration

Based on [Crocoblock](https://crocoblock.com/blog/landing-page-practices-and-design/) and [Elementor](https://elementor.com/blog/introducing-blocks/):

**Block Concept:**
- Blocks are pre-designed section templates
- Think of them like LEGO bricks
- Pick blocks (hero, services, testimonials) and customize each
- Combine for complete pages

**Hierarchical Structure:**
```
Page
└── Sections (biggest containers)
    └── Columns (layout divisions)
        └── Widgets/Components (actual content)
```

### LLCPad Landing Page Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE STRUCTURE                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LandingPage                                                │
│  ├── metadata (SEO, title, description)                    │
│  └── Blocks[] (ordered array)                              │
│       ├── Block 1: Hero                                    │
│       │   └── settings: { variant, content, cta... }      │
│       ├── Block 2: LogoBar                                 │
│       │   └── settings: { logos[], style... }             │
│       ├── Block 3: Services                                │
│       │   └── settings: { layout, services[], limit... }  │
│       ├── Block 4: HowItWorks                              │
│       │   └── settings: { steps[], layout... }            │
│       └── Block N: ...                                     │
│                                                             │
│  Each block has:                                            │
│  ├── type (block identifier)                               │
│  ├── sortOrder (position on page)                          │
│  ├── isActive (visibility toggle)                          │
│  ├── settings (block-specific config as JSON)              │
│  └── responsive settings (hide on mobile/desktop)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Proposed Section Blocks

### Block Categories

```
┌─────────────────────────────────────────────────────────────┐
│  LANDING PAGE BLOCK CATEGORIES                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 HERO BLOCKS (Above the Fold)                           │
│  ├── hero-centered       - Centered text, CTA below        │
│  ├── hero-split          - Text left, image/form right     │
│  ├── hero-slider         - Image/content carousel slider   │
│  ├── hero-video          - Background video                │
│  ├── hero-with-form      - Inline state selector form      │
│  └── hero-minimal        - Clean, text-only hero           │
│                                                             │
│  🏆 TRUST BLOCKS                                           │
│  ├── trust-bar           - Horizontal badge strip          │
│  ├── logo-carousel       - Partner/press logos             │
│  ├── stats-counter       - Animated statistics             │
│  ├── testimonials-grid   - Customer reviews grid           │
│  ├── testimonials-carousel - Sliding testimonials          │
│  ├── testimonials-featured - Single featured review        │
│  └── review-aggregator   - Trustpilot/Google integration   │
│                                                             │
│  📦 SERVICE BLOCKS                                         │
│  ├── services-grid       - Icon cards grid                 │
│  ├── services-list       - Categorized service list        │
│  ├── services-featured   - Highlight 3-4 key services      │
│  └── services-comparison - Service vs service table        │
│                                                             │
│  📋 PROCESS BLOCKS                                         │
│  ├── steps-horizontal    - Horizontal numbered steps       │
│  ├── steps-vertical      - Vertical timeline               │
│  ├── steps-accordion     - Expandable step details         │
│  └── steps-cards         - Card-based process              │
│                                                             │
│  💰 PRICING BLOCKS                                         │
│  ├── pricing-cards       - Side-by-side package cards      │
│  ├── pricing-table       - Comparison table                │
│  ├── pricing-simple      - Single package focus            │
│  └── pricing-calculator  - Interactive calculator          │
│                                                             │
│  ❓ FAQ BLOCKS                                             │
│  ├── faq-accordion       - Standard accordion              │
│  ├── faq-grid            - Two-column Q&A grid             │
│  └── faq-tabs            - Categorized tabs                │
│                                                             │
│  🎯 CTA BLOCKS                                             │
│  ├── cta-banner          - Full-width CTA section          │
│  ├── cta-card            - Centered card CTA               │
│  ├── cta-split           - Text + form side by side        │
│  └── cta-sticky          - Fixed bottom bar                │
│                                                             │
│  🎨 CONTENT BLOCKS                                         │
│  ├── rich-text           - WYSIWYG content                 │
│  ├── image-text          - Image + text side by side       │
│  ├── video-embed         - YouTube/Vimeo video             │
│  ├── features-grid       - Icon + text feature grid        │
│  ├── benefits-list       - Checkmark benefits list         │
│  └── comparison-table    - Feature comparison              │
│                                                             │
│  🗺️ NAVIGATION BLOCKS                                      │
│  ├── announcement-bar    - Top promotional banner          │
│  └── breadcrumb          - Page navigation                 │
│                                                             │
│  🌍 LOCATION BLOCKS                                        │
│  ├── state-selector      - Choose your state widget        │
│  ├── country-selector    - International targeting         │
│  └── map-embed           - Google Maps integration         │
│                                                             │
│  📝 LEAD CAPTURE BLOCKS                                    │
│  ├── newsletter-signup   - Email subscription              │
│  ├── contact-form        - Quick contact form              │
│  └── quiz-funnel         - Interactive quiz                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Block Specifications

#### 1. Hero Block (Multiple Variants)

```typescript
interface HeroBlock {
  type: "hero";
  settings: {
    // Layout Variant
    variant: "centered" | "split" | "slider" | "with-form" | "video" | "minimal";

    // Background (for non-slider variants)
    background: {
      type: "solid" | "gradient" | "image" | "video";
      color?: string;
      gradientFrom?: string;
      gradientTo?: string;
      imageUrl?: string;
      videoUrl?: string;
      overlay?: number; // 0-100 opacity
    };

    // Badge (optional top element)
    badge?: {
      enabled: boolean;
      text: string;
      emoji?: string;
      style: "default" | "outline" | "glow";
    };

    // Headline
    headline: {
      text: string;
      highlightWord?: string; // Word to highlight in brand color
      size: "lg" | "xl" | "2xl";
    };

    // Sub-headline
    subheadline: {
      text: string;
      size: "md" | "lg";
    };

    // Features List (optional)
    features?: {
      enabled: boolean;
      items: string[];
      icon: "check" | "checkCircle" | "star" | "arrow";
    };

    // Primary CTA
    primaryCTA: {
      text: string;
      link: string;
      showPrice?: boolean;
      priceText?: string; // "From $0"
      variant: "solid" | "gradient" | "glow";
    };

    // Secondary CTA (optional)
    secondaryCTA?: {
      enabled: boolean;
      text: string;
      link: string;
      variant: "outline" | "ghost" | "link";
    };

    // Trust Text (optional)
    trustText?: {
      enabled: boolean;
      text: string; // "Join 10,000+ entrepreneurs"
      showRating?: boolean;
      rating?: number;
      reviewCount?: number;
    };

    // Trust Badges Grid (optional)
    trustBadges?: {
      enabled: boolean;
      items: Array<{
        icon: string;
        text: string;
      }>;
    };

    // Stats (optional)
    stats?: {
      enabled: boolean;
      items: Array<{
        value: string;
        label: string;
      }>;
    };

    // Form (for hero-with-form variant)
    form?: {
      type: "state-selector" | "email-capture" | "contact";
      headline?: string;
      buttonText: string;
    };

    // Image/Visual (for split variant)
    visual?: {
      type: "image" | "illustration" | "screenshot";
      url: string;
      alt: string;
      position: "left" | "right";
    };

    // ═══════════════════════════════════════════════════════════════
    // SLIDER SETTINGS (for hero-slider variant)
    // ═══════════════════════════════════════════════════════════════
    slider?: {
      enabled: boolean;

      // Slide content - each slide can have different content
      slides: Array<{
        id: string;

        // Background per slide
        background: {
          type: "image" | "video" | "gradient";
          imageUrl?: string;
          videoUrl?: string;
          gradientFrom?: string;
          gradientTo?: string;
          overlay?: number; // 0-100 opacity for readability
          focalPoint?: { x: number; y: number }; // For responsive cropping
        };

        // Content per slide (can override global or be unique)
        content: {
          badge?: {
            enabled: boolean;
            text: string;
            emoji?: string;
          };
          headline: string;
          highlightWord?: string;
          subheadline: string;
          // Optional: override global CTA per slide
          primaryCTA?: {
            text: string;
            link: string;
            showPrice?: boolean;
            priceText?: string;
          };
          secondaryCTA?: {
            enabled: boolean;
            text: string;
            link: string;
          };
        };

        // Content position within slide
        contentPosition: "left" | "center" | "right";
        contentAlignment: "top" | "middle" | "bottom";
      }>;

      // Slider behavior settings
      autoplay: {
        enabled: boolean;
        interval: number; // milliseconds (e.g., 5000 = 5 seconds)
        pauseOnHover: boolean;
      };

      // Transition settings
      transition: {
        type: "fade" | "slide" | "zoom" | "kenburns";
        duration: number; // milliseconds (e.g., 500)
        easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
      };

      // Navigation controls
      navigation: {
        arrows: {
          enabled: boolean;
          style: "default" | "minimal" | "rounded" | "outside";
          showOnHover: boolean;
        };
        dots: {
          enabled: boolean;
          style: "dots" | "lines" | "numbers" | "thumbnails";
          position: "bottom" | "bottom-left" | "bottom-right";
        };
        swipe: boolean; // Enable touch/swipe on mobile
        keyboard: boolean; // Enable keyboard navigation
      };

      // Progress indicator
      progressBar: {
        enabled: boolean;
        position: "top" | "bottom";
        color: "primary" | "white" | "custom";
        customColor?: string;
      };

      // Lazy loading for performance
      lazyLoad: boolean;

      // Loop settings
      loop: boolean; // Infinite loop

      // Ken Burns effect (subtle zoom/pan on images)
      kenBurnsEffect: {
        enabled: boolean;
        scale: number; // e.g., 1.1 for 10% zoom
        direction: "in" | "out" | "random";
      };
    };
  };
}
```

**Hero Variants Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│  HERO VARIANT: CENTERED (Default)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                 [🇺🇸 Trusted by 10,000+]                    │
│                                                             │
│              Start Your US LLC in 24 Hours                  │
│              ══════════════════════════════                 │
│     Launch your American dream from anywhere in the world   │
│                                                             │
│   ✓ Fast processing   ✓ Guaranteed   ✓ Expert support      │
│                                                             │
│       [Start Your LLC Now →]    [View Pricing]             │
│                                                             │
│            ⭐⭐⭐⭐⭐ 4.9/5 from 2,000+ reviews              │
│                                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│   │ 🛡 Secure │ │ ⏱ 24hr   │ │ 🌍 50+   │ │ ⭐ 4.9   │     │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│   ─────────────────────────────────────────────────────    │
│   10,000+        50+          4.9/5         24h            │
│   LLCs Formed    Countries    Rating        Processing     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HERO VARIANT: SPLIT (Image Right)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Start Your           │                                   │
│   US LLC Today         │     ┌─────────────────────┐      │
│   ════════════════     │     │                     │      │
│                        │     │    [Dashboard       │      │
│   Launch your business │     │     Screenshot]     │      │
│   from anywhere.       │     │                     │      │
│                        │     │                     │      │
│   ✓ Fast & Affordable  │     └─────────────────────┘      │
│   ✓ Expert Support     │                                   │
│   ✓ Full Compliance    │                                   │
│                        │                                   │
│   [Get Started - $0]   │                                   │
│                        │                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HERO VARIANT: WITH-FORM (Bizee Style)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Form Your LLC           ┌────────────────────────────┐   │
│   From $0 + State Fee     │  START YOUR BUSINESS       │   │
│   ════════════════════    │  ────────────────────────  │   │
│                           │                            │   │
│   Join 1M+ entrepreneurs  │  Select your state:        │   │
│   who trust us.           │  [Wyoming          ▼]      │   │
│                           │                            │   │
│   ✓ Free formation        │  Business name (optional): │   │
│   ✓ Expert support        │  [                    ]    │   │
│   ✓ Fast processing       │                            │   │
│                           │  [START MY LLC →]          │   │
│   ⭐⭐⭐⭐⭐ 4.9/5         │                            │   │
│   (2,000+ reviews)        └────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HERO VARIANT: SLIDER (Image Carousel)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  │░░░░                                           ░░░░░│   │
│  │░░░░   Start Your LLC Today        [← PREV]    ░░░░░│   │
│  │░░░░   ══════════════════════                  ░░░░░│   │
│  │░░░░   Launch your business                    ░░░░░│   │
│  │░░░░   from anywhere.                          ░░░░░│   │
│  │░░░░                              [NEXT →]     ░░░░░│   │
│  │░░░░   [Get Started Now]                       ░░░░░│   │
│  │░░░░                                           ░░░░░│   │
│  │░░░░░░░░░░░░ BACKGROUND IMAGE 1 ░░░░░░░░░░░░░░░░░░░░│   │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │
│  └─────────────────────────────────────────────────────┘   │
│           ══════════════════════                           │
│           ● ○ ○ ○   (4 slides)   Progress Bar              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SLIDER ADMIN: Slide Management                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SLIDES (Drag to reorder)                                  │
│  ─────────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [≡] Slide 1: LLC Formation            [Edit] [×]    │   │
│  │     Background: office-team.jpg                     │   │
│  │     Headline: "Start Your LLC Today"                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [≡] Slide 2: Amazon Services          [Edit] [×]    │   │
│  │     Background: amazon-warehouse.jpg                │   │
│  │     Headline: "Sell on Amazon USA"                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [≡] Slide 3: Business Banking         [Edit] [×]    │   │
│  │     Background: banking-cards.jpg                   │   │
│  │     Headline: "Open US Bank Account"                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Add New Slide]                                         │
│                                                             │
│  SLIDER SETTINGS                                           │
│  ─────────────────────────────────────────────────────────  │
│  Autoplay:      [✓] Enabled                               │
│  Interval:      [5000] ms (5 seconds)                     │
│  Pause on Hover:[✓]                                       │
│                                                             │
│  Transition:    [Fade          ▼]                         │
│  Duration:      [500] ms                                  │
│                                                             │
│  Show Arrows:   [✓]  Style: [Minimal       ▼]             │
│  Show Dots:     [✓]  Style: [Dots          ▼]             │
│  Progress Bar:  [✓]  Position: [Bottom     ▼]             │
│                                                             │
│  Ken Burns:     [✓]  Scale: [1.1]  Direction: [In  ▼]    │
│  Loop:          [✓]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SLIDER ADMIN: Edit Single Slide                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BACKGROUND                                                 │
│  ─────────────────────────────────────────────────────────  │
│  Type:          [Image         ▼]                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     [Click to upload or drag image here]           │   │
│  │                                                     │   │
│  │     Recommended: 1920x1080, max 500KB              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Overlay:       [40]% ████████░░░░░░░░░░                  │
│  Focal Point:   [Center       ▼] (for responsive crop)    │
│                                                             │
│  CONTENT                                                    │
│  ─────────────────────────────────────────────────────────  │
│  Badge:         [✓] [🚀 New Service                   ]   │
│  Headline:      [Start Your LLC Today                  ]   │
│  Highlight:     [LLC            ] ← Word in brand color   │
│  Subheadline:   [Launch your business from anywhere    ]   │
│                                                             │
│  PRIMARY CTA                                                │
│  Text:          [Get Started                          ]   │
│  Link:          [/services/llc-formation              ]   │
│  Show Price:    [✓] From $0                               │
│                                                             │
│  POSITION                                                   │
│  ─────────────────────────────────────────────────────────  │
│  Horizontal:    [Left     ] [Center   ] [Right    ]       │
│  Vertical:      [Top      ] [Middle ✓ ] [Bottom   ]       │
│                                                             │
│                              [Cancel]  [Save Slide]        │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Logo Bar Block

```typescript
interface LogoBarBlock {
  type: "logo-bar";
  settings: {
    variant: "static" | "carousel" | "marquee";

    headline?: {
      enabled: boolean;
      text: string; // "Trusted by" or "As seen in"
    };

    logos: Array<{
      name: string;
      imageUrl: string;
      link?: string;
    }>;

    style: {
      grayscale: boolean;
      opacity: number; // 0.3 - 1
      size: "sm" | "md" | "lg";
    };

    background: "transparent" | "light" | "dark";
  };
}
```

#### 3. Services Grid Block

```typescript
interface ServicesGridBlock {
  type: "services-grid";
  settings: {
    layout: "grid" | "list" | "featured";

    header: {
      badge?: string;
      headline: string;
      subheadline?: string;
    };

    // Auto-fetch from DB or manual
    source: "database" | "manual";

    // If database source
    filters?: {
      categoryId?: string;
      featured?: boolean;
      limit: number;
    };

    // If manual source
    services?: Array<{
      name: string;
      description: string;
      icon: string;
      price: string;
      link: string;
      popular?: boolean;
    }>;

    // Display options
    showPrice: boolean;
    showPopularBadge: boolean;
    showArrow: boolean;
    columns: 2 | 3 | 4;

    // CTA at bottom
    cta?: {
      enabled: boolean;
      text: string;
      link: string;
      secondaryText?: string;
      secondaryLink?: string;
    };
  };
}
```

#### 4. How It Works Block

```typescript
interface HowItWorksBlock {
  type: "how-it-works";
  settings: {
    layout: "horizontal" | "vertical" | "accordion" | "cards";

    header: {
      badge?: string;
      headline: string;
      subheadline?: string;
    };

    steps: Array<{
      number?: number;
      icon: string;
      title: string;
      description: string;
      duration?: string; // "Day 1", "24 hours"
    }>;

    style: {
      showNumbers: boolean;
      showIcons: boolean;
      showConnectorLine: boolean;
      iconStyle: "circle" | "square" | "none";
    };
  };
}
```

**Layout Variants:**

```
┌─────────────────────────────────────────────────────────────┐
│  HOW IT WORKS: HORIZONTAL (Current)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ①──────────②──────────③──────────④                     │
│   [Icon]     [Icon]     [Icon]     [Icon]                  │
│   Choose     We Handle  Receive    Launch                  │
│   Package    Paperwork  Documents  Business                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HOW IT WORKS: ACCORDION (Bizee Style)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [▼] Step 1: Choose Your Package                          │
│       Select the LLC package that fits your needs.         │
│       Pick your state and provide basic business info.     │
│   ─────────────────────────────────────────────────────    │
│   [▶] Step 2: We Handle the Paperwork                      │
│   ─────────────────────────────────────────────────────    │
│   [▶] Step 3: Receive Your Documents                       │
│   ─────────────────────────────────────────────────────    │
│   [▶] Step 4: Launch Your Business                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HOW IT WORKS: VERTICAL TIMELINE                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ● Step 1: Choose Your Package                            │
│   │  Select the LLC package that fits your needs.          │
│   │                                                        │
│   ● Step 2: We Handle the Paperwork                        │
│   │  Our team prepares and files all documents.            │
│   │                                                        │
│   ● Step 3: Receive Your Documents                         │
│   │  Get your LLC approval within 24-48 hours.             │
│   │                                                        │
│   ● Step 4: Launch Your Business                           │
│      Open bank account and start accepting payments.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5. Pricing Block

```typescript
interface PricingBlock {
  type: "pricing";
  settings: {
    layout: "cards" | "table" | "simple" | "calculator";

    header: {
      badge?: string;
      headline: string;
      subheadline?: string;
    };

    // State selector
    stateSelector: {
      enabled: boolean;
      position: "above" | "inline";
      defaultState?: string;
    };

    // Package source
    source: "database" | "manual";

    // Manual packages
    packages?: Array<{
      name: string;
      description: string;
      price: number;
      features: Array<{
        name: string;
        included: boolean;
        addon?: string;
      }>;
      processingTime?: string;
      popular?: boolean;
      ctaText: string;
    }>;

    // Display options
    showStateFees: boolean;
    showTotal: boolean;
    showProcessingTime: boolean;
    highlightPopular: boolean;

    // Bottom CTA
    bottomCTA?: {
      enabled: boolean;
      text: string;
      link: string;
    };
  };
}
```

#### 6. Testimonials Block

```typescript
interface TestimonialsBlock {
  type: "testimonials";
  settings: {
    layout: "grid" | "carousel" | "featured" | "wall" | "marquee";

    header: {
      badge?: string;
      headline: string;
      subheadline?: string;
    };

    // Data source
    source: "database" | "manual" | "trustpilot" | "google";

    // If manual
    testimonials?: Array<{
      quote: string;
      author: string;
      company?: string;
      country?: string;
      avatar?: string;
      rating: number;
    }>;

    // Display options
    limit: number;
    showRating: boolean;
    showAvatar: boolean;
    showCompany: boolean;
    showCountry: boolean;
    columns: 2 | 3;

    // Trust footer
    trustFooter: {
      enabled: boolean;
      showAvatarStack: boolean;
      text: string; // "Join 10,000+ happy customers"
      showOverallRating: boolean;
    };
  };
}
```

#### 7. Stats Counter Block

```typescript
interface StatsCounterBlock {
  type: "stats-counter";
  settings: {
    layout: "horizontal" | "grid" | "cards";

    stats: Array<{
      value: string; // "10,000+"
      label: string; // "LLCs Formed"
      icon?: string;
      prefix?: string; // "$"
      suffix?: string; // "+"
      animated: boolean;
    }>;

    style: {
      valueSize: "lg" | "xl" | "2xl";
      valueColor: "primary" | "accent" | "default";
      showBorder: boolean;
      background: "transparent" | "light" | "dark";
    };
  };
}
```

#### 8. FAQ Block

```typescript
interface FAQBlock {
  type: "faq";
  settings: {
    layout: "accordion" | "grid" | "tabs";

    header: {
      badge?: string;
      headline: string;
      subheadline?: string;
      position: "left" | "center" | "top";
    };

    // Data source
    source: "database" | "manual";

    // If database
    filters?: {
      categoryId?: string;
      limit: number;
    };

    // If manual
    faqs?: Array<{
      question: string;
      answer: string;
      category?: string;
    }>;

    // Display
    expandFirst: boolean;
    showViewAll: boolean;
    viewAllLink?: string;
  };
}
```

#### 9. CTA Section Block

```typescript
interface CTASectionBlock {
  type: "cta-section";
  settings: {
    variant: "banner" | "card" | "split" | "minimal";

    background: {
      type: "solid" | "gradient" | "image";
      color?: string;
      gradientFrom?: string;
      gradientTo?: string;
      imageUrl?: string;
    };

    headline: string;
    subheadline?: string;

    // Benefits list (optional)
    benefits?: {
      enabled: boolean;
      items: string[];
    };

    // Primary CTA
    primaryCTA: {
      text: string;
      link: string;
      variant: "solid" | "secondary" | "outline";
    };

    // Secondary CTA (optional)
    secondaryCTA?: {
      enabled: boolean;
      text: string;
      link: string;
      icon?: string;
    };

    // Trust text (optional)
    trustText?: {
      enabled: boolean;
      text: string;
      icon?: string; // "lock", "shield"
    };
  };
}
```

#### 10. Newsletter Block

```typescript
interface NewsletterBlock {
  type: "newsletter";
  settings: {
    layout: "inline" | "card" | "full-width";

    headline: string;
    subheadline?: string;

    form: {
      placeholder: string;
      buttonText: string;
      showName: boolean;
    };

    // Privacy text
    privacyText?: {
      enabled: boolean;
      text: string;
    };

    background: "transparent" | "light" | "dark" | "brand";
  };
}
```

---

## Admin Panel Design

### Landing Page Builder Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Admin > Appearance > Landing Page Builder                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [← Back]  Homepage Builder              [Preview] [Publish]│
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  ┌─────────────┐  ┌────────────────────────────────────┐   │
│  │ ADD BLOCK   │  │                                    │   │
│  │             │  │  HERO BLOCK                   [≡]  │   │
│  │ Hero        │  │  ────────────────────────────────  │   │
│  │ ├ Centered  │  │  Variant: Centered                 │   │
│  │ ├ Split     │  │  Badge: ✓ Enabled                  │   │
│  │ ├ With Form │  │  Stats: ✓ Enabled                  │   │
│  │ └ Video     │  │  [Edit Block Settings]             │   │
│  │             │  │                                    │   │
│  │ Trust       │  ├────────────────────────────────────┤   │
│  │ ├ Logo Bar  │  │                                    │   │
│  │ ├ Stats     │  │  SERVICES GRID BLOCK          [≡]  │   │
│  │ └ Testimony │  │  ────────────────────────────────  │   │
│  │             │  │  Layout: Grid (4 columns)          │   │
│  │ Services    │  │  Source: Database                  │   │
│  │ ├ Grid      │  │  Limit: 8 services                 │   │
│  │ ├ List      │  │  [Edit Block Settings]             │   │
│  │ └ Featured  │  │                                    │   │
│  │             │  ├────────────────────────────────────┤   │
│  │ Process     │  │                                    │   │
│  │ ├ Steps     │  │  HOW IT WORKS BLOCK           [≡]  │   │
│  │ └ Timeline  │  │  ────────────────────────────────  │   │
│  │             │  │  Layout: Horizontal                │   │
│  │ Pricing     │  │  Steps: 4                          │   │
│  │ ├ Cards     │  │  [Edit Block Settings]             │   │
│  │ └ Table     │  │                                    │   │
│  │             │  ├────────────────────────────────────┤   │
│  │ FAQ         │  │                                    │   │
│  │ CTA         │  │  PRICING BLOCK                [≡]  │   │
│  │ Newsletter  │  │  ────────────────────────────────  │   │
│  │             │  │  Layout: Cards                     │   │
│  │ Content     │  │  State Selector: ✓ Enabled         │   │
│  │ ├ Rich Text │  │  [Edit Block Settings]             │   │
│  │ ├ Image     │  │                                    │   │
│  │ └ Video     │  │  [+ Add Block]                     │   │
│  │             │  │                                    │   │
│  │ [+ More]    │  │                                    │   │
│  └─────────────┘  └────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Block Settings Panel (Hero Example)

```
┌─────────────────────────────────────────────────────────────┐
│  Edit: Hero Block                              [×]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Layout] [Content] [Style] [Responsive]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  LAYOUT TAB                                                 │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Variant:                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Centered │ │ Split   │ │With Form│ │ Video   │          │
│  │   ✓     │ │         │ │         │ │         │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  Background:                                                │
│  Type:          [Solid        ▼]                           │
│  Color:         [#0A0F1E      ] 🎨                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  CONTENT TAB                                                │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  BADGE                                                      │
│  Enabled:       [✓]                                        │
│  Emoji:         [🇺🇸              ]                         │
│  Text:          [Trusted by 10,000+ International...]      │
│                                                             │
│  HEADLINE                                                   │
│  Text:          [Start Your US LLC in 24 Hours    ]        │
│  Highlight:     [US LLC         ] ← Word to highlight      │
│  Size:          [XL             ▼]                         │
│                                                             │
│  SUB-HEADLINE                                               │
│  Text:          [Launch your American dream from    ]      │
│                 [anywhere in the world...           ]      │
│                                                             │
│  FEATURES LIST                                              │
│  Enabled:       [✓]                                        │
│  [+ Fast 24-48 hour processing           ] [×]             │
│  [+ 100% Compliance guaranteed           ] [×]             │
│  [+ Dedicated support team               ] [×]             │
│  [+ Add Feature]                                           │
│                                                             │
│  PRIMARY CTA                                                │
│  Text:          [Start Your LLC Now      ]                 │
│  Link:          [/services/llc-formation ]                 │
│  Show Price:    [✓] From $0                                │
│                                                             │
│  SECONDARY CTA                                              │
│  Enabled:       [✓]                                        │
│  Text:          [View Pricing            ]                 │
│  Link:          [/pricing                ]                 │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  TRUST SECTION                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Show Rating:   [✓]                                        │
│  Rating Text:   [4.9/5 from 2,000+ reviews]                │
│                                                             │
│  TRUST BADGES                                               │
│  Enabled:       [✓]                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 🛡 Secure & Private                           [×]  │    │
│  │ ⏱ 24hr Processing                            [×]  │    │
│  │ 🌍 Serve 50+ Countries                       [×]  │    │
│  │ ⭐ 4.9/5 Rating                              [×]  │    │
│  │ [+ Add Badge]                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  STATS SECTION                                              │
│  Enabled:       [✓]                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Value: 10,000+    Label: LLCs Formed         [×]  │    │
│  │ Value: 50+        Label: Countries Served    [×]  │    │
│  │ Value: 4.9/5      Label: Customer Rating     [×]  │    │
│  │ Value: 24h        Label: Average Processing  [×]  │    │
│  │ [+ Add Stat]                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│                              [Cancel]  [Save Block]        │
└─────────────────────────────────────────────────────────────┘
```

### Preview Mode with Device Toggle

```
┌─────────────────────────────────────────────────────────────┐
│  Preview Mode                    [🖥 Desktop] [📱 Mobile]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │     [🇺🇸 Trusted by 10,000+ Entrepreneurs]           │ │
│  │                                                       │ │
│  │        Start Your US LLC in 24 Hours                 │ │
│  │        ════════════════════════════════               │ │
│  │   Launch your American dream from anywhere in the    │ │
│  │                      world.                          │ │
│  │                                                       │ │
│  │    ✓ Fast    ✓ Guaranteed    ✓ Expert Support        │ │
│  │                                                       │ │
│  │      [Start Your LLC Now]    [View Pricing]          │ │
│  │                                                       │ │
│  │           ⭐⭐⭐⭐⭐ 4.9/5 from 2,000+ reviews          │ │
│  │                                                       │ │
│  │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │ │
│  │   │Secure│ │ 24hr │ │ 50+  │ │ 4.9  │              │ │
│  │   └──────┘ └──────┘ └──────┘ └──────┘              │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│        [Click any section to edit]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### New Models

```prisma
// Landing page definition
model LandingPage {
  id          String   @id @default(cuid())
  slug        String   @unique // "homepage", "llc-landing", etc.
  name        String   // "Homepage", "LLC Landing Page"
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false) // Is this the main homepage?

  // SEO
  metaTitle       String?
  metaDescription String?
  ogImage         String?

  // Page blocks
  blocks      LandingPageBlock[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?

  // Versioning
  version     Int      @default(1)

  @@index([slug])
  @@index([isActive, isDefault])
}

// Individual block on a landing page
model LandingPageBlock {
  id            String   @id @default(cuid())
  landingPageId String
  landingPage   LandingPage @relation(fields: [landingPageId], references: [id], onDelete: Cascade)

  // Block identity
  type          String   // "hero", "services-grid", "testimonials", etc.
  name          String?  // Optional custom name for admin reference
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)

  // Block settings (JSON)
  settings      Json     // Type-specific settings

  // Responsive visibility
  hideOnMobile  Boolean  @default(false)
  hideOnDesktop Boolean  @default(false)

  // A/B Testing
  variant       String?  // "A", "B", "C" for A/B testing

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([landingPageId, sortOrder])
  @@index([landingPageId, isActive])
}

// Reusable block templates
model BlockTemplate {
  id          String   @id @default(cuid())
  name        String   // "Bizee-style Hero", "Minimal CTA"
  category    String   // "hero", "cta", "testimonials"
  type        String   // Block type this template is for
  settings    Json     // Pre-configured settings
  thumbnail   String?  // Preview image
  isBuiltIn   Boolean  @default(false) // System template vs user-created

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([type])
}

// Partner/Press logos for logo-bar block
model PartnerLogo {
  id          String   @id @default(cuid())
  name        String
  imageUrl    String
  link        String?
  category    String   @default("partner") // "partner", "press", "certification"
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category, isActive])
}

// Site-wide statistics (for stats-counter block)
model SiteStat {
  id          String   @id @default(cuid())
  key         String   @unique // "llcs_formed", "countries_served", "rating"
  value       String   // "10,000+"
  label       String   // "LLCs Formed"
  icon        String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Update Existing Models

```prisma
// Extend Testimonial model
model Testimonial {
  // ... existing fields ...

  // Add for landing page flexibility
  featured    Boolean  @default(false) // Show in featured testimonial block

  @@index([isActive, featured])
}

// Extend FAQ model
model FAQ {
  // ... existing fields ...

  // Add category for tabbed FAQ block
  category    String?

  @@index([category, isActive])
}
```

---

## Implementation Phases

### Phase 1: Database & Core Architecture

**Tasks:**
1. Create new Prisma models (LandingPage, LandingPageBlock, BlockTemplate, etc.)
2. Run migrations
3. Create block type registry system
4. Define TypeScript interfaces for all block types
5. Build block validation with Zod schemas
6. Create seed data for default homepage configuration

**Files to Create:**
```
src/lib/landing-blocks/
├── registry.ts           # Block registration system
├── types.ts              # TypeScript interfaces
├── defaults.ts           # Default block configurations
├── validators/           # Zod schemas per block type
│   ├── hero.ts
│   ├── services-grid.ts
│   ├── testimonials.ts
│   └── ...
└── utils.ts              # Helper functions
```

### Phase 2: Block Components (Frontend)

**Tasks:**
1. Build Hero block with all variants
2. Build Services Grid block
3. Build How It Works block
4. Build Pricing block
5. Build Testimonials block
6. Build FAQ block
7. Build CTA Section block
8. Build Logo Bar block
9. Build Stats Counter block
10. Build Newsletter block

**Files to Create:**
```
src/components/landing-blocks/
├── hero/
│   ├── index.tsx              # Main component
│   ├── variants/
│   │   ├── centered.tsx
│   │   ├── split.tsx
│   │   ├── slider.tsx         # Image carousel slider variant
│   │   ├── with-form.tsx
│   │   └── video.tsx
│   └── hero.types.ts
├── services-grid/
│   ├── index.tsx
│   └── services-grid.types.ts
├── how-it-works/
│   ├── index.tsx
│   ├── variants/
│   │   ├── horizontal.tsx
│   │   ├── vertical.tsx
│   │   └── accordion.tsx
│   └── how-it-works.types.ts
├── pricing/
├── testimonials/
├── faq/
├── cta-section/
├── logo-bar/
├── stats-counter/
├── newsletter/
└── index.ts               # Export all blocks
```

### Phase 3: Page Renderer

**Tasks:**
1. Create landing page renderer component
2. Build block factory pattern
3. Implement responsive visibility logic
4. Add JSON-LD schema generation per page
5. Implement fallback to default layout

**Files to Create:**
```
src/components/landing-page/
├── page-renderer.tsx      # Main renderer
├── block-wrapper.tsx      # Wrapper with edit/visibility
└── json-ld-generator.ts   # SEO schema generation

src/app/(marketing)/page.tsx  # Update to use renderer
```

### Phase 4: Admin Panel - Block Library

**Tasks:**
1. Create landing page builder route
2. Build block library sidebar
3. Create drag-and-drop canvas (use @dnd-kit/core)
4. Build block card components
5. Implement add/remove block functionality

**Files to Create:**
```
src/app/admin/appearance/landing-page/
├── page.tsx               # Main builder page
├── components/
│   ├── block-library.tsx  # Left sidebar
│   ├── block-canvas.tsx   # Center drag-drop area
│   ├── block-card.tsx     # Individual block card
│   └── toolbar.tsx        # Top toolbar
└── hooks/
    ├── use-blocks.ts      # Block state management
    └── use-drag-drop.ts   # DnD logic
```

### Phase 5: Admin Panel - Block Settings

**Tasks:**
1. Create settings panel component
2. Build dynamic form generation based on block type
3. Create form components (color picker, icon selector, rich text, etc.)
4. Implement real-time preview updates
5. Add save/publish workflow

**Files to Create:**
```
src/app/admin/appearance/landing-page/
├── components/
│   ├── settings-panel.tsx       # Right sidebar
│   ├── settings-forms/          # Per-block settings forms
│   │   ├── hero-settings.tsx
│   │   ├── services-settings.tsx
│   │   ├── testimonials-settings.tsx
│   │   └── ...
│   ├── form-controls/           # Reusable form components
│   │   ├── color-picker.tsx
│   │   ├── icon-selector.tsx
│   │   ├── image-upload.tsx
│   │   ├── rich-text-editor.tsx
│   │   └── link-selector.tsx
│   └── preview-frame.tsx        # Live preview iframe
```

### Phase 6: API Routes

**Tasks:**
1. CRUD endpoints for landing pages
2. Block management endpoints
3. Block reordering endpoint
4. Publish/unpublish workflow
5. Template management

**Files to Create:**
```
src/app/api/admin/landing-pages/
├── route.ts                     # GET, POST (list, create)
├── [id]/
│   ├── route.ts                 # GET, PUT, DELETE
│   ├── blocks/
│   │   ├── route.ts             # GET, POST (list, add)
│   │   ├── [blockId]/route.ts   # PUT, DELETE
│   │   └── reorder/route.ts     # POST (reorder blocks)
│   └── publish/route.ts         # POST (publish page)
└── templates/
    ├── route.ts                 # GET, POST
    └── [id]/route.ts            # GET, PUT, DELETE
```

### Phase 7: Templates & Polish

**Tasks:**
1. Create built-in block templates
2. Add template preview thumbnails
3. Implement duplicate block functionality
4. Add undo/redo functionality
5. Build responsive preview mode
6. Add keyboard shortcuts
7. Performance optimization

---

## Technical Specifications

### Block Registry Pattern

```typescript
// src/lib/landing-blocks/registry.ts

import { z } from "zod";

export type BlockCategory =
  | "hero"
  | "trust"
  | "services"
  | "process"
  | "pricing"
  | "faq"
  | "cta"
  | "content"
  | "navigation"
  | "lead-capture";

export interface BlockDefinition<T = unknown> {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: BlockCategory;
  defaultSettings: T;
  settingsSchema: z.ZodSchema<T>;
  component: React.ComponentType<{ settings: T }>;
  settingsPanel: React.ComponentType<{
    settings: T;
    onChange: (settings: T) => void;
  }>;
  // Preview thumbnail for block library
  thumbnail?: string;
}

class BlockRegistry {
  private blocks = new Map<string, BlockDefinition>();

  register<T>(definition: BlockDefinition<T>) {
    this.blocks.set(definition.type, definition as BlockDefinition);
  }

  get(type: string): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getByCategory(category: BlockCategory): BlockDefinition[] {
    return this.getAll().filter(b => b.category === category);
  }

  getComponent(type: string) {
    return this.get(type)?.component;
  }

  getSettingsPanel(type: string) {
    return this.get(type)?.settingsPanel;
  }

  validateSettings(type: string, settings: unknown) {
    const definition = this.get(type);
    if (!definition) return { success: false, error: "Unknown block type" };
    return definition.settingsSchema.safeParse(settings);
  }
}

export const blockRegistry = new BlockRegistry();
```

### Page Renderer

```typescript
// src/components/landing-page/page-renderer.tsx

import { blockRegistry } from "@/lib/landing-blocks/registry";
import type { LandingPage, LandingPageBlock } from "@prisma/client";

interface PageRendererProps {
  page: LandingPage & { blocks: LandingPageBlock[] };
}

export function LandingPageRenderer({ page }: PageRendererProps) {
  const sortedBlocks = page.blocks
    .filter(b => b.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="landing-page">
      {sortedBlocks.map(block => {
        const BlockComponent = blockRegistry.getComponent(block.type);

        if (!BlockComponent) {
          console.warn(`Unknown block type: ${block.type}`);
          return null;
        }

        // Handle responsive visibility
        const responsiveClasses = [
          block.hideOnMobile && "hidden md:block",
          block.hideOnDesktop && "md:hidden",
        ].filter(Boolean).join(" ");

        return (
          <div
            key={block.id}
            className={responsiveClasses}
            data-block-type={block.type}
            data-block-id={block.id}
          >
            <BlockComponent settings={block.settings} />
          </div>
        );
      })}
    </div>
  );
}
```

### Hero Block Implementation Example

```typescript
// src/components/landing-blocks/hero/index.tsx

import { heroSettingsSchema, type HeroSettings } from "./hero.types";
import { HeroCentered } from "./variants/centered";
import { HeroSplit } from "./variants/split";
import { HeroSlider } from "./variants/slider";
import { HeroWithForm } from "./variants/with-form";
import { HeroVideo } from "./variants/video";
import { blockRegistry } from "@/lib/landing-blocks/registry";

const variants = {
  centered: HeroCentered,
  split: HeroSplit,
  slider: HeroSlider,
  "with-form": HeroWithForm,
  video: HeroVideo,
};

function HeroBlock({ settings }: { settings: HeroSettings }) {
  const Variant = variants[settings.variant] || HeroCentered;
  return <Variant settings={settings} />;
}

// Register the block
blockRegistry.register({
  type: "hero",
  name: "Hero Section",
  description: "Main hero section with headline, CTA, and trust elements",
  icon: "Layout",
  category: "hero",
  defaultSettings: {
    variant: "centered",
    background: {
      type: "solid",
      color: "#0A0F1E",
    },
    badge: {
      enabled: true,
      text: "Trusted by 10,000+ International Entrepreneurs",
      emoji: "🇺🇸",
      style: "default",
    },
    headline: {
      text: "Start Your US LLC in 24 Hours",
      highlightWord: "US LLC",
      size: "xl",
    },
    subheadline: {
      text: "Launch your American dream from anywhere in the world.",
      size: "lg",
    },
    features: {
      enabled: true,
      items: [
        "Fast 24-48 hour processing",
        "100% Compliance guaranteed",
        "Dedicated support team",
      ],
      icon: "checkCircle",
    },
    primaryCTA: {
      text: "Start Your LLC Now",
      link: "/services/llc-formation",
      showPrice: true,
      priceText: "From $0",
      variant: "solid",
    },
    secondaryCTA: {
      enabled: true,
      text: "View Pricing",
      link: "/pricing",
      variant: "outline",
    },
    trustText: {
      enabled: true,
      text: "4.9/5 from 2,000+ reviews",
      showRating: true,
      rating: 4.9,
      reviewCount: 2000,
    },
    trustBadges: {
      enabled: true,
      items: [
        { icon: "Shield", text: "Secure & Private" },
        { icon: "Clock", text: "24hr Processing" },
        { icon: "Globe", text: "Serve 50+ Countries" },
        { icon: "Star", text: "4.9/5 Rating" },
      ],
    },
    stats: {
      enabled: true,
      items: [
        { value: "10,000+", label: "LLCs Formed" },
        { value: "50+", label: "Countries Served" },
        { value: "4.9/5", label: "Customer Rating" },
        { value: "24h", label: "Average Processing" },
      ],
    },
  } satisfies HeroSettings,
  settingsSchema: heroSettingsSchema,
  component: HeroBlock,
  settingsPanel: HeroSettingsPanel,
  thumbnail: "/admin/block-thumbnails/hero.png",
});

export { HeroBlock };
```

### Admin Page Builder State Management

```typescript
// src/app/admin/appearance/landing-page/hooks/use-blocks.ts

import { useState, useCallback } from "react";
import type { LandingPageBlock } from "@prisma/client";

export function useBlocksState(initialBlocks: LandingPageBlock[]) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const addBlock = useCallback((type: string, position?: number) => {
    const newBlock: Partial<LandingPageBlock> = {
      id: `temp-${Date.now()}`,
      type,
      sortOrder: position ?? blocks.length,
      isActive: true,
      settings: blockRegistry.get(type)?.defaultSettings ?? {},
    };

    setBlocks(prev => {
      const updated = [...prev];
      if (position !== undefined) {
        updated.splice(position, 0, newBlock as LandingPageBlock);
        // Update sort orders
        return updated.map((b, i) => ({ ...b, sortOrder: i }));
      }
      return [...updated, newBlock as LandingPageBlock];
    });

    setSelectedBlockId(newBlock.id!);
    setIsDirty(true);
  }, [blocks.length]);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    setIsDirty(true);
  }, [selectedBlockId]);

  const updateBlockSettings = useCallback((blockId: string, settings: unknown) => {
    setBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, settings } : b)
    );
    setIsDirty(true);
  }, []);

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((b, i) => ({ ...b, sortOrder: i }));
    });
    setIsDirty(true);
  }, []);

  const toggleBlockVisibility = useCallback((blockId: string) => {
    setBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, isActive: !b.isActive } : b)
    );
    setIsDirty(true);
  }, []);

  const duplicateBlock = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newBlock = {
      ...block,
      id: `temp-${Date.now()}`,
      sortOrder: block.sortOrder + 1,
    };

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId);
      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated.map((b, i) => ({ ...b, sortOrder: i }));
    });

    setSelectedBlockId(newBlock.id);
    setIsDirty(true);
  }, [blocks]);

  return {
    blocks,
    selectedBlockId,
    selectedBlock: blocks.find(b => b.id === selectedBlockId),
    isDirty,
    addBlock,
    removeBlock,
    updateBlockSettings,
    reorderBlocks,
    toggleBlockVisibility,
    duplicateBlock,
    setSelectedBlockId,
    resetDirty: () => setIsDirty(false),
  };
}
```

---

## Default Homepage Configuration

```typescript
// src/lib/landing-blocks/defaults.ts

export const defaultHomepageBlocks = [
  {
    type: "hero",
    sortOrder: 0,
    settings: {
      variant: "centered",
      // ... full default hero settings
    },
  },
  {
    type: "services-grid",
    sortOrder: 1,
    settings: {
      layout: "grid",
      source: "database",
      filters: { featured: true, limit: 8 },
      showPrice: true,
      columns: 4,
    },
  },
  {
    type: "how-it-works",
    sortOrder: 2,
    settings: {
      layout: "horizontal",
      // ... steps configuration
    },
  },
  {
    type: "pricing",
    sortOrder: 3,
    settings: {
      layout: "cards",
      stateSelector: { enabled: true, position: "above" },
    },
  },
  {
    type: "testimonials",
    sortOrder: 4,
    settings: {
      layout: "grid",
      source: "database",
      limit: 6,
      showRating: true,
      trustFooter: { enabled: true },
    },
  },
  {
    type: "faq",
    sortOrder: 5,
    settings: {
      layout: "accordion",
      source: "database",
      filters: { limit: 8 },
      expandFirst: true,
    },
  },
  {
    type: "cta-section",
    sortOrder: 6,
    settings: {
      variant: "banner",
      background: { type: "solid", color: "#F97316" },
      headline: "Ready to Start Your US Business?",
      // ... full CTA settings
    },
  },
];
```

---

## File Structure

```
src/
├── lib/
│   └── landing-blocks/
│       ├── registry.ts              # Block registration system
│       ├── types.ts                 # Shared TypeScript types
│       ├── defaults.ts              # Default configurations
│       ├── utils.ts                 # Helper functions
│       └── validators/              # Zod schemas
│           ├── hero.ts
│           ├── services-grid.ts
│           ├── how-it-works.ts
│           ├── pricing.ts
│           ├── testimonials.ts
│           ├── faq.ts
│           ├── cta-section.ts
│           ├── logo-bar.ts
│           ├── stats-counter.ts
│           └── newsletter.ts
│
├── components/
│   └── landing-blocks/
│       ├── hero/
│       │   ├── index.tsx
│       │   ├── hero.types.ts
│       │   ├── settings.tsx
│       │   └── variants/
│       │       ├── centered.tsx
│       │       ├── split.tsx
│       │       ├── slider.tsx          # Image carousel slider
│       │       ├── with-form.tsx
│       │       └── video.tsx
│       ├── services-grid/
│       ├── how-it-works/
│       ├── pricing/
│       ├── testimonials/
│       ├── faq/
│       ├── cta-section/
│       ├── logo-bar/
│       ├── stats-counter/
│       ├── newsletter/
│       └── index.ts                 # Export all blocks
│
│   └── landing-page/
│       ├── page-renderer.tsx        # Main renderer
│       ├── block-wrapper.tsx        # Block container
│       └── json-ld-generator.ts     # SEO schemas
│
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                 # Update to use renderer
│   │
│   ├── admin/
│   │   └── appearance/
│   │       └── landing-page/
│   │           ├── page.tsx         # Builder main page
│   │           ├── components/
│   │           │   ├── block-library.tsx
│   │           │   ├── block-canvas.tsx
│   │           │   ├── block-card.tsx
│   │           │   ├── settings-panel.tsx
│   │           │   ├── preview-frame.tsx
│   │           │   ├── toolbar.tsx
│   │           │   └── settings-forms/
│   │           │       ├── hero-settings.tsx
│   │           │       ├── services-settings.tsx
│   │           │       └── ...
│   │           └── hooks/
│   │               ├── use-blocks.ts
│   │               └── use-drag-drop.ts
│   │
│   └── api/
│       └── admin/
│           └── landing-pages/
│               ├── route.ts
│               ├── [id]/
│               │   ├── route.ts
│               │   ├── blocks/
│               │   │   ├── route.ts
│               │   │   ├── [blockId]/route.ts
│               │   │   └── reorder/route.ts
│               │   └── publish/route.ts
│               └── templates/
│                   ├── route.ts
│                   └── [id]/route.ts
│
└── prisma/
    └── schema.prisma                # Updated with new models
```

---

## Unified Widget Architecture (Footer ↔ Landing Page)

### Background

The existing Footer Builder has **12 widget types** with extensive styling options (17 button hover effects, social icon styling, etc.). Instead of duplicating this functionality for landing page blocks, we recommend a **unified widget architecture** that shares core components between contexts.

### Footer Widgets Available for Reuse

| Widget | Footer Use | Landing Page Potential | Priority |
|--------|------------|------------------------|----------|
| NEWSLETTER | Email signup (compact) | Hero newsletter, lead capture | 🔴 High |
| BUTTON | Styled CTA (17 effects) | CTA sections, all buttons | 🔴 High |
| SOCIAL | Social icons | Social proof sections | 🔴 High |
| CONTACT | Email, phone, address | Contact sections | 🟡 Medium |
| TEXT | Custom text | Rich text blocks | 🟡 Medium |
| RECENT_POSTS | Blog feed | Blog section | 🟡 Medium |
| LINKS | Navigation links | Quick links, sitemap | 🟡 Medium |
| CUSTOM_HTML | Raw HTML | Embed block | 🟡 Medium |
| BRAND | Logo + tagline | Partial (hero already has) | 🟢 Low |
| SERVICES | Auto-populated | Already planned as block | ✅ Done |
| STATES | State list | Niche use | 🟢 Low |
| APP_DOWNLOAD | App badges | Future use | 🟢 Low |

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED WIDGET CORE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  src/lib/shared-widgets/                                    │
│  ├── registry.ts          # Unified widget registration     │
│  ├── types.ts             # Shared interfaces               │
│  └── components/                                            │
│      ├── newsletter/                                        │
│      │   ├── newsletter-core.tsx    # Shared logic         │
│      │   ├── newsletter-footer.tsx  # Footer wrapper       │
│      │   └── newsletter-landing.tsx # Landing wrapper      │
│      ├── button/                                            │
│      │   ├── button-core.tsx        # 17 hover effects     │
│      │   ├── button-footer.tsx                             │
│      │   └── button-landing.tsx                            │
│      ├── social/                                            │
│      ├── contact/                                           │
│      ├── text/                                              │
│      ├── links/                                             │
│      ├── recent-posts/                                      │
│      └── custom-html/                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Context-Aware Widget Interface

```typescript
// src/lib/shared-widgets/types.ts

interface BaseWidgetSettings {
  id: string;
  type: WidgetType;
  title?: string;
  showTitle: boolean;
  customClass?: string;
}

interface WidgetContext {
  context: "footer" | "landing" | "sidebar";

  // Footer-specific
  footer?: {
    column: number;
    sortOrder: number;
  };

  // Landing page-specific
  landing?: {
    variant: string;
    background: BackgroundSettings;
    padding: PaddingSettings;
    animation?: AnimationSettings;
  };
}

// Example: Newsletter works in both contexts with different variants
interface NewsletterWidgetSettings extends BaseWidgetSettings {
  type: "newsletter";
  content: {
    headline?: string;
    subtitle?: string;
    incentive?: string;
    buttonText: string;
    placeholder?: string;
    // Footer: inline, stacked, floating
    // Landing: adds hero, split, card variants
    style: "inline" | "stacked" | "floating" | "hero" | "split" | "card";
  };
}
```

### Variant Expansion per Context

```typescript
// Footer context: 3 variants (compact)
type FooterNewsletterVariant = "inline" | "stacked" | "floating";

// Landing page context: 6 variants (includes footer + expanded)
type LandingNewsletterVariant =
  | "inline"      // Same as footer
  | "stacked"     // Same as footer
  | "floating"    // Same as footer
  | "hero"        // Full-width hero section (landing only)
  | "split"       // Image + form side by side (landing only)
  | "card";       // Centered card design (landing only)
```

### Button Hover Effects (Shared)

The footer builder has **17 button hover effects** that should be available in landing page CTAs:

```typescript
type ButtonHoverEffect =
  | "none"
  | "darken" | "lighten"
  | "shadow-lift" | "shadow-press"
  | "scale-up" | "scale-down"
  | "slide-fill" | "border-fill"
  | "gradient-shift" | "ripple"
  | "glow-pulse" | "heartbeat"
  | "craft-expand" | "flow-border"
  | "stitches" | "ring-hover"
  | "neural";
```

### Social Icon Styling (Shared)

```typescript
interface SocialIconStyling {
  shape: "circle" | "square" | "rounded" | "pill";
  size: "sm" | "md" | "lg" | "xl";
  colorMode: "brand" | "monochrome" | "accent";
  hoverEffect: "scale" | "lift" | "glow" | "rotate";
  bgStyle: "none" | "subtle" | "solid" | "outline";
}
```

### Visual Comparison

```
┌─────────────────────────────────────────────────────────────┐
│  NEWSLETTER WIDGET: FOOTER CONTEXT (Compact)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Subscribe to our newsletter                               │
│  [email@example.com        ] [Subscribe]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  NEWSLETTER WIDGET: LANDING PAGE CONTEXT (Hero Variant)    │
├─────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░                                                    ░░░░│
│░░░░         Stay Updated with LLCPad                   ░░░░│
│░░░░         ════════════════════════                   ░░░░│
│░░░░   Get the latest tips on LLC formation, Amazon     ░░░░│
│░░░░   selling, and international business.             ░░░░│
│░░░░                                                    ░░░░│
│░░░░   [email@example.com                    ]          ░░░░│
│░░░░   [Subscribe Now →]  (with hover effect!)          ░░░░│
│░░░░                                                    ░░░░│
│░░░░   🎁 Free LLC Formation Guide included!            ░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────────────────────────┘
```

### Implementation Benefits

1. **Code Reuse**: Button hover effects, social styling shared across contexts
2. **Consistency**: Same widget looks/behaves consistently site-wide
3. **Maintainability**: Fix once, apply everywhere
4. **Feature Parity**: Landing page CTAs get footer's 17 hover effects
5. **Reduced Bundle**: Shared code instead of duplicated

### Migration Strategy

**Phase 1**: Extract shared widget core from footer builder
```
- Create src/lib/shared-widgets/
- Move core logic from footer widgets
- Footer continues working with wrappers
```

**Phase 2**: Create landing page wrappers
```
- Add landing-specific variants
- Implement background/animation support
- Register as landing page blocks
```

**Phase 3**: Unify settings panels
```
- Shared settings components
- Context-specific options shown/hidden
- Consistent admin UX
```

### Updated File Structure

```
src/lib/
├── shared-widgets/                    # NEW: Shared widget system
│   ├── registry.ts
│   ├── types.ts
│   └── components/
│       ├── newsletter/
│       │   ├── core.tsx
│       │   ├── footer-wrapper.tsx
│       │   └── landing-wrapper.tsx
│       ├── button/
│       │   ├── core.tsx               # 17 hover effects
│       │   ├── effects.ts             # Effect animations
│       │   ├── footer-wrapper.tsx
│       │   └── landing-wrapper.tsx
│       ├── social/
│       ├── contact/
│       └── ...
│
├── landing-blocks/                    # Landing-specific blocks
│   ├── hero/                          # Not shared (landing-only)
│   ├── pricing/                       # Not shared (landing-only)
│   ├── services-grid/                 # Not shared (landing-only)
│   ├── newsletter/                    # Uses shared-widgets/newsletter
│   ├── cta-section/                   # Uses shared-widgets/button
│   └── social-proof/                  # Uses shared-widgets/social
│
└── footer/                            # Footer-specific
    └── widgets/                       # Uses shared-widgets/*
```

---

## Summary

This redesign transforms LLCPad's homepage into a fully customizable, block-based landing page builder with:

### Key Features

- **30+ Block Types**: Hero, services, testimonials, FAQ, pricing, CTAs, and more
- **Multiple Variants**: Each block type has 2-4 layout options
- **Drag-and-Drop**: Visual block reordering with @dnd-kit
- **Real-time Preview**: See changes instantly with device toggles
- **Responsive Controls**: Hide blocks on mobile or desktop
- **Template System**: Save and reuse block configurations
- **SEO Ready**: JSON-LD schema generation per page
- **Performance Optimized**: Server-rendered blocks, lazy loading

### Benefits

1. **Admin Empowerment**: Marketing team can update homepage without developers
2. **Conversion Optimization**: Test different layouts and copy quickly
3. **Brand Consistency**: Pre-styled blocks ensure design quality
4. **Scalability**: Same system can power multiple landing pages
5. **2025 Best Practices**: Every block designed based on current research

### Comparison to Service Details Redesign

| Aspect | Service Details | Landing Page |
|--------|----------------|--------------|
| Scope | Per-service pages | Site-wide homepage |
| Blocks | Service-specific | General marketing |
| Data | Heavy DB integration | More static content |
| Priority | Service conversion | Brand introduction |

Both systems share the same block registry architecture, enabling code reuse and consistent admin experience.

---

## References

- [Unbounce - SaaS Landing Pages](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/)
- [KlientBoost - High-Converting Landing Pages](https://www.klientboost.com/landing-pages/saas-landing-page/)
- [Apexure - Best SaaS Landing Pages 2025](https://www.apexure.com/blog/best-saas-landing-pages-with-analysis)
- [HubSpot - SaaS Landing Page Inspiration](https://blog.hubspot.com/marketing/saas-landing-page)
- [Prismic - Hero Section Best Practices](https://prismic.io/blog/website-hero-section)
- [LogRocket - Hero Section Examples](https://blog.logrocket.com/ux-design/hero-section-examples-best-practices/)
- [OneNine - Homepage Design Best Practices 2025](https://onenine.com/homepage-design-best-practices/)
- [Crocoblock - Elementor Landing Page Practices](https://crocoblock.com/blog/landing-page-practices-and-design/)
- [Elementor - Block-Based Building](https://elementor.com/blog/introducing-blocks/)
- [Bizee - LLC Formation](https://bizee.com)
- [ZenBusiness - Business Formation](https://www.zenbusiness.com/)
