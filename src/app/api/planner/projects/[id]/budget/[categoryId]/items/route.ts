import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/planner/projects/[id]/budget/[categoryId]/items
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, categoryId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const count = await prisma.budgetItem.count({ where: { categoryId } });
  const item = await prisma.budgetItem.create({
    data: {
      projectId: id,
      categoryId,
      description: body.description?.trim() || "New item",
      planned: body.planned ?? 0,
      actual: body.actual ?? 0,
      paid: body.paid ?? 0,
      status: body.status ?? "UNPAID",
      notes: body.notes ?? null,
      order: count,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
