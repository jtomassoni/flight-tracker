import type { AirlineBrand } from '@/lib/airlines';
import { hasLedAirlineMark } from '@/lib/ledAirlineMarks';
import { getRegionalOperator } from '@/lib/regionalCarriers';
import { isCategoryBrand } from '@/lib/aircraftCategories';
import { formatAircraftTypeBoard } from '@/lib/aircraftTypes';
import { distanceMi } from '@/lib/geo';
import { getFiledRoute, getValidatedRoute } from '@/lib/routePlausibility';
import type { NormalizedAircraft } from '@/types/aircraft';

/** Short airport code for the LED hero, preferring IATA (3-letter) over ICAO. */
function airportCode(iata?: string, icao?: string): string {
  return (iata?.trim() || icao?.trim() || '').toUpperCase();
}

/**
 * Real "ORIGIN-DEST" route label from resolved route data. Returns an empty
 * string when the flight's route is unknown — we never invent a route.
 */
export function ledRouteLabel(ac: NormalizedAircraft): string {
  const route = getFiledRoute(ac);
  if (!route) return '';
  const origin = airportCode(route.originIata, route.originIcao);
  const dest = airportCode(route.destIata, route.destIcao);
  if (!origin && !dest) return '';
  return `${origin}-${dest}`;
}

/** Format an "ORIGIN-DEST" label as the LED hero. Empty when the route is unknown. */
export function formatLedRouteHero(route: string): string {
  if (!route) return '';
  const [origin, dest] = route.split('-');
  const left = origin?.trim() ?? '';
  const right = dest?.trim() ?? '';
  if (!left && !right) return '';
  return `${left}→${right}`;
}

/**
 * Fraction of the route already flown (0 = at origin, 1 = at destination),
 * based on great-circle distance from origin to the live position vs the full
 * leg. Null when the route or its airport coordinates are unknown — we never
 * fake progress.
 */
export function computeFlightProgress(ac: NormalizedAircraft): number | null {
  const route = getValidatedRoute(ac);
  if (
    !route ||
    route.originLat == null ||
    route.originLon == null ||
    route.destLat == null ||
    route.destLon == null
  ) {
    return null;
  }

  const legMi = distanceMi(route.originLat, route.originLon, route.destLat, route.destLon);
  if (!(legMi > 0)) return null;

  const flownMi = distanceMi(route.originLat, route.originLon, ac.lat, ac.lon);
  return Math.max(0, Math.min(1, flownMi / legMi));
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

/** Prefer a regional operator's native LED mark (e.g. SKW) over mainline raster logos. */
export function resolveLedLogoMarkIcao(brand: AirlineBrand, operatorTag?: string): string {
  if (operatorTag && hasLedAirlineMark(operatorTag)) return operatorTag;
  return brand.icao;
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

/** Below this baro altitude an aircraft is treated as on the airport surface. */
const TAXI_MAX_ALT_FT = 500;

/** Compact baro altitude for the LED stats stack. */
export function formatLedAltitude(altitudeFt?: number): string {
  if (altitudeFt == null) return '--- FT';
  if (altitudeFt <= TAXI_MAX_ALT_FT) return 'ON GROUND';
  if (altitudeFt >= 10000) {
    return `${Math.round(altitudeFt / 1000)}K FT`;
  }
  return `${Math.round(altitudeFt)} FT`;
}

/** Ground speeds above this read as roll / takeoff roll, not taxi. */
const TAXI_MAX_SPEED_KT = 35;

/** On the ground and moving slowly — taxi, not parked or airborne. */
export function isAircraftTaxiing(ac: NormalizedAircraft): boolean {
  const alt = ac.altitudeFt;
  const speed = ac.groundSpeedKt;
  if (alt == null || speed == null || speed < 1) return false;
  return alt <= TAXI_MAX_ALT_FT && speed <= TAXI_MAX_SPEED_KT;
}

/** 8-point compass — always spelled out (single letters read as digits on LED dots). */
const LED_CARDINALS = [
  'NORTH',
  'NORTHEAST',
  'EAST',
  'SOUTHEAST',
  'SOUTH',
  'SOUTHWEST',
  'WEST',
  'NORTHWEST',
] as const;

/** 8-point cardinal for the LED stats stack (empty when heading unknown). */
export function formatLedHeading(headingDeg?: number): string {
  if (headingDeg == null || Number.isNaN(headingDeg)) return '';
  const normalized = ((headingDeg % 360) + 360) % 360;
  return LED_CARDINALS[Math.round(normalized / 45) % 8] ?? '';
}

/** Sustained-climb / descent threshold — filters cruise-altitude jitter (fpm). */
const LED_VERTICAL_THRESHOLD = 250;
/** Below this altitude a strong climb reads as takeoff, not cruise climb. */
const LED_TAKEOFF_MAX_ALT_FT = 12000;
/** Below this altitude a descent reads as landing, not en-route descent. */
const LED_LANDING_MAX_ALT_FT = 10000;

/**
 * Human-readable flight phase for the LED stats row — avoids jargon like
 * "DESC NORTH". Matches FIDS tone (Departing / Arriving) with tighter labels
 * for the dot matrix.
 */
export function formatLedFlightPhase(ac: NormalizedAircraft): string {
  const vRate = ac.verticalRateFpm;
  const alt = ac.altitudeFt;

  if (vRate != null && !Number.isNaN(vRate)) {
    if (vRate > LED_VERTICAL_THRESHOLD) {
      if (alt != null && alt < LED_TAKEOFF_MAX_ALT_FT) return 'TAKEOFF';
      return 'DEPARTING';
    }
    if (vRate < -LED_VERTICAL_THRESHOLD) {
      if (alt != null && alt < LED_LANDING_MAX_ALT_FT) return 'LANDING';
      return 'ARRIVING';
    }
  }

  return formatLedHeading(ac.headingDeg) || 'EN ROUTE';
}

export type LedTelemetryEmphasis = 'primary' | 'secondary' | 'status' | 'measure';

export type LedTelemetryField = {
  value: string;
  emphasis?: LedTelemetryEmphasis;
};

export function ledTelemetryFields(ac: NormalizedAircraft): LedTelemetryField[] {
  const taxiing = isAircraftTaxiing(ac);
  const fields: LedTelemetryField[] = [
    {
      value: formatLedAircraftType(ac),
      emphasis: 'secondary',
    },
  ];

  if (!taxiing) {
    fields.push({ value: formatLedFlightPhase(ac), emphasis: 'status' });
  }

  fields.push({ value: formatLedAltitude(ac.altitudeFt), emphasis: 'measure' });

  fields.push({
    value: taxiing ? 'TAXIING' : formatLedSpeedMph(ac.groundSpeedKt),
    emphasis: 'primary',
  });

  return fields;
}
