import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type Params = { params: Promise<{ websiteId: string }> };

// GET /api/guest-photos/[websiteId] — public: list photos
export async function GET(
  _req: NextRequest,
  { params }: Params
) {
  const { websiteId } = await params;

  const site = await prisma.weddingWebsite.findFirst({
    where: { id: websiteId, published: true },
    select: { id: true },
  });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const photos = await prisma.guestPhoto.findMany({
    where: { websiteId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, uploaderName: true, caption: true, photoData: true, createdAt: true },
  });

  return NextResponse.json({ photos });
}

// POST /api/guest-photos/[websiteId] — public: upload photo (base64)
export async function POST(
  req: NextRequest,
  { params }: Params
) {
  const { websiteId } = await params;

  const site = await prisma.weddingWebsite.findFirst({
    where: { id: websiteId, published: true },
    select: { id: true },
  });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const photoData = String(body.photoData ?? "").trim();
  const uploaderName = String(body.uploaderName ?? "").trim() || null;
  const caption = String(body.caption ?? "").trim() || null;

  if (!photoData) return NextResponse.json({ error: "Photo data is required" }, { status: 400 });
  // Validate it's a base64 image (data URI)
  if (!photoData.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
  }
  // Limit size (~1MB base64 ≈ 750KB file)
  if (photoData.length > 1_500_000) {
    return NextResponse.json({ error: "Image too large. Please resize before uploading." }, { status: 400 });
  }

  const photo = await prisma.guestPhoto.create({
    data: { websiteId, uploaderName, caption, photoData },
    select: { id: true, uploaderName: true, caption: true, photoData: true, createdAt: true },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
