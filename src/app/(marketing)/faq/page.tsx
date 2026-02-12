// Force dynamic rendering - page depends on database content
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getFaqTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about our services. Get the information you need.",
};

export default async function FAQPage() {
  const template = await getFaqTemplate();

  return (
    <>
      {template ? (
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        <NoTemplateFallback pageType="faq" />
      )}
    </>
  );
}
