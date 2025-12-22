import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { encrypt, decrypt, maskSecret, isEncrypted } from "@/lib/encryption";
import { clearSettingsCache } from "@/lib/payment-settings";
import { clearBusinessConfigCache } from "@/lib/business-settings";

// Keys that require encryption
const SECRET_KEYS = [
  "payment.stripe.test.secretKey",
  "payment.stripe.test.webhookSecret",
  "payment.stripe.live.secretKey",
  "payment.stripe.live.webhookSecret",
  "payment.paypal.sandbox.clientSecret",
  "payment.paypal.live.clientSecret",
];

// Validation schema for updating settings
const settingsUpdateSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      type: z.enum(["string", "boolean", "number", "json"]).default("string"),
      isSecret: z.boolean().optional(),
    })
  ),
});

// GET /api/admin/settings - Get all settings or by prefix
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get("prefix");
    const includeSecrets = searchParams.get("includeSecrets") === "true";

    const where = prefix
      ? { key: { startsWith: prefix } }
      : {};

    const settings = await prisma.setting.findMany({
      where,
      orderBy: { key: "asc" },
    });

    // Transform to key-value object
    const settingsMap: Record<string, { value: string; type: string; isSecret?: boolean }> = {};
    settings.forEach((setting) => {
      const isSecret = SECRET_KEYS.includes(setting.key);
      let value = setting.value;

      // For secret keys, either mask or decrypt based on request
      if (isSecret && value) {
        if (includeSecrets) {
          // Decrypt for internal use
          try {
            value = isEncrypted(value) ? decrypt(value) : value;
          } catch {
            value = "";
          }
        } else {
          // Mask for display
          try {
            const decrypted = isEncrypted(value) ? decrypt(value) : value;
            value = decrypted ? maskSecret(decrypted) : "";
          } catch {
            value = maskSecret(value);
          }
        }
      }

      settingsMap[setting.key] = {
        value,
        type: setting.type,
        isSecret,
      };
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Create or update multiple settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = settingsUpdateSchema.parse(body);

    // Upsert each setting
    const results = await Promise.all(
      validatedData.settings.map((setting) => {
        let value = setting.value;

        // Encrypt secret keys
        const isSecret = setting.isSecret || SECRET_KEYS.includes(setting.key);
        if (isSecret && value && !value.includes("••••")) {
          // Only encrypt if it's not already masked
          value = encrypt(value);
        } else if (isSecret && value.includes("••••")) {
          // If masked value is submitted, skip update for this field
          return prisma.setting.findUnique({ where: { key: setting.key } });
        }

        return prisma.setting.upsert({
          where: { key: setting.key },
          update: { value, type: setting.type },
          create: { key: setting.key, value, type: setting.type },
        });
      })
    );

    // Clear settings caches after update
    clearSettingsCache();
    clearBusinessConfigCache();

    return NextResponse.json({
      message: "Settings updated successfully",
      count: results.filter(Boolean).length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update single setting (convenience method)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, type = "string" } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    let finalValue = String(value);

    // Encrypt if secret key
    if (SECRET_KEYS.includes(key) && finalValue && !finalValue.includes("••••")) {
      finalValue = encrypt(finalValue);
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: finalValue, type },
      create: { key, value: finalValue, type },
    });

    // Clear settings caches after update
    clearSettingsCache();
    clearBusinessConfigCache();

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
