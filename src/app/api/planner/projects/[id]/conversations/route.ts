import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

async function getProject(projectId: string, userId: string) {
  return prisma.weddingProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true, title: true, brideName: true, groomName: true, eventDate: true },
  });
}

// GET /api/planner/projects/[id]/conversations
// List all vendor conversations linked to this project
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getProject(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const conversations = await prisma.vendorConversation.findMany({
    where: { projectId: id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      vendor: {
        select: {
          id: true,
          businessName: true,
          category: true,
          slug: true,
          city: true,
          country: true,
          photos: true,
        },
      },
      messages: {
        where: { isRead: false, senderRole: "VENDOR" },
        select: { id: true },
      },
      _count: { select: { messages: true } },
    },
  });

  const result = conversations.map((c) => ({
    id: c.id,
    status: c.status,
    lastMessageAt: c.lastMessageAt,
    createdAt: c.createdAt,
    unreadCount: c.messages.length,
    totalMessages: c._count.messages,
    vendor: c.vendor,
  }));

  return NextResponse.json({ conversations: result });
}

// POST /api/planner/projects/[id]/conversations
// Start or get existing conversation with a vendor
// Body: { vendorId, message, eventType?, budget? }
export async function POST(
  req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getProject(id, session.user.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json();
  const { vendorId, message } = body;

  if (!vendorId) return NextResponse.json({ error: "vendorId is required" }, { status: 400 });
  const content = String(message ?? "").trim();
  if (!content) return NextResponse.json({ error: "message is required" }, { status: 400 });

  // Verify vendor exists
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    select: { id: true, status: true },
  });
  if (!vendor || vendor.status !== "APPROVED") {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  // Get or create conversation (one per project per vendor)
  let conversation = await prisma.vendorConversation.findFirst({
    where: { projectId: id, vendorId },
    select: { id: true, status: true },
  });

  const userName = session.user.name ?? "Couple";
  const userEmail = session.user.email ?? "";
  const now = new Date();

  if (!conversation) {
    conversation = await prisma.vendorConversation.create({
      data: {
        vendorId,
        projectId: id,
        coupleUserId: session.user.id,
        guestName: userName,
        guestEmail: userEmail,
        lastMessageAt: now,
      },
      select: { id: true, status: true },
    });
  }

  // Send initial/new message
  await prisma.$transaction([
    prisma.vendorMessage.create({
      data: {
        conversationId: conversation.id,
        senderRole: "GUEST",
        content,
        isRead: false,
        createdAt: now,
      },
    }),
    prisma.vendorConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: now, status: "ACTIVE", updatedAt: now },
    }),
  ]);

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
