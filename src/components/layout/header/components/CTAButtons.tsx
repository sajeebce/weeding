"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { Button } from "@/components/ui/button";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { UserMenu } from "./UserMenu";
import type { CTAButtonsProps } from "../types";
import type { CTAButton, ButtonCustomStyle, ButtonHoverEffect, GradientDirection } from "@/lib/header-footer/types";
import { cn } from "@/lib/utils";

// Render icon based on style settings using DynamicIcon for Lucide icons
function renderButtonIcon(style?: ButtonCustomStyle, className?: string) {
  if (!style?.icon || style.icon === "none" || style.icon.trim() === "") return null;

  // Custom SVG
  if (style.icon === "custom") {
    if (!style.customIconSvg?.trim()) return null;
    return (
      <span
        className={cn("inline-flex shrink-0", className)}
        dangerouslySetInnerHTML={{ __html: style.customIconSvg }}
      />
    );
  }

  // Lucide icon - use DynamicIcon for dynamic loading by name
  // Only render if icon name looks valid (contains only letters, numbers, and hyphens)
  const iconName = style.icon.trim().toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(iconName)) return null;

  return (
    <DynamicIcon
      // @ts-expect-error - DynamicIcon accepts any valid lucide icon name
      name={iconName}
      className={cn("size-4 shrink-0", className)}
    />
  );
}

// Convert gradient direction to CSS
function getGradientCSS(direction?: GradientDirection): string {
  switch (direction) {
    case "to-r": return "to right";
    case "to-l": return "to left";
    case "to-t": return "to top";
    case "to-b": return "to bottom";
    case "to-tr": return "to top right";
    case "to-tl": return "to top left";
    case "to-br": return "to bottom right";
    case "to-bl": return "to bottom left";
    default: return "to right";
  }
}

// Check if button has custom styles
function hasCustomStyle(style?: ButtonCustomStyle): boolean {
  if (!style) return false;
  return !!(
    style.bgColor ||
    style.textColor ||
    style.borderColor ||
    style.borderWidth !== undefined ||
    style.borderRadius !== undefined ||
    style.hoverBgColor ||
    style.hoverTextColor ||
    style.hoverEffect ||
    style.useGradient ||
    style.hoverUseGradient
  );
}

// Get background style (gradient or solid color)
function getNormalBackground(style?: ButtonCustomStyle): string {
  if (style?.useGradient) {
    return `linear-gradient(${getGradientCSS(style.gradientDirection)}, ${style.gradientFrom || "#2563eb"}, ${style.gradientTo || "#7c3aed"})`;
  }
  return style?.bgColor || "#2563eb";
}

function getHoverBackground(style?: ButtonCustomStyle): string {
  if (style?.hoverUseGradient) {
    return `linear-gradient(${getGradientCSS(style.hoverGradientDirection)}, ${style.hoverGradientFrom || "#1d4ed8"}, ${style.hoverGradientTo || "#6d28d9"})`;
  }
  if (style?.hoverBgColor) {
    return style.hoverBgColor;
  }
  // Fallback to normal background
  return getNormalBackground(style);
}

// Get hover effect CSS class
function getHoverEffectClass(effect?: ButtonHoverEffect): string {
  switch (effect) {
    case "darken":
      return "hover:brightness-90";
    case "lighten":
      return "hover:brightness-110";
    case "shadow-lift":
      return "hover:-translate-y-0.5 hover:shadow-lg";
    case "shadow-press":
      return "hover:translate-y-0.5 hover:shadow-sm";
    case "scale-up":
      return "hover:scale-105";
    case "scale-down":
      return "hover:scale-95";
    case "glow-pulse":
      return "hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]";
    case "heartbeat":
      return "animate-heartbeat";
    // Complex effects handled via inline styles or special components
    case "slide-fill":
    case "border-fill":
    case "gradient-shift":
    case "ripple":
    case "flow-border":
      return "";
    default:
      return "";
  }
}

// Check if effect needs special handling
function isComplexHoverEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "slide-fill" || effect === "border-fill" || effect === "gradient-shift" || effect === "ripple";
}

// Check if effect is CraftButton style
function isCraftButtonEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "craft-expand";
}

// Check if effect is FlowButton style
function isFlowButtonEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "flow-border";
}

// Get gradient shift background (larger gradient that shifts position)
function getGradientShiftBackground(style: ButtonCustomStyle): string {
  const fromColor = style.bgColor || "#2563eb";
  const toColor = style.hoverBgColor || "#7c3aed";
  return `linear-gradient(90deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`;
}

// Get complex effect styles for hover state
function getComplexEffectHoverStyles(style: ButtonCustomStyle): {
  boxShadow?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  switch (style.hoverEffect) {
    case "slide-fill":
      // Slide fill: inset box-shadow slides from left to right
      return {
        boxShadow: `inset 200px 0 0 0 ${style.hoverBgColor || "#1d4ed8"}`,
      };
    case "border-fill":
      // Border fill: inset box-shadow grows to fill the button
      return {
        boxShadow: `inset 0 0 0 50px ${style.hoverBgColor || "#1d4ed8"}`,
      };
    case "gradient-shift":
      // Gradient shift: background-position animates across larger gradient
      return {
        backgroundSize: "200% 100%",
        backgroundPosition: "100% 0",
      };
    case "ripple":
      // Ripple: expanding ring from center outward
      return {
        boxShadow: `0 0 0 8px ${(style.bgColor || "#2563eb")}30, 0 0 20px ${(style.bgColor || "#2563eb")}20`,
      };
    default:
      return {};
  }
}

// Get complex effect styles for normal (non-hover) state
function getComplexEffectNormalStyles(style: ButtonCustomStyle): {
  boxShadow?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  switch (style.hoverEffect) {
    case "slide-fill":
      return {
        boxShadow: `inset 0 0 0 0 ${style.hoverBgColor || "#1d4ed8"}`,
      };
    case "border-fill":
      return {
        boxShadow: `inset 0 0 0 0 ${style.hoverBgColor || "#1d4ed8"}`,
      };
    case "gradient-shift":
      return {
        backgroundSize: "200% 100%",
        backgroundPosition: "0% 0",
      };
    case "ripple":
      return {
        boxShadow: `0 0 0 0 ${(style.bgColor || "#2563eb")}30`,
      };
    default:
      return {};
  }
}

// Render a single CTA button with custom or preset styles
function CTAButtonItem({ btn, index }: { btn: CTAButton; index: number }) {
  const hasCustom = hasCustomStyle(btn.style);

  if (hasCustom && btn.style) {
    // Check if this is a CraftButton style
    if (isCraftButtonEffect(btn.style.hoverEffect)) {
      // Get the icon to use in CraftButton
      const craftIcon = btn.style.icon && btn.style.icon !== "none"
        ? renderButtonIcon(btn.style, "size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45")
        : <ArrowUpRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />;

      return (
        <CraftButton
          key={index}
          asChild
          bgColor={btn.style.bgColor || "#18181b"}
          textColor={btn.style.textColor || "#ffffff"}
          style={{
            boxShadow: btn.style.shadow,
          }}
        >
          <Link href={btn.url}>
            <CraftButtonLabel>{btn.text}</CraftButtonLabel>
            <CraftButtonIcon>
              {craftIcon}
            </CraftButtonIcon>
          </Link>
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
            '--tw-ring-color': `${btn.style.bgColor || '#2563eb'}99`,
          } as React.CSSProperties}
        >
          <Link href={btn.url}>{btn.text}</Link>
        </PrimaryFlowButton>
      );
    }

    // Custom styled button (non-CraftButton, non-FlowButton)
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
      <Link
        key={index}
        href={btn.url}
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
          borderColor: btn.style.borderColor || btn.style.bgColor || "#2563eb",
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
      </Link>
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
      <Link href={btn.url}>{btn.text}</Link>
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
          ? renderButtonIcon(loginStyle, "size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45")
          : <ArrowUpRight className="size-3 stroke-2 transition-transform duration-500 group-hover:rotate-45" />;

        return (
          <CraftButton
            asChild
            bgColor={loginStyle.bgColor || "#18181b"}
            textColor={loginStyle.textColor || "#ffffff"}
            style={{
              boxShadow: loginStyle.shadow,
            }}
          >
            <Link href={loginUrl}>
              <CraftButtonLabel>{authConfig.loginText || "Sign In"}</CraftButtonLabel>
              <CraftButtonIcon>
                {craftIcon}
              </CraftButtonIcon>
            </Link>
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
        <Link
          href={loginUrl}
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
        </Link>
      );
    }

    // Default ghost button
    return (
      <Button variant="ghost" asChild>
        <Link href={loginUrl}>{authConfig.loginText || "Sign In"}</Link>
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
          <Link href="/services/llc-formation">Get Started</Link>
        </Button>
      )}
    </div>
  );
}
