"use client";

import { useState } from "react";
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
import { StateSelector, type State } from "@/components/ui/state-selector";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "Basic",
    description: "Essential LLC formation for budget-conscious entrepreneurs",
    price: 199,
    features: [
      { name: "Employer Identification Number (EIN)", included: true },
      { name: "US Registered Agent for One Year", included: true },
      { name: "US Mail Forwarding for One Year", included: true },
      { name: "Basic Tax Consultation on US Earnings", included: true },
      { name: "US Business Address for One Year", included: true },
      { name: "Incorporation of Your US Company", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Annual Compliance With the State", included: true },
      { name: "Premium Consultation for US Business", included: false },
      { name: "US BOI Filing", included: false },
      { name: "Unique US Business Address (10 Mail Forwarding)", included: false },
      { name: "US Fintech Bank Account", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Standard",
    description: "Most popular - Everything you need to start your US business",
    price: 449,
    features: [
      { name: "US Fintech Bank Account", included: true },
      { name: "US Business Stripe Account with Expert Hand", included: true },
      { name: "Employer Identification Number (EIN)", included: true },
      { name: "US Registered Agent for One Year", included: true },
      { name: "US Mail Forwarding for One Year", included: true },
      { name: "US Business Debit Card", included: true },
      { name: "Expert Guidance on Managing your Financial Accounts", included: true },
      { name: "Basic Tax Consultation on US Earnings", included: true },
      { name: "US Business Address for One Year", included: true },
      { name: "Incorporation of Your US Company", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Annual Compliance With the State", included: true },
      { name: "US Business PayPal Account with Expert Hand", included: false },
      { name: "Premium Consultation for US Business", included: false },
      { name: "US BOI Filing", included: false },
      { name: "Unique US Business Address (10 Mail Forwarding)", included: false },
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Premium",
    description: "All-inclusive package for serious entrepreneurs",
    price: 672,
    features: [
      { name: "US Fintech Bank Account", included: true },
      { name: "US Business PayPal Account with Expert Hand", included: true },
      { name: "US Business Stripe Account with Expert Hand", included: true },
      { name: "Employer Identification Number (EIN)", included: true },
      { name: "US Registered Agent for One Year", included: true },
      { name: "US Mail Forwarding for One Year", included: true },
      { name: "US Business Debit Card", included: true },
      { name: "Expert Guidance on Managing your Financial Accounts", included: true },
      { name: "Basic Tax Consultation on US Earnings", included: true },
      { name: "US Business Address for One Year", included: true },
      { name: "Incorporation of Your US Company", included: true },
      { name: "Operating Agreement", included: true },
      { name: "Annual Compliance With the State", included: true },
      { name: "Free High Value Business Guide", included: true },
      { name: "Premium Consultation for US Business", included: false },
      { name: "US BOI Filing", included: false },
      { name: "Unique US Business Address (10 Mail Forwarding)", included: false },
      { name: "US Worldfirst Business Bank Account", included: false },
      { name: "US Grey Business Bank Account", included: false },
      { name: "USA Wise Business Account", included: false },
      { name: "US Airwallex Business Bank Account", included: false },
      { name: "US Business Square Account with Expert Hand", included: false },
      { name: "US SumUp Business Bank Account", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
];

// Default state for initial render
const defaultState: State = { code: "WY", name: "Wyoming", fee: 100 };

export function PricingTable() {
  const [selectedState, setSelectedState] = useState<State>(defaultState);

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
            Choose the package that fits your needs. State filing fees are
            separate and vary by state.
          </p>
        </div>

        {/* State Selector */}
        <div className="mx-auto mt-8 max-w-md">
          <label className="mb-2 block text-sm font-medium text-foreground text-center">
            Select your state for accurate pricing
          </label>
          <StateSelector
            value={selectedState}
            onChange={setSelectedState}
            placeholder="Search for a state..."
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
                    ${pkg.price}
                  </span>
                  <span className="text-muted-foreground"> + </span>
                  <span className="text-lg font-semibold text-primary">
                    ${selectedState.fee}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    state fee
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    ${pkg.price + selectedState.fee}
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
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="group w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link
                    href={`/checkout?package=${pkg.name.toLowerCase()}&state=${selectedState.code}`}
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
