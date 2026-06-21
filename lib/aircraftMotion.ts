import { destinationPointMi } from '@/lib/geo';
import type { NormalizedAircraft } from '@/types/aircraft';

const MIN_SPEED_KT = 8;
const MAX_EXTRAPOLATE_SEC = 90;

export type AircraftMotionSnapshot = {
  lat: number;
  lon: number;
  headingDeg: number;
  groundSpeedKt: number;
  /** Epoch ms when the lat/lon fix was valid. */
  fixTimeMs: number;
};

export function aircraftFixTimeMs(ac: NormalizedAircraft, dataUpdatedAt?: Date | null): number {
  const base = dataUpdatedAt?.getTime() ?? Date.now();
  const ageMs = (ac.seenSecondsAgo ?? 0) * 1000;
  return base - ageMs;
}

export function snapshotFromAircraft(
  ac: NormalizedAircraft,
  dataUpdatedAt?: Date | null
): AircraftMotionSnapshot {
  return {
    lat: ac.lat,
    lon: ac.lon,
    headingDeg: ac.headingDeg ?? 0,
    groundSpeedKt: ac.groundSpeedKt ?? 0,
    fixTimeMs: aircraftFixTimeMs(ac, dataUpdatedAt),
  };
}

/** Advance a fix along heading/speed to the given wall-clock time. */
export function extrapolateAircraftPosition(
  snapshot: AircraftMotionSnapshot,
  nowMs: number = Date.now()
): { lat: number; lon: number } {
  const elapsedSec = Math.min(Math.max(0, (nowMs - snapshot.fixTimeMs) / 1000), MAX_EXTRAPOLATE_SEC);
  if (elapsedSec <= 0 || snapshot.groundSpeedKt < MIN_SPEED_KT) {
    return { lat: snapshot.lat, lon: snapshot.lon };
  }

  const distanceMi = (snapshot.groundSpeedKt * elapsedSec * 1.15078) / 3600;
  return destinationPointMi(snapshot.lat, snapshot.lon, snapshot.headingDeg, distanceMi);
}

export function extrapolateAircraft(
  ac: NormalizedAircraft,
  snapshot: AircraftMotionSnapshot,
  nowMs: number = Date.now()
): NormalizedAircraft {
  const pos = extrapolateAircraftPosition(snapshot, nowMs);
  return { ...ac, lat: pos.lat, lon: pos.lon };
}
