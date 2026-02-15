"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Check,
  X,
  Minus,
  Info,
  Clock,
  Zap,
  Plus,
  RefreshCw,
  ChevronDown,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LocationSelector, type LocationItem } from "@/components/ui/location-selector";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currencies";
import type {
  PricingTableWidgetSettings,
  PricingFeatureValueType,
  BadgeStyle,
} from "@/lib/page-builder/types";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { DEFAULT_PRICING_TABLE_SETTINGS } from "@/lib/page-builder/defaults";
import { useOptionalServiceContext } from "@/lib/page-builder/contexts/service-context";
import { PricingCardsView } from "./pricing-cards-view";

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

interface ServiceData {
  id: string;
  slug: string;
  name: string;
  comparisonFeatures: ComparisonFeature[];
  packages: Package[];
  hasLocationBasedPricing: boolean;
  displayOptions?: {
    checkoutBadgeText?: string;
    checkoutBadgeDescription?: string;
  };
}

interface SelectedAddon {
  featureId: string;
  featureText: string;
  packageId: string;
  price: number;
}

interface PricingTableWidgetProps {
  settings: PricingTableWidgetSettings;
  isPreview?: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getBadgeStyles(
  style: BadgeStyle,
  colors: { bgColor?: string; textColor?: string; borderColor?: string }
) {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium";

  switch (style) {
    case "outline":
      return {
        className: cn(baseClasses, "rounded-full border bg-transparent"),
        style: {
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
    case "solid":
      return {
        className: cn(baseClasses, "rounded-md border-0"),
        style: {
          backgroundColor: colors.bgColor || "#f97316",
          color: colors.textColor || "#ffffff",
        },
      };
    case "pill":
    default:
      return {
        className: cn(baseClasses, "rounded-full border"),
        style: {
          backgroundColor: colors.bgColor || "#f9731933",
          borderColor: colors.borderColor || "#f9731980",
          color: colors.textColor || "#fb923c",
        },
      };
  }
}

function renderHighlightedText(
  text: string,
  highlightWords?: string,
  highlightColor?: string
) {
  if (!highlightWords) {
    return text;
  }

  const regex = new RegExp(`(${highlightWords})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === highlightWords.toLowerCase()) {
      return (
        <span key={index} style={{ color: highlightColor || "#f97316" }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

function SectionHeader({ settings }: { settings: PricingTableWidgetSettings }) {
  const { header } = settings;

  if (!header?.show) return null;

  const badgeStyles = getBadgeStyles(header.badge.style, {
    bgColor: header.badge.bgColor,
    textColor: header.badge.textColor,
    borderColor: header.badge.borderColor,
  });

  const headingSizeClasses = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
    "2xl": "text-5xl md:text-6xl",
  };

  const descriptionSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn("flex flex-col gap-4", alignmentClasses[header.alignment])}
      style={{ marginBottom: `${header.marginBottom}px` }}
    >
      {header.badge.show && (
        <span className={badgeStyles.className} style={badgeStyles.style}>
          {header.badge.text}
        </span>
      )}

      <h2
        className={cn(
          "font-bold tracking-tight",
          headingSizeClasses[header.heading.size]
        )}
        style={{ color: header.heading.color || "#0f172a" }}
      >
        {renderHighlightedText(
          header.heading.text,
          header.heading.highlightWords,
          header.heading.highlightColor
        )}
      </h2>

      {header.description.show && (
        <p
          className={cn(
            "max-w-3xl",
            descriptionSizeClasses[header.description.size]
          )}
          style={{ color: header.description.color || "#64748b" }}
        >
          {header.description.text}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// ORDER SUMMARY COMPONENT
// =============================================================================

interface OrderSummaryProps {
  settings: PricingTableWidgetSettings;
  selectedPackage: Package | undefined;
  selectedLocation: LocationItem | null;
  locationFee: number;
  selectedAddons: SelectedAddon[];
  grandTotal: number;
  serviceSlug: string;
  checkoutBadgeText?: string;
  checkoutBadgeDescription?: string;
  currencySymbol?: string;
}

function OrderSummary({
  settings,
  selectedPackage,
  selectedLocation,
  locationFee,
  selectedAddons,
  grandTotal,
  serviceSlug,
  checkoutBadgeText,
  checkoutBadgeDescription,
  currencySymbol = "$",
}: OrderSummaryProps) {
  const { orderSummary, ctaButtons } = settings;

  if (!orderSummary.enabled) return null;

  const getPackageSlug = (pkg: Package | undefined) => {
    if (!pkg) return "basic";
    return pkg.name.toLowerCase().replace(/\s+/g, "-");
  };

  const checkoutUrl = `/checkout/${serviceSlug}?package=${getPackageSlug(selectedPackage)}${
    selectedLocation?.code ? `&location=${selectedLocation.code}` : ""
  }${
    selectedAddons.length > 0
      ? `&addons=${selectedAddons.map((a) => a.featureId).join(",")}`
      : ""
  }`;

  return (
    <div className="hidden lg:block w-80 shrink-0">
      <Card
        className={cn(
          "shadow-lg border-gray-200",
          orderSummary.stickyOnScroll && "sticky top-24"
        )}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{orderSummary.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {orderSummary.showPackageDetails && selectedPackage && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {selectedPackage.name} Package:
              </span>
              <span className="font-medium">{currencySymbol}{selectedPackage.price}</span>
            </div>
          )}

          {orderSummary.showStateFee && selectedLocation && locationFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {selectedLocation.name} {settings.stateFee.label || "Fee"}:
              </span>
              <span className="font-medium">{currencySymbol}{locationFee}</span>
            </div>
          )}

          {orderSummary.showAddons &&
            selectedAddons.map((addon) => (
              <div
                key={`${addon.featureId}-${addon.packageId}`}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600 truncate max-w-40">
                  {addon.featureText}:
                </span>
                <span className="font-medium">{currencySymbol}{addon.price}</span>
              </div>
            ))}

          <Separator className="my-4" />

          {orderSummary.showTotal && (
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                {currencySymbol}{grandTotal}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            className="w-full font-semibold py-6"
            style={{
              backgroundColor:
                orderSummary.ctaButton.bgColor || ctaButtons.defaultBgColor,
              color:
                orderSummary.ctaButton.textColor || ctaButtons.defaultTextColor,
            }}
            asChild
          >
            <Link href={checkoutUrl}>{orderSummary.ctaButton.text}</Link>
          </Button>
          {checkoutBadgeText && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <RefreshCw className="h-3 w-3" />
              <span>{checkoutBadgeText}</span>
            </div>
          )}
          {checkoutBadgeDescription && (
            <p className="text-xs text-center text-gray-500">
              {checkoutBadgeDescription}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// =============================================================================
// MOBILE ORDER SUMMARY COMPONENT
// =============================================================================

interface MobileOrderSummaryProps {
  settings: PricingTableWidgetSettings;
  selectedPackage: Package | undefined;
  locationFee: number;
  selectedAddons: SelectedAddon[];
  grandTotal: number;
  serviceSlug: string;
  selectedLocation: LocationItem | null;
  currencySymbol?: string;
}

function MobileOrderSummary({
  settings,
  selectedPackage,
  locationFee,
  selectedAddons,
  grandTotal,
  serviceSlug,
  selectedLocation,
  currencySymbol = "$",
}: MobileOrderSummaryProps) {
  const { orderSummary, ctaButtons } = settings;

  if (!orderSummary.enabled) return null;

  const getPackageSlug = (pkg: Package | undefined) => {
    if (!pkg) return "basic";
    return pkg.name.toLowerCase().replace(/\s+/g, "-");
  };

  const checkoutUrl = `/checkout/${serviceSlug}?package=${getPackageSlug(selectedPackage)}${
    selectedLocation?.code ? `&location=${selectedLocation.code}` : ""
  }${
    selectedAddons.length > 0
      ? `&addons=${selectedAddons.map((a) => a.featureId).join(",")}`
      : ""
  }`;

  return (
    <Card className="mb-6 shadow-md lg:hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{orderSummary.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {orderSummary.showPackageDetails && selectedPackage && (
          <div className="flex justify-between">
            <span>{selectedPackage.name} Package:</span>
            <span className="font-medium">{currencySymbol}{selectedPackage.price}</span>
          </div>
        )}
        {orderSummary.showStateFee && locationFee > 0 && (
          <div className="flex justify-between">
            <span>{settings.stateFee.label || "Location Fee"}:</span>
            <span className="font-medium">{currencySymbol}{locationFee}</span>
          </div>
        )}
        {orderSummary.showAddons &&
          selectedAddons.map((addon) => (
            <div
              key={`mobile-${addon.featureId}`}
              className="flex justify-between"
            >
              <span className="truncate max-w-48">{addon.featureText}:</span>
              <span className="font-medium">{currencySymbol}{addon.price}</span>
            </div>
          ))}
        <Separator />
        {orderSummary.showTotal && (
          <div className="flex justify-between font-semibold text-base">
            <span>Total:</span>
            <span>{currencySymbol}{grandTotal}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          style={{
            backgroundColor:
              orderSummary.ctaButton.bgColor || ctaButtons.defaultBgColor,
            color:
              orderSummary.ctaButton.textColor || ctaButtons.defaultTextColor,
          }}
          asChild
        >
          <Link href={checkoutUrl}>
            {ctaButtons.buttonText} - {currencySymbol}{grandTotal}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// =============================================================================
// COMPARISON TABLE COMPONENT
// =============================================================================

interface ComparisonTableProps {
  settings: PricingTableWidgetSettings;
  features: ComparisonFeature[];
  packages: Package[];
  selectedPackageId: string | null;
  onPackageSelect: (packageId: string) => void;
  locationFee: number;
  selectedAddons: SelectedAddon[];
  onToggleAddon: (
    featureId: string,
    featureText: string,
    packageId: string,
    price: number
  ) => void;
  isAddonSelected: (featureId: string, packageId: string) => boolean;
  expandedFeature: string | null;
  onExpandFeature: (featureId: string | null) => void;
  currencySymbol?: string;
}

function ComparisonTable({
  settings,
  features,
  packages,
  selectedPackageId,
  onPackageSelect,
  locationFee,
  selectedAddons,
  onToggleAddon,
  isAddonSelected,
  expandedFeature,
  onExpandFeature,
  currencySymbol = "$",
}: ComparisonTableProps) {
  const { tableStyle, tableHeader, featureRows, colors } = settings;

  const renderCellContent = (
    feature: ComparisonFeature,
    pkg: Package,
    isSelectedColumn: boolean
  ) => {
    const mapping = feature.packageMappings.find((m) => m.packageId === pkg.id);
    if (!mapping) {
      return (
        <Minus
          className={cn(
            "h-5 w-5",
            isSelectedColumn ? "text-gray-400" : "text-gray-300"
          )}
        />
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
              style={
                isSelected
                  ? {
                      backgroundColor:
                        featureRows.addonStyle.selectedColor || "#f97316",
                      borderColor:
                        featureRows.addonStyle.selectedColor || "#f97316",
                    }
                  : undefined
              }
              onClick={(e) => {
                e.stopPropagation();
                onToggleAddon(feature.id, feature.text, pkg.id, addonPriceUSD);
              }}
            >
              {isSelected ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              {currencySymbol}{addonPriceUSD}
            </Button>
          );
        }
        return <Minus className="h-5 w-5 text-gray-300" />;

      case "DASH":
        return (
          <Minus
            className={cn(
              "h-5 w-5",
              isSelectedColumn ? "text-gray-400" : "text-gray-300"
            )}
          />
        );

      case "TEXT":
        return (
          <span
            className={cn(
              "text-sm font-medium",
              isSelectedColumn && "text-orange-700"
            )}
          >
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
                isSelectedColumn ? "bg-orange-500 text-white" : "bg-gray-400 text-white"
              )}
              style={
                isSelectedColumn && featureRows.booleanStyle.trueColor
                  ? { backgroundColor: featureRows.booleanStyle.trueColor }
                  : undefined
              }
            >
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
          );
        }
        return (
          <div
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-full",
              isSelectedColumn ? "bg-gray-300 text-gray-500" : "bg-gray-200 text-gray-400"
            )}
            style={
              featureRows.booleanStyle.falseColor
                ? { backgroundColor: featureRows.booleanStyle.falseColor }
                : undefined
            }
          >
            <X className="h-4 w-4 stroke-[3]" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div
        className="rounded-xl border bg-white shadow-sm"
        style={{
          borderRadius: `${tableStyle.borderRadius}px`,
          borderWidth: `${tableStyle.borderWidth}px`,
          borderColor: tableStyle.borderColor || "#e2e8f0",
          backgroundColor: tableStyle.backgroundColor || "#ffffff",
        }}
      >
        <table className="w-full border-collapse">
          <thead>
            {/* Badge Row */}
            <tr>
              <th
                className="sticky left-0 z-20 h-6"
                style={{ backgroundColor: tableStyle.backgroundColor || "#ffffff" }}
              />
              {packages.map((pkg, index) => {
                const isSelected = pkg.id === selectedPackageId;
                // Disable default highlightColumn when any package is selected - only selected column gets highlight
                const isHighlighted = !selectedPackageId && tableHeader.highlightColumn === index;
                return (
                <th
                  key={`badge-${pkg.id}`}
                  className="relative h-6 cursor-pointer"
                  style={{
                    backgroundColor: isSelected
                      ? colors.highlightedColumnBg || "#fff7ed"
                      : isHighlighted
                        ? tableHeader.highlightColor || "#fff7ed"
                        : tableStyle.backgroundColor || "#ffffff",
                  }}
                  onClick={() => onPackageSelect(pkg.id)}
                >
                  {tableHeader.showPopularBadge && pkg.badgeText && (
                    <div
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-3 py-1 text-xs font-semibold text-white rounded-full whitespace-nowrap z-10 shadow-sm",
                        pkg.badgeColor === "orange"
                          ? "bg-orange-500"
                          : pkg.badgeColor === "green"
                            ? "bg-emerald-500"
                            : "bg-emerald-500"
                      )}
                      style={
                        tableHeader.popularBadgeColor
                          ? { backgroundColor: tableHeader.popularBadgeColor }
                          : undefined
                      }
                    >
                      {pkg.badgeText}
                    </div>
                  )}
                </th>
              );
              })}
            </tr>

            {/* Header Row */}
            <tr>
              <th
                className="sticky left-0 z-20 min-w-64 px-6 py-4 text-left"
                style={{ backgroundColor: tableStyle.backgroundColor || "#ffffff" }}
              >
                <span className="text-base font-semibold text-gray-900">
                  Business Formation
                  <br />
                  Packages
                </span>
              </th>
              {packages.map((pkg, index) => {
                const isSelected = pkg.id === selectedPackageId;
                // Disable default highlightColumn when any package is selected - only selected column gets highlight
                const isHighlighted = !selectedPackageId && tableHeader.highlightColumn === index;
                return (
                  <th
                    key={pkg.id}
                    className={cn(
                      "relative min-w-36 cursor-pointer px-4 pt-5 pb-4 text-center transition-all",
                      isSelected ? "bg-orange-50" : "hover:bg-gray-50"
                    )}
                    style={{
                      backgroundColor: isSelected
                        ? colors.highlightedColumnBg || "#fff7ed"
                        : isHighlighted
                          ? tableHeader.highlightColor || "#fff7ed"
                          : tableStyle.backgroundColor || "#ffffff",
                    }}
                    onClick={() => onPackageSelect(pkg.id)}
                  >
                    {tableHeader.showPackageNames && (
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
                    )}

                    {tableHeader.showPackagePrices && (
                      <div className="text-2xl font-bold text-gray-900">
                        {currencySymbol}{pkg.price}
                      </div>
                    )}

                    {locationFee > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        + {currencySymbol}{locationFee} {settings.stateFee.label?.toLowerCase() || "location fee"}
                      </div>
                    )}

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

          <tbody>
            {features.map((feature, index) => (
              <tr
                key={feature.id}
                className={cn(
                  "border-t border-gray-100 transition-colors",
                  featureRows.alternateRowColors &&
                    (index % 2 === 0 ? "bg-white" : "bg-gray-50/50")
                )}
              >
                <td
                  className="sticky left-0 z-10 bg-inherit px-6 py-4"
                  style={{
                    backgroundColor:
                      featureRows.alternateRowColors && index % 2 !== 0
                        ? "#f9fafb80"
                        : tableStyle.backgroundColor || "#ffffff",
                  }}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.featureLabelText || "#0f172a" }}
                      >
                        {feature.text}
                      </span>
                      {featureRows.showTooltips && feature.tooltip && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side={featureRows.tooltipPosition}
                              className="max-w-64"
                            >
                              <p className="text-xs">{feature.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>

                    {featureRows.showFeatureDescriptions && feature.description && (
                      <Collapsible
                        open={expandedFeature === feature.id}
                        onOpenChange={(open) =>
                          onExpandFeature(open ? feature.id : null)
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

                {packages.map((pkg, pkgIndex) => {
                  const isSelected = pkg.id === selectedPackageId;
                  // Disable default highlightColumn when any package is selected - only selected column gets highlight
                  const isHighlighted = !selectedPackageId && tableHeader.highlightColumn === pkgIndex;
                  return (
                    <td
                      key={pkg.id}
                      className={cn(
                        "px-4 py-4 text-center transition-all cursor-pointer",
                        featureRows.rowHoverEffect && "hover:bg-orange-50/30"
                      )}
                      style={{
                        backgroundColor: isSelected
                          ? colors.highlightedColumnBg || "#fff7ed70"
                          : isHighlighted
                            ? `${tableHeader.highlightColor || "#fff7ed"}80`
                            : featureRows.alternateRowColors && index % 2 !== 0
                              ? "#f9fafb80"
                              : tableStyle.backgroundColor || "#ffffff",
                      }}
                      onClick={() => onPackageSelect(pkg.id)}
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
  );
}

// =============================================================================
// MOBILE PACKAGE CARDS COMPONENT
// =============================================================================

interface MobilePackageCardsProps {
  settings: PricingTableWidgetSettings;
  packages: Package[];
  features: ComparisonFeature[];
  selectedPackageId: string | null;
  onPackageSelect: (packageId: string) => void;
  locationFee: number;
  currencySymbol?: string;
}

function MobilePackageCards({
  settings,
  packages,
  features,
  selectedPackageId,
  onPackageSelect,
  locationFee,
  currencySymbol = "$",
}: MobilePackageCardsProps) {
  const { responsive } = settings;

  return (
    <div className="lg:hidden">
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
              onClick={() => onPackageSelect(pkg.id)}
            >
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

              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <p className="text-3xl font-bold mt-1">{currencySymbol}{pkg.price}</p>
                {locationFee > 0 && (
                  <p className="text-xs text-gray-500">+ {currencySymbol}{locationFee} {settings.stateFee.label?.toLowerCase() || "location fee"}</p>
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

              <div className="space-y-3">
                {features
                  .slice(
                    0,
                    responsive.mobileCard.showAllFeatures
                      ? features.length
                      : responsive.mobileCard.keyFeaturesCount
                  )
                  .map((feature) => {
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
                {!responsive.mobileCard.showAllFeatures &&
                  features.length > responsive.mobileCard.keyFeaturesCount && (
                    <p className="text-xs text-gray-500 text-center">
                      +{features.length - responsive.mobileCard.keyFeaturesCount}{" "}
                      more features
                    </p>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN WIDGET COMPONENT
// =============================================================================

export function PricingTableWidget({
  settings: propsSettings,
  isPreview = false,
}: PricingTableWidgetProps) {
  const settings = { ...DEFAULT_PRICING_TABLE_SETTINGS, ...propsSettings };

  // Auto mode: resolve slug from ServiceContext
  const serviceContext = useOptionalServiceContext();
  const resolvedSlug = settings.dataSource.mode === "auto"
    ? serviceContext?.service?.slug
    : settings.dataSource.serviceSlug;

  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Fetch currency from business config
  useEffect(() => {
    fetch("/api/business-config")
      .then((res) => res.json())
      .then((config) => {
        if (config.currency) {
          setCurrencySymbol(getCurrencySymbol(config.currency));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch service data
  useEffect(() => {
    async function fetchServiceData() {
      if (!resolvedSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/services/${resolvedSlug}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch service data");
        }

        const data = await response.json();
        setServiceData({
          id: data.id,
          slug: data.slug,
          name: data.name,
          comparisonFeatures: data.comparisonFeatures || [],
          packages: data.packages || [],
          hasLocationBasedPricing: data.hasLocationBasedPricing ?? false,
          displayOptions: data.displayOptions || {},
        });

        // Set default selected package
        const popularPkg = data.packages?.find(
          (p: Package) => p.isPopular
        );
        setSelectedPackageId(popularPkg?.id || data.packages?.[0]?.id || null);
      } catch (err) {
        console.error("Error fetching service data:", err);
        setError("Failed to load pricing data");
      } finally {
        setLoading(false);
      }
    }

    fetchServiceData();
  }, [resolvedSlug]);

  // Get selected package
  const selectedPackage = useMemo(
    () => serviceData?.packages.find((p) => p.id === selectedPackageId),
    [serviceData?.packages, selectedPackageId]
  );

  // Get location fee
  const locationFee = useMemo(
    () => selectedLocation?.fee || 0,
    [selectedLocation]
  );

  // Calculate totals
  const addonsTotal = useMemo(
    () => selectedAddons.reduce((sum, addon) => sum + addon.price, 0),
    [selectedAddons]
  );

  const grandTotal = useMemo(
    () => (selectedPackage?.price || 0) + locationFee + addonsTotal,
    [selectedPackage, locationFee, addonsTotal]
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
    setSelectedAddons((prev) => prev.filter((a) => a.packageId === packageId));
  };

  // Loading state
  if (loading) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex gap-6">
          <div className="flex-1">
            <div
              className="h-96 animate-pulse rounded-xl bg-muted/50"
              style={{ borderRadius: `${settings.tableStyle.borderRadius}px` }}
            />
          </div>
          {settings.orderSummary.enabled && (
            <div className="hidden lg:block w-80">
              <div className="h-64 animate-pulse rounded-xl bg-muted/50" />
            </div>
          )}
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-32 bg-destructive/10 rounded-xl border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // No service selected
  if (!resolvedSlug || !serviceData) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-64 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/30">
          <div className="text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-2">
              No service selected
            </p>
            <p className="text-xs text-muted-foreground">
              Select a service in the widget settings to display the pricing table.
            </p>
          </div>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // No packages
  if (serviceData.packages.length === 0) {
    return (
      <WidgetContainer container={settings.container}>
      <div>
        <SectionHeader settings={settings} />
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30">
          <p className="text-sm text-muted-foreground">
            No packages found for this service.
          </p>
        </div>
      </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer container={settings.container}>
    <div className="w-full">
      <SectionHeader settings={settings} />

      {/* Location Selector - only show when both widget setting AND service DB flag are enabled */}
      {settings.stateFee.enabled && serviceData?.hasLocationBasedPricing && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm font-medium">{settings.stateFee.label}:</span>
          <LocationSelector
            value={selectedLocation}
            onChange={setSelectedLocation}
            serviceId={serviceData?.id}
            placeholder="Select location..."
            feeLabel={settings.stateFee.label || "fee"}
            className="w-64"
            currencySymbol={currencySymbol}
          />
        </div>
      )}

      {/* View Mode: Cards */}
      {settings.viewMode === "cards" && (
        <PricingCardsView
          settings={settings}
          features={serviceData.comparisonFeatures}
          packages={serviceData.packages}
          selectedPackageId={selectedPackageId}
          onPackageSelect={handlePackageSelect}
          selectedLocation={selectedLocation}
          locationFee={locationFee}
          serviceSlug={serviceData.slug}
          currencySymbol={currencySymbol}
        />
      )}

      {/* View Mode: Table - Desktop Layout */}
      {settings.viewMode === "table" && (
        <>
          <div className="hidden lg:flex gap-6">
            <ComparisonTable
              settings={settings}
              features={serviceData.comparisonFeatures}
              packages={serviceData.packages}
              selectedPackageId={selectedPackageId}
              onPackageSelect={handlePackageSelect}
              locationFee={locationFee}
              selectedAddons={selectedAddons}
              onToggleAddon={toggleAddon}
              isAddonSelected={isAddonSelected}
              expandedFeature={expandedFeature}
              onExpandFeature={setExpandedFeature}
              currencySymbol={currencySymbol}
            />

            <OrderSummary
              settings={settings}
              selectedPackage={selectedPackage}
              selectedLocation={selectedLocation}
              locationFee={locationFee}
              selectedAddons={selectedAddons}
              grandTotal={grandTotal}
              serviceSlug={serviceData.slug}
              checkoutBadgeText={serviceData.displayOptions?.checkoutBadgeText}
              checkoutBadgeDescription={serviceData.displayOptions?.checkoutBadgeDescription}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* View Mode: Table - Mobile Layout */}
          <div className="lg:hidden mt-8">
            <MobileOrderSummary
              settings={settings}
              selectedPackage={selectedPackage}
              locationFee={locationFee}
              selectedAddons={selectedAddons}
              grandTotal={grandTotal}
              serviceSlug={serviceData.slug}
              selectedLocation={selectedLocation}
              currencySymbol={currencySymbol}
            />

            <MobilePackageCards
              settings={settings}
              packages={serviceData.packages}
              features={serviceData.comparisonFeatures}
              selectedPackageId={selectedPackageId}
              onPackageSelect={handlePackageSelect}
              locationFee={locationFee}
              currencySymbol={currencySymbol}
            />
          </div>
        </>
      )}
    </div>
    </WidgetContainer>
  );
}
