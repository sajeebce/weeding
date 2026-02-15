import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { decrypt, encrypt, maskSecret, isEncrypted } from "@/lib/encryption";
import { clearSettingsCache } from "@/lib/payment-settings";
import { clearBusinessConfigCache } from "@/lib/business-settings";

interface RouteParams {
  params: Promise<{ key: string }>;
}

// Keys that contain secrets — must be masked in responses
const SECRET_KEYS = [
  "payment.stripe.test.secretKey",
  "payment.stripe.test.webhookSecret",
  "payment.stripe.live.secretKey",
  "payment.stripe.live.webhookSecret",
  "payment.paypal.sandbox.clientSecret",
  "payment.paypal.live.clientSecret",
];

// GET /api/admin/settings/[key] - Get single setting (ADMIN only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    const setting = await prisma.setting.findUnique({
      where: { key: decodedKey },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    // Mask secret values — never return raw secrets
    const isSecret = SECRET_KEYS.includes(setting.key);
    let value = setting.value;
    if (isSecret && value) {
      try {
        const decrypted = isEncrypted(value) ? decrypt(value) : value;
        value = decrypted ? maskSecret(decrypted) : "";
      } catch {
        value = maskSecret(value);
      }
    }

    return NextResponse.json({
      setting: { ...setting, value, isSecret },
    });
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings/[key] - Update single setting (ADMIN only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const body = await request.json();
    const { value, type = "string" } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    let finalValue = String(value);

    // Encrypt secret keys before storage
    const isSecret = SECRET_KEYS.includes(decodedKey);
    if (isSecret && finalValue && !finalValue.includes("••••")) {
      finalValue = encrypt(finalValue);
    } else if (isSecret && finalValue.includes("••••")) {
      // Masked value submitted — skip update, return existing
      const existing = await prisma.setting.findUnique({ where: { key: decodedKey } });
      return NextResponse.json({ setting: existing });
    }

    const setting = await prisma.setting.upsert({
      where: { key: decodedKey },
      update: { value: finalValue, type },
      create: { key: decodedKey, value: finalValue, type },
    });

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

// DELETE /api/admin/settings/[key] - Delete single setting (ADMIN only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    await prisma.setting.delete({
      where: { key: decodedKey },
    });

    clearSettingsCache();
    clearBusinessConfigCache();

    return NextResponse.json({ message: "Setting deleted successfully" });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}
