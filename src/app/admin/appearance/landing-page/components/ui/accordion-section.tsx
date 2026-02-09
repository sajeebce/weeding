"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  title: string;
  defaultOpen?: boolean;
  action?: {
    label: string;
    icon?: React.ElementType;
    onClick: () => void;
  };
  children: React.ReactNode;
  className?: string;
}

export function AccordionSection({
  title,
  defaultOpen = false, // Closed by default - user clicks to expand
  action,
  children,
  className,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background transition-all duration-200 min-w-0 w-full",
        isOpen ? "border-primary/40 shadow-sm" : "hover:border-muted-foreground/30",
        className
      )}
    >
      {/* Clickable Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between px-4 py-3.5 transition-colors min-w-0",
          isOpen ? "bg-primary/5" : "hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
              isOpen ? "bg-primary/10" : "bg-muted"
            )}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen ? "text-primary" : "-rotate-90 text-muted-foreground"
              )}
            />
          </div>
          <span
            className={cn(
              "text-sm font-medium transition-colors truncate",
              isOpen ? "text-foreground" : "text-foreground/70"
            )}
          >
            {title}
          </span>
        </div>

        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
          >
            {action.icon && <action.icon className="h-3.5 w-3.5" />}
            {action.label}
          </button>
        )}
      </div>

      {/* Content - Connected to header */}
      {isOpen && (
        <div className="border-t border-primary/20 bg-muted/30 px-3 py-3 min-w-0 w-full overflow-hidden">
          <div className="space-y-4 min-w-0 w-full">{children}</div>
        </div>
      )}
    </div>
  );
}
