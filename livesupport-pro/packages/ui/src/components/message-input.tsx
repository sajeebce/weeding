'use client';

import React, { useState, useRef } from 'react';
import { cn } from '../lib/utils';

export interface Attachment {
  file: File;
  preview?: string;
}

export interface MessageInputProps {
  onSend: (content: string, attachments?: Attachment[]) => void;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  maxAttachments?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string;
  className?: string;
}

/**
 * Message input component with attachment support
 */
export function MessageInput({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  allowAttachments = true,
  maxAttachments = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt',
  className,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    onSend(content.trim(), attachments.length > 0 ? attachments : undefined);
    setContent('');
    setAttachments([]);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping?.();

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    if (attachments.length + files.length > maxAttachments) {
      setError(`Maximum ${maxAttachments} attachments allowed`);
      return;
    }

    const validFiles: Attachment[] = [];
    for (const file of files) {
      if (file.size > maxFileSize) {
        setError(`File "${file.name}" exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
        continue;
      }

      const attachment: Attachment = { file };
      if (file.type.startsWith('image/')) {
        attachment.preview = URL.createObjectURL(file);
      }
      validFiles.push(attachment);
    }

    setAttachments((prev) => [...prev, ...validFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev];
      const removed = newAttachments.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newAttachments;
    });
  };

  return (
    <form onSubmit={handleSubmit} className={cn('border-t bg-white', className)}>
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="relative group bg-gray-100 rounded-lg p-2 pr-8 flex items-center gap-2"
            >
              {attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt={attachment.file.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <span className="text-xs text-gray-600 truncate max-w-[100px]">
                {attachment.file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="px-4 pt-2 text-xs text-red-500">{error}</p>
      )}

      {/* Input area */}
      <div className="p-3 flex items-end gap-2">
        {/* Attachment button */}
        {allowAttachments && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || attachments.length >= maxAttachments}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </>
        )}

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{ maxHeight: '120px' }}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={disabled || (!content.trim() && attachments.length === 0)}
          className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
}
