import type { Metadata } from 'next';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function AdminSettingsPage() {
  return <AdminSettingsSection section="settings" />;
}
