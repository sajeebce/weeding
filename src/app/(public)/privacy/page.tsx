import { Metadata } from "next";
import prisma from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "privacy", isActive: true },
    select: { metaTitle: true, metaDescription: true, title: true },
  });

  if (!page) {
    return {
      title: "Privacy Policy | LLCPad",
      description: "Learn how LLCPad collects, uses, and protects your personal information.",
    };
  }

  return {
    title: page.metaTitle || `${page.title} | LLCPad`,
    description: page.metaDescription || "Learn how LLCPad collects, uses, and protects your personal information.",
  };
}

// Fallback content if database page doesn't exist
function FallbackPrivacyContent() {
  return (
    <div className="bg-card rounded-xl border p-6 md:p-10 shadow-sm space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="text-muted-foreground mb-4">
          We collect information you provide directly to us, such as when you create an account,
          place an order, contact us for support, or communicate with us via live chat.
        </p>
        <p className="text-muted-foreground mb-3">This information may include:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Name, email address, and phone number</li>
          <li>Billing and payment information</li>
          <li>Business information (LLC name, state of formation, etc.)</li>
          <li>Communications you send to us</li>
          <li>Any other information you choose to provide</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Process and fulfill your orders</li>
          <li>Communicate with you about your orders and services</li>
          <li>Provide customer support</li>
          <li>Send you marketing communications (with your consent)</li>
          <li>Improve our services and develop new features</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Information Sharing</h2>
        <p className="text-muted-foreground mb-3">
          We do not sell your personal information. We may share your information with:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Service providers who assist in our operations (payment processors, registered agents, etc.)</li>
          <li>Government agencies as required for business formation services</li>
          <li>Professional advisors (lawyers, accountants) when necessary</li>
          <li>Law enforcement when required by law</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
        <p className="text-muted-foreground">
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">5. Your Rights</h2>
        <p className="text-muted-foreground mb-3">You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information (subject to legal requirements)</li>
          <li>Opt out of marketing communications</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
        <p className="text-muted-foreground">
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:support@llcpad.com" className="text-primary hover:underline">
            support@llcpad.com
          </a>
        </p>
      </section>
    </div>
  );
}

export default async function PrivacyPolicyPage() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "privacy", isActive: true },
  });

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-4">Legal</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {page?.title || "Privacy Policy"}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {page ? formatDate(page.updatedAt) : "December 15, 2025"}
              {page && ` (Version ${page.version})`}
            </p>
          </div>

          {/* Content */}
          {page ? (
            <div
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <FallbackPrivacyContent />
          )}

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
