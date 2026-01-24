"use client";

import type { Section, Widget, SectionBackground } from "@/lib/page-builder/types";
import { DEFAULT_SECTION_BACKGROUND } from "@/lib/page-builder/defaults";
import { cn } from "@/lib/utils";
import {
  HeroContentWidget,
  ImageWidget,
  ImageSliderWidget,
  TrustBadgesWidget,
  StatsSectionWidget,
  DividerWidget,
  ProcessStepsWidget,
} from "@/components/page-builder/widgets";
import { ServiceCardWidget, ServiceListWidget, PricingTableWidget } from "@/components/page-builder/widgets/commerce";

// Helper: Generate background styles from SectionBackground
function getBackgroundStyles(bg: SectionBackground): React.CSSProperties {
  const styles: React.CSSProperties = {};

  switch (bg.type) {
    case "solid":
      if (bg.color && bg.color !== "transparent") {
        styles.backgroundColor = bg.color;
      }
      break;

    case "gradient":
      if (bg.gradient) {
        const colorStops = bg.gradient.colors
          .map((c) => `${c.color} ${c.position}%`)
          .join(", ");
        if (bg.gradient.type === "linear") {
          styles.background = `linear-gradient(${bg.gradient.angle}deg, ${colorStops})`;
        } else {
          styles.background = `radial-gradient(circle, ${colorStops})`;
        }
      }
      break;

    case "image":
      if (bg.image?.url) {
        styles.backgroundImage = `url(${bg.image.url})`;
        styles.backgroundSize = bg.image.size || "cover";
        const positionMap: Record<string, string> = {
          "center": "center",
          "top": "top center",
          "bottom": "bottom center",
          "left": "center left",
          "right": "center right",
          "top-left": "top left",
          "top-right": "top right",
          "bottom-left": "bottom left",
          "bottom-right": "bottom right",
        };
        styles.backgroundPosition = positionMap[bg.image.position || "center"] || "center";
        styles.backgroundRepeat = bg.image.repeat || "no-repeat";
        if (bg.image.fixed) {
          styles.backgroundAttachment = "fixed";
        }
      }
      break;

    case "video":
      // Video is handled separately as a DOM element
      break;
  }

  return styles;
}

interface WidgetSectionsRendererProps {
  sections: Section[];
}

/**
 * Renders widget page builder sections on the public-facing site
 */
export function WidgetSectionsRenderer({ sections }: WidgetSectionsRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}

interface SectionRendererProps {
  section: Section;
}

function SectionRenderer({ section }: SectionRendererProps) {
  const { layout, columns, settings } = section;

  // Get layout grid classes
  const getLayoutClasses = () => {
    switch (layout) {
      case "1":
        return "grid-cols-1";
      case "1-1":
        return "grid-cols-1 lg:grid-cols-2";
      case "1-2":
        return "grid-cols-1 lg:grid-cols-3"; // 1fr 2fr
      case "2-1":
        return "grid-cols-1 lg:grid-cols-3"; // 2fr 1fr
      case "1-1-1":
        return "grid-cols-1 lg:grid-cols-3";
      case "1-2-1":
        return "grid-cols-1 lg:grid-cols-4"; // 1fr 2fr 1fr
      case "1-1-1-1":
        return "grid-cols-1 lg:grid-cols-4";
      default:
        return "grid-cols-1";
    }
  };

  // Get column span classes for asymmetric layouts
  const getColumnSpan = (columnIndex: number) => {
    switch (layout) {
      case "1-2":
        return columnIndex === 1 ? "lg:col-span-2" : "";
      case "2-1":
        return columnIndex === 0 ? "lg:col-span-2" : "";
      case "1-2-1":
        return columnIndex === 1 ? "lg:col-span-2" : "";
      default:
        return "";
    }
  };

  // Get background from new system, fallback to legacy
  const background: SectionBackground = settings.background || {
    ...DEFAULT_SECTION_BACKGROUND,
    type: "solid",
    color: settings.backgroundColor || "transparent",
  };

  // Get background styles
  const backgroundStyles = getBackgroundStyles(background);

  // Apply section background, padding, and border radius
  const sectionStyle: React.CSSProperties = {
    ...backgroundStyles,
    paddingTop: settings.paddingTop ? `${settings.paddingTop}px` : "48px",
    paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}px` : "48px",
    borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
  };

  return (
    <section className="relative overflow-hidden" style={sectionStyle}>
      {/* Video Background */}
      {background.type === "video" && background.video?.url && (
        <video
          autoPlay
          muted={background.video.muted}
          loop={background.video.loop}
          playsInline
          poster={background.video.poster}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        >
          <source src={background.video.url} type="video/mp4" />
        </video>
      )}

      {/* Background Overlay */}
      {background.overlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: background.overlay.color,
            opacity: background.overlay.opacity,
            zIndex: 1,
          }}
        />
      )}

      {/* Content Container */}
      <div
        className={cn(
          "relative container mx-auto px-4",
          settings.fullWidth ? "max-w-none" : "max-w-7xl"
        )}
        style={{ zIndex: 2 }}
      >
        <div
          className={cn("grid", getLayoutClasses())}
          style={{ gap: settings.gap ? `${settings.gap}px` : "24px" }}
        >
          {columns.map((column, colIndex) => (
            <div
              key={column.id}
              className={cn(
                "flex flex-col gap-4",
                getColumnSpan(colIndex),
                column.settings.verticalAlign === "center" && "justify-center",
                column.settings.verticalAlign === "bottom" && "justify-end"
              )}
            >
              {column.widgets.map((widget) => (
                <WidgetRenderer key={widget.id} widget={widget} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface WidgetRendererProps {
  widget: Widget<unknown>;
}

function WidgetRenderer({ widget }: WidgetRendererProps) {
  // Get widget spacing styles
  const spacingStyles: React.CSSProperties = {
    marginTop: widget.spacing?.marginTop ? `${widget.spacing.marginTop}px` : undefined,
    marginBottom: widget.spacing?.marginBottom ? `${widget.spacing.marginBottom}px` : undefined,
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case "hero-content":
        return <HeroContentWidget settings={widget.settings as any} />;

      case "image":
        return <ImageWidget settings={widget.settings as any} />;

      case "trust-badges":
        return <TrustBadgesWidget settings={widget.settings as any} />;

      case "stats-section":
        return <StatsSectionWidget settings={widget.settings as any} />;

      case "divider":
        return <DividerWidget settings={widget.settings as any} />;

      case "image-slider":
        return <ImageSliderWidget settings={widget.settings as any} />;

      case "service-card":
        return <ServiceCardWidget settings={widget.settings as any} />;

      case "service-list":
        return <ServiceListWidget settings={widget.settings as any} />;

      case "process-steps":
        return <ProcessStepsWidget settings={widget.settings as any} />;

      case "pricing-table":
        return <PricingTableWidget settings={widget.settings as any} />;

      default:
        // Unknown widget type - render nothing in production
        if (process.env.NODE_ENV === "development") {
          return (
            <div className="flex items-center justify-center bg-muted/50 py-8 text-sm text-muted-foreground rounded-lg">
              Unknown widget type: {widget.type}
            </div>
          );
        }
        return null;
    }
  };

  // Wrap with spacing if any margin is set
  if (widget.spacing?.marginTop || widget.spacing?.marginBottom) {
    return <div style={spacingStyles}>{renderWidgetContent()}</div>;
  }

  return renderWidgetContent();
}
