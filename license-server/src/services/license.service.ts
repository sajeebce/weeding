import { nanoid, customAlphabet } from 'nanoid';
import { createHash } from 'crypto';
import prisma from '@/lib/db';
import { tokenService } from './token.service';
import type {
  License,
  LicenseTier,
  LicenseStatus,
  DomainLockMode,
  OrderSource,
  Product,
  LicenseActivation,
} from '@prisma/client';
import type {
  CreateLicenseInput,
  UpdateLicenseInput,
} from '@/lib/validations/license';

// Custom nanoid for license keys (uppercase alphanumeric)
const generateKeyPart = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

// Tier to max domains mapping
const TIER_DOMAINS: Record<LicenseTier, number> = {
  STANDARD: 1,
  PROFESSIONAL: 3,
  ENTERPRISE: 999, // Unlimited
  DEVELOPER: 999, // Unlimited
};

// Tier to features mapping (default)
const TIER_FEATURES: Record<LicenseTier, string[]> = {
  STANDARD: ['basic'],
  PROFESSIONAL: ['basic', 'advanced', 'priority-support'],
  ENTERPRISE: ['basic', 'advanced', 'priority-support', 'api-access', 'white-label'],
  DEVELOPER: ['basic', 'advanced', 'priority-support', 'api-access', 'white-label', 'source-code', 'resale'],
};

interface LicenseWithProduct extends License {
  product: Product;
}

interface LicenseWithActivations extends License {
  product: Product;
  activations: LicenseActivation[];
}

class LicenseService {
  /**
   * Generate a license key
   * Format: PREFIX-TIER-XXXXXXXX-XXXX
   * Example: LSP-PRO-A7B2K9M3-4X2Q
   */
  generateLicenseKey(keyPrefix: string, tier: LicenseTier): string {
    const tierCode = tier.substring(0, 3).toUpperCase(); // STD, PRO, ENT, DEV
    const part1 = generateKeyPart();
    const part2 = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4)();
    return `${keyPrefix}-${tierCode}-${part1}-${part2}`;
  }

  /**
   * Hash domain for quick lookup
   */
  hashDomain(domain: string): string {
    return createHash('sha256').update(domain.toLowerCase()).digest('hex');
  }

  /**
   * Normalize domain (lowercase, remove www)
   */
  normalizeDomain(domain: string): string {
    return domain.toLowerCase().replace(/^www\./, '');
  }

  /**
   * Create a new license
   */
  async create(
    input: CreateLicenseInput,
    createdById?: string
  ): Promise<License> {
    // Get product for key prefix
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { tiers: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get tier defaults
    const tierConfig = product.tiers.find((t) => t.tier === input.tier);
    const maxDomains = input.maxDomains ?? tierConfig?.maxDomains ?? TIER_DOMAINS[input.tier];
    const features = tierConfig?.features ?? TIER_FEATURES[input.tier];

    // Calculate support expiry if not provided
    let supportExpiresAt = input.supportExpiresAt
      ? new Date(input.supportExpiresAt)
      : undefined;

    if (!supportExpiresAt && tierConfig?.supportMonths) {
      supportExpiresAt = new Date();
      supportExpiresAt.setMonth(supportExpiresAt.getMonth() + tierConfig.supportMonths);
    }

    // Generate license key
    const licenseKey = this.generateLicenseKey(product.keyPrefix, input.tier);

    // Create license
    const license = await prisma.license.create({
      data: {
        licenseKey,
        productId: input.productId,
        tier: input.tier,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        domainLockMode: input.domainLockMode ?? 'LOCKED',
        maxDomains,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        supportExpiresAt,
        orderId: input.orderId,
        orderSource: input.orderSource ?? 'MANUAL',
        purchasePrice: input.purchasePrice,
        purchaseCurrency: input.purchaseCurrency ?? 'USD',
        features,
        notes: input.notes,
        createdById,
      },
    });

    return license;
  }

  /**
   * Get license by ID
   */
  async getById(id: string): Promise<LicenseWithActivations | null> {
    return prisma.license.findUnique({
      where: { id },
      include: {
        product: true,
        activations: {
          orderBy: { activatedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get license by key
   */
  async getByKey(licenseKey: string): Promise<LicenseWithProduct | null> {
    return prisma.license.findUnique({
      where: { licenseKey },
      include: { product: true },
    });
  }

  /**
   * Update license
   */
  async update(id: string, input: UpdateLicenseInput): Promise<License> {
    return prisma.license.update({
      where: { id },
      data: {
        ...input,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : input.expiresAt,
        supportExpiresAt: input.supportExpiresAt
          ? new Date(input.supportExpiresAt)
          : input.supportExpiresAt,
      },
    });
  }

  /**
   * Update license status
   */
  async updateStatus(id: string, status: LicenseStatus): Promise<License> {
    return prisma.license.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete license
   */
  async delete(id: string): Promise<void> {
    await prisma.license.delete({ where: { id } });
  }

  /**
   * List licenses with pagination and filters
   */
  async list(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: LicenseStatus;
    productId?: string;
    tier?: LicenseTier;
  }) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options.search) {
      where.OR = [
        { customerEmail: { contains: options.search, mode: 'insensitive' } },
        { customerName: { contains: options.search, mode: 'insensitive' } },
        { licenseKey: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.productId) {
      where.productId = options.productId;
    }

    if (options.tier) {
      where.tier = options.tier;
    }

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        include: {
          product: true,
          activations: {
            where: { isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.license.count({ where }),
    ]);

    return {
      licenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Verify license and activate domain
   */
  async verify(
    licenseKey: string,
    domain: string,
    pluginSlug: string,
    pluginVersion: string,
    cmsVersion?: string,
    serverInfo?: Record<string, string>,
    ipAddress?: string
  ) {
    const normalizedDomain = this.normalizeDomain(domain);
    const domainHash = this.hashDomain(normalizedDomain);

    // Get license with product and activations
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        product: true,
        activations: {
          where: { isActive: true },
        },
      },
    });

    // Check if license exists
    if (!license) {
      return {
        valid: false,
        error: 'INVALID_LICENSE_KEY',
        message: 'The license key provided is invalid or does not exist.',
      };
    }

    // Check if product matches
    if (license.product.slug !== pluginSlug) {
      return {
        valid: false,
        error: 'PRODUCT_MISMATCH',
        message: 'This license key is not valid for this product.',
      };
    }

    // Check license status
    if (license.status !== 'ACTIVE') {
      return {
        valid: false,
        error: `LICENSE_${license.status}`,
        message: `This license has been ${license.status.toLowerCase()}. Please contact support.`,
      };
    }

    // Check if license is expired
    if (license.expiresAt && new Date() > license.expiresAt) {
      return {
        valid: false,
        error: 'LICENSE_EXPIRED',
        message: 'This license has expired.',
        details: { expiredAt: license.expiresAt.toISOString() },
      };
    }

    // Check domain activation
    const existingActivation = license.activations.find(
      (a) => a.domain === normalizedDomain || a.domainHash === domainHash
    );

    let activation: LicenseActivation;
    let isNewActivation = false;

    if (existingActivation) {
      // Update existing activation
      activation = await prisma.licenseActivation.update({
        where: { id: existingActivation.id },
        data: {
          lastVerifiedAt: new Date(),
          lastTokenIssuedAt: new Date(),
          pluginVersion,
          cmsVersion,
          serverInfo,
          ipAddress,
        },
      });
    } else {
      // Check domain limit (only for LOCKED mode)
      if (license.domainLockMode === 'LOCKED') {
        const activeCount = license.activations.length;
        if (activeCount >= license.maxDomains) {
          return {
            valid: false,
            error: 'DOMAIN_LIMIT_EXCEEDED',
            message: 'This license has reached its maximum domain limit.',
            details: {
              maxDomains: license.maxDomains,
              activeDomains: license.activations.map((a) => a.domain),
              requestedDomain: normalizedDomain,
            },
          };
        }
      }

      // Create new activation
      activation = await prisma.licenseActivation.create({
        data: {
          licenseId: license.id,
          domain: normalizedDomain,
          domainHash,
          pluginVersion,
          cmsVersion,
          serverInfo,
          ipAddress,
          lastTokenIssuedAt: new Date(),
        },
      });
      isNewActivation = true;
    }

    // Generate JWT token
    const token = await tokenService.generateToken({
      licenseKey: license.licenseKey,
      productSlug: license.product.slug,
      tier: license.tier,
      features: license.features,
      domain: normalizedDomain,
      domainLockMode: license.domainLockMode,
      licenseExpiresAt: license.expiresAt?.toISOString() ?? null,
      supportExpiresAt: license.supportExpiresAt?.toISOString() ?? null,
    });

    const tokenExpiry = tokenService.getTokenExpiry();

    return {
      valid: true,
      token,
      tokenExpiresAt: tokenExpiry.toISOString(),
      license: {
        tier: license.tier,
        features: license.features,
        domainLockMode: license.domainLockMode,
        maxDomains: license.maxDomains,
        activeDomains: license.activations.length + (isNewActivation ? 1 : 0),
        expiresAt: license.expiresAt?.toISOString() ?? null,
        supportExpiresAt: license.supportExpiresAt?.toISOString() ?? null,
      },
      activation: {
        domain: normalizedDomain,
        activatedAt: activation.activatedAt.toISOString(),
        isNew: isNewActivation,
      },
    };
  }

  /**
   * Refresh token
   */
  async refreshToken(token: string, domain: string) {
    const normalizedDomain = this.normalizeDomain(domain);

    // Verify old token
    const payload = await tokenService.verifyToken(token);

    if (!payload) {
      return {
        valid: false,
        error: 'INVALID_TOKEN',
        message: 'Token is invalid or corrupted. Please re-verify license.',
      };
    }

    // Verify domain matches
    if (payload.domain !== normalizedDomain) {
      return {
        valid: false,
        error: 'DOMAIN_MISMATCH',
        message: 'Token domain does not match the request domain.',
      };
    }

    // Get license to ensure it's still valid
    const license = await prisma.license.findUnique({
      where: { licenseKey: payload.licenseKey },
      include: { product: true },
    });

    if (!license || license.status !== 'ACTIVE') {
      return {
        valid: false,
        error: 'LICENSE_INVALID',
        message: 'License is no longer valid.',
      };
    }

    // Check expiry
    if (license.expiresAt && new Date() > license.expiresAt) {
      return {
        valid: false,
        error: 'LICENSE_EXPIRED',
        message: 'This license has expired.',
      };
    }

    // Update activation
    await prisma.licenseActivation.updateMany({
      where: {
        licenseId: license.id,
        domain: normalizedDomain,
      },
      data: {
        lastVerifiedAt: new Date(),
        lastTokenIssuedAt: new Date(),
      },
    });

    // Generate new token
    const newToken = await tokenService.generateToken({
      licenseKey: license.licenseKey,
      productSlug: license.product.slug,
      tier: license.tier,
      features: license.features,
      domain: normalizedDomain,
      domainLockMode: license.domainLockMode,
      licenseExpiresAt: license.expiresAt?.toISOString() ?? null,
      supportExpiresAt: license.supportExpiresAt?.toISOString() ?? null,
    });

    const tokenExpiry = tokenService.getTokenExpiry();

    return {
      valid: true,
      token: newToken,
      tokenExpiresAt: tokenExpiry.toISOString(),
    };
  }

  /**
   * Deactivate domain
   */
  async deactivateDomain(licenseKey: string, domain: string) {
    const normalizedDomain = this.normalizeDomain(domain);

    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        activations: {
          where: { isActive: true },
        },
      },
    });

    if (!license) {
      return {
        success: false,
        message: 'License not found.',
      };
    }

    const activation = license.activations.find(
      (a) => a.domain === normalizedDomain
    );

    if (!activation) {
      return {
        success: false,
        message: 'Domain is not activated for this license.',
      };
    }

    await prisma.licenseActivation.update({
      where: { id: activation.id },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Domain deactivated successfully.',
      remainingSlots: license.maxDomains - license.activations.length + 1,
      maxDomains: license.maxDomains,
    };
  }
}

export const licenseService = new LicenseService();
