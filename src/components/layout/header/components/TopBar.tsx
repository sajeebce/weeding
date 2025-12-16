"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTopBarDismiss } from "../hooks/useTopBarDismiss";
import type { TopBarProps } from "../types";

export function TopBar({ enabled, content, bgColor, textColor }: TopBarProps) {
  const { isDismissed, dismiss } = useTopBarDismiss();

  if (!enabled || isDismissed || !content?.text) {
    return null;
  }

  return (
    <div
      className="relative flex items-center justify-center gap-4 px-4 py-2 text-sm"
      style={{
        backgroundColor: bgColor || "hsl(var(--primary))",
        color: textColor || "hsl(var(--primary-foreground))",
      }}
    >
      <span>{content.text}</span>

      {content.links && content.links.length > 0 && (
        <div className="flex items-center gap-3">
          {content.links.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              className="underline underline-offset-2 hover:no-underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-white/20"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
