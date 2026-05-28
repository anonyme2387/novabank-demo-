ALTER TABLE "Transaction" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'autre';
ALTER TABLE "Transaction" ADD COLUMN "reference" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "beneficiaryName" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "beneficiaryIban" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "executionDate" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN "transferMode" TEXT;

UPDATE "Transaction"
SET "reference" = 'NOVA-MIG-' || SUBSTRING(MD5("id") FOR 12)
WHERE "reference" IS NULL;

ALTER TABLE "Transaction" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");
