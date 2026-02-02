#!/usr/bin/env tsx
// scripts/obfuscate.ts
// Code obfuscation for CodeCanyon protection

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT_DIR = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(ROOT_DIR, ".next");

// Files to obfuscate (server-side only - client code is already minified by Next.js)
const OBFUSCATE_PATTERNS = [
  ".next/server/**/*.js",
  "dist/**/*.js",
];

// Obfuscation options for javascript-obfuscator
const OBFUSCATION_OPTIONS = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.5,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.2,
  debugProtection: false, // Set to true for production
  disableConsoleOutput: false, // Set to true for production
  identifierNamesGenerator: "hexadecimal",
  log: false,
  numbersToExpressions: true,
  renameGlobals: false, // Keep false to avoid breaking Node.js globals
  selfDefending: false, // Can cause issues with some bundlers
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 10,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ["base64"],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: "function",
  stringArrayThreshold: 0.75,
  unicodeEscapeSequence: false,
};

interface ObfuscateResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

async function obfuscateFiles(): Promise<ObfuscateResult> {
  console.log("=== LLCPad Code Obfuscator ===\n");

  const result: ObfuscateResult = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
  };

  // Check if javascript-obfuscator is installed
  try {
    execSync("npx javascript-obfuscator --version", { stdio: "pipe" });
  } catch {
    console.log("Installing javascript-obfuscator...");
    execSync("npm install -D javascript-obfuscator", { cwd: ROOT_DIR, stdio: "inherit" });
  }

  // Find all JS files to obfuscate
  const files: string[] = [];

  for (const pattern of OBFUSCATE_PATTERNS) {
    const globPattern = path.join(ROOT_DIR, pattern);
    try {
      // Use glob to find files
      const { globSync } = await import("glob");
      const matches = globSync(globPattern);
      files.push(...matches);
    } catch {
      console.log(`Pattern ${pattern} - no matches or glob not available`);
    }
  }

  if (files.length === 0) {
    console.log("No files to obfuscate. Run 'npm run build' first.\n");
    return result;
  }

  result.total = files.length;
  console.log(`Found ${files.length} files to obfuscate.\n`);

  // Write options to temp file
  const optionsFile = path.join(ROOT_DIR, ".obfuscator-options.json");
  fs.writeFileSync(optionsFile, JSON.stringify(OBFUSCATION_OPTIONS, null, 2));

  // Obfuscate each file
  for (const file of files) {
    const relativePath = path.relative(ROOT_DIR, file);
    process.stdout.write(`  Obfuscating: ${relativePath}... `);

    try {
      // Read original file
      const originalCode = fs.readFileSync(file, "utf-8");

      // Skip if file is too small or already obfuscated
      if (originalCode.length < 100) {
        console.log("skipped (too small)");
        continue;
      }

      if (originalCode.includes("_0x") && originalCode.includes("\\x")) {
        console.log("skipped (already obfuscated)");
        continue;
      }

      // Obfuscate using CLI
      execSync(
        `npx javascript-obfuscator "${file}" --output "${file}" --config "${optionsFile}"`,
        { cwd: ROOT_DIR, stdio: "pipe" }
      );

      result.success++;
      console.log("done");
    } catch (error) {
      result.failed++;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`${relativePath}: ${errorMsg}`);
      console.log("failed");
    }
  }

  // Cleanup
  if (fs.existsSync(optionsFile)) {
    fs.unlinkSync(optionsFile);
  }

  console.log("\n=== Obfuscation Complete ===");
  console.log(`Total: ${result.total}`);
  console.log(`Success: ${result.success}`);
  console.log(`Failed: ${result.failed}`);

  if (result.errors.length > 0) {
    console.log("\nErrors:");
    result.errors.forEach((err) => console.log(`  - ${err}`));
  }

  return result;
}

// Light obfuscation for development/testing
export async function obfuscateLight(): Promise<void> {
  const lightOptions = {
    ...OBFUSCATION_OPTIONS,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArrayEncoding: [],
    splitStrings: false,
  };

  console.log("Running light obfuscation (faster, less protection)...\n");
  // Apply light options and run
}

// Run if called directly
obfuscateFiles().catch(console.error);

export { obfuscateFiles, OBFUSCATION_OPTIONS };
