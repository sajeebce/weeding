/**
 * Encryption utility for storing sensitive data in database
 * Uses AES-256-GCM encryption
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    // For development, use a default key (NOT for production)
    console.warn("WARNING: ENCRYPTION_KEY not set, using default key. Set ENCRYPTION_KEY in .env for production!");
    return crypto.scryptSync("default-dev-key-change-in-production", "salt", 32);
  }

  // If key is base64 encoded
  if (key.length === 44) {
    return Buffer.from(key, "base64");
  }

  // If key is hex encoded
  if (key.length === 64) {
    return Buffer.from(key, "hex");
  }

  // Derive key from passphrase
  return crypto.scryptSync(key, "llcpad-salt", 32);
}

/**
 * Encrypt a string value
 */
export function encrypt(text: string): string {
  if (!text) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Encrypted data
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";

  try {
    const key = getEncryptionKey();

    // Extract IV (first 32 hex chars = 16 bytes)
    const iv = Buffer.from(encryptedText.slice(0, IV_LENGTH * 2), "hex");

    // Extract AuthTag (next 32 hex chars = 16 bytes)
    const authTag = Buffer.from(
      encryptedText.slice(IV_LENGTH * 2, IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2),
      "hex"
    );

    // Extract encrypted data
    const encrypted = encryptedText.slice(IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

/**
 * Generate a new encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("base64");
}

/**
 * Mask a secret key for display (show first 4 and last 4 chars)
 */
export function maskSecret(secret: string): string {
  if (!secret || secret.length < 12) return "••••••••";
  return `${secret.slice(0, 4)}••••••••${secret.slice(-4)}`;
}

/**
 * Check if a value is encrypted (basic check)
 */
export function isEncrypted(value: string): boolean {
  // Encrypted values are hex strings with minimum length
  return /^[a-f0-9]+$/i.test(value) && value.length > 64;
}
