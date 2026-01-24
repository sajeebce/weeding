"use client";

import Link from "next/link";
import { FileText, Lock, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PageType =
  | "home"
  | "service_details"
  | "services_list"
  | "blog_post"
  | "blog_list"
  | "about"
  | "contact";

interface SetupStep {
  title: string;
  description: string;
  tip?: string;
  action?: { label: string; href: string };
}

interface SetupGuideConfig {
  title: string;
  description: string;
  steps: SetupStep[];
}

const SETUP_GUIDE_CONFIG: Record<PageType, SetupGuideConfig> = {
  home: {
    title: "Homepage",
    description: "Create a stunning homepage to welcome your visitors.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description:
          'Click "Create Page" and design your homepage layout using widgets.',
        tip: "Use Hero, Services Grid, Testimonials widgets for a great homepage.",
      },
      {
        title: "Assign as Homepage Template",
        description:
          'In Page Settings, select "Homepage" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description:
          "Save your page and it will become your new homepage automatically.",
      },
    ],
  },
  service_details: {
    title: "Service Details Pages",
    description: "Design how individual service pages look across your site.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description:
          'Click "Create Page" and design your service page layout.',
        tip: 'Use dynamic widgets like "Service Hero", "Service Packages", "Service FAQs" to pull content from each service automatically.',
      },
      {
        title: "Assign as Service Details Template",
        description:
          'In Page Settings, select "Service Details" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description:
          "All service pages will now use this template automatically.",
      },
    ],
  },
  services_list: {
    title: "Services List Page",
    description: "Design how the services listing page looks.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description: 'Click "Create Page" and design your services list layout.',
        tip: "Use Services Grid widget to display all services dynamically.",
      },
      {
        title: "Assign as Services List Template",
        description:
          'In Page Settings, select "Services List" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description: "The services page will now use this template.",
      },
    ],
  },
  blog_post: {
    title: "Blog Posts",
    description: "Design how individual blog posts appear to readers.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description: 'Click "Create Page" and design your blog post layout.',
        tip: 'Use "Blog Content", "Author Box", "Related Posts" widgets for dynamic content.',
      },
      {
        title: "Assign as Blog Post Template",
        description:
          'In Page Settings, select "Blog Post" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description: "All blog posts will now use this template.",
      },
    ],
  },
  blog_list: {
    title: "Blog List Page",
    description: "Design how the blog listing page looks.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description: 'Click "Create Page" and design your blog list layout.',
        tip: "Use Blog Grid or Blog List widgets to display posts dynamically.",
      },
      {
        title: "Assign as Blog List Template",
        description:
          'In Page Settings, select "Blog List" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description: "The blog page will now use this template.",
      },
    ],
  },
  about: {
    title: "About Page",
    description: "Design your about page.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description: 'Click "Create Page" and design your about page layout.',
        tip: "Use Team Grid, Timeline, Stats widgets to showcase your company.",
      },
      {
        title: "Assign as About Template",
        description:
          'In Page Settings, select "About Page" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description: "The about page will now use this template.",
      },
    ],
  },
  contact: {
    title: "Contact Page",
    description: "Design your contact page.",
    steps: [
      {
        title: "Go to Page Builder",
        description: "Navigate to Admin Panel → Appearance → Page Builder",
        action: { label: "Open Page Builder", href: "/admin/appearance/pages" },
      },
      {
        title: "Create a New Page",
        description: 'Click "Create Page" and design your contact page layout.',
        tip: "Use Contact Form, Map, and Contact Info widgets.",
      },
      {
        title: "Assign as Contact Template",
        description:
          'In Page Settings, select "Contact Page" from the template dropdown.',
      },
      {
        title: "Save & Publish",
        description: "The contact page will now use this template.",
      },
    ],
  },
};

interface TemplateSetupGuideProps {
  pageType: PageType;
}

export function TemplateSetupGuide({ pageType }: TemplateSetupGuideProps) {
  const config = SETUP_GUIDE_CONFIG[pageType];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            No Template Assigned for {config.title}
          </h1>
          <p className="text-muted-foreground text-lg">{config.description}</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {config.steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>

                    {step.tip && (
                      <div className="flex items-start gap-2 text-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg p-3 mt-2">
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{step.tip}</span>
                      </div>
                    )}

                    {step.action && (
                      <Button asChild className="mt-3">
                        <Link href={step.action.href}>
                          {step.action.label}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Connector Line */}
              {index < config.steps.length - 1 && (
                <div className="absolute left-[2.25rem] top-[4.5rem] w-0.5 h-[calc(100%-2rem)] bg-border" />
              )}
            </Card>
          ))}
        </div>

        {/* Admin Notice */}
        <div className="mt-12 p-4 rounded-lg bg-muted/50 border border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>
              This setup guide is only visible to administrators. Regular
              visitors will see a &quot;Coming Soon&quot; page.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
