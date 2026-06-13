import type { AirlineBrand } from '@/lib/airlines';
import { getRegionalOperator } from '@/lib/regionalCarriers';
import { isCategoryBrand } from '@/lib/aircraftCategories';
import { formatAircraftTypeBoard } from '@/lib/aircraftTypes';
import { classifyLedAircraftIcon, type LedAircraftIcon } from '@/lib/ledAircraftIcons';
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
  if (isCategoryBrand(brand.icao)) {
    return ac.registration?.trim() || ac.callsign?.trim() || ac.hex.toUpperCase();
  }
  const raw = ac.flightNumber?.trim() || ac.callsign?.trim().slice(3) || '';
  const digits = raw.replace(/\D/g, '');
  const num = digits || raw || '----';
  return `${brand.iata} ${num}`;
}

/**
 * Regional operator ICAO (e.g. SKW) when a mainline flight is flown by a partner.
 * Empty for direct mainline flights — surfaced as a "- SKW" tag so the board shows
 * who is actually operating the United/Delta/etc. flight number.
 */
export function formatLedOperatorTag(ac: NormalizedAircraft): string {
  return getRegionalOperator(ac.callsign)?.icao ?? '';
}

export function formatLedAircraftType(ac: NormalizedAircraft): string {
  const raw = ac.aircraftType?.trim() || ac.category?.trim();
  return formatAircraftTypeBoard(raw);
}

export function formatLedSpeedMph(groundSpeedKt?: number): string {
  if (groundSpeedKt == null) return '--- mph';
  const mph = Math.round(groundSpeedKt * 1.15078);
  return `${mph} mph`;
}

/**
 * The four axis directions are spelled out — single letters like S read as a 5
 * on round LED diodes. Diagonals stay two-letter so they fit the narrow stats column.
 */
const LED_CARDINALS = ['NORTH', 'NE', 'EAST', 'SE', 'SOUTH', 'SW', 'WEST', 'NW'] as const;

/** 8-point cardinal for the LED stats stack (empty when heading unknown). */
export function formatLedHeading(headingDeg?: number): string {
  if (headingDeg == null || Number.isNaN(headingDeg)) return '';
  const normalized = ((headingDeg % 360) + 360) % 360;
  return LED_CARDINALS[Math.round(normalized / 45) % 8] ?? '';
}

/** Sustained-climb / descent threshold — filters cruise-altitude jitter (fpm). */
const LED_VERTICAL_THRESHOLD = 250;

/**
 * Climb / descent arrow that flags the takeoff & approach phases a glance —
 * a low groundspeed reads as departing when ↑, arriving when ↓. Empty at cruise.
 */
export function formatLedVerticalArrow(verticalRateFpm?: number): string {
  if (verticalRateFpm == null || Number.isNaN(verticalRateFpm)) return '';
  if (verticalRateFpm > LED_VERTICAL_THRESHOLD) return '↑';
  if (verticalRateFpm < -LED_VERTICAL_THRESHOLD) return '↓';
  return '';
}

export type LedTelemetryField = {
  value: string;
  /** Aircraft silhouette to render beside the value (used for the type line). */
  icon?: LedAircraftIcon;
};

export function ledTelemetryFields(ac: NormalizedAircraft): LedTelemetryField[] {
  const fields: LedTelemetryField[] = [
    {
      value: formatLedAircraftType(ac),
      icon: classifyLedAircraftIcon(ac.aircraftType, ac.category),
    },
    { value: formatLedSpeedMph(ac.groundSpeedKt) },
  ];
  const motion = [
    formatLedVerticalArrow(ac.verticalRateFpm),
    formatLedHeading(ac.headingDeg),
  ]
    .filter(Boolean)
    .join(' ');
  if (motion) fields.push({ value: motion });
  return fields;
}
