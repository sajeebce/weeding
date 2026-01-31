"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { TestimonialsWidgetSettings, TestimonialItem } from "@/lib/page-builder/types";
import { getInitials } from "./testimonials-widget";
import { cn } from "@/lib/utils";

interface TestimonialsVideoViewProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsWidgetSettings;
  isPreview?: boolean;
}

export function TestimonialsVideoView({
  testimonials,
  settings,
  isPreview,
}: TestimonialsVideoViewProps) {
  const { videoView, avatar, content, animation } = settings;
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // Filter only video testimonials
  const videoTestimonials = testimonials.filter(
    (t) => t.type === "video" && (t.videoUrl || t.thumbnailUrl)
  );

  // Column classes
  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  // Aspect ratio classes
  const aspectRatioClasses = {
    "9:16": "aspect-[9/16]",
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "4:5": "aspect-[4/5]",
  };

  // Play button size classes
  const playButtonSizeClasses = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-18 w-18",
  };

  const playIconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  // Play button style classes
  const getPlayButtonClass = () => {
    switch (videoView.playButtonStyle) {
      case "minimal":
        return "bg-transparent border-2 border-white";
      case "circle":
        return "bg-white/90 backdrop-blur-sm";
      case "rounded":
        return "bg-white/90 backdrop-blur-sm rounded-xl";
      default:
        return "bg-black/50 backdrop-blur-sm";
    }
  };

  // Hover effect classes
  const getHoverEffectClass = () => {
    switch (videoView.hoverEffect) {
      case "scale":
        return "transition-transform duration-300 hover:scale-105";
      case "brightness":
        return "transition-all duration-300 hover:brightness-110";
      case "overlay-fade":
        return "group";
      default:
        return "";
    }
  };

  // Get video embed URL
  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return url;
  };

  // Open video modal
  const openVideo = (videoUrl: string) => {
    if (isPreview) return;
    setActiveVideo(videoUrl);
  };

  // Close video modal
  const closeVideo = () => {
    setActiveVideo(null);
  };

  return (
    <>
      <div
        className={cn(
          "grid",
          columnClasses[videoView.columns],
          videoView.darkTheme ? "bg-black/95 -mx-4 px-4 py-8 rounded-2xl" : ""
        )}
        style={{ gap: videoView.gap }}
      >
        {videoTestimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={cn(
              "relative overflow-hidden rounded-2xl",
              getHoverEffectClass(),
              animation.enabled && "opacity-0 animate-fade-in"
            )}
            style={{
              animationDelay: animation.enabled
                ? `${index * animation.staggerDelay}ms`
                : undefined,
            }}
          >
            {/* Thumbnail */}
            <div
              className={cn(
                "relative cursor-pointer overflow-hidden",
                aspectRatioClasses[videoView.thumbnailAspectRatio]
              )}
              onClick={() => testimonial.videoUrl && openVideo(testimonial.videoUrl)}
            >
              {/* Thumbnail Image */}
              {testimonial.thumbnailUrl ? (
                <img
                  src={testimonial.thumbnailUrl}
                  alt={testimonial.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900" />
              )}

              {/* Overlay */}
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  videoView.hoverEffect === "overlay-fade"
                    ? "opacity-0 group-hover:opacity-100"
                    : ""
                )}
                style={{
                  backgroundColor: videoView.overlayColor,
                  opacity: videoView.overlayOpacity,
                }}
              />

              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className={cn(
                    "flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110",
                    playButtonSizeClasses[videoView.playButtonSize],
                    getPlayButtonClass()
                  )}
                  style={{ color: videoView.playButtonColor }}
                  aria-label={`Play ${testimonial.name}'s testimonial`}
                >
                  <Play
                    className={cn(playIconSizeClasses[videoView.playButtonSize], "ml-1")}
                    fill="currentColor"
                  />
                </button>
              </div>

              {/* Gradient overlay for text */}
              {videoView.showCustomerInfo && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4" />
              )}
            </div>

            {/* Customer Info */}
            {videoView.showCustomerInfo && (
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-white/20">
                    {testimonial.avatar ? (
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    ) : null}
                    <AvatarFallback
                      className="text-xs"
                      style={{
                        backgroundColor: avatar.backgroundColor,
                        color: avatar.textColor,
                      }}
                    >
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name & Info */}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-white/70">
                      {[testimonial.company, testimonial.country]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeVideo}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={closeVideo}
          >
            <X className="h-6 w-6" />
          </Button>

          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getEmbedUrl(activeVideo)}
              className="h-full w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}
