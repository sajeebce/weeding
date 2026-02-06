/**
 * New Lead Email Template
 *
 * Generates email content for admin notification when a new lead is submitted.
 */

interface NewLeadEmailParams {
  leadId: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  source: string;
  score: number;
  interestedIn?: string[];
  budget?: string;
  timeline?: string;
  message?: string;
  formName?: string;
  adminUrl: string;
}

interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function getNewLeadEmail(params: NewLeadEmailParams): EmailContent {
  const {
    leadId,
    firstName,
    lastName,
    email,
    phone,
    company,
    country,
    source,
    score,
    interestedIn,
    budget,
    timeline,
    message,
    formName,
    adminUrl,
  } = params;

  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  const leadUrl = `${adminUrl}/admin/leads/${leadId}`;

  // Determine score label and color
  let scoreLabel = "Low";
  let scoreColor = "#94a3b8";
  if (score >= 70) {
    scoreLabel = "Hot";
    scoreColor = "#ef4444";
  } else if (score >= 40) {
    scoreLabel = "Warm";
    scoreColor = "#f59e0b";
  }

  const subject = `New Lead: ${fullName}${company ? ` from ${company}` : ""} (Score: ${score})`;

  // Build HTML email
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Received</h1>
    ${formName ? `<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">via ${formName}</p>` : ""}
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <!-- Score Badge -->
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="display: inline-block; background: ${scoreColor}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600;">
        ${scoreLabel} Lead - Score: ${score}
      </span>
    </div>

    <!-- Contact Info -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Contact Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 120px;">Name:</td>
          <td style="padding: 8px 0; color: #111827; font-weight: 500;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
          <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a></td>
        </tr>
        ` : ""}
        ${company ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Company:</td>
          <td style="padding: 8px 0; color: #111827;">${company}</td>
        </tr>
        ` : ""}
        ${country ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Country:</td>
          <td style="padding: 8px 0; color: #111827;">${country}</td>
        </tr>
        ` : ""}
      </table>
    </div>

    <!-- Interest & Intent -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Interest & Intent</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; width: 120px;">Source:</td>
          <td style="padding: 8px 0; color: #111827;">${source.replace(/_/g, " ")}</td>
        </tr>
        ${interestedIn && interestedIn.length > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Interested In:</td>
          <td style="padding: 8px 0; color: #111827;">${interestedIn.join(", ")}</td>
        </tr>
        ` : ""}
        ${budget ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Budget:</td>
          <td style="padding: 8px 0; color: #111827;">${budget}</td>
        </tr>
        ` : ""}
        ${timeline ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Timeline:</td>
          <td style="padding: 8px 0; color: #111827;">${timeline}</td>
        </tr>
        ` : ""}
      </table>
    </div>

    ${message ? `
    <!-- Message -->
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #111827; font-size: 18px; margin: 0 0 15px 0;">Message</h2>
      <p style="color: #374151; margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
    ` : ""}

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 25px;">
      <a href="${leadUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        View Lead Details
      </a>
    </div>
  </div>

  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="color: #6b7280; margin: 0; font-size: 14px;">
      This is an automated notification from your CRM system.
    </p>
  </div>
</body>
</html>
  `.trim();

  // Build plain text version
  const textLines = [
    `NEW LEAD RECEIVED`,
    formName ? `Via: ${formName}` : "",
    "",
    `SCORE: ${score} (${scoreLabel})`,
    "",
    "CONTACT INFORMATION",
    `Name: ${fullName}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : "",
    company ? `Company: ${company}` : "",
    country ? `Country: ${country}` : "",
    "",
    "INTEREST & INTENT",
    `Source: ${source.replace(/_/g, " ")}`,
    interestedIn && interestedIn.length > 0 ? `Interested In: ${interestedIn.join(", ")}` : "",
    budget ? `Budget: ${budget}` : "",
    timeline ? `Timeline: ${timeline}` : "",
    "",
    message ? `MESSAGE:\n${message}\n` : "",
    "",
    `View lead details: ${leadUrl}`,
  ].filter(Boolean);

  const text = textLines.join("\n");

  return { subject, html, text };
}
