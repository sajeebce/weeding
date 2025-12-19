import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public API - Get active header configuration
// Cached for 60 seconds
export async function GET() {
  try {
    // Get active header config with menu items
    const header = await prisma.headerConfig.findFirst({
      where: { isActive: true },
      include: {
        menuItems: {
          where: {
            isVisible: true,
            parentId: null, // Only top-level items
          },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              where: { isVisible: true },
              orderBy: { sortOrder: "asc" },
              include: {
                children: {
                  where: { isVisible: true },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!header) {
      return NextResponse.json(
        { error: "No active header configuration found" },
        { status: 404 }
      );
    }

    // Transform menu items to nested structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformMenuItem = (item: any): object => ({
      id: item.id,
      label: item.label,
      url: item.url,
      target: item.target,
      icon: item.icon,
      isVisible: item.isVisible,
      parentId: item.parentId,
      isMegaMenu: item.isMegaMenu,
      megaMenuColumns: item.megaMenuColumns,
      badge: item.badge,
      badgeColor: item.badgeColor,
      categoryName: item.categoryName,
      categoryIcon: item.categoryIcon,
      categoryDesc: item.categoryDesc,
      visibleOnMobile: item.visibleOnMobile,
      children: item.children?.map(transformMenuItem) || [],
    });

    const response = {
      id: header.id,
      layout: header.layout,
      sticky: header.sticky,
      transparent: header.transparent,
      height: header.height,
      topBar: {
        enabled: header.topBarEnabled,
        content: header.topBarContent,
        bgColor: header.topBarBgColor,
        textColor: header.topBarTextColor,
      },
      logo: {
        position: header.logoPosition,
        maxHeight: header.logoMaxHeight,
      },
      menu: header.menuItems.map(transformMenuItem),
      cta: header.ctaButtons ? JSON.parse(header.ctaButtons as string) : [],
      auth: {
        showButtons: header.showAuthButtons,
        loginText: header.loginText,
        registerText: header.registerText,
        registerUrl: header.registerUrl,
      },
      search: {
        enabled: header.searchEnabled,
      },
      styling: {
        bgColor: header.bgColor,
        textColor: header.textColor,
        accentColor: header.accentColor,
        borderColor: header.borderColor,
      },
      mobileBreakpoint: header.mobileBreakpoint,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching header config:", error);
    return NextResponse.json(
      { error: "Failed to fetch header configuration" },
      { status: 500 }
    );
  }
}
