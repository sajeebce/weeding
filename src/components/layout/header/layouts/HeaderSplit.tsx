"use client";

import { useState, useEffect } from "react";
import { Logo } from "../components/Logo";
import { Navigation } from "../components/Navigation";
import { CTAButtons } from "../components/CTAButtons";
import { MobileMenu } from "../components/MobileMenu";
import { SearchButton } from "../components/SearchButton";
import type { HeaderLayoutProps } from "../types";

/**
 * Split Header Layout
 * Structure: Nav Left | Logo Center | Nav Right + CTA
 * Navigation is split into two halves around the centered logo
 */
export function HeaderSplit({
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
    <nav
      className="container mx-auto px-4"
      style={{ height: `${config.height || 64}px` }}
    >
      <div className="hidden lg:grid lg:h-full lg:grid-cols-3 lg:items-center">
        {/* Left Navigation */}
        <div className="flex items-center justify-start">
          <Navigation
            items={navigation}
            serviceCategories={serviceCategories}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            split="left"
          />
        </div>

        {/* Center Logo */}
        <div className="flex items-center justify-center">
          <Logo
            businessConfig={businessConfig}
            maxHeight={config.logo?.maxHeight || 36}
          />
        </div>

        {/* Right Navigation + CTA */}
        <div className="flex items-center justify-end gap-x-6">
          <Navigation
            items={navigation}
            serviceCategories={serviceCategories}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            split="right"
          />
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

      {/* Mobile: Logo left, Menu right */}
      <div className="flex h-full items-center justify-between lg:hidden">
        <Logo
          businessConfig={businessConfig}
          maxHeight={config.logo?.maxHeight || 36}
        />
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
    </nav>
  );
}
