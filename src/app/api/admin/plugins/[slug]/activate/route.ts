// Plugin License Activation API
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { pluginInstaller, PluginManifest } from "@/services/plugin-installer";

const activateSchema = z.object({
  licenseKey: z.string().min(10).max(50),
  manifest: z.object({
    slug: z.string(),
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    authorUrl: z.string().optional(),
    icon: z.string().optional(),
    adminMenu: z.object({
      label: z.string(),
      icon: z.string(),
      position: z.number().optional(),
      items: z.array(z.object({
        label: z.string(),
        path: z.string(),
        icon: z.string().optional(),
      })),
    }).optional(),
    features: z.object({
      adminPages: z.boolean().optional(),
      publicPages: z.boolean().optional(),
      widgets: z.boolean().optional(),
      apiRoutes: z.boolean().optional(),
    }).optional(),
    settings: z.array(z.object({
      key: z.string(),
      value: z.string(),
      type: z.string().optional(),
    })).optional(),
    manifest: z.any().optional(),
  }),
  agreedToTerms: z.boolean(),
});

// POST /api/admin/plugins/[slug]/activate - Activate plugin with license
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const validatedData = activateSchema.parse(body);

    // Verify the slug matches manifest
    if (validatedData.manifest.slug !== slug) {
      return NextResponse.json(
        { success: false, error: "Plugin slug mismatch" },
        { status: 400 }
      );
    }

    // Check terms agreement
    if (!validatedData.agreedToTerms) {
      return NextResponse.json(
        { success: false, error: "You must agree to the terms and conditions" },
        { status: 400 }
      );
    }

    // Check if plugin already exists
    const existing = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Plugin is already installed" },
        { status: 409 }
      );
    }

    // Verify license with license server
    const licenseResult = await pluginInstaller.verifyLicense(
      validatedData.licenseKey,
      slug,
      validatedData.manifest.version
    );

    if (!licenseResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: licenseResult.error,
          message: licenseResult.message,
        },
        { status: 400 }
      );
    }

    // Install plugin
    const installResult = await pluginInstaller.install(
      validatedData.manifest as PluginManifest,
      {
        licenseKey: validatedData.licenseKey.toUpperCase().trim(),
        token: licenseResult.token!,
        tier: licenseResult.tier,
        expiresAt: licenseResult.expiresAt,
      }
    );

    if (!installResult.success) {
      return NextResponse.json(
        { success: false, error: installResult.error },
        { status: 500 }
      );
    }

    // Activate the plugin
    const plugin = await prisma.plugin.update({
      where: { slug },
      data: {
        status: "ACTIVE",
        lastActivatedAt: new Date(),
      },
      include: {
        menuItems: true,
        settings: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${validatedData.manifest.name} has been activated successfully!`,
      plugin: {
        id: plugin.id,
        slug: plugin.slug,
        name: plugin.name,
        version: plugin.version,
        status: plugin.status,
        licenseType: plugin.licenseType,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Plugin activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate plugin" },
      { status: 500 }
    );
  }
}

// For plugins without license (free plugins)
// POST /api/admin/plugins/[slug]/activate?free=true
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // This is for activating a free plugin or plugin without license requirement
    const existing = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Plugin not found" },
        { status: 404 }
      );
    }

    if (existing.requiresLicense && !existing.licenseKey) {
      return NextResponse.json(
        { success: false, error: "This plugin requires a license key" },
        { status: 400 }
      );
    }

    const plugin = await prisma.plugin.update({
      where: { slug },
      data: {
        status: "ACTIVE",
        lastActivatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${plugin.name} has been activated!`,
      plugin,
    });
  } catch (error) {
    console.error("Plugin activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate plugin" },
      { status: 500 }
    );
  }
}
