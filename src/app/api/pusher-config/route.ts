import { NextResponse } from "next/server";
import prisma from "@/lib/db";

const PUSHER_CONFIG_KEY = "pusher.config";

// GET - Get public Pusher config (key and cluster only, no secret)
export async function GET() {
  try {
    // First try to get from database
    const setting = await prisma.setting.findUnique({
      where: { key: PUSHER_CONFIG_KEY },
    });

    if (setting) {
      try {
        const config = JSON.parse(setting.value);
        if (config.enabled && config.key && config.cluster) {
          return NextResponse.json({
            enabled: true,
            key: config.key,
            cluster: config.cluster,
          });
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // Fall back to environment variables
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || process.env.PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER;

    if (key && cluster) {
      return NextResponse.json({
        enabled: true,
        key,
        cluster,
      });
    }

    // Pusher not configured
    return NextResponse.json({
      enabled: false,
      key: null,
      cluster: null,
    });
  } catch (error) {
    console.error("Error fetching Pusher config:", error);
    return NextResponse.json({
      enabled: false,
      key: null,
      cluster: null,
    });
  }
}
