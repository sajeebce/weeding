import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { FieldType, FieldWidth, DataSourceType } from "@prisma/client";
import { generateFieldName } from "@/lib/utils";

// Validation schema for updating field
const updateFieldSchema = z.object({
  name: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  type: z.nativeEnum(FieldType).optional(),
  placeholder: z.string().optional().nullable(),
  helpText: z.string().optional().nullable(),
  order: z.number().optional(),
  width: z.nativeEnum(FieldWidth).optional(),
  required: z.boolean().optional(),
  validation: z.any().optional().nullable(),
  options: z.any().optional().nullable(),
  dataSourceType: z.nativeEnum(DataSourceType).optional().nullable(),
  dataSourceKey: z.string().optional().nullable(),
  dependsOn: z.string().optional().nullable(),
  conditionalLogic: z.any().optional().nullable(),
  accept: z.string().optional().nullable(),
  maxSize: z.number().optional().nullable(),
  defaultValue: z.string().optional().nullable(),
});

// GET /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields/[fieldId] - Get single field
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string; fieldId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { fieldId } = await params;

    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error("Error fetching field:", error);
    return NextResponse.json(
      { error: "Failed to fetch field" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields/[fieldId] - Update field
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string; fieldId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { fieldId } = await params;
    const body = await request.json();
    const validatedData = updateFieldSchema.parse(body);

    const updateData = { ...validatedData };

    // Auto-generate unique name from label if label is provided
    if (validatedData.label) {
      // Get current field with template info
      const currentField = await prisma.formField.findUnique({
        where: { id: fieldId },
        include: {
          tab: {
            include: {
              template: {
                include: {
                  tabs: {
                    include: {
                      fields: {
                        select: { id: true, name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (currentField) {
        // Get all existing field names in this template, excluding current field
        const existingNames = new Set(
          currentField.tab.template.tabs
            .flatMap((t) => t.fields)
            .filter((f) => f.id !== fieldId)
            .map((f) => f.name)
        );

        // Generate unique field name from label
        let baseName = generateFieldName(validatedData.label);
        let fieldName = baseName;
        let suffix = 2;

        // If duplicate exists, append suffix until unique
        while (existingNames.has(fieldName)) {
          fieldName = `${baseName}${suffix}`;
          suffix++;
        }

        updateData.name = fieldName;
      }
    }

    const field = await prisma.formField.update({
      where: { id: fieldId },
      data: updateData,
    });

    return NextResponse.json(field);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating field:", error);
    return NextResponse.json(
      { error: "Failed to update field" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields/[fieldId] - Delete field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string; fieldId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { fieldId } = await params;

    // Check if field exists
    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    // Delete field
    await prisma.formField.delete({
      where: { id: fieldId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting field:", error);
    return NextResponse.json(
      { error: "Failed to delete field" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields/[fieldId] - Move field to different tab
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string; fieldId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { fieldId } = await params;
    const body = await request.json();
    const { newTabId, newOrder } = z.object({
      newTabId: z.string(),
      newOrder: z.number().optional(),
    }).parse(body);

    // Check if field exists
    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return NextResponse.json(
        { error: "Field not found" },
        { status: 404 }
      );
    }

    // Check if target tab exists
    const targetTab = await prisma.formTab.findUnique({
      where: { id: newTabId },
      include: {
        fields: {
          orderBy: { order: "desc" },
          take: 1,
        },
      },
    });

    if (!targetTab) {
      return NextResponse.json(
        { error: "Target tab not found" },
        { status: 404 }
      );
    }

    // Calculate order in new tab
    const order = newOrder ?? (targetTab.fields[0]?.order ?? 0) + 1;

    // Move field
    const updatedField = await prisma.formField.update({
      where: { id: fieldId },
      data: {
        tabId: newTabId,
        order,
      },
    });

    return NextResponse.json(updatedField);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error moving field:", error);
    return NextResponse.json(
      { error: "Failed to move field" },
      { status: 500 }
    );
  }
}
