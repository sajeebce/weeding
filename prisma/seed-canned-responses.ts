import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🤖 Seeding canned responses...");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("No admin user found!");
    return;
  }

  // Delete existing canned responses
  await prisma.cannedResponse.deleteMany({});

  const cannedResponses = [
    {
      title: "Welcome Message",
      content:
        "Hello! Thank you for contacting LLCPad support. We're here to help you with your LLC formation and Amazon seller services. How can we assist you today?",
      category: "General",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "EIN Timeline",
      content:
        "The EIN (Employer Identification Number) is typically issued within 24-48 hours after your LLC is approved by the state. Once we receive it, we'll send it to you immediately via email. You'll be able to download it from your dashboard as well.",
      category: "LLC Formation",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "LLC Processing Time",
      content:
        "Wyoming LLC formation typically takes 3-5 business days for standard processing. If you've selected expedited service, it can be completed within 24 hours. You'll receive email updates at each stage:\n\n1. State filing submitted\n2. LLC approved\n3. EIN application (if ordered)\n4. Documents ready for download",
      category: "LLC Formation",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Document Upload Request",
      content:
        "To proceed with your order, we need you to upload the required documents. Please:\n\n1. Log in to your dashboard at https://llcpad.com/dashboard\n2. Go to Documents section\n3. Upload the requested files\n\nIf you're having trouble uploading, please let us know and we can assist you.",
      category: "Documents",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Amazon Seller Account Setup",
      content:
        "Setting up your Amazon Seller account typically takes 3-7 business days after your LLC and EIN are ready. Here's what we need from you:\n\n✓ LLC documents (we'll provide)\n✓ EIN confirmation (we'll provide)\n✓ Valid passport or driver's license\n✓ Bank account details\n✓ Phone number for verification\n\nWe'll guide you through each step!",
      category: "Amazon Services",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Payment Confirmation",
      content:
        "We've received your payment successfully! Your order is now being processed. You can track the status in your dashboard at https://llcpad.com/dashboard\n\nOrder Number: [ORDER_NUMBER]\nTotal Paid: $[AMOUNT]\n\nWe'll send you email updates as we progress. Thank you for choosing LLCPad!",
      category: "Billing",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Refund Policy",
      content:
        "We offer a 100% money-back guarantee if:\n\n• State rejects your LLC filing (rare)\n• We cannot deliver the service as promised\n• You cancel within 24 hours before state filing\n\nAfter state filing has been submitted, we cannot issue refunds for state fees. However, we'll work with you to resolve any issues. Please review our full refund policy at https://llcpad.com/refund-policy",
      category: "Billing",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Registered Agent Service",
      content:
        "Our Registered Agent service includes:\n\n✓ One year of registered agent service in your chosen state\n✓ Mail forwarding to your address\n✓ Instant notification of legal documents\n✓ Secure online access to scanned documents\n✓ Compliance calendar reminders\n\nRenewal is $99/year and you'll receive a reminder 30 days before expiry.",
      category: "Compliance",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Operating Agreement",
      content:
        "Your Operating Agreement is customized for your LLC and includes:\n\n• Member/Manager structure\n• Ownership percentages\n• Voting rights\n• Profit distribution\n• Management procedures\n• Dissolution procedures\n\nYou'll receive it as a Word document that you can edit if needed. It's included free with our LLC formation packages!",
      category: "LLC Formation",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Banking Recommendation",
      content:
        "For non-US residents, we recommend these banks for your US LLC:\n\n1. **Mercury** - 100% online, no SSN required, great for e-commerce\n2. **Relay** - Multiple accounts, debit cards, good for teams\n3. **Wise Business** - International transfers, multi-currency\n\nWe can provide an introduction letter to help with the application. Let us know which bank you prefer!",
      category: "Banking",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Trademark Search",
      content:
        "Before filing your trademark, we conduct a comprehensive search to ensure:\n\n✓ No identical marks in your category\n✓ No similar marks that could cause confusion\n✓ Name is eligible for trademark protection\n\nThe search takes 2-3 business days. If we find conflicts, we'll suggest alternatives before proceeding with the filing.",
      category: "Trademark",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Brand Registry Requirements",
      content:
        "For Amazon Brand Registry, you need:\n\n1. **Registered trademark** (not pending)\n2. **Active Amazon Seller account** \n3. **Brand name matching trademark**\n4. **Government registration number**\n\nThe trademark process takes 6-12 months. We can help you get started and handle the entire process including USPTO filing and brand registry enrollment.",
      category: "Amazon Services",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Annual Compliance",
      content:
        "Don't worry about missing deadlines! Our compliance service includes:\n\n✓ Annual report filing\n✓ Franchise tax payment (if applicable)\n✓ Registered agent service\n✓ Deadline reminders 60 days in advance\n✓ Document retention\n\nWe'll handle everything for you automatically each year.",
      category: "Compliance",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Virtual Address Service",
      content:
        "Your US virtual address includes:\n\n✓ Professional business address in [STATE]\n✓ Mail receiving and scanning\n✓ Forward to your international address\n✓ Package acceptance\n✓ Online mailbox access 24/7\n\nPerfect for Amazon, Stripe, and other services requiring a US address!",
      category: "Services",
      isPublic: true,
      createdById: admin.id,
    },
    {
      title: "Order Status Update",
      content:
        "Your order is currently: [STATUS]\n\nNext steps:\n1. [NEXT_STEP_1]\n2. [NEXT_STEP_2]\n\nEstimated completion: [DATE]\n\nYou can check detailed status anytime at https://llcpad.com/dashboard\n\nNeed anything else? Just reply to this message!",
      category: "General",
      isPublic: true,
      createdById: admin.id,
    },
  ];

  for (const response of cannedResponses) {
    await prisma.cannedResponse.create({
      data: response,
    });
  }

  console.log(`✅ Created ${cannedResponses.length} canned responses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
