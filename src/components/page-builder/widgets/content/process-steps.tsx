"use client";

import { useEffect, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ProcessStepsWidgetSettings,
  ProcessStep,
  BadgeStyle,
  ConnectorAnimation,
} from "@/lib/page-builder/types";
import { DEFAULT_PROCESS_STEPS_SETTINGS } from "@/lib/page-builder/defaults";

interface ProcessStepsWidgetProps {
  settings: ProcessStepsWidgetSettings;
  isPreview?: boolean;
}

// Get Lucide icon component by name
function getLucideIcon(
  name: string
): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >;
  return icons[name] || LucideIcons.CheckCircle;
}

// Get badge style classes
function getBadgeStyles(
  style: BadgeStyle,
  colors: { bgColor?: string; textColor?: string; borderColor?: string }
) {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium";

  switch (style) {
    case "outline":
      return {
        className: cn(baseClasses, "rounded-full border bg-transparent"),
        style: {
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
    case "solid":
      return {
        className: cn(baseClasses, "rounded-md border-0"),
        style: {
          backgroundColor: colors.bgColor || "#f97316",
          color: colors.textColor || "#ffffff",
        },
      };
    case "pill":
    default:
      return {
        className: cn(baseClasses, "rounded-full"),
        style: {
          backgroundColor: colors.bgColor || "#f9731933",
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
  }
}

// Render text with highlighted words
function renderHighlightedText(
  text: string,
  highlightWords?: string,
  highlightColor?: string
) {
  if (!highlightWords) {
    return text;
  }

  const regex = new RegExp(`(${highlightWords})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === highlightWords.toLowerCase()) {
      return (
        <span key={index} style={{ color: highlightColor || "#f97316" }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// Header Section Component
function SectionHeader({ settings, accentColor }: { settings: ProcessStepsWidgetSettings; accentColor?: string }) {
  const { header } = settings;

  if (!header?.show) return null;

  // Merge with defaults to handle DB data missing nested properties
  const badge = { ...DEFAULT_PROCESS_STEPS_SETTINGS.header.badge, ...header.badge };
  const heading = { ...DEFAULT_PROCESS_STEPS_SETTINGS.header.heading, ...header.heading };
  const description = { ...DEFAULT_PROCESS_STEPS_SETTINGS.header.description, ...header.description };

  const accentBgLight = accentColor ? `color-mix(in srgb, ${accentColor} 10%, transparent)` : undefined;
  const accentBorder = accentColor ? `color-mix(in srgb, ${accentColor} 30%, transparent)` : undefined;
  const badgeStyles = getBadgeStyles(badge.style, {
    bgColor: accentBgLight || badge.bgColor,
    textColor: accentColor || badge.textColor,
    borderColor: accentBorder || badge.borderColor,
  });

  const headingSizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
    "2xl": "text-5xl md:text-6xl",
  };

  const descriptionSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn("flex flex-col gap-4", alignmentClasses[header.alignment])}
      style={{ marginBottom: `${header.marginBottom}px` }}
    >
      {/* Badge */}
      {badge.show && (
        <span data-field-id="badge" className={badgeStyles.className} style={badgeStyles.style}>
          {badge.text}
        </span>
      )}

      {/* Heading */}
      <h2
        data-field-id="heading"
        className={cn(
          "font-bold tracking-tight",
          headingSizeClasses[heading.size]
        )}
        style={{ color: heading.color || "#0f172a" }}
      >
        {renderHighlightedText(
          heading.text,
          heading.highlightWords,
          accentColor || heading.highlightColor
        )}
      </h2>

      {/* Description */}
      {description.show && (
        <p
          data-field-id="description"
          className={cn(
            "max-w-3xl",
            descriptionSizeClasses[description.size]
          )}
          style={{ color: description.color || "#64748b" }}
        >
          {description.text}
        </p>
      )}
    </div>
  );
}

// Horizontal Connector Line - spans grid gap between steps
function HorizontalConnectorLine({ settings, accentColor }: { settings: ProcessStepsWidgetSettings; accentColor?: string }) {
  const connector = { ...DEFAULT_PROCESS_STEPS_SETTINGS.connector, ...settings.connector };
  const layout = { ...DEFAULT_PROCESS_STEPS_SETTINGS.layout, ...settings.layout };

  const speedMap: Record<string, string> = {
    slow: "8s",
    medium: "4s",
    fast: "2s",
  };

  const animationDuration = speedMap[connector.animationSpeed] || "4s";
  const color = connector.color || "#fde8d7";
  const secondaryColor = accentColor || connector.secondaryColor || "#f97316";
  const direction = "to right";

  // Get background styles based on line style
  const getLineStyleBackground = (): React.CSSProperties => {
    switch (connector.style) {
      case "dashed":
        return {
          backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0px, ${color} 10px, transparent 10px, transparent 20px)`,
          backgroundColor: "transparent",
        };
      case "dotted":
        return {
          backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0px, ${color} 4px, transparent 4px, transparent 12px)`,
          backgroundColor: "transparent",
        };
      case "gradient":
        return {
          background: `linear-gradient(${direction}, ${color}, ${secondaryColor})`,
        };
      case "double":
        return {
          backgroundColor: "transparent",
          backgroundImage: `linear-gradient(to bottom, ${color} 0px, ${color} 30%, transparent 30%, transparent 70%, ${color} 70%, ${color} 100%)`,
        };
      case "wavy":
        return {
          backgroundColor: "transparent",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 8' preserveAspectRatio='none'%3E%3Cpath d='M0 4 Q5 0 10 4 T20 4' stroke='${encodeURIComponent(color)}' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "20px 100%",
        };
      case "glow":
        return {
          backgroundColor: color,
          boxShadow: `0 0 8px 2px ${secondaryColor}, 0 0 16px 4px ${secondaryColor}40`,
        };
      case "solid":
      default:
        return {
          backgroundColor: color,
        };
    }
  };

  // Get final styles based on animation
  const getFinalStyles = (): React.CSSProperties => {
    switch (connector.animation) {
      case "flow":
        return {
          background: `linear-gradient(${direction}, ${color}, ${secondaryColor}, ${color})`,
          backgroundSize: "200% 100%",
        };
      case "shimmer":
        return {
          background: `linear-gradient(90deg, ${color} 0%, ${color} 40%, ${secondaryColor} 50%, ${color} 60%, ${color} 100%)`,
          backgroundSize: "300% 100%",
        };
      case "dash-flow":
        return {
          backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0px, ${color} 10px, transparent 10px, transparent 20px)`,
          backgroundColor: "transparent",
        };
      case "rainbow":
        return {
          background: `linear-gradient(${direction}, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd)`,
          backgroundSize: "100% 100%",
        };
      case "snake":
        return {
          backgroundColor: "transparent",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 8' preserveAspectRatio='none'%3E%3Cpath d='M0 4 Q10 0 20 4 T40 4' stroke='${encodeURIComponent(color)}' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "40px 100%",
        };
      default:
        return getLineStyleBackground();
    }
  };

  // Get animation style
  const getAnimationStyle = (): React.CSSProperties => {
    switch (connector.animation) {
      case "flow":
        return { animation: `connector-flow-h ${animationDuration} linear infinite` };
      case "pulse":
        return { animation: `connector-pulse ${animationDuration} ease-in-out infinite` };
      case "dash-flow":
        return { animation: `connector-dash-h ${animationDuration} linear infinite` };
      case "shimmer":
        return { animation: `connector-shimmer-h ${animationDuration} linear infinite` };
      case "draw":
        return {
          transformOrigin: "left",
          animation: `connector-draw-h 1.5s ease-out forwards`,
        };
      case "bounce":
        return {
          transformOrigin: "center",
          animation: `connector-bounce-h ${animationDuration} ease-in-out infinite`
        };
      case "rainbow":
        return { animation: `connector-rainbow ${animationDuration} linear infinite` };
      case "snake":
        return { animation: `connector-snake-h ${animationDuration} linear infinite` };
      default:
        return {};
    }
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        // Position at the right edge of this grid cell, spanning the gap
        top: "32px", // Roughly at icon center height
        right: `-${layout.gap}px`,
        width: `${layout.gap}px`,
        height: `${connector.thickness}px`,
        ...getFinalStyles(),
        ...getAnimationStyle(),
        zIndex: 5,
      }}
    >
      {/* Traveling Dot */}
      {connector.animation === "dot-travel" && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${connector.dotSize || 8}px`,
            height: `${connector.dotSize || 8}px`,
            backgroundColor: accentColor || connector.dotColor || "#f97316",
            top: "50%",
            marginTop: `-${(connector.dotSize || 8) / 2}px`,
            animation: `dot-travel-h ${animationDuration} linear infinite`,
          }}
        />
      )}
    </div>
  );
}

// Vertical Connector Line with Animations
function VerticalConnectorLine({
  settings,
  isLast,
  accentColor,
}: {
  settings: ProcessStepsWidgetSettings;
  isLast: boolean;
  accentColor?: string;
}) {
  const connector = { ...DEFAULT_PROCESS_STEPS_SETTINGS.connector, ...settings.connector };
  const layout = { ...DEFAULT_PROCESS_STEPS_SETTINGS.layout, ...settings.layout };

  if (!connector.show || isLast) return null;

  const speedMap: Record<string, string> = {
    slow: "8s",
    medium: "4s",
    fast: "2s",
  };

  const animationDuration = speedMap[connector.animationSpeed] || "4s";
  const color = connector.color || "#fde8d7";
  const secondaryColor = accentColor || connector.secondaryColor || "#f97316";
  const direction = "to bottom";

  // Get background styles based on line style
  const getLineStyleBackground = (): React.CSSProperties => {
    switch (connector.style) {
      case "dashed":
        return {
          backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0px, ${color} 10px, transparent 10px, transparent 20px)`,
          backgroundColor: "transparent",
        };
      case "dotted":
        return {
          backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0px, ${color} 4px, transparent 4px, transparent 12px)`,
          backgroundColor: "transparent",
        };
      case "gradient":
        return {
          background: `linear-gradient(${direction}, ${color}, ${secondaryColor})`,
        };
      case "double":
        return {
          backgroundColor: "transparent",
          backgroundImage: `linear-gradient(to right, ${color} 0px, ${color} 30%, transparent 30%, transparent 70%, ${color} 70%, ${color} 100%)`,
        };
      case "wavy":
        return {
          backgroundColor: "transparent",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 20' preserveAspectRatio='none'%3E%3Cpath d='M4 0 Q0 5 4 10 T4 20' stroke='${encodeURIComponent(color)}' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% 20px",
        };
      case "glow":
        return {
          backgroundColor: color,
          boxShadow: `0 0 8px 2px ${secondaryColor}, 0 0 16px 4px ${secondaryColor}40`,
        };
      case "solid":
      default:
        return {
          backgroundColor: color,
        };
    }
  };

  // Get final styles based on animation
  const getFinalStyles = (): React.CSSProperties => {
    switch (connector.animation) {
      case "flow":
        return {
          background: `linear-gradient(${direction}, ${color}, ${secondaryColor}, ${color})`,
          backgroundSize: "100% 200%",
        };
      case "shimmer":
        return {
          background: `linear-gradient(180deg, ${color} 0%, ${color} 40%, ${secondaryColor} 50%, ${color} 60%, ${color} 100%)`,
          backgroundSize: "100% 300%",
        };
      case "dash-flow":
        return {
          backgroundImage: `repeating-linear-gradient(${direction}, ${color} 0px, ${color} 10px, transparent 10px, transparent 20px)`,
          backgroundColor: "transparent",
        };
      case "rainbow":
        return {
          background: `linear-gradient(${direction}, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd)`,
          backgroundSize: "100% 100%",
        };
      case "snake":
        return {
          backgroundColor: "transparent",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 40' preserveAspectRatio='none'%3E%3Cpath d='M4 0 Q0 10 4 20 T4 40' stroke='${encodeURIComponent(color)}' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% 40px",
        };
      default:
        return getLineStyleBackground();
    }
  };

  // Get animation style
  const getAnimationStyle = (): React.CSSProperties => {
    switch (connector.animation) {
      case "flow":
        return { animation: `connector-flow-v ${animationDuration} linear infinite` };
      case "pulse":
        return { animation: `connector-pulse ${animationDuration} ease-in-out infinite` };
      case "dash-flow":
        return { animation: `connector-dash-v ${animationDuration} linear infinite` };
      case "shimmer":
        return { animation: `connector-shimmer-v ${animationDuration} linear infinite` };
      case "draw":
        return {
          transformOrigin: "top",
          animation: `connector-draw-v 1.5s ease-out forwards`,
        };
      case "bounce":
        return {
          transformOrigin: "center",
          animation: `connector-bounce-v ${animationDuration} ease-in-out infinite`
        };
      case "rainbow":
        return { animation: `connector-rainbow ${animationDuration} linear infinite` };
      case "snake":
        return { animation: `connector-snake-v ${animationDuration} linear infinite` };
      default:
        return {};
    }
  };

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{
        ...getFinalStyles(),
        ...getAnimationStyle(),
        height: `${layout.verticalSpacing}px`,
        top: "100%",
        width: `${connector.thickness}px`,
        zIndex: 5,
      }}
    >
      {/* Traveling Dot for dot-travel animation */}
      {connector.animation === "dot-travel" && (
        <div
          className="absolute rounded-full"
          style={{
            width: `${connector.dotSize || 8}px`,
            height: `${connector.dotSize || 8}px`,
            backgroundColor: accentColor || connector.dotColor || "#f97316",
            left: "50%",
            marginLeft: `-${(connector.dotSize || 8) / 2}px`,
            animation: `dot-travel-v ${animationDuration} linear infinite`,
          }}
        />
      )}
    </div>
  );
}

// Step Item Component
function StepItem({
  step,
  index,
  settings,
  isLast,
  isVertical,
  accentColor,
}: {
  step: ProcessStep;
  index: number;
  settings: ProcessStepsWidgetSettings;
  isLast: boolean;
  isVertical: boolean;
  accentColor?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = getLucideIcon(step.icon);
  const stepNumber = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.stepNumber,
    ...settings.stepNumber,
  };
  const stepIcon = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.stepIcon,
    ...settings.stepIcon,
  };
  const stepContent = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.stepContent,
    ...settings.stepContent,
  };
  const card = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.card,
    ...settings.card,
  };
  const connector = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.connector,
    ...settings.connector,
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: { container: "w-12 h-12", icon: "w-6 h-6" },
    md: { container: "w-16 h-16", icon: "w-8 h-8" },
    lg: { container: "w-20 h-20", icon: "w-10 h-10" },
    xl: { container: "w-24 h-24", icon: "w-12 h-12" },
  };

  // Number badge size classes
  const numberSizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-7 h-7 text-sm",
    lg: "w-8 h-8 text-base",
  };

  // Title size classes
  const titleSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Description size classes
  const descSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Number position classes
  const numberPositionClasses = {
    "top-left": "-top-2 -left-2",
    "top-center": "-top-2 left-1/2 -translate-x-1/2",
    "top-right": "-top-2 -right-2",
  };

  // Icon style classes
  const getIconStyleClasses = () => {
    switch (stepIcon.style) {
      case "circle":
        return "rounded-full";
      case "circle-outline":
        return "rounded-full border-2";
      case "rounded":
        return "rounded-xl";
      case "square":
        return "rounded-none";
      case "floating":
        return "rounded-full shadow-lg";
      default:
        return "rounded-full";
    }
  };

  // Hover animation classes
  const hoverAnimationClasses = {
    none: "",
    bounce: "group-hover:animate-bounce",
    pulse: "group-hover:animate-pulse",
    rotate: "group-hover:rotate-12 transition-transform",
    shake: "icon-hover-shake",
  };

  // Get hover effect styles (state-based for preview mode compatibility)
  const getHoverStyles = (): React.CSSProperties => {
    if (!card.show || card.hoverEffect === "none" || !isHovered) {
      return {};
    }

    switch (card.hoverEffect) {
      case "lift":
        return {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        };
      case "glow":
        return {
          boxShadow: "0 0 25px rgba(249, 115, 22, 0.5), 0 0 10px rgba(249, 115, 22, 0.3)",
        };
      case "scale":
        return {
          transform: "scale(1.05)",
        };
      default:
        return {};
    }
  };

  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  // Base shadow for card
  const getBaseShadow = () => {
    if (!card.show || card.shadow === "none") return undefined;
    switch (card.shadow) {
      case "sm": return "0 1px 2px rgba(0,0,0,0.05)";
      case "md": return "0 4px 6px rgba(0,0,0,0.1)";
      case "lg": return "0 10px 15px rgba(0,0,0,0.1)";
      default: return undefined;
    }
  };

  const hoverStyles = getHoverStyles();

  // Gradient border detection
  const hasGradientBorder = card.show && card.gradientBorder?.enabled &&
    card.gradientBorder.colors?.length >= 2;

  // Build card background style
  const getCardBackground = (): string | undefined => {
    if (!card.show) return undefined;
    if (card.backgroundType === "gradient" && card.gradientBackground?.colors?.length) {
      const { colors, angle } = card.gradientBackground;
      return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
    }
    return undefined;
  };

  const cardBgColor = card.show && card.backgroundType !== "gradient"
    ? card.backgroundColor
    : undefined;

  const cardBorderWidth = hasGradientBorder ? 0 : (card.show ? card.borderWidth : undefined);
  const innerBorderRadius = hasGradientBorder
    ? Math.max(0, card.borderRadius - (card.borderWidth || 2))
    : (card.show ? card.borderRadius : undefined);

  const cardContent = (
    <div
      className={cn(
        "relative group flex flex-col overflow-visible",
        alignmentClasses[stepContent.alignment],
        card.show && card.hoverEffect !== "none" && "cursor-pointer"
      )}
      style={{
        background: getCardBackground(),
        backgroundColor: cardBgColor,
        borderRadius: card.show ? `${innerBorderRadius}px` : undefined,
        borderWidth: cardBorderWidth ? `${cardBorderWidth}px` : undefined,
        borderColor: card.show && !hasGradientBorder ? card.borderColor : undefined,
        padding: card.show ? `${card.padding}px` : undefined,
        boxShadow: !hasGradientBorder ? (hoverStyles.boxShadow || getBaseShadow()) : undefined,
        transform: !hasGradientBorder ? hoverStyles.transform : undefined,
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => !hasGradientBorder && setIsHovered(true)}
      onMouseLeave={() => !hasGradientBorder && setIsHovered(false)}
    >
      {/* Icon with Number Badge */}
      {stepIcon.show && (
        <div className="relative mb-4 overflow-visible">
          {/* Icon Container */}
          <div
            className={cn(
              "flex items-center justify-center",
              iconSizeClasses[stepIcon.size].container,
              getIconStyleClasses(),
              hoverAnimationClasses[stepIcon.hoverAnimation]
            )}
            style={{
              backgroundColor: stepIcon.bgColor || "#fff7ed",
              borderColor: stepIcon.borderColor,
            }}
          >
            <Icon
              className={iconSizeClasses[stepIcon.size].icon}
              style={{ color: accentColor || stepIcon.iconColor || "#f97316" }}
            />
          </div>

          {/* Step Number Badge */}
          {stepNumber.show && (
            <div
              className={cn(
                "absolute flex items-center justify-center font-bold",
                numberSizeClasses[stepNumber.size],
                numberPositionClasses[stepNumber.position],
                stepNumber.style === "circle" && "rounded-full",
                stepNumber.style === "circle-outline" && "rounded-full border-2 bg-white",
                stepNumber.style === "rounded-square" && "rounded-md",
                stepNumber.style === "badge" && "rounded-full px-2"
              )}
              style={{
                backgroundColor: stepNumber.style !== "circle-outline"
                  ? (accentColor || stepNumber.bgColor || "#f97316")
                  : "white",
                color: stepNumber.style !== "circle-outline"
                  ? (stepNumber.textColor || "#ffffff")
                  : (accentColor || stepNumber.bgColor || "#f97316"),
                borderColor: stepNumber.borderColor || accentColor || stepNumber.bgColor || "#f97316",
              }}
            >
              {step.number ?? index + 1}
            </div>
          )}

        </div>
      )}

      {/* Horizontal Connector Line - positioned at StepItem level for better alignment */}
      {!isVertical && !isLast && connector.show && (
        <HorizontalConnectorLine settings={settings} accentColor={accentColor} />
      )}

      {/* Title */}
      <h3
        className={cn("font-semibold mb-2", titleSizeClasses[stepContent.titleSize])}
        style={{ color: stepContent.titleColor || "#0f172a" }}
      >
        {step.title}
      </h3>

      {/* Description */}
      <p
        className={cn("leading-relaxed", descSizeClasses[stepContent.descriptionSize])}
        style={{ color: stepContent.descriptionColor || "#64748b" }}
      >
        {step.description}
      </p>

      {/* Connector Line (for vertical layout) */}
      {isVertical && (
        <VerticalConnectorLine
          settings={settings}
          isLast={isLast}
          accentColor={accentColor}
        />
      )}
    </div>
  );

  // Wrap with gradient border if enabled
  if (hasGradientBorder) {
    const { colors, angle } = card.gradientBorder!;
    const borderWidth = card.borderWidth || 2;
    return (
      <div
        className={cn(
          "overflow-visible",
          card.hoverEffect !== "none" && "cursor-pointer"
        )}
        style={{
          padding: `${borderWidth}px`,
          background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
          borderRadius: `${card.borderRadius}px`,
          boxShadow: hoverStyles.boxShadow || getBaseShadow(),
          transform: hoverStyles.transform,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {cardContent}
      </div>
    );
  }

  return cardContent;
}

export function ProcessStepsWidget({
  settings,
  isPreview = false,
}: ProcessStepsWidgetProps) {
  // Theme-aware accent color
  const accentColor = settings.colors?.useTheme !== false ? "var(--color-primary)" : undefined;

  // Deep merge with defaults to guarantee all properties exist
  const animation = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.animation,
    ...settings.animation,
  };
  const layout = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.layout,
    ...settings.layout,
  };
  const responsive = {
    tablet: { ...DEFAULT_PROCESS_STEPS_SETTINGS.responsive.tablet, ...settings.responsive?.tablet },
    mobile: { ...DEFAULT_PROCESS_STEPS_SETTINGS.responsive.mobile, ...settings.responsive?.mobile },
  };
  const connector = {
    ...DEFAULT_PROCESS_STEPS_SETTINGS.connector,
    ...settings.connector,
  };
  const steps = settings.steps?.length ? settings.steps : DEFAULT_PROCESS_STEPS_SETTINGS.steps;

  const [isVisible, setIsVisible] = useState(!animation.animateOnScroll);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for scroll animation
  useEffect(() => {
    if (!animation.animateOnScroll || isPreview) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animation.animateOnScroll, isPreview]);

  const isVertical = layout.type === "vertical";
  const isAlternating = layout.type === "alternating";

  // Get responsive column classes
  const getColumnClasses = () => {
    const cols = layout.columns;
    const tabletCols = responsive?.tablet?.columns;

    if (isVertical) {
      return "grid-cols-1";
    }

    const colMap = {
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
    };

    const tabletMap = {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
    };

    return cn("grid-cols-1", tabletMap[tabletCols], colMap[cols]);
  };

  // Container style
  const container = settings.container;
  const hasContainerGradientBorder = container?.gradientBorder?.enabled &&
    container.gradientBorder.colors?.length >= 2;

  const borderRadius = container?.borderRadius || 0;
  const borderWidth = container?.borderWidth || 2;

  // Shadow class
  const getShadowClass = (shadow?: string) => {
    switch (shadow) {
      case "sm": return "shadow-sm";
      case "md": return "shadow-md";
      case "lg": return "shadow-lg";
      default: return "";
    }
  };

  // Container background
  const getContainerBackground = (): string | undefined => {
    if (container?.backgroundType === "gradient" && container.gradientBackground?.colors?.length) {
      const { colors, angle } = container.gradientBackground;
      return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
    }
    return undefined;
  };

  const containerBackground = getContainerBackground();
  const containerBgColor = !containerBackground ? (container?.backgroundColor || undefined) : undefined;

  const innerContent = (
    <div
      ref={containerRef}
      className={cn(
        !hasContainerGradientBorder && getShadowClass(container?.shadow),
      )}
      style={{
        background: containerBackground,
        backgroundColor: containerBgColor,
        borderRadius: hasContainerGradientBorder
          ? `${Math.max(0, borderRadius - borderWidth)}px`
          : borderRadius ? `${borderRadius}px` : undefined,
        padding: container?.padding ? `${container.padding}px` : undefined,
        maxWidth: !hasContainerGradientBorder && container?.maxWidth
          ? `${container.maxWidth}px`
          : undefined,
      }}
    >
      <div data-field-id="section-header">
        <SectionHeader settings={settings} accentColor={accentColor} />
      </div>

      <div
        data-field-id="steps"
        className={cn(
          "grid relative overflow-visible",
          getColumnClasses(),
          isAlternating && "lg:grid-cols-1"
        )}
        style={{ gap: `${layout.gap}px` }}
      >
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "transition-all duration-500 overflow-visible",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              isAlternating && index % 2 !== 0 && "lg:ml-auto"
            )}
            style={{
              transitionDelay: isVisible
                ? `${index * animation.staggerDelay}ms`
                : "0ms",
              maxWidth: isAlternating ? "50%" : undefined,
            }}
          >
            <StepItem
              step={step}
              index={index}
              settings={settings}
              isLast={index === steps.length - 1}
              isVertical={isVertical || isAlternating}
              accentColor={accentColor}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (hasContainerGradientBorder) {
    const { colors, angle } = container!.gradientBorder!;
    return (
      <div
        className={getShadowClass(container?.shadow)}
        style={{
          padding: `${borderWidth}px`,
          background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
          borderRadius: `${borderRadius}px`,
          maxWidth: container?.maxWidth ? `${container.maxWidth}px` : undefined,
        }}
      >
        {innerContent}
      </div>
    );
  }

  return innerContent;
}
