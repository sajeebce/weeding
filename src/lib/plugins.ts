import { cache } from "react";
import prisma from "@/lib/db";

/**
 * Plugin utility functions for server-side plugin status checking.
 * Uses React's cache() for request-level memoization - same request won't query DB twice.
 */

/**
 * Get all active plugin slugs (cached per request)
 */
export const getActivePlugins = cache(async (): Promise<string[]> => {
  try {
    const plugins = await prisma.plugin.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true },
    });
    return plugins.map((p) => p.slug);
  } catch (error) {
    console.error("Error fetching active plugins:", error);
    return [];
  }
});

/**
 * Check if a specific plugin is active (cached per request)
 */
export const isPluginActive = cache(async (slug: string): Promise<boolean> => {
  const activePlugins = await getActivePlugins();
  return activePlugins.includes(slug);
});

/**
 * Get active plugin details with menu items (cached per request)
 */
export const getActivePluginDetails = cache(async () => {
  try {
    const plugins = await prisma.plugin.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        slug: true,
        name: true,
        icon: true,
        adminMenuLabel: true,
        adminMenuIcon: true,
        manifest: true,
        menuItems: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return plugins;
  } catch (error) {
    console.error("Error fetching active plugin details:", error);
    return [];
  }
});

/**
 * Get plugin by slug with full details
 */
export const getPluginBySlug = cache(async (slug: string) => {
  try {
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
      include: {
        settings: true,
        menuItems: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return plugin;
  } catch (error) {
    console.error("Error fetching plugin:", error);
    return null;
  }
});

/**
 * Get widgets from active plugins for a specific position
 */
export const getActivePluginWidgets = cache(async (position?: string) => {
  try {
    const plugins = await prisma.plugin.findMany({
      where: { status: "ACTIVE" },
      select: {
        slug: true,
        manifest: true,
      },
    });

    const widgets: Array<{
      pluginSlug: string;
      widgetName: string;
      position: string;
      config: Record<string, unknown>;
    }> = [];

    for (const plugin of plugins) {
      const manifest = plugin.manifest as {
        widgets?: Array<{
          name: string;
          position: string;
          config?: Record<string, unknown>;
        }>;
      } | null;

      if (manifest?.widgets) {
        for (const widget of manifest.widgets) {
          if (!position || widget.position === position) {
            widgets.push({
              pluginSlug: plugin.slug,
              widgetName: widget.name,
              position: widget.position,
              config: widget.config || {},
            });
          }
        }
      }
    }

    return widgets;
  } catch (error) {
    console.error("Error fetching plugin widgets:", error);
    return [];
  }
});
