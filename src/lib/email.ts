/**
 * Email Utility using Nodemailer (SMTP)
 * Supports Gmail and other SMTP providers
 */

import nodemailer from "nodemailer";
import prisma from "@/lib/db";
import { decrypt, isEncrypted } from "@/lib/encryption";

// Email settings keys
export const EMAIL_SETTINGS = {
  PROVIDER: "email.provider",
  // SMTP Settings
  SMTP_HOST: "email.smtp.host",
  SMTP_PORT: "email.smtp.port",
  SMTP_SECURE: "email.smtp.secure",
  SMTP_USER: "email.smtp.user",
  SMTP_PASS: "email.smtp.password",
  // From settings
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
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
  };
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

  // Decrypt password if encrypted
  let smtpPassword = settingsMap[EMAIL_SETTINGS.SMTP_PASS] || "";
  if (smtpPassword && isEncrypted(smtpPassword)) {
    smtpPassword = decrypt(smtpPassword);
  }

  emailConfigCache = {
    provider: settingsMap[EMAIL_SETTINGS.PROVIDER] || "smtp",
    smtp: {
      host: settingsMap[EMAIL_SETTINGS.SMTP_HOST] || "smtp.gmail.com",
      port: parseInt(settingsMap[EMAIL_SETTINGS.SMTP_PORT] || "587", 10),
      secure: settingsMap[EMAIL_SETTINGS.SMTP_SECURE] === "true",
      user: settingsMap[EMAIL_SETTINGS.SMTP_USER] || "",
      password: smtpPassword,
    },
    fromEmail: settingsMap[EMAIL_SETTINGS.FROM_EMAIL] || "",
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
 * Create nodemailer transporter
 */
async function getTransporter(): Promise<nodemailer.Transporter> {
  const config = await getEmailConfig();

  if (!config.smtp.user || !config.smtp.password) {
    throw new Error("SMTP credentials not configured. Please configure in Admin Settings.");
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true for 465, false for other ports
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
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
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.smtp.user}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || config.replyTo || undefined,
    });

    return { success: true, id: info.messageId };
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

    if (!config.smtp.user || !config.smtp.password) {
      return { success: false, message: "SMTP credentials not configured" };
    }

    const transporter = await getTransporter();

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.smtp.user}>`,
      to: config.adminEmail || config.smtp.user,
      subject: "LLCPad Email Test",
      html: "<p>This is a test email from LLCPad. If you received this, your email configuration is working correctly!</p>",
    });

    return { success: true, message: "Test email sent successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return { success: false, message };
  }
}
