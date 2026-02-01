'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AUTH_EVENTS } from '@livesupport/core';

export interface UseSocketOptions {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

/**
 * Hook for Socket.io connection management
 */
export function useSocket(options: UseSocketOptions): UseSocketReturn {
  const {
    url,
    token,
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(url, {
      autoConnect,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Connection handlers
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);

      // Authenticate if token is provided
      if (token) {
        socketInstance.emit(AUTH_EVENTS.AUTHENTICATE, { token });
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socketInstance.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    // Authentication handlers
    socketInstance.on(AUTH_EVENTS.AUTHENTICATED, () => {
      setIsAuthenticated(true);
      setError(null);
    });

    socketInstance.on(AUTH_EVENTS.AUTH_ERROR, (data: { message: string }) => {
      setError(data.message);
      setIsAuthenticated(false);
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay]);

  // Re-authenticate when token changes
  useEffect(() => {
    if (socket && isConnected && token) {
      socket.emit(AUTH_EVENTS.AUTHENTICATE, { token });
    }
  }, [token, socket, isConnected]);

  const connect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  return {
    socket,
    isConnected,
    isAuthenticated,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
