"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle,
  Send,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Info,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Inbox,
  PhoneOff,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";

// Socket event constants (must match server)
const CHAT_EVENTS = {
  REQUEST: "chat:request",
  ACCEPT: "chat:accept",
  MESSAGE: "chat:message",
  TYPING: "chat:typing",
  END: "chat:end",
  QUEUE_UPDATE: "chat:queue_update",
  COLLECT_INFO: "chat:collect_info",
  LEAD_UPDATE: "chat:lead_update",
  INFO_COLLECTED: "chat:info_collected",
};

const AUTH_EVENTS = {
  AUTHENTICATE: "auth:authenticate",
  AUTHENTICATED: "auth:authenticated",
  AUTH_ERROR: "auth:error",
};

const PRESENCE_EVENTS = {
  ONLINE: "presence:online",
  OFFLINE: "presence:offline",
};

interface ChatSession {
  id: string;
  ticketId?: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  agentName?: string;
  status: "WAITING" | "ACTIVE" | "ENDED";
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  infoRequested?: boolean;
  infoCollected?: boolean;
}

interface ChatMessage {
  id: string;
  sessionId?: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "VISITOR" | "AGENT" | "SYSTEM";
  createdAt: string | Date;
}

interface LiveChatDashboardClientProps {
  pluginName?: string;
  tier?: string | null;
  features: string[];
  hasChatFeature: boolean;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export function LiveChatDashboardClient({
  tier,
  hasChatFeature,
  currentUser,
}: LiveChatDashboardClientProps) {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [message, setMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "WAITING" | "ENDED">("all");
  const [onlineAgents, setOnlineAgents] = useState(0);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;
  const selectedMessages = selectedSessionId ? messages.get(selectedSessionId) || [] : [];

  // Socket URL
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

  // Connect to Socket.io server
  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Authenticate as agent
      socket.emit(AUTH_EVENTS.AUTHENTICATE, {
        userId: currentUser.id,
        name: currentUser.name,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsAuthenticated(false);
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
    });

    // Auth response
    socket.on(AUTH_EVENTS.AUTHENTICATED, () => {
      setIsAuthenticated(true);
      toast.success("Connected to chat server");
    });

    socket.on(AUTH_EVENTS.AUTH_ERROR, (data: { message: string }) => {
      toast.error(`Auth failed: ${data.message}`);
    });

    // Queue updates
    socket.on(
      CHAT_EVENTS.QUEUE_UPDATE,
      (data: {
        type: "sync" | "new" | "accepted" | "ended" | "email_updated" | "lead_updated";
        email?: string;
        name?: string;
        phone?: string;
        session?: {
          id: string;
          ticketId?: string;
          visitorName: string;
          visitorEmail?: string;
          visitorPhone?: string;
          createdAt: string;
        };
        sessions?: Array<{
          id: string;
          ticketId?: string;
          visitorName: string;
          visitorEmail?: string;
          visitorPhone?: string;
          createdAt: string;
        }>;
        activeChats?: Array<{
          id: string;
          ticketId?: string;
          visitorName: string;
          visitorEmail?: string;
          visitorPhone?: string;
          agentName?: string;
          createdAt: string;
        }>;
        sessionId?: string;
        agentId?: string;
        agentName?: string;
      }) => {
        if (data.type === "sync") {
          // Full sync of waiting + active chats
          const waitingList: ChatSession[] = (data.sessions || []).map((s) => ({
            id: s.id,
            ticketId: s.ticketId,
            visitorName: s.visitorName,
            visitorEmail: s.visitorEmail,
            visitorPhone: s.visitorPhone,
            status: "WAITING" as const,
            unreadCount: 1,
            createdAt: s.createdAt,
          }));
          const activeList: ChatSession[] = (data.activeChats || []).map((s) => ({
            id: s.id,
            ticketId: s.ticketId,
            visitorName: s.visitorName,
            visitorEmail: s.visitorEmail,
            visitorPhone: s.visitorPhone,
            agentName: s.agentName,
            status: "ACTIVE" as const,
            unreadCount: 0,
            createdAt: s.createdAt,
          }));
          setSessions([...activeList, ...waitingList]);
        }

        if (data.type === "new" && data.session) {
          const newSession: ChatSession = {
            id: data.session.id,
            ticketId: data.session.ticketId,
            visitorName: data.session.visitorName,
            visitorEmail: data.session.visitorEmail,
            visitorPhone: data.session.visitorPhone,
            status: "WAITING",
            unreadCount: 1,
            createdAt: data.session.createdAt,
          };
          setSessions((prev) => {
            // Avoid duplicates
            if (prev.find((s) => s.id === newSession.id)) return prev;
            return [newSession, ...prev];
          });
          toast.info(`New chat from ${data.session.visitorName}`, {
            description: "Click to accept",
          });
        }

        if (data.type === "accepted" && data.sessionId) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.sessionId
                ? { ...s, status: "ACTIVE" as const, agentName: data.agentName }
                : s
            )
          );
        }

        if (data.type === "ended" && data.sessionId) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.sessionId
                ? { ...s, status: "ENDED" as const }
                : s
            )
          );
        }

        if (data.type === "email_updated" && data.sessionId && data.email) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.sessionId
                ? { ...s, visitorEmail: data.email }
                : s
            )
          );
        }

        if (data.type === "lead_updated" && data.sessionId) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.sessionId
                ? {
                    ...s,
                    visitorName: data.name || s.visitorName,
                    visitorEmail: data.email || s.visitorEmail,
                    visitorPhone: data.phone || s.visitorPhone,
                    infoCollected: true,
                  }
                : s
            )
          );
        }
      }
    );

    // Chat accepted (when THIS agent accepts)
    socket.on(
      CHAT_EVENTS.ACCEPT,
      (data: {
        session: { id: string; status: string };
        agent: { id: string; name: string };
      }) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === data.session.id
              ? { ...s, status: "ACTIVE" as const, agentName: data.agent.name }
              : s
          )
        );
      }
    );

    // Chat messages - handled by session-specific useEffect below
    // (do NOT add a handler here to avoid duplicate messages)

    // Typing indicators
    socket.on(
      CHAT_EVENTS.TYPING,
      (data: { sessionId: string; userName: string }) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.sessionId, data.userName);
          return newMap;
        });
        // Clear after 3s
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.sessionId);
            return newMap;
          });
        }, 3000);
      }
    );

    // Chat ended
    socket.on(CHAT_EVENTS.END, (data: { sessionId: string }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === data.sessionId
            ? { ...s, status: "ENDED" as const }
            : s
        )
      );
    });

    // Presence
    socket.on(
      PRESENCE_EVENTS.ONLINE,
      (data: { agentCount: number }) => {
        setOnlineAgents(data.agentCount);
      }
    );

    socket.on(
      PRESENCE_EVENTS.OFFLINE,
      (data: { agentCount: number }) => {
        setOnlineAgents(data.agentCount);
      }
    );

    // Lead info collected (visitor submitted the form)
    socket.on(
      CHAT_EVENTS.INFO_COLLECTED,
      (data: { sessionId: string; name?: string; email?: string; phone?: string }) => {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === data.sessionId
              ? {
                  ...s,
                  visitorName: data.name || s.visitorName,
                  visitorEmail: data.email || s.visitorEmail,
                  visitorPhone: data.phone || s.visitorPhone,
                  infoCollected: true,
                }
              : s
          )
        );
        toast.success("Visitor shared their contact info");
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [socketUrl, currentUser.id, currentUser.name]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages]);

  // Handle message routing - when we receive messages, route them to the correct session
  const addMessageToSession = useCallback(
    (sessionId: string, msg: ChatMessage) => {
      setMessages((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(sessionId) || [];

        // Check exact ID match
        if (existing.find((m) => m.id === msg.id)) return prev;

        // Check for temp message with same content (optimistic add vs server echo)
        const tempIndex = existing.findIndex(
          (m) => m.id.startsWith("temp_") && m.content === msg.content && m.senderType === msg.senderType
        );
        if (tempIndex !== -1) {
          // Replace temp message with real server message
          const updated = [...existing];
          updated[tempIndex] = msg;
          newMap.set(sessionId, updated);
          return newMap;
        }

        newMap.set(sessionId, [...existing, msg]);
        return newMap;
      });
    },
    []
  );

  // Message handler - routes messages by sessionId from payload
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      // Use sessionId from payload if available, fallback to selectedSessionId
      const targetSessionId = msg.sessionId || selectedSessionId;
      if (targetSessionId) {
        addMessageToSession(targetSessionId, msg);
      }

      // Update session list
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              lastMessage: msg.content,
              lastMessageAt:
                typeof msg.createdAt === "string"
                  ? msg.createdAt
                  : new Date(msg.createdAt).toISOString(),
              unreadCount:
                msg.senderType === "VISITOR" && s.id !== selectedSessionId
                  ? s.unreadCount + 1
                  : s.unreadCount,
            };
          }
          return s;
        })
      );
    };

    socket.off(CHAT_EVENTS.MESSAGE);
    socket.on(CHAT_EVENTS.MESSAGE, handleMessage);

    return () => {
      socket.off(CHAT_EVENTS.MESSAGE, handleMessage);
    };
  }, [selectedSessionId, addMessageToSession]);

  // Fetch historical messages from DB for a session
  const loadHistoricalMessages = useCallback(
    async (sessionId: string, ticketId: string) => {
      try {
        const res = await fetch(`/api/admin/tickets/${ticketId}/messages`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.messages?.length) return;

        const mapped: ChatMessage[] = data.messages
          .filter((m: { type?: string }) => m.type !== "SYSTEM")
          .map((m: { id: string; content: string; senderId?: string; senderName: string; senderType: string; createdAt: string }) => ({
            id: m.id,
            sessionId,
            content: m.content,
            senderId: m.senderId || "system",
            senderName: m.senderName,
            senderType:
              m.senderType === "CUSTOMER"
                ? "VISITOR"
                : m.senderType === "AGENT"
                ? "AGENT"
                : "SYSTEM",
            createdAt: m.createdAt,
          }));

        setMessages((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(sessionId) || [];
          // Merge: keep existing messages that aren't in DB (temp/optimistic), add DB messages
          const dbIds = new Set(mapped.map((m: ChatMessage) => m.id));
          const kept = existing.filter((m) => m.id.startsWith("temp_") || !dbIds.has(m.id));
          newMap.set(sessionId, [...mapped, ...kept]);
          return newMap;
        });
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    },
    []
  );

  // Accept a waiting chat
  const handleAcceptChat = useCallback(
    (sessionId: string) => {
      if (!socketRef.current || !isAuthenticated) return;
      socketRef.current.emit(CHAT_EVENTS.ACCEPT, { sessionId });

      // Join the chat room by selecting it
      setSelectedSessionId(sessionId);

      // Initialize messages array for this session
      setMessages((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(sessionId)) {
          newMap.set(sessionId, []);
        }
        return newMap;
      });

      // Clear unread
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, unreadCount: 0 } : s
        )
      );

      // Load existing messages from DB
      const session = sessions.find((s) => s.id === sessionId);
      if (session?.ticketId) {
        loadHistoricalMessages(sessionId, session.ticketId);
      }
    },
    [isAuthenticated, sessions, loadHistoricalMessages]
  );

  // Send a message
  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !selectedSessionId || !socketRef.current) return;

    socketRef.current.emit(CHAT_EVENTS.MESSAGE, {
      sessionId: selectedSessionId,
      content: message.trim(),
    });

    // Optimistic add
    const newMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      content: message.trim(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderType: "AGENT",
      createdAt: new Date().toISOString(),
    };

    addMessageToSession(selectedSessionId, newMsg);
    setMessage("");
  }, [message, selectedSessionId, currentUser, addMessageToSession]);

  // Send typing indicator
  const handleTyping = useCallback(() => {
    if (!socketRef.current || !selectedSessionId) return;
    socketRef.current.emit(CHAT_EVENTS.TYPING, {
      sessionId: selectedSessionId,
    });
  }, [selectedSessionId]);

  // End a chat
  const handleEndChat = useCallback(() => {
    if (!socketRef.current || !selectedSessionId) return;
    socketRef.current.emit(CHAT_EVENTS.END, {
      sessionId: selectedSessionId,
    });
    toast.success("Chat ended");
  }, [selectedSessionId]);

  // Trigger lead collection form on visitor's widget
  const handleCollectInfo = useCallback(() => {
    if (!socketRef.current || !selectedSessionId || !isAuthenticated) return;
    socketRef.current.emit(CHAT_EVENTS.COLLECT_INFO, {
      sessionId: selectedSessionId,
    });
    // Mark as requested in the session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId ? { ...s, infoRequested: true } : s
      )
    );
    toast.info("Info request sent to visitor");
  }, [selectedSessionId, isAuthenticated]);

  // Select a session
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setSelectedSessionId(sessionId);

      // Initialize messages for this session if not exists
      setMessages((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(sessionId)) {
          newMap.set(sessionId, []);
        }
        return newMap;
      });

      // Clear unread
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, unreadCount: 0 } : s
        )
      );

      // If session is waiting, auto-accept
      const session = sessions.find((s) => s.id === sessionId);
      if (session?.status === "WAITING") {
        handleAcceptChat(sessionId);
      }

      // Load historical messages from DB if session has a ticketId
      if (session?.ticketId) {
        loadHistoricalMessages(sessionId, session.ticketId);
      }
    },
    [sessions, handleAcceptChat, loadHistoricalMessages]
  );

  // Reconnect
  const handleReconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current?.connect();
  }, []);

  // Helpers
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000)
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (statusFilter !== "all" && session.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.visitorName.toLowerCase().includes(query) ||
        session.visitorEmail?.toLowerCase().includes(query) ||
        session.lastMessage?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeSessions = sessions.filter((s) => s.status === "ACTIVE").length;
  const waitingSessions = sessions.filter((s) => s.status === "WAITING").length;

  // Feature not available
  if (!hasChatFeature) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Live Chat
            </h1>
            <p className="text-muted-foreground">Real-time customer support</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Feature Not Available</AlertTitle>
          <AlertDescription>
            Live Chat is not included in your current license tier (
            {tier || "Free"}). Please upgrade to access this feature.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Upgrade your LiveSupport Pro license to access real-time chat
              features.
            </p>
            <Button asChild>
              <Link href="/admin/settings/plugins">Manage License</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Live Chat
            {tier && (
              <Badge variant="outline" className="ml-2">
                {tier}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {activeSessions} active, {waitingSessions} waiting
            {onlineAgents > 0 && ` · ${onlineAgents} agents online`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isConnected && isAuthenticated ? "default" : "destructive"}
            className="gap-1"
          >
            <Circle
              className={`h-2 w-2 ${
                isConnected && isAuthenticated
                  ? "fill-green-500"
                  : "fill-red-500"
              }`}
            />
            {isConnected && isAuthenticated
              ? "Connected"
              : isConnected
              ? "Authenticating..."
              : "Disconnected"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleReconnect}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Not connected warning */}
      {!isConnected && (
        <Alert variant="destructive">
          <PhoneOff className="h-4 w-4" />
          <AlertTitle>Chat Server Disconnected</AlertTitle>
          <AlertDescription>
            Cannot connect to the chat server. Make sure the chat server is
            running on port {process.env.NEXT_PUBLIC_SOCKET_URL || "3001"}.
            <br />
            Run <code className="text-xs bg-muted px-1 py-0.5 rounded">npm run dev:chat</code> in a
            separate terminal.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Chat Interface */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)] min-h-125">
        {/* Sessions List */}
        <Card className="col-span-4 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search chats..."
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Chats
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("WAITING")}>
                    Waiting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("ENDED")}>
                    Ended
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4 space-y-2">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {isConnected
                      ? "No chats yet. Waiting for visitors..."
                      : "Connect to see chats"}
                  </p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSessionId === session.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getInitials(session.visitorName)}
                          </AvatarFallback>
                        </Avatar>
                        {session.status === "ACTIVE" && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                        )}
                        {session.status === "WAITING" && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-amber-500 border-2 border-background animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate text-sm">
                            {session.visitorName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(session.createdAt)}
                          </span>
                        </div>
                        {(session.visitorEmail || session.visitorPhone) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {session.visitorEmail || ""}
                            {session.visitorEmail && session.visitorPhone && " · "}
                            {session.visitorPhone || ""}
                          </p>
                        )}
                        {session.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {session.lastMessage}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              session.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : session.status === "WAITING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {session.status === "WAITING"
                              ? "Waiting"
                              : session.status === "ACTIVE"
                              ? "Active"
                              : "Ended"}
                          </Badge>
                          {session.status === "WAITING" && (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-6 text-xs px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptChat(session.id);
                              }}
                            >
                              Accept
                            </Button>
                          )}
                          {session.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 w-5 p-0 justify-center"
                            >
                              {session.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className="col-span-8 flex flex-col">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(selectedSession.visitorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {selectedSession.visitorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSession.visitorEmail || "No email provided"}
                        {selectedSession.visitorPhone && (
                          <span className="ml-1">
                            · {selectedSession.visitorPhone}
                          </span>
                        )}
                        {selectedSession.status === "ACTIVE" && (
                          <span className="ml-2 text-green-600">
                            · Live
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedSession.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCollectInfo}
                        disabled={!!selectedSession.infoCollected}
                        className={
                          selectedSession.infoCollected
                            ? "text-green-600 border-green-200 hover:bg-green-50"
                            : ""
                        }
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        {selectedSession.infoCollected
                          ? "Info Collected"
                          : "Collect Info"}
                      </Button>
                    )}
                    {selectedSession.ticketId && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/tickets/${selectedSession.ticketId}`}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Ticket
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {selectedSession.ticketId && (
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/tickets/${selectedSession.ticketId}`}
                            >
                              View Ticket
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {selectedSession.status === "ACTIVE" && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={handleEndChat}
                          >
                            End Chat
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {selectedMessages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {selectedSession.status === "WAITING"
                          ? "Accept this chat to start messaging"
                          : "No messages yet"}
                      </p>
                    </div>
                  )}

                  {selectedMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === "AGENT"
                          ? "justify-end"
                          : msg.senderType === "SYSTEM"
                          ? "justify-center"
                          : "justify-start"
                      }`}
                    >
                      {msg.senderType === "SYSTEM" ? (
                        <div className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                          {msg.content}
                        </div>
                      ) : (
                        <div className="flex gap-2 max-w-[70%]">
                          {msg.senderType === "VISITOR" && (
                            <Avatar className="h-7 w-7 mt-1 shrink-0">
                              <AvatarFallback className="text-xs">
                                {getInitials(msg.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`rounded-lg px-3.5 py-2 ${
                              msg.senderType === "AGENT"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.senderType === "VISITOR" && (
                              <p className="text-xs font-medium opacity-70 mb-0.5">
                                {msg.senderName}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <p className="text-xs opacity-60 mt-1 text-right">
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {selectedSessionId &&
                    typingUsers.has(selectedSessionId) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="flex gap-1 bg-muted rounded-lg px-3 py-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                        <span className="text-xs">
                          {typingUsers.get(selectedSessionId)} is typing...
                        </span>
                      </div>
                    )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              {selectedSession.status === "ACTIVE" && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type a message..."
                      className="min-h-11 max-h-30 resize-none"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="icon"
                      className="h-11 w-11"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedSession.status === "WAITING" && (
                <div className="p-4 border-t bg-amber-50 text-center">
                  <p className="text-sm text-amber-700 mb-2">
                    This visitor is waiting for an agent
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptChat(selectedSession.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept Chat
                  </Button>
                </div>
              )}

              {selectedSession.status === "ENDED" && (
                <div className="p-4 border-t bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    This chat has ended
                    {selectedSession.ticketId && (
                      <>
                        {" · "}
                        <Link
                          href={`/admin/tickets/${selectedSession.ticketId}`}
                          className="text-primary hover:underline"
                        >
                          View ticket
                        </Link>
                      </>
                    )}
                  </p>
                </div>
              )}
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
              <p className="text-muted-foreground text-center max-w-md text-sm">
                {sessions.length > 0
                  ? "Select a conversation from the list to start chatting"
                  : isConnected
                  ? "Waiting for visitors to start a chat..."
                  : "Connect to the chat server to see conversations"}
              </p>
              {!isConnected && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Run in a separate terminal:
                  </p>
                  <code className="text-xs bg-muted px-3 py-1.5 rounded">
                    npm run dev:chat
                  </code>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
