/**
 * JWT Verification Library
 * Handles RSA-256 signed token verification for plugin licenses
 *
 * Security: This uses RSA-256 asymmetric encryption.
 * - License server signs tokens with PRIVATE key (secret)
 * - CMS verifies tokens with PUBLIC key (stored in database per-plugin)
 * - Tokens cannot be forged without the private key
 */

import { jwtVerify, importSPKI, JWTPayload } from "jose";

export interface LicenseTokenPayload extends JWTPayload {
  licenseKey: string;
  domain: string;
  tier: string;
  features: string[];
  pluginSlug: string;
  domainLockMode: "LOCKED" | "UNLOCKED";
  licenseExpiresAt?: string;
  supportExpiresAt?: string;
}

export interface JWTVerifyResult {
  valid: boolean;
  data?: LicenseTokenPayload;
  error?: string;
  reason?:
    | "INVALID_SIGNATURE"
    | "TOKEN_EXPIRED"
    | "DOMAIN_MISMATCH"
    | "PARSE_ERROR"
    | "NO_TOKEN"
    | "NO_PUBLIC_KEY";
}

/**
 * Get the current domain from environment
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
 * Verify a JWT token signed by the license server
 *
 * This function:
 * 1. Verifies the RSA-256 signature (cannot be forged)
 * 2. Checks token expiration
 * 3. Validates domain lock (if enabled)
 *
 * @param token - The JWT token to verify
 * @param options - Verification options including publicKey (required)
 * @returns Verification result with decoded payload if valid
 */
export async function verifyLicenseToken(
  token: string | null | undefined,
  options?: {
    publicKey?: string; // RSA public key (PEM format) from database
    skipDomainCheck?: boolean;
    currentDomain?: string;
  }
): Promise<JWTVerifyResult> {
  if (!token) {
    return {
      valid: false,
      error: "No token provided",
      reason: "NO_TOKEN",
    };
  }

  if (!options?.publicKey) {
    return {
      valid: false,
      error: "No public key provided for verification",
      reason: "NO_PUBLIC_KEY",
    };
  }

  try {
    // Import the public key from database (stored per-plugin)
    const publicKey = await importSPKI(options.publicKey, "RS256");

    // Verify the token
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ["RS256"],
    });

    const data = payload as LicenseTokenPayload;

    // Check domain lock if enabled
    if (!options?.skipDomainCheck && data.domainLockMode === "LOCKED") {
      const currentDomain = options?.currentDomain || getCurrentDomain();

      // Allow localhost in development
      const isDev =
        process.env.NODE_ENV === "development" &&
        (currentDomain === "localhost" || currentDomain === "127.0.0.1");

      if (!isDev && data.domain !== currentDomain && data.domain !== "*") {
        console.warn(
          `[License] Domain mismatch: token for ${data.domain}, current ${currentDomain}`
        );
        return {
          valid: false,
          error: `License is registered for ${data.domain}, not ${currentDomain}`,
          reason: "DOMAIN_MISMATCH",
          data,
        };
      }
    }

    // Check license expiry (separate from token expiry)
    if (data.licenseExpiresAt) {
      const licenseExpiry = new Date(data.licenseExpiresAt);
      if (licenseExpiry < new Date()) {
        return {
          valid: false,
          error: "License has expired",
          reason: "TOKEN_EXPIRED",
          data,
        };
      }
    }

    return {
      valid: true,
      data,
    };
  } catch (error) {
    // Handle specific JWT errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("expired")) {
      return {
        valid: false,
        error: "Token has expired, please re-verify your license",
        reason: "TOKEN_EXPIRED",
      };
    }

    if (
      errorMessage.includes("signature") ||
      errorMessage.includes("invalid")
    ) {
      return {
        valid: false,
        error: "Invalid token signature",
        reason: "INVALID_SIGNATURE",
      };
    }

    console.error("[JWT] Verification error:", errorMessage);
    return {
      valid: false,
      error: "Failed to verify token",
      reason: "PARSE_ERROR",
    };
  }
}

/**
 * Check if a token is close to expiring (needs refresh)
 *
 * @param token - The JWT token to check
 * @param publicKey - RSA public key for verification
 * @param thresholdDays - Days before expiry to consider "close" (default: 2)
 * @returns true if token should be refreshed soon
 */
export async function shouldRefreshToken(
  token: string | null | undefined,
  publicKey: string | null | undefined,
  thresholdDays: number = 2
): Promise<boolean> {
  if (!token || !publicKey) return true;

  try {
    const result = await verifyLicenseToken(token, { publicKey, skipDomainCheck: true });

    if (!result.valid) return true;

    // Check token expiry (exp claim)
    if (result.data?.exp) {
      const expiryTime = result.data.exp * 1000; // Convert to milliseconds
      const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
      const shouldRefresh = expiryTime - Date.now() < thresholdMs;

      return shouldRefresh;
    }

    return false;
  } catch {
    return true;
  }
}

/**
 * Get token age in days
 *
 * @param token - The JWT token
 * @param publicKey - RSA public key for verification
 * @returns Number of days since token was issued, or null if invalid
 */
export async function getTokenAgeDays(
  token: string | null | undefined,
  publicKey: string | null | undefined
): Promise<number | null> {
  if (!token || !publicKey) return null;

  try {
    const result = await verifyLicenseToken(token, { publicKey, skipDomainCheck: true });

    if (!result.valid || !result.data?.iat) return null;

    const issuedAt = result.data.iat * 1000; // Convert to milliseconds
    const ageMs = Date.now() - issuedAt;
    const ageDays = ageMs / (24 * 60 * 60 * 1000);

    return Math.floor(ageDays);
  } catch {
    return null;
  }
}

/**
 * Check if a feature is enabled in the license
 *
 * @param token - The JWT token
 * @param publicKey - RSA public key for verification
 * @param feature - The feature to check (e.g., "ai", "analytics")
 * @returns true if feature is enabled
 */
export async function hasFeature(
  token: string | null | undefined,
  publicKey: string | null | undefined,
  feature: string
): Promise<boolean> {
  if (!token || !publicKey) return false;

  try {
    const result = await verifyLicenseToken(token, { publicKey, skipDomainCheck: true });

    if (!result.valid || !result.data?.features) return false;

    return result.data.features.includes(feature);
  } catch {
    return false;
  }
}

/**
 * Get license tier from token
 *
 * @param token - The JWT token
 * @param publicKey - RSA public key for verification
 * @returns License tier or null if invalid
 */
export async function getLicenseTier(
  token: string | null | undefined,
  publicKey: string | null | undefined
): Promise<string | null> {
  if (!token || !publicKey) return null;

  try {
    const result = await verifyLicenseToken(token, { publicKey, skipDomainCheck: true });
    return result.data?.tier || null;
  } catch {
    return null;
  }
}
