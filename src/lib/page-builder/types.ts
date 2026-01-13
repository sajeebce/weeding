// ============================================
// PAGE BUILDER - WIDGET SLOT SYSTEM TYPES
// ============================================

import type { ButtonCustomStyle } from "@/lib/landing-blocks/types";

// Re-export for convenience
export type { ButtonCustomStyle };

// ============================================
// SECTION TYPES
// ============================================

export type SectionLayout =
  | "1"        // Full width (1 column)
  | "1-1"      // 50/50 (2 columns)
  | "1-2"      // 33/66 (2 columns)
  | "2-1"      // 66/33 (2 columns)
  | "1-1-1"    // 33/33/33 (3 columns)
  | "1-2-1"    // 25/50/25 (3 columns)
  | "1-1-1-1"; // 25/25/25/25 (4 columns)

export type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

// Background Types
export type BackgroundType = "solid" | "gradient" | "image" | "video";
export type GradientType = "linear" | "radial";
export type BackgroundSize = "cover" | "contain" | "auto";
export type BackgroundPosition = "center" | "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type BackgroundRepeat = "no-repeat" | "repeat" | "repeat-x" | "repeat-y";

export interface GradientSettings {
  type: GradientType;
  angle: number; // For linear gradient (0-360)
  colors: Array<{
    color: string;
    position: number; // 0-100
  }>;
}

export interface BackgroundImageSettings {
  url: string;
  size: BackgroundSize;
  position: BackgroundPosition;
  repeat: BackgroundRepeat;
  fixed: boolean; // Parallax effect
}

export interface BackgroundVideoSettings {
  url: string;
  poster?: string; // Fallback image
  muted: boolean;
  loop: boolean;
}

export interface BackgroundOverlay {
  enabled: boolean;
  color: string;
  opacity: number;
  gradient?: GradientSettings; // Optional gradient overlay
}

export interface SectionBackground {
  type: BackgroundType;
  color?: string; // For solid
  gradient?: GradientSettings; // For gradient
  image?: BackgroundImageSettings; // For image
  video?: BackgroundVideoSettings; // For video
  overlay?: BackgroundOverlay;
}

export interface SectionSettings {
  fullWidth: boolean;
  // New unified background system
  background: SectionBackground;
  // Legacy fields (kept for backwards compatibility)
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOverlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  paddingTop: number;
  paddingBottom: number;
  gap: number;
  maxWidth: MaxWidth;
  borderRadius?: number;
  className?: string;
}

export interface Section {
  id: string;
  order: number;
  layout: SectionLayout;
  columns: Column[];
  settings: SectionSettings;
}

// ============================================
// COLUMN TYPES
// ============================================

export type VerticalAlign = "top" | "center" | "bottom";

export interface ColumnSettings {
  verticalAlign: VerticalAlign;
  padding: number;
  backgroundColor?: string;
  className?: string;
}

export interface Column {
  id: string;
  widgets: Widget<unknown>[];
  settings: ColumnSettings;
}

// ============================================
// WIDGET TYPES
// ============================================

export type WidgetType =
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
  | "service-card"
  // Layout Widgets
  | "spacer"
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

export type WidgetCategory =
  | "most-used"
  | "content"
  | "media"
  | "forms"
  | "social-proof"
  | "commerce"
  | "layout"
  | "cta"
  | "advanced";

export interface WidgetSpacing {
  marginTop: number;
  marginBottom: number;
}

export const DEFAULT_WIDGET_SPACING: WidgetSpacing = {
  marginTop: 0,
  marginBottom: 0,
};

export interface Widget<T = Record<string, unknown>> {
  id: string;
  type: WidgetType;
  settings: T;
  spacing?: WidgetSpacing;
}

// ============================================
// WIDGET DEFINITIONS
// ============================================

// Badge Style
export type BadgeStyle = "pill" | "outline" | "solid";

// Hero Content Widget
export interface HeroContentWidgetSettings {
  // Badge
  badge: {
    show: boolean;
    icon: string;
    text: string;
    style: BadgeStyle;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
  };

  // Headline
  headline: {
    text: string;
    highlightWords: string;
    highlightColor: string;
    size: "sm" | "md" | "lg" | "xl";
    color?: string;
  };

  // Subheadline
  subheadline: {
    text: string;
    show: boolean;
    size: "sm" | "md" | "lg";
    color?: string;
  };

  // Features List
  features: {
    show: boolean;
    items: Array<{ id: string; icon: string; text: string }>;
    columns: 1 | 2 | 3 | 4;
    iconColor: string;
    iconPosition: "left" | "right";
    layout: "list" | "grid";
  };

  // Primary Button
  primaryButton: {
    show: boolean;
    text: string;
    link: string;
    badge?: string;
    style?: ButtonCustomStyle;
    openInNewTab?: boolean;
  };

  // Secondary Button
  secondaryButton: {
    show: boolean;
    text: string;
    link: string;
    style: "link" | "outline" | "ghost";
    openInNewTab?: boolean;
  };

  // Trust Text (with stars)
  trustText: {
    show: boolean;
    rating: number;
    text: string;
    textColor?: string;
    starColor?: string;
  };

  // Alignment
  alignment: "left" | "center" | "right";
}

// Image Widget - Comprehensive Modern Settings
export type ImageObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";
export type ImageShadow = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "glow";
export type ImageAspectRatio = "auto" | "1:1" | "4:3" | "16:9" | "3:2" | "2:3" | "9:16" | "21:9";
export type ImageAnimation = "none" | "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom-in" | "zoom-out" | "flip" | "rotate";
export type ImageHoverEffect =
  | "none"
  | "zoom"
  | "zoom-out"
  | "brighten"
  | "darken"
  | "grayscale"
  | "blur"
  | "rotate"
  | "tilt-left"
  | "tilt-right"
  | "lift"
  | "glow"
  | "shine"
  | "overlay-fade";
export type ImageFloatAnimation = "none" | "float" | "pulse" | "bounce" | "swing" | "wobble";
export type ImageMask = "none" | "circle" | "rounded-lg" | "rounded-xl" | "hexagon" | "blob" | "diamond" | "triangle";

export interface ImageWidgetSettings {
  // Basic
  src: string;
  alt: string;
  title?: string;

  // Size & Fit
  objectFit: ImageObjectFit;
  aspectRatio: ImageAspectRatio;
  maxWidth?: number; // percentage 10-100
  alignment: "left" | "center" | "right";

  // Styling
  borderRadius: number;
  shadow: ImageShadow;
  shadowColor?: string; // for glow effect
  border: {
    width: number;
    color: string;
    style: "solid" | "dashed" | "dotted" | "double";
  };

  // Link Options
  link?: {
    url: string;
    openInNewTab: boolean;
  };

  // Lightbox (click image to view fullscreen)
  lightbox: boolean;

  // Caption
  caption?: {
    enabled: boolean;
    text: string;
    position: "below" | "overlay-bottom" | "overlay-top" | "overlay-center";
    backgroundColor?: string;
    backgroundOpacity?: number; // 0-1
    textColor?: string;
    fontSize: "xs" | "sm" | "md" | "lg";
  };

  // Hover Effects
  hoverEffect: ImageHoverEffect;
  hoverTransitionDuration: number; // ms

  // Overlay
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
    showOnHover: boolean;
  };

  // Entrance Animation
  animation: ImageAnimation;
  animationDuration: number; // ms
  animationDelay: number; // ms

  // Floating Animation (continuous)
  floatAnimation: ImageFloatAnimation;

  // Parallax
  parallax?: {
    enabled: boolean;
    speed: number; // 0.1 to 1.0
    direction: "vertical" | "horizontal";
  };

  // Mask/Shape
  mask: ImageMask;

  // Advanced
  lazyLoad: boolean;
  priority: boolean; // for LCP images

  // Filters
  filters?: {
    brightness: number; // 0-200, default 100
    contrast: number; // 0-200, default 100
    saturation: number; // 0-200, default 100
    blur: number; // 0-20px
    grayscale: number; // 0-100%
    sepia: number; // 0-100%
    hueRotate: number; // 0-360deg
  };
}

// ============================================
// IMAGE SLIDER WIDGET TYPES
// ============================================

export type SliderType = "standard" | "hero" | "carousel" | "gallery" | "split" | "vertical";

export type SliderEffect =
  | "slide"
  | "fade"
  | "cube"
  | "coverflow"
  | "flip"
  | "cards"
  | "creative"
  | "parallax";

export type ArrowStyle = "default" | "minimal" | "rounded" | "square" | "floating" | "outside";
export type PaginationType = "dots" | "fraction" | "progressbar" | "bullets-dynamic" | "custom";
export type LayerAnimationType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "zoom-out"
  | "rotate"
  | "flip"
  | "bounce"
  | "elastic";

export type LayerAnimationEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "bounce"
  | "elastic";

// Layer Animation for content elements
export interface LayerAnimation {
  in: {
    type: LayerAnimationType;
    duration: number;
    delay: number;
    easing: LayerAnimationEasing;
  };
  out?: {
    type: LayerAnimationType;
    duration: number;
    easing: string;
  };
}

// Slide Content Configuration
export interface SlideContentConfig {
  enabled: boolean;
  position:
    | "center"
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  maxWidth: "sm" | "md" | "lg" | "xl" | "full";
  padding: number;
  textAlign: "left" | "center" | "right";

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
    highlightWords?: string;
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
      id: string;
      text: string;
      link: string;
      style: "primary" | "secondary" | "outline" | "ghost";
      openInNewTab: boolean;
    }>;
    animation: LayerAnimation;
  };
}

// Individual Slide Item
export interface SlideItem {
  id: string;

  // Image
  image: {
    src: string;
    alt: string;
    objectFit: "cover" | "contain" | "fill";
    objectPosition: "center" | "top" | "bottom" | "left" | "right";
    kenBurnsOverride?: {
      direction: "in" | "out";
      position: "center" | "top" | "bottom" | "left" | "right";
    };
  };

  // Overlay
  overlay?: {
    enabled: boolean;
    type: "solid" | "gradient";
    color?: string;
    gradient?: {
      type: "linear" | "radial";
      angle?: number;
      colors: Array<{ color: string; position: number }>;
    };
    opacity: number;
  };

  // Content Layers
  content?: SlideContentConfig;

  // Video Background
  videoBackground?: {
    enabled: boolean;
    src: string;
    type: "mp4" | "webm" | "youtube" | "vimeo";
    muted: boolean;
    loop: boolean;
    playbackRate: number;
    fallbackImage: string;
  };

  // Link (entire slide clickable)
  link?: {
    url: string;
    openInNewTab: boolean;
    ariaLabel: string;
  };
}

// Main Image Slider Widget Settings
export interface ImageSliderWidgetSettings {
  // Slides
  slides: SlideItem[];

  // Slider Type
  sliderType: SliderType;

  // Transition Effects
  effect: SliderEffect;
  creativeEffect?: {
    prev: {
      translate: [number, number, number];
      rotate: [number, number, number];
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

  // Autoplay
  autoplay: {
    enabled: boolean;
    delay: number;
    pauseOnHover: boolean;
    pauseOnInteraction: boolean;
    reverseDirection: boolean;
    showPauseButton: boolean;
  };

  // Navigation
  navigation: {
    arrows: {
      enabled: boolean;
      style: ArrowStyle;
      size: "sm" | "md" | "lg";
      color: string;
      backgroundColor?: string;
      hoverEffect: "none" | "scale" | "glow" | "slide";
      position: "sides" | "bottom" | "bottom-right";
      showOnHover: boolean;
    };

    pagination: {
      enabled: boolean;
      type: PaginationType;
      position: "bottom" | "top" | "left" | "right";
      clickable: boolean;
      activeColor: string;
      inactiveColor: string;
      progressbarFill?: "horizontal" | "vertical";
      progressbarPosition?: "top" | "bottom";
    };

    thumbnails: {
      enabled: boolean;
      position: "bottom" | "left" | "right";
      size: number;
      gap: number;
      activeStyle: "border" | "opacity" | "scale";
      aspectRatio: "1:1" | "16:9" | "4:3";
    };

    keyboard: boolean;
    mousewheel: boolean;
    grabCursor: boolean;
  };

  // Touch & Swipe
  touch: {
    enabled: boolean;
    threshold: number;
    resistance: boolean;
    shortSwipes: boolean;
    longSwipesRatio: number;
  };

  // Loop & Speed
  loop: boolean;
  speed: number;
  slidesPerView: number | "auto";
  spaceBetween: number;
  centeredSlides: boolean;

  // Ken Burns Effect
  kenBurns: {
    enabled: boolean;
    duration: number;
    scale: {
      start: number;
      end: number;
    };
    position: "random" | "center" | "top" | "bottom" | "left" | "right";
    direction: "in" | "out" | "random";
  };

  // Parallax
  parallax: {
    enabled: boolean;
  };

  // Split Screen
  splitScreen?: {
    contentPosition: "left" | "right";
    ratio: "50-50" | "40-60" | "60-40" | "33-66" | "66-33";
    contentBackground?: string;
    mobileStack: "content-first" | "image-first";
  };

  // Layout & Sizing
  height: "auto" | "viewport" | "large" | "medium" | "small" | number;
  maxWidth: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  aspectRatio?: "16:9" | "21:9" | "4:3" | "1:1" | "auto";

  // Styling
  borderRadius: number;
  shadow: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  overflow: "hidden" | "visible";

  // Responsive
  responsive?: {
    mobile?: {
      slidesPerView?: number;
      spaceBetween?: number;
      effect?: SliderEffect;
      navigation?: {
        arrows?: { enabled?: boolean };
      };
    };
    tablet?: {
      slidesPerView?: number;
      spaceBetween?: number;
    };
  };
}

// Lead Form Widget
export type FormFieldType = "text" | "email" | "phone" | "select" | "textarea";
export type FormSubmitTo = "database" | "webhook" | "email";

export interface LeadFormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select
}

export interface LeadFormWidgetSettings {
  title?: string;
  description?: string;
  fields: LeadFormField[];
  submitButton: {
    text: string;
    style?: ButtonCustomStyle;
    fullWidth: boolean;
  };
  successMessage: string;
  // Integration
  submitTo: FormSubmitTo;
  webhookUrl?: string;
  emailTo?: string;
  // Styling
  backgroundColor?: string;
  padding: number;
  borderRadius: number;
  shadow: boolean;
}

// Trust Badges Widget
export interface TrustBadge {
  id: string;
  icon: string;
  text: string;
}

export interface TrustBadgesWidgetSettings {
  badges: TrustBadge[];
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
}

// Stats Section Widget
export interface StatItem {
  id: string;
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  animate: boolean;
}

export interface StatsSectionWidgetSettings {
  stats: StatItem[];
  columns: 2 | 3 | 4 | 5;
  style: {
    valueColor: string;
    labelColor: string;
    valueSize: "sm" | "md" | "lg" | "xl";
    divider: boolean;
  };
  centered: boolean;
  animateOnScroll: boolean;
}

// Video Widget
export type VideoSource = "youtube" | "vimeo" | "custom";
export type VideoAspectRatio = "16:9" | "4:3" | "1:1";

export interface VideoWidgetSettings {
  source: VideoSource;
  url: string;
  thumbnail?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  aspectRatio: VideoAspectRatio;
  borderRadius: number;
  shadow: boolean;
}

// Testimonial Widget
export interface TestimonialWidgetSettings {
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
}

// Heading Widget
export interface HeadingWidgetSettings {
  text: string;
  level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  alignment: "left" | "center" | "right";
  color?: string;
  size: "sm" | "md" | "lg" | "xl" | "2xl";
}

// Text Block Widget
export interface TextBlockWidgetSettings {
  content: string;
  alignment: "left" | "center" | "right" | "justify";
  color?: string;
  size: "sm" | "md" | "lg";
}

// Spacer Widget
export interface SpacerWidgetSettings {
  height: number;
  mobileHeight?: number;
}

// Divider Widget
export type DividerStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "gradient"
  | "gradient-fade"
  | "double"
  | "with-icon"
  | "with-text";

export interface DividerWidgetSettings {
  style: DividerStyle;
  color: string;
  secondaryColor?: string; // For gradient styles
  width: number; // Percentage 0-100
  thickness: number; // px
  spacing: number; // Vertical margin in px
  alignment: "left" | "center" | "right";
  // For with-icon style
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  // For with-text style
  text?: string;
  textSize?: "sm" | "md" | "lg";
  textColor?: string;
  textBackground?: string;
}

// ============================================
// SERVICE CARD WIDGET TYPES
// ============================================

export type ServiceCardStyle =
  | "minimal"
  | "elevated"
  | "glassmorphism"
  | "gradient-border"
  | "spotlight"
  | "neon-glow";

export type ServiceCardHoverEffect =
  | "none"
  | "lift"
  | "glow"
  | "border-color"
  | "scale";

export type ServiceCardIconAnimation =
  | "none"
  | "bounce"
  | "rotate"
  | "scale"
  | "shake"
  | "pulse";

export type ServiceCardIconStyle =
  | "rounded"
  | "circle"
  | "square"
  | "gradient-bg"
  | "outline";

export type ServiceCardSortBy =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "name";

export interface ServiceCardWidgetSettings {
  // Data Filters (from database)
  filters: {
    categories: string[];           // Category slugs to filter
    limit: number;                  // 4, 6, 8, 12
    sortBy: ServiceCardSortBy;
    popularOnly: boolean;
    activeOnly: boolean;
  };

  // Card Style
  cardStyle: ServiceCardStyle;

  // Layout
  layout: {
    columns: 1 | 2 | 3 | 4;
    gap: number;
    cardAlignment: "stretch" | "start" | "center";
  };

  // Icon Settings
  icon: {
    show: boolean;
    style: ServiceCardIconStyle;
    size: "sm" | "md" | "lg";
    position: "top-left" | "top-center" | "inline";
    backgroundColor?: string;
    iconColor?: string;
    hoverAnimation: ServiceCardIconAnimation;
  };

  // Content Display
  content: {
    showDescription: boolean;
    descriptionLines: 1 | 2 | 3;
    showPrice: boolean;
    pricePosition: "bottom" | "top-right" | "badge";
    showBadge: boolean;
    badgePosition: "top-right" | "top-left" | "inline";
    showFeatures: boolean;
    maxFeatures: 2 | 3 | 4;
    showCategory: boolean;
    showArrow: boolean;
  };

  // Hover Effects
  hover: {
    effect: ServiceCardHoverEffect;
    iconEffect: "none" | "invert" | "scale" | "bounce";
    transitionDuration: number;
    glowColor?: string;
  };

  // Colors (optional overrides)
  colors: {
    cardBackground?: string;
    borderColor?: string;
    titleColor?: string;
    descriptionColor?: string;
    priceColor?: string;
    hoverBorderColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientVia?: string;
  };

  // Border & Radius
  borderRadius: number;
  borderWidth: number;

  // Responsive
  responsive: {
    tablet: {
      columns: 1 | 2 | 3;
    };
    mobile: {
      columns: 1 | 2;
    };
  };
}

// ============================================
// WIDGET DEFINITION TYPES
// ============================================

export interface WidgetDefinition<T = Record<string, unknown>> {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  defaultSettings: T;
  component: React.ComponentType<{ settings: T; isPreview?: boolean }>;
  settingsPanel?: React.ComponentType<{
    settings: T;
    onChange: (settings: T) => void;
  }>;
  thumbnail?: string;
}

// ============================================
// PAGE TYPES
// ============================================

export interface GlobalSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  backgroundColor: string;
  textColor: string;
}

export interface LandingPageData {
  id: string;
  name: string;
  slug: string;
  sections: Section[];
  globalSettings: GlobalSettings;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// BUILDER STATE TYPES
// ============================================

export type SelectionType = "section" | "column" | "widget" | null;

export interface BuilderSelection {
  type: SelectionType;
  sectionId?: string;
  columnId?: string;
  widgetId?: string;
}

export interface BuilderState {
  sections: Section[];
  selection: BuilderSelection;
  isDragging: boolean;
  isPreviewMode: boolean;
  previewDevice: "desktop" | "tablet" | "mobile";
}

// ============================================
// LAYOUT HELPERS
// ============================================

export interface LayoutOption {
  layout: SectionLayout;
  name: string;
  description: string;
  columns: number;
  widths: string[]; // Tailwind width classes
}

// ============================================
// WIDGET REGISTRY TYPES
// ============================================

export interface WidgetCategoryInfo {
  id: WidgetCategory;
  name: string;
  icon: string;
  description: string;
}
