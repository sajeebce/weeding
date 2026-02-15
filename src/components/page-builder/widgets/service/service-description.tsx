// ============================================
// SERVICE DESCRIPTION WIDGET
// Renders the service's rich HTML description
// with prose styling and 3 layout variants
// ============================================

"use client";

import { cn } from "@/lib/utils";
import { Clock, DollarSign, Star } from "lucide-react";
import {
  useOptionalServiceContext,
  resolvePlaceholders,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceDescriptionWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: ServiceDescriptionWidgetSettings = {
  header: {
    show: true,
    heading: "About {{service.name}}",
    description: "",
    alignment: "left",
  },
  variant: "clean-prose",
  maxWidth: "lg",
  fontSize: "md",
  sidebar: {
    show: true,
    showProcessingTime: true,
    showStartingPrice: true,
    showPopularBadge: true,
  },
};

// ============================================
// MAPS
// ============================================

const maxWidthMap: Record<ServiceDescriptionWidgetSettings["maxWidth"], string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  full: "100%",
};

const fontSizeMap: Record<ServiceDescriptionWidgetSettings["fontSize"], string> = {
  sm: "prose-sm",
  md: "",
  lg: "prose-lg",
};

// ============================================
// WIDGET PROPS
// ============================================

interface ServiceDescriptionWidgetProps {
  settings: Partial<ServiceDescriptionWidgetSettings>;
  isPreview?: boolean;
}

// ============================================
// WIDGET COMPONENT
// ============================================

export function ServiceDescriptionWidget({
  settings: partialSettings,
  isPreview = false,
}: ServiceDescriptionWidgetProps) {
  // Merge with defaults
  const s: ServiceDescriptionWidgetSettings = {
    ...DEFAULT_SETTINGS,
    ...partialSettings,
    header: {
      ...DEFAULT_SETTINGS.header,
      ...partialSettings.header,
    },
    sidebar: {
      ...DEFAULT_SETTINGS.sidebar,
      ...partialSettings.sidebar,
    },
  };

  // Get service context
  const serviceContext = useOptionalServiceContext();

  // If no service context, show placeholder (works in Page Builder admin)
  if (!serviceContext) {
    return <WidgetContainer container={s.container}><ServiceDescriptionPlaceholder settings={s} /></WidgetContainer>;
  }

  const { service } = serviceContext;

  // Resolve placeholders in header
  const heading = resolvePlaceholders(s.header.heading, service);
  const description = resolvePlaceholders(s.header.description, service);

  const fontSizeClass = fontSizeMap[s.fontSize];

  // Header element
  const headerElement = s.header.show && (
    <div className={cn("mb-8", s.header.alignment === "center" && "text-center")}>
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{heading}</h2>
      {description && (
        <p className="mt-2 text-muted-foreground">{description}</p>
      )}
    </div>
  );

  // ---- Variant: clean-prose ----
  if (s.variant === "clean-prose") {
    return (
      <WidgetContainer container={s.container}>
      <div className="mx-auto" style={{ maxWidth: maxWidthMap[s.maxWidth] }}>
        {headerElement}
        <div
          className={cn(
            "prose dark:prose-invert max-w-none",
            fontSizeClass,
            "prose-headings:font-semibold prose-a:text-primary prose-li:marker:text-primary"
          )}
          dangerouslySetInnerHTML={{ __html: service.description }}
        />
      </div>
      </WidgetContainer>
    );
  }

  // ---- Variant: bordered ----
  if (s.variant === "bordered") {
    return (
      <WidgetContainer container={s.container}>
      <div className="mx-auto" style={{ maxWidth: maxWidthMap[s.maxWidth] }}>
        {headerElement}
        <div className="rounded-xl border border-l-4 border-l-primary bg-card p-8">
          <div
            className={cn("prose dark:prose-invert max-w-none", fontSizeClass)}
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // ---- Variant: two-column-sidebar ----
  return (
    <WidgetContainer container={s.container}>
    <div className="mx-auto" style={{ maxWidth: maxWidthMap[s.maxWidth] }}>
      {headerElement}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content (2/3) */}
        <div
          className={cn("lg:col-span-2 prose dark:prose-invert max-w-none", fontSizeClass)}
          dangerouslySetInnerHTML={{ __html: service.description }}
        />
        {/* Sidebar (1/3) */}
        {s.sidebar.show && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key Highlights
              </h3>
              <div className="space-y-3">
                {s.sidebar.showProcessingTime && service.processingTime && (
                  <SidebarItem
                    icon={<Clock className="h-5 w-5" />}
                    label="Processing Time"
                    value={service.processingTime}
                  />
                )}
                {s.sidebar.showStartingPrice && (
                  <SidebarItem
                    icon={<DollarSign className="h-5 w-5" />}
                    label="Starting Price"
                    value={`$${Number(service.startingPrice).toLocaleString()}`}
                  />
                )}
                {s.sidebar.showPopularBadge && service.isPopular && (
                  <SidebarItem
                    icon={<Star className="h-5 w-5" />}
                    label="Popular"
                    value="Best Seller"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </WidgetContainer>
  );
}

// ============================================
// SIDEBAR ITEM HELPER
// ============================================

function SidebarItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b py-2 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ============================================
// PLACEHOLDER FOR PREVIEW (NO SERVICE CONTEXT)
// ============================================

function ServiceDescriptionPlaceholder({
  settings: s,
}: {
  settings: ServiceDescriptionWidgetSettings;
}) {
  const fontSizeClass = fontSizeMap[s.fontSize];

  const placeholderHtml = `
    <h2>About This Service</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <h3>Why Choose This Service?</h3>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
    <ul>
      <li>Professional and experienced team</li>
      <li>Fast turnaround times</li>
      <li>Dedicated customer support</li>
      <li>Competitive pricing</li>
    </ul>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>
  `;

  // Header element
  const headerElement = s.header.show && (
    <div className={cn("mb-8", s.header.alignment === "center" && "text-center")}>
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        {s.header.heading || "About {{service.name}}"}
      </h2>
      {s.header.description && (
        <p className="mt-2 text-muted-foreground">{s.header.description}</p>
      )}
    </div>
  );

  // ---- Variant: clean-prose ----
  if (s.variant === "clean-prose") {
    return (
      <div className="mx-auto" style={{ maxWidth: maxWidthMap[s.maxWidth] }}>
        {headerElement}
        <div
          className={cn(
            "prose dark:prose-invert max-w-none",
            fontSizeClass,
            "prose-headings:font-semibold prose-a:text-primary prose-li:marker:text-primary"
          )}
          dangerouslySetInnerHTML={{ __html: placeholderHtml }}
        />
        <p className="mt-6 text-xs text-muted-foreground">
          Preview mode - Service description will be loaded dynamically
        </p>
      </div>
    );
  }

  // ---- Variant: bordered ----
  if (s.variant === "bordered") {
    return (
      <div className="mx-auto" style={{ maxWidth: maxWidthMap[s.maxWidth] }}>
        {headerElement}
        <div className="rounded-xl border border-l-4 border-l-primary bg-card p-8">
          <div
            className={cn("prose dark:prose-invert max-w-none", fontSizeClass)}
            dangerouslySetInnerHTML={{ __html: placeholderHtml }}
          />
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Preview mode - Service description will be loaded dynamically
        </p>
      </div>
    );
  }

  // ---- Variant: two-column-sidebar ----
  return (
    <div className="mx-auto" style={{ maxWidth: maxWidthMap[s.maxWidth] }}>
      {headerElement}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content (2/3) */}
        <div
          className={cn("lg:col-span-2 prose dark:prose-invert max-w-none", fontSizeClass)}
          dangerouslySetInnerHTML={{ __html: placeholderHtml }}
        />
        {/* Sidebar (1/3) */}
        {s.sidebar.show && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key Highlights
              </h3>
              <div className="space-y-3">
                {s.sidebar.showProcessingTime && (
                  <SidebarItem
                    icon={<Clock className="h-5 w-5" />}
                    label="Processing Time"
                    value="1-3 Business Days"
                  />
                )}
                {s.sidebar.showStartingPrice && (
                  <SidebarItem
                    icon={<DollarSign className="h-5 w-5" />}
                    label="Starting Price"
                    value="$199"
                  />
                )}
                {s.sidebar.showPopularBadge && (
                  <SidebarItem
                    icon={<Star className="h-5 w-5" />}
                    label="Popular"
                    value="Best Seller"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Preview mode - Service data will be loaded dynamically
      </p>
    </div>
  );
}
