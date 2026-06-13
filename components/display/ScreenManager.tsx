'use client';

import { useNightDim } from '@/hooks/useNightDim';
import { useWakeLock } from '@/hooks/useWakeLock';
import type { DisplaySettings } from '@/lib/settings';
import './screen-manager.css';

/**
 * Headless-ish controller for kiosk screen behavior:
 *  - holds a screen wake lock so the iPad doesn't auto-lock, and
 *  - renders a fading black overlay during the configured night-dim window.
 */
export default function ScreenManager({ settings }: { settings: DisplaySettings }) {
  useWakeLock(settings.keepAwake);
  const dimOpacity = useNightDim(settings);

  return <div aria-hidden className="night-dim-overlay" style={{ opacity: dimOpacity }} />;
}
