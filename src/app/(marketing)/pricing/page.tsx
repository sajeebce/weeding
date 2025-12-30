import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { PricingTable } from "@/components/sections/pricing-table";
import { FAQSection } from "@/components/sections/faq-section";
import { MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for US LLC formation services. No hidden fees. Choose from Basic, Standard, or Premium packages starting at $199.",
  keywords: [
    "LLC formation pricing",
    "LLC formation cost",
    "business formation fees",
    "affordable LLC",
    "LLC package comparison",
  ],
  openGraph: {
    title: "Pricing | LLCPad - US LLC Formation Services",
    description:
      "Transparent pricing for US LLC formation services. No hidden fees. Choose from Basic, Standard, or Premium packages starting at $199.",
  },
};

const pricingSchemas = [
  generateProductSchema({
    name: "Basic LLC Formation Package",
    description:
      "Essential LLC formation with EIN, Registered Agent, Mail Forwarding, and Operating Agreement.",
    price: 199,
    url: "/pricing",
  }),
  generateProductSchema({
    name: "Standard LLC Formation Package",
    description:
      "Most popular package with LLC formation, EIN, Fintech Bank Account, Stripe Account, and Debit Card.",
    price: 449,
    url: "/pricing",
    reviews: { rating: 4.9, count: 847 },
  }),
  generateProductSchema({
    name: "Premium LLC Formation Package",
    description:
      "Complete business setup with LLC, EIN, Fintech Bank, PayPal, Stripe, and Business Guide.",
    price: 672,
    url: "/pricing",
  }),
  generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Pricing", url: "/pricing" },
  ]),
];

export default function PricingPage() {
  return (
    <div>
      <MultiJsonLd data={pricingSchemas} />
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              No hidden fees, no surprises. Choose the package that fits your
              needs and get started with your US LLC today.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <PricingTable />

      {/* What's Included */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-foreground">
              All Packages Include
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Lifetime customer support",
                "Digital document storage",
                "Compliance reminders",
                "Free consultation",
                "Name availability check",
                "Fast processing",
                "100% satisfaction guarantee",
                "No hidden fees",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border bg-background p-4 text-center"
                >
                  <p className="text-sm font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* State Fees Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground">
              Understanding State Fees
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              <p>
                State filing fees are set by each state and are separate from
                our service fees. These fees go directly to the state to process
                your LLC formation.
              </p>
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="font-semibold text-foreground">
                  Popular State Filing Fees
                </h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>Wyoming: $100 (Recommended for privacy & low fees)</li>
                  <li>Delaware: $140 (Popular for larger businesses)</li>
                  <li>New Mexico: $50 (Lowest cost option)</li>
                  <li>Texas: $300 (Good for Texas-based operations)</li>
                  <li>Florida: $125 (Popular for e-commerce)</li>
                </ul>
              </div>
              <p>
                We recommend Wyoming for most international entrepreneurs due to
                its low fees, strong privacy protections, and no state income
                tax.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection />

      {/* Money Back Guarantee */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground">
              100% Satisfaction Guarantee
            </h2>
            <p className="mt-4 text-muted-foreground">
              If you're not completely satisfied with our service within 30 days
              of your purchase, we'll provide a full refund of our service fees
              (state fees are non-refundable as they go directly to the state).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
