import type { Metadata } from 'next';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';

export const metadata: Metadata = {
  title: 'Themes',
};

export default function AdminThemesPage() {
  return <AdminSettingsSection section="themes" />;
}
