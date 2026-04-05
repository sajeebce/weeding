"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Calendar, Mail, Phone, ChevronDown, Filter } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string;
  eventDate: string | null;
  budget: string | null;
  message: string;
  status: "NEW" | "VIEWED" | "RESPONDED" | "ARCHIVED";
  createdAt: string;
}

const STATUS_OPTIONS = ["ALL", "NEW", "VIEWED", "RESPONDED", "ARCHIVED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  VIEWED: "bg-gray-100 text-gray-600",
  RESPONDED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-400",
};

const NEXT_STATUSES: Record<string, { label: string; value: string }[]> = {
  NEW: [
    { label: "Mark Viewed", value: "VIEWED" },
    { label: "Mark Responded", value: "RESPONDED" },
    { label: "Archive", value: "ARCHIVED" },
  ],
  VIEWED: [
    { label: "Mark Responded", value: "RESPONDED" },
    { label: "Archive", value: "ARCHIVED" },
  ],
  RESPONDED: [{ label: "Archive", value: "ARCHIVED" }],
  ARCHIVED: [{ label: "Mark New", value: "NEW" }],
};

export default function VendorInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/vendor/inquiries?${params}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/vendor/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: status as Inquiry["status"] } : inq))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {total} total {total === 1 ? "inquiry" : "inquiries"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-14 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No inquiries found</p>
          <p className="text-xs text-gray-400 mt-1">
            {statusFilter !== "ALL"
              ? `No ${statusFilter.toLowerCase()} inquiries`
              : "Customer inquiries will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const isExpanded = expandedId === inq.id;
            return (
              <div
                key={inq.id}
                className={`bg-white rounded-xl border transition-all ${
                  inq.status === "NEW" ? "border-blue-200" : "border-gray-200"
                }`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                >
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-purple-600">
                      {inq.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{inq.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLES[inq.status]}`}>
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{inq.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </p>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 ml-auto mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <a href={`mailto:${inq.email}`} className="hover:text-purple-600">
                          {inq.email}
                        </a>
                      </div>
                      {inq.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                          {inq.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Event</span>
                        {inq.eventType}
                      </div>
                      {inq.eventDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          {new Date(inq.eventDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      )}
                      {inq.budget && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Budget</span>
                          {inq.budget}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{inq.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`mailto:${inq.email}?subject=Re: Your inquiry`}
                        className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                      >
                        Reply by Email
                      </a>
                      {NEXT_STATUSES[inq.status]?.map((next) => (
                        <button
                          key={next.value}
                          onClick={() => updateStatus(inq.id, next.value)}
                          disabled={updatingId === inq.id}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-gray-300 disabled:opacity-50 transition-colors"
                        >
                          {updatingId === inq.id ? "Updating..." : next.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:border-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:border-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
