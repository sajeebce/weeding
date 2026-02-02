import prisma from '@/lib/db';
import type { OrderSource, WebhookStatus } from '@prisma/client';

interface CreateWebhookLogInput {
  source: OrderSource;
  eventType: string;
  headers?: Record<string, string>;
  payload: Record<string, unknown>;
}

class WebhookService {
  async create(input: CreateWebhookLogInput) {
    return prisma.webhookLog.create({
      data: {
        source: input.source,
        eventType: input.eventType,
        headers: input.headers,
        payload: input.payload,
        status: 'PENDING',
      },
    });
  }

  async updateStatus(
    id: string,
    status: WebhookStatus,
    errorMessage?: string | null,
    licenseId?: string | null,
    responseCode?: number
  ) {
    return prisma.webhookLog.update({
      where: { id },
      data: {
        status,
        errorMessage,
        licenseId,
        responseCode,
        processedAt: ['SUCCESS', 'FAILED', 'IGNORED'].includes(status)
          ? new Date()
          : undefined,
      },
    });
  }

  async incrementRetry(id: string) {
    return prisma.webhookLog.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
      },
    });
  }

  async getById(id: string) {
    return prisma.webhookLog.findUnique({
      where: { id },
    });
  }

  async getRecent(limit = 100) {
    return prisma.webhookLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPending() {
    return prisma.webhookLog.findMany({
      where: {
        status: 'PENDING',
        retryCount: { lt: 3 },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const webhookService = new WebhookService();
