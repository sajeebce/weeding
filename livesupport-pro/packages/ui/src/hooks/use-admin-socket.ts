'use client';

/**
 * Specialized hook for admin/agent notifications and presence
 * Automatically joins admin room and tracks online agents
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  AUTH_EVENTS,
  PRESENCE_EVENTS,
  TICKET_EVENTS,
  MESSAGE_EVENTS,
  CHAT_EVENTS,
  type ChatMessage,
  type TicketData,
} from '@livesupport/core';

export interface OnlineAgent {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}

export interface UseAdminSocketOptions {
  url: string;
  token: string;
  autoConnect?: boolean;
}

export interface UseAdminSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  onlineAgents: OnlineAgent[];
  // Callbacks
  onNewTicket: (callback: (ticket: TicketData) => void) => () => void;
  onTicketUpdated: (callback: (ticket: TicketData) => void) => () => void;
  onTicketAssigned: (callback: (data: { ticketId: string; agentId: string; agentName: string }) => void) => () => void;
  onNewMessage: (callback: (message: ChatMessage) => void) => () => void;
  onChatRequest: (callback: (data: { session: any }) => void) => () => void;
  // Actions
  setStatus: (status: 'online' | 'away' | 'offline') => void;
  assignTicket: (ticketId: string, agentId: string) => void;
  error: string | null;
}

export function useAdminSocket(options: UseAdminSocketOptions): UseAdminSocketReturn {
  const { url, token, autoConnect = true } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onlineAgents, setOnlineAgents] = useState<OnlineAgent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect || !token) return;

    const socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[AdminSocket] Connected:', socket.id);
      setIsConnected(true);
      setError(null);

      // Authenticate
      socket.emit(AUTH_EVENTS.AUTHENTICATE, { token });
    });

    socket.on('disconnect', (reason) => {
      console.log('[AdminSocket] Disconnected:', reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[AdminSocket] Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Authentication events
    socket.on(AUTH_EVENTS.AUTHENTICATED, () => {
      setIsAuthenticated(true);
      setError(null);
      // Request current online agents
      socket.emit(PRESENCE_EVENTS.ONLINE);
    });

    socket.on(AUTH_EVENTS.AUTH_ERROR, (data: { message: string }) => {
      setError(data.message);
      setIsAuthenticated(false);
    });

    // Presence events
    socket.on(PRESENCE_EVENTS.ONLINE, (data: { userId: string; userName: string }) => {
      setOnlineAgents((prev) => {
        if (prev.some((a) => a.id === data.userId)) return prev;
        return [...prev, { id: data.userId, name: data.userName, status: 'online' }];
      });
    });

    socket.on(PRESENCE_EVENTS.OFFLINE, (data: { userId: string }) => {
      setOnlineAgents((prev) => prev.filter((a) => a.id !== data.userId));
    });

    socket.on(PRESENCE_EVENTS.STATUS_UPDATE, (data: { userId: string; status: string }) => {
      setOnlineAgents((prev) =>
        prev.map((a) =>
          a.id === data.userId ? { ...a, status: data.status as OnlineAgent['status'] } : a
        )
      );
    });

    socket.on(PRESENCE_EVENTS.AGENTS_ONLINE, (agents: OnlineAgent[]) => {
      setOnlineAgents(agents);
    });

    // Error events
    socket.on('error', (data: { code: string; message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, token, autoConnect]);

  // Event listener factories
  const onNewTicket = useCallback((callback: (ticket: TicketData) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on(TICKET_EVENTS.NEW, callback);
    return () => {
      socket.off(TICKET_EVENTS.NEW, callback);
    };
  }, []);

  const onTicketUpdated = useCallback((callback: (ticket: TicketData) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on(TICKET_EVENTS.UPDATED, callback);
    return () => {
      socket.off(TICKET_EVENTS.UPDATED, callback);
    };
  }, []);

  const onTicketAssigned = useCallback(
    (callback: (data: { ticketId: string; agentId: string; agentName: string }) => void) => {
      const socket = socketRef.current;
      if (!socket) return () => {};

      socket.on(TICKET_EVENTS.ASSIGNED, callback);
      return () => {
        socket.off(TICKET_EVENTS.ASSIGNED, callback);
      };
    },
    []
  );

  const onNewMessage = useCallback((callback: (message: ChatMessage) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on(MESSAGE_EVENTS.NEW, callback);
    return () => {
      socket.off(MESSAGE_EVENTS.NEW, callback);
    };
  }, []);

  const onChatRequest = useCallback((callback: (data: { session: any }) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};

    socket.on(CHAT_EVENTS.QUEUE_UPDATE, (data: { type: string; session?: any }) => {
      if (data.type === 'new' && data.session) {
        callback({ session: data.session });
      }
    });
    return () => {
      socket.off(CHAT_EVENTS.QUEUE_UPDATE);
    };
  }, []);

  // Actions
  const setStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit(PRESENCE_EVENTS.STATUS_UPDATE, { status });
  }, []);

  const assignTicket = useCallback((ticketId: string, agentId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit(TICKET_EVENTS.ASSIGNED, { ticketId, agentId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticated,
    onlineAgents,
    onNewTicket,
    onTicketUpdated,
    onTicketAssigned,
    onNewMessage,
    onChatRequest,
    setStatus,
    assignTicket,
    error,
  };
}
