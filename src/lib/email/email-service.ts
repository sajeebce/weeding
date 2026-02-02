// src/lib/email/email-service.ts
// Email Service for Support System

import { sendEmail } from "./smtp-client";

interface TicketEmailData {
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  message?: string;
  ticketUrl?: string;
}

interface TranscriptMessage {
  senderName: string;
  senderType: string;
  content: string;
  createdAt: Date;
}

/**
 * Email Service for sending support-related emails
 */
export const emailService = {
  /**
   * Send ticket created notification to customer
   */
  async ticketCreated(data: TicketEmailData) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = data.ticketUrl || `${appUrl}/dashboard/support`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Support Ticket Created</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
        Hi ${data.customerName},
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
        Your support ticket has been created successfully. Our team will review your request and get back to you as soon as possible.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Ticket Number</p>
        <p style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 0 0 16px;">#${data.ticketNumber}</p>

        <p style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 4px;">Subject</p>
        <p style="color: #1a1a1a; font-size: 16px; margin: 0;">${data.subject}</p>
      </div>

      ${data.message ? `
      <div style="margin: 24px 0;">
        <p style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px;">Your Message</p>
        <p style="color: #4a4a4a; font-size: 14px; background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 0; white-space: pre-wrap;">${data.message}</p>
      </div>
      ` : ""}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${ticketUrl}" style="display: inline-block; background: #f97316; color: #ffffff; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View Ticket Status</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        This is an automated message. Please do not reply directly to this email. If you have any questions, use the link above to access your ticket.
      </p>
    </div>
  </div>
</body>
</html>`;

    return sendEmail({
      to: data.customerEmail,
      subject: `[Ticket #${data.ticketNumber}] ${data.subject}`,
      html,
    });
  },

  /**
   * Send reply notification to customer
   */
  async ticketReply(data: TicketEmailData & { agentName: string; replyContent: string }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = data.ticketUrl || `${appUrl}/dashboard/support`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Reply on Your Ticket</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
        Hi ${data.customerName},
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
        ${data.agentName} has replied to your support ticket.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #6b7280; font-size: 12px; font-weight: 600; margin: 0 0 8px;">
          <strong>Ticket #${data.ticketNumber}</strong> - ${data.subject}
        </p>
        <div style="background: #ffffff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-top: 12px;">
          <p style="color: #1a1a1a; font-size: 14px; margin: 0; white-space: pre-wrap;">${data.replyContent}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${ticketUrl}" style="display: inline-block; background: #3b82f6; color: #ffffff; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View & Reply</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        This is an automated message. To reply, please use the link above.
      </p>
    </div>
  </div>
</body>
</html>`;

    return sendEmail({
      to: data.customerEmail,
      subject: `Re: [Ticket #${data.ticketNumber}] ${data.subject}`,
      html,
    });
  },

  /**
   * Send ticket resolved notification
   */
  async ticketResolved(data: TicketEmailData) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = data.ticketUrl || `${appUrl}/dashboard/support`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✓ Ticket Resolved</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
        Hi ${data.customerName},
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
        Your support ticket has been marked as resolved. If you have any further questions, feel free to reopen the ticket or create a new one.
      </p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #166534; font-size: 14px; margin: 0;">
          <strong>Ticket #${data.ticketNumber}</strong><br>
          ${data.subject}
        </p>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${ticketUrl}" style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View Ticket</a>
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        Thank you for contacting our support team. We hope we were able to help!
      </p>
    </div>
  </div>
</body>
</html>`;

    return sendEmail({
      to: data.customerEmail,
      subject: `[Resolved] Ticket #${data.ticketNumber}: ${data.subject}`,
      html,
    });
  },

  /**
   * Send chat transcript to customer
   */
  async chatTranscript(data: {
    ticketNumber: string;
    customerName: string;
    customerEmail: string;
    messages: TranscriptMessage[];
    chatDuration: string;
  }) {
    const messagesHtml = data.messages
      .map((msg) => {
        const isCustomer = msg.senderType === "CUSTOMER";
        const bgColor = isCustomer ? "#f97316" : "#e5e7eb";
        const textColor = isCustomer ? "#ffffff" : "#1a1a1a";
        const align = isCustomer ? "right" : "left";
        const time = new Date(msg.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <div style="text-align: ${align}; margin-bottom: 12px;">
          <div style="display: inline-block; max-width: 80%; text-align: left;">
            <p style="color: #6b7280; font-size: 11px; margin: 0 0 4px;">${msg.senderName} • ${time}</p>
            <div style="background: ${bgColor}; color: ${textColor}; padding: 10px 14px; border-radius: 12px; font-size: 14px;">
              ${msg.content}
            </div>
          </div>
        </div>`;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Chat Transcript</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
        Hi ${data.customerName},
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
        Here's a transcript of your recent chat session.
      </p>

      <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          <strong>Ticket #${data.ticketNumber}</strong> • Duration: ${data.chatDuration}
        </p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        ${messagesHtml}
      </div>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
        This transcript was sent automatically when your chat session ended.
      </p>
    </div>
  </div>
</body>
</html>`;

    return sendEmail({
      to: data.customerEmail,
      subject: `Chat Transcript - Ticket #${data.ticketNumber}`,
      html,
    });
  },

  /**
   * Send new ticket notification to admin/agent
   */
  async notifyAgent(agentEmail: string, data: TicketEmailData) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = `${appUrl}/admin/tickets/${data.ticketNumber}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 New Support Ticket</h1>
    </div>
    <div style="padding: 32px;">
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #991b1b; font-size: 14px; margin: 0;">
          <strong>Ticket #${data.ticketNumber}</strong>
        </p>
        <p style="color: #1a1a1a; font-size: 18px; font-weight: 600; margin: 8px 0 0;">${data.subject}</p>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
        <strong>Customer:</strong> ${data.customerName} (${data.customerEmail})
      </p>

      ${data.message ? `
      <div style="margin: 16px 0;">
        <p style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px;">Message</p>
        <p style="color: #4a4a4a; font-size: 14px; background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 0; white-space: pre-wrap;">${data.message}</p>
      </div>
      ` : ""}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${ticketUrl}" style="display: inline-block; background: #ef4444; color: #ffffff; font-size: 16px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View Ticket</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    return sendEmail({
      to: agentEmail,
      subject: `[New Ticket #${data.ticketNumber}] ${data.subject}`,
      html,
    });
  },
};
