// ============================================
// RELATED SERVICES WIDGET
// Fetches and displays related services, excluding the current one
// Supports 4 card variants: minimal, elevated, horizontal, bordered-badge
// ============================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptionalServiceContext } from "@/lib/page-builder/contexts/service-context";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getCurrencySymbol } from "@/lib/currencies";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import type { WidgetContainerStyle } from "@/lib/page-builder/types";

// ============================================
// TYPES
// ============================================

interface RelatedServicesWidgetSettings {
  header: {
    show: boolean;
    heading: string;
    description: string;
    alignment: "left" | "center";
  };
  maxItems: number;
  columns: 2 | 3 | 4;
  cardVariant: "minimal" | "elevated" | "horizontal" | "bordered-badge";
  showPrice: boolean;
  showDescription: boolean;
  showCategoryBadge: boolean;
  ctaText: string;
  container?: WidgetContainerStyle;
}

interface RelatedService {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  icon?: string | null;
  startingPrice: number;
  category?: { name: string; slug: string } | null;
}

// ============================================
// DEFAULT SETTINGS
// ============================================

const DEFAULT_SETTINGS: RelatedServicesWidgetSettings = {
  header: {
    show: true,
    heading: "Related Services",
    description: "Explore other services that complement your business needs.",
    alignment: "center",
  },
  maxItems: 4,
  columns: 3,
  cardVariant: "elevated",
  showPrice: true,
  showDescription: true,
  showCategoryBadge: true,
  ctaText: "Learn More",
};

// ============================================
// WIDGET PROPS
// ============================================

interface RelatedServicesWidgetProps {
  settings: Partial<RelatedServicesWidgetSettings>;
  isPreview?: boolean;
}

// ============================================
// WIDGET COMPONENT
// ============================================

// Coerce a value that may be a string or { text: string } object into a string
function resolveString(val: unknown, fallback: string): string {
  if (typeof val === "string") return val || fallback;
  if (val && typeof val === "object" && "text" in val) {
    return (val as { text: string }).text || fallback;
  }
  return fallback;
}

export function RelatedServicesWidget({
  settings: partialSettings,
  isPreview = false,
}: RelatedServicesWidgetProps) {
  // Merge defaults with provided settings
  const s: RelatedServicesWidgetSettings = {
    header: {
      show: partialSettings.header?.show ?? DEFAULT_SETTINGS.header.show,
      heading: resolveString(partialSettings.header?.heading, DEFAULT_SETTINGS.header.heading),
      description: resolveString(partialSettings.header?.description, DEFAULT_SETTINGS.header.description),
      alignment: partialSettings.header?.alignment ?? DEFAULT_SETTINGS.header.alignment,
    },
    maxItems: partialSettings.maxItems ?? DEFAULT_SETTINGS.maxItems,
    columns: partialSettings.columns ?? DEFAULT_SETTINGS.columns,
    cardVariant: partialSettings.cardVariant ?? DEFAULT_SETTINGS.cardVariant,
    showPrice: partialSettings.showPrice ?? DEFAULT_SETTINGS.showPrice,
    showDescription: partialSettings.showDescription ?? DEFAULT_SETTINGS.showDescription,
    showCategoryBadge: partialSettings.showCategoryBadge ?? DEFAULT_SETTINGS.showCategoryBadge,
    ctaText: partialSettings.ctaText ?? DEFAULT_SETTINGS.ctaText,
  };

  // Get service context
  const serviceContext = useOptionalServiceContext();

  // State for fetched services
  const [services, setServices] = useState<RelatedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Fetch currency
  useEffect(() => {
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) {
          setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch related services
  useEffect(() => {
    if (!serviceContext) {
      setIsLoading(false);
      return;
    }

    const { service } = serviceContext;

    async function fetchRelated() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/services/related?slug=${encodeURIComponent(service.slug)}&limit=${s.maxItems}`
        );
        if (res.ok) {
          const data = await res.json();
          setServices(data.services ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch related services:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelated();
  }, [serviceContext, s.maxItems]);

  // If no service context, show placeholder (Page Builder admin preview)
  if (!serviceContext) {
    return <WidgetContainer container={partialSettings.container}><RelatedServicesPlaceholder settings={s} /></WidgetContainer>;
  }

  // Loading state
  if (isLoading) {
    return (
      <WidgetContainer container={partialSettings.container}>
      <section className="py-4">
        <div className="mx-auto max-w-7xl px-4">
          {s.header.show && (
            <div
              className={cn(
                "mb-10",
                s.header.alignment === "center" && "text-center"
              )}
            >
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {s.header.heading}
              </h2>
              {s.header.description && (
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                  {s.header.description}
                </p>
              )}
            </div>
          )}
          <SkeletonGrid columns={s.columns} count={s.maxItems} variant={s.cardVariant} />
        </div>
      </section>
      </WidgetContainer>
    );
  }

  // No services found
  if (services.length === 0) {
    return null;
  }

  return (
    <WidgetContainer container={partialSettings.container}>
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        {s.header.show && (
          <div
            className={cn(
              "mb-10",
              s.header.alignment === "center" && "text-center"
            )}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {s.header.heading}
            </h2>
            {s.header.description && (
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                {s.header.description}
              </p>
            )}
          </div>
        )}

        {/* Service Cards */}
        {s.cardVariant === "horizontal" ? (
          <div className="space-y-3">
            {services.map((svc) => (
              <HorizontalCard key={svc.id} svc={svc} settings={s} cs={currencySymbol} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-6 sm:grid-cols-2",
              s.columns === 2 && "lg:grid-cols-2 xl:grid-cols-2",
              s.columns === 3 && "lg:grid-cols-3 xl:grid-cols-3",
              s.columns === 4 && "lg:grid-cols-4 xl:grid-cols-4"
            )}
          >
            {services.map((svc) => {
              switch (s.cardVariant) {
                case "minimal":
                  return <MinimalCard key={svc.id} svc={svc} settings={s} cs={currencySymbol} />;
                case "bordered-badge":
                  return <BorderedBadgeCard key={svc.id} svc={svc} settings={s} cs={currencySymbol} />;
                case "elevated":
                default:
                  return <ElevatedCard key={svc.id} svc={svc} settings={s} cs={currencySymbol} />;
              }
            })}
          </div>
        )}
      </div>
    </section>
    </WidgetContainer>
  );
}

// ============================================
// CARD VARIANT: MINIMAL
// ============================================

function MinimalCard({
  svc,
  settings,
  cs = "$",
}: {
  svc: RelatedService;
  settings: RelatedServicesWidgetSettings;
  cs?: string;
}) {
  return (
    <Link href={"/services/" + svc.slug}>
      <div className="group rounded-xl p-6 transition-colors hover:bg-muted/50">
        {/* Icon */}
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ServiceIcon name={svc.icon || "FileText"} className="h-5 w-5" />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
          {svc.name}
        </h3>

        {/* Price */}
        {settings.showPrice && (
          <p className="mt-1 text-sm text-muted-foreground">
            From {cs}{svc.startingPrice.toLocaleString()}
          </p>
        )}

        {/* Link Arrow */}
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {settings.ctaText}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// ============================================
// CARD VARIANT: ELEVATED (DEFAULT)
// ============================================

function ElevatedCard({
  svc,
  settings,
  cs = "$",
}: {
  svc: RelatedService;
  settings: RelatedServicesWidgetSettings;
  cs?: string;
}) {
  return (
    <Link href={"/services/" + svc.slug}>
      <div className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ServiceIcon name={svc.icon || "FileText"} className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg">{svc.name}</h3>

        {/* Description */}
        {settings.showDescription && svc.shortDesc && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {svc.shortDesc}
          </p>
        )}

        {/* Price */}
        {settings.showPrice && (
          <p className="mt-3 text-sm font-semibold text-primary">
            From {cs}{svc.startingPrice.toLocaleString()}
          </p>
        )}

        {/* Link */}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {settings.ctaText}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// ============================================
// CARD VARIANT: HORIZONTAL
// ============================================

function HorizontalCard({
  svc,
  settings,
  cs = "$",
}: {
  svc: RelatedService;
  settings: RelatedServicesWidgetSettings;
  cs?: string;
}) {
  return (
    <Link href={"/services/" + svc.slug}>
      <div className="group flex items-center gap-6 rounded-xl border bg-card p-5 hover:shadow-md transition-all">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ServiceIcon name={svc.icon || "FileText"} className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
            {svc.name}
          </h3>
          {settings.showDescription && svc.shortDesc && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {svc.shortDesc}
            </p>
          )}
        </div>

        {/* Right side: Price + CTA */}
        <div className="shrink-0 text-right">
          {settings.showPrice && (
            <p className="text-sm font-semibold text-primary">
              From {cs}{svc.startingPrice.toLocaleString()}
            </p>
          )}
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
            {settings.ctaText}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// CARD VARIANT: BORDERED-BADGE
// ============================================

function BorderedBadgeCard({
  svc,
  settings,
  cs = "$",
}: {
  svc: RelatedService;
  settings: RelatedServicesWidgetSettings;
  cs?: string;
}) {
  return (
    <Link href={"/services/" + svc.slug}>
      <div className="group rounded-xl border border-t-4 border-t-primary bg-card p-6 hover:shadow-lg transition-all duration-300">
        {/* Category Badge */}
        {settings.showCategoryBadge && svc.category && (
          <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {svc.category.name}
          </span>
        )}

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ServiceIcon name={svc.icon || "FileText"} className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg">{svc.name}</h3>

        {/* Description */}
        {settings.showDescription && svc.shortDesc && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {svc.shortDesc}
          </p>
        )}

        {/* Price */}
        {settings.showPrice && (
          <p className="mt-3 text-sm font-semibold text-primary">
            From {cs}{svc.startingPrice.toLocaleString()}
          </p>
        )}

        {/* CTA */}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
          {settings.ctaText}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

// ============================================
// SKELETON GRID (LOADING STATE)
// ============================================

function SkeletonGrid({
  columns,
  count,
  variant,
}: {
  columns: 2 | 3 | 4;
  count: number;
  variant: string;
}) {
  if (variant === "horizontal") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 rounded-xl border bg-card p-5 animate-pulse"
          >
            <div className="h-14 w-14 shrink-0 rounded-xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
            <div className="shrink-0 space-y-2 text-right">
              <div className="ml-auto h-3 w-16 rounded bg-muted" />
              <div className="ml-auto h-3 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2",
        columns === 2 && "lg:grid-cols-2 xl:grid-cols-2",
        columns === 3 && "lg:grid-cols-3 xl:grid-cols-3",
        columns === 4 && "lg:grid-cols-4 xl:grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-card p-6 animate-pulse"
        >
          <div className="mb-4 h-12 w-12 rounded-xl bg-muted" />
          <div className="h-5 w-2/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-full rounded bg-muted" />
          <div className="mt-1 h-3 w-3/4 rounded bg-muted" />
          <div className="mt-3 h-4 w-1/4 rounded bg-muted" />
          <div className="mt-4 h-3 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// PLACEHOLDER FOR PREVIEW (NO SERVICE CONTEXT)
// ============================================

function RelatedServicesPlaceholder({
  settings,
}: {
  settings: RelatedServicesWidgetSettings;
}) {
  const placeholderServices: RelatedService[] = [
    {
      id: "p1",
      name: "LLC Formation",
      slug: "llc-formation",
      shortDesc: "Register your US LLC with complete state filing and documentation.",
      icon: "Building2",
      startingPrice: 199,
      category: { name: "Formation", slug: "formation" },
    },
    {
      id: "p2",
      name: "EIN Number",
      slug: "ein-number",
      shortDesc: "Obtain your Employer Identification Number from the IRS.",
      icon: "Hash",
      startingPrice: 79,
      category: { name: "Tax & Compliance", slug: "tax-compliance" },
    },
    {
      id: "p3",
      name: "Registered Agent",
      slug: "registered-agent",
      shortDesc: "Professional registered agent service in any US state.",
      icon: "Shield",
      startingPrice: 99,
      category: { name: "Compliance", slug: "compliance" },
    },
    {
      id: "p4",
      name: "Virtual Address",
      slug: "virtual-address",
      shortDesc: "Get a real US business address for your company.",
      icon: "MapPin",
      startingPrice: 149,
      category: { name: "Address", slug: "address" },
    },
  ];

  const displayServices = placeholderServices.slice(0, settings.maxItems);

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        {settings.header.show && (
          <div
            className={cn(
              "mb-10",
              settings.header.alignment === "center" && "text-center"
            )}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {settings.header.heading}
            </h2>
            {settings.header.description && (
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                {settings.header.description}
              </p>
            )}
          </div>
        )}

        {/* Placeholder Cards */}
        {settings.cardVariant === "horizontal" ? (
          <div className="space-y-3">
            {displayServices.map((svc) => (
              <HorizontalCard key={svc.id} svc={svc} settings={settings} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 gap-6 sm:grid-cols-2",
              settings.columns === 2 && "lg:grid-cols-2 xl:grid-cols-2",
              settings.columns === 3 && "lg:grid-cols-3 xl:grid-cols-3",
              settings.columns === 4 && "lg:grid-cols-4 xl:grid-cols-4"
            )}
          >
            {displayServices.map((svc) => {
              switch (settings.cardVariant) {
                case "minimal":
                  return <MinimalCard key={svc.id} svc={svc} settings={settings} />;
                case "bordered-badge":
                  return <BorderedBadgeCard key={svc.id} svc={svc} settings={settings} />;
                case "elevated":
                default:
                  return <ElevatedCard key={svc.id} svc={svc} settings={settings} />;
              }
            })}
          </div>
        )}

        {/* Preview Notice */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Preview mode - Related services will be loaded dynamically
        </p>
      </div>
    </section>
  );
}
