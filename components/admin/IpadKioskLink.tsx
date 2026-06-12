'use client';

import { useEffect, useState } from 'react';
import { buildKioskUrl } from '@/lib/kioskUrl';
import type { DisplaySettings } from '@/lib/settings';

type IpadKioskLinkProps = {
  settings: DisplaySettings;
};

export default function IpadKioskLink({ settings }: IpadKioskLinkProps) {
  const [copied, setCopied] = useState(false);
  const [kioskUrl, setKioskUrl] = useState('');
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    setKioskUrl(buildKioskUrl(settings, window.location.origin));
    setIsLocalhost(
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    );
  }, [settings]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(kioskUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.getElementById('ipad-kiosk-url') as HTMLInputElement | null;
      input?.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className="admin-panel-card admin-panel-card--kiosk">
      <h2 className="admin-panel-card__title">Old iPad Display</h2>
      <p className="admin-kiosk-hint">
        iPad 4 / iOS 10 uses <code className="admin-mono">/old-ipad-display</code> — a separate
        endpoint with no React. Bookmark this URL on the iPad; settings are embedded in the link
        (they do not sync from this Mac via localStorage).
      </p>

      <div className="admin-kiosk-url-row">
        <input
          id="ipad-kiosk-url"
          readOnly
          value={kioskUrl}
          className="admin-input admin-input--compact admin-mono min-w-0 flex-1 text-[11px]"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={copy}
          className="admin-btn-primary admin-btn--compact shrink-0 rounded-lg px-3 py-1.5 text-xs"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {isLocalhost && (
        <p className="admin-kiosk-localhint">
          Dev server: replace <code className="admin-mono">localhost</code> with your Mac&apos;s LAN
          IP (e.g. <code className="admin-mono">192.168.1.x</code>) so the iPad can reach it.
        </p>
      )}

      <ol className="admin-kiosk-steps">
        <li>Save settings above, then copy this URL.</li>
        <li>On the iPad, paste into Safari or Chrome and open.</li>
        <li>Add to Home Screen for kiosk mode.</li>
      </ol>
    </section>
  );
}
