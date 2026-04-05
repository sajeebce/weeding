"use client";

import Link from "next/link";
import { Menu, Search, Plus, LogOut, User, FolderOpen, LogIn, Store } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/i18n/language-context";
import { LanguageSwitcher } from "@/components/layout/header/components/LanguageSwitcher";

interface PlannerHeaderProps {
  onMenuClick?: () => void;
}

export function PlannerHeader({ onMenuClick }: PlannerHeaderProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const isLoggedIn = !!session?.user?.id;

  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";
  const userInitials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const { logout } = useLogout({ userRole: "CUSTOMER" });

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-gray-700" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:block">
          <Link href="/vendors">
            <button className="flex items-center gap-2 w-64 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-colors text-left">
              <Search className="h-4 w-4 shrink-0" />
              <span>Find vendor or venue</span>
              <Store className="h-4 w-4 ml-auto shrink-0 text-gray-300" />
            </button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />

        <Link href="/planner">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-700 hover:text-black hover:bg-gray-50">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t("planner.header.myProjects")}</span>
          </Button>
        </Link>

        <Link href="/planner/create">
          <Button variant="ghost" size="icon" className="text-gray-700 hover:text-black hover:bg-gray-50">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>

        {!isLoggedIn && (
          <Link href="/login">
            <Button size="sm" className="gap-1.5 border-0 bg-gradient-to-r from-rose-500 to-purple-500 text-white hover:from-rose-600 hover:to-purple-600 shadow-sm">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t("common.signIn")}</span>
            </Button>
          </Link>
        )}

        {isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-gray-50">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-rose-400 to-purple-500 text-white font-semibold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline-block text-black">{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/planner" className="flex cursor-pointer items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {t("planner.header.myProjects")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex cursor-pointer items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("planner.header.profileSettings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
