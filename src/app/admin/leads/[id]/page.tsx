"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Activity,
  Edit,
  Trash2,
  Save,
  X,
  Pin,
  PinOff,
  Loader2,
  Flame,
  Thermometer,
  Snowflake,
  Send,
  CheckCircle,
  XCircle,
  UserPlus,
  UserCheck,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

interface Lead {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  city: string | null;
  status: string;
  source: string;
  sourceDetail: string | null;
  priority: string;
  score: number;
  interestedIn: string[];
  budget: string | null;
  timeline: string | null;
  notes: string | null;
  customFields: Record<string, unknown> | null;
  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  formTemplate: {
    id: string;
    name: string;
  } | null;
  formTemplateName: string | null;
  activities: Activity[];
  leadNotes: Note[];
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  convertedAt: string | null;
  convertedToId: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown> | null;
  performedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  createdAt: string;
}

interface Note {
  id: string;
  content: string;
  isPinned: boolean;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-purple-100 text-purple-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  PROPOSAL: "bg-amber-100 text-amber-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  UNQUALIFIED: "bg-gray-100 text-gray-700",
};

const activityIcons: Record<string, React.ReactNode> = {
  lead_created: <CheckCircle className="h-4 w-4 text-green-500" />,
  status_change: <Activity className="h-4 w-4 text-blue-500" />,
  note_added: <MessageSquare className="h-4 w-4 text-purple-500" />,
  assignment_change: <UserPlus className="h-4 w-4 text-orange-500" />,
  email_sent: <Send className="h-4 w-4 text-blue-500" />,
  call_made: <Phone className="h-4 w-4 text-green-500" />,
  score_updated: <Flame className="h-4 w-4 text-orange-500" />,
};

function getScoreIcon(score: number) {
  if (score >= 70) return <Flame className="h-5 w-5 text-red-500" />;
  if (score >= 40) return <Thermometer className="h-5 w-5 text-orange-500" />;
  return <Snowflake className="h-5 w-5 text-blue-500" />;
}

function getScoreLabel(score: number) {
  if (score >= 70) return "Hot Lead";
  if (score >= 40) return "Warm Lead";
  return "Cold Lead";
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assignmentUpdating, setAssignmentUpdating] = useState(false);

  // Convert to customer state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    city: "",
    status: "",
    priority: "",
    budget: "",
    timeline: "",
    notes: "",
    score: 0,
  });

  const fetchLead = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/leads/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Lead not found");
          router.push("/admin/leads");
          return;
        }
        throw new Error("Failed to fetch lead");
      }
      const data = await response.json();
      setLead(data);
      setEditForm({
        firstName: data.firstName,
        lastName: data.lastName || "",
        email: data.email,
        phone: data.phone || "",
        company: data.company || "",
        country: data.country || "",
        city: data.city || "",
        status: data.status,
        priority: data.priority,
        budget: data.budget || "",
        timeline: data.timeline || "",
        notes: data.notes || "",
        score: data.score,
      });
    } catch (error) {
      console.error("Error fetching lead:", error);
      toast.error("Failed to fetch lead");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // Fetch team members for assignment
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        const response = await fetch("/api/admin/users?roles=ADMIN,SALES_AGENT,SUPPORT_AGENT");
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.users || []);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    }
    fetchTeamMembers();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error("Failed to update lead");

      const updatedLead = await response.json();
      setLead((prev) => prev ? { ...prev, ...updatedLead } : null);
      setEditing(false);
      toast.success("Lead updated successfully");
      fetchLead(); // Refresh to get activities
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const response = await fetch(`/api/admin/leads/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      setNewNote("");
      toast.success("Note added successfully");
      fetchLead(); // Refresh to get new note
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (statusUpdating) return;
    try {
      setStatusUpdating(true);
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success(`Status updated to ${newStatus}`);
      fetchLead();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignment = async (userId: string | null) => {
    if (assignmentUpdating) return;
    try {
      setAssignmentUpdating(true);
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (!response.ok) throw new Error("Failed to update assignment");

      toast.success(userId ? "Lead assigned successfully" : "Assignment removed");
      fetchLead();
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("Failed to update assignment");
    } finally {
      setAssignmentUpdating(false);
    }
  };

  const handleConvertToCustomer = async () => {
    if (converting) return;
    try {
      setConverting(true);
      const response = await fetch(`/api/admin/leads/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendWelcomeEmail: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to convert lead");
      }

      toast.success(result.message);
      setConvertDialogOpen(false);
      fetchLead();
    } catch (error) {
      console.error("Error converting lead:", error);
      toast.error(error instanceof Error ? error.message : "Failed to convert lead");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Lead not found</p>
        <Button asChild className="mt-4">
          <Link href="/admin/leads">Back to Leads</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/leads">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                {lead.firstName} {lead.lastName}
              </h1>
              <Badge className={statusColors[lead.status]}>{lead.status}</Badge>
            </div>
            <p className="text-muted-foreground">{lead.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </>
          ) : (
            <>
              {/* Quick Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = `mailto:${lead.email}?subject=Follow-up from LLCPad`;
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              {lead.status === "WON" && !lead.convertedAt && (
                <Button onClick={() => setConvertDialogOpen(true)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Convert to Customer
                </Button>
              )}
              {lead.convertedAt && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Converted
                </Badge>
              )}
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Convert to Customer Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert Lead to Customer</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new customer account for {lead.firstName} {lead.lastName} ({lead.email}).
              A welcome email with login credentials will be sent to the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={converting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToCustomer} disabled={converting}>
              {converting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Convert
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Score Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                    {getScoreIcon(lead.score)}
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{lead.score}</div>
                    <div className="text-muted-foreground">{getScoreLabel(lead.score)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Pipeline Stage</div>
                  <Select value={lead.status} onValueChange={handleStatusChange} disabled={statusUpdating}>
                    <SelectTrigger className="w-[160px] mt-1">
                      {statusUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
                      <SelectItem value="PROPOSAL">Proposal</SelectItem>
                      <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                      <SelectItem value="WON">Won</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                      <SelectItem value="UNQUALIFIED">Unqualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">
                Activity ({lead.activities.length})
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes ({lead.leadNotes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          value={editForm.firstName}
                          onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          value={editForm.lastName}
                          onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Company</label>
                        <Input
                          value={editForm.company}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Country</label>
                        <Input
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div>{lead.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Phone</div>
                          <div>{lead.phone || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Company</div>
                          <div>{lead.company || "-"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Location</div>
                          <div>{[lead.city, lead.country].filter(Boolean).join(", ") || "-"}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Interested In</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lead.interestedIn.length > 0 ? (
                          lead.interestedIn.map((service) => (
                            <Badge key={service} variant="secondary">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Budget</div>
                      <div>{lead.budget || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Timeline</div>
                      <div>{lead.timeline || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Source</div>
                      <div>{lead.source}</div>
                      {lead.sourceDetail && (
                        <div className="text-xs text-muted-foreground">{lead.sourceDetail}</div>
                      )}
                    </div>
                  </div>

                  {lead.notes && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Notes / Message</div>
                        <div className="whitespace-pre-wrap">{lead.notes}</div>
                      </div>
                    </>
                  )}

                  {lead.utmSource && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">UTM Parameters</div>
                        <div className="text-sm font-mono bg-muted p-2 rounded">
                          {lead.utmSource && <div>utm_source: {lead.utmSource}</div>}
                          {lead.utmMedium && <div>utm_medium: {lead.utmMedium}</div>}
                          {lead.utmCampaign && <div>utm_campaign: {lead.utmCampaign}</div>}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields (expandable) */}
              {lead.customFields && Object.keys(lead.customFields).length > 0 && (
                <Collapsible>
                  <Card>
                    <CardHeader className="pb-3">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        <CardTitle className="text-base">Custom Fields</CardTitle>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                      </CollapsibleTrigger>
                      <CardDescription>
                        Additional data captured from form submissions
                      </CardDescription>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="grid gap-3 md:grid-cols-2">
                          {Object.entries(lead.customFields).map(([key, value]) => (
                            <div key={key} className="border rounded-lg p-3">
                              <div className="text-sm text-muted-foreground capitalize">
                                {key.replace(/[_-]/g, " ")}
                              </div>
                              <div className="mt-1 text-sm">
                                {typeof value === "object" ? JSON.stringify(value) : String(value || "-")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Recent activities for this lead</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lead.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {activityIcons[activity.type] || <Activity className="h-4 w-4 text-gray-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.performedBy?.name || "System"} •{" "}
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {lead.activities.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No activity yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>Internal notes about this lead</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add note form */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                      {addingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Notes list */}
                  <div className="space-y-4">
                    {lead.leadNotes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {note.author.name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{note.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {note.isPinned && <Pin className="h-4 w-4 text-amber-500" />}
                        </div>
                        <div className="mt-2 whitespace-pre-wrap">{note.content}</div>
                      </div>
                    ))}
                    {lead.leadNotes.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        No notes yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.assignedTo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {lead.assignedTo.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{lead.assignedTo.name}</div>
                      <div className="text-sm text-muted-foreground">{lead.assignedTo.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={lead.assignedTo.id}
                      onValueChange={handleAssignment}
                      disabled={assignmentUpdating}
                    >
                      <SelectTrigger className="flex-1">
                        {assignmentUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Reassign to..." />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleAssignment(null)}
                      disabled={assignmentUpdating}
                      title="Remove assignment"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <div className="text-sm text-muted-foreground mb-2">Not assigned</div>
                  <Select
                    onValueChange={handleAssignment}
                    disabled={assignmentUpdating}
                  >
                    <SelectTrigger className="w-full">
                      {assignmentUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Assign</span>
                        </>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name || member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div>{format(new Date(lead.createdAt), "PPp")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Last Activity</div>
                  <div>{formatDistanceToNow(new Date(lead.lastActivityAt), { addSuffix: true })}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {(lead.formTemplate || lead.formTemplateName) && (
            <Card>
              <CardHeader>
                <CardTitle>Form Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {lead.formTemplate ? (
                    <div className="font-medium">{lead.formTemplate.name}</div>
                  ) : lead.formTemplateName ? (
                    <div className="text-muted-foreground">{lead.formTemplateName} (deleted)</div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          {lead.status === "QUALIFIED" && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <Button className="w-full" variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Convert to Customer
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
