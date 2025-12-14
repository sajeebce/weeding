"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, XCircle, Clock, Moon, Target } from "lucide-react";

interface AutomationSettingsProps {
  settings: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}

export function AutomationSettings({ settings, onUpdate }: AutomationSettingsProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Auto Response */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <CardTitle>Auto-Response</CardTitle>
          </div>
          <CardDescription>
            Automatic reply when a customer starts a conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-auto-response">Enable Auto-Response</Label>
            <Switch
              id="enable-auto-response"
              checked={settings.autoResponseEnabled !== false}
              onCheckedChange={(checked) => onUpdate("autoResponseEnabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-response-message">Auto-Response Message</Label>
            <Textarea
              id="auto-response-message"
              value={(settings.autoResponseMessage as string) || "Thank you for contacting us. We've received your message and will respond within 24 hours."}
              placeholder="Enter your auto-response message..."
              rows={3}
              onChange={(e) => onUpdate("autoResponseMessage", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auto-response-delay">Send Auto-Response After (seconds)</Label>
            <Input
              id="auto-response-delay"
              type="number"
              value={(settings.autoResponseDelay as number) || 5}
              min="1"
              max="60"
              className="w-32"
              onChange={(e) => onUpdate("autoResponseDelay", parseInt(e.target.value) || 5)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Close Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <CardTitle>Auto-Close Tickets</CardTitle>
          </div>
          <CardDescription>
            Automatically close tickets after inactivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-auto-close">Enable Auto-Close</Label>
            <Switch
              id="enable-auto-close"
              checked={settings.autoCloseEnabled !== false}
              onCheckedChange={(checked) => onUpdate("autoCloseEnabled", checked)}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="close-resolved-days">Close "Resolved" Tickets After</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="close-resolved-days"
                  type="number"
                  value={(settings.autoCloseDays as number) || 7}
                  min="1"
                  max="90"
                  className="w-20"
                  onChange={(e) => onUpdate("autoCloseDays", parseInt(e.target.value) || 7)}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="close-waiting-days">Warning Before Closing</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="close-waiting-days"
                  type="number"
                  value={(settings.autoCloseWarningDays as number) || 5}
                  min="1"
                  max="90"
                  className="w-20"
                  onChange={(e) => onUpdate("autoCloseWarningDays", parseInt(e.target.value) || 5)}
                />
                <span className="text-sm text-muted-foreground">days before</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-2xl">
            <div className="max-w-md">
              <Label htmlFor="warning-before-close">Send Warning Before Closing</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Notify customer before auto-close
              </p>
            </div>
            <Switch
              id="warning-before-close"
              checked={settings.sendAutoCloseWarning !== false}
              onCheckedChange={(checked) => onUpdate("sendAutoCloseWarning", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inactivity Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle>Inactivity Alerts</CardTitle>
          </div>
          <CardDescription>
            Change ticket status based on customer response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-inactivity">Enable Inactivity Tracking</Label>
            <Switch
              id="enable-inactivity"
              checked={settings.inactivityTrackingEnabled !== false}
              onCheckedChange={(checked) => onUpdate("inactivityTrackingEnabled", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inactivity-hours">Mark as "Waiting on Customer" After</Label>
            <div className="flex items-center gap-2">
              <Input
                id="inactivity-hours"
                type="number"
                value={(settings.inactivityHours as number) || 48}
                min="1"
                max="168"
                className="w-20"
                onChange={(e) => onUpdate("inactivityHours", parseInt(e.target.value) || 48)}
              />
              <span className="text-sm text-muted-foreground">hours without customer reply</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours Response */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <CardTitle>Outside Business Hours</CardTitle>
          </div>
          <CardDescription>
            What happens when customer messages outside operating hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="outside-hours-behavior">Outside Hours Behavior</Label>
            <Select
              value={(settings.outsideHoursBehavior as string) || "offline-form"}
              onValueChange={(value) => onUpdate("outsideHoursBehavior", value)}
            >
              <SelectTrigger id="outside-hours-behavior" className="max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offline-form">Show Offline Contact Form</SelectItem>
                <SelectItem value="allow-chat">Allow Chat (Notify Admin via Email)</SelectItem>
                <SelectItem value="hide-widget">Hide Widget Completely</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offline-form-message">Offline Form Message</Label>
            <Textarea
              id="offline-form-message"
              value={(settings.offlineFormMessage as string) || "We're currently offline. Please leave your message and contact details, and we'll get back to you within 24 hours."}
              placeholder="Message shown with offline form..."
              rows={2}
              onChange={(e) => onUpdate("offlineFormMessage", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SLA Response Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <CardTitle>Response Time Goals (SLA)</CardTitle>
          </div>
          <CardDescription>
            Set target response times for different priorities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-sla">Enable SLA Tracking</Label>
            <Switch
              id="enable-sla"
              checked={settings.slaEnabled !== false}
              onCheckedChange={(checked) => onUpdate("slaEnabled", checked)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="sla-first-response">First Response Target</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sla-first-response"
                  type="number"
                  value={(settings.slaFirstResponseHours as number) || 4}
                  min="1"
                  max="168"
                  className="w-20"
                  onChange={(e) => onUpdate("slaFirstResponseHours", parseInt(e.target.value) || 4)}
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sla-resolution">Resolution Target</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="sla-resolution"
                  type="number"
                  value={(settings.slaResolutionHours as number) || 48}
                  min="1"
                  max="168"
                  className="w-20"
                  onChange={(e) => onUpdate("slaResolutionHours", parseInt(e.target.value) || 48)}
                />
                <span className="text-sm text-muted-foreground">hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between max-w-2xl">
            <div className="max-w-md">
              <Label htmlFor="alert-sla-breach">Alert When SLA Breached</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Notify admins when response time goal is missed
              </p>
            </div>
            <Switch
              id="alert-sla-breach"
              checked={settings.alertOnSlaBreach !== false}
              onCheckedChange={(checked) => onUpdate("alertOnSlaBreach", checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
