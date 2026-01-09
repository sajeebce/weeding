/**
 * Button Color Constants
 *
 * Centralized color definitions used across button components
 * to avoid hardcoding and ensure consistency
 */

// Primary brand colors
export const ORANGE_PRIMARY = '#F97316' as const
export const ORANGE_PRIMARY_HOVER = '#EA580C' as const

// Craft button colors
export const CRAFT_BG_DARK = '#18181b' as const
export const CRAFT_TEXT_WHITE = '#ffffff' as const

// Common colors
export const WHITE = '#ffffff' as const
export const TRANSPARENT = 'transparent' as const
export const TEXT_GRAY = '#374151' as const
export const BG_GRAY_LIGHT = '#f3f4f6' as const

// Button size classes
export const BUTTON_ICON_SIZES = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
} as const

// Stroke widths
export const ICON_STROKE_DEFAULT = 'stroke-2' as const
