/**
 * Stripe Server-Side Utility Functions
 * Reads credentials from database settings
 */

import Stripe from "stripe";
import { getStripeConfig as getStripeConfigFromDB } from "@/lib/payment-settings";

interface StripeConfigType {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  mode: "test" | "live";
}

// Cache for Stripe instance and config
let stripeInstance: Stripe | null = null;
let currentConfig: StripeConfigType | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 30000; // 30 seconds

/**
 * Get Stripe configuration from database
 */
async function getStripeConfig(): Promise<StripeConfigType> {
  // Check cache
  if (currentConfig && Date.now() - configCacheTime < CONFIG_CACHE_TTL) {
    return currentConfig;
  }

  // Fetch from database
  const config = await getStripeConfigFromDB();

  if (!config || !config.secretKey) {
    throw new Error("Stripe credentials not configured. Please configure Stripe in Admin Settings.");
  }

  // If config changed, reset Stripe instance
  if (currentConfig?.secretKey !== config.secretKey) {
    stripeInstance = null;
  }

  currentConfig = {
    publishableKey: config.publishableKey,
    secretKey: config.secretKey,
    webhookSecret: config.webhookSecret,
    mode: config.mode,
  };
  configCacheTime = Date.now();

  return currentConfig;
}

/**
 * Clear config cache (call after settings update)
 */
export function clearStripeConfigCache() {
  currentConfig = null;
  stripeInstance = null;
  configCacheTime = 0;
}

/**
 * Get or create Stripe instance
 */
async function getStripe(): Promise<Stripe> {
  const config = await getStripeConfig();

  if (!stripeInstance) {
    stripeInstance = new Stripe(config.secretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }

  return stripeInstance;
}

interface LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
    };
    unit_amount: number;
  };
  quantity: number;
}

export async function createCheckoutSession({
  lineItems,
  customerEmail,
  metadata,
  successUrl,
  cancelUrl,
}: {
  lineItems: LineItem[];
  customerEmail?: string;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const stripe = await getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
    customer_email: customerEmail,
    metadata: metadata || {},
  });

  return session;
}

export async function getCheckoutSession(sessionId: string) {
  const stripe = await getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = await getStripe();
  const config = await getStripeConfig();

  if (!config.webhookSecret) {
    throw new Error("Stripe webhook secret not configured. Please configure in Admin Settings.");
  }

  return stripe.webhooks.constructEvent(payload, signature, config.webhookSecret);
}

// ─── Planner subscription plans ──────────────────────────────────────────────
// Price amounts in öre (SEK×100). Set real Stripe Price IDs in admin settings.
export const PLANNER_PLANS = {
  basic:   { label: "Basic",   priceId: process.env.STRIPE_PRICE_BASIC   ?? "", amount: 0,     currency: "sek" },
  premium: { label: "Premium", priceId: process.env.STRIPE_PRICE_PREMIUM ?? "", amount: 29900, currency: "sek" },
  elite:   { label: "Elite",   priceId: process.env.STRIPE_PRICE_ELITE   ?? "", amount: 49900, currency: "sek" },
} as const;

export const VENDOR_PLAN = {
  label: "Business Profile",
  priceId: process.env.STRIPE_PRICE_VENDOR ?? "",
  amount: 1900, // $19.00 USD
  currency: "usd",
};

export type PlannerTier = "basic" | "premium" | "elite";

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer({
  email,
  name,
  existingCustomerId,
}: {
  email: string;
  name?: string;
  existingCustomerId?: string | null;
}): Promise<string> {
  const stripe = await getStripe();

  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
  });

  return customer.id;
}

/**
 * Create a Stripe subscription checkout session for a couple plan
 */
export async function createSubscriptionCheckout({
  priceId,
  customerId,
  customerEmail,
  metadata,
  successUrl,
  cancelUrl,
}: {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const stripe = await getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    success_url: successUrl ?? `${appUrl}/planner/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl ?? `${appUrl}/planner/billing?cancelled=1`,
    metadata: metadata ?? {},
    subscription_data: { metadata: metadata ?? {} },
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Create a Stripe billing portal session for a customer to manage their subscription
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl?: string;
}) {
  const stripe = await getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? `${appUrl}/planner/billing`,
  });

  return session;
}

/**
 * Get Stripe publishable key for frontend
 */
export async function getStripePublishableKey(): Promise<string> {
  const config = await getStripeConfig();
  return config.publishableKey;
}

/**
 * Get Stripe mode (test or live)
 */
export async function getStripeMode(): Promise<"test" | "live"> {
  const config = await getStripeConfig();
  return config.mode;
}

/**
 * Test Stripe connection by listing a balance
 */
export async function testStripeConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const stripe = await getStripe();
    await stripe.balance.retrieve();
    return { success: true, message: "Stripe connection successful" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { success: false, message };
  }
}
