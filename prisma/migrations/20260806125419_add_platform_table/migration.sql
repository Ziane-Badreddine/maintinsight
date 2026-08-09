-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('GOOD', 'ACCEPTABLE', 'ALERT', 'ALARM', 'STOPPED', 'NOT_MONITORED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('DRAFT', 'COMPLETED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('VIBRATION', 'TEMPERATURE', 'ULTRASOUND', 'PRESSURE', 'SPEED', 'CURRENT', 'VOLTAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentScope" AS ENUM ('ENTITY', 'SITE');

-- CreateTable
CREATE TABLE "plants" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "plantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" "EquipmentScope" NOT NULL DEFAULT 'ENTITY',
    "workshopId" INTEGER NOT NULL,
    "typeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" SERIAL NOT NULL,
    "reference" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'DRAFT',
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "comment" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_equipments" (
    "id" SERIAL NOT NULL,
    "inspectionId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "status" "EquipmentStatus" NOT NULL,
    "diagnosis" TEXT,
    "recommendation" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" SERIAL NOT NULL,
    "inspectionEquipmentId" INTEGER NOT NULL,
    "type" "MeasurementType" NOT NULL,
    "point" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plants_code_key" ON "plants"("code");

-- CreateIndex
CREATE INDEX "workshops_plantId_idx" ON "workshops"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "workshops_plantId_name_key" ON "workshops"("plantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_types_name_key" ON "equipment_types"("name");

-- CreateIndex
CREATE INDEX "equipments_workshopId_idx" ON "equipments"("workshopId");

-- CreateIndex
CREATE INDEX "equipments_typeId_idx" ON "equipments"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_workshopId_name_key" ON "equipments"("workshopId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "inspections_reference_key" ON "inspections"("reference");

-- CreateIndex
CREATE INDEX "inspections_inspectionDate_idx" ON "inspections"("inspectionDate");

-- CreateIndex
CREATE INDEX "inspections_performedById_idx" ON "inspections"("performedById");

-- CreateIndex
CREATE INDEX "inspection_equipments_equipmentId_idx" ON "inspection_equipments"("equipmentId");

-- CreateIndex
CREATE INDEX "inspection_equipments_status_idx" ON "inspection_equipments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_equipments_inspectionId_equipmentId_key" ON "inspection_equipments"("inspectionId", "equipmentId");

-- CreateIndex
CREATE INDEX "measurements_inspectionEquipmentId_idx" ON "measurements"("inspectionEquipmentId");

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "equipment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_equipments" ADD CONSTRAINT "inspection_equipments_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_equipments" ADD CONSTRAINT "inspection_equipments_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_inspectionEquipmentId_fkey" FOREIGN KEY ("inspectionEquipmentId") REFERENCES "inspection_equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
