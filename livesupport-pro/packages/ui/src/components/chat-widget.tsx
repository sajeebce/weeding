'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/use-chat';
import { cn } from '../lib/utils';

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="py-1.5 text-center">
      <span className="text-xs text-gray-400">{text}</span>
    </div>
  );
}

function ConnectingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full opacity-60"
          style={{ backgroundColor: color, animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function EmailCollectionCard({
  primaryColor,
  promptMessage,
  onSubmit,
  onSkip,
  showSkip = true,
}: {
  primaryColor: string;
  promptMessage: string;
  onSubmit: (email: string) => void;
  onSkip: () => void;
  showSkip?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    setSubmitted(true);
    onSubmit(trimmed);
  };

  if (submitted) {
    return (
      <div className="mx-2 my-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium text-green-700">
            We&apos;ll notify you at {email}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="mb-2 text-center text-xs text-gray-500">{promptMessage}</p>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="your@email.com"
          className={cn(
            'flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2',
            error
              ? 'border-red-300 focus:ring-red-300'
              : 'border-gray-200 focus:border-transparent'
          )}
          style={!error ? { '--tw-ring-color': primaryColor } as React.CSSProperties : undefined}
        />
        <button
          type="submit"
          className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          Send
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {showSkip && (
        <button
          onClick={onSkip}
          className="mt-1.5 block w-full text-center text-xs text-gray-400 transition-colors hover:text-gray-600 hover:underline"
        >
          Skip
        </button>
      )}
    </div>
  );
}

function OfflineCard({
  message,
  replyTime,
}: {
  message: string;
  replyTime: string;
}) {
  return (
    <div className="mx-2 my-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-gray-800">{message}</span>
      </div>
      <p className="mt-1 pl-6 text-xs text-gray-500">{replyTime}</p>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

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
  welcomeMessage?: string;
  connectingMessage?: string;
  offlineMessage?: string;
  emailPromptMessage?: string;
  replyTimeMessage?: string;
  offlineReplyTimeMessage?: string;
  emailCollectionMode?: 'always' | 'connecting' | 'offline_only' | 'never';
  className?: string;
}

export function ChatWidget({
  socketUrl,
  token,
  visitorName,
  visitorEmail,
  position = 'bottom-right',
  primaryColor = '#2563eb',
  title = 'Live Support',
  subtitle,
  welcomeMessage = 'Hi! How can we help you today?',
  connectingMessage = 'Connecting you with a team member...',
  offlineMessage = 'Our team is currently away',
  emailPromptMessage = 'To make sure we can follow up, share your email',
  replyTimeMessage = 'We typically reply within a few minutes',
  offlineReplyTimeMessage = 'We typically respond within a few hours',
  emailCollectionMode = 'always',
  className,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isConnected,
    widgetState,
    agentName,
    agentsOnline,
    typingUser,
    error,
    unreadCount,
    emailCollected,
    emailSkipped,
    showEmailCard,
    startChat,
    sendMessage,
    sendTyping,
    submitEmail,
    skipEmail,
    resetChat,
    clearUnread,
  } = useChat({
    socketUrl,
    token,
    visitorName,
    visitorEmail,
    emailCollectionMode,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showEmailCard, widgetState]);

  // Clear unread on open + focus input
  useEffect(() => {
    if (isOpen) {
      clearUnread();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, clearUnread]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const value = inputValue.trim();
    setInputValue('');

    // First message - start a chat session
    if (widgetState === 'IDLE') {
      startChat(value);
      return;
    }

    // Active chat or offline reply - send message directly
    if ((widgetState === 'ACTIVE_CHAT' || widgetState === 'OFFLINE_REPLY')) {
      sendMessage(value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (widgetState === 'ACTIVE_CHAT') sendTyping();
  };

  const isRight = position === 'bottom-right';
  const canType =
    widgetState === 'IDLE' ||
    widgetState === 'ACTIVE_CHAT' ||
    widgetState === 'OFFLINE_REPLY';

  // Determine subtitle text
  const subtitleText = subtitle || (
    widgetState === 'ACTIVE_CHAT' && agentName
      ? `Chatting with ${agentName}`
      : widgetState === 'CONNECTING'
      ? 'Connecting...'
      : widgetState === 'OFFLINE_REPLY'
      ? 'Leave us a message'
      : agentsOnline
      ? replyTimeMessage
      : 'Leave us a message'
  );

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className={cn('fixed bottom-5', isRight ? 'right-5' : 'left-5', className)}
    >
      {/* Chat Window */}
      <div
        className={cn(
          'mb-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
          'transition-all duration-300 ease-out origin-bottom',
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto w-80 sm:w-96'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none h-0 w-0 sm:w-96'
        )}
        style={{
          maxHeight: isOpen ? 'min(600px, calc(100vh - 100px))' : '0px',
          boxShadow: isOpen ? '0 8px 32px rgba(0, 0, 0, 0.15)' : 'none',
        }}
        role="dialog"
        aria-label="Live chat support"
        aria-modal="false"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
                  agentsOnline ? 'bg-green-400' : 'bg-yellow-400'
                )}
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">{title}</h3>
              <p className="text-xs leading-tight opacity-80">{subtitleText}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1.5 transition-colors hover:bg-white/20"
            aria-label="Close chat"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto bg-white p-4 space-y-2"
          role="log"
          aria-live="polite"
          aria-atomic="false"
          style={{ minHeight: '320px', maxHeight: '420px' }}
        >
          {/* IDLE: Welcome message */}
          {widgetState === 'IDLE' && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={primaryColor}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">{welcomeMessage}</p>
              <p className="mt-2 text-xs text-gray-400">Type a message below to start chatting</p>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg) =>
            msg.senderType === 'SYSTEM' ? (
              <SystemMessage key={msg.id} text={msg.content} />
            ) : (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.senderType === 'VISITOR'
                    ? 'ml-auto rounded-br-sm text-white'
                    : 'mr-auto rounded-bl-sm bg-gray-100 text-gray-800'
                )}
                style={msg.senderType === 'VISITOR' ? { backgroundColor: primaryColor } : {}}
              >
                {msg.senderType !== 'VISITOR' && (
                  <p className="mb-0.5 text-xs font-medium text-gray-400">{msg.senderName}</p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            )
          )}

          {/* CONNECTING: Dots + message */}
          {widgetState === 'CONNECTING' && (
            <div className="text-center">
              <ConnectingDots color={primaryColor} />
              <p className="text-xs text-gray-400">{connectingMessage}</p>
              <p className="mt-0.5 text-xs text-gray-300">{replyTimeMessage}</p>
            </div>
          )}

          {/* OFFLINE_REPLY: Away card */}
          {widgetState === 'OFFLINE_REPLY' && (
            <OfflineCard message={offlineMessage} replyTime={offlineReplyTimeMessage} />
          )}

          {/* Email Collection Card (show form OR green confirmation) */}
          {showEmailCard && !emailSkipped && (
            <EmailCollectionCard
              primaryColor={primaryColor}
              promptMessage={
                widgetState === 'OFFLINE_REPLY'
                  ? 'Leave your email and we\'ll get back to you'
                  : emailPromptMessage
              }
              onSubmit={submitEmail}
              onSkip={skipEmail}
              showSkip={widgetState !== 'OFFLINE_REPLY'}
            />
          )}

          {/* Offline: confirmation after email */}
          {widgetState === 'OFFLINE_REPLY' && emailCollected && (
            <SystemMessage text="Your messages are saved. We'll respond as soon as we're back." />
          )}

          {/* Typing indicator */}
          {typingUser && (
            <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-sm">
              <span className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </span>
              <span className="text-xs text-gray-400">{typingUser} is typing</span>
            </div>
          )}

          {/* ENDED: actions */}
          {widgetState === 'ENDED' && (
            <div className="py-2 text-center">
              <button
                onClick={resetChat}
                className="text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Start a new conversation
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t bg-white p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={
                widgetState === 'ENDED'
                  ? 'Chat ended'
                  : widgetState === 'CONNECTING'
                  ? 'Waiting for agent...'
                  : 'Type your message...'
              }
              disabled={widgetState === 'ENDED' || widgetState === 'CONNECTING'}
              aria-label="Type your message"
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || !canType}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: primaryColor }}
              aria-label="Send message"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1 px-2">{error}</p>}
        </form>
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg',
          'transition-all duration-200 ease-out hover:scale-110 hover:shadow-xl active:scale-95',
          isRight ? 'ml-auto' : 'mr-auto'
        )}
        style={{
          backgroundColor: primaryColor,
          boxShadow: `0 4px 12px ${primaryColor}40`,
        }}
        aria-label={
          isOpen
            ? 'Close chat'
            : unreadCount > 0
            ? `Open chat - ${unreadCount} unread messages`
            : 'Open live chat'
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Icon transition */}
        <span
          className={cn(
            'absolute transition-all duration-200',
            isOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          )}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        <span
          className={cn(
            'absolute transition-all duration-200',
            isOpen ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          )}
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
