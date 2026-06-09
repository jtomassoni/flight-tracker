/**
 * Flight data provider abstraction.
 *
 * Swap providers by setting FLIGHT_PROVIDER env var.
 * Keys (if required) stay server-side via FLIGHT_API_KEY.
 *
 * Supported V1 providers:
 * - adsb.fi (default, no key) — ADSBexchange-compatible v3 lat/lon/dist
 * - airplanes.live (no key) — similar v2 endpoint
 */

import type { NormalizedAircraft } from '@/types/aircraft';
import { DEFAULT_LAT, DEFAULT_LON } from './constants';
import { distanceMi, milesToNauticalMiles } from './geo';
import { getMockAircraft } from './mockFlights';

export type ProviderName = 'adsb.fi' | 'airplanes.live' | 'mock';

export type FetchFlightsParams = {
  lat?: number;
  lon?: number;
  radiusMi: number;
};

export type FetchFlightsResult = {
  aircraft: NormalizedAircraft[];
  provider: ProviderName;
  source: 'live' | 'mock';
};

/** Raw aircraft object from ADSBexchange-compatible APIs */
type RawAircraft = {
  hex?: string;
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | 'ground';
  gs?: number;
  track?: number;
  baro_rate?: number;
  category?: string;
  t?: string;
  squawk?: string;
  seen_pos?: number;
  dst?: number;
};

type RawResponse = {
  ac?: RawAircraft[];
  aircraft?: RawAircraft[];
};

function getProviderName(): ProviderName {
  const env = process.env.FLIGHT_PROVIDER?.toLowerCase();
  if (env === 'airplanes.live') return 'airplanes.live';
  if (env === 'mock' || process.env.USE_MOCK_FLIGHTS === 'true') return 'mock';
  return 'adsb.fi';
}

function trimCallsign(flight?: string): string | undefined {
  if (!flight) return undefined;
  const trimmed = flight.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRaw(
  raw: RawAircraft,
  centerLat: number,
  centerLon: number
): NormalizedAircraft | null {
  if (raw.hex == null || raw.lat == null || raw.lon == null) return null;

  const altitudeFt =
    raw.alt_baro === 'ground' ? 0 : typeof raw.alt_baro === 'number' ? raw.alt_baro : undefined;

  const distance =
    typeof raw.dst === 'number'
      ? raw.dst * 1.15078 // dst is typically NM from query point
      : distanceMi(centerLat, centerLon, raw.lat, raw.lon);

  return {
    hex: raw.hex.toLowerCase(),
    callsign: trimCallsign(raw.flight),
    lat: raw.lat,
    lon: raw.lon,
    altitudeFt,
    groundSpeedKt: raw.gs,
    headingDeg: raw.track,
    verticalRateFpm: raw.baro_rate,
    distanceMi: distance,
    category: raw.category,
    aircraftType: raw.t,
    squawk: raw.squawk,
    seenSecondsAgo: raw.seen_pos,
  };
}

async function fetchFromAdsbFi(
  lat: number,
  lon: number,
  radiusMi: number
): Promise<NormalizedAircraft[]> {
  const distNm = Math.ceil(milesToNauticalMiles(radiusMi));
  const url = `https://opendata.adsb.fi/api/v3/lat/${lat}/lon/${lon}/dist/${distNm}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`adsb.fi responded with ${res.status}`);
  }

  const data = (await res.json()) as RawResponse;
  const list = data.ac ?? data.aircraft ?? [];

  return list
    .map((raw) => normalizeRaw(raw, lat, lon))
    .filter((ac): ac is NormalizedAircraft => ac != null);
}

async function fetchFromAirplanesLive(
  lat: number,
  lon: number,
  radiusMi: number
): Promise<NormalizedAircraft[]> {
  const distNm = Math.ceil(milesToNauticalMiles(radiusMi));
  const url = `https://api.airplanes.live/v2/lat/${lat}/lon/${lon}/dist/${distNm}`;
  const headers: HeadersInit = { Accept: 'application/json' };

  if (process.env.FLIGHT_API_KEY) {
    headers['api-auth'] = process.env.FLIGHT_API_KEY;
  }

  const res = await fetch(url, { headers, next: { revalidate: 0 } });

  if (!res.ok) {
    throw new Error(`airplanes.live responded with ${res.status}`);
  }

  const data = (await res.json()) as RawResponse;
  const list = data.ac ?? data.aircraft ?? [];

  return list
    .map((raw) => normalizeRaw(raw, lat, lon))
    .filter((ac): ac is NormalizedAircraft => ac != null);
}

export async function fetchFlights(params: FetchFlightsParams): Promise<FetchFlightsResult> {
  const lat = params.lat ?? DEFAULT_LAT;
  const lon = params.lon ?? DEFAULT_LON;
  const provider = getProviderName();

  if (provider === 'mock') {
    return {
      aircraft: getMockAircraft(lat, lon),
      provider: 'mock',
      source: 'mock',
    };
  }

  try {
    const aircraft =
      provider === 'airplanes.live'
        ? await fetchFromAirplanesLive(lat, lon, params.radiusMi)
        : await fetchFromAdsbFi(lat, lon, params.radiusMi);

    return { aircraft, provider, source: 'live' };
  } catch (error) {
    console.error('[flightProvider] Live fetch failed, using mock fallback:', error);
    return {
      aircraft: getMockAircraft(lat, lon),
      provider,
      source: 'mock',
    };
  }
}
