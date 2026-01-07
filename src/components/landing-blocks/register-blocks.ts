// ============================================
// REGISTER ALL LANDING BLOCKS
// ============================================

import { blockRegistry } from "@/lib/landing-blocks/registry";
import { defaultHeroSettings } from "@/lib/landing-blocks/defaults";
import { HeroBlock } from "./hero";

// Register Hero Block
blockRegistry.register({
  type: "hero",
  name: "Hero Section",
  description: "Main hero section with headline, CTA, and trust elements",
  icon: "Layout",
  category: "hero",
  defaultSettings: defaultHeroSettings,
  component: HeroBlock as React.ComponentType<{ settings: unknown }>,
  thumbnail: "/admin/block-thumbnails/hero.png",
});

// More blocks will be registered here as they're implemented
// blockRegistry.register({ type: "logo-bar", ... });
// blockRegistry.register({ type: "services-grid", ... });
// etc.
