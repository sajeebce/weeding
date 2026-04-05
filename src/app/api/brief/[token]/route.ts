import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

// GET /api/brief/[token] — public: fetch event brief data for a valid token
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  // Step 1: validate token
  const record = await prisma.eventBriefToken.findUnique({
    where: { token },
    select: { projectId: true, revokedAt: true, createdAt: true },
  });

  if (!record || record.revokedAt) {
    return NextResponse.json(
      { error: "Brief not found or has been revoked" },
      { status: 404 }
    );
  }

  // Step 2: fetch project data
  const p = await prisma.weddingProject.findUnique({
    where: { id: record.projectId },
    select: {
      id: true,
      title: true,
      brideName: true,
      groomName: true,
      eventDate: true,
      budgetGoal: true,
      eventType: true,
      eventVenues: {
        select: {
          type: true,
          venueName: true,
          city: true,
          country: true,
          date: true,
          time: true,
          capacity: true,
        },
      },
      vendors: {
        select: { category: true },
      },
      budgetCategories: {
        select: {
          items: { select: { planned: true } },
        },
      },
      guests: {
        select: { id: true },
      },
    },
  });

  if (!p) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const guestCount = p.guests.length;

  const totalPlanned = p.budgetCategories.reduce(
    (sum: number, cat: { items: { planned: number }[] }) =>
      sum + cat.items.reduce((s: number, item: { planned: number }) => s + item.planned, 0),
    0
  );

  const confirmedCategories = [
    ...new Set(p.vendors.map((v: { category: string }) => v.category)),
  ];

  const brief = {
    title: p.title,
    brideName: p.brideName,
    groomName: p.groomName,
    eventDate: p.eventDate,
    eventType: p.eventType,
    budgetGoal: p.budgetGoal,
    totalPlanned,
    guestCount,
    ceremony: p.eventVenues.find((v: { type: string }) => v.type === "CEREMONY") ?? null,
    reception: p.eventVenues.find((v: { type: string }) => v.type === "RECEPTION") ?? null,
    confirmedVendorCategories: confirmedCategories,
    generatedAt: record.createdAt,
  };

  return NextResponse.json({ brief });
}
