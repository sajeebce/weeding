"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Sparkles,
  Brain,
  MessageSquare,
  Zap,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIAssistantSettingsProps {
  onChangeDetected: () => void;
}

export function AIAssistantSettings({ onChangeDetected }: AIAssistantSettingsProps) {
  return (
    <div className="space-y-8">
      {/* Coming Soon Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          AI Assistant is currently in development. This feature will provide automatic
          responses, smart suggestions, and AI-powered customer support.
        </AlertDescription>
      </Alert>

      {/* Feature Overview */}
      <div className="rounded-lg border bg-gradient-to-br from-purple-500/5 to-blue-500/10 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-purple-500/10 p-3">
            <Bot className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI-Powered Support Assistant</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Let AI handle common questions automatically while escalating complex
              issues to human agents. Trained on your knowledge base for accurate responses.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Sparkles className="mr-1 h-3 w-3" />
                Auto-Reply
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Brain className="mr-1 h-3 w-3" />
                Smart Suggestions
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <MessageSquare className="mr-1 h-3 w-3" />
                Draft Responses
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Zap className="mr-1 h-3 w-3" />
                Instant Answers
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* AI Mode Settings */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">AI Assistant Mode</Label>
          <p className="text-sm text-muted-foreground">
            Choose how AI interacts with customers
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-4 rounded-lg border p-4">
            <input type="radio" name="ai-mode" className="mt-1" disabled />
            <div>
              <Label className="font-medium">Suggestion Mode (Recommended)</Label>
              <p className="text-sm text-muted-foreground">
                AI suggests responses that agents can review and send. Best for quality control.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border p-4">
            <input type="radio" name="ai-mode" className="mt-1" disabled />
            <div>
              <Label className="font-medium">Auto-Reply Mode</Label>
              <p className="text-sm text-muted-foreground">
                AI automatically responds to simple questions. Complex issues are escalated.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-lg border p-4">
            <input type="radio" name="ai-mode" className="mt-1" disabled />
            <div>
              <Label className="font-medium">Disabled</Label>
              <p className="text-sm text-muted-foreground">
                AI features are turned off. All conversations handled by human agents.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* AI Behavior */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">AI Behavior</Label>
          <p className="text-sm text-muted-foreground">
            Fine-tune how the AI responds
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Response Confidence Threshold</Label>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Slider
              defaultValue={[75]}
              max={100}
              min={50}
              step={5}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              AI will only auto-reply when confidence is above this threshold
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Response Temperature</Label>
              <span className="text-sm text-muted-foreground">0.3 (Focused)</span>
            </div>
            <Slider
              defaultValue={[30]}
              max={100}
              min={0}
              step={10}
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Lower = more consistent, Higher = more creative
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>AI Personality / Tone</Label>
          <Select defaultValue="professional" disabled>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional & Helpful</SelectItem>
              <SelectItem value="friendly">Friendly & Casual</SelectItem>
              <SelectItem value="formal">Formal & Detailed</SelectItem>
              <SelectItem value="concise">Concise & Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Custom Instructions</Label>
          <Textarea
            placeholder="Add any specific instructions for the AI assistant..."
            rows={3}
            disabled
            defaultValue="Always greet customers warmly. If unsure, offer to connect with a human agent. Never make promises about timelines without checking."
          />
        </div>
      </div>

      <Separator />

      {/* Auto-Reply Settings */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">Auto-Reply Settings</Label>
          <p className="text-sm text-muted-foreground">
            Configure automatic AI responses
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Auto-Reply</Label>
              <p className="text-xs text-muted-foreground">
                Let AI respond automatically to simple questions
              </p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Only During Business Hours</Label>
              <p className="text-xs text-muted-foreground">
                Auto-reply only when human agents are available
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Disclose AI Responses</Label>
              <p className="text-xs text-muted-foreground">
                Show "AI Assistant" label on automated responses
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="space-y-2">
            <Label>Max Auto-Replies Per Conversation</Label>
            <Input
              type="number"
              defaultValue="3"
              min="1"
              max="10"
              className="w-24"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              After this, AI will offer human agent handoff
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Escalation Rules */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">Escalation Rules</Label>
          <p className="text-sm text-muted-foreground">
            When to transfer to human agents
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Customer requests human agent</Label>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label>AI confidence below threshold</Label>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sensitive topics detected</Label>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label>Payment or refund mentioned</Label>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label>Negative sentiment detected</Label>
            <Switch defaultChecked disabled />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Escalation Keywords (comma-separated)</Label>
          <Input
            defaultValue="refund, cancel, complaint, manager, lawyer, sue"
            disabled
          />
        </div>
      </div>

      <Separator />

      {/* Safety & Compliance */}
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <Label className="text-base">Safety & Compliance</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Ensure AI responses meet your standards
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Content Moderation</Label>
              <p className="text-xs text-muted-foreground">
                Filter inappropriate or harmful content
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Legal Disclaimer</Label>
              <p className="text-xs text-muted-foreground">
                Remind users this is AI, not legal advice
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Log All AI Interactions</Label>
              <p className="text-xs text-muted-foreground">
                Keep records for review and improvement
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <Separator />

      <div className="space-y-4 opacity-60 pointer-events-none">
        <div>
          <Label className="text-base">AI Provider Configuration</Label>
          <p className="text-sm text-muted-foreground">
            Connect your AI service
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select defaultValue="openai" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="google">Google (Gemini)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select defaultValue="gpt-4o-mini" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (Best)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>API Key</Label>
          <Input
            type="password"
            placeholder="sk-..."
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Your API key is encrypted and stored securely
          </p>
        </div>
      </div>
    </div>
  );
}
