import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { checkAdminAccess, authError } from "@/lib/admin-auth";

// Validation schema for footer config
const footerConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().default(true),
  layout: z.enum([
    "MULTI_COLUMN", "CENTERED", "MINIMAL", "MEGA",
    "STACKED", "ASYMMETRIC", "MEGA_PLUS", "APP_FOCUSED", "NEWSLETTER_HERO"
  ]).default("MULTI_COLUMN"),
  columns: z.number().min(1).max(6).default(4),
  // Newsletter
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().default("Subscribe to our newsletter"),
  newsletterSubtitle: z.string().nullable().optional(),
  newsletterProvider: z.string().nullable().optional(),
  newsletterFormAction: z.string().nullable().optional(),
  // Social & Contact
  showSocialLinks: z.boolean().default(true),
  socialPosition: z.string().default("brand"),
  showContactInfo: z.boolean().default(true),
  contactPosition: z.string().default("brand"),
  // Bottom Bar
  bottomBarEnabled: z.boolean().default(true),
  bottomBarLayout: z.string().default("split"),
  copyrightText: z.string().nullable().optional(),
  showDisclaimer: z.boolean().default(false),
  disclaimerText: z.string().nullable().optional(),
  bottomLinks: z.any().optional(),
  // Trust Badges
  showTrustBadges: z.boolean().default(false),
  trustBadges: z.any().optional(),
  // Background Styling
  bgType: z.string().default("solid"),
  bgColor: z.string().nullable().optional(),
  bgGradient: z.any().nullable().optional(),
  bgPattern: z.string().nullable().optional(),
  bgPatternColor: z.string().nullable().optional(),
  bgPatternOpacity: z.number().nullable().optional(),
  bgImage: z.string().nullable().optional(),
  bgImageOverlay: z.string().nullable().optional(),
  // Text Colors
  textColor: z.string().nullable().optional(),
  headingColor: z.string().nullable().optional(),
  linkColor: z.string().nullable().optional(),
  linkHoverColor: z.string().nullable().optional(),
  accentColor: z.string().nullable().optional(),
  borderColor: z.string().nullable().optional(),
  // Typography
  headingSize: z.string().default("sm"),
  headingWeight: z.string().default("semibold"),
  headingStyle: z.string().default("normal"),
  // Social Icon Styling
  socialShape: z.string().default("circle"),
  socialSize: z.string().default("md"),
  socialColorMode: z.string().default("brand"),
  socialHoverEffect: z.string().default("scale"),
  // Divider
  dividerStyle: z.string().default("solid"),
  dividerColor: z.string().nullable().optional(),
  // Effects & Animation
  enableAnimations: z.boolean().default(false),
  entranceAnimation: z.string().nullable().optional(),
  animationDuration: z.number().default(300),
  linkHoverEffect: z.string().default("color"),
  topBorderStyle: z.string().default("none"),
  topBorderHeight: z.number().default(1),
  topBorderColor: z.string().nullable().optional(),
  // Shadow & Border Radius
  shadow: z.string().default("none"),
  borderRadius: z.number().default(0),
  // Container Width & Style
  containerWidth: z.string().default("full"),
  containerStyle: z.string().default("sharp"),
  cornerRadiusTL: z.number().default(0),
  cornerRadiusTR: z.number().default(0),
  cornerRadiusBL: z.number().default(0),
  cornerRadiusBR: z.number().default(0),
  // Spacing
  paddingTop: z.number().default(48),
  paddingBottom: z.number().default(32),
  // Responsive columns
  responsiveColumns: z.any().nullable().optional(),
  sectionOrder: z.array(z.string()).optional(),
  // Advanced
  customCSS: z.string().nullable().optional(),
  customJS: z.string().nullable().optional(),
  // Preset reference
  presetId: z.string().nullable().optional(),
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

    // Helper to safely parse JSON - handles both string and object
    const safeJsonParse = (value: unknown, fallback: unknown = null) => {
      if (!value) return fallback;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      }
      return value; // Already an object
    };

    return NextResponse.json({
      footers: footers.map((f) => ({
        ...f,
        bottomLinks: safeJsonParse(f.bottomLinks, []),
        trustBadges: safeJsonParse(f.trustBadges, []),
        bgGradient: safeJsonParse(f.bgGradient, null),
        responsiveColumns: safeJsonParse(f.responsiveColumns, null),
        widgets: f.widgets.map((w) => ({
          ...w,
          content: safeJsonParse(w.content, null),
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
    const { bottomLinks, trustBadges, bgGradient, responsiveColumns, sectionOrder, ...footerData } = validatedData;

    const footer = await prisma.footerConfig.create({
      data: {
        ...footerData,
        bottomLinks: bottomLinks ? JSON.stringify(bottomLinks) : Prisma.DbNull,
        trustBadges: trustBadges ? JSON.stringify(trustBadges) : Prisma.DbNull,
        bgGradient: bgGradient ? JSON.stringify(bgGradient) : Prisma.DbNull,
        responsiveColumns: responsiveColumns ? JSON.stringify(responsiveColumns) : Prisma.DbNull,
        sectionOrder: sectionOrder || [],
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
    const { bottomLinks, trustBadges, bgGradient, responsiveColumns, sectionOrder, ...footerData } = validatedData;

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
        ...(bgGradient !== undefined && { bgGradient: bgGradient ? JSON.stringify(bgGradient) : Prisma.DbNull }),
        ...(responsiveColumns !== undefined && { responsiveColumns: responsiveColumns ? JSON.stringify(responsiveColumns) : Prisma.DbNull }),
        ...(sectionOrder !== undefined && { sectionOrder: sectionOrder || [] }),
      },
    });

    return NextResponse.json(footer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Footer validation error:", JSON.stringify(error.issues, null, 2));
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
