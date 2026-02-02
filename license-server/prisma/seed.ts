import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@llcpad.com' },
    update: {},
    create: {
      email: 'admin@llcpad.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create sample product: LiveSupport Pro
  const livesupportProduct = await prisma.product.upsert({
    where: { slug: 'livesupport-pro' },
    update: {},
    create: {
      slug: 'livesupport-pro',
      name: 'LiveSupport Pro',
      description: 'Professional live chat and ticketing system for customer support',
      currentVersion: '1.0.0',
      keyPrefix: 'LSP',
      isActive: true,
      tiers: {
        create: [
          {
            tier: 'STANDARD',
            name: 'Standard',
            price: 49,
            currency: 'USD',
            maxDomains: 1,
            features: ['chat', 'tickets', 'email-support'],
            supportMonths: 6,
          },
          {
            tier: 'PROFESSIONAL',
            name: 'Professional',
            price: 99,
            currency: 'USD',
            maxDomains: 3,
            features: ['chat', 'tickets', 'email-support', 'ai-responses', 'analytics'],
            supportMonths: 12,
          },
          {
            tier: 'ENTERPRISE',
            name: 'Enterprise',
            price: 249,
            currency: 'USD',
            maxDomains: 999,
            features: ['chat', 'tickets', 'email-support', 'ai-responses', 'analytics', 'white-label', 'priority-support'],
            supportMonths: 24,
          },
          {
            tier: 'DEVELOPER',
            name: 'Developer',
            price: 499,
            currency: 'USD',
            maxDomains: 999,
            features: ['chat', 'tickets', 'email-support', 'ai-responses', 'analytics', 'white-label', 'priority-support', 'source-code', 'resale-rights'],
            supportMonths: 999, // Lifetime
          },
        ],
      },
    },
  });
  console.log(`Created product: ${livesupportProduct.name}`);

  // Create sample product: SEO Manager
  const seoProduct = await prisma.product.upsert({
    where: { slug: 'seo-manager' },
    update: {},
    create: {
      slug: 'seo-manager',
      name: 'SEO Manager',
      description: 'Complete SEO toolkit for website optimization',
      currentVersion: '1.0.0',
      keyPrefix: 'SEO',
      isActive: true,
      tiers: {
        create: [
          {
            tier: 'STANDARD',
            name: 'Standard',
            price: 39,
            currency: 'USD',
            maxDomains: 1,
            features: ['meta-tags', 'sitemap', 'basic-analytics'],
            supportMonths: 6,
          },
          {
            tier: 'PROFESSIONAL',
            name: 'Professional',
            price: 79,
            currency: 'USD',
            maxDomains: 5,
            features: ['meta-tags', 'sitemap', 'basic-analytics', 'keyword-tracking', 'competitor-analysis'],
            supportMonths: 12,
          },
        ],
      },
    },
  });
  console.log(`Created product: ${seoProduct.name}`);

  // Create default settings
  const settings = [
    { key: 'site_name', value: 'LLCPad License Server', type: 'string', description: 'Name of the license server' },
    { key: 'token_expiry_days', value: '7', type: 'number', description: 'JWT token expiry in days' },
    { key: 'max_failed_verifications', value: '10', type: 'number', description: 'Max failed verification attempts before temporary ban' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('Created default settings');

  console.log('Seeding completed!');
  console.log('\nDefault admin credentials:');
  console.log('  Email: admin@llcpad.com');
  console.log('  Password: admin123');
  console.log('\nPlease change the password after first login!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
