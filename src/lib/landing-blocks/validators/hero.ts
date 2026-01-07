import { z } from "zod";

// ============================================
// HERO BLOCK ZOD VALIDATORS
// ============================================

// Animated Words Schema
export const animatedWordsSchema = z.object({
  enabled: z.boolean(),
  words: z.array(z.string()).min(1).max(10),
  animation: z.object({
    type: z.enum(["slide-up", "fade", "typewriter", "flip"]),
    duration: z.number().min(1000).max(10000),
    transitionDuration: z.number().min(100).max(2000),
    pauseOnHover: z.boolean(),
  }),
  style: z.object({
    color: z.enum(["primary", "accent", "gradient", "custom"]),
    customColor: z.string().optional(),
    underline: z.boolean(),
    background: z.boolean(),
  }),
});

// Dashboard Visual Schema
export const dashboardVisualSchema = z.object({
  preset: z.enum(["analytics", "ecommerce", "saas", "crm", "custom"]),
  customImageUrl: z.string().optional(),
  customSvgUrl: z.string().optional(),
  interactionEffect: z.object({
    type: z.enum(["none", "parallax", "float", "tilt-3d", "glow"]),
    intensity: z.enum(["subtle", "medium", "strong"]),
  }),
  style: z.object({
    shadow: z.enum(["none", "sm", "md", "lg", "xl"]),
    border: z.boolean(),
    borderRadius: z.enum(["none", "sm", "md", "lg", "xl"]),
    scale: z.number().min(0.8).max(1.2),
    rotation: z.number().min(-15).max(15),
  }),
  entranceAnimation: z.object({
    type: z.enum(["none", "fade-in", "slide-up", "scale-in"]),
    delay: z.number().min(0).max(2000),
    duration: z.number().min(100).max(2000),
  }),
});

// Background Schema
export const heroBackgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "image", "video", "pattern"]),
  color: z.string().optional(),
  gradientFrom: z.string().optional(),
  gradientTo: z.string().optional(),
  gradientAngle: z.number().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  overlay: z.object({
    enabled: z.boolean(),
    color: z.string(),
    opacity: z.number().min(0).max(1),
  }).optional(),
  pattern: z.object({
    type: z.enum(["grid", "dots", "lines"]),
    color: z.string(),
    opacity: z.number().min(0).max(1),
  }).optional(),
});

// Badge Schema
export const heroBadgeSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(100),
  emoji: z.string().optional(),
  style: z.enum(["default", "outline", "solid"]),
});

// Headline Schema
export const heroHeadlineSchema = z.object({
  text: z.string().min(1).max(200),
  highlightWord: z.string().optional(),
  size: z.enum(["lg", "xl", "2xl"]),
  animatedWords: animatedWordsSchema.optional(),
});

// Subheadline Schema
export const heroSubheadlineSchema = z.object({
  text: z.string().max(500),
  size: z.enum(["sm", "base", "lg"]),
});

// Features Schema
export const heroFeaturesSchema = z.object({
  enabled: z.boolean(),
  items: z.array(z.string()).max(6),
  icon: z.enum(["checkCircle", "check", "star", "arrow"]),
});

// CTA Schema
export const heroCTASchema = z.object({
  text: z.string().min(1).max(50),
  link: z.string().min(1),
  variant: z.enum(["solid", "outline", "secondary", "ghost"]),
  showPrice: z.boolean().optional(),
  priceText: z.string().optional(),
  icon: z.string().optional(),
});

// Secondary CTA Schema
export const heroSecondaryCTASchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(50),
  link: z.string(),
  variant: z.enum(["solid", "outline", "secondary", "ghost"]),
  icon: z.string().optional(),
});

// Trust Text Schema
export const heroTrustTextSchema = z.object({
  enabled: z.boolean(),
  text: z.string().max(100),
  showRating: z.boolean(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
});

// Trust Badge Item Schema
export const trustBadgeItemSchema = z.object({
  icon: z.string(),
  text: z.string().max(50),
});

// Trust Badges Schema
export const heroTrustBadgesSchema = z.object({
  enabled: z.boolean(),
  items: z.array(trustBadgeItemSchema).max(6),
});

// Stat Item Schema
export const statItemSchema = z.object({
  value: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

// Stats Schema
export const heroStatsSchema = z.object({
  enabled: z.boolean(),
  items: z.array(statItemSchema).max(6),
});

// Visual Schema
export const heroVisualSchema = z.object({
  type: z.enum(["image", "illustration", "screenshot", "dashboard-preset", "custom-svg"]),
  url: z.string().optional(),
  alt: z.string().optional(),
  position: z.enum(["left", "right"]),
  dashboardPreset: dashboardVisualSchema.optional(),
});

// Avatar Stack Schema
export const avatarStackSchema = z.object({
  enabled: z.boolean(),
  countText: z.string().max(50),
});

// Logo Bar Schema
export const logoBarSchema = z.object({
  enabled: z.boolean(),
  animation: z.enum(["none", "marquee", "scroll"]),
  speed: z.enum(["slow", "medium", "fast"]),
  grayscale: z.boolean(),
});

// ============================================
// MAIN HERO SETTINGS SCHEMA
// ============================================

export const heroSettingsSchema = z.object({
  variant: z.enum(["centered", "split", "split-dashboard", "slider", "with-form", "video", "minimal"]),
  background: heroBackgroundSchema,
  badge: heroBadgeSchema,
  headline: heroHeadlineSchema,
  subheadline: heroSubheadlineSchema,
  features: heroFeaturesSchema,
  primaryCTA: heroCTASchema,
  secondaryCTA: heroSecondaryCTASchema,
  trustText: heroTrustTextSchema,
  trustBadges: heroTrustBadgesSchema,
  stats: heroStatsSchema,
  visual: heroVisualSchema.optional(),
  avatarStack: avatarStackSchema.optional(),
  logoBar: logoBarSchema.optional(),
});

export type HeroSettingsSchema = z.infer<typeof heroSettingsSchema>;
