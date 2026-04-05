import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/public/seat-finder/[projectId]
// Public endpoint — returns tables + guest names for QR seat finder
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const project = await prisma.weddingProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      brideName: true,
      groomName: true,
      eventDate: true,
      seatingLayouts: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      seatingTables: {
        select: {
          id: true,
          layoutId: true,
          name: true,
          type: true,
          seats: true,
          guestIds: true,
        },
      },
      guests: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          title: true,
          rsvpStatus: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Build guest map for fast lookup
  const guestMap: Record<string, { id: string; name: string; rsvpStatus: string }> = {};
  for (const g of project.guests) {
    guestMap[g.id] = {
      id: g.id,
      name: [g.title, g.firstName, g.lastName].filter(Boolean).join(" "),
      rsvpStatus: g.rsvpStatus,
    };
  }

  // Enrich tables with guest names
  const tables = project.seatingTables.map((table) => {
    const guestIds = (table.guestIds as string[]) ?? [];
    const guests = guestIds
      .map((gid) => guestMap[gid])
      .filter(Boolean);
    return {
      id: table.id,
      layoutId: table.layoutId,
      name: table.name,
      type: table.type,
      seats: table.seats,
      guests,
    };
  });

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      brideName: project.brideName,
      groomName: project.groomName,
      eventDate: project.eventDate,
    },
    tables,
    layouts: project.seatingLayouts,
  });
}
