"use client";

import type { Section, Widget, SectionBackground } from "@/lib/page-builder/types";
import { DEFAULT_SECTION_BACKGROUND } from "@/lib/page-builder/defaults";
import { cn } from "@/lib/utils";
import { getLayoutGridClass, getColumnSpanClasses, getMaxWidthClass } from "@/lib/page-builder/section-layouts";
import { getPatternCSS, getPatternBackgroundSize } from "@/lib/page-builder/pattern-utils";
import {
  HeroContentWidget,
  ImageWidget,
  ImageSliderWidget,
  TrustBadgesWidget,
  StatsSectionWidget,
  DividerWidget,
  FaqAccordionWidget,
  ProcessStepsWidget,
  HeadingWidget,
  TextBlockWidget,
  LeadFormWidget,
  TestimonialsWidget,
} from "@/components/page-builder/widgets";
import { ServiceCardWidget, ServiceListWidget, PricingTableWidget } from "@/components/page-builder/widgets/commerce";
import {
  ServiceHeroWidget,
  ServiceFeaturesWidget,
  ServiceDescriptionWidget,
  ServiceBreadcrumbWidget,
  RelatedServicesWidget,
} from "@/components/page-builder/widgets/service";

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

  // Filter out hidden sections and sort by order
  const visibleSections = [...sections]
    .filter((s) => s.settings.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleSections.map((section) => (
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
  const columnSpanClasses = getColumnSpanClasses(layout);

  // Responsive visibility classes
  const visibilityClass = cn(
    settings.visibleOnMobile === false && "hidden md:block",
    settings.visibleOnDesktop === false && "md:hidden",
  );

  // Get background from new system, fallback to legacy
  const background: SectionBackground = settings.background || {
    ...DEFAULT_SECTION_BACKGROUND,
    type: "solid",
    color: settings.backgroundColor || "transparent",
  };

  const backgroundStyles = getBackgroundStyles(background);
  const overlay = background.overlay ?? settings.backgroundOverlay;
  const patternOverlay = background.patternOverlay;
  const borderRadius = settings.borderRadius ? `${settings.borderRadius}px` : undefined;

  const hasGradientBorder = settings.gradientBorder?.enabled && settings.gradientBorder.colors?.length >= 2;
  const innerBorderRadius = hasGradientBorder && settings.borderRadius
    ? Math.max(0, settings.borderRadius - (settings.gradientBorder!.width || 2))
    : settings.borderRadius;

  const sectionContent = (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        visibilityClass,
        settings.className,
      )}
      style={{
        ...(settings.fullWidth ? backgroundStyles : {}),
        paddingTop: `${settings.paddingTop ?? 0}px`,
        paddingBottom: `${settings.paddingBottom ?? 0}px`,
        paddingLeft: `${settings.paddingLeft ?? 0}px`,
        paddingRight: `${settings.paddingRight ?? 0}px`,
        marginTop: `${settings.marginTop ?? 0}px`,
        marginBottom: `${settings.marginBottom ?? 0}px`,
        minHeight: settings.minHeight ? `${settings.minHeight}px` : undefined,
        borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
      }}
    >
      {/* Video Background */}
      {background.type === "video" && background.video?.url && (
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ borderRadius }}
          src={background.video.url}
          poster={background.video.poster}
          muted={background.video.muted ?? true}
          loop={background.video.loop ?? true}
          autoPlay
          playsInline
        />
      )}

      {/* Color Overlay */}
      {overlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
          }}
        />
      )}

      {/* Pattern Overlay */}
      {patternOverlay && patternOverlay.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            backgroundImage: getPatternCSS(patternOverlay.type, patternOverlay.color, patternOverlay.opacity),
            backgroundSize: getPatternBackgroundSize(patternOverlay.type),
            borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
          }}
        />
      )}

      {/* Container */}
      <div
        className={cn(
          "relative z-[2] mx-auto",
          getMaxWidthClass(settings.maxWidth)
        )}
        style={!settings.fullWidth ? backgroundStyles : undefined}
      >

        {/* Grid */}
        <div
          className={cn("relative grid", getLayoutGridClass(layout))}
          style={{ gap: `${settings.gap}px` }}
        >
          {columns.map((column, index) => (
            <div
              key={column.id}
              className={cn(
                "flex flex-col",
                columnSpanClasses[index] || "col-span-12",
                column.settings.verticalAlign === "center" && "justify-center",
                column.settings.verticalAlign === "bottom" && "justify-end",
              )}
              style={{
                padding: column.settings.padding ? `${column.settings.padding}px` : undefined,
                backgroundColor: column.settings.backgroundColor,
              }}
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

  // Wrap with gradient border if enabled
  if (hasGradientBorder) {
    const { colors, angle, width } = settings.gradientBorder!;
    return (
      <div
        style={{
          padding: `${width || 2}px`,
          background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
          borderRadius: settings.borderRadius ? `${settings.borderRadius}px` : undefined,
        }}
      >
        {sectionContent}
      </div>
    );
  }

  return sectionContent;
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

      case "heading":
        return <HeadingWidget settings={widget.settings as any} />;

      case "text-block":
        return <TextBlockWidget settings={widget.settings as any} />;

      case "lead-form":
        return <LeadFormWidget settings={widget.settings as any} />;

      case "testimonials-carousel":
        return <TestimonialsWidget settings={widget.settings as any} />;

      case "service-hero":
        return <ServiceHeroWidget settings={widget.settings as any} />;

      case "service-features":
        return <ServiceFeaturesWidget settings={widget.settings as any} />;

      case "service-description":
        return <ServiceDescriptionWidget settings={widget.settings as any} />;

      case "service-breadcrumb":
        return <ServiceBreadcrumbWidget settings={widget.settings as any} />;

      case "related-services":
        return <RelatedServicesWidget settings={widget.settings as any} />;

      case "faq":
        return <FaqAccordionWidget settings={widget.settings as any} />;

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
