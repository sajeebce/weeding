"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Send, Paperclip, Loader2, Download, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTicketChannel } from "@/hooks/use-pusher";

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface Message {
  id: string;
  content: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  senderName: string;
  type: string;
  createdAt: string;
  attachments: Attachment[];
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: Message[];
  order?: {
    orderNumber: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-100 text-purple-700" },
  WAITING_CUSTOMER: { label: "Awaiting Your Reply", color: "bg-amber-100 text-amber-700" },
  WAITING_AGENT: { label: "Awaiting Support", color: "bg-orange-100 text-orange-700" },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-700" },
};

const priorityConfig: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time updates via Pusher
  useTicketChannel(ticketId, {
    onMessage: (message) => {
      setTicket((prev) => {
        if (!prev) return prev;
        // Avoid duplicates
        if (prev.messages.some((m) => m.id === message.id)) return prev;
        return {
          ...prev,
          messages: [...prev.messages, {
            id: message.id,
            content: message.content,
            senderType: message.senderType,
            senderName: message.senderName,
            type: message.type,
            createdAt: message.createdAt,
            attachments: message.attachments || [],
          }],
        };
      });
    },
    onStatusChange: (data) => {
      setTicket((prev) => prev ? { ...prev, status: data.status } : prev);
    },
  });

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customer/tickets/${ticketId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Ticket Not Found", {
            description: "This ticket does not exist or you don't have access to it",
          });
          return;
        }
        throw new Error("Failed to fetch ticket");
      }
      const data = await response.json();
      setTicket(data.ticket);
    } catch {
      toast.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error("File too large", {
          description: `${file.name} exceeds the 10MB limit`,
        });
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<Attachment[]> => {
    if (attachments.length === 0) return [];

    setUploading(true);
    const uploaded: Attachment[] = [];

    try {
      for (const file of attachments) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("ticketId", ticketId);

        const response = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploaded.push({
          id: data.id || crypto.randomUUID(),
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileSize: data.fileSize,
        });
      }
    } finally {
      setUploading(false);
    }

    return uploaded;
  };

  const handleSend = async () => {
    if (!reply.trim() && attachments.length === 0) return;

    try {
      setIsSending(true);

      // Upload attachments first
      const uploadedAttachments = await uploadAttachments();

      const response = await fetch(`/api/customer/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reply.trim() || "Sent attachments",
          attachments: uploadedAttachments.map((att) => ({
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
            fileSize: att.fileSize,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add message to local state (Pusher will also update, but this ensures immediate feedback)
      setTicket((prev) => {
        if (!prev) return prev;
        if (prev.messages.some((m) => m.id === data.message.id)) return prev;
        return {
          ...prev,
          status: "WAITING_AGENT",
          messages: [...prev.messages, data.message],
        };
      });

      setReply("");
      setAttachments([]);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.OPEN;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Support
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ticket not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/support"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Support
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{ticket.ticketNumber}</h1>
            <Badge variant="secondary" className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
          </div>
          <p className="mt-1 text-lg text-muted-foreground">{ticket.subject}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.messages.map((message, index) => (
                <div key={message.id}>
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback
                        className={
                          message.senderType === "AGENT"
                            ? "bg-primary text-primary-foreground"
                            : message.senderType === "SYSTEM"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-muted"
                        }
                      >
                        {message.senderType === "SYSTEM"
                          ? "SYS"
                          : message.senderName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.senderName}</span>
                        {message.senderType === "AGENT" && (
                          <Badge variant="secondary" className="text-xs">
                            Support
                          </Badge>
                        )}
                        {message.senderType === "SYSTEM" && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </p>
                      <div className="mt-2 whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-muted/50"
                            >
                              {att.fileType.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={att.fileUrl}
                                  alt={att.fileName}
                                  className="h-16 w-16 rounded object-cover"
                                />
                              ) : (
                                <FileIcon className="h-8 w-8 text-muted-foreground" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{att.fileName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(att.fileSize)}
                                </p>
                              </div>
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < ticket.messages.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />

              {/* Reply Box */}
              {!isResolved && (
                <div className="pt-4">
                  <Separator className="mb-6" />
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={4}
                      disabled={isSending}
                    />

                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
                          >
                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-[150px] truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="ml-1 rounded-full p-0.5 hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileSelect}
                          accept="image/*,.pdf,.doc,.docx,.txt"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isSending || uploading}
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Attach File
                        </Button>
                      </div>
                      <Button
                        onClick={handleSend}
                        disabled={isSending || uploading || (!reply.trim() && attachments.length === 0)}
                      >
                        {isSending || uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {uploading ? "Uploading..." : "Sending..."}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isResolved && (
                <div className="pt-4">
                  <Separator className="mb-6" />
                  <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                    This ticket has been resolved. If you need further assistance, please create a new ticket.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="secondary"
                  className={`mt-1 ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Priority</p>
                <Badge
                  variant="secondary"
                  className={`mt-1 ${priorityConfig[ticket.priority] || priorityConfig.MEDIUM}`}
                >
                  {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                </Badge>
              </div>
              {ticket.category && (
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize">{ticket.category}</p>
                </div>
              )}
              {ticket.order && (
                <div>
                  <p className="text-sm text-muted-foreground">Related Order</p>
                  <Link
                    href={`/dashboard/orders/${ticket.orderId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {ticket.order.orderNumber}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Average response time: <strong>2-4 hours</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Our support team is available Monday-Friday, 9AM-6PM EST.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
