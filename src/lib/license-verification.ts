/**
 * License Verification Module
 *
 * Verifies plugin licenses with the license server
 */

export interface LicenseVerificationParams {
  licenseKey: string;
  productSlug: string;
  productVersion: string;
  domain: string;
}

export interface LicenseVerificationResult {
  valid: boolean;
  error?: string;
  message?: string;
  token?: string;
  publicKey?: string; // RSA public key for token verification
  licenseType?: string;
  tier?: string;
  features?: string[];
  expiresAt?: string;
  supportExpiresAt?: string;
}

/**
 * Verify a plugin license with the license server
 */
export async function verifyPluginLicense(
  params: LicenseVerificationParams
): Promise<LicenseVerificationResult> {
  const licenseServerUrl =
    process.env.LICENSE_SERVER_URL || "http://localhost:3001";

  try {
    console.log("[License] Verifying license:", {
      key: params.licenseKey.substring(0, 10) + "...",
      product: params.productSlug,
      domain: params.domain,
      serverUrl: licenseServerUrl,
    });

    const response = await fetch(`${licenseServerUrl}/api/licenses/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        licenseKey: params.licenseKey.toUpperCase().trim(),
        domain: params.domain,
        pluginSlug: params.productSlug,
        pluginVersion: params.productVersion,
        cmsVersion: process.env.npm_package_version || "1.0.0",
        serverInfo: {
          nodeVersion: process.version,
          os: process.platform,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    });

    const data = await response.json();

    console.log("[License] Server response:", {
      status: response.status,
      valid: data.valid,
      error: data.error,
    });

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
      publicKey: data.publicKey, // RSA public key from license server
      licenseType: data.license?.tier?.toLowerCase() || "standard",
      tier: data.license?.tier || "STANDARD",
      features: data.license?.features || [],
      expiresAt: data.license?.expiresAt || data.tokenExpiresAt,
      supportExpiresAt: data.license?.supportExpiresAt,
    };
  } catch (error) {
    console.error("[License] Verification error:", error);

    // For development, allow bypass if license server is not available
    if (process.env.NODE_ENV === "development") {
      console.warn("[License] DEV MODE: Bypassing license verification");
      return {
        valid: true,
        token: `dev-token-${Date.now()}`,
        licenseType: "developer",
        tier: "Developer",
        message: "Development mode - license bypassed",
      };
    }

    return {
      valid: false,
      error: "CONNECTION_FAILED",
      message: "Could not connect to license server. Please try again later.",
    };
  }
}

/**
 * Refresh an existing license token
 */
export async function refreshLicenseToken(
  licenseKey: string,
  currentToken: string,
  domain: string
): Promise<LicenseVerificationResult> {
  const licenseServerUrl =
    process.env.LICENSE_SERVER_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${licenseServerUrl}/api/licenses/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({
        licenseKey: licenseKey.toUpperCase().trim(),
        domain,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      return {
        valid: false,
        error: data.error || "REFRESH_FAILED",
        message: data.message || "Token refresh failed",
      };
    }

    return {
      valid: true,
      token: data.token,
      expiresAt: data.expiresAt,
    };
  } catch (error) {
    console.error("[License] Token refresh error:", error);
    return {
      valid: false,
      error: "CONNECTION_FAILED",
      message: "Could not connect to license server",
    };
  }
}
