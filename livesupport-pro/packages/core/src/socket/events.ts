/**
 * Socket.io Event Constants and Type Definitions
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

// Message types
export interface SocketChatMessage {
  id: string;
  ticketId: string;
  content: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  senderName: string;
  senderId?: string;
  attachments?: Attachment[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface TypingData {
  ticketId?: string;
  sessionId?: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  customerName: string;
  customerEmail: string;
}

// Client → Server events
export interface ClientToServerEvents {
  // Room management
  'ticket:join': (data: { ticketId: string }) => void;
  'ticket:leave': (data: { ticketId: string }) => void;
  'admin:join': () => void;

  // Messaging
  'message:send': (data: {
    ticketId: string;
    content: string;
    attachments?: string[];
  }) => void;

  // Typing
  'message:typing': (data: { ticketId: string }) => void;
  'message:stop_typing': (data: { ticketId: string }) => void;

  // Ticket actions
  'ticket:updateStatus': (data: { ticketId: string; status: string }) => void;
  'ticket:assign': (data: { ticketId: string; agentId: string }) => void;

  // Presence
  'presence:online': () => void;
  'presence:away': () => void;
  'presence:status_update': (data: { status: 'online' | 'away' | 'offline' }) => void;

  // Authentication
  'auth:authenticate': (data: { token: string }) => void;
  'auth:logout': () => void;

  // Live chat
  'chat:request': (data: { visitorName?: string; visitorEmail?: string; departmentId?: string }) => void;
  'chat:accept': (data: { sessionId: string }) => void;
  'chat:message': (data: { sessionId: string; content: string }) => void;
  'chat:typing': (data: { sessionId: string }) => void;
  'chat:end': (data: { sessionId: string }) => void;
  'chat:email_update': (data: { sessionId: string; email: string }) => void;
  'chat:rejoin': (data: { sessionId: string; visitorId: string }) => void;
  'chat:collect_info': (data: { sessionId: string }) => void;
  'chat:lead_update': (data: { sessionId: string; name?: string; email?: string; phone?: string; source: 'form' | 'ai' | 'agent_request' }) => void;
}

// Server → Client events
export interface ServerToClientEvents {
  // Messages
  'message:new': (message: SocketChatMessage) => void;
  'message:updated': (message: SocketChatMessage) => void;
  'message:deleted': (messageId: string) => void;

  // Typing
  'message:typing': (data: TypingData) => void;
  'message:stop_typing': (data: { ticketId: string; userId: string }) => void;

  // Tickets
  'ticket:new': (ticket: TicketData) => void;
  'ticket:updated': (ticket: TicketData) => void;
  'ticket:status_changed': (data: {
    ticketId: string;
    status: string;
    updatedBy: string;
  }) => void;
  'ticket:assigned': (data: {
    ticketId: string;
    agentId: string;
    agentName: string;
  }) => void;

  // Presence
  'presence:online': (data: { userId: string; userName: string }) => void;
  'presence:offline': (data: { userId: string }) => void;
  'presence:status_update': (data: { userId: string; status: string }) => void;
  'presence:agents_online': (agents: Array<{ id: string; name: string; status: string }>) => void;

  // Authentication
  'auth:authenticated': (data: { user: any }) => void;
  'auth:error': (data: { message: string }) => void;

  // Live chat
  'chat:request': (data: { success: boolean; session?: any; error?: string; agentsOnline?: boolean; agentCount?: number }) => void;
  'chat:accept': (data: { session: any; agent: { id: string; name: string } }) => void;
  'chat:message': (message: any) => void;
  'chat:typing': (data: { sessionId: string; userId: string; userName: string }) => void;
  'chat:end': (data: { sessionId: string }) => void;
  'chat:queue_update': (data: { type: string; session?: any; sessionId?: string; email?: string }) => void;
  'chat:agent_timeout': (data: { sessionId: string }) => void;
  'agents:status': (data: { online: boolean; count: number }) => void;
  'chat:rejoin': (data: { success: boolean; session?: any; messages?: any[]; error?: string }) => void;
  'chat:collect_info': (data: { sessionId: string }) => void;
  'chat:info_collected': (data: { sessionId: string; name?: string; email?: string; phone?: string }) => void;

  // Errors
  'error': (data: { code: string; message: string }) => void;
}

// Inter-server events (for scaling with Redis later)
export interface InterServerEvents {
  ping: () => void;
}

// Socket data attached to each connection
export interface SocketData {
  userId: string;
  userName: string;
  userRole: 'CUSTOMER' | 'ADMIN' | 'SUPPORT_AGENT' | 'SALES_AGENT';
  isAuthenticated: boolean;
  ticketId?: string; // For guest chat sessions
}

// ============================================
// EVENT CONSTANTS
// ============================================

// Connection events
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'connect_error',
} as const;

// Authentication events
export const AUTH_EVENTS = {
  AUTHENTICATE: 'auth:authenticate',
  AUTHENTICATED: 'auth:authenticated',
  AUTH_ERROR: 'auth:error',
  LOGOUT: 'auth:logout',
} as const;

// Ticket events
export const TICKET_EVENTS = {
  JOIN: 'ticket:join',
  LEAVE: 'ticket:leave',
  NEW: 'ticket:new',
  UPDATED: 'ticket:updated',
  DELETED: 'ticket:deleted',
  ASSIGNED: 'ticket:assigned',
  STATUS_CHANGED: 'ticket:status_changed',
} as const;

// Message events
export const MESSAGE_EVENTS = {
  SEND: 'message:send',
  NEW: 'message:new',
  TYPING: 'message:typing',
  STOP_TYPING: 'message:stop_typing',
  READ: 'message:read',
  DELETED: 'message:deleted',
} as const;

// Live chat events
export const CHAT_EVENTS = {
  REQUEST: 'chat:request',
  ACCEPT: 'chat:accept',
  TRANSFER: 'chat:transfer',
  END: 'chat:end',
  MESSAGE: 'chat:message',
  TYPING: 'chat:typing',
  VISITOR_INFO: 'chat:visitor_info',
  QUEUE_UPDATE: 'chat:queue_update',
  EMAIL_UPDATE: 'chat:email_update',
  AGENT_TIMEOUT: 'chat:agent_timeout',
  AGENTS_STATUS: 'agents:status',
  REJOIN: 'chat:rejoin',
  COLLECT_INFO: 'chat:collect_info',
  LEAD_UPDATE: 'chat:lead_update',
  INFO_COLLECTED: 'chat:info_collected',
} as const;

// Presence events
export const PRESENCE_EVENTS = {
  ONLINE: 'presence:online',
  OFFLINE: 'presence:offline',
  AWAY: 'presence:away',
  STATUS_UPDATE: 'presence:status_update',
  AGENTS_ONLINE: 'presence:agents_online',
} as const;

// Notification events
export const NOTIFICATION_EVENTS = {
  NEW: 'notification:new',
  READ: 'notification:read',
  CLEAR: 'notification:clear',
} as const;

// Room prefixes
export const ROOM_PREFIXES = {
  TICKET: 'ticket:',
  CHAT: 'chat:',
  USER: 'user:',
  AGENT: 'agent:',
  DEPARTMENT: 'department:',
} as const;

// All events combined for type safety
export const SOCKET_EVENTS = {
  ...CONNECTION_EVENTS,
  ...AUTH_EVENTS,
  ...TICKET_EVENTS,
  ...MESSAGE_EVENTS,
  ...CHAT_EVENTS,
  ...PRESENCE_EVENTS,
  ...NOTIFICATION_EVENTS,
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
