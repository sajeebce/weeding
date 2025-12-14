"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { isWithinOperatingHours } from "@/lib/operating-hours";

export interface ChatMessage {
  id: string;
  content: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  senderName: string;
  type: "TEXT" | "IMAGE" | "DOCUMENT" | "AUDIO" | "SYSTEM";
  createdAt: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}

export interface ChatTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  isOnline: boolean;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  ticket: ChatTicket | null;
  sessionToken: string | null; // For guest authentication
  messages: ChatMessage[];
  guestInfo: {
    name: string;
    email: string;
    phone?: string;
  } | null;
  hasMoreMessages: boolean;
  isTyping: boolean;
  unreadCount: number;
}

const STORAGE_KEY = "llcpad_chat_state";
const POLL_INTERVAL = 5000; // 5 seconds

export function useChat() {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    isOnline: isWithinOperatingHours(), // Check operating hours on init
    isLoading: false,
    isSending: false,
    error: null,
    ticket: null,
    sessionToken: null,
    messages: [],
    guestInfo: null,
    hasMoreMessages: false,
    isTyping: false,
    unreadCount: 0,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Check operating hours periodically (every minute)
  useEffect(() => {
    const checkOperatingHours = () => {
      const isOnline = isWithinOperatingHours();
      setState((prev) => ({ ...prev, isOnline }));
    };

    // Check immediately
    checkOperatingHours();

    // Then check every minute
    const interval = setInterval(checkOperatingHours, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.ticket && parsed.guestInfo) {
          setState((prev) => ({
            ...prev,
            ticket: parsed.ticket,
            guestInfo: parsed.guestInfo,
            sessionToken: parsed.sessionToken || null,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load chat state:", e);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (state.ticket && state.guestInfo) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ticket: state.ticket,
          guestInfo: state.guestInfo,
          sessionToken: state.sessionToken,
        })
      );
    }
  }, [state.ticket, state.guestInfo, state.sessionToken]);

  // Check online status
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/chat?action=status");
      const data = await res.json();
      setState((prev) => ({ ...prev, isOnline: data.isOnline }));
    } catch {
      // Assume online if check fails
    }
  }, []);

  // Initial status check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (state.isOpen && state.ticket && !state.isMinimized) {
      const poll = async () => {
        try {
          const cursor = lastMessageIdRef.current;
          const url = cursor
            ? `/api/chat/${state.ticket!.id}/messages?cursor=${cursor}`
            : `/api/chat/${state.ticket!.id}/messages`;

          const headers: HeadersInit = {};
          if (state.sessionToken) {
            headers["x-session-token"] = state.sessionToken;
          }

          const res = await fetch(url, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setState((prev) => {
                // Filter out duplicates
                const existingIds = new Set(prev.messages.map((m) => m.id));
                const newMessages = data.messages.filter(
                  (m: ChatMessage) => !existingIds.has(m.id)
                );

                if (newMessages.length > 0) {
                  lastMessageIdRef.current =
                    newMessages[newMessages.length - 1].id;
                  return {
                    ...prev,
                    messages: [...prev.messages, ...newMessages],
                    unreadCount: prev.unreadCount + newMessages.length,
                  };
                }
                return prev;
              });
            }
          }
        } catch (e) {
          console.error("Failed to poll messages:", e);
        }
      };

      pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [state.isOpen, state.ticket, state.isMinimized, state.sessionToken]);

  // Open chat widget
  const openChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      unreadCount: 0,
    }));
  }, []);

  // Close chat widget
  const closeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Minimize chat widget
  const minimizeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: true }));
  }, []);

  // Maximize chat widget
  const maximizeChat = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: false, unreadCount: 0 }));
  }, []);

  // Start new chat
  const startChat = useCallback(
    async (guestInfo: { name: string; email: string; phone?: string; message?: string }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: guestInfo.name,
            email: guestInfo.email,
            phone: guestInfo.phone,
            message: guestInfo.message || "Started a live chat",
            subject: "Live Chat",
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to start chat");
        }

        const data = await res.json();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          ticket: {
            id: data.ticketId,
            ticketNumber: data.ticketNumber,
            subject: "Live Chat",
            status: "OPEN",
            createdAt: new Date().toISOString(),
          },
          sessionToken: data.sessionToken || null,
          guestInfo: { name: guestInfo.name, email: guestInfo.email, phone: guestInfo.phone },
          messages: data.messages || [],
        }));
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e instanceof Error ? e.message : "Failed to start chat",
        }));
      }
    },
    []
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string, attachments?: Array<{ fileName: string; fileUrl: string; fileType: string; fileSize: number }>) => {
      if (!state.ticket) return;

      setState((prev) => ({ ...prev, isSending: true, error: null }));

      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (state.sessionToken) {
          headers["x-session-token"] = state.sessionToken;
        }

        const res = await fetch(`/api/chat/${state.ticket.id}/messages`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            content,
            senderName: state.guestInfo?.name || "Guest",
            attachments,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send message");
        }

        const message = await res.json();

        setState((prev) => ({
          ...prev,
          isSending: false,
          messages: [...prev.messages, message],
        }));

        lastMessageIdRef.current = message.id;
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isSending: false,
          error: e instanceof Error ? e.message : "Failed to send message",
        }));
      }
    },
    [state.ticket, state.guestInfo, state.sessionToken]
  );

  // Upload file
  const uploadFile = useCallback(
    async (file: File) => {
      if (!state.ticket) return null;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("ticketId", state.ticket.id);

      try {
        const res = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload file");
        }

        const data = await res.json();
        return data.file;
      } catch (e) {
        setState((prev) => ({
          ...prev,
          error: e instanceof Error ? e.message : "Failed to upload file",
        }));
        return null;
      }
    },
    [state.ticket]
  );

  // Load previous messages (for pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!state.ticket || !state.hasMoreMessages) return;

    const oldestMessage = state.messages[0];
    if (!oldestMessage) return;

    try {
      const headers: HeadersInit = {};
      if (state.sessionToken) {
        headers["x-session-token"] = state.sessionToken;
      }

      const res = await fetch(
        `/api/chat/${state.ticket.id}/messages?before=${oldestMessage.id}`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          messages: [...data.messages, ...prev.messages],
          hasMoreMessages: data.hasMore,
        }));
      }
    } catch (e) {
      console.error("Failed to load more messages:", e);
    }
  }, [state.ticket, state.messages, state.hasMoreMessages, state.sessionToken]);

  // Clear chat (for new conversation)
  const clearChat = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    lastMessageIdRef.current = null;
    setState({
      isOpen: false,
      isMinimized: false,
      isOnline: true,
      isLoading: false,
      isSending: false,
      error: null,
      ticket: null,
      sessionToken: null,
      messages: [],
      guestInfo: null,
      hasMoreMessages: false,
      isTyping: false,
      unreadCount: 0,
    });
  }, []);

  // Resume existing chat (load messages)
  const resumeChat = useCallback(async () => {
    if (!state.ticket) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const headers: HeadersInit = {};
      if (state.sessionToken) {
        headers["x-session-token"] = state.sessionToken;
      }

      const res = await fetch(`/api/chat/${state.ticket.id}/messages`, { headers });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: data.messages || [],
          hasMoreMessages: data.hasMore,
        }));

        if (data.messages && data.messages.length > 0) {
          lastMessageIdRef.current = data.messages[data.messages.length - 1].id;
        }
      } else {
        // If unauthorized, clear the chat state
        if (res.status === 401) {
          localStorage.removeItem(STORAGE_KEY);
          setState((prev) => ({
            ...prev,
            isLoading: false,
            ticket: null,
            sessionToken: null,
            guestInfo: null,
            messages: [],
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    } catch (e) {
      console.error("Failed to resume chat:", e);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.ticket, state.sessionToken]);

  // Resume chat on mount if ticket exists
  useEffect(() => {
    if (state.ticket && state.messages.length === 0 && !state.isLoading) {
      resumeChat();
    }
  }, [state.ticket, state.messages.length, state.isLoading, resumeChat]);

  return {
    ...state,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    startChat,
    sendMessage,
    uploadFile,
    loadMoreMessages,
    clearChat,
    checkStatus,
  };
}
