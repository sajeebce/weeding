import prisma from "../src/lib/db";

const testimonials = [
  {
    id: "new_001",
    name: "Priya Sharma",
    country: "India",
    company: "Amazon FBA Seller",
    content:
      "I was hesitant about starting a US business from India, but LLCPad made it incredibly smooth. Within 10 days, I had my LLC, EIN, and Amazon seller account ready. Now I'm doing $50k/month in sales! Their expertise saved me months of research.",
    rating: 5,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "new_002",
    name: "Ahmed Al-Farsi",
    country: "UAE",
    company: "E-commerce Business Owner",
    content:
      "Outstanding service! LLCPad handled my Wyoming LLC formation, registered agent service, and US business bank account seamlessly. The team's professionalism and quick response time exceeded all expectations. Highly recommend for serious entrepreneurs.",
    rating: 5,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "new_003",
    name: "Imran Khan",
    country: "Pakistan",
    company: "Digital Marketing Agency",
    content:
      "After comparing 5+ services, I chose LLCPad for their transparency and expertise. Best decision ever! They guided me through LLC formation, EIN application, and even helped with my first US client contracts. True business partners, not just a service provider.",
    rating: 5,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "new_004",
    name: "Vijay Patel",
    country: "India",
    company: "SaaS Entrepreneur",
    content:
      "LLCPad's Premium package was worth every penny. Got my Delaware LLC, business banking, and trademark registration done professionally. Their knowledge of international entrepreneur challenges is unmatched. Now my startup looks credible to US investors!",
    rating: 5,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "new_005",
    name: "Sarah Johnson",
    country: "UK",
    company: "Amazon Brand Owner",
    content:
      "I needed US presence for Amazon Brand Registry. LLCPad delivered everything - LLC, EIN, virtual address - within a week. Their step-by-step guidance made complex processes simple. My brand is now protected and sales have doubled!",
    rating: 5,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "new_006",
    name: "Omar Hassan",
    country: "UAE",
    company: "Import/Export Business",
    content:
      "Exceptional experience from start to finish! LLCPad helped me establish my US entity for international trade. The registered agent service is reliable, and their compliance support ensures I never miss important deadlines. Trustworthy partner for global business.",
    rating: 5,
    isActive: true,
    sortOrder: 6,
  },
];

async function main() {
  console.log("🌱 Seeding testimonials...");

  // Delete old testimonials
  await prisma.testimonial.deleteMany({});
  console.log("✅ Deleted old testimonials");

  // Create new testimonials
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }

  console.log(`✅ Created ${testimonials.length} new testimonials`);
  console.log("🎉 Testimonials seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
