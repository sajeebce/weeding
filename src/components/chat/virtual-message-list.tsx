"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";

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
  }>;
}

interface VirtualMessageListProps {
  messages: Message[];
  currentUserType?: "CUSTOMER" | "AGENT";
  renderAttachment?: (attachment: {
    id: string;
    fileName: string;
    fileUrl: string;
  }) => React.ReactNode;
  className?: string;
}

const ITEM_HEIGHT = 100; // Approximate height of each message
const BUFFER_SIZE = 5; // Number of extra items to render above/below viewport

export function VirtualMessageList({
  messages,
  currentUserType = "AGENT",
  renderAttachment,
  className = "",
}: VirtualMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;

      setContainerHeight(clientHeight);

      const start = Math.max(
        0,
        Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE
      );
      const end = Math.min(
        messages.length,
        Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + BUFFER_SIZE
      );

      setVisibleRange({ start, end });
    };

    updateVisibleRange();

    container.addEventListener("scroll", updateVisibleRange);
    window.addEventListener("resize", updateVisibleRange);

    return () => {
      container.removeEventListener("scroll", updateVisibleRange);
      window.removeEventListener("resize", updateVisibleRange);
    };
  }, [messages.length]);

  const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
  const topPadding = visibleRange.start * ITEM_HEIGHT;
  const bottomPadding =
    (messages.length - visibleRange.end) * ITEM_HEIGHT;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const shouldShowDateSeparator = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.createdAt);
    const prevDate = new Date(prevMsg.createdAt);

    return currentDate.toDateString() !== prevDate.toDateString();
  };

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: containerHeight || "600px" }}
    >
      <div style={{ paddingTop: `${topPadding}px` }}>
        <div className="space-y-4 p-4">
          {visibleMessages.map((message, index) => {
            const prevMessage =
              visibleRange.start + index > 0
                ? messages[visibleRange.start + index - 1]
                : undefined;
            const showDateSeparator = shouldShowDateSeparator(
              message,
              prevMessage
            );
            const isCustomer = message.senderType === "CUSTOMER";

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-6">
                    <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                      {getDateLabel(new Date(message.createdAt))}
                    </div>
                  </div>
                )}

                <div
                  className={`flex gap-4 ${isCustomer ? "" : "flex-row-reverse"}`}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback
                      className={
                        isCustomer
                          ? "bg-muted"
                          : "bg-primary/10 text-primary"
                      }
                    >
                      {getInitials(message.senderName)}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex flex-col ${isCustomer ? "items-start" : "items-end"} flex-1 max-w-[70%]`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div
                      className={`rounded-lg p-4 ${
                        isCustomer
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((att) =>
                            renderAttachment ? (
                              renderAttachment(att)
                            ) : (
                              <a
                                key={att.id}
                                href={att.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs hover:underline block ${
                                  isCustomer
                                    ? "text-primary"
                                    : "text-primary-foreground/90"
                                }`}
                              >
                                {att.fileName}
                              </a>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ paddingBottom: `${bottomPadding}px` }} />
      </div>
    </div>
  );
}
