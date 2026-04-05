import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/itinerary
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const events = await prisma.itineraryEvent.findMany({
    where: { projectId: id },
    orderBy: [{ startTime: "asc" }, { order: "asc" }],
  });

  return NextResponse.json({ events });
}

// POST /api/planner/projects/[id]/itinerary
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
  if (!body.title?.trim() || !body.startTime) return NextResponse.json({ error: "title and startTime required" }, { status: 400 });

  const count = await prisma.itineraryEvent.count({ where: { projectId: id } });
  const event = await prisma.itineraryEvent.create({
    data: {
      projectId: id,
      title: body.title.trim(),
      description: body.description ?? null,
      startTime: body.startTime,
      endTime: body.endTime ?? null,
      location: body.location ?? null,
      category: body.category ?? null,
      order: count,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
