// ============================================
// SERVICE HERO WIDGET
// Displays service title, description, price badge, and CTA buttons
// ============================================

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  useServiceContext,
  useOptionalServiceContext,
  resolvePlaceholders,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceHeroWidgetSettings } from "@/lib/page-builder/types";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getCurrencySymbol } from "@/components/ui/currency-selector";

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: ServiceHeroWidgetSettings = {
  // Content Source
  titleSource: "auto",
  subtitleSource: "auto",

  // Price Badge
  showPriceBadge: true,
  priceBadgeText: "From ${{service.startingPrice}}",

  // Primary Button
  primaryCtaText: "Get Started",
  primaryCtaLink: "/checkout/{{service.slug}}",
  showPriceInButton: true,

  // Secondary Button
  showSecondaryButton: true,
  secondaryCtaText: "Ask a Question",
  secondaryCtaLink: "/contact",

  // Appearance
  backgroundType: "none",
  textAlignment: "center",
  titleSize: "default",
  spacing: "lg",
};

// ============================================
// WIDGET PROPS
// ============================================

interface ServiceHeroWidgetProps {
  settings: Partial<ServiceHeroWidgetSettings>;
  isPreview?: boolean;
}

// ============================================
// WIDGET COMPONENT
// ============================================

export function ServiceHeroWidget({
  settings: partialSettings,
  isPreview = false,
}: ServiceHeroWidgetProps) {
  // Merge with defaults
  const settings: ServiceHeroWidgetSettings = {
    ...DEFAULT_SETTINGS,
    ...partialSettings,
  };

  // Currency symbol
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    fetch("/api/business-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.currency) setCurrencySymbol(getCurrencySymbol(data.currency));
      })
      .catch(() => {});
  }, []);

  // Get service context
  const serviceContext = useOptionalServiceContext();

  // If no service context, show placeholder (works in Page Builder admin)
  if (!serviceContext) {
    return <ServiceHeroPlaceholder settings={settings} />;
  }

  const { service } = serviceContext;

  // Resolve content
  const title = settings.titleSource === "auto"
    ? service.name
    : settings.customTitle || service.name;

  const subtitle = settings.subtitleSource === "auto"
    ? service.shortDesc
    : settings.customSubtitle || service.shortDesc;

  // Resolve placeholders in links and text
  const primaryLink = resolvePlaceholders(settings.primaryCtaLink, service);
  const secondaryLink = resolvePlaceholders(settings.secondaryCtaLink, service);
  const priceBadgeText = resolvePlaceholders(settings.priceBadgeText, service);

  // Format price for button
  const formattedPrice = service.startingPrice === 0
    ? `${currencySymbol}0`
    : `${currencySymbol}${Number(service.startingPrice).toLocaleString()}`;

  // Build background classes
  const getBackgroundClasses = () => {
    switch (settings.backgroundType) {
      case "gradient":
        return settings.backgroundGradient || "bg-gradient-to-b from-orange-50 to-white";
      case "solid":
        return "";
      case "image":
        return "bg-cover bg-center bg-no-repeat";
      default:
        return "";
    }
  };

  // Build background styles
  const getBackgroundStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (settings.backgroundType === "solid" && settings.backgroundColor) {
      styles.backgroundColor = settings.backgroundColor;
    }

    if (settings.backgroundType === "image" && settings.backgroundImage) {
      styles.backgroundImage = `url(${settings.backgroundImage})`;
    }

    return styles;
  };

  // Spacing classes
  const spacingClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16 lg:py-20",
    xl: "py-20 lg:py-28",
  };

  // Title size classes
  const titleSizeClasses = {
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl",
    xl: "text-6xl md:text-7xl",
  };

  // Alignment classes
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <section
      className={cn(
        "relative",
        spacingClasses[settings.spacing],
        getBackgroundClasses()
      )}
      style={getBackgroundStyles()}
    >
      <div className={cn(
        "mx-auto max-w-4xl px-4 flex flex-col",
        alignmentClasses[settings.textAlignment]
      )}>
        {/* Service Icon */}
        {service.icon && (
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ServiceIcon name={service.icon} className="h-8 w-8" />
          </div>
        )}

        {/* Price Badge */}
        {settings.showPriceBadge && (
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-4">
            {priceBadgeText}
          </span>
        )}

        {/* Title */}
        <h1 className={cn(
          "font-bold tracking-tight text-foreground",
          titleSizeClasses[settings.titleSize]
        )}>
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className={cn(
            "mt-4 text-xl text-muted-foreground max-w-2xl",
            settings.textAlignment === "center" && "mx-auto"
          )}>
            {subtitle}
          </p>
        )}

        {/* CTA Buttons */}
        <div className={cn(
          "mt-8 flex flex-wrap gap-4",
          settings.textAlignment === "center" && "justify-center",
          settings.textAlignment === "right" && "justify-end"
        )}>
          <Button size="lg" asChild>
            <Link href={primaryLink}>
              {settings.primaryCtaText}
              {settings.showPriceInButton && ` - ${formattedPrice}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {settings.showSecondaryButton && (
            <Button size="lg" variant="outline" asChild>
              <Link href={secondaryLink}>
                {settings.secondaryCtaText}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PLACEHOLDER FOR PREVIEW (NO SERVICE CONTEXT)
// ============================================

function ServiceHeroPlaceholder({
  settings,
}: {
  settings: ServiceHeroWidgetSettings;
}) {
  const spacingClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
    xl: "py-20",
  };

  const titleSizeClasses = {
    default: "text-4xl md:text-5xl",
    large: "text-5xl md:text-6xl",
    xl: "text-6xl md:text-7xl",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  // Extract price from priceBadgeText for button preview
  // e.g., "$500" from "From $500" or use priceBadgeText directly if it's just "$500"
  const extractPriceForButton = () => {
    const badgeText = settings.priceBadgeText || "From $199";
    // Try to extract price pattern like $123 or $1,234
    const priceMatch = badgeText.match(/\$[\d,]+/);
    return priceMatch ? priceMatch[0] : "$199";
  };

  // Get background styles for placeholder
  const getBackgroundStyles = (): React.CSSProperties => {
    if (settings.backgroundType === "solid" && settings.backgroundColor) {
      return { backgroundColor: settings.backgroundColor };
    }
    return {};
  };

  const getBackgroundClasses = () => {
    if (settings.backgroundType === "gradient" && settings.backgroundGradient) {
      return settings.backgroundGradient;
    }
    if (settings.backgroundType === "none" || settings.backgroundType === "solid") {
      return "";
    }
    return "bg-gradient-to-b from-slate-100 to-slate-50";
  };

  return (
    <section
      className={cn(
        "relative",
        spacingClasses[settings.spacing],
        getBackgroundClasses()
      )}
      style={getBackgroundStyles()}
    >
      <div className={cn(
        "mx-auto max-w-4xl px-4 flex flex-col",
        alignmentClasses[settings.textAlignment]
      )}>
        {/* Placeholder Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <span className="text-2xl">🏢</span>
        </div>

        {/* Price Badge */}
        {settings.showPriceBadge && (
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-4">
            {settings.priceBadgeText || "From $199"}
          </span>
        )}

        {/* Title */}
        <h1 className={cn(
          "font-bold tracking-tight text-foreground",
          titleSizeClasses[settings.titleSize]
        )}>
          {settings.titleSource === "custom" && settings.customTitle
            ? settings.customTitle
            : "{{service.name}}"}
        </h1>

        {/* Subtitle */}
        <p className={cn(
          "mt-4 text-xl text-muted-foreground max-w-2xl",
          settings.textAlignment === "center" && "mx-auto"
        )}>
          {settings.subtitleSource === "custom" && settings.customSubtitle
            ? settings.customSubtitle
            : "{{service.shortDesc}}"}
        </p>

        {/* CTA Buttons */}
        <div className={cn(
          "mt-8 flex flex-wrap gap-4",
          settings.textAlignment === "center" && "justify-center",
          settings.textAlignment === "right" && "justify-end"
        )}>
          <Button size="lg" disabled className="cursor-not-allowed">
            {settings.primaryCtaText}
            {settings.showPriceInButton && ` - ${extractPriceForButton()}`}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {settings.showSecondaryButton && (
            <Button size="lg" variant="outline" disabled className="cursor-not-allowed">
              {settings.secondaryCtaText}
            </Button>
          )}
        </div>

        {/* Preview Notice */}
        <p className="mt-6 text-xs text-muted-foreground">
          Preview mode - Service data will be loaded dynamically
        </p>
      </div>
    </section>
  );
}
