import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const TESTIMONIAL_TAGS_KEY = "testimonial.tags";

// Default tags if none exist
const DEFAULT_TAGS = [
  { value: "general", label: "General" },
  { value: "llc", label: "LLC Formation" },
  { value: "ein", label: "EIN Application" },
  { value: "amazon", label: "Amazon Services" },
  { value: "banking", label: "Business Banking" },
  { value: "trademark", label: "Trademark" },
  { value: "compliance", label: "Compliance" },
];

// GET - Fetch all testimonial tags
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: TESTIMONIAL_TAGS_KEY },
    });

    if (!setting) {
      // Return default tags if none saved
      return NextResponse.json({ tags: DEFAULT_TAGS });
    }

    const tags = JSON.parse(setting.value);
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching testimonial tags:", error);
    return NextResponse.json({ tags: DEFAULT_TAGS });
  }
}

// POST - Add a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label } = body;

    if (!label || typeof label !== "string" || label.trim() === "") {
      return NextResponse.json(
        { error: "Tag label is required" },
        { status: 400 }
      );
    }

    // Generate value from label (slug format)
    const value = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Get existing tags
    const setting = await prisma.setting.findUnique({
      where: { key: TESTIMONIAL_TAGS_KEY },
    });

    let tags = setting ? JSON.parse(setting.value) : DEFAULT_TAGS;

    // Check if tag already exists
    if (tags.some((t: { value: string }) => t.value === value)) {
      return NextResponse.json(
        { error: "Tag already exists" },
        { status: 400 }
      );
    }

    // Add new tag
    tags.push({ value, label: label.trim() });

    // Save to database
    await prisma.setting.upsert({
      where: { key: TESTIMONIAL_TAGS_KEY },
      update: { value: JSON.stringify(tags) },
      create: {
        key: TESTIMONIAL_TAGS_KEY,
        value: JSON.stringify(tags),
        type: "json",
      },
    });

    return NextResponse.json({ tags, newTag: { value, label: label.trim() } });
  } catch (error) {
    console.error("Error adding testimonial tag:", error);
    return NextResponse.json(
      { error: "Failed to add tag" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a tag
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const value = searchParams.get("value");

    if (!value) {
      return NextResponse.json(
        { error: "Tag value is required" },
        { status: 400 }
      );
    }

    // Get existing tags
    const setting = await prisma.setting.findUnique({
      where: { key: TESTIMONIAL_TAGS_KEY },
    });

    let tags = setting ? JSON.parse(setting.value) : DEFAULT_TAGS;

    // Remove tag
    tags = tags.filter((t: { value: string }) => t.value !== value);

    // Save to database
    await prisma.setting.upsert({
      where: { key: TESTIMONIAL_TAGS_KEY },
      update: { value: JSON.stringify(tags) },
      create: {
        key: TESTIMONIAL_TAGS_KEY,
        value: JSON.stringify(tags),
        type: "json",
      },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error removing testimonial tag:", error);
    return NextResponse.json(
      { error: "Failed to remove tag" },
      { status: 500 }
    );
  }
}
