/**
 * Payment Settings Utility
 * Fetches payment gateway credentials from database
 */

import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

// Cache for settings to avoid repeated DB calls
let settingsCache: Map<string, { value: string; timestamp: number }> = new Map();
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get a setting value from database
 */
async function getSetting(key: string): Promise<string | null> {
  // Check cache first
  const cached = settingsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }

  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (setting) {
      settingsCache.set(key, { value: setting.value, timestamp: Date.now() });
      return setting.value;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return null;
  }
}

/**
 * Get multiple settings by prefix
 */
async function getSettingsByPrefix(prefix: string): Promise<Record<string, string>> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { startsWith: prefix },
      },
    });

    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
      settingsCache.set(s.key, { value: s.value, timestamp: Date.now() });
    });

    return result;
  } catch (error) {
    console.error(`Error fetching settings with prefix ${prefix}:`, error);
    return {};
  }
}

/**
 * Clear settings cache (call after updating settings)
 */
export function clearSettingsCache() {
  settingsCache.clear();
}

/**
 * Stripe settings keys
 */
export const STRIPE_SETTINGS = {
  ENABLED: "payment.stripe.enabled",
  MODE: "payment.stripe.mode",
  TEST_PUBLISHABLE_KEY: "payment.stripe.test.publishableKey",
  TEST_SECRET_KEY: "payment.stripe.test.secretKey",
  TEST_WEBHOOK_SECRET: "payment.stripe.test.webhookSecret",
  LIVE_PUBLISHABLE_KEY: "payment.stripe.live.publishableKey",
  LIVE_SECRET_KEY: "payment.stripe.live.secretKey",
  LIVE_WEBHOOK_SECRET: "payment.stripe.live.webhookSecret",
};

/**
 * PayPal settings keys
 */
export const PAYPAL_SETTINGS = {
  ENABLED: "payment.paypal.enabled",
  MODE: "payment.paypal.mode",
  SANDBOX_CLIENT_ID: "payment.paypal.sandbox.clientId",
  SANDBOX_CLIENT_SECRET: "payment.paypal.sandbox.clientSecret",
  SANDBOX_WEBHOOK_ID: "payment.paypal.sandbox.webhookId",
  LIVE_CLIENT_ID: "payment.paypal.live.clientId",
  LIVE_CLIENT_SECRET: "payment.paypal.live.clientSecret",
  LIVE_WEBHOOK_ID: "payment.paypal.live.webhookId",
};

/**
 * Get Stripe configuration from database
 */
export async function getStripeConfig(): Promise<{
  enabled: boolean;
  mode: "test" | "live";
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
} | null> {
  const settings = await getSettingsByPrefix("payment.stripe.");

  const enabled = settings[STRIPE_SETTINGS.ENABLED] === "true";
  const mode = (settings[STRIPE_SETTINGS.MODE] || "test") as "test" | "live";

  let publishableKey = "";
  let secretKey = "";
  let webhookSecret = "";

  if (mode === "test") {
    publishableKey = settings[STRIPE_SETTINGS.TEST_PUBLISHABLE_KEY] || "";
    secretKey = settings[STRIPE_SETTINGS.TEST_SECRET_KEY] || "";
    webhookSecret = settings[STRIPE_SETTINGS.TEST_WEBHOOK_SECRET] || "";
  } else {
    publishableKey = settings[STRIPE_SETTINGS.LIVE_PUBLISHABLE_KEY] || "";
    secretKey = settings[STRIPE_SETTINGS.LIVE_SECRET_KEY] || "";
    webhookSecret = settings[STRIPE_SETTINGS.LIVE_WEBHOOK_SECRET] || "";
  }

  // Decrypt secret keys
  if (secretKey) {
    secretKey = decrypt(secretKey);
  }
  if (webhookSecret) {
    webhookSecret = decrypt(webhookSecret);
  }

  if (!publishableKey || !secretKey) {
    return null;
  }

  return {
    enabled,
    mode,
    publishableKey,
    secretKey,
    webhookSecret,
  };
}

/**
 * Get PayPal configuration from database
 */
export async function getPayPalConfig(): Promise<{
  enabled: boolean;
  mode: "sandbox" | "live";
  clientId: string;
  clientSecret: string;
  webhookId: string;
  baseUrl: string;
} | null> {
  const settings = await getSettingsByPrefix("payment.paypal.");

  const enabled = settings[PAYPAL_SETTINGS.ENABLED] === "true";
  const mode = (settings[PAYPAL_SETTINGS.MODE] || "sandbox") as "sandbox" | "live";

  let clientId = "";
  let clientSecret = "";
  let webhookId = "";

  if (mode === "sandbox") {
    clientId = settings[PAYPAL_SETTINGS.SANDBOX_CLIENT_ID] || "";
    clientSecret = settings[PAYPAL_SETTINGS.SANDBOX_CLIENT_SECRET] || "";
    webhookId = settings[PAYPAL_SETTINGS.SANDBOX_WEBHOOK_ID] || "";
  } else {
    clientId = settings[PAYPAL_SETTINGS.LIVE_CLIENT_ID] || "";
    clientSecret = settings[PAYPAL_SETTINGS.LIVE_CLIENT_SECRET] || "";
    webhookId = settings[PAYPAL_SETTINGS.LIVE_WEBHOOK_ID] || "";
  }

  // Decrypt secret key
  if (clientSecret) {
    clientSecret = decrypt(clientSecret);
  }

  if (!clientId || !clientSecret) {
    return null;
  }

  const baseUrl = mode === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  return {
    enabled,
    mode,
    clientId,
    clientSecret,
    webhookId,
    baseUrl,
  };
}

/**
 * Check if Stripe is configured
 */
export async function isStripeConfigured(): Promise<boolean> {
  const config = await getStripeConfig();
  return config !== null && !!config.secretKey;
}

/**
 * Check if PayPal is configured
 */
export async function isPayPalConfigured(): Promise<boolean> {
  const config = await getPayPalConfig();
  return config !== null && !!config.clientSecret;
}
