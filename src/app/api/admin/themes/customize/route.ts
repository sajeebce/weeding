import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// GET /api/admin/themes/customize - Get active theme customization data
export async function GET() {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const activeTheme = await prisma.activeTheme.findFirst();
    if (!activeTheme) {
      return NextResponse.json(
        { error: "No active theme found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      themeId: activeTheme.themeId,
      themeName: activeTheme.themeName,
      colorPalette: activeTheme.colorPalette,
      originalColorPalette: activeTheme.originalColorPalette,
      fontConfig: activeTheme.fontConfig,
    });
  } catch (error) {
    console.error("[GET /api/admin/themes/customize]", error);
    return NextResponse.json(
      { error: "Failed to fetch theme customization" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/themes/customize - Save customization
export async function PUT(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const body = await request.json();
    const { colorPalette, fontConfig } = body;

    const activeTheme = await prisma.activeTheme.findFirst();
    if (!activeTheme) {
      return NextResponse.json(
        { error: "No active theme found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (colorPalette !== undefined) {
      updateData.colorPalette = colorPalette;
    }
    if (fontConfig !== undefined) {
      updateData.fontConfig = fontConfig;
    }

    await prisma.activeTheme.update({
      where: { id: activeTheme.id },
      data: updateData,
    });

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/admin/themes/customize]", error);
    return NextResponse.json(
      { error: "Failed to save theme customization" },
      { status: 500 }
    );
  }
}
