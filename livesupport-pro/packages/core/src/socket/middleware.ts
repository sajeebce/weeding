/**
 * Socket.io Authentication Middleware
 */

import type { Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './events';

type IOSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export interface AuthMiddlewareOptions {
  // Function to verify session token
  verifySession?: (sessionToken: string) => Promise<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null>;
  // Function to verify guest token
  verifyGuest?: (guestToken: string, ticketId?: string, guestName?: string, guestEmail?: string) => Promise<{
    ticketId: string;
    guestName: string;
  } | null>;
  // Cookie names for session token
  sessionCookieNames?: string[];
}

/**
 * Parse cookies from cookie string
 */
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;

  cookieString.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  });

  return cookies;
}

/**
 * Authentication middleware for Socket.io
 * Verifies the user's session or guest token
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    verifySession,
    verifyGuest,
    sessionCookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.session-token',
      '__Secure-authjs.session-token',
    ],
  } = options;

  return async function authMiddleware(
    socket: IOSocket,
    next: (err?: Error) => void
  ) {
    try {
      const cookies = socket.handshake.headers.cookie;

      // Try to authenticate via session cookie
      if (cookies && verifySession) {
        const parsedCookies = parseCookies(cookies);

        // Find session token from cookie names
        let sessionToken: string | undefined;
        for (const cookieName of sessionCookieNames) {
          if (parsedCookies[cookieName]) {
            sessionToken = parsedCookies[cookieName];
            break;
          }
        }

        if (sessionToken) {
          const user = await verifySession(sessionToken);

          if (user) {
            socket.data.userId = user.id;
            socket.data.userName = user.name || user.email || 'User';
            socket.data.userRole = user.role as SocketData['userRole'];
            socket.data.isAuthenticated = true;

            console.log(
              `[Socket.io Auth] Authenticated user: ${socket.data.userName} (${socket.data.userRole})`
            );
            return next();
          }
        }
      }

      // Check for guest authentication (for live chat widget)
      const guestToken = socket.handshake.auth?.guestToken;
      const ticketId = socket.handshake.auth?.ticketId;
      const guestName = socket.handshake.auth?.guestName;
      const guestEmail = socket.handshake.auth?.guestEmail;

      if (guestToken && verifyGuest) {
        if (ticketId) {
          // Verify existing ticket guest
          const guest = await verifyGuest(guestToken, ticketId, guestName, guestEmail);

          if (guest) {
            socket.data.userId = `guest:${guestToken}`;
            socket.data.userName = guest.guestName || guestName || 'Guest';
            socket.data.userRole = 'CUSTOMER';
            socket.data.isAuthenticated = true;
            socket.data.ticketId = ticketId;

            console.log(
              `[Socket.io Auth] Authenticated guest: ${socket.data.userName} for ticket ${ticketId}`
            );
            return next();
          }
        }

        // Allow new guest connections (for starting a new chat)
        if (guestName) {
          socket.data.userId = `guest:${guestToken}`;
          socket.data.userName = guestName;
          socket.data.userRole = 'CUSTOMER';
          socket.data.isAuthenticated = true;

          console.log(
            `[Socket.io Auth] New guest connection: ${socket.data.userName}`
          );
          return next();
        }
      }

      // Allow anonymous connection but mark as unauthenticated
      socket.data.isAuthenticated = false;
      socket.data.userId = `anon:${socket.id}`;
      socket.data.userName = 'Anonymous';
      socket.data.userRole = 'CUSTOMER';

      console.log(`[Socket.io Auth] Anonymous connection: ${socket.id}`);
      next();
    } catch (error) {
      console.error('[Socket.io Auth] Middleware error:', error);
      // Still allow connection but mark as unauthenticated
      socket.data.isAuthenticated = false;
      socket.data.userId = `error:${socket.id}`;
      socket.data.userName = 'Unknown';
      socket.data.userRole = 'CUSTOMER';
      next();
    }
  };
}

/**
 * Rate limiting middleware
 */
export function createRateLimitMiddleware(minIntervalMs: number = 100) {
  const connectionTimes = new Map<string, number>();

  return function rateLimitMiddleware(
    socket: IOSocket,
    next: (err?: Error) => void
  ) {
    const clientId = socket.handshake.address;
    const now = Date.now();
    const lastConnection = connectionTimes.get(clientId) || 0;

    if (now - lastConnection < minIntervalMs) {
      return next(new Error('Rate limited'));
    }

    connectionTimes.set(clientId, now);

    // Cleanup old entries every 1000 connections
    if (connectionTimes.size > 1000) {
      const cutoff = now - 60000; // Remove entries older than 1 minute
      for (const [id, time] of connectionTimes) {
        if (time < cutoff) {
          connectionTimes.delete(id);
        }
      }
    }

    next();
  };
}
