import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/planner/projects/[id]/brief — list active tokens for this project
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const tokens = await prisma.eventBriefToken.findMany({
    where: { projectId: id, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, token: true, createdAt: true },
  });

  return NextResponse.json({ tokens });
}

// POST /api/planner/projects/[id]/brief — generate a new brief token
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const token = randomBytes(20).toString("hex");

  const brief = await prisma.eventBriefToken.create({
    data: { projectId: id, token },
    select: { id: true, token: true, createdAt: true },
  });

  return NextResponse.json({ brief }, { status: 201 });
}
