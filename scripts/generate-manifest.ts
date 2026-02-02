#!/usr/bin/env tsx
// scripts/generate-manifest.ts
// Generate plugin manifest for LLCPad CMS

import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT_DIR = path.resolve(__dirname, "..");

interface PluginManifest {
  // Basic Info
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  author: string;
  authorUrl: string;
  license: string;

  // Compatibility
  minCmsVersion: string;
  maxCmsVersion: string;

  // Features
  features: string[];
  permissions: string[];

  // Files
  entryPoint: string;
  assets: string[];
  migrations: string[];

  // Dependencies
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;

  // Metadata
  createdAt: string;
  updatedAt: string;
  checksum: string;

  // CodeCanyon
  itemId?: string;
  purchaseCode?: string;
}

function generateChecksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function getPackageInfo(): { name: string; version: string; description: string; dependencies: Record<string, string> } {
  const packagePath = path.join(ROOT_DIR, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
  return {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    dependencies: packageJson.dependencies || {},
  };
}

function findMigrations(): string[] {
  const migrationsDir = path.join(ROOT_DIR, "prisma", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const migrations: string[] = [];
  const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      const migrationSql = path.join(migrationsDir, entry.name, "migration.sql");
      if (fs.existsSync(migrationSql)) {
        migrations.push(`prisma/migrations/${entry.name}/migration.sql`);
      }
    }
  }

  return migrations.sort();
}

function findAssets(): string[] {
  const assets: string[] = [];
  const publicDir = path.join(ROOT_DIR, "public");

  if (fs.existsSync(publicDir)) {
    const walkDir = (dir: string, basePath: string = "") => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
          walkDir(fullPath, relativePath);
        } else if (!entry.name.startsWith(".")) {
          assets.push(`public/${relativePath.replace(/\\/g, "/")}`);
        }
      }
    };
    walkDir(publicDir);
  }

  return assets;
}

async function generateManifest(): Promise<PluginManifest> {
  console.log("=== Plugin Manifest Generator ===\n");

  const pkg = getPackageInfo();
  const migrations = findMigrations();
  const assets = findAssets();

  const manifest: PluginManifest = {
    // Basic Info
    id: "llcpad-cms",
    name: "LLCPad CMS",
    slug: "llcpad",
    version: pkg.version,
    description: pkg.description,
    author: "LLCPad",
    authorUrl: "https://llcpad.com",
    license: "Regular/Extended (CodeCanyon)",

    // Compatibility
    minCmsVersion: "1.0.0",
    maxCmsVersion: "2.0.0",

    // Features
    features: [
      "llc-formation",
      "service-management",
      "order-management",
      "customer-management",
      "live-support",
      "email-notifications",
      "payment-gateway",
      "page-builder",
      "blog",
      "seo",
    ],

    permissions: [
      "admin:read",
      "admin:write",
      "orders:read",
      "orders:write",
      "customers:read",
      "customers:write",
      "support:read",
      "support:write",
      "settings:read",
      "settings:write",
    ],

    // Files
    entryPoint: "src/app/page.tsx",
    assets,
    migrations,

    // Dependencies
    dependencies: {
      "next": pkg.dependencies["next"] || "^15.0.0",
      "react": pkg.dependencies["react"] || "^19.0.0",
      "prisma": pkg.dependencies["prisma"] || "^7.0.0",
      "socket.io": pkg.dependencies["socket.io"] || "^4.8.0",
    },

    peerDependencies: {
      "postgresql": ">=14.0.0",
      "node": ">=20.0.0",
    },

    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checksum: "",
  };

  // Generate checksum of manifest content
  const contentForChecksum = JSON.stringify({
    ...manifest,
    checksum: undefined,
    updatedAt: undefined,
  });
  manifest.checksum = generateChecksum(contentForChecksum);

  // Write manifest
  const manifestPath = path.join(ROOT_DIR, "plugin.manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log("Manifest generated successfully!");
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Features: ${manifest.features.length}`);
  console.log(`  Migrations: ${manifest.migrations.length}`);
  console.log(`  Assets: ${manifest.assets.length}`);
  console.log(`  Checksum: ${manifest.checksum.substring(0, 16)}...`);
  console.log(`\nOutput: ${manifestPath}\n`);

  return manifest;
}

// Run if called directly
generateManifest().catch(console.error);

export { generateManifest, PluginManifest };
