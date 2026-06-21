import type { NormalizedAircraft } from '@/types/aircraft';
import { buildTrackTarget } from '@/lib/callsignMatch';
import type { DisplaySettings } from '@/lib/settings';

export type DisplayHoldState = {
  held: NormalizedAircraft[];
  contextKey: string;
};

export const EMPTY_DISPLAY_HOLD: DisplayHoldState = {
  held: [],
  contextKey: '',
};

/** Scope hold to location + watch target — reset when either changes. */
export function displayHoldContextKey(settings: DisplaySettings): string {
  const track = buildTrackTarget(
    settings.trackAirline ?? '',
    settings.trackFlightNumber ?? ''
  );
  return `${settings.lat.toFixed(4)},${settings.lon.toFixed(4)},${settings.radiusMi},${track?.icaoCallsign ?? ''}`;
}

/**
 * When the live feed is empty, keep showing the last flight until a new one
 * appears in range (next.length > 0 replaces the hold entirely).
 */
export function applyDisplayHold(
  next: NormalizedAircraft[],
  state: DisplayHoldState,
  settings: DisplaySettings
): DisplayHoldState & { displayed: NormalizedAircraft[] } {
  const contextKey = displayHoldContextKey(settings);
  let held = state.contextKey === contextKey ? state.held : [];

  if (next.length > 0) {
    held = next;
    return { displayed: next, held, contextKey };
  }

  if (held.length > 0) {
    return { displayed: held, held, contextKey };
  }

  return { displayed: [], held: [], contextKey };
}
