-- CreateEnum
CREATE TYPE "PluginStatus" AS ENUM ('INSTALLED', 'ACTIVE', 'DISABLED', 'ERROR');

-- CreateTable
CREATE TABLE "Plugin" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "author" TEXT,
    "authorUrl" TEXT,
    "icon" TEXT,
    "status" "PluginStatus" NOT NULL DEFAULT 'INSTALLED',
    "manifest" JSONB,
    "adminMenuLabel" TEXT,
    "adminMenuIcon" TEXT,
    "adminMenuPosition" INTEGER,
    "hasAdminPages" BOOLEAN NOT NULL DEFAULT false,
    "hasPublicPages" BOOLEAN NOT NULL DEFAULT false,
    "hasWidgets" BOOLEAN NOT NULL DEFAULT false,
    "hasApiRoutes" BOOLEAN NOT NULL DEFAULT false,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installedBy" TEXT,
    "lastActivatedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "errorAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginSetting" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PluginSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PluginMenuItem" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "icon" TEXT,
    "parentLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PluginMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_slug_key" ON "Plugin"("slug");

-- CreateIndex
CREATE INDEX "Plugin_slug_idx" ON "Plugin"("slug");

-- CreateIndex
CREATE INDEX "Plugin_status_idx" ON "Plugin"("status");

-- CreateIndex
CREATE INDEX "PluginSetting_pluginId_idx" ON "PluginSetting"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "PluginSetting_pluginId_key_key" ON "PluginSetting"("pluginId", "key");

-- CreateIndex
CREATE INDEX "PluginMenuItem_pluginId_idx" ON "PluginMenuItem"("pluginId");

-- CreateIndex
CREATE INDEX "PluginMenuItem_isActive_idx" ON "PluginMenuItem"("isActive");

-- AddForeignKey
ALTER TABLE "PluginSetting" ADD CONSTRAINT "PluginSetting_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PluginMenuItem" ADD CONSTRAINT "PluginMenuItem_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
