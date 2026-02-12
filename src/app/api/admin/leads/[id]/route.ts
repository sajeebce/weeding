import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { LeadStatus, LeadSource, LeadPriority, Prisma } from "@prisma/client";

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

// GET - Get single lead
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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, image: true },
        },
        formTemplate: {
          select: { id: true, name: true },
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            performedBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        leadNotes: {
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          include: {
            author: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

// Update lead schema
const updateLeadSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "UNQUALIFIED"]).optional(),
  source: z.enum(["WEBSITE", "REFERRAL", "GOOGLE_ADS", "FACEBOOK_ADS", "SOCIAL_MEDIA", "DIRECT", "COLD_OUTREACH", "OTHER"]).optional(),
  sourceDetail: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  interestedIn: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  assignedToId: z.string().nullable().optional(),
  score: z.number().min(0).max(100).optional(),
});

// PATCH - Update lead
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
    const { session } = accessCheck;
    const { id } = await params;

    // Get current lead
    const currentLead = await prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: { name: true } } },
    });

    if (!currentLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = updateLeadSchema.parse(body);

    // Track changes for activity log
    const changes: string[] = [];
    const activities: {
      type: string;
      description: string;
      performedById: string;
      metadata: Prisma.InputJsonValue;
    }[] = [];

    // Status change
    if (data.status && data.status !== currentLead.status) {
      changes.push(`Status changed from ${currentLead.status} to ${data.status}`);
      activities.push({
        type: "status_change",
        description: `Status changed from ${currentLead.status} to ${data.status}`,
        performedById: session.user.id,
        metadata: { oldStatus: currentLead.status, newStatus: data.status },
      });
    }

    // Assignment change
    if (data.assignedToId !== undefined && data.assignedToId !== currentLead.assignedToId) {
      if (data.assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: data.assignedToId },
          select: { name: true },
        });
        changes.push(`Assigned to ${assignee?.name || "Unknown"}`);
        activities.push({
          type: "assignment_change",
          description: `Lead assigned to ${assignee?.name || "Unknown"}`,
          performedById: session.user.id,
          metadata: { assignedToId: data.assignedToId, assignedToName: assignee?.name },
        });
      } else {
        changes.push("Assignment removed");
        activities.push({
          type: "assignment_change",
          description: "Lead assignment removed",
          performedById: session.user.id,
          metadata: { previousAssignee: currentLead.assignedTo?.name },
        });
      }
    }

    // Priority change
    if (data.priority && data.priority !== currentLead.priority) {
      changes.push(`Priority changed from ${currentLead.priority} to ${data.priority}`);
      activities.push({
        type: "priority_change",
        description: `Priority changed from ${currentLead.priority} to ${data.priority}`,
        performedById: session.user.id,
        metadata: { oldPriority: currentLead.priority, newPriority: data.priority },
      });
    }

    // Score change
    if (data.score !== undefined && data.score !== currentLead.score) {
      changes.push(`Score changed from ${currentLead.score} to ${data.score}`);
      activities.push({
        type: "score_updated",
        description: `Score manually updated from ${currentLead.score} to ${data.score}`,
        performedById: session.user.id,
        metadata: { oldScore: currentLead.score, newScore: data.score },
      });
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      lastActivityAt: new Date(),
      scoreDecayDays: 0, // Reset decay counter on new activity
    };

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.status) updateData.status = data.status as LeadStatus;
    if (data.source) updateData.source = data.source as LeadSource;
    if (data.sourceDetail !== undefined) updateData.sourceDetail = data.sourceDetail;
    if (data.priority) updateData.priority = data.priority as LeadPriority;
    if (data.interestedIn) updateData.interestedIn = data.interestedIn;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.timeline !== undefined) updateData.timeline = data.timeline;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.customFields) updateData.customFields = data.customFields;
    if (data.score !== undefined) updateData.score = data.score;
    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
      updateData.assignedAt = data.assignedToId ? new Date() : null;
    }

    // Update lead and create activities in transaction
    const lead = await prisma.$transaction(async (tx) => {
      // Create activities first
      if (activities.length > 0) {
        await tx.leadActivity.createMany({
          data: activities.map((a) => ({ ...a, leadId: id })),
        });
      }

      // Then update lead
      return tx.lead.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });

    return NextResponse.json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
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

    // Only admins can delete
    if (accessCheck.session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete leads" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if lead exists
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Delete lead (cascade will delete activities and notes)
    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
