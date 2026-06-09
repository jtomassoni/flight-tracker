import type { NormalizedAircraft } from '@/types/aircraft';
import { bearingDeg, headingDelta } from './geo';
import type { AltitudeFilter, DisplayMode, DisplaySettings } from './settings';

function passesAltitudeFilter(ac: NormalizedAircraft, filter: AltitudeFilter): boolean {
  const alt = ac.altitudeFt;
  if (filter === 'all' || alt == null) return filter === 'all' || alt != null;

  switch (filter) {
    case 'below10k':
      return alt < 10000;
    case '10k-25k':
      return alt >= 10000 && alt <= 25000;
    case 'above25k':
      return alt > 25000;
    default:
      return true;
  }
}

function passesModeFilter(
  ac: NormalizedAircraft,
  mode: DisplayMode,
  centerLat: number,
  centerLon: number
): boolean {
  if (mode === 'nearby') return true;

  const bearingToCenter = bearingDeg(ac.lat, ac.lon, centerLat, centerLon);
  const heading = ac.headingDeg;
  const vRate = ac.verticalRateFpm ?? 0;
  const alt = ac.altitudeFt ?? 0;

  if (heading == null) {
    return mode === 'overflights' && alt > 18000;
  }

  const alignedToCenter = headingDelta(heading, bearingToCenter) < 45;
  const alignedAway = headingDelta(heading, (bearingToCenter + 180) % 360) < 45;

  switch (mode) {
    case 'den-arrivals':
      return alignedToCenter && vRate < 0 && alt < 25000;
    case 'den-departures':
      return alignedAway && vRate > 0 && alt < 20000;
    case 'overflights':
      return alt > 18000 && Math.abs(vRate) < 300;
    default:
      return true;
  }
}

export function applyClientFilters(
  aircraft: NormalizedAircraft[],
  settings: DisplaySettings
): NormalizedAircraft[] {
  return aircraft.filter((ac) => {
    if (settings.hideNoCallsign && !ac.callsign?.trim()) return false;
    if (!passesAltitudeFilter(ac, settings.altitudeFilter)) return false;
    if (!passesModeFilter(ac, settings.mode, settings.lat, settings.lon)) return false;
    return true;
  });
}
