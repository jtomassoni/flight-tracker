const LED_DOT_EDITS_STORAGE_KEY = 'flight-tracker-led-dot-edits-v1';

export type LedLogoDotOverrides = Record<string, string>;

function readStoredDotEdits(): Record<string, LedLogoDotOverrides> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LED_DOT_EDITS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LedLogoDotOverrides>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getStoredLedLogoDotOverrides(icao: string): LedLogoDotOverrides | null {
  const key = icao.trim().toUpperCase();
  const stored = readStoredDotEdits()[key];
  if (!stored || typeof stored !== 'object') return null;
  return stored;
}

export function storeLedLogoDotOverrides(icao: string, overrides: LedLogoDotOverrides): void {
  if (typeof window === 'undefined') return;
  const key = icao.trim().toUpperCase();
  const all = readStoredDotEdits();
  all[key] = { ...overrides };
  try {
    localStorage.setItem(LED_DOT_EDITS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage full - ignore */
  }
}

export function clearStoredLedLogoDotOverrides(icao: string): void {
  if (typeof window === 'undefined') return;
  const key = icao.trim().toUpperCase();
  const all = readStoredDotEdits();
  if (!(key in all)) return;
  delete all[key];
  try {
    localStorage.setItem(LED_DOT_EDITS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function resolveLedLogoDotOverrides(icao: string): LedLogoDotOverrides | undefined {
  return getStoredLedLogoDotOverrides(icao) ?? undefined;
}
