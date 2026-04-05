"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { Send, ArrowLeft, Calendar, Store, Users, MapPin, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface Message {
  id: string;
  senderRole: "VENDOR" | "GUEST";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  guestName: string;
  guestEmail: string;
  status: string;
  lastMessageAt: string;
  messages: Message[];
  vendor: {
    businessName: string;
    category: string;
    city: string | null;
    country: string;
    photos: string[];
  };
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

function ProjectContextRows({
  project,
}: {
  project: {
    brideName: string | null;
    groomName: string | null;
    eventDate: string | null;
    budgetGoal: number;
    eventVenues: { type: string; venueName: string | null; city: string | null; country: string | null }[];
    guests: { id: string }[];
  };
}) {
  const ceremony = project.eventVenues.find((v) => v.type === "CEREMONY");
  const reception = project.eventVenues.find((v) => v.type === "RECEPTION");

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-purple-800">
      {project.eventDate && (
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 shrink-0" />
          {new Date(project.eventDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      )}
      {project.guests.length > 0 && (
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 shrink-0" />
          ~{project.guests.length} guests
        </span>
      )}
      {project.budgetGoal > 0 && (
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 shrink-0" />
          Budget: ${project.budgetGoal.toLocaleString()}
        </span>
      )}
      {ceremony?.venueName && (
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          Ceremony: {ceremony.venueName}
          {ceremony.city ? `, ${ceremony.city}` : ""}
        </span>
      )}
      {reception?.venueName && (
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 shrink-0" />
          Reception: {reception.venueName}
          {reception.city ? `, ${reception.city}` : ""}
        </span>
      )}
    </div>
  );
}

export default function GuestConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [briefExpanded, setBriefExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadConversation() {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversation();
    // Poll every 20s for vendor replies
    pollRef.current = setInterval(loadConversation, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageText.trim() }),
      });
      if (res.ok) {
        setMessageText("");
        await loadConversation();
      } else {
        const data = await res.json();
        setSendError(data.error || "Failed to send message");
      }
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (notFound || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">Conversation not found</p>
          <p className="text-sm text-gray-500 mt-1">This link may be invalid or the conversation has been removed.</p>
          <Link href="/vendors" className="inline-flex items-center gap-1 mt-4 text-sm text-purple-600 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Browse vendors
          </Link>
        </div>
      </div>
    );
  }

  const v = conversation.vendor;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/vendors" className="p-1.5 rounded text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          {v.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.photos[0]} alt={v.businessName} className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Store className="w-4 h-4 text-purple-600" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{v.businessName}</p>
            <p className="text-xs text-gray-500">{v.city ? `${v.city}, ${v.country}` : v.country}</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 65px)" }}>
        {/* Event context card — project data (Layer 1) or inquiry fallback */}
        {(conversation.project || conversation.inquiry) && (
          <div className="mx-4 mt-4 bg-purple-50 border border-purple-100 rounded-xl overflow-hidden">
            <button
              onClick={() => setBriefExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
            >
              <span className="text-xs font-semibold text-purple-700">
                {conversation.project
                  ? (() => {
                      const p = conversation.project;
                      const name =
                        p.brideName && p.groomName
                          ? `${p.brideName} & ${p.groomName}`
                          : p.brideName || p.groomName || "Couple";
                      return `${name}'s Event`;
                    })()
                  : "Your Inquiry"}
              </span>
              {briefExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
              )}
            </button>

            {briefExpanded && (
              <div className="px-4 pb-3 space-y-1.5">
                {conversation.project ? (
                  <ProjectContextRows project={conversation.project} />
                ) : (
                  conversation.inquiry && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-purple-800">
                      <span>Event: <strong>{conversation.inquiry.eventType}</strong></span>
                      {conversation.inquiry.eventDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(conversation.inquiry.eventDate).toLocaleDateString()}
                        </span>
                      )}
                      {conversation.inquiry.budget && (
                        <span>Budget: <strong>{conversation.inquiry.budget}</strong></span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No messages yet. Your inquiry has been sent!</p>
            </div>
          ) : (
            conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderRole === "GUEST" ? "justify-end" : "justify-start"}`}
              >
                {msg.senderRole === "VENDOR" && (
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Store className="w-3 h-3 text-purple-600" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.senderRole === "GUEST"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.senderRole === "GUEST" ? "text-purple-200" : "text-gray-400"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Compose */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          {conversation.status === "SPAM" ? (
            <p className="text-sm text-center text-gray-400">This conversation has been closed by the vendor.</p>
          ) : (
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
                }}
                rows={2}
                placeholder={`Message ${v.businessName}… (Enter to send)`}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
          {sendError && <p className="text-xs text-red-500 mt-1">{sendError}</p>}
          <p className="text-xs text-gray-400 text-center mt-2">
            This is a private conversation between you and {v.businessName}.
          </p>
        </div>
      </div>
    </div>
  );
}
