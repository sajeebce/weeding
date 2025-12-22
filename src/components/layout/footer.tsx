"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
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
} from "lucide-react";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useFooterConfig, getWidgetsByColumn, getWidgetLinks } from "@/hooks/use-footer-config";
import type { FooterWidget, PublicFooterResponse } from "@/lib/header-footer/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
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

// Newsletter form component
function NewsletterForm({
  title,
  subtitle,
  formAction,
}: {
  title?: string;
  subtitle?: string;
  formAction?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      if (formAction) {
        // Custom form action
        const response = await fetch(formAction, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error("Subscription failed");
      } else {
        // Default API endpoint
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

  return (
    <div>
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={status === "loading" || status === "success"}
          required
        />
        <Button type="submit" size="icon" disabled={status === "loading" || status === "success"}>
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-sm text-green-600">Successfully subscribed!</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-destructive">Failed to subscribe. Please try again.</p>
      )}
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
    <div className="flex flex-wrap items-center justify-center gap-4">
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
              className="inline-flex"
            >
              {badgeImage}
            </a>
          );
        }

        return <span key={index}>{badgeImage}</span>;
      })}
    </div>
  );
}

// Widget renderer component
function FooterWidgetRenderer({
  widget,
  businessConfig,
  socialLinks,
  footerConfig,
}: {
  widget: FooterWidget;
  businessConfig: ReturnType<typeof useBusinessConfig>["config"];
  socialLinks: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; color: string }[];
  footerConfig?: PublicFooterResponse | null;
}) {
  const links = getWidgetLinks(widget);

  switch (widget.type) {
    case "BRAND":
      return (
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <Link href="/" className="flex items-center space-x-2">
            {businessConfig.logo.url ? (
              <Image
                src={businessConfig.logo.url}
                alt={businessConfig.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">
                  {businessConfig.logo.text || businessConfig.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xl font-bold">{businessConfig.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {businessConfig.description}
          </p>

          {/* Contact Info */}
          <div className="mt-6 space-y-3">
            {businessConfig.contact.supportEmail && (
              <a
                href={`mailto:${businessConfig.contact.supportEmail}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {businessConfig.contact.supportEmail}
              </a>
            )}
            {businessConfig.contact.phone && (
              <a
                href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {businessConfig.contact.phone}
              </a>
            )}
            {businessConfig.address.full && (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {businessConfig.address.full}
              </p>
            )}
          </div>

          {/* Social Links */}
          <div className="mt-6 flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="rounded-lg bg-muted p-2 transition-all hover:scale-110"
                style={{ color: social.color }}
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      );

    case "LINKS":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.url}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );

    case "CONTACT":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {businessConfig.contact.supportEmail && (
              <a
                href={`mailto:${businessConfig.contact.supportEmail}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {businessConfig.contact.supportEmail}
              </a>
            )}
            {businessConfig.contact.phone && (
              <a
                href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {businessConfig.contact.phone}
              </a>
            )}
            {businessConfig.address.full && (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {businessConfig.address.full}
              </p>
            )}
          </div>
        </div>
      );

    case "SOCIAL":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4 flex flex-wrap gap-3" : "flex flex-wrap gap-3"}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="rounded-lg bg-muted p-2 transition-all hover:scale-110"
                style={{ color: social.color }}
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      );

    case "TEXT":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4" : ""}>
            <p className="text-sm text-muted-foreground">
              {(widget.content as { text?: string })?.text || ""}
            </p>
          </div>
        </div>
      );

    case "NEWSLETTER":
      return (
        <div>
          <NewsletterForm
            title={widget.showTitle ? (widget.title ?? undefined) : undefined}
            subtitle={footerConfig?.newsletter?.subtitle}
            formAction={footerConfig?.newsletter?.formAction}
          />
        </div>
      );

    case "SERVICES":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {fallbackLinks.services.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );

    case "STATES":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <ul className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            {fallbackLinks.states.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );

    case "RECENT_POSTS":
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <div className={widget.showTitle && widget.title ? "mt-4 space-y-3" : "space-y-3"}>
            <p className="text-sm text-muted-foreground">
              Visit our <Link href="/blog" className="text-primary hover:underline">blog</Link> for the latest articles.
            </p>
          </div>
        </div>
      );

    case "CUSTOM_HTML":
      const htmlContent = (widget.content as { html?: string })?.html || "";
      return (
        <div>
          {widget.showTitle && widget.title && (
            <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
          )}
          <div
            className={widget.showTitle && widget.title ? "mt-4 prose prose-sm" : "prose prose-sm"}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      );

    default:
      return null;
  }
}

export function Footer() {
  const { config: businessConfig } = useBusinessConfig();
  const { config: footerConfig } = useFooterConfig();

  // Build social links from config with brand colors
  const socialLinks = useMemo(
    () =>
      [
        { name: "Facebook", href: businessConfig.social.facebook, icon: Facebook, color: "#1877F2" },
        { name: "Twitter", href: businessConfig.social.twitter, icon: Twitter, color: "#1DA1F2" },
        { name: "LinkedIn", href: businessConfig.social.linkedin, icon: Linkedin, color: "#0A66C2" },
        { name: "Instagram", href: businessConfig.social.instagram, icon: Instagram, color: "#E4405F" },
        { name: "YouTube", href: businessConfig.social.youtube, icon: Youtube, color: "#FF0000" },
        { name: "TikTok", href: businessConfig.social.tiktok, icon: TikTokIcon, color: "#000000" },
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

  // Get all widgets as flat array for centered/mega layouts
  const allWidgets = useMemo(() => {
    return footerConfig?.widgets || [];
  }, [footerConfig?.widgets]);

  // Get styling from footer config
  const footerStyle = {
    ...(footerConfig?.styling?.bgColor && { backgroundColor: footerConfig.styling.bgColor }),
    ...(footerConfig?.styling?.textColor && { color: footerConfig.styling.textColor }),
    paddingTop: `${footerConfig?.styling?.paddingTop || 48}px`,
    paddingBottom: `${footerConfig?.styling?.paddingBottom || 32}px`,
  };

  // If we have dynamic widgets, use them
  const hasDynamicWidgets = widgetsByColumn && Object.values(widgetsByColumn).some((w) => w.length > 0);

  // Get layout type
  const layout = footerConfig?.layout || "MULTI_COLUMN";

  // Bottom bar component (shared across layouts)
  const BottomBar = () => (
    footerConfig?.bottomBar?.enabled !== false ? (
      <div
        className="mt-12 border-t pt-8"
        style={{ paddingBottom: `${footerConfig?.styling?.paddingBottom || 32}px` }}
      >
        <div className={`flex flex-col items-center justify-between gap-4 ${layout === "CENTERED" ? "" : "md:flex-row"}`}>
          <p className="text-sm text-muted-foreground">
            {footerConfig?.bottomBar?.copyrightText ||
              `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}
          </p>
          {footerConfig?.bottomBar?.showDisclaimer && (
            <p className={`max-w-xl text-center text-xs text-muted-foreground ${layout === "CENTERED" ? "" : "md:text-right"}`}>
              <strong>Disclaimer:</strong>{" "}
              {footerConfig?.bottomBar?.disclaimerText ||
                `${businessConfig.name} is not a law firm and does not provide legal advice. The information provided is for general informational purposes only.`}
            </p>
          )}
        </div>

        {/* Bottom Links */}
        {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
          <div className={`mt-4 flex flex-wrap gap-4 ${layout === "CENTERED" ? "justify-center" : "justify-center md:justify-start"}`}>
            {footerConfig.bottomBar.links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        {footerConfig?.trustBadges?.show && footerConfig.trustBadges.badges.length > 0 && (
          <div className="mt-6">
            <TrustBadges badges={footerConfig.trustBadges.badges} />
          </div>
        )}
      </div>
    ) : null
  );

  // ============== MINIMAL LAYOUT ==============
  // Just copyright and links - no widgets shown
  if (layout === "MINIMAL") {
    return (
      <footer className="border-t bg-muted/30" style={footerConfig?.styling?.bgColor ? footerStyle : undefined}>
        <div
          className="container mx-auto px-4"
          style={{ paddingTop: `${footerConfig?.styling?.paddingTop || 24}px` }}
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Logo */}
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
                  <span className="text-sm font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="font-semibold">{businessConfig.name}</span>
            </Link>

            {/* Bottom Links inline */}
            {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                {footerConfig.bottomBar.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="transition-all hover:scale-110"
                    style={{ color: social.color }}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Copyright */}
          <div
            className="mt-6 border-t pt-6 text-center"
            style={{ paddingBottom: `${footerConfig?.styling?.paddingBottom || 24}px` }}
          >
            <p className="text-sm text-muted-foreground">
              {footerConfig?.bottomBar?.copyrightText ||
                `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // ============== CENTERED LAYOUT ==============
  // Logo centered, then links in a row, all centered
  if (layout === "CENTERED") {
    // Get link widgets for centered display
    const linkWidgets = allWidgets.filter(w => w.type === "LINKS");

    return (
      <footer className="border-t bg-muted/30" style={footerConfig?.styling?.bgColor ? footerStyle : undefined}>
        <div
          className="container mx-auto px-4"
          style={{ paddingTop: `${footerConfig?.styling?.paddingTop || 48}px` }}
        >
          {/* Centered Logo & Description */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center space-x-2">
              {businessConfig.logo.url ? (
                <Image
                  src={businessConfig.logo.url}
                  alt={businessConfig.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-2xl font-bold">{businessConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {businessConfig.description}
            </p>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="rounded-lg bg-muted p-2 transition-all hover:scale-110"
                    style={{ color: social.color }}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link sections in a row */}
          {linkWidgets.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-12">
              {linkWidgets.map((widget) => {
                const links = getWidgetLinks(widget);
                return (
                  <div key={widget.id} className="text-center">
                    {widget.showTitle && widget.title && (
                      <h3 className="text-sm font-semibold text-foreground">{widget.title}</h3>
                    )}
                    <ul className="mt-3 space-y-2">
                      {links.map((link) => (
                        <li key={link.id}>
                          <Link
                            href={link.url}
                            className="text-sm text-muted-foreground hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
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
  // Full sitemap style - all widgets displayed with more space
  if (layout === "MEGA") {
    return (
      <footer className="border-t bg-muted/30" style={footerConfig?.styling?.bgColor ? footerStyle : undefined}>
        <div
          className="container mx-auto px-4"
          style={{ paddingTop: `${footerConfig?.styling?.paddingTop || 48}px` }}
        >
          {/* Top section with logo and newsletter */}
          <div className="flex flex-col items-start justify-between gap-8 border-b pb-10 md:flex-row md:items-center">
            <div className="flex items-center space-x-3">
              {businessConfig.logo.url ? (
                <Image
                  src={businessConfig.logo.url}
                  alt={businessConfig.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xl font-bold text-primary-foreground">
                    {businessConfig.logo.text || businessConfig.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold">{businessConfig.name}</span>
                <p className="text-sm text-muted-foreground">{businessConfig.description}</p>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="rounded-full bg-muted p-3 transition-all hover:scale-110"
                    style={{ color: social.color }}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
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
                      />
                    ))}
                  </div>
                ))
            ) : (
              <>
                {/* Services */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Services</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.services.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Company */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Company</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* States */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Popular States</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.states.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Legal */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Legal</h3>
                  <ul className="mt-4 space-y-3">
                    {fallbackLinks.legal.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Contact */}
                <div className="col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contact Us</h3>
                  <div className="mt-4 space-y-3">
                    {businessConfig.contact.supportEmail && (
                      <a href={`mailto:${businessConfig.contact.supportEmail}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <Mail className="h-4 w-4" />
                        {businessConfig.contact.supportEmail}
                      </a>
                    )}
                    {businessConfig.contact.phone && (
                      <a href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <Phone className="h-4 w-4" />
                        {businessConfig.contact.phone}
                      </a>
                    )}
                    {businessConfig.address.full && (
                      <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {businessConfig.address.full}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <BottomBar />
        </div>
      </footer>
    );
  }

  // ============== MULTI_COLUMN LAYOUT (Default) ==============
  return (
    <footer className="border-t bg-muted/30" style={footerConfig?.styling?.bgColor ? footerStyle : undefined}>
      <div
        className="container mx-auto px-4"
        style={{ paddingTop: `${footerConfig?.styling?.paddingTop || 48}px` }}
      >
        {hasDynamicWidgets ? (
          // Dynamic widgets layout - responsive grid
          (() => {
            const entries = Object.entries(widgetsByColumn!).filter(([, widgets]) => widgets.length > 0);
            const hasBrandWidget = entries.some(([, widgets]) => widgets.some((w) => w.type === "BRAND"));
            // Calculate grid columns: BRAND takes 2 cols on desktop, others take 1 each
            const desktopCols = hasBrandWidget ? entries.length + 1 : entries.length;

            return (
              <>
                {/* Inject responsive CSS for this specific grid */}
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
                        className={`min-w-0 overflow-hidden break-words ${isBrand ? "brand-col" : ""}`}
                      >
                        {widgets.map((widget) => (
                          <FooterWidgetRenderer
                            key={widget.id}
                            widget={widget}
                            businessConfig={businessConfig}
                            socialLinks={socialLinks}
                            footerConfig={footerConfig}
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
          // Fallback hardcoded layout
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2">
                {businessConfig.logo.url ? (
                  <Image
                    src={businessConfig.logo.url}
                    alt={businessConfig.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                    <span className="text-lg font-bold text-primary-foreground">
                      {businessConfig.logo.text || businessConfig.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-xl font-bold">{businessConfig.name}</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                {businessConfig.description}
              </p>

              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                {businessConfig.contact.supportEmail && (
                  <a
                    href={`mailto:${businessConfig.contact.supportEmail}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {businessConfig.contact.supportEmail}
                  </a>
                )}
                {businessConfig.contact.phone && (
                  <a
                    href={`tel:${businessConfig.contact.phone.replace(/[^+\d]/g, "")}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {businessConfig.contact.phone}
                  </a>
                )}
                {businessConfig.address.full && (
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {businessConfig.address.full}
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-6 flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="rounded-lg bg-muted p-2 transition-all hover:scale-110"
                    style={{ color: social.color }}
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Services</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular States */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Popular States</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.states.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-3">
                {fallbackLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <BottomBar />
      </div>
    </footer>
  );
}
