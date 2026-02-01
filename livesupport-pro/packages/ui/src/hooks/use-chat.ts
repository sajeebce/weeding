'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CHAT_EVENTS } from '@livesupport/core';
import { useSocket } from './use-socket';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'VISITOR' | 'AGENT' | 'AI';
  createdAt: Date;
}

export interface UseChatOptions {
  socketUrl: string;
  token?: string;
  visitorId?: string;
  visitorName?: string;
  visitorEmail?: string;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  sessionId: string | null;
  isConnected: boolean;
  isWaiting: boolean;
  isActive: boolean;
  isEnded: boolean;
  agentName: string | null;
  typingUser: string | null;
  error: string | null;
  startChat: (department?: string) => void;
  sendMessage: (content: string) => void;
  sendTyping: () => void;
  endChat: () => void;
}

/**
 * Hook for live chat functionality (customer-side)
 */
export function useChat(options: UseChatOptions): UseChatReturn {
  const {
    socketUrl,
    token,
    visitorId,
    visitorName = 'Visitor',
    visitorEmail,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isConnected, emit, on, off } = useSocket({ url: socketUrl, token });

  // Start a chat session
  const startChat = useCallback(
    (department?: string) => {
      setError(null);
      setIsWaiting(true);

      emit(CHAT_EVENTS.REQUEST, {
        visitorId: visitorId || `visitor_${Date.now()}`,
        visitorName,
        visitorEmail,
        department,
      });
    },
    [emit, visitorId, visitorName, visitorEmail]
  );

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!sessionId || !isActive) return;

      emit(CHAT_EVENTS.MESSAGE, {
        sessionId,
        content,
      });

      // Optimistically add message to local state
      const newMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        content,
        senderId: visitorId || 'visitor',
        senderName: visitorName,
        senderType: 'VISITOR',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [sessionId, isActive, emit, visitorId, visitorName]
  );

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!sessionId || !isActive) return;
    emit(CHAT_EVENTS.TYPING, { sessionId });
  }, [sessionId, isActive, emit]);

  // End chat
  const endChat = useCallback(() => {
    if (!sessionId) return;

    emit(CHAT_EVENTS.END, { sessionId });
    setIsActive(false);
    setIsEnded(true);
  }, [sessionId, emit]);

  // Socket event handlers
  useEffect(() => {
    // Chat request response
    const handleChatRequest = (data: { success: boolean; session?: any; error?: string }) => {
      if (data.success && data.session) {
        setSessionId(data.session.id);
        setIsWaiting(true);
      } else {
        setError(data.error || 'Failed to start chat');
        setIsWaiting(false);
      }
    };

    // Agent accepted chat
    const handleChatAccept = (data: { session: any; agent: { id: string; name: string } }) => {
      setIsWaiting(false);
      setIsActive(true);
      setAgentName(data.agent.name);
    };

    // New message
    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        // Replace temp message if it exists
        const tempIndex = prev.findIndex((m) => m.id.startsWith('temp_') && m.content === message.content);
        if (tempIndex !== -1) {
          const newMessages = [...prev];
          newMessages[tempIndex] = message;
          return newMessages;
        }
        return [...prev, message];
      });
    };

    // Typing indicator
    const handleTyping = (data: { userName: string }) => {
      setTypingUser(data.userName);

      // Clear typing indicator after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 3000);
    };

    // Chat ended
    const handleChatEnd = () => {
      setIsActive(false);
      setIsEnded(true);
    };

    on(CHAT_EVENTS.REQUEST, handleChatRequest);
    on(CHAT_EVENTS.ACCEPT, handleChatAccept);
    on(CHAT_EVENTS.MESSAGE, handleMessage);
    on(CHAT_EVENTS.TYPING, handleTyping);
    on(CHAT_EVENTS.END, handleChatEnd);

    return () => {
      off(CHAT_EVENTS.REQUEST, handleChatRequest);
      off(CHAT_EVENTS.ACCEPT, handleChatAccept);
      off(CHAT_EVENTS.MESSAGE, handleMessage);
      off(CHAT_EVENTS.TYPING, handleTyping);
      off(CHAT_EVENTS.END, handleChatEnd);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [on, off]);

  return {
    messages,
    sessionId,
    isConnected,
    isWaiting,
    isActive,
    isEnded,
    agentName,
    typingUser,
    error,
    startChat,
    sendMessage,
    sendTyping,
    endChat,
  };
}
