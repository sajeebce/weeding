import { NextResponse } from "next/server";
import { testEmailConnection } from "@/lib/email";

// POST /api/admin/settings/test-email - Test email connection
export async function POST() {
  try {
    const result = await testEmailConnection();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection test failed";
    return NextResponse.json({
      success: false,
      message,
    });
  }
}
