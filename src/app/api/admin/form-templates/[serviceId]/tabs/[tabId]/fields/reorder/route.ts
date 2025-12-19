import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkContentAccess, authError } from "@/lib/admin-auth";

// PUT /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields/reorder - Reorder fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;
    const { fieldIds } = await request.json();

    if (!Array.isArray(fieldIds) || fieldIds.length === 0) {
      return NextResponse.json(
        { error: "fieldIds array is required" },
        { status: 400 }
      );
    }

    // Verify the tab exists
    const tab = await prisma.formTab.findUnique({
      where: { id: tabId },
      select: { id: true },
    });

    if (!tab) {
      return NextResponse.json(
        { error: "Tab not found" },
        { status: 404 }
      );
    }

    // Update each field's order in a transaction
    await prisma.$transaction(
      fieldIds.map((fieldId: string, index: number) =>
        prisma.formField.update({
          where: { id: fieldId },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering fields:", error);
    return NextResponse.json(
      { error: "Failed to reorder fields" },
      { status: 500 }
    );
  }
}
