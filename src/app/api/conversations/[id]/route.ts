import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/conversations/[id] — public: guest reads their conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await prisma.vendorConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      vendor: {
        select: {
          businessName: true,
          category: true,
          city: true,
          country: true,
          photos: true,
        },
      },
      inquiry: {
        select: { eventType: true, eventDate: true, budget: true, message: true },
      },
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

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json({ conversation });
}

// POST /api/conversations/[id] — public: guest sends a reply
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await prisma.vendorConversation.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conversation.status === "SPAM") {
    return NextResponse.json({ error: "This conversation is closed" }, { status: 403 });
  }

  const body = await req.json();
  const content = String(body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }
  if (content.length > 4000) {
    return NextResponse.json({ error: "Message too long (max 4000 chars)" }, { status: 400 });
  }

  const msgId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const now = new Date();

  const [message] = await prisma.$transaction([
    prisma.vendorMessage.create({
      data: {
        id: msgId,
        conversationId: id,
        senderRole: "GUEST",
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
