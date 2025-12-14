import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "LLCPad - US LLC Formation & Amazon Seller Services",
    template: "%s | LLCPad",
  },
  description:
    "Start your US LLC in 24 hours. Professional LLC formation, EIN application, Amazon seller account setup, and business banking assistance for international entrepreneurs.",
  keywords: [
    "US LLC formation",
    "LLC registration",
    "EIN application",
    "Amazon seller account",
    "Wyoming LLC",
    "Delaware LLC",
    "US business formation",
    "international entrepreneur",
  ],
  authors: [{ name: "LLCPad" }],
  creator: "LLCPad",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LLCPad",
    title: "LLCPad - US LLC Formation & Amazon Seller Services",
    description:
      "Start your US LLC in 24 hours. Professional LLC formation for international entrepreneurs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LLCPad - US LLC Formation & Amazon Seller Services",
    description:
      "Start your US LLC in 24 hours. Professional LLC formation for international entrepreneurs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <ScrollToTop />
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
