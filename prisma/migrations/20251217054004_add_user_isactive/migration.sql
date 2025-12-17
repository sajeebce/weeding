-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'DATE', 'TEXTAREA', 'SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX', 'CHECKBOX_GROUP', 'FILE_UPLOAD', 'IMAGE_UPLOAD', 'COUNTRY_SELECT', 'STATE_SELECT', 'ADDRESS', 'SIGNATURE', 'RICH_TEXT', 'HEADING', 'PARAGRAPH', 'DIVIDER');

-- CreateEnum
CREATE TYPE "FieldWidth" AS ENUM ('FULL', 'HALF', 'THIRD', 'TWO_THIRD');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('STATIC', 'COUNTRY_LIST', 'STATE_LIST', 'CURRENCY_LIST', 'CUSTOM_LIST', 'API_ENDPOINT');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- CreateEnum
CREATE TYPE "HeaderLayout" AS ENUM ('DEFAULT', 'CENTERED', 'SPLIT', 'MINIMAL', 'MEGA');

-- CreateEnum
CREATE TYPE "LogoPosition" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- CreateEnum
CREATE TYPE "FooterLayout" AS ENUM ('MULTI_COLUMN', 'CENTERED', 'MINIMAL', 'MEGA');

-- CreateEnum
CREATE TYPE "FooterWidgetType" AS ENUM ('BRAND', 'LINKS', 'CONTACT', 'NEWSLETTER', 'SOCIAL', 'TEXT', 'RECENT_POSTS', 'SERVICES', 'STATES', 'CUSTOM_HTML');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'card',
    "brand" TEXT,
    "last4" TEXT NOT NULL,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "cardholderName" TEXT,
    "stripePaymentMethodId" TEXT,
    "stripeCustomerId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastUpdatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceFormTemplate" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceFormTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormTab" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormTab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "tabId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "placeholder" TEXT,
    "helpText" TEXT,
    "order" INTEGER NOT NULL,
    "width" "FieldWidth" NOT NULL DEFAULT 'FULL',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "validation" JSONB,
    "options" JSONB,
    "dataSourceType" "DataSourceType",
    "dataSourceKey" TEXT,
    "dependsOn" TEXT,
    "conditionalLogic" JSONB,
    "accept" TEXT,
    "maxSize" INTEGER,
    "defaultValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemList" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    "isHierarchical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "code" TEXT,
    "icon" TEXT,
    "metadata" JSONB,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomList" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CustomListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmissionFile" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmissionFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeaderConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Header',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "layout" "HeaderLayout" NOT NULL DEFAULT 'DEFAULT',
    "sticky" BOOLEAN NOT NULL DEFAULT true,
    "transparent" BOOLEAN NOT NULL DEFAULT false,
    "topBarEnabled" BOOLEAN NOT NULL DEFAULT false,
    "topBarContent" JSONB,
    "topBarBgColor" TEXT,
    "topBarTextColor" TEXT,
    "logoPosition" "LogoPosition" NOT NULL DEFAULT 'LEFT',
    "logoMaxHeight" INTEGER NOT NULL DEFAULT 40,
    "ctaButtons" JSONB,
    "showAuthButtons" BOOLEAN NOT NULL DEFAULT true,
    "loginText" TEXT NOT NULL DEFAULT 'Sign In',
    "registerText" TEXT NOT NULL DEFAULT 'Get Started',
    "registerUrl" TEXT NOT NULL DEFAULT '/services/llc-formation',
    "searchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mobileBreakpoint" INTEGER NOT NULL DEFAULT 1024,
    "bgColor" TEXT,
    "textColor" TEXT,
    "accentColor" TEXT,
    "borderColor" TEXT,
    "height" INTEGER NOT NULL DEFAULT 64,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeaderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "target" TEXT NOT NULL DEFAULT '_self',
    "icon" TEXT,
    "parentId" TEXT,
    "isMegaMenu" BOOLEAN NOT NULL DEFAULT false,
    "megaMenuColumns" INTEGER DEFAULT 4,
    "megaMenuContent" JSONB,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "visibleOnMobile" BOOLEAN NOT NULL DEFAULT true,
    "requiredRole" TEXT,
    "badge" TEXT,
    "badgeColor" TEXT,
    "categoryName" TEXT,
    "categoryIcon" TEXT,
    "categoryDesc" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "headerId" TEXT,
    "footerWidgetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Footer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "layout" "FooterLayout" NOT NULL DEFAULT 'MULTI_COLUMN',
    "columns" INTEGER NOT NULL DEFAULT 4,
    "newsletterEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsletterTitle" TEXT NOT NULL DEFAULT 'Subscribe to our newsletter',
    "newsletterSubtitle" TEXT,
    "newsletterProvider" TEXT,
    "newsletterFormAction" TEXT,
    "showSocialLinks" BOOLEAN NOT NULL DEFAULT true,
    "socialPosition" TEXT NOT NULL DEFAULT 'brand',
    "showContactInfo" BOOLEAN NOT NULL DEFAULT true,
    "contactPosition" TEXT NOT NULL DEFAULT 'brand',
    "bottomBarEnabled" BOOLEAN NOT NULL DEFAULT true,
    "copyrightText" TEXT,
    "showDisclaimer" BOOLEAN NOT NULL DEFAULT true,
    "disclaimerText" TEXT,
    "bottomLinks" JSONB,
    "showTrustBadges" BOOLEAN NOT NULL DEFAULT false,
    "trustBadges" JSONB,
    "bgColor" TEXT,
    "textColor" TEXT,
    "accentColor" TEXT,
    "borderColor" TEXT,
    "paddingTop" INTEGER NOT NULL DEFAULT 48,
    "paddingBottom" INTEGER NOT NULL DEFAULT 32,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterWidget" (
    "id" TEXT NOT NULL,
    "footerId" TEXT NOT NULL,
    "type" "FooterWidgetType" NOT NULL,
    "title" TEXT,
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB,
    "column" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "customClass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterWidget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permission_key" ON "RolePermission"("role", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_stripePaymentMethodId_key" ON "PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethod_stripePaymentMethodId_idx" ON "PaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalPage_slug_key" ON "LegalPage"("slug");

-- CreateIndex
CREATE INDEX "LegalPage_slug_idx" ON "LegalPage"("slug");

-- CreateIndex
CREATE INDEX "LegalPage_isActive_idx" ON "LegalPage"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceFormTemplate_serviceId_key" ON "ServiceFormTemplate"("serviceId");

-- CreateIndex
CREATE INDEX "FormTab_templateId_order_idx" ON "FormTab"("templateId", "order");

-- CreateIndex
CREATE INDEX "FormField_tabId_order_idx" ON "FormField"("tabId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SystemList_key_key" ON "SystemList"("key");

-- CreateIndex
CREATE INDEX "SystemListItem_listId_parentId_idx" ON "SystemListItem"("listId", "parentId");

-- CreateIndex
CREATE INDEX "SystemListItem_listId_isPopular_idx" ON "SystemListItem"("listId", "isPopular");

-- CreateIndex
CREATE UNIQUE INDEX "SystemListItem_listId_value_key" ON "SystemListItem"("listId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "CustomList_key_key" ON "CustomList"("key");

-- CreateIndex
CREATE INDEX "CustomListItem_listId_order_idx" ON "CustomListItem"("listId", "order");

-- CreateIndex
CREATE INDEX "FormSubmission_orderId_idx" ON "FormSubmission"("orderId");

-- CreateIndex
CREATE INDEX "FormSubmission_templateId_idx" ON "FormSubmission"("templateId");

-- CreateIndex
CREATE INDEX "FormSubmissionFile_submissionId_idx" ON "FormSubmissionFile"("submissionId");

-- CreateIndex
CREATE INDEX "MenuItem_parentId_idx" ON "MenuItem"("parentId");

-- CreateIndex
CREATE INDEX "MenuItem_headerId_idx" ON "MenuItem"("headerId");

-- CreateIndex
CREATE INDEX "MenuItem_footerWidgetId_idx" ON "MenuItem"("footerWidgetId");

-- CreateIndex
CREATE INDEX "MenuItem_sortOrder_idx" ON "MenuItem"("sortOrder");

-- CreateIndex
CREATE INDEX "FooterWidget_footerId_idx" ON "FooterWidget"("footerId");

-- CreateIndex
CREATE INDEX "FooterWidget_column_sortOrder_idx" ON "FooterWidget"("column", "sortOrder");

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceFormTemplate" ADD CONSTRAINT "ServiceFormTemplate_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormTab" ADD CONSTRAINT "FormTab_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ServiceFormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "FormTab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemListItem" ADD CONSTRAINT "SystemListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "SystemList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemListItem" ADD CONSTRAINT "SystemListItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SystemListItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomListItem" ADD CONSTRAINT "CustomListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "CustomList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmissionFile" ADD CONSTRAINT "FormSubmissionFile_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "HeaderConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_footerWidgetId_fkey" FOREIGN KEY ("footerWidgetId") REFERENCES "FooterWidget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterWidget" ADD CONSTRAINT "FooterWidget_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "FooterConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
