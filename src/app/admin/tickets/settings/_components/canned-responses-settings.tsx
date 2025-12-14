"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Copy, Search } from "lucide-react";

interface CannedResponsesSettingsProps {
  onChangeDetected: () => void;
}

// Mock data
const mockResponses = [
  {
    id: "1",
    title: "Welcome Message",
    content: "Hi! Thanks for reaching out to LLCPad support. How can I help you today?",
    category: "General",
    useCount: 145,
  },
  {
    id: "2",
    title: "LLC Formation Timeline",
    content: "Great question! Wyoming LLC formation typically takes 1-2 business days after we submit your documents. You'll receive your approved Articles of Organization via email.",
    category: "LLC",
    useCount: 89,
  },
  {
    id: "3",
    title: "EIN Processing Time",
    content: "For international clients without an SSN, EIN applications are submitted via fax to the IRS. Processing typically takes 4-6 weeks. We'll send you the EIN confirmation letter as soon as we receive it.",
    category: "EIN",
    useCount: 76,
  },
  {
    id: "4",
    title: "Bank Account Guidance",
    content: "For US business bank accounts, we recommend Mercury or Relay for remote account opening. Both accept international LLC owners. I can share more details about the requirements if you'd like.",
    category: "Banking",
    useCount: 54,
  },
  {
    id: "5",
    title: "Closing Message",
    content: "Is there anything else I can help you with? If not, I'll mark this ticket as resolved. Feel free to reach out anytime if you have more questions!",
    category: "General",
    useCount: 120,
  },
];

const categories = ["General", "LLC", "EIN", "Banking", "Amazon", "Compliance"];

export function CannedResponsesSettings({ onChangeDetected }: CannedResponsesSettingsProps) {
  const [responses, setResponses] = useState(mockResponses);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<typeof mockResponses[0] | null>(null);

  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || response.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setResponses(responses.filter((r) => r.id !== id));
    onChangeDetected();
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Create quick replies that agents can use to respond faster
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Response
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingResponse ? "Edit Canned Response" : "Add Canned Response"}
              </DialogTitle>
              <DialogDescription>
                Create a quick reply template that agents can use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Welcome Message"
                  defaultValue={editingResponse?.title || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={editingResponse?.category || "General"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Response Content</Label>
                <Textarea
                  placeholder="Enter the response text..."
                  rows={5}
                  defaultValue={editingResponse?.content || ""}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Use {"{customer_name}"} to insert the customer's name
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingResponse(null);
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsAddDialogOpen(false);
                setEditingResponse(null);
                onChangeDetected();
              }}>
                {editingResponse ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search responses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Responses Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Preview</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Uses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No canned responses found
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">{response.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">{response.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate text-muted-foreground">
                    {response.content}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    {response.useCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(response.content)}
                        title="Copy content"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingResponse(response);
                          setIsAddDialogOpen(true);
                        }}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(response.id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Variable Help */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h4 className="font-medium mb-2">Available Variables</h4>
        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <code className="rounded bg-muted px-1">{"{customer_name}"}</code>
            <span className="ml-2 text-muted-foreground">Customer's name</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{ticket_id}"}</code>
            <span className="ml-2 text-muted-foreground">Ticket number</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{agent_name}"}</code>
            <span className="ml-2 text-muted-foreground">Agent's name</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{company_name}"}</code>
            <span className="ml-2 text-muted-foreground">Your company name</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{support_email}"}</code>
            <span className="ml-2 text-muted-foreground">Support email</span>
          </div>
          <div>
            <code className="rounded bg-muted px-1">{"{current_date}"}</code>
            <span className="ml-2 text-muted-foreground">Today's date</span>
          </div>
        </div>
      </div>
    </div>
  );
}
