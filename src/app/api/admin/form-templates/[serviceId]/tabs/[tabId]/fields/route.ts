import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";
import { FieldType, FieldWidth, DataSourceType } from "@prisma/client";
import { generateFieldName } from "@/lib/utils";

// Validation schema for creating/updating fields
const fieldSchema = z.object({
  name: z.string().optional(), // Auto-generated from label
  label: z.string().min(1, "Field label is required"),
  type: z.nativeEnum(FieldType),
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

const reorderSchema = z.object({
  fieldIds: z.array(z.string()),
});

// GET /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields - Get all fields
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;

    const fields = await prisma.formField.findMany({
      where: { tabId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error("Error fetching fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    );
  }
}

// POST /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields - Create new field
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;
    const body = await request.json();
    const validatedData = fieldSchema.parse(body);

    // Check if tab exists and get template info
    const tab = await prisma.formTab.findUnique({
      where: { id: tabId },
      include: {
        fields: {
          orderBy: { order: "desc" },
          take: 1,
        },
        template: {
          include: {
            tabs: {
              include: {
                fields: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tab) {
      return NextResponse.json(
        { error: "Tab not found" },
        { status: 404 }
      );
    }

    // Calculate next order
    const nextOrder = validatedData.order ?? (tab.fields[0]?.order ?? 0) + 1;

    // Get all existing field names in this template (across all tabs)
    const existingNames = new Set(
      tab.template.tabs.flatMap((t) => t.fields.map((f) => f.name))
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

    const field = await prisma.formField.create({
      data: {
        tabId,
        name: fieldName,
        label: validatedData.label,
        type: validatedData.type,
        placeholder: validatedData.placeholder,
        helpText: validatedData.helpText,
        order: nextOrder,
        width: validatedData.width ?? FieldWidth.FULL,
        required: validatedData.required ?? false,
        validation: validatedData.validation,
        options: validatedData.options,
        dataSourceType: validatedData.dataSourceType,
        dataSourceKey: validatedData.dataSourceKey,
        dependsOn: validatedData.dependsOn,
        conditionalLogic: validatedData.conditionalLogic,
        accept: validatedData.accept,
        maxSize: validatedData.maxSize,
        defaultValue: validatedData.defaultValue,
      },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating field:", error);
    return NextResponse.json(
      { error: "Failed to create field" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/form-templates/[serviceId]/tabs/[tabId]/fields - Reorder fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string; tabId: string }> }
) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { tabId } = await params;
    const body = await request.json();
    const { fieldIds } = reorderSchema.parse(body);

    // Check if tab exists
    const tab = await prisma.formTab.findUnique({
      where: { id: tabId },
    });

    if (!tab) {
      return NextResponse.json(
        { error: "Tab not found" },
        { status: 404 }
      );
    }

    // Update order for each field
    await prisma.$transaction(
      fieldIds.map((fieldId, index) =>
        prisma.formField.update({
          where: { id: fieldId },
          data: { order: index + 1 },
        })
      )
    );

    // Fetch updated fields
    const fields = await prisma.formField.findMany({
      where: { tabId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(fields);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error reordering fields:", error);
    return NextResponse.json(
      { error: "Failed to reorder fields" },
      { status: 500 }
    );
  }
}
