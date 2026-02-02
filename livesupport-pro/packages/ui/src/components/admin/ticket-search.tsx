'use client';

import { useState, useCallback } from 'react';

export interface SearchFilters {
  query?: string;
  status?: string;
  priority?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TicketSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  statusOptions?: Array<{ value: string; label: string }>;
  priorityOptions?: Array<{ value: string; label: string }>;
  categoryOptions?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultStatusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_CUSTOMER', label: 'Waiting Customer' },
  { value: 'WAITING_AGENT', label: 'Waiting Agent' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const defaultPriorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export function TicketSearch({
  onSearch,
  onClear,
  statusOptions = defaultStatusOptions,
  priorityOptions = defaultPriorityOptions,
  categoryOptions = [],
  className = '',
}: TicketSearchProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = useCallback(() => {
    const filters: SearchFilters = {};

    if (query.trim()) filters.query = query.trim();
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;

    onSearch(filters);
  }, [query, status, priority, category, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setStatus('');
    setPriority('');
    setCategory('');
    setShowAdvanced(false);
    onClear();
  }, [onClear]);

  const hasFilters = query || status || priority || category;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tickets by number, subject, or customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All priorities</option>
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {categoryOptions.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All categories</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {query && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded-full">
              Query: {query}
              <button onClick={() => setQuery('')} className="hover:text-red-500">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded-full">
              Status: {statusOptions.find((o) => o.value === status)?.label || status}
              <button onClick={() => setStatus('')} className="hover:text-red-500">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {priority && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded-full">
              Priority: {priorityOptions.find((o) => o.value === priority)?.label || priority}
              <button onClick={() => setPriority('')} className="hover:text-red-500">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-sm rounded-full">
              Category: {categoryOptions.find((o) => o.value === category)?.label || category}
              <button onClick={() => setCategory('')} className="hover:text-red-500">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          <button onClick={handleClear} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
