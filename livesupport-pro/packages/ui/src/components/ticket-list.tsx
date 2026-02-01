'use client';

import type { Ticket, TicketStatus, TicketPriority } from '@livesupport/core';
import { cn } from '../lib/utils';

export interface TicketListProps {
  tickets: Ticket[];
  selectedId?: string;
  onSelect?: (ticket: Ticket) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const statusColors: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  WAITING_FOR_CUSTOMER: 'bg-yellow-100 text-yellow-800',
  WAITING_FOR_AGENT: 'bg-orange-100 text-orange-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: 'text-gray-500',
  NORMAL: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
};

const priorityIcons: Record<TicketPriority, string> = {
  LOW: '↓',
  NORMAL: '→',
  HIGH: '↑',
  URGENT: '⚡',
};

function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}

/**
 * Ticket list component for displaying support tickets
 */
export function TicketList({
  tickets,
  selectedId,
  onSelect,
  isLoading = false,
  emptyMessage = 'No tickets found',
  className,
}: TicketListProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse p-4 border rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className={cn('text-center py-12 text-gray-500', className)}>
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('divide-y', className)}>
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          onClick={() => onSelect?.(ticket)}
          className={cn(
            'w-full text-left p-4 hover:bg-gray-50 transition-colors',
            selectedId === ticket.id && 'bg-blue-50 border-l-2 border-blue-600'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    priorityColors[ticket.priority]
                  )}
                  title={ticket.priority}
                >
                  {priorityIcons[ticket.priority]}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  #{ticket.ticketNumber}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 truncate">
                {ticket.subject}
              </h4>
              <p className="text-sm text-gray-500 truncate mt-1">
                {ticket.customer?.name || 'Unknown Customer'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  statusColors[ticket.status]
                )}
              >
                {ticket.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-gray-400">
                {formatRelativeTime(ticket.updatedAt)}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
