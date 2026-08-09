/*
  Warnings:

  - Added the required column `cityId` to the `plants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "plants" ADD COLUMN     "cityId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_code_key" ON "cities"("code");

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
