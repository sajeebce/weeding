import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { LeadStatus, LeadSource, LeadPriority, Prisma } from "@prisma/client";
import { enhancedCreateLeadSchema } from "@/lib/leads/validation";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// Calculate lead score based on various factors
function calculateLeadScore(data: {
  email?: string;
  phone?: string;
  company?: string;
  country?: string;
  budget?: string;
  timeline?: string;
  interestedIn?: string[];
  source?: LeadSource;
}): number {
  let score = 0;

  // Demographics (max 30)
  if (data.email) score += 5;
  if (data.phone) score += 10;
  if (data.company) score += 5;
  if (data.country && ["BD", "IN", "PK", "AE"].includes(data.country.toUpperCase())) {
    score += 10;
  }

  // Intent signals (max 40)
  if (data.budget) {
    if (data.budget.includes("2500") || data.budget.includes("5000")) score += 35;
    else if (data.budget.includes("1000")) score += 25;
    else if (data.budget.includes("500")) score += 15;
    else score += 5;
  }
  if (data.timeline) {
    if (data.timeline.includes("week") || data.timeline.includes("urgent")) score += 15;
    else if (data.timeline.includes("month")) score += 10;
  }

  // Service interest (max 20)
  if (data.interestedIn && data.interestedIn.length > 0) {
    const highValue = ["llc-formation", "amazon-seller"];
    const hasHighValue = data.interestedIn.some((s) => highValue.includes(s));
    if (hasHighValue) score += 15;
    if (data.interestedIn.length > 1) score += 5;
  }

  // Source bonus (max 15)
  if (data.source === "REFERRAL") score += 15;
  else if (data.source === "GOOGLE_ADS") score += 10;
  else if (data.source === "FACEBOOK_ADS") score += 5;

  return Math.min(score, 100);
}

// GET - List all leads with filters
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const scoreMin = searchParams.get("scoreMin");
    const scoreMax = searchParams.get("scoreMax");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (status && status !== "all") {
      where.status = status as LeadStatus;
    }
    if (source && source !== "all") {
      where.source = source as LeadSource;
    }
    if (priority && priority !== "all") {
      where.priority = priority as LeadPriority;
    }
    if (assignedTo) {
      where.assignedToId = assignedTo === "unassigned" ? null : assignedTo;
    }
    if (scoreMin) {
      where.score = { ...where.score, gte: parseInt(scoreMin) };
    }
    if (scoreMax) {
      where.score = { ...where.score, lte: parseInt(scoreMax) };
    }
    if (dateFrom) {
      where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      where.createdAt = { ...where.createdAt, lte: new Date(dateTo) };
    }
    // Form template filter
    const formTemplateId = searchParams.get("formTemplateId");
    if (formTemplateId === "none") {
      where.formTemplateId = null;
    } else if (formTemplateId && formTemplateId !== "all") {
      where.formTemplateId = formTemplateId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: Record<string, any> = {};
    orderBy[sortBy] = sortOrder;

    // Get leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, image: true },
          },
          formTemplate: {
            select: { id: true, name: true },
          },
          _count: {
            select: { activities: true, leadNotes: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// Create lead schema imported from validation module (enhancedCreateLeadSchema)

// POST - Create a new lead (manual admin entry)
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }
    const { session } = accessCheck;

    const body = await request.json();
    const data = enhancedCreateLeadSchema.parse(body);

    // Check for duplicate email (already normalized by schema transform)
    const existingLead = await prisma.lead.findFirst({
      where: {
        email: data.email,
        status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "A lead with this email already exists", existingLeadId: existingLead.id },
        { status: 409 }
      );
    }

    // Calculate score
    const score = calculateLeadScore({
      email: data.email,
      phone: data.phone,
      company: data.company,
      country: data.country,
      budget: data.budget,
      timeline: data.timeline,
      interestedIn: data.interestedIn,
      source: data.source as LeadSource,
    });

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        city: data.city,
        source: (data.source as LeadSource) || "WEBSITE",
        sourceDetail: data.sourceDetail,
        priority: (data.priority as LeadPriority) || "MEDIUM",
        interestedIn: data.interestedIn || [],
        budget: data.budget,
        timeline: data.timeline,
        notes: data.notes,
        customFields: data.customFields as Prisma.InputJsonValue | undefined,
        score,
        assignedToId: data.assignedToId,
        assignedAt: data.assignedToId ? new Date() : undefined,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        formTemplateId: data.formTemplateId,
        activities: {
          create: {
            type: "lead_created",
            description: "Lead created manually",
            performedById: session.user.id,
            metadata: { source: "admin" },
          },
        },
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
