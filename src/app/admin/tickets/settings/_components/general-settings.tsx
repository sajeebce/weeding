"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GeneralSettingsProps {
  settings: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}

interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: Record<string, { enabled: boolean; start: string; end: string }>;
}

const defaultBusinessHours: BusinessHours = {
  enabled: true,
  timezone: "Asia/Dhaka",
  schedule: {
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: true, start: "09:00", end: "15:00" },
    sunday: { enabled: false, start: "", end: "" },
  },
};

export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  const businessHours = (settings.businessHours as BusinessHours) || defaultBusinessHours;

  const updateBusinessHours = (updates: Partial<BusinessHours>) => {
    onUpdate("businessHours", { ...businessHours, ...updates });
  };

  const updateDaySchedule = (day: string, field: string, value: string | boolean) => {
    const newSchedule = {
      ...businessHours.schedule,
      [day]: {
        ...businessHours.schedule[day],
        [field]: value,
      },
    };
    onUpdate("businessHours", { ...businessHours, schedule: newSchedule });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Support System Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Support System Status</CardTitle>
          <CardDescription>
            Enable or disable the entire support system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between max-w-md">
            <Label htmlFor="enable-system">Enable Support System</Label>
            <Switch
              id="enable-system"
              checked={settings.enabled !== false}
              onCheckedChange={(checked) => onUpdate("enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>
            Set when your support team is available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 max-w-md">
            <Switch
              id="use-hours"
              checked={businessHours.enabled}
              onCheckedChange={(checked) => updateBusinessHours({ enabled: checked })}
            />
            <Label htmlFor="use-hours">Use operating hours (show offline outside these hours)</Label>
          </div>

          <div className="space-y-2 max-w-sm">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={businessHours.timezone || "Asia/Dhaka"}
              onValueChange={(value) => updateBusinessHours({ timezone: value })}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {Object.entries(businessHours.schedule).map(([day, schedule]) => (
              <div key={day} className="flex items-center gap-4">
                <Switch
                  id={`day-${day}`}
                  checked={schedule.enabled}
                  onCheckedChange={(checked) => updateDaySchedule(day, "enabled", checked)}
                />
                <span className="w-28 text-sm font-medium capitalize">{day}</span>
                <Input
                  type="time"
                  value={schedule.start}
                  className="w-36"
                  onChange={(e) => updateDaySchedule(day, "start", e.target.value)}
                  aria-label={`${day} start time`}
                  disabled={!schedule.enabled}
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={schedule.end}
                  className="w-36"
                  onChange={(e) => updateDaySchedule(day, "end", e.target.value)}
                  aria-label={`${day} end time`}
                  disabled={!schedule.enabled}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Settings</CardTitle>
          <CardDescription>
            Configure ticket numbering and defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prefix">Ticket Number Prefix</Label>
              <Input
                id="prefix"
                value={(settings.ticketPrefix as string) || "TKT"}
                placeholder="TKT"
                onChange={(e) => onUpdate("ticketPrefix", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Default Priority</Label>
              <Select
                value={(settings.defaultPriority as string) || "MEDIUM"}
                onValueChange={(value) => onUpdate("defaultPriority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <Label htmlFor="assignment">Default Assignment</Label>
            <Select
              value={settings.autoAssign ? "round-robin" : "unassigned"}
              onValueChange={(value) => onUpdate("autoAssign", value !== "unassigned")}
            >
              <SelectTrigger id="assignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                <SelectItem value="round-robin">Round Robin (Auto-assign)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guest Chat Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Chat Requirements</CardTitle>
          <CardDescription>
            What information to collect from guests before chat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <Label htmlFor="req-name">Require Name</Label>
            <Switch
              id="req-name"
              checked={settings.collectName !== false}
              onCheckedChange={(checked) => onUpdate("collectName", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="req-email">Require Email</Label>
            <Switch
              id="req-email"
              checked={settings.collectEmail !== false}
              onCheckedChange={(checked) => onUpdate("collectEmail", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-phone">Show Phone Field (Optional)</Label>
            <Switch
              id="show-phone"
              checked={settings.collectPhone === true}
              onCheckedChange={(checked) => onUpdate("collectPhone", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="require-email">Require Email for Chat</Label>
            <Switch
              id="require-email"
              checked={settings.requireEmailForChat !== false}
              onCheckedChange={(checked) => onUpdate("requireEmailForChat", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Your support team details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={(settings.businessName as string) || "LLCPad Support"}
                placeholder="Your Business Name"
                onChange={(e) => onUpdate("businessName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={(settings.supportEmail as string) || "support@llcpad.com"}
                placeholder="support@example.com"
                onChange={(e) => onUpdate("supportEmail", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
