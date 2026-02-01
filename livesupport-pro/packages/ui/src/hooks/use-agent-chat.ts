'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CHAT_EVENTS } from '@livesupport/core';
import { useSocket } from './use-socket';
import type { ChatMessage } from './use-chat';

export interface ChatSession {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  department?: string;
  status: 'WAITING' | 'ACTIVE' | 'ENDED';
  createdAt: Date;
  assignedAgent?: {
    id: string;
    name: string;
  };
}

export interface UseAgentChatOptions {
  socketUrl: string;
  token: string;
}

export interface UseAgentChatReturn {
  queue: ChatSession[];
  activeChats: ChatSession[];
  selectedChat: ChatSession | null;
  messages: ChatMessage[];
  typingUser: string | null;
  isConnected: boolean;
  error: string | null;
  selectChat: (sessionId: string) => void;
  acceptChat: (sessionId: string) => void;
  sendMessage: (content: string) => void;
  sendTyping: () => void;
  endChat: (sessionId: string) => void;
  transferChat: (sessionId: string, toAgentId: string) => void;
}

/**
 * Hook for agent-side chat management
 */
export function useAgentChat(options: UseAgentChatOptions): UseAgentChatReturn {
  const { socketUrl, token } = options;

  const [queue, setQueue] = useState<ChatSession[]>([]);
  const [activeChats, setActiveChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [error, _setError] = useState<string | null>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isConnected, emit, on, off } = useSocket({ url: socketUrl, token });

  // Select a chat to view messages
  const selectChat = useCallback((sessionId: string) => {
    const chat = [...queue, ...activeChats].find((c) => c.id === sessionId);
    setSelectedChat(chat || null);
    setMessages([]); // TODO: Fetch messages from API
  }, [queue, activeChats]);

  // Accept a waiting chat
  const acceptChat = useCallback(
    (sessionId: string) => {
      emit(CHAT_EVENTS.ACCEPT, { sessionId });
    },
    [emit]
  );

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!selectedChat) return;

      emit(CHAT_EVENTS.MESSAGE, {
        sessionId: selectedChat.id,
        content,
      });
    },
    [selectedChat, emit]
  );

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!selectedChat) return;
    emit(CHAT_EVENTS.TYPING, { sessionId: selectedChat.id });
  }, [selectedChat, emit]);

  // End a chat
  const endChat = useCallback(
    (sessionId: string) => {
      emit(CHAT_EVENTS.END, { sessionId });
    },
    [emit]
  );

  // Transfer chat to another agent
  const transferChat = useCallback(
    (sessionId: string, toAgentId: string) => {
      emit(CHAT_EVENTS.TRANSFER, { sessionId, toAgentId });
    },
    [emit]
  );

  // Socket event handlers
  useEffect(() => {
    // Queue updates
    const handleQueueUpdate = (data: { type: string; session?: ChatSession; sessionId?: string }) => {
      if (data.type === 'new' && data.session) {
        setQueue((prev) => [...prev, data.session!]);
      } else if (data.type === 'accepted' && data.sessionId) {
        setQueue((prev) => prev.filter((c) => c.id !== data.sessionId));
      }
    };

    // Chat accepted (by current agent)
    const handleChatAccept = (data: { session: ChatSession }) => {
      setQueue((prev) => prev.filter((c) => c.id !== data.session.id));
      setActiveChats((prev) => [...prev, { ...data.session, status: 'ACTIVE' }]);
    };

    // New message
    const handleMessage = (message: ChatMessage) => {
      if (selectedChat && message.senderId !== 'self') {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Typing indicator
    const handleTyping = (data: { sessionId: string; userName: string }) => {
      if (selectedChat?.id === data.sessionId) {
        setTypingUser(data.userName);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUser(null);
        }, 3000);
      }
    };

    // Chat ended
    const handleChatEnd = (data: { sessionId: string }) => {
      setActiveChats((prev) => prev.filter((c) => c.id !== data.sessionId));
      if (selectedChat?.id === data.sessionId) {
        setSelectedChat(null);
        setMessages([]);
      }
    };

    on(CHAT_EVENTS.QUEUE_UPDATE, handleQueueUpdate);
    on(CHAT_EVENTS.ACCEPT, handleChatAccept);
    on(CHAT_EVENTS.MESSAGE, handleMessage);
    on(CHAT_EVENTS.TYPING, handleTyping);
    on(CHAT_EVENTS.END, handleChatEnd);

    return () => {
      off(CHAT_EVENTS.QUEUE_UPDATE, handleQueueUpdate);
      off(CHAT_EVENTS.ACCEPT, handleChatAccept);
      off(CHAT_EVENTS.MESSAGE, handleMessage);
      off(CHAT_EVENTS.TYPING, handleTyping);
      off(CHAT_EVENTS.END, handleChatEnd);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [on, off, selectedChat]);

  return {
    queue,
    activeChats,
    selectedChat,
    messages,
    typingUser,
    isConnected,
    error,
    selectChat,
    acceptChat,
    sendMessage,
    sendTyping,
    endChat,
    transferChat,
  };
}
