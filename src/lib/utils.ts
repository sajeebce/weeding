import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LLC-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function generateTicketNumber(
  prisma: { supportTicket: { count: () => Promise<number> } }
): Promise<string> {
  const count = await prisma.supportTicket.count();
  const number = (count + 1).toString().padStart(4, "0");
  return `TKT-${number}`;
}

// ============================================
// Input Validation & Sanitization Utilities
// ============================================

// Character limits for different field types
export const INPUT_LIMITS = {
  // Personal Information
  firstName: { min: 1, max: 50 },
  lastName: { min: 1, max: 50 },
  name: { min: 1, max: 100 },

  // Contact Information
  email: { min: 5, max: 254 },
  phone: { min: 7, max: 20 },

  // Address Fields
  address: { min: 5, max: 200 },
  city: { min: 2, max: 100 },
  state: { min: 2, max: 100 },
  zipCode: { min: 5, max: 10 },
  country: { min: 2, max: 100 },

  // Business Information
  llcName: { min: 3, max: 150 },
  businessName: { min: 3, max: 150 },
  businessIndustry: { min: 2, max: 100 },

  // Document Numbers
  passportNumber: { min: 5, max: 20 },
  einNumber: { min: 9, max: 10 },
  ssnLast4: { min: 4, max: 4 },

  // Security
  password: { min: 8, max: 128 },

  // Text Areas
  message: { min: 10, max: 2000 },
  description: { min: 10, max: 1000 },
  notes: { min: 0, max: 500 },

  // General
  subject: { min: 3, max: 200 },
  url: { min: 10, max: 2000 },
} as const;

// Sanitize phone number - only allow digits and optional + at start
export function sanitizePhone(value: string): string {
  // Remove everything except digits and +
  let sanitized = value.replace(/[^\d+]/g, "");
  // Only allow + at the beginning
  if (sanitized.includes("+")) {
    const hasPlus = sanitized.startsWith("+");
    sanitized = sanitized.replace(/\+/g, "");
    if (hasPlus) {
      sanitized = "+" + sanitized;
    }
  }
  // Limit to max phone length
  return sanitized.slice(0, INPUT_LIMITS.phone.max);
}

// Sanitize text input - remove potentially dangerous characters
export function sanitizeText(value: string, maxLength?: number): string {
  // Remove null bytes and control characters except newline and tab
  let sanitized = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // Trim whitespace
  sanitized = sanitized.trim();
  // Apply max length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return sanitized;
}

// Sanitize email - lowercase and trim
export function sanitizeEmail(value: string): string {
  return value.toLowerCase().trim().slice(0, INPUT_LIMITS.email.max);
}

// Sanitize name - allow letters, spaces, hyphens, apostrophes
export function sanitizeName(value: string, maxLength: number = INPUT_LIMITS.name.max): string {
  // Allow unicode letters, spaces, hyphens, apostrophes, and periods
  let sanitized = value.replace(/[^\p{L}\s\-'.]/gu, "");
  // Remove multiple consecutive spaces
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  return sanitized.slice(0, maxLength);
}

// Sanitize alphanumeric - only letters and numbers
export function sanitizeAlphanumeric(value: string, maxLength?: number): string {
  let sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return sanitized;
}

// Sanitize number input - only digits
export function sanitizeNumber(value: string, maxLength?: number): string {
  let sanitized = value.replace(/\D/g, "");
  if (maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return sanitized;
}

// Sanitize passport number - alphanumeric only
export function sanitizePassportNumber(value: string): string {
  return sanitizeAlphanumeric(value, INPUT_LIMITS.passportNumber.max).toUpperCase();
}

// Sanitize zip code - digits and optional hyphen for US format
export function sanitizeZipCode(value: string): string {
  // Allow digits and one hyphen for US ZIP+4 format
  let sanitized = value.replace(/[^\d-]/g, "");
  // Ensure only one hyphen and in correct position
  const parts = sanitized.split("-");
  if (parts.length > 2) {
    sanitized = parts[0] + "-" + parts.slice(1).join("");
  }
  return sanitized.slice(0, INPUT_LIMITS.zipCode.max);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= INPUT_LIMITS.email.max;
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  // Must have at least 7 digits
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= INPUT_LIMITS.phone.min && digitsOnly.length <= INPUT_LIMITS.phone.max;
}

// Validate password strength
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < INPUT_LIMITS.password.min) {
    return { valid: false, message: `Password must be at least ${INPUT_LIMITS.password.min} characters` };
  }
  if (password.length > INPUT_LIMITS.password.max) {
    return { valid: false, message: `Password must be less than ${INPUT_LIMITS.password.max} characters` };
  }
  return { valid: true };
}

// Get input handler for phone fields - use in onChange
export function handlePhoneInput(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (value: string) => void
): void {
  const sanitized = sanitizePhone(e.target.value);
  setter(sanitized);
}

// Get input handler for text fields with max length
export function handleTextInput(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setter: (value: string) => void,
  maxLength?: number
): void {
  const sanitized = sanitizeText(e.target.value, maxLength);
  setter(sanitized);
}

// Get input handler for name fields
export function handleNameInput(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (value: string) => void,
  maxLength?: number
): void {
  const sanitized = sanitizeName(e.target.value, maxLength);
  setter(sanitized);
}

// Get input handler for email fields
export function handleEmailInput(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (value: string) => void
): void {
  const sanitized = sanitizeEmail(e.target.value);
  setter(sanitized);
}

/**
 * Generate a camelCase field name from a label
 * Examples:
 *   "Brand Name" → "brandName"
 *   "Amazon Seller ID" → "amazonSellerId"
 *   "Contact Email" → "contactEmail"
 *   "LLC Name (Required)" → "llcNameRequired"
 */
export function generateFieldName(label: string): string {
  if (!label || typeof label !== "string") return "";

  // Remove special characters except spaces and alphanumeric
  const cleaned = label.replace(/[^a-zA-Z0-9\s]/g, "");

  // Split by spaces and filter empty strings
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length === 0) return "";

  // Convert to camelCase: first word lowercase, rest capitalized
  return words
    .map((word, index) => {
      const lowered = word.toLowerCase();
      if (index === 0) return lowered;
      return lowered.charAt(0).toUpperCase() + lowered.slice(1);
    })
    .join("");
}
