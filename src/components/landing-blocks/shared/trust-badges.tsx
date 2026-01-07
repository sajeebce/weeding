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
}

export function TrustBadges({
  items,
  className,
  variant = "grid",
  iconColor = "text-orange-500",
  textColor = "text-white",
  bgColor = "bg-midnight-light/50",
  borderColor = "border-slate-700/50",
}: TrustBadgesProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-6", className)}>
        {items.map((badge) => {
          const Icon = iconMap[badge.icon] || Shield;
          return (
            <div key={badge.text} className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", iconColor)} />
              <span className={cn("text-sm font-medium", textColor)}>{badge.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-4", className)}>
      {items.map((badge) => {
        const Icon = iconMap[badge.icon] || Shield;
        return (
          <div
            key={badge.text}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 backdrop-blur",
              bgColor,
              borderColor
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
            <span className={cn("text-sm font-medium text-center", textColor)}>
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
