import { PageHeader } from '@/components/erp/PageHeader';
import { getCompanySettings } from '@/lib/settings';
import { SettingsForm } from './SettingsForm';

export const metadata = { title: 'Settings | Talari Farms ERP' };

export default async function SettingsPage() {
  const settings = await getCompanySettings();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Company profile, tax, bank, and document settings." />
      <SettingsForm settings={settings} />
    </div>
  );
}
