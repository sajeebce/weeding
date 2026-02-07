// Plugin License Activation API
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { verifyPluginLicense } from "@/lib/license-verification";

// Schema for pre-installed plugin activation (Option A)
const activatePreinstalledSchema = z.object({
  licenseKey: z.string().min(10).max(50),
  agreedToTerms: z.boolean(),
});

// POST /api/admin/plugins/[slug]/activate - Activate pre-installed plugin with license
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    console.log("[Plugin Activate] Request:", { slug, body });

    const validatedData = activatePreinstalledSchema.parse(body);

    console.log("[Plugin Activate] Validated data:", validatedData);

    // Check terms agreement
    if (!validatedData.agreedToTerms) {
      return NextResponse.json(
        { success: false, message: "You must agree to the terms and conditions" },
        { status: 400 }
      );
    }

    // Check if plugin exists and is in INSTALLED status
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
      include: {
        menuItems: true,
        settings: true,
      },
    });

    if (!plugin) {
      return NextResponse.json(
        { success: false, message: "Plugin not found" },
        { status: 404 }
      );
    }

    if (plugin.status === "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Plugin is already active" },
        { status: 400 }
      );
    }

    // Get domain for license verification
    const domain = request.headers.get("host")?.split(":")[0] || "localhost";

    // Verify license with license server
    console.log("[Plugin Activate] Verifying license:", {
      licenseKey: validatedData.licenseKey.substring(0, 10) + "...",
      productSlug: slug,
      productVersion: plugin.version,
      domain,
    });

    const licenseResult = await verifyPluginLicense({
      licenseKey: validatedData.licenseKey,
      productSlug: slug,
      productVersion: plugin.version,
      domain,
    });

    console.log("[Plugin Activate] License result:", licenseResult);

    if (!licenseResult.valid) {
      return NextResponse.json(
        {
          success: false,
          message: licenseResult.error || "Invalid license key",
        },
        { status: 400 }
      );
    }

    // Update plugin with license info and activate
    const updatedPlugin = await prisma.plugin.update({
      where: { slug },
      data: {
        status: "ACTIVE",
        licenseKey: validatedData.licenseKey.toUpperCase().trim(),
        licenseToken: licenseResult.token,
        licensePublicKey: licenseResult.publicKey, // Store RSA public key for verification
        licenseType: licenseResult.licenseType || "standard",
        licenseTier: licenseResult.tier,
        licenseVerifiedAt: new Date(),
        licenseExpiresAt: licenseResult.expiresAt ? new Date(licenseResult.expiresAt) : null,
        lastActivatedAt: new Date(),
        lastError: null,
      },
      include: {
        menuItems: true,
        settings: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${plugin.name} has been activated successfully!`,
      plugin: {
        id: updatedPlugin.id,
        slug: updatedPlugin.slug,
        name: updatedPlugin.name,
        version: updatedPlugin.version,
        status: updatedPlugin.status,
        licenseType: updatedPlugin.licenseType,
        licenseTier: updatedPlugin.licenseTier,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Plugin activation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to activate plugin" },
      { status: 500 }
    );
  }
}

// PUT - Toggle plugin status (enable/disable already activated plugin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const existing = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Plugin not found" },
        { status: 404 }
      );
    }

    // Only allow toggle if plugin has been activated with license
    if (!existing.licenseKey && existing.requiresLicense) {
      return NextResponse.json(
        { success: false, message: "This plugin requires license activation first" },
        { status: 400 }
      );
    }

    const newStatus = existing.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    const plugin = await prisma.plugin.update({
      where: { slug },
      data: {
        status: newStatus,
        ...(newStatus === "ACTIVE" && { lastActivatedAt: new Date() }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${plugin.name} has been ${newStatus === "ACTIVE" ? "enabled" : "disabled"}!`,
      plugin,
    });
  } catch (error) {
    console.error("Plugin toggle error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update plugin status" },
      { status: 500 }
    );
  }
}
