"use client";

import Link from "next/link";
import {
  Rocket,
  Package,
  FileText,
  Newspaper,
  Users,
  Mail,
  Home,
  Grid,
  Sparkles,
  ArrowRight,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type PageType =
  | "home"
  | "service_details"
  | "services_list"
  | "blog_post"
  | "blog_list"
  | "about"
  | "contact";

interface ComingSoonPageProps {
  pageType: PageType;
  context?: {
    title?: string;
  };
}

const COMING_SOON_CONFIG: Record<
  PageType,
  {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  home: {
    title: "Coming Soon",
    subtitle: "We're Building Something Amazing",
    description:
      "Our team is working hard to bring you an exceptional experience. Subscribe to get notified when we launch!",
    icon: Rocket,
  },
  service_details: {
    title: "Service Details",
    subtitle: "Coming Soon",
    description:
      "We're preparing comprehensive information about this service. Subscribe to be notified when it's ready.",
    icon: Package,
  },
  services_list: {
    title: "Our Services",
    subtitle: "Coming Soon",
    description:
      "We're curating an amazing list of services tailored for you. Stay tuned!",
    icon: Grid,
  },
  blog_post: {
    title: "Article",
    subtitle: "Coming Soon",
    description:
      "This article is being crafted with care. Subscribe to get notified when it's published.",
    icon: FileText,
  },
  blog_list: {
    title: "Our Blog",
    subtitle: "Coming Soon",
    description:
      "We're preparing insightful content for you. Subscribe to be the first to read our articles!",
    icon: Newspaper,
  },
  about: {
    title: "About Us",
    subtitle: "Coming Soon",
    description:
      "We're crafting our story. Check back soon to learn more about who we are!",
    icon: Users,
  },
  contact: {
    title: "Contact Page",
    subtitle: "Coming Soon",
    description:
      "Our contact page is being set up. Feel free to reach out via email in the meantime.",
    icon: Mail,
  },
};

export function ComingSoonPage({ pageType, context }: ComingSoonPageProps) {
  const config = COMING_SOON_CONFIG[pageType];
  const Icon = config.icon;
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // TODO: Implement newsletter subscription API
    }
  };

  return (
    <div className="min-h-[85vh] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />

      {/* Decorative Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-blue-500/3 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[85vh]">
        {/* Badge */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Launching Soon</span>
          </div>
        </div>

        {/* Icon with Glow Effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl scale-150" />
          <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25">
            <Icon className="w-14 h-14 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          {/* Context Title (if provided) */}
          {context?.title && (
            <p className="text-lg font-medium text-primary mb-2">{context.title}</p>
          )}

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
              {config.title}
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
            {config.subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {config.description}
          </p>
        </div>

        {/* Email Subscription Card */}
        <div className="w-full max-w-md mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-xl">
              {!isSubmitted ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Get Notified
                    </span>
                  </div>
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      required
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 px-6 shadow-lg shadow-primary/25"
                    >
                      Notify Me
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    We'll only send you one email when we launch. No spam!
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">You're on the list!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll notify you when we launch.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" size="lg" className="h-12 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" asChild>
            <Link href="/contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Link>
          </Button>
          {pageType !== "home" && (
            <Button variant="ghost" size="lg" className="h-12" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          )}
        </div>

        {/* Bottom Decoration */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Building in progress</span>
          </div>
        </div>
      </div>
    </div>
  );
}
