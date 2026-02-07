/**
 * Plugin Guard - Server-side Access Control
 *
 * This module provides secure access control for plugin pages.
 * It implements a 5-layer anti-null protection system:
 *
 * 1. Database Flag Check - Plugin must be ACTIVE
 * 2. JWT Token Verification - RSA-256 signature validation
 * 3. Domain Lock Verification - License bound to domain
 * 4. License Expiry Check - Actual license validity
 * 5. Feature-Level Access - Tier-based feature gating
 *
 * Usage in page:
 * ```tsx
 * import { verifyPluginAccess } from "@/lib/plugin-guard";
 * import { notFound } from "next/navigation";
 *
 * export default async function TicketsPage() {
 *   const access = await verifyPluginAccess("livesupport-pro");
 *   if (!access.allowed) notFound();
 *   return <TicketsContent features={access.features} />;
 * }
 * ```
 */

import { cache } from "react";
import prisma from "@/lib/db";
import { verifyLicenseToken, shouldRefreshToken } from "@/lib/jwt";

export interface PluginAccessResult {
  allowed: boolean;
  pluginName?: string;
  tier?: string | null;
  features: string[];
  reason?:
    | "PLUGIN_NOT_FOUND"
    | "PLUGIN_INACTIVE"
    | "NO_LICENSE_TOKEN"
    | "NO_PUBLIC_KEY"
    | "TOKEN_INVALID"
    | "TOKEN_EXPIRED"
    | "DOMAIN_MISMATCH"
    | "LICENSE_EXPIRED"
    | "FEATURE_NOT_AVAILABLE";
  message?: string;
  needsRefresh?: boolean;
}

/**
 * Verify access to a plugin's pages
 *
 * This function implements multi-layer security:
 * - Layer 1: Database status check
 * - Layer 2: JWT token signature verification (RSA-256)
 * - Layer 3: Domain lock validation
 * - Layer 4: License expiry check
 *
 * @param pluginSlug - The plugin slug (e.g., "livesupport-pro")
 * @returns Access result with features if allowed
 */
export const verifyPluginAccess = cache(
  async (pluginSlug: string): Promise<PluginAccessResult> => {
    try {
      // Layer 1: Database check - is plugin installed and active?
      const plugin = await prisma.plugin.findUnique({
        where: { slug: pluginSlug },
        select: {
          id: true,
          name: true,
          status: true,
          licenseKey: true,
          licenseToken: true,
          licensePublicKey: true, // RSA public key for token verification
          licenseTier: true,
          licenseExpiresAt: true,
          requiresLicense: true,
        },
      });

      if (!plugin) {
        return {
          allowed: false,
          features: [],
          reason: "PLUGIN_NOT_FOUND",
          message: "Plugin is not installed",
        };
      }

      if (plugin.status !== "ACTIVE") {
        return {
          allowed: false,
          pluginName: plugin.name,
          features: [],
          reason: "PLUGIN_INACTIVE",
          message: "Plugin is not activated",
        };
      }

      // For plugins that don't require license (free plugins)
      if (!plugin.requiresLicense) {
        return {
          allowed: true,
          pluginName: plugin.name,
          tier: "FREE",
          features: ["basic"],
        };
      }

      // Layer 2 & 3: JWT token verification (signature + domain)
      if (!plugin.licenseToken) {
        return {
          allowed: false,
          pluginName: plugin.name,
          features: [],
          reason: "NO_LICENSE_TOKEN",
          message: "License verification required",
        };
      }

      if (!plugin.licensePublicKey) {
        return {
          allowed: false,
          pluginName: plugin.name,
          features: [],
          reason: "NO_PUBLIC_KEY",
          message: "License public key not found. Please re-activate the plugin.",
        };
      }

      const tokenResult = await verifyLicenseToken(plugin.licenseToken, {
        publicKey: plugin.licensePublicKey,
      });

      if (!tokenResult.valid) {
        // Map JWT error to access error
        let reason: PluginAccessResult["reason"] = "TOKEN_INVALID";

        if (tokenResult.reason === "TOKEN_EXPIRED") {
          reason = "TOKEN_EXPIRED";
        } else if (tokenResult.reason === "DOMAIN_MISMATCH") {
          reason = "DOMAIN_MISMATCH";
        }

        return {
          allowed: false,
          pluginName: plugin.name,
          features: [],
          reason,
          message: tokenResult.error || "License verification failed",
        };
      }

      // Layer 4: Check license expiry (from database as backup)
      if (plugin.licenseExpiresAt && plugin.licenseExpiresAt < new Date()) {
        return {
          allowed: false,
          pluginName: plugin.name,
          features: [],
          reason: "LICENSE_EXPIRED",
          message: "Your license has expired. Please renew to continue.",
        };
      }

      // Check if token needs refresh soon
      const needsRefresh = await shouldRefreshToken(plugin.licenseToken, plugin.licensePublicKey);

      // All checks passed - return access with features
      return {
        allowed: true,
        pluginName: plugin.name,
        tier: tokenResult.data?.tier || plugin.licenseTier,
        features: tokenResult.data?.features || [],
        needsRefresh,
      };
    } catch (error) {
      console.error("[PluginGuard] Error verifying access:", error);
      return {
        allowed: false,
        features: [],
        reason: "TOKEN_INVALID",
        message: "An error occurred while verifying access",
      };
    }
  }
);

/**
 * Check if a specific feature is available for a plugin
 *
 * @param pluginSlug - The plugin slug
 * @param feature - The feature to check
 * @returns true if feature is available
 */
export const hasPluginFeature = cache(
  async (pluginSlug: string, feature: string): Promise<boolean> => {
    const access = await verifyPluginAccess(pluginSlug);

    if (!access.allowed) return false;

    return access.features.includes(feature);
  }
);

/**
 * Get plugin tier
 *
 * @param pluginSlug - The plugin slug
 * @returns Tier name or null
 */
export const getPluginTier = cache(
  async (pluginSlug: string): Promise<string | null> => {
    const access = await verifyPluginAccess(pluginSlug);
    return access.tier || null;
  }
);

/**
 * Quick check if plugin is simply active (for menu/UI visibility)
 * This is a lightweight check without full JWT verification
 *
 * @param pluginSlug - The plugin slug
 * @returns true if plugin is active
 */
export const isPluginEnabled = cache(async (pluginSlug: string): Promise<boolean> => {
  try {
    const plugin = await prisma.plugin.findUnique({
      where: { slug: pluginSlug },
      select: { status: true },
    });

    return plugin?.status === "ACTIVE";
  } catch {
    return false;
  }
});

/**
 * Require plugin access - throws if not allowed
 * Use this in API routes for clean error handling
 *
 * @param pluginSlug - The plugin slug
 * @throws Error if access denied
 */
export async function requirePluginAccess(pluginSlug: string): Promise<PluginAccessResult> {
  const access = await verifyPluginAccess(pluginSlug);

  if (!access.allowed) {
    const error = new Error(access.message || "Plugin access denied");
    (error as any).code = access.reason;
    (error as any).status = 403;
    throw error;
  }

  return access;
}

/**
 * Require a specific feature - throws if not available
 *
 * @param pluginSlug - The plugin slug
 * @param feature - Required feature
 * @throws Error if feature not available
 */
export async function requireFeature(
  pluginSlug: string,
  feature: string
): Promise<void> {
  const hasFeature = await hasPluginFeature(pluginSlug, feature);

  if (!hasFeature) {
    const error = new Error(
      `Feature "${feature}" requires a higher license tier`
    );
    (error as any).code = "FEATURE_NOT_AVAILABLE";
    (error as any).status = 403;
    throw error;
  }
}

/**
 * Get all features for a plugin
 *
 * @param pluginSlug - The plugin slug
 * @returns Array of enabled features
 */
export const getPluginFeatures = cache(
  async (pluginSlug: string): Promise<string[]> => {
    const access = await verifyPluginAccess(pluginSlug);
    return access.features;
  }
);

/**
 * Check multiple plugins at once (for dashboard)
 *
 * @param pluginSlugs - Array of plugin slugs
 * @returns Map of slug to access result
 */
export async function checkMultiplePlugins(
  pluginSlugs: string[]
): Promise<Map<string, PluginAccessResult>> {
  const results = new Map<string, PluginAccessResult>();

  await Promise.all(
    pluginSlugs.map(async (slug) => {
      const access = await verifyPluginAccess(slug);
      results.set(slug, access);
    })
  );

  return results;
}
