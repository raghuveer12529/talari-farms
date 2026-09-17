-- Track who entered a ledger entry, separately from whose money it was.
-- One partner can now record own-pocket spending another partner paid for:
-- "partnerId" keeps the capital claim, "recordedById" says who typed it.
-- Null on existing rows, which were all self-recorded.

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN "recordedById" TEXT;

-- CreateIndex
CREATE INDEX "LedgerEntry_partnerId_idx" ON "LedgerEntry"("partnerId");

-- CreateIndex
CREATE INDEX "LedgerEntry_recordedById_idx" ON "LedgerEntry"("recordedById");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_recordedById_fkey"
  FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
