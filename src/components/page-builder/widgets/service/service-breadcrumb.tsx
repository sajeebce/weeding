// ============================================
// SERVICE BREADCRUMB WIDGET
// Dynamic breadcrumbs: Home > Services > {Category?} > {Service Name}
// ============================================

"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useOptionalServiceContext } from "@/lib/page-builder/contexts/service-context";
import type { ServiceBreadcrumbWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: ServiceBreadcrumbWidgetSettings = {
  variant: "simple-text",
  separator: "chevron",
  showHome: true,
  homeLabel: "Home",
  showCategory: true,
  fontSize: "sm",
  alignment: "left",
};

// ============================================
// WIDGET PROPS
// ============================================

interface ServiceBreadcrumbWidgetProps {
  settings: Partial<ServiceBreadcrumbWidgetSettings>;
  isPreview?: boolean;
}

// ============================================
// FONT SIZE & ALIGNMENT MAPS
// ============================================

const fontSizeMap: Record<ServiceBreadcrumbWidgetSettings["fontSize"], string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
};

const alignmentMap: Record<ServiceBreadcrumbWidgetSettings["alignment"], string> = {
  left: "",
  center: "justify-center",
};

// ============================================
// SEPARATOR COMPONENT
// ============================================

function Separator({
  type,
  className,
}: {
  type: ServiceBreadcrumbWidgetSettings["separator"];
  className?: string;
}) {
  switch (type) {
    case "chevron":
      return <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", className)} />;
    case "slash":
      return <span className={cn("shrink-0", className)}>/</span>;
    case "arrow":
      return <span className={cn("shrink-0", className)}>{"\u2192"}</span>;
    case "dot":
      return <span className={cn("shrink-0", className)}>{"\u00B7"}</span>;
    default:
      return <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", className)} />;
  }
}

// ============================================
// BREADCRUMB ITEM TYPE
// ============================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================
// VARIANT: SIMPLE TEXT
// ============================================

function SimpleTextBreadcrumb({
  items,
  separator,
  fontSizeClass,
  alignmentClass,
}: {
  items: BreadcrumbItem[];
  separator: ServiceBreadcrumbWidgetSettings["separator"];
  fontSizeClass: string;
  alignmentClass: string;
}) {
  return (
    <nav
      className={cn("flex items-center gap-1.5", fontSizeClass, alignmentClass)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <Separator
                type={separator}
                className="text-muted-foreground/50 mx-1"
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ============================================
// VARIANT: PILL CHIP
// ============================================

function PillChipBreadcrumb({
  items,
  fontSizeClass,
  alignmentClass,
}: {
  items: BreadcrumbItem[];
  fontSizeClass: string;
  alignmentClass: string;
}) {
  return (
    <nav
      className={cn("flex items-center gap-1.5", fontSizeClass, alignmentClass)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 mx-0.5" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="rounded-full bg-muted px-3 py-1 text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="rounded-full bg-primary/10 text-primary font-medium px-3 py-1">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ============================================
// VARIANT: MINIMAL
// ============================================

function MinimalBreadcrumb({
  items,
  separator,
  alignmentClass,
}: {
  items: BreadcrumbItem[];
  separator: ServiceBreadcrumbWidgetSettings["separator"];
  alignmentClass: string;
}) {
  return (
    <nav
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        alignmentClass
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <Separator
                type={separator}
                className="text-muted-foreground/50"
              />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ============================================
// PLACEHOLDER (NO SERVICE CONTEXT)
// ============================================

function ServiceBreadcrumbPlaceholder({
  settings,
}: {
  settings: ServiceBreadcrumbWidgetSettings;
}) {
  const fontSizeClass = fontSizeMap[settings.fontSize];
  const alignmentClass = alignmentMap[settings.alignment];

  const items: BreadcrumbItem[] = [];
  if (settings.showHome) items.push({ label: settings.homeLabel });
  items.push({ label: "Services" });
  items.push({ label: "{{service.name}}" });

  return (
    <nav
      className={cn(
        "flex items-center gap-1.5 opacity-60",
        fontSizeClass,
        alignmentClass
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <Separator
                type={settings.separator}
                className="text-muted-foreground/50 mx-1"
              />
            )}
            <span className="text-muted-foreground cursor-not-allowed">
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ============================================
// WIDGET COMPONENT
// ============================================

export function ServiceBreadcrumbWidget({
  settings: partialSettings,
  isPreview = false,
}: ServiceBreadcrumbWidgetProps) {
  // Merge with defaults
  const s: ServiceBreadcrumbWidgetSettings = {
    variant: partialSettings.variant ?? DEFAULT_SETTINGS.variant,
    separator: partialSettings.separator ?? DEFAULT_SETTINGS.separator,
    showHome: partialSettings.showHome ?? DEFAULT_SETTINGS.showHome,
    homeLabel: partialSettings.homeLabel ?? DEFAULT_SETTINGS.homeLabel,
    showCategory: partialSettings.showCategory ?? DEFAULT_SETTINGS.showCategory,
    fontSize: partialSettings.fontSize ?? DEFAULT_SETTINGS.fontSize,
    alignment: partialSettings.alignment ?? DEFAULT_SETTINGS.alignment,
  };

  // Get service context
  const serviceContext = useOptionalServiceContext();

  // If no service context, show placeholder
  if (!serviceContext) {
    return <WidgetContainer container={partialSettings.container}><ServiceBreadcrumbPlaceholder settings={s} /></WidgetContainer>;
  }

  const { service } = serviceContext;

  // Build breadcrumb items
  const items: BreadcrumbItem[] = [];

  if (s.showHome) {
    items.push({ label: s.homeLabel, href: "/" });
  }

  items.push({ label: "Services", href: "/services" });

  if (s.showCategory && service.category) {
    items.push({
      label: service.category.name,
      href: `/services?category=${service.category.slug}`,
    });
  }

  // Last item is the current page (no href)
  items.push({ label: service.name });

  // Resolve classes
  const fontSizeClass = fontSizeMap[s.fontSize];
  const alignmentClass = alignmentMap[s.alignment];

  // Render based on variant
  switch (s.variant) {
    case "pill-chip":
      return (
        <WidgetContainer container={partialSettings.container}>
        <PillChipBreadcrumb
          items={items}
          fontSizeClass={fontSizeClass}
          alignmentClass={alignmentClass}
        />
        </WidgetContainer>
      );

    case "minimal":
      return (
        <WidgetContainer container={partialSettings.container}>
        <MinimalBreadcrumb
          items={items}
          separator={s.separator}
          alignmentClass={alignmentClass}
        />
        </WidgetContainer>
      );

    case "simple-text":
    default:
      return (
        <WidgetContainer container={partialSettings.container}>
        <SimpleTextBreadcrumb
          items={items}
          separator={s.separator}
          fontSizeClass={fontSizeClass}
          alignmentClass={alignmentClass}
        />
        </WidgetContainer>
      );
  }
}
