import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/budget/[categoryId]/items/[itemId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, categoryId, itemId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const item = await prisma.budgetItem.update({
    where: { id: itemId, categoryId },
    data: {
      description: body.description,
      planned: body.planned,
      actual: body.actual,
      paid: body.paid,
      status: body.status,
      notes: body.notes,
    },
  });

  return NextResponse.json({ item });
}

// DELETE /api/planner/projects/[id]/budget/[categoryId]/items/[itemId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, categoryId, itemId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.budgetItem.delete({ where: { id: itemId, categoryId } });
  return NextResponse.json({ ok: true });
}
