import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

async function getProfile(userId: string) {
  return prisma.vendorProfile.findUnique({ where: { userId }, select: { id: true } });
}

// PUT /api/vendor/quick-replies/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.vendorQuickReply.findFirst({
    where: { id, vendorId: profile.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reply = await prisma.vendorQuickReply.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: String(body.title).trim() }),
      ...(body.content !== undefined && { content: String(body.content).trim() }),
      ...(typeof body.sortOrder === "number" && { sortOrder: body.sortOrder }),
    },
  });
  return NextResponse.json({ reply });
}

// DELETE /api/vendor/quick-replies/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getProfile(session.user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { id } = await params;
  const existing = await prisma.vendorQuickReply.findFirst({
    where: { id, vendorId: profile.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.vendorQuickReply.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
