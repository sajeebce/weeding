import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{ key: string }>;
}

// GET /api/admin/settings/[key] - Get single setting
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    const setting = await prisma.setting.findUnique({
      where: { key: decodedKey },
    });

    if (!setting) {
      return NextResponse.json(
        { error: "Setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json(
      { error: "Failed to fetch setting" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings/[key] - Update single setting
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const body = await request.json();
    const { value, type = "string" } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: "Value is required" },
        { status: 400 }
      );
    }

    const setting = await prisma.setting.upsert({
      where: { key: decodedKey },
      update: { value: String(value), type },
      create: { key: decodedKey, value: String(value), type },
    });

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/settings/[key] - Delete single setting
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    await prisma.setting.delete({
      where: { key: decodedKey },
    });

    return NextResponse.json({ message: "Setting deleted successfully" });
  } catch (error) {
    console.error("Error deleting setting:", error);
    return NextResponse.json(
      { error: "Failed to delete setting" },
      { status: 500 }
    );
  }
}
