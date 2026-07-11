/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentIntentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentIntentId_key" ON "payments"("paymentIntentId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");
