import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import prisma from "@/lib/db";
import { getBusinessConfig } from "@/lib/business-settings";
import { getCurrencySymbol } from "@/lib/currencies";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our comprehensive US business formation services including LLC formation, EIN application, Amazon seller accounts, and more.",
};

interface ServiceListItem {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  icon: string | null;
  startingPrice: number;
  isPopular: boolean;
}

async function getServices(): Promise<ServiceListItem[]> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        shortDesc: true,
        icon: true,
        startingPrice: true,
        isPopular: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return services.map((s) => ({
      ...s,
      startingPrice: Number(s.startingPrice),
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();
  const businessConfig = await getBusinessConfig();
  const currencySymbol = getCurrencySymbol(businessConfig.currency);

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Our Services
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Complete US Business Services
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to start, run, and grow your US business as an
            international entrepreneur.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="group h-full transition-all hover:border-primary hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <ServiceIcon name={service.icon || "Package"} className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{service.shortDesc}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-primary">
                        From {currencySymbol}{service.startingPrice}
                      </span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              No services available at the moment. Please check back later.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Not sure which service you need?
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/contact">Contact Us for a Free Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
