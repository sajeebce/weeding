"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import type { CTAButtonsProps } from "../types";

export function CTAButtons({
  buttons,
  showAuth,
  authConfig,
  user,
  session,
  onLogout,
}: CTAButtonsProps) {
  const isLoggedIn = !!(user || session?.user);

  if (isLoggedIn) {
    return <UserMenu user={user} session={session} onLogout={onLogout} />;
  }

  return (
    <div className="flex items-center gap-x-4">
      {showAuth && (
        <Button variant="ghost" asChild>
          <Link href="/login">{authConfig.loginText || "Sign In"}</Link>
        </Button>
      )}

      {buttons && buttons.length > 0 ? (
        buttons.map((btn, index) => (
          <Button
            key={index}
            variant={btn.variant === "outline" ? "outline" : "default"}
            asChild
          >
            <Link href={btn.url}>{btn.text}</Link>
          </Button>
        ))
      ) : (
        <Button asChild>
          <Link href="/services/llc-formation">Get Started</Link>
        </Button>
      )}
    </div>
  );
}
