"use client";

import Link from "next/link";
import Image from "next/image";
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

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const footerLinks = {
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

export function Footer() {
  const { config } = useBusinessConfig();

  // Build social links from config
  const socialLinks = [
    { name: "Facebook", href: config.social.facebook, icon: Facebook },
    { name: "Twitter", href: config.social.twitter, icon: Twitter },
    { name: "LinkedIn", href: config.social.linkedin, icon: Linkedin },
    { name: "Instagram", href: config.social.instagram, icon: Instagram },
    { name: "YouTube", href: config.social.youtube, icon: Youtube },
    { name: "TikTok", href: config.social.tiktok, icon: TikTokIcon },
  ].filter((link) => link.href); // Only show links that have URLs

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              {config.logo.url ? (
                <Image
                  src={config.logo.url}
                  alt={config.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <span className="text-lg font-bold text-primary-foreground">
                    {config.logo.text || config.name.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-xl font-bold">{config.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {config.description}
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              {config.contact.supportEmail && (
                <a
                  href={`mailto:${config.contact.supportEmail}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {config.contact.supportEmail}
                </a>
              )}
              {config.contact.phone && (
                <a
                  href={`tel:${config.contact.phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  {config.contact.phone}
                </a>
              )}
              {config.address.full && (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {config.address.full}
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
              {footerLinks.services.map((link) => (
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
              {footerLinks.company.map((link) => (
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
            <h3 className="text-sm font-semibold text-foreground">
              Popular States
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.states.map((link) => (
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
              {footerLinks.legal.map((link) => (
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

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {config.name}. All rights reserved.
            </p>
            <p className="max-w-xl text-center text-xs text-muted-foreground md:text-right">
              <strong>Disclaimer:</strong> {config.name} is not a law firm and does not
              provide legal advice. The information provided is for general
              informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
