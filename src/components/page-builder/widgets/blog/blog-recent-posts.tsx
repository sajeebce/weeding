"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  BlogRecentPostsWidgetSettings,
  BlogPostData,
} from "@/lib/page-builder/types";
import { DEFAULT_BLOG_RECENT_POSTS_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";

// ── Deep merge settings with defaults ────────────────────────────────

function mergeSettings(
  settings: BlogRecentPostsWidgetSettings
): BlogRecentPostsWidgetSettings {
  const d = DEFAULT_BLOG_RECENT_POSTS_SETTINGS;
  return {
    ...d,
    ...settings,
    header: { ...d.header, ...settings?.header },
    dataSource: { ...d.dataSource, ...settings?.dataSource },
    display: {
      ...d.display,
      ...settings?.display,
      thumbnail: { ...d.display.thumbnail, ...settings?.display?.thumbnail },
      divider: { ...d.display.divider, ...settings?.display?.divider },
    },
    viewAllLink: { ...d.viewAllLink, ...settings?.viewAllLink },
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

// ── Header size classes ──────────────────────────────────────────────

function getHeaderSizeClass(size: string): string {
  switch (size) {
    case "sm":
      return "text-base";
    case "md":
      return "text-lg";
    case "lg":
      return "text-xl";
    default:
      return "text-lg";
  }
}

// ── Title font size classes ──────────────────────────────────────────

function getTitleSizeClass(size: string): string {
  switch (size) {
    case "xs":
      return "text-xs";
    case "sm":
      return "text-sm";
    case "md":
      return "text-base";
    default:
      return "text-sm";
  }
}

// ── Date font size classes ───────────────────────────────────────────

function getDateSizeClass(size: string): string {
  switch (size) {
    case "xs":
      return "text-xs";
    case "sm":
      return "text-sm";
    default:
      return "text-xs";
  }
}

// ── Props ────────────────────────────────────────────────────────────

interface BlogRecentPostsWidgetProps {
  settings: BlogRecentPostsWidgetSettings;
  isPreview?: boolean;
}

// ── Widget Component ─────────────────────────────────────────────────

export function BlogRecentPostsWidget({
  settings: rawSettings,
}: BlogRecentPostsWidgetProps) {
  const s = mergeSettings(rawSettings);
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);

  // Simple fetch for recent posts
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(s.dataSource.postCount));
        params.set("orderBy", s.dataSource.orderBy === "random" ? "random" : "date");
        params.set("orderDir", "desc");

        if (s.dataSource.categories && s.dataSource.categories.length > 0) {
          params.set("category", s.dataSource.categories[0]);
        }

        const res = await fetch(`/api/blog?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setPosts(data.posts || []);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [s.dataSource.postCount, s.dataSource.orderBy, s.dataSource.categories]);

  // Loading skeleton
  if (loading) {
    return (
      <WidgetContainer container={s.container}>
      <div className="space-y-3">
        {s.header.show && (
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        )}
        {Array.from({ length: s.dataSource.postCount }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            {s.display.style === "thumbnail" && (
              <div className="h-12 w-12 shrink-0 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            )}
            <div className="flex flex-1 flex-col gap-1.5">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
      </WidgetContainer>
    );
  }

  if (posts.length === 0) return null;

  return (
    <WidgetContainer container={s.container}>
    <div>
      {/* Header */}
      {s.header.show && (
        <h3
          className={cn(
            "mb-4 font-semibold text-slate-900 dark:text-white",
            getHeaderSizeClass(s.header.size)
          )}
          style={{ color: s.header.color || undefined }}
        >
          {s.header.text}
        </h3>
      )}

      {/* Posts List */}
      <div className="flex flex-col" style={{ gap: `${s.display.itemGap}px` }}>
        {posts.map((post, index) => {
          const postDate = post.publishedAt || post.createdAt;
          const primaryCategory = post.categories?.[0];

          return (
            <div key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-start gap-3 transition-colors"
              >
                {/* Numbered prefix */}
                {s.display.style === "numbered" && (
                  <span className="shrink-0 text-2xl font-bold leading-tight text-slate-200 dark:text-slate-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}

                {/* Thumbnail */}
                {s.display.style === "thumbnail" && (
                  <div
                    className="relative shrink-0 overflow-hidden"
                    style={{
                      width: s.display.thumbnail.size,
                      height: s.display.thumbnail.size,
                      borderRadius: s.display.thumbnail.borderRadius,
                    }}
                  >
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes={`${s.display.thumbnail.size}px`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <ImageIcon className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col gap-0.5">
                  {/* Title */}
                  <h4
                    className={cn(
                      "font-medium text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400",
                      getTitleSizeClass(s.display.titleFontSize)
                    )}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: s.display.titleMaxLines,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.title}
                  </h4>

                  {/* Date (for title-date, title-meta, thumbnail styles) */}
                  {(s.display.style === "title-date" ||
                    s.display.style === "title-meta" ||
                    s.display.style === "thumbnail") && (
                    <span
                      className={cn(
                        "text-slate-500 dark:text-slate-400",
                        getDateSizeClass(s.display.dateFontSize)
                      )}
                    >
                      {formatDate(postDate, s.display.dateFormat)}
                    </span>
                  )}

                  {/* Category (for title-meta style) */}
                  {s.display.style === "title-meta" && primaryCategory && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {primaryCategory.name}
                    </span>
                  )}
                </div>
              </Link>

              {/* Divider */}
              {s.display.divider.show && index < posts.length - 1 && (
                <div
                  className="mt-2"
                  style={{
                    marginTop: `${s.display.itemGap / 2}px`,
                    borderBottom: `1px solid ${s.display.divider.color || "#e2e8f0"}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {s.viewAllLink.show && (
        <div className="mt-4">
          <Link
            href={s.viewAllLink.url}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            style={{ color: s.viewAllLink.color || undefined }}
          >
            {s.viewAllLink.text}
          </Link>
        </div>
      )}
    </div>
    </WidgetContainer>
  );
}
