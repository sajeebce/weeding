"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  MessageSquare,
  Bell,
  Zap,
  MessageCircle,
  BookOpen,
  Bot,
  Save,
  Loader2,
  RefreshCw,
  Wifi
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Import setting components
import {
  GeneralSettings,
  ChatWidgetSettings,
  NotificationSettings,
  AutomationSettings,
  CannedResponsesSettings,
  KnowledgeBaseSettings,
  AIAssistantSettings,
  RealtimeSettings,
} from "./_components";

const settingsTabs = [
  {
    id: "general",
    label: "General",
    icon: Settings,
    description: "Basic support system configuration",
  },
  {
    id: "widget",
    label: "Chat Widget",
    icon: MessageSquare,
    description: "Customize the live chat widget appearance",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and push notification settings",
  },
  {
    id: "automation",
    label: "Automation",
    icon: Zap,
    description: "Auto-responses and ticket automation rules",
  },
  {
    id: "realtime",
    label: "Real-time",
    icon: Wifi,
    description: "Configure Pusher for instant message delivery",
  },
  {
    id: "canned",
    label: "Canned Responses",
    icon: MessageCircle,
    description: "Pre-written quick reply templates",
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    icon: BookOpen,
    badge: "Coming Soon",
    description: "Upload documents for AI-powered responses",
  },
  {
    id: "ai",
    label: "AI Assistant",
    icon: Bot,
    badge: "Coming Soon",
    description: "Configure AI auto-reply and suggestions",
  },
];

interface SupportSettings {
  general: Record<string, unknown>;
  widget: Record<string, unknown>;
  notifications: Record<string, unknown>;
  automation: Record<string, unknown>;
}

export default function TicketSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SupportSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/support-settings", {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          toast.error("Please log in to access settings");
        } else if (response.status === 403) {
          toast.error("Admin access required");
        } else {
          toast.error(errorData.error || "Failed to load settings");
        }
        return;
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/support-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (category: keyof SupportSettings, key: string, value: unknown) => {
    if (!settings) return;

    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Settings</h1>
          <p className="text-muted-foreground">
            Configure your live chat and ticketing system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadSettings}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Reload
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 h-auto gap-2 bg-transparent p-0">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isComingSoon = tab.badge === "Coming Soon";

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={isComingSoon}
                className="relative flex flex-col items-center gap-1 rounded-lg border bg-card p-3 data-[state=active]:border-primary data-[state=active]:bg-primary/5 hover:bg-muted/50 disabled:opacity-50"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.badge && (
                  <Badge
                    variant={isComingSoon ? "secondary" : "default"}
                    className="absolute -right-2 -top-2 text-[10px] px-1.5"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const tab = settingsTabs.find(t => t.id === activeTab);
                const Icon = tab?.icon || Settings;
                return <Icon className="h-5 w-5" />;
              })()}
              {settingsTabs.find(t => t.id === activeTab)?.label} Settings
            </CardTitle>
            <CardDescription>
              {settingsTabs.find(t => t.id === activeTab)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="general" className="mt-0">
              <GeneralSettings
                settings={settings?.general || {}}
                onUpdate={(key, value) => updateSettings("general", key, value)}
              />
            </TabsContent>

            <TabsContent value="widget" className="mt-0">
              <ChatWidgetSettings
                settings={settings?.widget || {}}
                onUpdate={(key, value) => updateSettings("widget", key, value)}
              />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings
                settings={settings?.notifications || {}}
                onUpdate={(key, value) => updateSettings("notifications", key, value)}
              />
            </TabsContent>

            <TabsContent value="automation" className="mt-0">
              <AutomationSettings
                settings={settings?.automation || {}}
                onUpdate={(key, value) => updateSettings("automation", key, value)}
              />
            </TabsContent>

            <TabsContent value="realtime" className="mt-0">
              <RealtimeSettings />
            </TabsContent>

            <TabsContent value="canned" className="mt-0">
              <CannedResponsesSettings />
            </TabsContent>

            <TabsContent value="knowledge" className="mt-0">
              <KnowledgeBaseSettings onChangeDetected={() => setHasChanges(true)} />
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <AIAssistantSettings onChangeDetected={() => setHasChanges(true)} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
