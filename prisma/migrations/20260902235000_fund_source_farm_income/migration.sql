-- Add FARM_INCOME as a fund source for expenditure: the farm's own earnings
-- sitting in the bank. LOAN_FUNDS is intentionally left in place so existing
-- entries keep their true source; the application no longer offers it, because
-- a loan is a liability tracked separately, not a spendable pool.

-- AlterEnum
ALTER TYPE "FundSource" ADD VALUE IF NOT EXISTS 'FARM_INCOME';
