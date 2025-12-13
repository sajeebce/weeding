import { NextResponse } from "next/server";
import { testStripeConnection } from "@/lib/stripe";

// POST /api/admin/settings/test-stripe - Test Stripe connection
export async function POST() {
  try {
    const result = await testStripeConnection();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed";
    return NextResponse.json({
      success: false,
      message,
    });
  }
}
