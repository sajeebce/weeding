import { NextResponse } from "next/server";
import prisma from "@/lib/db";

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
      content: widget.content,
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
      social: {
        show: footer.showSocialLinks,
        position: footer.socialPosition,
      },
      contact: {
        show: footer.showContactInfo,
        position: footer.contactPosition,
      },
      bottomBar: {
        enabled: footer.bottomBarEnabled,
        copyrightText: footer.copyrightText,
        showDisclaimer: footer.showDisclaimer,
        disclaimerText: footer.disclaimerText,
        links: footer.bottomLinks ? JSON.parse(footer.bottomLinks as string) : [],
      },
      trustBadges: {
        show: footer.showTrustBadges,
        badges: footer.trustBadges ? JSON.parse(footer.trustBadges as string) : [],
      },
      styling: {
        bgColor: footer.bgColor,
        textColor: footer.textColor,
        accentColor: footer.accentColor,
        borderColor: footer.borderColor,
        paddingTop: footer.paddingTop,
        paddingBottom: footer.paddingBottom,
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
