import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().optional().default("website"),
});

async function addToBrevo(email: string, name?: string, listId?: string) {
  const apiKey = await getSetting("newsletter.brevo.apiKey");

  if (!apiKey) {
    throw new Error("Brevo API key not configured");
  }

  const doubleOptIn = await getSetting("newsletter.doubleOptIn");

  const payload: Record<string, unknown> = {
    email,
    updateEnabled: true,
  };

  if (name) {
    payload.attributes = { FIRSTNAME: name };
  }

  if (listId) {
    payload.listIds = [parseInt(listId)];
  }

  // If double opt-in is enabled, use DOI endpoint
  if (doubleOptIn === "true") {
    const response = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        templateId: 1, // Default DOI template
        redirectionUrl: process.env.NEXT_PUBLIC_APP_URL || "https://llcpad.com",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Contact already exists is not an error
      if (error.code === "duplicate_parameter") {
        return { alreadyExists: true };
      }
      throw new Error(error.message || "Failed to add to Brevo");
    }
  } else {
    // Direct add without double opt-in
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Contact already exists is not an error
      if (error.code === "duplicate_parameter") {
        return { alreadyExists: true };
      }
      throw new Error(error.message || "Failed to add to Brevo");
    }
  }

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    // Check if newsletter is enabled
    const enabled = await getSetting("newsletter.enabled");
    if (enabled === "false") {
      return NextResponse.json(
        { error: "Newsletter subscription is currently disabled" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, name, source } = subscribeSchema.parse(body);

    const provider = await getSetting("newsletter.provider") || "brevo";
    const storeLocally = await getSetting("newsletter.storeLocally") !== "false";

    // Store locally if enabled
    if (storeLocally) {
      try {
        await prisma.newsletterSubscriber.upsert({
          where: { email },
          update: {
            name: name || undefined,
            updatedAt: new Date(),
          },
          create: {
            email,
            name,
            source,
            status: "ACTIVE",
            subscribedAt: new Date(),
          },
        });
      } catch (dbError) {
        console.error("Failed to store subscriber locally:", dbError);
        // Continue even if local storage fails
      }
    }

    // Add to provider
    if (provider === "brevo") {
      const listId = await getSetting("newsletter.brevo.listId");
      const result = await addToBrevo(email, name, listId || undefined);

      if (result.alreadyExists) {
        return NextResponse.json({
          success: true,
          message: "You are already subscribed!",
        });
      }

      const doubleOptIn = await getSetting("newsletter.doubleOptIn");
      return NextResponse.json({
        success: true,
        message: doubleOptIn === "true"
          ? "Please check your email to confirm your subscription"
          : "Successfully subscribed!",
      });
    }

    // Local only provider
    if (provider === "local") {
      return NextResponse.json({
        success: true,
        message: "Successfully subscribed!",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
