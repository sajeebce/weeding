"use client";

import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
  isOnline?: boolean;
}

export function ChatButton({
  isOpen,
  onClick,
  unreadCount = 0,
  isOnline = true,
}: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
        isOpen
          ? "bg-gray-700 hover:bg-gray-800 focus:ring-gray-500"
          : "bg-primary hover:bg-primary/90 focus:ring-primary"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X className="h-6 w-6 text-white" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6 text-white" />
          {/* Online indicator */}
          <span
            className={cn(
              "absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white",
              isOnline ? "bg-green-500" : "bg-gray-400"
            )}
          />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
