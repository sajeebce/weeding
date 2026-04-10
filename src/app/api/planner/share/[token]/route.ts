import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public — no auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const project = await prisma.weddingProject.findUnique({
    where: { shareToken: token },
    include: {
      eventVenues: { select: { type: true, venueName: true, address: true, city: true, country: true, date: true, time: true } },
      vendors: { select: { id: true, name: true, category: true } },
      guests: { select: { id: true } },
      checklistTasks: { select: { completed: true, subtasks: true } },
      budgetCategories: { select: { name: true, planned: true } },
    },
  });

  if (!project || !project.shareEnabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    title: project.title,
    eventType: project.eventType,
    eventDate: project.eventDate,
    brideName: project.brideName,
    groomName: project.groomName,
    venues: project.eventVenues,
    vendors: project.vendors,
    guestCount: project.guests.length,
    checklistTotal: project.checklistTasks.reduce((s, t) => {
      const subs = (t.subtasks as { completed: boolean }[] | null) ?? [];
      return s + (subs.length > 0 ? subs.length : 1);
    }, 0),
    checklistDone: project.checklistTasks.reduce((s, t) => {
      const subs = (t.subtasks as { completed: boolean }[] | null) ?? [];
      return s + (subs.length > 0 ? subs.filter((sub) => sub.completed).length : (t.completed ? 1 : 0));
    }, 0),
    budgetTotal: project.budgetCategories.reduce((s, c) => s + c.planned, 0),
  });
}
