#!/usr/bin/env tsx
// scripts/package-plugin.ts
// Package the plugin for CodeCanyon distribution

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import archiver from "archiver";

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PACKAGE_DIR = path.join(DIST_DIR, "llcpad-cms");

// Files and directories to include in the package
const INCLUDE_FILES = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "tsconfig.json",
  "tailwind.config.ts",
  "postcss.config.mjs",
  "server.ts",
  ".env.example",
  "README.md",
  "LICENSE",
];

const INCLUDE_DIRS = [
  "src",
  "public",
  "prisma",
  ".next",
  "dist", // Socket.io server build
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  "node_modules",
  ".git",
  ".env",
  ".env.local",
  ".env.production",
  "*.log",
  ".DS_Store",
  "Thumbs.db",
];

async function createPackage() {
  console.log("=== LLCPad Plugin Packager ===\n");

  // Step 1: Clean previous package
  console.log("1. Cleaning previous package...");
  if (fs.existsSync(PACKAGE_DIR)) {
    fs.rmSync(PACKAGE_DIR, { recursive: true });
  }
  fs.mkdirSync(PACKAGE_DIR, { recursive: true });
  console.log("   Done.\n");

  // Step 2: Copy files
  console.log("2. Copying files...");

  // Copy individual files
  for (const file of INCLUDE_FILES) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(PACKAGE_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`   Copied: ${file}`);
    }
  }

  // Copy directories
  for (const dir of INCLUDE_DIRS) {
    const src = path.join(ROOT_DIR, dir);
    const dest = path.join(PACKAGE_DIR, dir);
    if (fs.existsSync(src)) {
      copyDirRecursive(src, dest, EXCLUDE_PATTERNS);
      console.log(`   Copied: ${dir}/`);
    }
  }
  console.log("   Done.\n");

  // Step 3: Create .env.example if it doesn't exist
  console.log("3. Creating .env.example...");
  const envExample = `# LLCPad CMS Configuration
# Copy this file to .env.local and fill in the values

# Database (PostgreSQL)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=llcpad

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=LLCPad
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

# File Storage (Cloudflare R2 / S3)
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=llcpad
S3_PUBLIC_URL=https://your-cdn.com

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# PayPal (Optional)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# SSLCommerz (Bangladesh)
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=

# License Verification (Plugin)
PLUGIN_LICENSE_KEY=
PLUGIN_PURCHASE_CODE=
`;
  fs.writeFileSync(path.join(PACKAGE_DIR, ".env.example"), envExample);
  console.log("   Done.\n");

  // Step 4: Create ZIP archive
  console.log("4. Creating ZIP archive...");
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
  );
  const version = packageJson.version || "1.0.0";
  const zipName = `llcpad-cms-v${version}.zip`;
  const zipPath = path.join(DIST_DIR, zipName);

  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  const output = createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(PACKAGE_DIR, "llcpad-cms");

  await archive.finalize();

  const stats = fs.statSync(zipPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`   Done.\n`);
  console.log("=== Package Complete ===");
  console.log(`\nOutput: ${zipPath}`);
  console.log(`Size: ${sizeMB} MB`);
  console.log(`Version: ${version}`);
}

function copyDirRecursive(src: string, dest: string, exclude: string[]) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Check exclusions
    if (exclude.some((pattern) => {
      if (pattern.startsWith("*")) {
        return entry.name.endsWith(pattern.slice(1));
      }
      return entry.name === pattern;
    })) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

createPackage().catch(console.error);
