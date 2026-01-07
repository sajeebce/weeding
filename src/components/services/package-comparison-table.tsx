"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Check, X, Minus, Info, Clock, Zap, Plus, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StateSelector, type State } from "@/components/ui/state-selector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Types
type FeatureValueType = "BOOLEAN" | "TEXT" | "ADDON" | "DASH";

interface PackageFeatureMapping {
  id: string;
  packageId: string;
  included: boolean;
  customValue?: string | null;
  valueType: FeatureValueType;
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
  checkoutUrl?: string;
}

interface SelectedAddon {
  featureId: string;
  featureText: string;
  packageId: string;
  price: number;
}

interface PackageComparisonTableProps {
  features: ComparisonFeature[];
  packages: Package[];
  serviceSlug?: string;
}

export function PackageComparisonTable({
  features,
  packages,
  serviceSlug = "",
}: PackageComparisonTableProps) {
  // State management
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    packages.find((p) => p.isPopular)?.id || packages[0]?.id || null
  );
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  // Get selected package
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId),
    [packages, selectedPackageId]
  );

  // Get package slug from name (for checkout URL)
  const getPackageSlug = (pkg: Package | undefined) => {
    if (!pkg) return "basic";
    return pkg.name.toLowerCase().replace(/\s+/g, "-");
  };

  // Get state fee from selected state
  const stateFee = useMemo(
    () => selectedState?.fee || 0,
    [selectedState]
  );

  // Calculate totals
  const addonsTotal = useMemo(
    () => selectedAddons.reduce((sum, addon) => sum + addon.price, 0),
    [selectedAddons]
  );

  const grandTotal = useMemo(
    () => (selectedPackage?.price || 0) + stateFee + addonsTotal,
    [selectedPackage, stateFee, addonsTotal]
  );

  // Toggle addon selection
  const toggleAddon = (
    featureId: string,
    featureText: string,
    packageId: string,
    price: number
  ) => {
    setSelectedAddons((prev) => {
      const exists = prev.find(
        (a) => a.featureId === featureId && a.packageId === packageId
      );
      if (exists) {
        return prev.filter(
          (a) => !(a.featureId === featureId && a.packageId === packageId)
        );
      }
      return [...prev, { featureId, featureText, packageId, price }];
    });
  };

  // Check if addon is selected
  const isAddonSelected = (featureId: string, packageId: string) => {
    return selectedAddons.some(
      (a) => a.featureId === featureId && a.packageId === packageId
    );
  };

  // Handle package selection
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackageId(packageId);
    // Clear addons from other packages
    setSelectedAddons((prev) =>
      prev.filter((a) => a.packageId === packageId)
    );
  };

  if (packages.length === 0) {
    return null;
  }

  // Render cell content based on value type
  const renderCellContent = (
    feature: ComparisonFeature,
    pkg: Package,
    isSelectedColumn: boolean
  ) => {
    const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
    if (!mapping) {
      return (
        <Minus className={cn("h-5 w-5", isSelectedColumn ? "text-gray-400" : "text-gray-300")} />
      );
    }

    const { valueType, included, customValue, addonPriceUSD } = mapping;

    switch (valueType) {
      case "ADDON":
        if (addonPriceUSD) {
          const isSelected = isAddonSelected(feature.id, pkg.id);
          return (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-3 text-sm font-medium transition-all",
                isSelected
                  ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:border-orange-600"
                  : isSelectedColumn
                  ? "border-orange-300 hover:border-orange-500 hover:bg-orange-50"
                  : "border-gray-300 hover:border-gray-400"
              )}
              onClick={() =>
                toggleAddon(feature.id, feature.text, pkg.id, addonPriceUSD)
              }
            >
              {isSelected ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              ${addonPriceUSD}
            </Button>
          );
        }
        return <Minus className="h-5 w-5 text-gray-300" />;

      case "DASH":
        return (
          <Minus className={cn("h-5 w-5", isSelectedColumn ? "text-gray-400" : "text-gray-300")} />
        );

      case "TEXT":
        return (
          <span className={cn("text-sm font-medium", isSelectedColumn && "text-orange-700")}>
            {customValue}
          </span>
        );

      case "BOOLEAN":
      default:
        if (included) {
          return (
            <div
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full",
                isSelectedColumn
                  ? "bg-orange-500 text-white"
                  : "bg-gray-400 text-white"
              )}
            >
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
          );
        }
        return (
          <div
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full",
              isSelectedColumn
                ? "bg-gray-300 text-gray-500"
                : "bg-gray-200 text-gray-400"
            )}
          >
            <X className="h-4 w-4 stroke-[3]" />
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* State Selector */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium">Select State:</span>
        <StateSelector
          value={selectedState}
          onChange={setSelectedState}
          placeholder="Select your state..."
          className="w-64"
        />
      </div>

      <div className="flex gap-6">
        {/* Main Comparison Table */}
        <div className="flex-1 overflow-x-auto">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead>
                {/* Badge Row - separate row for badges */}
                <tr>
                  <th className="sticky left-0 z-20 bg-white h-6"></th>
                  {packages.map((pkg) => (
                    <th
                      key={`badge-${pkg.id}`}
                      className="relative h-6 bg-white cursor-pointer"
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      {pkg.badgeText && (
                        <div
                          className={cn(
                            "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-3 py-1 text-xs font-semibold text-white rounded-full whitespace-nowrap z-10 shadow-sm",
                            pkg.badgeColor === "orange"
                              ? "bg-orange-500"
                              : pkg.badgeColor === "green"
                              ? "bg-emerald-500"
                              : "bg-emerald-500"
                          )}
                        >
                          {pkg.badgeText}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="sticky left-0 z-20 min-w-64 bg-white px-6 py-4 text-left">
                    <span className="text-base font-semibold text-gray-900">
                      Business Formation
                      <br />
                      Packages
                    </span>
                  </th>
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    return (
                      <th
                        key={pkg.id}
                        className={cn(
                          "relative min-w-36 cursor-pointer px-4 pt-5 pb-4 text-center transition-all",
                          isSelected
                            ? "bg-orange-50"
                            : "bg-white hover:bg-gray-50"
                        )}
                        onClick={() => handlePackageSelect(pkg.id)}
                      >
                        {/* Package Selection Indicator */}
                        <div
                          className={cn(
                            "mb-2 rounded-lg border-2 px-4 py-1 transition-all",
                            isSelected
                              ? "border-orange-500 bg-white"
                              : "border-gray-200 bg-gray-50"
                          )}
                        >
                          <span className="text-sm font-semibold text-gray-900">
                            {pkg.name}
                          </span>
                        </div>

                        {/* Price */}
                        <div className="text-2xl font-bold text-gray-900">
                          ${pkg.price}
                        </div>

                        {/* State Fee Note */}
                        {stateFee > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            + ${stateFee} state fee
                          </div>
                        )}

                        {/* Processing Time */}
                        {pkg.processingTime && (
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                            {pkg.processingIcon === "zap" ? (
                              <Zap className="h-3 w-3 text-orange-500" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            <span
                              className={cn(
                                pkg.processingIcon === "zap" &&
                                  "text-orange-600 font-medium"
                              )}
                            >
                              {pkg.processingTime}
                            </span>
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.id}
                    className={cn(
                      "border-t border-gray-100 transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    )}
                  >
                    {/* Feature Name */}
                    <td className="sticky left-0 z-10 bg-inherit px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {feature.text}
                          </span>
                          {feature.tooltip && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-gray-400 hover:text-gray-600">
                                    <Info className="h-4 w-4" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-64"
                                >
                                  <p className="text-xs">{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* Expandable Description */}
                        {feature.description && (
                          <Collapsible
                            open={expandedFeature === feature.id}
                            onOpenChange={(open) =>
                              setExpandedFeature(open ? feature.id : null)
                            }
                          >
                            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mt-1">
                              See what&apos;s included
                              <ChevronDown
                                className={cn(
                                  "h-3 w-3 transition-transform",
                                  expandedFeature === feature.id && "rotate-180"
                                )}
                              />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 text-xs text-gray-600">
                              {feature.description}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </td>

                    {/* Package Cells */}
                    {packages.map((pkg) => {
                      const isSelected = pkg.id === selectedPackageId;
                      return (
                        <td
                          key={pkg.id}
                          className={cn(
                            "px-4 py-4 text-center transition-all cursor-pointer",
                            isSelected
                              ? "bg-orange-50/70"
                              : index % 2 === 0
                              ? "bg-white hover:bg-orange-50/30"
                              : "bg-gray-50/50 hover:bg-orange-50/30"
                          )}
                          onClick={() => handlePackageSelect(pkg.id)}
                        >
                          {renderCellContent(feature, pkg, isSelected)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <Card className="sticky top-24 shadow-lg border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Package */}
              {selectedPackage && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedPackage.name} Package:
                  </span>
                  <span className="font-medium">${selectedPackage.price}</span>
                </div>
              )}

              {/* State Fee */}
              {selectedState && stateFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedState.name} State Fee:
                  </span>
                  <span className="font-medium">${stateFee}</span>
                </div>
              )}

              {/* Selected Addons */}
              {selectedAddons.map((addon) => (
                <div
                  key={`${addon.featureId}-${addon.packageId}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600 truncate max-w-40">
                    {addon.featureText}:
                  </span>
                  <span className="font-medium">${addon.price}</span>
                </div>
              ))}

              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Total:</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${grandTotal}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-6"
                asChild
              >
                <Link
                  href={`/checkout/${serviceSlug}?package=${getPackageSlug(selectedPackage)}${selectedState?.code ? `&state=${selectedState.code}` : ""}${selectedAddons.length > 0 ? `&addons=${selectedAddons.map((a) => a.featureId).join(",")}` : ""}`}
                >
                  Get Started
                </Link>
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <RefreshCw className="h-3 w-3" />
                <span>One-time fee</span>
              </div>
              <p className="text-xs text-center text-gray-500">
                Unlike companies that charge annual fees, our formation fee is
                one-time.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden mt-8">
        {/* Mobile Order Summary */}
        <Card className="mb-6 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {selectedPackage && (
              <div className="flex justify-between">
                <span>{selectedPackage.name} Package:</span>
                <span className="font-medium">${selectedPackage.price}</span>
              </div>
            )}
            {stateFee > 0 && (
              <div className="flex justify-between">
                <span>State Fee:</span>
                <span className="font-medium">${stateFee}</span>
              </div>
            )}
            {selectedAddons.map((addon) => (
              <div
                key={`mobile-${addon.featureId}`}
                className="flex justify-between"
              >
                <span className="truncate max-w-48">{addon.featureText}:</span>
                <span className="font-medium">${addon.price}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total:</span>
              <span>${grandTotal}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
              <Link
                href={`/checkout/${serviceSlug}?package=${getPackageSlug(selectedPackage)}${selectedState?.code ? `&state=${selectedState.code}` : ""}${selectedAddons.length > 0 ? `&addons=${selectedAddons.map((a) => a.featureId).join(",")}` : ""}`}
              >
                Get Started - ${grandTotal}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Mobile Package Cards */}
        <div className="text-center text-sm text-gray-500 mb-4">
          Tap a package to select it
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {packages.map((pkg) => {
            const isSelected = pkg.id === selectedPackageId;
            return (
              <div
                key={pkg.id}
                className={cn(
                  "min-w-72 max-w-80 shrink-0 snap-center rounded-xl border-2 p-5 cursor-pointer transition-all",
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-gray-200 bg-white"
                )}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                {/* Badge */}
                {pkg.badgeText && (
                  <Badge
                    className={cn(
                      "mb-3",
                      pkg.badgeColor === "orange"
                        ? "bg-orange-500"
                        : pkg.badgeColor === "green"
                        ? "bg-emerald-500"
                        : "bg-emerald-500"
                    )}
                  >
                    {pkg.badgeText}
                  </Badge>
                )}

                {/* Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold">{pkg.name}</h3>
                  <p className="text-3xl font-bold mt-1">${pkg.price}</p>
                  {stateFee > 0 && (
                    <p className="text-xs text-gray-500">+ ${stateFee} state fee</p>
                  )}
                  {pkg.processingTime && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                      {pkg.processingIcon === "zap" ? (
                        <Zap className="h-3 w-3 text-orange-500" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>{pkg.processingTime}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {features.slice(0, 8).map((feature) => {
                    const mapping = feature.packageMappings.find(
                      (m) => m.packageId === pkg.id
                    );
                    const isIncluded =
                      mapping?.included ||
                      mapping?.valueType === "ADDON" ||
                      mapping?.valueType === "TEXT";

                    return (
                      <div
                        key={feature.id}
                        className={cn(
                          "flex items-start gap-2 text-sm",
                          !isIncluded && "text-gray-400"
                        )}
                      >
                        {isIncluded ? (
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              isSelected ? "text-orange-500" : "text-gray-500"
                            )}
                          />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                        )}
                        <span>{feature.text}</span>
                      </div>
                    );
                  })}
                  {features.length > 8 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{features.length - 8} more features
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
