import prisma from '@/lib/db';
import type { Product, ProductTier, LicenseTier } from '@prisma/client';
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductTierInput,
} from '@/lib/validations/product';

type ProductWithTiers = Product & {
  tiers: ProductTier[];
  _count: {
    licenses: number;
  };
};

class ProductService {
  /**
   * Create a new product
   */
  async create(input: CreateProductInput): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        currentVersion: input.currentVersion ?? '1.0.0',
        keyPrefix: input.keyPrefix,
        envatoItemId: input.envatoItemId,
        gumroadProductId: input.gumroadProductId,
        tiers: input.tiers
          ? {
              create: input.tiers.map((t) => ({
                tier: t.tier as LicenseTier,
                name: t.name,
                price: t.price,
                currency: t.currency,
                maxDomains: t.maxDomains,
                features: t.features,
                supportMonths: t.supportMonths,
              })),
            }
          : undefined,
      },
      include: { tiers: true },
    });

    return product;
  }

  /**
   * Get product by ID
   */
  async getById(id: string): Promise<ProductWithTiers | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        tiers: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: { licenses: true },
        },
      },
    });
  }

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<ProductWithTiers | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        tiers: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: { licenses: true },
        },
      },
    });
  }

  /**
   * Update product
   */
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    // Check if there are licenses
    const count = await prisma.license.count({
      where: { productId: id },
    });

    if (count > 0) {
      throw new Error(
        'Cannot delete product with existing licenses. Deactivate it instead.'
      );
    }

    await prisma.product.delete({ where: { id } });
  }

  /**
   * List all products
   */
  async list(options?: { includeInactive?: boolean }) {
    const where: any = {};

    if (!options?.includeInactive) {
      where.isActive = true;
    }

    return prisma.product.findMany({
      where,
      include: {
        tiers: {
          orderBy: { price: 'asc' },
        },
        _count: {
          select: { licenses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Add tier to product
   */
  async addTier(productId: string, input: ProductTierInput): Promise<ProductTier> {
    return prisma.productTier.create({
      data: {
        productId,
        tier: input.tier as LicenseTier,
        name: input.name,
        price: input.price,
        currency: input.currency,
        maxDomains: input.maxDomains,
        features: input.features,
        supportMonths: input.supportMonths,
        isActive: input.isActive,
      },
    });
  }

  /**
   * Update tier
   */
  async updateTier(
    tierId: string,
    input: Partial<ProductTierInput>
  ): Promise<ProductTier> {
    return prisma.productTier.update({
      where: { id: tierId },
      data: input,
    });
  }

  /**
   * Delete tier
   */
  async deleteTier(tierId: string): Promise<void> {
    await prisma.productTier.delete({ where: { id: tierId } });
  }
}

export const productService = new ProductService();
