'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Ticket, PaginationInput, TicketFilters } from '@livesupport/core';
import { TICKET_EVENTS } from '@livesupport/core';
import { useSocket } from './use-socket';

export interface UseTicketsOptions {
  socketUrl: string;
  token?: string;
  apiUrl: string;
  initialFilters?: TicketFilters;
  initialPagination?: PaginationInput;
}

export interface UseTicketsReturn {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: TicketFilters;
  setFilters: (filters: TicketFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
  isConnected: boolean;
}

/**
 * Hook for managing tickets with real-time updates
 */
export function useTickets(options: UseTicketsOptions): UseTicketsReturn {
  const {
    socketUrl,
    token,
    apiUrl,
    initialFilters = {},
    initialPagination = { page: 1, limit: 20 },
  } = options;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPagination.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);

  const { isConnected, on, off } = useSocket({ url: socketUrl, token });

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(initialPagination.limit || 20),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined)
        ),
      });

      const response = await fetch(`${apiUrl}/tickets?${queryParams}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, page, filters, token, initialPagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Real-time updates
  useEffect(() => {
    const handleNewTicket = (ticket: Ticket) => {
      setTickets((prev) => [ticket, ...prev]);
      setTotal((prev) => prev + 1);
    };

    const handleUpdatedTicket = (ticket: Ticket) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? ticket : t))
      );
    };

    const handleDeletedTicket = (data: { id: string }) => {
      setTickets((prev) => prev.filter((t) => t.id !== data.id));
      setTotal((prev) => prev - 1);
    };

    on(TICKET_EVENTS.NEW, handleNewTicket);
    on(TICKET_EVENTS.UPDATED, handleUpdatedTicket);
    on(TICKET_EVENTS.DELETED, handleDeletedTicket);

    return () => {
      off(TICKET_EVENTS.NEW, handleNewTicket);
      off(TICKET_EVENTS.UPDATED, handleUpdatedTicket);
      off(TICKET_EVENTS.DELETED, handleDeletedTicket);
    };
  }, [on, off]);

  return {
    tickets,
    total,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    refresh: fetchTickets,
    isConnected,
  };
}
