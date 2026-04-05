import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

function genId() { return randomBytes(12).toString("hex"); }

// POST /api/planner/projects/[id]/seating/[layoutId]/tables
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; layoutId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, layoutId } = await params;
  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const layout = await prisma.seatingLayout.findFirst({ where: { id: layoutId, projectId: id } });
  if (!layout) return NextResponse.json({ error: "Layout not found" }, { status: 404 });

  const body = await req.json();
  const { name, type, x, y, seats, rotation, color, guestIds } = body;

  // Auto-name: count existing tables
  const count = await prisma.seatingTable.count({ where: { layoutId } });
  const tableName = name?.trim() || `Table ${count + 1}`;

  const table = await prisma.seatingTable.create({
    data: {
      id: genId(),
      layoutId,
      projectId: id,
      name: tableName,
      type: type || "ROUND",
      x: x ?? 200,
      y: y ?? 200,
      seats: seats ?? 8,
      rotation: rotation ?? 0,
      color: color ?? "#ffffff",
      guestIds: guestIds ?? [],
    },
  });

  return NextResponse.json({ table }, { status: 201 });
}
