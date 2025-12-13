import { MetadataRoute } from "next";
import prisma from "@/lib/db";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://llcpad.com";

// State pages for LLC formation
const states = [
  "wyoming",
  "delaware",
  "new-mexico",
  "nevada",
  "florida",
  "texas",
  "california",
  "new-york",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch active services from database
  let serviceSlugs: string[] = [];
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { sortOrder: "asc" },
    });
    serviceSlugs = services.map((s) => s.slug);
  } catch (error) {
    console.error("Error fetching services for sitemap:", error);
    // Fallback to common services if database fails
    serviceSlugs = [
      "llc-formation",
      "ein-application",
      "amazon-seller",
      "registered-agent",
      "business-banking",
      "virtual-address",
    ];
  }

  // Fetch published blog posts
  let blogSlugs: string[] = [];
  try {
    const blogs = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
    });
    blogSlugs = blogs.map((b) => b.slug);
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Service pages
  const servicePages: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // State-specific LLC pages
  const statePages: MetadataRoute.Sitemap = states.map((state) => ({
    url: `${baseUrl}/llc/${state}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages, ...blogPages, ...statePages];
}
