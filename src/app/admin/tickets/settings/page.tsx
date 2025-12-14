"use client";

import { useState } from "react";
import {
  Settings,
  MessageSquare,
  Bell,
  Zap,
  MessageCircle,
  BookOpen,
  Bot,
  Save,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Import setting components
import {
  GeneralSettings,
  ChatWidgetSettings,
  NotificationSettings,
  AutomationSettings,
  CannedResponsesSettings,
  KnowledgeBaseSettings,
  AIAssistantSettings,
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

export default function TicketSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save settings to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

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

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 h-auto gap-2 bg-transparent p-0">
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
              <GeneralSettings onChangeDetected={() => setHasChanges(true)} />
            </TabsContent>

            <TabsContent value="widget" className="mt-0">
              <ChatWidgetSettings onChangeDetected={() => setHasChanges(true)} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings onChangeDetected={() => setHasChanges(true)} />
            </TabsContent>

            <TabsContent value="automation" className="mt-0">
              <AutomationSettings onChangeDetected={() => setHasChanges(true)} />
            </TabsContent>

            <TabsContent value="canned" className="mt-0">
              <CannedResponsesSettings onChangeDetected={() => setHasChanges(true)} />
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
