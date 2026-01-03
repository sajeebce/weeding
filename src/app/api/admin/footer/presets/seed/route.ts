import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { footerPresetsData } from "@/lib/data/footer-presets-data";

// POST - Seed footer presets
export async function POST() {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    let created = 0;
    let updated = 0;

    for (const preset of footerPresetsData) {
      const existing = await prisma.footerPreset.findFirst({
        where: { name: preset.name, isBuiltIn: true },
      });

      if (existing) {
        await prisma.footerPreset.update({
          where: { id: existing.id },
          data: {
            ...preset,
            isBuiltIn: true,
            isPublic: true,
          },
        });
        updated++;
      } else {
        await prisma.footerPreset.create({
          data: {
            ...preset,
            isBuiltIn: true,
            isPublic: true,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} new presets, updated ${updated} existing presets`,
      total: footerPresetsData.length,
    });
  } catch (error) {
    console.error("Error seeding footer presets:", error);
    return NextResponse.json(
      { error: "Failed to seed presets" },
      { status: 500 }
    );
  }
}
