"use client";

import { useState } from "react";
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
    title: "Tickets",
    icon: MessageSquare,
    badge: 3,
    children: [
      { title: "All Tickets", href: "/admin/tickets" },
      { title: "Settings", href: "/admin/tickets/settings" },
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
    title: "Settings",
    icon: Settings,
    children: [
      { title: "General", href: "/admin/settings" },
      { title: "Payments", href: "/admin/settings/payments" },
      { title: "Email", href: "/admin/settings/email" },
      { title: "Profile", href: "/admin/profile" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { config } = useBusinessConfig();
  const [collapsed, setCollapsed] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);

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
          "flex h-screen flex-col border-r bg-card transition-all duration-300",
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
            onClick={() => setCollapsed(!collapsed)}
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
          {navItems.map((item) => {
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
