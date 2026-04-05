import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

function genId() { return randomBytes(12).toString("hex"); }

// GET /api/planner/projects/[id]/seating
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const layouts = await prisma.seatingLayout.findMany({
    where: { projectId: id },
    include: { tables: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ layouts });
}

// POST /api/planner/projects/[id]/seating — create a new layout
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
  const { name, type } = body;

  const layout = await prisma.seatingLayout.create({
    data: {
      id: genId(),
      projectId: id,
      name: name?.trim() || (type === "CEREMONY" ? "Ceremony" : "Reception"),
      type: type || "RECEPTION",
    },
    include: { tables: true },
  });

  return NextResponse.json({ layout }, { status: 201 });
}
