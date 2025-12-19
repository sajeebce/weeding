import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for header config
const headerConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().default(true),
  layout: z.enum(["DEFAULT", "CENTERED", "SPLIT", "MINIMAL", "MEGA"]).default("DEFAULT"),
  sticky: z.boolean().default(true),
  transparent: z.boolean().default(false),
  topBarEnabled: z.boolean().default(false),
  topBarContent: z.any().optional(),
  logoPosition: z.enum(["LEFT", "CENTER", "RIGHT"]).default("LEFT"),
  logoMaxHeight: z.number().min(20).max(100).default(40),
  ctaButtons: z.any().optional(),
  showAuthButtons: z.boolean().default(true),
  loginText: z.string().default("Sign In"),
  registerText: z.string().default("Get Started"),
  registerUrl: z.string().default("/services/llc-formation"),
  searchEnabled: z.boolean().default(false),
  mobileBreakpoint: z.number().default(1024),
  bgColor: z.string().optional().nullable(),
  textColor: z.string().optional().nullable(),
  height: z.number().default(64),
});

// GET /api/admin/header - Get all header configs
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const headers = await prisma.headerConfig.findMany({
      include: {
        menuItems: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      headers: headers.map((h) => ({
        ...h,
        ctaButtons: h.ctaButtons ? JSON.parse(h.ctaButtons as string) : [],
        topBarContent: h.topBarContent ? JSON.parse(h.topBarContent as string) : null,
        menuItemsCount: h._count.menuItems,
      })),
      total: headers.length,
    });
  } catch (error) {
    console.error("Error fetching headers:", error);
    return NextResponse.json(
      { error: "Failed to fetch headers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/header - Create new header config
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = headerConfigSchema.parse(body);
    const { ctaButtons, topBarContent, ...headerData } = validatedData;

    const header = await prisma.headerConfig.create({
      data: {
        ...headerData,
        ctaButtons: ctaButtons ? JSON.stringify(ctaButtons) : Prisma.DbNull,
        topBarContent: topBarContent ? JSON.stringify(topBarContent) : Prisma.DbNull,
      },
    });

    return NextResponse.json(header, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating header:", error);
    return NextResponse.json(
      { error: "Failed to create header" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/header - Update active header config
export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Header ID is required" },
        { status: 400 }
      );
    }

    const validatedData = headerConfigSchema.partial().parse(data);
    const { ctaButtons, topBarContent, ...headerData } = validatedData;

    // If setting this header as active, deactivate others
    if (headerData.isActive === true) {
      await prisma.headerConfig.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }

    const header = await prisma.headerConfig.update({
      where: { id },
      data: {
        ...headerData,
        ...(ctaButtons !== undefined && { ctaButtons: JSON.stringify(ctaButtons) }),
        ...(topBarContent !== undefined && { topBarContent: JSON.stringify(topBarContent) }),
      },
    });

    return NextResponse.json(header);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating header:", error);
    return NextResponse.json(
      { error: "Failed to update header" },
      { status: 500 }
    );
  }
}
