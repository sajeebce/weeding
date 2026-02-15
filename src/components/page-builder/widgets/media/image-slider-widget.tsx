"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
  EffectCreative,
  Keyboard,
  Mousewheel,
  Thumbs,
  Parallax,
} from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Pause,
  Play,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ImageSliderWidgetSettings,
  SlideItem,
  SlideContentConfig,
  LayerAnimation,
} from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-flip";
import "swiper/css/effect-cards";
import "swiper/css/effect-creative";
import "swiper/css/thumbs";
import "swiper/css/parallax";

interface ImageSliderWidgetProps {
  settings: ImageSliderWidgetSettings;
  isPreview?: boolean;
}

// Ken Burns animation variants
const kenBurnsVariants = {
  "zoom-in-center": "scale(1) translate(0, 0)",
  "zoom-in-left": "scale(1) translate(0, 0)",
  "zoom-in-right": "scale(1) translate(0, 0)",
  "zoom-in-top": "scale(1) translate(0, 0)",
  "zoom-in-bottom": "scale(1) translate(0, 0)",
  "zoom-out-center": "scale(1.15) translate(0, 0)",
  "zoom-out-left": "scale(1.15) translate(-2%, 0)",
  "zoom-out-right": "scale(1.15) translate(2%, 0)",
  "zoom-out-top": "scale(1.15) translate(0, -2%)",
  "zoom-out-bottom": "scale(1.15) translate(0, 2%)",
};

const kenBurnsEndVariants = {
  "zoom-in-center": "scale(1.15) translate(0, 0)",
  "zoom-in-left": "scale(1.15) translate(-2%, 0)",
  "zoom-in-right": "scale(1.15) translate(2%, 0)",
  "zoom-in-top": "scale(1.15) translate(0, -2%)",
  "zoom-in-bottom": "scale(1.15) translate(0, 2%)",
  "zoom-out-center": "scale(1) translate(0, 0)",
  "zoom-out-left": "scale(1) translate(0, 0)",
  "zoom-out-right": "scale(1) translate(0, 0)",
  "zoom-out-top": "scale(1) translate(0, 0)",
  "zoom-out-bottom": "scale(1) translate(0, 0)",
};

// Get random Ken Burns variant
function getRandomKenBurns(direction: "in" | "out" | "random", position: string): string {
  const positions = ["center", "left", "right", "top", "bottom"];
  const actualPosition = position === "random"
    ? positions[Math.floor(Math.random() * positions.length)]
    : position;

  let actualDirection = direction;
  if (direction === "random") {
    actualDirection = Math.random() > 0.5 ? "in" : "out";
  }

  return `zoom-${actualDirection}-${actualPosition}`;
}

// Layer Animation Component
function AnimatedLayer({
  children,
  animation,
  isActive,
  className,
}: {
  children: React.ReactNode;
  animation?: LayerAnimation;
  isActive: boolean;
  className?: string;
}) {
  const getAnimationStyle = (): React.CSSProperties => {
    if (!animation || !isActive) {
      return {
        opacity: 0,
        transform: "translateY(20px)",
      };
    }

    const { type, duration, delay, easing } = animation.in;

    const baseStyle: React.CSSProperties = {
      transition: `all ${duration}ms ${easing}`,
      transitionDelay: `${delay}ms`,
    };

    if (isActive) {
      return {
        ...baseStyle,
        opacity: 1,
        transform: "none",
      };
    }

    // Initial states based on animation type
    switch (type) {
      case "fade":
        return { ...baseStyle, opacity: 0 };
      case "slide-up":
        return { ...baseStyle, opacity: 0, transform: "translateY(30px)" };
      case "slide-down":
        return { ...baseStyle, opacity: 0, transform: "translateY(-30px)" };
      case "slide-left":
        return { ...baseStyle, opacity: 0, transform: "translateX(30px)" };
      case "slide-right":
        return { ...baseStyle, opacity: 0, transform: "translateX(-30px)" };
      case "zoom":
        return { ...baseStyle, opacity: 0, transform: "scale(0.8)" };
      case "zoom-out":
        return { ...baseStyle, opacity: 0, transform: "scale(1.2)" };
      case "rotate":
        return { ...baseStyle, opacity: 0, transform: "rotate(-10deg)" };
      case "flip":
        return { ...baseStyle, opacity: 0, transform: "rotateY(90deg)" };
      case "bounce":
        return { ...baseStyle, opacity: 0, transform: "translateY(30px)" };
      case "elastic":
        return { ...baseStyle, opacity: 0, transform: "scale(0.5)" };
      default:
        return baseStyle;
    }
  };

  return (
    <div className={className} style={getAnimationStyle()}>
      {children}
    </div>
  );
}

// Slide Content Component
function SlideContent({
  content,
  isActive,
}: {
  content: SlideContentConfig;
  isActive: boolean;
}) {
  if (!content.enabled) return null;

  // In flex-col: justify = vertical (main axis), items = horizontal (cross axis)
  const positionClasses: Record<string, string> = {
    "center": "justify-center items-center text-center",
    "top-left": "justify-start items-start",
    "top-center": "justify-start items-center text-center",
    "top-right": "justify-start items-end text-right",
    "center-left": "justify-center items-start",
    "center-right": "justify-center items-end text-right",
    "bottom-left": "justify-end items-start",
    "bottom-center": "justify-end items-center text-center",
    "bottom-right": "justify-end items-end text-right",
  };

  const maxWidthClasses: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  const headlineSizeClasses: Record<string, string> = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
    "2xl": "text-5xl md:text-6xl",
    "3xl": "text-6xl md:text-7xl",
  };

  const subheadlineSizeClasses: Record<string, string> = {
    sm: "text-sm md:text-base",
    md: "text-base md:text-lg",
    lg: "text-lg md:text-xl",
  };

  // Highlight words in headline
  const renderHeadline = (text: string, highlightWords?: string, highlightColor?: string) => {
    if (!highlightWords) return text;

    const words = highlightWords.split(",").map(w => w.trim());
    let result = text;

    words.forEach(word => {
      if (word) {
        const regex = new RegExp(`(${word})`, "gi");
        result = result.replace(
          regex,
          `<span style="color: ${highlightColor || '#f97316'}">$1</span>`
        );
      }
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col z-10",
        positionClasses[content.position]
      )}
      style={{ padding: content.padding }}
    >
      <div className={cn(maxWidthClasses[content.maxWidth], "w-full")}>
        {/* Badge */}
        {content.badge?.show && (
          <AnimatedLayer animation={content.badge.animation} isActive={isActive}>
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4",
                content.badge.style === "pill" && "bg-orange-500/20 text-orange-400 border border-orange-500/30",
                content.badge.style === "outline" && "bg-transparent border border-white/30 text-white",
                content.badge.style === "solid" && "bg-orange-500 text-white"
              )}
            >
              {content.badge.text}
            </div>
          </AnimatedLayer>
        )}

        {/* Headline */}
        {content.headline?.show && (
          <AnimatedLayer animation={content.headline.animation} isActive={isActive}>
            <h2
              className={cn(
                "font-bold leading-tight mb-4",
                headlineSizeClasses[content.headline.size]
              )}
              style={{ color: content.headline.color }}
            >
              {renderHeadline(
                content.headline.text,
                content.headline.highlightWords,
                content.headline.highlightColor
              )}
            </h2>
          </AnimatedLayer>
        )}

        {/* Subheadline */}
        {content.subheadline?.show && (
          <AnimatedLayer animation={content.subheadline.animation} isActive={isActive}>
            <p
              className={cn(
                "mb-6",
                subheadlineSizeClasses[content.subheadline.size]
              )}
              style={{ color: content.subheadline.color }}
            >
              {content.subheadline.text}
            </p>
          </AnimatedLayer>
        )}

        {/* Description */}
        {content.description?.show && (
          <AnimatedLayer animation={content.description.animation} isActive={isActive}>
            <p
              className="text-base mb-6"
              style={{ color: content.description.color }}
            >
              {content.description.text}
            </p>
          </AnimatedLayer>
        )}

        {/* Buttons */}
        {content.buttons?.show && content.buttons.items.length > 0 && (
          <AnimatedLayer animation={content.buttons.animation} isActive={isActive}>
            <div className={cn(
              "flex flex-wrap gap-4",
              content.textAlign === "center" && "justify-center",
              content.textAlign === "right" && "justify-end"
            )}>
              {content.buttons.items.map((button) => (
                <Link
                  key={button.id}
                  href={button.link || "#"}
                  target={button.openInNewTab ? "_blank" : undefined}
                  rel={button.openInNewTab ? "noopener noreferrer" : undefined}
                  className={cn(
                    "px-6 py-3 rounded-lg font-semibold transition-all",
                    button.style === "primary" && "bg-orange-500 text-white hover:bg-orange-600",
                    button.style === "secondary" && "bg-slate-700 text-white hover:bg-slate-600",
                    button.style === "outline" && "border-2 border-white text-white hover:bg-white/10",
                    button.style === "ghost" && "text-white hover:bg-white/10"
                  )}
                >
                  {button.text}
                </Link>
              ))}
            </div>
          </AnimatedLayer>
        )}
      </div>
    </div>
  );
}

export function ImageSliderWidget({ settings, isPreview = false }: ImageSliderWidgetProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(settings.autoplay.enabled);
  const [kenBurnsKeys, setKenBurnsKeys] = useState<Record<number, string>>({});

  // Initialize Ken Burns keys
  useEffect(() => {
    if (settings.kenBurns.enabled) {
      const keys: Record<number, string> = {};
      settings.slides.forEach((_, index) => {
        keys[index] = getRandomKenBurns(
          settings.kenBurns.direction,
          settings.kenBurns.position
        );
      });
      setKenBurnsKeys(keys);
    }
  }, [settings.slides.length, settings.kenBurns]);

  // Handle autoplay toggle
  const toggleAutoplay = useCallback(() => {
    if (swiper) {
      if (isPlaying) {
        swiper.autoplay?.stop();
      } else {
        swiper.autoplay?.start();
      }
      setIsPlaying(!isPlaying);
    }
  }, [swiper, isPlaying]);

  // Get height style - returns object for more complex styling
  const getHeightStyles = (): React.CSSProperties => {
    switch (settings.height) {
      case "viewport":
        return { height: "100vh" };
      case "large":
        return { height: "80vh" };
      case "medium":
        return { height: "60vh" };
      case "small":
        return { height: "40vh" };
      case "auto":
        // For auto, use aspect-ratio to maintain proper proportions
        return {
          height: "auto",
          aspectRatio: "16 / 9",
          minHeight: "300px",
        };
      default:
        return typeof settings.height === "number"
          ? { height: `${settings.height}px` }
          : { height: "60vh" };
    }
  };

  // Get shadow class
  const getShadowClass = (): string => {
    switch (settings.shadow) {
      case "sm": return "shadow-sm";
      case "md": return "shadow-md";
      case "lg": return "shadow-lg";
      case "xl": return "shadow-xl";
      case "2xl": return "shadow-2xl";
      default: return "";
    }
  };

  // Get arrow size
  const getArrowSize = (): number => {
    switch (settings.navigation.arrows.size) {
      case "sm": return 16;
      case "lg": return 28;
      default: return 20;
    }
  };

  // Swiper modules
  const modules = useMemo(() => {
    const mods = [Navigation, Pagination, Keyboard];

    if (settings.autoplay.enabled) mods.push(Autoplay);
    if (settings.navigation.mousewheel) mods.push(Mousewheel);
    if (settings.navigation.thumbnails.enabled) mods.push(Thumbs);
    if (settings.parallax.enabled) mods.push(Parallax);

    // Effect modules
    switch (settings.effect) {
      case "fade": mods.push(EffectFade); break;
      case "cube": mods.push(EffectCube); break;
      case "coverflow": mods.push(EffectCoverflow); break;
      case "flip": mods.push(EffectFlip); break;
      case "cards": mods.push(EffectCards); break;
      case "creative": mods.push(EffectCreative); break;
    }

    return mods;
  }, [settings]);

  // Empty state
  if (settings.slides.length === 0) {
    return (
      <WidgetContainer container={settings.container}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4",
          "bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg"
        )}
        style={{ ...getHeightStyles(), minHeight: "200px" }}
      >
        <ImageIcon className="h-16 w-16 text-slate-500" />
        <span className="text-slate-400">No slides added</span>
      </div>
      </WidgetContainer>
    );
  }

  // Render overlay for slide
  const renderOverlay = (slide: SlideItem) => {
    if (!slide.overlay?.enabled) return null;

    if (slide.overlay.type === "gradient" && slide.overlay.gradient) {
      const { gradient } = slide.overlay;
      const colorStops = gradient.colors
        .map((c) => `${c.color} ${c.position}%`)
        .join(", ");
      const gradientStyle =
        gradient.type === "linear"
          ? `linear-gradient(${gradient.angle || 180}deg, ${colorStops})`
          : `radial-gradient(circle, ${colorStops})`;

      return (
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: gradientStyle,
            opacity: slide.overlay.opacity,
          }}
        />
      );
    }

    return (
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundColor: slide.overlay.color,
          opacity: slide.overlay.opacity,
        }}
      />
    );
  };

  // Determine slidesPerView based on sliderType
  const getSlidesPerView = () => {
    if (settings.sliderType === "carousel") {
      return typeof settings.slidesPerView === "number" ? settings.slidesPerView : 3;
    }
    return 1;
  };

  // Determine if thumbnails should be enabled (auto-enable for gallery type)
  const shouldShowThumbnails = settings.sliderType === "gallery" || settings.navigation.thumbnails.enabled;

  // Determine direction based on sliderType
  const getDirection = (): "horizontal" | "vertical" => {
    return settings.sliderType === "vertical" ? "vertical" : "horizontal";
  };

  return (
    <WidgetContainer container={settings.container}>
    <div
      className={cn(
        "image-slider-widget relative group",
        getShadowClass(),
        settings.overflow === "hidden" ? "overflow-hidden" : "overflow-visible",
        // Hero type: full width
        settings.sliderType === "hero" && "w-full"
      )}
      style={{
        borderRadius: settings.borderRadius,
        ...getHeightStyles(),
      }}
    >
      <Swiper
        // Key forces re-initialization when these settings change
        key={`swiper-${settings.sliderType}-${settings.effect}-${settings.navigation.pagination.type}-${settings.navigation.pagination.enabled}`}
        modules={modules}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        direction={getDirection()}
        effect={settings.effect}
        speed={settings.speed}
        loop={settings.loop}
        slidesPerView={getSlidesPerView()}
        spaceBetween={settings.sliderType === "carousel" ? settings.spaceBetween : 0}
        centeredSlides={settings.sliderType === "carousel" ? settings.centeredSlides : false}
        grabCursor={settings.navigation.grabCursor}
        keyboard={{ enabled: settings.navigation.keyboard }}
        mousewheel={settings.navigation.mousewheel ? { forceToAxis: true } : false}
        parallax={settings.parallax.enabled}
        thumbs={shouldShowThumbnails && thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
        autoplay={
          settings.autoplay.enabled
            ? {
                delay: settings.autoplay.delay,
                pauseOnMouseEnter: settings.autoplay.pauseOnHover,
                disableOnInteraction: settings.autoplay.pauseOnInteraction,
                reverseDirection: settings.autoplay.reverseDirection,
              }
            : false
        }
        navigation={
          settings.navigation.arrows.enabled
            ? {
                prevEl: ".slider-btn-prev",
                nextEl: ".slider-btn-next",
              }
            : false
        }
        pagination={
          settings.navigation.pagination.enabled
            ? {
                clickable: settings.navigation.pagination.clickable,
                type: settings.navigation.pagination.type === "progressbar"
                  ? "progressbar"
                  : settings.navigation.pagination.type === "fraction"
                    ? "fraction"
                    : "bullets",
                dynamicBullets: settings.navigation.pagination.type === "bullets-dynamic",
              }
            : false
        }
        fadeEffect={settings.effect === "fade" ? { crossFade: true } : undefined}
        cubeEffect={
          settings.effect === "cube"
            ? { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 }
            : undefined
        }
        coverflowEffect={
          settings.effect === "coverflow"
            ? { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }
            : undefined
        }
        flipEffect={
          settings.effect === "flip"
            ? { slideShadows: true, limitRotation: true }
            : undefined
        }
        cardsEffect={
          settings.effect === "cards"
            ? { slideShadows: true, perSlideOffset: 8, perSlideRotate: 2 }
            : undefined
        }
        creativeEffect={
          settings.effect === "creative" && settings.creativeEffect
            ? {
                prev: {
                  translate: settings.creativeEffect.prev.translate,
                  rotate: settings.creativeEffect.prev.rotate,
                  scale: settings.creativeEffect.prev.scale,
                  opacity: settings.creativeEffect.prev.opacity,
                },
                next: {
                  translate: settings.creativeEffect.next.translate,
                  rotate: settings.creativeEffect.next.rotate,
                  scale: settings.creativeEffect.next.scale,
                  opacity: settings.creativeEffect.next.opacity,
                },
              }
            : undefined
        }
        breakpoints={
          settings.responsive
            ? {
                0: {
                  slidesPerView: settings.responsive.mobile?.slidesPerView || 1,
                  spaceBetween: settings.responsive.mobile?.spaceBetween || 0,
                },
                768: {
                  slidesPerView: settings.responsive.tablet?.slidesPerView || settings.slidesPerView,
                  spaceBetween: settings.responsive.tablet?.spaceBetween || settings.spaceBetween,
                },
                1024: {
                  slidesPerView: settings.slidesPerView,
                  spaceBetween: settings.spaceBetween,
                },
              }
            : undefined
        }
        className="h-full w-full"
      >
        {settings.slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const kenBurnsKey = kenBurnsKeys[index] || "zoom-in-center";
          const startTransform = kenBurnsVariants[kenBurnsKey as keyof typeof kenBurnsVariants];
          const endTransform = kenBurnsEndVariants[kenBurnsKey as keyof typeof kenBurnsEndVariants];

          return (
            <SwiperSlide key={slide.id} className="relative">
              {/* Background Image with Ken Burns */}
              <div className="absolute inset-0 overflow-hidden">
                {slide.image.src ? (
                  <Image
                    src={slide.image.src}
                    alt={slide.image.alt}
                    fill
                    className={cn(
                      "transition-transform",
                      slide.image.objectFit === "cover" && "object-cover",
                      slide.image.objectFit === "contain" && "object-contain",
                      slide.image.objectFit === "fill" && "object-fill"
                    )}
                    style={{
                      objectPosition: slide.image.objectPosition,
                      transform: settings.kenBurns.enabled && isActive ? endTransform : startTransform,
                      transitionDuration: settings.kenBurns.enabled ? `${settings.kenBurns.duration}ms` : "0ms",
                      transitionTimingFunction: "linear",
                    }}
                    sizes="100vw"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
              </div>

              {/* Overlay */}
              {renderOverlay(slide)}

              {/* Content */}
              {slide.content && (
                <SlideContent content={slide.content} isActive={isActive} />
              )}

              {/* Slide Link */}
              {slide.link?.url && (() => {
                const url = slide.link.url.trim();
                if (!url) return null;

                // Validate URL - relative paths or valid absolute URLs
                const isValid = url.startsWith("/") || (() => {
                  try {
                    new URL(url);
                    return true;
                  } catch {
                    return false;
                  }
                })();

                if (!isValid) return null;

                return (
                  <Link
                    href={url}
                    target={slide.link.openInNewTab ? "_blank" : undefined}
                    rel={slide.link.openInNewTab ? "noopener noreferrer" : undefined}
                    aria-label={slide.link.ariaLabel}
                    className="absolute inset-0 z-20"
                  />
                );
              })()}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Navigation Arrows */}
      {settings.navigation.arrows.enabled && (
        <>
          <button
            className={cn(
              "slider-btn-prev absolute z-20 flex items-center justify-center transition-all",
              // Position: for vertical slider, arrows go top/bottom
              settings.sliderType === "vertical"
                ? settings.navigation.arrows.position === "sides"
                  ? "top-4 left-1/2 -translate-x-1/2"
                  : "top-4 right-4"
                : settings.navigation.arrows.position === "sides"
                  ? "left-4 top-1/2 -translate-y-1/2"
                  : settings.navigation.arrows.position === "bottom"
                    ? "left-1/2 bottom-4 -translate-x-[calc(50%+30px)]"
                    : "right-20 bottom-4",
              settings.navigation.arrows.showOnHover && "opacity-0 group-hover:opacity-100",
              settings.navigation.arrows.style === "default" && "w-10 h-10 rounded-full",
              settings.navigation.arrows.style === "minimal" && "w-8 h-8",
              settings.navigation.arrows.style === "rounded" && "w-12 h-12 rounded-full",
              settings.navigation.arrows.style === "square" && "w-10 h-10 rounded-md",
              settings.navigation.arrows.style === "floating" && "w-12 h-12 rounded-full shadow-lg",
              settings.navigation.arrows.hoverEffect === "scale" && "hover:scale-110",
              settings.navigation.arrows.hoverEffect === "glow" && "hover:shadow-lg hover:shadow-orange-500/30"
            )}
            style={{
              color: settings.navigation.arrows.color || "#ffffff",
              backgroundColor: settings.navigation.arrows.backgroundColor || "rgba(0, 0, 0, 0.5)",
            }}
            aria-label="Previous slide"
          >
            {settings.sliderType === "vertical" ? (
              <ChevronUp size={getArrowSize()} />
            ) : (
              <ChevronLeft size={getArrowSize()} />
            )}
          </button>
          <button
            className={cn(
              "slider-btn-next absolute z-20 flex items-center justify-center transition-all",
              // Position: for vertical slider, arrows go top/bottom
              settings.sliderType === "vertical"
                ? settings.navigation.arrows.position === "sides"
                  ? "bottom-4 left-1/2 -translate-x-1/2"
                  : "bottom-4 right-4"
                : settings.navigation.arrows.position === "sides"
                  ? "right-4 top-1/2 -translate-y-1/2"
                  : settings.navigation.arrows.position === "bottom"
                    ? "left-1/2 bottom-4 -translate-x-[calc(50%-30px)]"
                    : "right-4 bottom-4",
              settings.navigation.arrows.showOnHover && "opacity-0 group-hover:opacity-100",
              settings.navigation.arrows.style === "default" && "w-10 h-10 rounded-full",
              settings.navigation.arrows.style === "minimal" && "w-8 h-8",
              settings.navigation.arrows.style === "rounded" && "w-12 h-12 rounded-full",
              settings.navigation.arrows.style === "square" && "w-10 h-10 rounded-md",
              settings.navigation.arrows.style === "floating" && "w-12 h-12 rounded-full shadow-lg",
              settings.navigation.arrows.hoverEffect === "scale" && "hover:scale-110",
              settings.navigation.arrows.hoverEffect === "glow" && "hover:shadow-lg hover:shadow-orange-500/30"
            )}
            style={{
              color: settings.navigation.arrows.color || "#ffffff",
              backgroundColor: settings.navigation.arrows.backgroundColor || "rgba(0, 0, 0, 0.5)",
            }}
            aria-label="Next slide"
          >
            {settings.sliderType === "vertical" ? (
              <ChevronDown size={getArrowSize()} />
            ) : (
              <ChevronRight size={getArrowSize()} />
            )}
          </button>
        </>
      )}

      {/* Pause/Play Button */}
      {settings.autoplay.enabled && settings.autoplay.showPauseButton && (
        <button
          onClick={toggleAutoplay}
          className={cn(
            "absolute z-20 bottom-4 left-4 w-10 h-10 rounded-full",
            "flex items-center justify-center transition-all",
            "bg-black/30 hover:bg-black/50 text-white"
          )}
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}

      {/* Thumbnail Navigation */}
      {shouldShowThumbnails && (
        <div
          className={cn(
            "absolute z-20",
            settings.navigation.thumbnails.position === "bottom" && "bottom-4 left-1/2 -translate-x-1/2",
            settings.navigation.thumbnails.position === "left" && "left-4 top-1/2 -translate-y-1/2 flex-col",
            settings.navigation.thumbnails.position === "right" && "right-4 top-1/2 -translate-y-1/2 flex-col"
          )}
        >
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={settings.navigation.thumbnails.gap}
            slidesPerView="auto"
            watchSlidesProgress
            direction={settings.navigation.thumbnails.position === "bottom" ? "horizontal" : "vertical"}
            className={cn(
              settings.navigation.thumbnails.position === "bottom" ? "max-w-md" : "max-h-80"
            )}
          >
            {settings.slides.map((slide, index) => (
              <SwiperSlide
                key={`thumb-${slide.id}`}
                className={cn(
                  "cursor-pointer transition-all",
                  settings.navigation.thumbnails.activeStyle === "opacity" &&
                    (index === activeIndex ? "opacity-100" : "opacity-50"),
                  settings.navigation.thumbnails.activeStyle === "scale" &&
                    (index === activeIndex ? "scale-100" : "scale-90"),
                  settings.navigation.thumbnails.activeStyle === "border" &&
                    index === activeIndex && "ring-2 ring-orange-500"
                )}
                style={{
                  width: settings.navigation.thumbnails.size,
                  height: settings.navigation.thumbnails.aspectRatio === "1:1"
                    ? settings.navigation.thumbnails.size
                    : settings.navigation.thumbnails.aspectRatio === "16:9"
                      ? settings.navigation.thumbnails.size * 9 / 16
                      : settings.navigation.thumbnails.size * 3 / 4,
                }}
              >
                {slide.image.src ? (
                  <Image
                    src={slide.image.src}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes={`${settings.navigation.thumbnails.size}px`}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center">
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Custom Pagination Styles */}
      <style jsx global>{`
        /* Dots/Bullets */
        .image-slider-widget .swiper-pagination-bullet {
          background-color: ${settings.navigation.pagination.inactiveColor || "rgba(255, 255, 255, 0.5)"};
          opacity: 1;
          width: 10px;
          height: 10px;
          margin: 0 4px !important;
        }
        .image-slider-widget .swiper-pagination-bullet-active {
          background-color: ${settings.navigation.pagination.activeColor || "#f97316"};
        }

        /* Dynamic Bullets */
        .image-slider-widget .swiper-pagination-bullets-dynamic .swiper-pagination-bullet {
          transform: scale(0.6);
        }
        .image-slider-widget .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active {
          transform: scale(1);
        }
        .image-slider-widget .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev,
        .image-slider-widget .swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next {
          transform: scale(0.8);
        }

        /* Progress Bar */
        .image-slider-widget .swiper-pagination-progressbar {
          background-color: ${settings.navigation.pagination.inactiveColor || "rgba(255, 255, 255, 0.3)"};
          position: absolute;
          ${settings.navigation.pagination.position === "top" ? "top: 0; bottom: auto;" : "bottom: 0; top: auto;"}
          left: 0;
          right: 0;
          height: 4px;
        }
        .image-slider-widget .swiper-pagination-progressbar-fill {
          background-color: ${settings.navigation.pagination.activeColor || "#f97316"};
        }

        /* Fraction */
        .image-slider-widget .swiper-pagination-fraction {
          color: ${settings.navigation.pagination.activeColor || "#ffffff"};
          font-size: 14px;
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        /* Pagination Position */
        .image-slider-widget .swiper-pagination {
          position: absolute;
          ${settings.navigation.pagination.position === "top"
            ? "top: 16px; bottom: auto;"
            : settings.navigation.pagination.position === "left"
              ? "left: 16px; right: auto; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; width: auto;"
              : settings.navigation.pagination.position === "right"
                ? "right: 16px; left: auto; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; width: auto;"
                : "bottom: 16px; top: auto;"}
        }

        /* Vertical pagination for left/right positions */
        .image-slider-widget .swiper-pagination-vertical .swiper-pagination-bullet {
          margin: 4px 0 !important;
        }
      `}</style>
    </div>
    </WidgetContainer>
  );
}
