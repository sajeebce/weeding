"use client";

import { cn } from "@/lib/utils";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatPreForm } from "./chat-pre-form";
import { ChatOfflineForm } from "./chat-offline-form";
import type { ChatMessage, ChatTicket } from "./use-chat";

interface ChatWindowProps {
  isOpen: boolean;
  isMinimized: boolean;
  isOnline: boolean;
  isLoading: boolean;
  isSending: boolean;
  ticket: ChatTicket | null;
  messages: ChatMessage[];
  guestInfo: { name: string; email: string; phone?: string } | null;
  hasMoreMessages: boolean;
  isTyping: boolean;
  onMinimize: () => void;
  onClose: () => void;
  onStartChat: (info: { name: string; email: string; phone?: string }) => void;
  onSendMessage: (
    content: string,
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }>
  ) => void;
  onUploadFile: (file: File) => Promise<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  } | null>;
  onLoadMoreMessages: () => void;
  onNewChat: () => void;
}

export function ChatWindow({
  isOpen,
  isMinimized,
  isOnline,
  isLoading,
  isSending,
  ticket,
  messages,
  guestInfo,
  hasMoreMessages,
  isTyping,
  onMinimize,
  onClose,
  onStartChat,
  onSendMessage,
  onUploadFile,
  onLoadMoreMessages,
  onNewChat,
}: ChatWindowProps) {
  if (!isOpen) return null;

  // Minimized state - show compact bar
  if (isMinimized) {
    return (
      <button
        onClick={onMinimize}
        className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-lg bg-primary px-4 py-2 text-white shadow-lg transition-transform hover:scale-102"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <span className="text-sm font-bold">LP</span>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium">LLCPad Support</p>
          <p className="text-xs text-white/80">
            {ticket ? `Chat #${ticket.ticketNumber}` : "Click to expand"}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-xl bg-background shadow-2xl border transition-all duration-300",
        "max-h-[calc(100vh-120px)]",
        "sm:h-[500px] sm:w-[380px]",
        // Mobile full screen
        "max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:top-0 max-sm:h-full max-sm:w-full max-sm:rounded-none"
      )}
    >
      {/* Header */}
      <ChatHeader
        isOnline={isOnline}
        ticketNumber={ticket?.ticketNumber}
        onMinimize={onMinimize}
        onClose={onClose}
        onNewChat={ticket ? onNewChat : undefined}
      />

      {/* Content */}
      {!isOnline && !ticket ? (
        // Offline form
        <ChatOfflineForm
          onSubmit={async (data) => {
            await onStartChat(data);
          }}
        />
      ) : !ticket || !guestInfo ? (
        // Pre-chat form
        <ChatPreForm onSubmit={onStartChat} isLoading={isLoading} />
      ) : (
        // Chat messages and input
        <>
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
            hasMore={hasMoreMessages}
            onLoadMore={onLoadMoreMessages}
          />
          <ChatInput
            onSend={onSendMessage}
            onUpload={onUploadFile}
            isSending={isSending}
            disabled={!isOnline}
            placeholder={
              isOnline ? "Type a message..." : "We're currently offline"
            }
          />
        </>
      )}
    </div>
  );
}
