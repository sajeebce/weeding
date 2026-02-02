import type {
  Admin,
  Product,
  ProductTier,
  License,
  LicenseActivation,
  WebhookLog,
  AuditLog,
  LicenseTier,
  LicenseStatus,
  DomainLockMode,
  OrderSource,
  AdminRole,
  WebhookStatus,
} from '@prisma/client';

// Re-export Prisma types
export type {
  Admin,
  Product,
  ProductTier,
  License,
  LicenseActivation,
  WebhookLog,
  AuditLog,
  LicenseTier,
  LicenseStatus,
  DomainLockMode,
  OrderSource,
  AdminRole,
  WebhookStatus,
};

// License with relations
export type LicenseWithRelations = License & {
  product: Product;
  activations: LicenseActivation[];
  createdBy?: Admin | null;
};

// Product with tiers
export type ProductWithTiers = Product & {
  tiers: ProductTier[];
};

// Token payload
export interface TokenPayload {
  licenseKey: string;
  productSlug: string;
  tier: LicenseTier;
  features: string[];
  domain: string;
  domainLockMode: DomainLockMode;
  licenseExpiresAt: string | null;
  supportExpiresAt: string | null;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

// API Response types
export interface VerifyLicenseRequest {
  licenseKey: string;
  domain: string;
  pluginSlug: string;
  pluginVersion: string;
  cmsVersion?: string;
  serverInfo?: {
    nodeVersion?: string;
    os?: string;
    timezone?: string;
  };
}

export interface VerifyLicenseResponse {
  valid: boolean;
  token?: string;
  tokenExpiresAt?: string;
  license?: {
    tier: LicenseTier;
    features: string[];
    domainLockMode: DomainLockMode;
    maxDomains: number;
    activeDomains: number;
    expiresAt: string | null;
    supportExpiresAt: string | null;
  };
  activation?: {
    domain: string;
    activatedAt: string;
    isNew: boolean;
  };
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
}

export interface RefreshTokenRequest {
  token: string;
  domain: string;
}

export interface RefreshTokenResponse {
  valid: boolean;
  token?: string;
  tokenExpiresAt?: string;
  error?: string;
  message?: string;
}

export interface DeactivateDomainRequest {
  licenseKey: string;
  domain: string;
}

export interface DeactivateDomainResponse {
  success: boolean;
  message: string;
  remainingSlots?: number;
  maxDomains?: number;
}

// Dashboard stats
export interface DashboardStats {
  overview: {
    totalLicenses: number;
    activeLicenses: number;
    expiredLicenses: number;
    suspendedLicenses: number;
    totalActivations: number;
    totalRevenue: {
      USD: number;
      BDT: number;
    };
  };
  recentActivity: {
    type: string;
    licenseKey?: string;
    customerEmail?: string;
    domain?: string;
    createdAt: string;
  }[];
  charts: {
    salesByMonth: { month: string; revenue: number }[];
    salesByProduct: { product: string; count: number }[];
    activationsByDay: { date: string; count: number }[];
  };
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create license request
export interface CreateLicenseRequest {
  productId: string;
  tier: LicenseTier;
  customerEmail: string;
  customerName?: string;
  domainLockMode?: DomainLockMode;
  maxDomains?: number;
  expiresAt?: string | null;
  supportExpiresAt?: string;
  orderId?: string;
  orderSource?: OrderSource;
  purchasePrice?: number;
  purchaseCurrency?: string;
  notes?: string;
  sendEmail?: boolean;
}
