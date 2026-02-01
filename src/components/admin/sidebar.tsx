"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Tag,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Percent,
  UserCog,
  Palette,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessConfig } from "@/hooks/use-business-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: Package,
    badge: 5,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Services",
    icon: Tag,
    children: [
      { title: "All Services", href: "/admin/services" },
      { title: "Categories", href: "/admin/services/categories" },
    ],
  },
  {
    title: "Content",
    icon: FileText,
    children: [
      { title: "Blog", href: "/admin/content/blog" },
      { title: "Blog Categories", href: "/admin/content/blog-categories" },
      { title: "Testimonials", href: "/admin/content/testimonials" },
      { title: "FAQs", href: "/admin/content/faq" },
      { title: "Legal Pages", href: "/admin/content/legal" },
    ],
  },
  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Percent,
  },
  {
    title: "State Fees",
    href: "/admin/state-fees",
    icon: MapPin,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    title: "Appearance",
    icon: Palette,
    children: [
      { title: "Page Builder", href: "/admin/appearance/pages" },
      { title: "Header Builder", href: "/admin/appearance/header" },
      { title: "Menu Builder", href: "/admin/appearance/header/menu" },
      { title: "Footer Builder", href: "/admin/appearance/footer" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "General", href: "/admin/settings" },
      { title: "Media Storage", href: "/admin/settings/media-storage" },
      { title: "Payments", href: "/admin/settings/payments" },
      { title: "Email", href: "/admin/settings/email" },
      { title: "Newsletter", href: "/admin/settings/newsletter" },
      { title: "Plugins", href: "/admin/settings/plugins" },
      { title: "Profile", href: "/admin/profile" },
    ],
  },
];

// Plugin menu item interface
interface PluginMenuItem {
  id: string;
  label: string;
  path: string;
  icon: string | null;
  parentLabel: string | null;
  sortOrder: number;
}

interface PluginWithMenuItems {
  id: string;
  slug: string;
  name: string;
  adminMenuLabel: string | null;
  adminMenuIcon: string | null;
  adminMenuPosition: number | null;
  menuItems: PluginMenuItem[];
}

// Icon mapping for dynamic plugin icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Tag,
  MapPin,
  Receipt,
  Percent,
  UserCog,
  Palette,
  Puzzle,
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { config } = useBusinessConfig();
  const [mounted, setMounted] = useState(false); // Prevent transition flash on initial load
  const [collapsed, setCollapsed] = useState(false); // Expanded by default
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [pluginMenuItems, setPluginMenuItems] = useState<NavItem[]>([]);

  // Page builder pages always start collapsed for maximum workspace
  const isPageBuilder = pathname === "/admin/appearance/landing-page" ||
                        pathname?.startsWith("/admin/appearance/pages/");

  // Fetch active plugins with menu items
  useEffect(() => {
    async function fetchPlugins() {
      try {
        const res = await fetch("/api/admin/plugins?status=ACTIVE&includeMenuItems=true");
        if (res.ok) {
          const data = await res.json();
          const plugins: PluginWithMenuItems[] = data.plugins || [];

          // Convert plugins to NavItems
          const items: NavItem[] = plugins
            .filter((plugin) => plugin.menuItems.length > 0)
            .map((plugin) => {
              const IconComponent = plugin.adminMenuIcon
                ? iconMap[plugin.adminMenuIcon] || Puzzle
                : Puzzle;

              return {
                title: plugin.adminMenuLabel || plugin.name,
                icon: IconComponent,
                children: plugin.menuItems.map((item) => ({
                  title: item.label,
                  href: item.path,
                })),
              };
            });

          setPluginMenuItems(items);
        }
      } catch (error) {
        console.error("Error fetching plugin menu items:", error);
      }
    }

    fetchPlugins();
  }, []);

  useEffect(() => {
    if (isPageBuilder) {
      // Page builder: always collapsed for maximum workspace
      setCollapsed(true);
    } else {
      // Other pages: use localStorage preference (default: expanded/false)
      const saved = localStorage.getItem("admin-sidebar-collapsed");
      setCollapsed(saved === "true");
    }
    // Mark as mounted after state is set to prevent transition flash
    setMounted(true);
  }, [isPageBuilder]);

  // Combine static nav items with plugin menu items
  const allNavItems = [...navItems.slice(0, -1), ...pluginMenuItems, navItems[navItems.length - 1]];

  const handleCollapsedChange = (value: boolean) => {
    setCollapsed(value);
    // Only save preference for non-page-builder pages
    if (!isPageBuilder) {
      localStorage.setItem("admin-sidebar-collapsed", String(value));
    }
  };

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    // Use exact match for all menu items
    return pathname === href;
  };

  const isChildActive = (children: { href: string }[]) => {
    return children.some((child) => pathname.startsWith(child.href));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r bg-card",
          mounted && "transition-all duration-300", // Only animate after initial load
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              {config.logo.url ? (
                <Image
                  src={config.logo.url}
                  alt={config.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">
                    {config.logo.text || config.name.substring(0, 2)}
                  </span>
                </div>
              )}
              <span className="font-bold">{config.name} Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleCollapsedChange(!collapsed)}
            className={cn(collapsed && "mx-auto")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {allNavItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = openItems.includes(item.title) || isChildActive(item.children);

              if (collapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-center",
                          isChildActive(item.children) && "bg-muted"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col gap-1">
                      <p className="font-medium">{item.title}</p>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "text-sm hover:text-primary",
                            isActive(child.href) && "text-primary"
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Collapsible
                  key={item.title}
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between",
                        isChildActive(item.children) && "bg-muted"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-9 pt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm hover:bg-muted",
                          isActive(child.href) &&
                            "bg-primary/10 font-medium text-primary"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <Link href={item.href!}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "relative w-full justify-center",
                          isActive(item.href!) && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.badge && (
                          <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link key={item.title} href={item.href!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive(item.href!) && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                  {item.badge && (
                    <Badge className="ml-auto">{item.badge}</Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              {config.name} Admin v1.0
            </p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
