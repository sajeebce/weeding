"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StatsSectionWidgetSettings } from "@/lib/page-builder/types";

interface StatsSectionWidgetProps {
  settings: StatsSectionWidgetSettings;
  isPreview?: boolean;
}

// Animated counter hook
function useAnimatedCounter(
  target: number,
  duration: number = 2000,
  shouldAnimate: boolean = true
) {
  const [count, setCount] = useState(shouldAnimate ? 0 : target);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) {
      setCount(target);
      return;
    }

    hasAnimated.current = true;
    const startTime = Date.now();
    const startValue = 0;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [target, duration, shouldAnimate]);

  return count;
}

// Individual stat component with animation
function AnimatedStat({
  value,
  label,
  prefix,
  suffix,
  animate,
  valueColor,
  labelColor,
  valueSize,
}: {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  animate: boolean;
  valueColor: string;
  labelColor: string;
  valueSize: string;
}) {
  // Parse numeric value
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const hasDecimal = value.includes(".");
  const decimalPlaces = hasDecimal ? value.split(".")[1]?.length || 0 : 0;

  const animatedValue = useAnimatedCounter(
    numericValue,
    2000,
    animate
  );

  // Format the displayed value
  const displayValue = animate
    ? hasDecimal
      ? animatedValue.toFixed(decimalPlaces)
      : animatedValue.toLocaleString()
    : value;

  // Get value size class
  const getValueSizeClass = () => {
    switch (valueSize) {
      case "sm":
        return "text-2xl sm:text-3xl";
      case "md":
        return "text-3xl sm:text-4xl";
      case "lg":
        return "text-4xl sm:text-5xl";
      case "xl":
        return "text-5xl sm:text-6xl";
      default:
        return "text-3xl sm:text-4xl";
    }
  };

  return (
    <div className="flex flex-col items-center py-2">
      <span
        className={cn("font-bold tabular-nums leading-tight", getValueSizeClass())}
        style={{ color: valueColor }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </span>
      <span
        className="text-sm mt-2 font-medium uppercase tracking-wide"
        style={{ color: labelColor }}
      >
        {label}
      </span>
    </div>
  );
}

export function StatsSectionWidget({ settings, isPreview = false }: StatsSectionWidgetProps) {
  const { stats, columns, style, centered, animateOnScroll } = settings;
  const [isVisible, setIsVisible] = useState(!animateOnScroll);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for scroll animation
  useEffect(() => {
    if (!animateOnScroll) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animateOnScroll]);

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

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
        <span className="text-sm text-slate-500">No stats configured</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid gap-8 pt-8",
        getColumnsClass(),
        centered && "text-center",
        style.showTopBorder && "border-t"
      )}
      style={{
        borderColor: style.showTopBorder ? (style.topBorderColor || "#334155") : undefined,
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className={cn(
            "relative",
            style.divider &&
              index !== stats.length - 1 &&
              "after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-12 after:w-px after:bg-slate-700 after:hidden sm:after:block"
          )}
        >
          <AnimatedStat
            value={stat.value}
            label={stat.label}
            prefix={stat.prefix}
            suffix={stat.suffix}
            animate={isVisible && stat.animate}
            valueColor={style.valueColor}
            labelColor={style.labelColor}
            valueSize={style.valueSize}
          />
        </div>
      ))}
    </div>
  );
}
