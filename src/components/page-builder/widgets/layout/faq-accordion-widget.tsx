"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqAccordionWidgetSettings } from "@/lib/page-builder/types";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
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
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  useEffect(() => {
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
  }, [settings?.source, settings?.maxItems, settings?.expandFirst, JSON.stringify(settings?.categories)]);

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
      <div className="mx-auto max-w-3xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (faqs.length === 0) {
    if (isPreview) {
      return (
        <div className="flex items-center justify-center rounded-xl border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            No FAQs found. Add FAQs from the admin panel.
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full">
      {/* Header */}
      {s.header.show && (
        <div
          className={cn(
            "mb-10",
            s.header.alignment === "center" && "text-center"
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {s.header.heading}
          </h2>
          {s.header.description && (
            <p className="mt-3 text-lg text-muted-foreground">
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
              />
            ))}
          </div>
        )}

        {s.style === "cards" && (
          <div className="space-y-3">
            {displayFaqs.map((faq) => (
              <FaqItemCard
                key={faq.id}
                faq={faq}
                isOpen={openItems.has(faq.id)}
                onToggle={() => toggleItem(faq.id)}
                accentColor={s.accentColor}
              />
            ))}
          </div>
        )}

        {s.style === "bordered" && (
          <div className="space-y-3">
            {displayFaqs.map((faq, index) => (
              <FaqItemBordered
                key={faq.id}
                faq={faq}
                index={index}
                isOpen={openItems.has(faq.id)}
                onToggle={() => toggleItem(faq.id)}
                accentColor={s.accentColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Style: Minimal (Stripe-like) ── */
function FaqItemMinimal({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="py-5">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between text-left"
      >
        <span className="text-base font-medium text-foreground pr-4 transition-colors group-hover:text-foreground/80">
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
            className="prose prose-sm max-w-none pt-3 text-muted-foreground"
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
}: {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        isOpen
          ? "bg-accent/30 shadow-md"
          : "bg-card hover:-translate-y-0.5 hover:shadow-md"
      )}
      style={isOpen ? { borderColor: `${accentColor}40` } : undefined}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <span
          className={cn(
            "text-base font-semibold transition-colors duration-200 pr-4",
            isOpen ? "text-foreground" : "text-foreground/90"
          )}
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
            className="prose prose-sm max-w-none px-6 pb-5 text-muted-foreground"
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
}: {
  faq: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border-l-[3px] border border-border transition-all duration-300",
        isOpen ? "bg-accent/20 shadow-sm" : "bg-card hover:bg-accent/10"
      )}
      style={{ borderLeftColor: isOpen ? accentColor : "transparent" }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-5 text-left"
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
        <span className="flex-1 text-base font-medium text-foreground">
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
            className="prose prose-sm max-w-none px-5 pb-5 pl-[4.25rem] text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>
    </div>
  );
}
