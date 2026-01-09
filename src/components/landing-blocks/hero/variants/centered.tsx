"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
  Star,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSettings, FeatureItem, ButtonCustomStyle } from "@/lib/landing-blocks/types";
import {
  HeroBackground,
  TrustBadges,
  StatsSection,
} from "@/components/landing-blocks/shared";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";

// Shared button utilities
import {
  getGradientCSS,
  getHoverEffectClass,
  isComplexHoverEffect,
  getComplexEffectStyles,
  getFinalBackground,
  hasCustomStyle,
} from "@/lib/button-utils";
import { renderButtonIcon } from "@/lib/button-icon-utils";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";

interface HeroCenteredProps {
  settings: HeroSettings;
  isPreview?: boolean;
  device?: "desktop" | "mobile";
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

// hasCustomStyle, isComplexHoverEffect are now imported from @/lib/button-utils
// renderButtonIcon is now imported from @/lib/button-icon-utils

// Styled CTA Button Component
interface StyledCTAButtonProps {
  href: string;
  text: string;
  style?: ButtonCustomStyle;
  showPrice?: boolean;
  priceText?: string;
  showArrow?: boolean;
  variant?: "solid" | "outline" | "secondary" | "ghost";
  className?: string;
  isPreview?: boolean;
  openInNewTab?: boolean;
}

function StyledCTAButton({
  href,
  text,
  style,
  showPrice,
  priceText,
  showArrow = true,
  variant = "solid",
  className,
  isPreview = false,
  openInNewTab = false,
}: StyledCTAButtonProps) {
  // Disable hover state in preview mode
  const [isHovered, setIsHovered] = useState(false);
  const effectiveHover = isPreview ? false : isHovered;

  // If no custom style, use default Button component
  if (!hasCustomStyle(style)) {
    return (
      <Button
        size="lg"
        className={cn(
          "group/cta w-full sm:w-auto",
          variant === "solid" && "bg-orange-500 text-white",
          variant === "solid" && !isPreview && "hover:bg-orange-600",
          variant === "outline" && "border-white/20 bg-transparent text-white",
          variant === "outline" && !isPreview && "hover:bg-white/10",
          variant === "secondary" && "bg-white text-slate-900",
          variant === "secondary" && !isPreview && "hover:bg-slate-100",
          className
        )}
        asChild
      >
        <SmartLink href={href} openInNewTab={openInNewTab}>
          {text}
          {showPrice && priceText && (
            <span className="ml-2 text-sm opacity-80">{priceText}</span>
          )}
          {showArrow && (
            <ArrowRight className={cn(
              "ml-2 h-4 w-4",
              !isPreview && "transition-transform group-hover/cta:translate-x-1"
            )} />
          )}
        </SmartLink>
      </Button>
    );
  }

  // Get icon from style using shared utility
  const buttonIcon = renderButtonIcon(style);
  const hasIcon = buttonIcon !== null;
  const iconPosition = style?.iconPosition || "right";

  // Special component for craft-expand effect
  if (style?.hoverEffect === "craft-expand") {
    const craftIcon = hasIcon ? buttonIcon : <ArrowUpRight className="size-3 stroke-2 transition-transform duration-500" />;
    return (
      <SmartLink href={href} openInNewTab={openInNewTab} className={cn("w-full sm:w-auto", className)}>
        <CraftButton
          bgColor={style.bgColor || CRAFT_BG_DARK}
          textColor={style.textColor || WHITE}
          size="default"
          disabled={isPreview}
        >
          <CraftButtonLabel>
            {text}
            {showPrice && priceText && (
              <span className="text-sm opacity-80 ml-2">{priceText}</span>
            )}
          </CraftButtonLabel>
          <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
        </CraftButton>
      </SmartLink>
    );
  }

  // Special component for flow-border effect
  if (style?.hoverEffect === "flow-border") {
    return (
      <SmartLink href={href} openInNewTab={openInNewTab} className={cn("group/cta w-full sm:w-auto", className)}>
        <PrimaryFlowButton
          className={cn("text-base", isPreview && "pointer-events-none [&]:hover:after:transform-none")}
          style={{
            '--tw-ring-color': `${style.bgColor || ORANGE_PRIMARY}99`,
          } as React.CSSProperties}
          disabled={isPreview}
        >
          {hasIcon && iconPosition === "left" && buttonIcon}
          {text}
          {showPrice && priceText && (
            <span className="text-sm opacity-80 ml-2">{priceText}</span>
          )}
          {hasIcon && iconPosition !== "left" && buttonIcon}
          {!hasIcon && showArrow && (
            <ArrowRight className={cn(
              "h-4 w-4 ml-2",
              !isPreview && "transition-transform group-hover/cta:translate-x-1"
            )} />
          )}
        </PrimaryFlowButton>
      </SmartLink>
    );
  }

  // Special component for neural effect
  if (style?.hoverEffect === "neural") {
    return (
      <SmartLink href={href} openInNewTab={openInNewTab} className={cn("group/cta w-full sm:w-auto", className)}>
        <NeuralButton size="default" disabled={isPreview}>
          {hasIcon && iconPosition === "left" && buttonIcon}
          {text}
          {showPrice && priceText && (
            <span className="text-sm opacity-80 ml-2">{priceText}</span>
          )}
          {hasIcon && iconPosition !== "left" && buttonIcon}
          {!hasIcon && showArrow && (
            <ArrowRight className={cn(
              "h-4 w-4 ml-2",
              !isPreview && "transition-transform group-hover/cta:translate-x-1"
            )} />
          )}
        </NeuralButton>
      </SmartLink>
    );
  }

  // Custom styled button with complex hover effects - using shared utilities
  const hasComplexEffect = isComplexHoverEffect(style?.hoverEffect);
  const effectStyles = getComplexEffectStyles(style, effectiveHover);

  return (
    <SmartLink
      href={href}
      openInNewTab={openInNewTab}
      className={cn(
        "group/cta inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium overflow-hidden w-full sm:w-auto",
        !isPreview && "transition-all duration-300",
        !isPreview && getHoverEffectClass(style?.hoverEffect),
        className
      )}
      style={{
        background: getFinalBackground(style, effectiveHover),
        color: effectiveHover && style?.hoverTextColor ? style.hoverTextColor : (style?.textColor || "#ffffff"),
        borderWidth: `${style?.borderWidth ?? 0}px`,
        borderStyle: "solid",
        borderColor: effectiveHover && style?.hoverBorderColor ? style.hoverBorderColor : (style?.borderColor || "transparent"),
        borderRadius: `${style?.borderRadius ?? 6}px`,
        // Apply effect-specific styles
        ...effectStyles,
        // Override with custom shadow only if no complex effect is active
        ...((!hasComplexEffect && style?.shadow) ? { boxShadow: effectiveHover && style?.hoverShadow ? style.hoverShadow : style.shadow } : {}),
      }}
      onMouseEnter={isPreview ? undefined : () => setIsHovered(true)}
      onMouseLeave={isPreview ? undefined : () => setIsHovered(false)}
    >
      {hasIcon && iconPosition === "left" && buttonIcon}
      {text}
      {showPrice && priceText && (
        <span className="text-sm opacity-80">{priceText}</span>
      )}
      {hasIcon && iconPosition !== "left" && buttonIcon}
      {!hasIcon && showArrow && (
        <ArrowRight className={cn(
          "h-4 w-4",
          !isPreview && "transition-transform group-hover/cta:translate-x-1"
        )} />
      )}
    </SmartLink>
  );
}

export function HeroCentered({ settings, isPreview = false, device }: HeroCenteredProps) {
  const forceMobileLayout = device === "mobile";
  // Normalize features for backward compatibility
  const normalizedFeatures = normalizeFeatureItems(settings.features.items);

  // Helper to check if a color is a hex color
  const isHexColor = (color: string) => color?.startsWith("#");

  // Parse headline with highlight (supports multiple comma-separated words)
  const renderHeadline = () => {
    if (!settings.headline.highlightWord) {
      return settings.headline.text;
    }

    const highlightColor = settings.headline.highlightColor || "#f97316";

    // Split highlight words by comma and trim whitespace
    const highlightWords = settings.headline.highlightWord
      .split(",")
      .map((word) => word.trim())
      .filter(Boolean);

    if (highlightWords.length === 0) {
      return settings.headline.text;
    }

    // Create a regex pattern that matches any of the highlight words
    const pattern = new RegExp(`(${highlightWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
    const parts = settings.headline.text.split(pattern);

    return (
      <>
        {parts.map((part, index) => {
          // Check if this part is one of the highlight words
          const isHighlight = highlightWords.some(
            (word) => word.toLowerCase() === part.toLowerCase()
          );

          if (isHighlight) {
            return (
              <span
                key={index}
                className={!isHexColor(highlightColor) ? highlightColor : undefined}
                style={isHexColor(highlightColor) ? { color: highlightColor } : undefined}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
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
            <Badge
              className={cn(
                "mb-6 font-medium",
                forceMobileLayout
                  ? "px-3 py-1.5 text-xs max-w-[90%] text-center leading-tight"
                  : "px-4 py-2 text-sm"
              )}
              style={{
                backgroundColor: settings.badge.bgColor || "#f9731933",
                color: settings.badge.textColor || "#fb923c",
                borderColor: settings.badge.borderColor || "#f9731980",
              }}
            >
              {settings.badge.emoji && `${settings.badge.emoji} `}
              {settings.badge.text}
            </Badge>
          )}

          {/* Headline */}
          <h1
            className={cn(
              "font-bold tracking-tight",
              getHeadlineSize(),
              !isHexColor(settings.headline.color || "#ffffff") && (settings.headline.color || "text-white")
            )}
            style={isHexColor(settings.headline.color || "#ffffff") ? { color: settings.headline.color } : undefined}
          >
            {renderHeadline()}
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "mt-6",
              settings.subheadline.size === "sm" && "text-base",
              settings.subheadline.size === "base" && "text-lg",
              settings.subheadline.size === "lg" && "text-lg sm:text-xl",
              !isHexColor(settings.subheadline.color || "#94a3b8") && (settings.subheadline.color || "text-slate-400")
            )}
            style={isHexColor(settings.subheadline.color || "#94a3b8") ? { color: settings.subheadline.color } : undefined}
          >
            {settings.subheadline.text}
          </p>

          {/* Features List */}
          {settings.features.enabled && normalizedFeatures.length > 0 && (
            <div
              className={cn(
                "mt-8",
                (settings.features.layout ?? "list") === "list"
                  ? "flex flex-wrap items-center justify-center gap-4"
                  : cn(
                      "grid gap-4",
                      (settings.features.columns ?? 3) === 1 && "grid-cols-1 mx-auto w-fit",
                      (settings.features.columns ?? 3) === 2 && "grid-cols-1 sm:grid-cols-2",
                      (settings.features.columns ?? 3) === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                      (settings.features.columns ?? 3) === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    )
              )}
            >
              {normalizedFeatures.map((feature) => {
                const Icon = getLucideIcon(feature.icon);
                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "flex items-center gap-2 text-sm text-slate-400",
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
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <StyledCTAButton
              href={settings.primaryCTA.link}
              text={settings.primaryCTA.text}
              style={settings.primaryCTA.style}
              showPrice={settings.primaryCTA.showPrice}
              priceText={settings.primaryCTA.priceText}
              showArrow={true}
              variant={settings.primaryCTA.variant}
              isPreview={isPreview}
              openInNewTab={settings.primaryCTA.openInNewTab}
            />

            {settings.secondaryCTA.enabled && (
              <StyledCTAButton
                href={settings.secondaryCTA.link}
                text={settings.secondaryCTA.text}
                style={settings.secondaryCTA.style}
                showArrow={false}
                variant={settings.secondaryCTA.variant || "outline"}
                isPreview={isPreview}
                openInNewTab={settings.secondaryCTA.openInNewTab}
              />
            )}
          </div>

          {/* Trust Text / Rating */}
          {settings.trustText.enabled && (
            <div
              className="mt-8 flex items-center justify-center gap-2 text-sm"
              style={{ color: settings.trustText.textColor || "#9ca3af" }}
            >
              {settings.trustText.showRating && (
                <div className="flex">
                  {[...Array(5)].map((_, i) => {
                    const starColor = settings.trustText.starColor || "#facc15";
                    const isFilled = i < Math.floor(settings.trustText.rating);
                    return (
                      <Star
                        key={i}
                        className="h-4 w-4"
                        style={{
                          fill: isFilled ? starColor : "#475569",
                          color: isFilled ? starColor : "#475569",
                        }}
                      />
                    );
                  })}
                </div>
              )}
              <span>{settings.trustText.text}</span>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        {settings.trustBadges.enabled && settings.trustBadges.items.length > 0 && (
          <div className={forceMobileLayout ? "mt-10" : "mt-10 md:mt-16"}>
            <div className="mx-auto max-w-3xl">
              <TrustBadges
                items={settings.trustBadges.items}
                forceMobileLayout={forceMobileLayout}
                iconColor={settings.trustBadges.iconColor}
                textColor={settings.trustBadges.textColor}
                bgColor={settings.trustBadges.bgColor}
                borderColor={settings.trustBadges.borderColor}
              />
            </div>
          </div>
        )}

        {/* Stats Section */}
        {settings.stats.enabled && settings.stats.items.length > 0 && (
          <StatsSection
            items={settings.stats.items}
            className={forceMobileLayout ? "mt-10" : "mt-10 md:mt-16"}
            forceMobileLayout={forceMobileLayout}
            valueColor={settings.stats.valueColor}
            labelColor={settings.stats.labelColor}
            dividerColor={settings.stats.dividerColor}
            animateCount={settings.stats.animateCount ?? true}
          />
        )}
      </div>
    </HeroBackground>
  );
}
