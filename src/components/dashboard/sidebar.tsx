"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Receipt,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Menu,
  CalendarHeart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

export function DashboardSidebar({
  collapsed = false,
  onToggle,
  mobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigation = [
    { name: t("dash.overview"),        href: "/dashboard",           icon: LayoutDashboard },
    { name: t("dash.orders"),          href: "/dashboard/orders",    icon: ShoppingBag },
    { name: t("dash.invoices"),        href: "/dashboard/invoices",  icon: Receipt },
    { name: t("dash.documents"),       href: "/dashboard/documents", icon: FileText },
    { name: t("common.profile"),       href: "/dashboard/profile",   icon: User },
    { name: t("dash.support"),         href: "/dashboard/support",   icon: HelpCircle },
    { name: t("dash.weddingProjects"), href: "/planner",             icon: CalendarHeart },
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobile && "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-bold">
              LLC<span className="text-primary">Pad</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-bold text-primary-foreground">L</span>
            </div>
          </Link>
        )}
        {!mobile && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("shrink-0", collapsed && "mx-auto")}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? t("common.signOut") : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t("common.signOut")}</span>}
        </button>
      </div>
    </aside>
  );
}
