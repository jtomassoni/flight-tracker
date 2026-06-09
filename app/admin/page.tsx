import type { Metadata } from 'next';
import AdminPanel from '@/components/admin/AdminPanel';
import './admin.css';

export const metadata: Metadata = {
  title: 'Command Center',
};

export default function AdminPage() {
  return (
    <div className="admin-shell relative">
      <div className="admin-horizon" aria-hidden />
      <AdminPanel />
    </div>
  );
}
