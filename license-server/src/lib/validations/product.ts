import { z } from 'zod';

export const createProductSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  currentVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default('1.0.0'),
  keyPrefix: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Z]+$/, 'Key prefix must be uppercase letters only'),
  envatoItemId: z.string().optional(),
  gumroadProductId: z.string().optional(),
  tiers: z
    .array(
      z.object({
        tier: z.enum(['STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'DEVELOPER']),
        name: z.string().min(1).max(100),
        price: z.number().min(0),
        currency: z.string().length(3).default('USD'),
        maxDomains: z.number().int().min(1).default(1),
        features: z.array(z.string()),
        supportMonths: z.number().int().min(0).default(6),
      })
    )
    .optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  currentVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .optional(),
  isActive: z.boolean().optional(),
  envatoItemId: z.string().nullable().optional(),
  gumroadProductId: z.string().nullable().optional(),
});

export const productTierSchema = z.object({
  tier: z.enum(['STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'DEVELOPER']),
  name: z.string().min(1).max(100),
  price: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  maxDomains: z.number().int().min(1).default(1),
  features: z.array(z.string()),
  supportMonths: z.number().int().min(0).default(6),
  isActive: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductTierInput = z.infer<typeof productTierSchema>;
