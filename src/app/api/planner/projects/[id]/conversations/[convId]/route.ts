import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string; convId: string }> };

async function getConversation(projectId: string, convId: string, userId: string) {
  // Verify project ownership
  const project = await prisma.weddingProject.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  if (!project) return null;

  return prisma.vendorConversation.findFirst({
    where: { id: convId, projectId },
  });
}

// GET /api/planner/projects/[id]/conversations/[convId]
// Get conversation thread with messages
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, convId } = await params;
  const conv = await getConversation(id, convId, session.user.id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conversation = await prisma.vendorConversation.findUnique({
    where: { id: convId },
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
      messages: { orderBy: { createdAt: "asc" } },
      inquiry: {
        select: { eventType: true, eventDate: true, budget: true, message: true },
      },
    },
  });

  // Mark unread vendor messages as read
  await prisma.vendorMessage.updateMany({
    where: { conversationId: convId, senderRole: "VENDOR", isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ conversation });
}

// POST /api/planner/projects/[id]/conversations/[convId]
// Couple sends a message
export async function POST(
  req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, convId } = await params;
  const conv = await getConversation(id, convId, session.user.id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.status === "SPAM") return NextResponse.json({ error: "Conversation is closed" }, { status: 403 });

  const body = await req.json();
  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  if (content.length > 4000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

  const now = new Date();
  const [message] = await prisma.$transaction([
    prisma.vendorMessage.create({
      data: {
        conversationId: convId,
        senderRole: "GUEST",
        content,
        isRead: false,
        createdAt: now,
      },
    }),
    prisma.vendorConversation.update({
      where: { id: convId },
      data: { lastMessageAt: now, status: "ACTIVE", updatedAt: now },
    }),
  ]);

  return NextResponse.json({ message }, { status: 201 });
}

// PUT /api/planner/projects/[id]/conversations/[convId]
// Update conversation status (couple can archive/restore)
export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, convId } = await params;
  const conv = await getConversation(id, convId, session.user.id);
  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { status } = body;
  if (!["ACTIVE", "ARCHIVED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.vendorConversation.update({
    where: { id: convId },
    data: { status, updatedAt: new Date() },
  });

  return NextResponse.json({ conversation: updated });
}
