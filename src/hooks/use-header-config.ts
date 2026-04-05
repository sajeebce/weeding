"use client";

import { useState, useEffect } from "react";
import type { PublicHeaderResponse, MenuItem } from "@/lib/header-footer/types";

interface UseHeaderConfigResult {
  config: PublicHeaderResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Default fallback config matching the original hardcoded values
const defaultConfig: PublicHeaderResponse = {
  id: "default",
  layout: "DEFAULT",
  sticky: true,
  transparent: false,
  height: 64,
  logo: {
    position: "LEFT",
    maxHeight: 36,
  },
  menu: [],
  cta: [
    {
      text: "Get Started",
      url: "/services/llc-formation",
      variant: "primary",
    },
  ],
  auth: {
    showButtons: true,
    loginText: "Sign In",
    registerText: "Get Started",
    registerUrl: "/services/llc-formation",
  },
  search: {
    enabled: false,
  },
  languageSwitcher: {
    enabled: false,
  },
  styling: {},
};

export function useHeaderConfig(): UseHeaderConfigResult {
  const [config, setConfig] = useState<PublicHeaderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/header", {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });

      if (!response.ok) {
        throw new Error("Failed to fetch header config");
      }

      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Error fetching header config:", err);
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

// Helper function to convert flat menu items to mega menu categories
export function getMegaMenuCategories(menu: MenuItem[]): {
  name: string;
  description: string;
  icon: string;
  services: {
    name: string;
    href: string;
    popular?: boolean;
  }[];
}[] {
  // Find the Services menu item with mega menu enabled
  const servicesItem = menu.find((item) => item.isMegaMenu && item.children && item.children.length > 0);

  if (!servicesItem || !servicesItem.children) {
    return [];
  }

  // Convert children to categories format
  return servicesItem.children.map((category) => ({
    name: category.categoryName || category.label,
    description: category.categoryDesc || "",
    icon: category.categoryIcon || "folder",
    services: (category.children || []).map((service) => ({
      name: service.label,
      href: service.url || "#",
      popular: !!service.badge,
    })),
  }));
}

// Helper to get main navigation items (non-mega menu)
export function getMainNavigation(menu: MenuItem[]): {
  name: string;
  href: string;
  hasDropdown: boolean;
}[] {
  return menu
    .filter((item) => item.isVisible && !item.parentId)
    .map((item) => ({
      name: item.label,
      href: item.url || "#",
      hasDropdown: item.isMegaMenu,
    }));
}
