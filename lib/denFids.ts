import type { NormalizedAircraft } from '@/types/aircraft';
import { displayIdentifier } from './aircraftUtils';
import { getAirlineFromCallsign } from './airlines';
import { formatBrandedCarrierLabel } from './regionalCarriers';
import type { VerticalTrend } from '@/types/aircraft';
import { getFiledRoute } from '@/lib/routePlausibility';

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
  const route = getFiledRoute(ac);
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
  const route = getFiledRoute(ac);
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
