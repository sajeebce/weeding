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
  DEFAULT_TESTIMONIALS_SETTINGS,
  DEFAULT_LEAD_FORM_SETTINGS,
  DEFAULT_HEADING_SETTINGS,
  DEFAULT_TEXT_BLOCK_SETTINGS,
  DEFAULT_DIVIDER_SETTINGS,
  DEFAULT_SERVICE_CARD_SETTINGS,
  DEFAULT_SERVICE_LIST_SETTINGS,
  DEFAULT_PROCESS_STEPS_SETTINGS,
  DEFAULT_PRICING_TABLE_SETTINGS,
  DEFAULT_SERVICE_HERO_SETTINGS,
  DEFAULT_FAQ_ACCORDION_SETTINGS,
} from "./defaults";

// Import widget components
import { HeroContentWidget, ProcessStepsWidget, HeadingWidget, TextBlockWidget } from "@/components/page-builder/widgets/content";
import { ImageWidget, ImageSliderWidget } from "@/components/page-builder/widgets/media";
import {
  TrustBadgesWidget,
  StatsSectionWidget,
  TestimonialsWidget,
} from "@/components/page-builder/widgets/social-proof";
import { DividerWidget, FaqAccordionWidget } from "@/components/page-builder/widgets/layout";
import { ServiceCardWidget, ServiceListWidget, PricingTableWidget } from "@/components/page-builder/widgets/commerce";
import { LeadFormWidget } from "@/components/page-builder/widgets/forms";
import { ServiceHeroWidget } from "@/components/page-builder/widgets/service";

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
    description: "Advanced heading with typography, text effects, and animations",
    icon: "Heading",
    category: "content",
    defaultSettings: DEFAULT_HEADING_SETTINGS,
    component: HeadingWidget,
  });

  WidgetRegistry.register({
    type: "text-block",
    name: "Text Block",
    description: "Rich text editor with Tiptap - paragraphs, headings, lists, links",
    icon: "AlignLeft",
    category: "content",
    defaultSettings: DEFAULT_TEXT_BLOCK_SETTINGS,
    component: TextBlockWidget,
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

  WidgetRegistry.register({
    type: "testimonials-carousel",
    name: "Testimonials",
    description: "Customer testimonials with grid, carousel, and video views",
    icon: "Quote",
    category: "social-proof",
    defaultSettings: DEFAULT_TESTIMONIALS_SETTINGS,
    component: TestimonialsWidget,
  });

  // Form Widgets
  WidgetRegistry.register({
    type: "lead-form",
    name: "Lead Form",
    description: "Contact form for lead capture",
    icon: "FileInput",
    category: "forms",
    defaultSettings: DEFAULT_LEAD_FORM_SETTINGS,
    component: LeadFormWidget,
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

  WidgetRegistry.register({
    type: "service-list",
    name: "Service List",
    description: "Display service categories with their services and prices",
    icon: "List",
    category: "commerce",
    defaultSettings: DEFAULT_SERVICE_LIST_SETTINGS,
    component: ServiceListWidget,
  });

  WidgetRegistry.register({
    type: "pricing-table",
    name: "Pricing Table",
    description: "Interactive pricing comparison table with packages and features",
    icon: "CreditCard",
    category: "commerce",
    defaultSettings: DEFAULT_PRICING_TABLE_SETTINGS,
    component: PricingTableWidget,
  });

  WidgetRegistry.register({
    type: "process-steps",
    name: "Process Steps",
    description: "How It Works section with animated connector lines",
    icon: "ListOrdered",
    category: "content",
    defaultSettings: DEFAULT_PROCESS_STEPS_SETTINGS,
    component: ProcessStepsWidget,
  });

  // FAQ Widget
  WidgetRegistry.register({
    type: "faq",
    name: "FAQ Accordion",
    description: "Display FAQs from the admin panel in beautiful accordion styles",
    icon: "HelpCircle",
    category: "content",
    defaultSettings: DEFAULT_FAQ_ACCORDION_SETTINGS,
    component: FaqAccordionWidget,
  });

  // Service Widgets (for Service Details template)
  WidgetRegistry.register({
    type: "service-hero",
    name: "Service Hero",
    description: "Dynamic service title, description, and CTA buttons",
    icon: "Sparkles",
    category: "service",
    defaultSettings: DEFAULT_SERVICE_HERO_SETTINGS,
    component: ServiceHeroWidget,
  });
}

// Auto-register on import
registerAllWidgets();
