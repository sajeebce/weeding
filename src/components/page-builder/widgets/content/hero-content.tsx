"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { ArrowRight, ArrowUpRight, Star, CheckCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroContentWidgetSettings } from "@/lib/page-builder/types";

// Button style utilities
import {
  getNormalBackground,
  getHoverBackground,
  getGradientShiftBackground,
  getHoverEffectClass,
  isComplexHoverEffect,
  isCraftButtonEffect,
  isFlowButtonEffect,
  isNeuralButtonEffect,
  getComplexEffectHoverStyles,
  getComplexEffectNormalStyles,
  hasCustomStyle,
} from "@/lib/button-utils";
import { renderButtonIcon } from "@/lib/button-icon-utils";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";

interface HeroContentWidgetProps {
  settings: HeroContentWidgetSettings;
  isPreview?: boolean;
}

// Get Lucide icon component by name
function getLucideIcon(
  name: string
): React.ComponentType<{ className?: string; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  >;
  return icons[name] || CheckCircle;
}

export function HeroContentWidget({ settings, isPreview = false }: HeroContentWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Helper to check if color is hex
  const isHexColor = (color?: string) => color?.startsWith("#");

  // Parse headline with highlight words (supports comma-separated)
  const renderHeadline = () => {
    const { text, highlightWords, highlightColor } = settings.headline;

    if (!highlightWords) {
      return text;
    }

    // Split highlight words by comma and trim
    const words = highlightWords
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    if (words.length === 0) {
      return text;
    }

    // Create regex pattern
    const pattern = new RegExp(
      `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "gi"
    );
    const parts = text.split(pattern);

    return (
      <>
        {parts.map((part, index) => {
          const isHighlight = words.some(
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

  // Get headline size class
  const getHeadlineSize = () => {
    switch (settings.headline.size) {
      case "sm":
        return "text-2xl sm:text-3xl";
      case "md":
        return "text-3xl sm:text-4xl";
      case "lg":
        return "text-3xl sm:text-4xl lg:text-5xl";
      case "xl":
        return "text-4xl sm:text-5xl lg:text-6xl";
      default:
        return "text-3xl sm:text-4xl lg:text-5xl";
    }
  };

  // Get alignment class
  const getAlignmentClass = () => {
    switch (settings.alignment) {
      case "center":
        return "items-center text-center";
      case "right":
        return "items-end text-right";
      default:
        return "items-start text-left";
    }
  };

  // Render primary button with custom styles
  const renderPrimaryButton = () => {
    const btnStyle = settings.primaryButton.style;
    const hasCustom = hasCustomStyle(btnStyle);

    // If custom style with CraftButton effect
    if (hasCustom && btnStyle && isCraftButtonEffect(btnStyle.hoverEffect)) {
      const craftIcon = btnStyle.icon && btnStyle.icon !== "none"
        ? renderButtonIcon(btnStyle, "size-3 stroke-2")
        : <ArrowUpRight className="size-3 stroke-2" />;

      return (
        <CraftButton
          asChild
          bgColor={btnStyle.bgColor || CRAFT_BG_DARK}
          textColor={btnStyle.textColor || WHITE}
          style={{ boxShadow: btnStyle.shadow }}
        >
          <SmartLink
            href={settings.primaryButton.link}
            openInNewTab={settings.primaryButton.openInNewTab}
          >
            <CraftButtonLabel>
              {settings.primaryButton.text}
              {settings.primaryButton.badge && (
                <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
              )}
            </CraftButtonLabel>
            <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
          </SmartLink>
        </CraftButton>
      );
    }

    // FlowButton effect
    if (hasCustom && btnStyle && isFlowButtonEffect(btnStyle.hoverEffect)) {
      return (
        <PrimaryFlowButton
          asChild
          size="lg"
          ringColor={btnStyle.bgColor || ORANGE_PRIMARY}
        >
          <SmartLink
            href={settings.primaryButton.link}
            openInNewTab={settings.primaryButton.openInNewTab}
          >
            {settings.primaryButton.text}
            {settings.primaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
            )}
          </SmartLink>
        </PrimaryFlowButton>
      );
    }

    // NeuralButton effect
    if (hasCustom && btnStyle && isNeuralButtonEffect(btnStyle.hoverEffect)) {
      return (
        <NeuralButton asChild>
          <SmartLink
            href={settings.primaryButton.link}
            openInNewTab={settings.primaryButton.openInNewTab}
          >
            {settings.primaryButton.text}
            {settings.primaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
            )}
          </SmartLink>
        </NeuralButton>
      );
    }

    // Custom styled button (non-special effects)
    if (hasCustom && btnStyle) {
      const hoverClass = getHoverEffectClass(btnStyle.hoverEffect);
      const normalBg = getNormalBackground(btnStyle);
      const hoverBg = getHoverBackground(btnStyle);
      const hasComplex = isComplexHoverEffect(btnStyle.hoverEffect);
      const complexHoverStyles = hasComplex ? getComplexEffectHoverStyles(btnStyle) : {};
      const complexNormalStyles = hasComplex ? getComplexEffectNormalStyles(btnStyle) : {};

      const getBackground = (isHover: boolean) => {
        if (btnStyle.hoverEffect === "gradient-shift") {
          return getGradientShiftBackground(btnStyle);
        }
        if (btnStyle.hoverEffect === "slide-fill" || btnStyle.hoverEffect === "border-fill") {
          return normalBg;
        }
        return isHover ? hoverBg : normalBg;
      };

      return (
        <SmartLink
          href={settings.primaryButton.link}
          openInNewTab={settings.primaryButton.openInNewTab}
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 text-base font-medium overflow-hidden",
            hoverClass,
            hasComplex ? "transition-all duration-500 ease-out" : "transition-all duration-300"
          )}
          style={{
            background: getBackground(false),
            color: btnStyle.textColor || "#ffffff",
            borderWidth: `${btnStyle.borderWidth ?? 1}px`,
            borderStyle: "solid",
            borderColor: btnStyle.borderColor || btnStyle.bgColor || ORANGE_PRIMARY,
            borderRadius: `${btnStyle.borderRadius ?? 6}px`,
            ...(hasComplex ? complexNormalStyles : { boxShadow: btnStyle.shadow }),
          }}
          onMouseEnter={(e) => {
            if (isPreview) return;
            if (hasComplex) {
              if (complexHoverStyles.boxShadow) {
                e.currentTarget.style.boxShadow = complexHoverStyles.boxShadow;
              }
              if (complexHoverStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexHoverStyles.backgroundPosition;
              }
              if (!btnStyle.hoverEffect || btnStyle.hoverEffect === "ripple") {
                e.currentTarget.style.background = hoverBg;
              }
            } else {
              e.currentTarget.style.background = hoverBg;
              if (btnStyle.hoverShadow) {
                e.currentTarget.style.boxShadow = btnStyle.hoverShadow;
              }
            }
            if (btnStyle.hoverTextColor) {
              e.currentTarget.style.color = btnStyle.hoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (isPreview) return;
            if (hasComplex) {
              if (complexNormalStyles.boxShadow !== undefined) {
                e.currentTarget.style.boxShadow = complexNormalStyles.boxShadow;
              }
              if (complexNormalStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexNormalStyles.backgroundPosition;
              }
            } else {
              e.currentTarget.style.background = normalBg;
              e.currentTarget.style.boxShadow = btnStyle.shadow || "";
            }
            e.currentTarget.style.color = btnStyle.textColor || "#ffffff";
          }}
        >
          {btnStyle.iconPosition === "left" && renderButtonIcon(btnStyle)}
          <span>
            {settings.primaryButton.text}
            {settings.primaryButton.badge && (
              <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
            )}
          </span>
          {btnStyle.iconPosition !== "left" && renderButtonIcon(btnStyle)}
        </SmartLink>
      );
    }

    // Default button (no custom style)
    return (
      <Button
        size="lg"
        className={cn(
          "group/btn w-full sm:w-auto bg-orange-500",
          !isPreview && "hover:bg-orange-600"
        )}
        asChild
      >
        <SmartLink
          href={settings.primaryButton.link}
          openInNewTab={settings.primaryButton.openInNewTab}
        >
          {settings.primaryButton.text}
          {settings.primaryButton.badge && (
            <span className="ml-2 text-xs opacity-80">{settings.primaryButton.badge}</span>
          )}
          <ArrowRight
            className={cn(
              "ml-2 h-4 w-4",
              !isPreview && "transition-transform group-hover/btn:translate-x-1"
            )}
          />
        </SmartLink>
      </Button>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", getAlignmentClass())}>
      {/* Badge */}
      {settings.badge.show && (
        <Badge
          className={cn(
            "w-fit font-medium px-4 py-2 text-sm border",
            settings.badge.style === "pill" && "rounded-full",
            settings.badge.style === "outline" && "bg-transparent",
            settings.badge.style === "solid" && "rounded-md"
          )}
          style={{
            backgroundColor:
              settings.badge.style === "outline"
                ? "transparent"
                : settings.badge.bgColor || "#f9731933",
            color: settings.badge.textColor || "#fb923c",
            borderColor: settings.badge.borderColor || "#f9731980",
            borderWidth: settings.badge.style === "outline" ? "2px" : "1px",
          }}
        >
          {settings.badge.icon && (
            <>
              {(() => {
                const Icon = getLucideIcon(settings.badge.icon);
                return <Icon className="h-4 w-4 mr-2" />;
              })()}
            </>
          )}
          {settings.badge.text}
        </Badge>
      )}

      {/* Headline */}
      <h1
        className={cn(
          "font-bold tracking-tight",
          getHeadlineSize(),
          !isHexColor(settings.headline.color) && (settings.headline.color || "text-white")
        )}
        style={isHexColor(settings.headline.color) ? { color: settings.headline.color } : undefined}
      >
        {renderHeadline()}
      </h1>

      {/* Subheadline */}
      {settings.subheadline.show && (
        <p
          className={cn(
            settings.subheadline.size === "sm" && "text-base",
            settings.subheadline.size === "md" && "text-lg",
            settings.subheadline.size === "lg" && "text-lg sm:text-xl",
            !isHexColor(settings.subheadline.color) && (settings.subheadline.color || "text-slate-400")
          )}
          style={isHexColor(settings.subheadline.color) ? { color: settings.subheadline.color } : undefined}
        >
          {settings.subheadline.text}
        </p>
      )}

      {/* Features */}
      {settings.features.show && settings.features.items.length > 0 && (
        <div
          className={cn(
            "mt-2",
            settings.features.layout === "list"
              ? "flex flex-col gap-3"
              : cn(
                  "grid gap-3",
                  settings.features.columns === 1 && "grid-cols-1",
                  settings.features.columns === 2 && "grid-cols-1 sm:grid-cols-2",
                  settings.features.columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
                  settings.features.columns === 4 && "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
                )
          )}
        >
          {settings.features.items.map((feature) => {
            const Icon = getLucideIcon(feature.icon);
            const iconPosition = settings.features.iconPosition || "left";
            return (
              <div
                key={feature.id}
                className={cn(
                  "flex items-center gap-3 text-sm text-slate-400",
                  iconPosition === "right" && "flex-row-reverse"
                )}
              >
                <Icon
                  className="h-5 w-5 shrink-0"
                  style={{ color: settings.features.iconColor || "#22c55e" }}
                />
                <span>{feature.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Buttons */}
      <div
        className={cn(
          "flex flex-col gap-4 mt-2",
          settings.alignment === "center" ? "sm:flex-row sm:justify-center" : "sm:flex-row"
        )}
      >
        {settings.primaryButton.show && renderPrimaryButton()}

        {settings.secondaryButton.show && (
          <Button
            size="lg"
            variant={
              settings.secondaryButton.style === "outline"
                ? "outline"
                : settings.secondaryButton.style === "ghost"
                ? "ghost"
                : "link"
            }
            className={cn(
              "w-full sm:w-auto",
              settings.secondaryButton.style === "outline" && "border-white/20 text-white hover:bg-white/10"
            )}
            asChild
          >
            <SmartLink
              href={settings.secondaryButton.link}
              openInNewTab={settings.secondaryButton.openInNewTab}
            >
              {settings.secondaryButton.text}
            </SmartLink>
          </Button>
        )}
      </div>

      {/* Trust Text */}
      {settings.trustText.show && (
        <div
          className="flex items-center gap-2 text-sm mt-2"
          style={{ color: settings.trustText.textColor || "#9ca3af" }}
        >
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
          <span>{settings.trustText.text}</span>
        </div>
      )}
    </div>
  );
}
