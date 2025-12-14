import Pusher from "pusher";
import prisma from "@/lib/db";
import { CHANNELS, EVENTS } from "./pusher";
import type { MessageNewEvent, TypingEvent, TicketNewEvent, TicketUpdatedEvent } from "./pusher";

// Re-export for convenience
export { CHANNELS, EVENTS };
export type { MessageNewEvent, TypingEvent, TicketNewEvent, TicketUpdatedEvent };

const PUSHER_CONFIG_KEY = "pusher.config";

interface PusherConfig {
  enabled: boolean;
  appId: string;
  key: string;
  secret: string;
  cluster: string;
}

// Server-side Pusher instance
let pusherServer: Pusher | null = null;
let cachedServerConfig: PusherConfig | null = null;

// Load Pusher config from database (server-side only)
async function loadServerConfig(): Promise<PusherConfig | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: PUSHER_CONFIG_KEY },
    });

    if (setting) {
      const config = JSON.parse(setting.value) as PusherConfig;
      if (config.enabled && config.appId && config.key && config.secret && config.cluster) {
        return config;
      }
    }
  } catch (error) {
    console.error("Failed to load Pusher config from database:", error);
  }

  // Fall back to environment variables
  if (
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  ) {
    return {
      enabled: true,
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
    };
  }

  return null;
}

// Get server-side Pusher instance (async)
export async function getPusherServerAsync(): Promise<Pusher | null> {
  if (!cachedServerConfig) {
    cachedServerConfig = await loadServerConfig();
  }

  if (!cachedServerConfig) {
    return null;
  }

  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: cachedServerConfig.appId,
      key: cachedServerConfig.key,
      secret: cachedServerConfig.secret,
      cluster: cachedServerConfig.cluster,
      useTLS: true,
    });
  }

  return pusherServer;
}

// Legacy sync function - only uses env vars (for backward compatibility)
export function getPusherServer(): Pusher {
  if (!pusherServer) {
    if (
      !process.env.PUSHER_APP_ID ||
      !process.env.PUSHER_KEY ||
      !process.env.PUSHER_SECRET ||
      !process.env.PUSHER_CLUSTER
    ) {
      throw new Error(
        "Pusher configuration missing. Please configure Pusher in admin settings or set environment variables."
      );
    }

    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    });
  }

  return pusherServer;
}

// Reset cached config (call this when config is updated)
export function resetPusherConfig(): void {
  pusherServer = null;
  cachedServerConfig = null;
}

// Check if Pusher is configured (async - checks database first)
export async function isPusherConfiguredAsync(): Promise<boolean> {
  const config = await loadServerConfig();
  return config !== null;
}

// Legacy sync check - only uses env vars
export function isPusherConfigured(): boolean {
  return !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  );
}

// Helper functions to trigger events (server-side only)
export async function triggerMessageNew(
  ticketId: string,
  message: MessageNewEvent["message"]
) {
  try {
    const pusher = await getPusherServerAsync();
    if (!pusher) {
      console.warn("Pusher not configured, skipping message:new event");
      return;
    }
    await pusher.trigger(CHANNELS.ticket(ticketId), EVENTS.MESSAGE_NEW, {
      ticketId,
      message,
    } as MessageNewEvent);
  } catch (error) {
    console.error("Failed to trigger message:new event:", error);
  }
}

export async function triggerTyping(
  ticketId: string,
  user: TypingEvent["user"],
  isTyping: boolean
) {
  try {
    const pusher = await getPusherServerAsync();
    if (!pusher) {
      return;
    }
    await pusher.trigger(
      CHANNELS.ticket(ticketId),
      isTyping ? EVENTS.TYPING_START : EVENTS.TYPING_STOP,
      { ticketId, user } as TypingEvent
    );
  } catch (error) {
    console.error("Failed to trigger typing event:", error);
  }
}

export async function triggerTicketNew(ticket: TicketNewEvent["ticket"]) {
  try {
    const pusher = await getPusherServerAsync();
    if (!pusher) {
      console.warn("Pusher not configured, skipping ticket:new event");
      return;
    }
    await pusher.trigger(CHANNELS.admin, EVENTS.TICKET_NEW, {
      ticket,
    } as TicketNewEvent);
  } catch (error) {
    console.error("Failed to trigger ticket:new event:", error);
  }
}

export async function triggerTicketUpdated(
  ticketId: string,
  updates: TicketUpdatedEvent["updates"]
) {
  try {
    const pusher = await getPusherServerAsync();
    if (!pusher) {
      console.warn("Pusher not configured, skipping ticket:updated event");
      return;
    }
    await pusher.trigger(CHANNELS.admin, EVENTS.TICKET_UPDATED, {
      ticketId,
      updates,
    } as TicketUpdatedEvent);
    await pusher.trigger(CHANNELS.ticket(ticketId), EVENTS.TICKET_UPDATED, {
      ticketId,
      updates,
    } as TicketUpdatedEvent);
  } catch (error) {
    console.error("Failed to trigger ticket:updated event:", error);
  }
}
