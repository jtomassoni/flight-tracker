import type { NormalizedAircraft } from '@/types/aircraft';
import { isAirborne } from '@/lib/aircraftUtils';
import { buildTrackTarget, findTrackedAircraft } from '@/lib/callsignMatch';
import type { DisplaySettings } from '@/lib/settings';

export function clearTrackWatch(settings: DisplaySettings): DisplaySettings {
  return {
    ...settings,
    trackAirline: '',
    trackFlightNumber: '',
  };
}

export type TrackWatchPollResult = {
  settings: DisplaySettings;
  wasAirborne: boolean;
  cleared: boolean;
};

/**
 * After a watched flight has been seen airborne, clear the watch once it
 * appears on the ground (landed). Pre-departure ground traffic is ignored.
 */
export function resolveTrackWatchAfterPoll(
  aircraft: NormalizedAircraft[],
  settings: DisplaySettings,
  wasAirborne: boolean
): TrackWatchPollResult {
  const target = buildTrackTarget(
    settings.trackAirline ?? '',
    settings.trackFlightNumber ?? ''
  );
  if (!target) {
    return { settings, wasAirborne: false, cleared: false };
  }

  const tracked = findTrackedAircraft(aircraft, target);
  if (tracked && isAirborne(tracked)) {
    return { settings, wasAirborne: true, cleared: false };
  }

  if (tracked && !isAirborne(tracked) && wasAirborne) {
    return {
      settings: clearTrackWatch(settings),
      wasAirborne: false,
      cleared: true,
    };
  }

  return { settings, wasAirborne, cleared: false };
}

export function trackWatchKey(settings: DisplaySettings): string {
  const target = buildTrackTarget(
    settings.trackAirline ?? '',
    settings.trackFlightNumber ?? ''
  );
  return target?.icaoCallsign ?? '';
}
