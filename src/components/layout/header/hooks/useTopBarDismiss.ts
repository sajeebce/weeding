"use client";

import { useState, useEffect, useCallback } from "react";

export function useTopBarDismiss(topBarId: string = "default") {
  const [isDismissed, setIsDismissed] = useState(true); // Start dismissed to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(`topbar-dismissed-${topBarId}`);
    setIsDismissed(!!dismissed);
  }, [topBarId]);

  const dismiss = useCallback(() => {
    localStorage.setItem(`topbar-dismissed-${topBarId}`, "true");
    setIsDismissed(true);
  }, [topBarId]);

  const reset = useCallback(() => {
    localStorage.removeItem(`topbar-dismissed-${topBarId}`);
    setIsDismissed(false);
  }, [topBarId]);

  return { isDismissed, dismiss, reset };
}
