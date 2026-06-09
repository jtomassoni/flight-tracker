import type { NormalizedAircraft, VerticalTrend } from '@/types/aircraft';

export function formatCallsign(callsign?: string): string {
  if (!callsign) return '—';
  return callsign.trim().toUpperCase();
}

export function getVerticalTrend(verticalRateFpm?: number): VerticalTrend {
  if (verticalRateFpm == null) return 'level';
  if (verticalRateFpm < -200) return 'descending';
  if (verticalRateFpm > 200) return 'climbing';
  return 'level';
}

export function formatAltitude(altitudeFt?: number): string {
  if (altitudeFt == null) return '—';
  return `${Math.round(altitudeFt).toLocaleString()} ft`;
}

export function formatSpeed(groundSpeedKt?: number): string {
  if (groundSpeedKt == null) return '—';
  return `${Math.round(groundSpeedKt)} kt`;
}

export function formatHeading(headingDeg?: number): string {
  if (headingDeg == null) return '—';
  return `${Math.round(headingDeg).toString().padStart(3, '0')}°`;
}

export function formatVerticalRate(verticalRateFpm?: number): string {
  if (verticalRateFpm == null) return '—';
  const sign = verticalRateFpm > 0 ? '+' : '';
  return `${sign}${Math.round(verticalRateFpm)} fpm`;
}

export function formatDistance(distanceMi: number): string {
  return `${distanceMi.toFixed(1)} mi`;
}

/** Unitless values for split-flap boards (labels carry the unit) */
export function formatDistanceFlap(distanceMi: number): string {
  return distanceMi.toFixed(1);
}

export function formatAltitudeFlap(altitudeFt?: number): string {
  if (altitudeFt == null) return '—';
  return String(Math.round(altitudeFt));
}

export function formatSpeedFlap(groundSpeedKt?: number): string {
  if (groundSpeedKt == null) return '—';
  return String(Math.round(groundSpeedKt));
}

export function formatHeadingFlap(headingDeg?: number): string {
  if (headingDeg == null) return '—';
  return Math.round(headingDeg).toString().padStart(3, '0');
}

export function headingToCardinal(headingDeg?: number): string {
  if (headingDeg == null) return '—';
  const dirs = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  return dirs[Math.round(headingDeg / 45) % 8];
}

export function displayIdentifier(ac: NormalizedAircraft): string {
  return formatCallsign(ac.callsign) !== '—'
    ? formatCallsign(ac.callsign)
    : ac.hex.toUpperCase();
}
