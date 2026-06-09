import type { AirlineBrand } from '@/lib/airlines';
import { ledCharCellW } from '@/lib/ledFont';
import type { NormalizedAircraft } from '@/types/aircraft';

/** Common route pairs for LED display when live route data is unavailable */
const ROUTE_PAIRS = [
  'ORD-LAX',
  'DEN-PHX',
  'ATL-MIA',
  'JFK-SFO',
  'SEA-LAS',
  'DFW-ORD',
  'BOS-DCA',
  'LAX-JFK',
  'DEN-LAX',
  'PHX-DEN',
  'SFO-SEA',
  'IAH-ORD',
  'MSP-ATL',
  'CLT-BOS',
  'MCO-EWR',
  'OAK-SEA',
] as const;

export function ledRouteLabel(ac: NormalizedAircraft): string {
  const hash = ac.hex.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return ROUTE_PAIRS[hash % ROUTE_PAIRS.length];
}

export function formatLedRouteHero(route: string): string {
  const [origin, dest] = route.split('-');
  return `${origin ?? '???'}->${dest ?? '???'}`;
}

/** Pad origin/arrow/dest so the route line spans the LED column (departure-board style). */
export function formatLedRouteHeroSpread(routeHero: string, maxDots: number): string {
  const [origin, dest] = routeHero.split('->');
  const o = (origin ?? '???').trim().toUpperCase();
  const d = (dest ?? '???').trim().toUpperCase();
  const arrow = '->';
  const minChars = o.length + arrow.length + d.length;
  const cell = ledCharCellW();
  const maxChars = Math.max(minChars, Math.floor((maxDots + 1) / cell));
  const gap = maxChars - minChars;
  const gapLeft = Math.floor(gap / 2);
  const gapRight = gap - gapLeft;
  return `${o}${' '.repeat(gapLeft)}${arrow}${' '.repeat(gapRight)}${d}`;
}

/** Stable in-flight progress when live route data is unavailable. */
export function formatLedRouteProgress(ac: NormalizedAircraft): string {
  const seed = ac.hex.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const pct = 12 + (seed % 78);
  return `${pct}%`;
}

export function formatLedFlightId(ac: NormalizedAircraft, brand: AirlineBrand): string {
  const raw = ac.flightNumber?.trim() || ac.callsign?.trim().slice(3) || '';
  const digits = raw.replace(/\D/g, '');
  const num = digits || raw || '----';
  return `${brand.iata} ${num}`;
}

export function formatLedAircraftType(ac: NormalizedAircraft): string {
  const raw = ac.aircraftType?.trim() || ac.category?.trim();
  if (!raw) return 'Unknown';
  return raw.replace(/^Boeing\s+/i, 'B').replace(/^Airbus\s+/i, 'A');
}

export function formatLedSpeedMph(groundSpeedKt?: number): string {
  if (groundSpeedKt == null) return '--- MPH';
  return `${Math.round(groundSpeedKt * 1.15078)} MPH`;
}

export type LedTelemetryField = {
  label: string;
  value: string;
};

export function ledTelemetryFields(ac: NormalizedAircraft): LedTelemetryField[] {
  return [
    { label: 'TRIP', value: formatLedRouteProgress(ac) },
    { label: 'SPD', value: formatLedSpeedMph(ac.groundSpeedKt) },
    { label: 'TYPE', value: formatLedAircraftType(ac) },
  ];
}
