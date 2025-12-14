import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { resetPusherConfig } from "@/lib/pusher-server";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden - Admin only", status: 403 };
  }
  return { session };
}

const PUSHER_CONFIG_KEY = "pusher.config";

interface PusherConfig {
  enabled: boolean;
  appId: string;
  key: string;
  secret: string;
  cluster: string;
}

const defaultConfig: PusherConfig = {
  enabled: false,
  appId: "",
  key: "",
  secret: "",
  cluster: "ap2",
};

// GET - Get Pusher configuration
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const setting = await prisma.setting.findUnique({
      where: { key: PUSHER_CONFIG_KEY },
    });

    if (setting) {
      try {
        const config = JSON.parse(setting.value);
        return NextResponse.json(config);
      } catch {
        return NextResponse.json(defaultConfig);
      }
    }

    // Check if env vars are set, use them as defaults
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET) {
      return NextResponse.json({
        enabled: true,
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: "••••••••", // Don't expose the secret from env
        cluster: process.env.PUSHER_CLUSTER || "ap2",
      });
    }

    return NextResponse.json(defaultConfig);
  } catch (error) {
    console.error("Error fetching Pusher config:", error);
    return NextResponse.json(
      { error: "Failed to fetch Pusher configuration" },
      { status: 500 }
    );
  }
}

// PUT - Update Pusher configuration
export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const config: PusherConfig = {
      enabled: Boolean(body.enabled),
      appId: String(body.appId || ""),
      key: String(body.key || ""),
      secret: String(body.secret || ""),
      cluster: String(body.cluster || "ap2"),
    };

    // If secret is masked, try to preserve existing secret
    if (config.secret === "••••••••") {
      const existingSetting = await prisma.setting.findUnique({
        where: { key: PUSHER_CONFIG_KEY },
      });
      if (existingSetting) {
        try {
          const existingConfig = JSON.parse(existingSetting.value);
          config.secret = existingConfig.secret || "";
        } catch {
          // Ignore parsing errors
        }
      }
    }

    await prisma.setting.upsert({
      where: { key: PUSHER_CONFIG_KEY },
      update: { value: JSON.stringify(config) },
      create: { key: PUSHER_CONFIG_KEY, value: JSON.stringify(config) },
    });

    // Reset the cached Pusher config so it reloads with new settings
    resetPusherConfig();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating Pusher config:", error);
    return NextResponse.json(
      { error: "Failed to update Pusher configuration" },
      { status: 500 }
    );
  }
}
