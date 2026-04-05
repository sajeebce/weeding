"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
  CreditCard,
  Inbox,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/profile", label: "My Profile", icon: User },
  { href: "/vendor/messages", label: "Messages", icon: Inbox, badge: true },
  { href: "/vendor/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/vendor/reviews", label: "Reviews", icon: Star },
  { href: "/vendor/billing", label: "Plan & Billing", icon: CreditCard },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [businessName, setBusinessName] = useState<string | null>(null);

  // Fetch vendor profile (business name) once on mount
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "VENDOR") return;
    fetch("/api/vendor/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.profile?.businessName) setBusinessName(d.profile.businessName); })
      .catch(() => {});
  }, [status, session?.user?.role]);

  // Fetch unread message count every 30s
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "VENDOR") return;

    async function fetchUnread() {
      try {
        const res = await fetch("/api/vendor/conversations/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count ?? 0);
        }
      } catch {
        // silently ignore
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [status, session?.user?.role]);

  // Don't apply layout to register page
  if (pathname === "/vendor/register") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/vendor/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Vendor Portal</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business name */}
        {(businessName || session?.user?.name) && (
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Logged in as</p>
            <p className="text-sm font-medium text-gray-700 truncate mt-0.5">
              {businessName || session?.user?.name}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            const showBadge = badge && unreadCount > 0 && !active;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {showBadge && (
                  <span className="ml-auto bg-purple-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {active && !showBadge && <ChevronRight className="w-3.5 h-3.5 ml-auto text-purple-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <Link
            href="/vendors"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Store className="w-4 h-4 shrink-0" />
            View Public Listing
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">Vendor Portal</span>
          {unreadCount > 0 && (
            <Link href="/vendor/messages" className="ml-auto">
              <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {unreadCount} new
              </span>
            </Link>
          )}
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
