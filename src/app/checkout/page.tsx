"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";

function CheckoutRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const service = searchParams.get("service");

  useEffect(() => {
    if (service) {
      // Build the new URL: /checkout/[service]?remaining_params
      const params = new URLSearchParams(searchParams.toString());
      params.delete("service");
      const remaining = params.toString();
      const newUrl = `/checkout/${service}${remaining ? `?${remaining}` : ""}`;
      router.replace(newUrl);
    }
  }, [service, searchParams, router]);

  // If we have a service param, show loading while redirecting
  if (service) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting to checkout...</p>
          </div>
        </div>
      </>
    );
  }

  // No service specified - show a direction message
  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Select a Service First</h1>
            <p className="text-muted-foreground leading-relaxed">
              To proceed with checkout, please browse our services and select
              the package that best fits your needs.
            </p>
          </div>
          <Link href="/services">
            <Button size="lg" className="gap-2">
              Browse Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutRedirect />
    </Suspense>
  );
}
