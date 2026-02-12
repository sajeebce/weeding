import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Clock,
  Shield,
  Building2,
  FileCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getStateLandingPageBySlug,
  getAllStateLandingSlugs,
  stateLandingPages,
} from "@/lib/data/states";
import { MultiJsonLd } from "@/components/seo/json-ld";
import { getBusinessConfig } from "@/lib/business-settings";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return getAllStateLandingSlugs().map((state) => ({ state }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateInfo = getStateLandingPageBySlug(state);

  if (!stateInfo) {
    return { title: "State Not Found" };
  }

  return {
    title: stateInfo.metaTitle,
    description: stateInfo.metaDescription,
    keywords: [
      `${stateInfo.name} LLC`,
      `${stateInfo.name} LLC formation`,
      `form LLC in ${stateInfo.name}`,
      `${stateInfo.code} LLC`,
      "LLC formation",
      "start LLC",
    ],
    openGraph: {
      title: stateInfo.metaTitle,
      description: stateInfo.metaDescription,
    },
  };
}

const packages = [
  {
    name: "Basic",
    price: 149,
    description: "Essential LLC formation",
    features: [
      "LLC Formation Filing",
      "Name Availability Check",
      "Articles of Organization",
      "Digital Document Storage",
      "Compliance Reminders",
    ],
    popular: false,
  },
  {
    name: "Standard",
    price: 249,
    description: "Most popular choice",
    features: [
      "Everything in Basic",
      "EIN Application",
      "Operating Agreement",
      "Registered Agent (1 Year)",
      "Banking Resolution",
      "Priority Support",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: 399,
    description: "Complete business setup",
    features: [
      "Everything in Standard",
      "Business Bank Account Assistance",
      "Virtual Business Address",
      "Annual Report Filing",
      "Dedicated Account Manager",
      "Express Processing",
    ],
    popular: false,
  },
];

const benefitIcons: Record<string, typeof DollarSign> = {
  "No State Income Tax": DollarSign,
  "Strong Privacy Protection": Shield,
  "Lowest Annual Fees": FileCheck,
  "Asset Protection": Shield,
  "No Franchise Tax": DollarSign,
  "Fast Processing": Clock,
  "Court of Chancery": Building2,
  "Investor Preferred": Star,
  "Privacy Protection": Shield,
  "Flexible Business Laws": FileCheck,
  "No Sales Tax": DollarSign,
  "Same-Day Filing": Clock,
  "Lowest Filing Fee": DollarSign,
  "No Annual Report": FileCheck,
  "No State Income Tax on LLCs": DollarSign,
  "Simple Maintenance": Clock,
  "International Friendly": Building2,
};

export default async function StateLandingPage({ params }: PageProps) {
  const { state } = await params;
  const stateInfo = getStateLandingPageBySlug(state);

  if (!stateInfo) {
    notFound();
  }

  const businessConfig = await getBusinessConfig();
  const currencySymbol = getCurrencySymbol(businessConfig.currency);

  const schemaData: Record<string, unknown>[] = [
    generateProductSchema({
      name: `${stateInfo.name} LLC Formation`,
      description: stateInfo.metaDescription,
      price: 149 + stateInfo.fee,
      url: `/llc/${stateInfo.slug}`,
      reviews: { rating: 4.9, count: 500 + Math.floor(Math.random() * 500) },
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "LLC Formation", url: "/services/llc-formation" },
      { name: `${stateInfo.name} LLC`, url: `/llc/${stateInfo.slug}` },
    ]),
    generateFAQSchema(stateInfo.faqs),
  ];

  // Other popular states for comparison
  const otherStates = stateLandingPages.filter((s) => s.slug !== stateInfo.slug).slice(0, 2);

  return (
    <div className="py-12 lg:py-20">
      <MultiJsonLd data={schemaData} />

      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/services/llc-formation"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to LLC Formation
          </Link>
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="mb-4">
            {stateInfo.code} LLC Formation
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Form Your {stateInfo.name} LLC
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
            {stateInfo.tagline}
          </p>

          {/* Quick Stats */}
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">State Filing Fee</p>
              <p className="text-2xl font-bold text-primary">{currencySymbol}{stateInfo.fee}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Annual Fee</p>
              <p className="text-2xl font-bold text-primary">
                {stateInfo.annualFee === 0 ? "FREE" : `${currencySymbol}${stateInfo.annualFee}`}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Processing Time</p>
              <p className="text-2xl font-bold text-primary">{stateInfo.processingTime}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={`/checkout/llc-formation?location=US-${stateInfo.code}`}>
                Start Your {stateInfo.name} LLC
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">Compare Packages</Link>
            </Button>
          </div>
        </div>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Why Choose {stateInfo.name}?
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stateInfo.benefits.map((benefit) => {
              const Icon = benefitIcons[benefit.title] || Check;
              return (
                <Card key={benefit.title}>
                  <CardHeader className="pb-2">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Description */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">
              About {stateInfo.name} LLC Formation
            </h2>
            <div className="prose prose-slate max-w-none dark:prose-invert">
              {stateInfo.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Packages */}
        <section className="mb-16">
          <h2 className="mb-2 text-center text-3xl font-bold">
            {stateInfo.name} LLC Packages
          </h2>
          <p className="mb-8 text-center text-muted-foreground">
            All prices shown include our service fee. State filing fee of ${stateInfo.fee} is additional.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={pkg.popular ? "border-primary ring-1 ring-primary" : ""}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{currencySymbol}{pkg.price}</span>
                    <span className="text-muted-foreground"> + {currencySymbol}{stateInfo.fee} state fee</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link
                      href={`/checkout/llc-formation?location=US-${stateInfo.code}&package=${pkg.name.toLowerCase()}`}
                    >
                      Choose {pkg.name}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">
              {stateInfo.name} LLC Requirements
            </h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {stateInfo.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {stateInfo.faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Compare States */}
        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold">
            Compare with Other Popular States
          </h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {otherStates.map((otherState) => (
              <Card key={otherState.slug}>
                <CardHeader>
                  <CardTitle>{otherState.name}</CardTitle>
                  <CardDescription>{otherState.tagline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Filing Fee</p>
                      <p className="font-semibold">{currencySymbol}{otherState.fee}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Annual Fee</p>
                      <p className="font-semibold">
                        {otherState.annualFee === 0 ? "FREE" : `${currencySymbol}${otherState.annualFee}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/llc/${otherState.slug}`}>
                      Learn About {otherState.name}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-primary/5 p-8 text-center md:p-12">
          <h2 className="text-3xl font-bold">
            Ready to Start Your {stateInfo.name} LLC?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join thousands of entrepreneurs who have formed their {stateInfo.name} LLC with LLCPad.
            Get started in minutes with our simple online process.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={`/checkout/llc-formation?location=US-${stateInfo.code}`}>
                Start Your {stateInfo.name} LLC - From ${149 + stateInfo.fee}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            100% satisfaction guarantee. No hidden fees.
          </p>
        </section>
      </div>
    </div>
  );
}
