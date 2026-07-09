-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "landlord_requests_status_idx" ON "landlord_requests"("status");
