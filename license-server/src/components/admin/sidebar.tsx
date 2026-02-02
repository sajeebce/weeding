'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Key,
  Package,
  Activity,
  Webhook,
  Settings,
  KeyRound,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Licenses',
    href: '/admin/licenses',
    icon: Key,
    children: [
      { title: 'All Licenses', href: '/admin/licenses' },
      { title: 'Generate New', href: '/admin/licenses/new' },
    ],
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Activations',
    href: '/admin/activations',
    icon: Activity,
  },
  {
    title: 'Webhooks',
    href: '/admin/webhooks',
    icon: Webhook,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { title: 'General', href: '/admin/settings' },
      { title: 'RSA Keys', href: '/admin/settings/keys' },
      { title: 'Email', href: '/admin/settings/email' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">License Server</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <div key={item.title}>
              {item.children ? (
                <>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive(item.href) && 'bg-muted'
                    )}
                    onClick={() => toggleMenu(item.title)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    <ChevronDown
                      className={cn(
                        'ml-auto h-4 w-4 transition-transform',
                        openMenus.includes(item.title) && 'rotate-180'
                      )}
                    />
                  </Button>
                  {openMenus.includes(item.title) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
                            pathname === child.href &&
                              'bg-muted font-medium text-primary'
                          )}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive(item.href) && 'bg-muted font-medium text-primary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            LLCPad License Server v1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
}
