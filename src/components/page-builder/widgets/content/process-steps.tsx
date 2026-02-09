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
function SectionHeader({ settings }: { settings: ProcessStepsWidgetSettings }) {
  const { header } = settings;

  if (!header?.show) return null;

  const badgeStyles = getBadgeStyles(header.badge.style, {
    bgColor: header.badge.bgColor,
    textColor: header.badge.textColor,
    borderColor: header.badge.borderColor,
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
      {header.badge.show && (
        <span className={badgeStyles.className} style={badgeStyles.style}>
          {header.badge.text}
        </span>
      )}

      {/* Heading */}
      <h2
        className={cn(
          "font-bold tracking-tight",
          headingSizeClasses[header.heading.size]
        )}
        style={{ color: header.heading.color || "#0f172a" }}
      >
        {renderHighlightedText(
          header.heading.text,
          header.heading.highlightWords,
          header.heading.highlightColor
        )}
      </h2>

      {/* Description */}
      {header.description.show && (
        <p
          className={cn(
            "max-w-3xl",
            descriptionSizeClasses[header.description.size]
          )}
          style={{ color: header.description.color || "#64748b" }}
        >
          {header.description.text}
        </p>
      )}
    </div>
  );
}

// Horizontal Connector Line - spans grid gap between steps
function HorizontalConnectorLine({ settings }: { settings: ProcessStepsWidgetSettings }) {
  const { connector } = settings;

  const speedMap: Record<string, string> = {
    slow: "8s",
    medium: "4s",
    fast: "2s",
  };

  const animationDuration = speedMap[connector.animationSpeed] || "4s";
  const color = connector.color || "#fde8d7";
  const secondaryColor = connector.secondaryColor || "#f97316";
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
        right: `-${settings.layout.gap}px`,
        width: `${settings.layout.gap}px`,
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
            backgroundColor: connector.dotColor || "#f97316",
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
}: {
  settings: ProcessStepsWidgetSettings;
  isLast: boolean;
}) {
  const { connector } = settings;

  if (!connector.show || isLast) return null;

  const speedMap: Record<string, string> = {
    slow: "8s",
    medium: "4s",
    fast: "2s",
  };

  const animationDuration = speedMap[connector.animationSpeed] || "4s";
  const color = connector.color || "#fde8d7";
  const secondaryColor = connector.secondaryColor || "#f97316";
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
        height: `${settings.layout.verticalSpacing}px`,
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
            backgroundColor: connector.dotColor || "#f97316",
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
}: {
  step: ProcessStep;
  index: number;
  settings: ProcessStepsWidgetSettings;
  isLast: boolean;
  isVertical: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = getLucideIcon(step.icon);
  const { stepNumber, stepIcon, stepContent, card } = settings;

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
              style={{ color: stepIcon.iconColor || "#f97316" }}
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
                  ? (stepNumber.bgColor || "#f97316")
                  : "white",
                color: stepNumber.style !== "circle-outline"
                  ? (stepNumber.textColor || "#ffffff")
                  : (stepNumber.bgColor || "#f97316"),
                borderColor: stepNumber.borderColor || stepNumber.bgColor || "#f97316",
              }}
            >
              {step.number ?? index + 1}
            </div>
          )}

        </div>
      )}

      {/* Horizontal Connector Line - positioned at StepItem level for better alignment */}
      {!isVertical && !isLast && settings.connector.show && (
        <HorizontalConnectorLine settings={settings} />
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
  const [isVisible, setIsVisible] = useState(!settings.animation.animateOnScroll);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for scroll animation
  useEffect(() => {
    if (!settings.animation.animateOnScroll || isPreview) {
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
  }, [settings.animation.animateOnScroll, isPreview]);

  const isVertical = settings.layout.type === "vertical";
  const isAlternating = settings.layout.type === "alternating";

  // Get responsive column classes
  const getColumnClasses = () => {
    const cols = settings.layout.columns;
    const tabletCols = settings.responsive.tablet.columns;

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

  return (
    <div ref={containerRef}>
      <SectionHeader settings={settings} />

      <div
        className={cn(
          "grid relative overflow-visible",
          getColumnClasses(),
          isAlternating && "lg:grid-cols-1"
        )}
        style={{ gap: `${settings.layout.gap}px` }}
      >
        {settings.steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "transition-all duration-500 overflow-visible",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              isAlternating && index % 2 !== 0 && "lg:ml-auto"
            )}
            style={{
              transitionDelay: isVisible
                ? `${index * settings.animation.staggerDelay}ms`
                : "0ms",
              maxWidth: isAlternating ? "50%" : undefined,
            }}
          >
            <StepItem
              step={step}
              index={index}
              settings={settings}
              isLast={index === settings.steps.length - 1}
              isVertical={isVertical || isAlternating}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
