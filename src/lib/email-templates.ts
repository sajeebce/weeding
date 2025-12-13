/**
 * Email Templates for LLCPad
 * Beautiful HTML email templates for order notifications
 */

interface OrderEmailData {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  servicePrice: string;
  orderDate: string;
  orderUrl: string;
  statusMessage?: string;
}

// Base template wrapper with styles
function baseTemplate(content: string): string {
  const year = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LLCPad</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">LLCPad</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Your Trusted Business Formation Partner</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">Need help? Contact our support team</p>
                    <a href="mailto:support@llcpad.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">support@llcpad.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 20px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">© ${year} LLCPad. All rights reserved.</p>
                    <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px;">
                      This email was sent to you because you have an account with LLCPad.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Status badge HTML
function statusBadge(status: string, color: string): string {
  return `
    <span style="display: inline-block; padding: 6px 16px; background-color: ${color}; color: #ffffff; font-size: 12px; font-weight: 600; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
      ${status}
    </span>
  `;
}

// Order details section
function orderDetailsSection(data: OrderEmailData): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; margin: 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 600;">#${data.orderNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Service</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${data.serviceName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Amount</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 18px; font-weight: 700;">${data.servicePrice}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 16px;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 14px;">${data.orderDate}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

// CTA Button
function ctaButton(text: string, url: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// Order Placed Email
export function orderPlacedEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      ${statusBadge("Order Placed", "#22c55e")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      Thank You for Your Order!
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${data.customerName}, we've received your order and our team is getting started on it.
    </p>

    ${orderDetailsSection(data)}

    <p style="margin: 0 0 8px; color: #475569; font-size: 14px; line-height: 1.6;">
      <strong>What's next?</strong>
    </p>
    <ul style="margin: 0 0 24px; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
      <li>Our team will review your order</li>
      <li>You'll receive updates as we process your request</li>
      <li>Contact us if you have any questions</li>
    </ul>

    ${ctaButton("View Order Details", data.orderUrl)}
  `;

  return baseTemplate(content);
}

// Order Confirmed Email
export function orderConfirmedEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      ${statusBadge("Confirmed", "#3b82f6")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      Your Order is Confirmed!
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${data.customerName}, great news! Your order has been confirmed and we're preparing to start work on it.
    </p>

    ${orderDetailsSection(data)}

    ${ctaButton("Track Your Order", data.orderUrl)}
  `;

  return baseTemplate(content);
}

// Order Processing Email
export function orderProcessingEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      ${statusBadge("Processing", "#f59e0b")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      We're Working on Your Order
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${data.customerName}, your order is now being processed by our team. We'll keep you updated on the progress.
    </p>

    ${orderDetailsSection(data)}

    ${data.statusMessage ? `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>Update:</strong> ${data.statusMessage}
        </p>
      </div>
    ` : ''}

    ${ctaButton("View Progress", data.orderUrl)}
  `;

  return baseTemplate(content);
}

// Order Completed Email
export function orderCompletedEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 50%; margin-bottom: 16px; line-height: 64px;">
        <span style="color: #ffffff; font-size: 32px;">✓</span>
      </div>
      <br>
      ${statusBadge("Completed", "#22c55e")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      Your Order is Complete!
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${data.customerName}, we're happy to let you know that your order has been completed successfully!
    </p>

    ${orderDetailsSection(data)}

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
      <p style="margin: 0 0 8px; color: #166534; font-size: 14px; font-weight: 600;">
        🎉 Thank you for choosing LLCPad!
      </p>
      <p style="margin: 0; color: #15803d; font-size: 13px;">
        We hope you're satisfied with our service. Feel free to reach out if you need anything else.
      </p>
    </div>

    ${ctaButton("View Order Details", data.orderUrl)}
  `;

  return baseTemplate(content);
}

// Payment Success Email
export function paymentSuccessEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      ${statusBadge("Payment Successful", "#22c55e")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      Payment Received!
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${data.customerName}, we've successfully received your payment. Thank you!
    </p>

    ${orderDetailsSection(data)}

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; color: #166534; font-size: 14px; text-align: center;">
        ✅ Your payment of <strong>${data.servicePrice}</strong> has been confirmed
      </p>
    </div>

    ${ctaButton("View Receipt", data.orderUrl)}
  `;

  return baseTemplate(content);
}

// Payment Failed Email
export function paymentFailedEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      ${statusBadge("Payment Failed", "#ef4444")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      Payment Issue
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      Hi ${data.customerName}, unfortunately we were unable to process your payment.
    </p>

    ${orderDetailsSection(data)}

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">
        What you can do:
      </p>
      <ul style="margin: 0; padding-left: 20px; color: #b91c1c; font-size: 13px; line-height: 1.6;">
        <li>Check that your card details are correct</li>
        <li>Ensure sufficient funds are available</li>
        <li>Try a different payment method</li>
        <li>Contact your bank if the issue persists</li>
      </ul>
    </div>

    ${ctaButton("Retry Payment", data.orderUrl)}

    <p style="margin: 24px 0 0; color: #64748b; font-size: 13px; text-align: center;">
      Need help? Our support team is here to assist you.
    </p>
  `;

  return baseTemplate(content);
}

// Admin New Order Notification
export function adminNewOrderEmail(data: OrderEmailData): string {
  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      ${statusBadge("New Order", "#8b5cf6")}
    </div>

    <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 600; text-align: center;">
      New Order Received!
    </h2>

    <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
      A new order has been placed and requires attention.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; margin: 24px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Customer</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 600;">${data.customerName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 600;">#${data.orderNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Service</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 16px; font-weight: 500;">${data.serviceName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 0; border-bottom: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Amount</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 18px; font-weight: 700; color: #22c55e;">${data.servicePrice}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top: 16px;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                <p style="margin: 4px 0 0; color: #1e293b; font-size: 14px;">${data.orderDate}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${ctaButton("View in Admin Panel", data.orderUrl)}
  `;

  return baseTemplate(content);
}

// Export all template types
export type EmailTemplateType =
  | 'orderPlaced'
  | 'orderConfirmed'
  | 'orderProcessing'
  | 'orderCompleted'
  | 'paymentSuccess'
  | 'paymentFailed'
  | 'adminNewOrder';

// Get template by type
export function getEmailTemplate(type: EmailTemplateType, data: OrderEmailData): string {
  switch (type) {
    case 'orderPlaced':
      return orderPlacedEmail(data);
    case 'orderConfirmed':
      return orderConfirmedEmail(data);
    case 'orderProcessing':
      return orderProcessingEmail(data);
    case 'orderCompleted':
      return orderCompletedEmail(data);
    case 'paymentSuccess':
      return paymentSuccessEmail(data);
    case 'paymentFailed':
      return paymentFailedEmail(data);
    case 'adminNewOrder':
      return adminNewOrderEmail(data);
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

// Get email subject by type
export function getEmailSubject(type: EmailTemplateType, orderNumber: string): string {
  switch (type) {
    case 'orderPlaced':
      return `Order Confirmation - #${orderNumber}`;
    case 'orderConfirmed':
      return `Order Confirmed - #${orderNumber}`;
    case 'orderProcessing':
      return `Order Update - #${orderNumber}`;
    case 'orderCompleted':
      return `Order Completed - #${orderNumber}`;
    case 'paymentSuccess':
      return `Payment Received - #${orderNumber}`;
    case 'paymentFailed':
      return `Payment Issue - #${orderNumber}`;
    case 'adminNewOrder':
      return `[Admin] New Order - #${orderNumber}`;
    default:
      return `Order Update - #${orderNumber}`;
  }
}
