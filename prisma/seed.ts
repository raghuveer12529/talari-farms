import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Admin user ──────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email: 'raghu.veer12529@gmail.com' } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@TalariFarms123', 12);
    await prisma.user.create({
      data: {
        name: 'Raghuveer',
        email: 'raghu.veer12529@gmail.com',
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created: raghu.veer12529@gmail.com / Admin@TalariFarms123');
    console.log('IMPORTANT: Change this password after first login via /ledger/admin');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  // ── Company settings (singleton) ────────────────────────────
  await prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Talari Farms',
      address: 'Bukkapur Village, Telangana - 509152, India',
      gstin: '36AAZFT3406A1Z5',
      stateCode: '36', // Telangana
      email: 'raghuveer@talarifarms.co.in',
      phone: '+91 92996 59344',
      bankName: 'IndusInd Bank',
      bankAccountName: 'TALARI FARMS',
      bankAccountNo: '259299659344',
      bankIfsc: 'INDB0001091',
      invoicePrefix: 'TF',
      quotationPrefix: 'QT',
      defaultTerms:
        '1. Goods once sold will not be taken back.\n2. Payment due within 30 days.\n3. Subject to Telangana jurisdiction.',
    },
  });
  console.log('Company settings seeded.');

  // ── Products ────────────────────────────────────────────────
  const products = [
    {
      sku: 'TF-GAC-FRESH',
      hsnCode: '0810',
      name: 'Fresh Gac Fruit',
      category: 'Fresh Produce',
      unit: 'kg',
      gstRate: 0,
      price: 250,
      costPrice: 120,
      storageConditions: 'Cool, dry place. Refrigerate after ripening.',
      countryOfOrigin: 'India',
      lowStockThreshold: 50,
    },
    {
      sku: 'TF-GAC-POWDER',
      hsnCode: '1106',
      name: 'Solar-Dried Gac Fruit Powder',
      category: 'Processed / Powder',
      unit: 'kg',
      gstRate: 5,
      price: 3500,
      costPrice: 1800,
      storageConditions: 'Store in airtight container away from sunlight.',
      countryOfOrigin: 'India',
      lowStockThreshold: 20,
    },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }
  console.log('Products seeded.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
