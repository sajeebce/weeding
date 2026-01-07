"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSettings } from "@/lib/landing-blocks/types";
import { HeroBackground } from "@/components/landing-blocks/shared";

interface HeroMinimalProps {
  settings: HeroSettings;
}

export function HeroMinimal({ settings }: HeroMinimalProps) {
  // Parse headline with highlight
  const renderHeadline = () => {
    if (!settings.headline.highlightWord) {
      return settings.headline.text;
    }

    const parts = settings.headline.text.split(settings.headline.highlightWord);
    if (parts.length === 1) {
      return settings.headline.text;
    }

    return (
      <>
        {parts[0]}
        <span className="text-orange-500">{settings.headline.highlightWord}</span>
        {parts[1]}
      </>
    );
  };

  const getHeadlineSize = () => {
    switch (settings.headline.size) {
      case "lg":
        return "text-3xl sm:text-4xl lg:text-5xl";
      case "2xl":
        return "text-5xl sm:text-6xl lg:text-7xl";
      default: // xl
        return "text-4xl sm:text-5xl lg:text-6xl";
    }
  };

  // Determine text colors based on background
  const isDarkBg = settings.background.type === "solid" &&
    (settings.background.color?.startsWith("#0") ||
     settings.background.color?.startsWith("#1") ||
     settings.background.color?.startsWith("#2"));

  const textColor = isDarkBg ? "text-white" : "text-slate-900";
  const subTextColor = isDarkBg ? "text-slate-400" : "text-slate-600";

  return (
    <HeroBackground settings={settings.background}>
      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1
            className={cn(
              "font-bold tracking-tight",
              textColor,
              getHeadlineSize()
            )}
          >
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "mt-6 text-xl",
              subTextColor
            )}
          >
            {settings.subheadline.text}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className={cn(
                "group",
                settings.primaryCTA.variant === "solid" &&
                  "bg-orange-500 text-white hover:bg-orange-600",
                settings.primaryCTA.variant === "outline" && isDarkBg &&
                  "border-white/20 bg-transparent text-white hover:bg-white/10",
                settings.primaryCTA.variant === "outline" && !isDarkBg &&
                  "border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100",
                settings.primaryCTA.variant === "secondary" &&
                  "bg-slate-900 text-white hover:bg-slate-800"
              )}
              asChild
            >
              <Link href={settings.primaryCTA.link}>
                {settings.primaryCTA.text}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            {settings.secondaryCTA.enabled && (
              <Button
                variant="ghost"
                size="lg"
                className={cn(
                  isDarkBg
                    ? "text-white hover:bg-white/10"
                    : "text-slate-900 hover:bg-slate-100"
                )}
                asChild
              >
                <Link href={settings.secondaryCTA.link}>
                  {settings.secondaryCTA.text}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </HeroBackground>
  );
}
