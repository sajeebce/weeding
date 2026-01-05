import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkAdminOnly, authError } from "@/lib/admin-auth";

// POST - Fix missing package feature mappings
export async function POST() {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    // Get all services with their features and packages
    const services = await prisma.service.findMany({
      include: {
        features: {
          select: { id: true },
        },
        packages: {
          select: { id: true },
        },
      },
    });

    let created = 0;

    for (const service of services) {
      for (const feature of service.features) {
        for (const pkg of service.packages) {
          // Check if mapping exists
          const existing = await prisma.packageFeatureMap.findUnique({
            where: {
              packageId_featureId: {
                packageId: pkg.id,
                featureId: feature.id,
              },
            },
          });

          // Create if not exists
          if (!existing) {
            await prisma.packageFeatureMap.create({
              data: {
                packageId: pkg.id,
                featureId: feature.id,
                included: false,
                valueType: "BOOLEAN",
              },
            });
            created++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${created} missing mappings`,
      servicesProcessed: services.length,
    });
  } catch (error) {
    console.error("Error fixing mappings:", error);
    return NextResponse.json(
      { error: "Failed to fix mappings: " + String(error) },
      { status: 500 }
    );
  }
}

// GET - Check missing mappings count
export async function GET() {
  try {
    const accessCheck = await checkAdminOnly();
    if ("error" in accessCheck) {
      return authError(accessCheck);
    }

    const services = await prisma.service.findMany({
      include: {
        features: {
          include: {
            packageMappings: true,
          },
        },
        packages: true,
      },
    });

    let missingCount = 0;
    const details: { service: string; feature: string; missingPackages: string[] }[] = [];

    for (const service of services) {
      for (const feature of service.features) {
        const mappedPackageIds = feature.packageMappings.map((m) => m.packageId);
        const missingPackages = service.packages.filter(
          (p) => !mappedPackageIds.includes(p.id)
        );

        if (missingPackages.length > 0) {
          missingCount += missingPackages.length;
          details.push({
            service: service.name,
            feature: feature.text,
            missingPackages: missingPackages.map((p) => p.name),
          });
        }
      }
    }

    return NextResponse.json({
      missingCount,
      details: details.slice(0, 10), // Show first 10 only
    });
  } catch (error) {
    console.error("Error checking mappings:", error);
    return NextResponse.json(
      { error: "Failed to check mappings" },
      { status: 500 }
    );
  }
}
