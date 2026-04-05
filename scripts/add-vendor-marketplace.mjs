import { Client } from "pg";
import { readFileSync } from "fs";

function getDbUrl() {
  try {
    const env = readFileSync(".env.local", "utf8");
    const m = env.match(/DATABASE_URL="([^"]+)"/);
    if (m) return m[1];
  } catch {}
  try {
    const env = readFileSync(".env", "utf8");
    const m = env.match(/DATABASE_URL="([^"]+)"/);
    if (m) return m[1];
  } catch {}
  return process.env.DATABASE_URL;
}

const client = new Client({ connectionString: getDbUrl() });

await client.connect();
console.log("Connected to DB");

// Add VENDOR to UserRole enum
try {
  await client.query(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'VENDOR';`);
  console.log("✅ VENDOR added to UserRole enum");
} catch (e) {
  console.log("UserRole VENDOR:", e.message);
}

// Create InquiryStatus enum
await client.query(`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InquiryStatus') THEN
      CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'VIEWED', 'RESPONDED', 'ARCHIVED');
    END IF;
  END $$;
`);
console.log("✅ InquiryStatus enum ready");

// VendorProfile table
await client.query(`
  CREATE TABLE IF NOT EXISTS "VendorProfile" (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    "businessName" TEXT NOT NULL,
    category "VendorCategory" NOT NULL,
    description TEXT,
    tagline TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    city TEXT,
    country TEXT NOT NULL DEFAULT 'SE',
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    "serviceRadiusKm" INTEGER,
    photos TEXT[] NOT NULL DEFAULT '{}',
    "videoUrls" TEXT[] NOT NULL DEFAULT '{}',
    "startingPrice" INTEGER,
    currency TEXT NOT NULL DEFAULT 'SEK',
    "yearsInBusiness" INTEGER,
    languages TEXT[] NOT NULL DEFAULT '{}',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  );
`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorProfile_category_idx" ON "VendorProfile"(category);`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorProfile_isApproved_isActive_idx" ON "VendorProfile"("isApproved", "isActive");`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorProfile_city_idx" ON "VendorProfile"(city);`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorProfile_isFeatured_idx" ON "VendorProfile"("isFeatured");`);
console.log("✅ VendorProfile table ready");

// VendorInquiry table
await client.query(`
  CREATE TABLE IF NOT EXISTS "VendorInquiry" (
    id TEXT PRIMARY KEY,
    "vendorId" TEXT NOT NULL REFERENCES "VendorProfile"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP,
    message TEXT NOT NULL,
    budget TEXT,
    status "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  );
`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorInquiry_vendorId_idx" ON "VendorInquiry"("vendorId");`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorInquiry_vendorId_status_idx" ON "VendorInquiry"("vendorId", status);`);
console.log("✅ VendorInquiry table ready");

// VendorReview table
await client.query(`
  CREATE TABLE IF NOT EXISTS "VendorReview" (
    id TEXT PRIMARY KEY,
    "vendorId" TEXT NOT NULL REFERENCES "VendorProfile"(id) ON DELETE CASCADE,
    "authorName" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    reply TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  );
`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorReview_vendorId_idx" ON "VendorReview"("vendorId");`);
await client.query(`CREATE INDEX IF NOT EXISTS "VendorReview_vendorId_isApproved_idx" ON "VendorReview"("vendorId", "isApproved");`);
console.log("✅ VendorReview table ready");

await client.end();
console.log("✅ Migration complete!");
