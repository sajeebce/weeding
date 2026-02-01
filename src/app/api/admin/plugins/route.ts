import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// Validation schema for installing a plugin
const installPluginSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  manifest: z.record(z.unknown()).optional(),
  adminMenuLabel: z.string().optional(),
  adminMenuIcon: z.string().optional(),
  adminMenuPosition: z.number().optional(),
  hasAdminPages: z.boolean().optional(),
  hasPublicPages: z.boolean().optional(),
  hasWidgets: z.boolean().optional(),
  hasApiRoutes: z.boolean().optional(),
  menuItems: z.array(z.object({
    label: z.string(),
    path: z.string(),
    icon: z.string().optional(),
    parentLabel: z.string().optional(),
    sortOrder: z.number().optional(),
  })).optional(),
  settings: z.array(z.object({
    key: z.string(),
    value: z.string(),
    type: z.string().optional(),
  })).optional(),
});

// GET /api/admin/plugins - List all plugins
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const includeMenuItems = searchParams.get("includeMenuItems") === "true";

    const where = status ? { status: status as any } : {};

    const plugins = await prisma.plugin.findMany({
      where,
      include: {
        menuItems: includeMenuItems,
        _count: {
          select: { settings: true, menuItems: true },
        },
      },
      orderBy: [
        { adminMenuPosition: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ plugins });
  } catch (error) {
    console.error("Error fetching plugins:", error);
    return NextResponse.json(
      { error: "Failed to fetch plugins" },
      { status: 500 }
    );
  }
}

// POST /api/admin/plugins - Install a new plugin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = installPluginSchema.parse(body);

    // Check if plugin already exists
    const existing = await prisma.plugin.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Plugin with this slug already exists" },
        { status: 409 }
      );
    }

    // Create plugin with menu items and settings
    const plugin = await prisma.plugin.create({
      data: {
        slug: validatedData.slug,
        name: validatedData.name,
        description: validatedData.description,
        version: validatedData.version || "1.0.0",
        author: validatedData.author,
        authorUrl: validatedData.authorUrl || null,
        icon: validatedData.icon,
        manifest: validatedData.manifest ? JSON.parse(JSON.stringify(validatedData.manifest)) : undefined,
        adminMenuLabel: validatedData.adminMenuLabel,
        adminMenuIcon: validatedData.adminMenuIcon,
        adminMenuPosition: validatedData.adminMenuPosition,
        hasAdminPages: validatedData.hasAdminPages ?? false,
        hasPublicPages: validatedData.hasPublicPages ?? false,
        hasWidgets: validatedData.hasWidgets ?? false,
        hasApiRoutes: validatedData.hasApiRoutes ?? false,
        status: "INSTALLED",
        menuItems: validatedData.menuItems ? {
          create: validatedData.menuItems.map((item, index) => ({
            label: item.label,
            path: item.path,
            icon: item.icon,
            parentLabel: item.parentLabel,
            sortOrder: item.sortOrder ?? index,
          })),
        } : undefined,
        settings: validatedData.settings ? {
          create: validatedData.settings.map((setting) => ({
            key: setting.key,
            value: setting.value,
            type: setting.type || "string",
          })),
        } : undefined,
      },
      include: {
        menuItems: true,
        settings: true,
      },
    });

    return NextResponse.json({
      message: "Plugin installed successfully",
      plugin,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error installing plugin:", error);
    return NextResponse.json(
      { error: "Failed to install plugin" },
      { status: 500 }
    );
  }
}
