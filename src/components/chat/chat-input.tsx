"use client";

import { useState, useRef } from "react";
import { Send, Paperclip, X, Loader2, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (
    content: string,
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }>
  ) => void;
  onUpload: (file: File) => Promise<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  } | null>;
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

interface PendingAttachment {
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  };
  error?: string;
}

export function ChatInput({
  onSend,
  onUpload,
  isSending = false,
  disabled = false,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const content = message.trim();
    const uploadedAttachments = attachments
      .filter((a) => a.uploaded)
      .map((a) => a.uploaded!);

    if (!content && uploadedAttachments.length === 0) return;

    onSend(
      content || "Sent an attachment",
      uploadedAttachments.length > 0 ? uploadedAttachments : undefined
    );

    setMessage("");
    setAttachments([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      // Add to pending with preview
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : undefined;

      const pendingAttachment: PendingAttachment = {
        file,
        preview,
        uploading: true,
      };

      setAttachments((prev) => [...prev, pendingAttachment]);

      // Upload file
      const result = await onUpload(file);

      setAttachments((prev) =>
        prev.map((a) =>
          a.file === file
            ? {
                ...a,
                uploading: false,
                uploaded: result || undefined,
                error: result ? undefined : "Upload failed",
              }
            : a
        )
      );
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (file: File) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.file === file);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((a) => a.file !== file);
    });
  };

  const isDisabled = disabled || isSending;
  const canSend =
    !isDisabled &&
    (message.trim() ||
      attachments.some((a) => a.uploaded && !a.uploading));
  const isUploading = attachments.some((a) => a.uploading);

  return (
    <div className="border-t p-3">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-lg border p-2 text-xs",
                attachment.error && "border-red-500 bg-red-50"
              )}
            >
              {/* Preview */}
              {attachment.preview ? (
                <div className="relative h-16 w-16">
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="h-full w-full rounded object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center bg-muted rounded">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Uploading overlay */}
              {attachment.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removeAttachment(attachment.file)}
                className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>

              {/* File name */}
              <p className="mt-1 max-w-[64px] truncate text-[10px] text-muted-foreground">
                {attachment.file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isDisabled}
        />

        {/* Attach button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className="min-h-[36px] max-h-[120px] resize-none"
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleSend}
          disabled={!canSend || isUploading}
        >
          {isSending || isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
