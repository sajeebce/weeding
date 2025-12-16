"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  ChevronDown,
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
  User,
  LogOut,
  LayoutDashboard,
  LucideIcon,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useHeaderConfig, getMegaMenuCategories, getMainNavigation } from "@/hooks/use-header-config";

interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

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

// Fallback hardcoded data (used when API fails or during loading)
const fallbackServiceCategories = [
  {
    name: "Formation & Legal",
    description: "Start your US business",
    icon: "building-2",
    services: [
      { name: "LLC Formation", href: "/services/llc-formation", popular: true },
      { name: "EIN Application", href: "/services/ein-application" },
      { name: "ITIN Application", href: "/services/itin-application" },
      { name: "Trademark Registration", href: "/services/trademark-registration", popular: true },
      { name: "DBA / Trade Name", href: "/services/dba-filing" },
      { name: "Operating Agreement", href: "/services/operating-agreement" },
    ],
  },
  {
    name: "Compliance & Documents",
    description: "Keep your business compliant",
    icon: "shield",
    services: [
      { name: "Registered Agent", href: "/services/registered-agent" },
      { name: "Annual Compliance", href: "/services/compliance" },
      { name: "Virtual US Address", href: "/services/virtual-address" },
      { name: "Amendment Filing", href: "/services/amendment-filing" },
      { name: "Certificate of Good Standing", href: "/services/certificate-good-standing" },
      { name: "Apostille Service", href: "/services/apostille-service" },
    ],
  },
  {
    name: "Amazon Services",
    description: "Sell on Amazon with confidence",
    icon: "shopping-cart",
    services: [
      { name: "Amazon Seller Account", href: "/services/amazon-seller", popular: true },
      { name: "Brand Registry", href: "/services/brand-registry", popular: true },
      { name: "Category Ungating", href: "/services/category-ungating" },
      { name: "Listing Optimization", href: "/services/product-listing-optimization" },
      { name: "A+ Content Creation", href: "/services/a-plus-content" },
      { name: "Account Reinstatement", href: "/services/account-reinstatement" },
    ],
  },
  {
    name: "Tax & Finance",
    description: "Financial services",
    icon: "calculator",
    services: [
      { name: "Business Banking", href: "/services/business-banking", popular: true },
      { name: "Bookkeeping", href: "/services/bookkeeping" },
      { name: "Tax Filing", href: "/services/tax-filing" },
    ],
  },
];

const fallbackNavigation = [
  { name: "Home", href: "/", hasDropdown: false },
  { name: "Services", href: "/services", hasDropdown: true },
  { name: "Pricing", href: "/pricing", hasDropdown: false },
  { name: "About", href: "/about", hasDropdown: false },
  { name: "Blog", href: "/blog", hasDropdown: false },
  { name: "Contact", href: "/contact", hasDropdown: false },
];

export function Header() {
  const { config: businessConfig } = useBusinessConfig();
  const { config: headerConfig } = useHeaderConfig();
  const { data: session, status } = useSession();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [user, setUser] = useState<LoggedInUser | null>(null);

  // Process menu data from API
  const navigation = useMemo(() => {
    if (headerConfig?.menu && headerConfig.menu.length > 0) {
      return getMainNavigation(headerConfig.menu);
    }
    return fallbackNavigation;
  }, [headerConfig?.menu]);

  const serviceCategories = useMemo(() => {
    if (headerConfig?.menu && headerConfig.menu.length > 0) {
      const categories = getMegaMenuCategories(headerConfig.menu);
      if (categories.length > 0) {
        return categories;
      }
    }
    return fallbackServiceCategories;
  }, [headerConfig?.menu]);

  // Check for logged-in user - prefer NextAuth session, fallback to localStorage
  useEffect(() => {
    const checkUser = () => {
      // First check NextAuth session
      if (session?.user) {
        setUser({
          id: session.user.id || "",
          email: session.user.email || "",
          name: session.user.name || "",
          role: (session.user as { role?: string }).role || "CUSTOMER",
        });
        return;
      }

      // Fallback to localStorage for backward compatibility
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.id && userData.email) {
            setUser(userData);
          }
        } catch {
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener("storage", checkUser);
    // Custom event for same-tab updates
    window.addEventListener("user-auth-change", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("user-auth-change", checkUser);
    };
  }, [session]);

  const handleLogout = async () => {
    // Clear localStorage
    localStorage.removeItem("user");
    setUser(null);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("user-auth-change"));
    // Sign out from NextAuth
    await signOut({ callbackUrl: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardUrl = () => {
    if (!user) return "/dashboard";
    return user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/dashboard";
  };

  // Get styling from header config
  const headerStyle = {
    ...(headerConfig?.styling?.bgColor && { backgroundColor: headerConfig.styling.bgColor }),
    ...(headerConfig?.styling?.textColor && { color: headerConfig.styling.textColor }),
  };

  const headerHeight = headerConfig?.height || 64;

  return (
    <header
      className={cn(
        "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50",
        headerConfig?.sticky && "sticky top-0"
      )}
      style={headerStyle}
    >
      <nav
        className="container mx-auto flex items-center justify-between px-4"
        style={{ height: `${headerHeight}px` }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {businessConfig.logo.url ? (
            <Image
              src={businessConfig.logo.url}
              alt={businessConfig.name}
              width={headerConfig?.logo?.maxHeight || 36}
              height={headerConfig?.logo?.maxHeight || 36}
              className="rounded-lg object-contain"
              style={{ height: `${headerConfig?.logo?.maxHeight || 36}px`, width: "auto" }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-lg bg-primary"
              style={{
                height: `${headerConfig?.logo?.maxHeight || 36}px`,
                width: `${headerConfig?.logo?.maxHeight || 36}px`,
              }}
            >
              <span className="text-lg font-bold text-primary-foreground">
                {businessConfig.logo.text || businessConfig.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-xl font-bold">{businessConfig.name}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-8">
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
                        View All Services →
                      </Link>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                      {serviceCategories.map((category) => {
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
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4">
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user || session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user?.name || session?.user?.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate font-medium">{user?.name || session?.user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name || session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || session?.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardUrl()} className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {headerConfig?.auth?.showButtons && (
                <Button variant="ghost" asChild>
                  <Link href="/login">{headerConfig?.auth?.loginText || "Sign In"}</Link>
                </Button>
              )}
              {headerConfig?.cta && headerConfig.cta.length > 0 ? (
                headerConfig.cta.map((cta, index) => (
                  <Button
                    key={index}
                    variant={cta.variant === "outline" ? "outline" : "default"}
                    asChild
                  >
                    <Link href={cta.url}>{cta.text}</Link>
                  </Button>
                ))
              ) : (
                <Button asChild>
                  <Link href="/services/llc-formation">Get Started</Link>
                </Button>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <div className="flex flex-col gap-4 py-4">
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

              <div className="mt-6 flex flex-col gap-1">
                {navigation.map((item) => {
                  if (item.hasDropdown) {
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                        >
                          {item.name}
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              mobileServicesOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {mobileServicesOpen && (
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
                                View All Services →
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

              <div className="mt-6 flex flex-col gap-2">
                {status === "loading" ? (
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted-foreground/20" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted-foreground/20" />
                      <div className="h-3 w-32 animate-pulse rounded bg-muted-foreground/20" />
                    </div>
                  </div>
                ) : user || session?.user ? (
                  <>
                    {/* User Info */}
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3 mb-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user?.name || session?.user?.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user?.name || session?.user?.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email || session?.user?.email}</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full">
                        <Link href={getDashboardUrl()} className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="destructive" onClick={handleLogout} className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">{headerConfig?.auth?.loginText || "Sign In"}</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href={headerConfig?.cta?.[0]?.url || "/services/llc-formation"}>
                          {headerConfig?.cta?.[0]?.text || "Get Started"}
                        </Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
