import type { NormalizedAircraft, VerticalTrend } from '@/types/aircraft';
import { displayIdentifier } from './aircraftUtils';
import { getAircraftDisplayBrand, getAirlineFromCallsign } from './airlines';
import { distanceMi } from './geo';
import { formatBrandedCarrierLabel } from './regionalCarriers';
import { getDisplayRoute, getValidatedRoute } from '@/lib/routePlausibility';

/** Placeholder shown when a real value is unavailable — never fabricated data. */
export const FIDS_UNKNOWN = '—';

/** Real airport label for a route endpoint, preferring city name then IATA code. */
function airportLabel(
  municipality?: string,
  name?: string,
  iata?: string,
  icao?: string
): string {
  const city = municipality?.trim();
  if (city) return city;
  const fullName = name?.trim();
  if (fullName) return fullName;
  return (iata?.trim() || icao?.trim() || '').toUpperCase();
}

/** Real origin city/airport for the flight, or the unknown placeholder. */
export function fidsOrigin(ac: NormalizedAircraft): string {
  const route = getDisplayRoute(ac);
  if (!route) return FIDS_UNKNOWN;
  return (
    airportLabel(
      route.originMunicipality,
      route.originName,
      route.originIata,
      route.originIcao
    ) || FIDS_UNKNOWN
  );
}

/** Real destination city/airport for the flight, or the unknown placeholder. */
export function fidsDestination(ac: NormalizedAircraft): string {
  const route = getDisplayRoute(ac);
  if (!route) return FIDS_UNKNOWN;
  return (
    airportLabel(
      route.destMunicipality,
      route.destName,
      route.destIata,
      route.destIcao
    ) || FIDS_UNKNOWN
  );
}

export function fidsFlightNumber(ac: NormalizedAircraft): string {
  const brand = getAirlineFromCallsign(ac.callsign);
  const callsign = ac.callsign?.trim().toUpperCase();
  if (brand && callsign && callsign.length > 3) {
    const num = callsign.slice(3).replace(/^0+/, '') || callsign.slice(3);
    const carrier = formatBrandedCarrierLabel(callsign, brand.icao, brand.iata);
    return `${carrier} ${num}`.trim();
  }
  return displayIdentifier(ac);
}

/** Marketing airline IATA code (UA, WN, DL, …). */
export function fidsAirlineCode(ac: NormalizedAircraft): string {
  const brand = getAircraftDisplayBrand(ac);
  return (brand.iata || brand.icao.slice(0, 2)).toUpperCase();
}

/** Numeric flight portion of the callsign, without the carrier prefix. */
export function fidsFlightNumOnly(ac: NormalizedAircraft): string {
  const callsign = ac.callsign?.trim().toUpperCase();
  if (callsign && callsign.length > 3) {
    const num = callsign.slice(3).replace(/\D/g, '').replace(/^0+/, '');
    return num || callsign.slice(3);
  }
  if (ac.flightNumber?.trim()) return ac.flightNumber.trim().toUpperCase();
  return ac.hex.slice(-4).toUpperCase();
}

/** Origin for arrivals, destination for departures / en-route. */
export function fidsEndpoint(ac: NormalizedAircraft, trend: VerticalTrend): string {
  if (trend === 'descending') return fidsOrigin(ac);
  return fidsDestination(ac);
}

/** Uppercase status label sized for split-flap boards. */
export function fidsBoardStatus(trend: VerticalTrend): string {
  switch (trend) {
    case 'climbing':
      return 'DEPARTING';
    case 'descending':
      return 'ARRIVING';
    default:
      return 'EN ROUTE';
  }
}

function formatBoardClock(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? 'P' : 'A';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')}${suffix}`;
}

/**
 * Estimated arrival/departure clock time from live position and speed.
 * Not a published airline schedule — only what ADS-B can support.
 */
export function fidsEstimatedTime(
  ac: NormalizedAircraft,
  trend: VerticalTrend,
  now: Date = new Date()
): string {
  const speedKt = ac.groundSpeedKt;
  if (speedKt == null || speedKt < 30) return FIDS_UNKNOWN;

  const speedMph = speedKt * 1.15078;

  if (trend === 'descending') {
    const minutes = (ac.distanceMi / speedMph) * 60;
    if (!Number.isFinite(minutes) || minutes > 480) return FIDS_UNKNOWN;
    return formatBoardClock(new Date(now.getTime() + minutes * 60_000));
  }

  if (trend === 'climbing') {
    return formatBoardClock(now);
  }

  const route = getValidatedRoute(ac);
  if (route?.destLat != null && route?.destLon != null) {
    const dist = distanceMi(ac.lat, ac.lon, route.destLat, route.destLon);
    const minutes = (dist / speedMph) * 60;
    if (Number.isFinite(minutes) && minutes <= 480) {
      return formatBoardClock(new Date(now.getTime() + minutes * 60_000));
    }
  }

  return FIDS_UNKNOWN;
}

/**
 * Flight phase derived from the aircraft's real vertical trend — not a scheduled
 * status (gates/scheduled times aren't available from ADS-B, so we report what
 * the telemetry actually shows).
 */
export function fidsStatus(
  trend: VerticalTrend
): { label: string; tone: 'ontime' | 'delayed' | 'updated' } {
  switch (trend) {
    case 'climbing':
      return { label: 'Departing', tone: 'updated' };
    case 'descending':
      return { label: 'Arriving', tone: 'delayed' };
    default:
      return { label: 'En Route', tone: 'ontime' };
  }
}
