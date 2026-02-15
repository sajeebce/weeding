"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqAccordionWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_FAQ_ACCORDION_SETTINGS } from "@/lib/page-builder/defaults";
import { WidgetContainer } from "@/components/page-builder/shared/widget-container";
import { useOptionalServiceContext } from "@/lib/page-builder/contexts/service-context";
import Link from "next/link";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

interface ServiceFaqGroup {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  services: {
    serviceId: string;
    serviceName: string;
    serviceSlug: string;
    faqs: { id: string; question: string; answer: string }[];
  }[];
}

interface FaqAccordionWidgetProps {
  settings: FaqAccordionWidgetSettings;
  isPreview?: boolean;
}

export function FaqAccordionWidget({
  settings,
  isPreview = false,
}: FaqAccordionWidgetProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [serviceFaqGroups, setServiceFaqGroups] = useState<ServiceFaqGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Service context for source: "service"
  const serviceContext = useOptionalServiceContext();

  const defaultHeader = {
    show: true,
    heading: "Frequently Asked Questions",
    description: "Get answers to common questions about our services",
    alignment: "center" as const,
  };

  const s = {
    source: settings?.source ?? ("all" as const),
    categories: settings?.categories ?? ([] as string[]),
    maxItems: settings?.maxItems ?? 10,
    expandFirst: settings?.expandFirst ?? true,
    allowMultipleOpen: settings?.allowMultipleOpen ?? false,
    style: settings?.style ?? ("cards" as const),
    accentColor: settings?.accentColor ?? "#3b82f6",
    showCategoryFilter: settings?.showCategoryFilter ?? false,
    header: { ...defaultHeader, ...settings?.header },
  };

  const hs = { ...DEFAULT_FAQ_ACCORDION_SETTINGS.headerStyle!, ...settings?.headerStyle };
  const is = { ...DEFAULT_FAQ_ACCORDION_SETTINGS.itemStyle!, ...settings?.itemStyle };

  useEffect(() => {
    // Source: "service" - read FAQs directly from ServiceContext (no API call)
    if (s.source === "service") {
      if (serviceContext?.service?.faqs) {
        const serviceFaqs: FaqItem[] = serviceContext.service.faqs
          .slice(0, s.maxItems)
          .map((faq) => ({
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            category: null,
          }));
        setFaqs(serviceFaqs);
        if (s.expandFirst && serviceFaqs.length > 0) {
          setOpenItems(new Set([serviceFaqs[0].id]));
        }
      } else {
        setFaqs([]);
      }
      setLoading(false);
      return;
    }

    // Source: "service-all" - fetch all service FAQs grouped by category/service
    if (s.source === "service-all") {
      async function fetchServiceFaqs() {
        try {
          const res = await fetch("/api/faq/service-faqs");
          if (!res.ok) throw new Error("Failed to fetch");
          const data: ServiceFaqGroup[] = await res.json();
          setServiceFaqGroups(data);

          // Expand first FAQ of first service
          if (s.expandFirst && data.length > 0) {
            const firstService = data[0]?.services?.[0];
            if (firstService?.faqs?.[0]) {
              setOpenItems(new Set([firstService.faqs[0].id]));
            }
          }
        } catch {
          setServiceFaqGroups([]);
        } finally {
          setLoading(false);
        }
      }
      fetchServiceFaqs();
      return;
    }

    // Source: "all" or "category" - fetch from global FAQ API
    async function fetchFaqs() {
      try {
        const params = new URLSearchParams();
        if (s.source === "category" && s.categories.length > 0) {
          params.set("category", s.categories[0]);
        }
        const res = await fetch(`/api/admin/global-faqs?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        let data: FaqItem[] = await res.json();

        if (s.source === "category" && s.categories.length > 1) {
          data = data.filter(
            (f) => f.category && s.categories.includes(f.category)
          );
        }

        data = data.slice(0, s.maxItems);
        setFaqs(data);

        if (s.expandFirst && data.length > 0) {
          setOpenItems(new Set([data[0].id]));
        }
      } catch {
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings?.source,
    settings?.maxItems,
    settings?.expandFirst,
    JSON.stringify(settings?.categories),
    serviceContext?.service?.faqs,
  ]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!s.allowMultipleOpen) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const uniqueCategories = Array.from(
    new Set(faqs.map((f) => f.category).filter(Boolean))
  ) as string[];

  const displayFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  const categoryLabels: Record<string, string> = {
    general: "General",
    pricing: "Pricing & Payments",
    international: "International",
    account: "Account & Support",
  };

  if (loading) {
    return (
      <WidgetContainer container={settings.container}>
      <div className="mx-auto max-w-3xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      </WidgetContainer>
    );
  }

  // Service-all source: render grouped FAQs by category → service
  if (s.source === "service-all") {
    if (serviceFaqGroups.length === 0) {
      if (isPreview) {
        return (
          <WidgetContainer container={settings.container}>
          <div className="flex items-center justify-center rounded-xl border border-dashed py-12">
            <p className="text-sm text-muted-foreground">
              No service FAQs found. Add FAQs to your services from the admin
              panel.
            </p>
          </div>
          </WidgetContainer>
        );
      }
      return null;
    }

    return (
      <WidgetContainer container={settings.container}>
      <div className="w-full">
        {s.header.show && (
          <div
            className={cn(
              "mb-10",
              s.header.alignment === "center" && "text-center"
            )}
          >
            <h2
              className={cn("font-bold tracking-tight", {
                "text-xl sm:text-2xl": hs.headingSize === "sm",
                "text-2xl sm:text-3xl": hs.headingSize === "md",
                "text-3xl sm:text-4xl": hs.headingSize === "lg",
                "text-4xl sm:text-5xl": hs.headingSize === "xl",
                "text-5xl sm:text-6xl": hs.headingSize === "2xl",
              })}
              style={{ color: hs.headingColor || undefined }}
            >
              {s.header.heading}
            </h2>
            {s.header.description && (
              <p
                className="mt-3 text-lg"
                style={{ color: hs.descriptionColor || undefined }}
              >
                {s.header.description}
              </p>
            )}
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-12">
          {serviceFaqGroups.map((group) => (
            <section key={group.categoryId}>
              <div className="mb-8 rounded-lg border bg-muted/30 p-4">
                <h3 className="text-2xl font-bold text-foreground">
                  {group.categoryName}
                </h3>
              </div>

              <div className="space-y-8">
                {group.services.map((service) => (
                  <div key={service.serviceId} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-foreground">
                        {service.serviceName}
                      </h4>
                      <Link
                        href={`/services/${service.serviceSlug}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View Service
                      </Link>
                    </div>

                    {s.style === "minimal" && (
                      <div className="divide-y divide-border" style={{ gap: `${is.gap}px` }}>
                        {service.faqs.map((faq) => (
                          <FaqItemMinimal
                            key={faq.id}
                            faq={{ ...faq, category: null }}
                            isOpen={openItems.has(faq.id)}
                            onToggle={() => toggleItem(faq.id)}
                            itemStyle={is}
                          />
                        ))}
                      </div>
                    )}

                    {s.style === "cards" && (
                      <div className="flex flex-col" style={{ gap: `${is.gap}px` }}>
                        {service.faqs.map((faq) => (
                          <FaqItemCard
                            key={faq.id}
                            faq={{ ...faq, category: null }}
                            isOpen={openItems.has(faq.id)}
                            onToggle={() => toggleItem(faq.id)}
                            accentColor={s.accentColor}
                            itemStyle={is}
                          />
                        ))}
                      </div>
                    )}

                    {s.style === "bordered" && (
                      <div className="flex flex-col" style={{ gap: `${is.gap}px` }}>
                        {service.faqs.map((faq, index) => (
                          <FaqItemBordered
                            key={faq.id}
                            faq={{ ...faq, category: null }}
                            index={index}
                            isOpen={openItems.has(faq.id)}
                            onToggle={() => toggleItem(faq.id)}
                            accentColor={s.accentColor}
                            itemStyle={is}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      </WidgetContainer>
    );
  }

  // Standard source (all/category/service): render flat list
  if (faqs.length === 0) {
    if (isPreview) {
      return (
        <WidgetContainer container={settings.container}>
        <div className="flex items-center justify-center rounded-xl border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            No FAQs found. Add FAQs from the admin panel.
          </p>
        </div>
        </WidgetContainer>
      );
    }
    return null;
  }

  return (
    <WidgetContainer container={settings.container}>
    <div className="w-full">
      {/* Header */}
      {s.header.show && (
        <div
          className={cn(
            "mb-10",
            s.header.alignment === "center" && "text-center"
          )}
        >
          <h2
            className={cn(
              "font-bold tracking-tight",
              {
                "text-xl sm:text-2xl": hs.headingSize === "sm",
                "text-2xl sm:text-3xl": hs.headingSize === "md",
                "text-3xl sm:text-4xl": hs.headingSize === "lg",
                "text-4xl sm:text-5xl": hs.headingSize === "xl",
                "text-5xl sm:text-6xl": hs.headingSize === "2xl",
              }
            )}
            style={{ color: hs.headingColor || undefined }}
          >
            {s.header.heading}
          </h2>
          {s.header.description && (
            <p
              className="mt-3 text-lg"
              style={{ color: hs.descriptionColor || undefined }}
            >
              {s.header.description}
            </p>
          )}
        </div>
      )}

      {/* Category Filter Tabs */}
      {s.showCategoryFilter && uniqueCategories.length > 1 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
              activeCategory === "all"
                ? "text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            style={
              activeCategory === "all"
                ? { backgroundColor: s.accentColor }
                : undefined
            }
          >
            All
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                activeCategory === cat
                  ? "text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={
                activeCategory === cat
                  ? { backgroundColor: s.accentColor }
                  : undefined
              }
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ Items */}
      <div className="mx-auto max-w-3xl">
        {s.style === "minimal" && (
          <div className="divide-y divide-border">
            {displayFaqs.map((faq) => (
              <FaqItemMinimal
                key={faq.id}
                faq={faq}
                isOpen={openItems.has(faq.id)}
                onToggle={() => toggleItem(faq.id)}
                itemStyle={is}
              />
            ))}
          </div>
        )}

        {s.style === "cards" && (
          <div className="flex flex-col" style={{ gap: `${is.gap}px` }}>
            {displayFaqs.map((faq) => (
              <FaqItemCard
                key={faq.id}
                faq={faq}
                isOpen={openItems.has(faq.id)}
                onToggle={() => toggleItem(faq.id)}
                accentColor={s.accentColor}
                itemStyle={is}
              />
            ))}
          </div>
        )}

        {s.style === "bordered" && (
          <div className="flex flex-col" style={{ gap: `${is.gap}px` }}>
            {displayFaqs.map((faq, index) => (
              <FaqItemBordered
                key={faq.id}
                faq={faq}
                index={index}
                isOpen={openItems.has(faq.id)}
                onToggle={() => toggleItem(faq.id)}
                accentColor={s.accentColor}
                itemStyle={is}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </WidgetContainer>
  );
}

interface FaqItemStyle {
  questionColor?: string;
  answerColor?: string;
  gap: number;
  borderRadius: number;
  padding: number;
}

/* ── Style: Minimal (Stripe-like) ── */
function FaqItemMinimal({
  faq,
  isOpen,
  onToggle,
  itemStyle,
}: {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  itemStyle: FaqItemStyle;
}) {
  return (
    <div style={{ padding: `${itemStyle.padding}px 0` }}>
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between text-left"
      >
        <span
          className="text-base font-medium pr-4 transition-colors group-hover:opacity-80"
          style={{ color: itemStyle.questionColor || undefined }}
        >
          {faq.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div
            className="prose prose-sm max-w-none pt-3"
            style={{ color: itemStyle.answerColor || undefined }}
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Style: Cards (Premium) ── */
function FaqItemCard({
  faq,
  isOpen,
  onToggle,
  accentColor,
  itemStyle,
}: {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string;
  itemStyle: FaqItemStyle;
}) {
  return (
    <div
      className={cn(
        "border transition-all duration-300",
        isOpen
          ? "bg-accent/30 shadow-md"
          : "bg-card hover:-translate-y-0.5 hover:shadow-md"
      )}
      style={{
        borderRadius: `${itemStyle.borderRadius}px`,
        ...(isOpen ? { borderColor: `${accentColor}40` } : {}),
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
        style={{ padding: `${itemStyle.padding}px` }}
      >
        <span
          className="text-base font-semibold transition-colors duration-200 pr-4"
          style={{ color: itemStyle.questionColor || undefined }}
        >
          {faq.question}
        </span>
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            isOpen ? "text-white" : "bg-muted text-muted-foreground"
          )}
          style={isOpen ? { backgroundColor: accentColor } : undefined}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div
            className="prose prose-sm max-w-none pb-5"
            style={{
              color: itemStyle.answerColor || undefined,
              paddingLeft: `${itemStyle.padding}px`,
              paddingRight: `${itemStyle.padding}px`,
            }}
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Style: Bordered (Numbered + accent border) ── */
function FaqItemBordered({
  faq,
  index,
  isOpen,
  onToggle,
  accentColor,
  itemStyle,
}: {
  faq: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string;
  itemStyle: FaqItemStyle;
}) {
  return (
    <div
      className={cn(
        "border-l-[3px] border border-border transition-all duration-300",
        isOpen ? "bg-accent/20 shadow-sm" : "bg-card hover:bg-accent/10"
      )}
      style={{
        borderRadius: `${itemStyle.borderRadius}px`,
        borderLeftColor: isOpen ? accentColor : "transparent",
      }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 text-left"
        style={{ padding: `${itemStyle.padding}px` }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums"
          style={{
            backgroundColor: isOpen ? accentColor : undefined,
            color: isOpen ? "#fff" : accentColor,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="flex-1 text-base font-medium"
          style={{ color: itemStyle.questionColor || undefined }}
        >
          {faq.question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div
            className="prose prose-sm max-w-none pb-5 pl-17"
            style={{
              color: itemStyle.answerColor || undefined,
              paddingRight: `${itemStyle.padding}px`,
            }}
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>
    </div>
  );
}
