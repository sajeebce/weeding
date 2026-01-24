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

// Connector Line with Animations
function ConnectorLine({
  settings,
  isLast,
  isVertical,
}: {
  settings: ProcessStepsWidgetSettings;
  isLast: boolean;
  isVertical: boolean;
}) {
  const { connector } = settings;

  if (!connector.show || isLast) return null;

  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: connector.color || "#fde8d7",
    };

    if (connector.style === "dashed") {
      return {
        ...baseStyles,
        backgroundImage: `repeating-linear-gradient(
          ${isVertical ? "180deg" : "90deg"},
          ${connector.color || "#fde8d7"},
          ${connector.color || "#fde8d7"} 8px,
          transparent 8px,
          transparent 16px
        )`,
        backgroundColor: "transparent",
      };
    }

    if (connector.style === "dotted") {
      return {
        ...baseStyles,
        backgroundImage: `repeating-linear-gradient(
          ${isVertical ? "180deg" : "90deg"},
          ${connector.color || "#fde8d7"},
          ${connector.color || "#fde8d7"} 4px,
          transparent 4px,
          transparent 12px
        )`,
        backgroundColor: "transparent",
      };
    }

    if (connector.style === "gradient") {
      return {
        background: `linear-gradient(${isVertical ? "180deg" : "90deg"}, ${connector.color || "#fde8d7"}, ${connector.secondaryColor || "#f97316"})`,
      };
    }

    return baseStyles;
  };

  const speedMap = {
    slow: "8s",
    medium: "4s",
    fast: "2s",
  };

  const animationDuration = speedMap[connector.animationSpeed];

  // Animation keyframes are defined in CSS
  const getAnimationClass = (): string => {
    switch (connector.animation) {
      case "flow":
        return "animate-connector-flow";
      case "pulse":
        return "animate-connector-pulse";
      case "dash-flow":
        return "animate-connector-dash";
      case "shimmer":
        return "animate-connector-shimmer";
      case "draw":
        return "animate-connector-draw";
      default:
        return "";
    }
  };

  // Build the final background style combining line style + animation
  const getFinalStyles = (): React.CSSProperties => {
    const lineStyles = getAnimationStyles();

    // For shimmer, we need to layer the shimmer on top using pseudo-element approach
    // But since we can't use pseudo-elements easily, we'll use a different approach
    if (connector.animation === "shimmer") {
      // Keep the line style, shimmer will be handled via opacity animation
      return lineStyles;
    }

    return lineStyles;
  };

  return (
    <>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes connector-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes connector-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes connector-dash {
          0% { background-position: 0 0; }
          100% { background-position: ${isVertical ? "0 100px" : "100px 0"}; }
        }
        @keyframes connector-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes connector-draw {
          0% { transform: ${isVertical ? "scaleY(0)" : "scaleX(0)"}; }
          100% { transform: ${isVertical ? "scaleY(1)" : "scaleX(1)"}; }
        }
        @keyframes dot-travel {
          0% { transform: ${isVertical ? "translateY(-100%)" : "translateX(-100%)"}; }
          100% { transform: ${isVertical ? "translateY(200%)" : "translateX(200%)"}; }
        }
        .animate-connector-flow {
          background-size: 200% 200%;
          animation: connector-flow ${animationDuration} ease infinite;
        }
        .animate-connector-pulse {
          animation: connector-pulse ${animationDuration} ease-in-out infinite;
        }
        .animate-connector-dash {
          animation: connector-dash ${animationDuration} linear infinite;
        }
        .animate-connector-shimmer {
          position: relative;
          overflow: hidden;
        }
        .animate-connector-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          background-size: 200% 100%;
          animation: connector-shimmer ${animationDuration} linear infinite;
        }
        .animate-connector-draw {
          transform-origin: ${isVertical ? "top" : "left"};
          animation: connector-draw 1s ease-out forwards;
        }
      `}</style>

      {isVertical ? (
        // Vertical connector
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-0.5",
            getAnimationClass()
          )}
          style={{
            ...getFinalStyles(),
            height: `${settings.layout.verticalSpacing}px`,
            top: "100%",
            width: `${connector.thickness}px`,
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
                transform: "translateX(-50%)",
                animation: `dot-travel ${animationDuration} linear infinite`,
              }}
            />
          )}
        </div>
      ) : (
        // Horizontal connector
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex-1",
            getAnimationClass()
          )}
          style={{
            ...getFinalStyles(),
            height: `${connector.thickness}px`,
            left: "calc(50% + 40px)",
            right: "calc(-50% + 40px)",
            width: "calc(100% - 80px)",
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
                top: "50%",
                transform: "translateY(-50%)",
                animation: `dot-travel ${animationDuration} linear infinite`,
              }}
            />
          )}
        </div>
      )}
    </>
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
    shake: "group-hover:animate-shake",
  };

  // Card hover effect classes
  const cardHoverClasses = {
    none: "",
    lift: "hover:-translate-y-1 hover:shadow-lg transition-all",
    glow: "hover:shadow-lg hover:shadow-primary/20 transition-all",
    scale: "hover:scale-105 transition-transform",
  };

  const alignmentClasses = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  return (
    <div
      className={cn(
        "relative group flex flex-col",
        alignmentClasses[stepContent.alignment],
        card.show && cardHoverClasses[card.hoverEffect]
      )}
      style={{
        backgroundColor: card.show ? card.backgroundColor : undefined,
        borderRadius: card.show ? `${card.borderRadius}px` : undefined,
        borderWidth: card.show ? `${card.borderWidth}px` : undefined,
        borderColor: card.show ? card.borderColor : undefined,
        padding: card.show ? `${card.padding}px` : undefined,
        boxShadow: card.show && card.shadow !== "none"
          ? card.shadow === "sm" ? "0 1px 2px rgba(0,0,0,0.05)"
          : card.shadow === "md" ? "0 4px 6px rgba(0,0,0,0.1)"
          : "0 10px 15px rgba(0,0,0,0.1)"
          : undefined,
      }}
    >
      {/* Icon with Number Badge */}
      {stepIcon.show && (
        <div className="relative mb-4">
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

          {/* Connector Line (for horizontal layout) */}
          {!isVertical && (
            <ConnectorLine
              settings={settings}
              isLast={isLast}
              isVertical={false}
            />
          )}
        </div>
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
        <ConnectorLine
          settings={settings}
          isLast={isLast}
          isVertical={true}
        />
      )}
    </div>
  );
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
          "grid relative",
          getColumnClasses(),
          isAlternating && "lg:grid-cols-1"
        )}
        style={{ gap: `${settings.layout.gap}px` }}
      >
        {settings.steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "transition-all duration-500",
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
