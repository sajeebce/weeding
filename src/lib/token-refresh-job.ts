/**
 * Token Refresh Job
 *
 * This job periodically checks all plugin license tokens and refreshes
 * them before they expire. This ensures uninterrupted plugin access.
 *
 * Run this job:
 * - On app startup
 * - Via cron (daily)
 * - Manually via API route
 *
 * Token Refresh Flow:
 * 1. Get all active plugins with license tokens
 * 2. Check if token needs refresh (2 days before expiry)
 * 3. Call license server refresh API
 * 4. Update database with new token
 */

import prisma from "@/lib/db";
import { shouldRefreshToken, verifyLicenseToken } from "@/lib/jwt";

const LICENSE_SERVER_URL =
  process.env.LICENSE_SERVER_URL || "http://localhost:3001";

export interface TokenRefreshResult {
  pluginSlug: string;
  pluginName: string;
  status: "REFRESHED" | "SKIPPED" | "FAILED" | "NO_TOKEN";
  message: string;
  oldExpiresAt?: Date;
  newExpiresAt?: Date;
}

export interface TokenRefreshJobResult {
  success: boolean;
  totalPlugins: number;
  refreshed: number;
  skipped: number;
  failed: number;
  results: TokenRefreshResult[];
  timestamp: Date;
}

/**
 * Get current domain from environment
 */
function getCurrentDomain(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  if (url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      // Fall through
    }
  }
  return "localhost";
}

/**
 * Refresh a single token from the license server
 */
async function refreshTokenFromServer(
  currentToken: string,
  domain: string
): Promise<{ valid: boolean; token?: string; expiresAt?: Date; error?: string }> {
  try {
    const response = await fetch(`${LICENSE_SERVER_URL}/api/licenses/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: currentToken,
        domain: domain,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      return {
        valid: false,
        error: data.message || data.error || "Refresh failed",
      };
    }

    return {
      valid: true,
      token: data.token,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    };
  } catch (error) {
    console.error("[TokenRefresh] Server request failed:", error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Refresh token for a single plugin
 */
async function refreshPluginToken(plugin: {
  id: string;
  slug: string;
  name: string;
  licenseToken: string | null;
  licensePublicKey: string | null;
  licensedDomain: string | null;
}): Promise<TokenRefreshResult> {
  // No token to refresh
  if (!plugin.licenseToken) {
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "NO_TOKEN",
      message: "Plugin has no license token",
    };
  }

  // No public key for verification
  if (!plugin.licensePublicKey) {
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "FAILED",
      message: "Plugin has no public key for verification",
    };
  }

  // Check if token needs refresh
  const needsRefresh = await shouldRefreshToken(plugin.licenseToken, plugin.licensePublicKey, 2);

  if (!needsRefresh) {
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "SKIPPED",
      message: "Token does not need refresh yet",
    };
  }

  // Get current token info for logging
  const currentTokenInfo = await verifyLicenseToken(plugin.licenseToken, {
    publicKey: plugin.licensePublicKey,
    skipDomainCheck: true,
  });
  const oldExpiresAt = currentTokenInfo.data?.exp
    ? new Date(currentTokenInfo.data.exp * 1000)
    : undefined;

  // Determine domain for refresh
  const domain = plugin.licensedDomain || getCurrentDomain();

  // Request new token from license server
  const refreshResult = await refreshTokenFromServer(
    plugin.licenseToken,
    domain
  );

  if (!refreshResult.valid || !refreshResult.token) {
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "FAILED",
      message: refreshResult.error || "Failed to refresh token",
      oldExpiresAt,
    };
  }

  // Update database with new token
  try {
    await prisma.plugin.update({
      where: { id: plugin.id },
      data: {
        licenseToken: refreshResult.token,
        licenseVerifiedAt: new Date(),
        licenseExpiresAt: refreshResult.expiresAt,
      },
    });

    console.log(`[TokenRefresh] Successfully refreshed token for ${plugin.slug}`);

    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "REFRESHED",
      message: "Token successfully refreshed",
      oldExpiresAt,
      newExpiresAt: refreshResult.expiresAt,
    };
  } catch (error) {
    console.error(`[TokenRefresh] Database update failed for ${plugin.slug}:`, error);
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "FAILED",
      message: "Database update failed",
      oldExpiresAt,
    };
  }
}

/**
 * Main job function - refresh all plugin tokens
 *
 * Call this from:
 * - API route: POST /api/admin/plugins/refresh-tokens
 * - Server startup
 * - Cron job
 */
export async function runTokenRefreshJob(): Promise<TokenRefreshJobResult> {
  console.log("[TokenRefresh] Starting token refresh job...");

  const startTime = Date.now();
  const results: TokenRefreshResult[] = [];

  try {
    // Get all active plugins that require licenses
    const plugins = await prisma.plugin.findMany({
      where: {
        status: "ACTIVE",
        requiresLicense: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        licenseToken: true,
        licensePublicKey: true,
        licensedDomain: true,
      },
    });

    console.log(`[TokenRefresh] Found ${plugins.length} active licensed plugins`);

    // Process each plugin
    for (const plugin of plugins) {
      const result = await refreshPluginToken(plugin);
      results.push(result);

      // Add small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Calculate summary
    const refreshed = results.filter((r) => r.status === "REFRESHED").length;
    const skipped = results.filter((r) => r.status === "SKIPPED").length;
    const failed = results.filter((r) => r.status === "FAILED").length;

    const duration = Date.now() - startTime;
    console.log(
      `[TokenRefresh] Job completed in ${duration}ms. ` +
        `Refreshed: ${refreshed}, Skipped: ${skipped}, Failed: ${failed}`
    );

    return {
      success: failed === 0,
      totalPlugins: plugins.length,
      refreshed,
      skipped,
      failed,
      results,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[TokenRefresh] Job failed:", error);
    return {
      success: false,
      totalPlugins: 0,
      refreshed: 0,
      skipped: 0,
      failed: 1,
      results: [
        {
          pluginSlug: "*",
          pluginName: "All Plugins",
          status: "FAILED",
          message: error instanceof Error ? error.message : "Job failed",
        },
      ],
      timestamp: new Date(),
    };
  }
}

/**
 * Check a single plugin's token status
 */
export async function checkPluginTokenStatus(
  pluginSlug: string
): Promise<{
  needsRefresh: boolean;
  expiresAt?: Date;
  daysUntilExpiry?: number;
  error?: string;
}> {
  try {
    const plugin = await prisma.plugin.findUnique({
      where: { slug: pluginSlug },
      select: { licenseToken: true, licensePublicKey: true },
    });

    if (!plugin?.licenseToken) {
      return { needsRefresh: false, error: "No token found" };
    }

    if (!plugin?.licensePublicKey) {
      return { needsRefresh: true, error: "No public key found" };
    }

    const result = await verifyLicenseToken(plugin.licenseToken, {
      publicKey: plugin.licensePublicKey,
      skipDomainCheck: true,
    });

    if (!result.valid) {
      return { needsRefresh: true, error: result.error };
    }

    const needsRefresh = await shouldRefreshToken(plugin.licenseToken, plugin.licensePublicKey, 2);
    const expiresAt = result.data?.exp
      ? new Date(result.data.exp * 1000)
      : undefined;

    let daysUntilExpiry: number | undefined;
    if (expiresAt) {
      daysUntilExpiry = Math.floor(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
    }

    return {
      needsRefresh,
      expiresAt,
      daysUntilExpiry,
    };
  } catch (error) {
    return {
      needsRefresh: true,
      error: error instanceof Error ? error.message : "Check failed",
    };
  }
}

/**
 * Force refresh a specific plugin's token
 */
export async function forceRefreshPluginToken(
  pluginSlug: string
): Promise<TokenRefreshResult> {
  const plugin = await prisma.plugin.findUnique({
    where: { slug: pluginSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      licenseToken: true,
      licensePublicKey: true,
      licensedDomain: true,
    },
  });

  if (!plugin) {
    return {
      pluginSlug,
      pluginName: "Unknown",
      status: "FAILED",
      message: "Plugin not found",
    };
  }

  // Force refresh (bypass shouldRefreshToken check)
  if (!plugin.licenseToken) {
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "NO_TOKEN",
      message: "Plugin has no license token",
    };
  }

  const domain = plugin.licensedDomain || getCurrentDomain();
  const refreshResult = await refreshTokenFromServer(plugin.licenseToken, domain);

  if (!refreshResult.valid || !refreshResult.token) {
    return {
      pluginSlug: plugin.slug,
      pluginName: plugin.name,
      status: "FAILED",
      message: refreshResult.error || "Refresh failed",
    };
  }

  await prisma.plugin.update({
    where: { id: plugin.id },
    data: {
      licenseToken: refreshResult.token,
      licenseVerifiedAt: new Date(),
      licenseExpiresAt: refreshResult.expiresAt,
    },
  });

  return {
    pluginSlug: plugin.slug,
    pluginName: plugin.name,
    status: "REFRESHED",
    message: "Token successfully refreshed",
    newExpiresAt: refreshResult.expiresAt,
  };
}
