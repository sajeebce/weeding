import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Reserved slugs that have their own routes
const RESERVED_SLUGS = [
  "about",
  "blog",
  "contact",
  "disclaimer",
  "faq",
  "llc",
  "pricing",
  "privacy",
  "refund-policy",
  "services",
  "terms",
  "login",
  "register",
  "dashboard",
  "admin",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Don't generate metadata for reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    return {};
  }

  const page = await prisma.legalPage.findUnique({
    where: { slug, isActive: true },
    select: { metaTitle: true, metaDescription: true, title: true },
  });

  if (!page) {
    return {
      title: "Page Not Found | LLCPad",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | LLCPad`,
    description: page.metaDescription || `${page.title} - LLCPad`,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // Don't handle reserved slugs - they have their own routes
  if (RESERVED_SLUGS.includes(slug)) {
    notFound();
  }

  const page = await prisma.legalPage.findUnique({
    where: { slug, isActive: true },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">Page</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {page.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {formatDate(page.updatedAt)}
            </p>
          </div>

          {/* Content */}
          <div
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
}

// Generate static params for existing pages (optional, for build optimization)
export async function generateStaticParams() {
  const pages = await prisma.legalPage.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return pages
    .filter((page) => !RESERVED_SLUGS.includes(page.slug))
    .map((page) => ({ slug: page.slug }));
}
