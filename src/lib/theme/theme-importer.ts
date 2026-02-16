// ============================================
// THEME SYSTEM - DATA IMPORTER
// ============================================
// Imports ThemeData JSON into the database, replacing all CMS content
// while preserving user/order/lead data. Runs in a single Prisma
// interactive transaction for full atomicity.

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

import type {
  ThemeData,
  ThemeMenuItem,
  ImportResult,
} from "./theme-types";

// ---- Options for importThemeData ----

interface ImportOptions {
  source?: "theme" | "file";
  themeId?: string;
  themeName?: string;
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

export async function importThemeData(
  data: ThemeData,
  options?: ImportOptions
): Promise<ImportResult> {
  const startTime = Date.now();
  const source = options?.source ?? "file";

  // Counters for the result
  const counts = {
    settings: 0,
    serviceCategories: 0,
    services: 0,
    packages: 0,
    pages: 0,
    blogs: 0,
    faqs: 0,
    testimonials: 0,
    legalPages: 0,
    formTemplates: 0,
    menuItems: 0,
    footerWidgets: 0,
    locationFees: 0,
  };

  await prisma.$transaction(
    async (tx) => {
      // =============================================
      // DELETE PHASE - Order matters for FK constraints
      // =============================================

      // 1. Delete footer menu items (child of FooterWidget)
      await tx.menuItem.deleteMany({
        where: { footerWidgetId: { not: null } },
      });
      // 2. Delete footer widgets
      await tx.footerWidget.deleteMany({});
      // 3. Delete footer configs
      await tx.footerConfig.deleteMany({});
      // 4. Delete header menu items (child of HeaderConfig)
      await tx.menuItem.deleteMany({ where: { headerId: { not: null } } });
      // 5. Delete header configs
      await tx.headerConfig.deleteMany({});
      // 6. Delete form fields, form tabs, form templates
      await tx.formField.deleteMany({});
      await tx.formTab.deleteMany({});
      await tx.serviceFormTemplate.deleteMany({});
      // 7. Delete package feature maps
      await tx.packageFeatureMap.deleteMany({});
      // 8. Delete package features and not-included
      await tx.packageFeature.deleteMany({});
      await tx.packageNotIncluded.deleteMany({});
      // 9. Nullify OrderItem FK references (orders are preserved, but services/packages are deleted)
      await tx.$executeRawUnsafe(`UPDATE "OrderItem" SET "packageId" = NULL`);
      await tx.$executeRawUnsafe(`UPDATE "OrderItem" SET "serviceId" = NULL`);
      // 10. Delete packages
      await tx.package.deleteMany({});
      // 11. Delete service features
      await tx.serviceFeature.deleteMany({});
      // 12. Delete service FAQs
      await tx.serviceFAQ.deleteMany({});
      // 13. Delete location fees
      await tx.locationFee.deleteMany({});
      // 14. Delete services
      await tx.service.deleteMany({});
      // 14. Delete service categories
      await tx.serviceCategory.deleteMany({});
      // 15. Delete landing page blocks then pages
      await tx.landingPageBlock.deleteMany({});
      await tx.landingPage.deleteMany({});
      // 16. Delete blog posts (implicit m2m clears join table), then categories
      await tx.blogPost.deleteMany({});
      await tx.blogCategory.deleteMany({});
      // 17. Delete global FAQs
      await tx.fAQ.deleteMany({});
      // 18. Delete testimonials
      await tx.testimonial.deleteMany({});
      // 19. Delete legal pages
      await tx.legalPage.deleteMany({});
      // 20. Delete settings
      await tx.setting.deleteMany({});
      // 21. Delete active theme
      await tx.activeTheme.deleteMany({});

      // =============================================
      // IMPORT PHASE - Order matters for FK references
      // =============================================

      // ---- 1. Settings ----
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          await tx.setting.create({
            data: { key, value },
          });
          counts.settings++;
        }
      }

      // ---- 2. Color Palette + Active Theme ----
      if (options?.themeId) {
        await tx.activeTheme.create({
          data: {
            themeId: options.themeId,
            themeName: options.themeName || options.themeId,
            colorPalette: data.colorPalette as unknown as Prisma.InputJsonValue,
            originalColorPalette: data.colorPalette as unknown as Prisma.InputJsonValue,
          },
        });
      }

      // ---- 3. Service Categories ----
      const categorySlugToId: Record<string, string> = {};

      if (data.serviceCategories) {
        for (const cat of data.serviceCategories) {
          const created = await tx.serviceCategory.create({
            data: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
              icon: cat.icon || null,
              sortOrder: cat.sortOrder ?? 0,
              isActive: true,
            },
          });
          categorySlugToId[cat.slug] = created.id;
          counts.serviceCategories++;
        }
      }

      // ---- 4. Services ----
      const serviceSlugToId: Record<string, string> = {};

      if (data.services) {
        for (const svc of data.services) {
          const categoryId = svc.categorySlug
            ? categorySlugToId[svc.categorySlug] || null
            : null;

          const created = await tx.service.create({
            data: {
              name: svc.name,
              slug: svc.slug,
              shortDesc: svc.shortDesc,
              description: svc.description,
              icon: svc.icon || null,
              image: svc.image || null,
              startingPrice: new Prisma.Decimal(svc.startingPrice),
              isPopular: svc.isPopular ?? false,
              isActive: true,
              categoryId,
              metaTitle: svc.metaTitle || null,
              metaDescription: svc.metaDescription || null,
              displayOptions:
                (svc.displayOptions as Prisma.InputJsonValue) ?? {},
            },
          });
          serviceSlugToId[svc.slug] = created.id;
          counts.services++;
        }
      }

      // ---- 5. Packages ----
      // Map: "serviceSlug::packageName" -> packageId
      const packageKey = (serviceSlug: string, pkgName: string) =>
        `${serviceSlug}::${pkgName}`;
      const packageNameToId: Record<string, string> = {};

      if (data.services) {
        for (const svc of data.services) {
          const serviceId = serviceSlugToId[svc.slug];
          if (!serviceId) continue;

          for (let i = 0; i < (svc.packages?.length ?? 0); i++) {
            const pkg = svc.packages[i];
            const created = await tx.package.create({
              data: {
                serviceId,
                name: pkg.name,
                description: pkg.description || null,
                priceUSD: new Prisma.Decimal(pkg.price),
                isPopular: pkg.isPopular ?? false,
                isActive: true,
                sortOrder: i,
                processingTime: pkg.processingTime || null,
                processingIcon: pkg.processingIcon || null,
                badgeText: pkg.badgeText || null,
                badgeColor: pkg.badgeColor || null,
              },
            });
            packageNameToId[packageKey(svc.slug, pkg.name)] = created.id;
            counts.packages++;
          }
        }
      }

      // ---- 6. Service Features (for comparison table) ----
      if (data.services) {
        for (const svc of data.services) {
          if (!svc.comparisonFeatures?.length) continue;
          const serviceId = serviceSlugToId[svc.slug];
          if (!serviceId) continue;

          for (let fi = 0; fi < svc.comparisonFeatures.length; fi++) {
            const cf = svc.comparisonFeatures[fi];

            const feature = await tx.serviceFeature.create({
              data: {
                serviceId,
                text: cf.text,
                tooltip: cf.tooltip || null,
                sortOrder: fi,
              },
            });

            // Create PackageFeatureMap for each package mapping
            if (cf.packages) {
              for (const [pkgName, mapping] of Object.entries(cf.packages)) {
                const pkgId = packageNameToId[packageKey(svc.slug, pkgName)];
                if (!pkgId) continue;

                await tx.packageFeatureMap.create({
                  data: {
                    packageId: pkgId,
                    featureId: feature.id,
                    valueType: mapping.valueType ?? "BOOLEAN",
                    included: mapping.included ?? false,
                    customValue: mapping.customValue || null,
                    addonPriceUSD: mapping.addonPriceUSD != null
                      ? new Prisma.Decimal(mapping.addonPriceUSD)
                      : null,
                    addonPriceBDT: mapping.addonPriceBDT != null
                      ? new Prisma.Decimal(mapping.addonPriceBDT)
                      : null,
                  },
                });
              }
            }
          }
        }
      }

      // ---- 7. Package Features (simple feature lists) ----
      if (data.services) {
        for (const svc of data.services) {
          for (const pkg of svc.packages ?? []) {
            const pkgId = packageNameToId[packageKey(svc.slug, pkg.name)];
            if (!pkgId) continue;

            // Included features
            for (let fi = 0; fi < (pkg.features?.length ?? 0); fi++) {
              await tx.packageFeature.create({
                data: {
                  packageId: pkgId,
                  text: pkg.features[fi],
                  sortOrder: fi,
                },
              });
            }

            // Not-included features
            for (let ni = 0; ni < (pkg.notIncluded?.length ?? 0); ni++) {
              await tx.packageNotIncluded.create({
                data: {
                  packageId: pkgId,
                  text: pkg.notIncluded![ni],
                  sortOrder: ni,
                },
              });
            }
          }
        }
      }

      // ---- 8. Service FAQs ----
      if (data.services) {
        for (const svc of data.services) {
          const serviceId = serviceSlugToId[svc.slug];
          if (!serviceId) continue;

          for (let fi = 0; fi < (svc.faqs?.length ?? 0); fi++) {
            const faq = svc.faqs[fi];
            await tx.serviceFAQ.create({
              data: {
                serviceId,
                question: faq.question,
                answer: faq.answer,
                sortOrder: fi,
              },
            });
          }
        }
      }

      // ---- 9. Form Templates ----
      if (data.formTemplates) {
        for (const ft of data.formTemplates) {
          const serviceId = serviceSlugToId[ft.serviceSlug];
          if (!serviceId) continue;

          const template = await tx.serviceFormTemplate.create({
            data: {
              serviceId,
              version: ft.version ?? 1,
              isActive: true,
            },
          });

          for (const tab of ft.tabs ?? []) {
            const createdTab = await tx.formTab.create({
              data: {
                templateId: template.id,
                name: tab.name,
                order: tab.order,
              },
            });

            for (let fi = 0; fi < (tab.fields?.length ?? 0); fi++) {
              const field = tab.fields[fi];
              await tx.formField.create({
                data: {
                  tabId: createdTab.id,
                  name: field.name,
                  label: field.label,
                  type: field.type as any,
                  placeholder: field.placeholder || null,
                  required: field.required ?? false,
                  options: field.options
                    ? (field.options as unknown as Prisma.InputJsonValue)
                    : undefined,
                  validation: field.validation
                    ? (field.validation as Prisma.InputJsonValue)
                    : undefined,
                  order: fi,
                },
              });
            }
          }

          counts.formTemplates++;
        }
      }

      // ---- 10. Pages ----
      if (data.pages) {
        for (const page of data.pages) {
          const createdPage = await tx.landingPage.create({
            data: {
              slug: page.slug,
              name: page.name,
              isActive: true,
              isSystem: page.isSystem ?? false,
              templateType: (page.templateType as any) || undefined,
              isTemplateActive: page.isTemplateActive ?? false,
              metaTitle: page.metaTitle || null,
              metaDescription: page.metaDescription || null,
            },
          });

          for (const block of page.blocks ?? []) {
            await tx.landingPageBlock.create({
              data: {
                landingPageId: createdPage.id,
                type: block.type,
                name: block.name || null,
                sortOrder: block.sortOrder ?? 0,
                isActive: block.isActive ?? true,
                settings: block.settings as Prisma.InputJsonValue,
                hideOnMobile: block.hideOnMobile ?? false,
                hideOnDesktop: block.hideOnDesktop ?? false,
              },
            });
          }

          counts.pages++;
        }
      }

      // ---- 11. Blog Categories ----
      const blogCatSlugToId: Record<string, string> = {};

      if (data.blogCategories) {
        // First pass: create all categories without parentId
        for (const cat of data.blogCategories) {
          const created = await tx.blogCategory.create({
            data: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
            },
          });
          blogCatSlugToId[cat.slug] = created.id;
        }

        // Second pass: set parentId where applicable
        for (const cat of data.blogCategories) {
          if (cat.parentSlug && blogCatSlugToId[cat.parentSlug]) {
            await tx.blogCategory.update({
              where: { id: blogCatSlugToId[cat.slug] },
              data: { parentId: blogCatSlugToId[cat.parentSlug] },
            });
          }
        }
      }

      // ---- 12. Blog Posts ----
      if (data.blogs) {
        for (const post of data.blogs) {
          const categoryConnect =
            post.categorySlug && blogCatSlugToId[post.categorySlug]
              ? { connect: [{ id: blogCatSlugToId[post.categorySlug] }] }
              : undefined;

          await tx.blogPost.create({
            data: {
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt || null,
              status: post.published ? "PUBLISHED" : "DRAFT",
              publishedAt: post.published ? new Date() : null,
              metaTitle: post.metaTitle || null,
              metaDescription: post.metaDescription || null,
              categories: categoryConnect,
            },
          });
          counts.blogs++;
        }
      }

      // ---- 13. FAQs ----
      if (data.faqs) {
        for (const faq of data.faqs) {
          await tx.fAQ.create({
            data: {
              question: faq.question,
              answer: faq.answer,
              category: faq.category || null,
              sortOrder: faq.sortOrder ?? 0,
              isActive: true,
            },
          });
          counts.faqs++;
        }
      }

      // ---- 14. Testimonials ----
      if (data.testimonials) {
        for (const t of data.testimonials) {
          await tx.testimonial.create({
            data: {
              name: t.name,
              company: t.company || null,
              country: t.country || null,
              avatar: t.avatar || null,
              content: t.content,
              rating: t.rating ?? 5,
              isActive: t.isActive ?? true,
              sortOrder: t.sortOrder ?? 0,
            },
          });
          counts.testimonials++;
        }
      }

      // ---- 15. Legal Pages ----
      if (data.legalPages) {
        for (const lp of data.legalPages) {
          await tx.legalPage.create({
            data: {
              slug: lp.slug,
              title: lp.title,
              content: lp.content,
              isActive: lp.isActive ?? true,
            },
          });
          counts.legalPages++;
        }
      }

      // ---- 16. Header Config ----
      let headerId: string | null = null;

      if (data.headerConfig) {
        const hc = data.headerConfig;
        const header = await tx.headerConfig.create({
          data: {
            name: hc.name || "Default Header",
            isActive: true,
            layout: (hc.layout as "DEFAULT") || "DEFAULT",
            sticky: hc.sticky ?? true,
            transparent: hc.transparent ?? false,
            topBarEnabled: hc.topBarEnabled ?? false,
            logoPosition: (hc.logoPosition as "LEFT") || "LEFT",
            logoMaxHeight: hc.logoMaxHeight ?? 56,
            showAuthButtons: hc.showAuthButtons ?? true,
            loginText: hc.loginText || "Sign In",
            registerText: hc.registerText || "Get Started",
            registerUrl: hc.registerUrl || "/services/llc-formation",
            searchEnabled: hc.searchEnabled ?? false,
            mobileBreakpoint: hc.mobileBreakpoint ?? 1024,
            height: hc.height ?? 64,
            ctaButtons: hc.ctaButtons
              ? (hc.ctaButtons as unknown as Prisma.InputJsonValue)
              : undefined,
          },
        });
        headerId = header.id;
      }

      // ---- 17. Menu Items (hierarchical) ----
      if (data.menuItems && headerId) {
        const menuLabelToId: Record<string, string> = {};

        // Flatten the tree into a flat list with parentLabel references.
        // The data can come either as a nested children[] tree or as a flat
        // list with parentLabel strings. We normalise to a flat list.
        const flatItems: ThemeMenuItem[] = [];

        function flattenMenuItems(
          items: ThemeMenuItem[],
          parentLabel?: string
        ) {
          for (const item of items) {
            const flat: ThemeMenuItem = {
              ...item,
              parentLabel: parentLabel || item.parentLabel || undefined,
            };
            flatItems.push(flat);
            if (item.children?.length) {
              flattenMenuItems(item.children, item.label);
            }
          }
        }
        flattenMenuItems(data.menuItems);

        // First pass: create top-level items (no parentLabel)
        for (const item of flatItems) {
          if (item.parentLabel) continue;

          const created = await tx.menuItem.create({
            data: {
              headerId,
              label: item.label,
              url: item.url || null,
              sortOrder: item.sortOrder ?? 0,
              isVisible: item.isVisible ?? true,
              visibleOnMobile: item.visibleOnMobile ?? true,
              isMegaMenu: item.isMegaMenu ?? false,
              megaMenuColumns: item.megaMenuColumns ?? null,
              icon: item.icon || null,
              badge: item.badge || null,
              categoryName: item.categoryName || null,
              categoryIcon: item.categoryIcon || null,
              categoryDesc: item.categoryDesc || null,
            },
          });
          menuLabelToId[item.label] = created.id;
          counts.menuItems++;
        }

        // Second pass: create children (parentLabel matches a top-level item)
        for (const item of flatItems) {
          if (!item.parentLabel) continue;
          const parentId = menuLabelToId[item.parentLabel];
          if (!parentId) continue;
          // Skip if this item's parentLabel is itself a child (handle in third pass)
          const parentItem = flatItems.find(
            (fi) => fi.label === item.parentLabel
          );
          if (parentItem?.parentLabel) continue;

          const created = await tx.menuItem.create({
            data: {
              headerId,
              parentId,
              label: item.label,
              url: item.url || null,
              sortOrder: item.sortOrder ?? 0,
              isVisible: item.isVisible ?? true,
              visibleOnMobile: item.visibleOnMobile ?? true,
              isMegaMenu: item.isMegaMenu ?? false,
              megaMenuColumns: item.megaMenuColumns ?? null,
              icon: item.icon || null,
              badge: item.badge || null,
              categoryName: item.categoryName || null,
              categoryIcon: item.categoryIcon || null,
              categoryDesc: item.categoryDesc || null,
            },
          });
          menuLabelToId[item.label] = created.id;
          counts.menuItems++;
        }

        // Third pass: create grandchildren
        for (const item of flatItems) {
          if (!item.parentLabel) continue;
          const parentItem = flatItems.find(
            (fi) => fi.label === item.parentLabel
          );
          if (!parentItem?.parentLabel) continue; // Already handled in second pass
          const parentId = menuLabelToId[item.parentLabel];
          if (!parentId) continue;

          const created = await tx.menuItem.create({
            data: {
              headerId,
              parentId,
              label: item.label,
              url: item.url || null,
              sortOrder: item.sortOrder ?? 0,
              isVisible: item.isVisible ?? true,
              visibleOnMobile: item.visibleOnMobile ?? true,
              isMegaMenu: item.isMegaMenu ?? false,
              megaMenuColumns: item.megaMenuColumns ?? null,
              icon: item.icon || null,
              badge: item.badge || null,
              categoryName: item.categoryName || null,
              categoryIcon: item.categoryIcon || null,
              categoryDesc: item.categoryDesc || null,
            },
          });
          menuLabelToId[item.label] = created.id;
          counts.menuItems++;
        }
      }

      // ---- 18. Footer Config ----
      let footerId: string | null = null;

      if (data.footerConfig) {
        const fc = data.footerConfig;
        const footer = await tx.footerConfig.create({
          data: {
            name: "Default Footer",
            isActive: true,
            layout: (fc.layout as "MULTI_COLUMN") || "MULTI_COLUMN",
            columns: fc.columns ?? 4,
            bgColor: fc.bgColor || null,
            textColor: fc.textColor || null,
            linkColor: fc.linkColor || null,
            linkHoverColor: fc.linkHoverColor || null,
            headingColor: fc.headingColor || null,
            accentColor: fc.accentColor || null,
            borderColor: fc.borderColor || null,
            presetId: fc.presetId || null,
          },
        });
        footerId = footer.id;
      }

      // ---- 19. Footer Widgets ----
      if (data.footerWidgets && footerId) {
        for (const widget of data.footerWidgets) {
          const createdWidget = await tx.footerWidget.create({
            data: {
              footerId,
              type: widget.type as "BRAND",
              column: widget.column ?? 1,
              sortOrder: widget.sortOrder ?? 0,
              content: widget.content as Prisma.InputJsonValue,
            },
          });

          // For LINKS type widgets, create MenuItem entries
          if (
            widget.type === "LINKS" &&
            widget.content &&
            typeof widget.content === "object"
          ) {
            const links = (widget.content as Record<string, unknown>)
              .links as Array<{
              label: string;
              url: string;
              sortOrder?: number;
            }> | undefined;

            if (Array.isArray(links)) {
              for (let li = 0; li < links.length; li++) {
                const link = links[li];
                await tx.menuItem.create({
                  data: {
                    footerWidgetId: createdWidget.id,
                    label: link.label,
                    url: link.url || null,
                    sortOrder: link.sortOrder ?? li,
                    isVisible: true,
                    visibleOnMobile: true,
                  },
                });
                counts.menuItems++;
              }
            }
          }

          counts.footerWidgets++;
        }
      }

      // ---- 20. Location Fees ----
      if (data.locationFees) {
        for (const fee of data.locationFees) {
          const serviceId = serviceSlugToId[fee.serviceSlug];
          if (!serviceId) continue;

          // Look up location by code - locations are system data, skip if not found
          const location = await tx.location.findUnique({
            where: { code: fee.locationCode },
          });
          if (!location) continue;

          await tx.locationFee.create({
            data: {
              serviceId,
              locationId: location.id,
              feeType: (fee.feeType as "FILING") || "FILING",
              amountUSD: new Prisma.Decimal(fee.amountUSD),
              amountBDT: fee.amountBDT != null
                ? new Prisma.Decimal(fee.amountBDT)
                : null,
              label: fee.label || null,
              isActive: true,
            },
          });
          counts.locationFees++;
        }
      }
    },
    { timeout: 60000 }
  );

  // =============================================
  // REVALIDATION - Bust all cached pages/data
  // =============================================
  revalidatePath("/", "layout");
  revalidateTag("services");
  revalidateTag("pages");

  const duration = Date.now() - startTime;

  return {
    success: true,
    source,
    imported: counts,
    themeId: options?.themeId,
    duration,
  };
}
