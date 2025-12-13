import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/db";

// Fallback FAQs if database is empty
const fallbackFaqs = [
  {
    id: "1",
    question: "Can I form a US LLC as a non-US resident?",
    answer:
      "Yes, absolutely! US LLCs are available to anyone regardless of citizenship or residency. You don't need to be a US citizen, have a US address, or even visit the US to form and operate a US LLC. This is one of the reasons why US LLCs are so popular among international entrepreneurs.",
  },
  {
    id: "2",
    question: "Which state should I choose for my LLC?",
    answer:
      "Wyoming and Delaware are the most popular choices for international entrepreneurs due to their business-friendly laws, privacy protections, and low fees. Wyoming has no state income tax and offers strong asset protection. Delaware is known for its established business court system. New Mexico is also a great affordable option. We can help you choose the best state based on your specific needs.",
  },
  {
    id: "3",
    question: "How long does LLC formation take?",
    answer:
      "With our standard service, LLC formation typically takes 24-48 hours after state filing. Some states like Wyoming and New Mexico process filings within 24 hours. Delaware may take 2-3 business days. Expedited options are available for most states if you need faster processing.",
  },
  {
    id: "4",
    question: "What is an EIN and do I need one?",
    answer:
      "An EIN (Employer Identification Number) is a unique 9-digit number assigned by the IRS for tax purposes. Think of it as a Social Security Number for your business. You'll need an EIN to open a business bank account, file taxes, hire employees, and in many cases, to get an Amazon seller account. Yes, as an international business owner, you will need an EIN.",
  },
  {
    id: "5",
    question: "Can I open a US business bank account remotely?",
    answer:
      "Yes, several US banks allow remote account opening for foreign-owned LLCs. We have partnerships with banks that specialize in serving international entrepreneurs. The requirements typically include your LLC documents, EIN, passport, and proof of address. Our Premium package includes business banking assistance.",
  },
  {
    id: "6",
    question: "What do I need to start selling on Amazon US?",
    answer:
      "To sell on Amazon US as an international seller, you'll need: 1) A US LLC or business entity, 2) An EIN number, 3) A US business bank account, 4) Valid identification documents, and 5) A credit card for Amazon fees. Our Premium package includes everything you need to get started on Amazon.",
  },
  {
    id: "7",
    question: "What are the ongoing costs after forming an LLC?",
    answer:
      "After formation, typical ongoing costs include: Annual registered agent fee ($99-149/year), state annual report fees ($50-300 depending on state), and potentially a franchise tax in some states. Wyoming has a $60 annual report fee, while Delaware has an annual franchise tax of $300. We'll keep you informed about all compliance requirements.",
  },
  {
    id: "8",
    question: "Do you provide legal or tax advice?",
    answer:
      "LLCPad is a document filing service and does not provide legal or tax advice. For specific legal questions, we recommend consulting with an attorney. For tax matters, especially international tax implications, please consult with a CPA or tax professional who specializes in US-international business taxation.",
  },
];

async function getFAQs() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    });

    if (faqs.length === 0) {
      return fallbackFaqs;
    }

    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return fallbackFaqs;
  }
}

export async function FAQSection() {
  const faqs = await getFAQs();

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Section Header */}
          <div className="lg:col-span-1">
            <Badge variant="secondary" className="mb-4">
              FAQs
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Get answers to the most common questions about US LLC formation
              for international entrepreneurs.
            </p>
            <Button className="group mt-6" variant="outline" asChild>
              <Link href="/faq">
                View All FAQs
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-2">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
