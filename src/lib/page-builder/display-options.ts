// ============================================
// SERVICE DISPLAY OPTIONS (Server-safe)
// Shared between server and client components
// ============================================

import type { Section } from "./types";

// ============================================
// SERVICE DISPLAY OPTIONS TYPE
// ============================================

export interface ServiceDisplayOptions {
  showHero: boolean;
  showFeatures: boolean;
  showPricing: boolean;
  showProcessSteps: boolean;
  showFaq: boolean;
  showRequirements: boolean;
  showDeliverables: boolean;
  showTimeline: boolean;
  showRelatedServices: boolean;
  showTestimonials: boolean;
  showCtaBanner: boolean;
  // Checkout / Order Summary customizable text
  checkoutBadgeText: string;
  checkoutBadgeDescription: string;
}

export const DEFAULT_DISPLAY_OPTIONS: ServiceDisplayOptions = {
  showHero: true,
  showFeatures: true,
  showPricing: true,
  showProcessSteps: true,
  showFaq: true,
  showRequirements: true,
  showDeliverables: true,
  showTimeline: true,
  showRelatedServices: true,
  showTestimonials: true,
  showCtaBanner: true,
  checkoutBadgeText: "",
  checkoutBadgeDescription: "",
};

// ============================================
// WIDGET-TO-DISPLAY-OPTION MAPPING
// Maps widget types to their display option key
// ============================================

export const WIDGET_TO_DISPLAY_OPTION: Record<string, keyof ServiceDisplayOptions> = {
  "service-hero": "showHero",
  "service-features": "showFeatures",
  "service-description": "showDeliverables",
  "service-breadcrumb": "showHero",         // Shows when hero shows
  "service-pricing": "showPricing",
  "service-process": "showProcessSteps",
  "service-faq": "showFaq",
  "service-requirements": "showRequirements",
  "service-deliverables": "showDeliverables",
  "service-timeline": "showTimeline",
  "related-services": "showRelatedServices",
  "service-testimonials": "showTestimonials",
  "service-cta": "showCtaBanner",
};

// ============================================
// SECTION FILTERING UTILITY
// Filters template sections based on displayOptions
// ============================================

export function filterSectionsByDisplayOptions(
  sections: Section[],
  displayOptions: Partial<ServiceDisplayOptions> = {}
): Section[] {
  // Merge with defaults
  const options: ServiceDisplayOptions = { ...DEFAULT_DISPLAY_OPTIONS, ...displayOptions };

  return sections.filter((section) => {
    // Get primary widget type in section (first widget in first column)
    const primaryWidget = section.columns[0]?.widgets[0];
    const primaryWidgetType = primaryWidget?.type;

    if (!primaryWidgetType) {
      return true; // Show sections without widgets
    }

    // Check if this widget type has a display option
    const displayOptionKey = WIDGET_TO_DISPLAY_OPTION[primaryWidgetType];

    if (displayOptionKey) {
      return options[displayOptionKey];
    }

    // Non-service widgets are always shown
    return true;
  });
}
