"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  MessageCircle,
  Bell,
  Bot,
  Mail,
  Palette,
  Globe,
  Shield,
  Loader2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SupportSettingsClientProps {
  pluginName?: string;
  tier?: string | null;
  features: string[];
}

interface SettingsData {
  // Chat Settings
  chatEnabled: boolean;
  chatRequireEmail: boolean;
  chatWelcomeMessage: string;
  chatOfflineMessage: string;
  chatPosition: string;
  chatPrimaryColor: string;
  chatShowAgentPhoto: boolean;
  chatSoundEnabled: boolean;
  chatEmailCollectionMode: string;
  chatConnectingMessage: string;
  chatEmailPromptMessage: string;
  chatAgentTimeoutSeconds: number;
  chatReplyTimeMessage: string;
  chatOfflineReplyTimeMessage: string;

  // Notification Settings
  notificationSound: boolean;
  notificationDesktop: boolean;
  notificationEmail: boolean;
  notificationEmailAddress: string;
  notifyOnNewTicket: boolean;
  notifyOnNewMessage: boolean;
  notifyOnTicketAssigned: boolean;

  // AI Settings
  aiEnabled: boolean;
  aiAutoSuggest: boolean;
  aiAutoResponse: boolean;
  aiProvider: string;
  aiApiKey: string;
  aiModel: string;
  aiMaxTokens: number;
  aiChatEnabled: boolean;
  aiHandoffMessage: string;
  aiEmailPromptMessage: string;

  // Email Settings
  emailFromName: string;
  emailFromAddress: string;
  emailReplyTo: string;
  emailSignature: string;
  emailNewTicketTemplate: string;
  emailReplyTemplate: string;

  // General Settings
  autoAssignEnabled: boolean;
  autoCloseAfterDays: number;
  requireCategoryOnCreate: boolean;
  allowGuestTickets: boolean;
  maxAttachmentSize: number;
  allowedFileTypes: string;
}

const defaultSettings: SettingsData = {
  chatEnabled: true,
  chatRequireEmail: true,
  chatWelcomeMessage: "Hi! How can we help you today?",
  chatOfflineMessage: "Our team is currently away",
  chatPosition: "bottom-right",
  chatPrimaryColor: "#2563eb",
  chatShowAgentPhoto: true,
  chatSoundEnabled: true,
  chatEmailCollectionMode: "always",
  chatConnectingMessage: "Connecting you with a team member...",
  chatEmailPromptMessage: "To make sure we can follow up, share your email",
  chatAgentTimeoutSeconds: 15,
  chatReplyTimeMessage: "We typically reply within a few minutes",
  chatOfflineReplyTimeMessage: "We typically respond within a few hours",

  notificationSound: true,
  notificationDesktop: true,
  notificationEmail: true,
  notificationEmailAddress: "",
  notifyOnNewTicket: true,
  notifyOnNewMessage: true,
  notifyOnTicketAssigned: true,

  aiEnabled: false,
  aiAutoSuggest: false,
  aiAutoResponse: false,
  aiProvider: "openai",
  aiApiKey: "",
  aiModel: "gpt-4o-mini",
  aiMaxTokens: 500,
  aiChatEnabled: false,
  aiHandoffMessage: "Let me connect you with a team member who can help better.",
  aiEmailPromptMessage: "Share your email so we can follow up if needed",

  emailFromName: "Support Team",
  emailFromAddress: "support@example.com",
  emailReplyTo: "support@example.com",
  emailSignature: "Best regards,\nThe Support Team",
  emailNewTicketTemplate: "Your ticket #{{ticketNumber}} has been created.",
  emailReplyTemplate: "You have a new reply on ticket #{{ticketNumber}}.",

  autoAssignEnabled: false,
  autoCloseAfterDays: 7,
  requireCategoryOnCreate: false,
  allowGuestTickets: true,
  maxAttachmentSize: 10,
  allowedFileTypes: "jpg,jpeg,png,gif,pdf,doc,docx,txt",
};

export function SupportSettingsClient({
  pluginName,
  tier,
  features,
}: SupportSettingsClientProps) {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const hasAiFeature = features.includes("ai");
  const hasChatFeature = features.includes("chat");

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      // In real implementation, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 300));
      // For now, use default settings
      setSettings(defaultSettings);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // In real implementation, save to API
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Support Settings
            {tier && <Badge variant="outline" className="ml-2">{tier}</Badge>}
          </h1>
          <p className="text-muted-foreground">Configure your support system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save before leaving.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat Settings */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat Widget Settings</CardTitle>
              <CardDescription>Configure the live chat widget appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasChatFeature && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Live chat is not available in your current tier. Upgrade to enable chat features.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Chat Widget</Label>
                  <p className="text-sm text-muted-foreground">Show chat widget on your website</p>
                </div>
                <Switch
                  checked={settings.chatEnabled}
                  onCheckedChange={(v) => updateSetting("chatEnabled", v)}
                  disabled={!hasChatFeature}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Widget Position</Label>
                  <Select
                    value={settings.chatPosition}
                    onValueChange={(v) => updateSetting("chatPosition", v)}
                    disabled={!hasChatFeature}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.chatPrimaryColor}
                      onChange={(e) => updateSetting("chatPrimaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                      disabled={!hasChatFeature}
                    />
                    <Input
                      value={settings.chatPrimaryColor}
                      onChange={(e) => updateSetting("chatPrimaryColor", e.target.value)}
                      placeholder="#2563eb"
                      disabled={!hasChatFeature}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Textarea
                  value={settings.chatWelcomeMessage}
                  onChange={(e) => updateSetting("chatWelcomeMessage", e.target.value)}
                  placeholder="Hi! How can we help you today?"
                  disabled={!hasChatFeature}
                />
              </div>

              <div className="space-y-2">
                <Label>Offline Message</Label>
                <Textarea
                  value={settings.chatOfflineMessage}
                  onChange={(e) => updateSetting("chatOfflineMessage", e.target.value)}
                  placeholder="We are currently offline..."
                  disabled={!hasChatFeature}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">Play sound for new messages</p>
                </div>
                <Switch
                  checked={settings.chatSoundEnabled}
                  onCheckedChange={(v) => updateSetting("chatSoundEnabled", v)}
                  disabled={!hasChatFeature}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Chat Flow Settings</h4>

                <div className="space-y-2">
                  <Label>Email Collection Mode</Label>
                  <Select
                    value={settings.chatEmailCollectionMode}
                    onValueChange={(v) => updateSetting("chatEmailCollectionMode", v)}
                    disabled={!hasChatFeature}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always (connecting + offline)</SelectItem>
                      <SelectItem value="connecting">Only while connecting to agent</SelectItem>
                      <SelectItem value="offline_only">Only when offline</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">When to ask visitors for their email in the chat</p>
                </div>

                <div className="space-y-2">
                  <Label>Connecting Message</Label>
                  <Input
                    value={settings.chatConnectingMessage}
                    onChange={(e) => updateSetting("chatConnectingMessage", e.target.value)}
                    placeholder="Connecting you with a team member..."
                    disabled={!hasChatFeature}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email Prompt Message</Label>
                  <Input
                    value={settings.chatEmailPromptMessage}
                    onChange={(e) => updateSetting("chatEmailPromptMessage", e.target.value)}
                    placeholder="To make sure we can follow up, share your email"
                    disabled={!hasChatFeature}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Reply Time Message</Label>
                    <Input
                      value={settings.chatReplyTimeMessage}
                      onChange={(e) => updateSetting("chatReplyTimeMessage", e.target.value)}
                      placeholder="We typically reply within a few minutes"
                      disabled={!hasChatFeature}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offline Reply Time Message</Label>
                    <Input
                      value={settings.chatOfflineReplyTimeMessage}
                      onChange={(e) => updateSetting("chatOfflineReplyTimeMessage", e.target.value)}
                      placeholder="We typically respond within a few hours"
                      disabled={!hasChatFeature}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Agent Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.chatAgentTimeoutSeconds}
                    onChange={(e) => updateSetting("chatAgentTimeoutSeconds", parseInt(e.target.value) || 15)}
                    min={5}
                    max={60}
                    disabled={!hasChatFeature}
                  />
                  <p className="text-xs text-muted-foreground">How long to wait for an agent before showing offline message</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">Play sound for new events</p>
                </div>
                <Switch
                  checked={settings.notificationSound}
                  onCheckedChange={(v) => updateSetting("notificationSound", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show browser notifications</p>
                </div>
                <Switch
                  checked={settings.notificationDesktop}
                  onCheckedChange={(v) => updateSetting("notificationDesktop", v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notificationEmail}
                  onCheckedChange={(v) => updateSetting("notificationEmail", v)}
                />
              </div>

              {settings.notificationEmail && (
                <div className="space-y-2">
                  <Label>Notification Email Address</Label>
                  <Input
                    type="email"
                    value={settings.notificationEmailAddress}
                    onChange={(e) => updateSetting("notificationEmailAddress", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <Label>Notify me when:</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New ticket is created</span>
                    <Switch
                      checked={settings.notifyOnNewTicket}
                      onCheckedChange={(v) => updateSetting("notifyOnNewTicket", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New message is received</span>
                    <Switch
                      checked={settings.notifyOnNewMessage}
                      onCheckedChange={(v) => updateSetting("notifyOnNewMessage", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ticket is assigned to me</span>
                    <Switch
                      checked={settings.notifyOnTicketAssigned}
                      onCheckedChange={(v) => updateSetting("notifyOnTicketAssigned", v)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>Configure AI-powered features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasAiFeature && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    AI features are not available in your current tier. Upgrade to Professional or Enterprise to enable AI.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Features</Label>
                  <p className="text-sm text-muted-foreground">Use AI for suggestions and responses</p>
                </div>
                <Switch
                  checked={settings.aiEnabled}
                  onCheckedChange={(v) => updateSetting("aiEnabled", v)}
                  disabled={!hasAiFeature}
                />
              </div>

              {settings.aiEnabled && hasAiFeature && (
                <>
                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>AI Provider</Label>
                      <Select
                        value={settings.aiProvider}
                        onValueChange={(v) => updateSetting("aiProvider", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select
                        value={settings.aiModel}
                        onValueChange={(v) => updateSetting("aiModel", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={settings.aiApiKey}
                      onChange={(e) => updateSetting("aiApiKey", e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Auto-Suggest</Label>
                      <p className="text-sm text-muted-foreground">Suggest responses while typing</p>
                    </div>
                    <Switch
                      checked={settings.aiAutoSuggest}
                      onCheckedChange={(v) => updateSetting("aiAutoSuggest", v)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>AI Auto-Response</Label>
                      <p className="text-sm text-muted-foreground">Automatically respond to simple queries</p>
                    </div>
                    <Switch
                      checked={settings.aiAutoResponse}
                      onCheckedChange={(v) => updateSetting("aiAutoResponse", v)}
                    />
                  </div>

                  <Separator />

                  <h4 className="text-sm font-semibold">AI in Live Chat</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable AI in Live Chat</Label>
                      <p className="text-sm text-muted-foreground">AI responds to visitors before connecting to an agent</p>
                    </div>
                    <Switch
                      checked={settings.aiChatEnabled}
                      onCheckedChange={(v) => updateSetting("aiChatEnabled", v)}
                    />
                  </div>

                  {settings.aiChatEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>AI Handoff Message</Label>
                        <Input
                          value={settings.aiHandoffMessage}
                          onChange={(e) => updateSetting("aiHandoffMessage", e.target.value)}
                          placeholder="Let me connect you with a team member..."
                        />
                        <p className="text-xs text-muted-foreground">Message shown when AI transfers to a human agent</p>
                      </div>

                      <div className="space-y-2">
                        <Label>AI Email Prompt</Label>
                        <Input
                          value={settings.aiEmailPromptMessage}
                          onChange={(e) => updateSetting("aiEmailPromptMessage", e.target.value)}
                          placeholder="Share your email so we can follow up if needed"
                        />
                        <p className="text-xs text-muted-foreground">Email collection message during AI conversation</p>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email templates and sender information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={settings.emailFromName}
                    onChange={(e) => updateSetting("emailFromName", e.target.value)}
                    placeholder="Support Team"
                  />
                </div>

                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    type="email"
                    value={settings.emailFromAddress}
                    onChange={(e) => updateSetting("emailFromAddress", e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reply-To Address</Label>
                <Input
                  type="email"
                  value={settings.emailReplyTo}
                  onChange={(e) => updateSetting("emailReplyTo", e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Signature</Label>
                <Textarea
                  value={settings.emailSignature}
                  onChange={(e) => updateSetting("emailSignature", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general support system behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Assign Tickets</Label>
                  <p className="text-sm text-muted-foreground">Automatically assign new tickets to available agents</p>
                </div>
                <Switch
                  checked={settings.autoAssignEnabled}
                  onCheckedChange={(v) => updateSetting("autoAssignEnabled", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Guest Tickets</Label>
                  <p className="text-sm text-muted-foreground">Allow non-registered users to create tickets</p>
                </div>
                <Switch
                  checked={settings.allowGuestTickets}
                  onCheckedChange={(v) => updateSetting("allowGuestTickets", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Category</Label>
                  <p className="text-sm text-muted-foreground">Require category selection when creating tickets</p>
                </div>
                <Switch
                  checked={settings.requireCategoryOnCreate}
                  onCheckedChange={(v) => updateSetting("requireCategoryOnCreate", v)}
                />
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Auto-Close After (days)</Label>
                  <Input
                    type="number"
                    value={settings.autoCloseAfterDays}
                    onChange={(e) => updateSetting("autoCloseAfterDays", parseInt(e.target.value))}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">0 to disable auto-close</p>
                </div>

                <div className="space-y-2">
                  <Label>Max Attachment Size (MB)</Label>
                  <Input
                    type="number"
                    value={settings.maxAttachmentSize}
                    onChange={(e) => updateSetting("maxAttachmentSize", parseInt(e.target.value))}
                    min={1}
                    max={50}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Allowed File Types</Label>
                <Input
                  value={settings.allowedFileTypes}
                  onChange={(e) => updateSetting("allowedFileTypes", e.target.value)}
                  placeholder="jpg,png,pdf,doc"
                />
                <p className="text-xs text-muted-foreground">Comma-separated list of allowed file extensions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
