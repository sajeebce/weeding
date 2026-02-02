'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
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
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  messages: Message[];
}

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  OPEN: { label: 'Open', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  WAITING_CUSTOMER: { label: 'Awaiting Your Reply', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  WAITING_AGENT: { label: 'Awaiting Support', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  RESOLVED: { label: 'Resolved', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  CLOSED: { label: 'Closed', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
};

const priorityConfig: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await response.json();
      setTicket(data.ticket);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSend = async () => {
    if (!reply.trim()) return;

    try {
      setIsSending(true);

      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: reply.trim(),
          senderType: 'CUSTOMER',
          senderName: 'Customer',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      setTicket((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'WAITING_AGENT',
          messages: [...prev.messages, data.message],
        };
      });

      setReply('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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
        <svg className="h-8 w-8 animate-spin text-gray-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link href="/support" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Support
        </Link>
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <p className="text-gray-500">Ticket not found</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/support" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Support
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-1 text-lg text-gray-500">{ticket.subject}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Conversation</h2>
            </div>
            <div className="p-4 space-y-6">
              {ticket.messages.map((message, index) => (
                <div key={message.id}>
                  <div className="flex gap-4">
                    <div
                      className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-medium ${
                        message.senderType === 'AGENT'
                          ? 'bg-blue-600 text-white'
                          : message.senderType === 'SYSTEM'
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {message.senderType === 'SYSTEM'
                        ? 'SYS'
                        : message.senderName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{message.senderName}</span>
                        {message.senderType === 'AGENT' && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Support</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                      <div className="mt-2 whitespace-pre-wrap text-sm">{message.content}</div>

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-gray-50"
                            >
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{att.fileName}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(att.fileSize)}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < ticket.messages.length - 1 && <hr className="mt-6" />}
                </div>
              ))}
              <div ref={messagesEndRef} />

              {/* Reply Box */}
              {!isResolved && (
                <div className="pt-4 border-t">
                  <textarea
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    disabled={isSending}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSend}
                      disabled={isSending || !reply.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSending ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isResolved && (
                <div className="pt-4 border-t">
                  <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
                    This ticket has been resolved. If you need further assistance, please create a new ticket.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Ticket Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span className={`mt-1 inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityConfig[ticket.priority] || priorityConfig.MEDIUM}`}>
                  {ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}
                </span>
              </div>
              {ticket.category && (
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium capitalize">{ticket.category}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
              {ticket.resolvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-sm text-gray-500">
              Average response time: <strong>2-4 hours</strong>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Our support team is available Monday-Friday, 9AM-6PM EST.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
