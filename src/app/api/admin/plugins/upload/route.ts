// Plugin ZIP Upload API
import { NextRequest, NextResponse } from "next/server";
import { pluginInstaller } from "@/services/plugin-installer";

// POST /api/admin/plugins/upload - Upload and extract plugin ZIP
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Only ZIP files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract and validate
    const result = await pluginInstaller.extractAndValidate(buffer, file.name);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return manifest info for license activation
    return NextResponse.json({
      success: true,
      plugin: {
        slug: result.manifest!.slug,
        name: result.manifest!.name,
        version: result.manifest!.version,
        description: result.manifest!.description,
        author: result.manifest!.author,
        icon: result.manifest!.icon,
      },
      requiresLicense: result.requiresLicense,
      manifest: result.manifest,
    });
  } catch (error) {
    console.error("Plugin upload error:", error);
    return NextResponse.json(
      { error: "Failed to process plugin file" },
      { status: 500 }
    );
  }
}
