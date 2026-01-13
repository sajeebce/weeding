// ============================================
// WIDGET REGISTRATION
// ============================================
// This file registers all widgets with the WidgetRegistry.
// Import this file once in your app to register all widgets.

import { WidgetRegistry } from "./widget-registry";
import {
  DEFAULT_HERO_CONTENT_SETTINGS,
  DEFAULT_IMAGE_SETTINGS,
  DEFAULT_IMAGE_SLIDER_SETTINGS,
  DEFAULT_TRUST_BADGES_SETTINGS,
  DEFAULT_STATS_SECTION_SETTINGS,
  DEFAULT_LEAD_FORM_SETTINGS,
  DEFAULT_HEADING_SETTINGS,
  DEFAULT_TEXT_BLOCK_SETTINGS,
  DEFAULT_DIVIDER_SETTINGS,
  DEFAULT_SERVICE_CARD_SETTINGS,
} from "./defaults";

// Import widget components
import { HeroContentWidget } from "@/components/page-builder/widgets/content";
import { ImageWidget, ImageSliderWidget } from "@/components/page-builder/widgets/media";
import {
  TrustBadgesWidget,
  StatsSectionWidget,
} from "@/components/page-builder/widgets/social-proof";
import { DividerWidget } from "@/components/page-builder/widgets/layout";
import { ServiceCardWidget } from "@/components/page-builder/widgets/commerce";

// Register all widgets
export function registerAllWidgets() {
  // Content Widgets
  WidgetRegistry.register({
    type: "hero-content",
    name: "Hero Content",
    description: "Hero section with headline, subheadline, features, and CTAs",
    icon: "Sparkles",
    category: "content",
    defaultSettings: DEFAULT_HERO_CONTENT_SETTINGS,
    component: HeroContentWidget,
  });

  WidgetRegistry.register({
    type: "heading",
    name: "Heading",
    description: "Section heading with customizable size and alignment",
    icon: "Heading",
    category: "content",
    defaultSettings: DEFAULT_HEADING_SETTINGS,
    component: () => null, // TODO: Implement HeadingWidget
  });

  WidgetRegistry.register({
    type: "text-block",
    name: "Text Block",
    description: "Paragraph text block",
    icon: "AlignLeft",
    category: "content",
    defaultSettings: DEFAULT_TEXT_BLOCK_SETTINGS,
    component: () => null, // TODO: Implement TextBlockWidget
  });

  // Media Widgets
  WidgetRegistry.register({
    type: "image",
    name: "Image",
    description: "Display an image with customizable styling",
    icon: "Image",
    category: "media",
    defaultSettings: DEFAULT_IMAGE_SETTINGS,
    component: ImageWidget,
  });

  WidgetRegistry.register({
    type: "image-slider",
    name: "Image Slider",
    description: "Hero slider with Ken Burns, 3D effects, and content layers",
    icon: "GalleryHorizontal",
    category: "media",
    defaultSettings: DEFAULT_IMAGE_SLIDER_SETTINGS,
    component: ImageSliderWidget,
  });

  // Social Proof Widgets
  WidgetRegistry.register({
    type: "trust-badges",
    name: "Trust Badges",
    description: "Display trust badges with icons and text",
    icon: "Shield",
    category: "social-proof",
    defaultSettings: DEFAULT_TRUST_BADGES_SETTINGS,
    component: TrustBadgesWidget,
  });

  WidgetRegistry.register({
    type: "stats-section",
    name: "Stats Section",
    description: "Display statistics with animated counters",
    icon: "BarChart3",
    category: "social-proof",
    defaultSettings: DEFAULT_STATS_SECTION_SETTINGS,
    component: StatsSectionWidget,
  });

  // Form Widgets
  WidgetRegistry.register({
    type: "lead-form",
    name: "Lead Form",
    description: "Contact form for lead capture",
    icon: "FileInput",
    category: "forms",
    defaultSettings: DEFAULT_LEAD_FORM_SETTINGS,
    component: () => null, // TODO: Implement LeadFormWidget
  });

  // Layout Widgets
  WidgetRegistry.register({
    type: "divider",
    name: "Divider",
    description: "Modern divider with multiple styles",
    icon: "Minus",
    category: "layout",
    defaultSettings: DEFAULT_DIVIDER_SETTINGS,
    component: DividerWidget,
  });

  // Commerce Widgets
  WidgetRegistry.register({
    type: "service-card",
    name: "Service Cards",
    description: "Display services in beautiful card layouts with 6 style variants",
    icon: "LayoutGrid",
    category: "commerce",
    defaultSettings: DEFAULT_SERVICE_CARD_SETTINGS,
    component: ServiceCardWidget,
  });
}

// Auto-register on import
registerAllWidgets();
