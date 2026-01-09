"use client";

import {
  Shield,
  Clock,
  Globe,
  Star,
  CheckCircle,
  Award,
  Lock,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustBadgeItem } from "@/lib/landing-blocks/types";

// Icon map
const iconMap: Record<string, LucideIcon> = {
  Shield,
  Clock,
  Globe,
  Star,
  CheckCircle,
  Award,
  Lock,
  Zap,
};

interface TrustBadgesProps {
  items: TrustBadgeItem[];
  className?: string;
  variant?: "grid" | "inline";
  iconColor?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  forceMobileLayout?: boolean;
}

export function TrustBadges({
  items,
  className,
  variant = "grid",
  iconColor = "text-orange-500",
  textColor = "text-white",
  bgColor = "bg-midnight-light/50",
  borderColor = "border-slate-700/50",
  forceMobileLayout = false,
}: TrustBadgesProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-6", className)}>
        {items.map((badge, index) => {
          const Icon = iconMap[badge.icon] || Shield;
          return (
            <div key={`inline-badge-${index}`} className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", iconColor)} />
              <span className={cn("text-sm font-medium", textColor)}>{badge.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Helper to check if a color is a hex color
  const isHexColor = (color: string) => color.startsWith("#");

  // Get style object for hex colors
  const getColorStyle = (color: string, property: string) => {
    if (isHexColor(color)) {
      return { [property]: color };
    }
    return {};
  };

  return (
    <div className={cn(
      "grid gap-3",
      forceMobileLayout
        ? "grid-cols-2"
        : "grid-cols-2 sm:gap-4 sm:grid-cols-4",
      className
    )}>
      {items.map((badge, index) => {
        const Icon = iconMap[badge.icon] || Shield;
        return (
          <div
            key={`badge-${index}`}
            className={cn(
              "flex flex-col items-center rounded-xl border justify-center",
              forceMobileLayout
                ? "gap-1.5 p-3 min-h-20"
                : "gap-1.5 sm:gap-2 p-3 sm:p-4 min-h-20 sm:min-h-0",
              // Only use Tailwind classes if NOT hex colors
              !isHexColor(bgColor) && bgColor,
              !isHexColor(borderColor) && borderColor,
              // Add backdrop blur only for tailwind bg classes (semi-transparent)
              !isHexColor(bgColor) && "backdrop-blur"
            )}
            style={{
              // For hex colors, apply inline styles
              ...(isHexColor(bgColor) ? { backgroundColor: bgColor } : {}),
              ...(isHexColor(borderColor) ? { borderColor: borderColor } : {}),
            }}
          >
            <Icon
              className={cn(
                forceMobileLayout ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6",
                !isHexColor(iconColor) && iconColor
              )}
              style={getColorStyle(iconColor, "color")}
            />
            <span
              className={cn(
                "font-medium text-center leading-tight",
                forceMobileLayout ? "text-xs" : "text-xs sm:text-sm",
                !isHexColor(textColor) && textColor
              )}
              style={getColorStyle(textColor, "color")}
            >
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
