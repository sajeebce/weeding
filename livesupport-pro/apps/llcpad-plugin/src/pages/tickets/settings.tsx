"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Users,
  Palette,
  Bot,
  Save,
  Globe,
  Volume2,
} from "lucide-react";

// Settings types
interface SupportSettings {
  general: {
    businessName: string;
    supportEmail: string;
    timezone: string;
    language: string;
  };
  chat: {
    enabled: boolean;
    position: "bottom-left" | "bottom-right";
    primaryColor: string;
    welcomeMessage: string;
    offlineMessage: string;
    requireEmail: boolean;
    showAgentPhoto: boolean;
    emailCollectionMode: "always" | "connecting" | "offline_only" | "never";
    connectingMessage: string;
    emailPromptMessage: string;
    agentTimeoutSeconds: number;
    replyTimeMessage: string;
    offlineReplyTimeMessage: string;
  };
  notifications: {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    emailOnNewTicket: boolean;
    emailOnReply: boolean;
  };
  autoResponse: {
    enabled: boolean;
    delaySeconds: number;
    message: string;
  };
  ai: {
    enabled: boolean;
    model: string;
    maxTokens: number;
    autoSuggest: boolean;
    chatEnabled: boolean;
    handoffMessage: string;
    emailPromptMessage: string;
  };
}

const defaultSettings: SupportSettings = {
  general: {
    businessName: "LLCPad Support",
    supportEmail: "support@llcpad.com",
    timezone: "America/New_York",
    language: "en",
  },
  chat: {
    enabled: true,
    position: "bottom-right",
    primaryColor: "#2563eb",
    welcomeMessage: "Hi! How can we help you today?",
    offlineMessage: "Our team is currently away",
    requireEmail: true,
    showAgentPhoto: true,
    emailCollectionMode: "always",
    connectingMessage: "Connecting you with a team member...",
    emailPromptMessage: "To make sure we can follow up, share your email",
    agentTimeoutSeconds: 15,
    replyTimeMessage: "We typically reply within a few minutes",
    offlineReplyTimeMessage: "We typically respond within a few hours",
  },
  notifications: {
    soundEnabled: true,
    desktopEnabled: true,
    emailOnNewTicket: true,
    emailOnReply: true,
  },
  autoResponse: {
    enabled: true,
    delaySeconds: 30,
    message: "Thank you for reaching out! A support agent will be with you shortly.",
  },
  ai: {
    enabled: false,
    model: "gpt-4o-mini",
    maxTokens: 500,
    autoSuggest: true,
    chatEnabled: false,
    handoffMessage: "Let me connect you with a team member who can help further.",
    emailPromptMessage: "Before I connect you, could you share your email so we can follow up?",
  },
};

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "chat", label: "Chat Widget", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "autoResponse", label: "Auto Response", icon: Clock },
  { id: "ai", label: "AI Settings", icon: Bot },
];

export default function SupportSettingsPage() {
  const [settings, setSettings] = useState<SupportSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Settings</h1>
          <p className="text-muted-foreground">
            Configure your support system preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-48 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg border bg-card p-6 shadow-sm">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium">Business Name</label>
                    <input
                      type="text"
                      value={settings.general.businessName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, businessName: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support Email</label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, supportEmail: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, timezone: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Widget Settings */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Chat Widget</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Chat Widget</p>
                      <p className="text-sm text-muted-foreground">Show the chat widget on your website</p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, enabled: !settings.chat.enabled },
                        })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.chat.enabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          settings.chat.enabled ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Widget Position</label>
                    <select
                      value={settings.chat.position}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, position: e.target.value as any },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={settings.chat.primaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            chat: { ...settings.chat, primaryColor: e.target.value },
                          })
                        }
                        className="h-10 w-10 rounded-md border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.chat.primaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            chat: { ...settings.chat, primaryColor: e.target.value },
                          })
                        }
                        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Welcome Message</label>
                    <textarea
                      value={settings.chat.welcomeMessage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, welcomeMessage: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Email</p>
                      <p className="text-sm text-muted-foreground">Ask for email before starting chat</p>
                    </div>
                    <button
                      onClick={() =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, requireEmail: !settings.chat.requireEmail },
                        })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        settings.chat.requireEmail ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          settings.chat.requireEmail ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Collection Mode</label>
                    <p className="text-xs text-muted-foreground mb-1">When to ask visitors for their email</p>
                    <select
                      value={settings.chat.emailCollectionMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, emailCollectionMode: e.target.value as any },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="always">Always (during connecting + offline)</option>
                      <option value="connecting">Only while connecting to agent</option>
                      <option value="offline_only">Only when offline</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Connecting Message</label>
                    <input
                      type="text"
                      value={settings.chat.connectingMessage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, connectingMessage: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Prompt Message</label>
                    <input
                      type="text"
                      value={settings.chat.emailPromptMessage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, emailPromptMessage: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Agent Timeout (seconds)</label>
                    <p className="text-xs text-muted-foreground mb-1">Time to wait for an agent before showing offline mode</p>
                    <input
                      type="number"
                      value={settings.chat.agentTimeoutSeconds}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, agentTimeoutSeconds: parseInt(e.target.value) || 15 },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reply Time Message</label>
                    <input
                      type="text"
                      value={settings.chat.replyTimeMessage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, replyTimeMessage: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Offline Reply Time Message</label>
                    <input
                      type="text"
                      value={settings.chat.offlineReplyTimeMessage}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          chat: { ...settings.chat, offlineReplyTimeMessage: e.target.value },
                        })
                      }
                      className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sound Notifications</p>
                      <p className="text-sm text-muted-foreground">Play sound for new messages</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, soundEnabled: !settings.notifications.soundEnabled },
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.notifications.soundEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.notifications.soundEnabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Desktop Notifications</p>
                      <p className="text-sm text-muted-foreground">Show browser notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, desktopEnabled: !settings.notifications.desktopEnabled },
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.notifications.desktopEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.notifications.desktopEnabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email on New Ticket</p>
                      <p className="text-sm text-muted-foreground">Send email when a new ticket is created</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailOnNewTicket: !settings.notifications.emailOnNewTicket },
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.notifications.emailOnNewTicket ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.notifications.emailOnNewTicket ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Auto Response Settings */}
          {activeTab === "autoResponse" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Auto Response</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Auto Response</p>
                    <p className="text-sm text-muted-foreground">Send automatic reply when no agent is available</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        autoResponse: { ...settings.autoResponse, enabled: !settings.autoResponse.enabled },
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.autoResponse.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.autoResponse.enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium">Delay (seconds)</label>
                  <input
                    type="number"
                    value={settings.autoResponse.delaySeconds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoResponse: { ...settings.autoResponse, delaySeconds: parseInt(e.target.value) },
                      })
                    }
                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Auto Response Message</label>
                  <textarea
                    value={settings.autoResponse.message}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        autoResponse: { ...settings.autoResponse, message: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">AI Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable AI Assistant</p>
                    <p className="text-sm text-muted-foreground">Use AI to help with support responses</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        ai: { ...settings.ai, enabled: !settings.ai.enabled },
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.ai.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.ai.enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium">AI Model</label>
                  <select
                    value={settings.ai.model}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ai: { ...settings.ai, model: e.target.value },
                      })
                    }
                    className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                    <option value="gpt-4o">GPT-4o (Better)</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Suggest Responses</p>
                    <p className="text-sm text-muted-foreground">AI suggests responses while typing</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        ai: { ...settings.ai, autoSuggest: !settings.ai.autoSuggest },
                      })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      settings.ai.autoSuggest ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.ai.autoSuggest ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">AI Live Chat</h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable AI Chat</p>
                        <p className="text-sm text-muted-foreground">AI handles initial chat before agent handoff</p>
                      </div>
                      <button
                        onClick={() =>
                          setSettings({
                            ...settings,
                            ai: { ...settings.ai, chatEnabled: !settings.ai.chatEnabled },
                          })
                        }
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          settings.ai.chatEnabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                            settings.ai.chatEnabled ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Handoff Message</label>
                      <input
                        type="text"
                        value={settings.ai.handoffMessage}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            ai: { ...settings.ai, handoffMessage: e.target.value },
                          })
                        }
                        className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">AI Email Prompt</label>
                      <input
                        type="text"
                        value={settings.ai.emailPromptMessage}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            ai: { ...settings.ai, emailPromptMessage: e.target.value },
                          })
                        }
                        className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
