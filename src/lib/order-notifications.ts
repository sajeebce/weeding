/**
 * Order Notification Service
 * Handles sending email notifications for order and payment events
 */

import { sendEmail, getEmailConfig } from "./email";
import {
  getEmailTemplate,
  getEmailSubject,
  EmailTemplateType,
} from "./email-templates";

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  servicePrice: number;
  currency?: string;
  createdAt: Date;
  status?: string;
  statusMessage?: string;
}

function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getOrderUrl(orderNumber: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/orders/${orderNumber}`;
}

function getAdminOrderUrl(orderId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/admin/orders/${orderId}`;
}

/**
 * Send notification email for an order event
 */
async function sendOrderNotification(
  type: EmailTemplateType,
  order: OrderData,
  recipientEmail: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getEmailConfig();

    // Check if notifications are enabled for this type
    const notificationKey = `notify${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof config.notifications;
    if (!config.notifications[notificationKey]) {
      return { success: true }; // Notification disabled, skip silently
    }

    const emailData = {
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      serviceName: order.serviceName,
      servicePrice: formatPrice(order.servicePrice, order.currency),
      orderDate: formatDate(order.createdAt),
      orderUrl: isAdmin ? getAdminOrderUrl(order.id) : getOrderUrl(order.orderNumber),
      statusMessage: order.statusMessage,
    };

    const html = getEmailTemplate(type, emailData);
    const subject = getEmailSubject(type, order.orderNumber);

    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });

    return result;
  } catch (error) {
    console.error(`Failed to send ${type} notification:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Notify customer when order is placed
 */
export async function notifyOrderPlaced(order: OrderData): Promise<void> {
  // Send to customer
  await sendOrderNotification("orderPlaced", order, order.customerEmail);

  // Send to admin
  const config = await getEmailConfig();
  if (config.notifications.adminNewOrder && config.adminEmail) {
    await sendOrderNotification("adminNewOrder", order, config.adminEmail, true);
  }
}

/**
 * Notify customer when order is confirmed
 */
export async function notifyOrderConfirmed(order: OrderData): Promise<void> {
  await sendOrderNotification("orderConfirmed", order, order.customerEmail);
}

/**
 * Notify customer when order is processing
 */
export async function notifyOrderProcessing(order: OrderData): Promise<void> {
  await sendOrderNotification("orderProcessing", order, order.customerEmail);
}

/**
 * Notify customer when order is completed
 */
export async function notifyOrderCompleted(order: OrderData): Promise<void> {
  await sendOrderNotification("orderCompleted", order, order.customerEmail);
}

/**
 * Notify customer when payment is successful
 */
export async function notifyPaymentSuccess(order: OrderData): Promise<void> {
  await sendOrderNotification("paymentSuccess", order, order.customerEmail);
}

/**
 * Notify customer when payment fails
 */
export async function notifyPaymentFailed(order: OrderData): Promise<void> {
  await sendOrderNotification("paymentFailed", order, order.customerEmail);
}

/**
 * Send notification based on order status change
 */
export async function notifyOrderStatusChange(
  order: OrderData,
  newStatus: string
): Promise<void> {
  const statusMap: Record<string, () => Promise<void>> = {
    confirmed: () => notifyOrderConfirmed(order),
    processing: () => notifyOrderProcessing(order),
    completed: () => notifyOrderCompleted(order),
  };

  const notifyFn = statusMap[newStatus.toLowerCase()];
  if (notifyFn) {
    await notifyFn();
  }
}

/**
 * Send notification based on payment status change
 */
export async function notifyPaymentStatusChange(
  order: OrderData,
  paymentStatus: string
): Promise<void> {
  const statusMap: Record<string, () => Promise<void>> = {
    paid: () => notifyPaymentSuccess(order),
    failed: () => notifyPaymentFailed(order),
  };

  const notifyFn = statusMap[paymentStatus.toLowerCase()];
  if (notifyFn) {
    await notifyFn();
  }
}
