"use client";

import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WidgetSettings {
  enabled: boolean;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  buttonSize: "small" | "medium" | "large";
  horizontalOffset: number;
  verticalOffset: number;
  primaryColor: string;
  textColor: string;
  showUnreadBadge: boolean;
}

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
  isOnline?: boolean;
  settings?: WidgetSettings;
}

const SIZE_MAP = {
  small: { button: "h-12 w-12", icon: "h-5 w-5" },
  medium: { button: "h-14 w-14", icon: "h-6 w-6" },
  large: { button: "h-16 w-16", icon: "h-7 w-7" },
};

export function ChatButton({
  isOpen,
  onClick,
  unreadCount = 0,
  isOnline = true,
  settings,
}: ChatButtonProps) {
  // Get position classes based on settings
  const getPositionStyle = () => {
    const pos = settings?.position || "bottom-right";
    const hOffset = settings?.horizontalOffset ?? 24;
    const vOffset = settings?.verticalOffset ?? 24;

    const style: React.CSSProperties = {};

    if (pos.includes("bottom")) {
      style.bottom = `${vOffset}px`;
    } else {
      style.top = `${vOffset}px`;
    }

    if (pos.includes("right")) {
      style.right = `${hOffset}px`;
    } else {
      style.left = `${hOffset}px`;
    }

    return style;
  };

  const size = settings?.buttonSize || "medium";
  const sizeClasses = SIZE_MAP[size];
  const primaryColor = settings?.primaryColor || "#F97316";
  const textColor = settings?.textColor || "#ffffff";
  const showBadge = settings?.showUnreadBadge !== false;

  return (
    <button
      onClick={onClick}
      style={{
        ...getPositionStyle(),
        backgroundColor: isOpen ? "#374151" : primaryColor,
        color: textColor,
      }}
      className={cn(
        "fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
        sizeClasses.button,
        isOpen ? "hover:bg-gray-800 focus:ring-gray-500" : "focus:ring-primary"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X className={cn(sizeClasses.icon)} style={{ color: textColor }} />
      ) : (
        <>
          <MessageCircle className={cn(sizeClasses.icon)} style={{ color: textColor }} />
          {/* Online indicator */}
          <span
            className={cn(
              "absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white",
              isOnline ? "bg-green-500" : "bg-gray-400"
            )}
          />
          {/* Unread badge */}
          {showBadge && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  );
}
