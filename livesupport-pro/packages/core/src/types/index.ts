// Enums
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER = 'WAITING_FOR_CUSTOMER',
  WAITING_FOR_AGENT = 'WAITING_FOR_AGENT',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ChatStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

export enum TicketSource {
  WEB = 'WEB',
  EMAIL = 'EMAIL',
  CHAT = 'CHAT',
  API = 'API',
}

export enum SenderType {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
  AI = 'AI',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  SYSTEM = 'SYSTEM',
}

// Core Types
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  category: string | null;

  // Customer info
  customerId: string | null;
  customer: User | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;

  // Assignment
  assignedToId: string | null;
  assignedTo: User | null;

  // Metadata
  ipAddress: string | null;
  userAgent: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;

  // Relations
  messages?: Message[];
  internalNotes?: InternalNote[];
  _count?: {
    messages: number;
    internalNotes: number;
  };
}

export interface Message {
  id: string;
  ticketId: string;
  content: string;
  contentHtml: string | null;

  // Sender info
  senderId: string | null;
  sender: User | null;
  senderType: SenderType;
  senderName: string;

  // Type
  type: MessageType;

  // Status
  isRead: boolean;
  readAt: Date | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
}

export interface InternalNote {
  id: string;
  ticketId: string;
  content: string;
  authorId: string;
  author: User;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string | null;
  useCount: number;
  createdById: string;
  createdBy: User;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string | null;
  department: string | null;
  status: ChatStatus;
  assignedAgentId: string | null;
  assignedAgent: User | null;
  metadata: Record<string, any>;
  acceptedAt: Date | null;
  endedAt: Date | null;
  rating: number | null;
  ratingComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  senderType: 'VISITOR' | 'AGENT' | 'AI' | 'SYSTEM';
  senderId: string | null;
  senderName: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Input Types
export interface CreateTicketInput {
  subject: string;
  message: string;
  priority?: TicketPriority;
  category?: string;
  source?: TicketSource;

  // Customer info (for guest)
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateTicketInput {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  assignedToId?: string | null;
}

export interface CreateMessageInput {
  ticketId: string;
  content: string;
  contentHtml?: string;
  type?: MessageType;
  attachments?: CreateAttachmentInput[];
}

export interface CreateAttachmentInput {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export interface CreateInternalNoteInput {
  ticketId: string;
  content: string;
  mentions?: string[];
}

export interface CreateChatSessionInput {
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  department?: string;
  metadata?: Record<string, any>;
}

// Query Types
export interface TicketFilters {
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority | TicketPriority[];
  assignedToId?: string | null;
  customerId?: string;
  source?: TicketSource;
  search?: string;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Settings Types
export interface SupportSettings {
  general: GeneralSettings;
  widget: WidgetSettings;
  notifications: NotificationSettings;
  automation: AutomationSettings;
  ai: AISettings;
}

export interface GeneralSettings {
  enabled: boolean;
  businessName: string;
  supportEmail: string;
  businessHours: BusinessHours;
  autoAssign: boolean;
  defaultPriority: TicketPriority;
}

export interface BusinessHours {
  timezone: string;
  schedule: {
    [day: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

export interface WidgetSettings {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  welcomeMessage: string;
  offlineMessage: string;
  requireEmail: boolean;
  requireName: boolean;
  showPhone: boolean;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  browserEnabled: boolean;
  soundEnabled: boolean;
  soundUrl: string;
  emailOnNewTicket: boolean;
  emailOnReply: boolean;
  emailDigest: boolean;
  digestTime: string;
}

export interface AutomationSettings {
  autoResponseEnabled: boolean;
  autoResponseMessage: string;
  autoCloseEnabled: boolean;
  autoCloseDays: number;
  slaEnabled: boolean;
  slaResponseTime: number;
  slaResolutionTime: number;
}

export interface AISettings {
  enabled: boolean;
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  confidenceThreshold: number;
  systemPrompt: string;
  showSuggestions: boolean;
}

// Event Types (Socket.io)
export interface SocketEvents {
  // Client → Server
  'chat:message:send': { ticketId: string; content: string; attachments?: CreateAttachmentInput[] };
  'chat:typing:start': { ticketId: string };
  'chat:typing:stop': { ticketId: string };
  'chat:read:mark': { ticketId: string; messageIds: string[] };
  'ticket:join': { ticketId: string };
  'ticket:leave': { ticketId: string };

  // Server → Client
  'chat:message:new': Message;
  'chat:agent:typing': { ticketId: string; agentId: string; agentName: string };
  'chat:customer:typing': { ticketId: string };
  'chat:message:read': { ticketId: string; messageIds: string[]; readBy: string };
  'ticket:updated': { ticketId: string; changes: Partial<Ticket> };

  // Admin Events
  'admin:ticket:new': Ticket;
  'admin:ticket:updated': { ticketId: string; changes: Partial<Ticket> };
  'admin:message:new': { ticketId: string; message: Message };
}

// Service Types
export interface ServiceContext {
  userId?: string;
  userRole?: string;
  isAgent?: boolean;
  isAdmin?: boolean;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
