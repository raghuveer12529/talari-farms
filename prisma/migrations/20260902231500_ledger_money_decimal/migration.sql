-- Move partner-ledger money off binary floats onto Decimal(12,2), matching the
-- ERP tables (see 20260630234952_money_decimal_and_audit). Existing double
-- precision values are rounded to paise by the implicit cast.

-- AlterTable
ALTER TABLE "LedgerEntry" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "LoanRepayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
