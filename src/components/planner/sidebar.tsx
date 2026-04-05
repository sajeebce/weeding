"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Church,
  UtensilsCrossed,
  Store,
  Globe,
  CheckSquare,
  DollarSign,
  CalendarClock,
  Armchair,
  StickyNote,
  PartyPopper,
  Settings,
  ChevronLeft,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "label" in entry;
}

function getNavigation(projectId: string, t: (key: string) => string): NavEntry[] {
  const base = `/planner/${projectId}`;
  return [
    { name: t("planner.nav.overview"), href: base, icon: LayoutDashboard },
    { name: t("planner.nav.guestList"), href: `${base}/guests`, icon: Users },
    {
      label: t("planner.nav.venuesVendors"),
      children: [
        { name: t("planner.nav.ceremony"), href: `${base}/ceremony`, icon: Church },
        { name: t("planner.nav.reception"), href: `${base}/reception`, icon: UtensilsCrossed },
        { name: t("planner.nav.allVendors"), href: `${base}/vendors`, icon: Store },
      ],
    },
    {
      label: t("planner.nav.planningTools"),
      children: [
        { name: t("planner.nav.website"), href: `${base}/website`, icon: Globe },
        { name: t("planner.nav.checklist"), href: `${base}/checklist`, icon: CheckSquare },
        { name: t("planner.nav.budget"), href: `${base}/budget`, icon: DollarSign },
        { name: t("planner.nav.itinerary"), href: `${base}/itinerary`, icon: CalendarClock },
        { name: t("planner.nav.seating"), href: `${base}/seating`, icon: Armchair },
        { name: t("planner.nav.notes"), href: `${base}/notes`, icon: StickyNote },
      ],
    },
    { name: t("planner.nav.postWedding"), href: `${base}/post-wedding`, icon: PartyPopper },
    { name: t("planner.nav.settings"), href: `${base}/settings`, icon: Settings },
  ];
}

interface SidebarProps {
  projectId: string;
  projectTitle?: string;
  eventDate?: string | null;
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
}

function SidebarInner({
  projectId,
  projectTitle,
  eventDate,
  collapsed,
  onToggle,
  mobile,
}: Required<SidebarProps>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const src = searchParams.get("src"); // "ceremony" | "reception" when coming from venue pages
  const { t } = useLanguage();
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const navigation = getNavigation(projectId, t);

  const isActive = (href: string) => {
    const base = `/planner/${projectId}`;
    if (href === base) return pathname === base;
    const seatingHref = `${base}/seating`;
    // When navigating from ceremony/reception "plan venue layout", keep those items highlighted
    if (src === "ceremony" && href === `${base}/ceremony` && pathname.startsWith(seatingHref)) return true;
    if (src === "reception" && href === `${base}/reception` && pathname.startsWith(seatingHref)) return true;
    if (href === seatingHref && (src === "ceremony" || src === "reception")) return false;
    return pathname.startsWith(href);
  };

  const toggleGroup = (label: string) => {
    setClosedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((g) => g !== label)
        : [...prev, label]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          active
            ? "bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md shadow-rose-200/50"
            : "text-gray-700 hover:bg-gray-50 hover:text-black",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.name : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-100 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        mobile && "w-64"
      )}
    >
      {/* Header — Project Title */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {!collapsed && (
          <Link href="/planner" className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 shadow-sm">
              <span className="text-xs font-bold text-white">WP</span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-sm text-slate-700 leading-tight">{projectTitle}</p>
              {eventDate && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-tight mt-0.5">
                  {new Date(eventDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
                </p>
              )}
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/planner" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-purple-600 shadow-sm">
              <span className="text-xs font-bold text-white">WP</span>
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
        {navigation.map((entry) => {
          if (isGroup(entry)) {
            const open = !closedGroups.includes(entry.label);

            if (collapsed) {
              return (
                <div key={entry.label} className="space-y-1 pt-2">
                  {entry.children.map(renderNavItem)}
                </div>
              );
            }

            return (
              <Collapsible
                key={entry.label}
                open={open}
                onOpenChange={() => toggleGroup(entry.label)}
              >
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                    <span>{entry.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {entry.children.map(renderNavItem)}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return renderNavItem(entry);
        })}
      </nav>
    </aside>
  );
}

export function PlannerSidebar(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarInner
        projectId={props.projectId}
        projectTitle={props.projectTitle ?? "Untitled"}
        eventDate={props.eventDate ?? null}
        collapsed={props.collapsed ?? false}
        onToggle={props.onToggle ?? (() => {})}
        mobile={props.mobile ?? false}
      />
    </Suspense>
  );
}
