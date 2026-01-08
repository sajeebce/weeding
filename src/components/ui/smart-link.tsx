"use client";

import Link from "next/link";
import { forwardRef } from "react";

interface SmartLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  openInNewTab?: boolean;
  children: React.ReactNode;
}

/**
 * SmartLink - A unified link component that handles both internal and external URLs
 *
 * - Internal URLs (starting with / or relative): Uses Next.js Link for client-side navigation
 * - External URLs (http://, https://, mailto:, tel:, etc.): Uses regular <a> tag
 * - Supports openInNewTab option for all link types
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  ({ href, openInNewTab, children, className, ...props }, ref) => {
    // Check if URL is external or has a protocol
    // This catches: https://, http://, mailto:, tel:, #, and any malformed URLs like "https:"
    const isExternal = /^(https?:|mailto:|tel:|#|\/\/)/.test(href) ||
                       (href && !href.startsWith('/') && href.includes(':'));

    // Determine target and rel attributes
    const target = openInNewTab ? "_blank" : undefined;
    const rel = openInNewTab ? "noopener noreferrer" : undefined;

    // For external URLs or URLs with protocols, use regular anchor tag
    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          target={target}
          rel={rel}
          className={className}
          {...props}
        >
          {children}
        </a>
      );
    }

    // For internal URLs, use Next.js Link
    return (
      <Link
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={className}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

SmartLink.displayName = "SmartLink";
