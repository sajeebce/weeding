import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/vendor/conversations?status=ACTIVE&page=1
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "ACTIVE";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { vendorId: profile.id };
  if (status !== "ALL") where.status = status;

  const [conversations, total] = await Promise.all([
    prisma.vendorConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip,
      take: limit,
      include: {
        inquiry: { select: { eventType: true, eventDate: true, budget: true } },
        messages: {
          where: { isRead: false, senderRole: "GUEST" },
          select: { id: true },
        },
        _count: { select: { messages: true } },
      },
    }),
    prisma.vendorConversation.count({ where }),
  ]);

  const result = conversations.map((c) => ({
    id: c.id,
    guestName: c.guestName,
    guestEmail: c.guestEmail,
    status: c.status,
    lastMessageAt: c.lastMessageAt,
    createdAt: c.createdAt,
    unreadCount: c.messages.length,
    totalMessages: c._count.messages,
    inquiry: c.inquiry,
  }));

  return NextResponse.json({
    conversations: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
