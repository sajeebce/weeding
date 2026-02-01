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

/**
 * Register authentication handlers
 */
export function registerAuthHandlers(
  _io: Server,
  socket: AuthenticatedSocket,
  verifyToken: (token: string) => Promise<SocketUser | null>
) {
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
      }

      socket.emit(AUTH_EVENTS.AUTHENTICATED, { user });
    } catch (error) {
      socket.emit(AUTH_EVENTS.AUTH_ERROR, { message: 'Authentication failed' });
    }
  });

  socket.on(AUTH_EVENTS.LOGOUT, () => {
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

      socket.emit(CHAT_EVENTS.REQUEST, { success: true, session });
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
          message
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

  // End chat
  socket.on(CHAT_EVENTS.END, async (data: { sessionId: string }) => {
    try {
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

      await onStatusUpdate(socket.user.id, data.status);

      // Broadcast to all agents
      if (socket.user.isAgent || socket.user.isAdmin) {
        io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.STATUS_UPDATE, {
          userId: socket.user.id,
          status: data.status,
        });
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
      // Notify agents about offline status
      if (socket.user.isAgent || socket.user.isAdmin) {
        io.to(`${ROOM_PREFIXES.AGENT}all`).emit(PRESENCE_EVENTS.OFFLINE, {
          userId: socket.user.id,
        });
      }

      if (onDisconnect) {
        await onDisconnect(socket.user.id);
      }
    }
  });
}
