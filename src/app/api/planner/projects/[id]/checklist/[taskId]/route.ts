import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// PUT /api/planner/projects/[id]/checklist/[taskId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, taskId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const task = await prisma.checklistTask.update({
    where: { id: taskId, projectId: id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.completed !== undefined && {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      }),
      ...(body.dueMonths !== undefined && { dueMonths: body.dueMonths }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.subtasks !== undefined && { subtasks: body.subtasks }),
    },
  });

  return NextResponse.json({ task });
}

// DELETE /api/planner/projects/[id]/checklist/[taskId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, taskId } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.checklistTask.delete({ where: { id: taskId, projectId: id } });
  return NextResponse.json({ ok: true });
}
