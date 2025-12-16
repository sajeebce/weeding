"use client";

import Link from "next/link";
import { ChevronDown, LucideIcon, Folder } from "lucide-react";
import {
  Building2,
  FileText,
  ShoppingCart,
  MapPin,
  Landmark,
  Shield,
  BadgeCheck,
  Stamp,
  Calculator,
  FileCheck,
  ScrollText,
  Package,
  Sparkles,
  Target,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationProps, ServiceCategory } from "../types";

// Icon mapping for dynamic icons from database
const iconMap: Record<string, LucideIcon> = {
  "building-2": Building2,
  "building2": Building2,
  "file-text": FileText,
  "filetext": FileText,
  "shopping-cart": ShoppingCart,
  "shoppingcart": ShoppingCart,
  "map-pin": MapPin,
  "mappin": MapPin,
  landmark: Landmark,
  shield: Shield,
  "badge-check": BadgeCheck,
  "badgecheck": BadgeCheck,
  stamp: Stamp,
  calculator: Calculator,
  "file-check": FileCheck,
  "filecheck": FileCheck,
  "scroll-text": ScrollText,
  "scrolltext": ScrollText,
  package: Package,
  sparkles: Sparkles,
  target: Target,
  "alert-triangle": AlertTriangle,
  "alerttriangle": AlertTriangle,
  "book-open": BookOpen,
  "bookopen": BookOpen,
  folder: Folder,
};

function getIcon(iconName: string | undefined | null): LucideIcon {
  if (!iconName) return Folder;
  const normalizedName = iconName.toLowerCase().replace(/[-_\s]/g, "");
  return iconMap[normalizedName] || iconMap[iconName.toLowerCase()] || Folder;
}

interface MegaMenuProps {
  categories: ServiceCategory[];
}

function MegaMenuDropdown({ categories }: MegaMenuProps) {
  return (
    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
      <div className="w-[800px] rounded-xl border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-semibold text-foreground">Our Services</h3>
            <p className="text-sm text-muted-foreground">
              Complete business solutions for international entrepreneurs
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All Services
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {categories.map((category) => {
            const CategoryIcon = getIcon(category.icon);
            return (
              <div key={category.name}>
                <div className="mb-3 flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">
                    {category.name}
                  </h4>
                </div>
                <ul className="space-y-1">
                  {category.services.map((service) => (
                    <li key={service.name}>
                      <Link
                        href={service.href}
                        className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span className="flex-1">{service.name}</span>
                        {service.popular && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            Popular
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex items-center gap-4 border-t pt-4">
          <span className="text-sm text-muted-foreground">Quick Start:</span>
          <Link
            href="/services/llc-formation"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Form Your LLC
          </Link>
          <Link
            href="/services/amazon-seller"
            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Start Selling on Amazon
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
          >
            Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Navigation({
  items,
  serviceCategories,
  hoveredItem,
  setHoveredItem,
  split = "all",
}: NavigationProps) {
  // Split navigation items if needed
  let displayItems = items;
  if (split === "left") {
    displayItems = items.slice(0, Math.ceil(items.length / 2));
  } else if (split === "right") {
    displayItems = items.slice(Math.ceil(items.length / 2));
  }

  return (
    <div className="flex items-center gap-x-8">
      {displayItems.map((item) => (
        <div
          key={item.name}
          className="relative"
          onMouseEnter={() => setHoveredItem(item.name)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              hoveredItem === item.name && "text-foreground"
            )}
          >
            {item.name}
            {item.hasDropdown && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  hoveredItem === item.name && "rotate-180"
                )}
              />
            )}
          </Link>

          {/* Mega Menu Dropdown */}
          {item.hasDropdown && hoveredItem === item.name && (
            <MegaMenuDropdown categories={serviceCategories} />
          )}
        </div>
      ))}
    </div>
  );
}
