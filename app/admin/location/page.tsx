import type { Metadata } from 'next';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';

export const metadata: Metadata = {
  title: 'Location',
};

export default function AdminLocationPage() {
  return <AdminSettingsSection section="location" />;
}
