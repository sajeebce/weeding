"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ServiceFaqAccordionProps {
  faqs: FaqItem[];
}

export function ServiceFaqAccordion({ faqs }: ServiceFaqAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(faqs.length > 0 ? [faqs[0].id] : [])
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set<string>();
      if (!prev.has(id)) next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openItems.has(faq.id);

        return (
          <div
            key={faq.id}
            className={cn(
              "rounded-xl border transition-all duration-300",
              isOpen
                ? "border-primary/20 bg-primary/[0.03] shadow-md shadow-primary/5"
                : "bg-card hover:-translate-y-0.5 hover:shadow-md"
            )}
          >
            <button
              onClick={() => toggleItem(faq.id)}
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
                  isOpen
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
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
                  className="prose prose-sm max-w-none px-6 pb-5 text-muted-foreground prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
