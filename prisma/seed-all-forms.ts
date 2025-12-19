import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { serviceForms, FormField, FormStep } from "../src/lib/data/service-forms";

// Use DATABASE_URL from .env for consistency
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Map service-forms.ts field types to Prisma FieldType enum
const fieldTypeMap: Record<string, string> = {
  "text": "TEXT",
  "email": "EMAIL",
  "phone": "PHONE",
  "select": "SELECT",
  "textarea": "TEXTAREA",
  "date": "DATE",
  "number": "NUMBER",
  "checkbox": "CHECKBOX",
  "radio": "RADIO",
  "file": "FILE_UPLOAD",
  "country": "COUNTRY_SELECT",
  "state": "STATE_SELECT",
};

// Map icons based on step names
const iconMap: Record<string, string> = {
  "Personal Information": "User",
  "LLC Information": "Building2",
  "Business Details": "Briefcase",
  "Responsible Party": "UserCheck",
  "Address Information": "MapPin",
  "Passport & Tax Information": "FileText",
  "Document Upload": "Upload",
  "Amazon Account": "ShoppingCart",
  "Product Information": "Package",
  "Design Preferences": "Palette",
  "Assets": "Image",
  "Contact Information": "Mail",
  "Owner Information": "Users",
  "Trademark Details": "Award",
  "Goods & Services": "Tag",
  "Company Information": "Building",
  "Service Selection": "Settings",
  "Tax Information": "Receipt",
  "Banking Requirements": "CreditCard",
  "Business Information": "Briefcase",
  "Account Details": "User",
  "Basic Information": "FileText",
};

function getIcon(stepName: string): string {
  return iconMap[stepName] || "FileText";
}

function getDataSourceType(fieldType: string): string | null {
  if (fieldType === "COUNTRY_SELECT") return "COUNTRY_LIST";
  if (fieldType === "STATE_SELECT") return "STATE_LIST";
  return null;
}

function getDataSourceKey(fieldType: string): string | null {
  if (fieldType === "COUNTRY_SELECT") return "countries";
  if (fieldType === "STATE_SELECT") return "us_states";
  return null;
}

async function seedServiceForm(slug: string) {
  const formConfig = serviceForms[slug];
  if (!formConfig) {
    console.log(`  ⚠️  No form config found for ${slug}`);
    return null;
  }

  // Find the service
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    console.log(`  ⚠️  Service not found: ${slug}`);
    return null;
  }

  // Check if template already exists
  const existingTemplate = await prisma.serviceFormTemplate.findUnique({
    where: { serviceId: service.id },
  });

  if (existingTemplate) {
    console.log(`  ♻️  Deleting existing template for ${service.name}`);
    await prisma.serviceFormTemplate.delete({
      where: { id: existingTemplate.id },
    });
  }

  // Create the form template
  const template = await prisma.serviceFormTemplate.create({
    data: {
      serviceId: service.id,
      version: 1,
      isActive: true,
    },
  });

  let totalFields = 0;

  // Create tabs and fields
  for (const step of formConfig.steps) {
    const tab = await prisma.formTab.create({
      data: {
        templateId: template.id,
        name: step.name,
        description: step.description || null,
        icon: getIcon(step.name),
        order: step.id,
      },
    });

    // Create fields for this tab
    for (let i = 0; i < step.fields.length; i++) {
      const field = step.fields[i];
      const prismaFieldType = fieldTypeMap[field.type] || "TEXT";

      await prisma.formField.create({
        data: {
          tabId: tab.id,
          name: field.name,
          label: field.label,
          type: prismaFieldType as any,
          placeholder: field.placeholder || null,
          helpText: field.helpText || null,
          order: i + 1,
          width: "FULL",
          required: field.required,
          validation: field.validation ? field.validation : null,
          options: field.options ? field.options : null,
          dataSourceType: getDataSourceType(prismaFieldType) as any,
          dataSourceKey: getDataSourceKey(prismaFieldType),
          dependsOn: field.conditionalOn?.field || null,
          conditionalLogic: field.conditionalOn ? {
            show: true,
            when: field.conditionalOn.field,
            operator: "equals",
            value: field.conditionalOn.value,
          } : null,
          accept: field.accept || null,
          maxSize: field.type === "file" ? 10 : null,
          defaultValue: null,
        },
      });
      totalFields++;
    }
  }

  return {
    serviceName: service.name,
    tabs: formConfig.steps.length,
    fields: totalFields,
  };
}

async function main() {
  console.log("🌱 Seeding ALL service form templates...\n");
  console.log("=" .repeat(60));

  const slugs = Object.keys(serviceForms);
  console.log(`📋 Found ${slugs.length} service forms to seed\n`);

  const results: Array<{ slug: string; serviceName?: string; tabs?: number; fields?: number; error?: string }> = [];

  for (const slug of slugs) {
    console.log(`\n📦 Processing: ${slug}`);
    try {
      const result = await seedServiceForm(slug);
      if (result) {
        console.log(`  ✅ ${result.serviceName}: ${result.tabs} tabs, ${result.fields} fields`);
        results.push({ slug, ...result });
      } else {
        results.push({ slug, error: "Service not found or no config" });
      }
    } catch (error) {
      console.error(`  ❌ Error seeding ${slug}:`, error);
      results.push({ slug, error: String(error) });
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SEEDING SUMMARY\n");

  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);

  if (successful.length > 0) {
    console.log("\n📋 Successfully seeded services:");
    let totalTabs = 0;
    let totalFields = 0;
    for (const r of successful) {
      console.log(`   - ${r.serviceName}: ${r.tabs} tabs, ${r.fields} fields`);
      totalTabs += r.tabs || 0;
      totalFields += r.fields || 0;
    }
    console.log(`\n📈 Totals: ${totalTabs} tabs, ${totalFields} fields across ${successful.length} services`);
  }

  if (failed.length > 0) {
    console.log("\n⚠️  Failed services:");
    for (const r of failed) {
      console.log(`   - ${r.slug}: ${r.error}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("Error seeding form templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
