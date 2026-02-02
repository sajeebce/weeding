// src/lib/email/smtp-client.ts
// Gmail SMTP Client using Nodemailer

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Get or create the SMTP transporter
 * Supports Gmail and other SMTP providers
 */
export function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    console.warn("[SMTP] Missing SMTP_USER or SMTP_PASSWORD - emails will not be sent");
    // Return a dummy transporter that logs instead of sending
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    // Gmail specific settings
    ...(host === "smtp.gmail.com" && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  });

  // Verify connection on first use
  transporter.verify((error) => {
    if (error) {
      console.error("[SMTP] Connection verification failed:", error.message);
    } else {
      console.log("[SMTP] Server is ready to send emails");
    }
  });

  return transporter;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Send an email using the configured SMTP transport
 */
export async function sendEmail(
  options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter();

    const fromName = process.env.SMTP_FROM_NAME || "LLCPad Support";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "noreply@llcpad.com";

    const result = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    // Check if using jsonTransport (dev mode without credentials)
    if (result.message) {
      console.log("[SMTP] Email logged (no credentials):", JSON.parse(result.message));
      return { success: true, messageId: "dev-mode" };
    }

    console.log("[SMTP] Email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[SMTP] Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Simple HTML to plain text conversion
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Test SMTP connection
 */
export async function testSmtpConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}
