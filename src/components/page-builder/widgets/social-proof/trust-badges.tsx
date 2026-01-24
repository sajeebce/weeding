"use client";

import * as LucideIcons from "lucide-react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrustBadgesWidgetSettings } from "@/lib/page-builder/types";

interface TrustBadgesWidgetProps {
  settings: TrustBadgesWidgetSettings;
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
  return icons[name] || Shield;
}

export function TrustBadgesWidget({ settings, isPreview = false }: TrustBadgesWidgetProps) {
  const { badges, layout, columns, style, centered } = settings;

  // Get grid columns class
  const getColumnsClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 sm:grid-cols-3";
      case 4:
        return "grid-cols-2 sm:grid-cols-4";
      case 5:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      default:
        return "grid-cols-2 sm:grid-cols-4";
    }
  };

  if (badges.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
        <span className="text-sm text-slate-500">No badges configured</span>
      </div>
    );
  }

  if (layout === "horizontal") {
    return (
      <div
        className={cn(
          "flex flex-wrap gap-3",
          centered && "justify-center"
        )}
      >
        {badges.map((badge) => {
          const Icon = getLucideIcon(badge.icon);
          return (
            <div
              key={badge.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: style.backgroundColor,
                borderColor: style.borderColor,
                borderRadius: `${style.borderRadius}px`,
              }}
            >
              <Icon
                className="h-4 w-4 shrink-0"
                style={{ color: style.iconColor }}
              />
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: style.textColor }}
              >
                {badge.text}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Grid layout - Card style
  return (
    <div
      className={cn(
        "grid gap-4",
        getColumnsClass(),
        centered && "mx-auto max-w-4xl"
      )}
    >
      {badges.map((badge) => {
        const Icon = getLucideIcon(badge.icon);
        return (
          <div
            key={badge.id}
            className="flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border text-center backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              borderRadius: `${style.borderRadius}px`,
            }}
          >
            <Icon
              className="h-6 w-6 shrink-0"
              style={{ color: style.iconColor }}
            />
            <span
              className="text-sm font-medium text-center"
              style={{ color: style.textColor }}
            >
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
