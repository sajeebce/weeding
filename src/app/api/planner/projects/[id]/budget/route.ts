import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/budget — list categories + items
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const categories = await prisma.budgetCategory.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ categories, budgetGoal: project.budgetGoal ?? 0 });
}

// PATCH /api/planner/projects/[id]/budget — update budgetGoal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { budgetGoal } = await req.json();
  await prisma.weddingProject.update({ where: { id }, data: { budgetGoal: budgetGoal ?? 0 } });
  return NextResponse.json({ budgetGoal });
}

// POST /api/planner/projects/[id]/budget — create category
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, planned, color } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const count = await prisma.budgetCategory.count({ where: { projectId: id } });
  const category = await prisma.budgetCategory.create({
    data: { projectId: id, name: name.trim(), planned: planned ?? 0, color: color ?? "#6366f1", order: count },
    include: { items: true },
  });

  return NextResponse.json({ category }, { status: 201 });
}
