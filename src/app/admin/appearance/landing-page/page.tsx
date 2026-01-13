"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Legacy landing page builder route - redirects to new pages system
 * This page is deprecated in favor of /admin/appearance/pages
 */
export default function LegacyLandingPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/appearance/pages");
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Redirecting to Page Builder...</span>
      </div>
    </div>
  );
}
