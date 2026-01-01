import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// All widget types from Prisma schema
type FooterWidgetType =
  | "BRAND"
  | "LINKS"
  | "CONTACT"
  | "NEWSLETTER"
  | "SOCIAL"
  | "TEXT"
  | "RECENT_POSTS"
  | "SERVICES"
  | "STATES"
  | "CUSTOM_HTML"
  | "APP_DOWNLOAD"
  | "PAYMENT_METHODS"
  | "AWARDS"
  | "MAP"
  | "WORKING_HOURS"
  | "LANGUAGE_SELECT"
  | "THEME_TOGGLE"
  | "FEATURED_PRODUCT"
  | "TESTIMONIAL"
  | "COUNTDOWN"
  | "CTA_BANNER";

interface PresetWidget {
  type: FooterWidgetType;
  title: string;
  showTitle: boolean;
  column: number;
  sortOrder: number;
  content?: Record<string, unknown>;
  menuItems?: Array<{
    label: string;
    url: string;
    target?: string;
    icon?: string;
  }>;
}

// POST - Apply a preset to a footer
export async function POST(request: Request) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { footerId, presetId, preserveWidgets = false } = body;

    if (!footerId || !presetId) {
      return NextResponse.json(
        { error: "Footer ID and Preset ID are required" },
        { status: 400 }
      );
    }

    // Get the preset
    const preset = await prisma.footerPreset.findUnique({
      where: { id: presetId },
    });

    if (!preset) {
      return NextResponse.json(
        { error: "Preset not found" },
        { status: 404 }
      );
    }

    // Get the footer
    const footer = await prisma.footerConfig.findUnique({
      where: { id: footerId },
      include: { widgets: true },
    });

    if (!footer) {
      return NextResponse.json(
        { error: "Footer not found" },
        { status: 404 }
      );
    }

    // Extract config from preset
    const presetConfig = preset.config as Record<string, unknown>;
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      widgets: presetWidgets,
      bottomLinks: presetBottomLinks,
      bgGradient: presetBgGradient,
      ...configToApply
    } = presetConfig;

    // Prepare data for update - handle JSON fields properly
    const updateData: Record<string, unknown> = {
      ...configToApply,
      presetId: presetId,
    };

    // Handle JSON fields - stringify if they're objects
    if (presetBottomLinks) {
      updateData.bottomLinks = JSON.stringify(presetBottomLinks);
    }
    if (presetBgGradient) {
      updateData.bgGradient = JSON.stringify(presetBgGradient);
    }

    // Update footer with preset config
    await prisma.footerConfig.update({
      where: { id: footerId },
      data: updateData,
    });

    // If not preserving widgets and preset has widgets, replace them
    if (!preserveWidgets && presetWidgets && Array.isArray(presetWidgets)) {
      // Delete existing widgets and their menu items
      const existingWidgets = await prisma.footerWidget.findMany({
        where: { footerId },
        select: { id: true },
      });

      for (const widget of existingWidgets) {
        await prisma.menuItem.deleteMany({
          where: { footerWidgetId: widget.id },
        });
      }

      await prisma.footerWidget.deleteMany({
        where: { footerId },
      });

      // Create new widgets from preset
      for (const widgetData of presetWidgets as PresetWidget[]) {
        const { menuItems, content, ...widgetFields } = widgetData;

        // Create the widget
        // Note: content is a Json type in Prisma, so pass the object directly (no stringify needed)
        const newWidget = await prisma.footerWidget.create({
          data: {
            footerId,
            type: widgetFields.type,
            title: widgetFields.title || null,
            showTitle: widgetFields.showTitle ?? true,
            column: widgetFields.column || 1,
            sortOrder: widgetFields.sortOrder || 0,
            content: content || undefined,
          },
        });

        // Create menu items (links) if provided
        if (menuItems && Array.isArray(menuItems)) {
          for (let i = 0; i < menuItems.length; i++) {
            const item = menuItems[i];
            await prisma.menuItem.create({
              data: {
                footerWidgetId: newWidget.id,
                label: item.label,
                url: item.url,
                target: (item.target as "_self" | "_blank") || "_self",
                icon: item.icon || null,
                sortOrder: i,
                isVisible: true,
              },
            });
          }
        }
      }
    }

    // Increment preset usage count
    await prisma.footerPreset.update({
      where: { id: presetId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    // Fetch the updated footer with widgets
    const result = await prisma.footerConfig.findUnique({
      where: { id: footerId },
      include: {
        widgets: {
          orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
          include: {
            menuItems: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      footer: result,
      message: `Preset "${preset.name}" applied successfully`,
    });
  } catch (error) {
    console.error("Error applying footer preset:", error);
    return NextResponse.json(
      { error: "Failed to apply preset" },
      { status: 500 }
    );
  }
}
