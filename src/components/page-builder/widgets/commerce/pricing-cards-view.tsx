"use client";

import Link from "next/link";
import { Check, X, ArrowRight, Clock, Sparkles } from "lucide-react";
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
import type { State } from "@/components/ui/state-selector";
import { cn } from "@/lib/utils";
import type {
  PricingTableWidgetSettings,
  PricingFeatureValueType,
} from "@/lib/page-builder/types";

// =============================================================================
// TYPES
// =============================================================================

interface PackageFeatureMapping {
  id: string;
  packageId: string;
  included: boolean;
  customValue?: string | null;
  valueType: PricingFeatureValueType;
  addonPriceUSD?: number | null;
  addonPriceBDT?: number | null;
}

interface ComparisonFeature {
  id: string;
  text: string;
  tooltip?: string | null;
  description?: string | null;
  packageMappings: PackageFeatureMapping[];
}

interface Package {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  priceBDT?: number | null;
  isPopular: boolean;
  processingTime?: string | null;
  processingTimeNote?: string | null;
  processingIcon?: string | null;
  badgeText?: string | null;
  badgeColor?: string | null;
}

interface PricingCardsViewProps {
  settings: PricingTableWidgetSettings;
  features: ComparisonFeature[];
  packages: Package[];
  selectedPackageId: string | null;
  onPackageSelect: (packageId: string) => void;
  selectedState: State | null;
  stateFee: number;
  serviceSlug: string;
}

// =============================================================================
// PRICING CARDS VIEW COMPONENT
// =============================================================================

export function PricingCardsView({
  settings,
  features,
  packages,
  selectedPackageId,
  onPackageSelect,
  selectedState,
  stateFee,
  serviceSlug,
}: PricingCardsViewProps) {
  const { cardStyle, ctaButtons, colors } = settings;

  const getPackageSlug = (pkg: Package) => {
    return pkg.name.toLowerCase().replace(/\s+/g, "-");
  };

  const getCheckoutUrl = (pkg: Package) => {
    return `/checkout/${serviceSlug}?package=${getPackageSlug(pkg)}${
      selectedState?.code ? `&state=${selectedState.code}` : ""
    }`;
  };

  // Get features for a specific package
  const getPackageFeatures = (pkg: Package) => {
    return features.map((feature) => {
      const mapping = feature.packageMappings.find(
        (m) => m.packageId === pkg.id
      );
      return {
        ...feature,
        mapping,
        included: mapping?.included ?? false,
        isAddon: mapping?.valueType === "ADDON",
        addonPrice: mapping?.addonPriceUSD,
        customValue: mapping?.customValue,
      };
    });
  };

  // Card style helpers
  const getPopularCardClasses = (isPopular: boolean) => {
    if (!isPopular) return "";

    switch (cardStyle.popularCardStyle) {
      case "ring":
        return "ring-2 ring-primary border-primary";
      case "elevated":
        return "shadow-2xl scale-[1.02] z-10";
      case "gradient-border":
        return "border-2 border-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-origin-border";
      case "glow":
        return "shadow-[0_0_30px_rgba(249,115,22,0.3)] border-primary";
      default:
        return "ring-2 ring-primary border-primary";
    }
  };

  const getPriceSizeClasses = () => {
    switch (cardStyle.priceSize) {
      case "sm":
        return "text-2xl";
      case "md":
        return "text-3xl";
      case "lg":
        return "text-4xl";
      case "xl":
        return "text-5xl";
      default:
        return "text-4xl";
    }
  };

  const getFeatureListClasses = () => {
    return cardStyle.featureListStyle === "spacious" ? "space-y-4" : "space-y-2.5";
  };

  const gridColsClass = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const shadowClass = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-2 pt-4 overflow-visible",
        gridColsClass[cardStyle.columns],
        cardStyle.layout === "horizontal-scroll" &&
          "md:flex md:overflow-x-auto md:gap-6 md:pb-4 md:snap-x md:snap-mandatory"
      )}
      style={{ gap: `${cardStyle.gap}px` }}
    >
      {packages.map((pkg) => {
        const isSelected = pkg.id === selectedPackageId;
        const packageFeatures = getPackageFeatures(pkg);
        const total = pkg.price + stateFee;

        return (
          <Card
            key={pkg.id}
            onClick={() => onPackageSelect(pkg.id)}
            className={cn(
              "relative flex flex-col cursor-pointer transition-all duration-300 overflow-visible",
              shadowClass[cardStyle.cardShadow],
              isSelected && "ring-2 ring-primary",
              pkg.isPopular && getPopularCardClasses(true),
              cardStyle.layout === "horizontal-scroll" &&
                "min-w-[320px] snap-center",
              !isSelected && !pkg.isPopular && "hover:shadow-lg hover:-translate-y-1"
            )}
            style={{
              borderRadius: `${cardStyle.cardBorderRadius}px`,
              borderWidth: `${cardStyle.cardBorderWidth}px`,
              borderColor: pkg.isPopular
                ? undefined
                : cardStyle.cardBorderColor || "#e2e8f0",
              backgroundColor: cardStyle.cardBackgroundColor || "#ffffff",
            }}
          >
            {/* Popular Badge */}
            {pkg.isPopular && pkg.badgeText && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge
                  className="px-4 py-1 text-xs font-semibold shadow-md"
                  style={{
                    backgroundColor: pkg.badgeColor || colors.addonToggleActive || "#f97316",
                    color: "#ffffff",
                  }}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {pkg.badgeText}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2 pt-6">
              <CardTitle className="text-xl md:text-2xl font-bold">
                {pkg.name}
              </CardTitle>
              {pkg.description && (
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {pkg.description}
                </CardDescription>
              )}

              {/* Price Section */}
              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={cn(
                      "font-bold text-foreground",
                      getPriceSizeClasses()
                    )}
                  >
                    ${pkg.price}
                  </span>
                  {stateFee > 0 && (
                    <>
                      <span className="text-muted-foreground text-lg">+</span>
                      <span className="text-lg font-semibold text-primary">
                        ${stateFee}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        state fee
                      </span>
                    </>
                  )}
                </div>

                {cardStyle.showTotalPrice && stateFee > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Total:{" "}
                    <span className="font-semibold text-foreground">
                      ${total}
                    </span>
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 pt-4">
              {/* Feature List */}
              <ul className={getFeatureListClasses()}>
                {packageFeatures.map((feature) => (
                  <li
                    key={feature.id}
                    className="flex items-start gap-3"
                  >
                    {feature.included ? (
                      <Check className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 shrink-0 text-muted-foreground/40 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        "text-sm leading-relaxed",
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground/60"
                      )}
                    >
                      {feature.text}
                      {!feature.included && feature.isAddon && feature.addonPrice && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          (Add-on ${feature.addonPrice})
                        </span>
                      )}
                      {feature.included && feature.customValue && (
                        <span className="ml-1.5 text-xs font-medium text-primary">
                          {feature.customValue}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Processing Time */}
              {cardStyle.showProcessingTime && pkg.processingTime && (
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Processing Time:{" "}
                      <span className="font-medium text-foreground">
                        {pkg.processingTime}
                      </span>
                    </span>
                  </div>
                  {pkg.processingTimeNote && (
                    <p className="mt-1 text-xs text-muted-foreground pl-6">
                      {pkg.processingTimeNote}
                    </p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 pb-6">
              <Button
                className={cn(
                  "group transition-all duration-200",
                  cardStyle.ctaStyle === "full-width" && "w-full"
                )}
                variant={pkg.isPopular ? "default" : "outline"}
                size="lg"
                style={
                  pkg.isPopular
                    ? {
                        backgroundColor:
                          ctaButtons.defaultBgColor || "#f97316",
                        color: ctaButtons.defaultTextColor || "#ffffff",
                      }
                    : undefined
                }
                asChild
              >
                <Link href={getCheckoutUrl(pkg)}>
                  {ctaButtons.buttonText || "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
