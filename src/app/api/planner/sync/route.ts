import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/planner/sync — migrate a local (localStorage) project into the DB
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { localId, title, role, eventType, eventDate } = body;

  if (!localId || !role) {
    return NextResponse.json({ error: "localId and role are required" }, { status: 400 });
  }

  if (!["BRIDE", "GROOM", "PLANNER", "OTHER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const project = await prisma.weddingProject.create({
    data: {
      title: title || "Untitled",
      eventType: eventType || "WEDDING",
      eventDate: eventDate ? new Date(eventDate) : null,
      userId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role,
          displayName: session.user.name || undefined,
        },
      },
    },
    include: { members: true },
  });

  return NextResponse.json({ project }, { status: 201 });
}
