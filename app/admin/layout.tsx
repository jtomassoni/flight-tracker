import AdminPageShell from '@/components/admin/AdminPageShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPageShell>{children}</AdminPageShell>;
}
