'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CHAT_EVENTS } from '@livesupport/core';
import { useSocket } from './use-socket';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WidgetState =
  | 'IDLE'
  | 'CONNECTING'
  | 'ACTIVE_CHAT'
  | 'AI_CHAT'
  | 'AI_HANDOFF'
  | 'OFFLINE_REPLY'
  | 'ENDED';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'VISITOR' | 'AGENT' | 'AI' | 'SYSTEM';
  createdAt: Date;
}

export interface UseChatOptions {
  socketUrl: string;
  token?: string;
  visitorId?: string;
  visitorName?: string;
  visitorEmail?: string;
  emailCollectionMode?: 'always' | 'connecting' | 'offline_only' | 'never';
}

export interface UseChatReturn {
  messages: ChatMessage[];
  sessionId: string | null;
  isConnected: boolean;
  widgetState: WidgetState;
  agentName: string | null;
  agentsOnline: boolean;
  typingUser: string | null;
  error: string | null;
  unreadCount: number;
  // Email state
  emailCollected: boolean;
  emailSkipped: boolean;
  showEmailCard: boolean;
  // Actions
  startChat: (firstMessage: string) => void;
  sendMessage: (content: string) => void;
  sendTyping: () => void;
  endChat: () => void;
  submitEmail: (email: string) => void;
  skipEmail: () => void;
  resetChat: () => void;
  clearUnread: () => void;
  // Backwards-compatible boolean flags
  isWaiting: boolean;
  isActive: boolean;
  isEnded: boolean;
}

// ─── Session Persistence ─────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = 'livesupport_session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SavedSession {
  sessionId: string;
  visitorId: string;
  widgetState: WidgetState;
  emailCollected: boolean;
  timestamp: number;
}

function saveSession(data: Omit<SavedSession, 'timestamp'>) {
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ ...data, timestamp: Date.now() })
    );
  } catch {
    // localStorage may be unavailable
  }
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data: SavedSession = JSON.parse(raw);
    if (Date.now() - data.timestamp > SESSION_EXPIRY_MS) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearSavedSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Hook for live chat functionality (customer-side)
 * Uses a state machine (WidgetState) for reliable state management.
 */
export function useChat(options: UseChatOptions): UseChatReturn {
  const {
    socketUrl,
    token,
    visitorId: visitorIdProp,
    visitorName = 'Visitor',
    emailCollectionMode = 'always',
  } = options;

  // Generate stable visitor ID (persisted across reloads)
  const [visitorId] = useState(() => {
    const saved = loadSession();
    return (
      saved?.visitorId ||
      visitorIdProp ||
      `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
  });

  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [widgetState, setWidgetState] = useState<WidgetState>('IDLE');
  const [agentName, setAgentName] = useState<string | null>(null);
  const [agentsOnline, setAgentsOnline] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Email state
  const [emailCollected, setEmailCollected] = useState(false);
  const [emailSkipped, setEmailSkipped] = useState(false);
  const [showEmailCard, setShowEmailCard] = useState(false);

  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const visitorIdRef = useRef(visitorId);

  const { isConnected, emit, on, off } = useSocket({ url: socketUrl, token });

  // ─── Attempt rejoin on connect ────────────────────────────────────────────

  useEffect(() => {
    if (isConnected) {
      const saved = loadSession();
      if (saved?.sessionId) {
        emit(CHAT_EVENTS.REJOIN, {
          sessionId: saved.sessionId,
          visitorId: saved.visitorId,
        });
      }
    }
  }, [isConnected, emit]);

  // ─── Socket event handlers ──────────────────────────────────────────────────

  useEffect(() => {
    // Agent availability updates (broadcast to ALL sockets including visitors)
    const handleAgentsStatus = (data: { online: boolean; count: number }) => {
      setAgentsOnline(data.online);
    };

    // Chat request response
    const handleChatRequest = (data: {
      success: boolean;
      session?: { id: string };
      agentsOnline?: boolean;
      error?: string;
    }) => {
      if (data.success && data.session) {
        setSessionId(data.session.id);

        // Send pending message immediately (avoids useEffect double-fire in strict mode)
        if (pendingMessageRef.current) {
          emit(CHAT_EVENTS.MESSAGE, {
            sessionId: data.session.id,
            content: pendingMessageRef.current,
          });
          pendingMessageRef.current = null;
        }

        // Persist session to localStorage
        const newState =
          data.agentsOnline === false ? 'OFFLINE_REPLY' : 'CONNECTING';
        saveSession({
          sessionId: data.session.id,
          visitorId: visitorIdRef.current,
          widgetState: newState as WidgetState,
          emailCollected: false,
        });

        if (data.agentsOnline === false) {
          // No agents online - go directly to offline
          setWidgetState('OFFLINE_REPLY');
        }
        // If agents are online, stay in CONNECTING (set by startChat)
      } else {
        setError(data.error || 'Failed to start chat');
        setWidgetState('OFFLINE_REPLY');
      }
    };

    // Agent accepted chat
    const handleChatAccept = (data: { session: { id: string }; agent: { id: string; name: string } }) => {
      setWidgetState('ACTIVE_CHAT');
      setAgentName(data.agent.name);
      setShowEmailCard(false); // Hide email card when agent joins

      // Update saved session state
      const saved = loadSession();
      if (saved) {
        saveSession({ ...saved, widgetState: 'ACTIVE_CHAT' });
      }

      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_${Date.now()}`,
          content: `${data.agent.name} joined the chat`,
          senderId: 'system',
          senderName: 'System',
          senderType: 'SYSTEM',
          createdAt: new Date(),
        },
      ]);
    };

    // New message - with dedup for optimistic/temp messages
    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        // Replace temp message if exists (match by content + senderType)
        const tempIndex = prev.findIndex(
          (m) => m.id.startsWith('temp_') && m.content === message.content && m.senderType === message.senderType
        );
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
        return [...prev, message];
      });

      if (message.senderType !== 'VISITOR') {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Typing indicator
    const handleTyping = (data: { userName: string }) => {
      setTypingUser(data.userName);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
    };

    // Chat ended
    const handleChatEnd = () => {
      setWidgetState('ENDED');
      clearSavedSession();
      setMessages((prev) => [
        ...prev,
        {
          id: `sys_end_${Date.now()}`,
          content: 'Chat ended',
          senderId: 'system',
          senderName: 'System',
          senderType: 'SYSTEM',
          createdAt: new Date(),
        },
      ]);
    };

    // Agent timeout - no one accepted within timeout period
    const handleAgentTimeout = () => {
      setWidgetState((current) => {
        if (current === 'CONNECTING') return 'OFFLINE_REPLY';
        return current;
      });
    };

    // Rejoin response - restore session after page reload
    const handleRejoin = (data: {
      success: boolean;
      session?: {
        id: string;
        ticketId: string;
        status: 'WAITING' | 'ACTIVE' | 'ENDED';
        agentName?: string;
        visitorEmail?: string;
      };
      messages?: Array<{
        id: string;
        content: string;
        senderId: string;
        senderName: string;
        senderType: string;
        createdAt: string;
      }>;
      error?: string;
    }) => {
      if (data.success && data.session) {
        setSessionId(data.session.id);

        // Restore messages from DB
        if (data.messages && data.messages.length > 0) {
          const restored: ChatMessage[] = data.messages.map((m) => ({
            id: m.id,
            content: m.content,
            senderId: m.senderId,
            senderName: m.senderType === 'VISITOR' ? 'You' : m.senderName,
            senderType: m.senderType as ChatMessage['senderType'],
            createdAt: new Date(m.createdAt),
          }));
          setMessages(restored);
        }

        // Restore widget state based on session status
        if (data.session.status === 'ACTIVE') {
          setWidgetState('ACTIVE_CHAT');
          if (data.session.agentName) setAgentName(data.session.agentName);
        } else if (data.session.status === 'WAITING') {
          setWidgetState('CONNECTING');
        }

        // Restore email state
        if (data.session.visitorEmail) {
          setEmailCollected(true);
        }
      } else {
        // Session not found - clear saved state
        clearSavedSession();
      }
    };

    on(CHAT_EVENTS.AGENTS_STATUS, handleAgentsStatus);
    on(CHAT_EVENTS.REQUEST, handleChatRequest);
    on(CHAT_EVENTS.ACCEPT, handleChatAccept);
    on(CHAT_EVENTS.MESSAGE, handleMessage);
    on(CHAT_EVENTS.TYPING, handleTyping);
    on(CHAT_EVENTS.END, handleChatEnd);
    on(CHAT_EVENTS.AGENT_TIMEOUT, handleAgentTimeout);
    on(CHAT_EVENTS.REJOIN, handleRejoin);

    return () => {
      off(CHAT_EVENTS.AGENTS_STATUS, handleAgentsStatus);
      off(CHAT_EVENTS.REQUEST, handleChatRequest);
      off(CHAT_EVENTS.ACCEPT, handleChatAccept);
      off(CHAT_EVENTS.MESSAGE, handleMessage);
      off(CHAT_EVENTS.TYPING, handleTyping);
      off(CHAT_EVENTS.END, handleChatEnd);
      off(CHAT_EVENTS.AGENT_TIMEOUT, handleAgentTimeout);
      off(CHAT_EVENTS.REJOIN, handleRejoin);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [on, off, emit]);

  // ─── Show email card after entering CONNECTING/OFFLINE state ────────────────

  useEffect(() => {
    if (
      widgetState === 'CONNECTING' &&
      !emailCollected &&
      !emailSkipped &&
      emailCollectionMode !== 'never'
    ) {
      emailTimerRef.current = setTimeout(() => {
        setShowEmailCard(true);
      }, 2000);
    }

    if (
      widgetState === 'OFFLINE_REPLY' &&
      !emailCollected &&
      !emailSkipped &&
      emailCollectionMode !== 'never'
    ) {
      // Show immediately in offline mode
      setShowEmailCard(true);
    }

    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, [widgetState, emailCollected, emailSkipped, emailCollectionMode]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  // Start a chat session (visitor's first message)
  const startChat = useCallback(
    (firstMessage: string) => {
      setError(null);

      // Add the first message to UI immediately
      setMessages([
        {
          id: `temp_${Date.now()}`,
          content: firstMessage,
          senderId: visitorId,
          senderName: 'You',
          senderType: 'VISITOR',
          createdAt: new Date(),
        },
      ]);

      pendingMessageRef.current = firstMessage;
      setWidgetState('CONNECTING');

      emit(CHAT_EVENTS.REQUEST, {
        visitorId,
        visitorName,
      });
    },
    [emit, visitorId, visitorName]
  );

  // Send a message (during active chat or offline reply)
  const sendMessage = useCallback(
    (content: string) => {
      if (!sessionId) return;

      emit(CHAT_EVENTS.MESSAGE, {
        sessionId,
        content,
      });

      // Optimistically add message to local state
      const newMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        content,
        senderId: visitorId,
        senderName: 'You',
        senderType: 'VISITOR',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [sessionId, emit, visitorId]
  );

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!sessionId) return;
    emit(CHAT_EVENTS.TYPING, { sessionId });
  }, [sessionId, emit]);

  // End chat
  const endChat = useCallback(() => {
    if (!sessionId) return;
    emit(CHAT_EVENTS.END, { sessionId });
    setWidgetState('ENDED');
    clearSavedSession();
  }, [sessionId, emit]);

  // Submit email
  const submitEmail = useCallback(
    (email: string) => {
      if (!sessionId) return;
      emit(CHAT_EVENTS.EMAIL_UPDATE, { sessionId, email });
      setEmailCollected(true);

      // Update saved session
      const saved = loadSession();
      if (saved) {
        saveSession({ ...saved, emailCollected: true });
      }
    },
    [sessionId, emit]
  );

  // Skip email
  const skipEmail = useCallback(() => {
    setEmailSkipped(true);
    setShowEmailCard(false);
  }, []);

  // Reset chat for starting a new conversation
  const resetChat = useCallback(() => {
    setWidgetState('IDLE');
    setMessages([]);
    setSessionId(null);
    setAgentName(null);
    pendingMessageRef.current = null;
    setEmailCollected(false);
    setEmailSkipped(false);
    setShowEmailCard(false);
    setError(null);
    setUnreadCount(0);
    clearSavedSession();
  }, []);

  // Clear unread count
  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    messages,
    sessionId,
    isConnected,
    widgetState,
    agentName,
    agentsOnline,
    typingUser,
    error,
    unreadCount,
    emailCollected,
    emailSkipped,
    showEmailCard,
    startChat,
    sendMessage,
    sendTyping,
    endChat,
    submitEmail,
    skipEmail,
    resetChat,
    clearUnread,
    // Backwards-compatible boolean flags
    isWaiting: widgetState === 'CONNECTING',
    isActive: widgetState === 'ACTIVE_CHAT',
    isEnded: widgetState === 'ENDED',
  };
}
