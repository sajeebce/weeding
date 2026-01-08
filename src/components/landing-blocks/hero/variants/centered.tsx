"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { getGradientCSS, getPreviewHoverClass } from "@/components/admin/button-style-editor";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";

interface HeroCenteredProps {
  settings: HeroSettings;
  isPreview?: boolean;
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

// Check if custom style is defined (has any meaningful style properties)
function hasCustomStyle(style?: ButtonCustomStyle): boolean {
  if (!style) return false;
  return !!(
    style.bgColor ||
    style.useGradient ||
    style.textColor ||
    style.borderWidth ||
    style.borderRadius !== undefined ||
    style.hoverEffect
  );
}

// Get button icon component from style
function getButtonIcon(style?: ButtonCustomStyle): React.ReactNode {
  if (!style) return null;

  // Custom SVG icon
  if (style.customIconSvg?.trim()) {
    return (
      <span
        className="inline-flex items-center justify-center w-4 h-4 [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: style.customIconSvg }}
      />
    );
  }

  // Lucide icon
  if (style.icon) {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    // Convert kebab-case to PascalCase
    const pascalName = style.icon.split('-').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    const IconComponent = icons[pascalName] || icons[style.icon];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
  }

  return null;
}

// Check if effect needs special rendering
function isComplexHoverEffect(effect?: string): boolean {
  return effect === "slide-fill" || effect === "border-fill" || effect === "gradient-shift" || effect === "ripple";
}

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
        <Link href={href}>
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
        </Link>
      </Button>
    );
  }

  // Get icon from style
  const buttonIcon = getButtonIcon(style);
  const hasIcon = buttonIcon !== null;
  const iconPosition = style?.iconPosition || "right";

  // Special component for craft-expand effect
  if (style?.hoverEffect === "craft-expand") {
    const craftIcon = hasIcon ? buttonIcon : <ArrowUpRight className="size-3 stroke-2 transition-transform duration-500" />;
    return (
      <Link href={href} className={cn("w-full sm:w-auto", className)}>
        <CraftButton
          bgColor={style.bgColor || "#18181b"}
          textColor={style.textColor || "#ffffff"}
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
      </Link>
    );
  }

  // Special component for flow-border effect
  if (style?.hoverEffect === "flow-border") {
    return (
      <Link href={href} className={cn("group/cta w-full sm:w-auto", className)}>
        <PrimaryFlowButton
          className={cn("text-base", isPreview && "pointer-events-none [&]:hover:after:transform-none")}
          style={{
            '--tw-ring-color': `${style.bgColor || '#F97316'}99`,
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
      </Link>
    );
  }

  // Special component for neural effect
  if (style?.hoverEffect === "neural") {
    return (
      <Link href={href} className={cn("group/cta w-full sm:w-auto", className)}>
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
      </Link>
    );
  }

  // Custom styled button with complex hover effects
  const getNormalBackground = () => {
    if (style?.useGradient && style?.gradientFrom && style?.gradientTo) {
      return `linear-gradient(${getGradientCSS(style.gradientDirection)}, ${style.gradientFrom}, ${style.gradientTo})`;
    }
    return style?.bgColor || "#F97316";
  };

  const getHoverBackground = () => {
    if (style?.hoverBgColor) return style.hoverBgColor;
    return getNormalBackground();
  };

  // For gradient-shift effect
  const getGradientShiftBackground = () => {
    const fromColor = style?.bgColor || "#F97316";
    const toColor = style?.hoverBgColor || "#C2410C";
    return `linear-gradient(90deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`;
  };

  const hasComplexEffect = isComplexHoverEffect(style?.hoverEffect);

  // Get base styles for complex effects
  const getBaseStylesForEffect = (): React.CSSProperties => {
    if (!hasComplexEffect) return {};

    switch (style?.hoverEffect) {
      case "slide-fill":
        return {
          boxShadow: effectiveHover
            ? `inset 200px 0 0 0 ${style?.hoverBgColor || "#EA580C"}`
            : `inset 0 0 0 0 ${style?.hoverBgColor || "#EA580C"}`,
        };
      case "border-fill":
        return {
          boxShadow: effectiveHover
            ? `inset 0 0 0 50px ${style?.hoverBgColor || "#EA580C"}`
            : `inset 0 0 0 0 ${style?.hoverBgColor || "#EA580C"}`,
        };
      case "gradient-shift":
        return {
          backgroundSize: "200% 100%",
          backgroundPosition: effectiveHover ? "100% 0" : "0% 0",
        };
      case "ripple":
        return {
          boxShadow: effectiveHover
            ? `0 0 0 8px ${(style?.bgColor || "#F97316")}30, 0 0 20px ${(style?.bgColor || "#F97316")}20`
            : `0 0 0 0 ${(style?.bgColor || "#F97316")}30`,
        };
      default:
        return {};
    }
  };

  // Determine final background based on effect type
  const getFinalBackground = () => {
    if (style?.hoverEffect === "gradient-shift") {
      return getGradientShiftBackground();
    }
    if (style?.hoverEffect === "slide-fill" || style?.hoverEffect === "border-fill") {
      return getNormalBackground();
    }
    return effectiveHover ? getHoverBackground() : getNormalBackground();
  };

  const effectStyles = getBaseStylesForEffect();

  return (
    <Link
      href={href}
      className={cn(
        "group/cta inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium overflow-hidden w-full sm:w-auto",
        !isPreview && "transition-all duration-300",
        !isPreview && getPreviewHoverClass(style?.hoverEffect),
        className
      )}
      style={{
        background: getFinalBackground(),
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
    </Link>
  );
}

export function HeroCentered({ settings, isPreview = false }: HeroCenteredProps) {
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
            />

            {settings.secondaryCTA.enabled && (
              <StyledCTAButton
                href={settings.secondaryCTA.link}
                text={settings.secondaryCTA.text}
                style={settings.secondaryCTA.style}
                showArrow={false}
                variant={settings.secondaryCTA.variant || "outline"}
                isPreview={isPreview}
              />
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
