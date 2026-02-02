'use client';

/**
 * Specialized hook for ticket chat with real-time updates
 * Automatically joins/leaves ticket room and manages message state
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MESSAGE_EVENTS,
  TICKET_EVENTS,
  AUTH_EVENTS,
  type ChatMessage,
  type TypingData,
} from '@livesupport/core';

export interface UseTicketSocketOptions {
  url: string;
  ticketId: string | null;
  token?: string;
  // Guest authentication for chat widget
  guestAuth?: {
    guestToken: string;
    guestName: string;
    guestEmail?: string;
  };
  autoConnect?: boolean;
}

export interface UseTicketSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  messages: ChatMessage[];
  typingUsers: string[];
  sendMessage: (content: string, attachments?: string[]) => void;
  startTyping: () => void;
  stopTyping: () => void;
  updateTicketStatus: (status: string) => void;
  clearMessages: () => void;
  error: string | null;
}

export function useTicketSocket(options: UseTicketSocketOptions): UseTicketSocketReturn {
  const {
    url,
    ticketId,
    token,
    guestAuth,
    autoConnect = true,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    const auth = guestAuth
      ? {
          guestToken: guestAuth.guestToken,
          guestName: guestAuth.guestName,
          guestEmail: guestAuth.guestEmail,
          ticketId,
        }
      : token
      ? { token }
      : undefined;

    const socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[TicketSocket] Connected:', socket.id);
      setIsConnected(true);
      setError(null);

      // Authenticate if token provided
      if (token) {
        socket.emit(AUTH_EVENTS.AUTHENTICATE, { token });
      } else if (guestAuth) {
        // Guest is auto-authenticated via handshake auth
        setIsAuthenticated(true);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[TicketSocket] Disconnected:', reason);
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[TicketSocket] Connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Authentication events
    socket.on(AUTH_EVENTS.AUTHENTICATED, () => {
      setIsAuthenticated(true);
      setError(null);
    });

    socket.on(AUTH_EVENTS.AUTH_ERROR, (data: { message: string }) => {
      setError(data.message);
      setIsAuthenticated(false);
    });

    // Message events
    socket.on(MESSAGE_EVENTS.NEW, (message: ChatMessage) => {
      if (message.ticketId === ticketId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    // Typing events
    socket.on(MESSAGE_EVENTS.TYPING, (data: TypingData) => {
      if (data.ticketId === ticketId) {
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.set(data.userId, data.userName);
          return updated;
        });
      }
    });

    socket.on(MESSAGE_EVENTS.STOP_TYPING, (data: { ticketId: string; userId: string }) => {
      if (data.ticketId === ticketId) {
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(data.userId);
          return updated;
        });
      }
    });

    // Error events
    socket.on('error', (data: { code: string; message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, token, guestAuth, autoConnect]);

  // Join/leave ticket room when ticketId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isAuthenticated || !ticketId) return;

    // Join ticket room
    socket.emit(TICKET_EVENTS.JOIN, { ticketId });

    return () => {
      // Leave ticket room
      socket.emit(TICKET_EVENTS.LEAVE, { ticketId });
    };
  }, [ticketId, isAuthenticated]);

  // Send message
  const sendMessage = useCallback((content: string, attachments?: string[]) => {
    const socket = socketRef.current;
    if (!socket || !ticketId) return;

    socket.emit(MESSAGE_EVENTS.SEND, {
      ticketId,
      content,
      attachments,
    });
  }, [ticketId]);

  // Typing indicators
  const startTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !ticketId) return;
    socket.emit(MESSAGE_EVENTS.TYPING, { ticketId });
  }, [ticketId]);

  const stopTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !ticketId) return;
    socket.emit(MESSAGE_EVENTS.STOP_TYPING, { ticketId });
  }, [ticketId]);

  // Update ticket status
  const updateTicketStatus = useCallback((status: string) => {
    const socket = socketRef.current;
    if (!socket || !ticketId) return;
    socket.emit(TICKET_EVENTS.STATUS_CHANGED, { ticketId, status });
  }, [ticketId]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticated,
    messages,
    typingUsers: Array.from(typingUsers.values()),
    sendMessage,
    startTyping,
    stopTyping,
    updateTicketStatus,
    clearMessages,
    error,
  };
}
