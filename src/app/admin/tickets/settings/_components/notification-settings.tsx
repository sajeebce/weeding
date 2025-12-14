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
import { Separator } from "@/components/ui/separator";
import { Volume2, Mail, Bell, Send } from "lucide-react";

interface NotificationSettingsProps {
  onChangeDetected: () => void;
}

export function NotificationSettings({ onChangeDetected }: NotificationSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Desktop Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <Label className="text-base">Desktop Notifications</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Browser notifications for admin users
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Browser Notifications</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <Label>New Ticket Created</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <Label>New Message Received</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Ticket Assigned to Me</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Mentioned in Internal Note</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Sound Alerts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <Label className="text-base">Sound Alerts</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Audio notifications for incoming events
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Enable Sound Alerts</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Notification Sound</Label>
              <div className="flex gap-2">
                <Select defaultValue="chime" onValueChange={onChangeDetected}>
                  <SelectTrigger className="flex-1">
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
                <Button variant="outline" size="icon">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Volume</Label>
              <Input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-full"
                onChange={onChangeDetected}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Email Notifications - Admin */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <Label className="text-base">Email Notifications (Admin)</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Email alerts for support staff
        </p>

        <div className="space-y-2">
          <Label>Notification Email Address</Label>
          <Input
            type="email"
            defaultValue="support@llcpad.com"
            placeholder="support@example.com"
            onChange={onChangeDetected}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>New Message When Offline</Label>
              <p className="text-xs text-muted-foreground">
                Receive email when you're not online
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>New Ticket Created</Label>
              <p className="text-xs text-muted-foreground">
                Email when a new ticket is created
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Ticket Assigned to Me</Label>
              <p className="text-xs text-muted-foreground">
                Email when ticket is assigned
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Digest Summary</Label>
              <p className="text-xs text-muted-foreground">
                Daily summary of support activity
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Digest Time</Label>
              <Input
                type="time"
                defaultValue="09:00"
                onChange={onChangeDetected}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="asia-dhaka" onValueChange={onChangeDetected}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia-dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                  <SelectItem value="america-new_york">America/New York</SelectItem>
                  <SelectItem value="europe-london">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Email Notifications - Customer */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          <Label className="text-base">Email Notifications (Customer)</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Emails sent to customers
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email When Agent Replies</Label>
              <p className="text-xs text-muted-foreground">
                Notify customer of new replies
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Chat Summary on Resolution</Label>
              <p className="text-xs text-muted-foreground">
                Send conversation transcript when ticket is resolved
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Ticket Status Updates</Label>
              <p className="text-xs text-muted-foreground">
                Notify when ticket status changes
              </p>
            </div>
            <Switch onCheckedChange={onChangeDetected} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>From Name</Label>
            <Input
              defaultValue="LLCPad Support"
              placeholder="Support Team"
              onChange={onChangeDetected}
            />
          </div>
          <div className="space-y-2">
            <Label>Reply-To Email</Label>
            <Input
              type="email"
              defaultValue="support@llcpad.com"
              placeholder="support@example.com"
              onChange={onChangeDetected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
