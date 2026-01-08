// Header & Footer Type Definitions

// ==========================================
// HEADER TYPES
// ==========================================

export type HeaderLayout = "DEFAULT" | "CENTERED" | "SPLIT" | "MINIMAL" | "MEGA";
export type LogoPosition = "LEFT" | "CENTER" | "RIGHT";

// Button Hover Effects (Phase 5)
export type ButtonHoverEffect =
  | "none"
  | "darken"
  | "lighten"
  | "shadow-lift"
  | "shadow-press"
  | "scale-up"
  | "scale-down"
  | "slide-fill"
  | "border-fill"
  | "gradient-shift"
  | "glow-pulse"
  | "ripple"
  | "craft-expand" // CraftButton style - icon circle expands on hover
  | "heartbeat" // Pulsing heartbeat animation effect
  | "flow-border" // Rotating border gradient effect
  | "stitches" // 3D stitched border effect with inner shadows
  | "ring-hover" // Ring outline appears on hover
  | "neural"; // Neural button with animated border beam

// Gradient direction for button backgrounds
export type GradientDirection =
  | "to-r"      // left to right
  | "to-l"      // right to left
  | "to-t"      // bottom to top
  | "to-b"      // top to bottom
  | "to-tr"     // bottom-left to top-right
  | "to-tl"     // bottom-right to top-left
  | "to-br"     // top-left to bottom-right
  | "to-bl";    // top-right to bottom-left

// Custom Button Styling (Phase 5 - Option B: Variant + Custom Override)
export interface ButtonCustomStyle {
  // Colors
  bgColor?: string;
  textColor?: string;
  borderColor?: string;

  // Gradient (overrides bgColor if set)
  useGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: GradientDirection;

  // Border
  borderWidth?: number;
  borderRadius?: number;

  // Hover
  hoverBgColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;

  // Hover Gradient (overrides hoverBgColor if set)
  hoverUseGradient?: boolean;
  hoverGradientFrom?: string;
  hoverGradientTo?: string;
  hoverGradientDirection?: GradientDirection;

  // Effects
  hoverEffect?: ButtonHoverEffect;
  shadow?: string;
  hoverShadow?: string;

  // Icon
  icon?: string; // Lucide icon name (e.g., "arrow-right", "arrow-up-right")
  iconPosition?: "left" | "right"; // Icon position relative to text
  customIconSvg?: string; // Custom SVG string for external icons

  // Link behavior
  openInNewTab?: boolean; // Open link in new tab
}

export interface CTAButton {
  text: string;
  url: string;
  variant: "primary" | "secondary" | "outline" | "ghost";
  icon?: string;
  enabled?: boolean;
  openInNewTab?: boolean; // Open link in new tab
  // Phase 5: Optional custom style override (backward compatible)
  style?: ButtonCustomStyle;
}

// Announcement Bar Link
export interface TopBarLink {
  label: string;
  url: string;
  target?: "_self" | "_blank";
  icon?: string;
}

// Single Announcement Item
export interface AnnouncementItem {
  id: string;
  text: string;
  links?: TopBarLink[];
  isActive?: boolean;
}

// Animation Effect (unified for both entrance and loop)
export type AnimationEffect = "fade" | "slide-down" | "slide-up" | "pulse";

// Animation Mode - unified system
export type AnimationMode = "none" | "once" | "loop";

// Announcement Bar Style (adapted from ButtonCustomStyle)
export interface AnnouncementBarStyle {
  // Background
  bgColor?: string;
  useGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: GradientDirection;

  // Text
  textColor?: string;

  // Links
  linkColor?: string;
  linkHoverColor?: string;
  linkStyle?: "underline" | "bold" | "button";

  // Border
  borderBottom?: boolean;
  borderColor?: string;
}

// Announcement Bar Style Preset
export interface AnnouncementBarPreset {
  id: string;
  name: string;
  description: string;
  style: AnnouncementBarStyle;
}

// Enhanced TopBarContent with styling support
export interface TopBarContent {
  // Content - Single announcement (legacy support)
  text: string;
  links?: TopBarLink[];

  // Multiple Announcements (new feature)
  announcements?: AnnouncementItem[];

  // Styling (inline in content for flexibility)
  style?: AnnouncementBarStyle;

  // Behavior
  dismissible?: boolean;
  autoHideSeconds?: number;
  position?: "fixed" | "static";

  // Unified Animation System
  animationMode?: AnimationMode; // "none" | "once" | "loop"
  animationEffect?: AnimationEffect; // "fade" | "slide-down" | "slide-up" | "pulse"
  animationInterval?: number; // seconds between loops (only used when mode = "loop", default: 5)

  // Legacy support (kept for backward compatibility)
  entranceAnimation?: "none" | "slide-down" | "fade-in";
  enableLoopAnimation?: boolean;
  loopInterval?: number;
  loopEffect?: AnimationEffect;
  showSocial?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  url?: string | null;
  target: "_self" | "_blank";
  icon?: string | null;
  parentId?: string | null;
  isMegaMenu: boolean;
  megaMenuColumns?: number | null;
  isVisible: boolean;
  visibleOnMobile?: boolean;
  badge?: string | null;
  categoryName?: string | null;
  categoryIcon?: string | null;
  categoryDesc?: string | null;
  sortOrder: number;
  children?: MenuItem[];
}

export interface HeaderConfig {
  id: string;
  name: string;
  isActive: boolean;
  layout: HeaderLayout;
  sticky: boolean;
  transparent: boolean;
  topBarEnabled: boolean;
  topBarContent?: TopBarContent | null;
  logoPosition: LogoPosition;
  logoMaxHeight: number;
  ctaButtons?: CTAButton[];
  showAuthButtons: boolean;
  loginText: string;
  loginUrl?: string;
  loginStyle?: ButtonCustomStyle | null;
  registerText: string;
  registerUrl: string;
  registerStyle?: ButtonCustomStyle | null;
  searchEnabled: boolean;
  mobileBreakpoint: number;
  bgColor?: string | null;
  textColor?: string | null;
  height: number;
  menuItems?: MenuItem[];
  menuItemsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// FOOTER TYPES
// ==========================================

export type FooterLayout =
  | "MULTI_COLUMN"
  | "CENTERED"
  | "MINIMAL"
  | "MEGA"
  // New layouts (Phase 2)
  | "STACKED"
  | "ASYMMETRIC"
  | "MEGA_PLUS"
  | "APP_FOCUSED"
  | "NEWSLETTER_HERO";

export type FooterWidgetType =
  | "BRAND"
  | "LINKS"
  | "CONTACT"
  | "NEWSLETTER"
  | "SOCIAL"
  | "TEXT"
  | "RECENT_POSTS"
  | "SERVICES"
  | "STATES"
  | "CUSTOM_HTML"
  // New widget types (Phase 4)
  | "APP_DOWNLOAD"
  | "PAYMENT_METHODS"
  | "AWARDS"
  | "MAP"
  | "WORKING_HOURS"
  | "LANGUAGE_SELECT"
  | "THEME_TOGGLE"
  | "FEATURED_PRODUCT"
  | "TESTIMONIAL"
  | "COUNTDOWN"
  | "CTA_BANNER"
  | "BUTTON"; // Custom styled button widget

export interface BottomLink {
  label: string;
  url: string;
}

export interface TrustBadge {
  image: string;
  alt: string;
  url?: string;
}

export interface FooterWidgetLink {
  id: string;
  label: string;
  url?: string | null;
  target: "_self" | "_blank";
  icon?: string | null;
  isVisible: boolean;
  sortOrder: number;
}

export interface FooterWidget {
  id: string;
  footerId: string;
  type: FooterWidgetType;
  title?: string | null;
  showTitle: boolean;
  content?: Record<string, unknown> | null;
  column: number;
  sortOrder: number;
  customClass?: string | null;
  menuItems?: FooterWidgetLink[];
  linksCount?: number;
}

// Responsive columns configuration
export interface ResponsiveColumns {
  mobile: number;
  tablet: number;
  desktop: number;
}

// Background gradient configuration
export interface BackgroundGradient {
  type: "linear" | "radial" | "conic";
  colors: { color: string; position: number }[];
  angle?: number;
}

// Color palette for presets
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  bg: string;
}

// Social icon styling
export interface SocialIconStyling {
  shape: "circle" | "square" | "rounded" | "pill";
  size: "sm" | "md" | "lg" | "xl";
  colorMode: "brand" | "monochrome" | "accent";
  hoverEffect: "scale" | "lift" | "glow" | "rotate";
  bgStyle: "none" | "subtle" | "solid" | "outline";
}

// Typography settings
export interface FooterTypography {
  headingFont?: string;
  bodyFont?: string;
  headingSize: "sm" | "base" | "lg" | "xl";
  headingWeight: "medium" | "semibold" | "bold";
  headingStyle: "normal" | "uppercase" | "capitalize";
}

export interface FooterConfig {
  id: string;
  name: string;
  isActive: boolean;
  layout: FooterLayout;
  columns: number;

  // Responsive columns (Phase 3)
  responsiveColumns?: ResponsiveColumns | null;
  sectionOrder?: string[];

  // Newsletter
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterSubtitle?: string | null;
  newsletterProvider?: string | null;
  newsletterFormAction?: string | null;

  // Social & Contact
  showSocialLinks: boolean;
  socialPosition: string;
  showContactInfo: boolean;
  contactPosition: string;

  // Bottom Bar
  bottomBarEnabled: boolean;
  bottomBarLayout?: string;
  copyrightText?: string | null;
  showDisclaimer: boolean;
  disclaimerText?: string | null;
  bottomLinks?: BottomLink[];

  // Trust Badges
  showTrustBadges: boolean;
  trustBadges?: TrustBadge[];

  // Background Styling (Phase 3)
  bgType?: string;
  bgColor?: string | null;
  bgGradient?: BackgroundGradient | null;
  bgPattern?: string | null;
  bgPatternColor?: string | null;
  bgPatternOpacity?: number | null;
  bgImage?: string | null;
  bgImageOverlay?: string | null;

  // Text Styling
  textColor?: string | null;
  headingColor?: string | null;
  linkColor?: string | null;
  linkHoverColor?: string | null;
  accentColor?: string | null;
  borderColor?: string | null;

  // Typography (Phase 3)
  headingFont?: string | null;
  bodyFont?: string | null;
  headingSize?: string;
  headingWeight?: string;
  headingStyle?: string;

  // Divider
  dividerStyle?: string;
  dividerColor?: string | null;

  // Social Icon Styling (Phase 3)
  socialShape?: string;
  socialSize?: string;
  socialColorMode?: string;
  socialHoverEffect?: string;

  // Effects & Animation (Phase 3)
  enableAnimations?: boolean;
  entranceAnimation?: string | null;
  animationDuration?: number;
  linkHoverEffect?: string;
  topBorderStyle?: string;
  topBorderHeight?: number;
  topBorderColor?: string | null;

  // Shadow & Border Radius
  shadow?: string;
  borderRadius?: number;

  // Spacing
  paddingTop: number;
  paddingBottom: number;

  // Advanced
  customCSS?: string | null;
  customJS?: string | null;

  // Preset reference
  presetId?: string | null;

  // Relations
  widgets?: FooterWidget[];
  widgetsCount?: number;

  createdAt: string;
  updatedAt: string;
}

// Footer Preset (Phase 1)
export interface FooterPreset {
  id: string;
  name: string;
  description?: string | null;
  category: "minimal" | "professional" | "modern" | "creative" | "industry";
  thumbnail?: string | null;
  config: Partial<FooterConfig>;
  isBuiltIn: boolean;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
  colorPalette?: ColorPalette | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface HeaderApiResponse {
  headers: HeaderConfig[];
  total: number;
}

export interface FooterApiResponse {
  footers: FooterConfig[];
  total: number;
}

// Public API response types (for frontend consumption)
export interface PublicHeaderResponse {
  id: string;
  layout: HeaderLayout;
  sticky: boolean;
  transparent: boolean;
  height: number;
  topBar?: {
    enabled: boolean;
    content?: TopBarContent;
  };
  logo: {
    position: LogoPosition;
    maxHeight: number;
  };
  menu: MenuItem[];
  cta: CTAButton[];
  auth: {
    showButtons: boolean;
    loginText: string;
    loginUrl?: string;
    loginStyle?: ButtonCustomStyle;
    registerText: string;
    registerUrl: string;
  };
  search: {
    enabled: boolean;
  };
  styling: {
    bgColor?: string;
    textColor?: string;
    hoverColor?: string;
  };
}

export interface PublicFooterResponse {
  id: string;
  layout: FooterLayout;
  columns: number;
  responsiveColumns?: ResponsiveColumns;
  sectionOrder?: string[];
  widgets: FooterWidget[];
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle?: string;
    provider?: string;
    formAction?: string;
  };
  social: {
    show: boolean;
    position: string;
    shape?: string;
    size?: string;
    colorMode?: string;
    hoverEffect?: string;
    bgStyle?: string;
  };
  contact: {
    show: boolean;
    position: string;
  };
  bottomBar: {
    enabled: boolean;
    layout?: string;
    copyrightText?: string;
    showDisclaimer: boolean;
    disclaimerText?: string;
    links: BottomLink[];
  };
  trustBadges: {
    show: boolean;
    badges: TrustBadge[];
  };
  styling: {
    // Background
    bgType?: string;
    bgColor?: string;
    bgGradient?: BackgroundGradient;
    bgPattern?: string;
    bgPatternColor?: string;
    bgPatternOpacity?: number;
    bgImage?: string;
    bgImageOverlay?: string;

    // Text colors
    textColor?: string;
    headingColor?: string;
    linkColor?: string;
    linkHoverColor?: string;
    accentColor?: string;
    borderColor?: string;

    // Typography
    headingFont?: string;
    bodyFont?: string;
    headingSize?: string;
    headingWeight?: string;
    headingStyle?: string;

    // Divider
    dividerStyle?: string;
    dividerColor?: string;

    // Effects
    enableAnimations?: boolean;
    entranceAnimation?: string;
    animationDuration?: number;
    linkHoverEffect?: string;
    topBorderStyle?: string;
    topBorderHeight?: number;
    topBorderColor?: string;

    // Shadow & Border
    shadow?: string;
    borderRadius?: number;

    // Container
    containerWidth?: string;
    containerStyle?: string;
    cornerRadiusTL?: number;
    cornerRadiusTR?: number;
    cornerRadiusBL?: number;
    cornerRadiusBR?: number;

    // Spacing
    paddingTop: number;
    paddingBottom: number;
  };
}
