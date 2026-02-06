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

// GET - List all form instances
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
    const templateId = searchParams.get("templateId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (!includeInactive) where.isActive = true;
    if (templateId) where.templateId = templateId;

    const instances = await prisma.leadFormInstance.findMany({
      where,
      include: {
        template: {
          select: { id: true, name: true },
        },
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ instances });
  } catch (error) {
    console.error("Error fetching form instances:", error);
    return NextResponse.json(
      { error: "Failed to fetch form instances" },
      { status: 500 }
    );
  }
}

// Create instance schema
const createInstanceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with dashes only"),
  templateId: z.string().min(1, "Template is required"),
  fieldOverrides: z.record(z.string(), z.unknown()).optional(),
  stylingOverrides: z.record(z.string(), z.unknown()).optional(),
  successMessage: z.string().optional(),
  successRedirect: z.string().optional(),
  autoAssignToId: z.string().optional(),
  roundRobinAssign: z.boolean().default(false),
  trackingEventName: z.string().optional(),
  trackingParams: z.record(z.string(), z.unknown()).optional(),
});

// POST - Create new form instance
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
    const data = createInstanceSchema.parse(body);

    // Check if template exists
    const template = await prisma.leadFormTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSlug = await prisma.leadFormInstance.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const instance = await prisma.leadFormInstance.create({
      data: {
        name: data.name,
        slug: data.slug,
        templateId: data.templateId,
        fieldOverrides: data.fieldOverrides as Prisma.InputJsonValue | undefined,
        stylingOverrides: data.stylingOverrides as Prisma.InputJsonValue | undefined,
        successMessage: data.successMessage,
        successRedirect: data.successRedirect,
        autoAssignToId: data.autoAssignToId,
        roundRobinAssign: data.roundRobinAssign,
        trackingEventName: data.trackingEventName,
        trackingParams: data.trackingParams as Prisma.InputJsonValue | undefined,
      },
      include: {
        template: { select: { id: true, name: true } },
      },
    });

    // Increment template usage count
    await prisma.leadFormTemplate.update({
      where: { id: data.templateId },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating form instance:", error);
    return NextResponse.json(
      { error: "Failed to create form instance" },
      { status: 500 }
    );
  }
}
