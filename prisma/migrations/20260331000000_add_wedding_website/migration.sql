-- CreateTable
CREATE TABLE IF NOT EXISTS "WeddingWebsite" (
    "id"           TEXT         NOT NULL,
    "projectId"    TEXT         NOT NULL,
    "slug"         TEXT         NOT NULL,
    "published"    BOOLEAN      NOT NULL DEFAULT false,
    "theme"        TEXT         NOT NULL DEFAULT 'modern',
    "primaryColor" TEXT         NOT NULL DEFAULT '#7c3aed',
    "accentColor"  TEXT         NOT NULL DEFAULT '#ede9fe',
    "fontFamily"   TEXT         NOT NULL DEFAULT 'Inter',
    "blocks"       JSONB        NOT NULL DEFAULT '[]',
    "customDomain" TEXT,
    "password"     TEXT,
    "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "WeddingWebsite_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WeddingWebsite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WeddingProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingWebsite_projectId_key" ON "WeddingWebsite"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "WeddingWebsite_slug_key" ON "WeddingWebsite"("slug");
CREATE INDEX IF NOT EXISTS "WeddingWebsite_projectId_idx" ON "WeddingWebsite"("projectId");
CREATE INDEX IF NOT EXISTS "WeddingWebsite_slug_idx" ON "WeddingWebsite"("slug");
