# Section-Based Page Builder System

## Overview

Elementor/Webflow style page builder যেখানে:
- **Section** = Row container with column layout
- **Column** = Container within section
- **Widget** = Atomic component inside column

---

## Core Concept

```
Page
  └── Section (1 col / 2 col / 3 col / custom)
        └── Column
              └── Widget (Hero Content, Image, Lead Form, etc.)
```

---

## User Flow

### Example 1: Simple Hero + Trust + Stats

```
Step 1: Click "Add Block" → Select 1 Column
        → Add "Hero Content" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Trust Badges" widget (full width)

Step 3: Click "Add Block" → Select 1 Column
        → Add "Stats Section" widget (full width)
```

**Result:**
```
┌─────────────────────────────────────────┐
│           Hero Content                  │
│  Badge
│ Headline
│  Subheadline         
│  Features  
│  Buttons  
│  Trust Text        
├─────────────────────────────────────────┤
│  [Badge] [Badge] [Badge] [Badge]        │  ← Trust Badges
├─────────────────────────────────────────┤
│  10,000+    50+     4.9/5     24h       │  ← Stats Section
└─────────────────────────────────────────┘
```

### Example 2: Split Hero with Lead Form

```
Step 1: Click "Add Block" → Select 2 Columns (50/50)
        → Left: Add "Hero Content" widget
        → Right: Add "Lead Form" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Trust Badges" widget
```

**Result:**
```
┌──────────────────────┬──────────────────────┐
│    Hero Content      │     Lead Form        │
│    - Badge           │     - Name           │
│    - Headline        │     - Email          │
│    - Subheadline     │     - Phone          │
│    - Features        │     - Submit         │
│    - Buttons         │                      │
├──────────────────────┴──────────────────────┤
│    Trust Badges (Full Width)                │
└─────────────────────────────────────────────┘
```

### Example 3: Hero with Image

```
Step 1: Click "Add Block" → Select 2 Columns (50/50)
        → Left: Add "Hero Content" widget
        → Right: Add "Image" widget

Step 2: Click "Add Block" → Select 1 Column
        → Add "Stats Section" widget
```

---

## Column Layouts

```
1 Column:     [████████████████████████]

2 Columns:    [███████████] [███████████]  (50/50)
              [███████] [███████████████]  (33/66)
              [███████████████] [███████]  (66/33)

3 Columns:    [███████] [███████] [███████]  (33/33/33)
              [████] [████████████] [████]   (25/50/25)

4 Columns:    [█████] [█████] [█████] [█████]  (25/25/25/25)
```

---

## Data Structure

### Page Schema

```typescript
interface LandingPage {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  globalSettings: GlobalSettings;
}
```

### Section Schema

```typescript
interface Section {
  id: string;
  order: number;
  layout: SectionLayout;
  columns: Column[];
  settings: {
    fullWidth: boolean;
    backgroundColor?: string;
    backgroundImage?: string;
    paddingTop: number;
    paddingBottom: number;
    gap: number;
    maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  };
}

type SectionLayout =
  | "1"           // Full width
  | "1-1"         // 50/50
  | "1-2"         // 33/66
  | "2-1"         // 66/33
  | "1-1-1"       // 33/33/33
  | "1-2-1"       // 25/50/25
  | "1-1-1-1";    // 25/25/25/25
```

### Column Schema

```typescript
interface Column {
  id: string;
  widgets: Widget[];
  settings: {
    verticalAlign: "top" | "center" | "bottom";
    padding: number;
    backgroundColor?: string;
  };
}
```

### Widget Schema

```typescript
interface Widget {
  id: string;
  type: WidgetType;
  settings: Record<string, any>;  // Widget-specific settings
}

type WidgetType =
  // Content Widgets
  | "hero-content"
  | "text-block"
  | "heading"
  | "rich-text"

  // Media Widgets
  | "image"
  | "image-slider"
  | "video"
  | "gallery"
  | "lottie"

  // Form Widgets
  | "lead-form"
  | "contact-form"
  | "newsletter"

  // Social Proof Widgets
  | "trust-badges"
  | "stats-section"
  | "testimonial"
  | "testimonials-carousel"
  | "logo-cloud"
  | "reviews"

  // Commerce Widgets
  | "pricing-card"
  | "pricing-table"
  | "feature-comparison"

  // Layout Widgets
  | "divider"
  | "accordion"
  | "tabs"

  // CTA Widgets
  | "cta-banner"
  | "button-group"

  // Advanced Widgets
  | "faq"
  | "timeline"
  | "team-grid"
  | "feature-grid"
  | "countdown"
  | "map"
  | "custom-html";
```

---

## Widget Definitions

### 1. Hero Content Widget

The main hero text content - grouped together for convenience.

```typescript
interface HeroContentWidget {
  type: "hero-content";
  settings: {
    // Badge
    badge: {
      show: boolean;
      icon: string;
      text: string;
      style: "pill" | "outline" | "solid";
    };

    // Headline
    headline: {
      text: string;
      highlightWords: string[];
      highlightColor: string;
      size: "sm" | "md" | "lg" | "xl";
    };

    // Subheadline
    subheadline: {
      text: string;
      show: boolean;
    };

    // Features List
    features: {
      show: boolean;
      items: Array<{ icon: string; text: string }>;
      columns: 1 | 2 | 3;
      iconColor: string;
    };

    // Primary Button
    primaryButton: {
      show: boolean;
      text: string;
      link: string;
      badge?: string;
      style: ButtonStyle;
    };

    // Secondary Button
    secondaryButton: {
      show: boolean;
      text: string;
      link: string;
      style: "link" | "outline" | "ghost";
    };

    // Trust Text (with stars)
    trustText: {
      show: boolean;
      rating: number;
      text: string;
    };

    // Alignment
    alignment: "left" | "center" | "right";
  };
}
```

### 2. Image Widget

Modern, feature-rich image widget with professional effects inspired by Elementor, Webflow, and 2025-2026 design trends.

```typescript
interface ImageWidget {
  type: "image";
  settings: {
    // === BASIC ===
    src: string;                    // Image URL
    alt: string;                    // Alt text for accessibility
    title?: string;                 // Title attribute (tooltip)

    // === SIZE & FIT ===
    objectFit: "cover" | "contain" | "fill" | "none" | "scale-down";
    aspectRatio: "auto" | "1:1" | "4:3" | "3:2" | "16:9" | "21:9" | "2:3" | "3:4" | "9:16";
    maxWidth?: number;              // Max width as percentage (1-100)
    alignment: "left" | "center" | "right";

    // === STYLING ===
    borderRadius: number;           // Border radius in pixels
    shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "glow";
    shadowColor?: string;           // Custom shadow color for glow effect
    border: {
      width: number;
      color: string;
      style: "solid" | "dashed" | "dotted" | "double";
    };

    // === LINK OPTIONS ===
    link?: {
      url: string;
      openInNewTab: boolean;
      lightbox: boolean;            // Open in fullscreen lightbox modal
    };

    // === CAPTION ===
    caption?: {
      enabled: boolean;
      text: string;
      position: "below" | "overlay-bottom" | "overlay-top" | "overlay-center";
      backgroundColor?: string;
      textColor?: string;
      fontSize: "xs" | "sm" | "md" | "lg";
    };

    // === HOVER EFFECTS ===
    hoverEffect:
      | "none"
      | "zoom"                      // Scale up
      | "zoom-out"                  // Scale down
      | "brighten"                  // Increase brightness
      | "darken"                    // Decrease brightness
      | "grayscale"                 // Convert to grayscale
      | "blur"                      // Apply blur
      | "rotate"                    // Slight rotation
      | "tilt-left"                 // Tilt to left
      | "tilt-right"                // Tilt to right
      | "lift"                      // Lift up with shadow
      | "glow"                      // Glow effect with shadow color
      | "shine"                     // Diagonal shine sweep
      | "overlay-fade";             // Fade in overlay
    hoverTransitionDuration: number; // Transition duration in ms

    // === OVERLAY ===
    overlay?: {
      enabled: boolean;
      color: string;
      opacity: number;              // 0-1
      showOnHover: boolean;         // Only show on hover
    };

    // === ENTRANCE ANIMATION ===
    animation: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "bounce" | "flip";
    animationDuration: number;      // Duration in ms
    animationDelay: number;         // Delay in ms

    // === FLOATING ANIMATION ===
    floatAnimation: "none" | "float" | "pulse" | "bounce" | "swing" | "wobble";

    // === PARALLAX ===
    parallax?: {
      enabled: boolean;
      speed: number;                // 0-1 (higher = more movement)
      direction: "vertical" | "horizontal";
    };

    // === MASK/SHAPE ===
    mask: "none" | "circle" | "rounded-lg" | "rounded-xl" | "hexagon" | "blob" | "diamond" | "triangle";

    // === PERFORMANCE ===
    lazyLoad: boolean;              // Enable lazy loading
    priority: boolean;              // Above-fold priority loading

    // === CSS FILTERS ===
    filters?: {
      brightness: number;           // 0-200 (100 = normal)
      contrast: number;             // 0-200 (100 = normal)
      saturation: number;           // 0-200 (100 = normal)
      blur: number;                 // 0-20 pixels
      grayscale: number;            // 0-100 percent
      sepia: number;                // 0-100 percent
      hueRotate: number;            // 0-360 degrees
    };
  };
}
```

#### Image Widget Features

| Category | Features |
|----------|----------|
| **Hover Effects** | Zoom, zoom-out, brighten, darken, grayscale, blur, rotate, tilt, lift, glow, shine sweep, overlay fade |
| **Entrance Animations** | Fade, slide (4 directions), zoom, bounce, flip - triggered on scroll |
| **Floating Animations** | Float, pulse, bounce, swing, wobble - continuous looping |
| **Parallax** | Vertical or horizontal parallax on scroll |
| **Lightbox** | Full-screen modal with click-to-close |
| **Masks/Shapes** | Circle, rounded corners, hexagon, blob, diamond, triangle |
| **Filters** | Brightness, contrast, saturation, blur, grayscale, sepia, hue-rotate |
| **Captions** | Below image or overlay (top/center/bottom) with custom styling |
| **Shadows** | 6 preset sizes + custom glow color |

### 3. Lead Form Widget

```typescript
interface LeadFormWidget {
  type: "lead-form";
  settings: {
    title?: string;
    description?: string;

    fields: Array<{
      type: "text" | "email" | "phone" | "select" | "textarea";
      name: string;
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];  // For select
    }>;

    submitButton: {
      text: string;
      style: ButtonStyle;
      fullWidth: boolean;
    };

    successMessage: string;

    // Integration
    submitTo: "database" | "webhook" | "email";
    webhookUrl?: string;
    emailTo?: string;

    // Styling
    backgroundColor?: string;
    padding: number;
    borderRadius: number;
    shadow: boolean;
  };
}
```

### 4. Trust Badges Widget

```typescript
interface TrustBadgesWidget {
  type: "trust-badges";
  settings: {
    badges: Array<{
      icon: string;
      text: string;
    }>;

    layout: "horizontal" | "grid";
    columns: 2 | 3 | 4 | 5;

    style: {
      backgroundColor: string;
      borderColor: string;
      iconColor: string;
      textColor: string;
      borderRadius: number;
    };

    centered: boolean;
  };
}
```

### 5. Stats Section Widget

```typescript
interface StatsSectionWidget {
  type: "stats-section";
  settings: {
    stats: Array<{
      value: string;      // "10,000+"
      label: string;      // "LLCs Formed"
      prefix?: string;    // "$"
      suffix?: string;    // "+"
      animate: boolean;   // Count up animation
    }>;

    columns: 2 | 3 | 4 | 5;

    style: {
      valueColor: string;
      labelColor: string;
      valueSize: "sm" | "md" | "lg" | "xl";
      divider: boolean;
    };

    centered: boolean;
  };
}
```

### 6. Video Widget

```typescript
interface VideoWidget {
  type: "video";
  settings: {
    source: "youtube" | "vimeo" | "custom";
    url: string;
    thumbnail?: string;

    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;

    aspectRatio: "16:9" | "4:3" | "1:1";
    borderRadius: number;
    shadow: boolean;
  };
}
```

### 7. Image Slider Widget

Modern, feature-rich image slider/carousel widget inspired by Slider Revolution, Swiper.js, and 2025 design trends. Designed for high-impact hero sections, product showcases, and portfolios.

#### Research Summary (2025 Modern Design Analysis)

| Source | Key Insights |
|--------|--------------|
| **[Slider Revolution](https://www.sliderrevolution.com/)** | Layer-based animations, IN/OUT system, timeline control, Ken Burns effects |
| **[Swiper.js v12](https://swiperjs.com/)** | Cube, Coverflow, Cards, Flip effects; parallax; touch-first |
| **[Codrops GSAP Tutorial](https://tympanus.net/codrops/2025/04/21/mastering-carousels-with-gsap-from-basics-to-advanced-animation/)** | GSAP-powered smooth transitions, infinite loops, 3D transforms |
| **[Splide.js](https://splidejs.com/)** | Lightweight, accessible, progress bar indicators |
| **[2025 Carousel Trends](https://uicreative.net/blog/10-best-carousel-design-2025.html)** | Minimal full-screen, subtle parallax, vertical sliders, 3-5 slides max |

#### Design Principles

1. **Mobile-First**: Touch/swipe as primary interaction, responsive breakpoints
2. **Performance**: Lazy loading, lightweight bundle, GPU-accelerated animations
3. **Accessibility**: Keyboard navigation, ARIA labels, pause controls
4. **Minimal by Default**: 3-5 slides recommended, focused messaging
5. **Flexible Effects**: From subtle fades to dramatic 3D transforms

```typescript
interface ImageSliderWidget {
  type: "image-slider";
  settings: {
    // === SLIDES ===
    slides: SlideItem[];

    // === SLIDER TYPE ===
    sliderType:
      | "standard"      // Classic horizontal slider
      | "hero"          // Full-width hero slider
      | "carousel"      // Multiple visible slides
      | "gallery"       // With thumbnail navigation
      | "split"         // Split-screen (content + image)
      | "vertical";     // Vertical scroll slider

    // === TRANSITION EFFECTS ===
    effect:
      | "slide"         // Standard horizontal slide
      | "fade"          // Crossfade between slides
      | "cube"          // 3D cube rotation
      | "coverflow"     // 3D coverflow (like iTunes)
      | "flip"          // 3D flip effect
      | "cards"         // Stacked cards effect
      | "creative"      // Custom creative transforms
      | "parallax";     // Parallax depth effect

    // Creative effect custom transforms (when effect = "creative")
    creativeEffect?: {
      prev: {
        translate: [number, number, number];  // [x%, y%, z(px)]
        rotate: [number, number, number];     // [x, y, z] degrees
        scale: number;
        opacity: number;
      };
      next: {
        translate: [number, number, number];
        rotate: [number, number, number];
        scale: number;
        opacity: number;
      };
    };

    // === AUTOPLAY ===
    autoplay: {
      enabled: boolean;
      delay: number;                // Delay between slides (ms), default 5000
      pauseOnHover: boolean;        // Pause when hovering
      pauseOnInteraction: boolean;  // Pause after user interaction
      reverseDirection: boolean;    // Reverse autoplay direction
      showPauseButton: boolean;     // Show pause/play button
    };

    // === NAVIGATION ===
    navigation: {
      arrows: {
        enabled: boolean;
        style: "default" | "minimal" | "rounded" | "square" | "floating" | "outside";
        size: "sm" | "md" | "lg";
        color: string;
        backgroundColor?: string;
        hoverEffect: "none" | "scale" | "glow" | "slide";
        position: "sides" | "bottom" | "bottom-right";  // Arrow placement
        showOnHover: boolean;  // Only show arrows on hover
      };

      pagination: {
        enabled: boolean;
        type: "dots" | "fraction" | "progressbar" | "bullets-dynamic" | "custom";
        position: "bottom" | "top" | "left" | "right";
        clickable: boolean;
        activeColor: string;
        inactiveColor: string;
        // For progressbar type
        progressbarFill: "horizontal" | "vertical";
        progressbarPosition: "top" | "bottom";
      };

      thumbnails: {
        enabled: boolean;
        position: "bottom" | "left" | "right";
        size: number;           // Thumbnail size in px
        gap: number;            // Gap between thumbnails
        activeStyle: "border" | "opacity" | "scale";
        aspectRatio: "1:1" | "16:9" | "4:3";
      };

      keyboard: boolean;          // Enable keyboard navigation
      mousewheel: boolean;        // Enable mousewheel navigation
      grabCursor: boolean;        // Show grab cursor on hover
    };

    // === TOUCH & SWIPE ===
    touch: {
      enabled: boolean;
      threshold: number;          // Swipe threshold in px (default 50)
      resistance: boolean;        // Resistance at edges
      shortSwipes: boolean;       // Allow short swipes
      longSwipesRatio: number;    // Ratio (0-1) for long swipe (default 0.5)
    };

    // === LOOP & SPEED ===
    loop: boolean;                 // Enable infinite loop
    speed: number;                 // Transition speed in ms (default 500)
    slidesPerView: number | "auto"; // Slides visible (for carousel type)
    spaceBetween: number;         // Gap between slides in carousel
    centeredSlides: boolean;      // Center active slide

    // === KEN BURNS EFFECT ===
    kenBurns: {
      enabled: boolean;
      duration: number;           // Effect duration in ms (default 8000)
      scale: {
        start: number;            // Starting scale (e.g., 1)
        end: number;              // Ending scale (e.g., 1.2)
      };
      position: "random" | "center" | "top" | "bottom" | "left" | "right";
      direction: "in" | "out" | "random";  // Zoom in, out, or random
    };

    // === PARALLAX DEPTH ===
    parallax: {
      enabled: boolean;
      // Per-layer parallax data attributes will be on slide content
    };

    // === SPLIT SCREEN (for sliderType = "split") ===
    splitScreen?: {
      contentPosition: "left" | "right";
      ratio: "50-50" | "40-60" | "60-40" | "33-66" | "66-33";
      contentBackground?: string;
      mobileStack: "content-first" | "image-first";
    };

    // === LAYOUT & SIZING ===
    height:
      | "auto"           // Based on content
      | "viewport"       // 100vh
      | "large"          // 80vh
      | "medium"         // 60vh
      | "small"          // 40vh
      | number;          // Custom px value
    maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    aspectRatio?: "16:9" | "21:9" | "4:3" | "1:1" | "auto";

    // === STYLING ===
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
    overflow: "hidden" | "visible";  // For 3D effects that extend beyond

    // === RESPONSIVE ===
    responsive?: {
      mobile?: {
        slidesPerView?: number;
        spaceBetween?: number;
        effect?: string;
        navigation?: { arrows?: { enabled?: boolean } };
      };
      tablet?: {
        slidesPerView?: number;
        spaceBetween?: number;
      };
    };
  };
}

// === SLIDE ITEM ===
interface SlideItem {
  id: string;

  // === IMAGE ===
  image: {
    src: string;
    alt: string;
    objectFit: "cover" | "contain" | "fill";
    objectPosition: "center" | "top" | "bottom" | "left" | "right";
    // Ken Burns override per slide
    kenBurnsOverride?: {
      direction: "in" | "out";
      position: "center" | "top" | "bottom" | "left" | "right";
    };
  };

  // === OVERLAY ===
  overlay?: {
    enabled: boolean;
    type: "solid" | "gradient";
    color?: string;
    gradient?: {
      type: "linear" | "radial";
      angle?: number;        // For linear
      colors: Array<{ color: string; position: number }>;
    };
    opacity: number;
  };

  // === CONTENT LAYERS (Slider Revolution style) ===
  content?: {
    enabled: boolean;
    position:
      | "center"
      | "top-left" | "top-center" | "top-right"
      | "center-left" | "center-right"
      | "bottom-left" | "bottom-center" | "bottom-right";
    maxWidth: "sm" | "md" | "lg" | "xl" | "full";
    padding: number;
    textAlign: "left" | "center" | "right";

    // Content elements (each with individual animations)
    badge?: {
      show: boolean;
      text: string;
      icon?: string;
      style: "pill" | "outline" | "solid";
      animation: LayerAnimation;
    };

    headline?: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
      color: string;
      highlightWords?: string[];
      highlightColor?: string;
      animation: LayerAnimation;
    };

    subheadline?: {
      show: boolean;
      text: string;
      size: "sm" | "md" | "lg";
      color: string;
      animation: LayerAnimation;
    };

    description?: {
      show: boolean;
      text: string;
      color: string;
      animation: LayerAnimation;
    };

    buttons?: {
      show: boolean;
      items: Array<{
        text: string;
        link: string;
        style: "primary" | "secondary" | "outline" | "ghost";
        openInNewTab: boolean;
      }>;
      animation: LayerAnimation;
    };
  };

  // === VIDEO BACKGROUND ===
  videoBackground?: {
    enabled: boolean;
    src: string;
    type: "mp4" | "webm" | "youtube" | "vimeo";
    muted: boolean;
    loop: boolean;
    playbackRate: number;      // 0.5 - 2.0
    fallbackImage: string;     // Fallback for mobile/no-autoplay
  };

  // === LINK ===
  link?: {
    url: string;
    openInNewTab: boolean;
    ariaLabel: string;
  };
}

// === LAYER ANIMATION (Slider Revolution style IN/OUT) ===
interface LayerAnimation {
  in: {
    type: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
        | "zoom" | "zoom-out" | "rotate" | "flip" | "bounce" | "elastic";
    duration: number;       // ms
    delay: number;          // ms (stagger effect)
    easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out" | "bounce" | "elastic";
  };
  out?: {
    type: "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
        | "zoom" | "zoom-out" | "rotate" | "flip";
    duration: number;
    easing: string;
  };
}
```

#### Image Slider Features Summary

| Category | Features |
|----------|----------|
| **Slider Types** | Standard, Hero (fullscreen), Carousel (multi-slide), Gallery (thumbnails), Split-screen, Vertical |
| **Transition Effects** | Slide, Fade, Cube 3D, Coverflow 3D, Flip 3D, Cards, Creative (custom), Parallax |
| **Ken Burns** | Zoom in/out, Pan directions, Random variations, Per-slide override |
| **Navigation** | Arrows (6 styles), Dots, Fraction, Progress bar, Thumbnails |
| **Autoplay** | Configurable delay, Pause on hover/interaction, Pause button, Reverse direction |
| **Touch/Swipe** | Enabled by default, Configurable threshold, Resistance at edges |
| **Content Layers** | Badge, Headline, Subheadline, Description, Buttons - each with IN/OUT animations |
| **Video Background** | MP4, WebM, YouTube, Vimeo support with fallback images |
| **Responsive** | Mobile/tablet breakpoint overrides |
| **Accessibility** | Keyboard navigation, ARIA labels, Pause controls |

#### Implementation Notes

**Libraries to Consider:**
- **Swiper.js v12** - Primary choice for effects, touch, responsive
- **GSAP** - For advanced animations and smooth transitions
- **CSS-only Ken Burns** - Lightweight pan/zoom without extra dependencies

**Performance Best Practices:**
```typescript
// Lazy load slides not in view
<SwiperSlide lazy={true}>
  <img data-src="image.jpg" className="swiper-lazy" />
  <div className="swiper-lazy-preloader"></div>
</SwiperSlide>

// Preload adjacent slides
preloadImages: false,
lazy: {
  loadPrevNext: true,
  loadPrevNextAmount: 2
}
```

**Ken Burns CSS Implementation:**
```css
@keyframes kenBurnsZoomIn {
  0% {
    transform: scale(1) translate(0, 0);
  }
  100% {
    transform: scale(1.2) translate(-2%, -2%);
  }
}

@keyframes kenBurnsZoomOut {
  0% {
    transform: scale(1.2) translate(-2%, -2%);
  }
  100% {
    transform: scale(1) translate(0, 0);
  }
}

.slide-active .ken-burns {
  animation: kenBurnsZoomIn 8s ease-out forwards;
}
```

**Mobile Optimization:**
```typescript
responsive: {
  mobile: {
    slidesPerView: 1,
    spaceBetween: 0,
    effect: "fade",  // Simpler effect on mobile
    navigation: {
      arrows: { enabled: false }  // Hide arrows, use swipe
    }
  }
}
```

### 7. Testimonial Widget

```typescript
interface TestimonialWidget {
  type: "testimonial";
  settings: {
    quote: string;
    author: {
      name: string;
      role: string;
      company?: string;
      avatar?: string;
    };
    rating?: number;

    style: {
      backgroundColor?: string;
      quoteColor: string;
      showQuoteIcon: boolean;
    };
  };
}
```

---

## Widget Browser UI

When user clicks "+" in a column:

```
┌─────────────────────────────────────────────────────────┐
│  Add Widget                                        ✕    │
├─────────────────────────────────────────────────────────┤
│  🔍 Search widgets...                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⭐ Most Used                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Hero    │ │ Image   │ │ Lead    │ │ Trust   │      │
│  │ Content │ │         │ │ Form    │ │ Badges  │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📝 Content                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Hero    │ │ Heading │ │ Text    │ │ Rich    │      │
│  │ Content │ │         │ │ Block   │ │ Text    │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📷 Media                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Image   │ │ Image   │ │ Video   │ │ Gallery │      │
│  │         │ │ Slider  │ │         │ │         │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📋 Forms                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Lead    │ │ Contact │ │ News-   │                  │
│  │ Form    │ │ Form    │ │ letter  │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
│  ⭐ Social Proof                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Trust   │ │ Stats   │ │ Testi-  │ │ Logo    │      │
│  │ Badges  │ │ Section │ │ monial  │ │ Cloud   │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  💰 Commerce                                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Pricing │ │ Pricing │ │ Feature │                  │
│  │ Card    │ │ Table   │ │ Compare │                  │
│  └─────────┘ └─────────┘ └─────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Section/Column Selector UI

When user clicks "Add Block":

```
┌─────────────────────────────────────────────────────────┐
│  Select Layout                                     ✕    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ █████████████████████████████████████████████   │   │
│  │                  1 Column                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████████████  ████████████████████      │   │
│  │              2 Columns (50/50)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ████████████  ██████████████████████████████    │   │
│  │              2 Columns (33/66)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ██████████████████████████████  ████████████    │   │
│  │              2 Columns (66/33)                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ █████████████  █████████████  █████████████     │   │
│  │              3 Columns (33/33/33)                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
src/
├── lib/
│   └── page-builder/
│       ├── types.ts              # All type definitions
│       ├── widget-registry.ts    # Widget registration
│       ├── section-layouts.ts    # Layout configurations
│       └── defaults.ts           # Default settings
│
├── components/
│   └── page-builder/
│       │
│       ├── core/
│       │   ├── page-canvas.tsx       # Main canvas
│       │   ├── section.tsx           # Section container
│       │   ├── column.tsx            # Column container
│       │   └── widget-wrapper.tsx    # Widget container
│       │
│       ├── ui/
│       │   ├── add-section-button.tsx
│       │   ├── layout-selector.tsx   # Column layout modal
│       │   ├── widget-browser.tsx    # Widget selection modal
│       │   ├── section-toolbar.tsx   # Section controls
│       │   └── widget-toolbar.tsx    # Widget controls
│       │
│       ├── widgets/
│       │   ├── content/
│       │   │   ├── hero-content.tsx
│       │   │   ├── heading.tsx
│       │   │   └── text-block.tsx
│       │   │
│       │   ├── media/
│       │   │   ├── image-widget.tsx
│       │   │   ├── video-widget.tsx
│       │   │   └── gallery-widget.tsx
│       │   │
│       │   ├── forms/
│       │   │   ├── lead-form.tsx
│       │   │   ├── contact-form.tsx
│       │   │   └── newsletter.tsx
│       │   │
│       │   └── social-proof/
│       │       ├── trust-badges.tsx
│       │       ├── stats-section.tsx
│       │       └── testimonial.tsx
│       │
│       └── settings/
│           ├── section-settings.tsx
│           ├── column-settings.tsx
│           └── widget-settings/
│               ├── hero-content-settings.tsx
│               ├── image-settings.tsx
│               ├── lead-form-settings.tsx
│               ├── trust-badges-settings.tsx
│               └── stats-section-settings.tsx
│
└── app/
    └── admin/
        └── appearance/
            └── landing-page/
                └── page.tsx          # Page builder page
```

---

## Settings Panel (Left Sidebar)

### When Section is Selected:
```
┌─────────────────────────────┐
│ ← Back          Section     │
├─────────────────────────────┤
│ Content | Style | Advanced  │
├─────────────────────────────┤
│                             │
│ Layout                      │
│ ┌─────────────────────────┐ │
│ │ [1] [2] [2] [3] [Custom]│ │
│ └─────────────────────────┘ │
│                             │
│ Background                  │
│ ○ None  ○ Color  ○ Image   │
│                             │
│ Spacing                     │
│ Padding Top    [40] px      │
│ Padding Bottom [40] px      │
│ Column Gap     [24] px      │
│                             │
│ Container Width             │
│ [████████████░░░░] 1280px   │
│                             │
└─────────────────────────────┘
```

### When Widget is Selected:
```
┌─────────────────────────────┐
│ ← Back      Hero Content    │
├─────────────────────────────┤
│ Content | Style | Advanced  │
├─────────────────────────────┤
│                             │
│ ▼ Badge                     │
│   ☑ Show Badge             │
│   Icon  [🇺🇸 ▼]             │
│   Text  [Trusted by...]    │
│                             │
│ ▼ Headline                  │
│   Text  [Start Your...]    │
│   Highlight [US LLC]       │
│   Color [████] #F97316     │
│                             │
│ ▼ Subheadline              │
│   ...                       │
│                             │
│ ▼ Features List            │
│   ...                       │
│                             │
│ ▼ Primary Button           │
│   ...                       │
│                             │
│ ▼ Secondary Button         │
│   ...                       │
│                             │
│ ▼ Trust Text               │
│   ...                       │
│                             │
└─────────────────────────────┘
```

---

## Database Schema

```prisma
model LandingPage {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  isPublished   Boolean  @default(false)

  // JSON structure
  sections      Json     // Array of Section objects
  globalSettings Json    // Global page settings

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// The 'sections' JSON will contain:
// [
//   {
//     id: "section-1",
//     layout: "1-1",
//     columns: [
//       { id: "col-1", widgets: [...] },
//       { id: "col-2", widgets: [...] }
//     ],
//     settings: { ... }
//   },
//   ...
// ]
```

---

## Migration Strategy

### Phase 1: Core Infrastructure ✅
- [x] Create Section, Column, Widget type definitions
- [x] Build widget registry system
- [x] Create layout selector component
- [x] Create widget browser component
- [x] Build section/column rendering

### Phase 2: Essential Widgets ✅
- [x] Hero Content widget (with button style presets: Craft, Flow, Neural)
- [x] Image widget (comprehensive modern features)
- [x] Trust Badges widget
- [x] Stats Section widget
- [x] Heading widget
- [x] Text Block widget
- [x] Divider widget (10 styles including gradient, dotted, icon, text)

### Phase 3: Form Widgets ✅
- [x] Lead Form widget
- [ ] Contact Form widget
- [ ] Form submission handling

### Phase 4: More Widgets
- [x] Video widget
- [x] Testimonial widget
- [ ] **Image Slider widget** (Ken Burns, 3D effects, content layers)
- [ ] FAQ widget
- [ ] Pricing widgets

### Phase 5: Advanced Features
- [x] Drag & drop reordering (sections)
- [x] Copy/duplicate sections
- [x] Section settings (background: solid/gradient/image/video, spacing, max-width)
- [x] Column settings (vertical alignment, padding)
- [x] Widget spacing controls (margin top/bottom)
- [ ] Section templates/presets
- [ ] Global styles
- [ ] Responsive controls

---

## Scalability Benefits

1. **Adding New Widgets**
   - Create component + settings panel
   - Register in widget registry
   - Done! Works everywhere automatically

2. **Adding New Layouts**
   - Add layout config to section-layouts.ts
   - Done! Available in layout selector

3. **Third-party Widgets**
   - Plugin system possible
   - Developers can create custom widgets

4. **Theming**
   - Global styles apply to all widgets
   - Individual widget overrides possible

---

## CodeCanyon Marketing Points

- "Elementor-Style Drag & Drop Page Builder"
- "30+ Pre-built Widgets"
- "Unlimited Layout Combinations"
- "No Coding Required"
- "Fully Responsive"
- "Developer-Friendly Plugin System"

---

---

## Changelog

### v3.1 (2026-01-12)
- **Image Slider Widget**: Comprehensive specification added
  - 6 slider types: Standard, Hero, Carousel, Gallery, Split-screen, Vertical
  - 8 transition effects including Cube 3D, Coverflow, Flip, Cards
  - Ken Burns (pan/zoom) effect with per-slide override
  - Slider Revolution style content layers with IN/OUT animations
  - Multi-navigation: Arrows, Dots, Progress bar, Thumbnails
  - Video background support (MP4, WebM, YouTube, Vimeo)
  - Touch/swipe with configurable threshold
  - Responsive breakpoint overrides
  - Based on 2025 research: Swiper.js, Slider Revolution, GSAP techniques

### v3.0 (2026-01-12)
- **Image Widget**: Complete rewrite with modern features
  - 13 hover effects (zoom, glow, shine, tilt, lift, etc.)
  - 8 entrance animations with Intersection Observer
  - 5 floating animations (continuous looping)
  - Parallax scrolling support
  - Lightbox modal
  - 8 mask shapes (circle, hexagon, blob, diamond, etc.)
  - 7 CSS filters
  - Caption overlay support
- **Spacer Widget**: Removed (widgets now have built-in spacing controls)
- **Migration Status**: Updated to reflect completed phases

### v2.0
- Section-Based Architecture (Elementor/Webflow style)
- Widget registry system
- Core widgets implementation

*Document Version: 3.1 - Image Slider Widget Specification*
