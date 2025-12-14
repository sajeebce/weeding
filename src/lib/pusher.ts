import PusherClient from "pusher-js";

// Client-side Pusher instance (singleton)
let pusherClient: PusherClient | null = null;
let clientConfigLoaded = false;
let cachedClientConfig: { key: string; cluster: string } | null = null;

// Load client config from API
async function loadClientConfig(): Promise<{ key: string; cluster: string } | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await fetch("/api/pusher-config");
    if (response.ok) {
      const data = await response.json();
      if (data.enabled && data.key && data.cluster) {
        return { key: data.key, cluster: data.cluster };
      }
    }
  } catch (error) {
    console.error("Failed to load Pusher client config:", error);
  }

  // Fall back to environment variables
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (key && cluster) {
    return { key, cluster };
  }

  return null;
}

// Get client-side Pusher instance (async - loads config from API)
export async function getPusherClientAsync(): Promise<PusherClient | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (!clientConfigLoaded) {
    cachedClientConfig = await loadClientConfig();
    clientConfigLoaded = true;
  }

  if (!cachedClientConfig) {
    return null;
  }

  if (!pusherClient) {
    pusherClient = new PusherClient(cachedClientConfig.key, {
      cluster: cachedClientConfig.cluster,
      forceTLS: true,
    });
  }

  return pusherClient;
}

// Legacy sync function - only uses env vars (for backward compatibility)
export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn(
        "Pusher client configuration missing. Real-time features disabled."
      );
      return null;
    }

    pusherClient = new PusherClient(key, {
      cluster,
      forceTLS: true,
    });
  }

  return pusherClient;
}

// Reset client-side config cache
export function resetPusherClientConfig(): void {
  pusherClient = null;
  clientConfigLoaded = false;
  cachedClientConfig = null;
}

export function isPusherClientConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );
}

// Check if client config is available (async - checks API)
export async function isPusherClientConfiguredAsync(): Promise<boolean> {
  const config = await loadClientConfig();
  return config !== null;
}

// Channel names
export const CHANNELS = {
  ticket: (ticketId: string) => `ticket-${ticketId}`,
  admin: "admin-notifications",
  agents: "presence-agents",
} as const;

// Event names
export const EVENTS = {
  MESSAGE_NEW: "message:new",
  MESSAGE_READ: "message:read",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  TICKET_NEW: "ticket:new",
  TICKET_UPDATED: "ticket:updated",
  TICKET_ASSIGNED: "ticket:assigned",
  TICKET_RESOLVED: "ticket:resolved",
  AGENT_ONLINE: "agent:online",
  AGENT_OFFLINE: "agent:offline",
} as const;

// Type definitions for events
export interface MessageNewEvent {
  ticketId: string;
  message: {
    id: string;
    content: string;
    senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
    senderName: string;
    type: string;
    createdAt: string;
    attachments?: Array<{
      id: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }>;
  };
}

export interface TypingEvent {
  ticketId: string;
  user: {
    id: string;
    name: string;
    type: "CUSTOMER" | "AGENT";
  };
}

export interface TicketNewEvent {
  ticket: {
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    priority: string;
    guestName?: string;
    guestEmail?: string;
    createdAt: string;
  };
}

export interface TicketUpdatedEvent {
  ticketId: string;
  updates: {
    status?: string;
    priority?: string;
    assignedToId?: string;
    assignedToName?: string;
  };
}
