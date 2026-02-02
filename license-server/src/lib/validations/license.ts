import { z } from 'zod';

export const verifyLicenseSchema = z.object({
  licenseKey: z
    .string()
    .min(10)
    .max(50)
    .regex(/^[A-Z0-9-]+$/, 'Invalid license key format'),

  domain: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/,
      'Invalid domain format'
    ),

  pluginSlug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),

  pluginVersion: z.string().regex(/^\d+\.\d+\.\d+$/),

  cmsVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .optional(),

  serverInfo: z
    .object({
      nodeVersion: z.string().optional(),
      os: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1),
  domain: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/,
      'Invalid domain format'
    ),
});

export const deactivateDomainSchema = z.object({
  licenseKey: z
    .string()
    .min(10)
    .max(50)
    .regex(/^[A-Z0-9-]+$/, 'Invalid license key format'),
  domain: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/,
      'Invalid domain format'
    ),
});

export const createLicenseSchema = z.object({
  productId: z.string().min(1),
  tier: z.enum(['STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'DEVELOPER']),
  customerEmail: z.string().email(),
  customerName: z.string().max(255).optional(),
  domainLockMode: z.enum(['LOCKED', 'UNLOCKED']).default('LOCKED'),
  maxDomains: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  supportExpiresAt: z.string().datetime().optional(),
  orderId: z.string().max(255).optional(),
  orderSource: z.enum(['MANUAL', 'ENVATO', 'GUMROAD', 'STRIPE']).optional(),
  purchasePrice: z.number().min(0).optional(),
  purchaseCurrency: z.string().length(3).optional(),
  notes: z.string().max(2000).optional(),
  sendEmail: z.boolean().default(true),
});

export const updateLicenseSchema = z.object({
  status: z
    .enum(['ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'REFUNDED'])
    .optional(),
  tier: z.enum(['STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'DEVELOPER']).optional(),
  domainLockMode: z.enum(['LOCKED', 'UNLOCKED']).optional(),
  maxDomains: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  supportExpiresAt: z.string().datetime().nullable().optional(),
  features: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
});

export type VerifyLicenseInput = z.infer<typeof verifyLicenseSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type DeactivateDomainInput = z.infer<typeof deactivateDomainSchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>;
