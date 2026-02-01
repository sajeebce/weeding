'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/use-chat';
import { cn } from '../lib/utils';

export interface ChatWidgetProps {
  socketUrl: string;
  token?: string;
  visitorName?: string;
  visitorEmail?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Embeddable chat widget for customers
 */
export function ChatWidget({
  socketUrl,
  token,
  visitorName,
  visitorEmail,
  position = 'bottom-right',
  primaryColor = '#2563eb',
  title = 'Live Support',
  subtitle = 'We typically reply within minutes',
  placeholder = 'Type your message...',
  className,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isConnected,
    isWaiting,
    isActive,
    isEnded,
    agentName,
    typingUser,
    error,
    startChat,
    sendMessage,
    sendTyping,
    endChat: _endChat,
  } = useChat({
    socketUrl,
    token,
    visitorName,
    visitorEmail,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!isActive && !isWaiting) {
      startChat();
    }

    if (isActive) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (isActive) {
      sendTyping();
    }
  };

  const positionClasses = position === 'bottom-right'
    ? 'right-4 sm:right-6'
    : 'left-4 sm:left-6';

  return (
    <div className={cn('fixed bottom-4 sm:bottom-6 z-50', positionClasses, className)}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '500px' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 text-white flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-xs opacity-90">
                {isActive && agentName
                  ? `Chatting with ${agentName}`
                  : isWaiting
                  ? 'Connecting...'
                  : subtitle}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '280px' }}>
            {messages.length === 0 && !isWaiting && !isActive && (
              <div className="text-center text-gray-500 text-sm py-8">
                <p>Start a conversation</p>
                <p className="mt-1 text-xs">We&apos;re here to help!</p>
              </div>
            )}

            {isWaiting && (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="animate-pulse flex justify-center mb-2">
                  <div className="h-8 w-8 bg-gray-300 rounded-full" />
                </div>
                <p>Finding an available agent...</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                  message.senderType === 'VISITOR'
                    ? 'ml-auto bg-blue-600 text-white rounded-br-sm'
                    : 'mr-auto bg-white text-gray-800 shadow-sm rounded-bl-sm'
                )}
              >
                {message.senderType !== 'VISITOR' && (
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {message.senderName}
                  </p>
                )}
                <p>{message.content}</p>
              </div>
            ))}

            {typingUser && (
              <div className="mr-auto bg-white text-gray-500 rounded-2xl px-4 py-2 text-sm shadow-sm rounded-bl-sm">
                <span className="animate-pulse">{typingUser} is typing...</span>
              </div>
            )}

            {isEnded && (
              <div className="text-center text-gray-500 text-sm py-4 border-t">
                <p>Chat ended</p>
                <button
                  onClick={() => startChat()}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Start a new conversation
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={isEnded}
                className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isEnded}
                className="p-2 rounded-full text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1 px-2">{error}</p>
            )}
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg text-white flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Connection Status Indicator */}
      <div
        className={cn(
          'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )}
      />
    </div>
  );
}
