#!/usr/bin/env tsx
// scripts/build-plugin.ts
// Build the plugin for distribution

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(ROOT_DIR, ".next");

console.log("=== LLCPad Plugin Build ===\n");

// Step 1: Clean previous builds
console.log("1. Cleaning previous builds...");
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true });
}
console.log("   Done.\n");

// Step 2: Install dependencies
console.log("2. Installing dependencies...");
execSync("npm ci", { cwd: ROOT_DIR, stdio: "inherit" });
console.log("   Done.\n");

// Step 3: Generate Prisma client
console.log("3. Generating Prisma client...");
execSync("npx prisma generate", { cwd: ROOT_DIR, stdio: "inherit" });
console.log("   Done.\n");

// Step 4: Build Next.js
console.log("4. Building Next.js application...");
execSync("npm run build", { cwd: ROOT_DIR, stdio: "inherit" });
console.log("   Done.\n");

// Step 5: Build Socket.io server
console.log("5. Building Socket.io server...");
execSync("npm run build:server", { cwd: ROOT_DIR, stdio: "inherit" });
console.log("   Done.\n");

console.log("=== Build Complete ===");
console.log("\nTo create distribution package, run:");
console.log("  npm run plugin:package");
