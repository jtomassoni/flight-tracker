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
            The admin panel needs iOS 12 or later (or a Mac/desktop browser). This device is too
            old to run it — settings cannot be changed from here.
          </p>
          <ul className="admin-unsupported__steps">
            <li>
              <strong>Adjust settings</strong> on your MacBook or any phone/tablet with a newer OS:
              open <code>/admin</code> there, save, then copy the Old iPad Display URL.
            </li>
            <li>
              <strong>View flights on this iPad</strong> using the display endpoint (no admin
              needed if you already have the link):
            </li>
          </ul>
          <p className="admin-unsupported__link">
            <a href="/old-ipad-display">Open /old-ipad-display</a>
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
