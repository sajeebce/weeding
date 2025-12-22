"use client";

import { useState, useEffect } from "react";
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
import { Logo } from "../components/Logo";
import { CTAButtons } from "../components/CTAButtons";
import { MobileMenu } from "../components/MobileMenu";
import { SearchButton } from "../components/SearchButton";
import { cn } from "@/lib/utils";
import type { HeaderLayoutProps, ServiceCategory } from "../types";

// Icon mapping
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

interface FullWidthMegaMenuProps {
  categories: ServiceCategory[];
  isOpen: boolean;
}

function FullWidthMegaMenu({ categories, isOpen }: FullWidthMegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 right-0 top-full w-full border-b bg-background shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-8">
          {categories.map((category) => {
            const CategoryIcon = getIcon(category.icon);
            return (
              <div key={category.name}>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.services.map((service) => (
                    <li key={service.name}>
                      <Link
                        href={service.href}
                        className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span className="flex-1">{service.name}</span>
                        {service.popular && (
                          <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
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

        {/* Bottom CTA row */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Popular Picks:</span>
            <Link
              href="/services/llc-formation"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Form Your LLC
            </Link>
            <Link
              href="/services/amazon-seller"
              className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Amazon Seller Account
            </Link>
          </div>
          <Link href="/contact" className="text-sm font-medium text-primary hover:underline">
            Need help? Get free consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Mega Header Layout
 * Structure: Two rows
 * Row 1: Logo | CTA
 * Row 2: Full-width navigation bar with full-width mega dropdowns
 * Enterprise/Amazon style
 */
export function HeaderMega({
  config,
  navigation,
  serviceCategories,
  user,
  session,
  sessionStatus,
  businessConfig,
  onLogout,
}: HeaderLayoutProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const servicesItem = navigation.find((item) => item.hasDropdown);

  return (
    <div>
      {/* Row 1: Logo and CTA */}
      <div className="container mx-auto px-4">
        <div
          className="flex items-center justify-between border-b border-border/50"
          style={{ height: `${Math.floor((config.height || 64) * 0.65)}px` }}
        >
          <Logo
            businessConfig={businessConfig}
            maxHeight={config.logo?.maxHeight || 36}
          />

          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
            <SearchButton enabled={config.search?.enabled ?? false} />
            <CTAButtons
              buttons={config.cta || []}
              showAuth={config.auth?.showButtons ?? true}
              authConfig={{
                loginText: config.auth?.loginText || "Sign In",
                loginUrl: config.auth?.loginUrl || "/auth/signin",
                loginStyle: config.auth?.loginStyle,
                registerText: config.auth?.registerText || "Get Started",
                registerUrl: config.auth?.registerUrl || "/services/llc-formation",
              }}
              user={user}
              session={session}
              sessionStatus={sessionStatus}
              onLogout={onLogout}
            />
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            {mounted && (
              <MobileMenu
                navigation={navigation}
                serviceCategories={serviceCategories}
                user={user}
                session={session}
                businessConfig={businessConfig}
                authConfig={{
                  showButtons: config.auth?.showButtons ?? true,
                  loginText: config.auth?.loginText || "Sign In",
                  registerText: config.auth?.registerText || "Get Started",
                  registerUrl: config.auth?.registerUrl || "/services/llc-formation",
                }}
                ctaButtons={config.cta || []}
                onLogout={onLogout}
              />
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Full-width navigation bar */}
      <div
        className="relative hidden border-b bg-muted/30 lg:block"
        style={{ height: `${Math.floor((config.height || 64) * 0.55)}px` }}
      >
        <div className="container mx-auto flex h-full items-center px-4">
          <nav className="flex items-center gap-x-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    hoveredItem === item.name
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
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
              </div>
            ))}
          </nav>
        </div>

        {/* Full-width Mega Menu */}
        {servicesItem && (
          <FullWidthMegaMenu
            categories={serviceCategories}
            isOpen={hoveredItem === servicesItem.name}
          />
        )}
      </div>
    </div>
  );
}
