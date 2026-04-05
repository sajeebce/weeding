import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

async function getVendorProfile(userId: string) {
  return prisma.vendorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
}

// GET /api/vendor/conversations/[id] — thread + messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getVendorProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await params;
  const conversation = await prisma.vendorConversation.findFirst({
    where: { id, vendorId: profile.id },
    include: {
      inquiry: true,
      messages: { orderBy: { createdAt: "asc" } },
      project: {
        select: {
          brideName: true,
          groomName: true,
          eventDate: true,
          budgetGoal: true,
          eventVenues: {
            select: { type: true, venueName: true, city: true, country: true },
          },
          guests: { select: { id: true } },
        },
      },
    },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark unread guest messages as read
  await prisma.vendorMessage.updateMany({
    where: { conversationId: id, senderRole: "GUEST", isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ conversation });
}

// POST /api/vendor/conversations/[id] — vendor sends a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getVendorProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await params;
  const conversation = await prisma.vendorConversation.findFirst({
    where: { id, vendorId: profile.id },
    select: { id: true },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Message content is required" }, { status: 400 });

  const msgId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const now = new Date();

  const [message] = await prisma.$transaction([
    prisma.vendorMessage.create({
      data: {
        id: msgId,
        conversationId: id,
        senderRole: "VENDOR",
        content,
        isRead: false,
        createdAt: now,
      },
    }),
    prisma.vendorConversation.update({
      where: { id },
      data: { lastMessageAt: now, status: "ACTIVE", updatedAt: now },
    }),
  ]);

  return NextResponse.json({ message }, { status: 201 });
}

// PUT /api/vendor/conversations/[id] — update status (ACTIVE, ARCHIVED, SPAM)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getVendorProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();
  const { status } = body;
  if (!["ACTIVE", "ARCHIVED", "SPAM"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const conversation = await prisma.vendorConversation.findFirst({
    where: { id, vendorId: profile.id },
    select: { id: true },
  });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.vendorConversation.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });

  return NextResponse.json({ conversation: updated });
}
