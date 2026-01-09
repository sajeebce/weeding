"use client";

import * as React from "react";
import { SmartLink } from "@/components/ui/smart-link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";
import { UserMenu } from "./UserMenu";
import type { CTAButtonsProps } from "../types";
import type { CTAButton } from "@/lib/header-footer/types";
import { cn } from "@/lib/utils";

// Shared button utilities
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

// Render a single CTA button with custom or preset styles
function CTAButtonItem({ btn, index }: { btn: CTAButton; index: number }) {
  const hasCustom = hasCustomStyle(btn.style);

  if (hasCustom && btn.style) {
    // Check if this is a CraftButton style
    if (isCraftButtonEffect(btn.style.hoverEffect)) {
      // Get the icon to use in CraftButton
      const craftIcon = btn.style.icon && btn.style.icon !== "none"
        ? renderButtonIcon(btn.style, "size-3 stroke-2")
        : <ArrowUpRight className="size-3 stroke-2" />;

      return (
        <CraftButton
          key={index}
          asChild
          bgColor={btn.style.bgColor || CRAFT_BG_DARK}
          textColor={btn.style.textColor || WHITE}
          style={{
            boxShadow: btn.style.shadow,
          }}
        >
          <SmartLink href={btn.url} openInNewTab={btn.openInNewTab}>
            <CraftButtonLabel>{btn.text}</CraftButtonLabel>
            <CraftButtonIcon>
              {craftIcon}
            </CraftButtonIcon>
          </SmartLink>
        </CraftButton>
      );
    }

    // Check if this is a FlowButton style
    if (isFlowButtonEffect(btn.style.hoverEffect)) {
      return (
        <PrimaryFlowButton
          key={index}
          asChild
          style={{
            '--tw-ring-color': `${btn.style.bgColor || ORANGE_PRIMARY}99`,
          } as React.CSSProperties}
        >
          <SmartLink href={btn.url} openInNewTab={btn.openInNewTab}>{btn.text}</SmartLink>
        </PrimaryFlowButton>
      );
    }

    // Check if this is a NeuralButton style
    if (isNeuralButtonEffect(btn.style.hoverEffect)) {
      return (
        <NeuralButton key={index} asChild>
          <SmartLink href={btn.url} openInNewTab={btn.openInNewTab}>{btn.text}</SmartLink>
        </NeuralButton>
      );
    }

    // Custom styled button (non-CraftButton, non-FlowButton, non-NeuralButton)
    const hoverClass = getHoverEffectClass(btn.style.hoverEffect);
    const normalBg = getNormalBackground(btn.style);
    const hoverBg = getHoverBackground(btn.style);
    const hasComplex = isComplexHoverEffect(btn.style.hoverEffect);
    const complexHoverStyles = hasComplex ? getComplexEffectHoverStyles(btn.style) : {};
    const complexNormalStyles = hasComplex ? getComplexEffectNormalStyles(btn.style) : {};

    // For gradient-shift, we need a special background
    const getBackground = (isHover: boolean) => {
      if (btn.style?.hoverEffect === "gradient-shift") {
        return getGradientShiftBackground(btn.style);
      }
      // For slide-fill and border-fill, keep original background (box-shadow creates fill effect)
      if (btn.style?.hoverEffect === "slide-fill" || btn.style?.hoverEffect === "border-fill") {
        return normalBg;
      }
      return isHover ? hoverBg : normalBg;
    };

    return (
      <SmartLink
        key={index}
        href={btn.url}
        openInNewTab={btn.openInNewTab}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 text-sm font-medium overflow-hidden",
          hoverClass,
          // Longer transition for complex effects to see the animation
          hasComplex ? "transition-all duration-500 ease-out" : "transition-all duration-300"
        )}
        style={{
          background: getBackground(false),
          color: btn.style.textColor || "#ffffff",
          borderWidth: `${btn.style.borderWidth ?? 1}px`,
          borderStyle: "solid",
          borderColor: btn.style.borderColor || btn.style.bgColor || ORANGE_PRIMARY,
          borderRadius: `${btn.style.borderRadius ?? 6}px`,
          // Apply initial complex effect styles (for box-shadow/background-position initial state)
          ...(hasComplex ? complexNormalStyles : { boxShadow: btn.style.shadow }),
        }}
        onMouseEnter={(e) => {
          if (hasComplex) {
            // Apply complex effect hover styles
            if (complexHoverStyles.boxShadow) {
              e.currentTarget.style.boxShadow = complexHoverStyles.boxShadow;
            }
            if (complexHoverStyles.backgroundPosition) {
              e.currentTarget.style.backgroundPosition = complexHoverStyles.backgroundPosition;
            }
            // For non-complex effects within complex, still change background
            if (!btn.style?.hoverEffect || btn.style.hoverEffect === "ripple") {
              e.currentTarget.style.background = hoverBg;
            }
          } else {
            e.currentTarget.style.background = hoverBg;
            if (btn.style?.hoverShadow) {
              e.currentTarget.style.boxShadow = btn.style.hoverShadow;
            }
          }
          if (btn.style?.hoverTextColor) {
            e.currentTarget.style.color = btn.style.hoverTextColor;
          }
        }}
        onMouseLeave={(e) => {
          if (hasComplex) {
            // Reset to normal complex effect styles
            if (complexNormalStyles.boxShadow !== undefined) {
              e.currentTarget.style.boxShadow = complexNormalStyles.boxShadow;
            }
            if (complexNormalStyles.backgroundPosition) {
              e.currentTarget.style.backgroundPosition = complexNormalStyles.backgroundPosition;
            }
          } else {
            e.currentTarget.style.background = normalBg;
            e.currentTarget.style.boxShadow = btn.style?.shadow || "";
          }
          e.currentTarget.style.color = btn.style?.textColor || "#ffffff";
        }}
      >
        {btn.style?.iconPosition === "left" && renderButtonIcon(btn.style)}
        <span>{btn.text}</span>
        {btn.style?.iconPosition !== "left" && renderButtonIcon(btn.style)}
      </SmartLink>
    );
  }

  // Preset variant button (using shadcn Button)
  const variant = btn.variant === "outline"
    ? "outline"
    : btn.variant === "ghost"
    ? "ghost"
    : btn.variant === "secondary"
    ? "secondary"
    : "default";

  return (
    <Button key={index} variant={variant} asChild>
      <SmartLink href={btn.url} openInNewTab={btn.openInNewTab}>{btn.text}</SmartLink>
    </Button>
  );
}

export function CTAButtons({
  buttons,
  showAuth,
  authConfig,
  user,
  session,
  sessionStatus,
  onLogout,
}: CTAButtonsProps) {
  const isLoggedIn = !!(user || session?.user);
  const isLoading = sessionStatus === "loading";

  // Show skeleton while loading to prevent layout shift/glitch
  if (isLoading) {
    return (
      <div className="flex items-center gap-x-4">
        {/* CTA buttons placeholder */}
        {buttons && buttons.length > 0 &&
          buttons.map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-md bg-muted"
            />
          ))}
        {/* User menu placeholder */}
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-x-4">
        {/* Show CTA buttons for logged in users too */}
        {buttons && buttons.length > 0 &&
          buttons.map((btn, index) => (
            <CTAButtonItem key={index} btn={btn} index={index} />
          ))}
        <UserMenu user={user} session={session} onLogout={onLogout} />
      </div>
    );
  }

  // Render auth button with custom style if available
  const renderAuthButton = () => {
    if (!showAuth) return null;

    const loginUrl = authConfig.loginUrl || "/login";
    const loginStyle = authConfig.loginStyle;

    // If loginStyle has custom styles, render as custom button
    if (loginStyle && hasCustomStyle(loginStyle)) {
      // Check if this is a CraftButton style
      if (isCraftButtonEffect(loginStyle.hoverEffect)) {
        const craftIcon = loginStyle.icon && loginStyle.icon !== "none"
          ? renderButtonIcon(loginStyle, "size-3 stroke-2")
          : <ArrowUpRight className="size-3 stroke-2" />;

        return (
          <CraftButton
            asChild
            bgColor={loginStyle.bgColor || CRAFT_BG_DARK}
            textColor={loginStyle.textColor || WHITE}
            style={{
              boxShadow: loginStyle.shadow,
            }}
          >
            <SmartLink href={loginUrl} openInNewTab={loginStyle.openInNewTab}>
              <CraftButtonLabel>{authConfig.loginText || "Sign In"}</CraftButtonLabel>
              <CraftButtonIcon>
                {craftIcon}
              </CraftButtonIcon>
            </SmartLink>
          </CraftButton>
        );
      }

      const hoverClass = getHoverEffectClass(loginStyle.hoverEffect);
      const normalBg = getNormalBackground(loginStyle);
      const hoverBg = getHoverBackground(loginStyle);
      const hasComplex = isComplexHoverEffect(loginStyle.hoverEffect);
      const complexHoverStyles = hasComplex ? getComplexEffectHoverStyles(loginStyle) : {};
      const complexNormalStyles = hasComplex ? getComplexEffectNormalStyles(loginStyle) : {};

      const getBackground = (isHover: boolean) => {
        if (loginStyle?.hoverEffect === "gradient-shift") {
          return getGradientShiftBackground(loginStyle);
        }
        if (loginStyle?.hoverEffect === "slide-fill" || loginStyle?.hoverEffect === "border-fill") {
          return normalBg;
        }
        return isHover ? hoverBg : normalBg;
      };

      return (
        <SmartLink
          href={loginUrl}
          openInNewTab={loginStyle.openInNewTab}
          className={cn(
            "inline-flex items-center justify-center px-4 py-2 text-sm font-medium overflow-hidden",
            hoverClass,
            hasComplex ? "transition-all duration-500 ease-out" : "transition-all duration-300"
          )}
          style={{
            background: getBackground(false),
            color: loginStyle.textColor || "#374151",
            borderWidth: `${loginStyle.borderWidth ?? 0}px`,
            borderStyle: "solid",
            borderColor: loginStyle.borderColor || "transparent",
            borderRadius: `${loginStyle.borderRadius ?? 6}px`,
            ...(hasComplex ? complexNormalStyles : { boxShadow: loginStyle.shadow }),
          }}
          onMouseEnter={(e) => {
            if (hasComplex) {
              if (complexHoverStyles.boxShadow) {
                e.currentTarget.style.boxShadow = complexHoverStyles.boxShadow;
              }
              if (complexHoverStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexHoverStyles.backgroundPosition;
              }
              if (!loginStyle?.hoverEffect || loginStyle.hoverEffect === "ripple") {
                e.currentTarget.style.background = hoverBg;
              }
            } else {
              e.currentTarget.style.background = hoverBg;
              if (loginStyle?.hoverShadow) {
                e.currentTarget.style.boxShadow = loginStyle.hoverShadow;
              }
            }
            if (loginStyle?.hoverTextColor) {
              e.currentTarget.style.color = loginStyle.hoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (hasComplex) {
              if (complexNormalStyles.boxShadow !== undefined) {
                e.currentTarget.style.boxShadow = complexNormalStyles.boxShadow;
              }
              if (complexNormalStyles.backgroundPosition) {
                e.currentTarget.style.backgroundPosition = complexNormalStyles.backgroundPosition;
              }
            } else {
              e.currentTarget.style.background = normalBg;
              e.currentTarget.style.boxShadow = loginStyle?.shadow || "";
            }
            e.currentTarget.style.color = loginStyle?.textColor || "#374151";
          }}
        >
          {loginStyle?.iconPosition === "left" && renderButtonIcon(loginStyle)}
          <span>{authConfig.loginText || "Sign In"}</span>
          {loginStyle?.iconPosition !== "left" && renderButtonIcon(loginStyle)}
        </SmartLink>
      );
    }

    // Default ghost button
    return (
      <Button variant="ghost" asChild>
        <SmartLink href={loginUrl}>{authConfig.loginText || "Sign In"}</SmartLink>
      </Button>
    );
  };

  return (
    <div className="flex items-center gap-x-4">
      {renderAuthButton()}

      {buttons && buttons.length > 0 ? (
        buttons.map((btn, index) => (
          <CTAButtonItem key={index} btn={btn} index={index} />
        ))
      ) : (
        <Button asChild>
          <SmartLink href="/services/llc-formation">Get Started</SmartLink>
        </Button>
      )}
    </div>
  );
}
