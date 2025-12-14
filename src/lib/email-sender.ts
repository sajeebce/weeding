import { Resend } from "resend";
import { render } from "@react-email/components";
import { prisma } from "@/lib/db";
import { AdminNotificationEmail } from "@/components/email/admin-notification";
import { CustomerReplyEmail } from "@/components/email/customer-reply";
import { ChatSummaryEmail } from "@/components/email/chat-summary";

// Initialize Resend client
let resendClient: Resend | null = null;

async function getResendClient() {
  if (resendClient) return resendClient;

  // Fetch API key from database settings
  const apiKeySetting = await prisma.setting.findUnique({
    where: { key: "email.resend.apiKey" },
  });

  if (!apiKeySetting?.value) {
    throw new Error("Resend API key not configured");
  }

  resendClient = new Resend(apiKeySetting.value);
  return resendClient;
}

async function getEmailSettings() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "email.from.email",
          "email.from.name",
          "email.replyTo",
          "email.admin.email",
        ],
      },
    },
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return {
    fromEmail: settingsMap["email.from.email"] || "noreply@llcpad.com",
    fromName: settingsMap["email.from.name"] || "LLCPad Support",
    replyTo: settingsMap["email.replyTo"] || "support@llcpad.com",
    adminEmail: settingsMap["email.admin.email"] || "admin@llcpad.com",
  };
}

interface SendAdminNotificationParams {
  ticketId: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  message: string;
  priority?: string;
  category?: string | null;
}

export async function sendAdminNotification(
  params: SendAdminNotificationParams
) {
  try {
    const resend = await getResendClient();
    const settings = await getEmailSettings();

    const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/tickets/${params.ticketId}`;

    const emailHtml = await render(
      AdminNotificationEmail({
        ticketNumber: params.ticketNumber,
        subject: params.subject,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        message: params.message,
        ticketUrl,
        priority: params.priority || "MEDIUM",
        category: params.category || "General",
      })
    );

    const result = await resend.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: settings.adminEmail,
      subject: `New Support Ticket: ${params.subject}`,
      html: emailHtml,
      replyTo: params.customerEmail,
    });

    console.log("Admin notification email sent:", result.id);
    return result;
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
    throw error;
  }
}

interface SendCustomerReplyParams {
  customerEmail: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
  agentName: string;
  replyMessage: string;
  ticketId?: string;
}

export async function sendCustomerReply(params: SendCustomerReplyParams) {
  try {
    const resend = await getResendClient();
    const settings = await getEmailSettings();

    const ticketUrl = params.ticketId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${params.ticketId}`
      : undefined;

    const emailHtml = await render(
      CustomerReplyEmail({
        customerName: params.customerName,
        ticketNumber: params.ticketNumber,
        subject: params.subject,
        agentName: params.agentName,
        replyMessage: params.replyMessage,
        ticketUrl,
      })
    );

    const result = await resend.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: params.customerEmail,
      subject: `Re: ${params.subject} [Ticket #${params.ticketNumber}]`,
      html: emailHtml,
      replyTo: settings.replyTo,
    });

    console.log("Customer reply email sent:", result.id);
    return result;
  } catch (error) {
    console.error("Failed to send customer reply email:", error);
    throw error;
  }
}

interface Message {
  senderName: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  content: string;
  createdAt: string;
}

interface SendChatSummaryParams {
  customerEmail: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
  messages: Message[];
  resolvedAt?: string;
}

export async function sendChatSummary(params: SendChatSummaryParams) {
  try {
    const resend = await getResendClient();
    const settings = await getEmailSettings();

    const satisfactionSurveyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/survey/${params.ticketNumber}`;

    const emailHtml = await render(
      ChatSummaryEmail({
        customerName: params.customerName,
        ticketNumber: params.ticketNumber,
        subject: params.subject,
        messages: params.messages,
        resolvedAt: params.resolvedAt,
        satisfactionSurveyUrl,
      })
    );

    const result = await resend.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: params.customerEmail,
      subject: `Ticket Resolved: ${params.subject} [#${params.ticketNumber}]`,
      html: emailHtml,
      replyTo: settings.replyTo,
    });

    console.log("Chat summary email sent:", result.id);
    return result;
  } catch (error) {
    console.error("Failed to send chat summary email:", error);
    throw error;
  }
}

// Test email function for admin settings page
export async function sendTestEmail(toEmail: string) {
  try {
    const resend = await getResendClient();
    const settings = await getEmailSettings();

    const result = await resend.emails.send({
      from: `${settings.fromName} <${settings.fromEmail}>`,
      to: toEmail,
      subject: "Test Email from LLCPad Support System",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937;">✅ Email Configuration Successful!</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 24px;">
            Your LLCPad support system email integration is working correctly.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            Email sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log("Test email sent:", result.id);
    return result;
  } catch (error) {
    console.error("Failed to send test email:", error);
    throw error;
  }
}
