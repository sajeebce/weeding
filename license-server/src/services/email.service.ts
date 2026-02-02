import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'LLCPad Licenses <noreply@llcpad.com>';

interface LicenseEmailData {
  customerEmail: string;
  customerName?: string;
  licenseKey: string;
  productName: string;
  tier: string;
  maxDomains: number;
  expiresAt?: string | null;
  supportExpiresAt?: string | null;
}

class EmailService {
  private enabled = !!resend;

  async sendLicenseDelivery(data: LicenseEmailData): Promise<boolean> {
    if (!this.enabled || !resend) {
      console.log('Email service disabled, skipping license delivery email');
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.customerEmail,
        subject: `Your ${data.productName} License Key`,
        html: this.getLicenseDeliveryTemplate(data),
      });

      if (error) {
        console.error('Failed to send license email:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send license email:', error);
      return false;
    }
  }

  async sendLicenseSuspended(email: string, licenseKey: string, productName: string): Promise<boolean> {
    if (!this.enabled || !resend) {
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `License Suspended - ${productName}`,
        html: `
          <h2>License Suspended</h2>
          <p>Your license key <code>${licenseKey}</code> for ${productName} has been suspended.</p>
          <p>If you believe this is an error, please contact our support team.</p>
        `,
      });

      return !error;
    } catch {
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    if (!this.enabled || !resend) {
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'Test Email from LLCPad License Server',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from your LLCPad License Server.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
        `,
      });

      return !error;
    } catch {
      return false;
    }
  }

  private getLicenseDeliveryTemplate(data: LicenseEmailData): string {
    const expiryInfo = data.expiresAt
      ? `<p><strong>Expires:</strong> ${new Date(data.expiresAt).toLocaleDateString()}</p>`
      : '<p><strong>Expires:</strong> Never (Lifetime License)</p>';

    const supportInfo = data.supportExpiresAt
      ? `<p><strong>Support Until:</strong> ${new Date(data.supportExpiresAt).toLocaleDateString()}</p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .license-box { background: white; border: 2px dashed #2563eb; padding: 15px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .license-key { font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; letter-spacing: 1px; }
          .details { margin: 20px 0; }
          .details p { margin: 5px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Purchase!</h1>
          </div>
          <div class="content">
            <p>Hi${data.customerName ? ` ${data.customerName}` : ''},</p>
            <p>Thank you for purchasing <strong>${data.productName}</strong>. Here is your license key:</p>

            <div class="license-box">
              <p class="license-key">${data.licenseKey}</p>
            </div>

            <div class="details">
              <p><strong>Product:</strong> ${data.productName}</p>
              <p><strong>License Tier:</strong> ${data.tier}</p>
              <p><strong>Max Domains:</strong> ${data.maxDomains === 999 ? 'Unlimited' : data.maxDomains}</p>
              ${expiryInfo}
              ${supportInfo}
            </div>

            <h3>Getting Started</h3>
            <ol>
              <li>Install the plugin on your website</li>
              <li>Go to the plugin settings page</li>
              <li>Enter your license key to activate</li>
            </ol>

            <p>If you have any questions, please don't hesitate to contact our support team.</p>

            <div class="footer">
              <p>This email was sent by LLCPad License Server</p>
              <p>Please keep this email for your records</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
