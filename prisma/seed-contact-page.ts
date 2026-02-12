import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding contact page...\n");

  // ==========================================
  // STEP 1: Update/Create "contact us" lead form template
  // ==========================================
  console.log("Step 1: Lead form template...");

  const contactFields = [
    {
      id: "contact_firstName",
      type: "text",
      name: "firstName",
      label: "First Name",
      placeholder: "John",
      required: true,
      mapToLeadField: "firstName",
      width: "half",
    },
    {
      id: "contact_lastName",
      type: "text",
      name: "lastName",
      label: "Last Name",
      placeholder: "Doe",
      required: true,
      mapToLeadField: "lastName",
      width: "half",
    },
    {
      id: "contact_email",
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "john@example.com",
      required: true,
      mapToLeadField: "email",
      width: "half",
    },
    {
      id: "contact_phone",
      type: "phone",
      name: "phone",
      label: "Phone (Optional)",
      placeholder: "+1 234 567 890",
      required: false,
      mapToLeadField: "phone",
      width: "half",
    },
    {
      id: "contact_subject",
      type: "select",
      name: "subject",
      label: "Subject",
      placeholder: "Select a subject",
      required: true,
      options: [
        "General Inquiry",
        "Existing Order Support",
        "Partnership Opportunity",
      ],
    },
    {
      id: "contact_message",
      type: "textarea",
      name: "message",
      label: "Message",
      placeholder: "Tell us how we can help you...",
      required: true,
      mapToLeadField: "message",
    },
  ];

  // Find existing "contact us" template
  const existingTemplate = await prisma.leadFormTemplate.findFirst({
    where: { name: { contains: "contact", mode: "insensitive" } },
  });

  let templateId: string;

  if (existingTemplate) {
    await prisma.leadFormTemplate.update({
      where: { id: existingTemplate.id },
      data: {
        name: "Contact Us",
        description: "Contact form for the main contact page",
        fields: contactFields as unknown as Prisma.InputJsonValue,
        successMessage:
          "Thank you for reaching out! We'll get back to you within 24 hours.",
        isSystem: true,
      },
    });
    templateId = existingTemplate.id;
    console.log(`  Updated existing template: ${existingTemplate.id}`);
  } else {
    const newTemplate = await prisma.leadFormTemplate.create({
      data: {
        name: "Contact Us",
        description: "Contact form for the main contact page",
        fields: contactFields as unknown as Prisma.InputJsonValue,
        successMessage:
          "Thank you for reaching out! We'll get back to you within 24 hours.",
        isSystem: true,
        isActive: true,
      },
    });
    templateId = newTemplate.id;
    console.log(`  Created new template: ${newTemplate.id}`);
  }

  // ==========================================
  // STEP 2: Build Contact page sections
  // ==========================================
  console.log("\nStep 2: Contact page sections...");

  const contactPage = await prisma.landingPage.findFirst({
    where: {
      OR: [{ slug: "contact" }, { templateType: "CONTACT", isTemplateActive: true }],
    },
  });

  if (!contactPage) {
    console.log("  Contact page not found! Run seed-system-pages.ts first.");
    return;
  }

  console.log(`  Found contact page: ${contactPage.id} (/${contactPage.slug})`);

  // Build the sections JSON
  const sections = [
    // ────────────────────────────────────
    // Section 1: Page Header
    // ────────────────────────────────────
    {
      id: "contact_header",
      order: 0,
      layout: "1",
      columns: [
        {
          id: "header_col1",
          widgets: [
            // "Contact Us" badge-style heading
            {
              id: "contact_badge",
              type: "heading",
              settings: {
                content: {
                  text: "Contact Us",
                  htmlTag: "div",
                },
                style: {
                  alignment: "center",
                  typography: {
                    fontSize: 14,
                    fontSizeUnit: "px",
                    fontWeight: 500,
                    fontStyle: "normal",
                    textTransform: "none",
                    textDecoration: "none",
                    lineHeight: 1.4,
                    letterSpacing: 0,
                    letterSpacingUnit: "px",
                  },
                  textFill: {
                    type: "solid",
                    color: "#ffffff",
                  },
                },
                advanced: {
                  customClass: "mx-auto w-fit rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground",
                },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Main heading: "Get in Touch"
            {
              id: "contact_heading",
              type: "heading",
              settings: {
                content: {
                  text: "Get in Touch",
                  htmlTag: "h1",
                },
                style: {
                  alignment: "center",
                  typography: {
                    fontSize: 36,
                    fontSizeUnit: "px",
                    fontWeight: 700,
                    fontStyle: "normal",
                    textTransform: "none",
                    textDecoration: "none",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    letterSpacingUnit: "px",
                  },
                  textFill: {
                    type: "solid",
                    color: "#0f172a",
                  },
                },
                responsive: {
                  desktop: {
                    fontSize: 36,
                    fontSizeUnit: "px",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    alignment: "center",
                  },
                  tablet: {
                    fontSize: 30,
                    fontSizeUnit: "px",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  },
                  mobile: {
                    fontSize: 26,
                    fontSizeUnit: "px",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                  },
                },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Description text
            {
              id: "contact_description",
              type: "text-block",
              settings: {
                content:
                  '<p style="text-align: center">Have questions about our services? We\'re here to help. Reach out and our team will respond within 24 hours.</p>',
                editor: { toolbar: "minimal", minHeight: 60 },
                typography: {
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#64748b",
                  linkColor: "#f97316",
                  linkHoverColor: "#ea580c",
                  linkUnderline: true,
                },
                container: { padding: 0, borderRadius: 0 },
                paragraphSpacing: 16,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 64,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 0,
        maxWidth: "lg",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },

    // ────────────────────────────────────
    // Section 2: Contact Info + Form
    // Layout: 1-2 (33% / 66%)
    // ────────────────────────────────────
    {
      id: "contact_content",
      order: 1,
      layout: "1-2",
      columns: [
        // Left column: Contact information cards
        {
          id: "info_col",
          widgets: [
            // Contact details card
            {
              id: "contact_info",
              type: "text-block",
              settings: {
                content: [
                  '<div style="margin-bottom: 20px">',
                  '<h4 style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px">Contact Information</h4>',
                  '<div style="margin-bottom: 16px">',
                  '<p style="font-weight: 600; color: #0f172a; margin-bottom: 2px">Email</p>',
                  '<p><a href="mailto:support@example.com" style="color: #64748b">support@example.com</a></p>',
                  '</div>',
                  '<div style="margin-bottom: 16px">',
                  '<p style="font-weight: 600; color: #0f172a; margin-bottom: 2px">Phone</p>',
                  '<p><a href="tel:+1234567890" style="color: #64748b">+1 (234) 567-890</a></p>',
                  '</div>',
                  '<div style="margin-bottom: 16px">',
                  '<p style="font-weight: 600; color: #0f172a; margin-bottom: 2px">Address</p>',
                  '<p style="color: #64748b">30 N Gould St, Sheridan,<br>WY 82801, USA</p>',
                  '</div>',
                  '<div>',
                  '<p style="font-weight: 600; color: #0f172a; margin-bottom: 2px">Business Hours</p>',
                  '<p style="color: #64748b">Mon-Fri: 9AM-6PM EST</p>',
                  '</div>',
                  '</div>',
                ].join(""),
                editor: { toolbar: "minimal", minHeight: 100 },
                typography: {
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#334155",
                  linkColor: "#64748b",
                  linkHoverColor: "#f97316",
                  linkUnderline: false,
                },
                container: {
                  padding: 24,
                  borderRadius: 12,
                  border: { width: 1, color: "#e2e8f0", style: "solid" },
                  shadow: "sm",
                  backgroundColor: "#ffffff",
                },
                paragraphSpacing: 4,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 16 },
            },
            // Live Chat CTA card
            {
              id: "contact_live_chat",
              type: "text-block",
              settings: {
                content: [
                  '<div style="text-align: center">',
                  '<p style="font-weight: 600; color: #0f172a; font-size: 15px; margin-bottom: 4px">Need Immediate Help?</p>',
                  '<p style="color: #64748b; font-size: 13px; margin-bottom: 12px">Our team is available for live chat during business hours.</p>',
                  '<p><a href="/contact#chat" style="display: inline-block; background: #f97316; color: #ffffff; padding: 8px 24px; border-radius: 8px; font-weight: 500; font-size: 14px; text-decoration: none">Start Live Chat</a></p>',
                  '</div>',
                ].join(""),
                editor: { toolbar: "minimal", minHeight: 60 },
                typography: {
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#334155",
                  linkColor: "#ffffff",
                  linkHoverColor: "#ffffff",
                  linkUnderline: false,
                },
                container: {
                  padding: 24,
                  borderRadius: 12,
                  border: { width: 1, color: "#fed7aa", style: "solid" },
                  shadow: "none",
                  backgroundColor: "#fff7ed",
                },
                paragraphSpacing: 4,
                lists: {
                  bulletStyle: "disc",
                  numberStyle: "decimal",
                  indentation: 24,
                },
                blockquote: {
                  borderColor: "#f97316",
                  borderWidth: 4,
                  fontStyle: "italic",
                  padding: 16,
                },
                dropCap: { enabled: false, size: 3 },
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },

        // Right column: Lead form
        {
          id: "form_col",
          widgets: [
            {
              id: "contact_lead_form",
              type: "lead-form",
              settings: {
                title: "",
                description: "",
                templateId: templateId,
                fields: contactFields,
                submitButton: {
                  text: "Send Message",
                  icon: "Send",
                  fullWidth: true,
                  style: {
                    bgColor: "#f97316",
                    textColor: "#ffffff",
                    borderRadius: 8,
                    hoverEffect: "darken",
                  },
                },
                successMessage:
                  "Thank you for reaching out! We'll get back to you within 24 hours.",
                footerText: 'By submitting this form, you agree to our <a href="/privacy-policy" style="color: #f97316; text-decoration: underline">Privacy Policy</a>.',
                submitTo: "database",
                backgroundColor: "#ffffff",
                titleColor: "#0f172a",
                descriptionColor: "#64748b",
                labelColor: "#334155",
                inputTextColor: "#0f172a",
                padding: 24,
                borderRadius: 12,
                shadow: false,
              },
              spacing: { marginTop: 0, marginBottom: 0 },
            },
          ],
          settings: { verticalAlign: "top", padding: 0 },
        },
      ],
      settings: {
        fullWidth: false,
        background: { type: "solid", color: "transparent" },
        paddingTop: 32,
        paddingBottom: 64,
        paddingLeft: 16,
        paddingRight: 16,
        marginTop: 0,
        marginBottom: 0,
        gap: 32,
        maxWidth: "xl",
        borderRadius: 0,
        isVisible: true,
        visibleOnMobile: true,
        visibleOnDesktop: true,
      },
    },
  ];

  // Find and update the widget-page-sections block
  const block = await prisma.landingPageBlock.findFirst({
    where: {
      landingPageId: contactPage.id,
      type: "widget-page-sections",
    },
  });

  if (block) {
    await prisma.landingPageBlock.update({
      where: { id: block.id },
      data: {
        settings: sections as unknown as Prisma.InputJsonValue,
      },
    });
    console.log(`  Updated widget-page-sections block: ${block.id}`);
  } else {
    await prisma.landingPageBlock.create({
      data: {
        landingPageId: contactPage.id,
        type: "widget-page-sections",
        name: "Widget Page Sections",
        sortOrder: 0,
        isActive: true,
        settings: sections as unknown as Prisma.InputJsonValue,
      },
    });
    console.log("  Created widget-page-sections block");
  }

  console.log("\nDone! Contact page seeded successfully.");
  console.log(`  Template ID: ${templateId}`);
  console.log(`  Page: /${contactPage.slug}`);
  console.log("  Sections: 2 (header + contact form)");
  console.log(`  Fields: ${contactFields.length} (firstName, lastName, email, phone, subject, message)`);
  console.log("  Features: 2-col fields, Send icon, footer text, live chat CTA");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
