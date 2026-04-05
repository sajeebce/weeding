"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Send,
  Archive,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Zap,
  Plus,
  Trash2,
  X,
  Users,
  DollarSign,
  MapPin,
} from "lucide-react";

interface ConversationSummary {
  id: string;
  guestName: string;
  guestEmail: string;
  status: "ACTIVE" | "ARCHIVED" | "SPAM";
  lastMessageAt: string;
  unreadCount: number;
  totalMessages: number;
  inquiry: { eventType: string; eventDate: string | null; budget: string | null } | null;
}

interface Message {
  id: string;
  senderRole: "VENDOR" | "GUEST";
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  guestName: string;
  guestEmail: string;
  status: string;
  lastMessageAt: string;
  messages: Message[];
  inquiry: {
    eventType: string;
    eventDate: string | null;
    budget: string | null;
    message: string;
  } | null;
  project: {
    brideName: string | null;
    groomName: string | null;
    eventDate: string | null;
    budgetGoal: number;
    eventVenues: { type: string; venueName: string | null; city: string | null; country: string | null }[];
    guests: { id: string }[];
  } | null;
}

interface QuickReply {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
}

type StatusFilter = "ACTIVE" | "ARCHIVED" | "ALL";

export default function VendorMessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ConversationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showQRManager, setShowQRManager] = useState(false);
  const [newQRTitle, setNewQRTitle] = useState("");
  const [newQRContent, setNewQRContent] = useState("");
  const [savingQR, setSavingQR] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadList = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/vendor/conversations?status=${statusFilter === "ALL" ? "ALL" : statusFilter}&page=1`
      );
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } finally {
      setLoadingList(false);
    }
  }, [statusFilter]);

  const loadThread = useCallback(async (id: string) => {
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/vendor/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data.conversation);
        // Update unread count in list
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        );
      }
    } finally {
      setLoadingThread(false);
    }
  }, []);

  const loadQuickReplies = useCallback(async () => {
    const res = await fetch("/api/vendor/quick-replies");
    if (res.ok) {
      const data = await res.json();
      setQuickReplies(data.replies || []);
    }
  }, []);

  useEffect(() => {
    setLoadingList(true);
    loadList();
    loadQuickReplies();
  }, [loadList, loadQuickReplies]);

  useEffect(() => {
    if (!selectedId) return;
    loadThread(selectedId);
    // Poll for new messages every 15s
    pollRef.current = setInterval(() => loadThread(selectedId), 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  async function sendMessage() {
    if (!selectedId || !messageText.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/vendor/conversations/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText.trim() }),
      });
      if (res.ok) {
        setMessageText("");
        await loadThread(selectedId);
        loadList();
      }
    } finally {
      setSending(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/vendor/conversations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (selectedId === id) setSelectedId(null);
    loadList();
  }

  async function saveQuickReply() {
    if (!newQRTitle.trim() || !newQRContent.trim()) return;
    setSavingQR(true);
    try {
      const res = await fetch("/api/vendor/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newQRTitle.trim(), content: newQRContent.trim() }),
      });
      if (res.ok) {
        setNewQRTitle("");
        setNewQRContent("");
        loadQuickReplies();
      }
    } finally {
      setSavingQR(false);
    }
  }

  async function deleteQuickReply(id: string) {
    await fetch(`/api/vendor/quick-replies/${id}`, { method: "DELETE" });
    loadQuickReplies();
  }

  function applyQuickReply(content: string) {
    setMessageText(content);
    setShowQuickReplies(false);
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 7 * 86_400_000) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const FILTERS: { label: string; value: StatusFilter }[] = [
    { label: "Active", value: "ACTIVE" },
    { label: "Archived", value: "ARCHIVED" },
    { label: "All", value: "ALL" },
  ];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Conversations with potential clients</p>
        </div>
        <button
          onClick={() => setShowQRManager(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Quick Replies
        </button>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Conversation list */}
        <div className={`flex flex-col bg-white rounded-xl border border-gray-200 ${selectedId ? "hidden lg:flex lg:w-80" : "w-full lg:w-80"}`}>
          {/* Filter tabs */}
          <div className="flex border-b border-gray-100 px-3 py-2 gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setSelectedId(null); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-purple-600 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {loadingList ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Conversations are created automatically when guests submit inquiries
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedId === conv.id ? "bg-purple-50 border-l-2 border-purple-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-purple-600">
                            {conv.guestName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {conv.guestName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto shrink-0 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.inquiry && (
                        <p className="text-xs text-gray-400 mt-0.5 ml-9">{conv.inquiry.eventType}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatTime(conv.lastMessageAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread panel */}
        {selectedId ? (
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 min-w-0">
            {loadingThread && !thread ? (
              <div className="flex items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
              </div>
            ) : thread ? (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">
                      {thread.guestName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{thread.guestName}</p>
                    <p className="text-xs text-gray-500">{thread.guestEmail}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {thread.status === "ACTIVE" && (
                      <button
                        onClick={() => updateStatus(thread.id, "ARCHIVED")}
                        className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    {thread.status === "ARCHIVED" && (
                      <button
                        onClick={() => updateStatus(thread.id, "ACTIVE")}
                        className="px-2 py-1 text-xs text-purple-600 border border-purple-200 rounded hover:bg-purple-50"
                      >
                        Restore
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(thread.id, "SPAM")}
                      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Mark as spam"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Event context card — project data if linked, else inquiry fallback */}
                {(thread.project || thread.inquiry) && (() => {
                  const p = thread.project;
                  if (p) {
                    const ceremony = p.eventVenues.find((v) => v.type === "CEREMONY");
                    const reception = p.eventVenues.find((v) => v.type === "RECEPTION");
                    const coupleName =
                      p.brideName && p.groomName
                        ? `${p.brideName} & ${p.groomName}`
                        : p.brideName || p.groomName || "Couple";
                    return (
                      <div className="mx-4 mt-3 mb-1 bg-purple-50 border border-purple-100 rounded-lg px-4 py-2.5">
                        <p className="text-xs font-semibold text-purple-700 mb-1.5">{coupleName}&apos;s Event</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-purple-800">
                          {p.eventDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 shrink-0" />
                              {new Date(p.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {p.guests.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 shrink-0" />
                              ~{p.guests.length} guests
                            </span>
                          )}
                          {p.budgetGoal > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 shrink-0" />
                              ${p.budgetGoal.toLocaleString()} budget
                            </span>
                          )}
                          {ceremony?.venueName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {ceremony.venueName}{ceremony.city ? `, ${ceremony.city}` : ""}
                            </span>
                          )}
                          {reception?.venueName && !ceremony?.venueName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {reception.venueName}{reception.city ? `, ${reception.city}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return thread.inquiry ? (
                    <div className="mx-4 mt-3 mb-1 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                      <p className="text-xs font-medium text-blue-600 mb-1">Inquiry Details</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-800">
                        <span>Event: <strong>{thread.inquiry.eventType}</strong></span>
                        {thread.inquiry.eventDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(thread.inquiry.eventDate).toLocaleDateString()}
                          </span>
                        )}
                        {thread.inquiry.budget && (
                          <span>Budget: <strong>{thread.inquiry.budget}</strong></span>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {thread.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderRole === "VENDOR" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.senderRole === "VENDOR"
                            ? "bg-purple-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.senderRole === "VENDOR" ? "text-purple-200" : "text-gray-400"}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compose */}
                {thread.status !== "SPAM" && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    {/* Quick replies toggle */}
                    {quickReplies.length > 0 && (
                      <div className="mb-2">
                        <button
                          onClick={() => setShowQuickReplies(!showQuickReplies)}
                          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                        >
                          <Zap className="w-3 h-3" />
                          Quick replies
                        </button>
                        {showQuickReplies && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {quickReplies.map((qr) => (
                              <button
                                key={qr.id}
                                onClick={() => applyQuickReply(qr.content)}
                                className="px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs text-purple-700 hover:bg-purple-100 transition-colors"
                              >
                                {qr.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        rows={2}
                        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                        className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || !messageText.trim()}
                        className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                {thread.status === "SPAM" && (
                  <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-400">
                    This conversation has been marked as spam.
                    <button onClick={() => updateStatus(thread.id, "ACTIVE")} className="ml-1 text-purple-600 underline">
                      Restore
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        ) : (
          <div className="flex-1 hidden lg:flex items-center justify-center bg-white rounded-xl border border-gray-200 border-dashed">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Select a conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Reply Manager Modal */}
      {showQRManager && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQRManager(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Quick Replies</h2>
              <button onClick={() => setShowQRManager(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing replies */}
            {quickReplies.length > 0 && (
              <div className="space-y-2 mb-4">
                {quickReplies.map((qr) => (
                  <div key={qr.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700">{qr.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{qr.content}</p>
                    </div>
                    <button
                      onClick={() => deleteQuickReply(qr.id)}
                      className="p-1 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-xs font-medium text-gray-700">Add new quick reply</p>
              <input
                value={newQRTitle}
                onChange={(e) => setNewQRTitle(e.target.value)}
                placeholder="Title (e.g. Pricing Info)"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <textarea
                value={newQRContent}
                onChange={(e) => setNewQRContent(e.target.value)}
                rows={3}
                placeholder="Message content…"
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={saveQuickReply}
                disabled={savingQR || !newQRTitle.trim() || !newQRContent.trim()}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {savingQR ? "Saving…" : "Add Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
