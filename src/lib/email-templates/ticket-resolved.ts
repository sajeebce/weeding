interface TicketResolvedEmailData {
  customerName: string;
  ticketNumber: string;
  subject: string;
  resolvedBy: string;
  summary?: string;
  feedbackUrl?: string;
}

export function getTicketResolvedEmail(data: TicketResolvedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { customerName, ticketNumber, subject, resolvedBy, summary, feedbackUrl } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Support Ticket Has Been Resolved</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #16a34a; padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Ticket Resolved</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <!-- Success Icon -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 20px; text-align: center;">Your ticket has been resolved!</h2>

              <p style="color: #3f3f46; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Hi ${customerName},
              </p>

              <p style="color: #3f3f46; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Good news! Your support ticket has been marked as resolved by ${resolvedBy}.
              </p>

              <!-- Ticket Details -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #71717a; font-size: 14px;">Ticket Number:</span>
                      <span style="color: #18181b; font-size: 14px; font-weight: 600; float: right;">${ticketNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Subject:</span>
                      <span style="color: #18181b; font-size: 14px; float: right;">${subject}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e4e4e7;">
                      <span style="color: #71717a; font-size: 14px;">Status:</span>
                      <span style="color: #16a34a; font-size: 14px; font-weight: 600; float: right;">Resolved ✓</span>
                    </td>
                  </tr>
                </table>
              </div>

              ${summary ? `
              <div style="margin: 25px 0;">
                <p style="color: #71717a; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Resolution Summary:</p>
                <p style="color: #3f3f46; margin: 0; font-size: 14px; line-height: 1.6; background-color: #fafafa; padding: 15px; border-radius: 6px;">${summary}</p>
              </div>
              ` : ''}

              <p style="color: #3f3f46; margin: 20px 0; font-size: 16px; line-height: 1.6;">
                If your issue hasn't been fully addressed or you have additional questions, simply reply to this email and we'll reopen your ticket.
              </p>

              ${feedbackUrl ? `
              <!-- Feedback CTA -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
                  We'd love to hear about your experience!
                </p>
                <a href="${feedbackUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 6px;">Rate Our Support</a>
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 40px; text-align: center;">
              <p style="color: #71717a; margin: 0 0 10px 0; font-size: 14px;">
                Thank you for choosing LLCPad!
              </p>
              <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} LLCPad. All rights reserved.
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
Your ticket has been resolved!

Hi ${customerName},

Good news! Your support ticket has been marked as resolved by ${resolvedBy}.

Ticket Details:
- Ticket Number: ${ticketNumber}
- Subject: ${subject}
- Status: Resolved

${summary ? `Resolution Summary:\n${summary}\n` : ''}

If your issue hasn't been fully addressed or you have additional questions, simply reply to this email and we'll reopen your ticket.

${feedbackUrl ? `We'd love to hear about your experience! Rate our support: ${feedbackUrl}` : ''}

Thank you for choosing LLCPad!

© ${new Date().getFullYear()} LLCPad. All rights reserved.
`;

  return {
    subject: `[${ticketNumber}] Your support ticket has been resolved`,
    html,
    text,
  };
}
