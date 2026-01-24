/*
  Warnings:

  - Added the required column `updatedAt` to the `ServiceFeature` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeatureValueType" AS ENUM ('BOOLEAN', 'TEXT', 'ADDON', 'DASH');

-- CreateEnum
CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FooterLayout" ADD VALUE 'STACKED';
ALTER TYPE "FooterLayout" ADD VALUE 'ASYMMETRIC';
ALTER TYPE "FooterLayout" ADD VALUE 'MEGA_PLUS';
ALTER TYPE "FooterLayout" ADD VALUE 'APP_FOCUSED';
ALTER TYPE "FooterLayout" ADD VALUE 'NEWSLETTER_HERO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FooterWidgetType" ADD VALUE 'APP_DOWNLOAD';
ALTER TYPE "FooterWidgetType" ADD VALUE 'PAYMENT_METHODS';
ALTER TYPE "FooterWidgetType" ADD VALUE 'AWARDS';
ALTER TYPE "FooterWidgetType" ADD VALUE 'MAP';
ALTER TYPE "FooterWidgetType" ADD VALUE 'WORKING_HOURS';
ALTER TYPE "FooterWidgetType" ADD VALUE 'LANGUAGE_SELECT';
ALTER TYPE "FooterWidgetType" ADD VALUE 'THEME_TOGGLE';
ALTER TYPE "FooterWidgetType" ADD VALUE 'FEATURED_PRODUCT';
ALTER TYPE "FooterWidgetType" ADD VALUE 'TESTIMONIAL';
ALTER TYPE "FooterWidgetType" ADD VALUE 'COUNTDOWN';
ALTER TYPE "FooterWidgetType" ADD VALUE 'CTA_BANNER';
ALTER TYPE "FooterWidgetType" ADD VALUE 'BUTTON';

-- AlterTable
ALTER TABLE "FooterConfig" ADD COLUMN     "animationDuration" INTEGER NOT NULL DEFAULT 300,
ADD COLUMN     "bgGradient" JSONB,
ADD COLUMN     "bgImage" TEXT,
ADD COLUMN     "bgImageOverlay" TEXT,
ADD COLUMN     "bgPattern" TEXT,
ADD COLUMN     "bgPatternColor" TEXT,
ADD COLUMN     "bgPatternOpacity" DOUBLE PRECISION DEFAULT 0.1,
ADD COLUMN     "bgType" TEXT NOT NULL DEFAULT 'solid',
ADD COLUMN     "bodyFont" TEXT,
ADD COLUMN     "borderRadius" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bottomBarLayout" TEXT NOT NULL DEFAULT 'split',
ADD COLUMN     "containerStyle" TEXT NOT NULL DEFAULT 'sharp',
ADD COLUMN     "containerWidth" TEXT NOT NULL DEFAULT 'full',
ADD COLUMN     "cornerRadiusBL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cornerRadiusBR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cornerRadiusTL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cornerRadiusTR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "customCSS" TEXT,
ADD COLUMN     "customJS" TEXT,
ADD COLUMN     "dividerColor" TEXT,
ADD COLUMN     "dividerStyle" TEXT NOT NULL DEFAULT 'solid',
ADD COLUMN     "enableAnimations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "entranceAnimation" TEXT,
ADD COLUMN     "headingColor" TEXT,
ADD COLUMN     "headingFont" TEXT,
ADD COLUMN     "headingSize" TEXT NOT NULL DEFAULT 'sm',
ADD COLUMN     "headingStyle" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "headingWeight" TEXT NOT NULL DEFAULT 'semibold',
ADD COLUMN     "linkColor" TEXT,
ADD COLUMN     "linkHoverColor" TEXT,
ADD COLUMN     "linkHoverEffect" TEXT NOT NULL DEFAULT 'color',
ADD COLUMN     "presetId" TEXT,
ADD COLUMN     "responsiveColumns" JSONB,
ADD COLUMN     "sectionOrder" TEXT[] DEFAULT ARRAY['widgets', 'newsletter', 'trust', 'bottom']::TEXT[],
ADD COLUMN     "shadow" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "socialBgStyle" TEXT NOT NULL DEFAULT 'subtle',
ADD COLUMN     "socialColorMode" TEXT NOT NULL DEFAULT 'brand',
ADD COLUMN     "socialHoverEffect" TEXT NOT NULL DEFAULT 'scale',
ADD COLUMN     "socialShape" TEXT NOT NULL DEFAULT 'circle',
ADD COLUMN     "socialSize" TEXT NOT NULL DEFAULT 'md',
ADD COLUMN     "topBorderColor" TEXT,
ADD COLUMN     "topBorderHeight" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "topBorderStyle" TEXT NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE "HeaderConfig" ADD COLUMN     "hoverColor" TEXT,
ALTER COLUMN "logoMaxHeight" SET DEFAULT 56;

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "badgeText" TEXT,
ADD COLUMN     "processingIcon" TEXT,
ADD COLUMN     "processingTime" TEXT,
ADD COLUMN     "processingTimeNote" TEXT;

-- AlterTable
ALTER TABLE "ServiceFeature" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "tooltip" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PackageFeatureMap" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "customValue" TEXT,
    "valueType" "FeatureValueType" NOT NULL DEFAULT 'BOOLEAN',
    "addonPriceUSD" DECIMAL(10,2),
    "addonPriceBDT" DECIMAL(10,2),

    CONSTRAINT "PackageFeatureMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'professional',
    "thumbnail" TEXT,
    "config" JSONB NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "colorPalette" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "NewsletterSubscriberStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "LandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPageBlock" (
    "id" TEXT NOT NULL,
    "landingPageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL,
    "hideOnMobile" BOOLEAN NOT NULL DEFAULT false,
    "hideOnDesktop" BOOLEAN NOT NULL DEFAULT false,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingPageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "thumbnail" TEXT,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageFeatureMap_packageId_idx" ON "PackageFeatureMap"("packageId");

-- CreateIndex
CREATE INDEX "PackageFeatureMap_featureId_idx" ON "PackageFeatureMap"("featureId");

-- CreateIndex
CREATE UNIQUE INDEX "PackageFeatureMap_packageId_featureId_key" ON "PackageFeatureMap"("packageId", "featureId");

-- CreateIndex
CREATE INDEX "FooterPreset_category_idx" ON "FooterPreset"("category");

-- CreateIndex
CREATE INDEX "FooterPreset_isBuiltIn_idx" ON "FooterPreset"("isBuiltIn");

-- CreateIndex
CREATE INDEX "FooterPreset_isPublic_idx" ON "FooterPreset"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_status_idx" ON "NewsletterSubscriber"("status");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_subscribedAt_idx" ON "NewsletterSubscriber"("subscribedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LandingPage_slug_key" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "LandingPage_slug_idx" ON "LandingPage"("slug");

-- CreateIndex
CREATE INDEX "LandingPage_isActive_isDefault_idx" ON "LandingPage"("isActive", "isDefault");

-- CreateIndex
CREATE INDEX "LandingPageBlock_landingPageId_sortOrder_idx" ON "LandingPageBlock"("landingPageId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingPageBlock_landingPageId_isActive_idx" ON "LandingPageBlock"("landingPageId", "isActive");

-- CreateIndex
CREATE INDEX "BlockTemplate_category_idx" ON "BlockTemplate"("category");

-- CreateIndex
CREATE INDEX "BlockTemplate_type_idx" ON "BlockTemplate"("type");

-- AddForeignKey
ALTER TABLE "PackageFeatureMap" ADD CONSTRAINT "PackageFeatureMap_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageFeatureMap" ADD CONSTRAINT "PackageFeatureMap_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "ServiceFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterConfig" ADD CONSTRAINT "FooterConfig_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "FooterPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingPageBlock" ADD CONSTRAINT "LandingPageBlock_landingPageId_fkey" FOREIGN KEY ("landingPageId") REFERENCES "LandingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
