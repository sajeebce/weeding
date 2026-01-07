// ============================================
// LANDING BLOCKS TYPE SYSTEM
// ============================================

import type { LandingPageBlock } from "@prisma/client";

// Block Categories
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

// Block Types
export type BlockType =
  | "hero"
  | "logo-bar"
  | "services-grid"
  | "how-it-works"
  | "pricing"
  | "testimonials"
  | "faq"
  | "cta-section"
  | "stats-counter"
  | "newsletter";

// ============================================
// HERO BLOCK TYPES
// ============================================

export type HeroVariant =
  | "centered"
  | "split"
  | "split-dashboard"
  | "slider"
  | "with-form"
  | "video"
  | "minimal";

export type HeadlineSize = "lg" | "xl" | "2xl";
export type AnimationWordType = "slide-up" | "fade" | "typewriter" | "flip";
export type AnimationWordColor = "primary" | "accent" | "gradient" | "custom";
export type DashboardPreset = "analytics" | "ecommerce" | "saas" | "crm" | "custom";
export type InteractionEffectType = "none" | "parallax" | "float" | "tilt-3d" | "glow";
export type EntranceAnimationType = "none" | "fade-in" | "slide-up" | "scale-in";
export type BackgroundType = "solid" | "gradient" | "image" | "video" | "pattern";
export type CTAVariant = "solid" | "outline" | "secondary" | "ghost";

// Animated Words Settings (for split-dashboard variant)
export interface AnimatedWordsSettings {
  enabled: boolean;
  words: string[]; // e.g., ["Growth", "Success", "Revenue", "Future"]
  animation: {
    type: AnimationWordType;
    duration: number; // ms for each word display (e.g., 3000)
    transitionDuration: number; // ms for animation transition (e.g., 500)
    pauseOnHover: boolean;
  };
  style: {
    color: AnimationWordColor;
    customColor?: string;
    underline: boolean;
    background: boolean; // Pill background around word
  };
}

// Dashboard Visual Settings (for split-dashboard variant)
export interface DashboardVisualSettings {
  preset: DashboardPreset;
  customImageUrl?: string;
  customSvgUrl?: string;
  interactionEffect: {
    type: InteractionEffectType;
    intensity: "subtle" | "medium" | "strong";
  };
  style: {
    shadow: "none" | "sm" | "md" | "lg" | "xl";
    border: boolean;
    borderRadius: "none" | "sm" | "md" | "lg" | "xl";
    scale: number; // 0.8 - 1.2
    rotation: number; // degrees, -15 to 15
  };
  entranceAnimation: {
    type: EntranceAnimationType;
    delay: number; // ms
    duration: number; // ms
  };
}

// Hero Background Settings
export interface HeroBackgroundSettings {
  type: BackgroundType;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  imageUrl?: string;
  videoUrl?: string;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
  pattern?: {
    type: "grid" | "dots" | "lines";
    color: string;
    opacity: number;
  };
}

// Hero Badge Settings
export interface HeroBadgeSettings {
  enabled: boolean;
  text: string;
  emoji?: string;
  style: "default" | "outline" | "solid";
}

// Hero Headline Settings
export interface HeroHeadlineSettings {
  text: string;
  highlightWord?: string;
  size: HeadlineSize;
  animatedWords?: AnimatedWordsSettings;
}

// Hero Subheadline Settings
export interface HeroSubheadlineSettings {
  text: string;
  size: "sm" | "base" | "lg";
}

// Hero Features List Settings
export interface HeroFeaturesSettings {
  enabled: boolean;
  items: string[];
  icon: "checkCircle" | "check" | "star" | "arrow";
}

// Hero CTA Button Settings
export interface HeroCTASettings {
  text: string;
  link: string;
  variant: CTAVariant;
  showPrice?: boolean;
  priceText?: string;
  icon?: string;
}

// Hero Secondary CTA Settings
export interface HeroSecondaryCTASettings {
  enabled: boolean;
  text: string;
  link: string;
  variant: CTAVariant;
  icon?: string;
}

// Trust Rating Settings
export interface HeroTrustTextSettings {
  enabled: boolean;
  text: string;
  showRating: boolean;
  rating: number;
  reviewCount: number;
}

// Trust Badge Item
export interface TrustBadgeItem {
  icon: string;
  text: string;
}

// Hero Trust Badges Settings
export interface HeroTrustBadgesSettings {
  enabled: boolean;
  items: TrustBadgeItem[];
}

// Stat Item
export interface StatItem {
  value: string;
  label: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
}

// Hero Stats Settings
export interface HeroStatsSettings {
  enabled: boolean;
  items: StatItem[];
}

// Hero Visual Settings (for split variants)
export interface HeroVisualSettings {
  type: "image" | "illustration" | "screenshot" | "dashboard-preset" | "custom-svg";
  url?: string;
  alt?: string;
  position: "left" | "right";
  dashboardPreset?: DashboardVisualSettings;
}

// Avatar Stack Settings (for split-dashboard)
export interface AvatarStackSettings {
  enabled: boolean;
  countText: string; // "+500 entrepreneurs"
}

// Logo Bar Settings (for split-dashboard)
export interface LogoBarSettings {
  enabled: boolean;
  animation: "none" | "marquee" | "scroll";
  speed: "slow" | "medium" | "fast";
  grayscale: boolean;
}

// ============================================
// MAIN HERO SETTINGS INTERFACE
// ============================================

export interface HeroSettings {
  // Layout Variant
  variant: HeroVariant;

  // Background
  background: HeroBackgroundSettings;

  // Badge
  badge: HeroBadgeSettings;

  // Headline
  headline: HeroHeadlineSettings;

  // Subheadline
  subheadline: HeroSubheadlineSettings;

  // Features List
  features: HeroFeaturesSettings;

  // Primary CTA
  primaryCTA: HeroCTASettings;

  // Secondary CTA
  secondaryCTA: HeroSecondaryCTASettings;

  // Trust Text (rating line)
  trustText: HeroTrustTextSettings;

  // Trust Badges
  trustBadges: HeroTrustBadgesSettings;

  // Stats Section
  stats: HeroStatsSettings;

  // Visual (for split variants)
  visual?: HeroVisualSettings;

  // Avatar Stack (for split-dashboard)
  avatarStack?: AvatarStackSettings;

  // Logo Bar (for split-dashboard)
  logoBar?: LogoBarSettings;
}

// ============================================
// BLOCK DEFINITION TYPES
// ============================================

export interface BlockDefinition<T = unknown> {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: BlockCategory;
  defaultSettings: T;
  component: React.ComponentType<{ settings: T }>;
  settingsPanel?: React.ComponentType<{
    settings: T;
    onChange: (settings: T) => void;
  }>;
  thumbnail?: string;
}

// Extended block type with runtime info
export interface BlockWithSettings<T = unknown> extends Omit<LandingPageBlock, "settings"> {
  settings: T;
}

// Helper type for component props
export interface BlockComponentProps<T> {
  settings: T;
  isPreview?: boolean;
}

// Landing page with typed blocks
export interface LandingPageWithBlocks {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  blocks: LandingPageBlock[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
  version: number;
}
