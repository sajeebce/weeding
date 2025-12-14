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

interface AutomationSettingsProps {
  onChangeDetected: () => void;
}

export function AutomationSettings({ onChangeDetected }: AutomationSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Auto Response */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Auto-Response</Label>
          <p className="text-sm text-muted-foreground">
            Automatic reply when a customer starts a conversation
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>Enable Auto-Response</Label>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>

        <div className="space-y-2">
          <Label>Auto-Response Message</Label>
          <Textarea
            defaultValue="Thanks for contacting us! An agent will respond to you shortly. In the meantime, feel free to describe your question in detail."
            placeholder="Enter your auto-response message..."
            rows={3}
            onChange={onChangeDetected}
          />
        </div>

        <div className="space-y-2">
          <Label>Send Auto-Response After (seconds)</Label>
          <Input
            type="number"
            defaultValue="5"
            min="1"
            max="60"
            className="w-32"
            onChange={onChangeDetected}
          />
        </div>
      </div>

      <Separator />

      {/* Auto-Close Tickets */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Auto-Close Tickets</Label>
          <p className="text-sm text-muted-foreground">
            Automatically close tickets after inactivity
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>Enable Auto-Close</Label>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Close "Resolved" Tickets After</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue="7"
                min="1"
                max="90"
                className="w-20"
                onChange={onChangeDetected}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Close "Waiting" Tickets After</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                defaultValue="14"
                min="1"
                max="90"
                className="w-20"
                onChange={onChangeDetected}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Send Warning Before Closing</Label>
            <p className="text-xs text-muted-foreground">
              Notify customer 24 hours before auto-close
            </p>
          </div>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>
      </div>

      <Separator />

      {/* Inactivity Alerts */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Inactivity Alerts</Label>
          <p className="text-sm text-muted-foreground">
            Change ticket status based on customer response
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>Enable Inactivity Tracking</Label>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>

        <div className="space-y-2">
          <Label>Mark as "Waiting on Customer" After</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              defaultValue="48"
              min="1"
              max="168"
              className="w-20"
              onChange={onChangeDetected}
            />
            <span className="text-sm text-muted-foreground">hours without customer reply</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Business Hours Response */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Outside Business Hours</Label>
          <p className="text-sm text-muted-foreground">
            What happens when customer messages outside operating hours
          </p>
        </div>

        <div className="space-y-2">
          <Label>Outside Hours Behavior</Label>
          <Select defaultValue="offline-form" onValueChange={onChangeDetected}>
            <SelectTrigger className="w-full sm:w-[300px]">
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
          <Label>Offline Form Message</Label>
          <Textarea
            defaultValue="We're currently offline. Please leave your message and contact details, and we'll get back to you within 24 hours."
            placeholder="Message shown with offline form..."
            rows={2}
            onChange={onChangeDetected}
          />
        </div>
      </div>

      <Separator />

      {/* SLA Response Time */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Response Time Goals (SLA)</Label>
          <p className="text-sm text-muted-foreground">
            Set target response times for different priorities
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label>Enable SLA Tracking</Label>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>

        <div className="space-y-3">
          {[
            { priority: "Urgent", color: "text-red-600", defaultTime: "1" },
            { priority: "High", color: "text-orange-600", defaultTime: "4" },
            { priority: "Medium", color: "text-yellow-600", defaultTime: "8" },
            { priority: "Low", color: "text-green-600", defaultTime: "24" },
          ].map((item) => (
            <div key={item.priority} className="flex items-center gap-4">
              <span className={`w-20 text-sm font-medium ${item.color}`}>
                {item.priority}
              </span>
              <Input
                type="number"
                defaultValue={item.defaultTime}
                min="1"
                max="168"
                className="w-20"
                onChange={onChangeDetected}
              />
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Alert When SLA Breached</Label>
            <p className="text-xs text-muted-foreground">
              Notify admins when response time goal is missed
            </p>
          </div>
          <Switch defaultChecked onCheckedChange={onChangeDetected} />
        </div>
      </div>
    </div>
  );
}
