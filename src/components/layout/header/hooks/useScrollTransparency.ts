"use client";

import { useState, useEffect } from "react";

export function useScrollTransparency(enabled: boolean, threshold: number = 100) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, threshold]);

  return isScrolled;
}
