"use client";

import { useState, useEffect } from "react";
import type { PublicFooterResponse, FooterWidget } from "@/lib/header-footer/types";

interface UseFooterConfigResult {
  config: PublicFooterResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Default fallback config
const defaultConfig: PublicFooterResponse = {
  id: "default",
  layout: "MULTI_COLUMN",
  columns: 4,
  widgets: [],
  newsletter: {
    enabled: true,
    title: "Subscribe to our newsletter",
    subtitle: "Get updates on new services and offers",
  },
  social: {
    show: true,
    position: "brand",
  },
  contact: {
    show: true,
    position: "brand",
  },
  bottomBar: {
    enabled: true,
    showDisclaimer: true,
    links: [],
  },
  trustBadges: {
    show: false,
    badges: [],
  },
  styling: {
    paddingTop: 48,
    paddingBottom: 32,
  },
};

export function useFooterConfig(): UseFooterConfigResult {
  const [config, setConfig] = useState<PublicFooterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/footer", {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });

      if (!response.ok) {
        throw new Error("Failed to fetch footer config");
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Error fetching footer config:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      // Use default config on error
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config: config || defaultConfig,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}

// Helper to group widgets by column
export function getWidgetsByColumn(widgets: FooterWidget[], column: number): FooterWidget[] {
  return widgets.filter((w) => w.column === column).sort((a, b) => a.sortOrder - b.sortOrder);
}

// Helper to get all links from a LINKS widget
// Note: Public API returns 'links', admin API returns 'menuItems'
export function getWidgetLinks(widget: FooterWidget): { id: string; label: string; url: string }[] {
  if (widget.type !== "LINKS") {
    return [];
  }

  // Check for 'links' first (public API format), then 'menuItems' (admin API format)
  const items = (widget as unknown as { links?: { id: string; label: string; url: string }[] }).links || widget.menuItems;

  if (!items || items.length === 0) {
    return [];
  }

  return items.map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url || "#",
  }));
}
