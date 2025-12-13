/**
 * Email Utility using Resend
 */

import { Resend } from "resend";
import prisma from "@/lib/db";
import { decrypt, isEncrypted } from "@/lib/encryption";

// Email settings keys
export const EMAIL_SETTINGS = {
  PROVIDER: "email.provider",
  RESEND_API_KEY: "email.resend.apiKey",
  FROM_EMAIL: "email.from.email",
  FROM_NAME: "email.from.name",
  REPLY_TO: "email.replyTo",
  // Notification triggers
  NOTIFY_ORDER_PLACED: "email.notify.orderPlaced",
  NOTIFY_ORDER_CONFIRMED: "email.notify.orderConfirmed",
  NOTIFY_ORDER_PROCESSING: "email.notify.orderProcessing",
  NOTIFY_ORDER_COMPLETED: "email.notify.orderCompleted",
  NOTIFY_PAYMENT_SUCCESS: "email.notify.paymentSuccess",
  NOTIFY_PAYMENT_FAILED: "email.notify.paymentFailed",
  // Admin notifications
  ADMIN_EMAIL: "email.admin.email",
  NOTIFY_ADMIN_NEW_ORDER: "email.notify.adminNewOrder",
};

// Cache for email config
let emailConfigCache: EmailConfig | null = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 60000; // 1 minute

interface EmailConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  adminEmail: string;
  notifications: {
    orderPlaced: boolean;
    orderConfirmed: boolean;
    orderProcessing: boolean;
    orderCompleted: boolean;
    paymentSuccess: boolean;
    paymentFailed: boolean;
    adminNewOrder: boolean;
  };
}

/**
 * Get email configuration from database
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  if (emailConfigCache && Date.now() - configCacheTime < CONFIG_CACHE_TTL) {
    return emailConfigCache;
  }

  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: "email." } },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  // Decrypt API key
  let apiKey = settingsMap[EMAIL_SETTINGS.RESEND_API_KEY] || "";
  if (apiKey && isEncrypted(apiKey)) {
    apiKey = decrypt(apiKey);
  }

  emailConfigCache = {
    provider: settingsMap[EMAIL_SETTINGS.PROVIDER] || "resend",
    apiKey,
    fromEmail: settingsMap[EMAIL_SETTINGS.FROM_EMAIL] || "noreply@llcpad.com",
    fromName: settingsMap[EMAIL_SETTINGS.FROM_NAME] || "LLCPad",
    replyTo: settingsMap[EMAIL_SETTINGS.REPLY_TO] || "",
    adminEmail: settingsMap[EMAIL_SETTINGS.ADMIN_EMAIL] || "",
    notifications: {
      orderPlaced: settingsMap[EMAIL_SETTINGS.NOTIFY_ORDER_PLACED] === "true",
      orderConfirmed: settingsMap[EMAIL_SETTINGS.NOTIFY_ORDER_CONFIRMED] === "true",
      orderProcessing: settingsMap[EMAIL_SETTINGS.NOTIFY_ORDER_PROCESSING] === "true",
      orderCompleted: settingsMap[EMAIL_SETTINGS.NOTIFY_ORDER_COMPLETED] === "true",
      paymentSuccess: settingsMap[EMAIL_SETTINGS.NOTIFY_PAYMENT_SUCCESS] === "true",
      paymentFailed: settingsMap[EMAIL_SETTINGS.NOTIFY_PAYMENT_FAILED] === "true",
      adminNewOrder: settingsMap[EMAIL_SETTINGS.NOTIFY_ADMIN_NEW_ORDER] === "true",
    },
  };
  configCacheTime = Date.now();

  return emailConfigCache;
}

/**
 * Clear email config cache
 */
export function clearEmailConfigCache() {
  emailConfigCache = null;
  configCacheTime = 0;
}

/**
 * Get Resend instance
 */
async function getResend(): Promise<Resend> {
  const config = await getEmailConfig();
  if (!config.apiKey) {
    throw new Error("Email API key not configured. Please configure in Admin Settings.");
  }
  return new Resend(config.apiKey);
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const config = await getEmailConfig();
    const resend = await getResend();

    const { data, error } = await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || config.replyTo || undefined,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    console.error("Email error:", message);
    return { success: false, error: message };
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getEmailConfig();
    if (!config.apiKey) {
      return { success: false, message: "API key not configured" };
    }

    const resend = new Resend(config.apiKey);

    await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: config.adminEmail || config.fromEmail,
      subject: "LLCPad Email Test",
      html: "<p>This is a test email from LLCPad. If you received this, your email configuration is working correctly!</p>",
    });

    return { success: true, message: "Test email sent successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { success: false, message };
  }
}
