// Force dynamic rendering - page depends on database content
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { WidgetSectionsRenderer } from "@/components/landing-page/widget-sections-renderer";
import { NoTemplateFallback } from "@/components/templates/no-template-fallback";
import { getContactTemplate } from "@/lib/templates/get-template";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with our team. We're here to help with any questions about our services.",
};

export default async function ContactPage() {
  const template = await getContactTemplate();

  return (
    <>
      {template ? (
        <WidgetSectionsRenderer sections={template.sections} />
      ) : (
        <NoTemplateFallback pageType="contact" />
      )}
    </>
  );
}
