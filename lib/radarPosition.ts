import type { NormalizedAircraft } from '@/types/aircraft';
import { bearingDeg } from './geo';

export type RadarBlip = {
  aircraft: NormalizedAircraft;
  x: number;
  y: number;
  bearing: number;
  normalizedDistance: number;
};

/** Map aircraft to x/y on a unit circle for radar display (center = 0.5, 0.5) */
export function toRadarBlips(
  aircraft: NormalizedAircraft[],
  centerLat: number,
  centerLon: number,
  maxRadiusMi: number
): RadarBlip[] {
  return aircraft.map((ac) => {
    const bearing = bearingDeg(centerLat, centerLon, ac.lat, ac.lon);
    const normalizedDistance = Math.min(ac.distanceMi / maxRadiusMi, 1);
    const radius = normalizedDistance * 0.42;
    const rad = ((bearing - 90) * Math.PI) / 180;
    const x = 0.5 + Math.cos(rad) * radius;
    const y = 0.5 + Math.sin(rad) * radius;
    return { aircraft: ac, x, y, bearing, normalizedDistance };
  });
}
