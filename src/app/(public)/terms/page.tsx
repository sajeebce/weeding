import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "terms", isActive: true },
    select: { metaTitle: true, metaDescription: true, title: true },
  });

  if (!page) {
    return {
      title: "Terms of Service | LLCPad",
      description: "Terms and conditions for using LLCPad services.",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | LLCPad`,
    description: page.metaDescription || "Terms and conditions for using LLCPad services.",
  };
}

export default async function TermsPage() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "terms", isActive: true },
  });

  if (!page) {
    // Show a fallback message if page not created yet
    return (
      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Our Terms of Service page is being updated. Please check back soon or contact us at support@llcpad.com for any questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {page.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {formatDate(page.updatedAt)} (Version {page.version})
            </p>
          </div>

          {/* Content */}
          <div
            className="prose prose-gray dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Footer Note */}
          <div className="mt-12 rounded-lg border bg-muted/50 p-6">
            <p className="text-sm text-muted-foreground">
              <strong>Important:</strong> LLCPad is a business formation service, not a law firm.
              This document does not constitute legal advice. Please consult with a licensed attorney
              for legal matters specific to your situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
