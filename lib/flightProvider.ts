/**
 * Flight data provider.
 *
 * Production uses adsb.fi (free, no key). In development, mock data is the default;
 * pass `useMock: false` (or `mock=0` on the API) for live ADS-B while iterating locally.
 * To switch providers, change PRODUCTION_FLIGHT_PROVIDER below.
 */

import type { NormalizedAircraft } from '@/types/aircraft';
import { DEFAULT_LAT, DEFAULT_LON } from './constants';
import { distanceMi, milesToNauticalMiles } from './geo';
import { getMockAircraft } from './mockFlights';

export type ProviderName = 'adsb.fi' | 'airplanes.live' | 'mock';

/** Production ADS-B feed — change here if you switch providers. */
const PRODUCTION_FLIGHT_PROVIDER: Exclude<ProviderName, 'mock'> = 'adsb.fi';

export type FetchFlightsParams = {
  lat?: number;
  lon?: number;
  radiusMi: number;
  /** Dev only — when true, serve mock fleet; when false, hit live ADS-B. Ignored in production. */
  useMock?: boolean;
};

export type FetchFlightsResult = {
  aircraft: NormalizedAircraft[];
  provider: ProviderName;
  source: 'live' | 'mock' | 'cached';
  fetchedAt: string;
  stale?: boolean;
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
  /** Registration / tail number */
  r?: string;
};

type RawResponse = {
  ac?: RawAircraft[];
  aircraft?: RawAircraft[];
};

type CacheEntry = {
  result: FetchFlightsResult;
  upstreamAt: number;
};

class UpstreamHttpError extends Error {
  status: number;

  constructor(provider: string, status: number) {
    super(`${provider} responded with ${status}`);
    this.name = 'UpstreamHttpError';
    this.status = status;
  }
}

/** Minimum time between upstream calls for the same query (adsb.fi rate limits aggressively). */
const UPSTREAM_MIN_INTERVAL_MS = 20_000;
/** Serve stale live data instead of mock when upstream is rate-limited. */
const STALE_MAX_AGE_MS = 120_000;
/** Back off upstream calls after a 429. */
const RATE_LIMIT_BACKOFF_MS = 60_000;

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<FetchFlightsResult>>();
let rateLimitedUntil = 0;

/** Demo mode pulls real nearby flights once per location, then reuses them so the board is relevant to the entered ZIP. */
const DEMO_CACHE_TTL_MS = 5 * 60_000;
/** Keep demo snappy — fall back to the synthetic fleet rather than wait on a slow upstream. */
const DEMO_FETCH_TIMEOUT_MS = 6_000;
const DEMO_MAX_FLIGHTS = 10;

type DemoEntry = { aircraft: NormalizedAircraft[]; fetchedAt: number };
const demoCache = new Map<string, DemoEntry>();
const demoInflight = new Map<string, Promise<NormalizedAircraft[]>>();

const UPSTREAM_FETCH_TIMEOUT_MS = 15_000;

async function fetchWithServerTimeout(
  url: string,
  init?: RequestInit,
  timeoutMs = UPSTREAM_FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getProviderName(useMock?: boolean): ProviderName {
  if (process.env.NODE_ENV === 'development') {
    return useMock === false ? PRODUCTION_FLIGHT_PROVIDER : 'mock';
  }
  return PRODUCTION_FLIGHT_PROVIDER;
}

function cacheKey(lat: number, lon: number, radiusMi: number, provider: ProviderName): string {
  return `${provider}:${lat.toFixed(4)}:${lon.toFixed(4)}:${radiusMi}`;
}

function trimCallsign(flight?: string): string | undefined {
  if (!flight) return undefined;
  const trimmed = flight.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function trimRegistration(registration?: string): string | undefined {
  if (!registration) return undefined;
  const trimmed = registration.trim().toUpperCase();
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
    registration: trimRegistration(raw.r),
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
  radiusMi: number,
  timeoutMs = UPSTREAM_FETCH_TIMEOUT_MS
): Promise<NormalizedAircraft[]> {
  const distNm = Math.ceil(milesToNauticalMiles(radiusMi));
  const url = `https://opendata.adsb.fi/api/v3/lat/${lat}/lon/${lon}/dist/${distNm}`;

  const res = await fetchWithServerTimeout(
    url,
    {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    },
    timeoutMs
  );

  if (!res.ok) {
    throw new UpstreamHttpError('adsb.fi', res.status);
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
  radiusMi: number,
  timeoutMs = UPSTREAM_FETCH_TIMEOUT_MS
): Promise<NormalizedAircraft[]> {
  const distNm = Math.ceil(milesToNauticalMiles(radiusMi));
  const url = `https://api.airplanes.live/v2/lat/${lat}/lon/${lon}/dist/${distNm}`;
  const headers: HeadersInit = { Accept: 'application/json' };

  if (process.env.FLIGHT_API_KEY) {
    headers['api-auth'] = process.env.FLIGHT_API_KEY;
  }

  const res = await fetchWithServerTimeout(url, { headers, cache: 'no-store' }, timeoutMs);

  if (!res.ok) {
    throw new UpstreamHttpError('airplanes.live', res.status);
  }

  const data = (await res.json()) as RawResponse;
  const list = data.ac ?? data.aircraft ?? [];

  return list
    .map((raw) => normalizeRaw(raw, lat, lon))
    .filter((ac): ac is NormalizedAircraft => ac != null);
}

function cachedResult(entry: CacheEntry, stale = false): FetchFlightsResult {
  return {
    ...entry.result,
    source: stale ? 'cached' : entry.result.source,
    stale,
  };
}

function serveStaleIfAvailable(key: string, now: number, reason: string): FetchFlightsResult | null {
  const cached = cache.get(key);
  if (!cached || now - Date.parse(cached.result.fetchedAt) > STALE_MAX_AGE_MS) {
    return null;
  }

  console.warn(`[flightProvider] ${reason}; serving cached flight data`);
  return cachedResult(cached, true);
}

async function fetchLiveWithCache(
  key: string,
  provider: Exclude<ProviderName, 'mock'>,
  lat: number,
  lon: number,
  radiusMi: number
): Promise<FetchFlightsResult> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.upstreamAt < UPSTREAM_MIN_INTERVAL_MS) {
    return cachedResult(cached);
  }

  if (now < rateLimitedUntil) {
    const stale = serveStaleIfAvailable(key, now, 'Upstream rate limit cooldown active');
    if (stale) return stale;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = (async (): Promise<FetchFlightsResult> => {
    try {
      const aircraft =
        provider === 'airplanes.live'
          ? await fetchFromAirplanesLive(lat, lon, radiusMi)
          : await fetchFromAdsbFi(lat, lon, radiusMi);

      const result: FetchFlightsResult = {
        aircraft,
        provider,
        source: 'live',
        fetchedAt: new Date().toISOString(),
      };

      cache.set(key, { result, upstreamAt: Date.now() });
      return result;
    } catch (error) {
      if (error instanceof UpstreamHttpError && error.status === 429) {
        rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
        const stale = serveStaleIfAvailable(key, Date.now(), 'adsb.fi rate limited (429)');
        if (stale) return stale;
      }

      const stale = serveStaleIfAvailable(
        key,
        Date.now(),
        'Upstream fetch failed'
      );
      if (stale) return stale;

      throw error;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

/**
 * Demo dataset: one quick live lookup near the requested point, capped to the closest
 * DEMO_MAX_FLIGHTS and cached per location. Returns [] when upstream is unavailable so
 * the caller can fall back to the synthetic fleet.
 */
async function fetchDemoFlights(
  lat: number,
  lon: number,
  radiusMi: number
): Promise<NormalizedAircraft[]> {
  const key = `${lat.toFixed(4)}:${lon.toFixed(4)}:${radiusMi}`;
  const now = Date.now();

  const cached = demoCache.get(key);
  if (cached && now - cached.fetchedAt < DEMO_CACHE_TTL_MS) {
    return cached.aircraft;
  }

  const pending = demoInflight.get(key);
  if (pending) return pending;

  const request = (async (): Promise<NormalizedAircraft[]> => {
    try {
      const aircraft =
        PRODUCTION_FLIGHT_PROVIDER === 'airplanes.live'
          ? await fetchFromAirplanesLive(lat, lon, radiusMi, DEMO_FETCH_TIMEOUT_MS)
          : await fetchFromAdsbFi(lat, lon, radiusMi, DEMO_FETCH_TIMEOUT_MS);

      const trimmed = [...aircraft]
        .sort((a, b) => a.distanceMi - b.distanceMi)
        .slice(0, DEMO_MAX_FLIGHTS);

      if (trimmed.length > 0) {
        demoCache.set(key, { aircraft: trimmed, fetchedAt: Date.now() });
      }
      return trimmed;
    } catch (error) {
      console.warn(
        '[flightProvider] Demo live fetch failed; using synthetic mock fleet:',
        error
      );
      return [];
    } finally {
      demoInflight.delete(key);
    }
  })();

  demoInflight.set(key, request);
  return request;
}

export async function fetchFlights(params: FetchFlightsParams): Promise<FetchFlightsResult> {
  const lat = params.lat ?? DEFAULT_LAT;
  const lon = params.lon ?? DEFAULT_LON;
  const provider = getProviderName(params.useMock);

  if (provider === 'mock') {
    const demo = await fetchDemoFlights(lat, lon, params.radiusMi);
    return {
      aircraft: demo.length > 0 ? demo : getMockAircraft(lat, lon),
      provider: 'mock',
      source: 'mock',
      fetchedAt: new Date().toISOString(),
    };
  }

  const key = cacheKey(lat, lon, params.radiusMi, provider);

  try {
    return await fetchLiveWithCache(key, provider, lat, lon, params.radiusMi);
  } catch (error) {
    console.error('[flightProvider] Live fetch failed, using mock fallback:', error);
    return {
      aircraft: getMockAircraft(lat, lon),
      provider,
      source: 'mock',
      fetchedAt: new Date().toISOString(),
    };
  }
}
