"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  ExternalLink,
  Loader2,
  Building2,
  CreditCard,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

const helpCategories = [
  {
    title: "LLC Formation",
    description: "Questions about forming your LLC",
    icon: Building2,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Payments & Billing",
    description: "Payment methods, invoices, refunds",
    icon: CreditCard,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Documents",
    description: "Uploading and downloading documents",
    icon: FileCheck,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Account Security",
    description: "Password, 2FA, account access",
    icon: ShieldCheck,
    color: "bg-orange-100 text-orange-600",
  },
];

const quickLinks = [
  { title: "How to form an LLC", href: "/blog/how-to-form-llc" },
  { title: "Understanding EIN", href: "/blog/what-is-ein" },
  { title: "State filing fees", href: "/services/llc-formation" },
  { title: "Processing times", href: "/faq" },
];

export default function HelpCenterPage() {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFaqs(filtered);
    } else {
      setFilteredFaqs(faqs);
    }
  }, [searchQuery, faqs]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faqs?limit=20");
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
        setFilteredFaqs(data.faqs || []);
      }
    } catch {
      // FAQs are optional, don't show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
        <p className="mt-2 text-muted-foreground">
          Find answers to your questions or contact our support team
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {helpCategories.map((category) => (
          <Card key={category.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${category.color}`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{category.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Options */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Chat with our support team in real-time
              </p>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link href="/dashboard/support">
                  Start Chat <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get help via email within 24 hours
              </p>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <a href="mailto:support@llcpad.com">
                  support@llcpad.com <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Phone Support</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mon-Fri, 9am-5pm EST
              </p>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <a href="tel:+1-800-123-4567">
                  +1 (800) 123-4567 <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-8 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No FAQs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Check back later for frequently asked questions"}
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Links
          </CardTitle>
          <CardDescription>Popular resources and guides</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{link.title}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Still Need Help */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Still need help?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Our support team is available to assist you with any questions
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/support">Contact Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
