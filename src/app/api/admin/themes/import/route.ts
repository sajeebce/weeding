import { NextRequest, NextResponse } from "next/server";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";
import type { ThemeData, ThemeMeta } from "@/lib/theme/theme-types";
import { importThemeData } from "@/lib/theme/theme-importer";

// POST /api/admin/themes/import - Activate a theme
export async function POST(request: NextRequest) {
  const auth = await checkAdminOnly();
  if (auth.error) return authError(auth);

  try {
    const body = await request.json();
    const { themeId, includeContent = true } = body;

    if (!themeId || typeof themeId !== "string") {
      return NextResponse.json(
        { error: "themeId is required" },
        { status: 400 }
      );
    }

    const themesDir = path.join(process.cwd(), "public", "themes");
    const themeDir = path.join(themesDir, themeId);

    // Read meta.json
    let meta: ThemeMeta;
    try {
      const metaContent = await fs.readFile(
        path.join(themeDir, "meta.json"),
        "utf-8"
      );
      meta = JSON.parse(metaContent);
    } catch {
      return NextResponse.json(
        { error: `Theme "${themeId}" not found` },
        { status: 404 }
      );
    }

    // Read data.json
    let data: ThemeData;
    try {
      const dataContent = await fs.readFile(
        path.join(themeDir, "data.json"),
        "utf-8"
      );
      data = JSON.parse(dataContent);
    } catch {
      return NextResponse.json(
        { error: `Theme data file not found for "${themeId}"` },
        { status: 404 }
      );
    }

    if (!includeContent) {
      // Colors-only mode: only update the active theme and color palette
      const { prisma } = await import("@/lib/db");
      await prisma.activeTheme.deleteMany({});
      await prisma.activeTheme.create({
        data: {
          themeId,
          themeName: meta.name,
          colorPalette: data.colorPalette as any,
          originalColorPalette: data.colorPalette as any,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Applied "${meta.name}" color palette only`,
        colorsOnly: true,
      });
    }

    // Full import
    const result = await importThemeData(data, {
      source: "theme",
      themeId,
      themeName: meta.name,
    });

    return NextResponse.json({
      ...result,
      message: `Theme "${meta.name}" activated successfully`,
    });
  } catch (error) {
    console.error("[POST /api/admin/themes/import]", error);
    return NextResponse.json(
      { error: "Failed to import theme" },
      { status: 500 }
    );
  }
}
