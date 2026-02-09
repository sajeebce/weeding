"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { Section as SectionType, SectionSettings } from "@/lib/page-builder/types";
import {
  getLayoutGridClass,
  getColumnSpanClasses,
  getMaxWidthClass,
} from "@/lib/page-builder/section-layouts";
import { getPatternCSS, getPatternBackgroundSize } from "@/lib/page-builder/pattern-utils";
import { Column } from "./column";

interface SectionProps {
  section: SectionType;
  isSelected?: boolean;
  onSelect?: () => void;
  onSelectColumn?: (columnId: string) => void;
  onSelectWidget?: (columnId: string, widgetId: string) => void;
  selectedColumnId?: string;
  selectedWidgetId?: string;
  isPreview?: boolean;
  onAddWidget?: (columnId: string) => void;
}

/** Build inline background styles from the unified background system */
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
          const { type, angle, colors } = background.gradient;
          const colorStops = colors.map((c) => `${c.color} ${c.position}%`).join(", ");
          styles.backgroundImage =
            type === "linear"
              ? `linear-gradient(${angle}deg, ${colorStops})`
              : `radial-gradient(circle, ${colorStops})`;
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
      // Video handled as a child element, not CSS
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

export function Section({
  section,
  isSelected = false,
  onSelect,
  onSelectColumn,
  onSelectWidget,
  selectedColumnId,
  selectedWidgetId,
  isPreview = false,
  onAddWidget,
}: SectionProps) {
  const { settings, layout, columns } = section;
  const columnSpanClasses = getColumnSpanClasses(layout);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Visibility check
  if (settings.isVisible === false && isPreview) {
    return null;
  }

  const backgroundStyles = buildBackgroundStyles(settings);
  const bg = settings.background;
  const overlay = bg?.overlay ?? settings.backgroundOverlay;
  const patternOverlay = bg?.patternOverlay;
  const borderRadius = settings.borderRadius ? `${settings.borderRadius}px` : undefined;

  return (
    <div
      className={cn(
        "relative w-full transition-all duration-200",
        !isPreview && "group/section",
        isSelected && !isPreview && "ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900",
        settings.isVisible === false && !isPreview && "opacity-40",
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
        borderRadius,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isPreview && onSelect) {
          onSelect();
        }
      }}
    >
      {/* Video Background */}
      {bg?.type === "video" && bg.video?.url && (
        <video
          ref={videoRef}
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
            borderRadius,
          }}
        />
      )}

      {/* Pattern Overlay */}
      {patternOverlay && patternOverlay.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: getPatternCSS(patternOverlay.type, patternOverlay.color, patternOverlay.opacity),
            backgroundSize: getPatternBackgroundSize(patternOverlay.type),
            borderRadius,
          }}
        />
      )}

      {/* Section Toolbar (shown on hover in edit mode) */}
      {!isPreview && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/section:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-1 bg-slate-800 rounded-md px-2 py-1 shadow-lg border border-slate-700">
            <span className="text-xs text-slate-400">
              Section{settings.isVisible === false ? " (Hidden)" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Container */}
      <div
        className={cn(
          "relative mx-auto",
          getMaxWidthClass(settings.maxWidth)
        )}
        style={!settings.fullWidth ? backgroundStyles : undefined}
      >
        {/* Inner background overlay/pattern when not fullWidth */}
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
            <Column
              key={column.id}
              column={column}
              className={columnSpanClasses[index]}
              isSelected={selectedColumnId === column.id}
              selectedWidgetId={selectedWidgetId}
              onSelect={() => onSelectColumn?.(column.id)}
              onSelectWidget={(widgetId) => onSelectWidget?.(column.id, widgetId)}
              isPreview={isPreview}
              onAddWidget={() => onAddWidget?.(column.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
