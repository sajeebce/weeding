"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, LogOut, LayoutDashboard, LucideIcon, Folder } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MobileMenuProps } from "../types";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDashboardUrl(role?: string) {
  return role === "ADMIN" || role === "STAFF" ? "/admin" : "/dashboard";
}

export function MobileMenu({
  navigation,
  serviceCategories,
  user,
  session,
  businessConfig,
  authConfig,
  ctaButtons,
  onLogout,
  alwaysVisible = false,
}: MobileMenuProps) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const isLoggedIn = !!(user || session?.user);
  const displayUser = user || session?.user;

  return (
    <Sheet>
      <SheetTrigger asChild className={alwaysVisible ? "" : "lg:hidden"}>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <div className="flex flex-col gap-4 py-4">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              {businessConfig.logo.url ? (
                <Image
                  src={businessConfig.logo.url}
                  alt={businessConfig.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-lg font-bold">{businessConfig.name}</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex flex-col gap-1">
            {navigation.map((item) => {
              if (item.hasDropdown) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                    >
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          servicesOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {servicesOpen && (
                      <div className="ml-2 mt-2 space-y-4 border-l-2 border-muted pl-4">
                        {serviceCategories.map((category) => {
                          const CategoryIcon = getIcon(category.icon);
                          return (
                            <div key={category.name}>
                              <div className="mb-2 flex items-center gap-2">
                                <CategoryIcon className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                  {category.name}
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {category.services.map((service) => (
                                  <li key={service.name}>
                                    <SheetClose asChild>
                                      <Link
                                        href={service.href}
                                        className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                                      >
                                        {service.name}
                                      </Link>
                                    </SheetClose>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                        <SheetClose asChild>
                          <Link
                            href="/services"
                            className="block rounded-md px-2 py-2 text-sm font-medium text-primary hover:bg-muted"
                          >
                            View All Services
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <SheetClose key={item.name} asChild>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    {item.name}
                  </Link>
                </SheetClose>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="mt-6 flex flex-col gap-2">
            {isLoggedIn && displayUser ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(displayUser.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{displayUser.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{displayUser.email}</p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={getDashboardUrl(user?.role)} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="destructive" onClick={onLogout} className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">{authConfig.loginText || "Sign In"}</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href={ctaButtons?.[0]?.url || "/services/llc-formation"}>
                      {ctaButtons?.[0]?.text || "Get Started"}
                    </Link>
                  </Button>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
