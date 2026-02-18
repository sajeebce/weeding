// ============================================
// PAGE BUILDER RENDERER
// Renders Page Builder sections on the frontend (view-only)
// ============================================

import { cn } from "@/lib/utils";
import type { Section, Column, SectionSettings } from "@/lib/page-builder/types";
import {
  getLayoutGridClass,
  getColumnSpanClasses,
  getMaxWidthClass,
} from "@/lib/page-builder/section-layouts";
import { getPatternCSS, getPatternBackgroundSize } from "@/lib/page-builder/pattern-utils";
import { WidgetRenderer } from "./widget-renderer";

// ============================================
// PAGE BUILDER RENDERER
// ============================================

interface PageBuilderRendererProps {
  sections: Section[];
  className?: string;
}

export function PageBuilderRenderer({ sections, className }: PageBuilderRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  // Sort sections by order, filter out hidden sections
  const sortedSections = [...sections]
    .filter((s) => s.settings.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={cn("page-builder-content", className)}>
      {sortedSections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

// ============================================
// BACKGROUND STYLE BUILDER
// ============================================

function buildBackgroundStyles(settings: SectionSettings): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (settings.background) {
    const { background } = settings;
    switch (background.type) {
      case "solid":
        if (background.color) {
          styles.backgroundColor = background.color;
        }
        break;
      case "gradient":
        if (background.gradient) {
          // Support both legacy string format and new object format
          if (typeof background.gradient === "string") {
            styles.backgroundImage = background.gradient;
          } else {
            const { type, angle, colors } = background.gradient;
            if (colors?.length) {
              const colorStops = colors.map((c) => `${c.color} ${c.position}%`).join(", ");
              styles.backgroundImage =
                type === "linear"
                  ? `linear-gradient(${angle}deg, ${colorStops})`
                  : `radial-gradient(circle, ${colorStops})`;
            }
          }
        }
        break;
      case "image":
        if (background.image?.url) {
          styles.backgroundImage = `url(${background.image.url})`;
          styles.backgroundSize = background.image.size || "cover";
          styles.backgroundPosition = (background.image.position || "center").replace("-", " ");
          styles.backgroundRepeat = background.image.repeat || "no-repeat";
          if (background.image.fixed) {
            styles.backgroundAttachment = "fixed";
          }
        }
        break;
      // Video handled as child element, not CSS
    }
  }

  // Legacy fallback
  if (!settings.background?.type || settings.background.type === "solid") {
    if (settings.backgroundColor && !settings.background?.color) {
      styles.backgroundColor = settings.backgroundColor;
    }
  }
  if (!settings.background?.type) {
    if (settings.backgroundImage) {
      styles.backgroundImage = `url(${settings.backgroundImage})`;
      styles.backgroundSize = "cover";
      styles.backgroundPosition = "center";
    }
  }

  return styles;
}

// ============================================
// SECTION RENDERER
// ============================================

interface SectionRendererProps {
  section: Section;
}

function SectionRenderer({ section }: SectionRendererProps) {
  const { settings, layout, columns } = section;
  const columnSpanClasses = getColumnSpanClasses(layout);

  // Responsive visibility classes
  const visibilityClass = cn(
    settings.visibleOnMobile === false && "hidden md:block",
    settings.visibleOnDesktop === false && "md:hidden",
  );

  const backgroundStyles = buildBackgroundStyles(settings);
  const bg = settings.background;
  const overlay = bg?.overlay ?? settings.backgroundOverlay;
  const patternOverlay = bg?.patternOverlay;
  const borderRadius = settings.borderRadius ? `${settings.borderRadius}px` : undefined;

  const hasGradientBorder = settings.gradientBorder?.enabled && settings.gradientBorder.colors?.length >= 2;
  const innerBorderRadius = hasGradientBorder && settings.borderRadius
    ? Math.max(0, settings.borderRadius - (settings.gradientBorder!.width || 2))
    : settings.borderRadius;

  const sectionContent = (
    <section
      className={cn(
        "relative w-full",
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
      {bg?.type === "video" && bg.video?.url && (
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ borderRadius }}
          src={bg.video.url}
          poster={bg.video.poster}
          muted={bg.video.muted ?? true}
          loop={bg.video.loop ?? true}
          autoPlay
          playsInline
        />
      )}

      {/* Color Overlay */}
      {overlay?.enabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            borderRadius: innerBorderRadius ? `${innerBorderRadius}px` : undefined,
          }}
        />
      )}

      {/* Pattern Overlay (fullWidth) */}
      {settings.fullWidth && patternOverlay && patternOverlay.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
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
          "relative mx-auto",
          getMaxWidthClass(settings.maxWidth)
        )}
        style={!settings.fullWidth ? backgroundStyles : undefined}
      >
        {/* Inner overlays when not fullWidth */}
        {!settings.fullWidth && overlay?.enabled && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: overlay.color,
              opacity: overlay.opacity,
              borderRadius,
            }}
          />
        )}
        {!settings.fullWidth && patternOverlay && patternOverlay.opacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: getPatternCSS(patternOverlay.type, patternOverlay.color, patternOverlay.opacity),
              backgroundSize: getPatternBackgroundSize(patternOverlay.type),
              borderRadius,
            }}
          />
        )}

        {/* Grid */}
        <div
          className={cn("relative grid", getLayoutGridClass(layout))}
          style={{ gap: `${settings.gap}px` }}
        >
          {columns.map((column, index) => (
            <ColumnRenderer
              key={column.id}
              column={column}
              spanClass={columnSpanClasses[index] || "col-span-12"}
            />
          ))}
        </div>
      </div>
    </section>
  );

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

// ============================================
// COLUMN RENDERER
// ============================================

interface ColumnRendererProps {
  column: Column;
  spanClass: string;
}

function ColumnRenderer({ column, spanClass }: ColumnRendererProps) {
  const { settings, widgets } = column;

  // Vertical alignment classes
  const alignmentClasses = {
    top: "justify-start",
    center: "justify-center",
    bottom: "justify-end",
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        spanClass,
        alignmentClasses[settings.verticalAlign],
        settings.className
      )}
      style={{
        padding: settings.padding ? `${settings.padding}px` : undefined,
        backgroundColor: settings.backgroundColor,
      }}
    >
      {widgets.map((widget) => (
        <WidgetRenderer key={widget.id} widget={widget} />
      ))}
    </div>
  );
}
