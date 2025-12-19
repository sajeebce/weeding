import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkContentAccess, authError } from "@/lib/admin-auth";

// PUT /api/admin/form-templates/[serviceId]/tabs/reorder - Reorder tabs
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { serviceId } = await params;
    const { tabIds } = await request.json();

    if (!Array.isArray(tabIds) || tabIds.length === 0) {
      return NextResponse.json(
        { error: "tabIds array is required" },
        { status: 400 }
      );
    }

    // Verify the service exists and has a template
    const template = await prisma.serviceFormTemplate.findUnique({
      where: { serviceId },
      select: { id: true },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      );
    }

    // Update each tab's order in a transaction
    await prisma.$transaction(
      tabIds.map((tabId: string, index: number) =>
        prisma.formTab.update({
          where: { id: tabId },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering tabs:", error);
    return NextResponse.json(
      { error: "Failed to reorder tabs" },
      { status: 500 }
    );
  }
}
