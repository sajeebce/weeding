import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// Validation schema for updating plugin settings
const updateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
      type: z.enum(["string", "boolean", "number", "json"]).default("string"),
    })
  ),
});

// GET /api/admin/plugins/[slug]/settings - Get plugin settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const plugin = await prisma.plugin.findUnique({
      where: { slug },
      include: {
        settings: {
          orderBy: { key: "asc" },
        },
      },
    });

    if (!plugin) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    // Transform to key-value object
    const settingsMap: Record<string, { value: string; type: string }> = {};
    plugin.settings.forEach((setting) => {
      settingsMap[setting.key] = {
        value: setting.value,
        type: setting.type,
      };
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("Error fetching plugin settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch plugin settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/plugins/[slug]/settings - Update plugin settings
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    // Upsert each setting
    const results = await Promise.all(
      validatedData.settings.map((setting) =>
        prisma.pluginSetting.upsert({
          where: {
            pluginId_key: {
              pluginId: plugin.id,
              key: setting.key,
            },
          },
          update: {
            value: setting.value,
            type: setting.type,
          },
          create: {
            pluginId: plugin.id,
            key: setting.key,
            value: setting.value,
            type: setting.type,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Plugin settings updated successfully",
      count: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating plugin settings:", error);
    return NextResponse.json(
      { error: "Failed to update plugin settings" },
      { status: 500 }
    );
  }
}
