"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ButtonCustomStyle } from "@/lib/landing-blocks/types";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";

import {
  getHoverEffectClass,
  isComplexHoverEffect,
  getComplexEffectStyles,
  getFinalBackground,
  hasCustomStyle,
} from "@/lib/button-utils";
import { renderButtonIcon } from "@/lib/button-icon-utils";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";

export interface StyledCTAButtonProps {
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

export function StyledCTAButton({
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
          ringColor={style.bgColor || ORANGE_PRIMARY}
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
