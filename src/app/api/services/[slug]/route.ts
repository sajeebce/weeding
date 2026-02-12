import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/services/[slug] - Get single service with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findUnique({
      where: { slug, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        // Features for comparison table (using correct relation name)
        features: {
          orderBy: { sortOrder: "asc" },
          include: {
            packageMappings: {
              select: {
                id: true,
                packageId: true,
                included: true,
                customValue: true,
                valueType: true,
                addonPriceUSD: true,
                addonPriceBDT: true,
              },
            },
          },
        },
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            features: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, text: true },
            },
            notIncluded: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, text: true },
            },
          },
        },
        faqs: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, question: true, answer: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Transform the data for frontend consumption
    const transformedService = {
      id: service.id,
      slug: service.slug,
      name: service.name,
      shortDesc: service.shortDesc,
      description: service.description,
      icon: service.icon,
      image: service.image,
      startingPrice: Number(service.startingPrice),
      processingTime: service.processingTime,
      isPopular: service.isPopular,
      metaTitle: service.metaTitle,
      metaDescription: service.metaDescription,
      category: service.category,
      // Legacy features (simple text array)
      features: service.features.map((f) => f.text),
      // New comparison table data
      comparisonFeatures: service.features.map((f) => ({
        id: f.id,
        text: f.text,
        tooltip: f.tooltip,
        description: f.description,
        packageMappings: f.packageMappings.map((m) => ({
          id: m.id,
          packageId: m.packageId,
          included: m.included,
          customValue: m.customValue,
          valueType: m.valueType,
          addonPriceUSD: m.addonPriceUSD ? Number(m.addonPriceUSD) : null,
          addonPriceBDT: m.addonPriceBDT ? Number(m.addonPriceBDT) : null,
        })),
      })),
      packages: service.packages.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.priceUSD),
        priceBDT: p.priceBDT ? Number(p.priceBDT) : null,
        isPopular: p.isPopular,
        // New fields
        processingTime: p.processingTime,
        processingTimeNote: p.processingTimeNote,
        processingIcon: p.processingIcon,
        badgeText: p.badgeText,
        badgeColor: p.badgeColor,
        // Legacy features
        features: p.features.map((f) => f.text),
        notIncluded: p.notIncluded.map((n) => n.text),
      })),
      faqs: service.faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
      hasLocationBasedPricing: service.hasLocationBasedPricing,
      displayOptions: service.displayOptions || {},
    };

    return NextResponse.json(transformedService);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}
