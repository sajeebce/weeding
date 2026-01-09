"use client";

import type { HeroSettings } from "@/lib/landing-blocks/types";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import {
  HeroCentered,
  HeroSplit,
  HeroMinimal,
  HeroSplitDashboard,
} from "./variants";

interface HeroBlockProps {
  settings?: Partial<HeroSettings>;
  isPreview?: boolean;
  device?: "desktop" | "mobile";
}

// Variant component map
const variants = {
  centered: HeroCentered,
  split: HeroSplit,
  minimal: HeroMinimal,
  "split-dashboard": HeroSplitDashboard,
  // Phase 2 variants (placeholders for now)
  slider: HeroCentered, // Fallback to centered
  video: HeroCentered, // Fallback to centered
  "with-form": HeroCentered, // Fallback to centered
} as const;

export function HeroBlock({ settings, isPreview = false, device }: HeroBlockProps) {
  // Merge with defaults
  const mergedSettings: HeroSettings = {
    ...defaultHeroSettings,
    ...settings,
    background: {
      ...defaultHeroSettings.background,
      ...settings?.background,
    },
    badge: {
      ...defaultHeroSettings.badge,
      ...settings?.badge,
    },
    headline: {
      ...defaultHeroSettings.headline,
      ...settings?.headline,
    },
    subheadline: {
      ...defaultHeroSettings.subheadline,
      ...settings?.subheadline,
    },
    features: {
      ...defaultHeroSettings.features,
      ...settings?.features,
    },
    primaryCTA: {
      ...defaultHeroSettings.primaryCTA,
      ...settings?.primaryCTA,
    },
    secondaryCTA: {
      ...defaultHeroSettings.secondaryCTA,
      ...settings?.secondaryCTA,
    },
    trustText: {
      ...defaultHeroSettings.trustText,
      ...settings?.trustText,
    },
    trustBadges: {
      ...defaultHeroSettings.trustBadges,
      ...settings?.trustBadges,
    },
    stats: {
      ...defaultHeroSettings.stats,
      ...settings?.stats,
    },
  };

  // Get the variant component
  const Variant = variants[mergedSettings.variant] || HeroCentered;

  return <Variant settings={mergedSettings} isPreview={isPreview} device={device} />;
}

// Export for direct use
export { HeroCentered, HeroSplit, HeroMinimal, HeroSplitDashboard };

// Export types
export type { HeroSettings } from "@/lib/landing-blocks/types";
