import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  // Only ADMIN can convert leads
  if (session.user.role !== "ADMIN") {
    return { error: "Only admins can convert leads to customers", status: 403 };
  }
  return { session };
}

// Generate random password
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const convertSchema = z.object({
  sendWelcomeEmail: z.boolean().default(true),
  customPassword: z.string().min(8).optional(),
});

// POST - Convert lead to customer
export async function POST(
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

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if lead is in WON status
    if (lead.status !== "WON") {
      return NextResponse.json(
        { error: "Lead must be in WON status to convert" },
        { status: 400 }
      );
    }

    // Check if already converted
    if (lead.convertedAt) {
      return NextResponse.json(
        { error: "Lead has already been converted" },
        { status: 400 }
      );
    }

    // Check if email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email: lead.email.toLowerCase() },
    });

    if (existingUser) {
      // Link existing user to lead
      await prisma.lead.update({
        where: { id },
        data: {
          convertedAt: new Date(),
          convertedToId: existingUser.id,
                  },
      });

      // Create activity
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "converted",
          description: `Lead converted - linked to existing customer account`,
          performedById: session.user.id,
          metadata: {
            customerId: existingUser.id,
            customerEmail: existingUser.email,
            isExistingUser: true,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead linked to existing customer account",
        customer: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          isNew: false,
        },
      });
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const data = convertSchema.parse(body);

    // Generate or use custom password
    const password = data.customPassword || generatePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: lead.email.toLowerCase(),
        name: `${lead.firstName} ${lead.lastName || ""}`.trim(),
        password: hashedPassword,
        role: "CUSTOMER",
        phone: lead.phone,
        country: lead.country,
        emailVerified: new Date(), // Auto-verify since they went through sales process
      },
    });

    // Update lead with conversion info
    await prisma.lead.update({
      where: { id },
      data: {
        convertedAt: new Date(),
        convertedToId: newUser.id,
              },
    });

    // Create activity
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "converted",
        description: `Lead converted to customer - new account created`,
        performedById: session.user.id,
        metadata: {
          customerId: newUser.id,
          customerEmail: newUser.email,
          isNewUser: true,
        },
      },
    });

    // TODO: Send welcome email with password if sendWelcomeEmail is true
    // This would integrate with your email service

    return NextResponse.json({
      success: true,
      message: "Lead successfully converted to customer",
      customer: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        isNew: true,
        temporaryPassword: data.sendWelcomeEmail ? undefined : password, // Only return if not sending email
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error converting lead:", error);
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
