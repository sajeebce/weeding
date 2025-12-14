import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkContentAccess, authError } from "@/lib/admin-auth";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number(),
    })
  ),
});

// POST /api/admin/services/reorder - Reorder services
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { items } = reorderSchema.parse(body);

    // Update sort order for each service
    await Promise.all(
      items.map((item) =>
        prisma.service.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error reordering services:", error);
    return NextResponse.json(
      { error: "Failed to reorder services" },
      { status: 500 }
    );
  }
}
