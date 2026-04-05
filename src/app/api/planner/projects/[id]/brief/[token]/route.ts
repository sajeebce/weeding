import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string; token: string }> };

// DELETE /api/planner/projects/[id]/brief/[token] — revoke a brief token
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, token } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const brief = await prisma.eventBriefToken.findFirst({
    where: { projectId: id, token, revokedAt: null },
    select: { id: true },
  });
  if (!brief)
    return NextResponse.json({ error: "Token not found" }, { status: 404 });

  await prisma.eventBriefToken.update({
    where: { id: brief.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
