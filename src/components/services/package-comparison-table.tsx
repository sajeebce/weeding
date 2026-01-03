"use client";

import Link from "next/link";
import { Check, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PackageFeatureMapping {
  packageId: string;
  included: boolean;
  customValue?: string | null;
}

interface Feature {
  id: string;
  text: string;
  tooltip?: string | null;
  packageMappings?: PackageFeatureMapping[];
}

interface Package {
  id: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  isPopular: boolean;
  checkoutUrl?: string;
}

interface PackageComparisonTableProps {
  features: Feature[];
  packages: Package[];
}

export function PackageComparisonTable({
  features,
  packages,
}: PackageComparisonTableProps) {
  if (packages.length === 0 || features.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-55 bg-muted/50 px-4 py-4 text-left text-sm font-medium backdrop-blur-sm">
                Features
              </th>
              {packages.map((pkg) => (
                <th
                  key={pkg.id}
                  className={cn(
                    "min-w-40 px-4 py-4 text-center",
                    pkg.isPopular && "bg-primary/5"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    {pkg.isPopular && (
                      <Badge className="mb-1">Most Popular</Badge>
                    )}
                    <span className="text-lg font-semibold">{pkg.name}</span>
                    <span className="text-2xl font-bold">${pkg.priceUSD}</span>
                    {pkg.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {pkg.description}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={feature.id}
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-muted/30",
                  index % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{feature.text}</span>
                    {feature.tooltip && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground">
                              <Info className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-60">
                            <p className="text-xs">{feature.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </td>
                {packages.map((pkg) => {
                  const mapping = feature.packageMappings?.find(
                    (m) => m.packageId === pkg.id
                  );
                  const isIncluded = mapping?.included ?? false;
                  const customValue = mapping?.customValue;

                  return (
                    <td
                      key={pkg.id}
                      className={cn(
                        "px-4 py-3 text-center",
                        pkg.isPopular && "bg-primary/5"
                      )}
                    >
                      {customValue ? (
                        <span className="text-sm font-medium">{customValue}</span>
                      ) : isIncluded ? (
                        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-4 w-4 stroke-3" />
                        </div>
                      ) : (
                        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                          <X className="h-4 w-4 stroke-3" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Select Button Row */}
            <tr>
              <td className="sticky left-0 z-10 bg-background px-4 py-4"></td>
              {packages.map((pkg) => (
                <td
                  key={pkg.id}
                  className={cn(
                    "px-4 py-4 text-center",
                    pkg.isPopular && "bg-primary/5"
                  )}
                >
                  {pkg.checkoutUrl ? (
                    <Button
                      variant={pkg.isPopular ? "default" : "outline"}
                      className="w-full max-w-35"
                      asChild
                    >
                      <Link href={pkg.checkoutUrl}>Select {pkg.name}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant={pkg.isPopular ? "default" : "outline"}
                      className="w-full max-w-35"
                      disabled
                    >
                      Select {pkg.name}
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Swipe View */}
      <div className="md:hidden">
        <div className="mb-4 text-center text-sm text-muted-foreground">
          Swipe to compare packages
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                "min-w-70 max-w-75 shrink-0 snap-center rounded-lg border p-4",
                pkg.isPopular && "border-primary ring-1 ring-primary"
              )}
            >
              {/* Package Header */}
              <div className="mb-4 text-center">
                {pkg.isPopular && (
                  <Badge className="mb-2">Most Popular</Badge>
                )}
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <p className="text-3xl font-bold">${pkg.priceUSD}</p>
                {pkg.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature) => {
                  const mapping = feature.packageMappings?.find(
                    (m) => m.packageId === pkg.id
                  );
                  const isIncluded = mapping?.included ?? false;
                  const customValue = mapping?.customValue;

                  return (
                    <div
                      key={feature.id}
                      className={cn(
                        "flex items-start gap-3 text-sm",
                        !isIncluded && !customValue && "text-muted-foreground"
                      )}
                    >
                      {customValue ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      ) : isIncluded ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      )}
                      <span className={cn(!isIncluded && !customValue && "line-through")}>
                        {customValue || feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Select Button */}
              {pkg.checkoutUrl ? (
                <Button
                  variant={pkg.isPopular ? "default" : "outline"}
                  className="mt-6 w-full"
                  asChild
                >
                  <Link href={pkg.checkoutUrl}>Select {pkg.name}</Link>
                </Button>
              ) : (
                <Button
                  variant={pkg.isPopular ? "default" : "outline"}
                  className="mt-6 w-full"
                  disabled
                >
                  Select {pkg.name}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
