/**
 * Lead Data Validation & Normalization
 *
 * Centralized validation rules for lead data across public and admin APIs.
 * Includes email/phone normalization, disposable email detection, and enhanced Zod schemas.
 */

import { z } from "zod";

// Common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "dispostable.com",
  "mailnesia.com",
  "maildrop.cc",
  "fakeinbox.com",
  "trashmail.com",
  "trashmail.net",
  "trashmail.org",
  "tempail.com",
  "10minutemail.com",
  "temp-mail.org",
  "getairmail.com",
  "mohmal.com",
  "getnada.com",
  "emailondeck.com",
  "mailcatch.com",
  "mintemail.com",
  "mytempmail.com",
  "burnermail.io",
  "mailsac.com",
  "harakirimail.com",
  "spamgourmet.com",
  "mytemp.email",
  "tempmailaddress.com",
  "tmpmail.net",
  "tmpmail.org",
  "bupmail.com",
  "crazymailing.com",
  "disposableemailaddresses.com",
  "emailtemporario.com.br",
  "filzmail.com",
  "incognitomail.org",
  "jetable.org",
  "kasmail.com",
  "mailexpire.com",
  "mailforspam.com",
  "mailinator2.com",
  "mailmoat.com",
  "mailnull.com",
  "nomail.xl.cx",
  "spamfree24.org",
  "spaml.com",
]);

/**
 * Check if an email domain is a known disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}

/**
 * Normalize email address
 * - Lowercases the entire email
 * - Trims whitespace
 * - Removes dots from Gmail local parts (Gmail ignores dots)
 */
export function normalizeEmail(email: string): string {
  const trimmed = email.toLowerCase().trim();
  const [local, domain] = trimmed.split("@");
  if (!local || !domain) return trimmed;

  // Gmail and Googlemail ignore dots in local part
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Also strip + aliases for gmail
    const baseLocal = local.split("+")[0].replace(/\./g, "");
    return `${baseLocal}@${domain}`;
  }

  return trimmed;
}

/**
 * Normalize phone number
 * - Strips all non-numeric characters except leading +
 * - Removes spaces, dashes, parentheses
 */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  // Keep leading + if present, strip everything else except digits
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Normalize a person's name
 * - Trims whitespace
 * - Capitalizes first letter of each word
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Normalize URL
 * - Adds https:// if no protocol specified
 * - Lowercases the domain
 * - Trims whitespace
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Normalize company name
 * - Trims whitespace
 * - Collapses multiple spaces
 */
export function normalizeCompany(company: string): string {
  return company.trim().replace(/\s+/g, " ");
}

/**
 * Enhanced public lead submission schema with normalization transforms
 */
export const enhancedSubmitLeadSchema = z.object({
  // Required
  firstName: z.string().min(1, "First name is required").transform(normalizeName),
  email: z
    .string()
    .email("Valid email is required")
    .transform(normalizeEmail)
    .refine((email) => !isDisposableEmail(email), {
      message: "Please use a non-disposable email address",
    }),

  // Optional contact info
  lastName: z.string().optional().transform((v) => v ? normalizeName(v) : v),
  phone: z.string().optional().transform((v) => v ? normalizePhone(v) : v),
  company: z.string().optional().transform((v) => v ? normalizeCompany(v) : v),
  country: z.string().optional(),
  city: z.string().optional(),

  // Service interest
  interestedIn: z.union([z.string(), z.array(z.string())]).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().optional(),

  // Source tracking
  source: z.string().optional(),
  sourceDetail: z.string().optional(),

  // UTM parameters
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),

  // Form template
  formTemplateId: z.string().optional(),

  // Custom fields
  customFields: z.record(z.string(), z.unknown()).optional(),

  // Behavioral tracking
  pageViews: z.number().optional(),
  visitCount: z.number().optional(),
  lastPageViewed: z.string().optional(),
});

/**
 * Enhanced admin lead creation schema with normalization
 */
export const enhancedCreateLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required").transform(normalizeName),
  lastName: z.string().optional().transform((v) => v ? normalizeName(v) : v),
  email: z
    .string()
    .email("Valid email is required")
    .transform(normalizeEmail),
  phone: z.string().optional().transform((v) => v ? normalizePhone(v) : v),
  company: z.string().optional().transform((v) => v ? normalizeCompany(v) : v),
  country: z.string().optional(),
  city: z.string().optional(),
  source: z.enum(["WEBSITE", "REFERRAL", "GOOGLE_ADS", "FACEBOOK_ADS", "SOCIAL_MEDIA", "DIRECT", "COLD_OUTREACH", "OTHER"]).optional(),
  sourceDetail: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  interestedIn: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  assignedToId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  formTemplateId: z.string().optional(),
});

export type SubmitLeadInput = z.infer<typeof enhancedSubmitLeadSchema>;
export type CreateLeadInput = z.infer<typeof enhancedCreateLeadSchema>;
