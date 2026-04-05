import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ websiteId: string }> };

// GET /api/guestbook/[websiteId] — public: list approved entries
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const { websiteId } = await params;

  // Verify website exists and is published
  const site = await prisma.weddingWebsite.findFirst({
    where: { id: websiteId, published: true },
    select: { id: true },
  });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entries = await prisma.guestbookEntry.findMany({
    where: { websiteId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, authorName: true, message: true, createdAt: true },
  });

  return NextResponse.json({ entries });
}

// POST /api/guestbook/[websiteId] — public: submit a message
export async function POST(
  req: NextRequest,
  { params }: Params
) {
  const { websiteId } = await params;

  // Verify website exists and is published
  const site = await prisma.weddingWebsite.findFirst({
    where: { id: websiteId, published: true },
    select: { id: true },
  });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const authorName = String(body.authorName ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!authorName) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  if (authorName.length > 100) return NextResponse.json({ error: "Name too long" }, { status: 400 });
  if (message.length > 1000) return NextResponse.json({ error: "Message too long (max 1000 chars)" }, { status: 400 });

  const entry = await prisma.guestbookEntry.create({
    data: { websiteId, authorName, message },
    select: { id: true, authorName: true, message: true, createdAt: true },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
