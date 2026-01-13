"use client";

import { useSession } from "next-auth/react";
import { ComingSoonPage } from "./coming-soon-page";
import { TemplateSetupGuide } from "./template-setup-guide";

type PageType =
  | "home"
  | "service_details"
  | "services_list"
  | "blog_post"
  | "blog_list"
  | "about"
  | "contact";

// Roles that can access page builder and see setup instructions
const PAGE_BUILDER_ROLES = ["admin", "content_manager"];

interface NoTemplateFallbackProps {
  pageType: PageType;
  context?: {
    title?: string;
  };
}

/**
 * Fallback component when no template is assigned for a page type.
 * - Shows setup guide to admins/content managers
 * - Shows "Coming Soon" page to regular visitors
 */
export function NoTemplateFallback({ pageType, context }: NoTemplateFallbackProps) {
  const { data: session, status } = useSession();

  // While loading session, show coming soon (safe default)
  if (status === "loading") {
    return <ComingSoonPage pageType={pageType} context={context} />;
  }

  const userRole = session?.user?.role as string | undefined;
  const canAccessPageBuilder = userRole && PAGE_BUILDER_ROLES.includes(userRole);

  if (canAccessPageBuilder) {
    return <TemplateSetupGuide pageType={pageType} />;
  }

  return <ComingSoonPage pageType={pageType} context={context} />;
}
