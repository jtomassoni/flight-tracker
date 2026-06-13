'use client';

import Link from 'next/link';
import { useAdminSettings } from '@/components/admin/AdminSettingsProvider';

export default function AdminDisplayToolbar() {
  const { saved, zipLoading, handleReset, handleSave } = useAdminSettings();

  return (
    <div className="admin-command-strip__actions">
      {saved && (
        <span className="admin-command-strip__saved admin-mono">
          <span className="admin-command-strip__saved-dot" aria-hidden />
          Saved
        </span>
      )}
      <button type="button" onClick={handleReset} className="admin-btn admin-btn--ghost">
        Cancel
      </button>
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={zipLoading}
        className="admin-btn admin-btn--primary"
      >
        Save
      </button>
      <Link href="/display" className="admin-btn admin-btn--launch">
        Launch Display →
      </Link>
    </div>
  );
}
