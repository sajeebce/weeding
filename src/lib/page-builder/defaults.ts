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
  ServiceCardWidgetSettings,
  ServiceListWidgetSettings,
  ProcessStepsWidgetSettings,
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
  paddingTop: 64,
  paddingBottom: 64,
  gap: 32,
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
    text: "🇺🇸 Trusted by 10,000+ International Entrepreneurs",
    style: "pill",
    bgColor: "#f9731633",
    textColor: "#fb923c",
    borderColor: "#f9731680",
  },
  headline: {
    text: "Start Your US LLC in 24 Hours",
    highlightWords: "US LLC",
    highlightColor: "#f97316",
    size: "xl",
    color: "#ffffff",
  },
  subheadline: {
    text: "Launch your American dream from anywhere in the world. We handle everything from LLC formation to EIN, Amazon seller accounts, and business banking — so you can focus on growing your business.",
    show: true,
    size: "lg",
    color: "#94a3b8",
  },
  features: {
    show: true,
    items: [
      { id: "feat_1", icon: "CheckCircle", text: "Fast 24-48 hour processing" },
      { id: "feat_2", icon: "CheckCircle", text: "100% Compliance guaranteed" },
      { id: "feat_3", icon: "CheckCircle", text: "Dedicated support team" },
    ],
    columns: 3,
    iconColor: "#22c55e",
    iconPosition: "left",
    layout: "inline",
  },
  primaryButton: {
    show: true,
    text: "Start Your LLC Now",
    link: "/services/llc-formation",
    openInNewTab: false,
  },
  secondaryButton: {
    show: true,
    text: "View Pricing",
    link: "/pricing",
    style: "outline",
    openInNewTab: false,
  },
  trustText: {
    show: true,
    rating: 4.9,
    text: "4.9/5 from 2,000+ reviews",
    textColor: "#9ca3af",
    starColor: "#facc15",
  },
  alignment: "center",
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
    { id: "badge_1", icon: "Shield", text: "Secure & Private" },
    { id: "badge_2", icon: "Clock", text: "24hr Processing" },
    { id: "badge_3", icon: "Globe", text: "Serve 50+ Countries" },
    { id: "badge_4", icon: "Star", text: "4.9/5 Rating" },
  ],
  layout: "grid",
  columns: 4,
  style: {
    backgroundColor: "#1e293b80",
    borderColor: "#33415580",
    iconColor: "#f97316",
    textColor: "#ffffff",
    borderRadius: 12,
  },
  centered: true,
};

export const DEFAULT_STATS_SECTION_SETTINGS: StatsSectionWidgetSettings = {
  stats: [
    { id: "stat_1", value: "10000", label: "LLCs Formed", suffix: "+", animate: true },
    { id: "stat_2", value: "50", label: "Countries Served", suffix: "+", animate: true },
    { id: "stat_3", value: "4.9", label: "Customer Rating", prefix: "", suffix: "/5", animate: true },
    { id: "stat_4", value: "24", label: "Average Processing", suffix: "h", animate: true },
  ],
  columns: 4,
  style: {
    valueColor: "#f97316",
    labelColor: "#94a3b8",
    valueSize: "md",
    divider: false,
    showTopBorder: true,
    topBorderColor: "#334155",
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

export const DEFAULT_SERVICE_CARD_SETTINGS: ServiceCardWidgetSettings = {
  // Header Section
  header: {
    show: true,
    badge: {
      show: true,
      text: "Our Services",
      style: "pill",
      bgColor: "#f9731933",
      textColor: "#fb923c",
      borderColor: "#f9731980",
    },
    heading: {
      text: "Everything You Need to Start Your US Business",
      highlightWords: "US Business",
      highlightColor: "#f97316",
      size: "xl",
      color: "#ffffff",
    },
    description: {
      show: true,
      text: "From LLC formation to Amazon seller accounts, we provide end-to-end support for international entrepreneurs.",
      size: "lg",
      color: "#94a3b8",
    },
    alignment: "center",
    marginBottom: 48,
  },

  // Data Filters
  filters: {
    categories: [], // Empty = all categories
    limit: 8,
    sortBy: "popular",
    popularOnly: false,
    activeOnly: true,
  },

  // Card Style Variant
  cardStyle: "elevated",

  // Layout Configuration
  layout: {
    columns: 4,
    gap: 24,
    cardAlignment: "stretch",
  },

  // Icon Settings
  icon: {
    show: true,
    style: "rounded",
    size: "md",
    position: "top-left",
    backgroundColor: undefined, // Uses theme primary/10
    iconColor: undefined, // Uses theme primary
    hoverAnimation: "scale",
  },

  // Content Display Options
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

  // Hover Effects
  hover: {
    effect: "lift",
    iconEffect: "scale",
    transitionDuration: 200,
    glowColor: undefined, // For neon-glow style
  },

  // Color Overrides (optional - uses theme colors by default)
  colors: {},

  // Card Styling
  borderRadius: 12,
  borderWidth: 1,

  // Responsive Breakpoints
  responsive: {
    tablet: { columns: 2 },
    mobile: { columns: 1 },
  },
};

export const DEFAULT_SERVICE_LIST_SETTINGS: ServiceListWidgetSettings = {
  // Header Section
  header: {
    show: true,
    badge: {
      show: false, // No badge in clean design
      text: "Services",
      style: "pill",
      bgColor: "#f9731933",
      textColor: "#fb923c",
      borderColor: "#f9731980",
    },
    heading: {
      text: "All Services",
      highlightWords: "",
      highlightColor: "#f97316",
      size: "lg", // Smaller, cleaner heading
      color: "#0f172a", // Dark text for light theme
    },
    description: {
      show: true,
      text: "Explore our complete range of business services",
      size: "md", // Smaller description
      color: "#64748b", // Muted gray
    },
    alignment: "center",
    marginBottom: 40,
  },

  // Data Filters
  filters: {
    showAllCategories: true,
    categories: [],
    limitServicesPerCategory: 0, // 0 = no limit
    sortServicesBy: "order",
    activeOnly: true,
  },

  // Layout Configuration
  layout: {
    columns: 4,
    gap: 32, // More spacing between cards
    cardStyle: "bordered", // Clean bordered style
  },

  // Category Card Settings
  categoryCard: {
    showIcon: true,
    iconStyle: "rounded",
    iconSize: "sm", // Smaller icons
    iconBgColor: "#fff7ed", // Light orange background
    iconColor: "#f97316", // Primary orange
    showTagline: true,
    titleSize: "md", // Medium title
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0", // Light gray border
    backgroundColor: "#ffffff", // White background
    padding: 24,
  },

  // Service Item Settings
  serviceItem: {
    showPrice: true,
    priceColor: "#64748b", // Gray price (muted)
    nameColor: "#0f172a", // Dark text
    hoverEffect: "highlight",
    divider: false, // No dividers for cleaner look
    dividerColor: "#e2e8f0",
    padding: 8, // Less padding
    fontSize: "sm",
  },

  // CTA Section
  cta: {
    show: false, // No CTA by default for cleaner look
    text: "Not sure which services you need?",
    textColor: "#64748b",
    primaryButton: {
      show: true,
      text: "View All Services",
      link: "/services",
      openInNewTab: false,
      style: {
        bgColor: "#f97316",
        textColor: "#ffffff",
        borderRadius: 6,
        hoverEffect: "darken",
      },
    },
    secondaryButton: {
      show: true,
      text: "Get Free Consultation",
      link: "/contact",
      openInNewTab: false,
      style: {
        bgColor: "transparent",
        textColor: "#0f172a",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 6,
        hoverEffect: "darken",
        hoverBgColor: "#f8fafc",
      },
    },
    alignment: "center",
    marginTop: 48,
  },

  // Responsive Breakpoints
  responsive: {
    tablet: { columns: 2 },
    mobile: { columns: 1 },
  },
};

export const DEFAULT_PROCESS_STEPS_SETTINGS: ProcessStepsWidgetSettings = {
  // Header Section - matches screenshot design
  header: {
    show: true,
    badge: {
      show: true,
      text: "How It Works",
      style: "pill",
      bgColor: "#1e3a5f",
      textColor: "#ffffff",
      borderColor: "#1e3a5f",
    },
    heading: {
      text: "Start Your LLC in 4 Simple Steps",
      highlightWords: "",
      highlightColor: "#f97316",
      size: "xl",
      color: "#0f172a", // Dark text for light theme
    },
    description: {
      show: true,
      text: "We've simplified the process so you can focus on what matters — building your business.",
      size: "md",
      color: "#64748b",
    },
    alignment: "center",
    marginBottom: 48,
  },

  // Steps Data - matches screenshot
  steps: [
    {
      id: "step_1",
      icon: "ClipboardList",
      title: "Choose Your Package",
      description: "Select the LLC formation package that fits your needs. Pick your state and provide basic information about your business.",
    },
    {
      id: "step_2",
      icon: "FileCheck",
      title: "We Handle the Paperwork",
      description: "Our team prepares and files all necessary documents with the state. We ensure everything is accurate and compliant.",
    },
    {
      id: "step_3",
      icon: "FileText",
      title: "Receive Your Documents",
      description: "Get your LLC approval, Articles of Organization, Operating Agreement, and EIN delivered to your email within 24-48 hours.",
    },
    {
      id: "step_4",
      icon: "Rocket",
      title: "Launch Your Business",
      description: "Open your US business bank account, set up your Amazon seller account, and start accepting payments. You're ready to go!",
    },
  ],

  // Layout
  layout: {
    type: "horizontal",
    columns: 4,
    gap: 24,
    verticalSpacing: 48,
  },

  // Step Number Badge
  stepNumber: {
    show: true,
    style: "circle",
    size: "sm",
    bgColor: "#f97316",
    textColor: "#ffffff",
    borderColor: "#f97316",
    position: "top-right",
  },

  // Step Icon
  stepIcon: {
    show: true,
    style: "circle",
    size: "lg",
    bgColor: "#fff7ed", // Light orange/peach background
    iconColor: "#f97316", // Orange icon
    borderColor: "transparent",
    hoverAnimation: "bounce",
  },

  // Step Content
  stepContent: {
    titleSize: "md",
    titleColor: "#0f172a", // Dark text
    descriptionSize: "sm",
    descriptionColor: "#64748b", // Gray text
    alignment: "center",
  },

  // Connector Line - Animated!
  connector: {
    show: true,
    style: "solid",
    animation: "dot-travel", // Animated dots traveling along line
    thickness: 2,
    color: "#fde8d7", // Light orange
    secondaryColor: "#f97316", // Orange for gradient/effects
    animationSpeed: "medium",
    animationDirection: "forward",
    dotSize: 8,
    dotColor: "#f97316",
  },

  // Card Style (no cards, transparent background)
  card: {
    show: false,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    padding: 0,
    shadow: "none",
    hoverEffect: "none",
  },

  // Responsive
  responsive: {
    tablet: {
      layout: "horizontal",
      columns: 2,
    },
    mobile: {
      layout: "vertical",
      columns: 1,
    },
  },

  // Animation
  animation: {
    staggerDelay: 150,
    animateOnScroll: true,
  },
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
  "service-card": DEFAULT_SERVICE_CARD_SETTINGS,
  "service-list": DEFAULT_SERVICE_LIST_SETTINGS,
  "process-steps": DEFAULT_PROCESS_STEPS_SETTINGS,
};
