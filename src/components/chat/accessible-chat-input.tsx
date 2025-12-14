"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Smile } from "lucide-react";

interface AccessibleChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: () => void;
  onEmojiClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  ariaLabel?: string;
}

export function AccessibleChatInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  onEmojiClick,
  placeholder = "Type your message...",
  disabled = false,
  maxLength = 5000,
  ariaLabel = "Chat message input",
}: AccessibleChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }

    // Focus emoji picker on Ctrl/Cmd + E
    if ((e.ctrlKey || e.metaKey) && e.key === "e") {
      e.preventDefault();
      onEmojiClick?.();
    }

    // Focus file upload on Ctrl/Cmd + U
    if ((e.ctrlKey || e.metaKey) && e.key === "u") {
      e.preventDefault();
      onFileUpload?.();
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  return (
    <div
      className={`border rounded-lg transition-colors ${
        isFocused ? "ring-2 ring-primary" : ""
      } ${isOverLimit ? "border-destructive" : "border-input"}`}
      role="group"
      aria-label="Message composition area"
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 p-2 border-b"
        role="toolbar"
        aria-label="Message formatting tools"
      >
        {onFileUpload && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onFileUpload}
            disabled={disabled}
            aria-label="Attach file (Ctrl+U)"
            title="Attach file (Ctrl+U)"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}

        {onEmojiClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEmojiClick}
            disabled={disabled}
            aria-label="Add emoji (Ctrl+E)"
            title="Add emoji (Ctrl+E)"
          >
            <Smile className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1" />

        {/* Character count */}
        <span
          className={`text-xs ${
            isOverLimit
              ? "text-destructive font-medium"
              : isNearLimit
                ? "text-orange-500"
                : "text-muted-foreground"
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          {characterCount} / {maxLength}
        </span>
      </div>

      {/* Input area */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label={ariaLabel}
          aria-describedby="chat-input-help"
          aria-invalid={isOverLimit}
        />

        {/* Send button */}
        <div className="absolute bottom-2 right-2">
          <Button
            onClick={onSend}
            disabled={disabled || !value.trim() || isOverLimit}
            size="icon"
            aria-label="Send message (Enter)"
            title="Send message (Enter)"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Help text */}
      <div
        id="chat-input-help"
        className="sr-only"
        role="status"
        aria-live="polite"
      >
        Press Enter to send, Shift+Enter for new line. Press Ctrl+E for emoji,
        Ctrl+U to attach file.
      </div>

      {/* Error message */}
      {isOverLimit && (
        <div
          className="px-3 py-2 text-xs text-destructive bg-destructive/10 border-t"
          role="alert"
          aria-live="assertive"
        >
          Message exceeds maximum length of {maxLength} characters. Please
          shorten your message.
        </div>
      )}
    </div>
  );
}
