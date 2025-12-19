import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for footer config
const footerConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().default(true),
  layout: z.enum(["MULTI_COLUMN", "CENTERED", "MINIMAL", "MEGA"]).default("MULTI_COLUMN"),
  columns: z.number().min(1).max(6).default(4),
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().default("Subscribe to our newsletter"),
  newsletterSubtitle: z.string().optional(),
  newsletterProvider: z.string().optional(),
  newsletterFormAction: z.string().optional(),
  showSocialLinks: z.boolean().default(true),
  socialPosition: z.string().default("brand"),
  showContactInfo: z.boolean().default(true),
  contactPosition: z.string().default("brand"),
  bottomBarEnabled: z.boolean().default(true),
  copyrightText: z.string().optional(),
  showDisclaimer: z.boolean().default(false),
  disclaimerText: z.string().optional(),
  bottomLinks: z.any().optional(),
  showTrustBadges: z.boolean().default(false),
  trustBadges: z.any().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  borderColor: z.string().optional(),
  paddingTop: z.number().default(48),
  paddingBottom: z.number().default(32),
});

// GET /api/admin/footer - Get all footer configs
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const footers = await prisma.footerConfig.findMany({
      include: {
        widgets: {
          orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
          include: {
            menuItems: {
              where: { isVisible: true },
              orderBy: { sortOrder: "asc" },
            },
            _count: {
              select: { menuItems: true },
            },
          },
        },
        _count: {
          select: { widgets: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      footers: footers.map((f) => ({
        ...f,
        bottomLinks: f.bottomLinks ? JSON.parse(f.bottomLinks as string) : [],
        trustBadges: f.trustBadges ? JSON.parse(f.trustBadges as string) : [],
        widgets: f.widgets.map((w) => ({
          ...w,
          content: w.content ? JSON.parse(w.content as string) : null,
          linksCount: w._count.menuItems,
        })),
        widgetsCount: f._count.widgets,
      })),
      total: footers.length,
    });
  } catch (error) {
    console.error("Error fetching footers:", error);
    return NextResponse.json(
      { error: "Failed to fetch footers" },
      { status: 500 }
    );
  }
}

// POST /api/admin/footer - Create new footer config
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const validatedData = footerConfigSchema.parse(body);
    const { bottomLinks, trustBadges, ...footerData } = validatedData;

    const footer = await prisma.footerConfig.create({
      data: {
        ...footerData,
        bottomLinks: bottomLinks ? JSON.stringify(bottomLinks) : Prisma.DbNull,
        trustBadges: trustBadges ? JSON.stringify(trustBadges) : Prisma.DbNull,
      },
    });

    return NextResponse.json(footer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating footer:", error);
    return NextResponse.json(
      { error: "Failed to create footer" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/footer - Update footer config
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
        { error: "Footer ID is required" },
        { status: 400 }
      );
    }

    const validatedData = footerConfigSchema.partial().parse(data);
    const { bottomLinks, trustBadges, ...footerData } = validatedData;

    // If setting this footer as active, deactivate others
    if (footerData.isActive === true) {
      await prisma.footerConfig.updateMany({
        where: { id: { not: id } },
        data: { isActive: false },
      });
    }

    const footer = await prisma.footerConfig.update({
      where: { id },
      data: {
        ...footerData,
        ...(bottomLinks !== undefined && { bottomLinks: JSON.stringify(bottomLinks) }),
        ...(trustBadges !== undefined && { trustBadges: JSON.stringify(trustBadges) }),
      },
    });

    return NextResponse.json(footer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating footer:", error);
    return NextResponse.json(
      { error: "Failed to update footer" },
      { status: 500 }
    );
  }
}
