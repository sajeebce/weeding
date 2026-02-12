import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface FieldConfig {
  name: string;
  label: string;
  type: "TEXT" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "TEXTAREA" | "SELECT" |
        "MULTI_SELECT" | "RADIO" | "CHECKBOX" | "CHECKBOX_GROUP" | "FILE_UPLOAD" |
        "IMAGE_UPLOAD" | "COUNTRY_SELECT" | "STATE_SELECT" | "ADDRESS" |
        "SIGNATURE" | "RICH_TEXT" | "HEADING" | "PARAGRAPH" | "DIVIDER";
  placeholder?: string;
  helpText?: string;
  order: number;
  width: "FULL" | "HALF" | "THIRD" | "TWO_THIRD";
  required: boolean;
  validation?: Record<string, unknown>;
  options?: Array<{ value: string; label: string; description?: string }>;
  dataSourceType?: "STATIC" | "COUNTRY_LIST" | "STATE_LIST" | "CURRENCY_LIST" | "CUSTOM_LIST" | "API_ENDPOINT";
  dataSourceKey?: string;
  dependsOn?: string;
  conditionalLogic?: Record<string, unknown>;
  defaultValue?: string;
}

async function createFields(tabId: string, fields: FieldConfig[]) {
  for (const field of fields) {
    await prisma.formField.create({
      data: {
        tabId,
        name: field.name,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder ?? null,
        helpText: field.helpText ?? null,
        order: field.order,
        width: field.width,
        required: field.required,
        validation: (field.validation ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull,
        options: (field.options ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull,
        dataSourceType: field.dataSourceType ?? null,
        dataSourceKey: field.dataSourceKey ?? null,
        dependsOn: field.dependsOn ?? null,
        conditionalLogic: (field.conditionalLogic ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull,
        defaultValue: field.defaultValue ?? null,
      },
    });
  }
  return fields.length;
}

async function main() {
  console.log("📋 Seeding LLC Formation form template...\n");

  const llcService = await prisma.service.findUnique({
    where: { slug: "llc-formation" },
  });

  if (!llcService) {
    console.log("❌ LLC Formation service not found. Run main seed first.");
    return;
  }

  console.log(`Found service: ${llcService.name} (${llcService.id})`);

  // Delete existing template (cascade deletes tabs and fields)
  const existing = await prisma.serviceFormTemplate.findUnique({
    where: { serviceId: llcService.id },
  });
  if (existing) {
    await prisma.serviceFormTemplate.delete({ where: { id: existing.id } });
    console.log("  Deleted existing template\n");
  }

  const template = await prisma.serviceFormTemplate.create({
    data: {
      serviceId: llcService.id,
      version: 1,
      isActive: true,
    },
  });
  console.log(`  ✓ Template created (${template.id})\n`);

  // ============================================
  // TAB 1: LLC Details
  // Matches checkout page Step 2 "LLC Details"
  // ============================================
  console.log("📑 Tab 1: LLC Details");
  const tab1 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "LLC Details",
      description: "Provide the details for your new LLC (2025 Requirements)",
      icon: "file-text",
      order: 1,
    },
  });

  const tab1Fields: FieldConfig[] = [
    // --- LLC Name Section ---
    {
      name: "llcName",
      label: "Preferred LLC Name",
      type: "TEXT",
      placeholder: "e.g., Global Ventures LLC",
      helpText: "Must be unique in your state and end with LLC, L.L.C., or Limited Liability Company",
      order: 1,
      width: "FULL",
      required: true,
      validation: { minLength: 3, maxLength: 100 },
    },
    {
      name: "llcName2",
      label: "2nd Choice (Optional)",
      type: "TEXT",
      placeholder: "Alternative name",
      order: 2,
      width: "HALF",
      required: false,
    },
    {
      name: "llcName3",
      label: "3rd Choice (Optional)",
      type: "TEXT",
      placeholder: "Another alternative",
      order: 3,
      width: "HALF",
      required: false,
    },

    // --- LLC Type Section ---
    {
      name: "sectionLlcType",
      label: "LLC Type",
      type: "DIVIDER",
      order: 4,
      width: "FULL",
      required: false,
    },
    {
      name: "llcType",
      label: "LLC Type",
      type: "RADIO",
      order: 5,
      width: "FULL",
      required: true,
      defaultValue: "single",
      options: [
        { value: "single", label: "Single-Member LLC", description: "One owner - simplest structure" },
        { value: "multi", label: "Multi-Member LLC", description: "Two or more owners" },
      ],
    },

    // --- Profit Distribution (conditional: llcType === "multi") - right after LLC Type ---
    {
      name: "sectionProfit",
      label: "Profit & Loss Distribution",
      type: "HEADING",
      order: 6,
      width: "FULL",
      required: false,
      conditionalLogic: { show: true, when: "llcType", operator: "equals", value: "multi" },
    },
    {
      name: "profitDistribution",
      label: "Profit & Loss Distribution",
      type: "RADIO",
      order: 7,
      width: "FULL",
      required: false,
      defaultValue: "proportional",
      options: [
        { value: "proportional", label: "Based on ownership percentage" },
        { value: "equal", label: "Split equally among members" },
        { value: "custom", label: "Custom (define in operating agreement)" },
      ],
      conditionalLogic: { show: true, when: "llcType", operator: "equals", value: "multi" },
    },

    // --- Management Structure Section ---
    {
      name: "sectionManagement",
      label: "Management Structure",
      type: "DIVIDER",
      order: 8,
      width: "FULL",
      required: false,
    },
    {
      name: "managementType",
      label: "Management Structure",
      type: "RADIO",
      order: 9,
      width: "FULL",
      required: true,
      defaultValue: "member",
      options: [
        { value: "member", label: "Member-Managed", description: "Owners manage the business (most common)" },
        { value: "manager", label: "Manager-Managed", description: "Designated manager(s) run operations" },
      ],
    },

    // --- Manager Type (conditional: managementType === "manager") - right after Management Structure ---
    {
      name: "managerType",
      label: "Who will manage the LLC?",
      type: "RADIO",
      order: 10,
      width: "FULL",
      required: false,
      defaultValue: "member",
      options: [
        { value: "member", label: "A Member (Owner) will manage" },
        { value: "nonMember", label: "Non-Member Manager (external hire)" },
      ],
      conditionalLogic: { show: true, when: "managementType", operator: "equals", value: "manager" },
    },

    // --- Non-Member Manager Details (conditional: managerType === "nonMember") - right after Manager Type ---
    {
      name: "sectionManagerDetails",
      label: "Non-Member Manager Details",
      type: "HEADING",
      order: 11,
      width: "FULL",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerFirstName",
      label: "Manager First Name",
      type: "TEXT",
      placeholder: "First name",
      order: 12,
      width: "HALF",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerLastName",
      label: "Manager Last Name",
      type: "TEXT",
      placeholder: "Last name",
      order: 13,
      width: "HALF",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerEmail",
      label: "Manager Email",
      type: "EMAIL",
      placeholder: "manager@example.com",
      order: 14,
      width: "HALF",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerPhone",
      label: "Manager Phone",
      type: "PHONE",
      placeholder: "+1 XXX XXX XXXX",
      order: 15,
      width: "HALF",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerAddress",
      label: "Manager Address",
      type: "TEXT",
      placeholder: "Street address",
      order: 16,
      width: "FULL",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerCity",
      label: "Manager City",
      type: "TEXT",
      placeholder: "City",
      order: 17,
      width: "HALF",
      required: false,
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },
    {
      name: "managerCountry",
      label: "Manager Country",
      type: "COUNTRY_SELECT",
      order: 18,
      width: "HALF",
      required: false,
      defaultValue: "US",
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
      conditionalLogic: { show: true, when: "managerType", operator: "equals", value: "nonMember" },
    },

    // --- Business Information Section ---
    {
      name: "sectionBusiness",
      label: "Business Information",
      type: "DIVIDER",
      order: 19,
      width: "FULL",
      required: false,
    },
    {
      name: "businessIndustry",
      label: "Business Industry/Activity",
      type: "TEXT",
      placeholder: "e.g., E-commerce, Software Development, Consulting",
      order: 20,
      width: "FULL",
      required: true,
    },
    {
      name: "businessPurpose",
      label: "Business Purpose",
      type: "TEXTAREA",
      placeholder: "Describe your business activities",
      helpText: "Most states accept 'Any and all lawful business activities'",
      order: 21,
      width: "FULL",
      required: false,
      defaultValue: "Any and all lawful business activities",
    },
  ];

  const tab1Count = await createFields(tab1.id, tab1Fields);
  console.log(`  ✓ ${tab1Count} fields created\n`);

  // ============================================
  // TAB 2: Owner Information
  // Matches checkout page Step 3 "Owner Info"
  // ============================================
  console.log("📑 Tab 2: Owner Information");
  const tab2 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Owner Information",
      description: "Required for LLC formation and EIN application (2025 FinCEN BOI Compliance)",
      icon: "user",
      order: 2,
    },
  });

  const tab2Fields: FieldConfig[] = [
    // --- BOI Notice ---
    {
      name: "sectionNotice",
      label: "Important: As of 2025, all LLC owners must provide identification for Beneficial Ownership Information (BOI) reporting. International owners need a valid passport.",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
    },

    // --- Personal Information ---
    {
      name: "sectionPersonal",
      label: "Personal Information",
      type: "HEADING",
      order: 2,
      width: "FULL",
      required: false,
    },
    {
      name: "ownerFirstName",
      label: "First Name (as on passport)",
      type: "TEXT",
      placeholder: "Your legal first name",
      order: 3,
      width: "HALF",
      required: true,
      validation: { minLength: 1, maxLength: 50 },
    },
    {
      name: "ownerLastName",
      label: "Last Name (as on passport)",
      type: "TEXT",
      placeholder: "Your legal last name",
      order: 4,
      width: "HALF",
      required: true,
      validation: { minLength: 1, maxLength: 50 },
    },
    {
      name: "ownerDateOfBirth",
      label: "Date of Birth",
      type: "DATE",
      order: 5,
      width: "HALF",
      required: false,
    },
    {
      name: "ownerPassportNumber",
      label: "Passport Number",
      type: "TEXT",
      placeholder: "Required for international owners",
      helpText: "Your passport number is needed for BOI (Beneficial Ownership Information) reporting",
      order: 6,
      width: "HALF",
      required: true,
    },

    // --- Contact Information ---
    {
      name: "dividerContact",
      label: "",
      type: "DIVIDER",
      order: 7,
      width: "FULL",
      required: false,
    },
    {
      name: "sectionContact",
      label: "Contact Information",
      type: "HEADING",
      order: 8,
      width: "FULL",
      required: false,
    },
    {
      name: "ownerEmail",
      label: "Email Address",
      type: "EMAIL",
      placeholder: "your@email.com",
      helpText: "We'll use this email for important updates about your LLC",
      order: 9,
      width: "HALF",
      required: true,
    },
    {
      name: "ownerPhone",
      label: "Phone Number",
      type: "PHONE",
      placeholder: "+880 1XXX XXXXXX",
      helpText: "Include country code for international numbers",
      order: 10,
      width: "HALF",
      required: true,
    },
    {
      name: "ownerCountry",
      label: "Country of Residence",
      type: "COUNTRY_SELECT",
      order: 11,
      width: "FULL",
      required: true,
      defaultValue: "BD",
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },

    // --- Residential Address ---
    {
      name: "dividerAddress",
      label: "",
      type: "DIVIDER",
      order: 12,
      width: "FULL",
      required: false,
    },
    {
      name: "sectionAddress",
      label: "Residential Address",
      type: "HEADING",
      order: 13,
      width: "FULL",
      required: false,
    },
    {
      name: "ownerAddress",
      label: "Street Address",
      type: "TEXT",
      placeholder: "House/Apartment, Road, Area",
      order: 14,
      width: "FULL",
      required: true,
      validation: { maxLength: 200 },
    },
    {
      name: "ownerCity",
      label: "City",
      type: "TEXT",
      order: 15,
      width: "HALF",
      required: true,
      validation: { maxLength: 100 },
    },
    {
      name: "ownerPostalCode",
      label: "Postal Code",
      type: "TEXT",
      order: 16,
      width: "HALF",
      required: false,
    },
  ];

  const tab2Count = await createFields(tab2.id, tab2Fields);
  console.log(`  ✓ ${tab2Count} fields created\n`);

  // ============================================
  // TAB 3: Additional Services
  // ============================================
  console.log("📑 Tab 3: Additional Services");
  const tab3 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Additional Services",
      description: "Select optional add-on services for your LLC",
      icon: "plus-circle",
      order: 3,
    },
  });

  const tab3Fields: FieldConfig[] = [
    {
      name: "addonsInfo",
      label: "Enhance your LLC package with these optional services. Some services may already be included in your selected package.",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
    },
    {
      name: "expeditedProcessing",
      label: "Expedited Processing (+$75)",
      type: "CHECKBOX",
      helpText: "Get your LLC filed within 1-2 business days instead of 3-5",
      order: 2,
      width: "FULL",
      required: false,
      defaultValue: "false",
    },
    {
      name: "needsEIN",
      label: "EIN (Tax ID) Application",
      type: "CHECKBOX",
      helpText: "Federal Employer Identification Number - required for business banking and taxes",
      order: 3,
      width: "FULL",
      required: false,
      defaultValue: "true",
    },
    {
      name: "needsRegisteredAgent",
      label: "Registered Agent Service (1 Year)",
      type: "CHECKBOX",
      helpText: "Required by law - receives legal documents on behalf of your LLC",
      order: 4,
      width: "FULL",
      required: false,
      defaultValue: "true",
    },
    {
      name: "needsBankingAssistance",
      label: "Business Banking Assistance",
      type: "CHECKBOX",
      helpText: "We'll help you open a US business bank account remotely",
      order: 5,
      width: "FULL",
      required: false,
      defaultValue: "false",
    },
    {
      name: "specialInstructions",
      label: "Special Instructions or Questions",
      type: "TEXTAREA",
      placeholder: "Any special requests or questions for our team...",
      helpText: "Optional: Let us know if you have any specific requirements",
      order: 6,
      width: "FULL",
      required: false,
      validation: { maxLength: 1000 },
    },
  ];

  const tab3Count = await createFields(tab3.id, tab3Fields);
  console.log(`  ✓ ${tab3Count} fields created\n`);

  // ============================================
  // TAB 4: Review & Confirm
  // ============================================
  console.log("📑 Tab 4: Review & Confirm");
  const tab4 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Review & Confirm",
      description: "Review your information and confirm your order",
      icon: "check-circle",
      order: 4,
    },
  });

  const tab4Fields: FieldConfig[] = [
    {
      name: "reviewInfo",
      label: "Please review all the information you've provided. You can go back to any previous step to make changes before submitting.",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
    },
    {
      name: "agreeTerms",
      label: "I agree to the Terms of Service and Privacy Policy",
      type: "CHECKBOX",
      helpText: "You must accept our terms to proceed with your order",
      order: 2,
      width: "FULL",
      required: true,
    },
    {
      name: "understandNotLegalAdvice",
      label: "I understand that LLCPad is a business formation service, not a law firm. This is not legal advice.",
      type: "CHECKBOX",
      helpText: "LLCPad provides document filing services, not legal counsel",
      order: 3,
      width: "FULL",
      required: true,
    },
    {
      name: "agreeRefundPolicy",
      label: "I have read and agree to the Refund Policy",
      type: "CHECKBOX",
      order: 4,
      width: "FULL",
      required: true,
    },
    {
      name: "electronicSignature",
      label: "Electronic Signature (Type your full legal name)",
      type: "TEXT",
      placeholder: "Your full legal name",
      helpText: "By typing your name, you authorize LLCPad to file documents on your behalf",
      order: 5,
      width: "FULL",
      required: true,
      validation: { minLength: 2, maxLength: 100 },
    },
  ];

  const tab4Count = await createFields(tab4.id, tab4Fields);
  console.log(`  ✓ ${tab4Count} fields created\n`);

  // Summary
  const totalFields = tab1Count + tab2Count + tab3Count + tab4Count;
  console.log("✅ LLC Formation form template seeded successfully!");
  console.log(`   Service: ${llcService.name}`);
  console.log(`   Template ID: ${template.id}`);
  console.log(`   Total: 4 tabs, ${totalFields} fields\n`);
  console.log("   Tab 1: LLC Details .............. " + tab1Count + " fields");
  console.log("   Tab 2: Owner Information ........ " + tab2Count + " fields");
  console.log("   Tab 3: Additional Services ...... " + tab3Count + " fields");
  console.log("   Tab 4: Review & Confirm ......... " + tab4Count + " fields");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
