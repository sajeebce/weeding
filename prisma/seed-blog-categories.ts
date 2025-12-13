import prisma from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding blog categories...");

  // Check if Uncategorized exists
  const uncategorized = await prisma.blogCategory.findUnique({
    where: { slug: "uncategorized" },
  });

  if (!uncategorized) {
    await prisma.blogCategory.create({
      data: {
        name: "Uncategorized",
        slug: "uncategorized",
        description: "Posts without a specific category",
      },
    });
    console.log("✅ Created Uncategorized category");
  } else {
    console.log("✅ Uncategorized category already exists");
  }

  // Create some other default categories
  const defaultCategories = [
    {
      name: "LLC Formation",
      slug: "llc-formation",
      description: "Articles about forming and managing your LLC",
    },
    {
      name: "Business Tips",
      slug: "business-tips",
      description: "General business advice and tips for entrepreneurs",
    },
    {
      name: "Amazon Selling",
      slug: "amazon-selling",
      description: "Tips and guides for Amazon sellers",
    },
    {
      name: "Compliance & Legal",
      slug: "compliance-legal",
      description: "Legal compliance and regulatory guidance",
    },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      await prisma.blogCategory.create({ data: cat });
      console.log(`✅ Created category: ${cat.name}`);
    } else {
      console.log(`✅ Category already exists: ${cat.name}`);
    }
  }

  console.log("🎉 Blog categories seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
