import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/reception
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const venue = await prisma.eventVenue.findUnique({
    where: { projectId_type: { projectId: id, type: "RECEPTION" } },
  });

  return NextResponse.json({ venue });
}

// PUT /api/planner/projects/[id]/reception
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const venue = await prisma.eventVenue.upsert({
    where: { projectId_type: { projectId: id, type: "RECEPTION" } },
    create: {
      projectId: id,
      type: "RECEPTION",
      venueName:   body.venueName   ?? null,
      address:     body.address     ?? null,
      city:        body.city        ?? null,
      country:     body.country     ?? null,
      date:        body.date        ? new Date(body.date) : null,
      time:        body.time        ?? null,
      capacity:    body.capacity    ? Number(body.capacity) : null,
      description: body.description ?? null,
      notes:       body.notes       ?? null,
      layoutNotes: body.layoutNotes ?? null,
    },
    update: {
      venueName:   body.venueName   ?? null,
      address:     body.address     ?? null,
      city:        body.city        ?? null,
      country:     body.country     ?? null,
      date:        body.date        ? new Date(body.date) : null,
      time:        body.time        ?? null,
      capacity:    body.capacity    ? Number(body.capacity) : null,
      description: body.description ?? null,
      notes:       body.notes       ?? null,
      layoutNotes: body.layoutNotes ?? null,
    },
  });

  return NextResponse.json({ venue });
}
