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

// GET - Get single template
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

    const template = await prisma.leadFormTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// Update template schema
const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(["text", "email", "phone", "textarea", "select", "multiselect", "checkbox", "radio", "number", "date", "url", "hidden", "country_select", "service_select"]),
    name: z.string(),
    label: z.string(),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    validation: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
    }).optional(),
    showInTable: z.boolean().default(true),
    mapToLeadField: z.string().optional(),
  })).optional(),
  defaultSuccessMessage: z.string().optional().nullable(),
  defaultSuccessRedirect: z.string().optional().nullable(),
  defaultAutoAssignTo: z.string().optional().nullable(),
  defaultStyling: z.record(z.string(), z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
});

// PATCH - Update template
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

    // Check if template exists
    const existing = await prisma.leadFormTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateTemplateSchema.parse(body);

    const template = await prisma.leadFormTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.fields !== undefined && { fields: data.fields as Prisma.InputJsonValue }),
        ...(data.defaultSuccessMessage !== undefined && { successMessage: data.defaultSuccessMessage }),
        ...(data.defaultSuccessRedirect !== undefined && { successRedirect: data.defaultSuccessRedirect }),
        ...(data.defaultAutoAssignTo !== undefined && { autoAssignToId: data.defaultAutoAssignTo }),
        ...(data.defaultStyling !== undefined && {
          defaultStyling: data.defaultStyling === null ? Prisma.JsonNull : data.defaultStyling as Prisma.InputJsonValue
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
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

    // Check if template exists and is not a system template
    const existing = await prisma.leadFormTemplate.findUnique({
      where: { id },
      include: { _count: { select: { leads: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (existing.isSystem) {
      return NextResponse.json(
        { error: "Cannot delete system templates" },
        { status: 400 }
      );
    }

    if (existing._count.leads > 0) {
      // Deactivate instead of deleting if template has leads
      await prisma.leadFormTemplate.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, deactivated: true });
    }

    await prisma.leadFormTemplate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
