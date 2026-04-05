import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

// POST /api/planner/projects/[id]/guests/[guestId]/token
// Returns existing token or generates a new one
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, guestId } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guest = await prisma.weddingGuest.findFirst({
    where: { id: guestId, projectId: id },
  });
  if (!guest) return NextResponse.json({ error: "Guest not found" }, { status: 404 });

  // Return existing token or generate a new one
  const token = guest.rsvpToken ?? randomBytes(16).toString("hex");

  if (!guest.rsvpToken) {
    await prisma.weddingGuest.update({
      where: { id: guestId },
      data: { rsvpToken: token },
    });
  }

  return NextResponse.json({ token });
}
