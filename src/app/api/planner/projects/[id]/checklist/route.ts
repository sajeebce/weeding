import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/checklist
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tasks = await prisma.checklistTask.findMany({
    where: { projectId: id },
    orderBy: [{ dueMonths: "desc" }, { order: "asc" }],
  });

  return NextResponse.json({ tasks });
}

// POST /api/planner/projects/[id]/checklist
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

  // Bulk seed (array of tasks). Pass reset:true to delete all first.
  if (Array.isArray(body.seed)) {
    type SeedTask = { title: string; description?: string | null; subtasks?: unknown; dueMonths?: number | null; category?: string | null; isDefault?: boolean; completed?: boolean; completedAt?: string | null; };
    if (body.reset) {
      await prisma.checklistTask.deleteMany({ where: { projectId: id } });
    } else {
      const count = await prisma.checklistTask.count({ where: { projectId: id } });
      if (count > 0) {
        const tasks = await prisma.checklistTask.findMany({ where: { projectId: id }, orderBy: [{ dueMonths: "desc" }, { order: "asc" }] });
        return NextResponse.json({ tasks }, { status: 201 });
      }
    }

    // Server-side date filter — only insert groups still in the future
    const daysLeft = project.eventDate
      ? Math.max(0, Math.ceil((new Date(project.eventDate).getTime() - Date.now()) / 86400000))
      : null;

    const seedTasks = (body.seed as SeedTask[]).filter((t) => {
      if (t.dueMonths === null || t.dueMonths === undefined || t.dueMonths === 0) return true;
      if (daysLeft === null) return true;
      if (daysLeft > 90) return true;
      if (daysLeft > 60) return t.dueMonths <= 2;
      if (daysLeft > 30) return t.dueMonths <= 1;
      if (daysLeft >= 7) return t.dueMonths <= 0.25;
      return false;
    });

    await prisma.checklistTask.createMany({
      data: seedTasks.map((t, i) => ({
        projectId: id,
        title: t.title,
        description: t.description ?? null,
        subtasks: (t.subtasks as object[]) ?? [],
        dueMonths: t.dueMonths ?? null,
        category: t.category ?? null,
        isDefault: t.isDefault ?? true,
        completed: false,
        order: i,
      })),
    });
    const tasks = await prisma.checklistTask.findMany({ where: { projectId: id }, orderBy: [{ dueMonths: "desc" }, { order: "asc" }] });
    return NextResponse.json({ tasks }, { status: 201 });
  }

  const count = await prisma.checklistTask.count({ where: { projectId: id } });
  const task = await prisma.checklistTask.create({
    data: {
      projectId: id,
      title: body.title?.trim() || "New task",
      description: body.description ?? null,
      subtasks: body.subtasks ?? [],
      dueMonths: body.dueMonths ?? null,
      category: body.category ?? null,
      isDefault: body.isDefault ?? false,
      order: count,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
