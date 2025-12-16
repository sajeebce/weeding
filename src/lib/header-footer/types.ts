// Header & Footer Type Definitions

// ==========================================
// HEADER TYPES
// ==========================================

export type HeaderLayout = "DEFAULT" | "CENTERED" | "SPLIT" | "MINIMAL" | "MEGA";
export type LogoPosition = "LEFT" | "CENTER" | "RIGHT";

export interface CTAButton {
  text: string;
  url: string;
  variant: "primary" | "secondary" | "outline";
  icon?: string;
}

export interface TopBarContent {
  text: string;
  links?: { label: string; url: string }[];
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
  registerText: string;
  registerUrl: string;
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

export type FooterLayout = "MULTI_COLUMN" | "CENTERED" | "MINIMAL" | "MEGA";
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
  | "CUSTOM_HTML";

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

export interface FooterConfig {
  id: string;
  name: string;
  isActive: boolean;
  layout: FooterLayout;
  columns: number;
  newsletterEnabled: boolean;
  newsletterTitle: string;
  newsletterSubtitle?: string | null;
  newsletterProvider?: string | null;
  newsletterFormAction?: string | null;
  showSocialLinks: boolean;
  socialPosition: string;
  showContactInfo: boolean;
  contactPosition: string;
  bottomBarEnabled: boolean;
  copyrightText?: string | null;
  showDisclaimer: boolean;
  disclaimerText?: string | null;
  bottomLinks?: BottomLink[];
  showTrustBadges: boolean;
  trustBadges?: TrustBadge[];
  bgColor?: string | null;
  textColor?: string | null;
  accentColor?: string | null;
  borderColor?: string | null;
  paddingTop: number;
  paddingBottom: number;
  widgets?: FooterWidget[];
  widgetsCount?: number;
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
    registerText: string;
    registerUrl: string;
  };
  search: {
    enabled: boolean;
  };
  styling: {
    bgColor?: string;
    textColor?: string;
  };
}

export interface PublicFooterResponse {
  id: string;
  layout: FooterLayout;
  columns: number;
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
  };
  contact: {
    show: boolean;
    position: string;
  };
  bottomBar: {
    enabled: boolean;
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
    bgColor?: string;
    textColor?: string;
    accentColor?: string;
    borderColor?: string;
    paddingTop: number;
    paddingBottom: number;
  };
}
