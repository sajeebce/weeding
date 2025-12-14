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
import { Separator } from "@/components/ui/separator";
import { Upload, Eye } from "lucide-react";

interface ChatWidgetSettingsProps {
  onChangeDetected: () => void;
}

export function ChatWidgetSettings({ onChangeDetected }: ChatWidgetSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Widget Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base">Enable Live Chat Widget</Label>
          <p className="text-sm text-muted-foreground">
            Show the floating chat button on your website
          </p>
        </div>
        <Switch defaultChecked onCheckedChange={onChangeDetected} />
      </div>

      <Separator />

      {/* Position & Size */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Widget Position</Label>
          <p className="text-sm text-muted-foreground">
            Where the chat button appears on the screen
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select defaultValue="bottom-right" onValueChange={onChangeDetected}>
              <SelectTrigger>
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
            <Label>Button Size</Label>
            <Select defaultValue="medium" onValueChange={onChangeDetected}>
              <SelectTrigger>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Horizontal Offset (px)</Label>
            <Input
              type="number"
              defaultValue="24"
              min="0"
              max="100"
              onChange={onChangeDetected}
            />
          </div>
          <div className="space-y-2">
            <Label>Vertical Offset (px)</Label>
            <Input
              type="number"
              defaultValue="24"
              min="0"
              max="100"
              onChange={onChangeDetected}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Appearance */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Appearance</Label>
          <p className="text-sm text-muted-foreground">
            Customize colors and branding
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                defaultValue="#667eea"
                className="h-10 w-16 cursor-pointer p-1"
                onChange={onChangeDetected}
              />
              <Input
                defaultValue="#667eea"
                placeholder="#667eea"
                className="flex-1"
                onChange={onChangeDetected}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                defaultValue="#ffffff"
                className="h-10 w-16 cursor-pointer p-1"
                onChange={onChangeDetected}
              />
              <Input
                defaultValue="#ffffff"
                placeholder="#ffffff"
                className="flex-1"
                onChange={onChangeDetected}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Widget Logo</Label>
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
      </div>

      <Separator />

      {/* Messages */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Widget Messages</Label>
          <p className="text-sm text-muted-foreground">
            Customize the text displayed in the widget
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              defaultValue="Chat with us"
              placeholder="Chat with us"
              onChange={onChangeDetected}
            />
          </div>

          <div className="space-y-2">
            <Label>Welcome Message (Online)</Label>
            <Textarea
              defaultValue="Hi! How can we help you today?"
              placeholder="Welcome message when agents are online"
              rows={2}
              onChange={onChangeDetected}
            />
          </div>

          <div className="space-y-2">
            <Label>Away Message</Label>
            <Textarea
              defaultValue="We're not available right now, but leave a message and we'll get back to you soon!"
              placeholder="Message when agents are away"
              rows={2}
              onChange={onChangeDetected}
            />
          </div>

          <div className="space-y-2">
            <Label>Offline Message</Label>
            <Textarea
              defaultValue="We're offline. Please leave your details and we'll contact you within 24 hours."
              placeholder="Message when support is offline"
              rows={2}
              onChange={onChangeDetected}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Behavior */}
      <div className="space-y-4">
        <div>
          <Label className="text-base">Widget Behavior</Label>
          <p className="text-sm text-muted-foreground">
            Control how the widget behaves
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-open on First Visit</Label>
              <p className="text-sm text-muted-foreground">
                Automatically open the widget for new visitors
              </p>
            </div>
            <Switch onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show Unread Badge</Label>
              <p className="text-sm text-muted-foreground">
                Display badge with unread message count
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Play Sound on New Message</Label>
              <p className="text-sm text-muted-foreground">
                Play notification sound for new messages
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Show "Powered by" Footer</Label>
              <p className="text-sm text-muted-foreground">
                Display attribution in widget footer
              </p>
            </div>
            <Switch defaultChecked onCheckedChange={onChangeDetected} />
          </div>
        </div>
      </div>

      <Separator />

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
