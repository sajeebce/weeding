/**
 * Business Settings Utility
 * Fetches and manages business configuration from database
 */

import prisma from "@/lib/db";

// Business settings keys
export const BUSINESS_SETTINGS = {
  // General
  BUSINESS_NAME: "business.name",
  BUSINESS_TAGLINE: "business.tagline",
  BUSINESS_DESCRIPTION: "business.description",
  // Logo
  LOGO_URL: "business.logo.url",
  LOGO_TEXT: "business.logo.text",
  FAVICON_URL: "business.favicon.url",
  // Contact
  CONTACT_EMAIL: "business.contact.email",
  CONTACT_PHONE: "business.contact.phone",
  SUPPORT_EMAIL: "business.support.email",
  // Address
  ADDRESS_LINE1: "business.address.line1",
  ADDRESS_LINE2: "business.address.line2",
  ADDRESS_CITY: "business.address.city",
  ADDRESS_STATE: "business.address.state",
  ADDRESS_ZIP: "business.address.zip",
  ADDRESS_COUNTRY: "business.address.country",
  // Social Media
  SOCIAL_FACEBOOK: "business.social.facebook",
  SOCIAL_TWITTER: "business.social.twitter",
  SOCIAL_LINKEDIN: "business.social.linkedin",
  SOCIAL_INSTAGRAM: "business.social.instagram",
  SOCIAL_YOUTUBE: "business.social.youtube",
  SOCIAL_TIKTOK: "business.social.tiktok",
};

// Cache for business config
let businessConfigCache: BusinessConfig | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minute

export interface BusinessConfig {
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

/**
 * Get business configuration from database
 */
export async function getBusinessConfig(): Promise<BusinessConfig> {
  if (businessConfigCache && Date.now() - configCacheTime < CONFIG_CACHE_TTL) {
    return businessConfigCache;
  }

  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: "business." } },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const addressParts = [
    settingsMap[BUSINESS_SETTINGS.ADDRESS_LINE1],
    settingsMap[BUSINESS_SETTINGS.ADDRESS_LINE2],
    settingsMap[BUSINESS_SETTINGS.ADDRESS_CITY],
    settingsMap[BUSINESS_SETTINGS.ADDRESS_STATE],
    settingsMap[BUSINESS_SETTINGS.ADDRESS_ZIP],
    settingsMap[BUSINESS_SETTINGS.ADDRESS_COUNTRY],
  ].filter(Boolean);

  businessConfigCache = {
    name: settingsMap[BUSINESS_SETTINGS.BUSINESS_NAME] || "LLCPad",
    tagline: settingsMap[BUSINESS_SETTINGS.BUSINESS_TAGLINE] || "Your Business Formation Partner",
    description: settingsMap[BUSINESS_SETTINGS.BUSINESS_DESCRIPTION] || "Empowering global entrepreneurs to launch legitimate US businesses and Amazon stores with zero complexity.",
    logo: {
      url: settingsMap[BUSINESS_SETTINGS.LOGO_URL] || "",
      text: settingsMap[BUSINESS_SETTINGS.LOGO_TEXT] || "L",
    },
    favicon: settingsMap[BUSINESS_SETTINGS.FAVICON_URL] || "",
    contact: {
      email: settingsMap[BUSINESS_SETTINGS.CONTACT_EMAIL] || "contact@llcpad.com",
      phone: settingsMap[BUSINESS_SETTINGS.CONTACT_PHONE] || "",
      supportEmail: settingsMap[BUSINESS_SETTINGS.SUPPORT_EMAIL] || "support@llcpad.com",
    },
    address: {
      line1: settingsMap[BUSINESS_SETTINGS.ADDRESS_LINE1] || "",
      line2: settingsMap[BUSINESS_SETTINGS.ADDRESS_LINE2] || "",
      city: settingsMap[BUSINESS_SETTINGS.ADDRESS_CITY] || "",
      state: settingsMap[BUSINESS_SETTINGS.ADDRESS_STATE] || "",
      zip: settingsMap[BUSINESS_SETTINGS.ADDRESS_ZIP] || "",
      country: settingsMap[BUSINESS_SETTINGS.ADDRESS_COUNTRY] || "USA",
      full: addressParts.join(", ") || "30 N Gould St, Sheridan, WY 82801, USA",
    },
    social: {
      facebook: settingsMap[BUSINESS_SETTINGS.SOCIAL_FACEBOOK] || "",
      twitter: settingsMap[BUSINESS_SETTINGS.SOCIAL_TWITTER] || "",
      linkedin: settingsMap[BUSINESS_SETTINGS.SOCIAL_LINKEDIN] || "",
      instagram: settingsMap[BUSINESS_SETTINGS.SOCIAL_INSTAGRAM] || "",
      youtube: settingsMap[BUSINESS_SETTINGS.SOCIAL_YOUTUBE] || "",
      tiktok: settingsMap[BUSINESS_SETTINGS.SOCIAL_TIKTOK] || "",
    },
  };
  configCacheTime = Date.now();

  return businessConfigCache;
}

/**
 * Clear business config cache
 */
export function clearBusinessConfigCache() {
  businessConfigCache = null;
  configCacheTime = 0;
}

/**
 * Get default business config (for client-side fallback)
 */
export function getDefaultBusinessConfig(): BusinessConfig {
  return {
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
}
