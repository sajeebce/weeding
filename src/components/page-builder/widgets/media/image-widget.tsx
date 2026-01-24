"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageWidgetSettings } from "@/lib/page-builder/types";

interface ImageWidgetProps {
  settings: ImageWidgetSettings;
  isPreview?: boolean;
}

export function ImageWidget({ settings, isPreview = false }: ImageWidgetProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    src,
    alt,
    title,
    objectFit,
    aspectRatio,
    maxWidth,
    alignment,
    borderRadius,
    shadow,
    shadowColor,
    border,
    link,
    lightbox,
    caption,
    hoverEffect,
    hoverTransitionDuration,
    overlay,
    animation,
    animationDuration,
    animationDelay,
    floatAnimation,
    parallax,
    mask,
    lazyLoad,
    priority,
    filters,
  } = settings;

  // Normalize URL - add https:// if missing from domain-like URLs
  const normalizeImageUrl = (url: string | undefined): string | undefined => {
    if (!url || url.trim() === "") return undefined;
    // Already a relative path
    if (url.startsWith("/")) return url;
    // Already has protocol
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Looks like a domain (contains . and no spaces) - add https://
    if (url.includes(".") && !url.includes(" ")) {
      return `https://${url}`;
    }
    return url;
  };

  // Check if URL is valid for Image component
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === "") return false;
    // Check if it's a relative path starting with /
    if (url.startsWith("/")) return true;
    // Check if it's a valid absolute URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const normalizedSrc = normalizeImageUrl(src);
  const hasValidSrc = isValidImageUrl(normalizedSrc);

  // Intersection observer for entrance animations
  useEffect(() => {
    if (animation === "none" || !containerRef.current) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [animation]);

  // Parallax effect on scroll
  useEffect(() => {
    if (!parallax?.enabled || !containerRef.current) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = parallax.speed * 0.5;

      if (parallax.direction === "vertical") {
        containerRef.current.style.setProperty("--parallax-y", `${scrolled * rate}px`);
      } else {
        containerRef.current.style.setProperty("--parallax-x", `${scrolled * rate}px`);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallax]);

  // Get shadow class
  const getShadowStyle = (): string => {
    switch (shadow) {
      case "sm": return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
      case "md": return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
      case "lg": return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
      case "xl": return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
      case "2xl": return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
      case "inner": return "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
      case "glow": return `0 0 40px ${shadowColor || "#f97316"}66`;
      default: return "none";
    }
  };

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1:1": return "aspect-square";
      case "4:3": return "aspect-[4/3]";
      case "16:9": return "aspect-video";
      case "3:2": return "aspect-[3/2]";
      case "2:3": return "aspect-[2/3]";
      case "9:16": return "aspect-[9/16]";
      case "21:9": return "aspect-[21/9]";
      default: return "";
    }
  };

  // Get hover effect class
  const getHoverEffectClass = () => {
    if (isPreview) return "";
    switch (hoverEffect) {
      case "zoom": return "group-hover:scale-110";
      case "zoom-out": return "scale-110 group-hover:scale-100";
      case "brighten": return "group-hover:brightness-125";
      case "darken": return "group-hover:brightness-75";
      case "grayscale": return "group-hover:grayscale";
      case "blur": return "group-hover:blur-sm";
      case "rotate": return "group-hover:rotate-3";
      case "tilt-left": return "group-hover:-rotate-2 group-hover:scale-105";
      case "tilt-right": return "group-hover:rotate-2 group-hover:scale-105";
      case "lift": return "group-hover:-translate-y-2";
      default: return "";
    }
  };

  // Get entrance animation class
  const getEntranceAnimationStyle = (): React.CSSProperties => {
    if (!isInView) {
      const baseStyle = {
        opacity: 0,
        transition: `all ${animationDuration}ms ease-out`,
        transitionDelay: `${animationDelay}ms`,
      };

      switch (animation) {
        case "fade": return { ...baseStyle };
        case "slide-up": return { ...baseStyle, transform: "translateY(30px)" };
        case "slide-down": return { ...baseStyle, transform: "translateY(-30px)" };
        case "slide-left": return { ...baseStyle, transform: "translateX(30px)" };
        case "slide-right": return { ...baseStyle, transform: "translateX(-30px)" };
        case "zoom-in": return { ...baseStyle, transform: "scale(0.9)" };
        case "zoom-out": return { ...baseStyle, transform: "scale(1.1)" };
        case "flip": return { ...baseStyle, transform: "rotateY(90deg)" };
        case "rotate": return { ...baseStyle, transform: "rotate(-10deg)" };
        default: return {};
      }
    }

    return {
      opacity: 1,
      transform: "none",
      transition: `all ${animationDuration}ms ease-out`,
      transitionDelay: `${animationDelay}ms`,
    };
  };

  // Get floating animation class
  const getFloatAnimationClass = () => {
    switch (floatAnimation) {
      case "float": return "animate-[float_3s_ease-in-out_infinite]";
      case "pulse": return "animate-pulse";
      case "bounce": return "animate-bounce";
      case "swing": return "animate-[swing_2s_ease-in-out_infinite]";
      case "wobble": return "animate-[wobble_2s_ease-in-out_infinite]";
      default: return "";
    }
  };

  // Get mask class
  const getMaskClass = () => {
    switch (mask) {
      case "circle": return "rounded-full";
      case "rounded-lg": return "rounded-lg";
      case "rounded-xl": return "rounded-xl";
      case "hexagon": return "[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]";
      case "blob": return "[clip-path:polygon(30%_0%,70%_0%,100%_30%,100%_70%,70%_100%,30%_100%,0%_70%,0%_30%)]";
      case "diamond": return "[clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]";
      case "triangle": return "[clip-path:polygon(50%_0%,100%_100%,0%_100%)]";
      default: return "";
    }
  };

  // Get filter style
  const getFilterStyle = (): string => {
    if (!filters) return "none";
    const parts: string[] = [];
    if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
    if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
    if (filters.saturation !== 100) parts.push(`saturate(${filters.saturation}%)`);
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
    if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
    if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
    return parts.length > 0 ? parts.join(" ") : "none";
  };

  // Convert hex color + opacity to rgba
  const hexToRgba = (hex: string, opacity: number): string => {
    // Handle already rgba/rgb values
    if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
    // Remove # if present
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Get alignment class
  const getAlignmentClass = () => {
    switch (alignment) {
      case "left": return "mr-auto";
      case "right": return "ml-auto";
      default: return "mx-auto";
    }
  };

  // Empty state - show when no src or invalid URL
  if (!hasValidSrc) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2",
          "bg-slate-800/50 border-2 border-dashed border-slate-600",
          getAspectRatioClass() || "min-h-[200px]",
          getAlignmentClass()
        )}
        style={{
          borderRadius: `${borderRadius}px`,
          maxWidth: maxWidth ? `${maxWidth}%` : "100%",
        }}
      >
        <ImageIcon className="h-12 w-12 text-slate-500" />
        <span className="text-sm text-slate-500">No image selected</span>
      </div>
    );
  }

  // Main image content
  const imageContent = (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden w-full",
        getAspectRatioClass(),
        getFloatAnimationClass(),
        mask !== "none" && getMaskClass(),
        getAlignmentClass(),
        lightbox && "cursor-pointer"
      )}
      style={{
        borderRadius: mask === "none" ? `${borderRadius}px` : undefined,
        boxShadow: getShadowStyle(),
        border: border.width > 0 ? `${border.width}px ${border.style} ${border.color}` : undefined,
        maxWidth: maxWidth ? `${maxWidth}%` : "100%",
        ...getEntranceAnimationStyle(),
        ...(parallax?.enabled && {
          transform: `translate(var(--parallax-x, 0), var(--parallax-y, 0))`,
        }),
      }}
      onClick={lightbox ? () => setIsLightboxOpen(true) : undefined}
      role={lightbox ? "button" : undefined}
      tabIndex={lightbox ? 0 : undefined}
      onKeyDown={lightbox ? (e) => e.key === "Enter" && setIsLightboxOpen(true) : undefined}
    >
      {/* Main Image */}
      <Image
        src={normalizedSrc!}
        alt={alt || "Image"}
        title={title}
        fill
        className={cn(
          "transition-all",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
          getHoverEffectClass()
        )}
        style={{
          transitionDuration: `${hoverTransitionDuration}ms`,
          filter: getFilterStyle(),
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading={lazyLoad && !priority ? "lazy" : "eager"}
        priority={priority}
      />

      {/* Overlay */}
      {overlay?.enabled && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity",
            overlay.showOnHover && "opacity-0 group-hover:opacity-100"
          )}
          style={{
            backgroundColor: overlay.color,
            opacity: overlay.showOnHover ? undefined : overlay.opacity,
            transitionDuration: `${hoverTransitionDuration}ms`,
          }}
        />
      )}

      {/* Shine effect for hover */}
      {hoverEffect === "shine" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
            transform: "translateX(-100%)",
            animation: "shine 0.6s ease-out forwards",
            transitionDuration: `${hoverTransitionDuration}ms`,
          }}
        />
      )}

      {/* Glow effect for hover */}
      {hoverEffect === "glow" && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
          style={{
            boxShadow: `inset 0 0 60px ${shadowColor || "#f97316"}44`,
            transitionDuration: `${hoverTransitionDuration}ms`,
          }}
        />
      )}

      {/* Caption overlay */}
      {caption?.enabled && caption.text && caption.position !== "below" && (
        <div
          className={cn(
            "absolute left-0 right-0 px-4 py-2 transition-opacity",
            caption.position === "overlay-bottom" && "bottom-0",
            caption.position === "overlay-top" && "top-0",
            caption.position === "overlay-center" && "top-1/2 -translate-y-1/2",
            hoverEffect === "overlay-fade" && "opacity-0 group-hover:opacity-100"
          )}
          style={{
            backgroundColor: hexToRgba(
              caption.backgroundColor || "#000000",
              caption.backgroundOpacity ?? 0.7
            ),
            color: caption.textColor,
            transitionDuration: `${hoverTransitionDuration}ms`,
          }}
        >
          <p
            className={cn(
              "text-center",
              caption.fontSize === "xs" && "text-xs",
              caption.fontSize === "sm" && "text-sm",
              caption.fontSize === "md" && "text-base",
              caption.fontSize === "lg" && "text-lg"
            )}
          >
            {caption.text}
          </p>
        </div>
      )}

    </div>
  );

  // Caption below image
  const captionBelow = caption?.enabled && caption.text && caption.position === "below" && (
    <p
      className={cn(
        "mt-2 text-center",
        caption.fontSize === "xs" && "text-xs",
        caption.fontSize === "sm" && "text-sm",
        caption.fontSize === "md" && "text-base",
        caption.fontSize === "lg" && "text-lg"
      )}
      style={{ color: caption.textColor }}
    >
      {caption.text}
    </p>
  );

  // Lightbox modal
  const lightboxModal = isLightboxOpen && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={() => setIsLightboxOpen(false)}
    >
      <button
        onClick={() => setIsLightboxOpen(false)}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Image
          src={normalizedSrc!}
          alt={alt || "Image"}
          width={1920}
          height={1080}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {caption?.enabled && caption.text && (
          <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-center bg-black/50">
            {caption.text}
          </p>
        )}
      </div>
    </div>
  );

  // Check if link URL is valid for Link component
  const isValidLinkUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === "") return false;
    // Relative paths are valid
    if (url.startsWith("/")) return true;
    // Check if it's a valid absolute URL
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasValidLink = link?.url && isValidLinkUrl(link.url);

  // Wrap with link if provided and valid (don't wrap if lightbox is enabled)
  const wrappedContent = hasValidLink && !lightbox ? (
    <Link
      href={link.url}
      target={link.openInNewTab ? "_blank" : undefined}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      className="block"
    >
      {imageContent}
      {captionBelow}
    </Link>
  ) : (
    <>
      {imageContent}
      {captionBelow}
    </>
  );

  return (
    <>
      {wrappedContent}
      {lightboxModal}
    </>
  );
}
