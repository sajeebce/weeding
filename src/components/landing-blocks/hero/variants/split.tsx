"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSettings, FeatureItem } from "@/lib/landing-blocks/types";
import {
  HeroBackground,
  TrustBadges,
  StatsSection,
} from "@/components/landing-blocks/shared";

interface HeroSplitProps {
  settings: HeroSettings;
}

// Get Lucide icon component by name
function getLucideIcon(name: string): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>;
  return icons[name] || CheckCircle;
}

// Helper to normalize feature items (handles both old string[] and new FeatureItem[] formats)
function normalizeFeatureItems(items: unknown): FeatureItem[] {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    if (typeof item === 'string') {
      return { id: `feat_${index}`, text: item, icon: 'CheckCircle' };
    }
    return item as FeatureItem;
  });
}

export function HeroSplit({ settings }: HeroSplitProps) {
  const isVisualLeft = settings.visual?.position === "left";
  // Normalize features for backward compatibility
  const normalizedFeatures = normalizeFeatureItems(settings.features.items);

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
        return "text-3xl sm:text-4xl";
      case "2xl":
        return "text-4xl sm:text-5xl lg:text-6xl";
      default: // xl
        return "text-3xl sm:text-4xl lg:text-5xl";
    }
  };

  const contentSection = (
    <div className="flex flex-col justify-center">
      {/* Badge */}
      {settings.badge.enabled && (
        <Badge className="mb-6 w-fit border-orange-500/50 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/30">
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
          "mt-4 text-slate-400",
          settings.subheadline.size === "sm" && "text-base",
          settings.subheadline.size === "base" && "text-lg",
          settings.subheadline.size === "lg" && "text-lg"
        )}
      >
        {settings.subheadline.text}
      </p>

      {/* Features List */}
      {settings.features.enabled && normalizedFeatures.length > 0 && (
        <div
          className={cn(
            "mt-6",
            (settings.features.layout ?? "list") === "list"
              ? "flex flex-col gap-3"
              : cn(
                  "grid gap-3",
                  (settings.features.columns ?? 1) === 1 && "grid-cols-1",
                  (settings.features.columns ?? 1) === 2 && "grid-cols-2",
                  (settings.features.columns ?? 1) === 3 && "grid-cols-3",
                  (settings.features.columns ?? 1) === 4 && "grid-cols-4"
                )
          )}
        >
          {normalizedFeatures.map((feature) => {
            const Icon = getLucideIcon(feature.icon);
            return (
              <div
                key={feature.id}
                className={cn(
                  "flex items-center gap-3 text-slate-400",
                  (settings.features.iconPosition ?? "left") === "right" && "flex-row-reverse"
                )}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  style={{ color: settings.features.iconColor ?? "#22c55e" }}
                />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button
          size="lg"
          className={cn(
            "group",
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
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>

        {settings.secondaryCTA.enabled && (
          <Button
            variant="outline"
            size="lg"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
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
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
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
  );

  const visualSection = (
    <div className="relative flex items-center justify-center">
      {settings.visual?.url && (
        <div className="relative">
          <Image
            src={settings.visual.url}
            alt={settings.visual.alt || "Hero visual"}
            width={600}
            height={500}
            className="w-full max-w-lg rounded-xl"
            priority
          />
        </div>
      )}
    </div>
  );

  return (
    <HeroBackground settings={settings.background}>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Main Split Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {isVisualLeft ? (
            <>
              {visualSection}
              {contentSection}
            </>
          ) : (
            <>
              {contentSection}
              {visualSection}
            </>
          )}
        </div>

        {/* Trust Badges */}
        {settings.trustBadges.enabled && settings.trustBadges.items.length > 0 && (
          <div className="mt-16">
            <TrustBadges items={settings.trustBadges.items} variant="inline" />
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
