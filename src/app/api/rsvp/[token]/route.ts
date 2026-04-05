import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";

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
    include: {
      project: {
        select: {
          id: true,
          title: true,
          brideName: true,
          groomName: true,
          eventDate: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
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

  // Send email notification to couple (fire-and-forget — never block the response)
  const coupleEmail = existing.project.user?.email;
  if (coupleEmail) {
    const guestName = [existing.title, existing.firstName, existing.lastName]
      .filter(Boolean)
      .join(" ");
    const isAttending = rsvpStatus === "ATTENDING";
    const eventTitle = existing.project.title;
    const eventDate = existing.project.eventDate
      ? new Date(existing.project.eventDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    const statusLabel = isAttending ? "✅ Attending" : "❌ Not Attending";
    const statusColor = isAttending ? "#16a34a" : "#dc2626";

    sendEmail({
      to: coupleEmail,
      subject: `RSVP received — ${guestName} ${isAttending ? "is attending!" : "can't make it"}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:32px;">💌</span>
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:8px 0 4px;">${eventTitle}</h1>
            ${eventDate ? `<p style="font-size:13px;color:#6b7280;margin:0;">${eventDate}</p>` : ""}
          </div>

          <div style="background:#fdf2f8;border-radius:16px;padding:20px;margin-bottom:20px;">
            <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">New RSVP response</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${guestName}</p>
            <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:${statusColor};">${statusLabel}</p>
          </div>

          ${
            dietary
              ? `<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Dietary requirements</p>
                  <p style="margin:0;font-size:14px;color:#374151;">${dietary}</p>
                </div>`
              : ""
          }

          ${
            rsvpMessage
              ? `<div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
                  <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${rsvpMessage}"</p>
                </div>`
              : ""
          }

          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
            This notification was sent automatically by your wedding planner.
          </p>
        </div>
      `,
    }).catch(() => {
      // Silently ignore email errors — RSVP submission already succeeded
    });
  }

  return NextResponse.json({ guest: updated });
}
