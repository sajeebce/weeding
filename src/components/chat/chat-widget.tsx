"use client";

import { useEffect, useState, useCallback } from "react";
import { useChat } from "./use-chat";
import { ChatButton, WidgetSettings } from "./chat-button";
import { ChatWindow } from "./chat-window";

export function ChatWidget() {
  const chat = useChat();
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  // Fetch widget settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/widget-settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setIsEnabled(data.enabled !== false);
        }
      } catch (error) {
        console.error("Error fetching widget settings:", error);
      }
    };

    fetchSettings();
  }, []);

  // Typing indicator handlers
  const handleTyping = useCallback(async () => {
    if (!chat.ticket) return;
    try {
      await fetch(`/api/chat/${chat.ticket.id}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTyping: true,
          userName: chat.guestInfo?.name || "Customer",
          userType: "CUSTOMER",
        }),
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  }, [chat.ticket, chat.guestInfo]);

  const handleStopTyping = useCallback(async () => {
    if (!chat.ticket) return;
    try {
      await fetch(`/api/chat/${chat.ticket.id}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTyping: false,
          userName: chat.guestInfo?.name || "Customer",
          userType: "CUSTOMER",
        }),
      });
    } catch (error) {
      console.error("Error sending stop typing indicator:", error);
    }
  }, [chat.ticket, chat.guestInfo]);

  // Don't render if widget is disabled
  if (!isEnabled) {
    return null;
  }

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
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        settings={settings}
      />

      {/* Floating Button */}
      <ChatButton
        isOpen={chat.isOpen}
        onClick={chat.isOpen ? chat.closeChat : chat.openChat}
        unreadCount={chat.unreadCount}
        isOnline={chat.isOnline}
        settings={settings || undefined}
      />
    </>
  );
}
