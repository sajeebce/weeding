"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTopBarDismiss } from "../hooks/useTopBarDismiss";
import type { TopBarProps } from "../types";
import type { GradientDirection } from "@/lib/header-footer/types";
import { cn } from "@/lib/utils";

// Convert gradient direction to CSS (copied from button system)
function getGradientCSS(direction?: GradientDirection): string {
  switch (direction) {
    case "to-r": return "to right";
    case "to-l": return "to left";
    case "to-t": return "to top";
    case "to-b": return "to bottom";
    case "to-tr": return "to top right";
    case "to-tl": return "to top left";
    case "to-br": return "to bottom right";
    case "to-bl": return "to bottom left";
    default: return "to right";
  }
}

export function TopBar({ enabled, content, bgColor, textColor }: TopBarProps) {
  const { isDismissed, dismiss } = useTopBarDismiss();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle entrance animation
  useEffect(() => {
    if (enabled && !isDismissed && content?.text) {
      // Small delay before showing for animation
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [enabled, isDismissed, content?.text]);

  if (!enabled || isDismissed || !content?.text) {
    return null;
  }

  // Get style from content or use fallback props
  const style = content.style;
  const dismissible = content.dismissible !== false;
  const entranceAnimation = content.entranceAnimation || "slide-down";

  // Calculate background
  const getBackground = () => {
    if (style?.useGradient && style.gradientFrom && style.gradientTo) {
      return `linear-gradient(${getGradientCSS(style.gradientDirection)}, ${style.gradientFrom}, ${style.gradientTo})`;
    }
    return style?.bgColor || bgColor || "hsl(var(--primary))";
  };

  // Get link styles
  const getLinkStyle = () => {
    const linkStyle = style?.linkStyle || "underline";
    return {
      color: style?.linkColor || "inherit",
      fontWeight: linkStyle === "bold" ? "bold" : "normal",
      textDecoration: linkStyle === "underline" ? "underline" : "none",
    };
  };

  // Animation classes
  const getAnimationClass = () => {
    if (!isAnimating) return "opacity-0";

    switch (entranceAnimation) {
      case "slide-down":
        return isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-full";
      case "fade-in":
        return isVisible ? "opacity-100" : "opacity-0";
      default:
        return "opacity-100";
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-4 px-4 py-2 text-sm transition-all duration-300",
        getAnimationClass()
      )}
      style={{
        background: getBackground(),
        color: style?.textColor || textColor || "hsl(var(--primary-foreground))",
        borderBottom: style?.borderBottom ? `1px solid ${style.borderColor || "rgba(255,255,255,0.2)"}` : undefined,
      }}
    >
      <span>{content.text}</span>

      {content.links && content.links.length > 0 && (
        <div className="flex items-center gap-3">
          {content.links.map((link, index) => {
            const linkStyleObj = getLinkStyle();
            return (
              <Link
                key={index}
                href={link.url}
                target={link.target || "_self"}
                className={cn(
                  "transition-opacity hover:opacity-80",
                  style?.linkStyle === "button" && "px-3 py-1 rounded bg-white/20 hover:bg-white/30"
                )}
                style={style?.linkStyle !== "button" ? linkStyleObj : { color: linkStyleObj.color }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-white/20"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </div>
  );
}
