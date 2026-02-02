import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { licenseService } from '@/services/license.service';
import { webhookService } from '@/services/webhook.service';
import { emailService } from '@/services/email.service';

// Verify Envato webhook signature
function verifyEnvatoSignature(payload: string, signature: string): boolean {
  const secret = process.env.ENVATO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('ENVATO_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-envato-signature') || '';
  const payload = await request.text();

  // Create webhook log
  let webhookLog;
  try {
    const parsedPayload = JSON.parse(payload);
    webhookLog = await webhookService.create({
      source: 'ENVATO',
      eventType: parsedPayload.event || 'unknown',
      headers: Object.fromEntries(request.headers.entries()),
      payload: parsedPayload,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  try {
    // Verify signature (skip in development if secret not set)
    if (process.env.NODE_ENV === 'production' && process.env.ENVATO_WEBHOOK_SECRET) {
      if (!verifyEnvatoSignature(payload, signature)) {
        await webhookService.updateStatus(webhookLog.id, 'FAILED', 'Invalid signature', null, 401);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(payload);

    // Handle different event types
    switch (data.event) {
      case 'sale':
        await handleEnvatoSale(data, webhookLog.id);
        break;

      case 'refund':
        await handleEnvatoRefund(data, webhookLog.id);
        break;

      default:
        await webhookService.updateStatus(webhookLog.id, 'IGNORED', `Unknown event: ${data.event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Envato webhook error:', error);
    await webhookService.updateStatus(webhookLog.id, 'FAILED', error.message, null, 500);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleEnvatoSale(data: any, webhookLogId: string) {
  const { sale } = data;

  // Map Envato license type to our tiers
  const tier = sale.license === 'Extended License' ? 'PROFESSIONAL' : 'STANDARD';

  // Find product by Envato item ID
  const product = await prisma.product.findFirst({
    where: { envatoItemId: sale.item_id?.toString() },
    include: { tiers: true },
  });

  if (!product) {
    throw new Error(`Product not found for Envato item ID: ${sale.item_id}`);
  }

  // Check for duplicate order
  const existingLicense = await prisma.license.findFirst({
    where: { orderId: `envato-${sale.id}` },
  });

  if (existingLicense) {
    await webhookService.updateStatus(webhookLogId, 'IGNORED', 'Duplicate order', existingLicense.id);
    return;
  }

  // Get tier config
  const tierConfig = product.tiers.find((t) => t.tier === tier);
  const maxDomains = tierConfig?.maxDomains ?? (tier === 'PROFESSIONAL' ? 3 : 1);

  // Calculate support expiry
  const supportExpiresAt = new Date();
  supportExpiresAt.setMonth(supportExpiresAt.getMonth() + (tierConfig?.supportMonths ?? 6));

  // Generate license
  const license = await licenseService.create({
    productId: product.id,
    tier: tier as any,
    customerEmail: sale.buyer_email || `${sale.buyer}@envato.com`,
    customerName: sale.buyer,
    orderId: `envato-${sale.id}`,
    orderSource: 'ENVATO',
    purchasePrice: parseFloat(sale.amount) || 0,
    purchaseCurrency: 'USD',
    maxDomains,
    supportExpiresAt: supportExpiresAt.toISOString(),
    sendEmail: true,
  });

  // Send license email
  await emailService.sendLicenseDelivery({
    customerEmail: license.customerEmail,
    customerName: license.customerName || undefined,
    licenseKey: license.licenseKey,
    productName: product.name,
    tier: license.tier,
    maxDomains: license.maxDomains,
    expiresAt: license.expiresAt?.toISOString(),
    supportExpiresAt: license.supportExpiresAt?.toISOString(),
  });

  await webhookService.updateStatus(webhookLogId, 'SUCCESS', null, license.id, 200);
}

async function handleEnvatoRefund(data: any, webhookLogId: string) {
  const { refund } = data;

  // Find license by order ID
  const license = await prisma.license.findFirst({
    where: { orderId: `envato-${refund.sale_id}` },
  });

  if (license) {
    await licenseService.updateStatus(license.id, 'REFUNDED');
    await webhookService.updateStatus(webhookLogId, 'SUCCESS', null, license.id, 200);
  } else {
    await webhookService.updateStatus(webhookLogId, 'IGNORED', 'License not found for refund');
  }
}
