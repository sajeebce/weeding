"use client";

import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";
import { Navigation } from "../components/Navigation";
import { CTAButtons } from "../components/CTAButtons";
import { MobileMenu } from "../components/MobileMenu";
import { SearchButton } from "../components/SearchButton";
import type { HeaderLayoutProps } from "../types";

/**
 * Default Header Layout
 * Structure: Logo (left) | Navigation (center) | CTA (right)
 */
export function HeaderDefault({
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

  // Fix hydration mismatch for Radix UI components
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav
      className="container mx-auto flex items-center justify-between px-4"
      style={{ height: `${config.height || 64}px` }}
    >
      {/* Logo - Left */}
      <Logo
        businessConfig={businessConfig}
        maxHeight={config.logo?.maxHeight || 36}
      />

      {/* Desktop Navigation - Center */}
      <div className="hidden lg:flex lg:items-center lg:gap-x-8">
        <Navigation
          items={navigation}
          serviceCategories={serviceCategories}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
        />
      </div>

      {/* Desktop CTA - Right */}
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
    </nav>
  );
}
