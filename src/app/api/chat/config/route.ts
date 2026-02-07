/**
 * Chat Widget Configuration API
 *
 * GET /api/chat/config - Get chat widget configuration for the current site
 *
 * This endpoint returns the chat widget settings from the livesupport-pro plugin.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isPluginEnabled } from "@/lib/plugin-guard";

export async function GET() {
  try {
    // Check if livesupport-pro is enabled
    const isEnabled = await isPluginEnabled("livesupport-pro");

    if (!isEnabled) {
      return NextResponse.json(
        { enabled: false, message: "Live support is not enabled" },
        { status: 200 }
      );
    }

    // Get plugin settings
    const settings = await prisma.pluginSetting.findMany({
      where: {
        plugin: { slug: "livesupport-pro" },
        key: { startsWith: "chat." },
      },
      select: { key: true, value: true, type: true },
    });

    // Parse settings into config object
    const config: Record<string, unknown> = {
      enabled: true,
    };

    for (const setting of settings) {
      const key = setting.key.replace("chat.", "").replace("widget.", "");
      let value: unknown = setting.value;

      // Parse based on type
      if (setting.type === "boolean") {
        value = setting.value === "true";
      } else if (setting.type === "number") {
        value = parseFloat(setting.value);
      } else if (setting.type === "json") {
        try {
          value = JSON.parse(setting.value);
        } catch {
          value = setting.value;
        }
      }

      config[key] = value;
    }

    // Add socket URL (standalone chat server)
    config.socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "";

    // Set defaults for chat flow fields if not in DB
    if (!("connectingMessage" in config)) config.connectingMessage = "Connecting you with a team member...";
    if (!("agentTimeoutSeconds" in config)) config.agentTimeoutSeconds = 15;
    if (!("replyTimeMessage" in config)) config.replyTimeMessage = "We typically reply within a few minutes";
    if (!("offlineReplyTimeMessage" in config)) config.offlineReplyTimeMessage = "We typically respond within a few hours";
    if (!("offlineMessage" in config)) config.offlineMessage = "Our team is currently away";

    // Offline form settings
    if (!("offlineFormEnabled" in config)) config.offlineFormEnabled = true;
    if (!("offlineFormMessage" in config)) config.offlineFormMessage = "Our team is offline. We'll get back to you soon.";

    return NextResponse.json(config, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Chat Config] Error:", error);
    return NextResponse.json(
      { enabled: false, error: "Failed to load config" },
      { status: 500 }
    );
  }
}
