import bcrypt from "bcryptjs";
import { execSync } from "child_process";

// Use Prisma CLI for database operations since pg Pool has auth issues
function runPrismaSQL(sql: string) {
  const escaped = sql.replace(/"/g, '\\"');
  execSync(`cd "${process.cwd()}" && echo "${escaped}" | npx prisma db execute --stdin`, {
    stdio: "inherit",
  });
}

async function main() {
  console.log("Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("Demo@123", 12);

  // Create demo users for each role
  const users = [
    {
      email: "admin@llcpad.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN" as const,
      country: "USA",
    },
    {
      email: "customer@llcpad.com",
      name: "Demo Customer",
      password: hashedPassword,
      role: "CUSTOMER" as const,
      country: "Bangladesh",
    },
    {
      email: "content@llcpad.com",
      name: "Content Manager",
      password: hashedPassword,
      role: "CONTENT_MANAGER" as const,
      country: "USA",
    },
    {
      email: "sales@llcpad.com",
      name: "Sales Agent",
      password: hashedPassword,
      role: "SALES_AGENT" as const,
      country: "USA",
    },
    {
      email: "support@llcpad.com",
      name: "Support Agent",
      password: hashedPassword,
      role: "SUPPORT_AGENT" as const,
      country: "USA",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created user: ${user.email} (${user.role})`);
  }

  // Create demo services
  const services = [
    {
      name: "LLC Formation",
      slug: "llc-formation",
      description: "Complete LLC formation service for all 50 US states. We handle everything from name availability check to filing Articles of Organization.",
      shortDesc: "Start your US LLC with expert guidance",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "EIN Application",
      slug: "ein-application",
      description: "Get your Employer Identification Number (EIN) from the IRS. Required for opening business bank accounts and hiring employees.",
      shortDesc: "Get your Tax ID number",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Registered Agent",
      slug: "registered-agent",
      description: "Professional registered agent service in any US state. We receive legal documents on your behalf and forward them to you.",
      shortDesc: "Comply with state requirements",
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Amazon Seller Account",
      slug: "amazon-seller-account",
      description: "Complete Amazon seller account setup assistance. We help with account creation, verification, and initial configuration.",
      shortDesc: "Start selling on Amazon",
      isActive: true,
      sortOrder: 4,
    },
    {
      name: "Business Bank Account",
      slug: "business-bank-account",
      description: "Assistance with opening US business bank account remotely. We guide you through the entire process.",
      shortDesc: "Open US business bank account",
      isActive: true,
      sortOrder: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    });
    console.log(`Created service: ${service.name}`);
  }

  // Create packages for LLC Formation
  const llcService = await prisma.service.findUnique({
    where: { slug: "llc-formation" },
  });

  if (llcService) {
    const packages = [
      {
        serviceId: llcService.id,
        name: "Basic",
        description: "Essential LLC formation package",
        priceUSD: 149,
        priceBDT: 16500,
        features: [
          "Name Availability Check",
          "Articles of Organization",
          "Operating Agreement Template",
          "Standard Processing (2-3 weeks)",
        ],
        isPopular: false,
        sortOrder: 1,
      },
      {
        serviceId: llcService.id,
        name: "Standard",
        description: "Most popular LLC formation package",
        priceUSD: 299,
        priceBDT: 33000,
        features: [
          "Everything in Basic",
          "EIN Application",
          "Registered Agent (1 Year)",
          "Expedited Processing (1 week)",
          "Compliance Calendar",
        ],
        isPopular: true,
        sortOrder: 2,
      },
      {
        serviceId: llcService.id,
        name: "Premium",
        description: "Complete business setup package",
        priceUSD: 499,
        priceBDT: 55000,
        features: [
          "Everything in Standard",
          "Business Bank Account Assistance",
          "Amazon Seller Account Setup",
          "Rush Processing (3-5 days)",
          "1 Hour Consultation",
          "Priority Support",
        ],
        isPopular: false,
        sortOrder: 3,
      },
    ];

    for (const pkg of packages) {
      const existing = await prisma.package.findFirst({
        where: {
          serviceId: pkg.serviceId,
          name: pkg.name,
        },
      });

      if (!existing) {
        await prisma.package.create({ data: pkg });
        console.log(`Created package: ${pkg.name}`);
      }
    }
  }

  // Create popular state fees
  const stateFees = [
    { stateCode: "WY", stateName: "Wyoming", llcFee: 100, annualFee: 60, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "DE", stateName: "Delaware", llcFee: 90, annualFee: 300, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "NV", stateName: "Nevada", llcFee: 425, annualFee: 350, processingTime: "1-3 weeks", isPopular: true },
    { stateCode: "FL", stateName: "Florida", llcFee: 125, annualFee: 138.75, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "TX", stateName: "Texas", llcFee: 300, annualFee: 0, processingTime: "2-3 weeks", isPopular: true },
    { stateCode: "CA", stateName: "California", llcFee: 70, annualFee: 800, processingTime: "2-4 weeks", isPopular: false },
    { stateCode: "NY", stateName: "New York", llcFee: 200, annualFee: 25, processingTime: "2-3 weeks", isPopular: false },
    { stateCode: "NM", stateName: "New Mexico", llcFee: 50, annualFee: 0, processingTime: "1-2 weeks", isPopular: true },
  ];

  for (const state of stateFees) {
    await prisma.stateFee.upsert({
      where: { stateCode: state.stateCode },
      update: {},
      create: state,
    });
    console.log(`Created state fee: ${state.stateName}`);
  }

  // Create sample FAQs
  const faqs = [
    {
      question: "How long does it take to form an LLC?",
      answer: "Processing times vary by state, typically ranging from 1-4 weeks. Our expedited service can reduce this to 3-5 business days in most states.",
      category: "LLC Formation",
      sortOrder: 1,
    },
    {
      question: "Do I need to be a US citizen to form an LLC?",
      answer: "No, US citizenship is not required. Foreign nationals can legally form and own LLCs in the United States.",
      category: "LLC Formation",
      sortOrder: 2,
    },
    {
      question: "What is a Registered Agent?",
      answer: "A registered agent is a person or company designated to receive legal documents and official government correspondence on behalf of your LLC.",
      category: "Registered Agent",
      sortOrder: 3,
    },
    {
      question: "Can I open a US bank account remotely?",
      answer: "Yes, we help international clients open US business bank accounts remotely through our partner banks that accept foreign-owned LLCs.",
      category: "Banking",
      sortOrder: 4,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });

    if (!existing) {
      await prisma.fAQ.create({ data: faq });
      console.log(`Created FAQ: ${faq.question.substring(0, 30)}...`);
    }
  }

  // Create sample testimonials
  const testimonials = [
    {
      name: "Rahman Ahmed",
      company: "TechBD Solutions",
      country: "Bangladesh",
      content: "LLCPad made forming my US LLC incredibly easy. The team was responsive and guided me through every step. Highly recommended!",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: "Sarah Chen",
      company: "Global Imports Co",
      country: "China",
      content: "Professional service with excellent communication. Got my Wyoming LLC and EIN within 2 weeks. Very satisfied!",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: "Mohammed Al-Farsi",
      company: "Gulf Trading LLC",
      country: "UAE",
      content: "The premium package was worth every penny. They helped me set up everything including my Amazon seller account.",
      rating: 5,
      sortOrder: 3,
    },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name },
    });

    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
      console.log(`Created testimonial: ${testimonial.name}`);
    }
  }

  console.log("\nSeeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
