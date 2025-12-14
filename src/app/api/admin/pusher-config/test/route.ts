import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Pusher from "pusher";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden - Admin only", status: 403 };
  }
  return { session };
}

// POST - Test Pusher connection
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.appId || !body.key || !body.secret || !body.cluster) {
      return NextResponse.json(
        { error: "Missing required Pusher credentials" },
        { status: 400 }
      );
    }

    // Create a temporary Pusher instance with provided credentials
    const pusher = new Pusher({
      appId: body.appId,
      key: body.key,
      secret: body.secret,
      cluster: body.cluster,
      useTLS: true,
    });

    // Try to trigger a test event
    await pusher.trigger("test-channel", "test-event", {
      message: "Connection test successful",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Connection successful"
    });
  } catch (error) {
    console.error("Pusher connection test failed:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Check for common errors
    if (errorMessage.includes("Invalid key") || errorMessage.includes("Invalid signature")) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your App ID, Key, and Secret." },
        { status: 400 }
      );
    }

    if (errorMessage.includes("Could not connect")) {
      return NextResponse.json(
        { error: "Could not connect to Pusher. Please check your cluster setting." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Connection failed: ${errorMessage}` },
      { status: 400 }
    );
  }
}
