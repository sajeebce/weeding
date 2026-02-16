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
  TestimonialsWidgetSettings,
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
  PricingTableWidgetSettings,
  BlogPostGridWidgetSettings,
  BlogPostCarouselWidgetSettings,
  BlogFeaturedPostWidgetSettings,
  BlogPostListWidgetSettings,
  BlogRecentPostsWidgetSettings,
  ServiceFeaturesWidgetSettings,
  ServiceDescriptionWidgetSettings,
  ServiceBreadcrumbWidgetSettings,
  RelatedServicesWidgetSettings,
  ButtonGroupWidgetSettings,
  WidgetContainerStyle,
} from "./types";

// ============================================
// DEFAULT WIDGET CONTAINER STYLE
// ============================================

export const DEFAULT_WIDGET_CONTAINER: WidgetContainerStyle = {
  backgroundType: "solid",
  backgroundColor: undefined,
  gradientBackground: undefined,
  padding: 0,
  borderRadius: 0,
  gradientBorder: {
    enabled: false,
    colors: ["#ec4899", "#8b5cf6"],
    angle: 135,
  },
  borderWidth: 2,
  shadow: "none",
  maxWidth: undefined,
};

// ============================================
// DEFAULT SECTION SETTINGS
// ============================================

export const DEFAULT_SECTION_BACKGROUND: SectionBackground = {
  type: "solid",
  color: "#ffffff",
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
  patternOverlay: {
    type: "dots" as const,
    color: "#ffffff",
    opacity: 0.1,
  },
};

export const DEFAULT_SECTION_SETTINGS: SectionSettings = {
  fullWidth: false,
  background: DEFAULT_SECTION_BACKGROUND,
  paddingTop: 64,
  paddingBottom: 64,
  paddingLeft: 16,
  paddingRight: 16,
  marginTop: 0,
  marginBottom: 0,
  gap: 32,
  maxWidth: "xl",
  borderRadius: 0,
  gradientBorder: undefined,
  isVisible: true,
  visibleOnMobile: true,
  visibleOnDesktop: true,
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
    layout: "list",
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_LEAD_FORM_SETTINGS: LeadFormWidgetSettings = {
  templateId: undefined,
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
  formMaxWidth: 0,
  formAlignment: "center",
  buttonLayout: "vertical",
  buttonAlignment: "center",
  buttonGap: 12,
  buttonWidth: 0,
  backgroundColor: "#1e293b",
  titleColor: "#ffffff",
  descriptionColor: "#94a3b8",
  labelColor: "#e2e8f0",
  inputTextColor: "#ffffff",
  padding: 24,
  borderRadius: 12,
  shadow: true,
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_BUTTON_GROUP_SETTINGS: ButtonGroupWidgetSettings = {
  buttons: [
    {
      id: "btn_1",
      text: "Get Started",
      link: "/services/llc-formation",
      style: {
        bgColor: "#F97316",
        textColor: "#ffffff",
        borderRadius: 8,
        hoverEffect: "shadow-lift",
      },
    },
  ],
  layout: "horizontal",
  alignment: "center",
  gap: 16,
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// TESTIMONIALS WIDGET DEFAULT SETTINGS (Multiple)
// ============================================

export const DEFAULT_TESTIMONIALS_SETTINGS: TestimonialsWidgetSettings = {
  // Header
  header: {
    show: true,
    badge: {
      show: true,
      text: "Testimonials",
      style: "pill",
      bgColor: "#3b82f620",
      textColor: "#3b82f6",
      borderColor: "#3b82f640",
    },
    heading: {
      text: "Trusted by 10,000+ Entrepreneurs Worldwide",
      highlightWords: "10,000+",
      highlightColor: "#f97316",
      size: "xl",
      color: "#0f172a",
    },
    description: {
      show: true,
      text: "See what our customers from around the world have to say about their experience with LLCPad.",
      size: "md",
      color: "#94a3b8",
    },
    alignment: "center",
    marginBottom: 48,
  },

  // View Mode
  viewMode: "grid",
  testimonialType: "photo",

  // Data Source (from database)
  dataSource: {
    limit: 6,
    sortBy: "sort-order",
    testimonialType: "all",
    filterByTags: undefined,
  },

  // Grid View Settings
  gridView: {
    columns: 3,
    gap: 24,
    showQuoteIcon: true,
    quoteIconPosition: "top-right",
    quoteIconColor: "#f9731620",
    quoteIconSize: "lg",
  },

  // Carousel View Settings
  carouselView: {
    layout: "standard",
    effect: "slide",
    autoplay: true,
    autoplayDelay: 5000,
    loop: true,
    slidesPerView: 1,
    spaceBetween: 24,
    navigation: {
      arrows: {
        enabled: true,
        style: "rounded",
        size: "md",
        color: "#ffffff",
        backgroundColor: "#ffffff20",
        position: "bottom-right",
        showOnHover: false,
      },
      pagination: {
        enabled: true,
        type: "dots",
        activeColor: "#3b82f6",
        inactiveColor: "#64748b",
      },
    },
    splitLayout: {
      photoPosition: "left",
      photoSize: "50",
    },
  },

  // Video View Settings
  videoView: {
    columns: 4,
    gap: 16,
    thumbnailAspectRatio: "9:16",
    playButtonStyle: "circle",
    playButtonSize: "lg",
    playButtonColor: "#ffffff",
    overlayColor: "#000000",
    overlayOpacity: 0.3,
    showCustomerInfo: true,
    darkTheme: true,
    hoverEffect: "scale",
  },

  // Card Style
  cardStyle: {
    style: "elevated",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    shadow: "md",
    padding: 24,
    hoverEffect: "lift",
    glassEffect: {
      enabled: false,
      blur: 10,
      opacity: 0.1,
    },
    gradientBorder: {
      enabled: false,
      colors: ["#f97316", "#3b82f6"],
      angle: 135,
    },
  },

  // Avatar Style
  avatar: {
    style: "initials",
    shape: "circle",
    size: "md",
    borderWidth: 0,
    borderColor: "#f97316",
    backgroundColor: "#f9731620",
    textColor: "#f97316",
  },

  // Content Display
  content: {
    showRating: true,
    ratingStyle: "stars",
    ratingColor: "#facc15",
    showCompany: true,
    showCountry: true,
    countryFlag: false,
    quoteMaxLines: 0,
    quoteFontSize: "sm",
    quoteColor: "#94a3b8",
    quoteStyle: "normal",
    nameFontSize: "md",
    nameColor: "#f8fafc",
    nameFontWeight: "medium",
    infoColor: "#64748b",
    infoFontSize: "xs",
  },

  // Trust Footer
  trustFooter: {
    show: true,
    showAvatarStack: true,
    avatarStackCount: 4,
    customerCountText: "Join 10,000+ happy customers",
    showAverageRating: true,
    averageRating: 4.9,
    totalReviews: "(2,500+ reviews)",
    alignment: "center",
    marginTop: 48,
  },

  // Animation
  animation: {
    enabled: true,
    entrance: "fade",
    staggerDelay: 100,
    duration: 500,
  },

  // Responsive
  responsive: {
    tablet: {
      columns: 2,
      slidesPerView: 1,
    },
    mobile: {
      columns: 1,
      slidesPerView: 1,
      layout: "vertical",
    },
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_HEADING_SETTINGS: HeadingWidgetSettings = {
  // Content Tab
  content: {
    text: "Section Heading",
    htmlTag: "h2",
    link: undefined,
    highlight: {
      enabled: false,
      words: "",
      style: "color",
    },
    splitHeading: {
      enabled: false,
      beforeText: "",
      mainText: "",
      afterText: "",
    },
  },

  // Style Tab
  style: {
    alignment: "left",
    typography: {
      fontFamily: undefined,
      fontSize: 36,
      fontSizeUnit: "px",
      fontWeight: 700,
      fontStyle: "normal",
      textTransform: "none",
      textDecoration: "none",
      lineHeight: 1.2,
      letterSpacing: 0,
      letterSpacingUnit: "px",
      wordSpacing: undefined,
    },
    textFill: {
      type: "solid",
      color: "#000000",
      gradient: {
        type: "linear",
        angle: 90,
        colors: [
          { color: "#f97316", position: 0 },
          { color: "#ef4444", position: 100 },
        ],
      },
      image: undefined,
    },
    textStroke: {
      enabled: false,
      width: 2,
      color: "#ffffff",
      fillColor: undefined,
    },
    textShadow: {
      enabled: false,
      shadows: [
        { offsetX: 0, offsetY: 4, blur: 10, color: "rgba(0,0,0,0.3)" },
      ],
    },
    highlightStyle: {
      color: "#f97316",
      backgroundColor: "#f9731933",
      backgroundType: "solid",
      gradientColors: ["#f97316", "#ef4444"],
      padding: "0 4px",
      borderRadius: 4,
    },
    splitStyles: undefined,
  },

  // Animation Tab
  animation: {
    entrance: {
      enabled: false,
      type: "fade-up",
      duration: 600,
      delay: 0,
      easing: "ease-out",
    },
    textAnimation: {
      enabled: false,
      type: "fade-in",
      splitBy: "words",
      staggerDelay: 50,
      duration: 400,
      easing: "ease-out",
      loop: false,
      loopDelay: 2000,
    },
    continuousAnimation: {
      enabled: false,
      type: "none",
      duration: 3000,
      gradientColors: ["#f97316", "#ef4444", "#f97316"],
      gradientAngle: 90,
    },
    hoverAnimation: {
      enabled: false,
      type: "none",
      duration: 300,
    },
  },

  // Responsive Tab
  responsive: {
    desktop: {
      fontSize: 36,
      fontSizeUnit: "px",
      lineHeight: 1.2,
      letterSpacing: 0,
      alignment: "left",
    },
    tablet: {
      fontSize: 28,
      fontSizeUnit: "px",
      lineHeight: 1.3,
      letterSpacing: 0,
      alignment: undefined,
    },
    mobile: {
      fontSize: 24,
      fontSizeUnit: "px",
      lineHeight: 1.3,
      letterSpacing: 0,
      alignment: undefined,
    },
  },

  // Advanced Tab
  advanced: {
    customClass: undefined,
    maxWidth: {
      enabled: false,
      value: 800,
      unit: "px",
    },
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false,
    customId: undefined,
    customAttributes: undefined,
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_TEXT_BLOCK_SETTINGS: TextBlockWidgetSettings = {
  // Content
  content:
    "<p>Add your text content here. This can be a paragraph or multiple paragraphs.</p>",

  // Editor Config
  editor: {
    toolbar: "standard",
    minHeight: 200,
    maxHeight: undefined,
    charLimit: undefined,
    placeholder: "Start writing...",
  },

  // Typography
  typography: {
    fontFamily: undefined, // Inherit from theme
    fontSize: 16,
    lineHeight: 1.6,
    letterSpacing: undefined,
    color: "#cbd5e1",
    linkColor: "#60a5fa",
    linkHoverColor: "#93c5fd",
    linkUnderline: true,
  },

  // Container
  container: {
    backgroundColor: undefined,
    backgroundType: "solid",
    gradientBackground: undefined,
    padding: 0,
    borderRadius: 0,
    border: undefined,
    gradientBorder: undefined,
    shadow: "none",
    maxWidth: undefined,
  },

  // Paragraph spacing
  paragraphSpacing: 16,

  // Lists
  lists: {
    bulletStyle: "disc",
    bulletColor: "#f97316",
    numberStyle: "decimal",
    indentation: 24,
  },

  // Blockquote
  blockquote: {
    borderColor: "#f97316",
    borderWidth: 4,
    backgroundColor: "#1e293b",
    fontStyle: "italic",
    padding: 16,
  },

  // Drop Cap
  dropCap: {
    enabled: false,
    size: 3,
    color: "#f97316",
    fontFamily: undefined,
  },

  // Columns
  columns: {
    enabled: false,
    count: 1,
    gap: 32,
    divider: {
      show: false,
      color: "#334155",
      width: 1,
    },
  },

  // Animation
  animation: {
    entrance: {
      enabled: false,
      type: "none",
      duration: 600,
      delay: 0,
    },
  },

  // Responsive
  responsive: {
    tablet: {
      fontSize: 15,
      lineHeight: 1.6,
      columns: 1,
    },
    mobile: {
      fontSize: 14,
      lineHeight: 1.5,
      columns: 1,
    },
  },

  // Advanced
  advanced: {
    customClass: undefined,
    customId: undefined,
    hideOnDesktop: false,
    hideOnTablet: false,
    hideOnMobile: false,
  },
};

export const DEFAULT_SPACER_SETTINGS: SpacerWidgetSettings = {
  height: 48,
  mobileHeight: 24,
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
    sortServicesBy: "sort-order",
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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

  // Container Style
  container: { ...DEFAULT_WIDGET_CONTAINER, borderRadius: 16 },

  // Card Style (no cards, transparent background)
  card: {
    show: false,
    backgroundColor: "transparent",
    backgroundType: "solid",
    gradientBackground: undefined,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    gradientBorder: undefined,
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

export const DEFAULT_PRICING_TABLE_SETTINGS: PricingTableWidgetSettings = {
  // View Mode
  viewMode: "table",

  // Card Style Settings (when viewMode is "cards")
  cardStyle: {
    layout: "grid",
    columns: 3,
    gap: 24,
    cardBorderRadius: 12,
    cardBorderWidth: 1,
    cardBorderColor: "#e2e8f0",
    cardBackgroundColor: "#ffffff",
    cardShadow: "sm",
    popularCardStyle: "ring",
    showProcessingTime: true,
    showTotalPrice: true,
    priceSize: "lg",
    featureListStyle: "compact",
    ctaStyle: "full-width",
  },

  // Header Section
  header: {
    show: true,
    badge: {
      show: true,
      text: "Pricing",
      style: "pill",
      bgColor: "#f9731933",
      textColor: "#fb923c",
      borderColor: "#f9731980",
    },
    heading: {
      text: "Choose Your Package",
      highlightWords: "Package",
      highlightColor: "#f97316",
      size: "xl",
      color: "#0f172a",
    },
    description: {
      show: true,
      text: "Select the perfect plan for your business needs. All packages include our expert support.",
      size: "md",
      color: "#64748b",
    },
    alignment: "center",
    marginBottom: 48,
  },

  // Data Source - binds to service
  dataSource: {
    type: "service",
    mode: "manual",            // "auto" reads slug from ServiceContext
    serviceSlug: undefined,    // Used when mode === "manual"
    manualPackages: undefined,
  },

  // Location Fee Configuration
  stateFee: {
    enabled: true,
    position: "above-table",
    label: "Select Location",
    showFeeBreakdown: true,
    defaultState: "US-WY",
    highlightSavings: true,
    sortBy: "popular",
  },

  // Order Summary Configuration
  orderSummary: {
    enabled: true,
    position: "right",
    title: "Order Summary",
    showPackageDetails: true,
    showStateFee: true,
    showAddons: true,
    showTotal: true,
    stickyOnScroll: true,
    ctaButton: {
      text: "Proceed to Checkout",
      style: "solid",
      bgColor: "#f97316",
      textColor: "#ffffff",
      hoverBgColor: "#ea580c",
    },
    mobileStyle: "sticky-bar",
  },

  // Table Layout & Style
  tableStyle: {
    layout: "modern",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    shadow: "lg",
    maxWidth: "7xl",
  },

  // Table Header Configuration
  tableHeader: {
    showPackageNames: true,
    showPackagePrices: true,
    showPopularBadge: true,
    popularBadgeText: "Most Popular",
    popularBadgeColor: "#f97316",
    stickyHeader: true,
    highlightColumn: 1, // Highlight second package (0-indexed)
    highlightColor: "#fff7ed",
  },

  // Feature Rows Configuration
  featureRows: {
    showTooltips: true,
    tooltipPosition: "top",
    showFeatureDescriptions: false,
    alternateRowColors: true,
    rowHoverEffect: true,
    booleanStyle: {
      trueIcon: "checkCircle",
      falseIcon: "x",
      trueColor: "#22c55e",
      falseColor: "#94a3b8",
    },
    addonStyle: {
      showPrice: true,
      priceFormat: "inline",
      toggleStyle: "switch",
      selectedColor: "#f97316",
    },
  },

  // CTA Buttons Configuration
  ctaButtons: {
    show: true,
    position: "footer",
    buttonText: "Get Started",
    buttonStyle: "solid",
    buttonSize: "lg",
    usePackageColors: false,
    defaultBgColor: "#f97316",
    defaultTextColor: "#ffffff",
    hoverAnimation: "lift",
  },

  // Feature Groups
  featureGroups: {
    enabled: true,
    defaultExpanded: true,
    showGroupIcons: true,
    collapseAnimation: "slide",
  },

  // Responsive Settings
  responsive: {
    breakpoint: 768,
    mobileLayout: "stacked",
    mobileCard: {
      showAllFeatures: false,
      keyFeaturesCount: 5,
      expandButtonText: "Show all features",
    },
  },

  // Animation Settings
  animation: {
    enabled: true,
    tableEntrance: "fade",
    rowStagger: true,
    staggerDelay: 50,
    highlightOnHover: true,
  },

  // Currency Display
  currency: {
    primary: "USD",
    showBoth: false,
    format: "symbol",
  },

  // Color Overrides
  colors: {
    useTheme: true,
    headerBg: undefined,
    headerText: undefined,
    featureLabelText: undefined,
    packageColumnBg: undefined,
    highlightedColumnBg: undefined,
    rowBorderColor: undefined,
    addonToggleActive: undefined,
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// SERVICE HERO WIDGET DEFAULTS
// ============================================

export const DEFAULT_SERVICE_HERO_SETTINGS: import("./types").ServiceHeroWidgetSettings = {
  // Content Source
  titleSource: "auto",
  subtitleSource: "auto",

  // Price Badge
  showPriceBadge: true,
  priceBadgeText: "From ${{service.startingPrice}}",

  // Primary Button
  primaryCtaText: "Get Started",
  primaryCtaLink: "/checkout/{{service.slug}}",
  showPriceInButton: true,

  // Secondary Button
  showSecondaryButton: true,
  secondaryCtaText: "Ask a Question",
  secondaryCtaLink: "/contact",

  // Appearance
  backgroundType: "none",
  textAlignment: "center",
  titleSize: "default",
  spacing: "lg",

  // Spacing (Advanced)
  marginTop: 0,
  marginBottom: 0,
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// FAQ ACCORDION WIDGET DEFAULTS
// ============================================

export const DEFAULT_FAQ_ACCORDION_SETTINGS = {
  header: {
    show: true,
    heading: "Frequently Asked Questions",
    description: "Get answers to common questions about our services",
    alignment: "center" as const,
  },
  source: "all" as const,
  categories: [],
  maxItems: 10,
  expandFirst: true,
  allowMultipleOpen: false,
  style: "cards" as const,
  accentColor: "#3b82f6",
  showCategoryFilter: false,
  headerStyle: {
    headingSize: "lg" as const,
    headingColor: undefined,
    descriptionColor: undefined,
  },
  itemStyle: {
    questionColor: undefined,
    answerColor: undefined,
    gap: 16,
    borderRadius: 12,
    padding: 20,
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// SERVICE FEATURES WIDGET DEFAULTS
// ============================================

export const DEFAULT_SERVICE_FEATURES_SETTINGS: ServiceFeaturesWidgetSettings = {
  header: {
    show: true,
    heading: "What's Included",
    description: "Everything you get with this service",
    alignment: "center",
  },
  variant: "minimal-checkmark",
  columns: 3,
  showIcons: true,
  iconStyle: "circle-check",
  iconColor: "#22C55E",
  showDescriptions: false,
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// SERVICE DESCRIPTION WIDGET DEFAULTS
// ============================================

export const DEFAULT_SERVICE_DESCRIPTION_SETTINGS: ServiceDescriptionWidgetSettings = {
  header: {
    show: true,
    heading: "About {{service.name}}",
    description: "",
    alignment: "left",
  },
  variant: "clean-prose",
  maxWidth: "lg",
  fontSize: "md",
  sidebar: {
    show: true,
    showProcessingTime: true,
    showStartingPrice: true,
    showPopularBadge: true,
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// SERVICE BREADCRUMB WIDGET DEFAULTS
// ============================================

export const DEFAULT_SERVICE_BREADCRUMB_SETTINGS: ServiceBreadcrumbWidgetSettings = {
  variant: "simple-text",
  separator: "chevron",
  showHome: true,
  homeLabel: "Home",
  showCategory: true,
  fontSize: "sm",
  alignment: "left",
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// RELATED SERVICES WIDGET DEFAULTS
// ============================================

export const DEFAULT_RELATED_SERVICES_SETTINGS: RelatedServicesWidgetSettings = {
  header: {
    show: true,
    heading: "Related Services",
    description: "Other services you might be interested in",
    alignment: "center",
  },
  maxItems: 4,
  columns: 4,
  cardVariant: "elevated",
  showPrice: true,
  showDescription: true,
  showCategoryBadge: false,
  ctaText: "Learn More",
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

// ============================================
// BLOG WIDGET DEFAULTS
// ============================================

const DEFAULT_BLOG_HEADER: BlogPostGridWidgetSettings["header"] = {
  show: true,
  badge: {
    show: false,
    text: "Blog",
    style: "pill",
    bgColor: "#3b82f633",
    textColor: "#60a5fa",
    borderColor: "#3b82f680",
  },
  heading: {
    text: "Latest Articles",
    size: "xl",
    color: "#ffffff",
    highlightWords: "",
    highlightColor: "#3b82f6",
  },
  subheading: {
    show: false,
    text: "Insights and guides for entrepreneurs",
    color: "#94a3b8",
  },
  viewAllLink: {
    show: true,
    text: "View All Articles →",
    url: "/blog",
    style: "link",
    color: "#60a5fa",
  },
  alignment: "space-between",
  marginBottom: 32,
};

const DEFAULT_BLOG_DATA_SOURCE: BlogPostGridWidgetSettings["dataSource"] = {
  source: "all",
  categories: [],
  tags: [],
  postIds: [],
  postCount: 6,
  offset: 0,
  orderBy: "date",
  orderDirection: "desc",
  excludeCurrentPost: false,
};

const DEFAULT_BLOG_CARD: BlogPostGridWidgetSettings["card"] = {
  style: "default",
  borderRadius: 12,
  shadow: "sm",
  hoverEffect: "lift",
  image: {
    show: true,
    aspectRatio: "16:9",
    borderRadius: 12,
    hoverEffect: "zoom",
  },
  categoryBadge: {
    show: true,
    position: "above-title",
    style: "pill",
  },
  title: {
    show: true,
    maxLines: 2,
    fontSize: "lg",
    fontWeight: 600,
  },
  excerpt: {
    show: true,
    maxLength: 120,
    fontSize: "sm",
  },
  meta: {
    show: true,
    items: ["date", "category"],
    dateFormat: "short",
    separator: "dot",
    fontSize: "xs",
  },
  readMore: {
    show: false,
    text: "Read More →",
    style: "link",
  },
  contentPadding: 16,
};

export const DEFAULT_BLOG_POST_GRID_SETTINGS: BlogPostGridWidgetSettings = {
  header: { ...DEFAULT_BLOG_HEADER },
  dataSource: { ...DEFAULT_BLOG_DATA_SOURCE },
  layout: {
    type: "grid",
    columns: { desktop: 3, tablet: 2, mobile: 1 },
    gap: 24,
    equalHeight: true,
  },
  card: { ...DEFAULT_BLOG_CARD },
  filterTabs: {
    show: false,
    style: "pills",
    showAll: true,
    allText: "All",
    categories: [],
  },
  pagination: {
    type: "none",
    postsPerLoad: 6,
    loadMoreText: "Load More Articles",
  },
  emptyState: {
    title: "No articles found",
    description: "Check back later for new content",
  },
  animation: {
    entrance: {
      enabled: true,
      type: "fade-up",
      stagger: true,
      staggerDelay: 100,
    },
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_BLOG_POST_CAROUSEL_SETTINGS: BlogPostCarouselWidgetSettings = {
  header: { ...DEFAULT_BLOG_HEADER },
  dataSource: { ...DEFAULT_BLOG_DATA_SOURCE },
  carousel: {
    slidesPerView: { desktop: 3, tablet: 2, mobile: 1 },
    spaceBetween: 24,
    autoplay: {
      enabled: false,
      delay: 5000,
      pauseOnHover: true,
    },
    loop: true,
    speed: 500,
    navigation: {
      arrows: {
        enabled: true,
        style: "default",
        showOnHover: false,
      },
      dots: {
        enabled: true,
        style: "dots",
      },
    },
  },
  card: { ...DEFAULT_BLOG_CARD },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_BLOG_FEATURED_POST_SETTINGS: BlogFeaturedPostWidgetSettings = {
  dataSource: {
    source: "latest",
  },
  layout: "overlay",
  image: {
    aspectRatio: "16:9",
    borderRadius: 16,
    overlay: {
      enabled: true,
      color: "#000000",
      opacity: 0.5,
    },
    hoverEffect: "zoom",
  },
  content: {
    categoryBadge: {
      show: true,
      style: "pill",
    },
    title: {
      size: "2xl",
      fontWeight: 700,
      maxLines: 3,
    },
    excerpt: {
      show: true,
      maxLength: 200,
      fontSize: "md",
    },
    meta: {
      show: true,
      items: ["date", "readingTime"],
      dateFormat: "long",
    },
    readMore: {
      show: true,
      text: "Read Article →",
      style: "button-primary",
    },
    alignment: "left",
    verticalPosition: "bottom",
  },
  height: "lg",
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_BLOG_POST_LIST_SETTINGS: BlogPostListWidgetSettings = {
  header: { ...DEFAULT_BLOG_HEADER },
  dataSource: { ...DEFAULT_BLOG_DATA_SOURCE },
  layout: {
    imagePosition: "left",
    imageWidth: "medium",
    gap: 24,
    divider: {
      show: true,
      style: "solid",
      color: "#1e293b",
    },
  },
  item: {
    image: {
      show: true,
      aspectRatio: "4:3",
      borderRadius: 8,
      hoverEffect: "zoom",
    },
    categoryBadge: {
      show: true,
      style: "text-only",
    },
    title: {
      maxLines: 2,
      fontSize: "lg",
      fontWeight: 600,
    },
    excerpt: {
      show: true,
      maxLength: 150,
      fontSize: "sm",
    },
    meta: {
      show: true,
      items: ["date", "category"],
      dateFormat: "short",
      fontSize: "xs",
    },
    hoverEffect: "highlight",
  },
  pagination: {
    type: "none",
    loadMoreText: "Load More",
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
};

export const DEFAULT_BLOG_RECENT_POSTS_SETTINGS: BlogRecentPostsWidgetSettings = {
  header: {
    show: true,
    text: "Recent Posts",
    size: "md",
  },
  dataSource: {
    postCount: 5,
    orderBy: "date",
  },
  display: {
    style: "title-date",
    thumbnail: {
      size: 60,
      borderRadius: 8,
      aspectRatio: "1:1",
    },
    titleFontSize: "sm",
    titleMaxLines: 2,
    dateFontSize: "xs",
    dateFormat: "relative",
    itemGap: 12,
    divider: {
      show: false,
    },
  },
  viewAllLink: {
    show: true,
    text: "View All Posts →",
    url: "/blog",
  },
  // Container Style
  container: DEFAULT_WIDGET_CONTAINER,
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
  "testimonials-carousel": DEFAULT_TESTIMONIALS_SETTINGS,
  "heading": DEFAULT_HEADING_SETTINGS,
  "text-block": DEFAULT_TEXT_BLOCK_SETTINGS,
  "spacer": DEFAULT_SPACER_SETTINGS,
  "divider": DEFAULT_DIVIDER_SETTINGS,
  "service-card": DEFAULT_SERVICE_CARD_SETTINGS,
  "service-list": DEFAULT_SERVICE_LIST_SETTINGS,
  "process-steps": DEFAULT_PROCESS_STEPS_SETTINGS,
  "pricing-table": DEFAULT_PRICING_TABLE_SETTINGS,
  "service-hero": DEFAULT_SERVICE_HERO_SETTINGS,
  "service-features": DEFAULT_SERVICE_FEATURES_SETTINGS,
  "service-description": DEFAULT_SERVICE_DESCRIPTION_SETTINGS,
  "service-breadcrumb": DEFAULT_SERVICE_BREADCRUMB_SETTINGS,
  "related-services": DEFAULT_RELATED_SERVICES_SETTINGS,
  "faq": DEFAULT_FAQ_ACCORDION_SETTINGS,
  "blog-post-grid": DEFAULT_BLOG_POST_GRID_SETTINGS,
  "blog-post-carousel": DEFAULT_BLOG_POST_CAROUSEL_SETTINGS,
  "blog-featured-post": DEFAULT_BLOG_FEATURED_POST_SETTINGS,
  "blog-post-list": DEFAULT_BLOG_POST_LIST_SETTINGS,
  "blog-recent-posts": DEFAULT_BLOG_RECENT_POSTS_SETTINGS,
  "button-group": DEFAULT_BUTTON_GROUP_SETTINGS,
};
