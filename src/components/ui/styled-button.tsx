"use client";

import * as React from "react";
import { useState } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { SmartLink } from "@/components/ui/smart-link";
import { Button } from "@/components/ui/button";
import {
  CraftButton,
  CraftButtonLabel,
  CraftButtonIcon,
} from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";
import { cn } from "@/lib/utils";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";
import {
  getFinalBackground,
  getComplexEffectStyles,
  getHoverEffectClass,
  isComplexHoverEffect,
  isCraftButtonEffect,
  isFlowButtonEffect,
  isNeuralButtonEffect,
  hasCustomStyle,
} from "@/lib/button-utils";
import { renderButtonIcon } from "@/lib/button-icon-utils";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

export interface StyledButtonProps {
  children: React.ReactNode;
  style?: ButtonCustomStyle;

  /** Render as a link or a button element */
  as?: "link" | "button";
  /** Link href (only for as="link") */
  href?: string;
  /** Open link in new tab (only for as="link") */
  openInNewTab?: boolean;
  /** Button type attribute (only for as="button") */
  type?: "button" | "submit" | "reset";

  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;

  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  isPreview?: boolean;

  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function StyledButton({
  children,
  style: btnStyle,
  as = "link",
  href = "#",
  openInNewTab,
  type = "button",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  isPreview = false,
  className,
  onClick,
}: StyledButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const hoverHandlers = isPreview
    ? {}
    : {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      };

  // Loading state — show simple disabled button with spinner
  if (loading) {
    return as === "button" ? (
      <button
        type={type}
        disabled
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-md opacity-70 cursor-not-allowed",
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className
        )}
        style={{
          background: btnStyle?.bgColor || ORANGE_PRIMARY,
          color: btnStyle?.textColor || "#ffffff",
          borderRadius: btnStyle?.borderRadius
            ? `${btnStyle.borderRadius}px`
            : undefined,
        }}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </button>
    ) : (
      <span
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-md opacity-70 cursor-not-allowed",
          SIZE_CLASSES[size],
          fullWidth && "w-full",
          className
        )}
        style={{
          background: btnStyle?.bgColor || ORANGE_PRIMARY,
          color: btnStyle?.textColor || "#ffffff",
          borderRadius: btnStyle?.borderRadius
            ? `${btnStyle.borderRadius}px`
            : undefined,
        }}
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText}
      </span>
    );
  }

  const hasCustom = hasCustomStyle(btnStyle);

  // -- Craft Button effect --
  if (hasCustom && btnStyle && isCraftButtonEffect(btnStyle.hoverEffect)) {
    const craftIcon =
      btnStyle.icon && btnStyle.icon !== "none" ? (
        renderButtonIcon(btnStyle, "size-3 stroke-2")
      ) : (
        <ArrowUpRight className="size-3 stroke-2" />
      );

    const inner = (
      <>
        <CraftButtonLabel>{children}</CraftButtonLabel>
        <CraftButtonIcon>{craftIcon}</CraftButtonIcon>
      </>
    );

    const craftSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "default";

    return (
      <CraftButton
        asChild
        size={craftSize}
        bgColor={btnStyle.bgColor || CRAFT_BG_DARK}
        textColor={btnStyle.textColor || WHITE}
        style={{
          boxShadow: btnStyle.shadow,
          borderRadius: btnStyle.borderRadius != null
            ? `${btnStyle.borderRadius}px`
            : undefined,
        }}
        disabled={disabled}
      >
        {as === "link" ? (
          <SmartLink
            href={href}
            openInNewTab={openInNewTab}
            className={cn(fullWidth && "w-full", className)}
          >
            {inner}
          </SmartLink>
        ) : (
          <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={cn(fullWidth && "w-full", className)}
          >
            {inner}
          </button>
        )}
      </CraftButton>
    );
  }

  // -- Flow Button effect --
  if (hasCustom && btnStyle && isFlowButtonEffect(btnStyle.hoverEffect)) {
    const flowSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "default";
    return (
      <PrimaryFlowButton
        asChild={as === "link"}
        size={flowSize}
        ringColor={btnStyle.bgColor || ORANGE_PRIMARY}
        disabled={disabled}
        className={cn(fullWidth && "w-full", className)}
        {...(as === "button" ? { type, onClick } : {})}
      >
        {as === "link" ? (
          <SmartLink href={href} openInNewTab={openInNewTab}>
            {children}
          </SmartLink>
        ) : (
          <>{children}</>
        )}
      </PrimaryFlowButton>
    );
  }

  // -- Neural Button effect --
  if (hasCustom && btnStyle && isNeuralButtonEffect(btnStyle.hoverEffect)) {
    const neuralSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "default";
    return (
      <NeuralButton
        asChild={as === "link"}
        size={neuralSize}
        disabled={disabled}
        className={cn(fullWidth && "w-full", className)}
        {...(as === "button" ? { type, onClick } : {})}
      >
        {as === "link" ? (
          <SmartLink href={href} openInNewTab={openInNewTab}>
            {children}
          </SmartLink>
        ) : (
          <>{children}</>
        )}
      </NeuralButton>
    );
  }

  // -- Standard custom styled button --
  if (hasCustom && btnStyle) {
    const hoverClass = getHoverEffectClass(btnStyle.hoverEffect);
    const hasComplex = isComplexHoverEffect(btnStyle.hoverEffect);
    const effectStyles = getComplexEffectStyles(btnStyle, isHovered);

    const computedStyle: React.CSSProperties = {
      background: getFinalBackground(btnStyle, isHovered),
      color:
        isHovered && btnStyle.hoverTextColor
          ? btnStyle.hoverTextColor
          : btnStyle.textColor || "#ffffff",
      borderWidth: `${btnStyle.borderWidth ?? 0}px`,
      borderStyle: "solid",
      borderColor:
        isHovered && btnStyle.hoverBorderColor
          ? btnStyle.hoverBorderColor
          : btnStyle.borderColor || btnStyle.bgColor || ORANGE_PRIMARY,
      borderRadius: `${btnStyle.borderRadius ?? 6}px`,
      ...effectStyles,
      ...(!hasComplex && btnStyle.shadow
        ? {
            boxShadow:
              isHovered && btnStyle.hoverShadow
                ? btnStyle.hoverShadow
                : btnStyle.shadow,
          }
        : {}),
    };

    const sharedClassName = cn(
      "relative inline-flex items-center justify-center gap-2 font-medium cursor-pointer overflow-hidden",
      SIZE_CLASSES[size],
      hoverClass,
      hasComplex
        ? "transition-all duration-500 ease-out"
        : "transition-all duration-300",
      fullWidth && "w-full",
      disabled && "opacity-50 pointer-events-none",
      className
    );

    const content = (
      <>
        {btnStyle.iconPosition === "left" && renderButtonIcon(btnStyle)}
        <span>{children}</span>
        {btnStyle.iconPosition !== "left" && renderButtonIcon(btnStyle)}
      </>
    );

    if (as === "link") {
      return (
        <SmartLink
          href={href}
          openInNewTab={openInNewTab}
          className={sharedClassName}
          style={computedStyle}
          {...hoverHandlers}
        >
          {content}
        </SmartLink>
      );
    }

    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={sharedClassName}
        style={computedStyle}
        {...hoverHandlers}
      >
        {content}
      </button>
    );
  }

  // -- Default button (no custom style) --
  if (as === "link") {
    return (
      <Button
        size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
        className={cn(
          "bg-orange-500",
          !isPreview && "hover:bg-orange-600",
          fullWidth && "w-full",
          className
        )}
        asChild
        disabled={disabled}
      >
        <SmartLink href={href} openInNewTab={openInNewTab}>
          {children}
        </SmartLink>
      </Button>
    );
  }

  return (
    <Button
      type={type}
      size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
      className={cn(
        "bg-orange-500",
        !isPreview && "hover:bg-orange-600",
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
