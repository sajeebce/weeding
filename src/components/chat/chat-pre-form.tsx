"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  sanitizePhone,
  sanitizeName,
  sanitizeEmail,
  INPUT_LIMITS
} from "@/lib/utils";

interface ChatPreFormProps {
  onSubmit: (data: { name: string; email: string; phone?: string }) => void;
  isLoading: boolean;
  collectPhone?: boolean;
}

export function ChatPreForm({
  onSubmit,
  isLoading,
  collectPhone = false,
}: ChatPreFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Welcome message */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Start a Conversation</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please provide your details to begin chatting with our support team.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chat-name">Name *</Label>
          <Input
            id="chat-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(sanitizeName(e.target.value, INPUT_LIMITS.name.max));
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            disabled={isLoading}
            maxLength={INPUT_LIMITS.name.max}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="chat-email">Email *</Label>
          <Input
            id="chat-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(sanitizeEmail(e.target.value));
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            disabled={isLoading}
            maxLength={INPUT_LIMITS.email.max}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {collectPhone && (
          <div className="space-y-2">
            <Label htmlFor="chat-phone">Phone (Optional)</Label>
            <Input
              id="chat-phone"
              type="tel"
              placeholder="+1 234 567 890"
              value={phone}
              onChange={(e) => setPhone(sanitizePhone(e.target.value))}
              disabled={isLoading}
              maxLength={INPUT_LIMITS.phone.max}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            "Start Chat"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By starting a chat, you agree to our{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}
