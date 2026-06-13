'use client';

import { useEffect } from 'react';

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
};

/**
 * Keeps the screen awake using the Screen Wake Lock API while `enabled`.
 *
 * The lock is automatically released by the browser whenever the tab is hidden
 * (e.g. the iPad is locked or another app comes forward), so we re-acquire it on
 * every `visibilitychange` back to visible. Supported in iOS Safari 16.4+.
 */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === 'undefined') return;

    const nav = navigator as WakeLockNavigator;
    if (!nav.wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const request = async () => {
      if (sentinel || document.visibilityState !== 'visible') return;
      try {
        const lock = await nav.wakeLock!.request('screen');
        if (cancelled) {
          void lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener('release', () => {
          sentinel = null;
        });
      } catch {
        // Request can reject if the document isn't active yet; visibility/interval retries cover it.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void request();
    };

    void request();
    document.addEventListener('visibilitychange', handleVisibility);
    // Safety net: some iOS releases drop the lock silently; periodically re-check.
    const retry = setInterval(() => void request(), 30_000);

    return () => {
      cancelled = true;
      clearInterval(retry);
      document.removeEventListener('visibilitychange', handleVisibility);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [enabled]);
}
