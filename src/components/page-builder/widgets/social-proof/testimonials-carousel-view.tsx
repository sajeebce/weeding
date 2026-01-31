"use client";

import { useState, useRef } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { getInitials, StarRating } from "./testimonials-widget";
import { cn } from "@/lib/utils";

interface TestimonialsCarouselViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

export function TestimonialsCarouselView({
  testimonials,
  settings,
  isPreview,
}: TestimonialsCarouselViewProps) {
  const { carouselView, cardStyle, avatar, content } = settings;
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = testimonials.length;

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Arrow button size classes
  const arrowSizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const arrowIconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Quote font size classes
  const quoteFontSizeClasses = {
    sm: "text-sm md:text-base",
    md: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
  };

  // Avatar size for split layout
  const splitAvatarSizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  };

  // Card shadow classes
  const shadowClasses: Record<string, string> = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  // Generate card styles based on cardStyle.style
  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: cardStyle.borderRadius,
      padding: cardStyle.padding,
    };

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
    className,
  }: {
    children: React.ReactNode;
    enabled: boolean;
    className?: string;
  }) => {
    if (!enabled) {
      return <div className={className}>{children}</div>;
    }

    const defaultColors = ["#f97316", "#3b82f6"];
    const gradientColors = cardStyle.gradientBorder?.colors?.length
      ? cardStyle.gradientBorder.colors.join(", ")
      : defaultColors.join(", ");
    const angle = cardStyle.gradientBorder?.angle || 135;

    return (
      <div
        className={cn("p-[2px]", className)}
        style={{
          background: `linear-gradient(${angle}deg, ${gradientColors})`,
          borderRadius: cardStyle.borderRadius,
        }}
      >
        {children}
      </div>
    );
  };

  // Get hover classes
  const getHoverClasses = () => {
    switch (cardStyle.hoverEffect) {
      case "lift":
        return "transition-all duration-300 hover:-translate-y-2 hover:shadow-xl";
      case "glow":
        return "transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]";
      case "scale":
        return "transition-transform duration-300 hover:scale-[1.03]";
      case "border-color":
        return "transition-colors duration-300 hover:!border-primary";
      default:
        return "";
    }
  };

  const currentTestimonial = testimonials[currentIndex];

  // Render Standard Carousel
  const renderStandardCarousel = () => (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
            <GradientBorderWrapper
              enabled={isGradientBorderEnabled()}
              className="mx-auto max-w-2xl"
            >
              <Card
                className={cn(
                  shadowClasses[cardStyle.shadow || "none"],
                  getHoverClasses()
                )}
                style={getCardStyles()}
              >
              <CardContent className="p-8 text-center">
                {/* Rating */}
                {content.showRating && (
                  <div className="mb-6 flex justify-center">
                    <StarRating
                      rating={testimonial.rating}
                      style={content.ratingStyle}
                      color={content.ratingColor}
                      size="md"
                    />
                  </div>
                )}

                {/* Quote */}
                <p
                  className={cn(
                    "mb-6",
                    quoteFontSizeClasses[content.quoteFontSize],
                    content.quoteStyle === "italic" && "italic"
                  )}
                  style={{ color: content.quoteColor }}
                >
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-center gap-3">
                  {avatar.style !== "none" && (
                    <Avatar
                      className={splitAvatarSizeClasses[avatar.size]}
                      style={{
                        borderWidth: avatar.borderWidth,
                        borderColor: avatar.borderColor,
                      }}
                    >
                      {avatar.style === "photo" && testimonial.avatar ? (
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      ) : null}
                      <AvatarFallback
                        style={{
                          backgroundColor: avatar.backgroundColor,
                          color: avatar.textColor,
                        }}
                      >
                        {getInitials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="text-left">
                    <p
                      className="font-medium"
                      style={{ color: content.nameColor }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="text-sm"
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
          </div>
        ))}
      </div>
    </div>
  );

  // Render Split Layout Carousel (large photo on one side)
  const renderSplitCarousel = () => {
    const photoPosition = carouselView.splitLayout?.photoPosition || "left";
    const photoSize = carouselView.splitLayout?.photoSize || "50";

    return (
      <div className="relative overflow-hidden">
        <GradientBorderWrapper enabled={isGradientBorderEnabled()} className="">
          <Card
            className={cn(
              "overflow-hidden",
              shadowClasses[cardStyle.shadow || "none"],
              getHoverClasses()
            )}
            style={getCardStyles()}
          >
          <CardContent className="p-0">
            <div
              className={cn(
                "flex flex-col md:flex-row",
                photoPosition === "right" && "md:flex-row-reverse"
              )}
            >
              {/* Photo Side */}
              <div
                className="relative aspect-square md:aspect-auto bg-muted"
                style={{ flex: `0 0 ${photoSize}%` }}
              >
                {currentTestimonial?.avatar ? (
                  <img
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ backgroundColor: avatar.backgroundColor }}
                  >
                    <span
                      className="text-6xl font-bold"
                      style={{ color: avatar.textColor }}
                    >
                      {currentTestimonial && getInitials(currentTestimonial.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Side */}
              <div className="flex flex-1 flex-col justify-center p-8 md:p-12">
                {/* Rating */}
                {content.showRating && currentTestimonial && (
                  <div className="mb-4">
                    <StarRating
                      rating={currentTestimonial.rating}
                      style={content.ratingStyle}
                      color={content.ratingColor}
                      size="md"
                    />
                  </div>
                )}

                {/* Quote */}
                {currentTestimonial && (
                  <p
                    className={cn(
                      "mb-6 text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed",
                      content.quoteStyle === "italic" && "italic"
                    )}
                    style={{ color: content.quoteColor }}
                  >
                    {currentTestimonial.content}
                  </p>
                )}

                {/* Author */}
                {currentTestimonial && (
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: content.nameColor }}
                    >
                      — {currentTestimonial.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: content.infoColor }}
                    >
                      {[
                        content.showCompany && currentTestimonial.company,
                        content.showCountry && currentTestimonial.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </GradientBorderWrapper>
      </div>
    );
  };

  // Render navigation arrows
  const renderArrows = () => {
    if (!carouselView.navigation.arrows.enabled) return null;

    const { arrows } = carouselView.navigation;
    const positionClasses = {
      sides: "absolute inset-y-0 flex items-center",
      bottom: "mt-6 flex justify-center gap-2",
      "bottom-right": "mt-6 flex justify-end gap-2",
    };

    const ArrowButton = ({
      direction,
      onClick,
    }: {
      direction: "prev" | "next";
      onClick: () => void;
    }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn(
          arrowSizeClasses[arrows.size],
          "rounded-full transition-all",
          arrows.showOnHover && "opacity-0 group-hover:opacity-100"
        )}
        style={{
          color: arrows.color,
          backgroundColor: arrows.backgroundColor,
        }}
      >
        {direction === "prev" ? (
          <ChevronLeft className={arrowIconSizeClasses[arrows.size]} />
        ) : (
          <ChevronRight className={arrowIconSizeClasses[arrows.size]} />
        )}
      </Button>
    );

    if (arrows.position === "sides") {
      return (
        <>
          <div className={cn(positionClasses.sides, "left-0")}>
            <ArrowButton direction="prev" onClick={goToPrev} />
          </div>
          <div className={cn(positionClasses.sides, "right-0")}>
            <ArrowButton direction="next" onClick={goToNext} />
          </div>
        </>
      );
    }

    return (
      <div className={positionClasses[arrows.position]}>
        <ArrowButton direction="prev" onClick={goToPrev} />
        <ArrowButton direction="next" onClick={goToNext} />
      </div>
    );
  };

  // Render pagination dots
  const renderPagination = () => {
    if (!carouselView.navigation.pagination.enabled) return null;

    const { pagination } = carouselView.navigation;

    if (pagination.type === "fraction") {
      return (
        <div className="mt-6 text-center text-sm">
          <span style={{ color: pagination.activeColor }}>{currentIndex + 1}</span>
          <span style={{ color: pagination.inactiveColor }}> / {totalSlides}</span>
        </div>
      );
    }

    if (pagination.type === "progressbar") {
      return (
        <div
          className="mt-6 h-1 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: pagination.inactiveColor }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              backgroundColor: pagination.activeColor,
              width: `${((currentIndex + 1) / totalSlides) * 100}%`,
            }}
          />
        </div>
      );
    }

    // Dots
    return (
      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-200",
              index === currentIndex ? "w-6" : ""
            )}
            style={{
              backgroundColor:
                index === currentIndex
                  ? pagination.activeColor
                  : pagination.inactiveColor,
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="group relative">
      {/* Carousel Content */}
      {carouselView.layout === "split" ? renderSplitCarousel() : renderStandardCarousel()}

      {/* Navigation */}
      {renderArrows()}
      {renderPagination()}
    </div>
  );
}
