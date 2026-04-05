import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects — list user's projects
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.weddingProject.findMany({
    where: { userId: session.user.id },
    include: {
      members: {
        select: { id: true, role: true, displayName: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects });
}

// POST /api/planner/projects — create new project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { role, eventType = "WEDDING" } = body;

  if (!role || !["BRIDE", "GROOM", "PLANNER", "OTHER"].includes(role)) {
    return NextResponse.json(
      { error: "Valid role is required (BRIDE, GROOM, PLANNER, OTHER)" },
      { status: 400 }
    );
  }

  const project = await prisma.weddingProject.create({
    data: {
      title: "Untitled",
      eventType,
      userId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role,
          displayName: session.user.name || undefined,
        },
      },
    },
    include: {
      members: true,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
