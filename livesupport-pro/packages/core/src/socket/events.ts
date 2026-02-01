/**
 * Socket.io Event Constants
 */

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
