import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (!pusherServer) {
    // Check if Pusher is configured
    if (
      !process.env.PUSHER_APP_ID ||
      !process.env.PUSHER_KEY ||
      !process.env.PUSHER_SECRET ||
      !process.env.PUSHER_CLUSTER
    ) {
      throw new Error(
        "Pusher configuration missing. Please set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER environment variables."
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

// Client-side Pusher instance (singleton)
let pusherClient: PusherClient | null = null;

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

// Channel names
export const CHANNELS = {
  // Ticket-specific channel (for messages, typing, etc.)
  ticket: (ticketId: string) => `ticket-${ticketId}`,

  // Admin notifications channel
  admin: "admin-notifications",

  // Agent presence channel
  agents: "presence-agents",
} as const;

// Event names
export const EVENTS = {
  // Message events
  MESSAGE_NEW: "message:new",
  MESSAGE_READ: "message:read",

  // Typing events
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // Ticket events
  TICKET_NEW: "ticket:new",
  TICKET_UPDATED: "ticket:updated",
  TICKET_ASSIGNED: "ticket:assigned",
  TICKET_RESOLVED: "ticket:resolved",

  // Agent events
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

// Helper functions to trigger events
export async function triggerMessageNew(
  ticketId: string,
  message: MessageNewEvent["message"]
) {
  try {
    const pusher = getPusherServer();
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
    const pusher = getPusherServer();
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
    const pusher = getPusherServer();
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
    const pusher = getPusherServer();
    // Notify admin channel
    await pusher.trigger(CHANNELS.admin, EVENTS.TICKET_UPDATED, {
      ticketId,
      updates,
    } as TicketUpdatedEvent);
    // Also notify ticket channel
    await pusher.trigger(CHANNELS.ticket(ticketId), EVENTS.TICKET_UPDATED, {
      ticketId,
      updates,
    } as TicketUpdatedEvent);
  } catch (error) {
    console.error("Failed to trigger ticket:updated event:", error);
  }
}

// Check if Pusher is configured
export function isPusherConfigured(): boolean {
  return !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  );
}

export function isPusherClientConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );
}
