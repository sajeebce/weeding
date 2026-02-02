// src/lib/license/verify.ts
// License verification for CodeCanyon plugin

import crypto from "crypto";

interface LicenseResult {
  valid: boolean;
  message: string;
  expiresAt?: Date;
  features?: string[];
}

// Envato license verification API (placeholder)
// In production, this would verify against Envato API or your own license server
const VERIFICATION_ENDPOINT =
  process.env.LICENSE_VERIFICATION_URL || "https://api.envato.com/v3/market";

/**
 * Verify a license key
 */
export async function verifyLicense(
  licenseKey: string,
  domain?: string
): Promise<LicenseResult> {
  // If no license key is provided, check environment
  const key = licenseKey || process.env.PLUGIN_LICENSE_KEY;

  if (!key) {
    return {
      valid: false,
      message: "No license key provided. Please configure PLUGIN_LICENSE_KEY in .env",
    };
  }

  // Basic format validation
  if (!isValidLicenseFormat(key)) {
    return {
      valid: false,
      message: "Invalid license key format",
    };
  }

  // For development/testing, allow bypass with specific key
  if (process.env.NODE_ENV === "development" && key === "DEV_LICENSE_KEY") {
    return {
      valid: true,
      message: "Development license active",
      features: ["all"],
    };
  }

  try {
    // Verify against license server (this is a placeholder)
    // In production, implement actual Envato API verification
    const response = await fetch(`${VERIFICATION_ENDPOINT}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ENVATO_PERSONAL_TOKEN || ""}`,
      },
      body: JSON.stringify({
        license_key: key,
        domain: domain || process.env.NEXTAUTH_URL,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        message: "License verified successfully",
        expiresAt: data.supported_until ? new Date(data.supported_until) : undefined,
        features: data.features || ["standard"],
      };
    }

    // If server is unavailable, use local verification as fallback
    return localVerify(key);
  } catch (error) {
    console.error("License verification error:", error);
    // Fall back to local verification
    return localVerify(key);
  }
}

/**
 * Local verification fallback (for offline/development use)
 * This uses a simple checksum-based validation
 */
function localVerify(key: string): LicenseResult {
  // Check if it's a valid format and has correct checksum
  const parts = key.split("-");
  if (parts.length !== 5) {
    return { valid: false, message: "Invalid license format" };
  }

  // Simple checksum validation (last segment should match hash of first 4)
  const baseKey = parts.slice(0, 4).join("-");
  const checksum = parts[4];
  const expectedChecksum = crypto
    .createHash("md5")
    .update(baseKey + "llcpad-secret")
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();

  if (checksum === expectedChecksum) {
    return {
      valid: true,
      message: "License verified (local)",
      features: ["standard"],
    };
  }

  return { valid: false, message: "Invalid license key" };
}

/**
 * Check if license key has valid format (XXXXX-XXXXX-XXXXX-XXXXX-CHECKSUM)
 */
function isValidLicenseFormat(key: string): boolean {
  const regex = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{8}$/;
  return regex.test(key.toUpperCase());
}

/**
 * Generate a license key (for admin use)
 */
export function generateLicenseKey(): string {
  const segments: string[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars

  // Generate 4 segments of 5 characters each
  for (let i = 0; i < 4; i++) {
    let segment = "";
    for (let j = 0; j < 5; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  // Generate checksum
  const baseKey = segments.join("-");
  const checksum = crypto
    .createHash("md5")
    .update(baseKey + "llcpad-secret")
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();

  return `${baseKey}-${checksum}`;
}

/**
 * Middleware to check license on protected routes
 */
export function requireLicense(features?: string[]) {
  return async function middleware() {
    const result = await verifyLicense("");

    if (!result.valid) {
      throw new Error(`License verification failed: ${result.message}`);
    }

    if (features && result.features) {
      const hasAllFeatures = features.every(
        (f) => result.features!.includes(f) || result.features!.includes("all")
      );

      if (!hasAllFeatures) {
        throw new Error("Your license does not include the required features");
      }
    }

    return result;
  };
}
