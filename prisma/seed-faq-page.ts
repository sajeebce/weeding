import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Global FAQs to seed (from the hardcoded faqs.ts)
const globalFaqs = [
  // LLC Formation
  {
    question: "What is an LLC and why do I need one?",
    answer:
      "An LLC (Limited Liability Company) is a business structure that protects your personal assets from business debts and lawsuits. It combines the liability protection of a corporation with the tax flexibility of a partnership. You need an LLC to separate your personal and business finances, build credibility, and protect yourself legally.",
    category: "LLC Formation",
    sortOrder: 1,
  },
  {
    question: "Do I need to be a US citizen to form an LLC?",
    answer:
      "No, you do not need to be a US citizen or resident to form an LLC in the United States. International entrepreneurs from any country can form a US LLC. You'll need a registered agent with a US address (which we provide) and can manage your LLC from anywhere in the world.",
    category: "LLC Formation",
    sortOrder: 2,
  },
  {
    question: "Which state should I form my LLC in?",
    answer:
      "For most international entrepreneurs and online businesses, we recommend Wyoming due to its low fees ($100 filing, $60/year annual), strong privacy protections, no state income tax, and business-friendly laws. Delaware is preferred for businesses seeking venture capital. New Mexico is the most affordable option with just $50 filing and no annual fees.",
    category: "LLC Formation",
    sortOrder: 3,
  },
  {
    question: "How long does it take to form an LLC?",
    answer:
      "Standard LLC formation typically takes 3-5 business days after we submit your documents to the state. With our expedited service, most states can process your LLC in 1-2 business days. You'll receive your formation documents via email as soon as they're ready.",
    category: "LLC Formation",
    sortOrder: 4,
  },
  {
    question: "What documents will I receive after forming my LLC?",
    answer:
      "You'll receive: Articles of Organization (state-filed formation document), Operating Agreement (internal governance document), EIN Confirmation Letter (if ordered), Registered Agent Acceptance, and all state filing receipts. All documents are delivered digitally to your dashboard and can be downloaded anytime.",
    category: "LLC Formation",
    sortOrder: 5,
  },
  {
    question: "What is a Registered Agent and do I need one?",
    answer:
      "A Registered Agent is a person or company designated to receive legal documents and official correspondence on behalf of your LLC. Every state requires LLCs to have a registered agent with a physical address in the state of formation. We provide registered agent service as part of our Standard and Premium packages.",
    category: "LLC Formation",
    sortOrder: 6,
  },
  {
    question: "Can I be my own Registered Agent?",
    answer:
      "Technically yes, but only if you have a physical address in the state where your LLC is formed and are available during business hours. For international clients or those without a US address, using a professional registered agent service is required and recommended for privacy.",
    category: "LLC Formation",
    sortOrder: 7,
  },
  {
    question: "What is an Operating Agreement?",
    answer:
      "An Operating Agreement is an internal document that outlines how your LLC will be run, including ownership percentages, profit distribution, voting rights, and management structure. While not all states require it, having one is essential for maintaining liability protection and is often required by banks to open a business account.",
    category: "LLC Formation",
    sortOrder: 8,
  },

  // EIN & Taxes
  {
    question: "What is an EIN and do I need one?",
    answer:
      "An EIN (Employer Identification Number) is a 9-digit tax ID number issued by the IRS for your business, similar to a Social Security Number for individuals. You need an EIN to open a business bank account, hire employees, file business taxes, and establish business credit. We strongly recommend getting an EIN for every LLC.",
    category: "EIN & Taxes",
    sortOrder: 1,
  },
  {
    question: "How long does it take to get an EIN?",
    answer:
      "For US residents with an SSN/ITIN, EINs can be obtained instantly online. For international clients without an SSN/ITIN, we submit your application via fax to the IRS, and it typically takes 4-6 weeks to receive your EIN. We'll notify you as soon as it's ready.",
    category: "EIN & Taxes",
    sortOrder: 2,
  },
  {
    question: "Do I need an ITIN to get an EIN?",
    answer:
      "No, you do not need an ITIN (Individual Tax Identification Number) to obtain an EIN for your LLC. International clients without an SSN or ITIN can still get an EIN - we handle this process through a special IRS fax application procedure.",
    category: "EIN & Taxes",
    sortOrder: 3,
  },
  {
    question: "What taxes does a US LLC need to pay?",
    answer:
      "By default, single-member LLCs are taxed as 'disregarded entities' and multi-member LLCs as partnerships. This means profits pass through to your personal tax return. For non-US owners without US-sourced income, you may have minimal or no US tax liability. We recommend consulting a tax professional for your specific situation.",
    category: "EIN & Taxes",
    sortOrder: 4,
  },
  {
    question: "Do I need to file US taxes if I don't live in the US?",
    answer:
      "It depends on your business activities. If your LLC earns US-sourced income (income from US customers or US-based activities), you may have US tax filing obligations. If all your income is from outside the US, you may only need to file informational returns. Consult a tax professional for advice specific to your situation.",
    category: "EIN & Taxes",
    sortOrder: 5,
  },

  // Business Banking
  {
    question: "Can non-US residents open a US business bank account?",
    answer:
      "Yes! Many US banks now offer business accounts to non-US residents with a US LLC. Some banks require an in-person visit, while others like Mercury, Relay, and certain credit unions allow remote account opening. Our Premium package includes assistance with the bank account opening process.",
    category: "Business Banking",
    sortOrder: 1,
  },
  {
    question: "Which banks do you recommend for international LLC owners?",
    answer:
      "For international clients, we recommend Mercury (online bank, easy remote opening), Relay (no monthly fees, remote opening), and certain credit unions. Traditional banks like Chase or Bank of America typically require an in-person visit but offer more services. Your best option depends on your specific needs.",
    category: "Business Banking",
    sortOrder: 2,
  },
  {
    question: "What documents do I need to open a business bank account?",
    answer:
      "Typically you'll need: Articles of Organization, Operating Agreement, EIN Confirmation Letter, valid passport or government ID, proof of business address, and sometimes a business plan or website. Banks may have additional requirements - we'll guide you through the specific requirements for your chosen bank.",
    category: "Business Banking",
    sortOrder: 3,
  },
  {
    question: "Do I need to visit the US to open a bank account?",
    answer:
      "Not necessarily. Several banks and fintech companies (Mercury, Relay, Brex) allow international LLC owners to open accounts entirely online. Traditional banks like Chase, Bank of America, and Wells Fargo typically require an in-person visit to a US branch.",
    category: "Business Banking",
    sortOrder: 4,
  },

  // Amazon Seller
  {
    question: "Do I need a US LLC to sell on Amazon?",
    answer:
      "While not strictly required, having a US LLC provides significant benefits for Amazon sellers: better access to Amazon lending, easier payment processing, professional business image, liability protection, and simpler tax reporting. Most successful international Amazon sellers operate through a US LLC.",
    category: "Amazon Seller",
    sortOrder: 1,
  },
  {
    question: "Can I use my US LLC to sell on Amazon from outside the US?",
    answer:
      "Yes! A US LLC can be used to sell on Amazon.com and other Amazon marketplaces from anywhere in the world. You'll need an EIN, a US bank account (or supported international bank), and proper tax documentation. We help set up everything you need to start selling.",
    category: "Amazon Seller",
    sortOrder: 2,
  },
  {
    question:
      "What do I need to set up an Amazon seller account with a US LLC?",
    answer:
      "To create an Amazon Professional Seller account with your US LLC, you'll need: EIN, business bank account or credit card, valid phone number, government-issued ID, and Articles of Organization. Our Amazon Seller Setup service guides you through the entire registration process.",
    category: "Amazon Seller",
    sortOrder: 3,
  },
  {
    question:
      "How do I receive payments from Amazon as an international seller?",
    answer:
      "Amazon can deposit funds to your US business bank account directly. Alternatively, you can use payment services like Payoneer or WorldFirst that provide US bank details. With a US LLC and business bank account, you'll have the smoothest payment experience.",
    category: "Amazon Seller",
    sortOrder: 4,
  },

  // International Clients
  {
    question: "Can I manage my US LLC from my home country?",
    answer:
      "Yes, you can manage your US LLC entirely from your home country. All communication with state agencies goes through your registered agent (us), you can conduct business online, and banking can be done remotely with the right bank. You don't need to visit the US to run your LLC.",
    category: "International Clients",
    sortOrder: 1,
  },
  {
    question: "What address will my LLC have?",
    answer:
      "Your LLC will have two addresses: 1) Registered Agent Address - our address in the state of formation for receiving legal documents, and 2) Principal Business Address - can be your home country address or a US virtual address (included in Premium package) for a more professional appearance.",
    category: "International Clients",
    sortOrder: 2,
  },
  {
    question: "Do I need a US phone number for my LLC?",
    answer:
      "A US phone number is helpful but not required for LLC formation. However, you'll need one for Amazon seller registration and some bank accounts. Virtual US phone numbers are available through services like Google Voice, OpenPhone, or Grasshopper at low monthly costs.",
    category: "International Clients",
    sortOrder: 3,
  },
  {
    question: "Is my information public when I form an LLC?",
    answer:
      "This depends on the state. Wyoming, Delaware, and New Mexico do not require member names in public filings, providing privacy protection. Our registered agent address is used for public records, keeping your personal address private. For maximum privacy, we recommend Wyoming.",
    category: "International Clients",
    sortOrder: 4,
  },

  // Pricing & Payments
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through Stripe. For clients in Bangladesh, we also accept bKash, Nagad, and local bank transfers through SSLCommerz. All payments are secure and processed through encrypted connections.",
    category: "Pricing & Payments",
    sortOrder: 1,
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "No hidden fees! Our pricing is completely transparent. The price you see includes our full service fee. State filing fees are listed separately and paid at checkout. We don't charge extra for document delivery, customer support, or standard processing.",
    category: "Pricing & Payments",
    sortOrder: 2,
  },
  {
    question: "What's included in each package?",
    answer:
      "Basic ($149): LLC formation, name check, Articles of Organization, digital documents. Standard ($249): Everything in Basic plus EIN, Operating Agreement, Registered Agent (1 year), Banking Resolution. Premium ($399): Everything in Standard plus bank account assistance, virtual address, annual report filing, express processing.",
    category: "Pricing & Payments",
    sortOrder: 3,
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 30-day satisfaction guarantee. If you're not happy with our service before we file with the state, we'll provide a full refund of our service fee. After state filing, refunds are limited to our service fee only (state fees are non-refundable as they go directly to the government).",
    category: "Pricing & Payments",
    sortOrder: 4,
  },
  {
    question: "What are state filing fees?",
    answer:
      "State filing fees are government charges required to register your LLC and are paid directly to the state. These vary by state: Wyoming $100, Delaware $140, New Mexico $50, Texas $300. These fees are separate from our service fees and are clearly shown during checkout.",
    category: "Pricing & Payments",
    sortOrder: 5,
  },
];

async function main() {
  console.log("Seeding FAQ page...\n");

  // ==========================================
  // STEP 1: Seed global FAQs into database
  // ==========================================
  console.log("Step 1: Seeding global FAQs...");

  let createdCount = 0;
  let skippedCount = 0;

  for (const faq of globalFaqs) {
    // Check if FAQ already exists (by question)
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });

    if (existing) {
      // Update category and sortOrder if needed
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: {
          category: faq.category,
          sortOrder: faq.sortOrder,
          answer: faq.answer,
          isActive: true,
        },
      });
      skippedCount++;
    } else {
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          isActive: true,
        },
      });
      createdCount++;
    }
  }

  console.log(
    `  Created: ${createdCount}, Updated: ${skippedCount} (total: ${globalFaqs.length})`
  );

  // ==========================================
  // STEP 2: Build FAQ page sections
  // ==========================================
  console.log("\nStep 2: FAQ page sections...");

  const faqPage = await prisma.landingPage.findFirst({
    where: {
      OR: [
        { slug: "faq" },
        { templateType: "FAQ", isTemplateActive: true },
      ],
    },
  });

  if (!faqPage) {
    console.log("  FAQ page not found! Run seed-system-pages.ts first.");
    return;
  }

  console.log(`  Found FAQ page: ${faqPage.id} (/${faqPage.slug})`);

  // Build the sections JSON
  const sections = [
    // ────────────────────────────────────
    // Section 1: Page Header
    // ────────────────────────────────────
    {
      id: "faq_header",
      order: 0,
      layout: "1",
      columns: [
        {
          id: "faq_header_col",
          widgets: [
            // "Help Center" badge
            {
              id: "faq_badge",
              type: "heading",
              settings: {
                content: {
                  text: "Help Center",
                  htmlTag: "div",
                },
                style: {
                  alignment: "center",
                  typography: {
                    fontSize: 14,
                    fontSizeUnit: "px",
                    fontWeight: 500,
                    fontStyle: "normal",
                    textTransform: "none",
                    textDecoration: "none",
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    letterSpacingUnit: "px",
                  },
                  textFill: {
                    type: "solid",
                    color: "#ffffff",
                  },
                },
                advanced: {
                  customClass:
                    "mx-auto w-fit rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground",
                },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Main heading
            {
              id: "faq_heading",
              type: "heading",
              settings: {
                content: {
                  text: "Frequently Asked Questions",
                  htmlTag: "h1",
                },
                style: {
                  alignment: "center",
                  typography: {
                    fontSize: 36,
                    fontSizeUnit: "px",
                    fontWeight: 700,
                    fontStyle: "normal",
                    textTransform: "none",
                    textDecoration: "none",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    letterSpacingUnit: "px",
                  },
                  textFill: {
                    type: "solid",
                    color: "#0f172a",
                  },
                },
                responsive: {
                  desktop: {
                    fontSize: 36,
                    fontSizeUnit: "px",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    alignment: "center",
                  },
                  tablet: {
                    fontSize: 30,
                    fontSizeUnit: "px",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  },
                  mobile: {
                    fontSize: 26,
                    fontSizeUnit: "px",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  },
                },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Description
            {
              id: "faq_description",
              type: "text-block",
              settings: {
                content:
                  '<p style="text-align: center">Find answers to common questions about LLC formation, EIN, banking, Amazon seller accounts, and more. Can\'t find what you\'re looking for? <a href="/contact">Contact our team</a> for personalized help.</p>',
                editor: { toolbar: "minimal", minHeight: 60 },
                typography: {
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#64748b",
                  linkColor: "#f97316",
                  linkHoverColor: "#ea580c",
                  linkUnderline: true,
                },
                container: { padding: 0, borderRadius: 0 },
                paragraphSpacing: 16,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 64,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "lg",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },

    // ────────────────────────────────────
    // Section 2: General FAQs (source: "all" with category filter)
    // ────────────────────────────────────
    {
      id: "faq_general",
      order: 1,
      layout: "1",
      columns: [
        {
          id: "faq_general_col",
          widgets: [
            {
              id: "faq_general_widget",
              type: "faq-accordion",
              settings: {
                header: {
                  show: true,
                  heading: "General FAQ",
                  description:
                    "Everything you need to know about our services and processes",
                  alignment: "center",
                },
                source: "all",
                categories: [],
                maxItems: 50,
                expandFirst: true,
                allowMultipleOpen: true,
                style: "cards",
                accentColor: "#f97316",
                showCategoryFilter: true,
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 32,
        paddingBottom: 48,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "xl",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },

    // ────────────────────────────────────
    // Section 3: Service-specific FAQs (source: "service-all")
    // ────────────────────────────────────
    {
      id: "faq_services",
      order: 2,
      layout: "1",
      columns: [
        {
          id: "faq_services_col",
          widgets: [
            {
              id: "faq_services_widget",
              type: "faq-accordion",
              settings: {
                header: {
                  show: true,
                  heading: "Service-Specific FAQ",
                  description:
                    "Detailed answers organized by service category",
                  alignment: "center",
                },
                source: "service-all",
                categories: [],
                maxItems: 50,
                expandFirst: false,
                allowMultipleOpen: true,
                style: "cards",
                accentColor: "#f97316",
                showCategoryFilter: false,
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "#f8fafc" },
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "xl",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },

    // ────────────────────────────────────
    // Section 4: "Still Have Questions?" CTA
    // ────────────────────────────────────
    {
      id: "faq_cta",
      order: 3,
      layout: "1",
      columns: [
        {
          id: "faq_cta_col",
          widgets: [
            {
              id: "faq_cta_card",
              type: "text-block",
              settings: {
                content: [
                  '<div style="text-align: center">',
                  '<h2 style="font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 12px">Still Have Questions?</h2>',
                  '<p style="font-size: 16px; color: #64748b; margin-bottom: 24px; max-width: 500px; margin-left: auto; margin-right: auto">Can\'t find the answer you\'re looking for? Our team is here to help you with any questions about our services.</p>',
                  '<div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap">',
                  '<a href="/contact" style="display: inline-block; background: #f97316; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none">Contact Us</a>',
                  '<a href="/contact#chat" style="display: inline-block; background: #ffffff; color: #0f172a; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; text-decoration: none; border: 1px solid #e2e8f0">Live Chat</a>',
                  "</div>",
                  "</div>",
                ].join(""),
                editor: { toolbar: "minimal", minHeight: 100 },
                typography: {
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#334155",
                  linkColor: "#ffffff",
                  linkHoverColor: "#ffffff",
                  linkUnderline: false,
                },
                container: {
                  padding: 48,
                  borderRadius: 16,
                  border: { width: 1, color: "#e2e8f0", style: "solid" },
                  shadow: "md",
                  backgroundColor: "#ffffff",
                },
                paragraphSpacing: 16,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 48,
        paddingBottom: 64,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "lg",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },
  ];

  // Find and update the widget-page-sections block
  const block = await prisma.landingPageBlock.findFirst({
    where: {
      landingPageId: faqPage.id,
      type: "widget-page-sections",
    },
  });

  if (block) {
    await prisma.landingPageBlock.update({
      where: { id: block.id },
      data: {
        settings: sections as unknown as Prisma.InputJsonValue,
      },
    });
    console.log(`  Updated widget-page-sections block: ${block.id}`);
  } else {
    await prisma.landingPageBlock.create({
      data: {
        landingPageId: faqPage.id,
        type: "widget-page-sections",
        name: "Widget Page Sections",
        sortOrder: 0,
        isActive: true,
        settings: sections as unknown as Prisma.InputJsonValue,
      },
    });
    console.log("  Created widget-page-sections block");
  }

  console.log("\nDone! FAQ page seeded successfully.");
  console.log(`  Page: /${faqPage.slug}`);
  console.log(`  Global FAQs: ${globalFaqs.length} across 6 categories`);
  console.log("  Sections: 4 (header, general FAQ, service FAQ, CTA)");
  console.log("  Widgets: faq-accordion (all + category filter), faq-accordion (service-all), text-block CTA");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
