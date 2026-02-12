import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { LeadSource, Prisma } from "@prisma/client";
import { sendEmail, getEmailConfig } from "@/lib/email";
import { getNewLeadEmail } from "@/lib/email-templates/new-lead";
import { getLeadAutoResponseEmail } from "@/lib/email-templates/lead-auto-response";
import { enhancedSubmitLeadSchema, normalizePhone } from "@/lib/leads/validation";
import { getSetting } from "@/lib/settings";

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
  pageViews?: number;
  visitCount?: number;
}): number {
  let score = 0;

  // Demographics (max 30)
  if (data.email) score += 5;
  if (data.phone) score += 10;
  if (data.company) score += 5;
  if (data.country && ["BD", "IN", "PK", "AE"].includes(data.country.toUpperCase())) {
    score += 10;
  }

  // Behavioral (max 25)
  if (data.pageViews && data.pageViews >= 5) score += 10;
  if (data.visitCount && data.visitCount > 1) score += 10;
  score += 5; // Form submission itself

  // Intent signals (max 40)
  if (data.budget) {
    if (data.budget.includes("2500") || data.budget.includes("5000")) score += 35;
    else if (data.budget.includes("1000")) score += 25;
    else if (data.budget.includes("500")) score += 15;
    else score += 5;
  }
  if (data.timeline) {
    if (data.timeline.includes("week") || data.timeline.includes("urgent") || data.timeline.includes("asap")) score += 15;
    else if (data.timeline.includes("month")) score += 10;
  }

  // Service interest (max 20)
  if (data.interestedIn && data.interestedIn.length > 0) {
    const highValue = ["llc-formation", "amazon-seller", "llc", "amazon"];
    const hasHighValue = data.interestedIn.some((s) =>
      highValue.some(h => s.toLowerCase().includes(h))
    );
    if (hasHighValue) score += 15;
    if (data.interestedIn.length > 1) score += 5;
  }

  // Source bonus (max 15)
  if (data.source === "REFERRAL") score += 15;
  else if (data.source === "GOOGLE_ADS") score += 10;
  else if (data.source === "FACEBOOK_ADS") score += 5;

  return Math.min(score, 100);
}

// Schema imported from validation module (enhancedSubmitLeadSchema)
// normalizePhone imported from validation module

// POST - Public lead submission endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = enhancedSubmitLeadSchema.parse(body);

    // Get IP and user agent
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                      request.headers.get("x-real-ip") ||
                      "unknown";
    const userAgent = request.headers.get("user-agent") || undefined;

    // Email already normalized by schema transform
    const email = data.email;

    // Check for duplicate (existing active lead with same email)
    const existingLead = await prisma.lead.findFirst({
      where: {
        email,
        status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
      },
    });

    if (existingLead) {
      // Update existing lead with new data instead of creating duplicate
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          // Update with latest data (already normalized by schema)
          ...(data.phone && { phone: data.phone }),
          ...(data.company && { company: data.company }),
          ...(data.country && { country: data.country }),
          visitCount: { increment: 1 },
          lastActivityAt: new Date(),
          lastPageViewed: data.lastPageViewed,
          // Update UTM if provided (new campaign might have different UTM)
          ...(data.utmSource && { utmSource: data.utmSource }),
          ...(data.utmMedium && { utmMedium: data.utmMedium }),
          ...(data.utmCampaign && { utmCampaign: data.utmCampaign }),
          // Add activity
          activities: {
            create: {
              type: "form_resubmitted",
              description: "Lead resubmitted form",
              metadata: {
                formTemplateId: data.formTemplateId,
                sourceDetail: data.sourceDetail,
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead information updated",
        leadId: updatedLead.id,
        isExisting: true,
      });
    }

    // Get form template if provided
    let formTemplate: { id: string; name: string; autoAssignToId: string | null } | null = null;
    let autoAssignToId: string | null = null;

    if (data.formTemplateId) {
      formTemplate = await prisma.leadFormTemplate.findUnique({
        where: { id: data.formTemplateId },
        select: { id: true, name: true, autoAssignToId: true },
      });

      if (formTemplate) {
        autoAssignToId = formTemplate.autoAssignToId;

        // Update template stats
        await prisma.leadFormTemplate.update({
          where: { id: formTemplate.id },
          data: {
            submissionCount: { increment: 1 },
            lastSubmission: new Date(),
          },
        });
      }
    }

    // Determine source
    let leadSource: LeadSource = "WEBSITE";
    if (data.source) {
      const sourceMap: Record<string, LeadSource> = {
        website: "WEBSITE",
        referral: "REFERRAL",
        google_ads: "GOOGLE_ADS",
        google: "GOOGLE_ADS",
        facebook_ads: "FACEBOOK_ADS",
        facebook: "FACEBOOK_ADS",
        social: "SOCIAL_MEDIA",
        direct: "DIRECT",
        cold: "COLD_OUTREACH",
      };
      leadSource = sourceMap[data.source.toLowerCase()] || "OTHER";
    } else if (data.utmSource) {
      // Infer source from UTM
      const utmSourceLower = data.utmSource.toLowerCase();
      if (utmSourceLower.includes("google")) leadSource = "GOOGLE_ADS";
      else if (utmSourceLower.includes("facebook") || utmSourceLower.includes("fb")) leadSource = "FACEBOOK_ADS";
      else if (utmSourceLower.includes("referral")) leadSource = "REFERRAL";
    }

    // Normalize interested in to array
    let interestedIn: string[] = [];
    if (data.interestedIn) {
      if (Array.isArray(data.interestedIn)) {
        interestedIn = data.interestedIn;
      } else {
        interestedIn = [data.interestedIn];
      }
    }

    // Calculate score
    const score = calculateLeadScore({
      email,
      phone: data.phone,
      company: data.company,
      country: data.country,
      budget: data.budget,
      timeline: data.timeline,
      interestedIn,
      source: leadSource,
      pageViews: data.pageViews,
      visitCount: data.visitCount,
    });

    // Prepare custom fields (anything not in standard schema)
    const customFields = data.customFields || {};
    if (data.message) {
      customFields.message = data.message;
    }

    // Create lead (data already normalized by schema transforms)
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        phone: data.phone || undefined,
        company: data.company,
        country: data.country,
        city: data.city,
        source: leadSource,
        sourceDetail: data.sourceDetail || data.lastPageViewed,
        interestedIn,
        budget: data.budget,
        timeline: data.timeline,
        notes: data.message,
        customFields: Object.keys(customFields).length > 0 ? customFields as Prisma.InputJsonValue : undefined,
        score,
        assignedToId: autoAssignToId,
        assignedAt: autoAssignToId ? new Date() : undefined,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        utmTerm: data.utmTerm,
        utmContent: data.utmContent,
        formTemplateId: formTemplate?.id,
        formTemplateName: formTemplate?.name,
        pageViews: data.pageViews || 0,
        visitCount: data.visitCount || 1,
        lastPageViewed: data.lastPageViewed,
        ipAddress,
        userAgent,
        activities: {
          create: {
            type: "lead_created",
            description: "Lead submitted form",
            metadata: {
              source: leadSource,
              formTemplateId: formTemplate?.id,
              score,
            },
          },
        },
      },
    });

    // Send email notification to admin (non-blocking)
    sendLeadNotificationEmail({
      leadId: lead.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      phone: data.phone || undefined,
      company: data.company,
      country: data.country,
      source: leadSource,
      score,
      interestedIn,
      budget: data.budget,
      timeline: data.timeline,
      message: data.message,
      formName: formTemplate?.name,
    }).catch((err) => {
      console.error("Failed to send lead notification email:", err);
    });

    // Send auto-response email to lead (non-blocking)
    sendLeadAutoResponseEmail({
      firstName: data.firstName,
      email,
      interestedIn,
    }).catch((err) => {
      console.error("Failed to send lead auto-response email:", err);
    });

    // Return success with tracking data for client-side tracking
    return NextResponse.json({
      success: true,
      leadId: lead.id,
      score: lead.score,
      formTemplateId: formTemplate?.id,
      // Data for GTM/FB Pixel tracking
      trackingData: {
        event: "lead_form_submit",
        leadId: lead.id,
        score: lead.score,
        service: interestedIn[0] || null,
        source: leadSource,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error submitting lead:", error);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  }
}

// Helper function to send email notification
async function sendLeadNotificationEmail(params: {
  leadId: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  source: string;
  score: number;
  interestedIn?: string[];
  budget?: string;
  timeline?: string;
  message?: string;
  formName?: string;
}): Promise<void> {
  try {
    const emailConfig = await getEmailConfig();

    // Check if notifications are enabled and admin email is configured
    if (!emailConfig.notifications.adminNewLead || !emailConfig.adminEmail) {
      return;
    }

    const adminUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const emailContent = getNewLeadEmail({
      leadId: params.leadId,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      phone: params.phone,
      company: params.company,
      country: params.country,
      source: params.source,
      score: params.score,
      interestedIn: params.interestedIn,
      budget: params.budget,
      timeline: params.timeline,
      message: params.message,
      formName: params.formName,
      adminUrl,
    });

    await sendEmail({
      to: emailConfig.adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Lead notification email sent for lead ${params.leadId}`);
  } catch (error) {
    console.error("Error sending lead notification email:", error);
    throw error;
  }
}

// Helper function to send auto-response email to leads
async function sendLeadAutoResponseEmail(params: {
  firstName: string;
  email: string;
  interestedIn?: string[];
}): Promise<void> {
  try {
    // Check if auto-response is enabled
    const autoResponseEnabled = await getSetting("leads.notify.leadAutoResponse");
    if (autoResponseEnabled !== "true") {
      return;
    }

    const emailConfig = await getEmailConfig();
    if (!emailConfig.smtp.user || !emailConfig.smtp.password) {
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const emailContent = getLeadAutoResponseEmail({
      firstName: params.firstName,
      interestedIn: params.interestedIn,
      siteUrl,
      companyName: emailConfig.fromName || "LLCPad",
    });

    await sendEmail({
      to: params.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    console.log(`Auto-response email sent to ${params.email}`);
  } catch (error) {
    console.error("Error sending lead auto-response email:", error);
    throw error;
  }
}
