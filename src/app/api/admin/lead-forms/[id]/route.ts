import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// GET - Get single instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id } = await params;

    const instance = await prisma.leadFormInstance.findUnique({
      where: { id },
      include: {
        template: true,
        _count: { select: { leads: true } },
      },
    });

    if (!instance) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(instance);
  } catch (error) {
    console.error("Error fetching form instance:", error);
    return NextResponse.json(
      { error: "Failed to fetch form instance" },
      { status: 500 }
    );
  }
}

// Update instance schema
const updateInstanceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with dashes only").optional(),
  fieldOverrides: z.record(z.string(), z.unknown()).optional().nullable(),
  stylingOverrides: z.record(z.string(), z.unknown()).optional().nullable(),
  successMessage: z.string().optional().nullable(),
  successRedirect: z.string().optional().nullable(),
  autoAssignToId: z.string().optional().nullable(),
  roundRobinAssign: z.boolean().optional(),
  trackingEventName: z.string().optional().nullable(),
  trackingParams: z.record(z.string(), z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
});

// PATCH - Update instance
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id } = await params;

    // Check if instance exists
    const existing = await prisma.leadFormInstance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateInstanceSchema.parse(body);

    // If slug is being changed, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.leadFormInstance.findUnique({
        where: { slug: data.slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    const instance = await prisma.leadFormInstance.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.fieldOverrides !== undefined && {
          fieldOverrides: data.fieldOverrides === null ? Prisma.JsonNull : data.fieldOverrides as Prisma.InputJsonValue
        }),
        ...(data.stylingOverrides !== undefined && {
          stylingOverrides: data.stylingOverrides === null ? Prisma.JsonNull : data.stylingOverrides as Prisma.InputJsonValue
        }),
        ...(data.successMessage !== undefined && { successMessage: data.successMessage }),
        ...(data.successRedirect !== undefined && { successRedirect: data.successRedirect }),
        ...(data.autoAssignToId !== undefined && { autoAssignToId: data.autoAssignToId }),
        ...(data.roundRobinAssign !== undefined && { roundRobinAssign: data.roundRobinAssign }),
        ...(data.trackingEventName !== undefined && { trackingEventName: data.trackingEventName }),
        ...(data.trackingParams !== undefined && {
          trackingParams: data.trackingParams === null ? Prisma.JsonNull : data.trackingParams as Prisma.InputJsonValue
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        template: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(instance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating form instance:", error);
    return NextResponse.json(
      { error: "Failed to update form instance" },
      { status: 500 }
    );
  }
}

// DELETE - Delete instance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { id } = await params;

    // Check if instance exists
    const existing = await prisma.leadFormInstance.findUnique({
      where: { id },
      include: { _count: { select: { leads: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Form instance not found" },
        { status: 404 }
      );
    }

    // Warn if there are leads associated
    if (existing._count.leads > 0) {
      // Just deactivate instead of delete
      await prisma.leadFormInstance.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "Form instance deactivated (has associated leads)",
      });
    }

    // Decrement template usage count
    await prisma.leadFormTemplate.update({
      where: { id: existing.templateId },
      data: { usageCount: { decrement: 1 } },
    });

    await prisma.leadFormInstance.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form instance:", error);
    return NextResponse.json(
      { error: "Failed to delete form instance" },
      { status: 500 }
    );
  }
}
