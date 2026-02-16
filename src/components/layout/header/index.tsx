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

// Fallback data when API fails - generic, no service-specific links
const fallbackServiceCategories: ServiceCategory[] = [];

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

  // Check if custom styling is set - use explicit white as default
  const bgColor = headerConfig?.styling?.bgColor || "#ffffff";

  // Helper to detect if a color is dark
  const isDarkColor = (hex: string): boolean => {
    const color = hex.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  // Auto-detect text color if not set - white for dark bg, dark for light bg
  const isDarkBg = isDarkColor(bgColor);
  const textColor = headerConfig?.styling?.textColor || (isDarkBg ? "#ffffff" : "#0f172a");
  const hoverColor = headerConfig?.styling?.hoverColor || (isDarkBg ? "#f97316" : "#f97316");

  // Check if user has set a custom background color
  const hasCustomBgColor = !!headerConfig?.styling?.bgColor;

  // Get styling from header config - always set background color
  const headerStyle: React.CSSProperties = {
    ...((!headerConfig?.transparent || hasCustomBgColor) && { backgroundColor: bgColor }),
    color: textColor,
  };

  // Transparent header styles - only go transparent if no custom bg color is set
  const transparentStyles = headerConfig?.transparent && !isScrolled && !hasCustomBgColor
    ? "bg-transparent text-white"
    : "border-b"; // Let inline style handle background

  // Common layout props
  const layoutProps = {
    config: headerConfig!,
    navigation,
    serviceCategories,
    user,
    session,
    sessionStatus: status,
    isScrolled,
    businessConfig: {
      name: businessConfig.name,
      display: businessConfig.display,
      logo: businessConfig.logo,
    },
    onLogout: handleLogout,
    styling: {
      textColor: textColor,
      hoverColor: hoverColor,
    },
  };

  // Render layout based on config
  const renderLayout = () => {
    if (!headerConfig) {
      return <HeaderDefault {...layoutProps} config={{ ...layoutProps.config, layout: "DEFAULT", height: 76, cta: [], auth: { showButtons: true, loginText: "Sign In", registerText: "Get Started", registerUrl: "/services/llc-formation" } }} />;
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
