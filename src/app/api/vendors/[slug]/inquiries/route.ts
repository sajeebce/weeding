import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getVendorPlanStatus } from "@/lib/vendor-plan";
// POST /api/vendors/[slug]/inquiries
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { slug },
    select: { id: true, isApproved: true, isActive: true, status: true, planTier: true, trialEndsAt: true },
  });

  if (!vendor || !vendor.isApproved || !vendor.isActive) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  // Check plan — only vendors with active plan can receive inquiries
  const plan = getVendorPlanStatus({
    planTier: vendor.planTier as "TRIAL" | "BUSINESS" | "EXPIRED",
    trialEndsAt: vendor.trialEndsAt,
    isApproved: vendor.isApproved,
    status: vendor.status,
  });
  if (!plan.isActive) {
    return NextResponse.json({ error: "This vendor is not currently accepting inquiries" }, { status: 403 });
  }

  const body = await req.json();
  const { name, email, phone, eventType, eventDate, message, budget } = body;

  if (!name || !email || !eventType || !message) {
    return NextResponse.json(
      { error: "name, email, eventType, and message are required" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const guestName = String(name).trim();
  const guestEmail = String(email).trim().toLowerCase();
  const msgContent = String(message).trim();

  const inquiryId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const convId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const msgId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const now = new Date();

  // Create inquiry + conversation + first message atomically
  const [inquiry, conversation] = await prisma.$transaction([
    prisma.vendorInquiry.create({
      data: {
        id: inquiryId,
        vendorId: vendor.id,
        name: guestName,
        email: guestEmail,
        phone: phone ? String(phone).trim() : null,
        eventType: String(eventType).trim(),
        eventDate: eventDate ? new Date(eventDate) : null,
        message: msgContent,
        budget: budget ? String(budget).trim() : null,
      },
    }),
    prisma.vendorConversation.create({
      data: {
        id: convId,
        vendorId: vendor.id,
        inquiryId: inquiryId,
        guestName,
        guestEmail,
        lastMessageAt: now,
        messages: {
          create: {
            id: msgId,
            senderRole: "GUEST",
            content: msgContent,
            isRead: false,
            createdAt: now,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ inquiry, conversationId: conversation.id }, { status: 201 });
}
