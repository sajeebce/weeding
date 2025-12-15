"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const serviceCategories = [
  {
    name: "Formation & Legal",
    description: "Start your US business",
    icon: Building2,
    services: [
      { name: "LLC Formation", href: "/services/llc-formation", icon: Building2, popular: true },
      { name: "EIN Application", href: "/services/ein-application", icon: FileText },
      { name: "ITIN Application", href: "/services/itin-application", icon: FileCheck },
      { name: "Trademark Registration", href: "/services/trademark-registration", icon: Stamp, popular: true },
      { name: "DBA / Trade Name", href: "/services/dba-filing", icon: FileText },
      { name: "Operating Agreement", href: "/services/operating-agreement", icon: ScrollText },
    ],
  },
  {
    name: "Compliance & Documents",
    description: "Keep your business compliant",
    icon: Shield,
    services: [
      { name: "Registered Agent", href: "/services/registered-agent", icon: Shield },
      { name: "Annual Compliance", href: "/services/compliance", icon: FileCheck },
      { name: "Virtual US Address", href: "/services/virtual-address", icon: MapPin },
      { name: "Amendment Filing", href: "/services/amendment-filing", icon: FileText },
      { name: "Certificate of Good Standing", href: "/services/certificate-good-standing", icon: FileCheck },
      { name: "Apostille Service", href: "/services/apostille-service", icon: Stamp },
    ],
  },
  {
    name: "Amazon Services",
    description: "Sell on Amazon with confidence",
    icon: ShoppingCart,
    services: [
      { name: "Amazon Seller Account", href: "/services/amazon-seller", icon: ShoppingCart, popular: true },
      { name: "Brand Registry", href: "/services/brand-registry", icon: BadgeCheck, popular: true },
      { name: "Category Ungating", href: "/services/category-ungating", icon: Package },
      { name: "Listing Optimization", href: "/services/product-listing-optimization", icon: Target },
      { name: "A+ Content Creation", href: "/services/a-plus-content", icon: Sparkles },
      { name: "Account Reinstatement", href: "/services/account-reinstatement", icon: AlertTriangle },
    ],
  },
  {
    name: "Tax & Finance",
    description: "Financial services",
    icon: Calculator,
    services: [
      { name: "Business Banking", href: "/services/business-banking", icon: Landmark, popular: true },
      { name: "Bookkeeping", href: "/services/bookkeeping", icon: BookOpen },
      { name: "Tax Filing", href: "/services/tax-filing", icon: Calculator },
    ],
  },
];

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services", hasDropdown: true },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const router = useRouter();
  const { config } = useBusinessConfig();
  const { data: session, status } = useSession();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [user, setUser] = useState<LoggedInUser | null>(null);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {config.logo.url ? (
            <Image
              src={config.logo.url}
              alt={config.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                {config.logo.text || config.name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-xl font-bold">{config.name}</span>
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
                      {serviceCategories.map((category) => (
                        <div key={category.name}>
                          <div className="mb-3 flex items-center gap-2">
                            <category.icon className="h-4 w-4 text-primary" />
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
                      ))}
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
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/services/llc-formation">Get Started</Link>
              </Button>
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
                  {config.logo.url ? (
                    <Image
                      src={config.logo.url}
                      alt={config.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                      <span className="font-bold text-primary-foreground">
                        {config.logo.text || config.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-lg font-bold">{config.name}</span>
                </Link>
              </div>

              <div className="mt-6 flex flex-col gap-1">
                {/* Home */}
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Home
                  </Link>
                </SheetClose>

                {/* Services Accordion */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Services
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        mobileServicesOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {mobileServicesOpen && (
                    <div className="ml-2 mt-2 space-y-4 border-l-2 border-muted pl-4">
                      {serviceCategories.map((category) => (
                        <div key={category.name}>
                          <div className="mb-2 flex items-center gap-2">
                            <category.icon className="h-4 w-4 text-primary" />
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
                      ))}
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

                {/* Other Navigation Items */}
                <SheetClose asChild>
                  <Link
                    href="/pricing"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Pricing
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/about"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    About
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/blog"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Blog
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/contact"
                    className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted"
                  >
                    Contact
                  </Link>
                </SheetClose>
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
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/services/llc-formation">Get Started</Link>
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
