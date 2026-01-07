import type { HeroSettings } from "./types";

// ============================================
// DEFAULT HERO SETTINGS
// ============================================

export const defaultHeroSettings: HeroSettings = {
  variant: "centered",

  background: {
    type: "solid",
    color: "#0A0F1E", // Midnight color
    pattern: {
      type: "grid",
      color: "#ffffff",
      opacity: 0.03,
    },
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
    text: "Launch your American dream from anywhere in the world. We handle everything from LLC formation to EIN, Amazon seller accounts, and business banking — so you can focus on growing your business.",
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
    variant: "solid",
    showPrice: true,
    priceText: "From $0",
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
};

// ============================================
// VARIANT-SPECIFIC DEFAULTS
// ============================================

export const heroVariantDefaults: Record<string, Partial<HeroSettings>> = {
  centered: {
    // Uses base defaults
  },

  split: {
    visual: {
      type: "image",
      url: "/images/hero-illustration.svg",
      alt: "US LLC Formation Illustration",
      position: "right",
    },
  },

  "split-dashboard": {
    headline: {
      text: "Drive your business",
      highlightWord: undefined,
      size: "xl",
      animatedWords: {
        enabled: true,
        words: ["Growth", "Success", "Revenue", "Future"],
        animation: {
          type: "slide-up",
          duration: 3000,
          transitionDuration: 500,
          pauseOnHover: true,
        },
        style: {
          color: "primary",
          underline: false,
          background: true,
        },
      },
    },
    visual: {
      type: "dashboard-preset",
      position: "right",
      dashboardPreset: {
        preset: "analytics",
        interactionEffect: {
          type: "tilt-3d",
          intensity: "medium",
        },
        style: {
          shadow: "lg",
          border: true,
          borderRadius: "lg",
          scale: 1,
          rotation: 5,
        },
        entranceAnimation: {
          type: "slide-up",
          delay: 300,
          duration: 600,
        },
      },
    },
    avatarStack: {
      enabled: true,
      countText: "+500 entrepreneurs",
    },
    logoBar: {
      enabled: true,
      animation: "marquee",
      speed: "medium",
      grayscale: true,
    },
  },

  minimal: {
    background: {
      type: "solid",
      color: "#ffffff",
    },
    badge: {
      enabled: false,
      text: "",
      style: "default",
    },
    trustBadges: {
      enabled: false,
      items: [],
    },
    stats: {
      enabled: false,
      items: [],
    },
  },

  slider: {
    // Will be implemented in Phase 2
  },

  video: {
    background: {
      type: "video",
      videoUrl: "/videos/hero-background.mp4",
      overlay: {
        enabled: true,
        color: "#000000",
        opacity: 0.5,
      },
    },
  },

  "with-form": {
    // Will be implemented in Phase 2
  },
};

// ============================================
// DEFAULT HOMEPAGE BLOCKS
// ============================================

export const defaultHomepageBlocks = [
  {
    type: "hero",
    sortOrder: 0,
    settings: defaultHeroSettings,
  },
  // More blocks will be added as they're implemented
];

/**
 * Get merged settings for a hero variant
 */
export function getHeroSettingsForVariant(variant: string): HeroSettings {
  const variantDefaults = heroVariantDefaults[variant] || {};
  return {
    ...defaultHeroSettings,
    ...variantDefaults,
    variant: variant as HeroSettings["variant"],
  };
}
