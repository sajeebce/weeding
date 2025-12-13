import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, faqCategories, getFAQsByCategory } from "@/lib/data/faqs";
import { MultiJsonLd } from "@/components/seo/json-ld";
import { generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about US LLC formation, EIN application, business banking, Amazon seller accounts, and more. Get the information you need.",
  keywords: [
    "LLC FAQ",
    "LLC formation questions",
    "EIN FAQ",
    "business formation help",
    "Amazon seller FAQ",
    "international LLC",
  ],
  openGraph: {
    title: "FAQ - Frequently Asked Questions | LLCPad",
    description:
      "Find answers to common questions about US LLC formation, EIN application, business banking, Amazon seller accounts, and more.",
  },
};

// Fetch service FAQs grouped by category
async function getServiceFAQs() {
  const categories = await prisma.serviceCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: { sortOrder: "asc" },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          faqs: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  return categories;
}

export default async function FAQPage() {
  const serviceCategories = await getServiceFAQs();

  // Collect all FAQs for schema
  const allFaqs = [
    ...faqs,
    ...serviceCategories.flatMap((cat) =>
      cat.services.flatMap((service) =>
        service.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))
      )
    ),
  ];

  const schemaData = [
    generateFAQSchema(
      allFaqs.map((faq) => ({ question: faq.question, answer: faq.answer }))
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "FAQ", url: "/faq" },
    ]),
  ];

  // Create service category links
  const serviceCategoryLinks = serviceCategories
    .filter((cat) => cat.services.some((s) => s.faqs.length > 0))
    .map((cat) => ({
      id: `service-${cat.slug}`,
      name: cat.name,
    }));

  return (
    <div className="py-16 lg:py-24">
      <MultiJsonLd data={schemaData} />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Help Center
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about US LLC formation, EIN
            application, business banking, and more.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-wrap justify-center gap-2">
            {/* General FAQ categories */}
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {category.name}
              </a>
            ))}
            {/* Service-based categories */}
            {serviceCategoryLinks.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/10"
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

        {/* General FAQ Sections */}
        <div className="mx-auto mt-16 max-w-3xl space-y-12">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              General Questions
            </Badge>
          </div>

          {faqCategories.map((category) => {
            const categoryFaqs = getFAQsByCategory(category.id);
            if (categoryFaqs.length === 0) return null;

            return (
              <section key={category.id} id={category.id}>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  {category.name}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {categoryFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.id}-${index}`}
                    >
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            );
          })}
        </div>

        {/* Service-Specific FAQs */}
        {serviceCategories.some((cat) =>
          cat.services.some((s) => s.faqs.length > 0)
        ) && (
          <div className="mx-auto mt-20 max-w-3xl space-y-12">
            <div className="text-center">
              <Badge className="mb-2">Service-Specific FAQs</Badge>
              <p className="text-muted-foreground">
                Detailed answers about our individual services
              </p>
            </div>

            {serviceCategories.map((category) => {
              // Only show categories that have services with FAQs
              const servicesWithFaqs = category.services.filter(
                (s) => s.faqs.length > 0
              );
              if (servicesWithFaqs.length === 0) return null;

              return (
                <section key={category.id} id={`service-${category.slug}`}>
                  <div className="mb-8 rounded-lg border bg-muted/30 p-4">
                    <h2 className="text-2xl font-bold text-foreground">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-8">
                    {servicesWithFaqs.map((service) => (
                      <div key={service.id} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">
                            {service.name}
                          </h3>
                          <Link
                            href={`/services/${service.slug}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View Service
                          </Link>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          {service.faqs.map((faq, index) => (
                            <AccordionItem
                              key={faq.id}
                              value={`${service.slug}-${index}`}
                            >
                              <AccordionTrigger className="text-left">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Still Have Questions */}
        <div className="mx-auto mt-16 max-w-2xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MessageCircle className="h-6 w-6" />
              </div>
              <CardTitle>Still Have Questions?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-muted-foreground">
                Can&apos;t find the answer you&apos;re looking for? Our team is here to
                help. Reach out and we&apos;ll get back to you within 24 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/support">Open Support Ticket</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Services CTA */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Ready to Get Started?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/services/llc-formation">
              <Card className="h-full transition-all hover:border-primary">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">LLC Formation</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From $199 + state fee
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/services/ein-application">
              <Card className="h-full transition-all hover:border-primary">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">EIN Application</h3>
                  <p className="mt-2 text-sm text-muted-foreground">From $99</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/services/amazon-seller-account">
              <Card className="h-full transition-all hover:border-primary">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold">Amazon Seller Setup</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    From $349
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
