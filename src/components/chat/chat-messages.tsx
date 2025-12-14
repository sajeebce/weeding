"use client";

import { useRef, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { FileText, ImageIcon, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./use-chat";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isTyping?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isYesterday(date)) {
    return `Yesterday ${format(date, "h:mm a")}`;
  }

  return format(date, "MMM d, h:mm a");
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isCustomer = message.senderType === "CUSTOMER";
  const isSystem = message.senderType === "SYSTEM";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[80%]",
        isCustomer ? "ml-auto items-end" : "items-start"
      )}
    >
      {!isCustomer && (
        <span className="text-xs text-muted-foreground px-1">
          {message.senderName}
        </span>
      )}

      <div
        className={cn(
          "rounded-2xl px-4 py-2",
          isCustomer
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content}
        </p>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 rounded-lg p-2 text-xs transition-colors",
                  isCustomer
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-background hover:bg-accent"
                )}
              >
                {attachment.fileType === "image" ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="flex-1 truncate">{attachment.fileName}</span>
                <Download className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>

      <span className="text-[10px] text-muted-foreground px-1">
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 max-w-[80%]">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

export function ChatMessages({
  messages,
  isLoading,
  isTyping,
  hasMore,
  onLoadMore,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle scroll for loading more
  const handleScroll = () => {
    if (!containerRef.current || !hasMore || !onLoadMore) return;

    if (containerRef.current.scrollTop === 0) {
      onLoadMore();
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {/* Load more indicator */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="text-xs text-primary hover:underline"
          >
            Load earlier messages
          </button>
        </div>
      )}

      {/* Welcome message if no messages */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h4 className="font-semibold">Welcome!</h4>
          <p className="text-sm text-muted-foreground mt-1">
            How can we help you today? Send us a message and we&apos;ll get back
            to you shortly.
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.filter(Boolean).map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
