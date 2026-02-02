# License Server - Complete Specification

> A standalone license management and activation server for LLCPad plugins

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Admin Dashboard](#admin-dashboard)
7. [RSA Key Management](#rsa-key-management)
8. [Webhook Integrations](#webhook-integrations)
9. [Security & Rate Limiting](#security--rate-limiting)
10. [Deployment Strategy](#deployment-strategy)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Implementation Phases](#implementation-phases)

---

## Overview

### Purpose

The License Server is a **standalone application** that handles:
- License key generation and validation
- Domain-based activation management
- JWT token issuance for cached verification
- Webhook integration with marketplaces (CodeCanyon, Gumroad)
- Admin dashboard for license management

### Scope

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LICENSE SERVER SCOPE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  THIS SERVER MANAGES LICENSES FOR ALL LLCPAD PLUGINS:                   │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ LiveSupport Pro │  │   SEO Manager   │  │ Future Plugins  │         │
│  │                 │  │                 │  │                 │         │
│  │  LSP-XXX-XXXX   │  │  SEO-XXX-XXXX   │  │  XXX-XXX-XXXX   │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
│           │                    │                    │                   │
│           └────────────────────┼────────────────────┘                   │
│                                │                                        │
│                                ▼                                        │
│                    ┌─────────────────────┐                              │
│                    │   LICENSE SERVER    │                              │
│                    │                     │                              │
│                    │  license.llcpad.com │                              │
│                    │  api.llcpad.com     │                              │
│                    └─────────────────────┘                              │
│                                                                          │
│  NOT JUST FOR ONE PLUGIN - CENTRALIZED LICENSE MANAGEMENT               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Multi-Product** | Manage licenses for unlimited plugins |
| **Domain Lock** | Flexible LOCKED/UNLOCKED domain restrictions |
| **JWT Tokens** | 7-day cached tokens for cost optimization |
| **RSA Signatures** | Cryptographically signed tokens |
| **Webhook Support** | Auto-generate licenses from CodeCanyon/Gumroad |
| **Admin Dashboard** | Full CRUD for license management |
| **Analytics** | Revenue, activations, usage tracking |

---

## Tech Stack

### 2026 Latest Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LICENSE SERVER TECH STACK                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FRAMEWORK & RUNTIME                                                     │
│  ───────────────────                                                     │
│  • Next.js 16.0.7+          (App Router, Server Components)             │
│  • React 19                 (Latest stable)                              │
│  • TypeScript 5.9           (Strict mode)                                │
│  • Node.js 22 LTS           (Latest LTS)                                 │
│                                                                          │
│  DATABASE                                                                │
│  ────────                                                                │
│  • PostgreSQL 18            (Latest stable)                              │
│  • Prisma 7                 (ORM with type safety)                       │
│                                                                          │
│  AUTHENTICATION                                                          │
│  ──────────────                                                          │
│  • NextAuth.js v5           (Admin authentication)                       │
│  • jose (JWT library)       (RSA token signing/verification)            │
│                                                                          │
│  UI & STYLING                                                            │
│  ────────────                                                            │
│  • Tailwind CSS 4.1         (Utility-first CSS)                          │
│  • shadcn/ui                (Component library)                          │
│  • Lucide Icons             (Icon set)                                   │
│                                                                          │
│  UTILITIES                                                               │
│  ─────────                                                               │
│  • Zod                      (Schema validation)                          │
│  • date-fns                 (Date manipulation)                          │
│  • nanoid                   (License key generation)                     │
│  • bcrypt                   (Password hashing)                           │
│                                                                          │
│  EMAIL                                                                   │
│  ─────                                                                   │
│  • Resend                   (Transactional emails)                       │
│                                                                          │
│  DEPLOYMENT                                                              │
│  ──────────                                                              │
│  • Docker                   (Containerization)                           │
│  • VPS (Hetzner/Contabo)    (Self-hosted)                               │
│  • Nginx                    (Reverse proxy)                              │
│  • Let's Encrypt            (SSL certificates)                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Package.json Dependencies

```json
{
  "name": "llcpad-license-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "keys:generate": "tsx scripts/generate-rsa-keys.ts"
  },
  "dependencies": {
    "next": "^16.0.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^7.0.0",
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^2.0.0",
    "jose": "^5.0.0",
    "zod": "^3.24.0",
    "nanoid": "^5.0.0",
    "bcrypt": "^5.1.0",
    "date-fns": "^4.0.0",
    "resend": "^4.0.0",
    "tailwindcss": "^4.1.0",
    "lucide-react": "^0.500.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "prisma": "^7.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/bcrypt": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LICENSE SERVER ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                        EXTERNAL SYSTEMS                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  CodeCanyon  │    │   Gumroad    │    │   Stripe     │              │
│  │   Webhook    │    │   Webhook    │    │   Webhook    │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                   │                       │
│         └───────────────────┼───────────────────┘                       │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     LICENSE SERVER                               │   │
│  │                   license.llcpad.com                             │   │
│  │                                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐│   │
│  │  │                      Next.js App                            ││   │
│  │  │                                                             ││   │
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  ││   │
│  │  │  │ Admin Pages   │  │  API Routes   │  │ Webhook Routes │  ││   │
│  │  │  │               │  │               │  │                │  ││   │
│  │  │  │ /admin/*      │  │ /api/licenses │  │ /api/webhooks  │  ││   │
│  │  │  │ Dashboard     │  │ /api/products │  │ /envato        │  ││   │
│  │  │  │ Licenses      │  │ /api/stats    │  │ /gumroad       │  ││   │
│  │  │  │ Products      │  │               │  │ /stripe        │  ││   │
│  │  │  │ Settings      │  │               │  │                │  ││   │
│  │  │  └───────────────┘  └───────────────┘  └────────────────┘  ││   │
│  │  │                                                             ││   │
│  │  │  ┌─────────────────────────────────────────────────────┐   ││   │
│  │  │  │                   Services Layer                     │   ││   │
│  │  │  │                                                      │   ││   │
│  │  │  │  LicenseService  │  TokenService  │  EmailService   │   ││   │
│  │  │  │  ProductService  │  KeyService    │  WebhookService │   ││   │
│  │  │  └─────────────────────────────────────────────────────┘   ││   │
│  │  │                                                             ││   │
│  │  └─────────────────────────────────────────────────────────────┘│   │
│  │                              │                                   │   │
│  │                              ▼                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐│   │
│  │  │                    PostgreSQL 18                            ││   │
│  │  │                                                             ││   │
│  │  │  licenses │ activations │ products │ admins │ webhooklogs  ││   │
│  │  └─────────────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                             │                                           │
│                             ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CUSTOMER CMS SITES                            │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │   │
│  │  │ customer1.com│  │ customer2.com│  │ customer3.com│           │   │
│  │  │              │  │              │  │              │           │   │
│  │  │ LLCPad CMS   │  │ LLCPad CMS   │  │ LLCPad CMS   │           │   │
│  │  │ + Plugins    │  │ + Plugins    │  │ + Plugins    │           │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LICENSE VERIFICATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. INITIAL ACTIVATION (First time or token expired)                    │
│  ───────────────────────────────────────────────────                     │
│                                                                          │
│  Customer CMS                    License Server                          │
│  ────────────                    ──────────────                          │
│       │                                │                                 │
│       │  POST /api/licenses/verify     │                                 │
│       │  {                             │                                 │
│       │    licenseKey: "LSP-PRO-XXX",  │                                 │
│       │    domain: "customer.com",     │                                 │
│       │    pluginSlug: "livesupport",  │                                 │
│       │    pluginVersion: "1.0.0"      │                                 │
│       │  }                             │                                 │
│       │ ──────────────────────────────▶│                                 │
│       │                                │                                 │
│       │                                │  1. Validate license key        │
│       │                                │  2. Check domain limit          │
│       │                                │  3. Register activation         │
│       │                                │  4. Generate JWT (RSA signed)   │
│       │                                │                                 │
│       │  {                             │                                 │
│       │    valid: true,                │                                 │
│       │    token: "eyJhbG...",         │                                 │
│       │    license: { tier, features } │                                 │
│       │  }                             │                                 │
│       │ ◀──────────────────────────────│                                 │
│       │                                │                                 │
│       │  Store token locally           │                                 │
│       │  (valid for 7 days)            │                                 │
│       │                                │                                 │
│                                                                          │
│  2. SUBSEQUENT REQUESTS (Within 7 days)                                 │
│  ──────────────────────────────────────                                  │
│                                                                          │
│  Customer CMS                                                            │
│  ────────────                                                            │
│       │                                                                  │
│       │  Check cached token locally                                      │
│       │  Verify RSA signature with PUBLIC KEY                           │
│       │  Check token expiry                                              │
│       │                                                                  │
│       │  ✅ Valid → Allow feature access                                 │
│       │  ❌ Invalid → Trigger refresh                                    │
│       │                                                                  │
│       │  NO API CALL TO LICENSE SERVER                                   │
│       │                                                                  │
│                                                                          │
│  3. TOKEN REFRESH (After 5-7 days, background)                          │
│  ─────────────────────────────────────────────                           │
│                                                                          │
│  Customer CMS                    License Server                          │
│  ────────────                    ──────────────                          │
│       │                                │                                 │
│       │  POST /api/licenses/refresh    │                                 │
│       │  { token: "eyJhbG..." }        │                                 │
│       │ ──────────────────────────────▶│                                 │
│       │                                │                                 │
│       │                                │  Verify old token               │
│       │                                │  Issue new token                │
│       │                                │                                 │
│       │  { token: "eyJhbG..." (new) }  │                                 │
│       │ ◀──────────────────────────────│                                 │
│       │                                │                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
license-server/
├── .env.example
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── docker-compose.yml
├── Dockerfile
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── scripts/
│   ├── generate-rsa-keys.ts
│   └── backup-database.ts
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing/Login
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin layout with sidebar
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── licenses/
│   │   │   │   ├── page.tsx            # License list
│   │   │   │   ├── [id]/page.tsx       # License detail
│   │   │   │   └── new/page.tsx        # Generate license
│   │   │   ├── products/
│   │   │   │   ├── page.tsx            # Product list
│   │   │   │   └── [id]/page.tsx       # Product detail
│   │   │   ├── activations/
│   │   │   │   └── page.tsx            # All activations
│   │   │   ├── webhooks/
│   │   │   │   └── page.tsx            # Webhook logs
│   │   │   └── settings/
│   │   │       ├── page.tsx            # General settings
│   │   │       ├── keys/page.tsx       # RSA key management
│   │   │       └── email/page.tsx      # Email templates
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       │
│   │       ├── licenses/
│   │       │   ├── route.ts            # GET (list), POST (create)
│   │       │   ├── [id]/route.ts       # GET, PUT, DELETE
│   │       │   ├── verify/route.ts     # POST - Plugin verification
│   │       │   ├── refresh/route.ts    # POST - Token refresh
│   │       │   └── deactivate/route.ts # POST - Deactivate domain
│   │       │
│   │       ├── products/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       │
│   │       ├── stats/
│   │       │   └── route.ts            # Analytics data
│   │       │
│   │       └── webhooks/
│   │           ├── envato/route.ts     # CodeCanyon webhook
│   │           ├── gumroad/route.ts    # Gumroad webhook
│   │           └── stripe/route.ts     # Stripe webhook
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── admin/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── license-table.tsx
│   │   │   ├── license-form.tsx
│   │   │   ├── stats-cards.tsx
│   │   │   └── charts/
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       └── pagination.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                       # Prisma client
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── utils.ts                    # Utility functions
│   │   └── validations/
│   │       ├── license.ts              # Zod schemas
│   │       └── product.ts
│   │
│   ├── services/
│   │   ├── license.service.ts
│   │   ├── token.service.ts            # JWT generation/verification
│   │   ├── key.service.ts              # RSA key management
│   │   ├── email.service.ts
│   │   ├── product.service.ts
│   │   └── webhook.service.ts
│   │
│   └── types/
│       └── index.ts
│
└── keys/                               # RSA keys (gitignored)
    ├── private.pem
    └── public.pem
```

---

## Database Schema

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════════════
// ADMIN USERS
// ═══════════════════════════════════════════════════════════════════════

model Admin {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  password        String    // bcrypt hashed
  role            AdminRole @default(STAFF)

  // Activity tracking
  lastLoginAt     DateTime?
  lastLoginIp     String?

  // Status
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  createdLicenses License[] @relation("CreatedBy")
  auditLogs       AuditLog[]

  @@index([email])
}

enum AdminRole {
  SUPER_ADMIN   // Full access
  ADMIN         // Manage licenses, products
  STAFF         // View only, generate licenses
}

// ═══════════════════════════════════════════════════════════════════════
// PRODUCTS (Plugins)
// ═══════════════════════════════════════════════════════════════════════

model Product {
  id              String    @id @default(cuid())
  slug            String    @unique    // e.g., "livesupport-pro"
  name            String               // e.g., "LiveSupport Pro"
  description     String?   @db.Text

  // Versioning
  currentVersion  String    @default("1.0.0")

  // Pricing tiers
  tiers           ProductTier[]

  // License key prefix
  keyPrefix       String    @unique    // e.g., "LSP"

  // Status
  isActive        Boolean   @default(true)

  // External IDs
  envatoItemId    String?   // CodeCanyon item ID
  gumroadProductId String?  // Gumroad product ID

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  licenses        License[]

  @@index([slug])
  @@index([keyPrefix])
}

model ProductTier {
  id              String    @id @default(cuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  tier            LicenseTier
  name            String               // e.g., "Professional"
  price           Decimal   @db.Decimal(10, 2)
  currency        String    @default("USD")

  // Limits
  maxDomains      Int       @default(1)

  // Features included in this tier
  features        String[]             // e.g., ["chat", "ai", "analytics"]

  // Support period (months)
  supportMonths   Int       @default(6)

  isActive        Boolean   @default(true)

  @@unique([productId, tier])
  @@index([productId])
}

// ═══════════════════════════════════════════════════════════════════════
// LICENSES
// ═══════════════════════════════════════════════════════════════════════

model License {
  id              String          @id @default(cuid())
  licenseKey      String          @unique

  // Product reference
  productId       String
  product         Product         @relation(fields: [productId], references: [id])

  // Tier
  tier            LicenseTier     @default(STANDARD)

  // Customer info
  customerEmail   String
  customerName    String?

  // Purchase info
  orderId         String?         // External order ID
  orderSource     OrderSource?    // Where the purchase came from
  purchasedAt     DateTime        @default(now())
  purchasePrice   Decimal?        @db.Decimal(10, 2)
  purchaseCurrency String?

  // Domain restrictions
  domainLockMode  DomainLockMode  @default(LOCKED)
  maxDomains      Int             @default(1)

  // Validity
  status          LicenseStatus   @default(ACTIVE)
  expiresAt       DateTime?       // null = lifetime
  supportExpiresAt DateTime?

  // Features (can override tier defaults)
  features        String[]

  // Admin notes
  notes           String?         @db.Text

  // Created by
  createdById     String?
  createdBy       Admin?          @relation("CreatedBy", fields: [createdById], references: [id])

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  activations     LicenseActivation[]

  @@index([licenseKey])
  @@index([customerEmail])
  @@index([productId])
  @@index([status])
  @@index([orderId])
}

model LicenseActivation {
  id              String    @id @default(cuid())
  licenseId       String
  license         License   @relation(fields: [licenseId], references: [id], onDelete: Cascade)

  // Domain info
  domain          String
  domainHash      String    // SHA256 for quick lookup

  // Environment info
  ipAddress       String?
  serverInfo      Json?     // OS, Node version, etc.
  cmsVersion      String?
  pluginVersion   String?

  // Status
  isActive        Boolean   @default(true)
  activatedAt     DateTime  @default(now())
  lastVerifiedAt  DateTime  @default(now())
  lastTokenIssuedAt DateTime?
  deactivatedAt   DateTime?

  @@unique([licenseId, domain])
  @@index([domain])
  @@index([domainHash])
  @@index([licenseId])
}

// ═══════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════

enum LicenseTier {
  STANDARD      // 1 domain, basic features
  PROFESSIONAL  // 3 domains, all features
  ENTERPRISE    // Unlimited domains, priority support
  DEVELOPER     // Unlimited, resale rights, source code
}

enum LicenseStatus {
  ACTIVE
  EXPIRED
  SUSPENDED
  REVOKED
  REFUNDED
}

enum DomainLockMode {
  LOCKED        // Must match registered domains
  UNLOCKED      // Any domain allowed
}

enum OrderSource {
  MANUAL        // Created manually by admin
  ENVATO        // CodeCanyon purchase
  GUMROAD       // Gumroad purchase
  STRIPE        // Direct Stripe payment
}

// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK LOGS
// ═══════════════════════════════════════════════════════════════════════

model WebhookLog {
  id              String    @id @default(cuid())

  source          OrderSource
  eventType       String              // e.g., "purchase", "refund"

  // Request data
  headers         Json?
  payload         Json

  // Response
  status          WebhookStatus       @default(PENDING)
  responseCode    Int?
  responseBody    String?   @db.Text
  errorMessage    String?   @db.Text

  // Related license (if created)
  licenseId       String?

  // Processing
  processedAt     DateTime?
  retryCount      Int       @default(0)

  createdAt       DateTime  @default(now())

  @@index([source])
  @@index([status])
  @@index([createdAt])
}

enum WebhookStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  IGNORED       // Duplicate or irrelevant event
}

// ═══════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════

model AuditLog {
  id              String    @id @default(cuid())

  adminId         String?
  admin           Admin?    @relation(fields: [adminId], references: [id])

  action          String              // e.g., "license.create", "license.revoke"
  entityType      String              // e.g., "License", "Product"
  entityId        String?

  // Change details
  previousValue   Json?
  newValue        Json?

  ipAddress       String?
  userAgent       String?

  createdAt       DateTime  @default(now())

  @@index([adminId])
  @@index([action])
  @@index([entityType, entityId])
  @@index([createdAt])
}

// ═══════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════

model Setting {
  id              String    @id @default(cuid())
  key             String    @unique
  value           String    @db.Text
  type            String    @default("string")  // string, number, boolean, json
  description     String?

  updatedAt       DateTime  @updatedAt

  @@index([key])
}
```

### Database Indexes & Performance

```prisma
// Additional indexes for performance (add to schema)

// License lookup optimizations
@@index([productId, status])
@@index([customerEmail, status])
@@index([createdAt(sort: Desc)])

// Activation lookup
@@index([domain, isActive])
@@index([lastVerifiedAt])

// Analytics queries
@@index([purchasedAt])
@@index([tier, status])
```

---

## API Endpoints

### Public API (Plugin Verification)

These endpoints are called by customer CMS installations.

```typescript
// ═══════════════════════════════════════════════════════════════════════
// POST /api/licenses/verify
// Called during plugin activation and token refresh
// ═══════════════════════════════════════════════════════════════════════

// Request
POST /api/licenses/verify
Content-Type: application/json

{
  "licenseKey": "LSP-PRO-A7B2K9M3-4X2Q",
  "domain": "customer-site.com",
  "pluginSlug": "livesupport-pro",
  "pluginVersion": "1.0.0",
  "cmsVersion": "1.2.0",
  "serverInfo": {
    "nodeVersion": "22.0.0",
    "os": "linux",
    "timezone": "UTC"
  }
}

// Response (Success)
{
  "valid": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiresAt": "2026-02-08T10:00:00Z",
  "license": {
    "tier": "PROFESSIONAL",
    "features": ["chat", "tickets", "ai", "analytics"],
    "domainLockMode": "LOCKED",
    "maxDomains": 3,
    "activeDomains": 2,
    "expiresAt": null,
    "supportExpiresAt": "2027-02-01T00:00:00Z"
  },
  "activation": {
    "domain": "customer-site.com",
    "activatedAt": "2026-02-01T10:30:00Z",
    "isNew": false
  }
}

// Response (Error - Invalid Key)
{
  "valid": false,
  "error": "INVALID_LICENSE_KEY",
  "message": "The license key provided is invalid or does not exist."
}

// Response (Error - Domain Limit)
{
  "valid": false,
  "error": "DOMAIN_LIMIT_EXCEEDED",
  "message": "This license has reached its maximum domain limit.",
  "details": {
    "maxDomains": 1,
    "activeDomains": ["other-site.com"],
    "requestedDomain": "customer-site.com"
  }
}

// Response (Error - Expired)
{
  "valid": false,
  "error": "LICENSE_EXPIRED",
  "message": "This license has expired.",
  "details": {
    "expiredAt": "2026-01-15T00:00:00Z"
  }
}

// Response (Error - Suspended/Revoked)
{
  "valid": false,
  "error": "LICENSE_SUSPENDED",
  "message": "This license has been suspended. Please contact support."
}


// ═══════════════════════════════════════════════════════════════════════
// POST /api/licenses/refresh
// Called for silent token refresh (background)
// ═══════════════════════════════════════════════════════════════════════

// Request
POST /api/licenses/refresh
Content-Type: application/json

{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "domain": "customer-site.com"
}

// Response (Success)
{
  "valid": true,
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenExpiresAt": "2026-02-15T10:00:00Z"
}

// Response (Error - Token Invalid)
{
  "valid": false,
  "error": "INVALID_TOKEN",
  "message": "Token is invalid or corrupted. Please re-verify license."
}


// ═══════════════════════════════════════════════════════════════════════
// POST /api/licenses/deactivate
// Called when customer wants to move license to another domain
// ═══════════════════════════════════════════════════════════════════════

// Request
POST /api/licenses/deactivate
Content-Type: application/json

{
  "licenseKey": "LSP-PRO-A7B2K9M3-4X2Q",
  "domain": "old-site.com"
}

// Response (Success)
{
  "success": true,
  "message": "Domain deactivated successfully.",
  "remainingSlots": 2,
  "maxDomains": 3
}
```

### Admin API (Dashboard)

These endpoints are for the admin dashboard, protected by authentication.

```typescript
// ═══════════════════════════════════════════════════════════════════════
// LICENSES CRUD
// ═══════════════════════════════════════════════════════════════════════

// GET /api/licenses
// List all licenses with pagination, search, filters
GET /api/licenses?page=1&limit=20&search=john@email.com&status=ACTIVE&product=livesupport-pro

// Response
{
  "licenses": [
    {
      "id": "clx...",
      "licenseKey": "LSP-PRO-A7B2K9M3-4X2Q",
      "product": {
        "slug": "livesupport-pro",
        "name": "LiveSupport Pro"
      },
      "tier": "PROFESSIONAL",
      "customerEmail": "john@email.com",
      "customerName": "John Doe",
      "status": "ACTIVE",
      "domainLockMode": "LOCKED",
      "maxDomains": 3,
      "activationsCount": 2,
      "expiresAt": null,
      "createdAt": "2026-02-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}


// POST /api/licenses
// Generate new license
POST /api/licenses
Content-Type: application/json
Authorization: Bearer {session_token}

{
  "productId": "clx...",
  "tier": "PROFESSIONAL",
  "customerEmail": "customer@email.com",
  "customerName": "John Doe",
  "domainLockMode": "LOCKED",
  "expiresAt": null,
  "supportExpiresAt": "2027-02-01T00:00:00Z",
  "orderId": "manual-001",
  "notes": "VIP customer",
  "sendEmail": true
}

// Response
{
  "success": true,
  "license": {
    "id": "clx...",
    "licenseKey": "LSP-PRO-X7K2M9N3-5Q2W",
    ...
  },
  "emailSent": true
}


// GET /api/licenses/{id}
// Get single license with all details

// PUT /api/licenses/{id}
// Update license (status, notes, expiry, etc.)

// DELETE /api/licenses/{id}
// Permanently delete license


// ═══════════════════════════════════════════════════════════════════════
// PRODUCTS CRUD
// ═══════════════════════════════════════════════════════════════════════

// GET /api/products
// POST /api/products
// GET /api/products/{id}
// PUT /api/products/{id}
// DELETE /api/products/{id}


// ═══════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════

// GET /api/stats
// Dashboard statistics

// Response
{
  "overview": {
    "totalLicenses": 1250,
    "activeLicenses": 1100,
    "expiredLicenses": 100,
    "suspendedLicenses": 50,
    "totalActivations": 1800,
    "totalRevenue": {
      "USD": 45000,
      "BDT": 150000
    }
  },
  "recentActivity": [
    {
      "type": "license.created",
      "licenseKey": "LSP-PRO-XXX",
      "customerEmail": "john@email.com",
      "createdAt": "2026-02-01T10:00:00Z"
    }
  ],
  "charts": {
    "salesByMonth": [...],
    "salesByProduct": [...],
    "activationsByDay": [...]
  }
}


// ═══════════════════════════════════════════════════════════════════════
// WEBHOOK LOGS
// ═══════════════════════════════════════════════════════════════════════

// GET /api/webhooks/logs
// View webhook processing history
```

---

## Admin Dashboard

### Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LLCPAD LICENSE SERVER                              Admin ▼  🔔  ⚙️     │
├────────────────┬────────────────────────────────────────────────────────┤
│                │                                                        │
│  📊 Dashboard  │  Dashboard                                             │
│                │  ───────────────────────────────────────────────────   │
│  📜 Licenses   │                                                        │
│    → All       │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│    → Generate  │  │    1,250     │ │    1,100     │ │   $45,000    │   │
│                │  │   Total      │ │   Active     │ │   Revenue    │   │
│  📦 Products   │  │   Licenses   │ │   Licenses   │ │   (USD)      │   │
│                │  └──────────────┘ └──────────────┘ └──────────────┘   │
│  🔌 Activations│                                                        │
│                │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  🔗 Webhooks   │  │    1,800     │ │     50       │ │     100      │   │
│                │  │   Total      │ │   Suspended  │ │   Expired    │   │
│  ⚙️ Settings   │  │  Activations │ │   Licenses   │ │   Licenses   │   │
│    → General   │  └──────────────┘ └──────────────┘ └──────────────┘   │
│    → Keys      │                                                        │
│    → Email     │  ┌─────────────────────────────────────────────────┐  │
│                │  │  📈 Sales This Month                             │  │
│                │  │                                                   │  │
│                │  │   $12,000 ──────────────────────────────         │  │
│                │  │   $10,000 ─────────────────────────              │  │
│                │  │    $8,000 ────────────────────                   │  │
│                │  │    $6,000 ───────────────                        │  │
│                │  │                                                   │  │
│                │  │    Jan  Feb  Mar  Apr  May  Jun                  │  │
│                │  └─────────────────────────────────────────────────┘  │
│                │                                                        │
│                │  Recent Activity                                       │
│                │  ┌─────────────────────────────────────────────────┐  │
│                │  │ ✅ License LSP-PRO-X7K2... activated            │  │
│                │  │    customer-site.com • 2 minutes ago            │  │
│                │  │                                                   │  │
│                │  │ 🆕 License LSP-STD-A3B2... created               │  │
│                │  │    john@email.com • 15 minutes ago              │  │
│                │  │                                                   │  │
│                │  │ ⚠️ License LSP-PRO-C4D5... domain limit hit     │  │
│                │  │    attempted: new-site.com • 1 hour ago         │  │
│                │  └─────────────────────────────────────────────────┘  │
│                │                                                        │
└────────────────┴────────────────────────────────────────────────────────┘
```

### License List

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Licenses                                    [+ Generate License]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔍 Search by email, name, or license key...                            │
│                                                                          │
│  Filters: [All Status ▼] [All Products ▼] [All Tiers ▼] [Date Range]   │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ □  License Key         Product          Customer        Status    │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │ □  LSP-PRO-A7B2K9M3   LiveSupport Pro  john@email.com  ✅ Active │  │
│  │    PROFESSIONAL        2/3 domains      John Doe                  │  │
│  │    ─────────────────────────────────────────────────────────────  │  │
│  │    Activated: customer1.com, customer2.com                        │  │
│  │    Purchased: Feb 1, 2026 • Expires: Never                        │  │
│  │                                           [View] [Edit] [⋮]      │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │ □  LSP-STD-C3D8F1H7   LiveSupport Pro  jane@email.com  ✅ Active │  │
│  │    STANDARD            1/1 domains      Jane Smith                │  │
│  │    ─────────────────────────────────────────────────────────────  │  │
│  │    Activated: janes-store.com                                     │  │
│  │    Purchased: Jan 15, 2026 • Support until: Jul 15, 2026         │  │
│  │                                           [View] [Edit] [⋮]      │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │ □  SEO-ENT-E5G2J4N6   SEO Manager       corp@co.com    ⚠️ Expired│  │
│  │    ENTERPRISE          5/∞ domains      Corp Inc                  │  │
│  │    ─────────────────────────────────────────────────────────────  │  │
│  │    Expired: Jan 1, 2026                                           │  │
│  │                                    [Renew] [View] [Edit] [⋮]     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Showing 1-20 of 1,250 licenses              [← Prev] [1] [2] ... [→]   │
│                                                                          │
│  Bulk Actions: [Suspend Selected] [Export CSV] [Delete Selected]        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Generate License

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Generate New License                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Product *                                                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  LiveSupport Pro                                                ▼ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  License Tier *                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ◉ STANDARD ($49)                                                  │  │
│  │    1 domain • Basic features • 6 months support                   │  │
│  │                                                                    │  │
│  │  ○ PROFESSIONAL ($99)                                              │  │
│  │    3 domains • All features • 12 months support                   │  │
│  │                                                                    │  │
│  │  ○ ENTERPRISE ($249)                                               │  │
│  │    Unlimited domains • Priority support • 24 months               │  │
│  │                                                                    │  │
│  │  ○ DEVELOPER ($499)                                                │  │
│  │    Unlimited • Resale rights • Source code • Lifetime             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Domain Lock Mode *                                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ◉ LOCKED (Recommended)                                            │  │
│  │    License only works on registered domains                       │  │
│  │                                                                    │  │
│  │  ○ UNLOCKED                                                        │  │
│  │    License works on any domain (special cases only)               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Customer Email *            │  │ Customer Name                    │  │
│  │ [customer@email.com      ]  │  │ [John Doe                     ]  │  │
│  └─────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ Order ID (Optional)         │  │ Order Source                     │  │
│  │ [envato-12345678         ]  │  │ [Manual                       ▼] │  │
│  └─────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                          │
│  License Expiration                                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  ◉ Lifetime (Never expires)                                        │  │
│  │  ○ 1 Year from today                                               │  │
│  │  ○ Custom date: [____________]                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Support Expiration                                                      │
│  [Feb 1, 2027          ] (6 months from today)                          │
│                                                                          │
│  Internal Notes                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  VIP customer, extended support                                   │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ☑ Send license key email to customer                                   │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Preview                                                           │  │
│  │  ─────────                                                         │  │
│  │  License Key: LSP-STD-XXXXXXXX-XXXX (will be generated)           │  │
│  │  Product: LiveSupport Pro                                          │  │
│  │  Tier: STANDARD                                                    │  │
│  │  Max Domains: 1                                                    │  │
│  │  Domain Lock: LOCKED                                               │  │
│  │  Expires: Never                                                    │  │
│  │  Support Until: Feb 1, 2027                                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│                                         [Cancel]  [Generate License]    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### License Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Licenses    License: LSP-PRO-A7B2K9M3-4X2Q                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │  LICENSE DETAILS                    │  │  QUICK ACTIONS           │   │
│  │                                     │  │                          │   │
│  │  License Key                        │  │  [Copy License Key]      │   │
│  │  LSP-PRO-A7B2K9M3-4X2Q        📋   │  │  [Send to Customer]      │   │
│  │                                     │  │  [Extend Support]        │   │
│  │  Status                             │  │                          │   │
│  │  ✅ ACTIVE                          │  │  ─────────────────────   │   │
│  │                                     │  │                          │   │
│  │  Product                            │  │  [Suspend License]       │   │
│  │  LiveSupport Pro                    │  │  [Revoke License]        │   │
│  │                                     │  │  [Delete License]        │   │
│  │  Tier                               │  │                          │   │
│  │  PROFESSIONAL                       │  └──────────────────────────┘   │
│  │  Features: chat, tickets, ai        │                                │
│  │                                     │                                │
│  │  Domain Lock                        │                                │
│  │  LOCKED (3 domains max)             │                                │
│  │                                     │                                │
│  └────────────────────────────────────┘                                │
│                                                                          │
│  ┌────────────────────────────────────┐  ┌──────────────────────────┐   │
│  │  CUSTOMER INFO                      │  │  DATES                   │   │
│  │                                     │  │                          │   │
│  │  Email                              │  │  Purchased               │   │
│  │  john@email.com                     │  │  Feb 1, 2026             │   │
│  │                                     │  │                          │   │
│  │  Name                               │  │  License Expires         │   │
│  │  John Doe                           │  │  Never (Lifetime)        │   │
│  │                                     │  │                          │   │
│  │  Order ID                           │  │  Support Expires         │   │
│  │  envato-12345678                    │  │  Feb 1, 2027             │   │
│  │                                     │  │                          │   │
│  │  Order Source                       │  │  Last Activity           │   │
│  │  CodeCanyon                         │  │  2 hours ago             │   │
│  │                                     │  │                          │   │
│  └────────────────────────────────────┘  └──────────────────────────┘   │
│                                                                          │
│  ACTIVATED DOMAINS (2 of 3)                                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Domain              Activated       Last Verified    Actions     │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  customer1.com       Feb 1, 2026     2 hours ago      [Deactivate]│  │
│  │  IP: 192.168.1.1     CMS v1.2.0      Plugin v1.0.0               │  │
│  ├───────────────────────────────────────────────────────────────────┤  │
│  │  customer2.com       Feb 5, 2026     1 day ago        [Deactivate]│  │
│  │  IP: 10.0.0.1        CMS v1.2.0      Plugin v1.0.0               │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ACTIVITY LOG                                                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Feb 5, 2026 10:30   Token refreshed (customer1.com)              │  │
│  │  Feb 5, 2026 09:15   Activation added (customer2.com)             │  │
│  │  Feb 1, 2026 14:00   Token issued (customer1.com)                 │  │
│  │  Feb 1, 2026 13:45   Activation added (customer1.com)             │  │
│  │  Feb 1, 2026 10:00   License created by Admin                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  INTERNAL NOTES                                              [Edit]     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  VIP customer, extended support period. Contact: +1-234-567-8900  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## RSA Key Management

### Key Generation

```typescript
// scripts/generate-rsa-keys.ts

import { generateKeyPairSync } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const KEYS_DIR = join(process.cwd(), 'keys');

function generateRSAKeys() {
  // Ensure keys directory exists
  if (!existsSync(KEYS_DIR)) {
    mkdirSync(KEYS_DIR, { recursive: true });
  }

  // Generate RSA key pair
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,  // Strong key size
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Write keys to files
  writeFileSync(join(KEYS_DIR, 'private.pem'), privateKey);
  writeFileSync(join(KEYS_DIR, 'public.pem'), publicKey);

  console.log('✅ RSA keys generated successfully!');
  console.log(`   Private key: ${join(KEYS_DIR, 'private.pem')}`);
  console.log(`   Public key: ${join(KEYS_DIR, 'public.pem')}`);
  console.log('');
  console.log('⚠️  IMPORTANT:');
  console.log('   - Keep private.pem SECRET - never commit to git');
  console.log('   - public.pem will be embedded in plugins');
  console.log('   - Backup both keys securely');
}

generateRSAKeys();
```

### Key Storage Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RSA KEY MANAGEMENT                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRIVATE KEY (KEEP SECRET)                                              │
│  ─────────────────────────                                               │
│                                                                          │
│  Location: License Server only                                          │
│                                                                          │
│  Storage Options (choose one):                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  Option 1: Environment Variable (Recommended for VPS)             │  │
│  │  ──────────────────────────────────────────────                   │  │
│  │  # .env.local                                                      │  │
│  │  LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----                 │  │
│  │  MIIEvgIBADANBgkqhkiG9w0BAQEFAASC...                              │  │
│  │  -----END PRIVATE KEY-----"                                       │  │
│  │                                                                    │  │
│  │  Option 2: File Path (Alternative)                                 │  │
│  │  ────────────────────────────────                                  │  │
│  │  LICENSE_PRIVATE_KEY_PATH="/etc/llcpad/keys/private.pem"          │  │
│  │                                                                    │  │
│  │  Option 3: Secret Manager (Enterprise)                             │  │
│  │  ─────────────────────────────────────                             │  │
│  │  AWS Secrets Manager, HashiCorp Vault, etc.                       │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  PUBLIC KEY (CAN BE SHARED)                                             │
│  ──────────────────────────                                              │
│                                                                          │
│  Distribution:                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  1. Embedded in Plugin Code (Obfuscated)                          │  │
│  │     - Included in build process                                   │  │
│  │     - Used for local token verification                           │  │
│  │                                                                    │  │
│  │  2. Available via API (for updates)                                │  │
│  │     GET https://license.llcpad.com/api/public-key                 │  │
│  │     - Allows key rotation without plugin update                   │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  KEY ROTATION                                                            │
│  ────────────                                                            │
│                                                                          │
│  Recommended: Rotate keys annually or after security incident           │
│                                                                          │
│  Process:                                                                │
│  1. Generate new key pair                                                │
│  2. Update License Server with new private key                          │
│  3. Issue new tokens with new key (old tokens still valid until expiry) │
│  4. Update plugins to fetch new public key                              │
│  5. Grace period: Accept both old and new signatures for 30 days       │
│  6. Deprecate old key                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Token Service Implementation

```typescript
// src/services/token.service.ts

import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';

interface TokenPayload {
  licenseKey: string;
  productSlug: string;
  tier: string;
  features: string[];
  domain: string;
  domainLockMode: 'LOCKED' | 'UNLOCKED';
  licenseExpiresAt: string | null;
  supportExpiresAt: string | null;
}

class TokenService {
  private privateKey: CryptoKey | null = null;
  private publicKey: CryptoKey | null = null;

  async initialize() {
    const privateKeyPem = process.env.LICENSE_PRIVATE_KEY!;
    const publicKeyPem = process.env.LICENSE_PUBLIC_KEY!;

    this.privateKey = await importPKCS8(privateKeyPem, 'RS256');
    this.publicKey = await importSPKI(publicKeyPem, 'RS256');
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    if (!this.privateKey) await this.initialize();

    const token = await new SignJWT({
      ...payload,
      iss: 'license.llcpad.com',
      aud: 'llcpad-plugin',
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('7d')  // 7 days
      .sign(this.privateKey!);

    return token;
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    if (!this.publicKey) await this.initialize();

    try {
      const { payload } = await jwtVerify(token, this.publicKey!, {
        issuer: 'license.llcpad.com',
        audience: 'llcpad-plugin',
      });

      return payload as unknown as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

export const tokenService = new TokenService();
```

---

## Webhook Integrations

### CodeCanyon (Envato) Webhook

```typescript
// src/app/api/webhooks/envato/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { licenseService } from '@/services/license.service';
import { webhookService } from '@/services/webhook.service';

// Envato webhook signature verification
function verifyEnvatoSignature(payload: string, signature: string): boolean {
  const secret = process.env.ENVATO_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  const headersList = headers();
  const signature = headersList.get('x-envato-signature') || '';
  const payload = await request.text();

  // Log the webhook
  const webhookLog = await webhookService.create({
    source: 'ENVATO',
    headers: Object.fromEntries(headersList.entries()),
    payload: JSON.parse(payload),
  });

  try {
    // Verify signature
    if (!verifyEnvatoSignature(payload, signature)) {
      await webhookService.updateStatus(webhookLog.id, 'FAILED', 'Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
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

  } catch (error) {
    await webhookService.updateStatus(webhookLog.id, 'FAILED', error.message);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function handleEnvatoSale(data: any, webhookLogId: string) {
  const { sale } = data;

  // Map Envato license type to our tiers
  const tier = sale.license === 'Extended License' ? 'PROFESSIONAL' : 'STANDARD';

  // Get buyer email from Envato API
  const buyerEmail = await getEnvatoBuyerEmail(sale.buyer, sale.id);

  // Find product by Envato item ID
  const product = await prisma.product.findFirst({
    where: { envatoItemId: sale.item_id.toString() },
  });

  if (!product) {
    throw new Error(`Product not found for Envato item ID: ${sale.item_id}`);
  }

  // Generate license
  const license = await licenseService.create({
    productId: product.id,
    tier,
    customerEmail: buyerEmail,
    customerName: sale.buyer,
    orderId: `envato-${sale.id}`,
    orderSource: 'ENVATO',
    purchasePrice: parseFloat(sale.amount),
    purchaseCurrency: 'USD',
    sendEmail: true,
  });

  await webhookService.updateStatus(webhookLogId, 'SUCCESS', null, license.id);
}

async function handleEnvatoRefund(data: any, webhookLogId: string) {
  const { refund } = data;

  // Find license by order ID
  const license = await prisma.license.findFirst({
    where: { orderId: `envato-${refund.sale_id}` },
  });

  if (license) {
    await licenseService.updateStatus(license.id, 'REFUNDED');
  }

  await webhookService.updateStatus(webhookLogId, 'SUCCESS');
}
```

### Gumroad Webhook

```typescript
// src/app/api/webhooks/gumroad/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const payload = {
    seller_id: formData.get('seller_id'),
    product_id: formData.get('product_id'),
    product_name: formData.get('product_name'),
    email: formData.get('email'),
    full_name: formData.get('full_name'),
    sale_id: formData.get('sale_id'),
    sale_timestamp: formData.get('sale_timestamp'),
    price: formData.get('price'),
    variants: formData.get('variants'),  // Contains tier info
    license_key: formData.get('license_key'),
    refunded: formData.get('refunded') === 'true',
  };

  // Log webhook
  const webhookLog = await webhookService.create({
    source: 'GUMROAD',
    payload,
  });

  try {
    if (payload.refunded) {
      await handleGumroadRefund(payload, webhookLog.id);
    } else {
      await handleGumroadSale(payload, webhookLog.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    await webhookService.updateStatus(webhookLog.id, 'FAILED', error.message);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

### Webhook Configuration UI

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Webhook Settings                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CODECANYON (ENVATO)                                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Status: ✅ Connected                                              │  │
│  │                                                                    │  │
│  │  Webhook URL (add this to Envato):                                 │  │
│  │  https://license.llcpad.com/api/webhooks/envato         [Copy]    │  │
│  │                                                                    │  │
│  │  Webhook Secret:                                                   │  │
│  │  [sk_envato_xxxxxxxxxxxxxxxxxxxxxxxx]               [Regenerate]  │  │
│  │                                                                    │  │
│  │  Events: ☑ Sale  ☑ Refund                                         │  │
│  │                                                                    │  │
│  │  Last event: 2 hours ago (sale - LSP-PRO-XXX created)             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  GUMROAD                                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Status: ✅ Connected                                              │  │
│  │                                                                    │  │
│  │  Webhook URL:                                                      │  │
│  │  https://license.llcpad.com/api/webhooks/gumroad        [Copy]    │  │
│  │                                                                    │  │
│  │  Last event: 1 day ago                                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  STRIPE (Coming Soon)                                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Status: ⚪ Not configured                                         │  │
│  │  [Configure Stripe Integration]                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  WEBHOOK LOGS                                          [View All Logs]  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Time            Source    Event    Status    License              │  │
│  │  ─────────────────────────────────────────────────────────────────│  │
│  │  Feb 5, 10:30   Envato    sale     ✅        LSP-PRO-A7B2K9M3     │  │
│  │  Feb 4, 15:45   Gumroad   sale     ✅        SEO-STD-C3D8F1H7     │  │
│  │  Feb 3, 09:00   Envato    refund   ✅        LSP-STD-E5G2J4N6     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security & Rate Limiting

### Rate Limiting Configuration

```typescript
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter (using Upstash Redis or in-memory for dev)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),  // 100 requests per minute
  analytics: true,
});

// Different limits for different endpoints
const rateLimits = {
  '/api/licenses/verify': { requests: 60, window: '1 m' },    // 60/min
  '/api/licenses/refresh': { requests: 30, window: '1 m' },   // 30/min
  '/api/webhooks/*': { requests: 100, window: '1 m' },        // 100/min
  '/api/admin/*': { requests: 200, window: '1 m' },           // 200/min (authenticated)
};

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const path = request.nextUrl.pathname;

  // Only rate limit API routes
  if (path.startsWith('/api/')) {
    const { success, limit, reset, remaining } = await ratelimit.limit(
      `${ip}:${path}`
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: reset },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Security Headers

```typescript
// next.config.ts

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Input Validation

```typescript
// src/lib/validations/license.ts

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
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/, 'Invalid domain format'),

  pluginSlug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),

  pluginVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/),

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

export const createLicenseSchema = z.object({
  productId: z.string().cuid(),
  tier: z.enum(['STANDARD', 'PROFESSIONAL', 'ENTERPRISE', 'DEVELOPER']),
  customerEmail: z.string().email(),
  customerName: z.string().max(255).optional(),
  domainLockMode: z.enum(['LOCKED', 'UNLOCKED']).default('LOCKED'),
  expiresAt: z.string().datetime().nullable().optional(),
  supportExpiresAt: z.string().datetime().optional(),
  orderId: z.string().max(255).optional(),
  orderSource: z.enum(['MANUAL', 'ENVATO', 'GUMROAD', 'STRIPE']).optional(),
  notes: z.string().max(2000).optional(),
  sendEmail: z.boolean().default(true),
});
```

---

## Deployment Strategy

### Docker Configuration

```dockerfile
# Dockerfile

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  license-server:
    build: .
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/license_server
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://license.llcpad.com
      - LICENSE_PRIVATE_KEY=${LICENSE_PRIVATE_KEY}
      - LICENSE_PUBLIC_KEY=${LICENSE_PUBLIC_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - ENVATO_WEBHOOK_SECRET=${ENVATO_WEBHOOK_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:18-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=license_server
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/license.llcpad.com

server {
    listen 80;
    server_name license.llcpad.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name license.llcpad.com;

    ssl_certificate /etc/letsencrypt/live/license.llcpad.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/license.llcpad.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

```env
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/license_server"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="https://license.llcpad.com"

# RSA Keys (multi-line, use quotes)
LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

LICENSE_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"

# Email
RESEND_API_KEY="re_xxxxxxxx"
EMAIL_FROM="LLCPad Licenses <licenses@llcpad.com>"

# Webhooks
ENVATO_WEBHOOK_SECRET="your-envato-webhook-secret"
GUMROAD_SELLER_ID="your-gumroad-seller-id"

# Optional: Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

---

## Monitoring & Analytics

### Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Analytics                                    [Last 30 days ▼] [Export] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  REVENUE                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │   $15,000 ─                                      ╭──────        │    │
│  │   $12,000 ─                            ╭────────╯              │    │
│  │    $9,000 ─                  ╭────────╯                        │    │
│  │    $6,000 ─        ╭────────╯                                  │    │
│  │    $3,000 ─ ──────╯                                            │    │
│  │            Jan    Feb    Mar    Apr    May    Jun              │    │
│  │                                                                  │    │
│  │   Total: $45,000 USD                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  SALES BY PRODUCT                          SALES BY TIER                │
│  ┌──────────────────────────┐              ┌──────────────────────┐     │
│  │  ██████████████ 65%      │              │  ██████████████ 45%  │     │
│  │  LiveSupport Pro         │              │  Standard ($49)      │     │
│  │                          │              │                      │     │
│  │  ████████ 25%            │              │  ████████████ 35%    │     │
│  │  SEO Manager             │              │  Professional ($99)  │     │
│  │                          │              │                      │     │
│  │  ████ 10%                │              │  ████ 15%            │     │
│  │  Other                   │              │  Enterprise ($249)   │     │
│  │                          │              │                      │     │
│  │                          │              │  ██ 5%               │     │
│  │                          │              │  Developer ($499)    │     │
│  └──────────────────────────┘              └──────────────────────┘     │
│                                                                          │
│  ACTIVATIONS (Last 30 days)                                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │   150 ─                                              ╭──        │    │
│  │   120 ─                              ╭──────────────╯          │    │
│  │    90 ─              ╭──────────────╯                          │    │
│  │    60 ─  ──────────╯                                          │    │
│  │    30 ─                                                        │    │
│  │          Week 1   Week 2   Week 3   Week 4                     │    │
│  │                                                                  │    │
│  │   New: 450  │  Refreshed: 1,200  │  Failed: 12                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  TOP COUNTRIES                             FAILED VERIFICATIONS          │
│  ┌──────────────────────────┐              ┌──────────────────────┐     │
│  │  🇺🇸 United States  35%   │              │  Invalid key: 45%    │     │
│  │  🇧🇩 Bangladesh     25%   │              │  Domain limit: 30%   │     │
│  │  🇮🇳 India          15%   │              │  Expired: 15%        │     │
│  │  🇵🇰 Pakistan       10%   │              │  Suspended: 10%      │     │
│  │  🇦🇪 UAE            8%    │              │                      │     │
│  │  🌍 Other           7%    │              │  Total: 12 failures  │     │
│  └──────────────────────────┘              └──────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Health Check Endpoint

```typescript
// src/app/api/health/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    checks.database = false;
  }

  const isHealthy = checks.database;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Project setup (Next.js 16, TypeScript, Tailwind)
- [ ] Database schema (Prisma)
- [ ] Authentication (NextAuth.js)
- [ ] Basic admin layout and navigation
- [ ] RSA key generation script

### Phase 2: Core License API (Week 2)

- [ ] License CRUD operations
- [ ] License verification endpoint
- [ ] Token generation (JWT + RSA)
- [ ] Token refresh endpoint
- [ ] Domain activation/deactivation

### Phase 3: Admin Dashboard (Week 3)

- [ ] Dashboard overview with stats
- [ ] License list with search/filter
- [ ] License detail view
- [ ] Generate license form
- [ ] Product management

### Phase 4: Webhook Integration (Week 4)

- [ ] CodeCanyon (Envato) webhook
- [ ] Gumroad webhook
- [ ] Webhook logging
- [ ] Email notifications (license delivery)

### Phase 5: Security & Polish (Week 5)

- [ ] Rate limiting
- [ ] Input validation
- [ ] Audit logging
- [ ] Analytics dashboard
- [ ] Docker deployment
- [ ] Documentation

---

## Checklist

### Before Launch

- [ ] RSA keys generated and secured
- [ ] Database migrations applied
- [ ] Admin account created
- [ ] Products configured
- [ ] Webhook secrets set
- [ ] Email templates tested
- [ ] Rate limiting configured
- [ ] SSL certificates installed
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

### Security Audit

- [ ] All inputs validated with Zod
- [ ] SQL injection prevented (Prisma)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection (NextAuth)
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] Secrets not in code
- [ ] Audit logs working

---

**Questions or Changes?**
Let me know what needs to be adjusted or clarified!
