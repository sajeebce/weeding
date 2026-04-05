import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/planner/projects/[id]/post-wedding
// Returns guestbook entries, guest photos, RSVP counts for the project's website
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Get wedding website
  const website = await prisma.weddingWebsite.findUnique({
    where: { projectId: id },
    select: {
      id: true,
      slug: true,
      published: true,
      guestbookEntries: {
        orderBy: { createdAt: "desc" },
        select: { id: true, authorName: true, message: true, createdAt: true },
      },
      guestPhotos: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, uploaderName: true, caption: true, photoData: true, createdAt: true },
      },
    },
  });

  // RSVP counts from guests
  const guests = await prisma.weddingGuest.findMany({
    where: { projectId: id },
    select: { rsvpStatus: true },
  });

  const rsvpCounts = {
    attending: guests.filter(g => g.rsvpStatus === "ATTENDING").length,
    notAttending: guests.filter(g => g.rsvpStatus === "NOT_ATTENDING").length,
    noReply: guests.filter(g => g.rsvpStatus === "PENDING").length,
    total: guests.length,
  };

  return NextResponse.json({
    website: website ? {
      id: website.id,
      slug: website.slug,
      published: website.published,
    } : null,
    guestbookEntries: (website?.guestbookEntries ?? []).map(e => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    guestPhotos: (website?.guestPhotos ?? []).map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    rsvpCounts,
  });
}
