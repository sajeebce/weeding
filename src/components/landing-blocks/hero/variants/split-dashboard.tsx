"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  AnimatedWords,
  DashboardVisual,
} from "@/components/landing-blocks/shared";

interface HeroSplitDashboardProps {
  settings: HeroSettings;
}

const featureIcons = {
  checkCircle: CheckCircle,
  check: Check,
  star: Star,
  arrow: ChevronRight,
};

export function HeroSplitDashboard({ settings }: HeroSplitDashboardProps) {
  const FeatureIcon = featureIcons[settings.features.icon] || CheckCircle;

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

  return (
    <HeroBackground settings={settings.background}>
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {/* Main Split Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content Section */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            {settings.badge.enabled && (
              <Badge className="mb-6 w-fit border-orange-500/50 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/30">
                {settings.badge.emoji && `${settings.badge.emoji} `}
                {settings.badge.text}
              </Badge>
            )}

            {/* Headline with Animated Words */}
            <h1
              className={cn(
                "font-bold tracking-tight text-white",
                getHeadlineSize()
              )}
            >
              {settings.headline.text}
              {settings.headline.animatedWords?.enabled && (
                <>
                  {" "}
                  <AnimatedWords
                    settings={settings.headline.animatedWords}
                    className="inline-block"
                  />
                </>
              )}
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
            {settings.features.enabled && settings.features.items.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {settings.features.items.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-slate-400"
                  >
                    <FeatureIcon className="h-5 w-5 shrink-0 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
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

            {/* Avatar Stack + Rating */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {/* Avatar Stack */}
              {settings.avatarStack?.enabled && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {["PS", "AK", "VR", "MJ"].map((initials, i) => (
                      <Avatar
                        key={i}
                        className="h-10 w-10 border-2 border-midnight ring-2 ring-midnight"
                      >
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-xs text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <Avatar className="h-10 w-10 border-2 border-midnight ring-2 ring-midnight">
                      <AvatarFallback className="bg-slate-700 text-xs text-slate-300">
                        +
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-sm text-slate-400">
                    {settings.avatarStack.countText}
                  </span>
                </div>
              )}

              {/* Star Rating */}
              {settings.trustText.enabled && (
                <div className="flex items-center gap-2">
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
                  <span className="text-sm text-slate-400">
                    {settings.trustText.rating}/5
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard Visual Section */}
          <div className="relative flex items-center justify-center">
            {settings.visual?.dashboardPreset && (
              <DashboardVisual
                settings={settings.visual.dashboardPreset}
                className="w-full max-w-lg"
              />
            )}
          </div>
        </div>

        {/* Logo Bar (Marquee) */}
        {settings.logoBar?.enabled && (
          <div className="mt-16 border-t border-slate-700/50 pt-8">
            <p className="mb-6 text-center text-sm text-slate-500">
              Trusted by leading companies
            </p>
            <div
              className={cn(
                "flex items-center justify-center gap-12",
                settings.logoBar.grayscale && "grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
              )}
            >
              {/* Placeholder logos - will be replaced with actual logo bar component */}
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-8 w-8 rounded bg-slate-700" />
                <span className="text-sm font-medium">Company A</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-8 w-8 rounded bg-slate-700" />
                <span className="text-sm font-medium">Company B</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-8 w-8 rounded bg-slate-700" />
                <span className="text-sm font-medium">Company C</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-8 w-8 rounded bg-slate-700" />
                <span className="text-sm font-medium">Company D</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </HeroBackground>
  );
}
