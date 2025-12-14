"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  User,
  Package,
  Clock,
  Tag,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketChannel } from "@/hooks/use-pusher";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  senderName: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}

interface InternalNote {
  id: string;
  content: string;
  author: {
    id: string;
    name: string | null;
  };
  createdAt: string;
}

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string | null;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  customer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
  order: {
    id: string;
    orderNumber: string;
  } | null;
  messages: Message[];
  internalNotes: InternalNote[];
  createdAt: string;
  updatedAt: string;
  previousTickets?: Array<{
    id: string;
    ticketNumber: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  WAITING_FOR_CUSTOMER: "bg-amber-100 text-amber-700",
  WAITING_FOR_AGENT: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-red-100 text-red-700",
  URGENT: "bg-red-500 text-white",
};

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  WAITING_FOR_CUSTOMER: "Awaiting Customer",
  WAITING_FOR_AGENT: "Awaiting Agent",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export default function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
      toast.error("Failed to load ticket");
    }
  }, [id]);

  const fetchCannedResponses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/canned-responses");
      if (res.ok) {
        const data = await res.json();
        setCannedResponses(data.responses);
      }
    } catch (error) {
      console.error("Failed to fetch canned responses:", error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTicket(), fetchCannedResponses()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchTicket, fetchCannedResponses]);

  // Real-time updates
  useTicketChannel(id, {
    onMessageNew: (event) => {
      setTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, event.message as Message],
        };
      });
    },
    onTypingStart: () => setIsTyping(true),
    onTypingStop: () => setIsTyping(false),
  });

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, status } : prev));
        toast.success("Status updated");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      if (res.ok) {
        setTicket((prev) => (prev ? { ...prev, priority } : prev));
        toast.success("Priority updated");
      }
    } catch (error) {
      console.error("Failed to update priority:", error);
      toast.error("Failed to update priority");
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reply,
          sendEmail,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message],
            status: "WAITING_FOR_CUSTOMER",
          };
        });
        setReply("");
        toast.success("Reply sent");
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast.error("Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const handleAddNote = async () => {
    if (!internalNote.trim()) return;

    try {
      const res = await fetch(`/api/admin/tickets/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: internalNote }),
      });

      if (res.ok) {
        const note = await res.json();
        setTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            internalNotes: [...prev.internalNotes, note],
          };
        });
        setInternalNote("");
        toast.success("Note added");
      } else {
        toast.error("Failed to add note");
      }
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    }
  };

  const useCannedResponse = (content: string) => {
    setReply((prev) => (prev ? `${prev}\n\n${content}` : content));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link href="/admin/tickets">
          <Button variant="link">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  const customer = ticket.customer || {
    name: ticket.guestName || "Guest",
    email: ticket.guestEmail || "",
    phone: ticket.guestPhone || null,
    id: null,
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/tickets"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={statusColors[ticket.status] || ""}
            >
              {statusLabels[ticket.status] || ticket.status}
            </Badge>
            <Badge
              variant="secondary"
              className={priorityColors[ticket.priority] || ""}
            >
              {ticket.priority.toLowerCase()} priority
            </Badge>
            <span className="text-sm text-muted-foreground">
              {ticket.ticketNumber} • Created{" "}
              {formatDistanceToNow(new Date(ticket.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={ticket.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="WAITING_FOR_CUSTOMER">Awaiting Customer</SelectItem>
              <SelectItem value="WAITING_FOR_AGENT">Awaiting Agent</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange("RESOLVED")}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Resolve
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchTicket}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation - Scrollable */}
        <div className="space-y-6 lg:col-span-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>{ticket.messages.length} messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.filter(Boolean).map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
                    message.senderType === "AGENT" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback
                      className={
                        message.senderType === "AGENT"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    >
                      {message.senderName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 space-y-1 ${
                      message.senderType === "AGENT" ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        message.senderType === "AGENT" ? "justify-end" : ""
                      }`}
                    >
                      <span className="font-medium">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.senderType === "AGENT"
                          ? "bg-primary/10 text-left"
                          : "bg-muted text-left"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((att) => (
                            <div key={att.id}>
                              {att.fileType === "image" || att.fileType?.startsWith("image/") ? (
                                <a
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img
                                    src={att.fileUrl}
                                    alt={att.fileName}
                                    className="max-w-50 max-h-50 rounded-lg object-cover hover:opacity-90 transition-opacity"
                                  />
                                </a>
                              ) : (
                                <a
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline block"
                                >
                                  📎 {att.fileName}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-muted">...</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card>
            <CardHeader>
              <CardTitle>Reply</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Canned Responses */}
              {cannedResponses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cannedResponses.slice(0, 5).map((response) => (
                    <Button
                      key={response.id}
                      variant="outline"
                      size="sm"
                      onClick={() => useCannedResponse(response.content)}
                    >
                      {response.title}
                    </Button>
                  ))}
                </div>
              )}
              <Textarea
                placeholder="Type your reply..."
                rows={5}
                className="resize-none"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    className="rounded"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                  />
                  <label htmlFor="sendEmail" className="text-sm">
                    Send email notification to customer
                  </label>
                </div>
                <Button onClick={handleSendReply} disabled={isSending || !reply.trim()}>
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Sticky */}
        <div className="space-y-6 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {customer.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "G"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {ticket.customer?.id ? (
                    <Link
                      href={`/admin/customers/${ticket.customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{customer.name}</span>
                  )}
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              {customer.phone && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Phone</p>
                    <p>{customer.phone}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span>Category</span>
                </div>
                <span className="text-sm font-medium">
                  {ticket.category || "Uncategorized"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned</span>
                </div>
                <span className="text-sm font-medium">
                  {ticket.assignedTo?.name || "Unassigned"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Priority</span>
                </div>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Related Order */}
          {ticket.order && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Related Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/admin/orders/${ticket.order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {ticket.order.orderNumber}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Previous Tickets */}
          {ticket.previousTickets && ticket.previousTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Previous Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ticket.previousTickets.map((prev) => (
                    <div key={prev.id} className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/admin/tickets/${prev.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {prev.subject}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {prev.ticketNumber}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusColors[prev.status] || ""}
                      >
                        {statusLabels[prev.status] || prev.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Internal Notes</CardTitle>
              <CardDescription className="text-xs">Only visible to staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Existing notes */}
              {ticket.internalNotes.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {ticket.internalNotes.map((note) => (
                    <div key={note.id} className="rounded-lg bg-yellow-50 p-2 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {note.author.name || "Unknown"}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p>{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                placeholder="Add an internal note..."
                rows={2}
                className="resize-none text-sm"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleAddNote}
                disabled={!internalNote.trim()}
              >
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
