"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TextBlockWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_TEXT_BLOCK_SETTINGS } from "@/lib/page-builder/defaults";

interface TextBlockWidgetProps {
  settings: TextBlockWidgetSettings;
  isEditing?: boolean;
  onContentChange?: (content: string) => void;
  isPreview?: boolean;
}

// Merge settings with defaults to ensure all properties exist
function mergeWithDefaults(
  settings: Partial<TextBlockWidgetSettings>
): TextBlockWidgetSettings {
  return {
    ...DEFAULT_TEXT_BLOCK_SETTINGS,
    ...settings,
    editor: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.editor,
      ...settings.editor,
    },
    typography: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.typography,
      ...settings.typography,
    },
    container: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.container,
      ...settings.container,
    },
    lists: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.lists,
      ...settings.lists,
    },
    blockquote: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.blockquote,
      ...settings.blockquote,
    },
    dropCap: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.dropCap,
      ...settings.dropCap,
    },
    columns: {
      enabled: settings.columns?.enabled ?? DEFAULT_TEXT_BLOCK_SETTINGS.columns!.enabled,
      count: settings.columns?.count ?? DEFAULT_TEXT_BLOCK_SETTINGS.columns!.count,
      gap: settings.columns?.gap ?? DEFAULT_TEXT_BLOCK_SETTINGS.columns!.gap,
      divider: {
        show: settings.columns?.divider?.show ?? DEFAULT_TEXT_BLOCK_SETTINGS.columns!.divider!.show,
        color: settings.columns?.divider?.color ?? DEFAULT_TEXT_BLOCK_SETTINGS.columns!.divider!.color,
        width: settings.columns?.divider?.width ?? DEFAULT_TEXT_BLOCK_SETTINGS.columns!.divider!.width,
      },
    },
    animation: {
      entrance: {
        enabled: settings.animation?.entrance?.enabled ?? DEFAULT_TEXT_BLOCK_SETTINGS.animation!.entrance.enabled,
        type: settings.animation?.entrance?.type ?? DEFAULT_TEXT_BLOCK_SETTINGS.animation!.entrance.type,
        duration: settings.animation?.entrance?.duration ?? DEFAULT_TEXT_BLOCK_SETTINGS.animation!.entrance.duration,
        delay: settings.animation?.entrance?.delay ?? DEFAULT_TEXT_BLOCK_SETTINGS.animation!.entrance.delay,
      },
    },
    responsive: {
      ...DEFAULT_TEXT_BLOCK_SETTINGS.responsive,
      ...settings.responsive,
    },
    advanced: {
      customClass: settings.advanced?.customClass ?? DEFAULT_TEXT_BLOCK_SETTINGS.advanced!.customClass,
      customId: settings.advanced?.customId ?? DEFAULT_TEXT_BLOCK_SETTINGS.advanced!.customId,
      hideOnDesktop: settings.advanced?.hideOnDesktop ?? DEFAULT_TEXT_BLOCK_SETTINGS.advanced!.hideOnDesktop,
      hideOnTablet: settings.advanced?.hideOnTablet ?? DEFAULT_TEXT_BLOCK_SETTINGS.advanced!.hideOnTablet,
      hideOnMobile: settings.advanced?.hideOnMobile ?? DEFAULT_TEXT_BLOCK_SETTINGS.advanced!.hideOnMobile,
    },
  };
}

// Get shadow class
function getShadowClass(shadow?: "none" | "sm" | "md" | "lg"): string {
  switch (shadow) {
    case "sm":
      return "shadow-sm";
    case "md":
      return "shadow-md";
    case "lg":
      return "shadow-lg";
    default:
      return "";
  }
}

// Get entrance animation class
function getEntranceClass(
  entrance?: TextBlockWidgetSettings["animation"]
): string {
  if (!entrance?.entrance?.enabled || entrance.entrance.type === "none")
    return "";

  const animationClasses: Record<string, string> = {
    fade: "text-block-entrance-fade",
    "fade-up": "text-block-entrance-fade-up",
    "fade-down": "text-block-entrance-fade-down",
    "slide-up": "text-block-entrance-slide-up",
  };

  return animationClasses[entrance.entrance.type] || "";
}

export function TextBlockWidget({
  settings: rawSettings,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isEditing = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onContentChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPreview = false,
}: TextBlockWidgetProps) {
  // Merge with defaults to ensure all properties exist
  const settings = useMemo(
    () => mergeWithDefaults(rawSettings),
    [rawSettings]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Intersection Observer for entrance animation
  useEffect(() => {
    if (
      !settings.animation?.entrance?.enabled ||
      prefersReducedMotion ||
      isEditing
    ) {
      setIsVisible(true);
      return;
    }

    // Start hidden
    setIsVisible(false);

    // Small delay to ensure CSS is applied before animation starts
    const timeout = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px" }
      );

      if (containerRef.current) observer.observe(containerRef.current);
    }, 50);

    return () => clearTimeout(timeout);
  }, [settings.animation?.entrance?.enabled, prefersReducedMotion, isEditing]);

  // Check if gradient border is active
  const hasGradientBorder = settings.container.gradientBorder?.enabled &&
    settings.container.gradientBorder.colors?.length >= 2;

  // Memoized styles for the content wrapper
  const contentStyles = useMemo((): React.CSSProperties => {
    const styles: React.CSSProperties = {
      fontFamily: settings.typography.fontFamily || undefined,
      fontSize: `${settings.typography.fontSize}px`,
      lineHeight: settings.typography.lineHeight,
      letterSpacing: settings.typography.letterSpacing
        ? `${settings.typography.letterSpacing}px`
        : undefined,
      color: settings.typography.color,
      padding: settings.container.padding
        ? `${settings.container.padding}px`
        : undefined,
      borderRadius: settings.container.borderRadius
        ? `${settings.container.borderRadius}px`
        : undefined,
      maxWidth: settings.container.maxWidth
        ? `${settings.container.maxWidth}px`
        : undefined,
    };

    // Background: gradient or solid
    if (settings.container.backgroundType === "gradient" && settings.container.gradientBackground?.colors?.length) {
      const { colors, angle } = settings.container.gradientBackground;
      styles.background = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
    } else {
      styles.backgroundColor = settings.container.backgroundColor || undefined;
    }

    // Border is only used as metadata for gradient border width — don't render as solid border
    // (there is no independent solid border control in the settings UI)

    // When gradient border is active, adjust inner border radius
    if (hasGradientBorder) {
      const borderWidth = settings.container.border?.width || 2;
      const innerRadius = Math.max(0, (settings.container.borderRadius || 0) - borderWidth);
      styles.borderRadius = `${innerRadius}px`;
    }

    // Columns
    if (settings.columns?.enabled && settings.columns.count > 1) {
      styles.columnCount = settings.columns.count;
      styles.columnGap = `${settings.columns.gap}px`;
      if (settings.columns.divider?.show) {
        styles.columnRule = `${settings.columns.divider.width}px solid ${settings.columns.divider.color}`;
      }
    }

    return styles;
  }, [settings, hasGradientBorder]);

  // Gradient border wrapper styles
  const gradientBorderStyles = useMemo((): React.CSSProperties | null => {
    if (!hasGradientBorder) return null;
    const { colors, angle } = settings.container.gradientBorder!;
    const borderWidth = settings.container.border?.width || 2;
    return {
      padding: `${borderWidth}px`,
      background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
      borderRadius: settings.container.borderRadius
        ? `${settings.container.borderRadius}px`
        : undefined,
      maxWidth: settings.container.maxWidth
        ? `${settings.container.maxWidth}px`
        : undefined,
    };
  }, [settings, hasGradientBorder]);

  // CSS variables for custom styling
  const cssVariables = useMemo((): React.CSSProperties => {
    // Calculate drop cap font size based on lines (each line ~1.2em)
    const dropCapSize = settings.dropCap?.size || 3;
    const dropCapFontSize = `${dropCapSize * 1.2}em`;

    return {
      "--text-block-link-color": settings.typography.linkColor,
      "--text-block-link-hover-color": settings.typography.linkHoverColor,
      "--text-block-link-underline": settings.typography.linkUnderline
        ? "underline"
        : "none",
      "--text-block-paragraph-spacing": `${settings.paragraphSpacing}px`,
      "--text-block-list-bullet-style": settings.lists.bulletStyle,
      "--text-block-list-bullet-color":
        settings.lists.bulletColor || settings.typography.color,
      "--text-block-list-number-style": settings.lists.numberStyle,
      "--text-block-list-indent": `${settings.lists.indentation}px`,
      "--text-block-blockquote-border-color": settings.blockquote.borderColor,
      "--text-block-blockquote-border-width": `${settings.blockquote.borderWidth}px`,
      "--text-block-blockquote-bg":
        settings.blockquote.backgroundColor || "transparent",
      "--text-block-blockquote-font-style": settings.blockquote.fontStyle,
      "--text-block-blockquote-padding": `${settings.blockquote.padding}px`,
      "--drop-cap-color": settings.dropCap?.color || "#f97316",
      "--drop-cap-font-family": settings.dropCap?.fontFamily || "inherit",
      "--drop-cap-size": dropCapFontSize,
      "--entrance-duration": `${settings.animation?.entrance?.duration || 600}ms`,
      "--entrance-delay": `${settings.animation?.entrance?.delay || 0}ms`,
    } as React.CSSProperties;
  }, [settings]);

  // Build class names
  const classNames = cn(
    "text-block-widget",
    getShadowClass(settings.container.shadow),
    settings.animation?.entrance?.enabled && !isEditing && getEntranceClass(settings.animation),
    settings.animation?.entrance?.enabled && !isVisible && !isEditing && "text-block-not-visible",
    settings.dropCap?.enabled && "text-block-drop-cap",
    settings.advanced?.customClass
  );

  // Get animation inline styles as fallback
  const animationStyles = useMemo((): React.CSSProperties => {
    if (!settings.animation?.entrance?.enabled || isEditing) {
      return {};
    }

    const duration = settings.animation.entrance.duration || 600;
    const delay = settings.animation.entrance.delay || 0;
    const type = settings.animation.entrance.type;

    if (!isVisible) {
      return { opacity: 0 };
    }

    // Animation keyframes as inline style fallback
    const animationName: Record<string, string | undefined> = {
      none: undefined,
      fade: "text-block-fade-in",
      "fade-up": "text-block-fade-up",
      "fade-down": "text-block-fade-down",
      "slide-up": "text-block-slide-up",
    };
    const selectedAnimation = animationName[type];

    if (!selectedAnimation || type === "none") {
      return {};
    }

    return {
      animation: `${selectedAnimation} ${duration}ms ease-out ${delay}ms forwards`,
    };
  }, [settings.animation, isVisible, isEditing]);

  // Inner content element
  const innerContent = (
    <div
      ref={hasGradientBorder ? undefined : containerRef}
      className={classNames}
      style={{
        ...contentStyles,
        ...cssVariables,
        ...animationStyles,
        // When inside gradient border wrapper, remove maxWidth from inner (wrapper handles it)
        ...(hasGradientBorder ? { maxWidth: undefined } : {}),
      }}
      id={settings.advanced?.customId}
    >
      <div
        className="text-block-content max-w-none"
        style={cssVariables}
        dangerouslySetInnerHTML={{ __html: settings.content }}
      />
    </div>
  );

  // Render with or without gradient border wrapper
  if (hasGradientBorder && gradientBorderStyles) {
    return (
      <div
        ref={containerRef}
        style={gradientBorderStyles}
        className={cn(
          getShadowClass(settings.container.shadow),
          settings.animation?.entrance?.enabled && !isEditing && getEntranceClass(settings.animation),
          settings.animation?.entrance?.enabled && !isVisible && !isEditing && "text-block-not-visible",
        )}
      >
        {innerContent}
      </div>
    );
  }

  return innerContent;
}

export default TextBlockWidget;
