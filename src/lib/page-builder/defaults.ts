// ============================================
// DEFAULT WIDGET SETTINGS
// ============================================

import type {
  HeroContentWidgetSettings,
  ImageWidgetSettings,
  ImageSliderWidgetSettings,
  LayerAnimation,
  TrustBadgesWidgetSettings,
  StatsSectionWidgetSettings,
  LeadFormWidgetSettings,
  VideoWidgetSettings,
  TestimonialWidgetSettings,
  HeadingWidgetSettings,
  TextBlockWidgetSettings,
  SpacerWidgetSettings,
  DividerWidgetSettings,
  SectionSettings,
  SectionBackground,
  ColumnSettings,
  GlobalSettings,
} from "./types";

// ============================================
// DEFAULT SECTION SETTINGS
// ============================================

export const DEFAULT_SECTION_BACKGROUND: SectionBackground = {
  type: "solid",
  color: "transparent",
  gradient: {
    type: "linear",
    angle: 180,
    colors: [
      { color: "#1e293b", position: 0 },
      { color: "#0f172a", position: 100 },
    ],
  },
  image: {
    url: "",
    size: "cover",
    position: "center",
    repeat: "no-repeat",
    fixed: false,
  },
  video: {
    url: "",
    muted: true,
    loop: true,
  },
  overlay: {
    enabled: false,
    color: "#000000",
    opacity: 0.5,
  },
};

export const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  fullWidth: false,
  background: DEFAULT_SECTION_BACKGROUND,
  paddingTop: 48,
  paddingBottom: 48,
  gap: 24,
  maxWidth: "xl",
  borderRadius: 0,
};

// ============================================
// DEFAULT COLUMN SETTINGS
// ============================================

export const DEFAULT_COLUMN_SETTINGS: ColumnSettings = {
  verticalAlign: "top",
  padding: 0,
};

// ============================================
// DEFAULT GLOBAL SETTINGS
// ============================================

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  primaryColor: "#f97316",
  secondaryColor: "#1e293b",
  fontFamily: "Inter, sans-serif",
  backgroundColor: "#0f172a",
  textColor: "#f8fafc",
};

// ============================================
// WIDGET DEFAULT SETTINGS
// ============================================

export const DEFAULT_HERO_CONTENT_SETTINGS: HeroContentWidgetSettings = {
  badge: {
    show: true,
    icon: "Flag",
    text: "Trusted by 10,000+ Entrepreneurs",
    style: "pill",
    bgColor: "#f9731933",
    textColor: "#fb923c",
    borderColor: "#f9731980",
  },
  headline: {
    text: "Start Your US LLC in Minutes",
    highlightWords: "US LLC",
    highlightColor: "#f97316",
    size: "xl",
    color: "#ffffff",
  },
  subheadline: {
    text: "Complete LLC formation with EIN, registered agent, and business banking - all from anywhere in the world.",
    show: true,
    size: "lg",
    color: "#94a3b8",
  },
  features: {
    show: true,
    items: [
      { id: "feat_1", icon: "CheckCircle", text: "Same-day LLC Formation" },
      { id: "feat_2", icon: "CheckCircle", text: "EIN Number Included" },
      { id: "feat_3", icon: "CheckCircle", text: "Registered Agent Service" },
      { id: "feat_4", icon: "CheckCircle", text: "Banking Support" },
    ],
    columns: 2,
    iconColor: "#22c55e",
    iconPosition: "left",
    layout: "grid",
  },
  primaryButton: {
    show: true,
    text: "Get Started",
    link: "/checkout",
    openInNewTab: false,
  },
  secondaryButton: {
    show: true,
    text: "Learn More",
    link: "/services",
    style: "outline",
    openInNewTab: false,
  },
  trustText: {
    show: true,
    rating: 4.9,
    text: "4.9/5 from 500+ reviews",
    textColor: "#9ca3af",
    starColor: "#facc15",
  },
  alignment: "left",
};

export const DEFAULT_IMAGE_SETTINGS: ImageWidgetSettings = {
  // Basic
  src: "",
  alt: "Image description",
  title: "",

  // Size & Fit
  objectFit: "cover",
  aspectRatio: "16:9",
  maxWidth: 100,
  alignment: "center",

  // Styling
  borderRadius: 8,
  shadow: "lg",
  shadowColor: "#f97316",
  border: {
    width: 0,
    color: "#e2e8f0",
    style: "solid",
  },

  // Link Options
  link: undefined,

  // Lightbox
  lightbox: false,

  // Caption
  caption: {
    enabled: false,
    text: "",
    position: "below",
    backgroundColor: "#000000",
    backgroundOpacity: 0.7,
    textColor: "#ffffff",
    fontSize: "sm",
  },

  // Hover Effects
  hoverEffect: "zoom",
  hoverTransitionDuration: 300,

  // Overlay
  overlay: {
    enabled: false,
    color: "#000000",
    opacity: 0.3,
    showOnHover: false,
  },

  // Entrance Animation
  animation: "none",
  animationDuration: 600,
  animationDelay: 0,

  // Floating Animation
  floatAnimation: "none",

  // Parallax
  parallax: {
    enabled: false,
    speed: 0.5,
    direction: "vertical",
  },

  // Mask/Shape
  mask: "none",

  // Advanced
  lazyLoad: true,
  priority: false,

  // Filters
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
  },
};

export const DEFAULT_TRUST_BADGES_SETTINGS: TrustBadgesWidgetSettings = {
  badges: [
    { id: "badge_1", icon: "Shield", text: "Secure & Compliant" },
    { id: "badge_2", icon: "Clock", text: "24/7 Support" },
    { id: "badge_3", icon: "Award", text: "Best Rated" },
    { id: "badge_4", icon: "Users", text: "10,000+ Clients" },
  ],
  layout: "horizontal",
  columns: 4,
  style: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    iconColor: "#f97316",
    textColor: "#e2e8f0",
    borderRadius: 8,
  },
  centered: true,
};

export const DEFAULT_STATS_SECTION_SETTINGS: StatsSectionWidgetSettings = {
  stats: [
    { id: "stat_1", value: "10000", label: "LLCs Formed", suffix: "+", animate: true },
    { id: "stat_2", value: "50", label: "US States", suffix: "+", animate: true },
    { id: "stat_3", value: "4.9", label: "Rating", prefix: "", suffix: "/5", animate: true },
    { id: "stat_4", value: "24", label: "Hour Support", suffix: "h", animate: true },
  ],
  columns: 4,
  style: {
    valueColor: "#ffffff",
    labelColor: "#94a3b8",
    valueSize: "xl",
    divider: true,
  },
  centered: true,
  animateOnScroll: true,
};

export const DEFAULT_LEAD_FORM_SETTINGS: LeadFormWidgetSettings = {
  title: "Get Your Free Consultation",
  description: "Fill out the form below and we'll get back to you within 24 hours.",
  fields: [
    {
      id: "field_1",
      type: "text",
      name: "name",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
    },
    {
      id: "field_2",
      type: "email",
      name: "email",
      label: "Email Address",
      placeholder: "john@example.com",
      required: true,
    },
    {
      id: "field_3",
      type: "phone",
      name: "phone",
      label: "Phone Number",
      placeholder: "+1 (555) 000-0000",
      required: false,
    },
  ],
  submitButton: {
    text: "Submit",
    fullWidth: true,
  },
  successMessage: "Thank you! We'll be in touch soon.",
  submitTo: "database",
  backgroundColor: "#1e293b",
  padding: 24,
  borderRadius: 12,
  shadow: true,
};

export const DEFAULT_VIDEO_SETTINGS: VideoWidgetSettings = {
  source: "youtube",
  url: "",
  autoplay: false,
  muted: false,
  loop: false,
  controls: true,
  aspectRatio: "16:9",
  borderRadius: 8,
  shadow: true,
};

export const DEFAULT_TESTIMONIAL_SETTINGS: TestimonialWidgetSettings = {
  quote: "This service helped me set up my LLC in just a few days. Highly recommended!",
  author: {
    name: "John Smith",
    role: "Founder",
    company: "Tech Startup",
    avatar: "",
  },
  rating: 5,
  style: {
    backgroundColor: "#1e293b",
    quoteColor: "#f8fafc",
    showQuoteIcon: true,
  },
};

export const DEFAULT_HEADING_SETTINGS: HeadingWidgetSettings = {
  text: "Section Heading",
  level: "h2",
  alignment: "left",
  color: "#ffffff",
  size: "lg",
};

export const DEFAULT_TEXT_BLOCK_SETTINGS: TextBlockWidgetSettings = {
  content: "Add your text content here. This can be a paragraph or multiple paragraphs.",
  alignment: "left",
  color: "#94a3b8",
  size: "md",
};

export const DEFAULT_SPACER_SETTINGS: SpacerWidgetSettings = {
  height: 48,
  mobileHeight: 24,
};

export const DEFAULT_DIVIDER_SETTINGS: DividerWidgetSettings = {
  style: "solid",
  color: "#334155",
  secondaryColor: "#0f172a",
  width: 100,
  thickness: 1,
  spacing: 24,
  alignment: "center",
  icon: "Minus",
  iconSize: 20,
  iconColor: "#64748b",
  text: "OR",
  textSize: "sm",
  textColor: "#64748b",
  textBackground: "#0f172a",
};

// Default Layer Animation
export const DEFAULT_LAYER_ANIMATION: LayerAnimation = {
  in: {
    type: "fade",
    duration: 600,
    delay: 0,
    easing: "ease-out",
  },
};

export const DEFAULT_IMAGE_SLIDER_SETTINGS: ImageSliderWidgetSettings = {
  // Slides
  slides: [
    {
      id: "slide_1",
      image: {
        src: "",
        alt: "Slide 1",
        objectFit: "cover",
        objectPosition: "center",
      },
      overlay: {
        enabled: true,
        type: "gradient",
        gradient: {
          type: "linear",
          angle: 180,
          colors: [
            { color: "#00000000", position: 0 },
            { color: "#000000cc", position: 100 },
          ],
        },
        opacity: 0.6,
      },
      content: {
        enabled: true,
        position: "center-left",
        maxWidth: "lg",
        padding: 48,
        textAlign: "left",
        headline: {
          show: true,
          text: "Welcome to Our Service",
          size: "2xl",
          color: "#ffffff",
          highlightWords: "Service",
          highlightColor: "#f97316",
          animation: {
            in: { type: "slide-up", duration: 600, delay: 0, easing: "ease-out" },
          },
        },
        subheadline: {
          show: true,
          text: "Professional solutions for your business needs",
          size: "lg",
          color: "#e2e8f0",
          animation: {
            in: { type: "slide-up", duration: 600, delay: 100, easing: "ease-out" },
          },
        },
        buttons: {
          show: true,
          items: [
            {
              id: "btn_1",
              text: "Get Started",
              link: "/contact",
              style: "primary",
              openInNewTab: false,
            },
          ],
          animation: {
            in: { type: "slide-up", duration: 600, delay: 200, easing: "ease-out" },
          },
        },
      },
    },
    {
      id: "slide_2",
      image: {
        src: "",
        alt: "Slide 2",
        objectFit: "cover",
        objectPosition: "center",
      },
      overlay: {
        enabled: true,
        type: "solid",
        color: "#000000",
        opacity: 0.4,
      },
      content: {
        enabled: true,
        position: "center",
        maxWidth: "lg",
        padding: 48,
        textAlign: "center",
        headline: {
          show: true,
          text: "Trusted by Thousands",
          size: "2xl",
          color: "#ffffff",
          animation: {
            in: { type: "zoom", duration: 600, delay: 0, easing: "ease-out" },
          },
        },
        subheadline: {
          show: true,
          text: "Join our growing community of satisfied customers",
          size: "lg",
          color: "#e2e8f0",
          animation: {
            in: { type: "fade", duration: 600, delay: 100, easing: "ease-out" },
          },
        },
      },
    },
  ],

  // Slider Type
  sliderType: "hero",

  // Transition Effects
  effect: "fade",

  // Autoplay
  autoplay: {
    enabled: true,
    delay: 5000,
    pauseOnHover: true,
    pauseOnInteraction: true,
    reverseDirection: false,
    showPauseButton: true,
  },

  // Navigation
  navigation: {
    arrows: {
      enabled: true,
      style: "default",
      size: "md",
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.3)",
      hoverEffect: "scale",
      position: "sides",
      showOnHover: true,
    },
    pagination: {
      enabled: true,
      type: "dots",
      position: "bottom",
      clickable: true,
      activeColor: "#f97316",
      inactiveColor: "rgba(255,255,255,0.5)",
    },
    thumbnails: {
      enabled: false,
      position: "bottom",
      size: 80,
      gap: 8,
      activeStyle: "border",
      aspectRatio: "16:9",
    },
    keyboard: true,
    mousewheel: false,
    grabCursor: true,
  },

  // Touch & Swipe
  touch: {
    enabled: true,
    threshold: 50,
    resistance: true,
    shortSwipes: true,
    longSwipesRatio: 0.5,
  },

  // Loop & Speed
  loop: true,
  speed: 600,
  slidesPerView: 1,
  spaceBetween: 0,
  centeredSlides: false,

  // Ken Burns Effect
  kenBurns: {
    enabled: true,
    duration: 8000,
    scale: {
      start: 1,
      end: 1.15,
    },
    position: "random",
    direction: "random",
  },

  // Parallax
  parallax: {
    enabled: false,
  },

  // Layout & Sizing
  height: "medium",
  maxWidth: "full",
  aspectRatio: "auto",

  // Styling
  borderRadius: 0,
  shadow: "none",
  overflow: "hidden",

  // Responsive
  responsive: {
    mobile: {
      slidesPerView: 1,
      effect: "fade",
      navigation: {
        arrows: { enabled: false },
      },
    },
  },
};

// ============================================
// EXPORT ALL DEFAULTS
// ============================================

export const WIDGET_DEFAULTS: Record<string, unknown> = {
  "hero-content": DEFAULT_HERO_CONTENT_SETTINGS,
  "image": DEFAULT_IMAGE_SETTINGS,
  "image-slider": DEFAULT_IMAGE_SLIDER_SETTINGS,
  "trust-badges": DEFAULT_TRUST_BADGES_SETTINGS,
  "stats-section": DEFAULT_STATS_SECTION_SETTINGS,
  "lead-form": DEFAULT_LEAD_FORM_SETTINGS,
  "video": DEFAULT_VIDEO_SETTINGS,
  "testimonial": DEFAULT_TESTIMONIAL_SETTINGS,
  "heading": DEFAULT_HEADING_SETTINGS,
  "text-block": DEFAULT_TEXT_BLOCK_SETTINGS,
  "spacer": DEFAULT_SPACER_SETTINGS,
  "divider": DEFAULT_DIVIDER_SETTINGS,
};
