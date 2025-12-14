import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

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

// Support settings keys
const SUPPORT_SETTINGS_PREFIX = "support.";

// Default settings
const defaultSettings: Record<string, string> = {
  // General
  "support.general.businessName": "LLCPad Support",
  "support.general.supportEmail": "support@llcpad.com",
  "support.general.businessHours": JSON.stringify({
    enabled: true,
    timezone: "America/New_York",
    schedule: {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: true, start: "09:00", end: "17:00" },
      wednesday: { enabled: true, start: "09:00", end: "17:00" },
      thursday: { enabled: true, start: "09:00", end: "17:00" },
      friday: { enabled: true, start: "09:00", end: "17:00" },
      saturday: { enabled: false, start: "09:00", end: "17:00" },
      sunday: { enabled: false, start: "09:00", end: "17:00" },
    },
  }),
  "support.general.autoAssign": "true",
  "support.general.defaultPriority": "MEDIUM",

  // Chat Widget
  "support.widget.enabled": "true",
  "support.widget.position": "bottom-right",
  "support.widget.primaryColor": "#2563eb",
  "support.widget.welcomeMessage": "Hi! How can we help you today?",
  "support.widget.offlineMessage":
    "We're currently offline. Leave a message and we'll get back to you.",
  "support.widget.showAgentPhoto": "true",
  "support.widget.collectEmail": "true",
  "support.widget.collectName": "true",
  "support.widget.collectPhone": "false",
  "support.widget.requireEmailForChat": "true",

  // Notifications
  "support.notifications.emailOnNewTicket": "true",
  "support.notifications.emailOnReply": "true",
  "support.notifications.emailOnResolution": "true",
  "support.notifications.browserNotifications": "true",
  "support.notifications.soundNotifications": "true",
  "support.notifications.dailyDigest": "false",
  "support.notifications.digestTime": "09:00",

  // Automation
  "support.automation.autoResponseEnabled": "true",
  "support.automation.autoResponseMessage":
    "Thank you for contacting us. We've received your message and will respond within 24 hours.",
  "support.automation.autoCloseEnabled": "true",
  "support.automation.autoCloseDays": "7",
  "support.automation.autoCloseWarningDays": "5",
  "support.automation.slaEnabled": "true",
  "support.automation.slaFirstResponseHours": "4",
  "support.automation.slaResolutionHours": "48",
};

// GET - Get all support settings
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    // Get all support settings from database
    const dbSettings = await prisma.setting.findMany({
      where: {
        key: { startsWith: SUPPORT_SETTINGS_PREFIX },
      },
    });

    // Merge with defaults
    const settings: Record<string, string> = { ...defaultSettings };
    for (const setting of dbSettings) {
      settings[setting.key] = setting.value;
    }

    // Convert to nested object for easier frontend consumption
    const result: Record<string, Record<string, unknown>> = {};

    for (const [key, value] of Object.entries(settings)) {
      const parts = key.replace(SUPPORT_SETTINGS_PREFIX, "").split(".");
      const category = parts[0];
      const settingName = parts.slice(1).join(".");

      if (!result[category]) {
        result[category] = {};
      }

      // Try to parse JSON values
      try {
        result[category][settingName] = JSON.parse(value);
      } catch {
        // Handle boolean strings
        if (value === "true") {
          result[category][settingName] = true;
        } else if (value === "false") {
          result[category][settingName] = false;
        } else {
          result[category][settingName] = value;
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching support settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch support settings" },
      { status: 500 }
    );
  }
}

// PUT - Update support settings
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

    // Validate body is an object
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body - expected an object" },
        { status: 400 }
      );
    }

    // Flatten nested object to key-value pairs
    const updates: Array<{ key: string; value: string }> = [];

    for (const [category, settings] of Object.entries(body)) {
      // Skip if settings is not an object
      if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
        continue;
      }

      for (const [name, value] of Object.entries(settings as Record<string, unknown>)) {
        // Skip undefined values
        if (value === undefined) continue;

        const key = `${SUPPORT_SETTINGS_PREFIX}${category}.${name}`;
        let stringValue: string;

        if (value === null) {
          stringValue = "";
        } else if (typeof value === "object") {
          stringValue = JSON.stringify(value);
        } else if (typeof value === "boolean") {
          stringValue = value.toString();
        } else {
          stringValue = String(value);
        }

        updates.push({ key, value: stringValue });
      }
    }

    // Upsert all settings
    if (updates.length > 0) {
      await Promise.all(
        updates.map((update) =>
          prisma.setting.upsert({
            where: { key: update.key },
            update: { value: update.value },
            create: { key: update.key, value: update.value },
          })
        )
      );
    }

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error("Error updating support settings:", error);
    return NextResponse.json(
      { error: "Failed to update support settings" },
      { status: 500 }
    );
  }
}

// PATCH - Update specific setting
const patchSettingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

export async function PATCH(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const body = await request.json();
    const { key, value } = patchSettingSchema.parse(body);

    const fullKey = key.startsWith(SUPPORT_SETTINGS_PREFIX)
      ? key
      : `${SUPPORT_SETTINGS_PREFIX}${key}`;

    let stringValue: string;
    if (typeof value === "object") {
      stringValue = JSON.stringify(value);
    } else if (typeof value === "boolean") {
      stringValue = value.toString();
    } else {
      stringValue = String(value);
    }

    await prisma.setting.upsert({
      where: { key: fullKey },
      update: { value: stringValue },
      create: { key: fullKey, value: stringValue },
    });

    return NextResponse.json({ success: true, key: fullKey, value: stringValue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

// DELETE - Reset settings to defaults
export async function DELETE() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    // Delete all support settings
    await prisma.setting.deleteMany({
      where: {
        key: { startsWith: SUPPORT_SETTINGS_PREFIX },
      },
    });

    return NextResponse.json({ success: true, message: "Settings reset to defaults" });
  } catch (error) {
    console.error("Error resetting settings:", error);
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    );
  }
}
