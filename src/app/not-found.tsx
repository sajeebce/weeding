import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Page Not Found
        </h1>

        <p className="mb-8 text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              <Search className="mr-2 h-4 w-4" />
              Browse Services
            </Link>
          </Button>
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="mb-4 text-sm text-muted-foreground">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/services" className="text-primary hover:underline">
              Our Services
            </Link>
            <Link href="/about" className="text-primary hover:underline">
              About Us
            </Link>
            <Link href="/blog" className="text-primary hover:underline">
              Blog
            </Link>
            <Link href="/contact" className="text-primary hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
