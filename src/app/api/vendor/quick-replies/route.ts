import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

async function getProfile(userId: string) {
  return prisma.vendorProfile.findUnique({ where: { userId }, select: { id: true } });
}

// GET /api/vendor/quick-replies
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const replies = await prisma.vendorQuickReply.findMany({
    where: { vendorId: profile.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ replies });
}

// POST /api/vendor/quick-replies
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  if (!title || !content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  const reply = await prisma.vendorQuickReply.create({
    data: {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      vendorId: profile.id,
      title,
      content,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    },
  });
  return NextResponse.json({ reply }, { status: 201 });
}
