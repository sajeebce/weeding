"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { LandingPageBlock } from "@prisma/client";
import { HeroBlock } from "@/components/landing-blocks/hero";
import type { HeroSettings, HeroVariant } from "@/lib/landing-blocks/types";

interface PreviewFrameProps {
  blocks: LandingPageBlock[];
  device: "desktop" | "mobile";
  className?: string;
}

export function PreviewFrame({ blocks, device, className }: PreviewFrameProps) {
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks]
  );

  return (
    <div
      className={cn(
        "flex flex-1 items-start justify-center overflow-auto bg-muted/30 p-8",
        className
      )}
    >
      <div
        className={cn(
          "relative bg-background shadow-xl transition-all duration-300",
          device === "desktop"
            ? "w-full max-w-6xl rounded-lg"
            : "w-[375px] rounded-[2rem] ring-8 ring-slate-800"
        )}
      >
        {/* Mobile Device Frame */}
        {device === "mobile" && (
          <>
            {/* Notch */}
            <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-800" />
            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-slate-300" />
          </>
        )}

        {/* Preview Content */}
        <div
          className={cn(
            "overflow-hidden",
            device === "mobile" ? "rounded-[1.5rem] pt-10 pb-6" : "rounded-lg"
          )}
        >
          {sortedBlocks.length === 0 ? (
            <div className="flex h-96 items-center justify-center text-muted-foreground">
              <p>No blocks to preview</p>
            </div>
          ) : (
            <div className="min-h-[600px]">
              {sortedBlocks.map((block) => {
                // Skip blocks hidden on current device
                if (device === "mobile" && block.hideOnMobile) return null;
                if (device === "desktop" && block.hideOnDesktop) return null;
                if (!block.isActive) return null;

                // Render based on block type
                if (block.type.startsWith("hero")) {
                  // Extract variant from block type (e.g., "hero-centered" -> "centered")
                  const variant = block.type.replace("hero-", "") as HeroVariant;

                  // Merge settings with the variant from block type
                  const blockSettings = block.settings as Record<string, unknown> | null;
                  const heroSettings: Partial<HeroSettings> = {
                    ...(blockSettings as Partial<HeroSettings>),
                    variant, // Ensure variant is set from block type
                  };

                  return (
                    <HeroBlock
                      key={block.id}
                      settings={heroSettings}
                    />
                  );
                }

                // Placeholder for other block types
                return (
                  <div
                    key={block.id}
                    className="flex h-48 items-center justify-center border-b bg-muted/20"
                  >
                    <p className="text-muted-foreground">
                      {block.type} block preview
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
