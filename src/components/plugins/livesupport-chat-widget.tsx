"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type WidgetState =
  | "IDLE"
  | "OFFLINE_FORM"
  | "CONNECTING"
  | "ACTIVE_CHAT"
  | "AI_CHAT"
  | "AI_HANDOFF"
  | "OFFLINE_REPLY"
  | "ENDED";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "VISITOR" | "AGENT" | "AI" | "SYSTEM";
  createdAt: Date;
}

interface LiveSupportChatWidgetProps {
  config?: {
    position?: "bottom-right" | "bottom-left";
    primaryColor?: string;
    welcomeMessage?: string;
    enabled?: boolean;
    connectingMessage?: string;
    offlineMessage?: string;
    replyTimeMessage?: string;
    offlineReplyTimeMessage?: string;
    agentTimeoutSeconds?: number;
    offlineFormEnabled?: boolean;
    offlineFormMessage?: string;
  };
}

// ─── Socket Events ────────────────────────────────────────────────────────────

const CHAT_EVENTS = {
  REQUEST: "chat:request",
  ACCEPT: "chat:accept",
  MESSAGE: "chat:message",
  TYPING: "chat:typing",
  END: "chat:end",
  EMAIL_UPDATE: "chat:email_update",
  AGENT_TIMEOUT: "chat:agent_timeout",
  AGENTS_STATUS: "agents:status",
  REJOIN: "chat:rejoin",
  COLLECT_INFO: "chat:collect_info",
  LEAD_UPDATE: "chat:lead_update",
  INFO_COLLECTED: "chat:info_collected",
};

// ─── Session Persistence ─────────────────────────────────────────────────────

const SESSION_STORAGE_KEY = "livesupport_session";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SavedSession {
  sessionId: string;
  visitorId: string;
  widgetState: WidgetState;
  leadCollected: boolean;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  timestamp: number;
}

function saveSession(data: Omit<SavedSession, "timestamp">) {
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
    // Expire after 24h
    if (Date.now() - data.timestamp > SESSION_EXPIRY_MS) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="py-1.5 text-center">
      <span className="text-xs text-gray-400">{text}</span>
    </div>
  );
}

function ConnectingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full opacity-60"
          style={{ backgroundColor: color, animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

/** Inline lead collection form - shown in chat timeline when agent triggers it */
function LeadCollectionForm({
  primaryColor,
  onSubmit,
  onSkip,
  initialData,
}: {
  primaryColor: string;
  onSubmit: (data: { name?: string; email: string; phone?: string }) => void;
  onSkip: () => void;
  initialData?: { name?: string; email?: string; phone?: string };
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setSubmitted(true);
    onSubmit({
      name: name.trim() || undefined,
      email: trimmedEmail,
      phone: phone.trim() || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="mx-2 my-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium text-green-700">
            Thanks{name.trim() ? `, ${name.trim()}` : ""}! Info saved.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">Share your details</p>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="Email *"
          className={`h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 ${
            error ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:border-transparent"
          }`}
          style={!error ? ({ "--tw-ring-color": primaryColor } as React.CSSProperties) : undefined}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
        <button
          type="submit"
          className="h-10 w-full rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="block w-full text-center text-xs text-gray-400 transition-colors hover:text-gray-600 hover:underline"
        >
          Skip
        </button>
      </form>
    </div>
  );
}

/** Offline pre-chat form - replaces entire chat body when agents are offline */
function OfflinePreChatForm({
  primaryColor,
  offlineFormMessage,
  onSubmit,
}: {
  primaryColor: string;
  offlineFormMessage: string;
  onSubmit: (data: { name?: string; email: string; phone?: string; message: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedMsg = msg.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email");
      return;
    }
    if (!trimmedMsg) {
      setError("Message is required");
      return;
    }

    setError("");
    setSubmitting(true);
    onSubmit({
      name: name.trim() || undefined,
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      message: trimmedMsg,
    });
  };

  return (
    <div className="flex flex-col items-center px-6 py-6">
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={primaryColor}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Leave us a message</h3>
      <p className="mt-1 text-center text-sm text-gray-500">{offlineFormMessage}</p>

      <form onSubmit={handleSubmit} className="mt-4 w-full space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="your@email.com"
            className={`h-10 w-full rounded-lg border bg-white px-3 text-sm focus:outline-none focus:ring-2 ${
              error && !email.trim() ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:border-transparent"
            }`}
            style={!(error && !email.trim()) ? ({ "--tw-ring-color": primaryColor } as React.CSSProperties) : undefined}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            value={msg}
            onChange={(e) => {
              setMsg(e.target.value);
              if (error) setError("");
            }}
            placeholder="How can we help?"
            rows={3}
            maxLength={2000}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none ${
              error && !msg.trim() ? "border-red-300 focus:ring-red-300" : "border-gray-300 focus:border-transparent"
            }`}
            style={!(error && !msg.trim()) ? ({ "--tw-ring-color": primaryColor } as React.CSSProperties) : undefined}
          />
          {msg.length > 1500 && (
            <p className="mt-0.5 text-right text-xs text-gray-400">{msg.length}/2000</p>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="h-10 w-full rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

function OfflineCard({
  message,
  replyTime,
}: {
  message: string;
  replyTime: string;
}) {
  return (
    <div className="mx-2 my-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <svg
          className="h-4 w-4 shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-semibold text-gray-800">{message}</span>
      </div>
      <p className="mt-1 pl-6 text-xs text-gray-500">{replyTime}</p>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function LiveSupportChatWidget({
  config,
}: LiveSupportChatWidgetProps) {
  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [widgetState, setWidgetState] = useState<WidgetState>("IDLE");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visitorId] = useState(() => {
    const saved = loadSession();
    return (
      saved?.visitorId ||
      `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );
  });

  // Lead info state
  const [leadInfo, setLeadInfo] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    collected: boolean;
  }>({ collected: false });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormSkipped, setLeadFormSkipped] = useState(false);

  // Agent availability
  const [agentsOnline, setAgentsOnline] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const visitorIdRef = useRef(visitorId);

  // Config
  const position = config?.position || "bottom-right";
  const primaryColor = config?.primaryColor || "#2563eb";
  const welcomeMessage =
    config?.welcomeMessage || "Hi! How can we help you today?";
  const enabled = config?.enabled !== false;
  const connectingMessage =
    config?.connectingMessage || "Connecting you with a team member...";
  const offlineMessage =
    config?.offlineMessage || "Our team is currently away";
  const replyTimeMessage =
    config?.replyTimeMessage || "We typically reply within a few minutes";
  const offlineReplyTimeMessage =
    config?.offlineReplyTimeMessage ||
    "We typically respond within a few hours";
  const offlineFormEnabled = config?.offlineFormEnabled !== false;
  const offlineFormMessage =
    config?.offlineFormMessage || "Our team is offline. We'll get back to you soon.";

  // Socket URL
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : "");

  // ─── Socket Connection ────────────────────────────────────────────────────

  useEffect(() => {
    if (!enabled || !socketUrl) return;

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsSocketConnected(true);

      // Attempt to rejoin saved session
      const saved = loadSession();
      if (saved?.sessionId) {
        socket.emit(CHAT_EVENTS.REJOIN, {
          sessionId: saved.sessionId,
          visitorId: saved.visitorId,
        });
      }
    });

    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    socket.on("connect_error", () => {
      setIsSocketConnected(false);
    });

    // Agent availability updates
    socket.on(
      CHAT_EVENTS.AGENTS_STATUS,
      (data: { online: boolean; count: number }) => {
        setAgentsOnline(data.online);
      }
    );

    // Chat request response
    socket.on(
      CHAT_EVENTS.REQUEST,
      (data: {
        success: boolean;
        session?: { id: string };
        agentsOnline?: boolean;
        error?: string;
      }) => {
        if (data.success && data.session) {
          setSessionId(data.session.id);

          // Send pending message immediately (avoids useEffect double-fire in strict mode)
          if (pendingMessageRef.current) {
            socket.emit(CHAT_EVENTS.MESSAGE, {
              sessionId: data.session.id,
              content: pendingMessageRef.current,
            });
            pendingMessageRef.current = null;
          }

          // Persist session to localStorage
          const newState =
            data.agentsOnline === false ? "OFFLINE_REPLY" : "CONNECTING";
          saveSession({
            sessionId: data.session.id,
            visitorId: visitorIdRef.current,
            widgetState: newState as WidgetState,
            leadCollected: false,
          });

          if (data.agentsOnline === false) {
            // No agents online - go directly to offline
            setWidgetState("OFFLINE_REPLY");
          }
          // If agents are online, stay in CONNECTING (set by handleSubmit)
        } else {
          // Request failed - go to offline
          setWidgetState("OFFLINE_REPLY");
        }
      }
    );

    // Agent accepted chat
    socket.on(
      CHAT_EVENTS.ACCEPT,
      (data: { session: { id: string }; agent: { name: string } }) => {
        setWidgetState("ACTIVE_CHAT");
        setAgentName(data.agent.name);

        // Update saved session state
        const saved = loadSession();
        if (saved) {
          saveSession({ ...saved, widgetState: "ACTIVE_CHAT" });
        }

        // Add system message
        setMessages((prev) => [
          ...prev,
          {
            id: `sys_${Date.now()}`,
            content: `${data.agent.name} joined the chat`,
            senderId: "system",
            senderName: "System",
            senderType: "SYSTEM",
            createdAt: new Date(),
          },
        ]);
      }
    );

    // Agent triggers lead collection form
    socket.on(
      CHAT_EVENTS.COLLECT_INFO,
      (_data: { sessionId: string }) => {
        setShowLeadForm(true);
        setLeadFormSkipped(false);
      }
    );

    // New message
    socket.on(CHAT_EVENTS.MESSAGE, (message: ChatMessage) => {
      setMessages((prev) => {
        // Replace temp message if exists
        const tempIndex = prev.findIndex(
          (m) => m.id.startsWith("temp_") && m.content === message.content
        );
        if (tempIndex !== -1) {
          const updated = [...prev];
          updated[tempIndex] = message;
          return updated;
        }
        return [...prev, message];
      });

      if (message.senderType !== "VISITOR") {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Typing indicator
    socket.on(CHAT_EVENTS.TYPING, (data: { userName: string }) => {
      setTypingUser(data.userName);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
    });

    // Chat ended
    socket.on(CHAT_EVENTS.END, () => {
      setWidgetState("ENDED");
      clearSession();

      setMessages((prev) => [
        ...prev,
        {
          id: `sys_end_${Date.now()}`,
          content: "Chat ended",
          senderId: "system",
          senderName: "System",
          senderType: "SYSTEM",
          createdAt: new Date(),
        },
      ]);
    });

    // Agent timeout - no one accepted within timeout period
    socket.on(
      CHAT_EVENTS.AGENT_TIMEOUT,
      (_data: { sessionId: string }) => {
        setWidgetState((current) => {
          if (current === "CONNECTING") return "OFFLINE_REPLY";
          return current;
        });
      }
    );

    // Rejoin response - restore session after page reload
    socket.on(
      CHAT_EVENTS.REJOIN,
      (data: {
        success: boolean;
        session?: {
          id: string;
          ticketId: string;
          status: "WAITING" | "ACTIVE" | "ENDED";
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
              senderName:
                m.senderType === "VISITOR" ? "You" : m.senderName,
              senderType: m.senderType as ChatMessage["senderType"],
              createdAt: new Date(m.createdAt),
            }));
            setMessages(restored);
          }

          // Restore widget state based on session status
          if (data.session.status === "ACTIVE") {
            setWidgetState("ACTIVE_CHAT");
            if (data.session.agentName) setAgentName(data.session.agentName);
          } else if (data.session.status === "WAITING") {
            setWidgetState("CONNECTING");
          }

          // Restore lead info state
          if (data.session.visitorEmail) {
            setLeadInfo({
              email: data.session.visitorEmail,
              collected: true,
            });
          }

          console.log(
            `[Chat Widget] Rejoined session: ${data.session.id} (${data.session.status})`
          );
        } else {
          // Session not found - clear saved state
          clearSession();
        }
      }
    );

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [enabled, socketUrl]);

  // ─── Auto-scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showLeadForm, widgetState]);

  // ─── Clear unread on open ─────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ─── Escape to close ─────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // ─── IDLE ↔ OFFLINE_FORM transition based on agent availability ──────────

  useEffect(() => {
    if (widgetState === "IDLE" && !agentsOnline && offlineFormEnabled) {
      setWidgetState("OFFLINE_FORM");
    }
    if (widgetState === "OFFLINE_FORM" && agentsOnline) {
      setWidgetState("IDLE");
    }
  }, [agentsOnline, widgetState, offlineFormEnabled]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const startChat = useCallback(
    (firstMessage: string) => {
      if (!socketRef.current || !isSocketConnected) return;

      pendingMessageRef.current = firstMessage;
      setWidgetState("CONNECTING");

      socketRef.current.emit(CHAT_EVENTS.REQUEST, {
        visitorId,
        visitorName: "Visitor",
      });
    },
    [visitorId, isSocketConnected]
  );

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !sessionId) return;

      socketRef.current.emit(CHAT_EVENTS.MESSAGE, { sessionId, content });

      const newMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        content,
        senderId: visitorId,
        senderName: "You",
        senderType: "VISITOR",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [sessionId, visitorId]
  );

  const sendTyping = useCallback(() => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit(CHAT_EVENTS.TYPING, { sessionId });
  }, [sessionId]);

  const submitLeadInfo = useCallback(
    (data: { name?: string; email: string; phone?: string }) => {
      if (!socketRef.current || !sessionId) return;

      socketRef.current.emit(CHAT_EVENTS.LEAD_UPDATE, {
        sessionId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: "agent_request",
      });

      setLeadInfo({
        name: data.name,
        email: data.email,
        phone: data.phone,
        collected: true,
      });
      setShowLeadForm(false);

      // Update saved session
      const saved = loadSession();
      if (saved) {
        saveSession({
          ...saved,
          leadCollected: true,
          leadName: data.name,
          leadEmail: data.email,
          leadPhone: data.phone,
        });
      }
    },
    [sessionId]
  );

  const skipLeadForm = useCallback(() => {
    setLeadFormSkipped(true);
    setShowLeadForm(false);
  }, []);

  const submitOfflineForm = useCallback(
    (data: { name?: string; email: string; phone?: string; message: string }) => {
      if (!socketRef.current || !isSocketConnected) return;

      // Start a chat request with the visitor info
      pendingMessageRef.current = data.message;
      setWidgetState("OFFLINE_REPLY");

      // Store lead info
      setLeadInfo({
        name: data.name,
        email: data.email,
        phone: data.phone,
        collected: true,
      });

      // Add the message to UI immediately
      setMessages([
        {
          id: `temp_${Date.now()}`,
          content: data.message,
          senderId: visitorId,
          senderName: data.name || "You",
          senderType: "VISITOR",
          createdAt: new Date(),
        },
      ]);

      // Send chat request with visitor info (including phone)
      socketRef.current.emit(CHAT_EVENTS.REQUEST, {
        visitorId,
        visitorName: data.name || "Visitor",
        visitorEmail: data.email,
        visitorPhone: data.phone,
      });
    },
    [visitorId, isSocketConnected]
  );

  // ─── Handle form submit ───────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const value = inputValue.trim();
    setInputValue("");

    // First message - start a chat session
    if (widgetState === "IDLE") {
      // Add the message to UI immediately
      setMessages([
        {
          id: `temp_${Date.now()}`,
          content: value,
          senderId: visitorId,
          senderName: "You",
          senderType: "VISITOR",
          createdAt: new Date(),
        },
      ]);
      startChat(value);
      return;
    }

    // Active chat or offline reply - send message directly
    if (
      (widgetState === "ACTIVE_CHAT" || widgetState === "OFFLINE_REPLY") &&
      sessionId
    ) {
      sendMessage(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (widgetState === "ACTIVE_CHAT") sendTyping();
  };

  const resetChat = () => {
    setWidgetState("IDLE");
    setMessages([]);
    setSessionId(null);
    setAgentName(null);
    pendingMessageRef.current = null;
    setLeadInfo({ collected: false });
    setShowLeadForm(false);
    setLeadFormSkipped(false);
    clearSession();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!enabled) return null;

  const isRight = position === "bottom-right";
  const canType =
    widgetState === "IDLE" ||
    widgetState === "ACTIVE_CHAT" ||
    widgetState === "OFFLINE_REPLY";
  const showInputArea = widgetState !== "OFFLINE_FORM";

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className={`fixed bottom-5 ${isRight ? "right-5" : "left-5"}`}
    >
      {/* Chat Window */}
      <div
        className={`
          mb-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl
          transition-all duration-300 ease-out origin-bottom
          ${
            isOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none h-0"
          }
          ${isOpen ? "w-[calc(100vw-40px)] sm:w-95" : "w-0 sm:w-95"}
        `}
        style={{
          maxHeight: isOpen ? "min(600px, calc(100vh - 100px))" : "0px",
          boxShadow: isOpen ? "0 8px 32px rgba(0, 0, 0, 0.15)" : "none",
        }}
        role="dialog"
        aria-label="Live chat support"
        aria-modal="false"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${
                  agentsOnline
                    ? "border-white bg-green-400"
                    : "border-white bg-yellow-400"
                }`}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                Live Support
              </h3>
              <p className="text-xs leading-tight opacity-80">
                {widgetState === "ACTIVE_CHAT" && agentName
                  ? `Chatting with ${agentName}`
                  : widgetState === "CONNECTING"
                  ? "Connecting..."
                  : widgetState === "OFFLINE_FORM" || widgetState === "OFFLINE_REPLY"
                  ? "Leave us a message"
                  : agentsOnline
                  ? replyTimeMessage
                  : "Leave us a message"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 transition-colors hover:bg-white/20"
            aria-label="Close chat"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto bg-white p-4 space-y-2"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          style={{ minHeight: "320px", maxHeight: "420px" }}
        >
          {/* OFFLINE_FORM: Pre-chat form when agents are offline */}
          {widgetState === "OFFLINE_FORM" && (
            <OfflinePreChatForm
              primaryColor={primaryColor}
              offlineFormMessage={offlineFormMessage}
              onSubmit={submitOfflineForm}
            />
          )}

          {/* IDLE: Welcome message */}
          {widgetState === "IDLE" && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={primaryColor}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">
                {welcomeMessage}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Type a message below to start chatting
              </p>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) =>
            msg.senderType === "SYSTEM" ? (
              <SystemMessage key={msg.id} text={msg.content} />
            ) : (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.senderType === "VISITOR"
                    ? "ml-auto rounded-br-sm text-white"
                    : "mr-auto rounded-bl-sm bg-gray-100 text-gray-800"
                }`}
                style={
                  msg.senderType === "VISITOR"
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                {msg.senderType !== "VISITOR" && (
                  <p className="mb-0.5 text-xs font-medium text-gray-400">
                    {msg.senderName}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            )
          )}

          {/* CONNECTING: Dots + message */}
          {widgetState === "CONNECTING" && (
            <div className="text-center">
              <ConnectingDots color={primaryColor} />
              <p className="text-xs text-gray-400">{connectingMessage}</p>
              <p className="mt-0.5 text-xs text-gray-300">
                {replyTimeMessage}
              </p>
            </div>
          )}

          {/* OFFLINE_REPLY: Away card */}
          {widgetState === "OFFLINE_REPLY" && (
            <OfflineCard
              message={offlineMessage}
              replyTime={offlineReplyTimeMessage}
            />
          )}

          {/* Lead Collection Form (agent-triggered, inline in timeline) */}
          {showLeadForm && !leadFormSkipped && !leadInfo.collected && (
            <LeadCollectionForm
              primaryColor={primaryColor}
              onSubmit={submitLeadInfo}
              onSkip={skipLeadForm}
              initialData={leadInfo}
            />
          )}

          {/* Offline reply: confirmation after lead info collected */}
          {widgetState === "OFFLINE_REPLY" && leadInfo.collected && (
            <SystemMessage
              text={
                leadInfo.email
                  ? `Your messages are saved. We'll get back to you at ${leadInfo.email}.`
                  : "Your messages are saved. We'll respond as soon as we're back."
              }
            />
          )}

          {/* Typing indicator */}
          {typingUser && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-sm">
              <span className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
              <span className="text-xs text-gray-400">
                {typingUser} is typing
              </span>
            </div>
          )}

          {/* ENDED: actions */}
          {widgetState === "ENDED" && (
            <div className="py-2 text-center">
              <button
                onClick={resetChat}
                className="text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Start a new conversation
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (hidden during OFFLINE_FORM - form replaces entire body) */}
        {showInputArea && <form onSubmit={handleSubmit} className="border-t bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                widgetState === "ENDED"
                  ? "Chat ended"
                  : widgetState === "CONNECTING"
                  ? "Waiting for agent..."
                  : "Type your message..."
              }
              disabled={widgetState === "ENDED" || widgetState === "CONNECTING"}
              aria-label="Type your message"
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400"
              style={
                { "--tw-ring-color": primaryColor } as React.CSSProperties
              }
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !canType}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: primaryColor }}
              aria-label="Send message"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>}
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex h-15 w-15 items-center justify-center rounded-full text-white shadow-lg
          transition-all duration-200 ease-out hover:scale-110 hover:shadow-xl
          active:scale-95
          ${isRight ? "ml-auto" : "mr-auto"}
        `}
        style={{
          backgroundColor: primaryColor,
          boxShadow: `0 4px 12px ${primaryColor}40`,
        }}
        aria-label={
          isOpen
            ? "Close chat"
            : unreadCount > 0
            ? `Open chat - ${unreadCount} unread messages`
            : "Open live chat"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Icon transition */}
        <span
          className={`absolute transition-all duration-200 ${
            isOpen
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          }`}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <span
          className={`absolute transition-all duration-200 ${
            isOpen
              ? "-rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        >
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </span>

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
