"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  sanitizePhone,
  sanitizeName,
  sanitizeEmail,
  sanitizeText,
  INPUT_LIMITS
} from "@/lib/utils";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@llcpad.com",
    href: "mailto:support@llcpad.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (234) 567-890",
    href: "tel:+1234567890",
  },
  {
    icon: MapPin,
    title: "Address",
    value: "30 N Gould St, Sheridan, WY 82801, USA",
    href: null,
  },
  {
    icon: Clock,
    title: "Business Hours",
    value: "Mon-Fri: 9AM-6PM EST",
    href: null,
  },
];

const subjects = [
  { value: "general", label: "General Inquiry" },
  { value: "llc", label: "LLC Formation" },
  { value: "ein", label: "EIN Application" },
  { value: "amazon", label: "Amazon Seller Account" },
  { value: "support", label: "Existing Order Support" },
  { value: "partnership", label: "Partnership Opportunity" },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    switch (name) {
      case "firstName":
      case "lastName":
        sanitizedValue = sanitizeName(value, INPUT_LIMITS.firstName.max);
        break;
      case "email":
        sanitizedValue = sanitizeEmail(value);
        break;
      case "phone":
        sanitizedValue = sanitizePhone(value);
        break;
      case "message":
        sanitizedValue = sanitizeText(value, INPUT_LIMITS.message.max);
        break;
      default:
        sanitizedValue = sanitizeText(value, 200);
    }

    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Contact Us
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions about our services? We're here to help. Reach out and
            our team will respond within 24 hours.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <Card key={info.title}>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <info.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {info.title}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Chat CTA */}
            <Card className="mt-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Need Help Now?</p>
                    <p className="text-sm text-muted-foreground">
                      Chat with our team
                    </p>
                  </div>
                </div>
                <Button className="mt-4 w-full" size="sm">
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Send className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Message Sent!
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Thank you for reaching out. We'll get back to you within
                      24 hours.
                    </p>
                    <Button
                      className="mt-6"
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          maxLength={INPUT_LIMITS.firstName.max}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          maxLength={INPUT_LIMITS.lastName.max}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          maxLength={INPUT_LIMITS.email.max}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 234 567 890"
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength={INPUT_LIMITS.phone.max}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        name="subject"
                        value={formData.subject}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help you..."
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        maxLength={INPUT_LIMITS.message.max}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By submitting this form, you agree to our{" "}
                      <a href="/privacy" className="underline hover:text-primary">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
