"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, MessageSquare, Move, Palette, MessageCircle, Settings } from "lucide-react";

interface ChatWidgetSettingsProps {
  settings: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}

export function ChatWidgetSettings({ settings, onUpdate }: ChatWidgetSettingsProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Widget Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Live Chat Widget</CardTitle>
          </div>
          <CardDescription>
            Show the floating chat button on your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-widget">Enable Live Chat Widget</Label>
            <Switch
              id="enable-widget"
              checked={settings.enabled !== false}
              onCheckedChange={(checked) => onUpdate("enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Position & Size */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            <CardTitle>Widget Position & Size</CardTitle>
          </div>
          <CardDescription>
            Where the chat button appears on the screen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="widget-position">Position</Label>
              <Select
                value={(settings.position as string) || "bottom-right"}
                onValueChange={(value) => onUpdate("position", value)}
              >
                <SelectTrigger id="widget-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-size">Button Size</Label>
              <Select
                value={(settings.buttonSize as string) || "medium"}
                onValueChange={(value) => onUpdate("buttonSize", value)}
              >
                <SelectTrigger id="widget-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (48px)</SelectItem>
                  <SelectItem value="medium">Medium (60px)</SelectItem>
                  <SelectItem value="large">Large (72px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="horizontal-offset">Horizontal Offset (px)</Label>
              <Input
                id="horizontal-offset"
                type="number"
                value={(settings.horizontalOffset as number) || 24}
                min="0"
                max="100"
                onChange={(e) => onUpdate("horizontalOffset", parseInt(e.target.value) || 24)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vertical-offset">Vertical Offset (px)</Label>
              <Input
                id="vertical-offset"
                type="number"
                value={(settings.verticalOffset as number) || 24}
                min="0"
                max="100"
                onChange={(e) => onUpdate("verticalOffset", parseInt(e.target.value) || 24)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize colors and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={(settings.primaryColor as string) || "#2563eb"}
                  className="h-10 w-16 cursor-pointer p-1"
                  onChange={(e) => onUpdate("primaryColor", e.target.value)}
                />
                <Input
                  value={(settings.primaryColor as string) || "#2563eb"}
                  placeholder="#2563eb"
                  className="flex-1"
                  onChange={(e) => onUpdate("primaryColor", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={(settings.textColor as string) || "#ffffff"}
                  className="h-10 w-16 cursor-pointer p-1"
                  onChange={(e) => onUpdate("textColor", e.target.value)}
                />
                <Input
                  value={(settings.textColor as string) || "#ffffff"}
                  placeholder="#ffffff"
                  className="flex-1"
                  onChange={(e) => onUpdate("textColor", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="widget-logo">Widget Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <Button variant="outline" size="sm">
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 1MB. Recommended: 64x64px
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="show-agent-photo">Show Agent Photo</Label>
            <Switch
              id="show-agent-photo"
              checked={settings.showAgentPhoto !== false}
              onCheckedChange={(checked) => onUpdate("showAgentPhoto", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle>Widget Messages</CardTitle>
          </div>
          <CardDescription>
            Customize the text displayed in the widget
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="button-text">Button Text</Label>
            <Input
              id="button-text"
              value={(settings.buttonText as string) || "Chat with us"}
              placeholder="Chat with us"
              onChange={(e) => onUpdate("buttonText", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message (Online)</Label>
            <Textarea
              id="welcome-message"
              value={(settings.welcomeMessage as string) || "Hi! How can we help you today?"}
              placeholder="Welcome message when agents are online"
              rows={2}
              onChange={(e) => onUpdate("welcomeMessage", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="away-message">Away Message</Label>
            <Textarea
              id="away-message"
              value={(settings.awayMessage as string) || "We're not available right now, but leave a message and we'll get back to you soon!"}
              placeholder="Message when agents are away"
              rows={2}
              onChange={(e) => onUpdate("awayMessage", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offline-message">Offline Message</Label>
            <Textarea
              id="offline-message"
              value={(settings.offlineMessage as string) || "We're currently offline. Leave a message and we'll get back to you."}
              placeholder="Message when support is offline"
              rows={2}
              onChange={(e) => onUpdate("offlineMessage", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Behavior */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Widget Behavior</CardTitle>
          </div>
          <CardDescription>
            Control how the widget behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <Label htmlFor="auto-open">Auto-open on First Visit</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically open the widget for new visitors
              </p>
            </div>
            <Switch
              id="auto-open"
              checked={settings.autoOpen === true}
              onCheckedChange={(checked) => onUpdate("autoOpen", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <Label htmlFor="unread-badge">Show Unread Badge</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Display badge with unread message count
              </p>
            </div>
            <Switch
              id="unread-badge"
              checked={settings.showUnreadBadge !== false}
              onCheckedChange={(checked) => onUpdate("showUnreadBadge", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <Label htmlFor="sound-notification">Play Sound on New Message</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Play notification sound for new messages
              </p>
            </div>
            <Switch
              id="sound-notification"
              checked={settings.soundNotifications !== false}
              onCheckedChange={(checked) => onUpdate("soundNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="max-w-md">
              <Label htmlFor="powered-by">Show "Powered by" Footer</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Display attribution in widget footer
              </p>
            </div>
            <Switch
              id="powered-by"
              checked={settings.showPoweredBy !== false}
              onCheckedChange={(checked) => onUpdate("showPoweredBy", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Button */}
      <div className="flex justify-end">
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Preview Widget
        </Button>
      </div>
    </div>
  );
}
