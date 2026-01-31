import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Fallback testimonials if database is empty
const fallbackTestimonials = [
  {
    id: "fallback_1",
    name: "Rahman Ahmed",
    company: "TechBD Solutions",
    country: "Bangladesh",
    avatar: null,
    content:
      "LLCPad made forming my US LLC incredibly easy. The team was responsive and guided me through every step. Highly recommended!",
    rating: 5,
    type: "photo" as "photo" | "video",
    videoUrl: null,
    thumbnailUrl: null,
  },
  {
    id: "fallback_2",
    name: "Sarah Chen",
    company: "Global Imports Co",
    country: "China",
    avatar: null,
    content:
      "Professional service with excellent communication. Got my Wyoming LLC and EIN within 2 weeks. Very satisfied!",
    rating: 5,
    type: "photo" as "photo" | "video",
    videoUrl: null,
    thumbnailUrl: null,
  },
  {
    id: "fallback_3",
    name: "Mohammed Al-Farsi",
    company: "Gulf Trading LLC",
    country: "UAE",
    avatar: null,
    content:
      "The premium package was worth every penny. They helped me set up everything including my Amazon seller account.",
    rating: 5,
    type: "photo" as "photo" | "video",
    videoUrl: null,
    thumbnailUrl: null,
  },
  {
    id: "fallback_4",
    name: "Priya Sharma",
    company: "Amazon FBA Seller",
    country: "India",
    avatar: null,
    content:
      "I was hesitant about starting a US business from India, but LLCPad made it incredibly smooth. Within 10 days, I had my LLC, EIN, and Amazon seller account ready.",
    rating: 5,
    type: "photo" as "photo" | "video",
    videoUrl: null,
    thumbnailUrl: null,
  },
  {
    id: "fallback_5",
    name: "Imran Khan",
    company: "Digital Marketing Agency",
    country: "Pakistan",
    avatar: null,
    content:
      "After comparing 5+ services, I chose LLCPad for their transparency and expertise. Best decision ever! True business partners.",
    rating: 5,
    type: "photo" as "photo" | "video",
    videoUrl: null,
    thumbnailUrl: null,
  },
  {
    id: "fallback_6",
    name: "Omar Hassan",
    company: "Import/Export Business",
    country: "UAE",
    avatar: null,
    content:
      "Exceptional experience from start to finish! LLCPad helped me establish my US entity for international trade. Trustworthy partner for global business.",
    rating: 5,
    type: "photo" as "photo" | "video",
    videoUrl: null,
    thumbnailUrl: null,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "6", 10);
    const sortBy = searchParams.get("sortBy") || "sort-order";
    const type = searchParams.get("type") || "all"; // photo, video, or all
    const tagsParam = searchParams.get("tags"); // comma-separated tags

    // Build sort order
    let orderBy: Record<string, "asc" | "desc"> = { sortOrder: "asc" };
    switch (sortBy) {
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "recent":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { sortOrder: "asc" };
    }

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Filter by type
    if (type === "photo") {
      where.type = "PHOTO";
    } else if (type === "video") {
      where.type = "VIDEO";
    }

    // Filter by tags (any match)
    if (tagsParam) {
      const tags = tagsParam.split(",").map((t) => t.trim().toLowerCase());
      where.tags = { hasSome: tags };
    }

    // Fetch from database
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy,
      take: limit,
    });

    // If no testimonials in database, return fallbacks
    if (testimonials.length === 0) {
      let filteredFallbacks = fallbackTestimonials;

      // Apply type filter to fallbacks
      if (type === "photo") {
        filteredFallbacks = filteredFallbacks.filter((t) => t.type === "photo");
      } else if (type === "video") {
        filteredFallbacks = filteredFallbacks.filter((t) => t.type === "video");
      }

      return NextResponse.json({ testimonials: filteredFallbacks.slice(0, limit) });
    }

    // Map database records to widget format
    const mappedTestimonials = testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      company: t.company,
      country: t.country,
      avatar: t.avatar,
      content: t.content,
      rating: t.rating,
      type: t.type.toLowerCase() as "photo" | "video",
      videoUrl: t.videoUrl,
      thumbnailUrl: t.thumbnailUrl,
      tags: t.tags,
    }));

    return NextResponse.json({ testimonials: mappedTestimonials });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    // Return fallbacks on error
    return NextResponse.json({ testimonials: fallbackTestimonials.slice(0, 6) });
  }
}
