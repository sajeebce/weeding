"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogPostListWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_BLOG_POST_LIST_SETTINGS } from "@/lib/page-builder/defaults";
import { useBlogData } from "./shared/use-blog-data";
import { BlogSectionHeader } from "./shared/blog-section-header";
import { BlogSkeleton } from "./shared/blog-skeleton";
import { BlogPagination } from "./shared/blog-pagination";
import { FileText } from "lucide-react";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ── Deep merge settings with defaults ────────────────────────────────

function mergeSettings(
  settings: BlogPostListWidgetSettings
): BlogPostListWidgetSettings {
  const d = DEFAULT_BLOG_POST_LIST_SETTINGS;
  return {
    ...d,
    ...settings,
    header: { ...d.header, ...settings?.header },
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    layout: {
      ...d.layout,
      ...settings?.layout,
      divider: { ...d.layout.divider, ...settings?.layout?.divider },
    },
    item: {
      ...d.item,
      ...settings?.item,
      image: { ...d.item.image, ...settings?.item?.image },
      categoryBadge: {
        ...d.item.categoryBadge,
        ...settings?.item?.categoryBadge,
      },
      title: { ...d.item.title, ...settings?.item?.title },
      excerpt: { ...d.item.excerpt, ...settings?.item?.excerpt },
      meta: { ...d.item.meta, ...settings?.item?.meta },
    },
    pagination: { ...d.pagination, ...settings?.pagination },
  };
}

// ── Date formatting ──────────────────────────────────────────────────

function formatDate(dateStr: string | null, format: "relative" | "short"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  if (format === "relative") {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingTime(text: string | null): string {
  if (!text) return "1 min read";
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ── Image width mapping ──────────────────────────────────────────────

function getImageWidthPercent(width: "small" | "medium" | "large"): string {
  switch (width) {
    case "small":
      return "25%";
    case "medium":
      return "33%";
    case "large":
      return "40%";
    default:
      return "33%";
  }
}

// ── Aspect ratio class ───────────────────────────────────────────────

function getAspectRatioClass(ratio: string): string {
  switch (ratio) {
    case "1:1":
      return "aspect-square";
    case "4:3":
      return "aspect-4/3";
    case "16:9":
      return "aspect-video";
    default:
      return "aspect-4/3";
  }
}

// ── Hover effect class ───────────────────────────────────────────────

function getItemHoverClass(effect: string): string {
  switch (effect) {
    case "highlight":
      return "hover:bg-slate-50 dark:hover:bg-slate-800/50";
    case "shift-right":
      return "hover:translate-x-1";
    default:
      return "";
  }
}

// ── Props ────────────────────────────────────────────────────────────

interface BlogPostListWidgetProps {
  settings: BlogPostListWidgetSettings;
  isPreview?: boolean;
}

// ── Widget Component ─────────────────────────────────────────────────

export function BlogPostListWidget({
  settings: rawSettings,
}: BlogPostListWidgetProps) {
  const s = mergeSettings(rawSettings);

  const { posts, total, hasMore, loading, error, loadMore } = useBlogData({
    dataSource: s.dataSource,
  });

  // Determine image position per item index
  function getImagePosition(
    index: number
  ): "left" | "right" | "none" {
    if (s.layout.imagePosition === "none") return "none";
    if (s.layout.imagePosition === "alternating") {
      return index % 2 === 0 ? "left" : "right";
    }
    return s.layout.imagePosition;
  }

  return (
    <WidgetContainer container={s.container}>
    <div>
      {/* Section Header */}
      <BlogSectionHeader settings={s.header} />

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <BlogSkeleton count={s.dataSource.postCount} layout="list" />
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

      {/* Posts List */}
      {posts.length > 0 && (
        <div className="flex flex-col" style={{ gap: `${s.layout.gap}px` }}>
          {posts.map((post, index) => {
            const imgPos = getImagePosition(index);
            const primaryCategory = post.categories?.[0];
            const postDate = post.publishedAt || post.createdAt;
            const showImage = s.item.image.show && imgPos !== "none";

            return (
              <div key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className={cn(
                    "group flex flex-col gap-4 rounded-lg p-2 transition-all duration-200 sm:flex-row sm:items-start",
                    getItemHoverClass(s.item.hoverEffect),
                    imgPos === "right" && "sm:flex-row-reverse"
                  )}
                >
                  {/* Image */}
                  {showImage && (
                    <div
                      className="shrink-0 w-full sm:w-auto"
                      style={{
                        maxWidth: "100%",
                        // Apply width on sm+ screens
                      }}
                    >
                      <div
                        className={cn(
                          "relative overflow-hidden",
                          getAspectRatioClass(s.item.image.aspectRatio)
                        )}
                        style={{
                          borderRadius: s.item.image.borderRadius,
                          width: "100%",
                        }}
                      >
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className={cn(
                              "object-cover",
                              s.item.image.hoverEffect === "zoom" &&
                                "transition-transform duration-500 group-hover:scale-110"
                            )}
                            sizes="(max-width: 640px) 100vw, 200px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-2">
                    {/* Category Badge */}
                    {s.item.categoryBadge.show && primaryCategory && (
                      <span
                        className={cn(
                          "inline-block w-fit text-xs font-medium",
                          s.item.categoryBadge.style === "pill"
                            ? "rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "text-blue-600 dark:text-blue-400"
                        )}
                      >
                        {primaryCategory.name}
                      </span>
                    )}

                    {/* Title */}
                    <h3
                      className={cn(
                        "text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400",
                        s.item.title.fontSize === "sm" && "text-sm",
                        s.item.title.fontSize === "md" && "text-base",
                        s.item.title.fontSize === "lg" && "text-lg",
                        s.item.title.fontWeight === 500 && "font-medium",
                        s.item.title.fontWeight === 600 && "font-semibold",
                        s.item.title.fontWeight === 700 && "font-bold"
                      )}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: s.item.title.maxLines,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {s.item.excerpt.show && post.excerpt && (
                      <p
                        className={cn(
                          "text-slate-600 dark:text-slate-400",
                          s.item.excerpt.fontSize === "xs" && "text-xs",
                          s.item.excerpt.fontSize === "sm" && "text-sm",
                          s.item.excerpt.fontSize === "md" && "text-base"
                        )}
                      >
                        {post.excerpt.length > s.item.excerpt.maxLength
                          ? `${post.excerpt.slice(0, s.item.excerpt.maxLength)}...`
                          : post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    {s.item.meta.show && (
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400",
                          s.item.meta.fontSize === "xs" && "text-xs",
                          s.item.meta.fontSize === "sm" && "text-sm"
                        )}
                      >
                        {s.item.meta.items.map((item) => (
                          <span key={item} className="flex items-center gap-1">
                            {item === "date" && (
                              <>
                                <Calendar className="h-3 w-3" />
                                {formatDate(postDate, s.item.meta.dateFormat)}
                              </>
                            )}
                            {item === "category" && primaryCategory && (
                              <>
                                <Tag className="h-3 w-3" />
                                {primaryCategory.name}
                              </>
                            )}
                            {item === "readingTime" && (
                              <>
                                <Clock className="h-3 w-3" />
                                {estimateReadingTime(post.excerpt)}
                              </>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Divider */}
                {s.layout.divider.show && index < posts.length - 1 && (
                  <div
                    className="mt-0"
                    style={{
                      marginTop: `${s.layout.gap / 2}px`,
                      borderBottom: `1px ${s.layout.divider.style} ${s.layout.divider.color || "#e2e8f0"}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Responsive image width styles */}
      {posts.length > 0 && s.item.image.show && s.layout.imagePosition !== "none" && (
        <style>{`
          @media (min-width: 640px) {
            .blog-post-list-img {
              width: ${getImageWidthPercent(s.layout.imageWidth)};
            }
          }
        `}</style>
      )}

      {/* Pagination */}
      <BlogPagination
        type={s.pagination.type}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
        loadMoreText={s.pagination.loadMoreText}
        total={total}
        current={posts.length}
      />
    </div>
    </WidgetContainer>
  );
}
