"use client";

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { DEFAULT_TESTIMONIALS_SETTINGS } from "@/lib/page-builder/defaults";
import { TestimonialsGridView } from "./testimonials-grid-view";
import { TestimonialsCarouselView } from "./testimonials-carousel-view";
import { TestimonialsVideoView } from "./testimonials-video-view";
import { cn } from "@/lib/utils";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

interface TestimonialsWidgetProps {
  settings: Partial<TestimonialsWidgetSettings>;
  isPreview?: boolean;
}

// Deep merge helper for nested objects
function deepMerge<T extends Record<string, any>>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key in overrides) {
    if (overrides[key] !== undefined) {
      if (
        typeof defaults[key] === "object" &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key]) &&
        typeof overrides[key] === "object" &&
        overrides[key] !== null &&
        !Array.isArray(overrides[key])
      ) {
        result[key] = deepMerge(defaults[key], overrides[key] as any);
      } else {
        result[key] = overrides[key] as any;
      }
    }
  }
  return result;
}

// Helper to get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Render star rating
export function StarRating({
  rating,
  style = "stars",
  color = "#facc15",
  size = "sm",
}: {
  rating: number;
  style?: "stars" | "number" | "both";
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (style === "number") {
    return (
      <span className="font-semibold" style={{ color }}>
        {rating.toFixed(1)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(sizeClasses[size], i < rating ? "fill-current" : "fill-none opacity-30")}
            style={{ color }}
          />
        ))}
      </div>
      {style === "both" && (
        <span className="ml-1 text-sm font-medium" style={{ color }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function TestimonialsWidget({ settings: partialSettings, isPreview = false }: TestimonialsWidgetProps) {
  // Merge with defaults to ensure all required properties exist
  const settings = deepMerge(DEFAULT_TESTIMONIALS_SETTINGS, partialSettings);

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch testimonials from database API
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const params = new URLSearchParams({
          limit: settings.dataSource.limit.toString(),
          sortBy: settings.dataSource.sortBy,
        });

        // Add type filter (from dataSource or fallback to widget testimonialType)
        const typeFilter = settings.dataSource.testimonialType || settings.testimonialType || "all";
        if (typeFilter && typeFilter !== "all") {
          params.set("type", typeFilter);
        }

        // Add tags filter
        if (settings.dataSource.filterByTags && settings.dataSource.filterByTags.length > 0) {
          params.set("tags", settings.dataSource.filterByTags.join(","));
        }

        const response = await fetch(`/api/testimonials?${params}`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.testimonials || []);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTestimonials();
  }, [settings.dataSource, settings.testimonialType]);

  // Heading size classes
  const headingSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
  };

  // Description size classes
  const descriptionSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Render highlighted heading
  const renderHeading = () => {
    const heading = settings.header?.heading || DEFAULT_TESTIMONIALS_SETTINGS.header.heading;
    const text = heading.text || DEFAULT_TESTIMONIALS_SETTINGS.header.heading.text;
    const highlightWords = heading.highlightWords;
    const highlightColor = heading.highlightColor || DEFAULT_TESTIMONIALS_SETTINGS.header.heading.highlightColor;
    const size = heading.size || DEFAULT_TESTIMONIALS_SETTINGS.header.heading.size;
    // Use dark color as fallback if white (invisible on light backgrounds)
    const rawColor = heading.color || DEFAULT_TESTIMONIALS_SETTINGS.header.heading.color;
    const color = rawColor === "#ffffff" ? "#0f172a" : rawColor;

    if (!highlightWords) {
      return (
        <h2
          className={cn("font-bold tracking-tight", headingSizeClasses[size])}
          style={{ color }}
        >
          {text}
        </h2>
      );
    }

    const words = highlightWords.split(",").map((w) => w.trim());
    let result = text;

    words.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      result = result.replace(
        regex,
        `<span style="color: ${highlightColor}">$1</span>`
      );
    });

    return (
      <h2
        className={cn("font-bold tracking-tight", headingSizeClasses[size])}
        style={{ color }}
        dangerouslySetInnerHTML={{ __html: result }}
      />
    );
  };

  // Render trust footer
  const renderTrustFooter = () => {
    if (!settings.trustFooter.show) return null;

    const alignmentClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    return (
      <div
        data-field-id="trust-footer"
        className={cn(
          "flex flex-wrap items-center gap-8",
          alignmentClasses[settings.trustFooter.alignment]
        )}
        style={{ marginTop: settings.trustFooter.marginTop }}
      >
        {/* Avatar Stack */}
        {settings.trustFooter.showAvatarStack && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {testimonials.slice(0, settings.trustFooter.avatarStackCount).map((t, i) => (
                <Avatar key={i} className="border-2 border-background h-8 w-8">
                  {t.avatar ? (
                    <AvatarImage src={t.avatar} alt={t.name} />
                  ) : null}
                  <AvatarFallback
                    className="text-xs"
                    style={{
                      backgroundColor: settings.avatar.backgroundColor,
                      color: settings.avatar.textColor,
                    }}
                  >
                    {getInitials(t.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {settings.trustFooter.customerCountText}
            </span>
          </div>
        )}

        {/* Average Rating */}
        {settings.trustFooter.showAverageRating && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.floor(settings.trustFooter.averageRating)
                      ? "fill-current"
                      : "fill-none opacity-30"
                  )}
                  style={{ color: settings.content.ratingColor }}
                />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium">
              {settings.trustFooter.averageRating}/5
            </span>
            <span className="text-sm text-muted-foreground">
              {settings.trustFooter.totalReviews}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Alignment classes for header
  const alignmentClasses = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  };

  // Get header settings with fallbacks
  const header = settings.header || DEFAULT_TESTIMONIALS_SETTINGS.header;
  const headerAlignment = header.alignment || DEFAULT_TESTIMONIALS_SETTINGS.header.alignment;
  const headerMarginBottom = header.marginBottom ?? DEFAULT_TESTIMONIALS_SETTINGS.header.marginBottom;
  const badge = header.badge || DEFAULT_TESTIMONIALS_SETTINGS.header.badge;
  const description = header.description || DEFAULT_TESTIMONIALS_SETTINGS.header.description;

  return (
    <WidgetContainer container={settings.container}>
    <div className="w-full">
      {/* Header Section */}
      {(header.show !== false) && (
        <div
          data-field-id="header"
          className={cn("max-w-2xl", alignmentClasses[headerAlignment])}
          style={{ marginBottom: headerMarginBottom }}
        >
          {/* Badge */}
          {badge.show && (
            <Badge
              variant="secondary"
              className="mb-4"
              style={{
                backgroundColor: badge.bgColor || DEFAULT_TESTIMONIALS_SETTINGS.header.badge.bgColor,
                color: badge.textColor || DEFAULT_TESTIMONIALS_SETTINGS.header.badge.textColor,
                borderColor: badge.borderColor || DEFAULT_TESTIMONIALS_SETTINGS.header.badge.borderColor,
                borderWidth: badge.style === "outline" ? 1 : 0,
              }}
            >
              {badge.text || DEFAULT_TESTIMONIALS_SETTINGS.header.badge.text}
            </Badge>
          )}

          {/* Heading */}
          {renderHeading()}

          {/* Description */}
          {description.show && (
            <p
              className={cn("mt-4", descriptionSizeClasses[description.size || DEFAULT_TESTIMONIALS_SETTINGS.header.description.size])}
              style={{ color: description.color || DEFAULT_TESTIMONIALS_SETTINGS.header.description.color }}
            >
              {description.text || DEFAULT_TESTIMONIALS_SETTINGS.header.description.text}
            </p>
          )}
        </div>
      )}

      {/* Content - Different views based on viewMode */}
      <div data-field-id="testimonials">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Quote className="h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">No testimonials found</p>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {settings.viewMode === "grid" && (
            <TestimonialsGridView
              testimonials={testimonials}
              settings={settings}
              isPreview={isPreview}
            />
          )}

          {/* Carousel View */}
          {(settings.viewMode === "carousel" || settings.viewMode === "masonry") && (
            <TestimonialsCarouselView
              testimonials={testimonials}
              settings={settings}
              isPreview={isPreview}
            />
          )}

          {/* Video Grid View */}
          {settings.viewMode === "video-grid" && (
            <TestimonialsVideoView
              testimonials={testimonials.filter((t) => t.type === "video")}
              settings={settings}
              isPreview={isPreview}
            />
          )}
        </>
      )}
      </div>

      {/* Trust Footer */}
      {renderTrustFooter()}
    </div>
    </WidgetContainer>
  );
}
