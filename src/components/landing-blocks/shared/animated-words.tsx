"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AnimatedWordsSettings } from "@/lib/landing-blocks/types";

interface AnimatedWordsProps {
  settings: AnimatedWordsSettings;
  className?: string;
}

export function AnimatedWords({ settings, className }: AnimatedWordsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { words, animation, style } = settings;

  const nextWord = useCallback(() => {
    if (isPaused) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
      setIsAnimating(false);
    }, animation.transitionDuration);
  }, [words.length, animation.transitionDuration, isPaused]);

  useEffect(() => {
    if (!settings.enabled || words.length <= 1) return;

    const interval = setInterval(nextWord, animation.duration);
    return () => clearInterval(interval);
  }, [settings.enabled, words.length, animation.duration, nextWord]);

  if (!settings.enabled || words.length === 0) {
    return null;
  }

  const getAnimationClass = () => {
    if (!isAnimating) return "";

    switch (animation.type) {
      case "slide-up":
        return "animate-slide-up";
      case "fade":
        return "animate-fade";
      case "typewriter":
        return "animate-typewriter";
      case "flip":
        return "animate-flip";
      default:
        return "";
    }
  };

  const getColorClass = () => {
    switch (style.color) {
      case "primary":
        return "text-orange-500";
      case "accent":
        return "text-amber-400";
      case "gradient":
        return "bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent";
      case "custom":
        return "";
      default:
        return "text-orange-500";
    }
  };

  const currentWord = words[currentIndex];

  return (
    <span
      className={cn(
        "inline-flex items-center",
        className
      )}
      onMouseEnter={() => animation.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span
        className={cn(
          "relative inline-block overflow-hidden",
          getAnimationClass()
        )}
        style={{
          transitionDuration: `${animation.transitionDuration}ms`,
        }}
      >
        <span
          className={cn(
            "inline-block",
            getColorClass(),
            style.background && "rounded-lg bg-orange-500/20 px-3 py-1",
            style.underline && "underline decoration-orange-500 decoration-2 underline-offset-4"
          )}
          style={style.color === "custom" ? { color: style.customColor } : undefined}
        >
          {currentWord}
        </span>
      </span>
    </span>
  );
}

// Add these to your global CSS or tailwind config
// @keyframes slide-up {
//   0% { transform: translateY(0); opacity: 1; }
//   50% { transform: translateY(-100%); opacity: 0; }
//   51% { transform: translateY(100%); }
//   100% { transform: translateY(0); opacity: 1; }
// }
