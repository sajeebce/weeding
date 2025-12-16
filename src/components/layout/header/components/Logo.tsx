"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { LogoProps } from "../types";

export function Logo({ businessConfig, maxHeight = 36, className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center space-x-2", className)}>
      {businessConfig.logo.url ? (
        <Image
          src={businessConfig.logo.url}
          alt={businessConfig.name}
          width={maxHeight}
          height={maxHeight}
          className="rounded-lg object-contain"
          style={{ height: `${maxHeight}px`, width: "auto" }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-lg bg-primary"
          style={{
            height: `${maxHeight}px`,
            width: `${maxHeight}px`,
          }}
        >
          <span className="text-lg font-bold text-primary-foreground">
            {businessConfig.logo.text || businessConfig.name.charAt(0)}
          </span>
        </div>
      )}
      <span className="text-xl font-bold">{businessConfig.name}</span>
    </Link>
  );
}
