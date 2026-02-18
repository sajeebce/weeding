"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "@/components/ui/currency-selector";
import type {
  ServiceCardWidgetSettings,
  ServiceCardStyle,
  ServiceCardHoverEffect,
  BadgeStyle,
} from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { DEFAULT_SERVICE_CARD_SETTINGS } from "@/lib/page-builder/defaults";

// Service type from database
interface ServiceData {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  icon: string | null;
  image: string | null;
  startingPrice: string | number;
  processingTime: string | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  features?: {
    id: string;
    name: string;
  }[];
}

interface ServiceCardWidgetProps {
  settings: ServiceCardWidgetSettings;
  isPreview?: boolean;
}

// Get Lucide icon component by name
function getLucideIcon(
  name: string | null
): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  if (!name) return Briefcase;
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >;
  return icons[name] || Briefcase;
}

// Format price for display
function formatPrice(price: string | number, symbol = "$"): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "Contact Us";
  return `From ${symbol}${numPrice.toLocaleString()}`;
}

// Get badge style classes
function getBadgeStyles(style: BadgeStyle, colors: { bgColor?: string; textColor?: string; borderColor?: string }) {
  const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium";

  switch (style) {
    case "outline":
      return {
        className: cn(baseClasses, "rounded-full border bg-transparent"),
        style: {
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
    case "solid":
      return {
        className: cn(baseClasses, "rounded-md border-0"),
        style: {
          backgroundColor: colors.bgColor || "#f97316",
          color: colors.textColor || "#ffffff",
        },
      };
    case "pill":
    default:
      return {
        className: cn(baseClasses, "rounded-full border"),
        style: {
          backgroundColor: colors.bgColor || "#f9731933",
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
  }
}

// Render text with highlighted words
function renderHighlightedText(
  text: string,
  highlightWords?: string,
  highlightColor?: string
) {
  if (!highlightWords) {
    return text;
  }

  const regex = new RegExp(`(${highlightWords})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === highlightWords.toLowerCase()) {
      return (
        <span
          key={index}
          style={{ color: highlightColor || "#f97316" }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

// Header Section Component
function SectionHeader({ settings }: { settings: ServiceCardWidgetSettings }) {
  const rawHeader = settings.header;

  if (!rawHeader?.show) return null;

  // Merge with defaults to handle DB data missing nested properties
  const badge = { ...DEFAULT_SERVICE_CARD_SETTINGS.header.badge, ...rawHeader.badge };
  const heading = { ...DEFAULT_SERVICE_CARD_SETTINGS.header.heading, ...rawHeader.heading };
  const description = { ...DEFAULT_SERVICE_CARD_SETTINGS.header.description, ...rawHeader.description };

  const badgeStyles = getBadgeStyles(badge.style, {
    bgColor: badge.bgColor,
    textColor: badge.textColor,
    borderColor: badge.borderColor,
  });

  const headingSizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
    "2xl": "text-5xl md:text-6xl",
  };

  const descriptionSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        alignmentClasses[rawHeader.alignment]
      )}
      style={{ marginBottom: `${rawHeader.marginBottom}px` }}
    >
      {/* Badge */}
      {badge.show && (
        <span className={badgeStyles.className} style={badgeStyles.style}>
          {badge.text}
        </span>
      )}

      {/* Heading */}
      <h2
        className={cn(
          "font-bold tracking-tight",
          headingSizeClasses[heading.size]
        )}
        style={{ color: heading.color || "#ffffff" }}
      >
        {renderHighlightedText(
          heading.text,
          heading.highlightWords,
          heading.highlightColor
        )}
      </h2>

      {/* Description */}
      {description.show && (
        <p
          className={cn(
            "max-w-3xl",
            descriptionSizeClasses[description.size]
          )}
          style={{ color: description.color || "#94a3b8" }}
        >
          {description.text}
        </p>
      )}
    </div>
  );
}

// Get responsive column classes
function getColumnClasses(
  columns: 1 | 2 | 3 | 4,
  responsive: { tablet: { columns: 1 | 2 | 3 }; mobile: { columns: 1 | 2 } }
): string {
  const mobileColMap = { 1: "grid-cols-1", 2: "grid-cols-2" };
  const tabletColMap = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };
  const desktopColMap = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  return cn(
    mobileColMap[responsive.mobile.columns],
    tabletColMap[responsive.tablet.columns],
    desktopColMap[columns]
  );
}

// Get icon size classes
function getIconSizeClasses(size: "sm" | "md" | "lg"): { container: string; icon: string } {
  switch (size) {
    case "sm":
      return { container: "h-10 w-10", icon: "h-5 w-5" };
    case "lg":
      return { container: "h-14 w-14", icon: "h-7 w-7" };
    default:
      return { container: "h-12 w-12", icon: "h-6 w-6" };
  }
}

// Get icon style classes (shape) - handles all ServiceCardIconStyle values
function getIconStyleClasses(style: string): string {
  switch (style) {
    case "circle":
      return "rounded-full";
    case "rounded":
      return "rounded-lg";
    case "square":
      return "rounded-none";
    case "gradient-bg":
      return "rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20";
    case "outline":
      return "rounded-lg border-2 bg-transparent";
    case "none":
      return "bg-transparent";
    default:
      return "rounded-lg";
  }
}

// Check if icon style should have background
function hasIconBackground(style: string): boolean {
  return style !== "none" && style !== "outline";
}

// Get icon hover effect classes (for container)
function getIconHoverEffectClasses(effect: string): string {
  switch (effect) {
    case "scale":
      return "group-hover:scale-110";
    case "invert":
      return "group-hover:bg-primary group-hover:text-primary-foreground";
    case "bounce":
      return "group-hover:animate-bounce";
    case "none":
    default:
      return "";
  }
}

// Get icon animation classes (for icon itself)
function getIconAnimationClasses(animation: string): string {
  switch (animation) {
    case "scale":
      return "group-hover:scale-125";
    case "rotate":
      return "group-hover:rotate-12";
    case "bounce":
      return "group-hover:animate-bounce";
    case "pulse":
      return "group-hover:animate-pulse";
    case "none":
    default:
      return "";
  }
}

// Get price position classes and styles
function getPriceDisplay(
  position: "bottom" | "top-right" | "badge",
  price: string
): { className: string; style?: React.CSSProperties; isBadge: boolean; isTopRight: boolean } {
  switch (position) {
    case "top-right":
      return {
        className: "absolute top-3 right-4 text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md",
        isTopRight: true,
        isBadge: false,
      };
    case "badge":
      return {
        className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary text-primary-foreground",
        isTopRight: false,
        isBadge: true,
      };
    case "bottom":
    default:
      return {
        className: "font-semibold text-primary",
        isTopRight: false,
        isBadge: false,
      };
  }
}

// Get hover effect classes
function getHoverClasses(effect: ServiceCardHoverEffect): string {
  switch (effect) {
    case "lift":
      return "hover:-translate-y-2 hover:shadow-xl";
    case "glow":
      return "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]";
    case "border-glow":
      return "hover:border-primary hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]";
    case "scale":
      return "hover:scale-[1.02]";
    case "spotlight":
      return "hover:bg-gradient-to-br hover:from-white/5 hover:to-transparent";
    default:
      return "";
  }
}

// Card style variants
function MinimalCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const iconStyle = getIconStyleClasses(settings.icon.style);
  const iconHoverEffect = getIconHoverEffectClasses(settings.hover.iconEffect);
  const iconAnimation = getIconAnimationClasses(settings.icon.hoverAnimation);
  const isInline = settings.icon.position === "inline";
  const isCentered = settings.icon.position === "top-center";
  const priceDisplay = getPriceDisplay(settings.content.pricePosition, formatPrice(service.startingPrice, cs));

  const renderIcon = () => {
    if (!settings.icon.show) return null;
    const showBg = hasIconBackground(settings.icon.style);
    return (
      <div
        className={cn(
          "flex items-center justify-center shrink-0 transition-all duration-200",
          iconSize.container,
          iconStyle,
          showBg && "border border-transparent",
          iconHoverEffect
        )}
        style={{
          backgroundColor: showBg
            ? (settings.icon.backgroundColor || "rgb(249 115 22 / 0.1)")
            : "transparent",
        }}
      >
        <Icon
          className={cn(iconSize.icon, "transition-all duration-200", iconAnimation)}
          style={{ color: settings.icon.iconColor || "#f97316" }}
        />
      </div>
    );
  };

  return (
    <div className={cn("relative flex flex-col gap-3 p-6", isCentered && "items-center text-center")}>
      {/* Price at top-right */}
      {settings.content.showPrice && priceDisplay.isTopRight && (
        <span className={priceDisplay.className}>
          {formatPrice(service.startingPrice, cs)}
        </span>
      )}

      {/* Icon at top (non-inline) */}
      {settings.icon.show && !isInline && renderIcon()}

      {/* Title with inline icon */}
      {isInline ? (
        <div className="flex items-center gap-3">
          {renderIcon()}
          <h3 className="font-semibold text-foreground">{service.name}</h3>
        </div>
      ) : (
        <h3 className="font-semibold text-foreground">{service.name}</h3>
      )}

      {settings.content.showDescription && (
        <p
          className={cn(
            "text-sm text-muted-foreground",
            settings.content.descriptionLines === 1 && "line-clamp-1",
            settings.content.descriptionLines === 2 && "line-clamp-2",
            settings.content.descriptionLines === 3 && "line-clamp-3"
          )}
        >
          {service.shortDesc}
        </p>
      )}

      {/* Price at bottom or as badge */}
      {settings.content.showPrice && !priceDisplay.isTopRight && (
        <span className={priceDisplay.className}>
          {formatPrice(service.startingPrice, cs)}
        </span>
      )}
    </div>
  );
}

function ElevatedCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const iconStyle = getIconStyleClasses(settings.icon.style);
  const iconHoverEffect = getIconHoverEffectClasses(settings.hover.iconEffect);
  const iconAnimation = getIconAnimationClasses(settings.icon.hoverAnimation);
  const hasBadge = settings.content.showBadge && service.isPopular;
  const isInline = settings.icon.position === "inline";
  const isCentered = settings.icon.position === "top-center";
  const priceDisplay = getPriceDisplay(settings.content.pricePosition, formatPrice(service.startingPrice, cs));

  const renderIcon = () => {
    if (!settings.icon.show) return null;
    const showBg = hasIconBackground(settings.icon.style);
    return (
      <div
        className={cn(
          "flex items-center justify-center transition-all duration-200 shrink-0",
          iconSize.container,
          iconStyle,
          showBg && "border border-transparent",
          iconHoverEffect
        )}
        style={{
          backgroundColor: showBg
            ? (settings.icon.backgroundColor || "rgb(249 115 22 / 0.1)")
            : "transparent",
        }}
      >
        <Icon
          className={cn(iconSize.icon, "transition-all duration-200", iconAnimation)}
          style={{ color: settings.icon.iconColor || "#f97316" }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Popular Badge */}
      {hasBadge && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-accent text-accent-foreground",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
        >
          Popular
        </Badge>
      )}

      {/* Price at top-right */}
      {settings.content.showPrice && priceDisplay.isTopRight && (
        <span className={cn(priceDisplay.className, hasBadge && settings.content.badgePosition === "top-right" && "top-10")}>
          {formatPrice(service.startingPrice, cs)}
        </span>
      )}

      <div className={cn("p-6", isCentered && "flex flex-col items-center text-center")}>
        {/* Icon at top (non-inline) */}
        {settings.icon.show && !isInline && (
          <div className="mb-4">
            {renderIcon()}
          </div>
        )}

        {/* Title with inline icon */}
        {isInline ? (
          <div className="flex items-center gap-3">
            {renderIcon()}
            <h3 className={cn(
              "text-lg font-semibold text-foreground",
              !settings.icon.show && hasBadge && "mt-4"
            )}>{service.name}</h3>
          </div>
        ) : (
          <h3 className={cn(
            "text-lg font-semibold text-foreground",
            !settings.icon.show && hasBadge && "mt-4"
          )}>{service.name}</h3>
        )}
      </div>
      <div className={cn("px-6 pb-6 space-y-4", isCentered && "text-center")}>
        {settings.content.showDescription && (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              settings.content.descriptionLines === 1 && "line-clamp-1",
              settings.content.descriptionLines === 2 && "line-clamp-2",
              settings.content.descriptionLines === 3 && "line-clamp-3"
            )}
          >
            {service.shortDesc}
          </p>
        )}
        <div className={cn("flex items-center", isCentered ? "justify-center gap-4" : "justify-between")}>
          {/* Price at bottom or as badge */}
          {settings.content.showPrice && !priceDisplay.isTopRight && (
            <span className={priceDisplay.className}>
              {formatPrice(service.startingPrice, cs)}
            </span>
          )}
          {settings.content.showArrow && (
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          )}
        </div>
      </div>
    </>
  );
}

function GlassmorphismCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const iconStyle = getIconStyleClasses(settings.icon.style);
  const iconHoverEffect = getIconHoverEffectClasses(settings.hover.iconEffect);
  const iconAnimation = getIconAnimationClasses(settings.icon.hoverAnimation);
  const hasBadge = settings.content.showBadge && service.isPopular;
  const isInline = settings.icon.position === "inline";
  const isCentered = settings.icon.position === "top-center";
  const priceDisplay = getPriceDisplay(settings.content.pricePosition, formatPrice(service.startingPrice, cs));

  const renderIcon = () => {
    if (!settings.icon.show) return null;
    const showBg = hasIconBackground(settings.icon.style);
    return (
      <div
        className={cn(
          "flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0 transition-all duration-200",
          iconSize.container,
          iconStyle,
          showBg ? "bg-white/10" : "bg-transparent border-transparent",
          iconHoverEffect
        )}
      >
        <Icon className={cn(iconSize.icon, "text-white transition-all duration-200", iconAnimation)} />
      </div>
    );
  };

  // Custom price classes for glassmorphism style
  const getPriceClasses = () => {
    if (priceDisplay.isTopRight) {
      return cn("absolute top-3 right-4 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md border border-white/20", hasBadge && settings.content.badgePosition === "top-right" && "top-10");
    }
    if (priceDisplay.isBadge) {
      return "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white backdrop-blur-sm";
    }
    return "font-semibold text-white";
  };

  return (
    <>
      {/* Popular Badge */}
      {hasBadge && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-white/10 text-white backdrop-blur-sm border border-white/20",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
        >
          Popular
        </Badge>
      )}

      {/* Price at top-right */}
      {settings.content.showPrice && priceDisplay.isTopRight && (
        <span className={getPriceClasses()}>
          {formatPrice(service.startingPrice, cs)}
        </span>
      )}

      <div className={cn("p-6", isCentered && "flex flex-col items-center text-center")}>
        {/* Icon at top (non-inline) */}
        {settings.icon.show && !isInline && (
          <div className="mb-4">
            {renderIcon()}
          </div>
        )}

        {/* Title with inline icon */}
        {isInline ? (
          <div className="flex items-center gap-3">
            {renderIcon()}
            <h3 className={cn(
              "text-lg font-semibold text-white",
              !settings.icon.show && hasBadge && "mt-4"
            )}>{service.name}</h3>
          </div>
        ) : (
          <h3 className={cn(
            "text-lg font-semibold text-white",
            !settings.icon.show && hasBadge && "mt-4"
          )}>{service.name}</h3>
        )}
        {settings.content.showCategory && service.category && (
          <span className="text-xs text-white/60">{service.category.name}</span>
        )}
      </div>
      <div className={cn("px-6 pb-6 space-y-4", isCentered && "text-center")}>
        {settings.content.showDescription && (
          <p
            className={cn(
              "text-sm text-white/70",
              settings.content.descriptionLines === 1 && "line-clamp-1",
              settings.content.descriptionLines === 2 && "line-clamp-2",
              settings.content.descriptionLines === 3 && "line-clamp-3"
            )}
          >
            {service.shortDesc}
          </p>
        )}
        <div className={cn("flex items-center", isCentered ? "justify-center gap-4" : "justify-between")}>
          {/* Price at bottom or as badge */}
          {settings.content.showPrice && !priceDisplay.isTopRight && (
            <span className={getPriceClasses()}>
              {formatPrice(service.startingPrice, cs)}
            </span>
          )}
          {settings.content.showArrow && (
            <ArrowRight className="h-4 w-4 text-white/60 transition-transform group-hover:translate-x-1 group-hover:text-white" />
          )}
        </div>
      </div>
    </>
  );
}

function GradientBorderCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const iconStyle = getIconStyleClasses(settings.icon.style);
  const iconHoverEffect = getIconHoverEffectClasses(settings.hover.iconEffect);
  const iconAnimation = getIconAnimationClasses(settings.icon.hoverAnimation);
  const hasBadge = settings.content.showBadge && service.isPopular;
  const isInline = settings.icon.position === "inline";
  const isCentered = settings.icon.position === "top-center";
  const priceDisplay = getPriceDisplay(settings.content.pricePosition, formatPrice(service.startingPrice, cs));

  const renderIcon = () => {
    if (!settings.icon.show) return null;
    const showBg = hasIconBackground(settings.icon.style);
    return (
      <div
        className={cn(
          "flex items-center justify-center shrink-0 transition-all duration-200",
          iconSize.container,
          iconStyle,
          showBg ? "bg-gradient-to-br from-primary/20 to-purple-500/20" : "bg-transparent",
          iconHoverEffect
        )}
      >
        <Icon className={cn(iconSize.icon, "text-primary transition-all duration-200", iconAnimation)} />
      </div>
    );
  };

  // Custom price classes for gradient border style
  const getPriceClasses = () => {
    if (priceDisplay.isTopRight) {
      return cn("absolute top-3 right-4 text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent bg-card/80 px-2 py-1 rounded-md", hasBadge && settings.content.badgePosition === "top-right" && "top-10");
    }
    if (priceDisplay.isBadge) {
      return "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-purple-500 text-white";
    }
    return "font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent";
  };

  return (
    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 group-hover:from-primary group-hover:via-orange-400 group-hover:to-yellow-400 transition-all">
      <div
        className="relative bg-card rounded-xl h-full"
        style={{ borderRadius: `${Math.max(0, settings.borderRadius - 2)}px` }}
      >
        {/* Popular Badge */}
        {hasBadge && (
          <Badge
            className={cn(
              "absolute top-3 z-10 bg-gradient-to-r from-primary to-purple-500 text-white border-0",
              settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
            )}
          >
            Popular
          </Badge>
        )}

        {/* Price at top-right */}
        {settings.content.showPrice && priceDisplay.isTopRight && (
          <span className={getPriceClasses()}>
            {formatPrice(service.startingPrice, cs)}
          </span>
        )}

        <div className={cn("p-6", isCentered && "flex flex-col items-center text-center")}>
          {/* Icon at top (non-inline) */}
          {settings.icon.show && !isInline && (
            <div className="mb-4">
              {renderIcon()}
            </div>
          )}

          {/* Title with inline icon */}
          {isInline ? (
            <div className="flex items-center gap-3">
              {renderIcon()}
              <h3 className={cn(
                "text-lg font-semibold text-foreground",
                !settings.icon.show && hasBadge && "mt-4"
              )}>{service.name}</h3>
            </div>
          ) : (
            <h3 className={cn(
              "text-lg font-semibold text-foreground",
              !settings.icon.show && hasBadge && "mt-4"
            )}>{service.name}</h3>
          )}
        </div>
        <div className={cn("px-6 pb-6 space-y-4", isCentered && "text-center")}>
          {settings.content.showDescription && (
            <p
              className={cn(
                "text-sm text-muted-foreground",
                settings.content.descriptionLines === 1 && "line-clamp-1",
                settings.content.descriptionLines === 2 && "line-clamp-2",
                settings.content.descriptionLines === 3 && "line-clamp-3"
              )}
            >
              {service.shortDesc}
            </p>
          )}
          <div className={cn("flex items-center", isCentered ? "justify-center gap-4" : "justify-between")}>
            {/* Price at bottom or as badge */}
            {settings.content.showPrice && !priceDisplay.isTopRight && (
              <span className={getPriceClasses()}>
                {formatPrice(service.startingPrice, cs)}
              </span>
            )}
            {settings.content.showArrow && (
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpotlightCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const iconStyle = getIconStyleClasses(settings.icon.style);
  const hasBadge = settings.content.showBadge && service.isPopular;
  const isInline = settings.icon.position === "inline";
  const isCentered = settings.icon.position === "top-center";
  const priceDisplay = getPriceDisplay(settings.content.pricePosition, formatPrice(service.startingPrice, cs));

  const iconHoverEffect = getIconHoverEffectClasses(settings.hover.iconEffect);
  const iconAnimation = getIconAnimationClasses(settings.icon.hoverAnimation);

  const renderIcon = () => {
    if (!settings.icon.show) return null;
    const showBg = hasIconBackground(settings.icon.style);
    return (
      <div
        className={cn(
          "flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 shrink-0",
          iconSize.container,
          iconStyle,
          showBg && "border border-transparent",
          iconHoverEffect
        )}
        style={{
          backgroundColor: showBg
            ? (settings.icon.backgroundColor || "rgb(249 115 22 / 0.1)")
            : "transparent",
        }}
      >
        <Icon
          className={cn(iconSize.icon, "transition-all duration-200", iconAnimation)}
          style={{ color: settings.icon.iconColor || "#f97316" }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Spotlight gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 group-hover:opacity-100 group-hover:from-white/5 group-hover:via-transparent group-hover:to-transparent transition-opacity rounded-xl pointer-events-none" />

      {/* Popular Badge */}
      {hasBadge && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-accent text-accent-foreground",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
        >
          Popular
        </Badge>
      )}

      {/* Price at top-right */}
      {settings.content.showPrice && priceDisplay.isTopRight && (
        <span className={cn(priceDisplay.className, "z-10", hasBadge && settings.content.badgePosition === "top-right" && "top-10")}>
          {formatPrice(service.startingPrice, cs)}
        </span>
      )}

      <div className={cn("relative z-10 p-6", isCentered && "flex flex-col items-center text-center")}>
        {/* Icon at top (non-inline) */}
        {settings.icon.show && !isInline && (
          <div className="mb-4">
            {renderIcon()}
          </div>
        )}

        {/* Title with inline icon */}
        {isInline ? (
          <div className="flex items-center gap-3">
            {renderIcon()}
            <h3 className={cn(
              "text-lg font-semibold text-foreground",
              !settings.icon.show && hasBadge && "mt-4"
            )}>{service.name}</h3>
          </div>
        ) : (
          <h3 className={cn(
            "text-lg font-semibold text-foreground",
            !settings.icon.show && hasBadge && "mt-4"
          )}>{service.name}</h3>
        )}
      </div>
      <div className={cn("relative z-10 px-6 pb-6 space-y-4", isCentered && "text-center")}>
        {settings.content.showDescription && (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              settings.content.descriptionLines === 1 && "line-clamp-1",
              settings.content.descriptionLines === 2 && "line-clamp-2",
              settings.content.descriptionLines === 3 && "line-clamp-3"
            )}
          >
            {service.shortDesc}
          </p>
        )}
        <div className={cn("flex items-center", isCentered ? "justify-center gap-4" : "justify-between")}>
          {/* Price at bottom or as badge */}
          {settings.content.showPrice && !priceDisplay.isTopRight && (
            <span className={priceDisplay.className}>
              {formatPrice(service.startingPrice, cs)}
            </span>
          )}
          {settings.content.showArrow && (
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          )}
        </div>
      </div>
    </>
  );
}

function NeonGlowCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const iconStyle = getIconStyleClasses(settings.icon.style);
  const glowColor = settings.hover.glowColor || "#f97316";
  const hasBadge = settings.content.showBadge && service.isPopular;
  const isInline = settings.icon.position === "inline";
  const isCentered = settings.icon.position === "top-center";
  const priceDisplay = getPriceDisplay(settings.content.pricePosition, formatPrice(service.startingPrice, cs));
  const iconHoverEffect = getIconHoverEffectClasses(settings.hover.iconEffect);
  const iconAnimation = getIconAnimationClasses(settings.icon.hoverAnimation);

  const renderIcon = () => {
    if (!settings.icon.show) return null;
    const showBg = hasIconBackground(settings.icon.style);
    return (
      <div
        className={cn(
          "flex items-center justify-center border transition-all duration-300 shrink-0",
          iconSize.container,
          iconStyle,
          iconHoverEffect
        )}
        style={{
          borderColor: showBg ? `${glowColor}40` : "transparent",
          backgroundColor: showBg ? `${glowColor}10` : "transparent",
        }}
      >
        <Icon
          className={cn(iconSize.icon, "transition-all duration-200 group-hover:drop-shadow-[0_0_8px_var(--glow-color)]", iconAnimation)}
          style={{
            color: glowColor,
            // @ts-ignore - CSS variable for neon effect
            "--glow-color": glowColor,
          } as React.CSSProperties}
        />
      </div>
    );
  };

  // Custom price classes for neon glow style
  const getPriceClasses = () => {
    if (priceDisplay.isTopRight) {
      return cn("absolute top-3 right-4 text-sm font-semibold bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md border z-10", hasBadge && settings.content.badgePosition === "top-right" && "top-10");
    }
    if (priceDisplay.isBadge) {
      return "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-black/50 backdrop-blur-sm border";
    }
    return "font-semibold";
  };

  return (
    <>
      {/* Neon glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 rounded-xl"
        style={{ backgroundColor: glowColor, opacity: 0.3 }}
      />

      {/* Popular Badge */}
      {hasBadge && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-black/50 backdrop-blur-sm border",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
          style={{ borderColor: glowColor, color: glowColor }}
        >
          Popular
        </Badge>
      )}

      {/* Price at top-right */}
      {settings.content.showPrice && priceDisplay.isTopRight && (
        <span
          className={getPriceClasses()}
          style={{ borderColor: glowColor, color: glowColor }}
        >
          {formatPrice(service.startingPrice, cs)}
        </span>
      )}

      <div className={cn("relative z-10 p-6", isCentered && "flex flex-col items-center text-center")}>
        {/* Icon at top (non-inline) */}
        {settings.icon.show && !isInline && (
          <div className="mb-4">
            {renderIcon()}
          </div>
        )}

        {/* Title with inline icon */}
        {isInline ? (
          <div className="flex items-center gap-3">
            {renderIcon()}
            <h3
              className={cn(
                "text-lg font-semibold transition-all group-hover:drop-shadow-[0_0_10px_var(--glow-color)]",
                !settings.icon.show && hasBadge && "mt-4"
              )}
              style={{
                color: glowColor,
                // @ts-ignore
                "--glow-color": glowColor,
              } as React.CSSProperties}
            >
              {service.name}
            </h3>
          </div>
        ) : (
          <h3
            className={cn(
              "text-lg font-semibold transition-all group-hover:drop-shadow-[0_0_10px_var(--glow-color)]",
              !settings.icon.show && hasBadge && "mt-4"
            )}
            style={{
              color: glowColor,
              // @ts-ignore
              "--glow-color": glowColor,
            } as React.CSSProperties}
          >
            {service.name}
          </h3>
        )}
      </div>
      <div className={cn("relative z-10 px-6 pb-6 space-y-4", isCentered && "text-center")}>
        {settings.content.showDescription && (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              settings.content.descriptionLines === 1 && "line-clamp-1",
              settings.content.descriptionLines === 2 && "line-clamp-2",
              settings.content.descriptionLines === 3 && "line-clamp-3"
            )}
          >
            {service.shortDesc}
          </p>
        )}
        <div className={cn("flex items-center", isCentered ? "justify-center gap-4" : "justify-between")}>
          {/* Price at bottom or as badge */}
          {settings.content.showPrice && !priceDisplay.isTopRight && (
            <span
              className={getPriceClasses()}
              style={{ borderColor: priceDisplay.isBadge ? glowColor : undefined, color: glowColor }}
            >
              {formatPrice(service.startingPrice, cs)}
            </span>
          )}
          {settings.content.showArrow && (
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              style={{ color: glowColor }}
            />
          )}
        </div>
      </div>
    </>
  );
}

// Render card based on style
function ServiceCard({
  service,
  settings,
  cs = "$",
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
  cs?: string;
}) {
  const hoverClasses = getHoverClasses(settings.hover.effect);

  // Base card classes
  const baseClasses = cn(
    "group relative h-full transition-all cursor-pointer overflow-hidden",
    hoverClasses
  );

  // Style-specific classes
  const styleClasses: Record<ServiceCardStyle, string> = {
    minimal: "border-0 bg-transparent",
    elevated: "border bg-card shadow-sm hover:shadow-lg",
    glassmorphism: "bg-white/5 backdrop-blur-md border border-white/10",
    "gradient-border": "", // Special handling in component
    spotlight: "border bg-card relative overflow-hidden",
    "neon-glow": "border bg-card/50 backdrop-blur-sm relative",
  };

  const content = (() => {
    switch (settings.cardStyle) {
      case "minimal":
        return <MinimalCard service={service} settings={settings} cs={cs} />;
      case "glassmorphism":
        return <GlassmorphismCard service={service} settings={settings} cs={cs} />;
      case "gradient-border":
        return <GradientBorderCard service={service} settings={settings} cs={cs} />;
      case "spotlight":
        return <SpotlightCard service={service} settings={settings} cs={cs} />;
      case "neon-glow":
        return <NeonGlowCard service={service} settings={settings} cs={cs} />;
      case "elevated":
      default:
        return <ElevatedCard service={service} settings={settings} cs={cs} />;
    }
  })();

  // Gradient border has its own container
  if (settings.cardStyle === "gradient-border") {
    return (
      <Link
        href={`/services/${service.slug}`}
        className={cn(baseClasses)}
        style={{ transitionDuration: `${settings.hover.transitionDuration}ms` }}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(baseClasses, styleClasses[settings.cardStyle])}
      style={{
        borderRadius: `${settings.borderRadius}px`,
        borderWidth: settings.cardStyle !== "minimal" ? `${settings.borderWidth}px` : 0,
        transitionDuration: `${settings.hover.transitionDuration}ms`,
      }}
    >
      {content}
    </Link>
  );
}

export function ServiceCardWidget({ settings: partialSettings, isPreview = false }: ServiceCardWidgetProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Deep merge with defaults to ensure all nested properties exist
  const settings: ServiceCardWidgetSettings = {
    ...DEFAULT_SERVICE_CARD_SETTINGS,
    ...partialSettings,
    header: {
      ...DEFAULT_SERVICE_CARD_SETTINGS.header,
      ...partialSettings?.header,
      badge: { ...DEFAULT_SERVICE_CARD_SETTINGS.header.badge, ...partialSettings?.header?.badge },
      heading: { ...DEFAULT_SERVICE_CARD_SETTINGS.header.heading, ...partialSettings?.header?.heading },
      description: { ...DEFAULT_SERVICE_CARD_SETTINGS.header.description, ...partialSettings?.header?.description },
    },
    filters: { ...DEFAULT_SERVICE_CARD_SETTINGS.filters, ...partialSettings?.filters },
    layout: { ...DEFAULT_SERVICE_CARD_SETTINGS.layout, ...partialSettings?.layout },
    icon: { ...DEFAULT_SERVICE_CARD_SETTINGS.icon, ...partialSettings?.icon },
    content: { ...DEFAULT_SERVICE_CARD_SETTINGS.content, ...partialSettings?.content },
    hover: { ...DEFAULT_SERVICE_CARD_SETTINGS.hover, ...partialSettings?.hover },
    colors: { ...DEFAULT_SERVICE_CARD_SETTINGS.colors, ...partialSettings?.colors },
    responsive: {
      ...DEFAULT_SERVICE_CARD_SETTINGS.responsive,
      ...partialSettings?.responsive,
      tablet: { ...DEFAULT_SERVICE_CARD_SETTINGS.responsive.tablet, ...partialSettings?.responsive?.tablet },
      mobile: { ...DEFAULT_SERVICE_CARD_SETTINGS.responsive.mobile, ...partialSettings?.responsive?.mobile },
    },
  };

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);

        // Build query params
        const params = new URLSearchParams();
        params.set("limit", String(settings.filters.limit));
        params.set("sortBy", settings.filters.sortBy);

        if (settings.filters.activeOnly) {
          params.set("activeOnly", "true");
        }
        if (settings.filters.popularOnly) {
          params.set("popularOnly", "true");
        }
        if (settings.filters.categories.length > 0) {
          params.set("categories", settings.filters.categories.join(","));
        }

        const response = await fetch(`/api/services/public?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [
    settings.filters.limit,
    settings.filters.sortBy,
    settings.filters.activeOnly,
    settings.filters.popularOnly,
    settings.filters.categories,
  ]);

  // Fetch currency
  useEffect(() => {
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) setCurrencySymbol(getCurrencySymbol(config.currency));
      })
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <WidgetContainer container={settings.container}>
      <div
        className={cn(
          "grid",
          getColumnClasses(settings.layout.columns, settings.responsive)
        )}
        style={{ gap: `${settings.layout.gap}px` }}
      >
        {Array.from({ length: settings.filters.limit }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-muted/50"
            style={{ borderRadius: `${settings.borderRadius}px` }}
          />
        ))}
      </div>
      </WidgetContainer>
    );
  }

  if (error) {
    return (
      <WidgetContainer container={settings.container}>
      <div className="flex items-center justify-center h-32 bg-destructive/10 rounded-xl border border-destructive/20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
      </WidgetContainer>
    );
  }

  if (services.length === 0) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
          <p className="text-sm text-muted-foreground">
            No services found. Add services from the admin panel.
          </p>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer container={settings.container}>
    <div>
      <SectionHeader settings={settings} />
      <div
        className={cn(
          "grid",
          getColumnClasses(settings.layout.columns, settings.responsive),
          settings.layout.cardAlignment === "start" && "items-start",
          settings.layout.cardAlignment === "center" && "items-center",
          settings.layout.cardAlignment === "stretch" && "items-stretch"
        )}
        style={{ gap: `${settings.layout.gap}px` }}
      >
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} settings={settings} cs={currencySymbol} />
        ))}
      </div>
    </div>
    </WidgetContainer>
  );
}
