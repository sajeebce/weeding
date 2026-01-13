-- CreateEnum
CREATE TYPE "PageTemplateType" AS ENUM ('HOME', 'SERVICE_DETAILS', 'SERVICES_LIST', 'BLOG_POST', 'BLOG_LIST', 'ABOUT', 'CONTACT', 'CHECKOUT', 'CUSTOM');

-- AlterTable
ALTER TABLE "LandingPage" ADD COLUMN     "isTemplateActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "templateType" "PageTemplateType";

-- CreateIndex
CREATE INDEX "LandingPage_templateType_isTemplateActive_idx" ON "LandingPage"("templateType", "isTemplateActive");
