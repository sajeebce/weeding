import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminAccess, checkAdminOnly, authError } from "@/lib/admin-auth";

// GET - List all presets
export async function GET() {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const presets = await prisma.footerPreset.findMany({
      where: {
        OR: [
          { isBuiltIn: true },
          { isPublic: true },
        ],
      },
      orderBy: [
        { isBuiltIn: "desc" },
        { usageCount: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ presets });
  } catch (error) {
    console.error("Error fetching footer presets:", error);
    return NextResponse.json(
      { error: "Failed to fetch presets" },
      { status: 500 }
    );
  }
}

// POST - Create a new preset
export async function POST(request: Request) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      thumbnail,
      config,
      tags,
      colorPalette,
      isBuiltIn = false,
      isPublic = true,
    } = body;

    if (!name || !config) {
      return NextResponse.json(
        { error: "Name and config are required" },
        { status: 400 }
      );
    }

    const preset = await prisma.footerPreset.create({
      data: {
        name,
        description,
        category: category || "professional",
        thumbnail,
        config,
        tags: tags || [],
        colorPalette,
        isBuiltIn,
        isPublic,
      },
    });

    return NextResponse.json({ preset });
  } catch (error) {
    console.error("Error creating footer preset:", error);
    return NextResponse.json(
      { error: "Failed to create preset" },
      { status: 500 }
    );
  }
}

// PUT - Update a preset
export async function PUT(request: Request) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Preset ID is required" },
        { status: 400 }
      );
    }

    // Check if preset exists and is not a built-in preset (built-in presets can't be edited)
    const existing = await prisma.footerPreset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Preset not found" },
        { status: 404 }
      );
    }

    if (existing.isBuiltIn) {
      return NextResponse.json(
        { error: "Built-in presets cannot be modified" },
        { status: 403 }
      );
    }

    const preset = await prisma.footerPreset.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ preset });
  } catch (error) {
    console.error("Error updating footer preset:", error);
    return NextResponse.json(
      { error: "Failed to update preset" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a preset
export async function DELETE(request: Request) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Preset ID is required" },
        { status: 400 }
      );
    }

    // Check if preset exists and is not a built-in preset
    const existing = await prisma.footerPreset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Preset not found" },
        { status: 404 }
      );
    }

    if (existing.isBuiltIn) {
      return NextResponse.json(
        { error: "Built-in presets cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.footerPreset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting footer preset:", error);
    return NextResponse.json(
      { error: "Failed to delete preset" },
      { status: 500 }
    );
  }
}
