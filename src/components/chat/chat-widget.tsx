"use client";

import { useChat } from "./use-chat";
import { ChatButton } from "./chat-button";
import { ChatWindow } from "./chat-window";

export function ChatWidget() {
  const chat = useChat();

  return (
    <>
      {/* Chat Window */}
      <ChatWindow
        isOpen={chat.isOpen}
        isMinimized={chat.isMinimized}
        isOnline={chat.isOnline}
        isLoading={chat.isLoading}
        isSending={chat.isSending}
        ticket={chat.ticket}
        messages={chat.messages}
        guestInfo={chat.guestInfo}
        hasMoreMessages={chat.hasMoreMessages}
        isTyping={chat.isTyping}
        onMinimize={chat.isMinimized ? chat.maximizeChat : chat.minimizeChat}
        onClose={chat.closeChat}
        onStartChat={chat.startChat}
        onSendMessage={chat.sendMessage}
        onUploadFile={chat.uploadFile}
        onLoadMoreMessages={chat.loadMoreMessages}
        onNewChat={chat.clearChat}
      />

      {/* Floating Button */}
      <ChatButton
        isOpen={chat.isOpen}
        onClick={chat.isOpen ? chat.closeChat : chat.openChat}
        unreadCount={chat.unreadCount}
        isOnline={chat.isOnline}
      />
    </>
  );
}
