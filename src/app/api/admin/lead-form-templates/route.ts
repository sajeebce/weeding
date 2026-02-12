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

// GET - List all form templates
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get("includeInactive") === "true";

    const templates = await prisma.leadFormTemplate.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching form templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch form templates" },
      { status: 500 }
    );
  }
}

// Create template schema
const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
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
  })),
  defaultSuccessMessage: z.string().optional(),
  defaultSuccessRedirect: z.string().optional(),
  defaultAutoAssignTo: z.string().optional(),
  defaultStyling: z.record(z.string(), z.unknown()).optional(),
});

// POST - Create new form template
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    const template = await prisma.leadFormTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        fields: data.fields as Prisma.InputJsonValue,
        successMessage: data.defaultSuccessMessage,
        successRedirect: data.defaultSuccessRedirect,
        autoAssignToId: data.defaultAutoAssignTo,
        defaultStyling: data.defaultStyling as Prisma.InputJsonValue | undefined,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating form template:", error);
    return NextResponse.json(
      { error: "Failed to create form template" },
      { status: 500 }
    );
  }
}
