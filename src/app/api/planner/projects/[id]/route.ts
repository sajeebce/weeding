import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { checkAdminAccess } from "@/lib/admin-auth";

// GET /api/planner/projects/[id] — get single project (admin can view any)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Admins can view any project; regular users only their own
  const adminAuth = await checkAdminAccess();
  const isAdmin = !adminAuth.error;

  const project = await prisma.weddingProject.findFirst({
    where: isAdmin ? { id } : { id, userId: session.user.id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

// PUT /api/planner/projects/[id] — update project
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Verify ownership
  const existing = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { title, eventDate, status, coverImage, settings, brideName, groomName } = body;

  try {
    const project = await prisma.weddingProject.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
        ...(status !== undefined && { status }),
        ...(coverImage !== undefined && { coverImage }),
        ...(settings !== undefined && { settings }),
        ...(brideName !== undefined && { brideName: brideName || null }),
        ...(groomName !== undefined && { groomName: groomName || null }),
      },
    });
    return NextResponse.json({ project });
  } catch (e) {
    console.error("[PUT /api/planner/projects]", e);
    return NextResponse.json({ error: "Update failed", detail: String(e) }, { status: 500 });
  }
}

// DELETE /api/planner/projects/[id] — delete project
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.weddingProject.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
