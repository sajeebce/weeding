import type { Server, Socket } from 'socket.io';
import {
  AUTH_EVENTS,
  TICKET_EVENTS,
  MESSAGE_EVENTS,
  CHAT_EVENTS,
  PRESENCE_EVENTS,
  ROOM_PREFIXES,
} from './events';

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'agent' | 'admin';
  isAgent: boolean;
  isAdmin: boolean;
}

export interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

// In-memory agent tracking for agents:status broadcasts
const connectedAgents = new Map<string, { socketId: string; name: string; status: string }>();

// In-memory session timeout timers
const sessionTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Reference to io for broadcasting
let ioRef: Server | null = null;

/**
 * Broadcast agent availability status to ALL connected sockets (including visitors)
 */
function broadcastAgentsStatus() {
  if (!ioRef) return;
  const onlineCount = Array.from(connectedAgents.values()).filter(
    (a) => a.status === 'online'
  ).length;
  ioRef.emit(CHAT_EVENTS.AGENTS_STATUS, {
    online: onlineCount > 0,
    count: onlineCount,
  });
}

/**
 * Get connected agents map (for use in server.ts)
 */
export function getConnectedAgents() {
  return connectedAgents;
}

/**
 * Register authentication handlers
 */
export function registerAuthHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  verifyToken: (token: string) => Promise<SocketUser | null>,
  onAgentAuth?: (socket: AuthenticatedSocket, user: SocketUser) => Promise<void>
) {
  // Store io reference for broadcasting
  ioRef = io;

  socket.on(AUTH_EVENTS.AUTHENTICATE, async (data: { token: string }) => {
    try {
      const user = await verifyToken(data.token);

      if (!user) {
        socket.emit(AUTH_EVENTS.AUTH_ERROR, { message: 'Invalid token' });
        return;
      }

      socket.user = user;

      // Join user's personal room
      socket.join(`${ROOM_PREFIXES.USER}${user.id}`);

      // Join agent room if applicable
      if (user.isAgent || user.isAdmin) {
        socket.join(`${ROOM_PREFIXES.AGENT}all`);

        // Track connected agent
        connectedAgents.set(user.id, {
          socketId: socket.id,
          name: user.name,
          status: 'online',
        });

        // Let host app rejoin agent to their active chat rooms
        if (onAgentAuth) {
          await onAgentAuth(socket, user);
        }

        // Broadcast updated agent availability to ALL sockets
        broadcastAgentsStatus();
      }

      socket.emit(AUTH_EVENTS.AUTHENTICATED, { user });
    } catch (error) {
      socket.emit(AUTH_EVENTS.AUTH_ERROR, { message: 'Authentication failed' });
    }
  });

  socket.on(AUTH_EVENTS.LOGOUT, () => {
    // Clean up agent tracking
    if (socket.user && (socket.user.isAgent || socket.user.isAdmin)) {
      connectedAgents.delete(socket.user.id);
      broadcastAgentsStatus();
    }

    socket.user = undefined;
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
  });
}

/**
 * Register ticket handlers
 */
export function registerTicketHandlers(
  _io: Server,
  socket: AuthenticatedSocket
) {
  // Join a ticket room
  socket.on(TICKET_EVENTS.JOIN, (data: { ticketId: string }) => {
    if (!socket.user) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    socket.join(`${ROOM_PREFIXES.TICKET}${data.ticketId}`);
  });

  // Leave a ticket room
  socket.on(TICKET_EVENTS.LEAVE, (data: { ticketId: string }) => {
    socket.leave(`${ROOM_PREFIXES.TICKET}${data.ticketId}`);
  });
}

/**
 * Register message handlers
 */
export function registerMessageHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  onSendMessage: (data: {
    ticketId: string;
    content: string;
    userId: string;
  }) => Promise<any>
) {
  // Handle new message
  socket.on(
    MESSAGE_EVENTS.SEND,
    async (data: { ticketId: string; content: string }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      try {
        const message = await onSendMessage({
          ticketId: data.ticketId,
          content: data.content,
          userId: socket.user.id,
        });

        // Broadcast to all users in the ticket room
        io.to(`${ROOM_PREFIXES.TICKET}${data.ticketId}`).emit(
          MESSAGE_EVENTS.NEW,
          message
        );
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    }
  );

  // Handle typing indicator
  socket.on(MESSAGE_EVENTS.TYPING, (data: { ticketId: string }) => {
    if (!socket.user) return;

    socket.to(`${ROOM_PREFIXES.TICKET}${data.ticketId}`).emit(MESSAGE_EVENTS.TYPING, {
      ticketId: data.ticketId,
      userId: socket.user.id,
      userName: socket.user.name,
    });
  });

  // Handle stop typing
  socket.on(MESSAGE_EVENTS.STOP_TYPING, (data: { ticketId: string }) => {
    if (!socket.user) return;

    socket.to(`${ROOM_PREFIXES.TICKET}${data.ticketId}`).emit(MESSAGE_EVENTS.STOP_TYPING, {
      ticketId: data.ticketId,
      userId: socket.user.id,
    });
  });
}

/**
 * Register live chat handlers
 */
export function registerChatHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  callbacks: {
    onChatRequest: (data: any) => Promise<any>;
    onChatAccept: (data: any) => Promise<any>;
    onChatEnd: (data: any) => Promise<any>;
    onChatMessage: (data: any) => Promise<any>;
    onEmailUpdate?: (data: { sessionId: string; email: string }) => Promise<any>;
    onChatRejoin?: (data: { sessionId: string; visitorId: string }) => Promise<any>;
    onCollectInfo?: (data: { sessionId: string; agentId: string }) => Promise<{ visitorSocketId?: string } | null>;
    onLeadUpdate?: (data: { sessionId: string; name?: string; email?: string; phone?: string; source: string }) => Promise<any>;
  }
) {
  // Customer requests chat
  socket.on(CHAT_EVENTS.REQUEST, async (data) => {
    try {
      const session = await callbacks.onChatRequest(data);

      // Join chat room
      socket.join(`${ROOM_PREFIXES.CHAT}${session.id}`);

      // Notify all agents
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: 'new',
        session,
      });

      // Return agentsOnline status so widget knows what to show
      const onlineCount = Array.from(connectedAgents.values()).filter(
        (a) => a.status === 'online'
      ).length;

      socket.emit(CHAT_EVENTS.REQUEST, {
        success: true,
        session,
        agentsOnline: onlineCount > 0,
        agentCount: onlineCount,
      });

      // Start agent timeout - if no agent accepts within configured seconds, notify visitor
      const timeoutSeconds = 15; // Could be made configurable
      const timer = setTimeout(() => {
        socket.emit(CHAT_EVENTS.AGENT_TIMEOUT, { sessionId: session.id });
      }, timeoutSeconds * 1000);
      sessionTimeouts.set(session.id, timer);
    } catch (error) {
      socket.emit(CHAT_EVENTS.REQUEST, { success: false, error: 'Failed to start chat' });
    }
  });

  // Agent accepts chat
  socket.on(CHAT_EVENTS.ACCEPT, async (data: { sessionId: string }) => {
    if (!socket.user?.isAgent && !socket.user?.isAdmin) {
      socket.emit('error', { message: 'Only agents can accept chats' });
      return;
    }

    try {
      // Clear agent timeout timer
      const timer = sessionTimeouts.get(data.sessionId);
      if (timer) {
        clearTimeout(timer);
        sessionTimeouts.delete(data.sessionId);
      }

      const session = await callbacks.onChatAccept({
        sessionId: data.sessionId,
        agentId: socket.user.id,
      });

      // Join chat room
      socket.join(`${ROOM_PREFIXES.CHAT}${session.id}`);

      // Notify chat room
      io.to(`${ROOM_PREFIXES.CHAT}${session.id}`).emit(CHAT_EVENTS.ACCEPT, {
        session,
        agent: {
          id: socket.user.id,
          name: socket.user.name,
        },
      });

      // Update queue for all agents
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: 'accepted',
        sessionId: session.id,
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to accept chat' });
    }
  });

  // Chat message
  socket.on(
    CHAT_EVENTS.MESSAGE,
    async (data: { sessionId: string; content: string }) => {
      try {
        const message = await callbacks.onChatMessage({
          sessionId: data.sessionId,
          content: data.content,
          senderId: socket.user?.id || socket.id,
          senderName: socket.user?.name || 'Visitor',
          senderType: socket.user?.isAgent || socket.user?.isAdmin ? 'AGENT' : 'VISITOR',
        });

        io.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(
          CHAT_EVENTS.MESSAGE,
          { ...message, sessionId: data.sessionId }
        );
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    }
  );

  // Chat typing indicator
  socket.on(CHAT_EVENTS.TYPING, (data: { sessionId: string }) => {
    socket.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.TYPING, {
      sessionId: data.sessionId,
      userId: socket.user?.id || socket.id,
      userName: socket.user?.name || 'Visitor',
    });
  });

  // Email update from visitor
  socket.on(
    CHAT_EVENTS.EMAIL_UPDATE,
    async (data: { sessionId: string; email: string }) => {
      if (!data.email?.trim()) return;

      // Call callback to persist email (e.g. update ticket in DB)
      if (callbacks.onEmailUpdate) {
        try {
          await callbacks.onEmailUpdate({
            sessionId: data.sessionId,
            email: data.email.trim(),
          });
        } catch (error) {
          // Log but don't fail - email update is non-critical
        }
      }

      // Notify agents about email update
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: 'email_updated',
        sessionId: data.sessionId,
        email: data.email.trim(),
      });
    }
  );

  // End chat
  socket.on(CHAT_EVENTS.END, async (data: { sessionId: string }) => {
    try {
      // Clear timeout timer
      const timer = sessionTimeouts.get(data.sessionId);
      if (timer) {
        clearTimeout(timer);
        sessionTimeouts.delete(data.sessionId);
      }

      await callbacks.onChatEnd({ sessionId: data.sessionId });

      io.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.END, {
        sessionId: data.sessionId,
      });

      // Leave room
      socket.leave(`${ROOM_PREFIXES.CHAT}${data.sessionId}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to end chat' });
    }
  });

  // Agent triggers lead collection form on visitor's widget
  socket.on(
    CHAT_EVENTS.COLLECT_INFO,
    async (data: { sessionId: string }) => {
      if (!socket.user?.isAgent && !socket.user?.isAdmin) return;

      if (callbacks.onCollectInfo) {
        try {
          await callbacks.onCollectInfo({
            sessionId: data.sessionId,
            agentId: socket.user!.id,
          });
        } catch (error) {
          // Non-critical, don't fail
        }
      }

      // Emit to the chat room (visitor is in it)
      io.to(`${ROOM_PREFIXES.CHAT}${data.sessionId}`).emit(CHAT_EVENTS.COLLECT_INFO, {
        sessionId: data.sessionId,
      });
    }
  );

  // Visitor submits lead info
  socket.on(
    CHAT_EVENTS.LEAD_UPDATE,
    async (data: {
      sessionId: string;
      name?: string;
      email?: string;
      phone?: string;
      source: 'form' | 'ai' | 'agent_request';
    }) => {
      // Validate email format
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return;

      if (callbacks.onLeadUpdate) {
        try {
          await callbacks.onLeadUpdate(data);
        } catch (error) {
          // Non-critical
        }
      }

      // Notify agents about collected info
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.INFO_COLLECTED, {
        sessionId: data.sessionId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      // Update queue sidebar
      io.to(`${ROOM_PREFIXES.AGENT}all`).emit(CHAT_EVENTS.QUEUE_UPDATE, {
        type: 'lead_updated',
        sessionId: data.sessionId,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
    }
  );

  // Visitor rejoins an existing chat after page reload
  socket.on(
    CHAT_EVENTS.REJOIN,
    async (data: { sessionId: string; visitorId: string }) => {
      if (!callbacks.onChatRejoin) {
        socket.emit(CHAT_EVENTS.REJOIN, {
          success: false,
          error: 'Rejoin not supported',
        });
        return;
      }

      try {
        const result = await callbacks.onChatRejoin({
          sessionId: data.sessionId,
          visitorId: data.visitorId,
        });

        if (result) {
          // Rejoin the chat room
          socket.join(`${ROOM_PREFIXES.CHAT}${data.sessionId}`);

          socket.emit(CHAT_EVENTS.REJOIN, {
            success: true,
            session: result.session,
            messages: result.messages || [],
          });
        } else {
          socket.emit(CHAT_EVENTS.REJOIN, {
            success: false,
            error: 'Session not found or ended',
          });
        }
      } catch (error) {
        socket.emit(CHAT_EVENTS.REJOIN, {
          success: false,
          error: 'Failed to rejoin',
        });
      }
    }
  );
}

/**
 * Register presence handlers
 */
export function registerPresenceHandlers(
  io: Server,
  socket: AuthenticatedSocket,
  onStatusUpdate: (userId: string, status: string) => Promise<void>
) {
  socket.on(
    PRESENCE_EVENTS.STATUS_UPDATE,
    async (data: { status: 'online' | 'away' | 'offline' }) => {
      if (!socket.user) return;

      // Update in-memory agent tracking
      const agent = connectedAgents.get(socket.user.id);
      if (agent) {
        agent.status = data.status;
      }

      await onStatusUpdate(socket.user.id, data.status);

      // Broadcast to all agents
      if (socket.user.isAgent || socket.user.isAdmin) {
        io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.STATUS_UPDATE, {
          userId: socket.user.id,
          status: data.status,
        });

        // Broadcast updated agent availability to ALL sockets
        broadcastAgentsStatus();
      }
    }
  );
}

/**
 * Handle socket disconnection
 */
export function handleDisconnect(
  io: Server,
  socket: AuthenticatedSocket,
  onDisconnect?: (userId: string) => Promise<void>
) {
  socket.on('disconnect', async () => {
    if (socket.user) {
      // Clean up agent tracking and broadcast status
      if (socket.user.isAgent || socket.user.isAdmin) {
        connectedAgents.delete(socket.user.id);

        io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.OFFLINE, {
          userId: socket.user.id,
        });

        // Broadcast updated agent availability to ALL sockets (including visitors)
        broadcastAgentsStatus();
      }

      if (onDisconnect) {
        await onDisconnect(socket.user.id);
      }
    }
  });
}
