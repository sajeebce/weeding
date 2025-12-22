"use client";

import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";
import { Navigation } from "../components/Navigation";
import { CTAButtons } from "../components/CTAButtons";
import { MobileMenu } from "../components/MobileMenu";
import { SearchButton } from "../components/SearchButton";
import type { HeaderLayoutProps } from "../types";

/**
 * Centered Header Layout
 * Structure: Two rows
 * Row 1: Logo (center)
 * Row 2: Navigation (center) | CTA (right absolute)
 */
export function HeaderCentered({
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

  return (
    <div className="container mx-auto px-4">
      {/* Row 1: Centered Logo */}
      <div
        className="flex items-center justify-center border-b border-border/50"
        style={{ height: `${Math.floor((config.height || 64) * 0.6)}px` }}
      >
        <Logo
          businessConfig={businessConfig}
          maxHeight={config.logo?.maxHeight || 36}
        />

        {/* Mobile Menu - Absolute right */}
        <div className="absolute right-4 lg:hidden">
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

      {/* Row 2: Navigation centered, CTA right */}
      <div
        className="relative hidden lg:flex lg:items-center lg:justify-center"
        style={{ height: `${Math.floor((config.height || 64) * 0.55)}px` }}
      >
        <Navigation
          items={navigation}
          serviceCategories={serviceCategories}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
        />

        {/* CTA positioned absolute right */}
        <div className="absolute right-0 flex items-center gap-x-4">
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
      </div>
    </div>
  );
}
