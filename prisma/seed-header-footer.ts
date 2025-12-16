/**
 * Seed Header & Footer Configuration
 *
 * This script creates the default header and footer configuration
 * matching the existing hardcoded design.
 */

import prisma from "../src/lib/db";

async function seedHeaderFooter() {
  console.log("🎨 Seeding Header & Footer Configuration...\n");

  // ==========================================
  // HEADER CONFIGURATION
  // ==========================================
  console.log("📌 Creating Header Configuration...");

  // Delete existing header config
  await prisma.menuItem.deleteMany({
    where: { headerId: { not: null } },
  });
  await prisma.headerConfig.deleteMany({});

  // Create default header
  const header = await prisma.headerConfig.create({
    data: {
      name: "Default Header",
      isActive: true,
      layout: "DEFAULT",
      sticky: true,
      transparent: false,
      topBarEnabled: false,
      logoPosition: "LEFT",
      logoMaxHeight: 36,
      showAuthButtons: true,
      loginText: "Sign In",
      registerText: "Get Started",
      registerUrl: "/services/llc-formation",
      searchEnabled: false,
      mobileBreakpoint: 1024,
      height: 64,
      ctaButtons: JSON.stringify([
        {
          text: "Get Started",
          url: "/services/llc-formation",
          variant: "primary",
        },
      ]),
    },
  });

  console.log(`   ✓ Created header config: ${header.id}`);

  // ==========================================
  // HEADER MENU ITEMS
  // ==========================================
  console.log("\n📌 Creating Header Menu Items...");

  // Main navigation items
  const menuItems = [
    { label: "Home", url: "/", sortOrder: 0 },
    { label: "Services", url: "/services", sortOrder: 1, isMegaMenu: true },
    { label: "Pricing", url: "/pricing", sortOrder: 2 },
    { label: "About", url: "/about", sortOrder: 3 },
    { label: "Blog", url: "/blog", sortOrder: 4 },
    { label: "Contact", url: "/contact", sortOrder: 5 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        headerId: header.id,
        isVisible: true,
        visibleOnMobile: true,
      },
    });
    console.log(`   ✓ Created menu item: ${item.label}`);
  }

  // Get Services menu item for mega menu children
  const servicesMenuItem = await prisma.menuItem.findFirst({
    where: { headerId: header.id, label: "Services" },
  });

  if (servicesMenuItem) {
    // Mega Menu Categories and Items
    const megaMenuData = [
      {
        categoryName: "Formation & Legal",
        categoryIcon: "building-2",
        categoryDesc: "Start your US business",
        sortOrder: 0,
        items: [
          { label: "LLC Formation", url: "/services/llc-formation", badge: "Popular", sortOrder: 0 },
          { label: "EIN Application", url: "/services/ein-application", sortOrder: 1 },
          { label: "ITIN Application", url: "/services/itin-application", sortOrder: 2 },
          { label: "Trademark Registration", url: "/services/trademark-registration", badge: "Popular", sortOrder: 3 },
          { label: "DBA / Trade Name", url: "/services/dba-filing", sortOrder: 4 },
          { label: "Operating Agreement", url: "/services/operating-agreement", sortOrder: 5 },
        ],
      },
      {
        categoryName: "Compliance & Documents",
        categoryIcon: "shield",
        categoryDesc: "Keep your business compliant",
        sortOrder: 1,
        items: [
          { label: "Registered Agent", url: "/services/registered-agent", sortOrder: 0 },
          { label: "Annual Compliance", url: "/services/compliance", sortOrder: 1 },
          { label: "Virtual US Address", url: "/services/virtual-address", sortOrder: 2 },
          { label: "Amendment Filing", url: "/services/amendment-filing", sortOrder: 3 },
          { label: "Certificate of Good Standing", url: "/services/certificate-good-standing", sortOrder: 4 },
          { label: "Apostille Service", url: "/services/apostille-service", sortOrder: 5 },
        ],
      },
      {
        categoryName: "Amazon Services",
        categoryIcon: "shopping-cart",
        categoryDesc: "Sell on Amazon with confidence",
        sortOrder: 2,
        items: [
          { label: "Amazon Seller Account", url: "/services/amazon-seller", badge: "Popular", sortOrder: 0 },
          { label: "Brand Registry", url: "/services/brand-registry", badge: "Popular", sortOrder: 1 },
          { label: "Category Ungating", url: "/services/category-ungating", sortOrder: 2 },
          { label: "Listing Optimization", url: "/services/product-listing-optimization", sortOrder: 3 },
          { label: "A+ Content Creation", url: "/services/a-plus-content", sortOrder: 4 },
          { label: "Account Reinstatement", url: "/services/account-reinstatement", sortOrder: 5 },
        ],
      },
      {
        categoryName: "Tax & Finance",
        categoryIcon: "calculator",
        categoryDesc: "Financial services",
        sortOrder: 3,
        items: [
          { label: "Business Banking", url: "/services/business-banking", badge: "Popular", sortOrder: 0 },
          { label: "Bookkeeping", url: "/services/bookkeeping", sortOrder: 1 },
          { label: "Tax Filing", url: "/services/tax-filing", sortOrder: 2 },
        ],
      },
    ];

    for (const category of megaMenuData) {
      // Create category as a child of Services
      const categoryItem = await prisma.menuItem.create({
        data: {
          label: category.categoryName,
          categoryName: category.categoryName,
          categoryIcon: category.categoryIcon,
          categoryDesc: category.categoryDesc,
          parentId: servicesMenuItem.id,
          headerId: header.id,
          sortOrder: category.sortOrder,
          isVisible: true,
        },
      });
      console.log(`   ✓ Created category: ${category.categoryName}`);

      // Create service items under this category
      for (const item of category.items) {
        await prisma.menuItem.create({
          data: {
            label: item.label,
            url: item.url,
            badge: item.badge,
            parentId: categoryItem.id,
            headerId: header.id,
            sortOrder: item.sortOrder,
            isVisible: true,
          },
        });
      }
      console.log(`      → Added ${category.items.length} service items`);
    }
  }

  // ==========================================
  // FOOTER CONFIGURATION
  // ==========================================
  console.log("\n📌 Creating Footer Configuration...");

  // Delete existing footer config
  await prisma.menuItem.deleteMany({
    where: { footerWidgetId: { not: null } },
  });
  await prisma.footerWidget.deleteMany({});
  await prisma.footerConfig.deleteMany({});

  // Create default footer
  const footer = await prisma.footerConfig.create({
    data: {
      name: "Default Footer",
      isActive: true,
      layout: "MULTI_COLUMN",
      columns: 6,
      newsletterEnabled: true,
      newsletterTitle: "Subscribe to our newsletter",
      newsletterSubtitle: "Get updates on new services and offers",
      showSocialLinks: true,
      socialPosition: "brand",
      showContactInfo: true,
      contactPosition: "brand",
      bottomBarEnabled: true,
      showDisclaimer: true,
      disclaimerText: "LLCPad is not a law firm and does not provide legal advice. The information provided is for general informational purposes only.",
      bottomLinks: JSON.stringify([
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms of Service", url: "/terms" },
        { label: "Refund Policy", url: "/refund-policy" },
      ]),
      paddingTop: 48,
      paddingBottom: 32,
    },
  });

  console.log(`   ✓ Created footer config: ${footer.id}`);

  // ==========================================
  // FOOTER WIDGETS
  // ==========================================
  console.log("\n📌 Creating Footer Widgets...");

  // Widget 1: Brand (Column 1-2)
  const brandWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "BRAND",
      title: null,
      showTitle: false,
      column: 1,
      sortOrder: 0,
      content: JSON.stringify({
        showLogo: true,
        showDescription: true,
        showContact: true,
        showSocial: true,
      }),
    },
  });
  console.log("   ✓ Created BRAND widget (Column 1)");

  // Widget 2: Services (Column 3)
  const servicesWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Services",
      showTitle: true,
      column: 3,
      sortOrder: 0,
    },
  });

  // Add services links to widget
  const serviceLinks = [
    { label: "LLC Formation", url: "/services/llc-formation", sortOrder: 0 },
    { label: "EIN Application", url: "/services/ein-application", sortOrder: 1 },
    { label: "Amazon Seller Account", url: "/services/amazon-seller", sortOrder: 2 },
    { label: "Registered Agent", url: "/services/registered-agent", sortOrder: 3 },
    { label: "Virtual Address", url: "/services/virtual-address", sortOrder: 4 },
    { label: "Business Banking", url: "/services/business-banking", sortOrder: 5 },
  ];

  for (const link of serviceLinks) {
    await prisma.menuItem.create({
      data: {
        ...link,
        footerWidgetId: servicesWidget.id,
        isVisible: true,
      },
    });
  }
  console.log("   ✓ Created LINKS widget: Services (Column 3)");

  // Widget 3: Company (Column 4)
  const companyWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Company",
      showTitle: true,
      column: 4,
      sortOrder: 0,
    },
  });

  const companyLinks = [
    { label: "About Us", url: "/about", sortOrder: 0 },
    { label: "Pricing", url: "/pricing", sortOrder: 1 },
    { label: "Blog", url: "/blog", sortOrder: 2 },
    { label: "FAQs", url: "/faq", sortOrder: 3 },
    { label: "Contact", url: "/contact", sortOrder: 4 },
    { label: "Testimonials", url: "/testimonials", sortOrder: 5 },
  ];

  for (const link of companyLinks) {
    await prisma.menuItem.create({
      data: {
        ...link,
        footerWidgetId: companyWidget.id,
        isVisible: true,
      },
    });
  }
  console.log("   ✓ Created LINKS widget: Company (Column 4)");

  // Widget 4: Popular States (Column 5)
  const statesWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Popular States",
      showTitle: true,
      column: 5,
      sortOrder: 0,
    },
  });

  const stateLinks = [
    { label: "Wyoming LLC", url: "/llc/wyoming", sortOrder: 0 },
    { label: "Delaware LLC", url: "/llc/delaware", sortOrder: 1 },
    { label: "New Mexico LLC", url: "/llc/new-mexico", sortOrder: 2 },
    { label: "Texas LLC", url: "/llc/texas", sortOrder: 3 },
    { label: "Florida LLC", url: "/llc/florida", sortOrder: 4 },
  ];

  for (const link of stateLinks) {
    await prisma.menuItem.create({
      data: {
        ...link,
        footerWidgetId: statesWidget.id,
        isVisible: true,
      },
    });
  }
  console.log("   ✓ Created LINKS widget: Popular States (Column 5)");

  // Widget 5: Legal (Column 6)
  const legalWidget = await prisma.footerWidget.create({
    data: {
      footerId: footer.id,
      type: "LINKS",
      title: "Legal",
      showTitle: true,
      column: 6,
      sortOrder: 0,
    },
  });

  const legalLinks = [
    { label: "Privacy Policy", url: "/privacy", sortOrder: 0 },
    { label: "Terms of Service", url: "/terms", sortOrder: 1 },
    { label: "Refund Policy", url: "/refund-policy", sortOrder: 2 },
    { label: "Disclaimer", url: "/disclaimer", sortOrder: 3 },
  ];

  for (const link of legalLinks) {
    await prisma.menuItem.create({
      data: {
        ...link,
        footerWidgetId: legalWidget.id,
        isVisible: true,
      },
    });
  }
  console.log("   ✓ Created LINKS widget: Legal (Column 6)");

  // ==========================================
  // SUMMARY
  // ==========================================
  const menuItemCount = await prisma.menuItem.count();
  const widgetCount = await prisma.footerWidget.count();

  console.log("\n" + "=".repeat(50));
  console.log("✅ Header & Footer Seeding Complete!");
  console.log("=".repeat(50));
  console.log(`   📌 Header Config: 1`);
  console.log(`   📌 Menu Items: ${menuItemCount}`);
  console.log(`   📌 Footer Config: 1`);
  console.log(`   📌 Footer Widgets: ${widgetCount}`);
  console.log("=".repeat(50) + "\n");
}

seedHeaderFooter()
  .catch((e) => {
    console.error("❌ Error seeding header/footer:", e);
    process.exit(1);
  });
