import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkContentAccess, authError } from "@/lib/admin-auth";

// GET all blog posts
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const posts = await prisma.blogPost.findMany({
      where: status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

// POST create new blog post
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkContentAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();

    // Generate slug from title if not provided
    const slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Handle categories - if empty, assign to Uncategorized
    let categoryIds = body.categoryIds || [];
    if (categoryIds.length === 0) {
      const uncategorized = await prisma.blogCategory.findUnique({
        where: { slug: "uncategorized" },
      });
      if (uncategorized) {
        categoryIds = [uncategorized.id];
      }
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content,
        coverImage: body.coverImage || null,
        authorId: body.authorId || null,
        status: body.status || "DRAFT",
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        tags: body.tags || [],
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
