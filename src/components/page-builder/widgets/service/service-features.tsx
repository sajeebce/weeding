// ============================================
// SERVICE FEATURES WIDGET
// Displays service included features list with 4 style variants
// ============================================

"use client";

import { cn } from "@/lib/utils";
import { Check, CircleCheck, BadgeCheck } from "lucide-react";
import {
  useOptionalServiceContext,
  resolvePlaceholders,
} from "@/lib/page-builder/contexts/service-context";
import type { ServiceFeaturesWidgetSettings } from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ============================================
// WIDGET PROPS
// ============================================

interface ServiceFeaturesWidgetProps {
  settings: Partial<ServiceFeaturesWidgetSettings>;
  isPreview?: boolean;
}

// ============================================
// ICON COMPONENT HELPER
// ============================================

function FeatureIcon({
  iconStyle,
  iconColor,
  className,
}: {
  iconStyle: ServiceFeaturesWidgetSettings["iconStyle"];
  iconColor: string;
  className?: string;
}) {
  const iconProps = {
    className,
    style: { color: iconColor },
  };

  switch (iconStyle) {
    case "circle-check":
      return <CircleCheck {...iconProps} />;
    case "badge-check":
      return <BadgeCheck {...iconProps} />;
    case "check":
    default:
      return <Check {...iconProps} />;
  }
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

export function ServiceFeaturesWidget({
  settings,
  isPreview = false,
}: ServiceFeaturesWidgetProps) {
  // Merge with defaults using ?? operator pattern
  const s = {
    header: {
      show: settings?.header?.show ?? true,
      heading: resolveString(settings?.header?.heading, "What's Included"),
      description: resolveString(settings?.header?.description, ""),
      alignment: settings?.header?.alignment ?? "left",
    },
    variant: settings?.variant ?? "minimal-checkmark",
    columns: settings?.columns ?? 2,
    showIcons: settings?.showIcons ?? true,
    iconStyle: settings?.iconStyle ?? "check",
    iconColor: settings?.iconColor ?? "#10b981",
    showDescriptions: settings?.showDescriptions ?? false,
  };

  // Get service context
  const serviceContext = useOptionalServiceContext();

  // If no service context, show placeholder (works in Page Builder admin)
  if (!serviceContext) {
    return <WidgetContainer container={settings.container}><ServiceFeaturesPlaceholder settings={s} /></WidgetContainer>;
  }

  const { service } = serviceContext;
  const features = [...service.features].sort((a, b) => a.sortOrder - b.sortOrder);

  // Resolve heading placeholders
  const resolvedHeading = resolvePlaceholders(s.header.heading, service);

  if (features.length === 0) {
    return null;
  }

  return (
    <WidgetContainer container={settings.container}>
    <section>
      {/* Header */}
      {s.header.show && (
        <div className={cn("mb-8", s.header.alignment === "center" ? "text-center" : "text-left")}>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{resolvedHeading}</h2>
          {s.header.description && (
            <p className="mt-2 text-muted-foreground">
              {resolvePlaceholders(s.header.description, service)}
            </p>
          )}
        </div>
      )}

      {/* Variant: minimal-checkmark */}
      {s.variant === "minimal-checkmark" && (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            s.columns >= 2 && "sm:grid-cols-2",
            s.columns >= 3 && "lg:grid-cols-3",
            s.columns >= 4 && "lg:grid-cols-4"
          )}
        >
          {features.map((feature) => (
            <div key={feature.id} className="flex items-start gap-3 py-2">
              {s.showIcons && (
                <FeatureIcon
                  iconStyle={s.iconStyle}
                  iconColor={s.iconColor}
                  className="h-5 w-5 shrink-0 mt-0.5"
                />
              )}
              <div>
                <span className="text-sm text-foreground leading-snug">{feature.text}</span>
                {s.showDescriptions && feature.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{feature.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variant: cards */}
      {s.variant === "cards" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-xl border bg-card p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              {s.showIcons && (
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FeatureIcon
                    iconStyle={s.iconStyle}
                    iconColor={s.iconColor}
                    className="h-6 w-6"
                  />
                </div>
              )}
              <p className="font-semibold text-sm">{feature.text}</p>
              {s.showDescriptions && feature.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Variant: compact-grid */}
      {s.variant === "compact-grid" && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2 text-sm py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variant: highlighted */}
      {s.variant === "highlighted" && (
        <div className="flex flex-wrap gap-3">
          {features.map((feature) => (
            <span
              key={feature.id}
              className="inline-flex items-center gap-2 rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5 text-sm font-medium"
            >
              {s.showIcons && (
                <CircleCheck
                  className="h-4 w-4"
                  style={{ color: s.iconColor }}
                />
              )}
              {feature.text}
            </span>
          ))}
        </div>
      )}
    </section>
    </WidgetContainer>
  );
}

// ============================================
// PLACEHOLDER FOR PREVIEW (NO SERVICE CONTEXT)
// ============================================

const PLACEHOLDER_FEATURES = [
  { id: "p1", text: "Company Name Availability Check", sortOrder: 1 },
  { id: "p2", text: "Articles of Organization Filing", sortOrder: 2 },
  { id: "p3", text: "Registered Agent (1st Year Free)", sortOrder: 3 },
  { id: "p4", text: "Operating Agreement Template", sortOrder: 4 },
  { id: "p5", text: "EIN / Tax ID Number", sortOrder: 5 },
  { id: "p6", text: "Compliance Calendar Reminders", sortOrder: 6 },
];

function ServiceFeaturesPlaceholder({
  settings: s,
}: {
  settings: {
    header: {
      show: boolean;
      heading: string;
      description: string;
      alignment: "left" | "center";
    };
    variant: ServiceFeaturesWidgetSettings["variant"];
    columns: ServiceFeaturesWidgetSettings["columns"];
    showIcons: boolean;
    iconStyle: ServiceFeaturesWidgetSettings["iconStyle"];
    iconColor: string;
    showDescriptions: boolean;
  };
}) {
  return (
    <section>
      {/* Header */}
      {s.header.show && (
        <div className={cn("mb-8", s.header.alignment === "center" ? "text-center" : "text-left")}>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{s.header.heading}</h2>
          {s.header.description && (
            <p className="mt-2 text-muted-foreground">{s.header.description}</p>
          )}
        </div>
      )}

      {/* Variant: minimal-checkmark */}
      {s.variant === "minimal-checkmark" && (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            s.columns >= 2 && "sm:grid-cols-2",
            s.columns >= 3 && "lg:grid-cols-3",
            s.columns >= 4 && "lg:grid-cols-4"
          )}
        >
          {PLACEHOLDER_FEATURES.map((feature) => (
            <div key={feature.id} className="flex items-start gap-3 py-2">
              {s.showIcons && (
                <FeatureIcon
                  iconStyle={s.iconStyle}
                  iconColor={s.iconColor}
                  className="h-5 w-5 shrink-0 mt-0.5"
                />
              )}
              <span className="text-sm text-foreground leading-snug">{feature.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Variant: cards */}
      {s.variant === "cards" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PLACEHOLDER_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="rounded-xl border bg-card p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              {s.showIcons && (
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FeatureIcon
                    iconStyle={s.iconStyle}
                    iconColor={s.iconColor}
                    className="h-6 w-6"
                  />
                </div>
              )}
              <p className="font-semibold text-sm">{feature.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Variant: compact-grid */}
      {s.variant === "compact-grid" && (
        <div className="rounded-xl border bg-muted/30 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {PLACEHOLDER_FEATURES.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2 text-sm py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variant: highlighted */}
      {s.variant === "highlighted" && (
        <div className="flex flex-wrap gap-3">
          {PLACEHOLDER_FEATURES.map((feature) => (
            <span
              key={feature.id}
              className="inline-flex items-center gap-2 rounded-lg border bg-primary/5 border-primary/20 px-4 py-2.5 text-sm font-medium"
            >
              {s.showIcons && (
                <CircleCheck
                  className="h-4 w-4"
                  style={{ color: s.iconColor }}
                />
              )}
              {feature.text}
            </span>
          ))}
        </div>
      )}

      {/* Preview Notice */}
      <p className="mt-6 text-xs text-muted-foreground">
        Preview mode - Feature data will be loaded dynamically
      </p>
    </section>
  );
}
