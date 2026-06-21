import type { Metadata } from 'next';
import AdminSettingsSection from '@/components/admin/AdminSettingsSection';

export const metadata: Metadata = {
  title: 'Watch',
};

export default function AdminWatchPage() {
  return <AdminSettingsSection section="watch" />;
}
