"use client";

import { useState, useEffect } from "react";

// Client-side business config interface (duplicated to avoid server imports)
interface BusinessConfig {
  name: string;
  tagline: string;
  description: string;
  logo: {
    url: string;
    text: string;
  };
  favicon: string;
  contact: {
    email: string;
    phone: string;
    supportEmail: string;
  };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    full: string;
  };
  social: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
}

// Default config for client-side (no server imports)
const defaultConfig: BusinessConfig = {
  name: "LLCPad",
  tagline: "Your Business Formation Partner",
  description: "Empowering global entrepreneurs to launch legitimate US businesses and Amazon stores with zero complexity.",
  logo: {
    url: "",
    text: "L",
  },
  favicon: "",
  contact: {
    email: "contact@llcpad.com",
    phone: "",
    supportEmail: "support@llcpad.com",
  },
  address: {
    line1: "30 N Gould St",
    line2: "",
    city: "Sheridan",
    state: "WY",
    zip: "82801",
    country: "USA",
    full: "30 N Gould St, Sheridan, WY 82801, USA",
  },
  social: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  },
};

export function useBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/business-config");
        if (!res.ok) throw new Error("Failed to fetch config");
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error("Error fetching business config:", err);
        setError(err instanceof Error ? err.message : "Failed to load config");
        // Keep default config on error
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading, error };
}
