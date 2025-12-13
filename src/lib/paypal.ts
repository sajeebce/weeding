/**
 * PayPal Server-Side Utility Functions
 * Uses PayPal REST API v2
 * Reads credentials from database settings
 */

import { getPayPalConfig as getPayPalConfigFromDB } from "@/lib/payment-settings";

const PAYPAL_API_BASE = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    reference_id: string;
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

interface PayPalConfigType {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  mode: "sandbox" | "live";
  webhookId: string;
}

// Cache for config to avoid repeated DB calls during a single request
let configCache: PayPalConfigType | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 30000; // 30 seconds

async function getPayPalConfig(): Promise<PayPalConfigType> {
  // Check cache
  if (configCache && Date.now() - configCacheTime < CONFIG_CACHE_TTL) {
    return configCache;
  }

  // Fetch from database
  const config = await getPayPalConfigFromDB();

  if (!config || !config.clientId || !config.clientSecret) {
    throw new Error("PayPal credentials not configured. Please configure PayPal in Admin Settings.");
  }

  configCache = {
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    baseUrl: config.baseUrl,
    mode: config.mode,
    webhookId: config.webhookId || "",
  };
  configCacheTime = Date.now();

  return configCache;
}

/**
 * Clear config cache (call after settings update)
 */
export function clearPayPalConfigCache() {
  configCache = null;
  configCacheTime = 0;
}

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = await getPayPalConfig();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || "Failed to get access token");
  }

  const data: PayPalAccessToken = await response.json();
  return data.access_token;
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(options: {
  amount: number;
  currency?: string;
  orderId: string;
  description?: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approvalUrl: string }> {
  const { baseUrl } = await getPayPalConfig();
  const accessToken = await getAccessToken();

  const {
    amount,
    currency = "USD",
    orderId,
    description = "LLCPad Order",
    returnUrl,
    cancelUrl,
  } = options;

  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `order-${orderId}-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderId,
          description,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "LLCPad",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal create order error:", error);
    throw new Error(error.message || "Failed to create PayPal order");
  }

  const data: PayPalOrderResponse = await response.json();

  const approvalLink = data.links.find((link) => link.rel === "approve");
  if (!approvalLink) {
    throw new Error("No approval URL in PayPal response");
  }

  return {
    id: data.id,
    approvalUrl: approvalLink.href,
  };
}

/**
 * Capture a PayPal order (complete the payment)
 */
export async function capturePayPalOrder(paypalOrderId: string): Promise<{
  success: boolean;
  transactionId: string;
  status: string;
  amount: { currency: string; value: string };
}> {
  const { baseUrl } = await getPayPalConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal capture error:", error);
    throw new Error(error.message || "Failed to capture PayPal order");
  }

  const data: PayPalCaptureResponse = await response.json();

  const capture = data.purchase_units[0]?.payments?.captures?.[0];
  if (!capture) {
    throw new Error("No capture data in PayPal response");
  }

  return {
    success: capture.status === "COMPLETED",
    transactionId: capture.id,
    status: capture.status,
    amount: {
      currency: capture.amount.currency_code,
      value: capture.amount.value,
    },
  };
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrder(
  paypalOrderId: string
): Promise<PayPalOrderResponse> {
  const { baseUrl } = await getPayPalConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paypalOrderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get PayPal order");
  }

  return response.json();
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyWebhookSignature(options: {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: unknown;
}): Promise<boolean> {
  const { baseUrl } = await getPayPalConfig();
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${baseUrl}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: options.authAlgo,
        cert_url: options.certUrl,
        transmission_id: options.transmissionId,
        transmission_sig: options.transmissionSig,
        transmission_time: options.transmissionTime,
        webhook_id: options.webhookId,
        webhook_event: options.webhookEvent,
      }),
    }
  );

  if (!response.ok) {
    console.error("PayPal webhook verification failed");
    return false;
  }

  const data = await response.json();
  return data.verification_status === "SUCCESS";
}

/**
 * Get PayPal client ID for frontend
 */
export async function getPayPalClientId(): Promise<string> {
  const config = await getPayPalConfig();
  return config.clientId;
}

/**
 * Get PayPal mode (sandbox or live)
 */
export async function getPayPalMode(): Promise<"sandbox" | "live"> {
  const config = await getPayPalConfig();
  return config.mode;
}

/**
 * Get PayPal webhook ID
 */
export async function getPayPalWebhookId(): Promise<string> {
  const config = await getPayPalConfig();
  return config.webhookId;
}

/**
 * Test PayPal connection by getting access token
 */
export async function testPayPalConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    await getAccessToken();
    return { success: true, message: "PayPal connection successful" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { success: false, message };
  }
}
