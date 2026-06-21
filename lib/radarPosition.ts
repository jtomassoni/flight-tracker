import type { NormalizedAircraft } from '@/types/aircraft';
import { bearingDeg } from './geo';

export type RadarBlip = {
  aircraft: NormalizedAircraft;
  x: number;
  y: number;
  bearing: number;
  normalizedDistance: number;
};

/** SVG sweep arm length in viewBox units (center at 50,50). */
export const RADAR_SWEEP_ARM_LENGTH = 42;

/** Bearing (° clockwise from north) where the CSS sweep arm starts at 0° rotation. */
export const RADAR_SWEEP_START_BEARING = bearingFromPlaneVector(RADAR_SWEEP_ARM_LENGTH, -20);

function bearingFromPlaneVector(dx: number, dy: number): number {
  return ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
}

export function radarUnitPosition(
  bearing: number,
  normalizedDistance: number
): { x: number; y: number } {
  const radius = normalizedDistance * 0.42;
  const rad = ((bearing - 90) * Math.PI) / 180;
  return {
    x: 0.5 + Math.cos(rad) * radius,
    y: 0.5 + Math.sin(rad) * radius,
  };
}

/** Sweep bearing at elapsed seconds into the animation (clockwise from north). */
export function sweepBearingAt(elapsedSec: number, durationSec: number): number {
  const revProgress =
    (((elapsedSec % durationSec) + durationSec) % durationSec) / durationSec;
  return (RADAR_SWEEP_START_BEARING + revProgress * 360) % 360;
}

/** True when the sweep advanced from prevDeg to currDeg and crossed targetDeg. */
export function hasSweepCrossedBearing(
  prevDeg: number,
  currDeg: number,
  targetDeg: number
): boolean {
  const norm = (a: number) => ((a % 360) + 360) % 360;
  const p = norm(prevDeg);
  const c = norm(currDeg);
  const t = norm(targetDeg);
  if (c >= p) return p <= t && t <= c;
  return t >= p || t <= c;
}

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
    const { x, y } = radarUnitPosition(bearing, normalizedDistance);
    return { aircraft: ac, x, y, bearing, normalizedDistance };
  });
}
