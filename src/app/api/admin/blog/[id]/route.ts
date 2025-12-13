import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

// PUT update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get existing post to check status change
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { categories: true },
    });

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

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        content: body.content,
        coverImage: body.coverImage || null,
        status: body.status,
        // Set publishedAt when first published
        publishedAt:
          body.status === "PUBLISHED" && existingPost?.status !== "PUBLISHED"
            ? new Date()
            : existingPost?.publishedAt,
        tags: body.tags || [],
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        categories: {
          set: categoryIds.map((id: string) => ({ id })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

// DELETE blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
