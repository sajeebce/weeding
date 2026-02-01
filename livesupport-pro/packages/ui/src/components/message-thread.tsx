'use client';

import React, { useRef, useEffect } from 'react';
import type { Message } from '@livesupport/core';
import { cn } from '../lib/utils';

export interface MessageThreadProps {
  messages: Message[];
  currentUserId?: string;
  isLoading?: boolean;
  typingUser?: string | null;
  className?: string;
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Message thread component for displaying ticket messages
 */
export function MessageThread({
  messages,
  currentUserId,
  isLoading = false,
  typingUser,
  className,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  if (isLoading) {
    return (
      <div className={cn('space-y-4 p-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3',
              i % 2 === 0 ? 'justify-start' : 'justify-end'
            )}
          >
            <div
              className={cn(
                'animate-pulse rounded-2xl p-4',
                i % 2 === 0 ? 'bg-gray-200 w-3/4' : 'bg-blue-200 w-2/3'
              )}
            >
              <div className="h-3 bg-gray-300 rounded w-full mb-2" />
              <div className="h-3 bg-gray-300 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full text-gray-500', className)}>
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>No messages yet</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = '';

  messages.forEach((message) => {
    const messageDate = formatDate(message.createdAt);
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [message] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return (
    <div className={cn('flex flex-col space-y-4 p-4', className)}>
      {groupedMessages.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {/* Date separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500 font-medium">{group.date}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Messages */}
          {group.messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            const isAgent = message.senderType === 'AGENT';

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                {!isCurrentUser && (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0',
                      isAgent ? 'bg-blue-600' : 'bg-gray-500'
                    )}
                  >
                    {message.sender?.image ? (
                      <img
                        src={message.sender.image}
                        alt={message.senderName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(message.senderName)
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2',
                    isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white border shadow-sm rounded-bl-sm'
                  )}
                >
                  {!isCurrentUser && (
                    <p
                      className={cn(
                        'text-xs font-medium mb-1',
                        isAgent ? 'text-blue-600' : 'text-gray-500'
                      )}
                    >
                      {message.senderName}
                      {isAgent && (
                        <span className="ml-1 text-gray-400">(Agent)</span>
                      )}
                    </p>
                  )}

                  {/* Content */}
                  {message.contentHtml ? (
                    <div
                      className="text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.contentHtml }}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'flex items-center gap-2 text-xs underline',
                            isCurrentUser
                              ? 'text-blue-100 hover:text-white'
                              : 'text-blue-600 hover:text-blue-800'
                          )}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {attachment.fileName}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={cn(
                      'text-xs mt-1',
                      isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                    )}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}

      {/* Typing indicator */}
      {typingUser && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-600">...</span>
          </div>
          <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-sm">
            <p className="text-sm text-gray-500 animate-pulse">
              {typingUser} is typing...
            </p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
