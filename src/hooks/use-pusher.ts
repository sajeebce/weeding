"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Channel } from "pusher-js";
import {
  getPusherClient,
  CHANNELS,
  EVENTS,
  isPusherClientConfigured,
} from "@/lib/pusher";
import type {
  MessageNewEvent,
  TypingEvent,
  TicketNewEvent,
  TicketUpdatedEvent,
} from "@/lib/pusher";

// Hook to subscribe to a ticket channel
export function useTicketChannel(
  ticketId: string | null,
  options: {
    onMessageNew?: (event: MessageNewEvent) => void;
    onTypingStart?: (event: TypingEvent) => void;
    onTypingStop?: (event: TypingEvent) => void;
    onTicketUpdated?: (event: TicketUpdatedEvent) => void;
  } = {}
) {
  const channelRef = useRef<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid re-subscribing on every render
  const onMessageNewRef = useRef(options.onMessageNew);
  const onTypingStartRef = useRef(options.onTypingStart);
  const onTypingStopRef = useRef(options.onTypingStop);
  const onTicketUpdatedRef = useRef(options.onTicketUpdated);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageNewRef.current = options.onMessageNew;
  }, [options.onMessageNew]);

  useEffect(() => {
    onTypingStartRef.current = options.onTypingStart;
  }, [options.onTypingStart]);

  useEffect(() => {
    onTypingStopRef.current = options.onTypingStop;
  }, [options.onTypingStop]);

  useEffect(() => {
    onTicketUpdatedRef.current = options.onTicketUpdated;
  }, [options.onTicketUpdated]);

  useEffect(() => {
    if (!ticketId || !isPusherClientConfigured()) {
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = CHANNELS.ticket(ticketId);
    channelRef.current = pusher.subscribe(channelName);

    channelRef.current.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channelRef.current.bind("pusher:subscription_error", () => {
      setIsConnected(false);
    });

    // Bind event handlers using refs for stable callbacks
    const handleMessageNew = (event: MessageNewEvent) => {
      onMessageNewRef.current?.(event);
    };

    const handleTypingStart = (event: TypingEvent) => {
      onTypingStartRef.current?.(event);
    };

    const handleTypingStop = (event: TypingEvent) => {
      onTypingStopRef.current?.(event);
    };

    const handleTicketUpdated = (event: TicketUpdatedEvent) => {
      onTicketUpdatedRef.current?.(event);
    };

    channelRef.current.bind(EVENTS.MESSAGE_NEW, handleMessageNew);
    channelRef.current.bind(EVENTS.TYPING_START, handleTypingStart);
    channelRef.current.bind(EVENTS.TYPING_STOP, handleTypingStop);
    channelRef.current.bind(EVENTS.TICKET_UPDATED, handleTicketUpdated);

    return () => {
      if (channelRef.current) {
        pusher.unsubscribe(channelName);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [ticketId]); // Only re-subscribe when ticketId changes

  return { isConnected };
}

// Hook to subscribe to admin notifications
export function useAdminNotifications(options: {
  onTicketNew?: (event: TicketNewEvent) => void;
  onTicketUpdated?: (event: TicketUpdatedEvent) => void;
  onTicketAssigned?: (event: TicketUpdatedEvent) => void;
} = {}) {
  const channelRef = useRef<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid re-subscribing on every render
  const onTicketNewRef = useRef(options.onTicketNew);
  const onTicketUpdatedRef = useRef(options.onTicketUpdated);
  const onTicketAssignedRef = useRef(options.onTicketAssigned);

  // Update refs when callbacks change
  useEffect(() => {
    onTicketNewRef.current = options.onTicketNew;
  }, [options.onTicketNew]);

  useEffect(() => {
    onTicketUpdatedRef.current = options.onTicketUpdated;
  }, [options.onTicketUpdated]);

  useEffect(() => {
    onTicketAssignedRef.current = options.onTicketAssigned;
  }, [options.onTicketAssigned]);

  useEffect(() => {
    if (!isPusherClientConfigured()) {
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) return;

    channelRef.current = pusher.subscribe(CHANNELS.admin);

    channelRef.current.bind("pusher:subscription_succeeded", () => {
      setIsConnected(true);
    });

    channelRef.current.bind("pusher:subscription_error", () => {
      setIsConnected(false);
    });

    // Bind event handlers using refs for stable callbacks
    const handleTicketNew = (event: TicketNewEvent) => {
      onTicketNewRef.current?.(event);
    };

    const handleTicketUpdated = (event: TicketUpdatedEvent) => {
      onTicketUpdatedRef.current?.(event);
    };

    const handleTicketAssigned = (event: TicketUpdatedEvent) => {
      onTicketAssignedRef.current?.(event);
    };

    channelRef.current.bind(EVENTS.TICKET_NEW, handleTicketNew);
    channelRef.current.bind(EVENTS.TICKET_UPDATED, handleTicketUpdated);
    channelRef.current.bind(EVENTS.TICKET_ASSIGNED, handleTicketAssigned);

    return () => {
      if (channelRef.current) {
        pusher.unsubscribe(CHANNELS.admin);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, []); // Empty deps - only subscribe once

  return { isConnected };
}

// Hook to send typing indicator
export function useTypingIndicator(ticketId: string | null) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const sendTyping = useCallback(async () => {
    if (!ticketId) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      try {
        await fetch(`/api/chat/${ticketId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: true }),
        });
      } catch (e) {
        console.error("Failed to send typing indicator:", e);
      }
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(async () => {
      isTypingRef.current = false;
      try {
        await fetch(`/api/chat/${ticketId}/typing`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTyping: false }),
        });
      } catch (e) {
        console.error("Failed to send typing stop:", e);
      }
    }, 3000);
  }, [ticketId]);

  const stopTyping = useCallback(async () => {
    if (!ticketId || !isTypingRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    isTypingRef.current = false;
    try {
      await fetch(`/api/chat/${ticketId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping: false }),
      });
    } catch (e) {
      console.error("Failed to send typing stop:", e);
    }
  }, [ticketId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { sendTyping, stopTyping };
}

// Hook for browser notifications
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return null;
  }, []);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        permission === "granted"
      ) {
        new Notification(title, {
          icon: "/logo.png",
          ...options,
        });
      }
    },
    [permission]
  );

  return { permission, requestPermission, showNotification };
}

// Hook for notification sound
export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio("/sounds/notification.mp3");
    audioRef.current.volume = 0.5;

    return () => {
      audioRef.current = null;
    };
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      });
    }
  }, []);

  return { playSound };
}
