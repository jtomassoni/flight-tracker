import type { DisplaySettings } from './settings';

/** Canonical path for the iOS 10 iPad 4 display (plain HTML, no React). */
export const OLD_IPAD_DISPLAY_PATH = '/old-ipad-display';

/** Query string for the old-iPad display — settings travel in the URL (not localStorage). */
export function buildKioskQuery(settings: DisplaySettings): string {
  const params = new URLSearchParams();
  params.set('lat', String(settings.lat));
  params.set('lon', String(settings.lon));
  params.set('radiusMi', String(settings.radiusMi));
  params.set('max', String(Math.min(settings.maxAircraft, 12)));
  params.set('refresh', String(Math.max(60, settings.refreshIntervalSec)));
  params.set('altitude', settings.altitudeFilter);
  params.set('mode', settings.mode);
  if (settings.hideNoCallsign) params.set('hideNoCallsign', '1');
  if (settings.zipCode) params.set('zip', settings.zipCode);
  return params.toString();
}

export function buildKioskPath(settings: DisplaySettings): string {
  return `${OLD_IPAD_DISPLAY_PATH}?${buildKioskQuery(settings)}`;
}

/** @deprecated Use buildKioskPath — /kiosk redirects to /old-ipad-display */
export const LEGACY_KIOSK_ALIAS = '/kiosk';

export function buildKioskUrl(settings: DisplaySettings, origin: string): string {
  return `${origin.replace(/\/$/, '')}${buildKioskPath(settings)}`;
}
