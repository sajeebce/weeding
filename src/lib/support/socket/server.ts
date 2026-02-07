/**
 * Socket.io Server for Live Support Chat
 *
 * Handles real-time chat between visitors and support agents.
 * Messages are persisted to the database via Prisma.
 *
 * Visitor flow:
 * 1. Connect (no auth needed)
 * 2. chat:request → creates SupportTicket (LIVE_CHAT source)
 * 3. Agent accepts → chat:accept
 * 4. Messages flow in real-time, saved as SupportMessage
 * 5. chat:end → ticket marked RESOLVED
 *
 * Agent flow:
 * 1. Connect with auth:authenticate { userId }
 * 2. Joins "agents" room, receives queue updates
 * 3. Accepts chat → joins chat room
 * 4. Sends/receives messages in real-time
 */

import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { PrismaClient } from "@prisma/client";

// Socket event constants
export const CHAT_EVENTS = {
  REQUEST: "chat:request",
  ACCEPT: "chat:accept",
  MESSAGE: "chat:message",
  TYPING: "chat:typing",
  END: "chat:end",
  QUEUE_UPDATE: "chat:queue_update",
  EMAIL_UPDATE: "chat:email_update",
  AGENT_TIMEOUT: "chat:agent_timeout",
  AGENTS_STATUS: "agents:status",
  REJOIN: "chat:rejoin",
  COLLECT_INFO: "chat:collect_info",
  LEAD_UPDATE: "chat:lead_update",
  INFO_COLLECTED: "chat:info_collected",
};

export const AUTH_EVENTS = {
  AUTHENTICATE: "auth:authenticate",
  AUTHENTICATED: "auth:authenticated",
  AUTH_ERROR: "auth:error",
};

export const PRESENCE_EVENTS = {
  STATUS_UPDATE: "presence:status_update",
  OFFLINE: "presence:offline",
  ONLINE: "presence:online",
};

interface SocketUser {
  id: string;
  name: string;
  email?: string;
  role: string;
  isAgent: boolean;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

interface ChatSession {
  id: string;
  ticketId: string;
  visitorSocketId: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  agentId?: string;
  agentName?: string;
  status: "WAITING" | "ACTIVE" | "ENDED";
  createdAt: Date;
  timeoutTimer?: ReturnType<typeof setTimeout>;
}

// In-memory stores
const chatSessions = new Map<string, ChatSession>();
const connectedAgents = new Map<
  string,
  { socketId: string; name: string; status: string }
>();

let db: PrismaClient;
let ioInstance: SocketIOServer;

/**
 * Set the Prisma client instance (called from chat-server.ts)
 */
export function setPrismaClient(prisma: PrismaClient) {
  db = prisma;
}

/**
 * Broadcast agent availability status to ALL connected sockets
 */
function broadcastAgentsStatus() {
  if (!ioInstance) return;
  const onlineCount = Array.from(connectedAgents.values()).filter(
    (a) => a.status === "online"
  ).length;
  ioInstance.emit(CHAT_EVENTS.AGENTS_STATUS, {
    online: onlineCount > 0,
    count: onlineCount,
  });
}

/**
 * Initialize the Socket.io server
 */
export function initializeSocketServer(
  httpServer: HTTPServer,
  prisma?: PrismaClient
): SocketIOServer {
  if (prisma) db = prisma;

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      ],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  ioInstance = io;

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`[Chat] Client connected: ${socket.id}`);

    registerAuthHandlers(io, authSocket);
    registerChatHandlers(io, authSocket);
    registerPresenceHandlers(io, authSocket);

    socket.on("disconnect", () => {
      handleDisconnect(io, authSocket);
    });
  });

  console.log("[Chat] Socket.io server initialized");
  return io;
}

/**
 * Authentication handlers
 */
function registerAuthHandlers(
  io: SocketIOServer,
  socket: AuthenticatedSocket
) {
  socket.on(
    AUTH_EVENTS.AUTHENTICATE,
    async (data: { userId: string; name?: string }) => {
      try {
        if (!db) {
          socket.emit(AUTH_EVENTS.AUTH_ERROR, {
            message: "Database not available",
          });
          return;
        }

        const user = await db.user.findUnique({
          where: { id: data.userId },
          select: { id: true, name: true, email: true, role: true },
        });

        if (!user) {
          socket.emit(AUTH_EVENTS.AUTH_ERROR, { message: "User not found" });
          return;
        }

        const isAgent =
          user.role === "ADMIN" || user.role === "SUPPORT_AGENT";

        socket.user = {
          id: user.id,
          name: user.name || data.name || "Agent",
          email: user.email || undefined,
          role: user.role,
          isAgent,
        };

        socket.join(`user:${user.id}`);

        if (isAgent) {
          socket.join("agents");
          connectedAgents.set(user.id, {
            socketId: socket.id,
            name: socket.user.name,
            status: "online",
          });

          // Send current queue to this agent
          const waitingChats = Array.from(chatSessions.values())
            .filter((s) => s.status === "WAITING")
            .map((s) => ({
              id: s.id,
              ticketId: s.ticketId,
              visitorName: s.visitorName,
              visitorEmail: s.visitorEmail,
              visitorPhone: s.visitorPhone,
              createdAt: s.createdAt,
            }));

          const activeChats = Array.from(chatSessions.values())
            .filter((s) => s.status === "ACTIVE" && s.agentId === user.id)
            .map((s) => ({
              id: s.id,
              ticketId: s.ticketId,
              visitorName: s.visitorName,
              visitorEmail: s.visitorEmail,
              visitorPhone: s.visitorPhone,
              agentName: s.agentName,
              createdAt: s.createdAt,
            }));

          // Rejoin agent to rooms for their active chats
          for (const chat of Array.from(chatSessions.values()).filter(
            (s) => s.status === "ACTIVE" && s.agentId === user.id
          )) {
            socket.join(`chat:${chat.id}`);
          }

          socket.emit(CHAT_EVENTS.QUEUE_UPDATE, {
            type: "sync",
            sessions: waitingChats,
            activeChats,
          });

          io.to("agents").emit(PRESENCE_EVENTS.ONLINE, {
            userId: user.id,
            userName: socket.user.name,
            agentCount: connectedAgents.size,
          });

          // Broadcast agent availability to ALL sockets (including visitors)
          broadcastAgentsStatus();
        }

        socket.emit(AUTH_EVENTS.AUTHENTICATED, { user: socket.user });
        console.log(
          `[Chat] Authenticated: ${socket.user.name} (${user.role})`
        );
      } catch (error) {
        console.error("[Chat] Auth error:", error);
        socket.emit(AUTH_EVENTS.AUTH_ERROR, {
          message: "Authentication failed",
        });
      }
    }
  );
}

/**
 * Chat handlers
 */
function registerChatHandlers(
  io: SocketIOServer,
  socket: AuthenticatedSocket
) {
  // Visitor requests a chat
  socket.on(
    CHAT_EVENTS.REQUEST,
    async (data: {
      visitorId: string;
      visitorName?: string;
      visitorEmail?: string;
      visitorPhone?: string;
    }) => {
      try {
        const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let ticketId = "";

        if (db) {
          const count = await db.supportTicket.count();
          const dateStr = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");
          const ticketNumber = `CHAT-${dateStr}-${String(count + 1).padStart(4, "0")}`;

          const ticket = await db.supportTicket.create({
            data: {
              ticketNumber,
              subject: `Live Chat - ${data.visitorName || "Visitor"}`,
              status: "OPEN",
              priority: "MEDIUM",
              source: "LIVE_CHAT",
              guestName: data.visitorName || "Visitor",
              guestEmail: data.visitorEmail || undefined,
              guestPhone: data.visitorPhone || undefined,
              messages: {
                create: {
                  content: "Chat session started",
                  senderType: "SYSTEM",
                  senderName: "System",
                  type: "SYSTEM",
                },
              },
            },
          });
          ticketId = ticket.id;
          console.log(
            `[Chat] Ticket created: ${ticketNumber} (${ticket.id})`
          );
        }

        const session: ChatSession = {
          id: sessionId,
          ticketId,
          visitorSocketId: socket.id,
          visitorName: data.visitorName || "Visitor",
          visitorEmail: data.visitorEmail,
          visitorPhone: data.visitorPhone,
          status: "WAITING",
          createdAt: new Date(),
        };

        chatSessions.set(sessionId, session);
        socket.join(`chat:${sessionId}`);

        const onlineAgentCount = Array.from(connectedAgents.values()).filter(
          (a) => a.status === "online"
        ).length;

        socket.emit(CHAT_EVENTS.REQUEST, {
          success: true,
          session: { id: sessionId, ticketId },
          agentsOnline: onlineAgentCount > 0,
          agentCount: onlineAgentCount,
        });

        // Start agent timeout - if no agent accepts within 15s, notify visitor
        const timeoutSeconds = parseInt(
          process.env.CHAT_AGENT_TIMEOUT || "15",
          10
        );
        session.timeoutTimer = setTimeout(() => {
          const currentSession = chatSessions.get(sessionId);
          if (currentSession && currentSession.status === "WAITING") {
            socket.emit(CHAT_EVENTS.AGENT_TIMEOUT, { sessionId });
            console.log(`[Chat] Agent timeout for session: ${sessionId}`);
          }
        }, timeoutSeconds * 1000);

        io.to("agents").emit(CHAT_EVENTS.QUEUE_UPDATE, {
          type: "new",
          session: {
            id: session.id,
            ticketId: session.ticketId,
            visitorName: session.visitorName,
            visitorEmail: session.visitorEmail,
            visitorPhone: session.visitorPhone,
            createdAt: session.createdAt,
          },
        });

        console.log(
          `[Chat] New request: ${sessionId} from ${session.visitorName}`
        );
      } catch (error) {
        console.error("[Chat] Request error:", error);
        socket.emit(CHAT_EVENTS.REQUEST, {
          success: false,
          error: "Failed to start chat",
        });
      }
    }
  );

  // Agent accepts a chat
  socket.on(CHAT_EVENTS.ACCEPT, async (data: { sessionId: string }) => {
    if (!socket.user?.isAgent) {
      socket.emit("error", { message: "Only agents can accept chats" });
      return;
    }

    const session = chatSessions.get(data.sessionId);
    if (!session) {
      socket.emit("error", { message: "Session not found" });
      return;
    }

    if (session.status !== "WAITING") {
      socket.emit("error", { message: "Chat already accepted" });
      return;
    }

    session.agentId = socket.user.id;
    session.agentName = socket.user.name;
    session.status = "ACTIVE";

    // Clear agent timeout timer
    if (session.timeoutTimer) {
      clearTimeout(session.timeoutTimer);
      session.timeoutTimer = undefined;
    }

    socket.join(`chat:${data.sessionId}`);

    // Update ticket in DB
    if (db && session.ticketId) {
      try {
        await db.supportTicket.update({
          where: { id: session.ticketId },
          data: {
            assignedToId: socket.user.id,
            status: "IN_PROGRESS",
          },
        });

        await db.supportMessage.create({
          data: {
            ticketId: session.ticketId,
            content: `${socket.user.name} joined the chat`,
            senderType: "SYSTEM",
            senderName: "System",
            type: "SYSTEM",
          },
        });
      } catch (error) {
        console.error("[Chat] DB accept error:", error);
      }
    }

    io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.ACCEPT, {
      session: { id: session.id, status: "ACTIVE" },
      agent: { id: socket.user.id, name: socket.user.name },
    });

    io.to("agents").emit(CHAT_EVENTS.QUEUE_UPDATE, {
      type: "accepted",
      sessionId: data.sessionId,
      agentId: socket.user.id,
      agentName: socket.user.name,
    });

    console.log(
      `[Chat] Accepted: ${data.sessionId} by ${socket.user.name}`
    );
  });

  // Chat message
  socket.on(
    CHAT_EVENTS.MESSAGE,
    async (data: { sessionId: string; content: string }) => {
      if (!data.content?.trim()) return;
      const session = chatSessions.get(data.sessionId);
      if (!session) return;

      const isAgent = socket.user?.isAgent || false;
      const senderName =
        socket.user?.name || session.visitorName || "Visitor";
      const senderId = socket.user?.id || null;

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        sessionId: data.sessionId,
        content: data.content,
        senderId: senderId || socket.id,
        senderName,
        senderType: isAgent ? ("AGENT" as const) : ("VISITOR" as const),
        createdAt: new Date(),
      };

      // Persist to database
      if (db && session.ticketId) {
        try {
          const dbMessage = await db.supportMessage.create({
            data: {
              ticketId: session.ticketId,
              content: data.content,
              senderType: isAgent ? "AGENT" : "CUSTOMER",
              senderName,
              senderId: senderId || undefined,
              type: "TEXT",
            },
          });
          message.id = dbMessage.id;
        } catch (error) {
          console.error("[Chat] Message save error:", error);
        }
      }

      io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.MESSAGE, message);
    }
  );

  // Typing indicator
  socket.on(CHAT_EVENTS.TYPING, (data: { sessionId: string }) => {
    socket.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.TYPING, {
      sessionId: data.sessionId,
      userId: socket.user?.id || socket.id,
      userName: socket.user?.name || "Visitor",
    });
  });

  // End chat
  socket.on(CHAT_EVENTS.END, async (data: { sessionId: string }) => {
    const session = chatSessions.get(data.sessionId);

    if (session) {
      session.status = "ENDED";

      if (db && session.ticketId) {
        try {
          await db.supportTicket.update({
            where: { id: session.ticketId },
            data: {
              status: "RESOLVED",
              resolvedAt: new Date(),
            },
          });

          await db.supportMessage.create({
            data: {
              ticketId: session.ticketId,
              content: "Chat session ended",
              senderType: "SYSTEM",
              senderName: "System",
              type: "SYSTEM",
            },
          });
        } catch (error) {
          console.error("[Chat] End chat DB error:", error);
        }
      }

      chatSessions.delete(data.sessionId);
    }

    io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.END, {
      sessionId: data.sessionId,
    });

    io.to("agents").emit(CHAT_EVENTS.QUEUE_UPDATE, {
      type: "ended",
      sessionId: data.sessionId,
    });

    console.log(`[Chat] Ended: ${data.sessionId}`);
  });

  // Email update from visitor
  socket.on(
    CHAT_EVENTS.EMAIL_UPDATE,
    async (data: { sessionId: string; email: string }) => {
      if (!data.email?.trim()) return;
      const session = chatSessions.get(data.sessionId);
      if (!session) return;

      session.visitorEmail = data.email.trim();

      // Update ticket in database
      if (db && session.ticketId) {
        try {
          await db.supportTicket.update({
            where: { id: session.ticketId },
            data: { guestEmail: data.email.trim() },
          });
        } catch (error) {
          console.error("[Chat] Email update DB error:", error);
        }
      }

      // Notify agents about email update
      io.to("agents").emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: "email_updated",
        sessionId: data.sessionId,
        email: data.email.trim(),
      });

      console.log(
        `[Chat] Email updated for ${data.sessionId}: ${data.email}`
      );
    }
  );

  // Agent triggers lead collection form on visitor's widget
  socket.on(
    CHAT_EVENTS.COLLECT_INFO,
    (data: { sessionId: string }) => {
      if (!socket.user?.isAgent) return;
      const session = chatSessions.get(data.sessionId);
      if (!session || session.status !== "ACTIVE") return;

      // Emit to the chat room (visitor is in it, agent also receives but ignores)
      io.to(`chat:${data.sessionId}`).emit(CHAT_EVENTS.COLLECT_INFO, {
        sessionId: data.sessionId,
      });

      console.log(`[Chat] Collect info triggered for: ${data.sessionId}`);
    }
  );

  // Visitor submits lead info (from form or AI extraction)
  socket.on(
    CHAT_EVENTS.LEAD_UPDATE,
    async (data: {
      sessionId: string;
      name?: string;
      email?: string;
      phone?: string;
      source: "form" | "ai" | "agent_request";
    }) => {
      const session = chatSessions.get(data.sessionId);
      if (!session) return;

      // Validate email format
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return;

      // Update in-memory session
      if (data.name) session.visitorName = data.name;
      if (data.email) session.visitorEmail = data.email;

      // Persist to database
      if (db && session.ticketId) {
        try {
          await db.supportTicket.update({
            where: { id: session.ticketId },
            data: {
              ...(data.name && { guestName: data.name }),
              ...(data.email && { guestEmail: data.email }),
              ...(data.phone && { guestPhone: data.phone }),
            },
          });
        } catch (error) {
          console.error("[Chat] Lead update DB error:", error);
        }
      }

      // Notify agents about collected info
      io.to("agents").emit(CHAT_EVENTS.INFO_COLLECTED, {
        sessionId: data.sessionId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      // Update queue sidebar for all agents
      io.to("agents").emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: "lead_updated",
        sessionId: data.sessionId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      console.log(
        `[Chat] Lead updated for ${data.sessionId}: ${data.name || ""} ${data.email || ""}`
      );
    }
  );

  // Visitor rejoins an existing chat after page reload
  socket.on(
    CHAT_EVENTS.REJOIN,
    async (data: { sessionId: string; visitorId: string }) => {
      try {
        const session = chatSessions.get(data.sessionId);

        if (session && session.status !== "ENDED") {
          // Session still in memory - update socket ID and rejoin room
          session.visitorSocketId = socket.id;
          socket.join(`chat:${data.sessionId}`);

          // Load messages from DB
          let messages: Array<{
            id: string;
            content: string;
            senderId: string | null;
            senderName: string;
            senderType: string;
            createdAt: Date;
          }> = [];

          if (db && session.ticketId) {
            try {
              const dbMessages = await db.supportMessage.findMany({
                where: { ticketId: session.ticketId },
                orderBy: { createdAt: "asc" },
                select: {
                  id: true,
                  content: true,
                  senderId: true,
                  senderName: true,
                  senderType: true,
                  createdAt: true,
                },
              });

              messages = dbMessages.map((m) => ({
                id: m.id,
                content: m.content,
                senderId: m.senderId || "system",
                senderName: m.senderName || "System",
                senderType:
                  m.senderType === "CUSTOMER"
                    ? "VISITOR"
                    : m.senderType === "AGENT"
                    ? "AGENT"
                    : "SYSTEM",
                createdAt: m.createdAt,
              }));
            } catch (error) {
              console.error("[Chat] Rejoin message load error:", error);
            }
          }

          socket.emit(CHAT_EVENTS.REJOIN, {
            success: true,
            session: {
              id: session.id,
              ticketId: session.ticketId,
              status: session.status,
              agentName: session.agentName,
              visitorEmail: session.visitorEmail,
            },
            messages,
          });

          console.log(
            `[Chat] Rejoined: ${data.sessionId} (${session.status})`
          );
        } else {
          // Session not found or ended
          socket.emit(CHAT_EVENTS.REJOIN, {
            success: false,
            error: "Session not found or ended",
          });
        }
      } catch (error) {
        console.error("[Chat] Rejoin error:", error);
        socket.emit(CHAT_EVENTS.REJOIN, {
          success: false,
          error: "Failed to rejoin",
        });
      }
    }
  );
}

/**
 * Presence handlers
 */
function registerPresenceHandlers(
  io: SocketIOServer,
  socket: AuthenticatedSocket
) {
  socket.on(
    PRESENCE_EVENTS.STATUS_UPDATE,
    (data: { status: "online" | "away" | "offline" }) => {
      if (!socket.user) return;

      const agent = connectedAgents.get(socket.user.id);
      if (agent) {
        agent.status = data.status;
      }

      if (socket.user.isAgent) {
        io.to("agents").emit(PRESENCE_EVENTS.STATUS_UPDATE, {
          userId: socket.user.id,
          userName: socket.user.name,
          status: data.status,
        });
      }
    }
  );
}

/**
 * Handle disconnect
 */
function handleDisconnect(io: SocketIOServer, socket: AuthenticatedSocket) {
  console.log(`[Chat] Disconnected: ${socket.id}`);

  if (socket.user?.isAgent) {
    connectedAgents.delete(socket.user.id);
    io.to("agents").emit(PRESENCE_EVENTS.OFFLINE, {
      userId: socket.user.id,
      userName: socket.user.name,
      agentCount: connectedAgents.size,
    });

    // Broadcast updated agent status to ALL sockets (including visitors)
    broadcastAgentsStatus();
  }

  // If visitor disconnects, notify the agent and clean up timeouts
  chatSessions.forEach((session, sessionId) => {
    if (session.visitorSocketId === socket.id) {
      // Clear any pending timeout
      if (session.timeoutTimer) {
        clearTimeout(session.timeoutTimer);
        session.timeoutTimer = undefined;
      }

      if (session.status === "ACTIVE") {
        io.to(`chat:${sessionId}`).emit(CHAT_EVENTS.TYPING, {
          sessionId,
          userId: "system",
          userName: "Visitor disconnected",
        });
      }
    }
  });
}

/**
 * Get waiting chat sessions count
 */
export function getWaitingChatsCount(): number {
  return Array.from(chatSessions.values()).filter(
    (s) => s.status === "WAITING"
  ).length;
}

/**
 * Get connected agents count
 */
export function getOnlineAgentsCount(): number {
  return Array.from(connectedAgents.values()).filter(
    (a) => a.status === "online"
  ).length;
}
