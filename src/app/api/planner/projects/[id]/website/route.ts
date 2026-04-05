import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET /api/planner/projects/[id]/website
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const website = await prisma.weddingWebsite.findUnique({ where: { projectId: id } });
  return NextResponse.json({ website });
}

// PUT /api/planner/projects/[id]/website
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const project = await prisma.weddingProject.findFirst({ where: { id, userId: session.user.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Generate a unique slug if none provided
  const rawSlug = (body.slug as string | undefined) ?? `wedding-${id.slice(-8)}`;
  // Ensure slug uniqueness (if another project already uses it, append project id suffix)
  const existingBySlug = await prisma.weddingWebsite.findUnique({ where: { slug: rawSlug } });
  const slug = (existingBySlug && existingBySlug.projectId !== id)
    ? `${rawSlug}-${id.slice(-4)}`
    : rawSlug;

  const website = await prisma.weddingWebsite.upsert({
    where: { projectId: id },
    create: {
      projectId: id,
      slug,
      published:    body.published    ?? false,
      theme:        body.theme        ?? "modern",
      primaryColor: body.primaryColor ?? "#7c3aed",
      accentColor:  body.accentColor  ?? "#ede9fe",
      fontFamily:   body.fontFamily   ?? "Inter",
      blocks:       body.blocks       ?? [],
      password:     body.password     ?? null,
    },
    update: {
      ...(body.slug         !== undefined && { slug }),
      ...(body.published    !== undefined && { published:    body.published }),
      ...(body.theme        !== undefined && { theme:        body.theme }),
      ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
      ...(body.accentColor  !== undefined && { accentColor:  body.accentColor }),
      ...(body.fontFamily   !== undefined && { fontFamily:   body.fontFamily }),
      ...(body.blocks       !== undefined && { blocks:       body.blocks }),
      ...(body.password     !== undefined && { password:     body.password }),
    },
  });

  return NextResponse.json({ website });
}
