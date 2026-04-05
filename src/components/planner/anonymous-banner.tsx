"use client";

import { useState } from "react";
import { AlertTriangle, X, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

interface AnonymousBannerProps {
  projectId: string;
}

export function AnonymousBanner({ projectId }: AnonymousBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  if (!projectId.startsWith("local-") || dismissed) return null;

  const syncUrl = `/login?callbackUrl=${encodeURIComponent(
    `/planner/sync?from=${projectId}`
  )}`;

  return (
    <div className="flex items-center justify-between bg-amber-500 px-4 py-2">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          {t("planner.banner.notSaved")}{" "}
          <span className="hidden sm:inline opacity-90">
            {t("planner.banner.dataLost")}
          </span>
        </span>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <Link href={syncUrl}>
          <Button
            size="sm"
            className="h-7 gap-1.5 border-0 bg-white text-xs font-semibold text-amber-600 hover:bg-amber-50 shadow-sm"
          >
            <LogIn className="h-3.5 w-3.5" />
            {t("planner.banner.loginToSave")}
          </Button>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
