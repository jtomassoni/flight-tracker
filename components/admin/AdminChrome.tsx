'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminDisplayToolbar from '@/components/admin/AdminDisplayToolbar';
import AdminNav from '@/components/admin/AdminNav';
import { adminNavItemForPath } from '@/lib/adminNav';

const SETTINGS_ROUTES = new Set(['/admin/themes', '/admin/location', '/admin/filters']);

function isSettingsRoute(pathname: string): boolean {
  return SETTINGS_ROUTES.has(pathname) || pathname === '/admin';
}

type AdminChromeProps = {
  children: React.ReactNode;
};

export default function AdminChrome({ children }: AdminChromeProps) {
  const pathname = usePathname();
  const active = adminNavItemForPath(pathname);
  const showToolbar = isSettingsRoute(pathname);

  return (
    <div className="admin-shell">
      <div className="admin-atmosphere" aria-hidden>
        <div className="admin-atmosphere__scan" />
        <div className="admin-atmosphere__vignette" />
      </div>

      <div className="admin-chrome">
        <header className="admin-command-strip">
          <div className="admin-command-strip__brand">
            <span className="admin-command-strip__beacon" aria-hidden />
            <div className="admin-command-strip__titles">
              <p className="admin-command-strip__kicker admin-mono">SYS·FLIGHT OPS</p>
              <p className="admin-command-strip__title admin-heading">Command Interface</p>
            </div>
          </div>

          <div className="admin-command-strip__status admin-mono">
            <span className="admin-command-strip__route">
              {active ? `${active.code} / ${active.label.toUpperCase()}` : 'STANDBY'}
            </span>
          </div>

          {showToolbar ? (
            <AdminDisplayToolbar />
          ) : (
            <Link href="/display" className="admin-btn admin-btn--launch">
              Launch Display →
            </Link>
          )}
        </header>

        <div className="admin-chrome__frame">
          <AdminNav />
          <main className="admin-chrome__main">{children}</main>
        </div>
      </div>
    </div>
  );
}
