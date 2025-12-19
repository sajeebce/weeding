import prisma from "../src/lib/db";
import { Prisma } from "@prisma/client";

// Helper interface matching the schema
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
  accept?: string;
  maxSize?: number;
}

async function main() {
  console.log("🌱 Seeding ITIN Application form template...\n");

  // Find ITIN Application service
  const itinService = await prisma.service.findUnique({
    where: { slug: "itin-application" },
  });

  if (!itinService) {
    console.log("❌ ITIN Application service not found. Run main seed first.");
    return;
  }

  console.log(`📋 Creating form template for: ${itinService.name}`);

  // Check if template already exists
  const existingTemplate = await prisma.serviceFormTemplate.findUnique({
    where: { serviceId: itinService.id },
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
      serviceId: itinService.id,
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
          accept: field.accept ?? null,
          maxSize: field.maxSize ?? null,
        },
      });
    }
    return fields.length;
  }

  // ========================================
  // TAB 1: Personal Information
  // ========================================
  console.log("📑 Creating Tab 1: Personal Information");
  const tab1 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Personal Information",
      description: "Your basic personal details",
      icon: "User",
      order: 1,
    },
  });

  const tab1Fields: FieldConfig[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "TEXT",
      placeholder: "Enter your first name",
      helpText: "Exactly as shown on your passport",
      order: 1,
      width: "HALF",
      required: true,
      validation: { minLength: 1, maxLength: 50 },
    },
    {
      name: "middleName",
      label: "Middle Name",
      type: "TEXT",
      placeholder: "Enter your middle name",
      order: 2,
      width: "HALF",
      required: false,
      validation: { maxLength: 50 },
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "TEXT",
      placeholder: "Enter your last name",
      order: 3,
      width: "FULL",
      required: true,
      validation: { minLength: 1, maxLength: 50 },
    },
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "DATE",
      order: 4,
      width: "HALF",
      required: true,
    },
    {
      name: "countryOfBirth",
      label: "Country of Birth",
      type: "COUNTRY_SELECT",
      placeholder: "Select country...",
      order: 5,
      width: "HALF",
      required: true,
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },
    {
      name: "countryOfCitizenship",
      label: "Country of Citizenship",
      type: "COUNTRY_SELECT",
      placeholder: "Select country...",
      order: 6,
      width: "HALF",
      required: true,
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },
    {
      name: "gender",
      label: "Gender",
      type: "SELECT",
      placeholder: "Select gender...",
      order: 7,
      width: "HALF",
      required: true,
      dataSourceType: "STATIC",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
  ];

  const tab1Count = await createFields(tab1.id, tab1Fields);
  console.log(`  ✓ Created ${tab1Count} fields\n`);

  // ========================================
  // TAB 2: Address Information
  // ========================================
  console.log("📑 Creating Tab 2: Address Information");
  const tab2 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Address Information",
      description: "Your current address details",
      icon: "MapPin",
      order: 2,
    },
  });

  const tab2Fields: FieldConfig[] = [
    {
      name: "foreign_address_heading",
      label: "Foreign Address",
      type: "HEADING",
      order: 1,
      width: "FULL",
      required: false,
    },
    {
      name: "foreignAddress",
      label: "Foreign Street Address",
      type: "TEXT",
      placeholder: "Your address outside the US",
      order: 2,
      width: "FULL",
      required: true,
    },
    {
      name: "foreignCity",
      label: "City",
      type: "TEXT",
      placeholder: "Enter city",
      order: 3,
      width: "HALF",
      required: true,
    },
    {
      name: "foreignCountry",
      label: "Country",
      type: "COUNTRY_SELECT",
      placeholder: "Select country...",
      order: 4,
      width: "HALF",
      required: true,
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },
    {
      name: "foreignPostalCode",
      label: "Postal Code",
      type: "TEXT",
      placeholder: "Enter postal code",
      order: 5,
      width: "HALF",
      required: false,
    },
    {
      name: "hasUSAddress",
      label: "Do you have a US address?",
      type: "CHECKBOX",
      order: 6,
      width: "FULL",
      required: false,
    },
    {
      name: "us_address_heading",
      label: "US Address",
      type: "HEADING",
      order: 7,
      width: "FULL",
      required: false,
      conditionalLogic: {
        show: true,
        when: "hasUSAddress",
        operator: "equals",
        value: true,
      },
    },
    {
      name: "usAddress",
      label: "US Street Address",
      type: "TEXT",
      placeholder: "Enter US address",
      order: 8,
      width: "FULL",
      required: false,
      conditionalLogic: {
        show: true,
        when: "hasUSAddress",
        operator: "equals",
        value: true,
      },
    },
    {
      name: "usCity",
      label: "US City",
      type: "TEXT",
      placeholder: "Enter city",
      order: 9,
      width: "HALF",
      required: false,
      conditionalLogic: {
        show: true,
        when: "hasUSAddress",
        operator: "equals",
        value: true,
      },
    },
    {
      name: "usState",
      label: "US State",
      type: "STATE_SELECT",
      placeholder: "Select state...",
      order: 10,
      width: "HALF",
      required: false,
      dataSourceType: "STATE_LIST",
      dataSourceKey: "us_states",
      conditionalLogic: {
        show: true,
        when: "hasUSAddress",
        operator: "equals",
        value: true,
      },
    },
    {
      name: "usZip",
      label: "US ZIP Code",
      type: "TEXT",
      placeholder: "Enter ZIP code",
      order: 11,
      width: "HALF",
      required: false,
      validation: { pattern: "^[0-9]{5}(-[0-9]{4})?$" },
      conditionalLogic: {
        show: true,
        when: "hasUSAddress",
        operator: "equals",
        value: true,
      },
    },
  ];

  const tab2Count = await createFields(tab2.id, tab2Fields);
  console.log(`  ✓ Created ${tab2Count} fields\n`);

  // ========================================
  // TAB 3: Passport & Tax Information
  // ========================================
  console.log("📑 Creating Tab 3: Passport & Tax Information");
  const tab3 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Passport & Tax Information",
      description: "Identity and tax filing details",
      icon: "FileText",
      order: 3,
    },
  });

  const tab3Fields: FieldConfig[] = [
    {
      name: "passport_heading",
      label: "Passport Details",
      type: "HEADING",
      order: 1,
      width: "FULL",
      required: false,
    },
    {
      name: "passportNumber",
      label: "Passport Number",
      type: "TEXT",
      placeholder: "Enter passport number",
      order: 2,
      width: "HALF",
      required: true,
    },
    {
      name: "passportCountry",
      label: "Passport Issuing Country",
      type: "COUNTRY_SELECT",
      placeholder: "Select country...",
      order: 3,
      width: "HALF",
      required: true,
      dataSourceType: "COUNTRY_LIST",
      dataSourceKey: "countries",
    },
    {
      name: "passportIssueDate",
      label: "Passport Issue Date",
      type: "DATE",
      order: 4,
      width: "HALF",
      required: true,
    },
    {
      name: "passportExpirationDate",
      label: "Passport Expiration Date",
      type: "DATE",
      order: 5,
      width: "HALF",
      required: true,
    },
    {
      name: "tax_heading",
      label: "Tax Filing Information",
      type: "HEADING",
      order: 6,
      width: "FULL",
      required: false,
    },
    {
      name: "reasonForApplying",
      label: "Reason for ITIN",
      type: "SELECT",
      placeholder: "Select reason...",
      order: 7,
      width: "HALF",
      required: true,
      dataSourceType: "STATIC",
      options: [
        { value: "tax_return", label: "Filing US tax return" },
        { value: "treaty_benefit", label: "Claiming tax treaty benefits" },
        { value: "withholding", label: "Third-party withholding" },
        { value: "other", label: "Other exception" },
      ],
    },
    {
      name: "taxYear",
      label: "Tax Year",
      type: "SELECT",
      placeholder: "Select tax year...",
      order: 8,
      width: "HALF",
      required: true,
      dataSourceType: "STATIC",
      options: [
        { value: "2025", label: "2025" },
        { value: "2024", label: "2024" },
        { value: "2023", label: "2023" },
        { value: "2022", label: "2022" },
      ],
    },
    {
      name: "certificationOption",
      label: "Document Certification",
      type: "RADIO",
      helpText: "Choose how you want to certify your documents",
      order: 9,
      width: "FULL",
      required: true,
      options: [
        {
          value: "caa",
          label: "CAA Service (Recommended)",
          description: "No need to mail original passport",
        },
        {
          value: "standard",
          label: "Standard",
          description: "Mail original passport to IRS",
        },
      ],
    },
  ];

  const tab3Count = await createFields(tab3.id, tab3Fields);
  console.log(`  ✓ Created ${tab3Count} fields\n`);

  // ========================================
  // TAB 4: Document Upload
  // ========================================
  console.log("📑 Creating Tab 4: Document Upload");
  const tab4 = await prisma.formTab.create({
    data: {
      templateId: template.id,
      name: "Document Upload",
      description: "Upload required documents",
      icon: "Upload",
      order: 4,
    },
  });

  const tab4Fields: FieldConfig[] = [
    {
      name: "upload_info",
      label: "Required Documents",
      type: "PARAGRAPH",
      order: 1,
      width: "FULL",
      required: false,
      defaultValue: "Please upload clear, legible scans or photos of your documents. Accepted formats: PDF, JPG, PNG. Maximum file size: 10MB per file.",
    },
    {
      name: "passportCopy",
      label: "Passport Copy",
      type: "FILE_UPLOAD",
      helpText: "Upload a clear scan of your passport bio page (the page with your photo)",
      order: 2,
      width: "FULL",
      required: true,
      accept: ".pdf,.jpg,.jpeg,.png",
      maxSize: 10,
    },
    {
      name: "additionalDocument",
      label: "Additional Supporting Document (Optional)",
      type: "FILE_UPLOAD",
      helpText: "Upload any additional supporting documents such as visa, I-94, or other identity documents",
      order: 3,
      width: "FULL",
      required: false,
      accept: ".pdf,.jpg,.jpeg,.png",
      maxSize: 10,
    },
  ];

  const tab4Count = await createFields(tab4.id, tab4Fields);
  console.log(`  ✓ Created ${tab4Count} fields\n`);

  // Summary
  const totalFields = tab1Count + tab2Count + tab3Count + tab4Count;
  console.log("✅ ITIN form template created successfully!");
  console.log(`   Service: ${itinService.name}`);
  console.log(`   Tabs: 4`);
  console.log(`   Total Fields: ${totalFields}`);
  console.log("\n📌 Form Structure:");
  console.log(`   1. Personal Information (${tab1Count} fields)`);
  console.log(`   2. Address Information (${tab2Count} fields)`);
  console.log(`   3. Passport & Tax Information (${tab3Count} fields)`);
  console.log(`   4. Document Upload (${tab4Count} fields)`);
}

main()
  .catch((e) => {
    console.error("Error seeding ITIN form template:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
