import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

export async function POST() {
  try {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      return authError();
    }

    const apiKey = await getSetting("newsletter.brevo.apiKey");

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "Brevo API key not configured"
      });
    }

    // Test connection by fetching account info
    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        message: error.message || "Invalid API key or connection failed"
      });
    }

    const account = await response.json();

    return NextResponse.json({
      success: true,
      message: "Connected successfully",
      account: {
        email: account.email,
        companyName: account.companyName,
        plan: account.plan?.[0]?.type || "Free",
      }
    });
  } catch (error) {
    console.error("Brevo connection test error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to connect to Brevo"
    });
  }
}
