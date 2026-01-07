import type { LandingPageBlock } from "@prisma/client";
import { HeroBlock } from "@/components/landing-blocks/hero";
import type { HeroSettings, HeroVariant } from "@/lib/landing-blocks/types";

interface PageRendererProps {
  blocks: LandingPageBlock[];
}

/**
 * Renders landing page blocks from the database
 * Filters by visibility and renders appropriate component for each block type
 */
export function PageRenderer({ blocks }: PageRendererProps) {
  // Sort blocks by sortOrder
  const sortedBlocks = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {sortedBlocks.map((block) => {
        // Skip inactive blocks
        if (!block.isActive) return null;

        // Render based on block type
        return <BlockRenderer key={block.id} block={block} />;
      })}
    </>
  );
}

interface BlockRendererProps {
  block: LandingPageBlock;
}

/**
 * Renders individual block based on type
 */
function BlockRenderer({ block }: BlockRendererProps) {
  const { type, settings } = block;

  // Hero blocks
  if (type.startsWith("hero")) {
    // Extract variant from block type (e.g., "hero-centered" -> "centered")
    const variant = type.replace("hero-", "") as HeroVariant;

    // Merge settings with variant
    const blockSettings = settings as Record<string, unknown> | null;
    const heroSettings: Partial<HeroSettings> = {
      ...(blockSettings as Partial<HeroSettings>),
      variant,
    };

    return <HeroBlock settings={heroSettings} />;
  }

  // Future block types will be added here:
  // - features
  // - testimonials
  // - pricing
  // - faq
  // - cta
  // etc.

  // Unknown block type - render nothing in production
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="flex items-center justify-center bg-muted/50 py-8 text-sm text-muted-foreground">
        Unknown block type: {type}
      </div>
    );
  }

  return null;
}

/**
 * Wrapper for client-side responsive visibility
 * Handles hideOnMobile and hideOnDesktop settings
 */
export function ResponsiveBlock({
  block,
  children,
}: {
  block: LandingPageBlock;
  children: React.ReactNode;
}) {
  const hideOnMobileClass = block.hideOnMobile ? "hidden lg:block" : "";
  const hideOnDesktopClass = block.hideOnDesktop ? "lg:hidden" : "";

  if (hideOnMobileClass || hideOnDesktopClass) {
    return (
      <div className={`${hideOnMobileClass} ${hideOnDesktopClass}`}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
