export interface TicketReplyEmailData {
  customerName: string;
  ticketNumber: string;
  subject: string;
  agentName: string;
  replyContent: string;
  dashboardUrl?: string;
  brandName?: string;
  brandColor?: string;
}

export function getTicketReplyEmail(data: TicketReplyEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    customerName,
    ticketNumber,
    subject,
    agentName,
    replyContent,
    dashboardUrl,
    brandName = 'Support',
    brandColor = '#2563eb',
  } = data;

  const agentInitials = agentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Reply to Your Support Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${brandColor}; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${brandName} Support</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 20px;">New reply to your support ticket</h2>

              <p style="color: #3f3f46; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Hi ${customerName},
              </p>

              <p style="color: #3f3f46; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                ${agentName} from our support team has responded to your ticket.
              </p>

              <!-- Ticket Reference -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 15px 20px; margin: 20px 0;">
                <p style="color: #71717a; margin: 0; font-size: 14px;">
                  <strong style="color: #18181b;">${ticketNumber}</strong> - ${subject}
                </p>
              </div>

              <!-- Reply Content -->
              <div style="background-color: #f0f9ff; border-left: 4px solid ${brandColor}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="width: 36px; height: 36px; background-color: ${brandColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <span style="color: #ffffff; font-weight: 600; font-size: 14px;">${agentInitials}</span>
                  </div>
                  <div>
                    <p style="color: #18181b; margin: 0; font-size: 14px; font-weight: 600;">${agentName}</p>
                    <p style="color: #71717a; margin: 0; font-size: 12px;">${brandName} Support Team</p>
                  </div>
                </div>
                <div style="color: #3f3f46; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${replyContent}</div>
              </div>

              ${dashboardUrl ? `
              <p style="color: #3f3f46; margin: 20px 0; font-size: 16px; line-height: 1.6;">
                To view the full conversation and reply, click below:
              </p>

              <table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: ${brandColor}; border-radius: 6px;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500;">View & Reply</a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color: #71717a; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                You can also reply directly to this email to continue the conversation.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 40px; text-align: center;">
              <p style="color: #71717a; margin: 0 0 10px 0; font-size: 14px;">
                Questions? Just reply to this email.
              </p>
              <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} ${brandName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
New reply to your support ticket

Hi ${customerName},

${agentName} from our support team has responded to your ticket.

Ticket: ${ticketNumber} - ${subject}

---
${agentName}:

${replyContent}
---

${dashboardUrl ? `View the full conversation and reply: ${dashboardUrl}` : ''}

You can also reply directly to this email to continue the conversation.

© ${new Date().getFullYear()} ${brandName}. All rights reserved.
`;

  return {
    subject: `Re: [${ticketNumber}] ${subject}`,
    html,
    text,
  };
}
