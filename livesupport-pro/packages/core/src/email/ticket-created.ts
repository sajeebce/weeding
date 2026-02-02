export interface TicketCreatedEmailData {
  customerName: string;
  ticketNumber: string;
  subject: string;
  message: string;
  dashboardUrl?: string;
  brandName?: string;
  brandColor?: string;
  supportEmail?: string;
}

export function getTicketCreatedEmail(data: TicketCreatedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    customerName,
    ticketNumber,
    subject,
    message,
    dashboardUrl,
    brandName = 'Support',
    brandColor = '#2563eb',
    supportEmail = 'support@example.com',
  } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Created</title>
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
              <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 20px;">We've received your support request</h2>

              <p style="color: #3f3f46; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Hi ${customerName},
              </p>

              <p style="color: #3f3f46; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for contacting ${brandName} Support. We've received your request and a member of our team will respond as soon as possible.
              </p>

              <!-- Ticket Details Box -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 5px 0;">
                      <span style="color: #71717a; font-size: 14px;">Ticket Number:</span>
                      <span style="color: #18181b; font-size: 14px; font-weight: 600; float: right;">${ticketNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; border-top: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Subject:</span>
                      <span style="color: #18181b; font-size: 14px; font-weight: 500; float: right;">${subject}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Original Message -->
              <div style="background-color: #fafafa; border-left: 4px solid ${brandColor}; padding: 15px 20px; margin: 20px 0;">
                <p style="color: #71717a; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Message:</p>
                <p style="color: #3f3f46; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>

              ${dashboardUrl ? `
              <p style="color: #3f3f46; margin: 20px 0; font-size: 16px; line-height: 1.6;">
                You can track your ticket and respond directly from your dashboard:
              </p>

              <table cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: ${brandColor}; border-radius: 6px;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500;">View Ticket</a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="color: #3f3f46; margin: 20px 0 0 0; font-size: 16px; line-height: 1.6;">
                Our typical response time is within 24 hours during business days.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 40px; text-align: center;">
              <p style="color: #71717a; margin: 0 0 10px 0; font-size: 14px;">
                Need immediate assistance? Reply to this email or contact us at ${supportEmail}
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
We've received your support request

Hi ${customerName},

Thank you for contacting ${brandName} Support. We've received your request and a member of our team will respond as soon as possible.

Ticket Details:
- Ticket Number: ${ticketNumber}
- Subject: ${subject}

Your Message:
${message}

${dashboardUrl ? `View your ticket: ${dashboardUrl}` : ''}

Our typical response time is within 24 hours during business days.

Need immediate assistance? Reply to this email or contact us at ${supportEmail}

© ${new Date().getFullYear()} ${brandName}. All rights reserved.
`;

  return {
    subject: `[${ticketNumber}] We've received your support request`,
    html,
    text,
  };
}
