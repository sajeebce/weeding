import { NextResponse } from "next/server";
import { getStripeConfig, getPayPalConfig } from "@/lib/payment-settings";

interface GatewayConfig {
  enabled: boolean;
  mode: string;
  clientId?: string;
  publicKey?: string;
}

// GET /api/checkout/gateways - Get enabled payment gateways
export async function GET() {
  try {
    // Build response
    const gateways: string[] = [];
    const response: {
      gateways: string[];
      stripe?: GatewayConfig;
      paypal?: GatewayConfig;
    } = { gateways: [] };

    // Check Stripe
    try {
      const stripeConfig = await getStripeConfig();
      if (stripeConfig?.enabled && stripeConfig.publishableKey) {
        gateways.push("stripe");
        response.stripe = {
          enabled: true,
          mode: stripeConfig.mode,
          publicKey: stripeConfig.publishableKey,
        };
      }
    } catch {
      // Stripe not configured, skip
    }

    // Check PayPal
    try {
      const paypalConfig = await getPayPalConfig();
      if (paypalConfig?.enabled && paypalConfig.clientId) {
        gateways.push("paypal");
        response.paypal = {
          enabled: true,
          mode: paypalConfig.mode,
          clientId: paypalConfig.clientId,
        };
      }
    } catch {
      // PayPal not configured, skip
    }

    response.gateways = gateways;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching gateways:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment gateways", gateways: [] },
      { status: 500 }
    );
  }
}
