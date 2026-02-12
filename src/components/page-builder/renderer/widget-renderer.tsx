// ============================================
// WIDGET RENDERER
// Renders Page Builder widgets on the frontend
// ============================================

"use client";

import type { Widget, WidgetType } from "@/lib/page-builder/types";

// Import widget components
import { HeroContentWidget } from "../widgets/content/hero-content";
import { HeadingWidget } from "../widgets/content/heading-widget";
import { TextBlockWidget } from "../widgets/content/text-block-widget";
import { ProcessStepsWidget } from "../widgets/content/process-steps";
import { ImageWidget } from "../widgets/media/image-widget";
import { ImageSliderWidget } from "../widgets/media/image-slider-widget";
import { TrustBadgesWidget } from "../widgets/social-proof/trust-badges";
import { StatsSectionWidget } from "../widgets/social-proof/stats-section";
import { TestimonialsWidget } from "../widgets/social-proof/testimonials-widget";
import { DividerWidget } from "../widgets/layout/divider-widget";
import { FaqAccordionWidget } from "../widgets/layout/faq-accordion-widget";
import { LeadFormWidget } from "../widgets/forms/lead-form-widget";
import { ButtonGroupWidget } from "../widgets/cta/button-group-widget";
import { PricingTableWidget } from "../widgets/commerce/pricing-table-widget";
import { ServiceCardWidget } from "../widgets/commerce/service-card-widget";
import { ServiceListWidget } from "../widgets/commerce/service-list-widget";

// Service widgets
import { ServiceHeroWidget } from "../widgets/service/service-hero";
import { ServiceFeaturesWidget } from "../widgets/service/service-features";
import { ServiceDescriptionWidget } from "../widgets/service/service-description";
import { ServiceBreadcrumbWidget } from "../widgets/service/service-breadcrumb";
import { RelatedServicesWidget } from "../widgets/service/related-services";

// Blog widgets
import {
  BlogPostGridWidget,
  BlogPostCarouselWidget,
  BlogFeaturedPostWidget,
  BlogPostListWidget,
  BlogRecentPostsWidget,
} from "../widgets/blog";

// ============================================
// WIDGET COMPONENT MAP
// Maps widget types to their React components
// Using 'any' to allow flexible widget props
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WIDGET_COMPONENTS: Partial<Record<WidgetType, React.ComponentType<any>>> = {
  // Content widgets
  "hero-content": HeroContentWidget,
  "heading": HeadingWidget,
  "text-block": TextBlockWidget,
  "process-steps": ProcessStepsWidget,

  // Media widgets
  "image": ImageWidget,
  "image-slider": ImageSliderWidget,

  // Form widgets
  "lead-form": LeadFormWidget,

  // Social proof widgets
  "trust-badges": TrustBadgesWidget,
  "stats-section": StatsSectionWidget,
  "testimonial": TestimonialsWidget,
  "testimonials-carousel": TestimonialsWidget,

  // Commerce widgets
  "pricing-table": PricingTableWidget,
  "service-card": ServiceCardWidget,
  "service-list": ServiceListWidget,

  // CTA widgets
  "button-group": ButtonGroupWidget,

  // Layout widgets
  "divider": DividerWidget,
  "faq": FaqAccordionWidget,

  // Service widgets
  "service-hero": ServiceHeroWidget,
  "service-features": ServiceFeaturesWidget,
  "service-description": ServiceDescriptionWidget,
  "service-breadcrumb": ServiceBreadcrumbWidget,
  "related-services": RelatedServicesWidget,

  // Blog widgets
  "blog-post-grid": BlogPostGridWidget,
  "blog-post-carousel": BlogPostCarouselWidget,
  "blog-featured-post": BlogFeaturedPostWidget,
  "blog-post-list": BlogPostListWidget,
  "blog-recent-posts": BlogRecentPostsWidget,
};

// ============================================
// WIDGET RENDERER
// ============================================

interface WidgetRendererProps {
  widget: Widget<unknown>;
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const { type, settings, spacing } = widget;

  // Get the component for this widget type
  const WidgetComponent = WIDGET_COMPONENTS[type];

  if (!WidgetComponent) {
    // Unknown widget type - show placeholder in development
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="flex items-center justify-center bg-muted/50 py-8 text-sm text-muted-foreground rounded-lg border border-dashed border-muted-foreground/30">
          Unknown widget type: {type}
        </div>
      );
    }
    return null;
  }

  // Build spacing styles
  const spacingStyles: React.CSSProperties = {};
  if (spacing?.marginTop) {
    spacingStyles.marginTop = `${spacing.marginTop}px`;
  }
  if (spacing?.marginBottom) {
    spacingStyles.marginBottom = `${spacing.marginBottom}px`;
  }

  return (
    <div className="widget-wrapper" style={spacingStyles}>
      <WidgetComponent settings={settings} isPreview={false} />
    </div>
  );
}
