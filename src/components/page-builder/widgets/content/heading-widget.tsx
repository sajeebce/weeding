"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SmartLink } from "@/components/ui/smart-link";
import type { HeadingWidgetSettings } from "@/lib/page-builder/types";

interface HeadingWidgetProps {
  settings: HeadingWidgetSettings;
  isPreview?: boolean;
}

// Split text utility for character/word animations
function splitText(
  text: string,
  splitBy: "characters" | "words" | "lines"
): string[] {
  switch (splitBy) {
    case "characters":
      return text.split("");
    case "words":
      return text.split(" ");
    case "lines":
      return text.split("\n");
    default:
      return [text];
  }
}

// Get typography styles
function getTypographyStyles(
  typography: HeadingWidgetSettings["style"]["typography"]
): React.CSSProperties {
  return {
    fontFamily: typography.fontFamily || undefined,
    fontSize: `${typography.fontSize}${typography.fontSizeUnit}`,
    fontWeight: typography.fontWeight,
    fontStyle: typography.fontStyle,
    textTransform: typography.textTransform,
    textDecoration: typography.textDecoration,
    lineHeight: typography.lineHeight,
    letterSpacing: `${typography.letterSpacing}${typography.letterSpacingUnit}`,
    wordSpacing: typography.wordSpacing ? `${typography.wordSpacing}px` : undefined,
  };
}

// Get text fill styles
function getTextFillStyles(
  textFill: HeadingWidgetSettings["style"]["textFill"]
): React.CSSProperties {
  if (textFill.type === "solid") {
    return { color: textFill.color };
  }

  if (textFill.type === "gradient" && textFill.gradient) {
    const { type, angle, colors } = textFill.gradient;
    const colorStops = colors
      .map((c) => `${c.color} ${c.position}%`)
      .join(", ");
    const gradientValue =
      type === "linear"
        ? `linear-gradient(${angle}deg, ${colorStops})`
        : `radial-gradient(circle, ${colorStops})`;

    return {
      background: gradientValue,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };
  }

  if (textFill.type === "image" && textFill.image) {
    return {
      backgroundImage: `url(${textFill.image.url})`,
      backgroundSize: textFill.image.size,
      backgroundPosition: textFill.image.position,
      backgroundAttachment: textFill.image.fixed ? "fixed" : "scroll",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };
  }

  return {};
}

// Get text stroke styles
function getTextStrokeStyles(
  textStroke?: HeadingWidgetSettings["style"]["textStroke"]
): React.CSSProperties {
  if (!textStroke?.enabled) return {};

  return {
    WebkitTextStroke: `${textStroke.width}px ${textStroke.color}`,
    WebkitTextFillColor: textStroke.fillColor || "transparent",
  };
}

// Get text shadow styles
function getTextShadowStyles(
  textShadow?: HeadingWidgetSettings["style"]["textShadow"]
): React.CSSProperties {
  if (!textShadow?.enabled || !textShadow.shadows?.length) return {};

  const shadowValue = textShadow.shadows
    .map((s) => `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.color}`)
    .join(", ");

  return { textShadow: shadowValue };
}

// Get alignment class
function getAlignmentClass(alignment: "left" | "center" | "right"): string {
  switch (alignment) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

// Get entrance animation class
function getEntranceClass(
  entrance?: NonNullable<HeadingWidgetSettings["animation"]>["entrance"]
): string {
  if (!entrance?.enabled) return "";

  const animationClasses: Record<string, string> = {
    fade: "heading-entrance-fade",
    "fade-up": "heading-entrance-fade-up",
    "fade-down": "heading-entrance-fade-down",
    "fade-left": "heading-entrance-fade-left",
    "fade-right": "heading-entrance-fade-right",
    "zoom-in": "heading-entrance-zoom-in",
    "zoom-out": "heading-entrance-zoom-out",
    "slide-up": "heading-entrance-slide-up",
    "slide-down": "heading-entrance-slide-down",
    flip: "heading-entrance-flip",
    bounce: "heading-entrance-bounce",
  };

  return animationClasses[entrance.type] || "";
}

// Get continuous animation class
function getContinuousAnimationClass(
  animation?: NonNullable<HeadingWidgetSettings["animation"]>["continuousAnimation"]
): string {
  if (!animation?.enabled || animation.type === "none") return "";

  const animationClasses: Record<string, string> = {
    "gradient-shift": "heading-gradient-shift",
    pulse: "heading-pulse",
    glow: "heading-glow",
    shimmer: "heading-shimmer",
    float: "heading-float",
  };

  return animationClasses[animation.type] || "";
}

// Get hover animation class
function getHoverAnimationClass(
  animation?: NonNullable<HeadingWidgetSettings["animation"]>["hoverAnimation"]
): string {
  if (!animation?.enabled || animation.type === "none") return "";

  const animationClasses: Record<string, string> = {
    "color-change": "heading-hover-color",
    "underline-grow": "heading-hover-underline",
    "background-fill": "heading-hover-bg-fill",
    scale: "heading-hover-scale",
    "letter-spacing": "heading-hover-spacing",
    glow: "heading-hover-glow",
  };

  return animationClasses[animation.type] || "";
}

export function HeadingWidget({ settings, isPreview = false }: HeadingWidgetProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Intersection Observer for entrance animation
  useEffect(() => {
    if (!settings.animation?.entrance?.enabled || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [settings.animation?.entrance?.enabled, prefersReducedMotion]);

  // Memoized styles
  const typographyStyles = useMemo(
    () => getTypographyStyles(settings.style.typography),
    [settings.style.typography]
  );

  const textFillStyles = useMemo(
    () => getTextFillStyles(settings.style.textFill),
    [settings.style.textFill]
  );

  const textStrokeStyles = useMemo(
    () => getTextStrokeStyles(settings.style.textStroke),
    [settings.style.textStroke]
  );

  const textShadowStyles = useMemo(
    () => getTextShadowStyles(settings.style.textShadow),
    [settings.style.textShadow]
  );

  // Render highlighted text
  const renderHighlightedText = (text: string) => {
    if (!settings.content.highlight?.enabled || !settings.content.highlight.words) {
      return text;
    }

    const words = settings.content.highlight.words
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    if (words.length === 0) return text;

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
            const highlightStyle = settings.style.highlightStyle;
            const style = settings.content.highlight?.style;

            let className = "heading-highlight";
            let inlineStyle: React.CSSProperties = {};

            switch (style) {
              case "color":
                inlineStyle = { color: highlightStyle?.color };
                break;
              case "background":
                className += " heading-highlight-bg";
                inlineStyle = {
                  backgroundColor: highlightStyle?.backgroundColor,
                  padding: highlightStyle?.padding,
                  borderRadius: highlightStyle?.borderRadius,
                };
                break;
              case "gradient":
                className += " heading-highlight-gradient";
                if (highlightStyle?.gradientColors?.length) {
                  inlineStyle = {
                    background: `linear-gradient(90deg, ${highlightStyle.gradientColors.join(", ")})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  };
                }
                break;
              case "underline":
                className += " heading-highlight-underline";
                inlineStyle = {
                  textDecoration: "underline",
                  textDecorationColor: highlightStyle?.color,
                  textUnderlineOffset: "4px",
                };
                break;
              case "marker":
                className += " heading-highlight-marker";
                inlineStyle = {
                  background: `linear-gradient(to bottom, transparent 50%, ${highlightStyle?.backgroundColor || "#fef08a"} 50%)`,
                  padding: "0 4px",
                };
                break;
              case "glow":
                className += " heading-highlight-glow";
                inlineStyle = {
                  color: highlightStyle?.color,
                  textShadow: `0 0 10px ${highlightStyle?.color}, 0 0 20px ${highlightStyle?.color}`,
                };
                break;
            }

            return (
              <span key={index} className={className} style={inlineStyle}>
                {part}
              </span>
            );
          }
          return part;
        })}
      </>
    );
  };

  // Render animated text (split by char/word)
  const renderAnimatedText = () => {
    const textAnim = settings.animation?.textAnimation;

    if (!textAnim?.enabled || prefersReducedMotion) {
      return renderHighlightedText(settings.content.text);
    }

    const parts = splitText(settings.content.text, textAnim.splitBy);

    return parts.map((part, index) => (
      <span
        key={index}
        className={cn(
          "heading-char inline-block",
          isVisible && `heading-text-${textAnim.type}`
        )}
        style={{
          "--char-index": index,
          "--stagger-delay": `${textAnim.staggerDelay}ms`,
          "--anim-duration": `${textAnim.duration}ms`,
          animationDelay: `${index * textAnim.staggerDelay}ms`,
          animationDuration: `${textAnim.duration}ms`,
        } as React.CSSProperties}
      >
        {part}
        {textAnim.splitBy === "words" && index < parts.length - 1 && "\u00A0"}
      </span>
    ));
  };

  // Render split heading
  const renderSplitHeading = () => {
    const split = settings.content.splitHeading;
    if (!split?.enabled) return null;

    const splitStyles = settings.style.splitStyles;

    return (
      <>
        {split.beforeText && (
          <span
            className="heading-split-before"
            style={{
              ...getTypographyStyles({
                ...settings.style.typography,
                ...splitStyles?.before,
              }),
              color: splitStyles?.before?.color,
            }}
          >
            {split.beforeText}{" "}
          </span>
        )}
        <span
          className="heading-split-main"
          style={{
            ...getTypographyStyles({
              ...settings.style.typography,
              ...splitStyles?.main,
            }),
            color: splitStyles?.main?.color,
          }}
        >
          {split.mainText}
        </span>
        {split.afterText && (
          <span
            className="heading-split-after"
            style={{
              ...getTypographyStyles({
                ...settings.style.typography,
                ...splitStyles?.after,
              }),
              color: splitStyles?.after?.color,
            }}
          >
            {" "}{split.afterText}
          </span>
        )}
      </>
    );
  };

  // Determine the tag to use - use React.ElementType for proper JSX support
  const Tag = settings.content.htmlTag as React.ElementType;

  // Build class names
  const classNames = cn(
    "heading-widget",
    getAlignmentClass(settings.style.alignment),
    !isVisible && settings.animation?.entrance?.enabled && "heading-hidden",
    isVisible && getEntranceClass(settings.animation?.entrance),
    getContinuousAnimationClass(settings.animation?.continuousAnimation),
    !isPreview && getHoverAnimationClass(settings.animation?.hoverAnimation),
    settings.advanced?.customClass
  );

  // Build inline styles
  const inlineStyles: React.CSSProperties = {
    ...typographyStyles,
    ...textFillStyles,
    ...textStrokeStyles,
    ...textShadowStyles,
    ...(settings.advanced?.maxWidth?.enabled && {
      maxWidth: `${settings.advanced.maxWidth.value}${settings.advanced.maxWidth.unit}`,
    }),
    ...(settings.animation?.entrance?.enabled && {
      "--entrance-duration": `${settings.animation.entrance.duration}ms`,
      "--entrance-delay": `${settings.animation.entrance.delay}ms`,
    } as React.CSSProperties),
    ...(settings.animation?.continuousAnimation?.enabled && {
      "--continuous-duration": `${settings.animation.continuousAnimation.duration}ms`,
    } as React.CSSProperties),
    ...(settings.animation?.hoverAnimation?.enabled && {
      "--hover-duration": `${settings.animation.hoverAnimation.duration}ms`,
    } as React.CSSProperties),
  };

  // Render content
  const content = settings.content.splitHeading?.enabled
    ? renderSplitHeading()
    : renderAnimatedText();

  // Wrap in link if needed
  if (settings.content.link?.url) {
    return (
      <Tag
        ref={ref as React.RefObject<HTMLHeadingElement>}
        className={classNames}
        style={inlineStyles}
        id={settings.advanced?.customId}
        {...settings.advanced?.customAttributes}
      >
        <SmartLink
          href={settings.content.link.url}
          openInNewTab={settings.content.link.openInNewTab}
          className="heading-link"
        >
          {content}
        </SmartLink>
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={classNames}
      style={inlineStyles}
      id={settings.advanced?.customId}
      {...settings.advanced?.customAttributes}
    >
      {content}
    </Tag>
  );
}

export default HeadingWidget;
