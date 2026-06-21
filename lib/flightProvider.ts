/**
 * Flight data provider.
 *
 * Always uses live ADS-B (adsb.fi — free, no key) in every environment. There is
 * no synthetic/mock fleet: if the upstream feed is unreachable and no recent
 * live data is cached, the request fails so callers never display fake aircraft.
 * To switch providers, change FLIGHT_PROVIDER below.
 */

import type { NormalizedAircraft } from '@/types/aircraft';
import { DEFAULT_LAT, DEFAULT_LON } from './constants';
import { distanceMi, milesToNauticalMiles } from './geo';

export type ProviderName = 'adsb.fi' | 'airplanes.live';

/** Live ADS-B feed — change here if you switch providers. */
const FLIGHT_PROVIDER: ProviderName = 'adsb.fi';

/** Thrown when no live data can be served (upstream down and no fresh cache). */
export class UpstreamUnavailableError extends Error {
  statusCode: number;

  constructor(message = 'Live flight feed is unavailable', statusCode = 503) {
    super(message);
    this.name = 'UpstreamUnavailableError';
    this.statusCode = statusCode;
  }
}

export type FetchFlightsParams = {
  lat?: number;
  lon?: number;
  radiusMi: number;
  /** Optional ICAO callsign lookup — merged into geo results when tracking a specific flight. */
  callsign?: string;
  /** Minimum seconds between upstream fetches for this query (Sky Map uses 1). */
  minFreshSec?: number;
};

export type FetchFlightsResult = {
  aircraft: NormalizedAircraft[];
  provider: ProviderName;
  source: 'live' | 'cached';
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
const UPSTREAM_MIN_INTERVAL_MS = 45_000;
/** adsb.fi public API: max ~1 req/s — gap between any two upstream HTTP calls. */
const MIN_GLOBAL_UPSTREAM_GAP_MS = 1_100;
/** Serve cached live data on upstream errors — still real ADS-B, just not fresh. */
const STALE_MAX_AGE_MS = 30 * 60 * 1000;
/** Reuse cache from a nearby query center (settings drift, radius changes). */
const STALE_CACHE_CENTER_MAX_MI = 50;
/** Back off upstream calls after a 429. */
const RATE_LIMIT_BACKOFF_MS = 5 * 60 * 1000;

const cache = getPersistentCache();
const inflight = getPersistentInflight();
let rateLimitedUntil = getRateLimitedUntil();
let lastGlobalUpstreamAt = getLastGlobalUpstreamAt();
/** Serialize upstream HTTP calls — adsb.fi 429s on concurrent requests. */
let upstreamGate: Promise<void> = Promise.resolve();

function getLastGlobalUpstreamAt(): number {
  const g = globalThis as typeof globalThis & { __flightTrackerLastGlobalUpstreamAt?: number };
  return g.__flightTrackerLastGlobalUpstreamAt ?? 0;
}

function setLastGlobalUpstreamAt(at: number): void {
  lastGlobalUpstreamAt = at;
  const g = globalThis as typeof globalThis & { __flightTrackerLastGlobalUpstreamAt?: number };
  g.__flightTrackerLastGlobalUpstreamAt = at;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPersistentCache(): Map<string, CacheEntry> {
  const g = globalThis as typeof globalThis & { __flightTrackerCache?: Map<string, CacheEntry> };
  if (!g.__flightTrackerCache) g.__flightTrackerCache = new Map();
  return g.__flightTrackerCache;
}

function getPersistentInflight(): Map<string, Promise<FetchFlightsResult>> {
  const g = globalThis as typeof globalThis & {
    __flightTrackerInflight?: Map<string, Promise<FetchFlightsResult>>;
  };
  if (!g.__flightTrackerInflight) g.__flightTrackerInflight = new Map();
  return g.__flightTrackerInflight;
}

function getRateLimitedUntil(): number {
  const g = globalThis as typeof globalThis & { __flightTrackerRateLimitedUntil?: number };
  return g.__flightTrackerRateLimitedUntil ?? 0;
}

function setRateLimitedUntil(until: number): void {
  rateLimitedUntil = until;
  const g = globalThis as typeof globalThis & { __flightTrackerRateLimitedUntil?: number };
  g.__flightTrackerRateLimitedUntil = until;
}

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

async function fetchFromAdsbFiByCallsign(
  callsign: string,
  centerLat: number,
  centerLon: number,
  timeoutMs = UPSTREAM_FETCH_TIMEOUT_MS
): Promise<NormalizedAircraft[]> {
  const normalized = callsign.trim().toUpperCase();
  if (!normalized) return [];

  const url = `https://opendata.adsb.fi/api/v2/callsign/${encodeURIComponent(normalized)}`;
  const res = await fetchWithServerTimeout(
    url,
    {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    },
    timeoutMs
  );

  if (res.status === 404) return [];
  if (!res.ok) {
    throw new UpstreamHttpError('adsb.fi', res.status);
  }

  const data = (await res.json()) as RawResponse | RawAircraft;
  const list = Array.isArray(data)
    ? data
    : 'ac' in data || 'aircraft' in data
      ? (data.ac ?? data.aircraft ?? [])
      : [data as RawAircraft];

  return list
    .map((raw) => normalizeRaw(raw, centerLat, centerLon))
    .filter((ac): ac is NormalizedAircraft => ac != null);
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

/** Re-target a cached fetch to a different center/radius (smaller radius only). */
function adaptCacheEntryToQuery(
  entry: CacheEntry,
  lat: number,
  lon: number,
  radiusMi: number,
  stale: boolean
): FetchFlightsResult {
  const aircraft = entry.result.aircraft
    .map((ac) => ({
      ...ac,
      distanceMi: distanceMi(lat, lon, ac.lat, ac.lon),
    }))
    .filter((ac) => ac.distanceMi <= radiusMi);

  return {
    ...entry.result,
    aircraft,
    source: stale ? 'cached' : entry.result.source,
    stale,
  };
}

function parseCacheKey(
  key: string
): { provider: ProviderName; lat: number; lon: number; radiusMi: number } | null {
  const parts = key.split(':');
  if (parts.length !== 4) return null;
  const lat = parseFloat(parts[1]!);
  const lon = parseFloat(parts[2]!);
  const radiusMi = parseFloat(parts[3]!);
  if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(radiusMi)) return null;
  return { provider: parts[0] as ProviderName, lat, lon, radiusMi };
}

type MatchedCacheEntry = { entry: CacheEntry; key: string; parsed: NonNullable<ReturnType<typeof parseCacheKey>> };

/** Exact key first, then a nearby center with enough radius to cover the query. */
function findCacheEntryForQuery(
  provider: ProviderName,
  lat: number,
  lon: number,
  radiusMi: number,
  now: number,
  maxAgeMs: number
): MatchedCacheEntry | null {
  const exactKey = cacheKey(lat, lon, radiusMi, provider);
  const exact = cache.get(exactKey);
  if (exact && now - Date.parse(exact.result.fetchedAt) <= maxAgeMs) {
    const parsed = parseCacheKey(exactKey);
    if (parsed) return { entry: exact, key: exactKey, parsed };
  }

  let best: MatchedCacheEntry | null = null;
  let bestDist = STALE_CACHE_CENTER_MAX_MI + 1;

  for (const [key, entry] of cache.entries()) {
    const parsed = parseCacheKey(key);
    if (!parsed || parsed.provider !== provider) continue;
    if (now - Date.parse(entry.result.fetchedAt) > maxAgeMs) continue;
    if (parsed.radiusMi < radiusMi) continue;

    const centerDist = distanceMi(lat, lon, parsed.lat, parsed.lon);
    if (centerDist > STALE_CACHE_CENTER_MAX_MI) continue;

    if (centerDist < bestDist) {
      bestDist = centerDist;
      best = { entry, key, parsed };
    }
  }

  return best;
}

/**
 * Last-resort stale lookup — accepts a nearby cache even when its radius is
 * smaller than the query (e.g. serve a 10 mi cache for a 50 mi request during
 * rate-limit cooldown rather than returning 429 with no data).
 */
function findStaleFallbackCacheEntry(
  provider: ProviderName,
  lat: number,
  lon: number,
  radiusMi: number,
  now: number
): MatchedCacheEntry | null {
  const standard = findCacheEntryForQuery(provider, lat, lon, radiusMi, now, STALE_MAX_AGE_MS);
  if (standard) return standard;

  let best: MatchedCacheEntry | null = null;
  let bestScore = -1;

  for (const [key, entry] of cache.entries()) {
    const parsed = parseCacheKey(key);
    if (!parsed || parsed.provider !== provider) continue;
    const ageMs = now - Date.parse(entry.result.fetchedAt);
    if (ageMs > STALE_MAX_AGE_MS) continue;

    const centerDist = distanceMi(lat, lon, parsed.lat, parsed.lon);
    if (centerDist > STALE_CACHE_CENTER_MAX_MI) continue;

    const score =
      parsed.radiusMi * 1000 - centerDist * 10 - ageMs / 1000;
    if (score > bestScore) {
      bestScore = score;
      best = { entry, key, parsed };
    }
  }

  return best;
}

function serveCachedIfAvailable(
  provider: ProviderName,
  lat: number,
  lon: number,
  radiusMi: number,
  now: number,
  maxAgeMs: number,
  reason: string,
  stale: boolean
): FetchFlightsResult | null {
  const match = findCacheEntryForQuery(provider, lat, lon, radiusMi, now, maxAgeMs);
  if (!match) return null;

  const sameQuery = match.key === cacheKey(lat, lon, radiusMi, provider);

  if (sameQuery) {
    if (!stale) return cachedResult(match.entry);
    console.warn(`[flightProvider] ${reason}; serving cached flight data`);
    return cachedResult(match.entry, true);
  }

  console.warn(`[flightProvider] ${reason}; serving nearby cached flight data`);
  return adaptCacheEntryToQuery(match.entry, lat, lon, radiusMi, stale);
}

function serveStaleIfAvailable(
  provider: ProviderName,
  lat: number,
  lon: number,
  radiusMi: number,
  now: number,
  reason: string
): FetchFlightsResult | null {
  const match = findStaleFallbackCacheEntry(provider, lat, lon, radiusMi, now);
  if (!match) return null;

  const sameQuery = match.key === cacheKey(lat, lon, radiusMi, provider);
  console.warn(`[flightProvider] ${reason}; serving cached flight data`);

  if (sameQuery) return cachedResult(match.entry, true);
  return adaptCacheEntryToQuery(match.entry, lat, lon, radiusMi, true);
}

async function waitForUpstreamSlot(): Promise<void> {
  const now = Date.now();
  if (now < rateLimitedUntil) {
    throw new UpstreamHttpError('adsb.fi', 429);
  }

  const sinceLast = now - lastGlobalUpstreamAt;
  if (sinceLast < MIN_GLOBAL_UPSTREAM_GAP_MS) {
    await sleep(MIN_GLOBAL_UPSTREAM_GAP_MS - sinceLast);
  }

  if (Date.now() < rateLimitedUntil) {
    throw new UpstreamHttpError('adsb.fi', 429);
  }
}

async function runExclusiveUpstream<T>(fn: () => Promise<T>): Promise<T> {
  const previous = upstreamGate;
  let release!: () => void;
  upstreamGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    await waitForUpstreamSlot();
    const result = await fn();
    setLastGlobalUpstreamAt(Date.now());
    return result;
  } finally {
    release();
  }
}

async function fetchLiveWithCache(
  key: string,
  provider: ProviderName,
  lat: number,
  lon: number,
  radiusMi: number,
  minFreshIntervalMs: number
): Promise<FetchFlightsResult> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.upstreamAt < minFreshIntervalMs) {
    return cachedResult(cached);
  }

  if (now < rateLimitedUntil) {
    const stale = serveStaleIfAvailable(
      provider,
      lat,
      lon,
      radiusMi,
      now,
      'Upstream rate limit cooldown active'
    );
    if (stale) return stale;
    throw new UpstreamHttpError('adsb.fi', 429);
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = (async (): Promise<FetchFlightsResult> => {
    return runExclusiveUpstream(async () => {
      const afterWait = Date.now();
      const freshCached = cache.get(key);
      if (freshCached && afterWait - freshCached.upstreamAt < minFreshIntervalMs) {
        return cachedResult(freshCached);
      }

      const nearbyFresh = serveCachedIfAvailable(
        provider,
        lat,
        lon,
        radiusMi,
        afterWait,
        minFreshIntervalMs,
        'Recent upstream fetch for nearby query',
        false
      );
      if (nearbyFresh) return nearbyFresh;

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
          setRateLimitedUntil(rateLimitedUntil);
          const stale = serveStaleIfAvailable(
            provider,
            lat,
            lon,
            radiusMi,
            Date.now(),
            'adsb.fi rate limited (429)'
          );
          if (stale) return stale;
        }

        const stale = serveStaleIfAvailable(
          provider,
          lat,
          lon,
          radiusMi,
          Date.now(),
          'Upstream fetch failed'
        );
        if (stale) return stale;

        throw error;
      }
    });
  })();

  inflight.set(key, request);
  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}

function mergeAircraftLists(
  primary: NormalizedAircraft[],
  extra: NormalizedAircraft[]
): NormalizedAircraft[] {
  if (extra.length === 0) return primary;
  const seen = new Set(primary.map((ac) => ac.hex));
  const merged = [...primary];
  for (const ac of extra) {
    if (!seen.has(ac.hex)) {
      seen.add(ac.hex);
      merged.push(ac);
    }
  }
  return merged;
}

function resolveMinFreshIntervalMs(minFreshSec?: number): number {
  if (minFreshSec == null) return UPSTREAM_MIN_INTERVAL_MS;
  return Math.max(minFreshSec * 1000, MIN_GLOBAL_UPSTREAM_GAP_MS);
}

export async function fetchFlights(params: FetchFlightsParams): Promise<FetchFlightsResult> {
  const lat = params.lat ?? DEFAULT_LAT;
  const lon = params.lon ?? DEFAULT_LON;
  const provider = FLIGHT_PROVIDER;
  const key = cacheKey(lat, lon, params.radiusMi, provider);
  const minFreshIntervalMs = resolveMinFreshIntervalMs(params.minFreshSec);

  try {
    const result = await fetchLiveWithCache(
      key,
      provider,
      lat,
      lon,
      params.radiusMi,
      minFreshIntervalMs
    );

    const callsign = params.callsign?.trim().toUpperCase();
    if (!callsign) return result;

    const alreadyInGeo = result.aircraft.some(
      (ac) => ac.callsign?.trim().toUpperCase() === callsign
    );
    if (alreadyInGeo) return result;

    if (Date.now() < rateLimitedUntil) return result;

    try {
      const byCallsign = await runExclusiveUpstream(() =>
        fetchFromAdsbFiByCallsign(callsign, lat, lon)
      );
      if (byCallsign.length === 0) return result;

      return {
        ...result,
        aircraft: mergeAircraftLists(result.aircraft, byCallsign),
      };
    } catch (error) {
      if (error instanceof UpstreamHttpError && error.status === 429) {
        rateLimitedUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
        setRateLimitedUntil(rateLimitedUntil);
      }
      console.warn('[flightProvider] Callsign lookup failed; returning geo results only:', error);
      return result;
    }
  } catch (error) {
    console.error('[flightProvider] Live fetch failed, no fresh cache available:', error);
    if (error instanceof UpstreamHttpError && error.status === 429) {
      throw new UpstreamUnavailableError(
        'Live flight feed is rate limited — retry shortly',
        429
      );
    }
    throw new UpstreamUnavailableError();
  }
}
