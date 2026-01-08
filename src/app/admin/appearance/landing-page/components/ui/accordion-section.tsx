"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
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
  defaultOpen = true,
  action,
  children,
  className,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-b pb-4", className)}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-3"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              !isOpen && "-rotate-90"
            )}
          />
          <span className="text-sm font-semibold">{title}</span>
        </div>

        {action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
          >
            {action.icon && <action.icon className="h-3 w-3" />}
            {action.label}
          </button>
        )}
      </button>

      {/* Content */}
      {isOpen && <div className="space-y-4 pl-6">{children}</div>}
    </div>
  );
}
