"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { StatItem } from "@/lib/landing-blocks/types";

interface StatsSectionProps {
  items: StatItem[];
  className?: string;
  valueColor?: string;
  labelColor?: string;
  dividerColor?: string;
  forceMobileLayout?: boolean;
  animateCount?: boolean;
}

// Parse a numeric value from strings like "10,000+", "50+", "4.9/5", "24h"
function parseNumericValue(value: string): { number: number; isDecimal: boolean; suffix: string } {
  // Remove commas and extract the numeric part
  const cleanValue = value.replace(/,/g, "");

  // Match number (including decimals) and capture everything after
  const match = cleanValue.match(/^([\d.]+)(.*)$/);

  if (match) {
    const num = parseFloat(match[1]);
    const isDecimal = match[1].includes(".");
    const suffix = match[2] || "";
    return { number: num, isDecimal, suffix };
  }

  return { number: 0, isDecimal: false, suffix: value };
}

// Format number back to display format
function formatNumber(num: number, isDecimal: boolean, originalValue: string): string {
  // Check if original had commas
  const hasCommas = originalValue.includes(",");

  if (isDecimal) {
    // Preserve decimal places from original
    const decimalPlaces = (originalValue.match(/\.(\d+)/) || [, ""])[1].length;
    const formatted = num.toFixed(decimalPlaces);
    return hasCommas ? Number(formatted).toLocaleString("en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }) : formatted;
  }

  const rounded = Math.round(num);
  return hasCommas ? rounded.toLocaleString("en-US") : rounded.toString();
}

// Animated stat value component
function AnimatedValue({
  value,
  prefix,
  suffix,
  shouldAnimate,
  duration = 2000
}: {
  value: string;
  prefix?: string;
  suffix?: string;
  shouldAnimate: boolean;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(shouldAnimate ? "0" : value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasAnimated.current) {
      setDisplayValue(value);
      return;
    }

    const parsed = parseNumericValue(value);

    if (parsed.number === 0) {
      setDisplayValue(value);
      return;
    }

    hasAnimated.current = true;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = parsed.number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (endValue - startValue) * easeOut;
      const formatted = formatNumber(currentValue, parsed.isDecimal, value);

      setDisplayValue(formatted + parsed.suffix);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, shouldAnimate, duration]);

  return (
    <>
      {prefix}
      {displayValue}
      {suffix}
    </>
  );
}

export function StatsSection({
  items,
  className,
  valueColor = "text-orange-500",
  labelColor = "text-slate-400",
  dividerColor = "border-slate-700/50",
  forceMobileLayout = false,
  animateCount = true,
}: StatsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Helper to check if a color is a hex color
  const isHexColor = (color: string) => color.startsWith("#");

  // Get style object for hex colors
  const getColorStyle = (color: string) => {
    if (isHexColor(color)) {
      return { color };
    }
    return {};
  };

  const getBorderStyle = (color: string) => {
    if (isHexColor(color)) {
      return { borderColor: color };
    }
    return {};
  };

  // Intersection observer to trigger animation when visible
  useEffect(() => {
    if (!animateCount) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [animateCount]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "border-t",
        forceMobileLayout ? "pt-8" : "pt-8 md:pt-12",
        !isHexColor(dividerColor) && dividerColor,
        className
      )}
      style={getBorderStyle(dividerColor)}
    >
      <div className={cn(
        "grid grid-cols-2",
        forceMobileLayout ? "gap-4" : "gap-4 md:gap-8 md:grid-cols-4"
      )}>
        {items.map((stat, index) => (
          <div key={`stat-${index}`} className="text-center">
            <p
              className={cn(
                "font-bold",
                forceMobileLayout ? "text-xl" : "text-xl sm:text-2xl md:text-4xl",
                !isHexColor(valueColor) && valueColor
              )}
              style={getColorStyle(valueColor)}
            >
              <AnimatedValue
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                shouldAnimate={animateCount && isVisible}
              />
            </p>
            <p
              className={cn(
                "mt-1",
                forceMobileLayout ? "text-xs" : "text-xs sm:text-sm",
                !isHexColor(labelColor) && labelColor
              )}
              style={getColorStyle(labelColor)}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
