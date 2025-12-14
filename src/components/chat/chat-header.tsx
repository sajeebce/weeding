"use client";

import { Minus, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  isOnline: boolean;
  ticketNumber?: string;
  onMinimize: () => void;
  onClose: () => void;
  onNewChat?: () => void;
}

export function ChatHeader({
  isOnline,
  ticketNumber,
  onMinimize,
  onClose,
  onNewChat,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <span className="text-lg font-bold">LP</span>
        </div>
        <div>
          <h3 className="font-semibold">LLCPad Support</h3>
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isOnline ? "bg-green-400" : "bg-gray-400"
              )}
            />
            <span>{isOnline ? "Online" : "Offline"}</span>
            {ticketNumber && (
              <>
                <span className="text-white/40">•</span>
                <span>{ticketNumber}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="rounded p-1.5 hover:bg-white/10 transition-colors"
            title="New conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onMinimize}
          className="rounded p-1.5 hover:bg-white/10 transition-colors"
          title="Minimize"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="rounded p-1.5 hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
