import { NextRequest, NextResponse } from "next/server";
import { testR2Connection, type R2Config } from "@/lib/storage/r2";

export async function POST(request: NextRequest) {
  try {
    // Note: Admin page access is protected by middleware
    // This API just tests R2 credentials and doesn't expose sensitive data
    const body = await request.json();

    // Extract R2 config from request
    const config: R2Config = {
      accountId: body["storage.r2.accountId"] || "",
      accessKeyId: body["storage.r2.accessKeyId"] || "",
      secretAccessKey: body["storage.r2.secretAccessKey"] || "",
      bucketName: body["storage.r2.bucketName"] || "",
      publicUrl: body["storage.r2.publicUrl"] || "",
    };

    // Validate required fields
    if (!config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Test connection
    const result = await testR2Connection(config);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error testing R2 connection:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
