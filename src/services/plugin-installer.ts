// Plugin Installation Service
// Handles ZIP extraction, manifest validation, and plugin installation

import fs from "fs/promises";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import prisma from "@/lib/db";

// Plugin directory where extracted plugins are stored
const PLUGINS_DIR = path.join(process.cwd(), "plugins");
const TEMP_DIR = path.join(process.cwd(), ".plugin-temp");

export interface PluginManifest {
  slug: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  authorUrl?: string;
  icon?: string;
  adminMenu?: {
    label: string;
    icon: string;
    position?: number;
    items: Array<{
      label: string;
      path: string;
      icon?: string;
    }>;
  };
  features?: {
    adminPages?: boolean;
    publicPages?: boolean;
    widgets?: boolean;
    apiRoutes?: boolean;
  };
  settings?: Array<{
    key: string;
    value: string;
    type?: string;
  }>;
  manifest?: {
    requires?: { llcpad?: string };
    permissions?: string[];
    widgets?: Array<{
      name: string;
      position: string;
      config?: Record<string, unknown>;
    }>;
    requiresLicense?: boolean;
  };
}

export interface InstallResult {
  success: boolean;
  pluginSlug?: string;
  manifest?: PluginManifest;
  requiresLicense?: boolean;
  error?: string;
}

export interface LicenseVerifyResult {
  valid: boolean;
  error?: string;
  message?: string;
  token?: string;
  features?: string[];
  tier?: string;
  expiresAt?: string;
  supportExpiresAt?: string;
}

/**
 * Plugin Installer Service
 */
export const pluginInstaller = {
  /**
   * Extract and validate plugin ZIP file
   */
  async extractAndValidate(
    zipBuffer: Buffer,
    filename: string
  ): Promise<InstallResult> {
    const tempId = Date.now().toString();
    const tempPath = path.join(TEMP_DIR, tempId);

    try {
      // Ensure temp directory exists
      await fs.mkdir(TEMP_DIR, { recursive: true });
      await fs.mkdir(tempPath, { recursive: true });

      // Write ZIP to temp file
      const zipPath = path.join(tempPath, filename);
      await fs.writeFile(zipPath, zipBuffer);

      // Extract ZIP using built-in decompress or archiver
      const extractPath = path.join(tempPath, "extracted");
      await fs.mkdir(extractPath, { recursive: true });

      // Use dynamic import for archiver/unzipper
      const AdmZip = (await import("adm-zip")).default;
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);

      // Find plugin.json in extracted files
      const manifest = await this.findManifest(extractPath);

      if (!manifest) {
        return {
          success: false,
          error: "No plugin.json found in ZIP file",
        };
      }

      // Validate manifest
      const validation = this.validateManifest(manifest);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Check if plugin already exists
      const existing = await prisma.plugin.findUnique({
        where: { slug: manifest.slug },
      });

      if (existing) {
        return {
          success: false,
          error: `Plugin "${manifest.slug}" is already installed. Uninstall it first to reinstall.`,
        };
      }

      // Store temp path for later installation
      const requiresLicense = manifest.manifest?.requiresLicense !== false;

      return {
        success: true,
        pluginSlug: manifest.slug,
        manifest,
        requiresLicense,
      };
    } catch (error) {
      console.error("Plugin extraction error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Extraction failed",
      };
    }
  },

  /**
   * Find plugin.json manifest in extracted directory
   */
  async findManifest(extractPath: string): Promise<PluginManifest | null> {
    const entries = await fs.readdir(extractPath, { withFileTypes: true });

    // Check root level
    for (const entry of entries) {
      if (entry.name === "plugin.json" && entry.isFile()) {
        const content = await fs.readFile(
          path.join(extractPath, "plugin.json"),
          "utf-8"
        );
        return JSON.parse(content);
      }
    }

    // Check one level deep (common for ZIP containing folder)
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subPath = path.join(extractPath, entry.name, "plugin.json");
        try {
          const content = await fs.readFile(subPath, "utf-8");
          return JSON.parse(content);
        } catch {
          // Not found in this directory
        }
      }
    }

    return null;
  },

  /**
   * Validate plugin manifest
   */
  validateManifest(
    manifest: PluginManifest
  ): { valid: boolean; error?: string } {
    if (!manifest.slug) {
      return { valid: false, error: "Plugin manifest missing 'slug'" };
    }
    if (!manifest.name) {
      return { valid: false, error: "Plugin manifest missing 'name'" };
    }
    if (!manifest.version) {
      return { valid: false, error: "Plugin manifest missing 'version'" };
    }
    if (!/^[a-z0-9-]+$/.test(manifest.slug)) {
      return {
        valid: false,
        error: "Plugin slug must be lowercase alphanumeric with hyphens",
      };
    }
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      return { valid: false, error: "Plugin version must be in semver format" };
    }

    return { valid: true };
  },

  /**
   * Install plugin after license verification
   */
  async install(
    manifest: PluginManifest,
    licenseData?: {
      licenseKey: string;
      token: string;
      tier?: string;
      expiresAt?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create plugin directory
      const pluginPath = path.join(PLUGINS_DIR, manifest.slug);
      await fs.mkdir(PLUGINS_DIR, { recursive: true });

      // Create plugin record in database
      const plugin = await prisma.plugin.create({
        data: {
          slug: manifest.slug,
          name: manifest.name,
          description: manifest.description,
          version: manifest.version,
          author: manifest.author,
          authorUrl: manifest.authorUrl,
          icon: manifest.icon,
          status: "INSTALLED",
          manifest: manifest as any,
          adminMenuLabel: manifest.adminMenu?.label,
          adminMenuIcon: manifest.adminMenu?.icon,
          adminMenuPosition: manifest.adminMenu?.position,
          hasAdminPages: manifest.features?.adminPages ?? false,
          hasPublicPages: manifest.features?.publicPages ?? false,
          hasWidgets: manifest.features?.widgets ?? false,
          hasApiRoutes: manifest.features?.apiRoutes ?? false,
          requiresLicense: manifest.manifest?.requiresLicense !== false,
          licenseKey: licenseData?.licenseKey,
          licenseToken: licenseData?.token,
          licenseType: licenseData?.tier,
          licenseVerifiedAt: licenseData ? new Date() : null,
          licenseExpiresAt: licenseData?.expiresAt
            ? new Date(licenseData.expiresAt)
            : null,
          pluginPath,
          menuItems: manifest.adminMenu?.items
            ? {
                create: manifest.adminMenu.items.map((item, index) => ({
                  label: item.label,
                  path: item.path,
                  icon: item.icon,
                  sortOrder: index,
                })),
              }
            : undefined,
          settings: manifest.settings
            ? {
                create: manifest.settings.map((setting) => ({
                  key: setting.key,
                  value: setting.value,
                  type: setting.type || "string",
                })),
              }
            : undefined,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Plugin installation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Installation failed",
      };
    }
  },

  /**
   * Verify license with license server
   */
  async verifyLicense(
    licenseKey: string,
    pluginSlug: string,
    pluginVersion: string
  ): Promise<LicenseVerifyResult> {
    const licenseServerUrl =
      process.env.LICENSE_SERVER_URL || "https://license.llcpad.com";
    const domain = this.getCurrentDomain();

    try {
      const response = await fetch(`${licenseServerUrl}/api/licenses/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseKey: licenseKey.toUpperCase().trim(),
          domain,
          pluginSlug,
          pluginVersion,
          cmsVersion: process.env.npm_package_version || "1.0.0",
          serverInfo: {
            nodeVersion: process.version,
            os: process.platform,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        return {
          valid: false,
          error: data.error || "VERIFICATION_FAILED",
          message: data.message || "License verification failed",
        };
      }

      return {
        valid: true,
        token: data.token,
        features: data.features,
        tier: data.tier,
        expiresAt: data.license?.expiresAt,
        supportExpiresAt: data.license?.supportExpiresAt,
      };
    } catch (error) {
      console.error("License verification error:", error);

      // For development, allow bypass
      if (process.env.NODE_ENV === "development") {
        console.warn("DEV MODE: Bypassing license verification");
        return {
          valid: true,
          token: "dev-token",
          tier: "DEVELOPER",
          message: "Development mode - license bypassed",
        };
      }

      return {
        valid: false,
        error: "CONNECTION_FAILED",
        message: "Could not connect to license server",
      };
    }
  },

  /**
   * Get current domain for license binding
   */
  getCurrentDomain(): string {
    const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (url) {
      try {
        const parsed = new URL(url);
        return parsed.hostname;
      } catch {
        // Fall through
      }
    }
    return "localhost";
  },

  /**
   * Clean up temporary files
   */
  async cleanup(tempId?: string): Promise<void> {
    try {
      if (tempId) {
        await fs.rm(path.join(TEMP_DIR, tempId), { recursive: true });
      } else {
        // Clean up all temp files older than 1 hour
        const entries = await fs.readdir(TEMP_DIR);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;

        for (const entry of entries) {
          const entryPath = path.join(TEMP_DIR, entry);
          const stat = await fs.stat(entryPath);
          if (stat.mtimeMs < oneHourAgo) {
            await fs.rm(entryPath, { recursive: true });
          }
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  },
};
