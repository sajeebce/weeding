import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/rsvp/[token] — public, no auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const guest = await prisma.weddingGuest.findUnique({
    where: { rsvpToken: token },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      rsvpStatus: true,
      dietary: true,
      rsvpMessage: true,
      rsvpSubmittedAt: true,
      project: {
        select: {
          title: true,
          eventDate: true,
          eventType: true,
        },
      },
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid RSVP link" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}

// POST /api/rsvp/[token] — public RSVP submission
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const existing = await prisma.weddingGuest.findUnique({
    where: { rsvpToken: token },
  });

  if (!existing) {
    return NextResponse.json({ error: "Invalid RSVP link" }, { status: 404 });
  }

  const body = await req.json();
  const { rsvpStatus, dietary, rsvpMessage } = body;

  if (!rsvpStatus || !["ATTENDING", "NOT_ATTENDING"].includes(rsvpStatus)) {
    return NextResponse.json({ error: "Invalid RSVP status" }, { status: 400 });
  }

  const updated = await prisma.weddingGuest.update({
    where: { rsvpToken: token },
    data: {
      rsvpStatus,
      dietary: dietary?.trim() || existing.dietary,
      rsvpMessage: rsvpMessage?.trim() || null,
      rsvpSubmittedAt: new Date(),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rsvpStatus: true,
      dietary: true,
      rsvpMessage: true,
      rsvpSubmittedAt: true,
    },
  });

  return NextResponse.json({ guest: updated });
}
