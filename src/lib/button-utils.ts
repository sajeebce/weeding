/**
 * Shared Button Utilities
 *
 * Centralized utilities for button styling across:
 * - Header CTA buttons
 * - Footer buttons
 * - Landing page hero buttons
 * - Button style editor preview
 */

import type { ButtonCustomStyle, ButtonHoverEffect, GradientDirection } from "@/lib/header-footer/types";

// ============================================
// GRADIENT UTILITIES
// ============================================

/**
 * Convert gradient direction enum to CSS gradient direction
 */
export function getGradientCSS(direction?: GradientDirection): string {
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

// ============================================
// BACKGROUND UTILITIES
// ============================================

/**
 * Get background style for normal (non-hover) state
 */
export function getNormalBackground(style?: ButtonCustomStyle): string {
  if (style?.useGradient) {
    return `linear-gradient(${getGradientCSS(style.gradientDirection)}, ${style.gradientFrom || "#F97316"}, ${style.gradientTo || "#EA580C"})`;
  }
  return style?.bgColor || "#F97316";
}

/**
 * Get background style for hover state
 */
export function getHoverBackground(style?: ButtonCustomStyle): string {
  if (style?.hoverUseGradient) {
    return `linear-gradient(${getGradientCSS(style.hoverGradientDirection)}, ${style.hoverGradientFrom || "#EA580C"}, ${style.hoverGradientTo || "#C2410C"})`;
  }
  if (style?.hoverBgColor) {
    return style.hoverBgColor;
  }
  // Fallback to normal background
  return getNormalBackground(style);
}

/**
 * Get gradient shift background (larger gradient that shifts position)
 * Used for gradient-shift hover effect
 */
export function getGradientShiftBackground(style?: ButtonCustomStyle): string {
  const fromColor = style?.bgColor || "#F97316";
  const toColor = style?.hoverBgColor || "#EA580C";
  return `linear-gradient(90deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`;
}

// ============================================
// HOVER EFFECT UTILITIES
// ============================================

/**
 * Get Tailwind CSS class for hover effect
 */
export function getHoverEffectClass(effect?: ButtonHoverEffect): string {
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
      return "hover:shadow-[0_0_15px_rgba(249,115,22,0.5)]";
    case "heartbeat":
      return "animate-heartbeat";
    case "stitches":
      return "stitches-button";
    case "ring-hover":
      return "ring-offset-background hover:ring-primary/90 transition-all duration-300 hover:ring-2 hover:ring-offset-2";
    // Complex effects handled via inline styles or special components
    case "slide-fill":
    case "border-fill":
    case "gradient-shift":
    case "ripple":
    case "flow-border":
    case "craft-expand":
    case "neural":
      return "";
    default:
      return "";
  }
}

// ============================================
// EFFECT TYPE CHECKERS
// ============================================

/**
 * Check if effect needs special inline style handling
 */
export function isComplexHoverEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "slide-fill" || effect === "border-fill" || effect === "gradient-shift" || effect === "ripple";
}

/**
 * Check if effect uses CraftButton component
 */
export function isCraftButtonEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "craft-expand";
}

/**
 * Check if effect uses FlowButton component
 */
export function isFlowButtonEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "flow-border";
}

/**
 * Check if effect uses NeuralButton component
 */
export function isNeuralButtonEffect(effect?: ButtonHoverEffect): boolean {
  return effect === "neural";
}

/**
 * Check if effect requires a special component (not standard button)
 */
export function isSpecialButtonEffect(effect?: ButtonHoverEffect): boolean {
  return isCraftButtonEffect(effect) || isFlowButtonEffect(effect) || isNeuralButtonEffect(effect);
}

// ============================================
// COMPLEX EFFECT STYLES
// ============================================

/**
 * Get inline styles for complex hover effects - HOVER state
 */
export function getComplexEffectHoverStyles(style?: ButtonCustomStyle): {
  boxShadow?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  if (!style) return {};

  switch (style.hoverEffect) {
    case "slide-fill":
      // Slide fill: inset box-shadow slides from left to right
      return {
        boxShadow: `inset 200px 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
      };
    case "border-fill":
      // Border fill: inset box-shadow grows to fill the button
      return {
        boxShadow: `inset 0 0 0 50px ${style.hoverBgColor || "#EA580C"}`,
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
        boxShadow: `0 0 0 8px ${(style.bgColor || "#F97316")}30, 0 0 20px ${(style.bgColor || "#F97316")}20`,
      };
    default:
      return {};
  }
}

/**
 * Get inline styles for complex hover effects - NORMAL state
 */
export function getComplexEffectNormalStyles(style?: ButtonCustomStyle): {
  boxShadow?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
} {
  if (!style) return {};

  switch (style.hoverEffect) {
    case "slide-fill":
      return {
        boxShadow: `inset 0 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
      };
    case "border-fill":
      return {
        boxShadow: `inset 0 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
      };
    case "gradient-shift":
      return {
        backgroundSize: "200% 100%",
        backgroundPosition: "0% 0",
      };
    case "ripple":
      return {
        boxShadow: `0 0 0 0 ${(style.bgColor || "#F97316")}30`,
      };
    default:
      return {};
  }
}

/**
 * Get complex effect styles based on hover state
 * Convenience function that combines hover and normal styles
 */
export function getComplexEffectStyles(style?: ButtonCustomStyle, isHovered?: boolean): React.CSSProperties {
  if (!style || !isComplexHoverEffect(style.hoverEffect)) return {};

  switch (style.hoverEffect) {
    case "slide-fill":
      return {
        boxShadow: isHovered
          ? `inset 200px 0 0 0 ${style.hoverBgColor || "#EA580C"}`
          : `inset 0 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
      };
    case "border-fill":
      return {
        boxShadow: isHovered
          ? `inset 0 0 0 50px ${style.hoverBgColor || "#EA580C"}`
          : `inset 0 0 0 0 ${style.hoverBgColor || "#EA580C"}`,
      };
    case "gradient-shift":
      return {
        backgroundSize: "200% 100%",
        backgroundPosition: isHovered ? "100% 0" : "0% 0",
      };
    case "ripple":
      return {
        boxShadow: isHovered
          ? `0 0 0 8px ${(style.bgColor || "#F97316")}30, 0 0 20px ${(style.bgColor || "#F97316")}20`
          : `0 0 0 0 ${(style.bgColor || "#F97316")}30`,
      };
    default:
      return {};
  }
}

// ============================================
// STYLE VALIDATION
// ============================================

/**
 * Check if button has custom styles defined
 */
export function hasCustomStyle(style?: ButtonCustomStyle): boolean {
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

// ============================================
// COMPUTED BACKGROUND HELPER
// ============================================

/**
 * Get the final background based on effect type and hover state
 * Handles special cases for gradient-shift, slide-fill, border-fill
 */
export function getFinalBackground(style?: ButtonCustomStyle, isHovered?: boolean): string {
  if (!style) return "#F97316";

  if (style.hoverEffect === "gradient-shift") {
    return getGradientShiftBackground(style);
  }
  if (style.hoverEffect === "slide-fill" || style.hoverEffect === "border-fill") {
    return getNormalBackground(style);
  }
  return isHovered ? getHoverBackground(style) : getNormalBackground(style);
}
