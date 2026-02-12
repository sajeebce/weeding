"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationSelector, type LocationItem } from "@/components/ui/location-selector";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/components/ui/currency-selector";

const packages = [
  {
    name: "Basic",
    description: "Essential LLC formation to get started",
    price: 0,
    features: [
      { name: "New Mexico State Filing Fee", included: true },
      { name: "Registered Agent (First Year)", included: false, addonPrice: 99 },
      { name: "EIN Application", included: false, addonPrice: 70 },
      { name: "BOI Filing", included: false, addonPrice: 49 },
      { name: "US Business Address/Mail Forwarding", included: false, addonPrice: 120 },
      { name: "US Business Phone Number", included: false, addonPrice: 60 },
      { name: "US Fintech Business Bank Account Setup", included: false },
      { name: "Stripe Business Account Setup", included: false },
    ],
    processingTime: "3 weeks",
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Standard",
    description: "Recommended for international entrepreneurs",
    price: 299,
    features: [
      { name: "New Mexico State Filing Fee", included: true },
      { name: "Registered Agent (First Year)", included: true },
      { name: "EIN Application", included: true },
      { name: "BOI Filing", included: true },
      { name: "US Business Address/Mail Forwarding", included: false, addonPrice: 120 },
      { name: "US Business Phone Number", included: false, addonPrice: 60 },
      { name: "US Fintech Business Bank Account Setup", included: false, addonPrice: 99 },
      { name: "Stripe Business Account Setup", included: false, addonPrice: 79 },
    ],
    processingTime: "3 weeks",
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    description: "All-inclusive package with fastest processing",
    price: 620,
    features: [
      { name: "New Mexico State Filing Fee", included: true },
      { name: "Registered Agent (First Year)", included: true },
      { name: "EIN Application", included: true },
      { name: "BOI Filing", included: true },
      { name: "US Business Address/Mail Forwarding", included: true },
      { name: "US Business Phone Number", included: true },
      { name: "US Fintech Business Bank Account Setup", included: true },
      { name: "Stripe Business Account Setup", included: true },
    ],
    processingTime: "3 weeks",
    cta: "Get Started",
    popular: false,
  },
];

// Default location for initial render
const defaultLocation: LocationItem = { code: "US-WY", name: "Wyoming", country: "US", type: "STATE", isPopular: true, fee: 100 };

export function PricingTable() {
  const [selectedLocation, setSelectedLocation] = useState<LocationItem>(defaultLocation);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  useEffect(() => {
    fetch("/api/business-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.currency) setCurrencySymbol(getCurrencySymbol(data.currency));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Transparent Pricing, No Hidden Fees
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the package that fits your needs. Filing fees are
            separate and vary by location.
          </p>
        </div>

        {/* Location Selector */}
        <div className="mx-auto mt-8 max-w-md">
          <label className="mb-2 block text-sm font-medium text-foreground text-center">
            Select your location for accurate pricing
          </label>
          <LocationSelector
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Search for a location..."
          />
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={cn(
                "relative flex flex-col",
                pkg.popular && "border-primary shadow-lg ring-1 ring-primary"
              )}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    {currencySymbol}{pkg.price}
                  </span>
                  <span className="text-muted-foreground"> + </span>
                  <span className="text-lg font-semibold text-primary">
                    {currencySymbol}{selectedLocation.fee}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    filing fee
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    {currencySymbol}{pkg.price + selectedLocation.fee}
                  </span>
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <X className="h-5 w-5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground/70"
                        )}
                      >
                        {feature.name}
                        {!feature.included && feature.addonPrice && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            (Add-on {currencySymbol}{feature.addonPrice})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {pkg.processingTime && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Processing Time: <span className="font-medium text-foreground">{pkg.processingTime}</span>
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="group w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link
                    href={`/checkout?package=${pkg.name.toLowerCase()}&location=${selectedLocation.code}`}
                  >
                    {pkg.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All packages include free customer support. Need help choosing?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
