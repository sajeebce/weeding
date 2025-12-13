import { NextResponse } from "next/server";
import { testPayPalConnection } from "@/lib/paypal";

// POST /api/admin/settings/test-paypal - Test PayPal connection
export async function POST() {
  try {
    const result = await testPayPalConnection();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed";
    return NextResponse.json({
      success: false,
      message,
    });
  }
}
