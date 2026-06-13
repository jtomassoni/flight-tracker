import type { Metadata } from 'next';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';

export const metadata: Metadata = {
  title: 'Screen',
};

export default function AdminScreenPage() {
  return <AdminSettingsSection section="screen" />;
}
