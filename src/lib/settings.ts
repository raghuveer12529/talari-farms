import { prisma } from '@/lib/prisma';

/** Fetch the company settings singleton, creating defaults if absent. */
export async function getCompanySettings() {
  return prisma.companySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default', companyName: 'Talari Farms' },
  });
}

export type CompanySettingsData = Awaited<ReturnType<typeof getCompanySettings>>;
