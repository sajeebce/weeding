"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Briefcase, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  ServiceListWidgetSettings,
  ServiceListCardStyle,
  BadgeStyle,
} from "@/lib/page-builder/types";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";
import {
  getNormalBackground,
  getHoverBackground,
  getGradientShiftBackground,
  getHoverEffectClass,
  isComplexHoverEffect,
  isCraftButtonEffect,
  isFlowButtonEffect,
  isNeuralButtonEffect,
  getComplexEffectHoverStyles,
  getComplexEffectNormalStyles,
  hasCustomStyle,
} from "@/lib/button-utils";
import { renderButtonIcon } from "@/lib/button-icon-utils";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";

// Category with services type from API
interface CategoryData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  services: ServiceData[];
}

interface ServiceData {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  icon: string | null;
  startingPrice: number;
  isPopular: boolean;
}

interface ServiceListWidgetProps {
  settings: ServiceListWidgetSettings;
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
function formatPrice(price: number): string {
  if (isNaN(price)) return "Contact Us";
  return `$${price.toLocaleString()}`;
}

// Get badge style classes
function getBadgeStyles(
  style: BadgeStyle,
  colors: { bgColor?: string; textColor?: string; borderColor?: string }
) {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium";

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
        <span key={index} style={{ color: highlightColor || "#f97316" }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// Header Section Component
function SectionHeader({ settings }: { settings: ServiceListWidgetSettings }) {
  const { header } = settings;

  if (!header?.show) return null;

  const badgeStyles = getBadgeStyles(header.badge.style, {
    bgColor: header.badge.bgColor,
    textColor: header.badge.textColor,
    borderColor: header.badge.borderColor,
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
      className={cn("flex flex-col gap-4", alignmentClasses[header.alignment])}
      style={{ marginBottom: `${header.marginBottom}px` }}
    >
      {/* Badge */}
      {header.badge.show && (
        <span className={badgeStyles.className} style={badgeStyles.style}>
          {header.badge.text}
        </span>
      )}

      {/* Heading */}
      <h2
        className={cn(
          "font-bold tracking-tight",
          headingSizeClasses[header.heading.size]
        )}
        style={{ color: header.heading.color || "#ffffff" }}
      >
        {renderHighlightedText(
          header.heading.text,
          header.heading.highlightWords,
          header.heading.highlightColor
        )}
      </h2>

      {/* Description */}
      {header.description.show && (
        <p
          className={cn(
            "max-w-3xl",
            descriptionSizeClasses[header.description.size]
          )}
          style={{ color: header.description.color || "#94a3b8" }}
        >
          {header.description.text}
        </p>
      )}
    </div>
  );
}

// Styled Button Component for CTA
function StyledButton({
  btnStyle,
  text,
  link,
  openInNewTab,
  badge,
  isSecondary = false,
}: {
  btnStyle?: ButtonCustomStyle;
  text: string;
  link: string;
  openInNewTab?: boolean;
  badge?: string;
  isSecondary?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hasCustom = hasCustomStyle(btnStyle);
  const linkTarget = openInNewTab ? "_blank" : undefined;
  const linkRel = openInNewTab ? "noopener noreferrer" : undefined;

  // CraftButton effect
  if (hasCustom && btnStyle && isCraftButtonEffect(btnStyle.hoverEffect)) {
    const craftIcon =
      btnStyle.icon && btnStyle.icon !== "none"
        ? renderButtonIcon(btnStyle, "size-3 stroke-2")
        : <ArrowUpRight className="size-3 stroke-2" />;

    return (
      <CraftButton
        asChild
        bgColor={btnStyle.bgColor || "#1e293b"}
        textColor={btnStyle.textColor || "#ffffff"}
        size="sm"
      >
        <Link href={link} target={linkTarget} rel={linkRel}>
          <CraftButtonLabel>
            {text}
            {badge && <span className="ml-2 text-xs opacity-80">{badge}</span>}
          </CraftButtonLabel>
          <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
        </Link>
      </CraftButton>
    );
  }

  // FlowButton effect
  if (hasCustom && btnStyle && isFlowButtonEffect(btnStyle.hoverEffect)) {
    return (
      <PrimaryFlowButton
        asChild
        className="text-sm"
        ringColor={btnStyle.bgColor || "#f97316"}
      >
        <Link href={link} target={linkTarget} rel={linkRel}>
          {text}
          {badge && <span className="ml-2 text-xs opacity-80">{badge}</span>}
        </Link>
      </PrimaryFlowButton>
    );
  }

  // NeuralButton effect
  if (hasCustom && btnStyle && isNeuralButtonEffect(btnStyle.hoverEffect)) {
    return (
      <NeuralButton size="sm" asChild>
        <Link href={link} target={linkTarget} rel={linkRel}>
          {text}
          {badge && <span className="ml-2 text-xs opacity-80">{badge}</span>}
        </Link>
      </NeuralButton>
    );
  }

  // Custom styled button (non-special effects)
  if (hasCustom && btnStyle) {
    const hoverClass = getHoverEffectClass(btnStyle.hoverEffect);
    const normalBg = getNormalBackground(btnStyle);
    const hoverBg = getHoverBackground(btnStyle);
    const hasComplex = isComplexHoverEffect(btnStyle.hoverEffect);
    const normalStyles = hasComplex ? getComplexEffectNormalStyles(btnStyle) : {};
    const hoverStyles = hasComplex ? getComplexEffectHoverStyles(btnStyle) : {};

    const getBackground = (isHover: boolean) => {
      if (btnStyle.hoverEffect === "gradient-shift") {
        return getGradientShiftBackground(btnStyle);
      }
      if (btnStyle.hoverEffect === "slide-fill" || btnStyle.hoverEffect === "border-fill") {
        return normalBg;
      }
      return isHover ? hoverBg : normalBg;
    };

    return (
      <Link
        href={link}
        target={linkTarget}
        rel={linkRel}
        className={cn(
          "inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium overflow-hidden",
          hoverClass,
          hasComplex ? "transition-all duration-500 ease-out" : "transition-all duration-300"
        )}
        style={{
          background: getBackground(isHovered),
          color: isHovered && btnStyle.hoverTextColor ? btnStyle.hoverTextColor : (btnStyle.textColor || "#ffffff"),
          borderWidth: `${btnStyle.borderWidth ?? 0}px`,
          borderStyle: "solid",
          borderColor: isHovered && btnStyle.hoverBorderColor ? btnStyle.hoverBorderColor : (btnStyle.borderColor || "transparent"),
          borderRadius: `${btnStyle.borderRadius ?? 6}px`,
          boxShadow: isHovered && btnStyle.hoverShadow ? btnStyle.hoverShadow : btnStyle.shadow,
          ...(isHovered ? hoverStyles : normalStyles),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {btnStyle.iconPosition === "left" && renderButtonIcon(btnStyle)}
        <span>
          {text}
          {badge && <span className="ml-2 text-xs opacity-80">{badge}</span>}
        </span>
        {btnStyle.iconPosition !== "left" && renderButtonIcon(btnStyle)}
      </Link>
    );
  }

  // Default button (no custom style)
  return (
    <Button variant={isSecondary ? "outline" : "default"} asChild>
      <Link href={link} target={linkTarget} rel={linkRel}>
        {text}
        {badge && <span className="ml-2 text-xs opacity-80">{badge}</span>}
      </Link>
    </Button>
  );
}

// CTA Section Component
function CTASection({ settings }: { settings: ServiceListWidgetSettings }) {
  const { cta } = settings;

  if (!cta?.show) return null;

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn("flex flex-col gap-4", alignmentClasses[cta.alignment])}
      style={{ marginTop: `${cta.marginTop}px` }}
    >
      {cta.text && (
        <p className="text-base max-w-2xl" style={{ color: cta.textColor }}>
          {cta.text}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {cta.primaryButton.show && (
          <StyledButton
            btnStyle={cta.primaryButton.style}
            text={cta.primaryButton.text}
            link={cta.primaryButton.link}
            openInNewTab={cta.primaryButton.openInNewTab}
            badge={cta.primaryButton.badge}
          />
        )}
        {cta.secondaryButton.show && (
          <StyledButton
            btnStyle={cta.secondaryButton.style}
            text={cta.secondaryButton.text}
            link={cta.secondaryButton.link}
            openInNewTab={cta.secondaryButton.openInNewTab}
            isSecondary
          />
        )}
      </div>
    </div>
  );
}

// Get responsive column classes
function getColumnClasses(
  columns: 1 | 2 | 3 | 4,
  responsive: { tablet: { columns: 1 | 2 | 3 }; mobile: { columns: 1 | 2 } }
): string {
  const mobileColMap = { 1: "grid-cols-1", 2: "grid-cols-2" };
  const tabletColMap = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
  };
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
function getIconSizeClasses(
  size: "sm" | "md" | "lg"
): { container: string; icon: string } {
  switch (size) {
    case "sm":
      return { container: "h-10 w-10", icon: "h-5 w-5" };
    case "lg":
      return { container: "h-14 w-14", icon: "h-7 w-7" };
    default:
      return { container: "h-12 w-12", icon: "h-6 w-6" };
  }
}

// Service Item Component
function ServiceItem({
  service,
  settings,
  isLast,
}: {
  service: ServiceData;
  settings: ServiceListWidgetSettings;
  isLast: boolean;
}) {
  const hoverEffectClasses = {
    none: "",
    highlight: "hover:bg-muted",
    slide: "hover:translate-x-1",
  };

  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group flex items-center justify-between py-2 px-1 transition-all duration-200 rounded-md",
        hoverEffectClasses[settings.serviceItem.hoverEffect]
      )}
      style={{ padding: `${settings.serviceItem.padding}px` }}
    >
      <span
        className={cn(
          "transition-colors group-hover:text-primary",
          settings.serviceItem.fontSize === "sm" && "text-sm",
          settings.serviceItem.fontSize === "md" && "text-base",
          settings.serviceItem.fontSize === "lg" && "text-lg"
        )}
        style={{ color: settings.serviceItem.nameColor }}
      >
        {service.name}
      </span>
      {settings.serviceItem.showPrice && (
        <span
          className="text-sm"
          style={{ color: settings.serviceItem.priceColor }}
        >
          {formatPrice(service.startingPrice)}
        </span>
      )}
    </Link>
  );
}

// Category Card Component
function CategoryCard({
  category,
  settings,
}: {
  category: CategoryData;
  settings: ServiceListWidgetSettings;
}) {
  const Icon = getLucideIcon(category.icon);
  const iconSize = getIconSizeClasses(settings.categoryCard.iconSize);

  // Apply service limit if set
  const displayedServices =
    settings.filters.limitServicesPerCategory > 0
      ? category.services.slice(0, settings.filters.limitServicesPerCategory)
      : category.services;

  // Sort services
  const sortedServices = [...displayedServices].sort((a, b) => {
    switch (settings.filters.sortServicesBy) {
      case "price-asc":
        return a.startingPrice - b.startingPrice;
      case "price-desc":
        return b.startingPrice - a.startingPrice;
      case "name":
        return a.name.localeCompare(b.name);
      case "order":
      default:
        return 0; // Already sorted by API
    }
  });

  // Card style classes
  const cardStyleClasses: Record<ServiceListCardStyle, string> = {
    minimal: "bg-transparent border-0",
    bordered: "bg-card border hover:border-primary/30 transition-colors",
    elevated: "bg-card border shadow-sm hover:shadow-lg transition-shadow",
    glassmorphism: "bg-white/5 backdrop-blur-md border border-white/10",
  };

  const titleSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        cardStyleClasses[settings.layout.cardStyle]
      )}
      style={{
        borderRadius: `${settings.categoryCard.borderRadius}px`,
        borderWidth:
          settings.layout.cardStyle !== "minimal"
            ? `${settings.categoryCard.borderWidth}px`
            : 0,
        borderColor: settings.categoryCard.borderColor,
        backgroundColor:
          settings.layout.cardStyle !== "glassmorphism"
            ? settings.categoryCard.backgroundColor
            : undefined,
        padding: `${settings.categoryCard.padding}px`,
      }}
    >
      {/* Category Header */}
      <div className="flex items-start gap-3 mb-4">
        {settings.categoryCard.showIcon && (
          <div
            className={cn(
              "flex items-center justify-center shrink-0",
              iconSize.container,
              settings.categoryCard.iconStyle === "rounded" && "rounded-lg",
              settings.categoryCard.iconStyle === "circle" && "rounded-full",
              settings.categoryCard.iconStyle === "square" && "rounded-none"
            )}
            style={{
              backgroundColor: settings.categoryCard.iconBgColor,
            }}
          >
            <Icon
              className={iconSize.icon}
              style={{ color: settings.categoryCard.iconColor }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3
            className={cn("font-semibold text-foreground", titleSizeClasses[settings.categoryCard.titleSize])}
          >
            {category.name}
          </h3>
          {settings.categoryCard.showTagline && category.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 space-y-1">
        {sortedServices.map((service, index) => (
          <div key={service.id}>
            <ServiceItem
              service={service}
              settings={settings}
              isLast={index === sortedServices.length - 1}
            />
            {settings.serviceItem.divider &&
              index < sortedServices.length - 1 && (
                <div
                  className="h-px mx-1"
                  style={{ backgroundColor: settings.serviceItem.dividerColor }}
                />
              )}
          </div>
        ))}
      </div>

      {/* View More Link if services are limited */}
      {settings.filters.limitServicesPerCategory > 0 &&
        category.services.length > settings.filters.limitServicesPerCategory && (
          <Link
            href={`/services?category=${category.slug}`}
            className="mt-4 text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all {category.services.length} services
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
    </div>
  );
}

export function ServiceListWidget({
  settings,
  isPreview = false,
}: ServiceListWidgetProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/services/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        let fetchedCategories: CategoryData[] = data.categories || [];

        // Filter categories if specific ones are selected
        if (
          !settings.filters.showAllCategories &&
          settings.filters.categories.length > 0
        ) {
          fetchedCategories = fetchedCategories.filter((cat) =>
            settings.filters.categories.includes(cat.id)
          );
        }

        // Filter out categories with no services if activeOnly
        if (settings.filters.activeOnly) {
          fetchedCategories = fetchedCategories.filter(
            (cat) => cat.services.length > 0
          );
        }

        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [
    settings.filters.showAllCategories,
    settings.filters.categories,
    settings.filters.activeOnly,
  ]);

  if (loading) {
    return (
      <div>
        <SectionHeader settings={settings} />
        <div
          className={cn(
            "grid",
            getColumnClasses(settings.layout.columns, settings.responsive)
          )}
          style={{ gap: `${settings.layout.gap}px` }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-muted/50"
              style={{ borderRadius: `${settings.categoryCard.borderRadius}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 bg-destructive/10 rounded-xl border border-destructive/20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
          <p className="text-sm text-muted-foreground">
            No service categories found. Add services from the admin panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader settings={settings} />
      <div
        className={cn(
          "grid",
          getColumnClasses(settings.layout.columns, settings.responsive)
        )}
        style={{ gap: `${settings.layout.gap}px` }}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            settings={settings}
          />
        ))}
      </div>
      <CTASection settings={settings} />
    </div>
  );
}
