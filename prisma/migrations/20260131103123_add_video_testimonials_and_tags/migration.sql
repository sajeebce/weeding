-- CreateEnum
CREATE TYPE "TestimonialType" AS ENUM ('PHOTO', 'VIDEO');

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "type" "TestimonialType" NOT NULL DEFAULT 'PHOTO',
ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "Testimonial_type_idx" ON "Testimonial"("type");
