"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { useFooterConfig, getWidgetsByColumn, getWidgetLinks } from "@/hooks/use-footer-config";
import type { FooterWidget } from "@/lib/header-footer/types";

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

// Widget renderer component
function FooterWidgetRenderer({
  widget,
  businessConfig,
  socialLinks,
}: {
  widget: FooterWidget;
  businessConfig: ReturnType<typeof useBusinessConfig>["config"];
  socialLinks: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
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
          <div className="mt-6 flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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
          <div className={widget.showTitle && widget.title ? "mt-4 flex gap-4" : "flex gap-4"}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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

    default:
      return null;
  }
}

export function Footer() {
  const { config: businessConfig } = useBusinessConfig();
  const { config: footerConfig } = useFooterConfig();

  // Build social links from config
  const socialLinks = useMemo(
    () =>
      [
        { name: "Facebook", href: businessConfig.social.facebook, icon: Facebook },
        { name: "Twitter", href: businessConfig.social.twitter, icon: Twitter },
        { name: "LinkedIn", href: businessConfig.social.linkedin, icon: Linkedin },
        { name: "Instagram", href: businessConfig.social.instagram, icon: Instagram },
        { name: "YouTube", href: businessConfig.social.youtube, icon: Youtube },
        { name: "TikTok", href: businessConfig.social.tiktok, icon: TikTokIcon },
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

  // Get styling from footer config
  const footerStyle = {
    ...(footerConfig?.styling?.bgColor && { backgroundColor: footerConfig.styling.bgColor }),
    ...(footerConfig?.styling?.textColor && { color: footerConfig.styling.textColor }),
    paddingTop: `${footerConfig?.styling?.paddingTop || 48}px`,
    paddingBottom: `${footerConfig?.styling?.paddingBottom || 32}px`,
  };

  // If we have dynamic widgets, use them
  const hasDynamicWidgets = widgetsByColumn && Object.values(widgetsByColumn).some((w) => w.length > 0);

  return (
    <footer className="border-t bg-muted/30" style={footerConfig?.styling?.bgColor ? footerStyle : undefined}>
      <div
        className="container mx-auto px-4"
        style={{ paddingTop: `${footerConfig?.styling?.paddingTop || 48}px` }}
      >
        {hasDynamicWidgets ? (
          // Dynamic widgets layout
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns: `repeat(${footerConfig?.columns || 6}, minmax(0, 1fr))`,
            }}
          >
            {Object.entries(widgetsByColumn!).map(([column, widgets]) => (
              <div key={column} className={widgets.some((w) => w.type === "BRAND") ? "col-span-2" : ""}>
                {widgets.map((widget) => (
                  <FooterWidgetRenderer
                    key={widget.id}
                    widget={widget}
                    businessConfig={businessConfig}
                    socialLinks={socialLinks}
                  />
                ))}
              </div>
            ))}
          </div>
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
              <div className="mt-6 flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
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

        {/* Bottom Bar */}
        {footerConfig?.bottomBar?.enabled !== false && (
          <div
            className="mt-12 border-t pt-8"
            style={{ paddingBottom: `${footerConfig?.styling?.paddingBottom || 32}px` }}
          >
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground">
                {footerConfig?.bottomBar?.copyrightText ||
                  `© ${new Date().getFullYear()} ${businessConfig.name}. All rights reserved.`}
              </p>
              {footerConfig?.bottomBar?.showDisclaimer && (
                <p className="max-w-xl text-center text-xs text-muted-foreground md:text-right">
                  <strong>Disclaimer:</strong>{" "}
                  {footerConfig?.bottomBar?.disclaimerText ||
                    `${businessConfig.name} is not a law firm and does not provide legal advice. The information provided is for general informational purposes only.`}
                </p>
              )}
            </div>

            {/* Bottom Links */}
            {footerConfig?.bottomBar?.links && footerConfig.bottomBar.links.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-4 md:justify-start">
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
          </div>
        )}
      </div>
    </footer>
  );
}
