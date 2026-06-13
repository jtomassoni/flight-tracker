/** Parse an "HH:MM" 24h string into minutes-since-midnight, or null if invalid. */
export function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Whether `nowMin` falls inside the [startMin, endMin) window.
 * Handles windows that wrap past midnight (e.g. 22:00 → 06:00).
 */
export function isWithinDimWindow(nowMin: number, startMin: number, endMin: number): boolean {
  if (startMin === endMin) return false;
  if (startMin < endMin) return nowMin >= startMin && nowMin < endMin;
  return nowMin >= startMin || nowMin < endMin;
}

/**
 * Resolve the active dim opacity (0–1) for a given moment based on the settings.
 * Returns 0 when dimming is disabled, misconfigured, or outside the window.
 */
export function resolveDimOpacity(
  {
    enabled,
    start,
    end,
    level,
  }: { enabled: boolean; start: string; end: string; level: number },
  now: Date = new Date()
): number {
  if (!enabled) return 0;
  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);
  if (startMin === null || endMin === null) return 0;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (!isWithinDimWindow(nowMin, startMin, endMin)) return 0;
  return Math.min(0.95, Math.max(0, level / 100));
}
