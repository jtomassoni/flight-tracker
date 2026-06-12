import type { AirlineBrand } from '@/lib/airlines';
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
  return `${origin ?? '???'}→${dest ?? '???'}`;
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
  if (groundSpeedKt == null) return '--- mph';
  const mph = Math.round(groundSpeedKt * 1.15078);
  return `${mph} mph`;
}

export type LedTelemetryField = {
  value: string;
};

export function ledTelemetryFields(ac: NormalizedAircraft): LedTelemetryField[] {
  return [
    { value: formatLedAircraftType(ac) },
    { value: formatLedSpeedMph(ac.groundSpeedKt) },
  ];
}
