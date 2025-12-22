"use client";

import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";
import { MobileMenu } from "../components/MobileMenu";
import { SearchButton } from "../components/SearchButton";
import type { HeaderLayoutProps } from "../types";

/**
 * Minimal Header Layout
 * Structure: Logo (left) | Hamburger (right)
 * Always shows hamburger menu regardless of screen size
 * Good for landing pages or app-like experiences
 */
export function HeaderMinimal({
  config,
  navigation,
  serviceCategories,
  user,
  session,
  sessionStatus: _sessionStatus,
  businessConfig,
  onLogout,
}: HeaderLayoutProps) {
  const [mounted, setMounted] = useState(false);

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

      {/* Search and Mobile menu */}
      {mounted && (
        <div className="flex items-center gap-2">
          <SearchButton enabled={config.search?.enabled ?? false} />
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
            alwaysVisible={true}
          />
        </div>
      )}
    </nav>
  );
}
