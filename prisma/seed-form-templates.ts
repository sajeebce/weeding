import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// Use DATABASE_URL from .env for consistency
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to create field data matching the schema
interface FieldConfig {
  name: string;
  label: string;
  type: "TEXT" | "EMAIL" | "PHONE" | "NUMBER" | "DATE" | "TEXTAREA" | "SELECT" |
        "MULTI_SELECT" | "RADIO" | "CHECKBOX" | "CHECKBOX_GROUP" | "FILE_UPLOAD" |
        "IMAGE_UPLOAD" | "COUNTRY_SELECT" | "STATE_SELECT" | "ADDRESS" |
        "SIGNATURE" | "RICH_TEXT" | "HEADING" | "PARAGRAPH";
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

async function main() {
  console.log("🌱 Seeding demo form templates...\n");

  // Find LLC Formation service
  const llcService = await prisma.service.findUnique({
    where: { slug: "llc-formation" },
  });

  if (!llcService) {
    console.log("❌ LLC Formation service not found. Run main seed first.");
    return;
  }

  console.log(`📋 Creating form template for: ${llcService.name}`);

  // Check if template already exists
  const existingTemplate = await prisma.serviceFormTemplate.findUnique({
    where: { serviceId: llcService.id },
  });

  if (existingTemplate) {
    console.log("⚠️  Template already exists. Deleting and recreating...");
    await prisma.serviceFormTemplate.delete({
      where: { id: existingTemplate.id },
    });
  }

  // Create the form template
  const template = await prisma.serviceFormTemplate.create({
    data: {
      serviceId: llcService.id,
      version: 1,
      isActive: true,
    },
  });

  console.log(`  ✓ Form template created (ID: ${template.id})\n`);

  // Helper function to create fields
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

  // ========================================
  // TAB 1: Company Information
  // ========================================
  console.log("📑 Creating Tab 1: Company Information");
  const tab1 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Company Information",
      description: "Basic details about your new LLC",
      icon: "Building2",
      order: 1,
    },
  });

  const tab1Fields: FieldConfig[] = [
    {
      name: "llc_name_option1",
      label: "LLC Name (First Choice)",
      type: "TEXT",
      placeholder: "My Company LLC",
      helpText: "Enter your preferred LLC name. Must end with LLC, L.L.C., or Limited Liability Company.",
      order: 1,
      width: "FULL",
      required: true,
      validation: { minLength: 3, maxLength: 100 },
    },
    {
      name: "llc_name_option2",
      label: "LLC Name (Second Choice)",
      type: "TEXT",
      placeholder: "My Company LLC (Alternative)",
      helpText: "Backup name in case first choice is unavailable.",
      order: 2,
      width: "FULL",
      required: false,
      validation: { minLength: 3, maxLength: 100 },
    },
    {
      name: "formation_state",
      label: "State of Formation",
      type: "STATE_SELECT",
      placeholder: "Select state...",
      helpText: "Popular choices: Wyoming (lowest fees, best privacy), Delaware (business-friendly laws), New Mexico (no annual report).",
      order: 3,
      width: "HALF",
      required: true,
      dataSourceType: "STATE_LIST",
      dataSourceKey: "us_states",
    },
    {
      name: "business_purpose",
      label: "Business Purpose",
      type: "SELECT",
      placeholder: "Select business purpose...",
      helpText: "Select the primary purpose of your LLC.",
      order: 4,
      width: "HALF",
      required: true,
      dataSourceType: "STATIC",
      options: [
        { value: "general", label: "General (Any lawful business activity)" },
        { value: "ecommerce", label: "E-commerce / Online Sales" },
        { value: "consulting", label: "Consulting / Professional Services" },
        { value: "technology", label: "Technology / Software" },
        { value: "real_estate", label: "Real Estate" },
        { value: "import_export", label: "Import / Export" },
        { value: "manufacturing", label: "Manufacturing" },
        { value: "other", label: "Other (Specify Below)" },
      ],
    },
    {
      name: "business_purpose_other",
      label: "Other Business Purpose",
      type: "TEXT",
      placeholder: "Describe your business purpose...",
      order: 5,
      width: "FULL",
      required: false,
      conditionalLogic: {
        show: true,
        when: "business_purpose",
        operator: "equals",
        value: "other",
      },
    },
    {
      name: "management_type",
      label: "Management Type",
      type: "RADIO",
      helpText: "Member-managed: All members participate in management. Manager-managed: Designated manager(s) handle daily operations.",
      order: 6,
      width: "FULL",
      required: true,
      options: [
        { value: "member", label: "Member-Managed (Recommended for single-member LLCs)" },
        { value: "manager", label: "Manager-Managed (Recommended for multi-member LLCs)" },
      ],
    },
  ];

  const tab1Count = await createFields(tab1.id, tab1Fields);
  console.log(`  ✓ Created ${tab1Count} fields\n`);

  // ========================================
  // TAB 2: Owner Information
  // ========================================
  console.log("📑 Creating Tab 2: Owner Information");
  const tab2 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Owner Information",
      description: "Details about the LLC owner(s)",
      icon: "Users",
      order: 2,
    },
  });

  const tab2Fields: FieldConfig[] = [
    {
      name: "owner_heading",
      label: "Primary Owner / Member Details",
      type: "HEADING",
      order: 1,
      width: "FULL",
      required: false,
    },
    {
      name: "owner_first_name",
      label: "First Name",
      type: "TEXT",
      placeholder: "John",
      order: 2,
      width: "HALF",
      required: true,
      validation: { minLength: 1, maxLength: 50 },
    },
    {
      name: "owner_last_name",
      label: "Last Name",
      type: "TEXT",
      placeholder: "Doe",
      order: 3,
      width: "HALF",
      required: true,
      validation: { minLength: 1, maxLength: 50 },
    },
    {
      name: "owner_email",
      label: "Email Address",
      type: "EMAIL",
      placeholder: "john@example.com",
      helpText: "We'll use this email for important updates about your LLC.",
      order: 4,
      width: "HALF",
      required: true,
    },
    {
      name: "owner_phone",
      label: "Phone Number",
      type: "PHONE",
      placeholder: "+1 (555) 123-4567",
      helpText: "Include country code for international numbers.",
      order: 5,
      width: "HALF",
      required: true,
    },
    {
      name: "owner_country",
      label: "Country of Residence",
      type: "COUNTRY_SELECT",
      placeholder: "Select country...",
      order: 6,
      width: "HALF",
      required: true,
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },
    {
      name: "owner_citizenship",
      label: "Country of Citizenship",
      type: "COUNTRY_SELECT",
      placeholder: "Select country...",
      order: 7,
      width: "HALF",
      required: true,
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },
    {
      name: "owner_address",
      label: "Full Address",
      type: "ADDRESS",
      helpText: "Your residential or business address.",
      order: 8,
      width: "FULL",
      required: true,
    },
    {
      name: "owner_ownership_percentage",
      label: "Ownership Percentage",
      type: "NUMBER",
      placeholder: "100",
      helpText: "Enter your ownership percentage (1-100).",
      order: 9,
      width: "HALF",
      required: true,
      validation: { min: 1, max: 100 },
    },
    {
      name: "has_additional_members",
      label: "Additional Members",
      type: "RADIO",
      helpText: "Will this LLC have additional members (owners)?",
      order: 10,
      width: "FULL",
      required: true,
      options: [
        { value: "no", label: "No, I am the only member (Single-Member LLC)" },
        { value: "yes", label: "Yes, there are additional members" },
      ],
    },
    {
      name: "additional_members_note",
      label: "Additional Members Information",
      type: "PARAGRAPH",
      order: 11,
      width: "FULL",
      required: false,
      defaultValue: "You can add additional members after checkout. Our team will contact you to collect their information.",
      conditionalLogic: {
        show: true,
        when: "has_additional_members",
        operator: "equals",
        value: "yes",
      },
    },
  ];

  const tab2Count = await createFields(tab2.id, tab2Fields);
  console.log(`  ✓ Created ${tab2Count} fields\n`);

  // ========================================
  // TAB 3: Registered Agent
  // ========================================
  console.log("📑 Creating Tab 3: Registered Agent");
  const tab3 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Registered Agent",
      description: "Your LLC's official registered agent",
      icon: "MapPin",
      order: 3,
    },
  });

  const tab3Fields: FieldConfig[] = [
    {
      name: "ra_info",
      label: "What is a Registered Agent?",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
      defaultValue: "A Registered Agent is a person or company designated to receive legal documents and official correspondence on behalf of your LLC. Every LLC must have a Registered Agent with a physical address in the state of formation.",
    },
    {
      name: "registered_agent_option",
      label: "Registered Agent Selection",
      type: "RADIO",
      helpText: "Choose how you want to handle the Registered Agent requirement.",
      order: 2,
      width: "FULL",
      required: true,
      options: [
        { value: "llcpad", label: "Use LLCPad as my Registered Agent ($99/year - Recommended)" },
        { value: "own", label: "I have my own Registered Agent" },
      ],
    },
    {
      name: "own_ra_heading",
      label: "Your Registered Agent Information",
      type: "HEADING",
      order: 3,
      width: "FULL",
      required: false,
      conditionalLogic: {
        show: true,
        when: "registered_agent_option",
        operator: "equals",
        value: "own",
      },
    },
    {
      name: "own_ra_name",
      label: "Registered Agent Name",
      type: "TEXT",
      placeholder: "Agent Name or Company",
      order: 4,
      width: "FULL",
      required: false,
      conditionalLogic: {
        show: true,
        when: "registered_agent_option",
        operator: "equals",
        value: "own",
      },
    },
    {
      name: "own_ra_address",
      label: "Registered Agent Address",
      type: "ADDRESS",
      helpText: "Must be a physical address in the state of formation (no PO Boxes).",
      order: 5,
      width: "FULL",
      required: false,
      conditionalLogic: {
        show: true,
        when: "registered_agent_option",
        operator: "equals",
        value: "own",
      },
    },
  ];

  const tab3Count = await createFields(tab3.id, tab3Fields);
  console.log(`  ✓ Created ${tab3Count} fields\n`);

  // ========================================
  // TAB 4: Additional Services
  // ========================================
  console.log("📑 Creating Tab 4: Additional Services");
  const tab4 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Additional Services",
      description: "Optional add-ons for your LLC",
      icon: "Plus",
      order: 4,
    },
  });

  const tab4Fields: FieldConfig[] = [
    {
      name: "addons_info",
      label: "Enhance Your LLC Package",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
      defaultValue: "Select any additional services you'd like to add to your order.",
    },
    {
      name: "addon_ein",
      label: "EIN Application Service",
      type: "CHECKBOX",
      helpText: "Get your Federal Tax ID (EIN) - Required for bank accounts, hiring employees, and tax filing. ($99)",
      order: 2,
      width: "FULL",
      required: false,
    },
    {
      name: "addon_operating_agreement",
      label: "Custom Operating Agreement",
      type: "CHECKBOX",
      helpText: "Professional operating agreement tailored to your LLC. Required by most banks. ($79)",
      order: 3,
      width: "FULL",
      required: false,
    },
    {
      name: "addon_virtual_address",
      label: "Virtual US Business Address",
      type: "CHECKBOX",
      helpText: "Get a professional US address for your LLC with mail scanning and forwarding. ($149/year)",
      order: 4,
      width: "FULL",
      required: false,
    },
    {
      name: "addon_expedited",
      label: "Expedited Processing",
      type: "CHECKBOX",
      helpText: "Rush your LLC formation to 24-48 hours instead of standard 5-7 business days. ($99)",
      order: 5,
      width: "FULL",
      required: false,
    },
    {
      name: "special_instructions",
      label: "Special Instructions or Questions",
      type: "TEXTAREA",
      placeholder: "Any special requests or questions for our team...",
      helpText: "Optional: Let us know if you have any specific requirements or questions.",
      order: 6,
      width: "FULL",
      required: false,
      validation: { maxLength: 1000 },
    },
  ];

  const tab4Count = await createFields(tab4.id, tab4Fields);
  console.log(`  ✓ Created ${tab4Count} fields\n`);

  // ========================================
  // TAB 5: Review & Confirm
  // ========================================
  console.log("📑 Creating Tab 5: Review & Confirm");
  const tab5 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Review & Confirm",
      description: "Review your information and confirm",
      icon: "CheckCircle",
      order: 5,
    },
  });

  const tab5Fields: FieldConfig[] = [
    {
      name: "review_info",
      label: "Review Your Information",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
      defaultValue: "Please review all the information you've provided. You can go back to any previous step to make changes.",
    },
    {
      name: "accuracy_confirmation",
      label: "I confirm that all information provided is accurate and complete",
      type: "CHECKBOX",
      helpText: "Please verify all details before proceeding.",
      order: 2,
      width: "FULL",
      required: true,
    },
    {
      name: "terms_acceptance",
      label: "I agree to the Terms of Service and Privacy Policy",
      type: "CHECKBOX",
      helpText: "You must accept our terms to proceed.",
      order: 3,
      width: "FULL",
      required: true,
    },
    {
      name: "disclaimer_acknowledgment",
      label: "I understand that LLCPad is not a law firm and does not provide legal advice",
      type: "CHECKBOX",
      helpText: "LLCPad is a business formation document filing service.",
      order: 4,
      width: "FULL",
      required: true,
    },
    {
      name: "electronic_signature",
      label: "Electronic Signature",
      type: "SIGNATURE",
      helpText: "Type your full legal name to serve as your electronic signature.",
      order: 5,
      width: "FULL",
      required: true,
    },
  ];

  const tab5Count = await createFields(tab5.id, tab5Fields);
  console.log(`  ✓ Created ${tab5Count} fields\n`);

  // Summary
  const totalFields = tab1Count + tab2Count + tab3Count + tab4Count + tab5Count;
  console.log("✅ Demo form template created successfully!");
  console.log(`   Service: ${llcService.name}`);
  console.log(`   Tabs: 5`);
  console.log(`   Total Fields: ${totalFields}`);
  console.log("\n📌 Form Structure:");
  console.log(`   1. Company Information (${tab1Count} fields)`);
  console.log(`   2. Owner Information (${tab2Count} fields)`);
  console.log(`   3. Registered Agent (${tab3Count} fields)`);
  console.log(`   4. Additional Services (${tab4Count} fields)`);
  console.log(`   5. Review & Confirm (${tab5Count} fields)`);
}

main()
  .catch((e) => {
    console.error("Error seeding form templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
