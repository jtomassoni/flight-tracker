import { ADMIN_BROWSER_GUARD_SCRIPT } from '@/lib/adminBrowserGuardScript';
import AdminPageShell from '@/components/admin/AdminPageShell';
import './admin-unsupported.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div id="admin-unsupported" className="admin-unsupported" style={{ display: 'none' }}>
        <div className="admin-unsupported__card">
          <p className="admin-unsupported__eyebrow">Flight Command</p>
          <h1 className="admin-unsupported__title">Admin not supported here</h1>
          <p className="admin-unsupported__detected">
            Detected: <strong id="admin-unsupported-env">this browser</strong>
          </p>
          <p className="admin-unsupported__body">
            The admin panel needs iOS 12 or later (or a Mac/desktop browser). Configure settings on
            your Mac, then open <code>/display</code> on this iPad — it auto-redirects to the LED
            flight board.
          </p>
          <p className="admin-unsupported__link">
            <a href="/display">Open /display</a>
          </p>
        </div>
      </div>

      <div id="admin-app">
        <AdminPageShell>{children}</AdminPageShell>
      </div>

      <script dangerouslySetInnerHTML={{ __html: ADMIN_BROWSER_GUARD_SCRIPT }} />
    </>
  );
}
