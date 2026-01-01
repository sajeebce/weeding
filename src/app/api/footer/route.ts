import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Helper to safely parse JSON - handles both string and object
// Also handles double-encoded strings (from previous bug in apply-preset)
const safeJsonParse = (value: unknown, fallback: unknown = null) => {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      let parsed = JSON.parse(value);
      // Check if it was double-encoded (result is still a string)
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // Not double-encoded, use the first parse result
        }
      }
      return parsed;
    } catch {
      return fallback;
    }
  }
  return value; // Already an object
};

// Public API - Get active footer configuration
// Cached for 60 seconds
export async function GET() {
  try {
    // Get active footer config with widgets and their menu items
    const footer = await prisma.footerConfig.findFirst({
      where: { isActive: true },
      include: {
        widgets: {
          orderBy: [{ column: "asc" }, { sortOrder: "asc" }],
          include: {
            menuItems: {
              where: { isVisible: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!footer) {
      return NextResponse.json(
        { error: "No active footer configuration found" },
        { status: 404 }
      );
    }

    // Transform widgets
    const widgets = footer.widgets.map((widget) => ({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      showTitle: widget.showTitle,
      column: widget.column,
      sortOrder: widget.sortOrder,
      content: safeJsonParse(widget.content, null), // Parse in case of double-encoding
      customClass: widget.customClass,
      links: widget.menuItems.map((item) => ({
        id: item.id,
        label: item.label,
        url: item.url,
        target: item.target,
        icon: item.icon,
      })),
    }));

    const response = {
      id: footer.id,
      layout: footer.layout,
      columns: footer.columns,
      widgets,
      newsletter: {
        enabled: footer.newsletterEnabled,
        title: footer.newsletterTitle,
        subtitle: footer.newsletterSubtitle,
        provider: footer.newsletterProvider,
        formAction: footer.newsletterFormAction,
      },
      contact: {
        show: footer.showContactInfo,
        position: footer.contactPosition,
      },
      trustBadges: {
        show: footer.showTrustBadges,
        badges: safeJsonParse(footer.trustBadges, []),
      },
      styling: {
        // Background
        bgType: footer.bgType || "solid",
        bgColor: footer.bgColor,
        bgGradient: safeJsonParse(footer.bgGradient, null),
        bgPattern: footer.bgPattern,
        bgPatternColor: footer.bgPatternColor,
        bgPatternOpacity: footer.bgPatternOpacity,
        bgImage: footer.bgImage,
        bgImageOverlay: footer.bgImageOverlay,
        // Colors
        textColor: footer.textColor,
        headingColor: footer.headingColor,
        linkColor: footer.linkColor,
        linkHoverColor: footer.linkHoverColor,
        accentColor: footer.accentColor,
        borderColor: footer.borderColor,
        // Typography
        headingSize: footer.headingSize || "sm",
        headingWeight: footer.headingWeight || "semibold",
        headingStyle: footer.headingStyle || "normal",
        // Spacing
        paddingTop: footer.paddingTop,
        paddingBottom: footer.paddingBottom,
        // Effects
        shadow: footer.shadow,
        borderRadius: footer.borderRadius,
        topBorderStyle: footer.topBorderStyle,
        topBorderHeight: footer.topBorderHeight,
        topBorderColor: footer.topBorderColor,
        dividerStyle: footer.dividerStyle,
        dividerColor: footer.dividerColor,
        // Animation
        enableAnimations: footer.enableAnimations,
        entranceAnimation: footer.entranceAnimation,
        animationDuration: footer.animationDuration,
        linkHoverEffect: footer.linkHoverEffect,
        // Container
        containerWidth: footer.containerWidth || "full",
        containerStyle: footer.containerStyle || "sharp",
        cornerRadiusTL: footer.cornerRadiusTL || 0,
        cornerRadiusTR: footer.cornerRadiusTR || 0,
        cornerRadiusBL: footer.cornerRadiusBL || 0,
        cornerRadiusBR: footer.cornerRadiusBR || 0,
      },
      social: {
        show: footer.showSocialLinks,
        position: footer.socialPosition,
        shape: footer.socialShape || "circle",
        size: footer.socialSize || "md",
        colorMode: footer.socialColorMode || "brand",
        hoverEffect: footer.socialHoverEffect || "scale",
      },
      bottomBar: {
        enabled: footer.bottomBarEnabled,
        layout: footer.bottomBarLayout || "split",
        copyrightText: footer.copyrightText,
        showDisclaimer: footer.showDisclaimer,
        disclaimerText: footer.disclaimerText,
        links: safeJsonParse(footer.bottomLinks, []),
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching footer config:", error);
    return NextResponse.json(
      { error: "Failed to fetch footer configuration" },
      { status: 500 }
    );
  }
}
