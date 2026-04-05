"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage, LANGUAGES, flagUrl } from "@/lib/i18n/language-context";

export function FooterLanguageSwitcher() {
  const { lang, setLang, currentLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  function handleSelect(code: typeof LANGUAGES[number]["code"]) {
    setLang(code);
    setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Choose language"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl(currentLanguage.flagCode, 20)}
          alt={currentLanguage.label}
          width={20}
          height={15}
          className="rounded-sm object-cover"
        />
        <span>{currentLanguage.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative w-full max-w-3xl rounded-2xl bg-[#f0ede8] p-8 shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-gray-400 hover:bg-black/10 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <h2 className="mb-8 text-center text-xl font-bold text-gray-900">
              {t("lang.choose")}
            </h2>

            {/* Language grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleSelect(l.code)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                    lang === l.code
                      ? "bg-white shadow-sm text-gray-900 font-semibold"
                      : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flagUrl(l.flagCode, 40)}
                    alt={l.label}
                    width={28}
                    height={21}
                    className="rounded-sm object-cover shrink-0"
                  />
                  <span>{l.nativeLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
