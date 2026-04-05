"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, LANGUAGES, flagUrl } from "@/lib/i18n/language-context";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, currentLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        aria-label="Switch language"
        aria-expanded={open}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl(currentLanguage.flagCode)}
          alt={currentLanguage.label}
          width={20}
          height={15}
          className="rounded-sm object-cover"
        />
        <span className="hidden sm:inline">{currentLanguage.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                lang === l.code
                  ? "bg-gray-50 font-semibold text-black"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagUrl(l.flagCode)}
                alt={l.label}
                width={20}
                height={15}
                className="rounded-sm object-cover shrink-0"
              />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
