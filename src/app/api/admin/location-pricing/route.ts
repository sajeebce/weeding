import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// GET /api/admin/location-pricing - Get all locations
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (country) where.country = country;
    if (type) where.type = type.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: [
        { isPopular: "desc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({
      locations: locations.map((loc) => ({
        id: loc.id,
        code: loc.code,
        name: loc.name,
        country: loc.country,
        type: loc.type,
        isPopular: loc.isPopular,
        isActive: loc.isActive,
        sortOrder: loc.sortOrder,
        createdAt: loc.createdAt,
        updatedAt: loc.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// Validation schema
const createLocationSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  type: z.enum(["STATE", "PROVINCE", "COUNTRY", "TERRITORY"]).default("STATE"),
  isPopular: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// POST /api/admin/location-pricing - Create new location
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const body = await request.json();
    const data = createLocationSchema.parse(body);

    // Check if code already exists
    const existing = await prisma.location.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A location with this code already exists" },
        { status: 400 }
      );
    }

    const location = await prisma.location.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        country: data.country,
        type: data.type,
        isPopular: data.isPopular ?? false,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}
