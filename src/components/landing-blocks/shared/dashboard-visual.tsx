"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { DashboardVisualSettings } from "@/lib/landing-blocks/types";

interface DashboardVisualProps {
  settings: DashboardVisualSettings;
  className?: string;
}

// SVG Dashboard Presets
const presetSVGs: Record<string, React.ReactNode> = {
  analytics: (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Background */}
      <rect width="400" height="300" rx="12" fill="#1a1a2e" />

      {/* Top metric cards */}
      <g transform="translate(20, 20)">
        <rect width="110" height="60" rx="8" fill="#2d2d44" />
        <text x="12" y="25" fill="#9ca3af" fontSize="10">Revenue</text>
        <text x="12" y="45" fill="#fff" fontSize="16" fontWeight="bold">$45,231</text>
        <text x="85" y="45" fill="#10b981" fontSize="10">+12%</text>
      </g>

      <g transform="translate(145, 20)">
        <rect width="110" height="60" rx="8" fill="#2d2d44" />
        <text x="12" y="25" fill="#9ca3af" fontSize="10">Users</text>
        <text x="12" y="45" fill="#fff" fontSize="16" fontWeight="bold">2,451</text>
        <text x="60" y="45" fill="#10b981" fontSize="10">+8.2%</text>
      </g>

      <g transform="translate(270, 20)">
        <rect width="110" height="60" rx="8" fill="#2d2d44" />
        <text x="12" y="25" fill="#9ca3af" fontSize="10">Growth</text>
        <text x="12" y="45" fill="#fff" fontSize="16" fontWeight="bold">+23%</text>
        <rect x="70" y="30" width="30" height="20" rx="4" fill="#f97316" opacity="0.2" />
        <text x="78" y="44" fill="#f97316" fontSize="10">↑</text>
      </g>

      {/* Chart area */}
      <rect x="20" y="100" width="360" height="140" rx="8" fill="#2d2d44" />

      {/* Chart grid lines */}
      <g stroke="#3d3d5c" strokeWidth="1" strokeDasharray="4">
        <line x1="40" y1="130" x2="360" y2="130" />
        <line x1="40" y1="160" x2="360" y2="160" />
        <line x1="40" y1="190" x2="360" y2="190" />
      </g>

      {/* Area chart */}
      <path
        d="M 40 200 L 80 180 L 120 190 L 160 160 L 200 170 L 240 140 L 280 150 L 320 120 L 360 130 L 360 220 L 40 220 Z"
        fill="url(#chartGradient)"
      />

      {/* Line chart */}
      <path
        d="M 40 200 L 80 180 L 120 190 L 160 160 L 200 170 L 240 140 L 280 150 L 320 120 L 360 130"
        fill="none"
        stroke="#f97316"
        strokeWidth="2"
      />

      {/* Data points */}
      <g fill="#f97316">
        <circle cx="40" cy="200" r="4" />
        <circle cx="80" cy="180" r="4" />
        <circle cx="120" cy="190" r="4" />
        <circle cx="160" cy="160" r="4" />
        <circle cx="200" cy="170" r="4" />
        <circle cx="240" cy="140" r="4" />
        <circle cx="280" cy="150" r="4" />
        <circle cx="320" cy="120" r="4" />
        <circle cx="360" cy="130" r="4" />
      </g>

      {/* Gradient definition */}
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Bottom labels */}
      <g fill="#6b7280" fontSize="8">
        <text x="40" y="238">Jan</text>
        <text x="100" y="238">Mar</text>
        <text x="160" y="238">May</text>
        <text x="220" y="238">Jul</text>
        <text x="280" y="238">Sep</text>
        <text x="340" y="238">Nov</text>
      </g>

      {/* Bottom bar */}
      <rect x="20" y="260" width="360" height="30" rx="8" fill="#2d2d44" />
      <circle cx="45" cy="275" r="6" fill="#10b981" />
      <text x="58" y="279" fill="#9ca3af" fontSize="10">Active Users: 1,234</text>
      <circle cx="180" cy="275" r="6" fill="#f97316" />
      <text x="193" y="279" fill="#9ca3af" fontSize="10">Sessions: 5,678</text>
    </svg>
  ),

  ecommerce: (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect width="400" height="300" rx="12" fill="#1a1a2e" />

      {/* Header */}
      <rect x="20" y="20" width="360" height="40" rx="8" fill="#2d2d44" />
      <text x="35" y="45" fill="#fff" fontSize="14" fontWeight="bold">Orders Dashboard</text>
      <rect x="300" y="30" width="60" height="20" rx="4" fill="#f97316" />
      <text x="315" y="44" fill="#fff" fontSize="10">Export</text>

      {/* Product grid */}
      <g transform="translate(20, 80)">
        <rect width="85" height="100" rx="8" fill="#2d2d44" />
        <rect x="10" y="10" width="65" height="50" rx="4" fill="#3d3d5c" />
        <text x="10" y="75" fill="#fff" fontSize="10">Product A</text>
        <text x="10" y="88" fill="#10b981" fontSize="9">$49.99</text>
      </g>

      <g transform="translate(115, 80)">
        <rect width="85" height="100" rx="8" fill="#2d2d44" />
        <rect x="10" y="10" width="65" height="50" rx="4" fill="#3d3d5c" />
        <text x="10" y="75" fill="#fff" fontSize="10">Product B</text>
        <text x="10" y="88" fill="#10b981" fontSize="9">$79.99</text>
      </g>

      <g transform="translate(210, 80)">
        <rect width="85" height="100" rx="8" fill="#2d2d44" />
        <rect x="10" y="10" width="65" height="50" rx="4" fill="#3d3d5c" />
        <text x="10" y="75" fill="#fff" fontSize="10">Product C</text>
        <text x="10" y="88" fill="#10b981" fontSize="9">$129.99</text>
      </g>

      <g transform="translate(305, 80)">
        <rect width="75" height="100" rx="8" fill="#2d2d44" />
        <rect x="10" y="10" width="55" height="50" rx="4" fill="#3d3d5c" />
        <text x="10" y="75" fill="#fff" fontSize="10">Product D</text>
        <text x="10" y="88" fill="#10b981" fontSize="9">$199.99</text>
      </g>

      {/* Stats row */}
      <rect x="20" y="200" width="170" height="80" rx="8" fill="#2d2d44" />
      <text x="35" y="225" fill="#9ca3af" fontSize="10">Total Revenue</text>
      <text x="35" y="250" fill="#fff" fontSize="20" fontWeight="bold">$12,549</text>
      <text x="35" y="268" fill="#10b981" fontSize="10">↑ 24% this month</text>

      <rect x="210" y="200" width="170" height="80" rx="8" fill="#2d2d44" />
      <text x="225" y="225" fill="#9ca3af" fontSize="10">Orders</text>
      <text x="225" y="250" fill="#fff" fontSize="20" fontWeight="bold">156</text>
      <text x="225" y="268" fill="#10b981" fontSize="10">↑ 12 new today</text>
    </svg>
  ),

  saas: (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect width="400" height="300" rx="12" fill="#1a1a2e" />

      {/* Top bar */}
      <rect x="20" y="20" width="360" height="50" rx="8" fill="#2d2d44" />
      <circle cx="50" cy="45" r="15" fill="#f97316" />
      <text x="75" y="42" fill="#fff" fontSize="12" fontWeight="bold">SaaS Platform</text>
      <text x="75" y="55" fill="#9ca3af" fontSize="9">Dashboard</text>

      {/* Usage meter */}
      <rect x="20" y="90" width="175" height="90" rx="8" fill="#2d2d44" />
      <text x="35" y="115" fill="#9ca3af" fontSize="10">API Usage</text>
      <text x="35" y="140" fill="#fff" fontSize="18" fontWeight="bold">2,451 / 5,000</text>
      <rect x="35" y="155" width="140" height="8" rx="4" fill="#3d3d5c" />
      <rect x="35" y="155" width="69" height="8" rx="4" fill="#f97316" />
      <text x="35" y="172" fill="#9ca3af" fontSize="9">49% used</text>

      {/* Subscription */}
      <rect x="205" y="90" width="175" height="90" rx="8" fill="#2d2d44" />
      <text x="220" y="115" fill="#9ca3af" fontSize="10">Active Users</text>
      <text x="220" y="140" fill="#fff" fontSize="18" fontWeight="bold">1,234</text>
      <text x="220" y="160" fill="#10b981" fontSize="10">↑ 12% from last month</text>
      <rect x="220" y="165" width="80" height="6" rx="3" fill="#10b981" opacity="0.3" />

      {/* Activity chart */}
      <rect x="20" y="200" width="360" height="80" rx="8" fill="#2d2d44" />
      <text x="35" y="225" fill="#9ca3af" fontSize="10">Weekly Activity</text>

      {/* Bar chart */}
      <g transform="translate(35, 235)">
        <rect x="0" y="20" width="30" height="25" rx="2" fill="#f97316" opacity="0.6" />
        <rect x="50" y="10" width="30" height="35" rx="2" fill="#f97316" opacity="0.8" />
        <rect x="100" y="5" width="30" height="40" rx="2" fill="#f97316" />
        <rect x="150" y="15" width="30" height="30" rx="2" fill="#f97316" opacity="0.7" />
        <rect x="200" y="0" width="30" height="45" rx="2" fill="#f97316" />
        <rect x="250" y="12" width="30" height="33" rx="2" fill="#f97316" opacity="0.8" />
        <rect x="300" y="8" width="30" height="37" rx="2" fill="#f97316" opacity="0.9" />
      </g>
    </svg>
  ),

  crm: (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect width="400" height="300" rx="12" fill="#1a1a2e" />

      {/* Header */}
      <text x="30" y="40" fill="#fff" fontSize="14" fontWeight="bold">Sales Pipeline</text>

      {/* Pipeline stages */}
      <g transform="translate(20, 60)">
        <rect width="85" height="120" rx="8" fill="#2d2d44" />
        <text x="15" y="25" fill="#9ca3af" fontSize="9">Lead</text>
        <text x="15" y="45" fill="#fff" fontSize="14" fontWeight="bold">24</text>
        <rect x="15" y="60" width="55" height="6" rx="3" fill="#6366f1" />
        <text x="15" y="80" fill="#6366f1" fontSize="10">$45K</text>

        {/* Mini cards */}
        <rect x="10" y="90" width="65" height="20" rx="4" fill="#3d3d5c" />
      </g>

      <g transform="translate(115, 60)">
        <rect width="85" height="120" rx="8" fill="#2d2d44" />
        <text x="15" y="25" fill="#9ca3af" fontSize="9">Qualified</text>
        <text x="15" y="45" fill="#fff" fontSize="14" fontWeight="bold">18</text>
        <rect x="15" y="60" width="55" height="6" rx="3" fill="#8b5cf6" />
        <text x="15" y="80" fill="#8b5cf6" fontSize="10">$67K</text>
        <rect x="10" y="90" width="65" height="20" rx="4" fill="#3d3d5c" />
      </g>

      <g transform="translate(210, 60)">
        <rect width="85" height="120" rx="8" fill="#2d2d44" />
        <text x="15" y="25" fill="#9ca3af" fontSize="9">Proposal</text>
        <text x="15" y="45" fill="#fff" fontSize="14" fontWeight="bold">12</text>
        <rect x="15" y="60" width="55" height="6" rx="3" fill="#f97316" />
        <text x="15" y="80" fill="#f97316" fontSize="10">$89K</text>
        <rect x="10" y="90" width="65" height="20" rx="4" fill="#3d3d5c" />
      </g>

      <g transform="translate(305, 60)">
        <rect width="75" height="120" rx="8" fill="#2d2d44" />
        <text x="15" y="25" fill="#9ca3af" fontSize="9">Won</text>
        <text x="15" y="45" fill="#fff" fontSize="14" fontWeight="bold">8</text>
        <rect x="15" y="60" width="45" height="6" rx="3" fill="#10b981" />
        <text x="15" y="80" fill="#10b981" fontSize="10">$125K</text>
        <rect x="10" y="90" width="55" height="20" rx="4" fill="#3d3d5c" />
      </g>

      {/* Bottom stats */}
      <rect x="20" y="200" width="360" height="80" rx="8" fill="#2d2d44" />

      <g transform="translate(40, 220)">
        <text fill="#9ca3af" fontSize="10">Total Pipeline Value</text>
        <text y="25" fill="#fff" fontSize="20" fontWeight="bold">$326,000</text>
      </g>

      <g transform="translate(200, 220)">
        <text fill="#9ca3af" fontSize="10">Win Rate</text>
        <text y="25" fill="#10b981" fontSize="20" fontWeight="bold">34%</text>
      </g>

      <g transform="translate(300, 220)">
        <text fill="#9ca3af" fontSize="10">Avg Deal</text>
        <text y="25" fill="#f97316" fontSize="20" fontWeight="bold">$15.6K</text>
      </g>
    </svg>
  ),
};

export function DashboardVisual({ settings, className }: DashboardVisualProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setMousePosition({ x, y });
  };

  const getInteractionStyle = (): React.CSSProperties => {
    if (!isHovered) return {};

    const intensity = settings.interactionEffect.intensity === "subtle" ? 5 :
                     settings.interactionEffect.intensity === "medium" ? 10 : 15;

    switch (settings.interactionEffect.type) {
      case "tilt-3d":
        return {
          transform: `perspective(1000px) rotateX(${-mousePosition.y * intensity}deg) rotateY(${mousePosition.x * intensity}deg)`,
        };
      case "parallax":
        return {
          transform: `translate(${mousePosition.x * intensity}px, ${mousePosition.y * intensity}px)`,
        };
      case "float":
        return {
          transform: `translateY(-${intensity}px)`,
        };
      case "glow":
        return {
          boxShadow: `0 0 ${intensity * 4}px ${intensity * 2}px rgba(249, 115, 22, 0.3)`,
        };
      default:
        return {};
    }
  };

  const getShadowClass = () => {
    switch (settings.style.shadow) {
      case "sm": return "shadow-sm";
      case "md": return "shadow-md";
      case "lg": return "shadow-lg";
      case "xl": return "shadow-xl";
      default: return "";
    }
  };

  const getBorderRadiusClass = () => {
    switch (settings.style.borderRadius) {
      case "sm": return "rounded-sm";
      case "md": return "rounded-md";
      case "lg": return "rounded-lg";
      case "xl": return "rounded-xl";
      default: return "";
    }
  };

  const getEntranceAnimationClass = () => {
    switch (settings.entranceAnimation.type) {
      case "fade-in": return "animate-fade-in";
      case "slide-up": return "animate-slide-up-entrance";
      case "scale-in": return "animate-scale-in";
      default: return "";
    }
  };

  // Custom image/SVG
  if (settings.preset === "custom") {
    if (settings.customSvgUrl) {
      return (
        <div
          ref={containerRef}
          className={cn(
            "relative transition-all duration-300 ease-out",
            getShadowClass(),
            getBorderRadiusClass(),
            settings.style.border && "border border-slate-700/50",
            getEntranceAnimationClass(),
            className
          )}
          style={{
            transform: `scale(${settings.style.scale}) rotate(${settings.style.rotation}deg)`,
            animationDelay: `${settings.entranceAnimation.delay}ms`,
            animationDuration: `${settings.entranceAnimation.duration}ms`,
            ...getInteractionStyle(),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={settings.customSvgUrl}
            alt="Dashboard"
            width={500}
            height={400}
            className="w-full h-auto"
          />
        </div>
      );
    }

    if (settings.customImageUrl) {
      return (
        <div
          ref={containerRef}
          className={cn(
            "relative overflow-hidden transition-all duration-300 ease-out",
            getShadowClass(),
            getBorderRadiusClass(),
            settings.style.border && "border border-slate-700/50",
            getEntranceAnimationClass(),
            className
          )}
          style={{
            transform: `scale(${settings.style.scale}) rotate(${settings.style.rotation}deg)`,
            animationDelay: `${settings.entranceAnimation.delay}ms`,
            animationDuration: `${settings.entranceAnimation.duration}ms`,
            ...getInteractionStyle(),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={settings.customImageUrl}
            alt="Dashboard"
            width={500}
            height={400}
            className="w-full h-auto"
          />
        </div>
      );
    }
  }

  // Preset SVG
  const presetSVG = presetSVGs[settings.preset];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative transition-all duration-300 ease-out",
        getShadowClass(),
        getBorderRadiusClass(),
        settings.style.border && "border border-slate-700/50",
        getEntranceAnimationClass(),
        className
      )}
      style={{
        transform: `scale(${settings.style.scale}) rotate(${settings.style.rotation}deg)`,
        animationDelay: `${settings.entranceAnimation.delay}ms`,
        animationDuration: `${settings.entranceAnimation.duration}ms`,
        ...getInteractionStyle(),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {presetSVG}
    </div>
  );
}
