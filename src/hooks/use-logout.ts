"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

type UserRole = "ADMIN" | "CONTENT_MANAGER" | "SALES_AGENT" | "SUPPORT_AGENT" | "CUSTOMER";

interface UseLogoutOptions {
  userRole?: UserRole;
}

export function useLogout(options: UseLogoutOptions = {}) {
  const router = useRouter();
  const { userRole = "CUSTOMER" } = options;

  const logout = async () => {
    try {
      // TODO: Clear session with NextAuth signOut()
      // await signOut({ redirect: false });

      // Clear any local storage/session data
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        sessionStorage.clear();
      }

      // Show success toast
      toast.success("Logged out successfully");

      // Role-based redirect
      // Staff (Admin, Content Manager, Sales Agent, Support Agent) -> /login
      // Customer -> / (Home)
      const staffRoles: UserRole[] = ["ADMIN", "CONTENT_MANAGER", "SALES_AGENT", "SUPPORT_AGENT"];
      const redirectUrl = staffRoles.includes(userRole) ? "/login" : "/";

      // Small delay to show toast before redirect
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      console.error("Logout error:", error);
    }
  };

  return { logout };
}
