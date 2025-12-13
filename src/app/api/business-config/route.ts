import { NextResponse } from "next/server";
import { getBusinessConfig } from "@/lib/business-settings";

// GET /api/business-config - Get public business configuration
export async function GET() {
  try {
    const config = await getBusinessConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching business config:", error);
    // Return default config on error
    return NextResponse.json({
      name: "LLCPad",
      tagline: "Your Business Formation Partner",
      description: "Empowering global entrepreneurs to launch legitimate US businesses.",
      logo: { url: "", text: "L" },
      favicon: "",
      contact: { email: "contact@llcpad.com", phone: "", supportEmail: "support@llcpad.com" },
      address: { line1: "", line2: "", city: "", state: "", zip: "", country: "USA", full: "" },
      social: { facebook: "", twitter: "", linkedin: "", instagram: "", youtube: "", tiktok: "" },
    });
  }
}
