"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CraftButton,
  CraftButtonLabel,
  CraftButtonIcon,
} from "@/components/ui/craft-button";
import { ArrowRight } from "lucide-react";
import { ORANGE_PRIMARY, WHITE } from "@/lib/button-constants";

export function HeroCTAButtons() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <CraftButton
        size="lg"
        className="w-full sm:w-auto"
        bgColor={ORANGE_PRIMARY}
        textColor={WHITE}
        asChild
      >
        <Link href="/services/llc-formation">
          <CraftButtonLabel>Start Your LLC Now</CraftButtonLabel>
          <CraftButtonIcon>
            <ArrowRight className="size-3 stroke-2" />
          </CraftButtonIcon>
        </Link>
      </CraftButton>
      <CraftButton
        size="lg"
        className="w-full border border-white/20 sm:w-auto"
        bgColor="transparent"
        textColor={WHITE}
        asChild
      >
        <Link href="/pricing">
          <CraftButtonLabel>View Pricing</CraftButtonLabel>
          <CraftButtonIcon>
            <ArrowRight className="size-3 stroke-2" />
          </CraftButtonIcon>
        </Link>
      </CraftButton>
    </div>
  );
}
