import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/budget/[categoryId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, categoryId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const category = await prisma.budgetCategory.update({
    where: { id: categoryId, projectId: id },
    data: { name: body.name, planned: body.planned, color: body.color },
    include: { items: true },
  });

  return NextResponse.json({ category });
}

// DELETE /api/planner/projects/[id]/budget/[categoryId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, categoryId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.budgetCategory.delete({ where: { id: categoryId, projectId: id } });
  return NextResponse.json({ ok: true });
}
