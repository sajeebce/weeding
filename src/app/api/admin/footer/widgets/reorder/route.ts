import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for reordering widgets
const reorderSchema = z.object({
  widgets: z.array(
    z.object({
      id: z.string(),
      column: z.number(),
      sortOrder: z.number(),
    })
  ),
});

// POST /api/admin/footer/widgets/reorder - Reorder widgets
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { widgets } = reorderSchema.parse(body);

    // Update each widget's column and sortOrder in a transaction
    await prisma.$transaction(
      widgets.map((widget) =>
        prisma.footerWidget.update({
          where: { id: widget.id },
          data: {
            column: widget.column,
            sortOrder: widget.sortOrder,
          },
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
    console.error("Error reordering widgets:", error);
    return NextResponse.json(
      { error: "Failed to reorder widgets" },
      { status: 500 }
    );
  }
}
