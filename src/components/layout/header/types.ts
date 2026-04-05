"use client";

import type { Session } from "next-auth";
import type { PublicHeaderResponse, CTAButton, ButtonCustomStyle, TopBarContent } from "@/lib/header-footer/types";

export interface LoggedInUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  hasDropdown: boolean;
}

export interface ServiceCategory {
  name: string;
  description: string;
  icon: string;
  services: { name: string; href: string; popular?: boolean }[];
}

export interface BusinessConfig {
  name: string;
  display?: {
    showLogo: boolean;
    showName: boolean;
  };
  logo: {
    url: string;
    darkUrl?: string;
    text: string;
  };
}

export interface HeaderLayoutProps {
  config: PublicHeaderResponse;
  navigation: NavigationItem[];
  serviceCategories: ServiceCategory[];
  user: LoggedInUser | null;
  session: Session | null;
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
  isScrolled: boolean;
  businessConfig: BusinessConfig;
  onLogout: () => void;
  styling?: {
    textColor?: string;
    hoverColor?: string;
  };
}

export interface LogoProps {
  businessConfig: BusinessConfig;
  maxHeight?: number;
  className?: string;
  /** Use 'dark' for dark backgrounds (footer) - will use darkUrl if available */
  variant?: "light" | "dark";
}

export interface NavigationProps {
  items: NavigationItem[];
  serviceCategories: ServiceCategory[];
  hoveredItem: string | null;
  setHoveredItem: (item: string | null) => void;
  split?: "left" | "right" | "all";
  styling?: {
    textColor?: string;
    hoverColor?: string;
  };
}

export interface UserMenuProps {
  user: LoggedInUser | null;
  session: Session | null;
  onLogout: () => void;
}

export interface MobileMenuProps {
  navigation: NavigationItem[];
  serviceCategories: ServiceCategory[];
  user: LoggedInUser | null;
  session: Session | null;
  businessConfig: BusinessConfig;
  authConfig: {
    showButtons: boolean;
    loginText: string;
    registerText: string;
    registerUrl: string;
  };
  ctaButtons: CTAButton[];
  onLogout: () => void;
  /** When true, hamburger shows on all screen sizes (for HeaderMinimal) */
  alwaysVisible?: boolean;
}

export interface TopBarProps {
  enabled: boolean;
  content?: TopBarContent;
  bgColor?: string;
  textColor?: string;
}

export interface CTAButtonsProps {
  buttons: CTAButton[];
  showAuth: boolean;
  showLanguageSwitcher?: boolean;
  authConfig: {
    loginText: string;
    loginUrl?: string;
    loginStyle?: ButtonCustomStyle | null;
    registerText: string;
    registerUrl: string;
    registerStyle?: ButtonCustomStyle | null;
  };
  user: LoggedInUser | null;
  session: Session | null;
  sessionStatus?: "loading" | "authenticated" | "unauthenticated";
  onLogout: () => void;
}
