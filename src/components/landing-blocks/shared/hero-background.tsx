"use client";

import { cn } from "@/lib/utils";
import type { HeroBackgroundSettings } from "@/lib/landing-blocks/types";

interface HeroBackgroundProps {
  settings: HeroBackgroundSettings;
  children: React.ReactNode;
  className?: string;
}

export function HeroBackground({ settings, children, className }: HeroBackgroundProps) {
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (settings.type) {
      case "solid":
        return { backgroundColor: settings.color || "#0A0F1E" };
      case "gradient":
        return {
          background: `linear-gradient(${settings.gradientAngle || 135}deg, ${settings.gradientFrom || "#0A0F1E"}, ${settings.gradientTo || "#1a1a2e"})`,
        };
      case "image":
        return {
          backgroundImage: `url(${settings.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      default:
        return { backgroundColor: "#0A0F1E" };
    }
  };

  return (
    <section
      className={cn("relative overflow-hidden", className)}
      style={getBackgroundStyle()}
    >
      {/* Pattern Overlay */}
      {settings.pattern && (
        <div className="absolute inset-0 -z-10">
          {settings.pattern.type === "grid" && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, ${settings.pattern.color} 1px, transparent 1px), linear-gradient(to bottom, ${settings.pattern.color} 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
                opacity: settings.pattern.opacity,
              }}
            />
          )}
          {settings.pattern.type === "dots" && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(${settings.pattern.color} 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
                opacity: settings.pattern.opacity,
              }}
            />
          )}
        </div>
      )}

      {/* Video Background */}
      {settings.type === "video" && settings.videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover -z-10"
        >
          <source src={settings.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      {settings.overlay?.enabled && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: settings.overlay.color,
            opacity: settings.overlay.opacity,
          }}
        />
      )}

      {children}
    </section>
  );
}
