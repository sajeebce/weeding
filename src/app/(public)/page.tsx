import { Hero } from "@/components/sections/hero";
import { ServicesGrid } from "@/components/sections/services-grid";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PricingTable } from "@/components/sections/pricing-table";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";
import { JsonLd, MultiJsonLd } from "@/components/seo/json-ld";
import {
  generateOrganizationSchema,
  generateFAQSchema,
  generateProductSchema,
} from "@/lib/seo";

const homepageFaqs = [
  {
    question: "How long does it take to form an LLC?",
    answer:
      "Standard LLC formation typically takes 3-5 business days after state filing. With our expedited service, you can have your LLC formed within 24 hours.",
  },
  {
    question: "Do I need to be a US citizen to form an LLC?",
    answer:
      "No, you do not need to be a US citizen or resident to form an LLC in the United States. International entrepreneurs from any country can form a US LLC.",
  },
  {
    question: "What is an EIN and do I need one?",
    answer:
      "An EIN (Employer Identification Number) is a tax ID for your business, similar to a Social Security Number for individuals. You'll need an EIN to open a business bank account, hire employees, and file taxes.",
  },
  {
    question: "Which state is best for forming an LLC?",
    answer:
      "Wyoming, Delaware, and New Mexico are popular choices for LLC formation due to their business-friendly laws, low fees, and privacy protections. Wyoming is often the best choice for small businesses and international entrepreneurs.",
  },
  {
    question: "What documents will I receive after LLC formation?",
    answer:
      "You'll receive your Articles of Organization, Operating Agreement, EIN confirmation letter (if ordered), and all state filing receipts. All documents are delivered digitally to your dashboard.",
  },
];

export default function HomePage() {
  return (
    <>
      <MultiJsonLd
        data={[
          generateOrganizationSchema(),
          generateFAQSchema(homepageFaqs),
          generateProductSchema({
            name: "LLC Formation Service",
            description:
              "Professional US LLC formation service for international entrepreneurs. Includes state filing, registered agent, and operating agreement.",
            price: 149,
            url: "/services/llc-formation",
            reviews: { rating: 4.9, count: 1247 },
          }),
        ]}
      />
      <Hero />
      <ServicesGrid />
      <HowItWorks />
      <PricingTable />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </>
  );
}
