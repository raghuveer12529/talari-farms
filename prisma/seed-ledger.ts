import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });
  if (!admin) throw new Error('No admin user found — run the main seed first.');

  // ── Partners (make it a 3-equal-partner farm) ───────────────
  const partnerDefs = [
    { name: 'Suresh Talari', email: 'suresh@talarifarms.co.in' },
    { name: 'Mahesh Talari', email: 'mahesh@talarifarms.co.in' },
  ];
  const passwordHash = await bcrypt.hash('Partner@123', 12);
  for (const p of partnerDefs) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { name: p.name, email: p.email, passwordHash, role: 'PARTNER' },
    });
  }
  const partners = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  console.log(`Partners: ${partners.map((p) => p.name).join(', ')}`);

  // Idempotency: bail if sample ledger data already present.
  const existing = await prisma.ledgerEntry.findFirst({ where: { notes: 'Sample data' } });
  if (existing) {
    console.log('Sample ledger entries already exist — skipping.');
    return;
  }

  const P = (i: number) => partners[i % partners.length].id;
  const today = new Date();
  const m = (back: number, day = 10) => new Date(today.getFullYear(), today.getMonth() - back, day);

  // ── Ledger entries: income + expenditure ────────────────────
  type Entry = {
    type: 'INCOME' | 'EXPENDITURE';
    amount: number;
    category: string;
    source?: 'OWN_POCKET' | 'LOAN_FUNDS';
    partner: number;
    back: number;
  };

  const entries: Entry[] = [
    // Income
    { type: 'INCOME', amount: 85000, category: 'POWDER_SALES', partner: 0, back: 5 },
    { type: 'INCOME', amount: 42000, category: 'FRUIT_SALES', partner: 1, back: 4 },
    { type: 'INCOME', amount: 18000, category: 'JUICE_SALES', partner: 2, back: 4 },
    { type: 'INCOME', amount: 96000, category: 'POWDER_SALES', partner: 0, back: 3 },
    { type: 'INCOME', amount: 55000, category: 'FRUIT_SALES', partner: 1, back: 2 },
    { type: 'INCOME', amount: 30000, category: 'OIL_SALES', partner: 2, back: 1 },
    { type: 'INCOME', amount: 120000, category: 'POWDER_SALES', partner: 0, back: 0 },
    // Expenditure
    { type: 'EXPENDITURE', amount: 250000, category: 'SETUP', source: 'OWN_POCKET', partner: 0, back: 5 },
    { type: 'EXPENDITURE', amount: 35000, category: 'FERTILIZER', source: 'LOAN_FUNDS', partner: 1, back: 5 },
    { type: 'EXPENDITURE', amount: 28000, category: 'LABOR', source: 'OWN_POCKET', partner: 1, back: 4 },
    { type: 'EXPENDITURE', amount: 60000, category: 'EQUIPMENT', source: 'LOAN_FUNDS', partner: 2, back: 3 },
    { type: 'EXPENDITURE', amount: 30000, category: 'LABOR', source: 'OWN_POCKET', partner: 2, back: 3 },
    { type: 'EXPENDITURE', amount: 12000, category: 'MAINTENANCE', source: 'OWN_POCKET', partner: 0, back: 2 },
    { type: 'EXPENDITURE', amount: 8000, category: 'UTILITIES', source: 'OWN_POCKET', partner: 1, back: 1 },
    { type: 'EXPENDITURE', amount: 22000, category: 'FERTILIZER', source: 'LOAN_FUNDS', partner: 0, back: 1 },
    { type: 'EXPENDITURE', amount: 32000, category: 'LABOR', source: 'OWN_POCKET', partner: 2, back: 0 },
  ];

  for (const e of entries) {
    await prisma.ledgerEntry.create({
      data: {
        type: e.type,
        amount: e.amount,
        category: e.category,
        date: m(e.back),
        source: e.type === 'EXPENDITURE' ? e.source ?? 'OWN_POCKET' : null,
        notes: 'Sample data',
        partnerId: P(e.partner),
      },
    });
  }
  console.log(`Created ${entries.length} ledger entries.`);

  // ── Loans + repayments ──────────────────────────────────────
  const loanA = await prisma.loan.create({
    data: {
      amount: 300000,
      source: 'IndusInd Bank',
      description: 'Farm development loan',
      date: m(5, 5),
      notes: 'Sample data',
    },
  });
  await prisma.loanRepayment.createMany({
    data: [
      { loanId: loanA.id, amount: 50000, date: m(3, 5), notes: 'Sample data', paidById: P(0) },
      { loanId: loanA.id, amount: 50000, date: m(1, 5), notes: 'Sample data', paidById: P(1) },
    ],
  });

  const loanB = await prisma.loan.create({
    data: {
      amount: 100000,
      source: 'Ramesh Gupta (Personal)',
      description: 'Short-term working capital',
      date: m(4, 8),
      notes: 'Sample data',
    },
  });
  await prisma.loanRepayment.create({
    data: { loanId: loanB.id, amount: 40000, date: m(2, 8), notes: 'Sample data', paidById: P(2) },
  });

  console.log('Created 2 loans with repayments. Outstanding ≈ ₹2,60,000');
  console.log('\nDone. Partner logins (password: Partner@123):');
  partnerDefs.forEach((p) => console.log(`  ${p.email}`));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
