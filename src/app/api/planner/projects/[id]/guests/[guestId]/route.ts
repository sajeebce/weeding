import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/guests/[guestId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, guestId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guest = await prisma.weddingGuest.findFirst({
    where: { id: guestId, projectId: id },
  });
  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

  const body = await req.json();
  const { firstName, lastName, title, side, relation, email, phone, dietary, rsvpStatus, tableNumber, notes } = body;

  const updated = await prisma.weddingGuest.update({
    where: { id: guestId },
    data: {
      ...(firstName !== undefined && { firstName: firstName.trim() }),
      ...(lastName !== undefined && { lastName: lastName?.trim() || null }),
      ...(title !== undefined && { title: title?.trim() || null }),
      ...(side !== undefined && { side }),
      ...(relation !== undefined && { relation }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(phone !== undefined && { phone: phone?.trim() || null }),
      ...(dietary !== undefined && { dietary: dietary?.trim() || null }),
      ...(rsvpStatus !== undefined && { rsvpStatus }),
      ...(tableNumber !== undefined && { tableNumber: tableNumber ? Number(tableNumber) : null }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
    },
  });

  return NextResponse.json({ guest: updated });
}

// DELETE /api/planner/projects/[id]/guests/[guestId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, guestId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guest = await prisma.weddingGuest.findFirst({
    where: { id: guestId, projectId: id },
  });
  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

  await prisma.weddingGuest.delete({ where: { id: guestId } });

  return NextResponse.json({ success: true });
}
