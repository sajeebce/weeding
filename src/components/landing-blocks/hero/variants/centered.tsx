"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Star,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSettings } from "@/lib/landing-blocks/types";
import {
  HeroBackground,
  TrustBadges,
  StatsSection,
} from "@/components/landing-blocks/shared";

interface HeroCenteredProps {
  settings: HeroSettings;
}

const featureIcons = {
  checkCircle: CheckCircle,
  check: Check,
  star: Star,
  arrow: ChevronRight,
};

export function HeroCentered({ settings }: HeroCenteredProps) {
  const FeatureIcon = featureIcons[settings.features.icon] || CheckCircle;

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

  return (
    <HeroBackground settings={settings.background}>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          {settings.badge.enabled && (
            <Badge className="mb-6 border-orange-500/50 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/30">
              {settings.badge.emoji && `${settings.badge.emoji} `}
              {settings.badge.text}
            </Badge>
          )}

          {/* Headline */}
          <h1
            className={cn(
              "font-bold tracking-tight text-white",
              getHeadlineSize()
            )}
          >
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "mt-6 text-slate-400",
              settings.subheadline.size === "sm" && "text-base",
              settings.subheadline.size === "base" && "text-lg",
              settings.subheadline.size === "lg" && "text-lg sm:text-xl"
            )}
          >
            {settings.subheadline.text}
          </p>

          {/* Features List */}
          {settings.features.enabled && settings.features.items.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {settings.features.items.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <FeatureIcon className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className={cn(
                "group w-full sm:w-auto",
                settings.primaryCTA.variant === "solid" &&
                  "bg-orange-500 text-white hover:bg-orange-600",
                settings.primaryCTA.variant === "outline" &&
                  "border-white/20 bg-transparent text-white hover:bg-white/10",
                settings.primaryCTA.variant === "secondary" &&
                  "bg-white text-slate-900 hover:bg-slate-100"
              )}
              asChild
            >
              <Link href={settings.primaryCTA.link}>
                {settings.primaryCTA.text}
                {settings.primaryCTA.showPrice && settings.primaryCTA.priceText && (
                  <span className="ml-2 text-sm opacity-80">
                    {settings.primaryCTA.priceText}
                  </span>
                )}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            {settings.secondaryCTA.enabled && (
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto"
                asChild
              >
                <Link href={settings.secondaryCTA.link}>
                  {settings.secondaryCTA.text}
                </Link>
              </Button>
            )}
          </div>

          {/* Trust Text / Rating */}
          {settings.trustText.enabled && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
              {settings.trustText.showRating && (
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(settings.trustText.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-600 text-slate-600"
                      )}
                    />
                  ))}
                </div>
              )}
              <span>{settings.trustText.text}</span>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        {settings.trustBadges.enabled && settings.trustBadges.items.length > 0 && (
          <div className="mt-16">
            <div className="mx-auto max-w-3xl">
              <TrustBadges items={settings.trustBadges.items} />
            </div>
          </div>
        )}

        {/* Stats Section */}
        {settings.stats.enabled && settings.stats.items.length > 0 && (
          <StatsSection items={settings.stats.items} className="mt-16" />
        )}
      </div>
    </HeroBackground>
  );
}
