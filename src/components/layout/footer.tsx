"use client";

import Link from "next/link";
import Image from "next/image";
import { SmartLink } from "@/components/ui/smart-link";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useFooterConfig, getWidgetsByColumn, getWidgetLinks } from "@/hooks/use-footer-config";
import type { FooterWidget, PublicFooterResponse, ButtonCustomStyle } from "@/lib/header-footer/types";
import { CraftButton, CraftButtonLabel, CraftButtonIcon } from "@/components/ui/craft-button";
import { PrimaryFlowButton } from "@/components/ui/flow-button";
import { NeuralButton } from "@/components/ui/neural-button";
import { Button } from "@/components/ui/button";
import { CRAFT_BG_DARK, WHITE, ORANGE_PRIMARY } from "@/lib/button-constants";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Shared button utilities
import {
  getNormalBackground,
  getHoverBackground,
  getGradientShiftBackground,
  getHoverEffectClass,
  isComplexHoverEffect,
  getComplexEffectStyles,
  getFinalBackground,
} from "@/lib/button-utils";

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

// Footer Button Component
function FooterButton({
  text,
  url,
  style,
  openInNewTab = false,
}: {
  text: string;
  url: string;
  style: ButtonCustomStyle;
  openInNewTab?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isExternal = /^(https?:\/\/|mailto:|tel:|#)/.test(url);
  const shouldOpenNewTab = openInNewTab || style.openInNewTab;

  // Special button components based on hover effect
  if (style.hoverEffect === "craft-expand") {
    return (
      <SmartLink href={url} openInNewTab={shouldOpenNewTab}>
        <CraftButton
          bgColor={style.bgColor || CRAFT_BG_DARK}
          textColor={style.textColor || WHITE}
          size="sm"
          style={{
            boxShadow: style.shadow,
            borderRadius: `${style.borderRadius ?? 9999}px`,
          }}
        >
          <CraftButtonLabel>{text}</CraftButtonLabel>
          <CraftButtonIcon>
            <ArrowUpRight className="size-3 stroke-2" />
          </CraftButtonIcon>
        </CraftButton>
      </SmartLink>
    );
  }

  if (style.hoverEffect === "flow-border") {
    return (
      <SmartLink href={url} openInNewTab={shouldOpenNewTab}>
        <PrimaryFlowButton
          className="text-sm"
          style={{
            '--tw-ring-color': `${style.bgColor || ORANGE_PRIMARY}99`,
          } as React.CSSProperties}
        >
          {text}
          {isExternal && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />}
        </PrimaryFlowButton>
      </SmartLink>
    );
  }

  if (style.hoverEffect === "neural") {
    return (
      <SmartLink href={url} openInNewTab={shouldOpenNewTab}>
        <NeuralButton size="sm">
          {text}
          {isExternal && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />}
        </NeuralButton>
      </SmartLink>
    );
  }

  // Standard button with custom styling - uses shared utilities
  const hoverClass = getHoverEffectClass(style.hoverEffect);
  const hasComplexEffect = isComplexHoverEffect(style.hoverEffect);
  const effectStyles = getComplexEffectStyles(style, isHovered);

  return (
    <SmartLink
      href={url}
      openInNewTab={shouldOpenNewTab}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer overflow-hidden",
        hoverClass,
        hasComplexEffect ? "transition-all duration-500 ease-out" : "transition-all duration-300"
      )}
      style={{
        background: getFinalBackground(style, isHovered),
        color: isHovered && style.hoverTextColor ? style.hoverTextColor : (style.textColor || "#ffffff"),
        borderWidth: `${style.borderWidth ?? 0}px`,
        borderStyle: "solid",
        borderColor: style.borderColor || style.bgColor || ORANGE_PRIMARY,
        borderRadius: `${style.borderRadius ?? 6}px`,
        ...effectStyles,
        ...((!hasComplexEffect && style.shadow) ? { boxShadow: isHovered && style.hoverShadow ? style.hoverShadow : style.shadow } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text}
      {isExternal && <ExternalLink className="h-3.5 w-3.5" />}
    </SmartLink>
  );
}

// Fallback links (used when API fails or during initial load)
const fallbackLinks = {
  services: [
    { name: "LLC Formation", href: "/services/llc-formation" },
    { name: "EIN Application", href: "/services/ein-application" },
    { name: "Amazon Seller Account", href: "/services/amazon-seller" },
    { name: "Registered Agent", href: "/services/registered-agent" },
    { name: "Virtual Address", href: "/services/virtual-address" },
    { name: "Business Banking", href: "/services/business-banking" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "FAQs", href: "/faq" },
    { name: "Contact", href: "/contact" },
    { name: "Testimonials", href: "/testimonials" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
  states: [
    { name: "Wyoming LLC", href: "/llc/wyoming" },
    { name: "Delaware LLC", href: "/llc/delaware" },
    { name: "New Mexico LLC", href: "/llc/new-mexico" },
    { name: "Texas LLC", href: "/llc/texas" },
    { name: "Florida LLC", href: "/llc/florida" },
  ],
};

// Enhanced Newsletter form component with multiple styles
function EnhancedNewsletterForm({
  title,
  subtitle,
  formAction,
  style = "inline",
  buttonStyle = "primary",
  accentColor,
  incentive,
  buttonText = "Subscribe",
  borderColor,
  textColor,
}: {
  title?: string;
  subtitle?: string;
  formAction?: string;
  style?: "inline" | "stacked" | "floating";
  buttonStyle?: "primary" | "secondary" | "outline" | "gradient";
  accentColor?: string;
  incentive?: string;
  buttonText?: string;
  borderColor?: string;
  textColor?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      if (formAction) {
        const response = await fetch(formAction, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("Subscription failed");
      } else {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("Subscription failed");
      }
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const buttonClasses = cn(
    "transition-all duration-200",
    buttonStyle === "gradient" && "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
    buttonStyle === "outline" && "border-2 border-current bg-transparent hover:bg-current/10"
  );

  if (style === "stacked") {
    return (
      <div className="space-y-4">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
        {incentive && (
          <div className="flex items-center gap-2 text-sm" style={{ color: accentColor }}>
            <Sparkles className="h-4 w-4" />
            <span>{incentive}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            required
            className="w-full"
            aria-label="Email address"
            style={{
              borderColor: borderColor || undefined,
              color: textColor || undefined,
            }}
          />
          <Button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className={cn("w-full", buttonClasses)}
            style={accentColor ? { backgroundColor: accentColor } : undefined}
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : status === "success" ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {status === "success" ? "Subscribed!" : buttonText}
          </Button>
        </form>
        {status === "error" && (
          <p className="text-sm text-destructive" role="alert">Failed to subscribe. Please try again.</p>
        )}
      </div>
    );
  }

  // Default inline style - Modern compact design
  // Button uses accent color for visibility on dark backgrounds
  const buttonBgColor = accentColor || "#22d3ee";

  return (
    <div className="space-y-3">
      {title && <h3 className="text-sm font-semibold">{title}</h3>}
      <form
        onSubmit={handleSubmit}
        className="flex max-w-sm rounded-lg overflow-hidden border focus-within:ring-2 focus-within:ring-white/40 transition-all"
        style={{ borderColor: borderColor || "rgba(255,255,255,0.2)" }}
      >
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 border-0 rounded-none bg-white/5 placeholder:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 text-sm"
          disabled={status === "loading" || status === "success"}
          required
          aria-label="Email address"
          style={{ color: textColor || undefined }}
        />
        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="rounded-none h-11 px-5 font-semibold shrink-0 border-0 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: buttonBgColor,
            color: "#0f172a"
          }}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Done
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
      {subtitle && <p className="text-xs opacity-50 mt-2">{subtitle}</p>}
      {incentive && (
        <div className="flex items-center gap-2 text-xs" style={{ color: accentColor }}>
          <Sparkles className="h-3 w-3" />
          <span>{incentive}</span>
        </div>
      )}
      {status === "success" && (
        <p className="text-xs text-green-400 mt-2" role="status">Successfully subscribed!</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2" role="alert">Failed to subscribe. Please try again.</p>
      )}
    </div>
  );
}

// Enhanced Social Links component with configurable styling
function EnhancedSocialLinks({
  links,
  shape = "circle",
  size = "md",
  colorMode = "brand",
  hoverEffect = "scale",
  accentColor,
  bgStyle = "subtle",
}: {
  links: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
  shape?: string;
  size?: string;
  colorMode?: string;
  hoverEffect?: string;
  accentColor?: string;
  bgStyle?: "none" | "subtle" | "solid" | "outline";
}) {
  const sizeClasses = {
    sm: { container: "p-1.5", icon: "h-4 w-4", gap: "gap-2" },
    md: { container: "p-2.5", icon: "h-5 w-5", gap: "gap-3" },
    lg: { container: "p-3", icon: "h-6 w-6", gap: "gap-3" },
    xl: { container: "p-4", icon: "h-7 w-7", gap: "gap-4" },
  };

  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-none",
    rounded: "rounded-lg",
    pill: "rounded-full",
  };

  // Pill shape uses wider containers with explicit min-width
  const isPill = shape === "pill";

  const hoverClasses = {
    scale: "hover:scale-110",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    glow: "hover:shadow-lg hover:shadow-current/30",
    rotate: "hover:rotate-12",
  };

  // Background style classes - works well on both light and dark backgrounds
  const bgClasses = {
    none: "",
    subtle: "bg-white/10 hover:bg-white/20", // Subtle glass effect for dark backgrounds
    solid: "bg-current/10 hover:bg-current/20",
    outline: "border border-current/30 hover:border-current/50",
  };

  const currentSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  const currentShape = shapeClasses[shape as keyof typeof shapeClasses] || shapeClasses.circle;
  const currentHover = hoverClasses[hoverEffect as keyof typeof hoverClasses] || hoverClasses.scale;
  const currentBg = bgClasses[bgStyle as keyof typeof bgClasses] || bgClasses.subtle;

  const getColor = (brandColor: string) => {
    if (colorMode === "monochrome") return "currentColor";
    if (colorMode === "accent") return accentColor || brandColor;
    return brandColor;
  };

  // Calculate pill dimensions based on size
  const pillSizes = {
    sm: { height: 28, width: 45 },   // 28 x 45px
    md: { height: 40, width: 64 },   // 40 x 64px
    lg: { height: 48, width: 77 },   // 48 x 77px
    xl: { height: 56, width: 90 },   // 56 x 90px
  };
  const currentPillSize = pillSizes[size as keyof typeof pillSizes] || pillSizes.md;

  return (
    <div className={cn("flex flex-wrap -m-1 p-1", currentSize.gap)} role="list" aria-label="Social media links">
      {links.map((social) => (
        <a
          key={social.name}
          href={social.href}
          className={cn(
            "flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
            currentSize.container,
            currentShape,
            currentHover,
            currentBg
          )}
          style={{
            color: getColor(social.color),
            ...(isPill && {
              width: `${currentPillSize.width}px`,
              height: `${currentPillSize.height}px`,
              padding: 0,  // Override padding, use explicit dimensions
            }),
          }}
          aria-label={`Follow us on ${social.name}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <social.icon className={currentSize.icon} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

// Trust badges component
function TrustBadges({
  badges,
}: {
  badges: { image: string; alt: string; url?: string }[];
}) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4" role="list" aria-label="Trust badges">
      {badges.map((badge, index) => {
        const badgeImage = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={badge.image}
            alt={badge.alt}
            className="h-10 w-auto max-w-25 object-contain opacity-70 transition-opacity hover:opacity-100"
          />
        );

        if (badge.url) {
          return (
            <a
              key={index}
              href={badge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {badgeImage}
            </a>
          );
        }

        return <span key={index} role="listitem">{badgeImage}</span>;
      })}
    </div>
  );
}

// Background pattern component
function BackgroundPattern({
  pattern,
  color,
  opacity,
}: {
  pattern: string;
  color: string;
  opacity: number;
}) {
  const patterns: Record<string, string> = {
    dots: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    diagonal: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${color} 10px, ${color} 11px)`,
    waves: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath d='M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1'/%3E%3C/svg%3E")`,
    noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
  };

  const patternSizes: Record<string, string> = {
    dots: "20px 20px",
    grid: "20px 20px, 20px 20px",
    diagonal: "auto",
    waves: "100px 20px",
    noise: "200px 200px",
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: patterns[pattern] || patterns.dots,
        backgroundSize: patternSizes[pattern] || "20px 20px",
        opacity: opacity / 100,
      }}
      aria-hidden="true"
    />
  );
}

// Widget renderer component
function FooterWidgetRenderer({
  widget,
  businessConfig,
  socialLinks,
  footerConfig,
  headingClasses,
  linkClasses,
  logoUrl,
}: {
  widget: FooterWidget;
  businessConfig: ReturnType<typeof useBusinessConfig>["config"];
  socialLinks: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
  footerConfig?: PublicFooterResponse | null;
  headingClasses?: string;
  linkClasses?: string;
  logoUrl?: string;
}) {
  const links = getWidgetLinks(widget);

  // Extract content from widget for BRAND type
  const brandContent = widget.content as {
    showTagline?: boolean;
    tagline?: string;
    subtitle?: string;
    showCTA?: boolean;
    ctaText?: string;
    ctaUrl?: string;
    ctaIcon?: string;
    secondaryCTA?: boolean;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    showContact?: boolean;
    showSocial?: boolean;
    logoMode?: "auto" | "light" | "dark";
  } | null;

  // Determine effective logo URL based on logoMode setting
  const getEffectiveLogoUrl = () => {
    const logoMode = brandContent?.logoMode || "auto";
    if (logoMode === "light") {
      return businessConfig.logo.url;
    }
    if (logoMode === "dark") {
      return businessConfig.logo.darkUrl || businessConfig.logo.url;
    }
    // Auto: use passed logoUrl (dark mode) or fallback to regular url
    return logoUrl || businessConfig.logo.url;
  };
  const effectiveLogoUrl = getEffectiveLogoUrl();

  switch (widget.type) {
    case "BRAND":
      // Use custom tagline from preset or fallback to business description
      const tagline = brandContent?.tagline || businessConfig.description;
      const subtitle = brandContent?.subtitle;
      const showContact = brandContent?.showContact !== false; // Default true
      const showSocial = brandContent?.showSocial !== false; // Default true (but controlled by separate SOCIAL widget usually)
      const showCTA = brandContent?.showCTA;

      return (
        <div className="space-y-4">
          {/* Logo only - no business name text (aligned with column headings) */}
          <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded">
            {effectiveLogoUrl ? (
              <Image
                src={effectiveLogoUrl}
                alt={businessConfig.name}
                width={160}
                height={48}
                className="h-12 w-auto rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">
                  {businessConfig.logo.text || businessConfig.name.charAt(0)}
                </span>
              </div>
            )}
          </Link>

          {/* Tagline / Description */}
          {tagline && (
            <p className="max-w-xs text-sm opacity-80">
              {tagline}
            </p>
          )}

          {/* Subtitle (for hero-style footers) */}
          {subtitle && (
            <p className="max-w-md text-xs opacity-60">
              {subtitle}
            </p>
          )}

          {/* CTA Buttons (from preset) */}
          {showCTA && brandContent?.ctaText && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href={brandContent.ctaUrl || "#"}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {brandContent.ctaIcon === "sparkles" && <Sparkles className="h-4 w-4" />}
                {brandContent.ctaText}
              </Link>
              {brandContent.secondaryCTA && brandContent.secondaryCtaText && (
                <Link
                  href={brandContent.secondaryCtaUrl || "#"}
                  className="inline-flex items-center gap-2 rounded-lg border border-current px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  {brandContent.secondaryCtaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {/* Contact Info - only show if enabled and not using separate CONTACT widget */}
          {showContact && (businessConfig.contact.supportEmail || businessConfig.contact.phone || businessConfig.address.full) && (
            <address className="space-y-2 not-italic pt-2">
              {businessConfig.contact.supportEmail && (
                <a
                  href={`mailto:${businessConfig.contact.supportEmail}`}
                  className={cn("flex items-center gap-2 text-sm", linkClasses)}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {businessConfig.contact.supportEmail}
                </a>
              )}
              {businessConfig.contact.phone && (
                <a
                  href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                  className={cn("flex items-center gap-2 text-sm", linkClasses)}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {businessConfig.contact.phone}
                </a>
              )}
              {businessConfig.address.full && (
                <p className="flex items-start gap-2 text-sm opacity-80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {businessConfig.address.full}
                </p>
              )}
            </address>
          )}
        </div>
      );

    case "LINKS":
      return (
        <nav aria-label={widget.title || "Footer links"}>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  className={cn("text-sm", linkClasses)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      );

    case "CONTACT":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <address className={cn("not-italic", widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3")}>
            {businessConfig.contact.supportEmail && (
              <a
                href={`mailto:${businessConfig.contact.supportEmail}`}
                className={cn("flex items-center gap-2 text-sm", linkClasses)}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {businessConfig.contact.supportEmail}
              </a>
            )}
            {businessConfig.contact.phone && (
              <a
                href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                className={cn("flex items-center gap-2 text-sm", linkClasses)}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {businessConfig.contact.phone}
              </a>
            )}
            {businessConfig.address.full && (
              <p className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {businessConfig.address.full}
              </p>
            )}
          </address>
        </div>
      );

    case "SOCIAL":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <EnhancedSocialLinks
              links={socialLinks}
              shape={footerConfig?.social?.shape}
              size={footerConfig?.social?.size}
              colorMode={footerConfig?.social?.colorMode}
              hoverEffect={footerConfig?.social?.hoverEffect}
              accentColor={footerConfig?.styling?.accentColor || undefined}
              bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
            />
          </div>
        </div>
      );

    case "TEXT":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <p className="text-sm opacity-80">
              {(widget.content as { text?: string })?.text || ""}
            </p>
          </div>
        </div>
      );

    case "NEWSLETTER":
      // Extract newsletter content from widget
      const nlContent = widget.content as { subtitle?: string; incentive?: string; buttonText?: string; style?: string } | null;
      return (
        <div>
          <EnhancedNewsletterForm
            title={widget.showTitle ? (widget.title ?? undefined) : undefined}
            subtitle={nlContent?.subtitle || nlContent?.incentive || footerConfig?.newsletter?.subtitle}
            formAction={footerConfig?.newsletter?.formAction}
            accentColor={footerConfig?.styling?.accentColor || undefined}
            borderColor={footerConfig?.styling?.borderColor || undefined}
            textColor={footerConfig?.styling?.textColor || undefined}
            style={nlContent?.style as "inline" | "stacked" | "floating" | undefined}
            buttonText={nlContent?.buttonText || "Subscribe"}
          />
        </div>
      );

    case "SERVICES":
      return (
        <nav aria-label="Services">
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {fallbackLinks.services.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn("text-sm", linkClasses)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      );

    case "STATES":
      return (
        <nav aria-label="Popular states">
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {fallbackLinks.states.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn("text-sm", linkClasses)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      );

    case "RECENT_POSTS":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            <p className="text-sm opacity-80">
              Visit our <Link href="/blog" className={linkClasses}>blog</Link> for the latest articles.
            </p>
          </div>
        </div>
      );

    case "CUSTOM_HTML":
      const htmlContent = (widget.content as { html?: string })?.html || "";
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div
            className={widget.showTitle && widget.title ? "mt-4 prose prose-sm" : "prose prose-sm"}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      );

    case "BUTTON":
      const buttonContent = widget.content as {
        text?: string;
        url?: string;
        target?: "_self" | "_blank";
        openInNewTab?: boolean;
        style?: ButtonCustomStyle;
      } | null;

      const buttonText = buttonContent?.text || "Click Here";
      const buttonUrl = buttonContent?.url || "#";
      const buttonOpenInNewTab = buttonContent?.openInNewTab ?? buttonContent?.target === "_blank";
      const buttonStyle = buttonContent?.style || {};

      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className={headingClasses}>{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <FooterButton
              text={buttonText}
              url={buttonUrl}
              style={buttonStyle}
              openInNewTab={buttonOpenInNewTab}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function Footer() {
  const { config: businessConfig } = useBusinessConfig();
  const { config: footerConfig, isLoading: isConfigLoading } = useFooterConfig();
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Handle entrance animation
  useEffect(() => {
    // Wait for config to load before deciding on animation
    if (isConfigLoading) return;

    const shouldAnimate = footerConfig?.styling?.enableAnimations && !prefersReducedMotion.current;

    // If animations disabled or already animated, show immediately
    if (!shouldAnimate || hasAnimated) {
      setIsVisible(true);
      return;
    }

    // Reset visibility when animation is enabled (for config changes)
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay to ensure initial state is rendered first
          requestAnimationFrame(() => {
            setIsVisible(true);
            setHasAnimated(true);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.05 } // Trigger earlier (5% visible)
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [footerConfig?.styling?.enableAnimations, isConfigLoading, hasAnimated]);

  // Use dark logo for footer (dark backgrounds) if available, otherwise use regular logo
  const footerLogoUrl = businessConfig.logo.darkUrl || businessConfig.logo.url;

  // Build social links from config with brand colors
  const socialLinks = useMemo(
    () =>
      [
        { name: "Facebook", href: businessConfig.social.facebook, icon: Facebook, color: "#1877F2" },
        { name: "Twitter", href: businessConfig.social.twitter, icon: Twitter, color: "#1DA1F2" },
        { name: "LinkedIn", href: businessConfig.social.linkedin, icon: Linkedin, color: "#0A66C2" },
        { name: "Instagram", href: businessConfig.social.instagram, icon: Instagram, color: "#E4405F" },
        { name: "YouTube", href: businessConfig.social.youtube, icon: Youtube, color: "#FF0000" },
        { name: "TikTok", href: businessConfig.social.tiktok, icon: TikTokIcon, color: "#00f2ea" },
      ].filter((link) => link.href),
    [businessConfig.social]
  );

  // Process widgets by column
  const widgetsByColumn = useMemo(() => {
    if (!footerConfig?.widgets || footerConfig.widgets.length === 0) {
      return null;
    }
    const columns: Record<number, FooterWidget[]> = {};
    for (let i = 1; i <= (footerConfig?.columns || 6); i++) {
      columns[i] = getWidgetsByColumn(footerConfig.widgets, i);
    }
    return columns;
  }, [footerConfig?.widgets, footerConfig?.columns]);

  // Get all widgets as flat array
  const allWidgets = useMemo(() => {
    return footerConfig?.widgets || [];
  }, [footerConfig?.widgets]);

  // Get styling from footer config
  const styling = footerConfig?.styling;

  // Build background style
  const getBackgroundStyle = (): React.CSSProperties => {
    const bgType = styling?.bgType || "solid";

    // Solid color background
    if (bgType === "solid" && styling?.bgColor) {
      return { backgroundColor: styling.bgColor };
    }

    // Gradient background
    if (bgType === "gradient" && styling?.bgGradient) {
      const gradient = styling.bgGradient;
      const colors = gradient.colors?.map((c: { color: string; position: number }) => `${c.color} ${c.position}%`).join(", ");
      if (colors) {
        return {
          background: `linear-gradient(${gradient.angle || 135}deg, ${colors})`,
        };
      }
    }

    // Pattern background - use bgColor as base, pattern overlay is rendered separately
    if (bgType === "pattern") {
      return { backgroundColor: styling?.bgColor || "#0f172a" };
    }

    // Image background
    if (bgType === "image" && styling?.bgImage) {
      const overlay = styling?.bgImageOverlay || "rgba(0,0,0,0.5)";
      return {
        backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${styling.bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    return {};
  };

  // Build heading classes based on typography settings
  const headingClasses = cn(
    "font-medium footer-heading",
    styling?.headingSize === "sm" && "text-sm",
    styling?.headingSize === "base" && "text-base",
    styling?.headingSize === "lg" && "text-lg",
    styling?.headingSize === "xl" && "text-xl",
    styling?.headingWeight === "medium" && "font-medium",
    styling?.headingWeight === "semibold" && "font-semibold",
    styling?.headingWeight === "bold" && "font-bold",
    styling?.headingStyle === "uppercase" && "uppercase tracking-wider",
    styling?.headingStyle === "capitalize" && "capitalize"
  );

  // Build link classes based on hover effect
  const linkClasses = cn(
    "footer-link transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded",
    styling?.linkHoverEffect === "underline" && "hover:underline",
    styling?.linkHoverEffect === "slide" && "relative after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-current hover:after:w-full after:transition-all",
    styling?.linkHoverEffect === "highlight" && "hover:bg-current/10 hover:px-2 hover:-mx-2 rounded"
  );

  // Animation classes (respects prefers-reduced-motion)
  const shouldAnimate = styling?.enableAnimations && !prefersReducedMotion.current;
  const entranceAnimation = styling?.entranceAnimation || "fade-up";

  // Get initial animation state based on animation type
  const getInitialAnimationClasses = () => {
    if (!shouldAnimate || isVisible) return "";
    switch (entranceAnimation) {
      case "none":
        return "";
      case "fade-in":
        return "opacity-0";
      case "slide-up":
        return "opacity-0 translate-y-20"; // 80px slide for noticeable effect
      case "fade-up":
      default:
        return "opacity-0 translate-y-8";
    }
  };

  const animationClasses = cn(
    "transition-all",
    shouldAnimate && !isVisible && getInitialAnimationClasses(),
    shouldAnimate && isVisible && "opacity-100 translate-y-0"
  );

  const animationDuration = styling?.animationDuration || 300;

  // Determine if we're using boxed container
  const isBoxed = styling?.containerWidth === "boxed";
  const isRound = styling?.containerStyle === "round";

  // Build corner radius style
  const cornerRadiusStyle = isRound ? {
    borderTopLeftRadius: `${styling?.cornerRadiusTL || 0}px`,
    borderTopRightRadius: `${styling?.cornerRadiusTR || 0}px`,
    borderBottomLeftRadius: `${styling?.cornerRadiusBL || 0}px`,
    borderBottomRightRadius: `${styling?.cornerRadiusBR || 0}px`,
  } : {};

  const footerStyle: React.CSSProperties & { [key: string]: string | number | undefined } = {
    ...getBackgroundStyle(),
    ...(styling?.textColor && { color: styling.textColor }),
    paddingTop: `${styling?.paddingTop || 48}px`,
    paddingBottom: `${styling?.paddingBottom || 32}px`,
    // Only apply border radius if containerStyle is "round" (uses individual corners)
    // When "sharp", no border radius at all
    ...(isRound && cornerRadiusStyle),
    ...(styling?.shadow && styling.shadow !== "none" && {
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
      }[styling.shadow],
    }),
    transition: shouldAnimate ? `all ${animationDuration}ms ease-out` : undefined,
    // CSS custom properties for dynamic colors
    "--footer-link-color": styling?.linkColor || "inherit",
    "--footer-link-hover-color": styling?.linkHoverColor || styling?.accentColor || "#22d3ee",
    "--footer-heading-color": styling?.headingColor || "inherit",
    "--footer-accent-color": styling?.accentColor || ORANGE_PRIMARY,
    "--footer-divider-color": styling?.dividerColor || styling?.borderColor || "#e5e7eb",
  };

  // Container class for boxed mode
  const containerClass = isBoxed ? "max-w-7xl mx-auto" : "";

  // If we have dynamic widgets, use them
  const hasDynamicWidgets = widgetsByColumn && Object.values(widgetsByColumn).some((w) => w.length > 0);

  // Get layout type
  const layout = footerConfig?.layout || "MULTI_COLUMN";

  // Top border component
  const TopBorder = () => {
    const borderStyle = styling?.topBorderStyle;
    if (!borderStyle || borderStyle === "none") return null;

    const height = styling?.topBorderHeight || 1;
    const color = styling?.topBorderColor || styling?.accentColor || ORANGE_PRIMARY;

    if (borderStyle === "gradient") {
      return (
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: `${height}px`,
            background: `linear-gradient(90deg, ${color}, ${color}66, ${color})`,
          }}
          aria-hidden="true"
        />
      );
    }

    if (borderStyle === "wave") {
      return (
        <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: `${height * 2}px` }} aria-hidden="true">
          <svg viewBox="0 0 1200 20" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,10 Q150,0 300,10 T600,10 T900,10 T1200,10 L1200,0 L0,0 Z"
              fill={color}
            />
          </svg>
        </div>
      );
    }

    return (
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${height}px`,
          backgroundColor: color,
        }}
        aria-hidden="true"
      />
    );
  };

  // Divider component
  const Divider = () => {
    const dividerStyle = styling?.dividerStyle;
    if (!dividerStyle || dividerStyle === "none") return null;

    const color = styling?.dividerColor || styling?.borderColor || "#e5e7eb";

    if (dividerStyle === "gradient") {
      return (
        <hr
          className="h-px my-8 border-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      );
    }

    return (
      <hr
        className="my-8 border-0"
        style={{
          borderTop: `1px ${dividerStyle} ${color}`,
        }}
      />
    );
  };

  // Bottom bar component (shared across layouts)
  const BottomBar = () => (
    footerConfig?.bottomBar?.enabled !== false ? (
      <>
        <Divider />
        <div
          className={cn(
            "flex gap-4",
            footerConfig?.bottomBar?.layout === "centered" && "flex-col items-center text-center",
            footerConfig?.bottomBar?.layout === "stacked" && "flex-col items-center text-center",
            footerConfig?.bottomBar?.layout === "split" && "flex-col items-center justify-between md:flex-row"
          )}
        >
          <p className="text-sm opacity-80">
            {footerConfig?.bottomBar?.copyrightText ||
              `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}
          </p>
          {footerConfig?.bottomBar?.showDisclaimer && (
            <p className={`max-w-xl text-xs opacity-60 ${layout === "CENTERED" ? "" : "md:text-right"}`}>
              <strong>Disclaimer:</strong>{" "}
              {footerConfig?.bottomBar?.disclaimerText ||
                `${businessConfig.name} is not a law firm and does not provide legal advice.`}
            </p>
          )}
        </div>

        {/* Bottom Links */}
        {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
          <nav className={cn(
            "mt-4 flex flex-wrap gap-4",
            footerConfig?.bottomBar?.layout === "centered" ? "justify-center" : "justify-center md:justify-start"
          )} aria-label="Legal links">
            {footerConfig.bottomBar.links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className={cn("text-xs", linkClasses)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Trust Badges */}
        {footerConfig?.trustBadges?.show && footerConfig.trustBadges.badges?.length > 0 && (
          <div className="mt-6">
            <TrustBadges badges={footerConfig.trustBadges.badges} />
          </div>
        )}
      </>
    ) : null
  );

  // Dynamic CSS for footer colors (uses CSS custom properties from footerStyle)
  const FooterStyles = () => (
    <style>{`
      .footer-dynamic-styles .footer-link {
        color: var(--footer-link-color);
        transition: color 0.2s ease;
      }
      .footer-dynamic-styles .footer-link:hover {
        color: var(--footer-link-hover-color);
      }
      .footer-dynamic-styles .footer-heading {
        color: var(--footer-heading-color);
      }
    `}</style>
  );

  // ============== NEWSLETTER_HERO LAYOUT ==============
  if (layout === "NEWSLETTER_HERO") {
    // Find NEWSLETTER widget if exists - use its content for the hero section
    const newsletterWidget = allWidgets?.find(w => w.type === "NEWSLETTER");
    const newsletterContent = newsletterWidget?.content as {
      subtitle?: string;
      incentive?: string;
      buttonText?: string;
    } | null;

    // Get title from widget or fallback to config
    const heroTitle = newsletterWidget?.title || footerConfig?.newsletter?.title || "Stay in the loop";
    const heroSubtitle = newsletterContent?.subtitle || newsletterContent?.incentive ||
      footerConfig?.newsletter?.subtitle || "Get the latest updates, tips, and exclusive offers delivered to your inbox.";

    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Large Newsletter Section - uses NEWSLETTER widget content if available */}
          <div className="max-w-2xl mx-auto text-center py-8">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: styling?.headingColor }}>
              {heroTitle}
            </h2>
            <p className="mt-4 text-lg opacity-80">
              {heroSubtitle}
            </p>
            <div className="mt-8">
              <EnhancedNewsletterForm
                formAction={footerConfig?.newsletter?.formAction}
                style="stacked"
                buttonStyle="gradient"
                accentColor={styling?.accentColor || undefined}
                borderColor={styling?.borderColor || undefined}
                textColor={styling?.textColor || undefined}
              />
            </div>
          </div>

          <Divider />

          {/* Widget Grid - excludes NEWSLETTER widget since it's shown in hero */}
          {hasDynamicWidgets && (
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {Object.entries(widgetsByColumn!)
                .filter(([, widgets]) => widgets.length > 0)
                .map(([column, colWidgets]) => (
                  <div key={column}>
                    {colWidgets
                      .filter(w => w.type !== "NEWSLETTER") // Exclude NEWSLETTER - shown in hero
                      .map((widget) => (
                        <FooterWidgetRenderer
                          key={widget.id}
                          widget={widget}
                          businessConfig={businessConfig}
                          socialLinks={socialLinks}
                          footerConfig={footerConfig}
                          headingClasses={headingClasses}
                          linkClasses={linkClasses}
                          logoUrl={footerLogoUrl}
                        />
                      ))}
                  </div>
                ))}
            </div>
          )}

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== STACKED LAYOUT ==============
  if (layout === "STACKED") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Brand Section */}
          <div className="flex flex-col items-center text-center py-8">
            <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-2xl font-bold" style={{ color: styling?.headingColor }}>
                {businessConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-md opacity-80">{businessConfig.description}</p>
          </div>

          <Divider />

          {/* Newsletter Section */}
          {footerConfig?.newsletter?.enabled && (
            <>
              <div className="max-w-md mx-auto py-6">
                <EnhancedNewsletterForm
                  title={footerConfig.newsletter.title}
                  subtitle={footerConfig.newsletter.subtitle}
                  formAction={footerConfig.newsletter.formAction}
                  accentColor={styling?.accentColor || undefined}
                  borderColor={styling?.borderColor || undefined}
                  textColor={styling?.textColor || undefined}
                />
              </div>
              <Divider />
            </>
          )}

          {/* Widget Grid */}
          {hasDynamicWidgets && (
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 py-6">
              {Object.entries(widgetsByColumn!)
                .filter(([, widgets]) => widgets.length > 0)
                .map(([column, widgets]) => (
                  <div key={column}>
                    {widgets.map((widget) => (
                      <FooterWidgetRenderer
                        key={widget.id}
                        widget={widget}
                        businessConfig={businessConfig}
                        socialLinks={socialLinks}
                        footerConfig={footerConfig}
                        headingClasses={headingClasses}
                        linkClasses={linkClasses}
                        logoUrl={footerLogoUrl}
                      />
                    ))}
                  </div>
                ))}
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center py-6">
              <EnhancedSocialLinks
                links={socialLinks}
                shape={footerConfig?.social?.shape}
                size={footerConfig?.social?.size}
                colorMode={footerConfig?.social?.colorMode}
                hoverEffect={footerConfig?.social?.hoverEffect}
                accentColor={styling?.accentColor || undefined}
                bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
              />
            </div>
          )}

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MINIMAL LAYOUT ==============
  if (layout === "MINIMAL") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="font-semibold">{businessConfig.name}</span>
            </Link>

            {/* Bottom Links inline */}
            {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
              <nav className="flex flex-wrap justify-center gap-4" aria-label="Footer links">
                {footerConfig.bottomBar.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className={cn("text-sm", linkClasses)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <EnhancedSocialLinks
                links={socialLinks}
                shape={footerConfig?.social?.shape}
                size={footerConfig?.social?.size}
                colorMode={footerConfig?.social?.colorMode}
                hoverEffect={footerConfig?.social?.hoverEffect}
                accentColor={styling?.accentColor || undefined}
                bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
              />
            )}
          </div>

          {/* Copyright */}
          <div className="mt-6 border-t pt-6 text-center" style={{ borderColor: styling?.borderColor }}>
            <p className="text-sm opacity-80">
              {footerConfig?.bottomBar?.copyrightText ||
                `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // ============== CENTERED LAYOUT ==============
  if (layout === "CENTERED") {
    const linkWidgets = allWidgets.filter(w => w.type === "LINKS");

    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Centered Logo & Description */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-primary rounded">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-2xl font-bold" style={{ color: styling?.headingColor }}>
                {businessConfig.name}
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm opacity-80">
              {businessConfig.description}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <EnhancedSocialLinks
                  links={socialLinks}
                  shape={footerConfig?.social?.shape}
                  size={footerConfig?.social?.size}
                  colorMode={footerConfig?.social?.colorMode}
                  hoverEffect={footerConfig?.social?.hoverEffect}
                  accentColor={styling?.accentColor || undefined}
                  bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
                />
              </div>
            )}
          </div>

          {/* Link sections in a row */}
          {linkWidgets.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-12">
              {linkWidgets.map((widget) => {
                const widgetLinks = getWidgetLinks(widget);
                return (
                  <nav key={widget.id} className="text-center" aria-label={widget.title || "Links"}>
                    {widget.showTitle && widget.title && (
                      <h3 className={headingClasses}>{widget.title}</h3>
                    )}
                    <ul className="mt-3 space-y-2">
                      {widgetLinks.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.url}
                            className={cn("text-sm", linkClasses)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                );
              })}
            </div>
          )}

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MEGA LAYOUT ==============
  if (layout === "MEGA" || layout === "MEGA_PLUS") {
    return (
      <footer
        ref={footerRef}
        className={cn("relative border-t overflow-hidden footer-dynamic-styles", animationClasses)}
        style={footerStyle}
        role="contentinfo"
      >
        <FooterStyles />
        <TopBorder />
        {styling?.bgType === "pattern" && styling.bgPattern && (
          <BackgroundPattern
            pattern={styling.bgPattern}
            color={styling.bgPatternColor || "#000"}
            opacity={styling.bgPatternOpacity || 10}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {/* Top section with logo and social */}
          <div className="flex flex-col items-start justify-between gap-8 border-b pb-10 md:flex-row md:items-center" style={{ borderColor: styling?.borderColor }}>
            <div className="flex items-center space-x-4">
              {footerLogoUrl ? (
                <Image
                  src={footerLogoUrl}
                  alt={businessConfig.name}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-primary">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold" style={{ color: styling?.headingColor }}>
                  {businessConfig.name}
                </span>
                <p className="text-sm opacity-80">{businessConfig.description}</p>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <EnhancedSocialLinks
                links={socialLinks}
                shape={footerConfig?.social?.shape}
                size={footerConfig?.social?.size}
                colorMode={footerConfig?.social?.colorMode}
                hoverEffect={footerConfig?.social?.hoverEffect}
                accentColor={styling?.accentColor || undefined}
                bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
              />
            )}
          </div>

          {/* Mega grid - more columns */}
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
            {hasDynamicWidgets ? (
              Object.entries(widgetsByColumn!)
                .filter(([, widgets]) => widgets.length > 0)
                .map(([column, widgets]) => (
                  <div key={column}>
                    {widgets.map((widget) => (
                      <FooterWidgetRenderer
                        key={widget.id}
                        widget={widget}
                        businessConfig={businessConfig}
                        socialLinks={socialLinks}
                        footerConfig={footerConfig}
                        headingClasses={headingClasses}
                        linkClasses={linkClasses}
                        logoUrl={footerLogoUrl}
                      />
                    ))}
                  </div>
                ))
            ) : (
              <>
                {/* Fallback columns */}
                <nav aria-label="Services">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Services</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.services.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Company">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Company</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Popular states">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Popular States</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.states.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav aria-label="Legal">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Legal</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className={cn("text-sm", linkClasses)}>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <address className="col-span-2 not-italic">
                  <h3 className={cn(headingClasses, "uppercase tracking-wider")}>Contact Us</h3>
                  <div className="mt-4 space-y-3">
                    {businessConfig.contact.supportEmail && (
                      <a href={`mailto:${businessConfig.contact.supportEmail}`} className={cn("flex items-center gap-2 text-sm", linkClasses)}>
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        {businessConfig.contact.supportEmail}
                      </a>
                    )}
                    {businessConfig.contact.phone && (
                      <a href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`} className={cn("flex items-center gap-2 text-sm", linkClasses)}>
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {businessConfig.contact.phone}
                      </a>
                    )}
                    {businessConfig.address.full && (
                      <p className="flex items-start gap-2 text-sm opacity-80">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {businessConfig.address.full}
                      </p>
                    )}
                  </div>
                </address>
              </>
            )}
          </div>

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MULTI_COLUMN LAYOUT (Default) ==============
  const footerElement = (
    <footer
      ref={footerRef}
      className={cn(
        "relative overflow-hidden footer-dynamic-styles",
        !isBoxed && "border-t",
        animationClasses
      )}
      style={footerStyle}
      role="contentinfo"
    >
      <FooterStyles />
      <TopBorder />
      {styling?.bgType === "pattern" && styling.bgPattern && (
        <BackgroundPattern
          pattern={styling.bgPattern}
          color={styling.bgPatternColor || "#000"}
          opacity={styling.bgPatternOpacity || 10}
        />
      )}
      <div className="container mx-auto px-4 relative z-10">
        {hasDynamicWidgets ? (
          (() => {
            const entries = Object.entries(widgetsByColumn!).filter(([, widgets]) => widgets.length > 0);
            const hasBrandWidget = entries.some(([, widgets]) => widgets.some((w) => w.type === "BRAND"));
            const desktopCols = hasBrandWidget ? entries.length + 1 : entries.length;

            return (
              <>
                <style>{`
                  .footer-grid {
                    display: grid;
                    gap: 2rem;
                    grid-template-columns: 1fr;
                  }
                  @media (min-width: 640px) {
                    .footer-grid {
                      grid-template-columns: repeat(2, 1fr);
                    }
                    .footer-grid .brand-col {
                      grid-column: span 2;
                    }
                  }
                  @media (min-width: 768px) {
                    .footer-grid {
                      grid-template-columns: repeat(3, 1fr);
                    }
                  }
                  @media (min-width: 1024px) {
                    .footer-grid {
                      grid-template-columns: repeat(${desktopCols}, 1fr);
                    }
                    .footer-grid .brand-col {
                      grid-column: span 2;
                    }
                  }
                `}</style>
                <div className="footer-grid">
                  {entries.map(([column, widgets]) => {
                    const isBrand = widgets.some((w) => w.type === "BRAND");
                    return (
                      <div
                        key={column}
                        className={`min-w-0 break-words space-y-6 ${isBrand ? "brand-col" : ""}`}
                      >
                        {widgets.map((widget) => (
                          <FooterWidgetRenderer
                            key={widget.id}
                            widget={widget}
                            businessConfig={businessConfig}
                            socialLinks={socialLinks}
                            footerConfig={footerConfig}
                            headingClasses={headingClasses}
                            linkClasses={linkClasses}
                            logoUrl={footerLogoUrl}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()
        ) : (
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {/* Brand - Logo only, aligned with column headings */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded mb-4">
                {footerLogoUrl ? (
                  <Image
                    src={footerLogoUrl}
                    alt={businessConfig.name}
                    width={160}
                    height={48}
                    className="h-12 w-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                    <span className="text-xl font-bold text-primary-foreground">
                      {businessConfig.logo.text || businessConfig.name.charAt(0)}
                    </span>
                  </div>
                )}
              </Link>
              <p className="max-w-xs text-sm opacity-80">
                {businessConfig.description}
              </p>

              <address className="mt-6 space-y-3 not-italic">
                {businessConfig.contact.supportEmail && (
                  <a
                    href={`mailto:${businessConfig.contact.supportEmail}`}
                    className={cn("flex items-center gap-2 text-sm", linkClasses)}
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {businessConfig.contact.supportEmail}
                  </a>
                )}
                {businessConfig.contact.phone && (
                  <a
                    href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                    className={cn("flex items-center gap-2 text-sm", linkClasses)}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {businessConfig.contact.phone}
                  </a>
                )}
                {businessConfig.address.full && (
                  <p className="flex items-start gap-2 text-sm opacity-80">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {businessConfig.address.full}
                  </p>
                )}
              </address>

              <div className="mt-6">
                <EnhancedSocialLinks
                  links={socialLinks}
                  shape={footerConfig?.social?.shape}
                  size={footerConfig?.social?.size}
                  colorMode={footerConfig?.social?.colorMode}
                  hoverEffect={footerConfig?.social?.hoverEffect}
                  accentColor={styling?.accentColor || undefined}
                  bgStyle={footerConfig?.social?.bgStyle as "none" | "subtle" | "solid" | "outline" | undefined}
                />
              </div>
            </div>

            {/* Fallback columns */}
            <nav aria-label="Services">
              <h3 className={headingClasses}>Services</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Company">
              <h3 className={headingClasses}>Company</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Popular states">
              <h3 className={headingClasses}>Popular States</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.states.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal">
              <h3 className={headingClasses}>Legal</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={cn("text-sm", linkClasses)}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        <BottomBar />
      </div>
    </footer>
  );

  // Wrap in container if boxed mode
  if (isBoxed) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {footerElement}
      </div>
    );
  }

  return footerElement;
}
