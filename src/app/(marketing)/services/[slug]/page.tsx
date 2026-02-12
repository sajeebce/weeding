import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";
import { ServiceIcon } from "@/components/ui/service-icon";
import { PackageComparisonTable } from "@/components/services/package-comparison-table";
import { ServiceFaqAccordion } from "@/components/services/service-faq-accordion";
import prisma from "@/lib/db";
import type { FeatureValueType } from "@prisma/client";
import { getBusinessConfig } from "@/lib/business-settings";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  ServiceProvider,
  type ServiceData as ServiceContextData,
} from "@/lib/page-builder/contexts/service-context";
import {
  filterSectionsByDisplayOptions,
  type ServiceDisplayOptions,
} from "@/lib/page-builder/display-options";
import { getActiveTemplateForType } from "@/lib/data/templates";
import { PageBuilderRenderer } from "@/components/page-builder/renderer";

// Force dynamic rendering to avoid SSG issues with client components
export const dynamic = "force-dynamic";

interface PackageFeatureMapping {
  id: string;
  packageId: string;
  included: boolean;
  customValue: string | null;
  valueType: FeatureValueType;
  addonPriceUSD: number | null;
  addonPriceBDT: number | null;
}

interface MasterFeature {
  id: string;
  text: string;
  tooltip: string | null;
  description: string | null;
  packageMappings: PackageFeatureMapping[];
}

interface PackageData {
  id: string;
  name: string;
  description: string | null;
  priceUSD: number;
  isPopular: boolean;
  processingTime: string | null;
  processingTimeNote: string | null;
  processingIcon: string | null;
  badgeText: string | null;
  badgeColor: string | null;
}

interface ServiceData {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  icon: string | null;
  image: string | null;
  startingPrice: number;
  processingTime: string | null;
  isPopular: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  features: string[];
  masterFeatures: MasterFeature[];
  packages: PackageData[];
  faqs: {
    id: string;
    question: string;
    answer: string;
  }[];
  hasLocationBasedPricing: boolean;
  locationFeeLabel: string | null;
  displayOptions: Partial<ServiceDisplayOptions>;
}

interface RelatedService {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  icon: string | null;
  startingPrice: number;
}

async function getService(slug: string): Promise<ServiceData | null> {
  try {
    const service = await prisma.service.findUnique({
      where: { slug, isActive: true },
      include: {
        features: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            text: true,
            tooltip: true,
            description: true,
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
          select: {
            id: true,
            name: true,
            description: true,
            priceUSD: true,
            isPopular: true,
            processingTime: true,
            processingTimeNote: true,
            processingIcon: true,
            badgeText: true,
            badgeColor: true,
          },
        },
        faqs: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, question: true, answer: true },
        },
      },
    });

    if (!service) return null;

    return {
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
      features: service.features.map((f) => f.text),
      masterFeatures: service.features.map((f) => ({
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
        priceUSD: Number(p.priceUSD),
        isPopular: p.isPopular,
        processingTime: p.processingTime,
        processingTimeNote: p.processingTimeNote,
        processingIcon: p.processingIcon,
        badgeText: p.badgeText,
        badgeColor: p.badgeColor,
      })),
      faqs: service.faqs,
      hasLocationBasedPricing: service.hasLocationBasedPricing,
      locationFeeLabel: service.locationFeeLabel,
      displayOptions: (service.displayOptions as Partial<ServiceDisplayOptions>) || {},
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return null;
  }
}

async function getRelatedServices(
  currentSlug: string,
  limit: number = 4
): Promise<RelatedService[]> {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        slug: { not: currentSlug },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDesc: true,
        icon: true,
        startingPrice: true,
      },
      orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }],
      take: limit,
    });

    return services.map((s) => ({
      ...s,
      startingPrice: Number(s.startingPrice),
    }));
  } catch (error) {
    console.error("Error fetching related services:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    return { title: "Service Not Found" };
  }

  return {
    title: service.metaTitle || service.name,
    description: service.metaDescription || service.shortDesc,
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  const relatedServices = await getRelatedServices(slug);

  // Get currency from business settings
  const businessConfig = await getBusinessConfig();
  const currencySymbol = getCurrencySymbol(businessConfig.currency);

  // Check for SERVICE_DETAILS template
  const template = await getActiveTemplateForType("SERVICE_DETAILS");

  // Debug: Log template info
  console.log("[Service Page] Template found:", template ? {
    id: template.id,
    name: template.name,
    sectionsCount: template.sections.length,
  } : null);

  // Prepare service data for context
  const serviceContextData: ServiceContextData = {
    id: service.id,
    name: service.name,
    slug: service.slug,
    shortDesc: service.shortDesc,
    description: service.description,
    icon: service.icon,
    image: service.image,
    startingPrice: service.startingPrice,
    processingTime: service.processingTime,
    isPopular: service.isPopular,
    isActive: true,
    sortOrder: 0,
    category: null,
    packages: service.packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      shortDesc: pkg.description,
      price: pkg.priceUSD,
      originalPrice: null,
      isRecommended: pkg.isPopular,
      isActive: true,
      sortOrder: 0,
      featureMappings: [],
    })),
    features: service.masterFeatures.map((f) => ({
      id: f.id,
      text: f.text,
      description: f.description,
      tooltip: f.tooltip,
      sortOrder: 0,
    })),
    faqs: service.faqs.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
      sortOrder: 0,
    })),
    metaTitle: service.metaTitle,
    metaDescription: service.metaDescription,
    keywords: [],
    displayOptions: service.displayOptions,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Always use dynamic checkout route
  const checkoutBaseUrl = `/checkout/${service.slug}`;

  const getPackageCheckoutUrl = (packageName: string) => {
    const pkgSlug = packageName.toLowerCase().replace(/\s+/g, "-");
    return `/checkout/${service.slug}?package=${pkgSlug}`;
  };

  const schemaData: Record<string, unknown>[] = [
    generateServiceSchema({
      name: service.name,
      description: service.shortDesc,
      price: service.startingPrice,
      url: `/services/${service.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: service.name, url: `/services/${service.slug}` },
    ]),
  ];

  if (service.faqs.length > 0) {
    schemaData.push(
      generateFAQSchema(
        service.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      )
    );
  }

  // Check if we have master features for comparison table
  // Show comparison table if there are features defined for this service
  const hasComparisonData =
    service.masterFeatures.length > 0 && service.packages.length > 0;

  // If there's an active template, use PageBuilderRenderer
  if (template && template.sections.length > 0) {
    // Filter sections based on service's displayOptions
    const visibleSections = filterSectionsByDisplayOptions(
      template.sections,
      service.displayOptions
    );

    return (
      <ServiceProvider service={serviceContextData}>
        <MultiJsonLd data={schemaData} />
        <PageBuilderRenderer sections={visibleSections} />
      </ServiceProvider>
    );
  }

  // Default layout (no template or template has no sections)
  return (
    <ServiceProvider service={serviceContextData}>
    <div className="py-12 lg:py-20">
      <MultiJsonLd data={schemaData} />
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </div>

        {/* SECTION 1: Hero */}
        <section className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ServiceIcon name={service.icon || "Package"} className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {service.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
            {service.shortDesc}
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href={checkoutBaseUrl}>
                Get Started - From ${service.startingPrice}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Ask a Question</Link>
            </Button>
          </div>
        </section>

        {/* SECTION 2: What's Included */}
        {service.features.length > 0 && (
          <section className="mx-auto mt-16 max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-semibold">
              What&apos;s Included
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-muted/30 p-4"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: Package Comparison Table */}
        {service.packages.length > 0 && (
          <section className="mt-16">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-2 text-center text-2xl font-semibold">
                Choose Your Package
              </h2>
              <p className="mb-8 text-center text-muted-foreground">
                Compare features and select the best plan for your business
              </p>

              {hasComparisonData ? (
                <PackageComparisonTable
                  features={service.masterFeatures}
                  packages={service.packages.map((pkg) => ({
                    id: pkg.id,
                    name: pkg.name,
                    description: pkg.description,
                    price: pkg.priceUSD,
                    isPopular: pkg.isPopular,
                    processingTime: pkg.processingTime,
                    processingTimeNote: pkg.processingTimeNote,
                    processingIcon: pkg.processingIcon,
                    badgeText: pkg.badgeText,
                    badgeColor: pkg.badgeColor,
                    checkoutUrl: getPackageCheckoutUrl(pkg.name),
                  }))}
                  serviceSlug={service.slug}
                  serviceId={service.id}
                  hasLocationBasedPricing={service.hasLocationBasedPricing}
                  locationFeeLabel={service.locationFeeLabel}
                  currencySymbol={currencySymbol}
                  checkoutBadgeText={service.displayOptions.checkoutBadgeText as string}
                  checkoutBadgeDescription={service.displayOptions.checkoutBadgeDescription as string}
                />
              ) : (
                // Fallback: Simple package cards if no comparison data
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {service.packages.map((pkg) => (
                    <Card
                      key={pkg.id}
                      className={
                        pkg.isPopular
                          ? "relative border-primary ring-1 ring-primary"
                          : ""
                      }
                    >
                      {pkg.isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <CardHeader className="text-center">
                        <CardTitle>{pkg.name}</CardTitle>
                        <p className="text-3xl font-bold">{currencySymbol}{pkg.priceUSD}</p>
                        {pkg.description && (
                          <p className="text-sm text-muted-foreground">
                            {pkg.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full"
                          variant={pkg.isPopular ? "default" : "outline"}
                          asChild
                        >
                          <Link href={getPackageCheckoutUrl(pkg.name)}>
                            Select {pkg.name}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 4: Long Description */}
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-2xl font-bold">About {service.name}</h2>
          <div
            className="prose prose-slate mt-6 max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-muted-foreground prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: service.description }}
          />
        </section>

        {/* SECTION 5: FAQs */}
        {service.faqs.length > 0 && (
          <section className="mx-auto mt-16 max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Common questions about {service.name}
              </p>
            </div>
            <ServiceFaqAccordion faqs={service.faqs} />
          </section>
        )}

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold">Related Services</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedServices.map((relatedService) => (
                <Link
                  key={relatedService.slug}
                  href={`/services/${relatedService.slug}`}
                >
                  <Card className="group h-full transition-all hover:border-primary">
                    <CardHeader className="pb-2">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ServiceIcon
                          name={relatedService.icon || "Package"}
                          className="h-5 w-5"
                        />
                      </div>
                      <CardTitle className="text-base">
                        {relatedService.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedService.shortDesc}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-primary">
                        From ${relatedService.startingPrice}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </ServiceProvider>
  );
}
