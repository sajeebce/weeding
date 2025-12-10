import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">L</span>
          </div>
          <span className="text-2xl font-bold">
            LLC<span className="text-primary">Pad</span>
          </span>
        </Link>

        {children}
      </div>
    </div>
  );
}
