"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BlogFeaturedPostWidgetSettings,
  BlogPostData,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_FEATURED_POST_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ── Deep merge settings with defaults ────────────────────────────────

function mergeSettings(
  settings: BlogFeaturedPostWidgetSettings
): BlogFeaturedPostWidgetSettings {
  const d = DEFAULT_BLOG_FEATURED_POST_SETTINGS;
  return {
    ...d,
    ...settings,
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    image: {
      ...d.image,
      ...settings?.image,
      overlay: { ...d.image.overlay, ...settings?.image?.overlay },
    },
    content: {
      ...d.content,
      ...settings?.content,
      categoryBadge: {
        ...d.content.categoryBadge,
        ...settings?.content?.categoryBadge,
      },
      title: { ...d.content.title, ...settings?.content?.title },
      excerpt: { ...d.content.excerpt, ...settings?.content?.excerpt },
      meta: { ...d.content.meta, ...settings?.content?.meta },
      readMore: { ...d.content.readMore, ...settings?.content?.readMore },
    },
  };
}

// ── Date formatting ──────────────────────────────────────────────────

function formatDate(
  dateStr: string | null,
  format: "relative" | "short" | "long"
): string {
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

  if (format === "short") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadingTime(text: string | null): string {
  if (!text) return "1 min read";
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ── Height classes ───────────────────────────────────────────────────

function getHeightClass(height: string): string {
  switch (height) {
    case "sm":
      return "min-h-[300px] md:min-h-[350px]";
    case "md":
      return "min-h-[350px] md:min-h-[450px]";
    case "lg":
      return "min-h-[400px] md:min-h-[550px]";
    case "xl":
      return "min-h-[500px] md:min-h-[650px]";
    default:
      return "";
  }
}

// ── Title size classes ───────────────────────────────────────────────

function getTitleSizeClass(size: string): string {
  switch (size) {
    case "lg":
      return "text-xl md:text-2xl";
    case "xl":
      return "text-2xl md:text-3xl";
    case "2xl":
      return "text-3xl md:text-4xl";
    case "3xl":
      return "text-4xl md:text-5xl";
    default:
      return "text-2xl md:text-3xl";
  }
}

// ── Excerpt font size ────────────────────────────────────────────────

function getExcerptSizeClass(size: string): string {
  switch (size) {
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    case "lg":
      return "text-lg";
    default:
      return "text-base";
  }
}

// ── Props ────────────────────────────────────────────────────────────

interface BlogFeaturedPostWidgetProps {
  settings: BlogFeaturedPostWidgetSettings;
  isPreview?: boolean;
}

// ── Widget Component ─────────────────────────────────────────────────

export function BlogFeaturedPostWidget({
  settings: rawSettings,
  isPreview,
}: BlogFeaturedPostWidgetProps) {
  const s = mergeSettings(rawSettings);
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured post
  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setError(null);

      try {
        let url: string;

        switch (s.dataSource.source) {
          case "specific":
            if (s.dataSource.postId) {
              url = `/api/blog/${s.dataSource.postId}`;
            } else {
              url = "/api/blog?limit=1";
            }
            break;
          case "category-latest":
            if (s.dataSource.categorySlug) {
              url = `/api/blog?category=${s.dataSource.categorySlug}&limit=1`;
            } else {
              url = "/api/blog?limit=1";
            }
            break;
          case "latest":
          default:
            url = "/api/blog?limit=1";
            break;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch featured post");

        const data = await res.json();

        // Handle single post vs list response
        if (data.posts) {
          setPost(data.posts[0] || null);
        } else if (data.id) {
          setPost(data);
        } else {
          setPost(null);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load featured post"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [s.dataSource.source, s.dataSource.postId, s.dataSource.categorySlug]);

  // Loading skeleton
  if (loading) {
    return (
      <WidgetContainer container={s.container}>
      <div
        className={cn(
          "animate-pulse overflow-hidden bg-slate-200 dark:bg-slate-700",
          getHeightClass(s.height)
        )}
        style={{ borderRadius: s.image.borderRadius }}
      />
      </WidgetContainer>
    );
  }

  // Error
  if (error) {
    return (
      <WidgetContainer container={s.container}>
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-900/10">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
      </WidgetContainer>
    );
  }

  // No post
  if (!post) {
    return (
      <WidgetContainer container={s.container}>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
        <ImageIcon className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No featured post available
        </p>
      </div>
      </WidgetContainer>
    );
  }

  const primaryCategory = post.categories?.[0];
  const postDate = post.publishedAt || post.createdAt;
  const postUrl = `/blog/${post.slug}`;

  // Content rendering
  const contentBlock = (
    <div
      className={cn(
        "flex flex-col gap-3",
        s.content.alignment === "center" && "items-center text-center"
      )}
    >
      {/* Category Badge */}
      {s.content.categoryBadge.show && primaryCategory && (
        <span
          className={cn(
            "inline-block w-fit text-xs font-medium",
            s.content.categoryBadge.style === "pill"
              ? "rounded-full bg-blue-500/90 px-3 py-1 text-white"
              : "rounded bg-blue-500/90 px-2 py-0.5 text-white"
          )}
        >
          {primaryCategory.name}
        </span>
      )}

      {/* Title */}
      <h2
        className={cn(
          "font-bold leading-tight",
          getTitleSizeClass(s.content.title.size),
          s.layout === "overlay"
            ? "text-white"
            : "text-slate-900 dark:text-white"
        )}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: s.content.title.maxLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontWeight: s.content.title.fontWeight,
        }}
      >
        {post.title}
      </h2>

      {/* Excerpt */}
      {s.content.excerpt.show && post.excerpt && (
        <p
          className={cn(
            getExcerptSizeClass(s.content.excerpt.fontSize),
            s.layout === "overlay"
              ? "text-white/80"
              : "text-slate-600 dark:text-slate-400"
          )}
        >
          {post.excerpt.length > s.content.excerpt.maxLength
            ? `${post.excerpt.slice(0, s.content.excerpt.maxLength)}...`
            : post.excerpt}
        </p>
      )}

      {/* Meta */}
      {s.content.meta.show && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3 text-sm",
            s.layout === "overlay"
              ? "text-white/60"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          {s.content.meta.items.map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              {item === "date" && (
                <>
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(postDate, s.content.meta.dateFormat)}
                </>
              )}
              {item === "readingTime" && (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  {estimateReadingTime(post.excerpt)}
                </>
              )}
              {item === "category" && primaryCategory && (
                <>
                  <Tag className="h-3.5 w-3.5" />
                  {primaryCategory.name}
                </>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Read More */}
      {s.content.readMore.show && (
        <div className="mt-1">
          {(s.content.readMore.style === "button-primary" ||
            s.content.readMore.style === "button-outline") && (
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90",
                s.content.readMore.style === "button-primary"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "border border-white/30 text-white hover:bg-white/10"
              )}
            >
              {s.content.readMore.text}
            </span>
          )}
          {s.content.readMore.style === "link" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                s.layout === "overlay"
                  ? "text-white hover:text-white/80"
                  : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
              )}
            >
              {s.content.readMore.text}
            </span>
          )}
          {s.content.readMore.style === "arrow" && (
            <span
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium transition-colors",
                s.layout === "overlay"
                  ? "text-white hover:text-white/80"
                  : "text-blue-600 hover:text-blue-700 dark:text-blue-400"
              )}
            >
              {s.content.readMore.text}
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          )}
        </div>
      )}
    </div>
  );

  // Image element
  const imageElement = (
    <div className="relative h-full w-full overflow-hidden">
      {post.coverImage ? (
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className={cn(
            "object-cover",
            s.image.hoverEffect === "zoom" &&
              "transition-transform duration-700 group-hover:scale-105",
            s.image.hoverEffect === "ken-burns" &&
              "animate-[kenburns_20s_ease-in-out_infinite]"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
          priority
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
          <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
        </div>
      )}

      {/* Image overlay */}
      {s.image.overlay.enabled && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: s.image.overlay.color,
            opacity: s.image.overlay.opacity,
          }}
        />
      )}
    </div>
  );

  // Helper to wrap content in a Link or div
  function WrapLink({
    children,
    className,
    style,
  }: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) {
    if (isPreview) {
      return (
        <div className={className} style={style}>
          {children}
        </div>
      );
    }
    return (
      <Link href={postUrl} className={className} style={style}>
        {children}
      </Link>
    );
  }

  // ── Layout: Overlay ──────────────────────────────────────────────
  if (s.layout === "overlay") {
    return (
      <WidgetContainer container={s.container}>
      <WrapLink
        className={cn(
          "group relative block overflow-hidden",
          getHeightClass(s.height)
        )}
        style={{ borderRadius: s.image.borderRadius }}
      >
        {imageElement}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content positioned at bottom */}
        <div
          className={cn(
            "absolute inset-0 flex items-end p-6 md:p-10",
            s.content.verticalPosition === "top" && "items-start",
            s.content.verticalPosition === "center" && "items-center"
          )}
        >
          <div className="max-w-2xl">{contentBlock}</div>
        </div>
      </WrapLink>
      </WidgetContainer>
    );
  }

  // ── Layout: Split Left / Split Right ─────────────────────────────
  if (s.layout === "split-left" || s.layout === "split-right") {
    const imageOnLeft = s.layout === "split-left";

    return (
      <WidgetContainer container={s.container}>
      <WrapLink
        className={cn(
          "group grid overflow-hidden md:grid-cols-2",
          getHeightClass(s.height)
        )}
        style={{ borderRadius: s.image.borderRadius }}
      >
        {/* Image */}
        <div
          className={cn(
            "relative aspect-video md:aspect-auto",
            !imageOnLeft && "md:order-2"
          )}
        >
          {imageElement}
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex flex-col justify-center p-6 md:p-10",
            !imageOnLeft && "md:order-1",
            "bg-white dark:bg-slate-900"
          )}
        >
          {contentBlock}
        </div>
      </WrapLink>
      </WidgetContainer>
    );
  }

  // ── Layout: Stacked ──────────────────────────────────────────────
  return (
    <WidgetContainer container={s.container}>
    <WrapLink
      className="group block overflow-hidden"
      style={{ borderRadius: s.image.borderRadius }}
    >
      {/* Image on top */}
      <div className="relative aspect-video w-full overflow-hidden">
        {imageElement}
      </div>

      {/* Content below */}
      <div className="p-6 md:p-8">{contentBlock}</div>
    </WrapLink>
    </WidgetContainer>
  );
}
