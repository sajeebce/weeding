"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useHeaderConfig, getMegaMenuCategories, getMainNavigation } from "@/hooks/use-header-config";
import { useScrollTransparency } from "./hooks/useScrollTransparency";
import { TopBar } from "./components/TopBar";
import { HeaderDefault } from "./layouts/HeaderDefault";
import { HeaderCentered } from "./layouts/HeaderCentered";
import { HeaderSplit } from "./layouts/HeaderSplit";
import { HeaderMinimal } from "./layouts/HeaderMinimal";
import { HeaderMega } from "./layouts/HeaderMega";
import type { LoggedInUser, NavigationItem, ServiceCategory } from "./types";

// Fallback data when API fails
const fallbackServiceCategories: ServiceCategory[] = [
  {
    name: "Formation & Legal",
    description: "Start your US business",
    icon: "building-2",
    services: [
      { name: "LLC Formation", href: "/services/llc-formation", popular: true },
      { name: "EIN Application", href: "/services/ein-application" },
      { name: "ITIN Application", href: "/services/itin-application" },
      { name: "Trademark Registration", href: "/services/trademark-registration", popular: true },
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

const fallbackNavigation: NavigationItem[] = [
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
  const [user, setUser] = useState<LoggedInUser | null>(null);

  // Transparent header on scroll
  const isScrolled = useScrollTransparency(headerConfig?.transparent ?? false, 100);

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

  // Check for logged-in user
  useEffect(() => {
    const checkUser = () => {
      if (session?.user) {
        setUser({
          id: session.user.id || "",
          email: session.user.email || "",
          name: session.user.name || "",
          role: (session.user as { role?: string }).role || "CUSTOMER",
        });
        return;
      }

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
    window.addEventListener("storage", checkUser);
    window.addEventListener("user-auth-change", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("user-auth-change", checkUser);
    };
  }, [session]);

  const handleLogout = async () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user-auth-change"));
    await signOut({ callbackUrl: "/" });
  };

  // Get styling from header config
  const headerStyle = {
    ...(headerConfig?.styling?.bgColor && !headerConfig.transparent && { backgroundColor: headerConfig.styling.bgColor }),
    ...(headerConfig?.styling?.textColor && { color: headerConfig.styling.textColor }),
  };

  // Transparent header styles
  const transparentStyles = headerConfig?.transparent && !isScrolled
    ? "bg-transparent text-white"
    : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b";

  // Common layout props
  const layoutProps = {
    config: headerConfig!,
    navigation,
    serviceCategories,
    user,
    session,
    isScrolled,
    businessConfig: {
      name: businessConfig.name,
      logo: businessConfig.logo,
    },
    onLogout: handleLogout,
  };

  // Render layout based on config
  const renderLayout = () => {
    if (!headerConfig) {
      return <HeaderDefault {...layoutProps} config={{ ...layoutProps.config, layout: "DEFAULT", height: 64, cta: [], auth: { showButtons: true, loginText: "Sign In", registerText: "Get Started", registerUrl: "/services/llc-formation" } }} />;
    }

    switch (headerConfig.layout) {
      case "CENTERED":
        return <HeaderCentered {...layoutProps} />;
      case "SPLIT":
        return <HeaderSplit {...layoutProps} />;
      case "MINIMAL":
        return <HeaderMinimal {...layoutProps} />;
      case "MEGA":
        return <HeaderMega {...layoutProps} />;
      case "DEFAULT":
      default:
        return <HeaderDefault {...layoutProps} />;
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {headerConfig?.topBar && (
        <TopBar
          enabled={headerConfig.topBar.enabled}
          content={headerConfig.topBar.content}
          bgColor={headerConfig.styling?.bgColor}
          textColor={headerConfig.styling?.textColor}
        />
      )}

      {/* Main Header */}
      <header
        className={cn(
          "w-full transition-all duration-300 z-50",
          headerConfig?.sticky && "sticky top-0",
          transparentStyles
        )}
        style={headerStyle}
      >
        {renderLayout()}
      </header>
    </>
  );
}

// Re-export for backwards compatibility
export default Header;
