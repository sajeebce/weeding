import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Use DATABASE_URL from .env for consistency
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Service Categories
const serviceCategories = [
  {
    slug: "formation",
    name: "Formation & Legal",
    description: "Start and maintain your US business entity",
    icon: "Building2",
    sortOrder: 1,
  },
  {
    slug: "compliance",
    name: "Compliance & Documents",
    description: "Keep your business in good standing",
    icon: "FileCheck",
    sortOrder: 2,
  },
  {
    slug: "amazon",
    name: "Amazon Services",
    description: "Sell on Amazon with confidence",
    icon: "ShoppingCart",
    sortOrder: 3,
  },
  {
    slug: "tax-finance",
    name: "Tax & Finance",
    description: "Financial and tax services for your business",
    icon: "Calculator",
    sortOrder: 4,
  },
];

// Full services data
const servicesData = [
  {
    slug: "llc-formation",
    name: "LLC Formation",
    shortDesc: "Launch your US business in 24-48 hours. No SSN required. Trusted by 10,000+ international entrepreneurs from Bangladesh, India, Pakistan & 50+ countries.",
    metaTitle: "LLC Formation Service USA - Form Your LLC in 24-48 Hours | LLCPad",
    metaDescription: "Form your US LLC from anywhere in the world. No SSN required. Includes Articles of Organization, Operating Agreement & compliance support. Trusted by 10,000+ entrepreneurs.",
    description: `<p>Launch your American business in 24-48 hours. We handle all the paperwork while you focus on growing your business. <strong>No US residency or SSN required</strong> - we've helped over 10,000 entrepreneurs from 50+ countries establish their US presence.</p>

<h3>Why Form a US LLC?</h3>
<p>A Limited Liability Company (LLC) is the most popular business structure for international entrepreneurs entering the US market:</p>
<ul>
  <li><strong>Personal Asset Protection:</strong> Your personal assets (home, savings, investments) are legally separated from business liabilities.</li>
  <li><strong>Tax Flexibility:</strong> LLCs enjoy "pass-through" taxation without corporate double-taxation.</li>
  <li><strong>Global Credibility:</strong> A US LLC instantly boosts your business credibility.</li>
  <li><strong>No Residency Required:</strong> Unlike many countries, the US allows non-residents to own and operate LLCs.</li>
</ul>

<h3>Which State Should You Choose?</h3>
<ul>
  <li><strong>Wyoming (Most Popular):</strong> Zero state income tax, strongest privacy protections, lowest annual fees ($62/year).</li>
  <li><strong>Delaware:</strong> Home to 66% of Fortune 500 companies. Best for startups seeking investment.</li>
  <li><strong>New Mexico:</strong> No annual report requirement, strong privacy, low formation cost.</li>
</ul>`,
    icon: "Building2",
    image: "/images/services/llc-formation.jpg",
    startingPrice: 199,
    categorySlug: "formation",
    isPopular: true,
    features: [
      "LLC formation in all 50 US states",
      "Articles of Organization filed with state",
      "Customized Operating Agreement included",
      "Free name availability search",
      "Lifetime digital document storage",
      "Compliance calendar with reminders",
      "24/7 customer support",
      "100% satisfaction guarantee",
    ],
    packages: [
      {
        name: "Basic",
        price: 199,
        description: "Essential LLC formation for budget-conscious entrepreneurs",
        features: [
          "Employer Identification Number (EIN)",
          "US Registered Agent for One Year",
          "US Mail Forwarding for One Year",
          "Basic Tax Consultation on US Earnings",
          "US Business Address for One Year",
          "Incorporation of Your US Company",
          "Operating Agreement",
          "Annual Compliance With the State",
        ],
        notIncluded: [
          "Premium Consultation for US Business",
          "US BOI Filing",
          "Unique US Business Address (10 Mail Forwarding)",
          "US Fintech Bank Account",
        ],
        isPopular: false,
      },
      {
        name: "Standard",
        price: 449,
        description: "Most popular - Everything you need to start your US business",
        features: [
          "US Fintech Bank Account",
          "US Business Stripe Account with Expert Hand",
          "Employer Identification Number (EIN)",
          "US Registered Agent for One Year",
          "US Mail Forwarding for One Year",
          "US Business Debit Card",
          "Expert Guidance on Managing your Financial Accounts",
          "Basic Tax Consultation on US Earnings",
          "US Business Address for One Year",
          "Incorporation of Your US Company",
          "Operating Agreement",
          "Annual Compliance With the State",
        ],
        notIncluded: [
          "US Business PayPal Account with Expert Hand",
          "Premium Consultation for US Business",
          "US BOI Filing",
          "Unique US Business Address (10 Mail Forwarding)",
        ],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 672,
        description: "All-inclusive package for serious entrepreneurs",
        features: [
          "US Fintech Bank Account",
          "US Business PayPal Account with Expert Hand",
          "US Business Stripe Account with Expert Hand",
          "Employer Identification Number (EIN)",
          "US Registered Agent for One Year",
          "US Mail Forwarding for One Year",
          "US Business Debit Card",
          "Expert Guidance on Managing your Financial Accounts",
          "Basic Tax Consultation on US Earnings",
          "US Business Address for One Year",
          "Incorporation of Your US Company",
          "Operating Agreement",
          "Annual Compliance With the State",
          "Free High Value Business Guide",
        ],
        notIncluded: [
          "Premium Consultation for US Business",
          "US BOI Filing",
          "Unique US Business Address (10 Mail Forwarding)",
          "US Worldfirst Business Bank Account",
          "US Grey Business Bank Account",
          "USA Wise Business Account",
          "US Airwallex Business Bank Account",
          "US Business Square Account with Expert Hand",
          "US SumUp Business Bank Account",
        ],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Can non-US residents form a US LLC?",
        answer: "Absolutely! US LLCs are available to anyone regardless of citizenship or residency. You don't need a visa, green card, SSN, or ITIN to form and operate a US LLC.",
      },
      {
        question: "Which state is best for my LLC - Wyoming or Delaware?",
        answer: "For most international entrepreneurs, Wyoming is the best choice. It offers zero state income tax, the lowest annual fees ($62/year), and strongest privacy protections.",
      },
      {
        question: "How long does LLC formation take?",
        answer: "Most LLCs are approved within 24-48 hours after we submit to the state. Wyoming and New Mexico are typically the fastest.",
      },
      {
        question: "Do I need to visit the US to form an LLC?",
        answer: "No! The entire process can be completed 100% online from anywhere in the world.",
      },
    ],
  },
  {
    slug: "ein-application",
    name: "EIN Application",
    shortDesc: "Get your EIN (Tax ID) without an SSN. Required for US bank accounts, Amazon seller accounts & tax filing. Fast processing for international business owners.",
    metaTitle: "EIN Application Service for Non-US Residents | Get Your Tax ID Fast | LLCPad",
    metaDescription: "Get your EIN (Employer Identification Number) without an SSN. Required for US bank accounts, Amazon seller accounts & tax filing. Fast processing for international business owners.",
    description: `<p>Your EIN is your business's Social Security Number. We handle the entire IRS application process, <strong>even without an SSN or ITIN</strong>.</p>

<h3>What is an EIN and Why Do You Need One?</h3>
<p>An Employer Identification Number (EIN) is a unique 9-digit number assigned by the IRS to identify your business.</p>
<h4>You Need an EIN To:</h4>
<ul>
  <li><strong>Open a US Business Bank Account:</strong> Every US bank requires an EIN.</li>
  <li><strong>Set Up Amazon Seller Account:</strong> Amazon requires an EIN during seller verification.</li>
  <li><strong>Accept Payments via Stripe/PayPal:</strong> Payment processors require your EIN for tax reporting.</li>
  <li><strong>File Business Taxes:</strong> The IRS uses your EIN to track your business taxes.</li>
</ul>`,
    icon: "FileText",
    image: "/images/services/ein-application.jpg",
    startingPrice: 99,
    categorySlug: "formation",
    isPopular: false,
    features: [
      "Complete SS-4 form preparation",
      "IRS submission handling",
      "Official EIN confirmation letter",
      "EIN verification letter for banking",
      "No SSN/ITIN required",
      "Support until EIN received",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Complete EIN application service for international applicants",
        features: ["SS-4 Form Preparation", "IRS Fax Submission", "Official EIN Letter", "Banking Verification Letter"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do I need an SSN or ITIN to get an EIN?",
        answer: "No! International business owners can obtain an EIN without an SSN or ITIN.",
      },
      {
        question: "How long does it take to get an EIN?",
        answer: "For international applicants without an SSN, the IRS typically processes EIN applications within 4-6 weeks.",
      },
    ],
  },
  {
    slug: "registered-agent",
    name: "Registered Agent",
    shortDesc: "Professional registered agent service in all 50 US states. Required for every LLC. Receive legal documents and state mail on your behalf.",
    metaTitle: "Registered Agent Service USA - All 50 States | Compliance Made Easy | LLCPad",
    metaDescription: "Professional registered agent service in all 50 US states. Same-day document scanning, online portal access, compliance alerts. Only $99/year. Keep your LLC in good standing.",
    description: `<p>Every US LLC is legally required to have a registered agent in their state of formation. A registered agent is an individual or company designated to receive legal documents and official state correspondence on behalf of your business.</p>

<h3>Why Do You Need a Registered Agent?</h3>
<ul>
  <li><strong>Legal Requirement:</strong> Every state requires LLCs to maintain a registered agent with a physical address.</li>
  <li><strong>Privacy Protection:</strong> Use our address instead of your personal address on public records.</li>
  <li><strong>Never Miss Important Documents:</strong> We receive and forward all legal notices, tax documents, and compliance reminders.</li>
  <li><strong>Compliance Alerts:</strong> We notify you of annual report deadlines and other compliance requirements.</li>
</ul>`,
    icon: "MapPin",
    image: "/images/services/registered-agent.jpg",
    startingPrice: 99,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Physical address in your LLC state",
      "Receive legal documents on your behalf",
      "Forward documents to your address",
      "Compliance calendar reminders",
      "Online document portal access",
      "Same-day email notifications",
    ],
    packages: [
      {
        name: "Annual",
        price: 99,
        description: "1 year registered agent service",
        features: ["Physical Address", "Document Forwarding", "Email Notifications", "Online Portal Access"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need a registered agent for my LLC?",
        answer: "Yes, every LLC is required by law to have a registered agent in their state of formation.",
      },
      {
        question: "Can I be my own registered agent?",
        answer: "Yes, but you must have a physical address in the state and be available during business hours. Using a professional service provides privacy and reliability.",
      },
    ],
  },
  {
    slug: "trademark-registration",
    name: "Trademark Registration",
    shortDesc: "Protect your brand with USPTO trademark registration. Required for Amazon Brand Registry. Stop copycats and counterfeiters.",
    metaTitle: "USPTO Trademark Registration Service | Protect Your Brand | LLCPad",
    metaDescription: "Register your trademark with the USPTO. Comprehensive search, application filing, office action response. Required for Amazon Brand Registry. Protect your brand from copycats.",
    description: `<p>A registered trademark gives you <strong>exclusive nationwide rights</strong> to your brand name, logo, or slogan. Stop copycats, qualify for Amazon Brand Registry, and build lasting brand value.</p>

<h3>Why Register a Trademark?</h3>
<ul>
  <li><strong>Legal Protection:</strong> Exclusive right to use your brand name/logo nationwide.</li>
  <li><strong>Amazon Brand Registry:</strong> Required to enroll in Brand Registry.</li>
  <li><strong>Deter Copycats:</strong> The ® symbol signals federal registration.</li>
  <li><strong>Business Value:</strong> Trademarks are valuable intellectual property assets.</li>
</ul>`,
    icon: "Stamp",
    image: "/images/services/trademark.jpg",
    startingPrice: 599,
    categorySlug: "formation",
    isPopular: true,
    features: [
      "Comprehensive trademark search",
      "USPTO application filing",
      "Office action response (Standard+)",
      "Registration certificate",
      "Trademark monitoring",
      "Amazon Brand Registry ready",
    ],
    packages: [
      {
        name: "Basic",
        price: 599,
        description: "Trademark search + filing (USPTO fees extra)",
        features: ["Comprehensive Search", "USPTO Filing (1 Class)", "Application Monitoring", "Digital Certificate"],
        notIncluded: ["Office Action Response", "Monitoring"],
        isPopular: false,
      },
      {
        name: "Standard",
        price: 799,
        description: "Complete trademark service - Most Popular",
        features: ["Everything in Basic", "Office Action Response", "Priority Support", "90-Day Monitoring"],
        notIncluded: ["1-Year Monitoring"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 999,
        description: "Full protection package with ongoing monitoring",
        features: ["Everything in Standard", "1-Year Trademark Monitoring", "Infringement Alerts", "Dedicated Account Manager"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does trademark registration take?",
        answer: "The USPTO process typically takes 8-12 months from filing to registration.",
      },
      {
        question: "Can I use my trademark before it's registered?",
        answer: "Yes, you can use the ™ symbol immediately and switch to ® once registered.",
      },
    ],
  },
  {
    slug: "amazon-seller",
    name: "Amazon Seller Account",
    shortDesc: "Complete Amazon seller account setup. We handle verification, tax interviews, and account configuration. Start selling in 7 days.",
    metaTitle: "Amazon Seller Account Setup Service | Start Selling on Amazon Today | LLCPad",
    metaDescription: "Professional Amazon seller account setup for international sellers. Document preparation, tax interview guidance, verification support. Avoid suspension risks. Start selling faster!",
    description: `<p>Start your Amazon selling journey the right way. We handle the complex verification process, tax interview, and initial account configuration so you can focus on sourcing products.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Account Creation:</strong> We set up your Professional Seller account correctly.</li>
  <li><strong>Verification Support:</strong> Navigate the identity and business verification process.</li>
  <li><strong>Tax Interview:</strong> Complete the W-8BEN-E form correctly for international sellers.</li>
  <li><strong>Account Configuration:</strong> Set up shipping, return policies, and business information.</li>
</ul>`,
    icon: "ShoppingCart",
    image: "/images/services/amazon-seller.jpg",
    startingPrice: 299,
    categorySlug: "amazon",
    isPopular: true,
    features: [
      "Professional seller account setup",
      "Identity verification support",
      "Tax interview (W-8BEN-E) completion",
      "Account configuration",
      "Shipping settings setup",
      "7-day setup guarantee",
    ],
    packages: [
      {
        name: "Standard",
        price: 299,
        description: "Complete Amazon seller account setup",
        features: ["Account Creation", "Verification Support", "Tax Interview", "Basic Configuration"],
        notIncluded: ["Brand Registry", "Listing Optimization"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 499,
        description: "Full Amazon business setup",
        features: ["Everything in Standard", "Brand Registry Enrollment", "5 Product Listings", "Listing Optimization"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do I need an LLC to sell on Amazon?",
        answer: "While not required, having a US LLC provides credibility, liability protection, and makes tax reporting easier.",
      },
      {
        question: "How long does Amazon verification take?",
        answer: "Typically 3-7 days, but can vary. We ensure your documents are correct to minimize delays.",
      },
    ],
  },
  {
    slug: "virtual-address",
    name: "Virtual Business Address",
    shortDesc: "Get a professional US business address. Use for your LLC, receive mail & packages, and look professional to customers.",
    metaTitle: "Virtual US Address for Business | Mail Scanning & Forwarding | LLCPad",
    metaDescription: "Get a real US street address for your business. Mail scanning, forwarding, package receiving. Perfect for international entrepreneurs. Use for banking, Amazon, and business presence.",
    description: `<p>Get a professional US business address for your LLC. We provide a real street address (not a PO Box) that you can use on your LLC documents, website, and marketing materials.</p>

<h3>Benefits</h3>
<ul>
  <li><strong>Professional Image:</strong> A US business address builds trust with customers.</li>
  <li><strong>Privacy Protection:</strong> Keep your personal address off public records.</li>
  <li><strong>Mail Handling:</strong> We receive, scan, and forward your business mail.</li>
  <li><strong>Package Receiving:</strong> Accept packages from USPS, UPS, FedEx, and DHL.</li>
</ul>`,
    icon: "MapPin",
    image: "/images/services/virtual-address.jpg",
    startingPrice: 149,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Real US street address",
      "Mail receiving & scanning",
      "Package acceptance",
      "Mail forwarding available",
      "Use for LLC registration",
      "Online mail management",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "Virtual address with mail scanning",
        features: ["US Street Address", "Mail Receiving", "Mail Scanning", "30-Day Mail Storage"],
        notIncluded: ["Package Forwarding", "Mail Forwarding"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 249,
        description: "Full mail handling service",
        features: ["Everything in Standard", "Package Receiving", "Mail Forwarding", "90-Day Mail Storage"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Can I use this address for my LLC registration?",
        answer: "Yes, you can use our address as your LLC's principal business address.",
      },
      {
        question: "How does mail forwarding work?",
        answer: "We scan your mail and notify you. You can then request forwarding to your international address.",
      },
    ],
  },
  {
    slug: "business-banking",
    name: "Business Bank Account",
    shortDesc: "Open a US business bank account remotely. No US visit required. Works for international LLC owners.",
    metaTitle: "US Business Bank Account for Non-Residents | Remote Account Opening | LLCPad",
    metaDescription: "Open a US business bank account without visiting America. Partner banks welcome international LLC owners. Debit card, online banking, wire transfers. Start accepting US payments.",
    description: `<p>Opening a US business bank account is essential for your LLC. We partner with banks that welcome international business owners and offer remote account opening.</p>

<h3>Why You Need a US Bank Account</h3>
<ul>
  <li><strong>Accept USD Payments:</strong> Receive payments from US customers directly.</li>
  <li><strong>Amazon Disbursements:</strong> Required for Amazon seller payouts.</li>
  <li><strong>Payment Processors:</strong> Connect Stripe, PayPal, and other payment platforms.</li>
  <li><strong>Build Business Credit:</strong> Establish US business credit history.</li>
</ul>`,
    icon: "Landmark",
    image: "/images/services/business-banking.jpg",
    startingPrice: 199,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Remote account opening",
      "No US visit required",
      "Multiple bank options",
      "Debit card included",
      "Online banking access",
      "International wire transfers",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Business bank account setup assistance",
        features: ["Bank Application Preparation", "Document Review", "Application Submission", "Follow-up Support"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Can I open a US bank account without visiting the US?",
        answer: "Yes, our partner banks offer remote account opening for qualified LLC owners.",
      },
      {
        question: "What documents do I need?",
        answer: "Typically: LLC documents, EIN letter, passport, and proof of address.",
      },
    ],
  },
  {
    slug: "annual-report",
    name: "Annual Report Filing",
    shortDesc: "Stay compliant with state annual report requirements. We file on time so your LLC stays in good standing.",
    metaTitle: "LLC Annual Report Filing Service | Stay Compliant | LLCPad",
    metaDescription: "Never miss an LLC deadline again. We handle annual reports and state filings. Keep your LLC in good standing. Avoid penalties and dissolution.",
    description: `<p>Most states require LLCs to file an annual report to maintain good standing. We handle the entire filing process so you never miss a deadline.</p>

<h3>Why Annual Reports Matter</h3>
<ul>
  <li><strong>Maintain Good Standing:</strong> Required to keep your LLC active and compliant.</li>
  <li><strong>Avoid Penalties:</strong> Late filings result in fees and potential dissolution.</li>
  <li><strong>Update State Records:</strong> Keep your registered agent and address current.</li>
</ul>`,
    icon: "FileCheck",
    image: "/images/services/annual-report.jpg",
    startingPrice: 75,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Timely annual report filing",
      "State fee included",
      "Good standing maintenance",
      "Filing confirmation",
      "Compliance reminders",
      "No missed deadlines",
    ],
    packages: [
      {
        name: "Standard",
        price: 75,
        description: "Annual report filing (+ state fee)",
        features: ["Report Preparation", "State Filing", "Confirmation Letter", "Compliance Calendar"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do all states require annual reports?",
        answer: "Most states do, but requirements vary. Wyoming requires an annual report ($62), while New Mexico has no annual report requirement.",
      },
      {
        question: "What happens if I miss my annual report deadline?",
        answer: "Late filings typically incur penalties and can lead to administrative dissolution of your LLC.",
      },
    ],
  },
  {
    slug: "brand-registry",
    name: "Amazon Brand Registry",
    shortDesc: "Enroll in Amazon Brand Registry. Protect your brand, access A+ Content, and unlock Sponsored Brands advertising.",
    metaTitle: "Amazon Brand Registry Service | Enroll & Protect Your Brand | LLCPad",
    metaDescription: "Enroll in Amazon Brand Registry with expert assistance. Access A+ Content, Brand Analytics, and protection tools. Trademark guidance included. Protect your Amazon brand today.",
    description: `<p>Amazon Brand Registry is essential for protecting your brand on Amazon and unlocking powerful selling tools. We help you enroll quickly and correctly.</p>

<h3>Brand Registry Benefits</h3>
<ul>
  <li><strong>Brand Protection:</strong> Report and remove counterfeit listings.</li>
  <li><strong>A+ Content:</strong> Create enhanced product descriptions with images and comparison charts.</li>
  <li><strong>Sponsored Brands:</strong> Run headline search ads featuring your brand logo.</li>
  <li><strong>Brand Analytics:</strong> Access detailed customer search and purchase data.</li>
</ul>`,
    icon: "BadgeCheck",
    image: "/images/services/brand-registry.jpg",
    startingPrice: 199,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Brand Registry enrollment",
      "Trademark verification",
      "A+ Content access",
      "Brand protection tools",
      "Sponsored Brands eligibility",
      "Brand Analytics access",
    ],
    packages: [
      {
        name: "Standard",
        price: 199,
        description: "Brand Registry enrollment service",
        features: ["Enrollment Application", "Trademark Verification", "Account Configuration", "Setup Support"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need a registered trademark for Brand Registry?",
        answer: "You need either a registered trademark or a pending trademark application with a serial number.",
      },
      {
        question: "How long does Brand Registry enrollment take?",
        answer: "Typically 1-2 weeks after submitting a complete application with valid trademark information.",
      },
    ],
  },
  {
    slug: "bookkeeping",
    name: "Bookkeeping Services",
    shortDesc: "Professional bookkeeping for your US LLC. Monthly statements, expense tracking, and tax-ready financials.",
    metaTitle: "Bookkeeping Services for US LLC | Tax-Ready Financials | LLCPad",
    metaDescription: "Professional bookkeeping for your US LLC. Monthly statements, expense tracking, and tax-ready financials. Keep your business finances organized.",
    description: `<p>Keep your LLC finances organized with professional bookkeeping. We track income, expenses, and prepare financial statements so you're always tax-ready.</p>

<h3>What's Included</h3>
<ul>
  <li><strong>Transaction Recording:</strong> Categorize all income and expenses.</li>
  <li><strong>Monthly Statements:</strong> Profit & Loss and Balance Sheet.</li>
  <li><strong>Bank Reconciliation:</strong> Match bank transactions with records.</li>
  <li><strong>Tax Preparation:</strong> Year-end financials ready for tax filing.</li>
</ul>`,
    icon: "Calculator",
    image: "/images/services/bookkeeping.jpg",
    startingPrice: 149,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Monthly transaction recording",
      "Expense categorization",
      "Profit & Loss statements",
      "Balance sheet",
      "Bank reconciliation",
      "Tax-ready financials",
    ],
    packages: [
      {
        name: "Starter",
        price: 149,
        description: "For businesses with up to 50 transactions/month",
        features: ["Up to 50 Transactions", "Monthly P&L", "Expense Categorization", "Bank Reconciliation"],
        notIncluded: ["Balance Sheet", "Dedicated Accountant"],
        isPopular: false,
      },
      {
        name: "Growth",
        price: 299,
        description: "For businesses with up to 150 transactions/month",
        features: ["Up to 150 Transactions", "Monthly P&L & Balance Sheet", "Dedicated Accountant", "Quarterly Review Call"],
        notIncluded: [],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "Do I need bookkeeping for my LLC?",
        answer: "Yes, proper bookkeeping is essential for tax compliance and understanding your business performance.",
      },
      {
        question: "How do you access my financial data?",
        answer: "We connect securely to your bank accounts and accounting software through read-only integrations.",
      },
    ],
  },
  // ITIN Application Service
  {
    slug: "itin-application",
    name: "ITIN Application",
    shortDesc: "Get your Individual Taxpayer Identification Number (ITIN) for US tax filing. Required for foreign nationals without SSN. CAA-assisted processing.",
    metaTitle: "ITIN Application Service | Get Your US Tax ID Number | LLCPad",
    metaDescription: "Get your Individual Taxpayer Identification Number (ITIN) for US tax filing. CAA-assisted processing - no need to mail your original passport. Fast processing for foreign nationals.",
    description: `<p>An Individual Taxpayer Identification Number (ITIN) is a tax processing number issued by the IRS for individuals who need to file US taxes but are not eligible for a Social Security Number.</p>

<h3>Who Needs an ITIN?</h3>
<ul>
  <li><strong>Foreign LLC Owners:</strong> Required if you receive US-source income and need to file taxes.</li>
  <li><strong>Tax Treaty Benefits:</strong> Claim reduced withholding rates under US tax treaties.</li>
  <li><strong>Bank Account Requirements:</strong> Some banks require ITIN for account opening.</li>
  <li><strong>Real Estate Transactions:</strong> Required for property purchases and rental income.</li>
</ul>

<h3>ITIN vs EIN</h3>
<ul>
  <li><strong>EIN:</strong> For your business entity (LLC). Required for business banking and Amazon.</li>
  <li><strong>ITIN:</strong> For you personally as a foreign individual. Required for personal tax filing.</li>
</ul>

<h3>Our CAA-Assisted Process</h3>
<p>We work with IRS-authorized Certifying Acceptance Agents (CAAs) who can verify your identity documents without sending original passports to the IRS.</p>`,
    icon: "UserCheck",
    image: "/images/services/itin.jpg",
    startingPrice: 299,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Form W-7 preparation",
      "CAA document certification",
      "No need to mail original passport",
      "Tax return preparation included",
      "IRS submission handling",
      "Application tracking",
    ],
    packages: [
      {
        name: "Standard",
        price: 299,
        description: "ITIN application with CAA certification",
        features: ["W-7 Preparation", "CAA Certification", "Document Review", "IRS Submission"],
        notIncluded: ["Tax Return Filing", "Rush Processing"],
        isPopular: true,
      },
      {
        name: "Premium",
        price: 449,
        description: "ITIN + Tax return filing",
        features: ["Everything in Standard", "Tax Return Preparation", "Form 1040-NR Filing", "Tax Consultation"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does ITIN processing take?",
        answer: "The IRS typically processes ITIN applications within 7-11 weeks. During peak tax season (January-April), processing may take longer.",
      },
      {
        question: "Do I need to send my original passport to the IRS?",
        answer: "No! Through our CAA-assisted service, your documents are certified locally. You never need to mail your original passport to the IRS.",
      },
      {
        question: "What documents do I need for ITIN application?",
        answer: "You need a valid passport (most common) or combination of identity documents. Our team will guide you on accepted documents from your country.",
      },
      {
        question: "Do I need an ITIN if I have an EIN?",
        answer: "They serve different purposes. EIN is for your LLC. ITIN is for you personally if you need to file US taxes or claim treaty benefits. Many foreign LLC owners need both.",
      },
    ],
  },
  // DBA/Trade Name
  {
    slug: "dba-filing",
    name: "DBA/Trade Name",
    shortDesc: "Register a DBA (Doing Business As) or trade name for your LLC. Operate under multiple brand names legally.",
    metaTitle: "DBA Filing Service | Register Your Trade Name | LLCPad",
    metaDescription: "Register a DBA (Doing Business As) or trade name for your LLC. Operate under multiple brand names legally. Fast filing in all 50 states.",
    description: `<p>A DBA (Doing Business As), also called a trade name or fictitious business name, allows your LLC to operate under a different name than its legal name.</p>

<h3>Why Register a DBA?</h3>
<ul>
  <li><strong>Multiple Brands:</strong> Run multiple businesses or brands under one LLC.</li>
  <li><strong>Marketing Flexibility:</strong> Use a more marketable name than your legal LLC name.</li>
  <li><strong>Bank Accounts:</strong> Open bank accounts and accept payments under your DBA name.</li>
  <li><strong>Professional Image:</strong> Create a distinct brand identity for each business line.</li>
</ul>

<h3>DBA vs New LLC</h3>
<p>A DBA is simpler and cheaper than forming a new LLC. However, it doesn't provide separate liability protection. All DBAs under your LLC share the same liability umbrella.</p>`,
    icon: "Tag",
    image: "/images/services/dba.jpg",
    startingPrice: 99,
    categorySlug: "formation",
    isPopular: false,
    features: [
      "State DBA registration",
      "Name availability search",
      "Filing with state/county",
      "DBA certificate",
      "Publication if required",
      "Renewal reminders",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "DBA registration (+ state/county fees)",
        features: ["Name Search", "DBA Filing", "Certificate of Filing", "Digital Document Storage"],
        notIncluded: ["Publication", "Renewal Filing"],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "What's the difference between a DBA and an LLC?",
        answer: "An LLC is a legal business entity that provides liability protection. A DBA is just a registered trade name - it doesn't create a new entity or provide additional liability protection.",
      },
      {
        question: "Do I need a DBA for each product line?",
        answer: "Not necessarily. A DBA is only needed if you want to operate under a name different from your LLC's legal name. You can sell multiple products under your LLC name without a DBA.",
      },
      {
        question: "Can I use my DBA name on Amazon?",
        answer: "Amazon uses your legal business name for verification. However, you can display your DBA as your storefront/brand name. For full brand protection, consider trademark registration.",
      },
    ],
  },
  // Operating Agreement
  {
    slug: "operating-agreement",
    name: "Operating Agreement",
    shortDesc: "Custom LLC Operating Agreement drafted for your business. Required by banks and essential for multi-member LLCs.",
    metaTitle: "LLC Operating Agreement Service | Bank-Ready Documents | LLCPad",
    metaDescription: "Custom LLC Operating Agreement drafted for your business. Required by banks for account opening. Single-member and multi-member options available.",
    description: `<p>An Operating Agreement is an internal document that outlines how your LLC will be run, including ownership percentages, profit distribution, and decision-making procedures.</p>

<h3>Why You Need an Operating Agreement</h3>
<ul>
  <li><strong>Bank Requirement:</strong> Most US banks require an Operating Agreement to open a business account.</li>
  <li><strong>Legal Protection:</strong> Separates personal and business assets, strengthening liability protection.</li>
  <li><strong>Dispute Prevention:</strong> Clear rules prevent conflicts between members.</li>
  <li><strong>State Requirements:</strong> Some states legally require LLCs to have an Operating Agreement.</li>
</ul>

<h3>Single vs Multi-Member</h3>
<ul>
  <li><strong>Single-Member:</strong> Simpler document establishing your LLC's operating procedures.</li>
  <li><strong>Multi-Member:</strong> More complex, covering ownership splits, voting rights, buyout procedures, and profit distribution.</li>
</ul>`,
    icon: "FileText",
    image: "/images/services/operating-agreement.jpg",
    startingPrice: 79,
    categorySlug: "formation",
    isPopular: false,
    features: [
      "Customized Operating Agreement",
      "Single or multi-member options",
      "Management structure defined",
      "Profit distribution rules",
      "Member rights and duties",
      "Dissolution procedures",
    ],
    packages: [
      {
        name: "Single-Member",
        price: 79,
        description: "Operating Agreement for single-owner LLC",
        features: ["Customized Agreement", "Management Provisions", "Bank-Ready Format", "Digital Delivery"],
        notIncluded: ["Multi-Member Provisions"],
        isPopular: true,
      },
      {
        name: "Multi-Member",
        price: 149,
        description: "Operating Agreement for multiple owners",
        features: ["Everything in Single-Member", "Ownership Percentages", "Voting Rights", "Buyout Provisions", "Profit Distribution Rules"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Is an Operating Agreement legally required?",
        answer: "It depends on the state. California, Delaware, Maine, Missouri, and New York require it by law. However, even in states where it's not required, banks and investors will ask for it.",
      },
      {
        question: "Can I write my own Operating Agreement?",
        answer: "You can, but we don't recommend it. A poorly drafted agreement can cause legal issues, fail bank requirements, or not hold up in disputes. Professional drafting ensures all necessary provisions are included.",
      },
      {
        question: "Can I change my Operating Agreement later?",
        answer: "Yes, Operating Agreements can be amended. We recommend reviewing and updating your agreement when there are ownership changes, major business changes, or annually.",
      },
    ],
  },
  // Certificate of Good Standing
  {
    slug: "certificate-good-standing",
    name: "Certificate of Good Standing",
    shortDesc: "Get an official Certificate of Good Standing for your LLC. Required for banking, contracts, and foreign registration.",
    metaTitle: "Certificate of Good Standing | Official State Document | LLCPad",
    metaDescription: "Get an official Certificate of Good Standing for your LLC. Required for banking, contracts, and foreign registration. Rush processing available.",
    description: `<p>A Certificate of Good Standing (also called Certificate of Existence or Certificate of Status) is an official state document confirming your LLC is active and compliant with all state requirements.</p>

<h3>When You Need a Certificate of Good Standing</h3>
<ul>
  <li><strong>Bank Account Opening:</strong> Many banks require a recent Certificate of Good Standing.</li>
  <li><strong>Business Contracts:</strong> Vendors and partners may require proof your LLC is active.</li>
  <li><strong>Foreign Registration:</strong> Required when registering your LLC in another state.</li>
  <li><strong>Loans and Credit:</strong> Lenders verify your LLC status before approving financing.</li>
  <li><strong>Business Sale:</strong> Buyers verify the LLC is in good standing during due diligence.</li>
</ul>

<h3>Apostille Service</h3>
<p>For international use, your Certificate of Good Standing may need an apostille - a form of authentication for documents used in countries that are part of the Hague Convention.</p>`,
    icon: "Award",
    image: "/images/services/good-standing.jpg",
    startingPrice: 75,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Official state certificate",
      "Current date certification",
      "Digital and physical copies",
      "Rush processing available",
      "Apostille add-on option",
      "Bank-ready format",
    ],
    packages: [
      {
        name: "Standard",
        price: 75,
        description: "Certificate of Good Standing (+ state fee)",
        features: ["State Filing", "Digital Certificate", "Physical Copy Mailed", "5-7 Business Days"],
        notIncluded: ["Apostille", "Rush Processing"],
        isPopular: true,
      },
      {
        name: "Rush",
        price: 125,
        description: "Expedited Certificate of Good Standing",
        features: ["Everything in Standard", "24-48 Hour Processing", "Priority Handling"],
        notIncluded: ["Apostille"],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long is a Certificate of Good Standing valid?",
        answer: "Certificates are typically valid for 30-90 days, depending on the requesting party's requirements. Banks usually accept certificates dated within 30-60 days.",
      },
      {
        question: "What if my LLC is not in good standing?",
        answer: "If your LLC has compliance issues (missed annual reports, unpaid fees), we can help you resolve them and restore good standing before obtaining the certificate.",
      },
      {
        question: "Do I need an apostille for US banks?",
        answer: "No, apostilles are only needed for international use. US banks accept standard Certificates of Good Standing without apostille.",
      },
    ],
  },
  // Amendment Filing
  {
    slug: "amendment-filing",
    name: "Amendment Filing",
    shortDesc: "File amendments to update your LLC's registered information. Name changes, address changes, member changes, and more.",
    metaTitle: "LLC Amendment Filing Service | Update Your LLC Records | LLCPad",
    metaDescription: "File amendments to update your LLC's registered information. Name changes, address changes, member changes, and more. Fast processing in all states.",
    description: `<p>When your LLC's information changes, you need to file an amendment with the state to update your official records. We handle all types of LLC amendments.</p>

<h3>Common Amendment Types</h3>
<ul>
  <li><strong>Name Change:</strong> Change your LLC's legal name.</li>
  <li><strong>Address Change:</strong> Update principal office or mailing address.</li>
  <li><strong>Registered Agent Change:</strong> Change your registered agent or their address.</li>
  <li><strong>Member/Manager Change:</strong> Add or remove members or managers (if listed in Articles).</li>
  <li><strong>Purpose Change:</strong> Modify your LLC's stated business purpose.</li>
</ul>

<h3>Amendment Process</h3>
<ol>
  <li>Determine what needs to be changed</li>
  <li>Prepare Articles of Amendment</li>
  <li>File with the state</li>
  <li>Update internal documents (Operating Agreement, etc.)</li>
  <li>Update external records (bank, IRS, etc.)</li>
</ol>`,
    icon: "FileEdit",
    image: "/images/services/amendment.jpg",
    startingPrice: 99,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Articles of Amendment preparation",
      "State filing submission",
      "Certified copy of amendment",
      "Internal document updates",
      "Compliance verification",
      "Follow-up support",
    ],
    packages: [
      {
        name: "Standard",
        price: 99,
        description: "Single amendment filing (+ state fee)",
        features: ["Amendment Preparation", "State Filing", "Certified Copy", "Document Storage"],
        notIncluded: ["IRS Updates", "Bank Notifications"],
        isPopular: true,
      },
      {
        name: "Complete",
        price: 179,
        description: "Amendment + all notifications",
        features: ["Everything in Standard", "IRS Notification (if needed)", "Bank Letter Template", "Operating Agreement Update"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does an amendment take to process?",
        answer: "Processing times vary by state. Most states process amendments within 5-10 business days. Rush processing is available in many states for an additional fee.",
      },
      {
        question: "Do I need to notify the IRS of changes?",
        answer: "Some changes require IRS notification. Name changes and responsible party changes require IRS notification. Address changes may also need reporting. We'll advise you on what's required.",
      },
      {
        question: "Will I get new formation documents after an amendment?",
        answer: "You'll receive a Certificate of Amendment or stamped Articles of Amendment. Your original Articles of Organization remain valid, supplemented by the amendment.",
      },
    ],
  },
  // LLC Dissolution
  {
    slug: "llc-dissolution",
    name: "LLC Dissolution",
    shortDesc: "Properly dissolve your LLC when closing your business. Avoid ongoing fees and compliance obligations.",
    metaTitle: "LLC Dissolution Service | Close Your Business Properly | LLCPad",
    metaDescription: "Properly dissolve your LLC when closing your business. Avoid ongoing fees and compliance obligations. Articles of Dissolution filing in all states.",
    description: `<p>When you're ready to close your LLC, proper dissolution is essential. Without formal dissolution, you may continue to owe annual fees and be liable for compliance requirements.</p>

<h3>Why Proper Dissolution Matters</h3>
<ul>
  <li><strong>Stop Ongoing Fees:</strong> Annual reports and franchise taxes continue until formally dissolved.</li>
  <li><strong>Avoid Penalties:</strong> Non-compliance while "abandoning" an LLC can result in penalties.</li>
  <li><strong>Legal Closure:</strong> Formal dissolution provides clean legal closure.</li>
  <li><strong>Protect Your Record:</strong> Administrative dissolution (by the state) looks worse than voluntary dissolution.</li>
</ul>

<h3>Dissolution Process</h3>
<ol>
  <li>Member approval of dissolution</li>
  <li>Tax clearance (if required by state)</li>
  <li>Settle debts and distribute assets</li>
  <li>File Articles of Dissolution</li>
  <li>Cancel registrations and accounts</li>
  <li>Final tax returns</li>
</ol>`,
    icon: "FileX",
    image: "/images/services/dissolution.jpg",
    startingPrice: 149,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Articles of Dissolution preparation",
      "State filing submission",
      "Tax clearance assistance",
      "IRS notification guidance",
      "Account closure checklist",
      "Dissolution certificate",
    ],
    packages: [
      {
        name: "Standard",
        price: 149,
        description: "LLC Dissolution filing (+ state fee)",
        features: ["Dissolution Documents", "State Filing", "Tax Clearance Guidance", "Closure Checklist"],
        notIncluded: ["Final Tax Returns", "Account Cancellations"],
        isPopular: true,
      },
    ],
    faqs: [
      {
        question: "What happens if I just stop using my LLC without dissolving?",
        answer: "The state will continue sending annual report notices and accumulating fees. Eventually, the state may administratively dissolve your LLC, but you'll still owe all back fees and potentially penalties. It's always better to dissolve properly.",
      },
      {
        question: "Do I need tax clearance to dissolve my LLC?",
        answer: "Some states require tax clearance certificates before accepting dissolution filings. This confirms you've paid all state taxes. We'll check your state's requirements and assist with the process.",
      },
      {
        question: "What about my EIN after dissolution?",
        answer: "Your EIN remains permanently assigned to your LLC - it cannot be transferred or reused. You should close the business account with the IRS by sending a letter, but the EIN itself stays on record.",
      },
    ],
  },
  // Apostille Service
  {
    slug: "apostille-service",
    name: "Apostille Service",
    shortDesc: "Get apostille certification for your US documents. Required for international legal recognition of your LLC documents.",
    metaTitle: "Apostille Service for US Documents | International Authentication | LLCPad",
    metaDescription: "Get apostille certification for your US documents. Required for international legal recognition. Fast processing for LLC documents, good standing certificates, and more.",
    description: `<p>An apostille is a form of authentication issued for documents used internationally. If you need to use your US LLC documents in another country, they likely need an apostille.</p>

<h3>What is an Apostille?</h3>
<p>An apostille is a certificate that authenticates a document for use in countries that are part of the Hague Apostille Convention (over 120 countries). It confirms the document is legitimate and was properly signed by the issuing authority.</p>

<h3>Documents That Can Be Apostilled</h3>
<ul>
  <li>Articles of Organization / Certificate of Formation</li>
  <li>Certificate of Good Standing</li>
  <li>Operating Agreement (must be notarized first)</li>
  <li>EIN Confirmation Letter (with notarization)</li>
  <li>Corporate Resolutions</li>
  <li>Other notarized business documents</li>
</ul>

<h3>When You Need an Apostille</h3>
<ul>
  <li>Opening a bank account in another country</li>
  <li>Registering your LLC in a foreign country</li>
  <li>International business contracts</li>
  <li>Legal proceedings abroad</li>
</ul>`,
    icon: "Stamp",
    image: "/images/services/apostille.jpg",
    startingPrice: 149,
    categorySlug: "compliance",
    isPopular: false,
    features: [
      "Document review and preparation",
      "Notarization if required",
      "State apostille processing",
      "Federal apostille available",
      "International shipping",
      "Multiple document discounts",
    ],
    packages: [
      {
        name: "Single Document",
        price: 149,
        description: "Apostille for one document",
        features: ["Document Review", "Notarization (if needed)", "State Apostille", "Digital + Physical Copy"],
        notIncluded: ["International Shipping"],
        isPopular: true,
      },
      {
        name: "Document Package",
        price: 349,
        description: "Apostille for up to 3 documents",
        features: ["Everything in Single Document", "Up to 3 Documents", "Priority Processing", "International Shipping Included"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long does apostille processing take?",
        answer: "Standard processing takes 5-10 business days depending on the state. Rush processing (2-3 days) is available for an additional fee. Some states are faster than others.",
      },
      {
        question: "Does my country accept apostilles?",
        answer: "Most countries accept apostilles, including all EU countries, UK, India, UAE, and many others. However, some countries (like China and Canada) are not part of the Hague Convention and require different authentication (embassy legalization).",
      },
      {
        question: "Can any document be apostilled?",
        answer: "Only official documents or notarized documents can be apostilled. Private documents (like contracts or agreements) must first be notarized before they can receive an apostille.",
      },
    ],
  },
  // Tax Filing Service
  {
    slug: "tax-filing",
    name: "Tax Filing Service",
    shortDesc: "Professional US tax filing for LLCs. We handle Forms 1120, 1065, 5472, and individual returns for foreign owners.",
    metaTitle: "LLC Tax Filing Service | Form 5472 & Business Tax Returns | LLCPad",
    metaDescription: "Professional US tax filing for LLCs. We handle Forms 1120, 1065, 5472, and individual returns for foreign owners. Avoid $25,000 penalties for non-filing.",
    description: `<p>US tax obligations for foreign-owned LLCs can be complex. We provide professional tax preparation and filing services specifically designed for international entrepreneurs.</p>

<h3>LLC Tax Filing Requirements</h3>
<ul>
  <li><strong>Form 5472:</strong> Required for foreign-owned LLCs with reportable transactions (even $0).</li>
  <li><strong>Form 1120:</strong> If your LLC elected corporate taxation.</li>
  <li><strong>Form 1065:</strong> For multi-member LLCs (partnership taxation).</li>
  <li><strong>Form 1040-NR:</strong> Personal return for foreign individuals with US income.</li>
</ul>

<h3>Important Deadlines</h3>
<ul>
  <li><strong>March 15:</strong> Partnership returns (Form 1065)</li>
  <li><strong>April 15:</strong> Corporate returns (Form 1120) and individual returns</li>
  <li><strong>Extensions available:</strong> 6-month extensions for most returns</li>
</ul>

<h3>Penalties for Non-Filing</h3>
<p>The IRS takes foreign reporting seriously. Penalties for late or missing Form 5472 are $25,000 per form, per year. Don't risk it - let us handle your compliance.</p>`,
    icon: "Receipt",
    image: "/images/services/tax-filing.jpg",
    startingPrice: 299,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "Form 5472 preparation",
      "LLC tax return filing",
      "State tax compliance",
      "IRS e-filing",
      "Deadline tracking",
      "Audit support",
    ],
    packages: [
      {
        name: "Basic",
        price: 299,
        description: "Form 5472 + Pro Forma 1120 (Foreign-owned single-member LLC)",
        features: ["Form 5472 Preparation", "Pro Forma 1120", "E-Filing", "Confirmation Letter"],
        notIncluded: ["State Returns", "Individual Returns"],
        isPopular: true,
      },
      {
        name: "Complete",
        price: 599,
        description: "Full LLC tax compliance",
        features: ["Everything in Basic", "State Tax Returns", "Tax Planning Consultation", "Quarterly Estimates"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Does my LLC need to file taxes if it had no income?",
        answer: "Yes! Foreign-owned single-member LLCs must file Form 5472 even with zero income or transactions. The penalty for not filing is $25,000, so this is not optional.",
      },
      {
        question: "What is Form 5472?",
        answer: "Form 5472 reports transactions between your US LLC and its foreign owner(s). This includes loans, capital contributions, distributions, and payments for services. It's filed with a pro forma Form 1120.",
      },
      {
        question: "When is my LLC tax return due?",
        answer: "For most single-member LLCs, the deadline is April 15 (or the next business day). You can request an automatic 6-month extension, but estimated taxes may still be due by the original deadline.",
      },
    ],
  },
  // Category Ungating
  {
    slug: "category-ungating",
    name: "Amazon Category Ungating",
    shortDesc: "Get approved to sell in restricted Amazon categories. Professional ungating service for Grocery, Beauty, Health, and more.",
    metaTitle: "Amazon Category Ungating Service | Get Approved Fast | LLCPad",
    metaDescription: "Get approved to sell in restricted Amazon categories. Professional ungating service for Grocery, Beauty, Health, Topicals, and more. 90% success rate.",
    description: `<p>Many profitable Amazon categories are "gated" - restricted to approved sellers only. Our ungating service helps you get approved to sell in these lucrative categories.</p>

<h3>Popular Restricted Categories</h3>
<ul>
  <li><strong>Grocery & Gourmet:</strong> High demand, recurring purchases</li>
  <li><strong>Health & Personal Care:</strong> Large market with brand opportunities</li>
  <li><strong>Beauty:</strong> High margins, loyal customers</li>
  <li><strong>Topicals:</strong> Skincare, lotions, and topical products</li>
  <li><strong>Baby:</strong> Growing market with recurring sales</li>
  <li><strong>Pet Supplies:</strong> Passionate customer base</li>
</ul>

<h3>Why Categories Are Restricted</h3>
<p>Amazon restricts categories to ensure product quality and customer safety. They require sellers to prove they can meet quality standards through documentation and sometimes product testing.</p>

<h3>Our Ungating Process</h3>
<ol>
  <li>Review your seller account status</li>
  <li>Identify categories you want to unlock</li>
  <li>Prepare required documentation</li>
  <li>Submit ungating application</li>
  <li>Handle any follow-up requests</li>
</ol>`,
    icon: "Unlock",
    image: "/images/services/category-ungating.jpg",
    startingPrice: 199,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Category analysis",
      "Documentation preparation",
      "Application submission",
      "Follow-up handling",
      "Multiple category discounts",
      "Success guarantee",
    ],
    packages: [
      {
        name: "Single Category",
        price: 199,
        description: "Ungating for one category",
        features: ["Account Review", "Document Preparation", "Application Submission", "Follow-up Support"],
        notIncluded: ["Product Sourcing", "Brand Approval"],
        isPopular: true,
      },
      {
        name: "Multi-Category",
        price: 449,
        description: "Ungating for up to 3 categories",
        features: ["Everything in Single Category", "Up to 3 Categories", "Priority Support", "Strategy Consultation"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "What's the success rate for ungating?",
        answer: "Our success rate is over 90% for standard restricted categories. Success depends on your account health, history, and documentation quality. We review your account before proceeding.",
      },
      {
        question: "How long does ungating take?",
        answer: "Most ungating applications are processed within 24-72 hours. Some categories may require additional documentation or longer review periods.",
      },
      {
        question: "What if my ungating application is rejected?",
        answer: "We'll analyze the rejection reason and resubmit with improved documentation. Our service includes follow-up support until approval or we identify a blocking issue.",
      },
    ],
  },
  // Product Listing Optimization
  {
    slug: "listing-optimization",
    name: "Product Listing Optimization",
    shortDesc: "Optimize your Amazon product listings for higher rankings and conversions. Keyword research, copywriting, and image guidance.",
    metaTitle: "Amazon Listing Optimization Service | Rank Higher, Sell More | LLCPad",
    metaDescription: "Optimize your Amazon product listings for higher rankings and conversions. Professional keyword research, copywriting, and backend optimization.",
    description: `<p>Your Amazon listing is your storefront. Optimized listings rank higher in search results and convert more browsers into buyers. Our optimization service improves both visibility and conversion.</p>

<h3>What We Optimize</h3>
<ul>
  <li><strong>Title:</strong> Strategic keyword placement for search visibility</li>
  <li><strong>Bullet Points:</strong> Benefit-focused copy that sells</li>
  <li><strong>Description:</strong> Compelling storytelling with keywords</li>
  <li><strong>Backend Keywords:</strong> Hidden keywords for additional discoverability</li>
  <li><strong>Image Recommendations:</strong> Guidance on image optimization</li>
</ul>

<h3>Our Process</h3>
<ol>
  <li><strong>Keyword Research:</strong> Identify high-volume, relevant search terms</li>
  <li><strong>Competitor Analysis:</strong> Understand what top sellers are doing</li>
  <li><strong>Copy Creation:</strong> Write compelling, keyword-rich content</li>
  <li><strong>Backend Optimization:</strong> Maximize hidden keyword fields</li>
  <li><strong>Review & Revise:</strong> Refine based on your feedback</li>
</ol>

<h3>Results You Can Expect</h3>
<ul>
  <li>Higher organic search rankings</li>
  <li>Increased click-through rates</li>
  <li>Better conversion rates</li>
  <li>Lower PPC costs (better relevancy)</li>
</ul>`,
    icon: "Search",
    image: "/images/services/listing-optimization.jpg",
    startingPrice: 149,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Keyword research report",
      "Optimized title",
      "5 bullet points",
      "Product description",
      "Backend keywords",
      "Image recommendations",
    ],
    packages: [
      {
        name: "Single Listing",
        price: 149,
        description: "Complete optimization for one ASIN",
        features: ["Keyword Research", "Title Optimization", "Bullet Points", "Description", "Backend Keywords"],
        notIncluded: ["A+ Content", "Image Design"],
        isPopular: true,
      },
      {
        name: "5 Listing Bundle",
        price: 599,
        description: "Optimize 5 listings at discounted rate",
        features: ["Everything in Single Listing", "5 ASINs", "Competitor Analysis Report", "Priority Turnaround"],
        notIncluded: ["A+ Content", "Image Design"],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "How long until I see results?",
        answer: "Organic ranking improvements typically appear within 1-2 weeks as Amazon indexes your changes. Conversion rate improvements can be immediate. Full impact is usually visible within 30 days.",
      },
      {
        question: "Do you guarantee first page rankings?",
        answer: "We don't guarantee specific rankings because Amazon's algorithm considers many factors beyond listing content (sales history, reviews, price, etc.). However, optimized listings consistently outperform non-optimized ones.",
      },
      {
        question: "What information do you need from me?",
        answer: "We need access to your Seller Central account (or you can implement our recommendations), information about your target audience, key product features and benefits, and any brand guidelines.",
      },
    ],
  },
  // A+ Content Creation
  {
    slug: "a-plus-content",
    name: "A+ Content Creation",
    shortDesc: "Professional Amazon A+ Content design. Increase conversions with enhanced brand content, comparison charts, and rich media.",
    metaTitle: "Amazon A+ Content Design Service | Boost Conversions | LLCPad",
    metaDescription: "Professional Amazon A+ Content design. Increase conversions with enhanced brand content, comparison charts, and rich media. Brand Registry required.",
    description: `<p>A+ Content (formerly Enhanced Brand Content) allows brand-registered sellers to add rich media, images, and comparison charts to their product descriptions. Studies show A+ Content increases conversions by 5-10%.</p>

<h3>A+ Content Benefits</h3>
<ul>
  <li><strong>Higher Conversions:</strong> Rich content helps customers understand your product better</li>
  <li><strong>Brand Story:</strong> Tell your brand story and build customer connection</li>
  <li><strong>Reduced Returns:</strong> Better product understanding means fewer returns</li>
  <li><strong>Cross-Selling:</strong> Comparison charts showcase your product line</li>
</ul>

<h3>What's Included</h3>
<ul>
  <li>Custom graphic design</li>
  <li>Compelling copywriting</li>
  <li>Product comparison charts</li>
  <li>Brand story modules</li>
  <li>Multiple revision rounds</li>
</ul>

<h3>A+ Premium (A++ Content)</h3>
<p>Eligible sellers can access A+ Premium with interactive features, video, and carousel modules. Ask us about eligibility and pricing.</p>`,
    icon: "Sparkles",
    image: "/images/services/a-plus-content.jpg",
    startingPrice: 299,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Custom module design",
      "Professional copywriting",
      "Up to 7 modules",
      "Comparison charts",
      "Brand story section",
      "2 revision rounds",
    ],
    packages: [
      {
        name: "Standard A+",
        price: 299,
        description: "A+ Content for one ASIN",
        features: ["5 Custom Modules", "Professional Copy", "Comparison Chart", "2 Revisions"],
        notIncluded: ["Brand Story", "A+ Premium"],
        isPopular: true,
      },
      {
        name: "Premium A+",
        price: 499,
        description: "Full A+ Content with brand story",
        features: ["7 Custom Modules", "Brand Story Section", "Comparison Chart", "Cross-Sell Modules", "Unlimited Revisions"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do I need Brand Registry for A+ Content?",
        answer: "Yes, A+ Content is only available to sellers enrolled in Amazon Brand Registry. This requires a trademark (registered or pending). We can help you get brand registered if you're not already.",
      },
      {
        question: "How long does A+ Content creation take?",
        answer: "Our standard turnaround is 5-7 business days for initial designs. After your feedback, revisions take 2-3 business days each.",
      },
      {
        question: "Can I use A+ Content on all my listings?",
        answer: "You can apply A+ Content to any ASIN under your registered brand. Once created, A+ Content can be reused across multiple ASINs with modifications.",
      },
    ],
  },
  // PPC Campaign Setup
  {
    slug: "ppc-campaign-setup",
    name: "Amazon PPC Setup",
    shortDesc: "Professional Amazon PPC campaign setup. Sponsored Products, Brands, and Display campaigns configured for optimal performance.",
    metaTitle: "Amazon PPC Campaign Setup Service | Maximize Ad ROI | LLCPad",
    metaDescription: "Professional Amazon PPC campaign setup. Sponsored Products, Brands, and Display campaigns configured for optimal performance. Start advertising the right way.",
    description: `<p>Amazon advertising is essential for product visibility. Our PPC setup service creates well-structured campaigns that maximize your advertising ROI from day one.</p>

<h3>Campaign Types We Set Up</h3>
<ul>
  <li><strong>Sponsored Products:</strong> Keyword and product targeting for individual products</li>
  <li><strong>Sponsored Brands:</strong> Banner ads featuring your logo and multiple products</li>
  <li><strong>Sponsored Display:</strong> Retargeting and audience-based advertising</li>
</ul>

<h3>Our Setup Process</h3>
<ol>
  <li><strong>Account Audit:</strong> Review current campaigns and identify opportunities</li>
  <li><strong>Keyword Research:</strong> Build comprehensive keyword lists</li>
  <li><strong>Campaign Architecture:</strong> Create organized, scalable structure</li>
  <li><strong>Bid Strategy:</strong> Set competitive bids for your goals</li>
  <li><strong>Launch & Monitor:</strong> Launch campaigns and initial optimization</li>
</ol>

<h3>What You'll Get</h3>
<ul>
  <li>Properly structured campaigns</li>
  <li>Automatic and manual campaigns</li>
  <li>Negative keyword lists</li>
  <li>Budget recommendations</li>
  <li>7-day optimization check-in</li>
</ul>`,
    icon: "Target",
    image: "/images/services/ppc-setup.jpg",
    startingPrice: 349,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Keyword research",
      "Campaign structure design",
      "Sponsored Products setup",
      "Sponsored Brands setup",
      "Bid optimization",
      "7-day check-in",
    ],
    packages: [
      {
        name: "Starter",
        price: 349,
        description: "PPC setup for up to 5 products",
        features: ["Keyword Research", "Campaign Setup", "Auto + Manual Campaigns", "7-Day Optimization Check"],
        notIncluded: ["Sponsored Brands", "Ongoing Management"],
        isPopular: true,
      },
      {
        name: "Professional",
        price: 599,
        description: "Complete PPC setup for up to 15 products",
        features: ["Everything in Starter", "Up to 15 Products", "Sponsored Brands", "Sponsored Display", "14-Day Management"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "What budget should I start with?",
        answer: "We recommend starting with $20-50/day for new campaigns. This provides enough data for optimization while controlling costs. You can scale up once you identify winning campaigns.",
      },
      {
        question: "How long until I see results?",
        answer: "You'll see initial impressions and clicks within hours of launch. However, meaningful performance data takes 1-2 weeks to accumulate. True optimization happens over 30-60 days.",
      },
      {
        question: "Do you offer ongoing PPC management?",
        answer: "Yes, we offer monthly PPC management services for ongoing optimization. This includes bid adjustments, keyword expansion, negative keyword management, and performance reporting.",
      },
    ],
  },
  // Account Reinstatement
  {
    slug: "account-reinstatement",
    name: "Amazon Account Reinstatement",
    shortDesc: "Professional Amazon seller account reinstatement service. Suspension appeals, Plan of Action writing, and account recovery.",
    metaTitle: "Amazon Account Reinstatement Service | Suspension Appeals | LLCPad",
    metaDescription: "Professional Amazon seller account reinstatement service. Suspension appeals, Plan of Action writing, and account recovery. 85% success rate on first appeal.",
    description: `<p>Amazon account suspension can be devastating. Our reinstatement experts have helped hundreds of sellers recover their accounts with professionally written appeals and Plans of Action.</p>

<h3>Common Suspension Reasons</h3>
<ul>
  <li><strong>Authenticity Complaints:</strong> Customers or brands claim products are fake</li>
  <li><strong>Policy Violations:</strong> Listing policy, review manipulation, multiple accounts</li>
  <li><strong>Performance Issues:</strong> High ODR, late shipments, cancellations</li>
  <li><strong>Inauthentic Items:</strong> Amazon believes products may not be genuine</li>
  <li><strong>Intellectual Property:</strong> Copyright, trademark, or patent complaints</li>
</ul>

<h3>Our Reinstatement Process</h3>
<ol>
  <li><strong>Case Analysis:</strong> Review suspension notice, account health, and history</li>
  <li><strong>Root Cause Identification:</strong> Determine exactly what triggered suspension</li>
  <li><strong>Plan of Action:</strong> Write compelling POA addressing Amazon's concerns</li>
  <li><strong>Appeal Submission:</strong> Submit through proper channels</li>
  <li><strong>Follow-Up:</strong> Handle Amazon's responses and additional requests</li>
</ol>

<h3>What Makes a Successful Appeal</h3>
<ul>
  <li>Clear acknowledgment of the issue</li>
  <li>Specific root cause analysis</li>
  <li>Concrete corrective actions taken</li>
  <li>Preventive measures for the future</li>
  <li>Professional, non-emotional tone</li>
</ul>`,
    icon: "ShieldCheck",
    image: "/images/services/reinstatement.jpg",
    startingPrice: 499,
    categorySlug: "amazon",
    isPopular: false,
    features: [
      "Full account analysis",
      "Root cause assessment",
      "Professional POA writing",
      "Appeal submission",
      "Unlimited revisions",
      "Follow-up support",
    ],
    packages: [
      {
        name: "Standard Appeal",
        price: 499,
        description: "Single suspension type appeal",
        features: ["Case Analysis", "POA Writing", "Appeal Submission", "2 Follow-up Appeals"],
        notIncluded: ["Legal Review", "Brand Owner Outreach"],
        isPopular: true,
      },
      {
        name: "Complex Case",
        price: 899,
        description: "Multiple issues or difficult cases",
        features: ["Everything in Standard", "Multiple Issue Resolution", "Unlimited Appeals", "Priority Response", "30-Day Support"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "What's your success rate?",
        answer: "Our success rate is approximately 85% for first appeals. Success depends on the suspension type, account history, and whether root causes can be addressed. We evaluate your case before committing.",
      },
      {
        question: "How long does reinstatement take?",
        answer: "Amazon typically responds to appeals within 24-72 hours. Simple cases may be resolved with one appeal. Complex cases may require multiple appeals over 1-2 weeks. Some difficult cases take longer.",
      },
      {
        question: "Can you guarantee reinstatement?",
        answer: "No one can guarantee reinstatement - anyone who does is misleading you. Amazon makes the final decision. However, our professional appeals significantly improve your chances compared to self-written appeals.",
      },
    ],
  },
  // Reseller Certificate
  {
    slug: "reseller-certificate",
    name: "Reseller Certificate",
    shortDesc: "Get your state reseller certificate (sales tax permit). Buy wholesale without paying sales tax on inventory purchases.",
    metaTitle: "Reseller Certificate Service | Sales Tax Permit | LLCPad",
    metaDescription: "Get your state reseller certificate (sales tax permit). Buy wholesale without paying sales tax on inventory purchases. Essential for Amazon sellers.",
    description: `<p>A reseller certificate (also called a sales tax permit or resale certificate) allows you to purchase inventory for resale without paying sales tax. This is essential for maintaining healthy margins.</p>

<h3>How Reseller Certificates Work</h3>
<p>When you buy products wholesale for resale, you shouldn't pay sales tax on those purchases. Instead, you collect sales tax from your end customers. The reseller certificate exempts you from paying tax to your suppliers.</p>

<h3>When You Need a Reseller Certificate</h3>
<ul>
  <li><strong>Wholesale Purchases:</strong> Buy from US wholesalers and distributors</li>
  <li><strong>Trade Shows:</strong> Purchase inventory at trade shows</li>
  <li><strong>Amazon FBA:</strong> States where you have inventory (nexus)</li>
  <li><strong>Dropshipping:</strong> Needed if you have nexus in supplier's state</li>
</ul>

<h3>State-by-State Registration</h3>
<p>Reseller certificates are issued by state. If you have nexus (tax presence) in multiple states, you need a certificate in each state. Common nexus triggers include inventory storage, employees, and significant sales.</p>`,
    icon: "FileBadge",
    image: "/images/services/reseller-certificate.jpg",
    startingPrice: 99,
    categorySlug: "tax-finance",
    isPopular: false,
    features: [
      "State registration",
      "Sales tax permit application",
      "Reseller certificate issuance",
      "Exemption certificate forms",
      "Compliance guidance",
      "Renewal reminders",
    ],
    packages: [
      {
        name: "Single State",
        price: 99,
        description: "Reseller certificate for one state",
        features: ["State Registration", "Sales Tax Permit", "Resale Certificate", "Compliance Guide"],
        notIncluded: ["Additional States", "Sales Tax Filing"],
        isPopular: true,
      },
      {
        name: "Multi-State",
        price: 249,
        description: "Reseller certificates for up to 5 states",
        features: ["Everything in Single State", "Up to 5 States", "Nexus Analysis", "Priority Processing"],
        notIncluded: [],
        isPopular: false,
      },
    ],
    faqs: [
      {
        question: "Do Amazon sellers need reseller certificates?",
        answer: "If you're buying inventory from US suppliers, yes. Most legitimate wholesalers require a reseller certificate. Additionally, if you have FBA inventory in a state, you may have nexus and should consider registration.",
      },
      {
        question: "Which states should I register in?",
        answer: "At minimum, register in your LLC's home state and any state where you buy inventory locally. For Amazon FBA sellers, consider registering in states where Amazon stores your inventory.",
      },
      {
        question: "What's the difference between reseller certificate and sales tax permit?",
        answer: "They're related but different. A sales tax permit allows you to collect sales tax from customers. A reseller certificate (issued with the permit) allows you to buy inventory tax-exempt. You typically get both when registering.",
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Hash password
  const hashedPassword = await bcrypt.hash("Demo@123", 12);

  // Create demo users for each role
  console.log("👤 Creating users...");
  const users = [
    { email: "admin@llcpad.com", name: "Admin User", password: hashedPassword, role: "ADMIN" as const, country: "USA" },
    { email: "customer@llcpad.com", name: "Demo Customer", password: hashedPassword, role: "CUSTOMER" as const, country: "Bangladesh" },
    { email: "content@llcpad.com", name: "Content Manager", password: hashedPassword, role: "CONTENT_MANAGER" as const, country: "USA" },
    { email: "sales@llcpad.com", name: "Sales Agent", password: hashedPassword, role: "SALES_AGENT" as const, country: "USA" },
    { email: "support@llcpad.com", name: "Support Agent", password: hashedPassword, role: "SUPPORT_AGENT" as const, country: "USA" },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`  ✓ ${user.email} (${user.role})`);
  }

  // Create service categories
  console.log("\n📁 Creating service categories...");
  const categoryMap: Record<string, string> = {};

  for (const category of serviceCategories) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: category,
    });
    categoryMap[category.slug] = created.id;
    console.log(`  ✓ ${category.name}`);
  }

  // Create services with features, packages, and FAQs
  console.log("\n🛠️ Creating services...");

  for (const serviceData of servicesData) {
    const { features, packages, faqs, categorySlug, metaTitle, metaDescription, ...serviceFields } = serviceData;

    // Create or update service
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {
        name: serviceFields.name,
        shortDesc: serviceFields.shortDesc,
        description: serviceFields.description,
        icon: serviceFields.icon,
        image: serviceFields.image,
        startingPrice: serviceFields.startingPrice,
        isPopular: serviceFields.isPopular,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        categoryId: categoryMap[categorySlug],
      },
      create: {
        slug: serviceFields.slug,
        name: serviceFields.name,
        shortDesc: serviceFields.shortDesc,
        description: serviceFields.description,
        icon: serviceFields.icon,
        image: serviceFields.image,
        startingPrice: serviceFields.startingPrice,
        isPopular: serviceFields.isPopular,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        categoryId: categoryMap[categorySlug],
      },
    });
    console.log(`  ✓ ${service.name}`);

    // Delete existing features, packages, FAQs to avoid duplicates
    await prisma.serviceFeature.deleteMany({ where: { serviceId: service.id } });
    await prisma.serviceFAQ.deleteMany({ where: { serviceId: service.id } });

    // Delete packages and their related features
    const existingPackages = await prisma.package.findMany({ where: { serviceId: service.id } });
    for (const pkg of existingPackages) {
      await prisma.packageFeature.deleteMany({ where: { packageId: pkg.id } });
      await prisma.packageNotIncluded.deleteMany({ where: { packageId: pkg.id } });
    }
    await prisma.package.deleteMany({ where: { serviceId: service.id } });

    // Create service features
    for (let i = 0; i < features.length; i++) {
      await prisma.serviceFeature.create({
        data: {
          serviceId: service.id,
          text: features[i],
          sortOrder: i,
        },
      });
    }
    console.log(`    - ${features.length} features`);

    // Create packages with features
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const createdPackage = await prisma.package.create({
        data: {
          serviceId: service.id,
          name: pkg.name,
          description: pkg.description,
          priceUSD: pkg.price,
          isPopular: pkg.isPopular,
          sortOrder: i,
        },
      });

      // Create package features
      for (let j = 0; j < pkg.features.length; j++) {
        await prisma.packageFeature.create({
          data: {
            packageId: createdPackage.id,
            text: pkg.features[j],
            sortOrder: j,
          },
        });
      }

      // Create package not-included items
      for (let j = 0; j < pkg.notIncluded.length; j++) {
        await prisma.packageNotIncluded.create({
          data: {
            packageId: createdPackage.id,
            text: pkg.notIncluded[j],
            sortOrder: j,
          },
        });
      }
    }
    console.log(`    - ${packages.length} packages`);

    // Create service FAQs
    for (let i = 0; i < faqs.length; i++) {
      await prisma.serviceFAQ.create({
        data: {
          serviceId: service.id,
          question: faqs[i].question,
          answer: faqs[i].answer,
          sortOrder: i,
        },
      });
    }
    console.log(`    - ${faqs.length} FAQs`);
  }

  // Create popular state fees
  console.log("\n🗺️ Creating state fees...");
  const stateFees = [
    { stateCode: "WY", stateName: "Wyoming", llcFee: 100, annualFee: 62, processingTime: "1-2 business days", isPopular: true },
    { stateCode: "DE", stateName: "Delaware", llcFee: 90, annualFee: 300, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "NV", stateName: "Nevada", llcFee: 425, annualFee: 350, processingTime: "1-3 weeks", isPopular: true },
    { stateCode: "FL", stateName: "Florida", llcFee: 125, annualFee: 138.75, processingTime: "1-2 weeks", isPopular: true },
    { stateCode: "TX", stateName: "Texas", llcFee: 300, annualFee: 0, processingTime: "2-3 weeks", isPopular: true },
    { stateCode: "CA", stateName: "California", llcFee: 70, annualFee: 800, processingTime: "2-4 weeks", isPopular: false },
    { stateCode: "NY", stateName: "New York", llcFee: 200, annualFee: 25, processingTime: "2-3 weeks", isPopular: false },
    { stateCode: "NM", stateName: "New Mexico", llcFee: 50, annualFee: 0, processingTime: "1-2 business days", isPopular: true },
  ];

  for (const state of stateFees) {
    await prisma.stateFee.upsert({
      where: { stateCode: state.stateCode },
      update: state,
      create: state,
    });
    console.log(`  ✓ ${state.stateName}`);
  }

  // Create sample testimonials
  console.log("\n⭐ Creating testimonials...");
  const testimonials = [
    { name: "Rahman Ahmed", company: "TechBD Solutions", country: "Bangladesh", content: "LLCPad made forming my US LLC incredibly easy. The team was responsive and guided me through every step. Highly recommended!", rating: 5, sortOrder: 1 },
    { name: "Sarah Chen", company: "Global Imports Co", country: "China", content: "Professional service with excellent communication. Got my Wyoming LLC and EIN within 2 weeks. Very satisfied!", rating: 5, sortOrder: 2 },
    { name: "Mohammed Al-Farsi", company: "Gulf Trading LLC", country: "UAE", content: "The premium package was worth every penny. They helped me set up everything including my Amazon seller account.", rating: 5, sortOrder: 3 },
  ];

  for (const testimonial of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: testimonial.name } });
    if (!existing) {
      await prisma.testimonial.create({ data: testimonial });
      console.log(`  ✓ ${testimonial.name}`);
    }
  }

  // Create legal pages
  console.log("\n📜 Creating legal pages...");
  const legalPages = [
    {
      slug: "terms",
      title: "Terms of Service",
      metaTitle: "Terms of Service | LLCPad",
      metaDescription: "Terms and conditions for using LLCPad services. Read our terms of service before using our LLC formation and business services.",
      content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing and using LLCPad's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

<h2>2. Services Description</h2>
<p>LLCPad provides business formation services, including but not limited to:</p>
<ul>
<li>LLC Formation in all 50 US states</li>
<li>EIN Application assistance</li>
<li>Registered Agent services</li>
<li>Annual compliance reminders</li>
<li>Business document preparation</li>
</ul>

<h2>3. Not a Law Firm</h2>
<p><strong>Important:</strong> LLCPad is a business formation service company, NOT a law firm. We do not provide legal advice. The information provided through our services is for general informational purposes only and should not be construed as legal advice. For legal matters, please consult with a licensed attorney in your jurisdiction.</p>

<h2>4. User Responsibilities</h2>
<p>You are responsible for:</p>
<ul>
<li>Providing accurate and complete information</li>
<li>Maintaining the confidentiality of your account</li>
<li>Complying with all applicable laws and regulations</li>
<li>Keeping your business in good standing after formation</li>
</ul>

<h2>5. Payment Terms</h2>
<p>All fees are due at the time of order placement. Prices are subject to change without notice. State fees are determined by each state and are subject to change.</p>

<h2>6. Refund Policy</h2>
<p>Please refer to our <a href="/refund-policy">Refund Policy</a> for information about refunds and cancellations.</p>

<h2>7. Limitation of Liability</h2>
<p>LLCPad's liability is limited to the amount paid for services. We are not liable for any indirect, incidental, or consequential damages.</p>

<h2>8. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.</p>

<h2>9. Contact Information</h2>
<p>For questions about these Terms of Service, please contact us at support@llcpad.com</p>`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      metaTitle: "Privacy Policy | LLCPad",
      metaDescription: "LLCPad Privacy Policy - Learn how we collect, use, and protect your personal information when using our business formation services.",
      content: `<h2>1. Information We Collect</h2>
<p>We collect information that you provide directly to us, including:</p>
<ul>
<li><strong>Personal Information:</strong> Name, email address, phone number, mailing address</li>
<li><strong>Business Information:</strong> LLC name, business address, EIN, member information</li>
<li><strong>Payment Information:</strong> Credit card details, billing address</li>
<li><strong>Identity Documents:</strong> Passport or ID copies (for compliance purposes)</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Process your orders and form your business entities</li>
<li>Communicate with you about your orders</li>
<li>Send important updates and compliance reminders</li>
<li>Improve our services and customer experience</li>
<li>Comply with legal obligations</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We may share your information with:</p>
<ul>
<li><strong>State Agencies:</strong> Required for filing your business documents</li>
<li><strong>IRS:</strong> For EIN applications</li>
<li><strong>Service Providers:</strong> Who assist in providing our services</li>
<li><strong>Legal Requirements:</strong> When required by law</li>
</ul>
<p>We do NOT sell your personal information to third parties.</p>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information, including:</p>
<ul>
<li>SSL encryption for all data transmission</li>
<li>Secure data storage with access controls</li>
<li>Regular security audits and updates</li>
</ul>

<h2>5. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your data (subject to legal requirements)</li>
<li>Opt-out of marketing communications</li>
</ul>

<h2>6. Contact Us</h2>
<p>For privacy-related inquiries, please contact us at privacy@llcpad.com</p>`,
    },
    {
      slug: "refund-policy",
      title: "Refund Policy",
      metaTitle: "Refund Policy | LLCPad",
      metaDescription: "LLCPad Refund Policy - Learn about our refund and cancellation policy for LLC formation and business services.",
      content: `<h2>Our Commitment</h2>
<p>At LLCPad, we strive to provide excellent service. We understand that circumstances may change, and we've created this refund policy to be fair to our customers.</p>

<h2>Before Filing</h2>
<p>If your documents have NOT been filed with the state:</p>
<ul>
<li><strong>Full refund</strong> of LLCPad service fees</li>
<li>Simply contact us to cancel your order</li>
<li>Refunds processed within 5-7 business days</li>
</ul>

<h2>After Filing</h2>
<p>If your documents HAVE been filed with the state:</p>
<ul>
<li><strong>State filing fees are non-refundable</strong> (paid directly to the state)</li>
<li>LLCPad service fees may be partially refunded on a case-by-case basis</li>
<li>We cannot reverse filings made with state agencies</li>
</ul>

<h2>Non-Refundable Items</h2>
<p>The following are generally non-refundable:</p>
<ul>
<li>State filing fees (these go directly to the state)</li>
<li>Expedited processing fees once expedited service has begun</li>
<li>Registered Agent fees after service activation</li>
<li>Third-party fees (IRS, state agencies, etc.)</li>
</ul>

<h2>How to Request a Refund</h2>
<ol>
<li>Contact our support team at support@llcpad.com</li>
<li>Provide your order number</li>
<li>Explain the reason for your refund request</li>
<li>Our team will review and respond within 48 hours</li>
</ol>

<h2>Processing Time</h2>
<p>Approved refunds are processed within 5-7 business days. The time for the refund to appear in your account depends on your payment method and financial institution.</p>

<h2>Questions?</h2>
<p>If you have any questions about our refund policy, please contact us at support@llcpad.com</p>`,
    },
    {
      slug: "disclaimer",
      title: "Disclaimer",
      metaTitle: "Disclaimer | LLCPad",
      metaDescription: "Legal disclaimers for LLCPad services. Important information about our business formation services.",
      content: `<h2>Not a Law Firm</h2>
<p><strong>LLCPad is NOT a law firm and does not provide legal advice.</strong> We are a business formation document filing service. The information provided on this website and through our services is for general informational purposes only.</p>

<h2>No Attorney-Client Relationship</h2>
<p>Use of our services does not create an attorney-client relationship. For legal advice, please consult with a licensed attorney in your jurisdiction who can provide advice tailored to your specific situation.</p>

<h2>Accuracy of Information</h2>
<p>While we strive to provide accurate and up-to-date information, we make no representations or warranties about:</p>
<ul>
<li>The completeness or accuracy of information on this website</li>
<li>The suitability of our services for your specific needs</li>
<li>The outcomes of any business formation or filing</li>
</ul>

<h2>Third-Party Services</h2>
<p>We work with various government agencies and third-party service providers. We are not responsible for:</p>
<ul>
<li>Delays caused by state agencies</li>
<li>Changes in state filing requirements or fees</li>
<li>Actions or inactions of third-party service providers</li>
</ul>

<h2>Business Decisions</h2>
<p>The decision to form a business entity, the type of entity to form, and the state of formation are important decisions that should be made after careful consideration and, where appropriate, consultation with legal and tax professionals.</p>

<h2>Tax Advice</h2>
<p>We do not provide tax advice. Please consult with a qualified tax professional for advice on tax matters related to your business.</p>

<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, LLCPad shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>

<h2>Contact Us</h2>
<p>If you have any questions about this disclaimer, please contact us at legal@llcpad.com</p>`,
    },
  ];

  for (const page of legalPages) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
      },
      create: page,
    });
    console.log(`  ✓ ${page.title}`);
  }

  // Create Header Configuration
  console.log("\n🎨 Creating header configuration...");

  // First, clean up existing header config
  await prisma.menuItem.deleteMany({ where: { headerId: { not: null } } });
  await prisma.headerConfig.deleteMany({});

  const headerConfig = await prisma.headerConfig.create({
    data: {
      name: "Default Header",
      isActive: true,
      layout: "DEFAULT",
      sticky: true,
      transparent: false,
      topBarEnabled: false,
      logoPosition: "LEFT",
      logoMaxHeight: 36,
      ctaButtons: JSON.stringify([
        { text: "Get Started", url: "/services/llc-formation", variant: "primary" }
      ]),
      showAuthButtons: true,
      loginText: "Sign In",
      registerText: "Get Started",
      registerUrl: "/services/llc-formation",
      searchEnabled: false,
      mobileBreakpoint: 1024,
      height: 64,
    },
  });
  console.log("  ✓ Header config created");

  // Create menu items for header
  const menuItems = [
    { label: "Home", url: "/", sortOrder: 0 },
    {
      label: "Services",
      url: "/services",
      sortOrder: 1,
      isMegaMenu: true,
      megaMenuColumns: 4,
    },
    { label: "Pricing", url: "/pricing", sortOrder: 2 },
    { label: "About", url: "/about", sortOrder: 3 },
    { label: "Blog", url: "/blog", sortOrder: 4 },
    { label: "Contact", url: "/contact", sortOrder: 5 },
  ];

  for (const item of menuItems) {
    const menuItem = await prisma.menuItem.create({
      data: {
        ...item,
        headerId: headerConfig.id,
        target: "_self",
        isVisible: true,
        visibleOnMobile: true,
      },
    });

    // Add mega menu categories for Services
    if (item.isMegaMenu) {
      const categories = [
        {
          categoryName: "Formation & Legal",
          categoryIcon: "building-2",
          categoryDesc: "Start your US business",
          children: [
            { label: "LLC Formation", url: "/services/llc-formation", badge: "Popular" },
            { label: "EIN Application", url: "/services/ein-application" },
            { label: "ITIN Application", url: "/services/itin-application" },
            { label: "Trademark Registration", url: "/services/trademark-registration", badge: "Popular" },
            { label: "DBA / Trade Name", url: "/services/dba-filing" },
            { label: "Operating Agreement", url: "/services/operating-agreement" },
          ],
        },
        {
          categoryName: "Compliance & Documents",
          categoryIcon: "shield",
          categoryDesc: "Keep your business compliant",
          children: [
            { label: "Registered Agent", url: "/services/registered-agent" },
            { label: "Annual Compliance", url: "/services/annual-report" },
            { label: "Virtual US Address", url: "/services/virtual-address" },
            { label: "Amendment Filing", url: "/services/amendment-filing" },
            { label: "Certificate of Good Standing", url: "/services/certificate-good-standing" },
            { label: "Apostille Service", url: "/services/apostille-service" },
          ],
        },
        {
          categoryName: "Amazon Services",
          categoryIcon: "shopping-cart",
          categoryDesc: "Sell on Amazon with confidence",
          children: [
            { label: "Amazon Seller Account", url: "/services/amazon-seller", badge: "Popular" },
            { label: "Brand Registry", url: "/services/brand-registry", badge: "Popular" },
            { label: "Category Ungating", url: "/services/category-ungating" },
            { label: "Listing Optimization", url: "/services/listing-optimization" },
            { label: "A+ Content Creation", url: "/services/a-plus-content" },
            { label: "Account Reinstatement", url: "/services/account-reinstatement" },
          ],
        },
        {
          categoryName: "Tax & Finance",
          categoryIcon: "calculator",
          categoryDesc: "Financial services",
          children: [
            { label: "Business Banking", url: "/services/business-banking", badge: "Popular" },
            { label: "Bookkeeping", url: "/services/bookkeeping" },
            { label: "Tax Filing", url: "/services/tax-filing" },
          ],
        },
      ];

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const categoryMenuItem = await prisma.menuItem.create({
          data: {
            label: cat.categoryName,
            url: "#",
            headerId: headerConfig.id,
            parentId: menuItem.id,
            categoryName: cat.categoryName,
            categoryIcon: cat.categoryIcon,
            categoryDesc: cat.categoryDesc,
            sortOrder: i,
            target: "_self",
            isVisible: true,
            visibleOnMobile: true,
          },
        });

        // Add children services
        for (let j = 0; j < cat.children.length; j++) {
          const child = cat.children[j];
          await prisma.menuItem.create({
            data: {
              label: child.label,
              url: child.url,
              headerId: headerConfig.id,
              parentId: categoryMenuItem.id,
              badge: child.badge || null,
              sortOrder: j,
              target: "_self",
              isVisible: true,
              visibleOnMobile: true,
            },
          });
        }
      }
    }
  }
  console.log("  ✓ Header menu items created");

  // Create Footer Configuration
  console.log("\n🦶 Creating footer configuration...");

  // Clean up existing footer config
  await prisma.menuItem.deleteMany({ where: { footerWidgetId: { not: null } } });
  await prisma.footerWidget.deleteMany({});
  await prisma.footerConfig.deleteMany({});

  const footerConfig = await prisma.footerConfig.create({
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
      showTrustBadges: false,
      paddingTop: 48,
      paddingBottom: 32,
    },
  });
  console.log("  ✓ Footer config created");

  // Create footer widgets
  // Widget 1: Brand (column 1-2)
  await prisma.footerWidget.create({
    data: {
      footerId: footerConfig.id,
      type: "BRAND",
      title: "LLCPad",
      showTitle: false,
      column: 1,
      sortOrder: 0,
    },
  });

  // Widget 2: Services (column 3)
  const servicesWidget = await prisma.footerWidget.create({
    data: {
      footerId: footerConfig.id,
      type: "LINKS",
      title: "Services",
      showTitle: true,
      column: 3,
      sortOrder: 0,
    },
  });

  const serviceLinks = [
    { label: "LLC Formation", url: "/services/llc-formation" },
    { label: "EIN Application", url: "/services/ein-application" },
    { label: "Amazon Seller Account", url: "/services/amazon-seller" },
    { label: "Registered Agent", url: "/services/registered-agent" },
    { label: "Virtual Address", url: "/services/virtual-address" },
    { label: "Business Banking", url: "/services/business-banking" },
  ];

  for (let i = 0; i < serviceLinks.length; i++) {
    await prisma.menuItem.create({
      data: {
        label: serviceLinks[i].label,
        url: serviceLinks[i].url,
        footerWidgetId: servicesWidget.id,
        sortOrder: i,
        target: "_self",
        isVisible: true,
        visibleOnMobile: true,
      },
    });
  }

  // Widget 3: Company (column 4)
  const companyWidget = await prisma.footerWidget.create({
    data: {
      footerId: footerConfig.id,
      type: "LINKS",
      title: "Company",
      showTitle: true,
      column: 4,
      sortOrder: 0,
    },
  });

  const companyLinks = [
    { label: "About Us", url: "/about" },
    { label: "Pricing", url: "/pricing" },
    { label: "Blog", url: "/blog" },
    { label: "FAQs", url: "/faq" },
    { label: "Contact", url: "/contact" },
    { label: "Testimonials", url: "/testimonials" },
  ];

  for (let i = 0; i < companyLinks.length; i++) {
    await prisma.menuItem.create({
      data: {
        label: companyLinks[i].label,
        url: companyLinks[i].url,
        footerWidgetId: companyWidget.id,
        sortOrder: i,
        target: "_self",
        isVisible: true,
        visibleOnMobile: true,
      },
    });
  }

  // Widget 4: Popular States (column 5)
  const statesWidget = await prisma.footerWidget.create({
    data: {
      footerId: footerConfig.id,
      type: "LINKS",
      title: "Popular States",
      showTitle: true,
      column: 5,
      sortOrder: 0,
    },
  });

  const stateLinks = [
    { label: "Wyoming LLC", url: "/llc/wyoming" },
    { label: "Delaware LLC", url: "/llc/delaware" },
    { label: "New Mexico LLC", url: "/llc/new-mexico" },
    { label: "Texas LLC", url: "/llc/texas" },
    { label: "Florida LLC", url: "/llc/florida" },
  ];

  for (let i = 0; i < stateLinks.length; i++) {
    await prisma.menuItem.create({
      data: {
        label: stateLinks[i].label,
        url: stateLinks[i].url,
        footerWidgetId: statesWidget.id,
        sortOrder: i,
        target: "_self",
        isVisible: true,
        visibleOnMobile: true,
      },
    });
  }

  // Widget 5: Legal (column 6)
  const legalWidget = await prisma.footerWidget.create({
    data: {
      footerId: footerConfig.id,
      type: "LINKS",
      title: "Legal",
      showTitle: true,
      column: 6,
      sortOrder: 0,
    },
  });

  const legalLinks = [
    { label: "Privacy Policy", url: "/privacy" },
    { label: "Terms of Service", url: "/terms" },
    { label: "Refund Policy", url: "/refund-policy" },
    { label: "Disclaimer", url: "/disclaimer" },
  ];

  for (let i = 0; i < legalLinks.length; i++) {
    await prisma.menuItem.create({
      data: {
        label: legalLinks[i].label,
        url: legalLinks[i].url,
        footerWidgetId: legalWidget.id,
        sortOrder: i,
        target: "_self",
        isVisible: true,
        visibleOnMobile: true,
      },
    });
  }
  console.log("  ✓ Footer widgets created");

  console.log("\n✅ Seeding completed!");
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
