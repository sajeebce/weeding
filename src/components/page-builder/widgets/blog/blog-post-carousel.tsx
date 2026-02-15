"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { BlogPostCarouselWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_CAROUSEL_SETTINGS } from "@/lib/page-builder/defaults";
import { useBlogData } from "./shared/use-blog-data";
import { BlogCard } from "./shared/blog-card";
import { BlogSectionHeader } from "./shared/blog-section-header";
import { BlogSkeleton } from "./shared/blog-skeleton";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ── Deep merge settings with defaults ────────────────────────────────

function mergeSettings(
  settings: BlogPostCarouselWidgetSettings
): BlogPostCarouselWidgetSettings {
  const d = DEFAULT_BLOG_POST_CAROUSEL_SETTINGS;
  return {
    ...d,
    ...settings,
    header: { ...d.header, ...settings?.header },
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    carousel: {
      ...d.carousel,
      ...settings?.carousel,
      slidesPerView: {
        ...d.carousel.slidesPerView,
        ...settings?.carousel?.slidesPerView,
      },
      autoplay: { ...d.carousel.autoplay, ...settings?.carousel?.autoplay },
      navigation: {
        ...d.carousel.navigation,
        ...settings?.carousel?.navigation,
        arrows: {
          ...d.carousel.navigation.arrows,
          ...settings?.carousel?.navigation?.arrows,
        },
        dots: {
          ...d.carousel.navigation.dots,
          ...settings?.carousel?.navigation?.dots,
        },
      },
    },
    card: {
      ...d.card,
      ...settings?.card,
      image: { ...d.card.image, ...settings?.card?.image },
      categoryBadge: {
        ...d.card.categoryBadge,
        ...settings?.card?.categoryBadge,
      },
      title: { ...d.card.title, ...settings?.card?.title },
      excerpt: { ...d.card.excerpt, ...settings?.card?.excerpt },
      meta: { ...d.card.meta, ...settings?.card?.meta },
      readMore: { ...d.card.readMore, ...settings?.card?.readMore },
    },
  };
}

// ── Props ────────────────────────────────────────────────────────────

interface BlogPostCarouselWidgetProps {
  settings: BlogPostCarouselWidgetSettings;
  isPreview?: boolean;
}

// ── Widget Component ─────────────────────────────────────────────────

export function BlogPostCarouselWidget({
  settings: rawSettings,
}: BlogPostCarouselWidgetProps) {
  const s = mergeSettings(rawSettings);

  // Fetch blog data
  const { posts, loading, error } = useBlogData({
    dataSource: s.dataSource,
  });

  // Build Swiper modules
  const modules = [Navigation, Pagination, Autoplay];

  // Swiper breakpoints for responsive slidesPerView
  const breakpoints = {
    0: {
      slidesPerView: s.carousel.slidesPerView.mobile,
      spaceBetween: s.carousel.spaceBetween,
    },
    768: {
      slidesPerView: s.carousel.slidesPerView.tablet,
      spaceBetween: s.carousel.spaceBetween,
    },
    1024: {
      slidesPerView: s.carousel.slidesPerView.desktop,
      spaceBetween: s.carousel.spaceBetween,
    },
  };

  return (
    <WidgetContainer container={s.container}>
    <div>
      {/* Section Header */}
      <BlogSectionHeader settings={s.header} />

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <BlogSkeleton count={s.carousel.slidesPerView.desktop} layout="carousel" />
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            No articles found
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Check back later for new content
          </p>
        </div>
      )}

      {/* Swiper Carousel */}
      {posts.length > 0 && (
        <div
          className={cn(
            "blog-carousel",
            // Show/hide navigation arrows on hover
            s.carousel.navigation.arrows.showOnHover &&
              "[&_.swiper-button-next]:opacity-0 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:opacity-0 [&_.swiper-button-prev]:transition-opacity [&:hover_.swiper-button-next]:opacity-100 [&:hover_.swiper-button-prev]:opacity-100"
          )}
        >
          <Swiper
            modules={modules}
            breakpoints={breakpoints}
            loop={s.carousel.loop}
            speed={s.carousel.speed}
            navigation={s.carousel.navigation.arrows.enabled}
            pagination={
              s.carousel.navigation.dots.enabled
                ? {
                    clickable: true,
                    type:
                      s.carousel.navigation.dots.style === "lines"
                        ? "progressbar"
                        : "bullets",
                  }
                : false
            }
            autoplay={
              s.carousel.autoplay.enabled
                ? {
                    delay: s.carousel.autoplay.delay,
                    pauseOnMouseEnter: s.carousel.autoplay.pauseOnHover,
                    disableOnInteraction: false,
                  }
                : false
            }
            grabCursor
            className="pb-12"
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id} className="h-auto">
                <div className="h-full">
                  <BlogCard post={post} cardSettings={s.card} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
    </WidgetContainer>
  );
}
