/*
  Warnings:

  - Added the required column `monthlyRent` to the `rental_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `rental_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "monthlyRent" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE INDEX "rental_requests_tenantId_idx" ON "rental_requests"("tenantId");

-- CreateIndex
CREATE INDEX "rental_requests_propertyId_idx" ON "rental_requests"("propertyId");

-- CreateIndex
CREATE INDEX "rental_requests_status_idx" ON "rental_requests"("status");
