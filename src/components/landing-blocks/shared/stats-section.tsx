"use client";

import { cn } from "@/lib/utils";
import type { StatItem } from "@/lib/landing-blocks/types";

interface StatsSectionProps {
  items: StatItem[];
  className?: string;
  valueColor?: string;
  labelColor?: string;
  dividerColor?: string;
}

export function StatsSection({
  items,
  className,
  valueColor = "text-orange-500",
  labelColor = "text-slate-400",
  dividerColor = "border-slate-700/50",
}: StatsSectionProps) {
  return (
    <div className={cn("border-t pt-12", dividerColor, className)}>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {items.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={cn("text-3xl font-bold sm:text-4xl", valueColor)}>
              {stat.prefix}
              {stat.value}
              {stat.suffix}
            </p>
            <p className={cn("mt-1 text-sm", labelColor)}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
