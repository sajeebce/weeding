import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Shield,
  Clock,
  Globe,
  Star,
} from "lucide-react";
import { HeroCTAButtons } from "./hero-cta-buttons";

const features = [
  "Fast 24-48 hour processing",
  "100% Compliance guaranteed",
  "Dedicated support team",
];

const trustBadges = [
  { icon: Shield, text: "Secure & Private" },
  { icon: Clock, text: "24hr Processing" },
  { icon: Globe, text: "Serve 50+ Countries" },
  { icon: Star, text: "4.9/5 Rating" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-midnight">
      {/* Background Pattern - Clean Grid */}
      <div className="absolute inset-0 -z-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge className="mb-6 border-orange-500/50 bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/30">
            🇺🇸 Trusted by 10,000+ International Entrepreneurs
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Start Your{" "}
            <span className="text-orange-500">US LLC</span>{" "}
            in 24 Hours
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg text-slate-400 sm:text-xl">
            Launch your American dream from anywhere in the world. We handle
            everything from LLC formation to EIN, Amazon seller accounts, and
            business banking — so you can focus on growing your business.
          </p>

          {/* Features List */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-slate-400"
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <HeroCTAButtons />

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-400">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>4.9/5 from 2,000+ reviews</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-700/50 bg-midnight-light/50 p-4 backdrop-blur"
                >
                  <badge.icon className="h-6 w-6 text-orange-500" />
                  <span className="text-sm font-medium text-white">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 border-t border-slate-700/50 pt-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500 sm:text-4xl">
                10,000+
              </p>
              <p className="mt-1 text-sm text-slate-400">LLCs Formed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500 sm:text-4xl">
                50+
              </p>
              <p className="mt-1 text-sm text-slate-400">Countries Served</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500 sm:text-4xl">
                4.9/5
              </p>
              <p className="mt-1 text-sm text-slate-400">Customer Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500 sm:text-4xl">
                24h
              </p>
              <p className="mt-1 text-sm text-slate-400">Average Processing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
