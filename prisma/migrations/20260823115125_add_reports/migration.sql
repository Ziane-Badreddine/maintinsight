-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportTrigger" AS ENUM ('MANUAL', 'AUTO');

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "trigger" "ReportTrigger" NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'today',
    "sections" JSONB NOT NULL DEFAULT '["summary","charts","plants","criticalEquipment","inspections","measurements","alerts"]',
    "blobUrl" TEXT,
    "error" TEXT,
    "generatedById" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_cityId_date_idx" ON "reports"("cityId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "reports_cityId_date_key" ON "reports"("cityId", "date");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
