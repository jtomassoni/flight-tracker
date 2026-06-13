import type { Metadata } from 'next';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';

export const metadata: Metadata = {
  title: 'Filters',
};

export default function AdminFiltersPage() {
  return <AdminSettingsSection section="filters" />;
}
