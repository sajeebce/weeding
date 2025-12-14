"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Mail, Bell, Send } from "lucide-react";

interface NotificationSettingsProps {
  settings: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}

export function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Desktop Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Desktop Notifications</CardTitle>
          </div>
          <CardDescription>
            Browser notifications for admin users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-browser">Enable Browser Notifications</Label>
            <Switch
              id="enable-browser"
              checked={settings.browserNotifications !== false}
              onCheckedChange={(checked) => onUpdate("browserNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-new-ticket">New Ticket Created</Label>
            <Switch
              id="notify-new-ticket"
              checked={settings.notifyNewTicket !== false}
              onCheckedChange={(checked) => onUpdate("notifyNewTicket", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-message">New Message Received</Label>
            <Switch
              id="notify-message"
              checked={settings.notifyNewMessage !== false}
              onCheckedChange={(checked) => onUpdate("notifyNewMessage", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-assigned">Ticket Assigned to Me</Label>
            <Switch
              id="notify-assigned"
              checked={settings.notifyAssigned !== false}
              onCheckedChange={(checked) => onUpdate("notifyAssigned", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notify-mention">Mentioned in Internal Note</Label>
            <Switch
              id="notify-mention"
              checked={settings.notifyMention !== false}
              onCheckedChange={(checked) => onUpdate("notifyMention", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <CardTitle>Sound Alerts</CardTitle>
          </div>
          <CardDescription>
            Audio notifications for incoming events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-sound">Enable Sound Alerts</Label>
            <Switch
              id="enable-sound"
              checked={settings.soundNotifications !== false}
              onCheckedChange={(checked) => onUpdate("soundNotifications", checked)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sound-type">Notification Sound</Label>
              <div className="flex gap-2">
                <Select
                  value={(settings.notificationSound as string) || "chime"}
                  onValueChange={(value) => onUpdate("notificationSound", value)}
                >
                  <SelectTrigger id="sound-type" className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chime">Gentle Chime</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="ding">Ding</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="none">No Sound</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" type="button">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                type="range"
                min="0"
                max="100"
                value={(settings.soundVolume as number) || 70}
                className="w-full"
                onChange={(e) => onUpdate("soundVolume", parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications - Admin */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Notifications (Admin)</CardTitle>
          </div>
          <CardDescription>
            Email alerts for support staff
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="admin-email">Notification Email Address</Label>
            <Input
              id="admin-email"
              type="email"
              value={(settings.adminEmail as string) || "support@llcpad.com"}
              placeholder="support@example.com"
              onChange={(e) => onUpdate("adminEmail", e.target.value)}
            />
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="email-offline">New Message When Offline</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive email when you're not online
                </p>
              </div>
              <Switch
                id="email-offline"
                checked={settings.emailWhenOffline !== false}
                onCheckedChange={(checked) => onUpdate("emailWhenOffline", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="email-new-ticket">New Ticket Created</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Email when a new ticket is created
                </p>
              </div>
              <Switch
                id="email-new-ticket"
                checked={settings.emailOnNewTicket !== false}
                onCheckedChange={(checked) => onUpdate("emailOnNewTicket", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="email-assigned">Ticket Assigned to Me</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Email when ticket is assigned
                </p>
              </div>
              <Switch
                id="email-assigned"
                checked={settings.emailOnAssigned !== false}
                onCheckedChange={(checked) => onUpdate("emailOnAssigned", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="email-digest">Daily Digest Summary</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Daily summary of support activity
                </p>
              </div>
              <Switch
                id="email-digest"
                checked={settings.dailyDigest === true}
                onCheckedChange={(checked) => onUpdate("dailyDigest", checked)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="digest-time">Digest Time</Label>
              <Input
                id="digest-time"
                type="time"
                value={(settings.digestTime as string) || "09:00"}
                onChange={(e) => onUpdate("digestTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digest-tz">Timezone</Label>
              <Select
                value={(settings.digestTimezone as string) || "Asia/Dhaka"}
                onValueChange={(value) => onUpdate("digestTimezone", value)}
              >
                <SelectTrigger id="digest-tz">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                  <SelectItem value="America/New_York">America/New York</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications - Customer */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            <CardTitle>Email Notifications (Customer)</CardTitle>
          </div>
          <CardDescription>
            Emails sent to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="customer-reply">Email When Agent Replies</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Notify customer of new replies
                </p>
              </div>
              <Switch
                id="customer-reply"
                checked={settings.emailOnReply !== false}
                onCheckedChange={(checked) => onUpdate("emailOnReply", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="customer-summary">Chat Summary on Resolution</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Send conversation transcript when ticket is resolved
                </p>
              </div>
              <Switch
                id="customer-summary"
                checked={settings.emailOnResolution !== false}
                onCheckedChange={(checked) => onUpdate("emailOnResolution", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="max-w-md">
                <Label htmlFor="customer-status">Ticket Status Updates</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Notify when ticket status changes
                </p>
              </div>
              <Switch
                id="customer-status"
                checked={settings.emailOnStatusChange === true}
                onCheckedChange={(checked) => onUpdate("emailOnStatusChange", checked)}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                value={(settings.fromName as string) || "LLCPad Support"}
                placeholder="Support Team"
                onChange={(e) => onUpdate("fromName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply-to">Reply-To Email</Label>
              <Input
                id="reply-to"
                type="email"
                value={(settings.replyToEmail as string) || "support@llcpad.com"}
                placeholder="support@example.com"
                onChange={(e) => onUpdate("replyToEmail", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
