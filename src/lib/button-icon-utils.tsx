/**
 * Shared Button Icon Utilities
 *
 * Centralized icon rendering for buttons across:
 * - Header CTA buttons
 * - Footer buttons
 * - Landing page hero buttons
 * - Button style editor preview
 */

import { DynamicIcon } from "lucide-react/dynamic";
import type { ButtonCustomStyle } from "@/lib/header-footer/types";
import { cn } from "@/lib/utils";

/**
 * Render icon based on button style settings
 * Supports both Lucide icons (by name) and custom SVG
 */
export function renderButtonIcon(
  style?: ButtonCustomStyle,
  className?: string
): React.ReactNode {
  if (!style?.icon || style.icon === "none" || style.icon.trim() === "") {
    return null;
  }

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

/**
 * Get icon for CraftButton (always ArrowUpRight for expand effect)
 * Returns the icon element or a custom icon if specified
 */
export function getCraftButtonIcon(
  style?: ButtonCustomStyle
): React.ReactNode {
  // If custom icon is specified, use it
  if (style?.icon && style.icon !== "none" && style.icon !== "arrow-up-right") {
    return renderButtonIcon(style, "size-4 stroke-2 transition-transform duration-500 group-hover:rotate-45");
  }

  // Default: ArrowUpRight icon (imported where needed)
  return null;
}

/**
 * Check if style has a valid icon configured
 */
export function hasIcon(style?: ButtonCustomStyle): boolean {
  if (!style?.icon) return false;
  if (style.icon === "none" || style.icon.trim() === "") return false;
  return true;
}

/**
 * Validate Lucide icon name format
 */
export function isValidIconName(iconName?: string): boolean {
  if (!iconName) return false;
  const name = iconName.trim().toLowerCase();
  return /^[a-z][a-z0-9-]*$/.test(name);
}
