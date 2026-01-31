"use client";

import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { getInitials, StarRating } from "./testimonials-widget";
import { cn } from "@/lib/utils";

interface TestimonialsGridViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

export function TestimonialsGridView({
  testimonials,
  settings,
  isPreview,
}: TestimonialsGridViewProps) {
  const { gridView, cardStyle, avatar, content, animation, responsive } = settings;

  // Column classes
  const columnClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  // Quote icon size classes
  const quoteIconSizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  // Quote icon position classes
  const quoteIconPositionClasses = {
    "top-left": "left-6 top-6",
    "top-right": "right-6 top-6",
    background: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5",
  };

  // Avatar size classes
  const avatarSizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  // Quote font size classes
  const quoteFontSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Name font size classes
  const nameFontSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Info font size classes
  const infoFontSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
  };

  // Card hover effect styles
  const getHoverStyles = () => {
    // Base transition for all hover effects
    const baseTransition = "transition-all duration-300 ease-out";

    switch (cardStyle.hoverEffect) {
      case "lift":
        return {
          className: `${baseTransition} hover:-translate-y-2`,
          style: {} as React.CSSProperties,
        };
      case "glow":
        return {
          className: baseTransition,
          style: {} as React.CSSProperties,
        };
      case "scale":
        return {
          className: `${baseTransition} hover:scale-[1.03]`,
          style: {} as React.CSSProperties,
        };
      case "border-color":
        return {
          className: `${baseTransition}`,
          style: { borderWidth: cardStyle.borderWidth || 1 } as React.CSSProperties,
        };
      default:
        return {
          className: "",
          style: {} as React.CSSProperties,
        };
    }
  };

  // Card shadow classes - always use user setting
  const shadowClasses: Record<string, string> = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  // Get effective shadow - respect user setting but provide smart defaults
  const getEffectiveShadow = (): string => {
    // Always use the user's shadow setting
    return cardStyle.shadow || "none";
  };

  // Generate card styles based on cardStyle.style
  const getCardStyles = () => {
    const baseStyles: React.CSSProperties = {
      borderRadius: cardStyle.borderRadius,
      padding: cardStyle.padding,
    };

    // Apply styles based on card style type
    switch (cardStyle.style) {
      case "minimal":
        return {
          ...baseStyles,
          borderWidth: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
        };

      case "elevated":
        return {
          ...baseStyles,
          borderWidth: 0,
          backgroundColor: cardStyle.backgroundColor,
        };

      case "glassmorphism":
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.1)",
          backgroundColor: `rgba(30, 41, 59, ${cardStyle.glassEffect?.opacity || 0.6})`,
          backdropFilter: `blur(${cardStyle.glassEffect?.blur || 12}px)`,
          WebkitBackdropFilter: `blur(${cardStyle.glassEffect?.blur || 12}px)`,
        };

      case "bordered":
        return {
          ...baseStyles,
          borderWidth: cardStyle.borderWidth || 1,
          borderColor: cardStyle.borderColor,
          backgroundColor: cardStyle.backgroundColor,
          borderStyle: "solid",
        };

      case "gradient-border":
        // Border is handled by GradientBorderWrapper
        return {
          ...baseStyles,
          borderWidth: 0,
          backgroundColor: cardStyle.backgroundColor,
        };

      default:
        return {
          ...baseStyles,
          borderWidth: cardStyle.borderWidth,
          borderColor: cardStyle.borderColor,
          backgroundColor: cardStyle.backgroundColor,
        };
    }
  };

  // Check if gradient border should be enabled
  const isGradientBorderEnabled = () => {
    return cardStyle.style === "gradient-border" || cardStyle.gradientBorder?.enabled;
  };

  // Gradient border wrapper
  const GradientBorderWrapper = ({
    children,
    enabled,
  }: {
    children: React.ReactNode;
    enabled: boolean;
  }) => {
    if (!enabled) {
      return <>{children}</>;
    }

    // Default gradient colors if not specified
    const defaultColors = ["#f97316", "#3b82f6"];
    const gradientColors = cardStyle.gradientBorder?.colors?.length
      ? cardStyle.gradientBorder.colors.join(", ")
      : defaultColors.join(", ");
    const angle = cardStyle.gradientBorder?.angle || 135;

    return (
      <div
        className="p-[2px] rounded-[inherit]"
        style={{
          background: `linear-gradient(${angle}deg, ${gradientColors})`,
          borderRadius: cardStyle.borderRadius,
        }}
      >
        {children}
      </div>
    );
  };

  const hoverStyles = getHoverStyles();

  return (
    <div
      className={cn("grid gap-6", columnClasses[gridView.columns])}
      style={{ gap: gridView.gap }}
    >
      {testimonials.map((testimonial, index) => (
        <GradientBorderWrapper
          key={testimonial.id}
          enabled={isGradientBorderEnabled()}
        >
          <Card
            className={cn(
              "relative overflow-hidden group",
              shadowClasses[getEffectiveShadow()],
              hoverStyles.className,
              // Glow effect on hover
              cardStyle.hoverEffect === "glow" && "hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
              // Border color change on hover
              cardStyle.hoverEffect === "border-color" && "hover:!border-primary",
              // Lift effect shadow boost
              cardStyle.hoverEffect === "lift" && "hover:shadow-xl",
              animation.enabled && animation.entrance === "stagger" && "opacity-0 animate-fade-in"
            )}
            style={{
              ...getCardStyles(),
              ...hoverStyles.style,
              animationDelay: animation.enabled ? `${index * animation.staggerDelay}ms` : undefined,
            }}
          >
            <CardContent className="p-0">
              {/* Quote Icon */}
              {gridView.showQuoteIcon && (
                <Quote
                  className={cn(
                    "absolute",
                    quoteIconSizeClasses[gridView.quoteIconSize],
                    quoteIconPositionClasses[gridView.quoteIconPosition]
                  )}
                  style={{ color: gridView.quoteIconColor }}
                />
              )}

              {/* Rating */}
              {content.showRating && (
                <div className="mb-4">
                  <StarRating
                    rating={testimonial.rating}
                    style={content.ratingStyle}
                    color={content.ratingColor}
                    size="sm"
                  />
                </div>
              )}

              {/* Quote Content */}
              <p
                className={cn(
                  "mb-6",
                  quoteFontSizeClasses[content.quoteFontSize],
                  content.quoteStyle === "italic" && "italic"
                )}
                style={{
                  color: content.quoteColor,
                  ...(content.quoteMaxLines > 0
                    ? {
                        display: "-webkit-box",
                        WebkitLineClamp: content.quoteMaxLines,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                    : {}),
                }}
              >
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {avatar.style !== "none" && (
                  <Avatar
                    className={cn(avatarSizeClasses[avatar.size])}
                    style={{
                      borderWidth: avatar.borderWidth,
                      borderColor: avatar.borderColor,
                    }}
                  >
                    {avatar.style === "photo" && testimonial.avatar ? (
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    ) : null}
                    <AvatarFallback
                      className={cn(
                        avatar.shape === "circle" && "rounded-full",
                        avatar.shape === "rounded" && "rounded-lg",
                        avatar.shape === "square" && "rounded-none"
                      )}
                      style={{
                        backgroundColor: avatar.backgroundColor,
                        color: avatar.textColor,
                      }}
                    >
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Name & Info */}
                <div>
                  <p
                    className={cn(
                      nameFontSizeClasses[content.nameFontSize],
                      content.nameFontWeight === "medium" && "font-medium",
                      content.nameFontWeight === "semibold" && "font-semibold",
                      content.nameFontWeight === "bold" && "font-bold"
                    )}
                    style={{ color: content.nameColor }}
                  >
                    {testimonial.name}
                  </p>
                  <p
                    className={infoFontSizeClasses[content.infoFontSize]}
                    style={{ color: content.infoColor }}
                  >
                    {[
                      content.showCompany && testimonial.company,
                      content.showCountry && testimonial.country,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </GradientBorderWrapper>
      ))}
    </div>
  );
}
