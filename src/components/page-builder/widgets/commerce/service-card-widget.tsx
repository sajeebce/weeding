"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { ArrowRight, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type {
  ServiceCardWidgetSettings,
  ServiceCardStyle,
  ServiceCardHoverEffect,
} from "@/lib/page-builder/types";

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
function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "Contact Us";
  return `From $${numPrice.toLocaleString()}`;
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
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);

  return (
    <div className="flex flex-col gap-3 p-6">
      {settings.icon.show && (
        <div
          className={cn(
            "flex items-center justify-center rounded-md",
            iconSize.container
          )}
          style={{
            backgroundColor: settings.icon.backgroundColor || "rgb(249 115 22 / 0.1)",
          }}
        >
          <Icon
            className={iconSize.icon}
            style={{ color: settings.icon.iconColor || "#f97316" }}
          />
        </div>
      )}
      <h3 className="font-semibold text-foreground">{service.name}</h3>
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
      {settings.content.showPrice && (
        <span className="text-sm font-semibold text-primary">
          {formatPrice(service.startingPrice)}
        </span>
      )}
    </div>
  );
}

function ElevatedCard({
  service,
  settings,
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);

  return (
    <>
      {settings.content.showBadge && service.isPopular && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-accent text-accent-foreground",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
        >
          Popular
        </Badge>
      )}
      <div className="p-6">
        {settings.icon.show && (
          <div
            className={cn(
              "mb-4 flex items-center justify-center rounded-lg transition-colors group-hover:bg-primary group-hover:text-primary-foreground",
              iconSize.container
            )}
            style={{
              backgroundColor: settings.icon.backgroundColor || "rgb(249 115 22 / 0.1)",
            }}
          >
            <Icon
              className={cn(iconSize.icon, "transition-colors")}
              style={{ color: settings.icon.iconColor || "#f97316" }}
            />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
      </div>
      <div className="px-6 pb-6 space-y-4">
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
        <div className="flex items-center justify-between">
          {settings.content.showPrice && (
            <span className="font-semibold text-primary">
              {formatPrice(service.startingPrice)}
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
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);

  return (
    <>
      {settings.content.showBadge && service.isPopular && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-white/10 text-white backdrop-blur-sm border border-white/20",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
        >
          Popular
        </Badge>
      )}
      <div className="p-6">
        {settings.icon.show && (
          <div
            className={cn(
              "mb-4 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20",
              iconSize.container
            )}
          >
            <Icon className={cn(iconSize.icon, "text-white")} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
        {settings.content.showCategory && service.category && (
          <span className="text-xs text-white/60">{service.category.name}</span>
        )}
      </div>
      <div className="px-6 pb-6 space-y-4">
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
        <div className="flex items-center justify-between">
          {settings.content.showPrice && (
            <span className="font-semibold text-white">
              {formatPrice(service.startingPrice)}
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
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);

  return (
    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 group-hover:from-primary group-hover:via-orange-400 group-hover:to-yellow-400 transition-all">
      <div
        className="relative bg-card rounded-xl h-full"
        style={{ borderRadius: `${Math.max(0, settings.borderRadius - 2)}px` }}
      >
        {settings.content.showBadge && service.isPopular && (
          <Badge
            className={cn(
              "absolute top-3 z-10 bg-gradient-to-r from-primary to-purple-500 text-white border-0",
              settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
            )}
          >
            Popular
          </Badge>
        )}
        <div className="p-6">
          {settings.icon.show && (
            <div
              className={cn(
                "mb-4 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20",
                iconSize.container
              )}
            >
              <Icon className={cn(iconSize.icon, "text-primary")} />
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
        </div>
        <div className="px-6 pb-6 space-y-4">
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
          <div className="flex items-center justify-between">
            {settings.content.showPrice && (
              <span className="font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {formatPrice(service.startingPrice)}
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
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);

  return (
    <>
      {/* Spotlight gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 group-hover:opacity-100 group-hover:from-white/5 group-hover:via-transparent group-hover:to-transparent transition-opacity rounded-xl pointer-events-none" />

      {settings.content.showBadge && service.isPopular && (
        <Badge
          className={cn(
            "absolute top-3 z-10 bg-accent text-accent-foreground",
            settings.content.badgePosition === "top-left" ? "left-4" : "right-4"
          )}
        >
          Popular
        </Badge>
      )}
      <div className="relative z-10 p-6">
        {settings.icon.show && (
          <div
            className={cn(
              "mb-4 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20",
              iconSize.container
            )}
            style={{
              backgroundColor: settings.icon.backgroundColor || "rgb(249 115 22 / 0.1)",
            }}
          >
            <Icon
              className={cn(iconSize.icon, "transition-transform group-hover:scale-110")}
              style={{ color: settings.icon.iconColor || "#f97316" }}
            />
          </div>
        )}
        <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
      </div>
      <div className="relative z-10 px-6 pb-6 space-y-4">
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
        <div className="flex items-center justify-between">
          {settings.content.showPrice && (
            <span className="font-semibold text-primary">
              {formatPrice(service.startingPrice)}
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
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
}) {
  const Icon = getLucideIcon(service.icon);
  const iconSize = getIconSizeClasses(settings.icon.size);
  const glowColor = settings.hover.glowColor || "#f97316";

  return (
    <>
      {/* Neon glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 rounded-xl"
        style={{ backgroundColor: glowColor, opacity: 0.3 }}
      />

      {settings.content.showBadge && service.isPopular && (
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
      <div className="relative z-10 p-6">
        {settings.icon.show && (
          <div
            className={cn(
              "mb-4 flex items-center justify-center rounded-lg border transition-all duration-300",
              iconSize.container
            )}
            style={{
              borderColor: `${glowColor}40`,
              backgroundColor: `${glowColor}10`,
            }}
          >
            <Icon
              className={cn(iconSize.icon, "transition-all group-hover:drop-shadow-[0_0_8px_var(--glow-color)]")}
              style={{
                color: glowColor,
                // @ts-ignore - CSS variable for neon effect
                "--glow-color": glowColor,
              } as React.CSSProperties}
            />
          </div>
        )}
        <h3
          className="text-lg font-semibold transition-all group-hover:drop-shadow-[0_0_10px_var(--glow-color)]"
          style={{
            color: glowColor,
            // @ts-ignore
            "--glow-color": glowColor,
          } as React.CSSProperties}
        >
          {service.name}
        </h3>
      </div>
      <div className="relative z-10 px-6 pb-6 space-y-4">
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
        <div className="flex items-center justify-between">
          {settings.content.showPrice && (
            <span className="font-semibold" style={{ color: glowColor }}>
              {formatPrice(service.startingPrice)}
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
}: {
  service: ServiceData;
  settings: ServiceCardWidgetSettings;
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
        return <MinimalCard service={service} settings={settings} />;
      case "glassmorphism":
        return <GlassmorphismCard service={service} settings={settings} />;
      case "gradient-border":
        return <GradientBorderCard service={service} settings={settings} />;
      case "spotlight":
        return <SpotlightCard service={service} settings={settings} />;
      case "neon-glow":
        return <NeonGlowCard service={service} settings={settings} />;
      case "elevated":
      default:
        return <ElevatedCard service={service} settings={settings} />;
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

export function ServiceCardWidget({ settings, isPreview = false }: ServiceCardWidgetProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 bg-destructive/10 rounded-xl border border-destructive/20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
        <p className="text-sm text-muted-foreground">
          No services found. Add services from the admin panel.
        </p>
      </div>
    );
  }

  return (
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
        <ServiceCard key={service.id} service={service} settings={settings} />
      ))}
    </div>
  );
}
