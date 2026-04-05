import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/vendors/[vendorId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, vendorId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, category, email, phone, website, notes } = body;

  const vendor = await prisma.weddingVendor.update({
    where: { id: vendorId, projectId: id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(category !== undefined && { category }),
      email: email ? String(email).trim() : null,
      phone: phone ? String(phone).trim() : null,
      website: website ? String(website).trim() : null,
      notes: notes ? String(notes).trim() : null,
    },
  });

  return NextResponse.json({ vendor });
}

// DELETE /api/planner/projects/[id]/vendors/[vendorId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, vendorId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weddingVendor.delete({
    where: { id: vendorId, projectId: id },
  });

  return NextResponse.json({ success: true });
}
