import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { licenseService } from '@/services/license.service';
import { webhookService } from '@/services/webhook.service';
import { emailService } from '@/services/email.service';

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Parse Gumroad payload
  const payload = {
    seller_id: formData.get('seller_id') as string,
    product_id: formData.get('product_id') as string,
    product_name: formData.get('product_name') as string,
    email: formData.get('email') as string,
    full_name: formData.get('full_name') as string,
    sale_id: formData.get('sale_id') as string,
    sale_timestamp: formData.get('sale_timestamp') as string,
    price: formData.get('price') as string,
    variants: formData.get('variants') as string,
    license_key: formData.get('license_key') as string,
    refunded: formData.get('refunded') === 'true',
    quantity: formData.get('quantity') as string,
    order_number: formData.get('order_number') as string,
    is_gift_receiver_purchase: formData.get('is_gift_receiver_purchase') === 'true',
    test: formData.get('test') === 'true',
  };

  // Create webhook log
  const webhookLog = await webhookService.create({
    source: 'GUMROAD',
    eventType: payload.refunded ? 'refund' : 'sale',
    payload: payload as any,
  });

  // Skip test purchases
  if (payload.test) {
    await webhookService.updateStatus(webhookLog.id, 'IGNORED', 'Test purchase');
    return NextResponse.json({ success: true, message: 'Test purchase ignored' });
  }

  try {
    if (payload.refunded) {
      await handleGumroadRefund(payload, webhookLog.id);
    } else {
      await handleGumroadSale(payload, webhookLog.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gumroad webhook error:', error);
    await webhookService.updateStatus(webhookLog.id, 'FAILED', error.message, null, 500);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleGumroadSale(payload: any, webhookLogId: string) {
  // Find product by Gumroad product ID
  const product = await prisma.product.findFirst({
    where: { gumroadProductId: payload.product_id },
    include: { tiers: true },
  });

  if (!product) {
    throw new Error(`Product not found for Gumroad product ID: ${payload.product_id}`);
  }

  // Check for duplicate order
  const existingLicense = await prisma.license.findFirst({
    where: { orderId: `gumroad-${payload.sale_id}` },
  });

  if (existingLicense) {
    await webhookService.updateStatus(webhookLogId, 'IGNORED', 'Duplicate order', existingLicense.id);
    return;
  }

  // Parse tier from variants (e.g., "Tier: Professional")
  let tier: 'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE' | 'DEVELOPER' = 'STANDARD';
  if (payload.variants) {
    const variantLower = payload.variants.toLowerCase();
    if (variantLower.includes('developer')) {
      tier = 'DEVELOPER';
    } else if (variantLower.includes('enterprise')) {
      tier = 'ENTERPRISE';
    } else if (variantLower.includes('professional') || variantLower.includes('pro')) {
      tier = 'PROFESSIONAL';
    }
  }

  // Get tier config
  const tierConfig = product.tiers.find((t) => t.tier === tier);
  const maxDomains = tierConfig?.maxDomains ?? 1;

  // Calculate support expiry
  const supportExpiresAt = new Date();
  supportExpiresAt.setMonth(supportExpiresAt.getMonth() + (tierConfig?.supportMonths ?? 6));

  // Parse price (Gumroad sends price in cents)
  const price = payload.price ? parseFloat(payload.price) / 100 : 0;

  // Generate license
  const license = await licenseService.create({
    productId: product.id,
    tier,
    customerEmail: payload.email,
    customerName: payload.full_name,
    orderId: `gumroad-${payload.sale_id}`,
    orderSource: 'GUMROAD',
    purchasePrice: price,
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

async function handleGumroadRefund(payload: any, webhookLogId: string) {
  // Find license by order ID
  const license = await prisma.license.findFirst({
    where: { orderId: `gumroad-${payload.sale_id}` },
  });

  if (license) {
    await licenseService.updateStatus(license.id, 'REFUNDED');
    await webhookService.updateStatus(webhookLogId, 'SUCCESS', null, license.id, 200);
  } else {
    await webhookService.updateStatus(webhookLogId, 'IGNORED', 'License not found for refund');
  }
}
