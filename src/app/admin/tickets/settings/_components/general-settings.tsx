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
import { Separator } from "@/components/ui/separator";

interface GeneralSettingsProps {
  onChangeDetected: () => void;
}

export function GeneralSettings({ onChangeDetected }: GeneralSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Support System Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Enable Support System</Label>
          <p className="text-sm text-muted-foreground">
            Turn the entire support system on or off
          </p>
        </div>
        <Switch defaultChecked onCheckedChange={onChangeDetected} />
      </div>

      <Separator />

      {/* Operating Hours */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Operating Hours</Label>
          <p className="text-sm text-muted-foreground">
            Set when your support team is available
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
          <Label>Use operating hours (show offline outside these hours)</Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select defaultValue="asia-dhaka" onValueChange={onChangeDetected}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asia-dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                <SelectItem value="america-new_york">America/New York (EST)</SelectItem>
                <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                <SelectItem value="asia-dubai">Asia/Dubai (GMT+4)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {["Monday - Friday", "Saturday", "Sunday"].map((day, index) => (
            <div key={day} className="flex items-center gap-4">
              <Switch
                defaultChecked={index < 2}
                onCheckedChange={onChangeDetected}
              />
              <span className="w-32 text-sm">{day}</span>
              <Input
                type="time"
                defaultValue={index === 2 ? "" : "09:00"}
                className="w-28"
                onChange={onChangeDetected}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="time"
                defaultValue={index === 2 ? "" : index === 1 ? "15:00" : "18:00"}
                className="w-28"
                onChange={onChangeDetected}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Ticket Settings */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Ticket Settings</Label>
          <p className="text-sm text-muted-foreground">
            Configure ticket numbering and defaults
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Ticket Number Prefix</Label>
            <Input
              defaultValue="TKT"
              placeholder="TKT"
              onChange={onChangeDetected}
            />
          </div>

          <div className="space-y-2">
            <Label>Default Priority</Label>
            <Select defaultValue="medium" onValueChange={onChangeDetected}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Default Assignment</Label>
          <Select defaultValue="unassigned" onValueChange={onChangeDetected}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Leave Unassigned</SelectItem>
              <SelectItem value="round-robin">Round Robin (Auto-assign)</SelectItem>
              <SelectItem value="least-busy">Assign to Least Busy Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Customer Requirements */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Guest Chat Requirements</Label>
          <p className="text-sm text-muted-foreground">
            What information to collect from guests before chat
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Require Name</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require Email</Label>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Phone Field (Optional)</Label>
            <Switch onCheckedChange={onChangeDetected} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow Anonymous Chat</Label>
            <Switch onCheckedChange={onChangeDetected} />
          </div>
        </div>
      </div>

      <Separator />

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">File Upload Settings</Label>
          <p className="text-sm text-muted-foreground">
            Configure allowed file types and sizes
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>Allow File Uploads</Label>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Max File Size (MB)</Label>
            <Input
              type="number"
              defaultValue="10"
              min="1"
              max="50"
              onChange={onChangeDetected}
            />
          </div>

          <div className="space-y-2">
            <Label>Allowed File Types</Label>
            <Input
              defaultValue="jpg,png,gif,pdf,doc,docx"
              placeholder="jpg,png,pdf"
              onChange={onChangeDetected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
