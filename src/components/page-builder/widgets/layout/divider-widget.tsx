"use client";

import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { DividerWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_DIVIDER_SETTINGS } from "@/lib/page-builder/defaults";

interface DividerWidgetProps {
  settings: Partial<DividerWidgetSettings>;
  isPreview?: boolean;
}

// Get Lucide icon component by name
function getLucideIcon(name: string): React.ComponentType<{ className?: string; size?: number }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>;
  return icons[name] || LucideIcons.Minus;
}

export function DividerWidget({ settings: partialSettings, isPreview }: DividerWidgetProps) {
  // Merge with defaults
  const settings: DividerWidgetSettings = {
    ...DEFAULT_DIVIDER_SETTINGS,
    ...partialSettings,
  };

  const {
    style,
    color,
    secondaryColor,
    width,
    thickness,
    spacing,
    alignment,
    icon,
    iconSize,
    iconColor,
    text,
    textSize,
    textColor,
    textBackground,
  } = settings;

  // Alignment classes
  const alignmentClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[alignment];

  // Text size classes
  const textSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[textSize || "sm"];

  // Container styles
  const containerStyle: React.CSSProperties = {
    marginTop: `${spacing}px`,
    marginBottom: `${spacing}px`,
  };

  // Base line styles
  const getLineStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      height: `${thickness}px`,
      width: `${width}%`,
    };

    switch (style) {
      case "solid":
        return { ...base, backgroundColor: color };

      case "dashed":
        return {
          ...base,
          backgroundImage: `repeating-linear-gradient(to right, ${color} 0, ${color} 8px, transparent 8px, transparent 16px)`,
        };

      case "dotted":
        return {
          ...base,
          backgroundImage: `repeating-linear-gradient(to right, ${color} 0, ${color} ${thickness * 2}px, transparent ${thickness * 2}px, transparent ${thickness * 4}px)`,
          borderRadius: "9999px",
        };

      case "gradient":
        return {
          ...base,
          background: `linear-gradient(to right, ${color}, ${secondaryColor})`,
        };

      case "gradient-fade":
        return {
          ...base,
          background: `linear-gradient(to right, transparent, ${color} 20%, ${color} 80%, transparent)`,
        };

      case "double":
        return base;

      default:
        return { ...base, backgroundColor: color };
    }
  };

  // Render based on style
  if (style === "double") {
    return (
      <div className={cn("flex flex-col gap-1", alignmentClass)} style={containerStyle}>
        <div style={{ height: `${thickness}px`, width: `${width}%`, backgroundColor: color }} />
        <div style={{ height: `${thickness}px`, width: `${width}%`, backgroundColor: color }} />
      </div>
    );
  }

  if (style === "with-icon") {
    const IconComponent = getLucideIcon(icon || "Minus");
    return (
      <div className={cn("flex items-center gap-4", alignmentClass)} style={containerStyle}>
        <div
          className="flex-1"
          style={{
            height: `${thickness}px`,
            backgroundColor: color,
            maxWidth: `calc((${width}% - ${(iconSize || 20) + 32}px) / 2)`,
          }}
        />
        <span className="shrink-0" style={{ color: iconColor }}>
          <IconComponent size={iconSize} />
        </span>
        <div
          className="flex-1"
          style={{
            height: `${thickness}px`,
            backgroundColor: color,
            maxWidth: `calc((${width}% - ${(iconSize || 20) + 32}px) / 2)`,
          }}
        />
      </div>
    );
  }

  if (style === "with-text") {
    return (
      <div className={cn("flex items-center gap-4", alignmentClass)} style={containerStyle}>
        <div
          className="flex-1"
          style={{
            height: `${thickness}px`,
            backgroundColor: color,
          }}
        />
        <span
          className={cn("shrink-0 px-4 font-medium", textSizeClass)}
          style={{
            color: textColor,
            backgroundColor: textBackground,
          }}
        >
          {text}
        </span>
        <div
          className="flex-1"
          style={{
            height: `${thickness}px`,
            backgroundColor: color,
          }}
        />
      </div>
    );
  }

  // Default line styles (solid, dashed, dotted, gradient, gradient-fade)
  return (
    <div className={cn("flex", alignmentClass)} style={containerStyle}>
      <div style={getLineStyle()} />
    </div>
  );
}
