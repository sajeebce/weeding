"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Plus,
  RefreshCw,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "WAITING_FOR_AGENT" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  guestName: string | null;
  guestEmail: string | null;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  _count: {
    messages: number;
  };
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  waitingAgent: number;
  resolved: number;
  closed: number;
}

interface CustomerSearchResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  totalOrders: number;
  lastOrder?: {
    id: string;
    orderNumber: string;
    serviceName: string;
    amount: number;
    createdAt: string;
  };
  totalTickets: number;
  lastTicketAt?: string;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  serviceName: string;
  status: string;
  amount: number;
  createdAt: string;
}

interface TicketsPageClientProps {
  pluginName?: string;
  tier?: string | null;
  features: string[];
  needsRefresh?: boolean;
}

const statusConfig: Record<TicketStatus, { label: string; color: string; icon: typeof AlertCircle }> = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Clock },
  WAITING_FOR_CUSTOMER: { label: "Awaiting Customer", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  WAITING_FOR_AGENT: { label: "Awaiting Agent", color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle },
};

const priorityConfig: Record<TicketPriority, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-gray-100 text-gray-700" },
  MEDIUM: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

export function TicketsPageClient({
  pluginName,
  tier,
  features,
  needsRefresh,
}: TicketsPageClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);

  // New Ticket Modal
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerType, setCustomerType] = useState<"existing" | "guest">("guest");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSearchResult | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "MEDIUM" as TicketPriority,
    message: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: perPage.toString(),
      });

      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);

      const response = await fetch(`/api/admin/tickets?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data.data || []);
      setTotalTickets(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Calculate stats
      const ticketList = data.data || [];
      setStats({
        total: data.total || ticketList.length,
        open: ticketList.filter((t: Ticket) => t.status === "OPEN").length,
        inProgress: ticketList.filter((t: Ticket) => t.status === "IN_PROGRESS").length,
        waitingCustomer: ticketList.filter((t: Ticket) => t.status === "WAITING_FOR_CUSTOMER").length,
        waitingAgent: ticketList.filter((t: Ticket) => t.status === "WAITING_FOR_AGENT").length,
        resolved: ticketList.filter((t: Ticket) => t.status === "RESOLVED").length,
        closed: ticketList.filter((t: Ticket) => t.status === "CLOSED").length,
      });
    } catch (error) {
      console.error("Failed to load tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (needsRefresh) {
      toast.info("Your license token will refresh soon", {
        description: "This happens automatically in the background",
      });
    }
  }, [needsRefresh]);

  // Customer search with debounce
  useEffect(() => {
    if (customerType !== "existing" || !customerSearch.trim() || customerSearch.length < 2) {
      setCustomerResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(customerSearch)}`);
        if (response.ok) {
          const data = await response.json();
          setCustomerResults(data.customers || []);
        }
      } catch (error) {
        console.error("Customer search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [customerSearch, customerType]);

  // Fetch customer orders when customer is selected
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerOrders([]);
      setSelectedOrderId("");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/admin/customers/${selectedCustomer.id}/orders`);
        if (response.ok) {
          const data = await response.json();
          setCustomerOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
      }
    };

    fetchOrders();
  }, [selectedCustomer]);

  // Reset form when modal closes
  const resetForm = () => {
    setCustomerType("guest");
    setCustomerSearch("");
    setCustomerResults([]);
    setSelectedCustomer(null);
    setCustomerOrders([]);
    setSelectedOrderId("");
    setFormData({
      subject: "",
      category: "",
      priority: "MEDIUM",
      message: "",
      guestName: "",
      guestEmail: "",
      guestPhone: "",
    });
  };

  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setCustomerResults([]);
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    // Validate based on customer type
    if (customerType === "existing") {
      if (!selectedCustomer) {
        toast.error("Please select a customer");
        return;
      }
    } else {
      if (!formData.guestEmail.trim()) {
        toast.error("Customer email is required");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Build request body based on customer type
      const requestBody: Record<string, unknown> = {
        subject: formData.subject,
        category: formData.category || null,
        priority: formData.priority,
        initialMessage: formData.message,
      };

      if (customerType === "existing" && selectedCustomer) {
        requestBody.customerId = selectedCustomer.id;
        if (selectedOrderId) {
          requestBody.orderId = selectedOrderId;
        }
      } else {
        requestBody.guestName = formData.guestName || null;
        requestBody.guestEmail = formData.guestEmail;
        requestBody.guestPhone = formData.guestPhone || null;
      }

      const response = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create ticket");
      }

      toast.success("Ticket created successfully");
      setNewTicketOpen(false);
      resetForm();
      fetchTickets();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("Status updated");
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      toast.success("Ticket deleted");
      fetchTickets();
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  const toggleAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map((t) => t.id));
    }
  };

  const toggleTicket = (id: string) => {
    if (selectedTickets.includes(id)) {
      setSelectedTickets(selectedTickets.filter((t) => t !== id));
    } else {
      setSelectedTickets([...selectedTickets, id]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCustomerDisplay = (ticket: Ticket) => {
    if (ticket.customer) {
      return {
        name: ticket.customer.name || "Customer",
        email: ticket.customer.email,
      };
    }
    return {
      name: ticket.guestName || "Guest",
      email: ticket.guestEmail || "",
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer support requests
            {tier && <Badge variant="outline" className="ml-2">{tier}</Badge>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setNewTicketOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats ? stats.open + stats.inProgress + stats.waitingAgent : 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.waitingAgent || 0}</p>
                <p className="text-sm text-muted-foreground">Awaiting Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.waitingCustomer || 0}</p>
                <p className="text-sm text-muted-foreground">Awaiting Customer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats ? stats.resolved + stats.closed : 0}
                </p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING_FOR_CUSTOMER">Awaiting Customer</SelectItem>
                <SelectItem value="WAITING_FOR_AGENT">Awaiting Agent</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                setPriorityFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>{totalTickets} tickets total</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page:</span>
              <Select
                value={perPage.toString()}
                onValueChange={(v) => {
                  setPerPage(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first support ticket"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button className="mt-4" onClick={() => setNewTicketOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Ticket
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTickets.length === tickets.length && tickets.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden md:table-cell">Messages</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => {
                    const customer = getCustomerDisplay(ticket);
                    const statusInfo = statusConfig[ticket.status];
                    const priorityInfo = priorityConfig[ticket.priority];

                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTickets.includes(ticket.id)}
                            onCheckedChange={() => toggleTicket(ticket.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link
                              href={`/admin/tickets/${ticket.id}`}
                              className="font-medium hover:underline"
                            >
                              {ticket.subject}
                            </Link>
                            <p className="text-xs text-muted-foreground font-mono">
                              {ticket.ticketNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ticket.status}
                            onValueChange={(value: TicketStatus) =>
                              handleStatusChange(ticket.id, value)
                            }
                          >
                            <SelectTrigger
                              className={`w-40 h-7 text-xs font-medium border ${statusInfo.color}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            {ticket._count.messages}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatDate(ticket.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/tickets/${ticket.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteTicket(ticket.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * perPage + 1} to{" "}
                    {Math.min(currentPage * perPage, totalTickets)} of {totalTickets} tickets
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 text-muted-foreground">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* New Ticket Modal */}
      <Dialog open={newTicketOpen} onOpenChange={(open) => {
        setNewTicketOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Create a new support ticket on behalf of a customer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Customer Type Toggle */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Customer Type:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={customerType === "existing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCustomerType("existing");
                    setSelectedCustomer(null);
                  }}
                >
                  <User className="h-4 w-4 mr-1" />
                  Existing Customer
                </Button>
                <Button
                  type="button"
                  variant={customerType === "guest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCustomerType("guest");
                    setSelectedCustomer(null);
                  }}
                >
                  New/Guest
                </Button>
              </div>
            </div>

            {/* Existing Customer Search */}
            {customerType === "existing" && (
              <div className="space-y-2">
                <Label>Search Customer</Label>
                {selectedCustomer ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedCustomer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                        {selectedCustomer.phone && (
                          <p className="text-xs text-muted-foreground">{selectedCustomer.phone}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-9"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                      )}
                    </div>
                    {customerResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {customerResults.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{customer.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                                {customer.lastOrder && (
                                  <p className="text-xs text-muted-foreground">
                                    Last order: {customer.lastOrder.serviceName} ({new Date(customer.lastOrder.createdAt).toLocaleDateString()})
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                <p>{customer.totalOrders} orders</p>
                                <p>{customer.totalTickets} tickets</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Link (only for existing customers) */}
                {selectedCustomer && customerOrders.length > 0 && (
                  <div className="mt-3">
                    <Label>Link to Order (Optional)</Label>
                    <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select related order..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No order link</SelectItem>
                        {customerOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.orderNumber} - {order.serviceName} (${order.amount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Guest Customer Fields */}
            {customerType === "guest" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guestName">Customer Name</Label>
                    <Input
                      id="guestName"
                      placeholder="John Doe"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">Customer Email *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.guestEmail}
                      onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="guestPhone">Phone (Optional)</Label>
                  <Input
                    id="guestPhone"
                    placeholder="+1-555-0123"
                    value={formData.guestPhone}
                    onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  />
                </div>
              </div>
            )}

            <hr className="my-2" />

            {/* Ticket Details */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of the issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as TicketPriority })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Initial Message *</Label>
              <Textarea
                id="message"
                placeholder="Describe the issue in detail..."
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
