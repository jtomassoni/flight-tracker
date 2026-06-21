'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminDisplayToolbar from '@/components/admin/AdminDisplayToolbar';
import AdminNav from '@/components/admin/AdminNav';

const SETTINGS_ROUTES = new Set(['/admin/themes', '/admin/location', '/admin/filters', '/admin/screen']);

function isSettingsRoute(pathname: string): boolean {
  return SETTINGS_ROUTES.has(pathname) || pathname === '/admin';
}

type AdminChromeProps = {
  children: React.ReactNode;
};

export default function AdminChrome({ children }: AdminChromeProps) {
  const pathname = usePathname();
  const showToolbar = isSettingsRoute(pathname);

  return (
    <div className="admin-shell">
      <div className="admin-chrome">
        <header className="admin-header">
          <Link href="/admin/themes" className="admin-header__brand">
            Flight Tracker
          </Link>

          <div className="admin-header__nav">
            <AdminNav />
          </div>

          <div className="admin-header__actions">
            {showToolbar ? (
              <AdminDisplayToolbar />
            ) : (
              <Link href="/display" className="admin-btn admin-btn--launch">
                Open display
              </Link>
            )}
          </div>
        </header>

        <main className="admin-chrome__main">{children}</main>
      </div>
    </div>
  );
}
