import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import {
  registerAuthHandlers,
  registerTicketHandlers,
  registerMessageHandlers,
  registerChatHandlers,
  registerPresenceHandlers,
  handleDisconnect,
  type AuthenticatedSocket,
  type SocketUser,
} from './handlers';
import { NOTIFICATION_EVENTS, ROOM_PREFIXES } from './events';

export interface LiveSupportSocketConfig {
  cors?: {
    origin: string | string[];
    credentials?: boolean;
  };
  pingTimeout?: number;
  pingInterval?: number;
}

export interface LiveSupportSocketCallbacks {
  verifyToken: (token: string) => Promise<SocketUser | null>;
  onSendMessage: (data: { ticketId: string; content: string; userId: string }) => Promise<any>;
  onChatRequest: (data: any) => Promise<any>;
  onChatAccept: (data: any) => Promise<any>;
  onChatEnd: (data: any) => Promise<any>;
  onChatMessage: (data: any) => Promise<any>;
  onEmailUpdate?: (data: { sessionId: string; email: string }) => Promise<any>;
  onChatRejoin?: (data: { sessionId: string; visitorId: string }) => Promise<any>;
  onCollectInfo?: (data: { sessionId: string; agentId: string }) => Promise<{ visitorSocketId?: string } | null>;
  onLeadUpdate?: (data: { sessionId: string; name?: string; email?: string; phone?: string; source: string }) => Promise<any>;
  onAgentAuth?: (socket: AuthenticatedSocket, user: SocketUser) => Promise<void>;
  onStatusUpdate: (userId: string, status: string) => Promise<void>;
  onDisconnect?: (userId: string) => Promise<void>;
}

/**
 * LiveSupport Socket.io Server
 *
 * Creates and configures a Socket.io server for real-time communication
 */
export class LiveSupportSocketServer {
  private io: SocketIOServer;

  constructor(
    httpServer: HTTPServer,
    config: LiveSupportSocketConfig,
    private callbacks: LiveSupportSocketCallbacks
  ) {
    this.io = new SocketIOServer(httpServer, {
      cors: config.cors || {
        origin: '*',
        credentials: true,
      },
      pingTimeout: config.pingTimeout || 60000,
      pingInterval: config.pingInterval || 25000,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for all connections
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;

      // Register all handlers
      registerAuthHandlers(this.io, authSocket, this.callbacks.verifyToken, this.callbacks.onAgentAuth);
      registerTicketHandlers(this.io, authSocket);
      registerMessageHandlers(
        this.io,
        authSocket,
        this.callbacks.onSendMessage
      );
      registerChatHandlers(this.io, authSocket, {
        onChatRequest: this.callbacks.onChatRequest,
        onChatAccept: this.callbacks.onChatAccept,
        onChatEnd: this.callbacks.onChatEnd,
        onChatMessage: this.callbacks.onChatMessage,
        onEmailUpdate: this.callbacks.onEmailUpdate,
        onChatRejoin: this.callbacks.onChatRejoin,
        onCollectInfo: this.callbacks.onCollectInfo,
        onLeadUpdate: this.callbacks.onLeadUpdate,
      });
      registerPresenceHandlers(
        this.io,
        authSocket,
        this.callbacks.onStatusUpdate
      );
      handleDisconnect(this.io, authSocket, this.callbacks.onDisconnect);
    });
  }

  /**
   * Get the Socket.io server instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Emit event to a specific user
   */
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`${ROOM_PREFIXES.USER}${userId}`).emit(event, data);
  }

  /**
   * Emit event to all agents
   */
  emitToAgents(event: string, data: any) {
    this.io.to(`${ROOM_PREFIXES.AGENT}all`).emit(event, data);
  }

  /**
   * Emit event to a specific ticket room
   */
  emitToTicket(ticketId: string, event: string, data: any) {
    this.io.to(`${ROOM_PREFIXES.TICKET}${ticketId}`).emit(event, data);
  }

  /**
   * Emit event to a specific chat room
   */
  emitToChat(sessionId: string, event: string, data: any) {
    this.io.to(`${ROOM_PREFIXES.CHAT}${sessionId}`).emit(event, data);
  }

  /**
   * Send notification to a user
   */
  sendNotification(userId: string, notification: any) {
    this.emitToUser(userId, NOTIFICATION_EVENTS.NEW, notification);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Get count of connected clients
   */
  async getConnectedCount(): Promise<number> {
    const sockets = await this.io.fetchSockets();
    return sockets.length;
  }

  /**
   * Get count of connected agents
   */
  async getOnlineAgentsCount(): Promise<number> {
    const sockets = await this.io.in(`${ROOM_PREFIXES.AGENT}all`).fetchSockets();
    return sockets.length;
  }

  /**
   * Close the server
   */
  close() {
    this.io.close();
  }
}

/**
 * Create a LiveSupport Socket server
 */
export function createLiveSupportSocket(
  httpServer: HTTPServer,
  config: LiveSupportSocketConfig,
  callbacks: LiveSupportSocketCallbacks
): LiveSupportSocketServer {
  return new LiveSupportSocketServer(httpServer, config, callbacks);
}
