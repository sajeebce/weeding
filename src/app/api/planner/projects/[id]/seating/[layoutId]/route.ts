import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/seating/[layoutId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, layoutId } = await params;
  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, bgColor, width, height } = body;

  const layout = await prisma.seatingLayout.update({
    where: { id: layoutId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(bgColor !== undefined && { bgColor }),
      ...(width !== undefined && { width: Number(width) }),
      ...(height !== undefined && { height: Number(height) }),
    },
    include: { tables: { orderBy: { createdAt: "asc" } } },
  });

  return NextResponse.json({ layout });
}

// DELETE /api/planner/projects/[id]/seating/[layoutId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, layoutId } = await params;
  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.seatingLayout.delete({ where: { id: layoutId } });
  return NextResponse.json({ success: true });
}
