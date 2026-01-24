import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

// Get R2 configuration from database settings
export async function getR2Config(): Promise<R2Config | null> {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          startsWith: "storage.r2.",
        },
      },
    });

    const config: Record<string, string> = {};
    settings.forEach((s) => {
      const key = s.key.replace("storage.r2.", "");
      config[key] = s.value;
    });

    // Check if required fields are present
    if (!config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
      return null;
    }

    return {
      accountId: config.accountId || "",
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucketName: config.bucketName,
      publicUrl: config.publicUrl,
    };
  } catch (error) {
    console.error("Error getting R2 config:", error);
    return null;
  }
}

// Create S3 client for R2
export function createR2Client(config: R2Config): S3Client {
  const endpoint = config.accountId
    ? `https://${config.accountId}.r2.cloudflarestorage.com`
    : "https://r2.cloudflarestorage.com";

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

// Test R2 connection
export async function testR2Connection(config: R2Config): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createR2Client(config);

    await client.send(
      new HeadBucketCommand({
        Bucket: config.bucketName,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("R2 connection test failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// Upload file to R2
export async function uploadToR2(
  config: R2Config,
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const client = createR2Client(config);

    // Generate unique key with folder structure
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `uploads/${timestamp}-${cleanFileName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      })
    );

    // Construct public URL
    let url: string;
    if (config.publicUrl) {
      // Custom domain - ensure it has protocol
      let publicUrl = config.publicUrl.replace(/\/$/, "");
      if (!publicUrl.startsWith("http://") && !publicUrl.startsWith("https://")) {
        publicUrl = `https://${publicUrl}`;
      }
      url = `${publicUrl}/${key}`;
    } else if (config.accountId) {
      // R2.dev URL (needs to be enabled in bucket settings)
      url = `https://${config.bucketName}.${config.accountId}.r2.dev/${key}`;
    } else {
      // Fallback - this won't work publicly without configuration
      url = `/${key}`;
    }

    return { success: true, url };
  } catch (error) {
    console.error("R2 upload failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return { success: false, error: errorMessage };
  }
}

// Delete file from R2
export async function deleteFromR2(
  config: R2Config,
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createR2Client(config);

    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error("R2 delete failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: errorMessage };
  }
}

// Check if R2 is configured
export async function isR2Configured(): Promise<boolean> {
  const config = await getR2Config();
  return config !== null;
}
