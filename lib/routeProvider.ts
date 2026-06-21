/**
 * Real flight-route resolver.
 *
 * ADS-B feeds broadcast position/telemetry but never origin/destination. This
 * module enriches aircraft with their real scheduled route by looking the
 * callsign up against adsbdb.com (free, no key). Routes are static for a given
 * callsign over a day, so results are cached aggressively (positive + negative)
 * to stay well within upstream rate limits. Nothing here is ever fabricated:
 * when a callsign has no known route, the aircraft is simply left without one.
 */

import type { AircraftRoute, NormalizedAircraft } from '@/types/aircraft';
import { isNNumberTail } from '@/lib/aircraftCategories';

const ADSBDB_BASE = 'https://api.adsbdb.com/v0/callsign';

/** Routes rarely change within a day — cache hits for 6h. */
const ROUTE_TTL_MS = 6 * 60 * 60 * 1000;
/** Re-check "unknown" callsigns less often, but still expire (flight numbers get reused). */
const UNKNOWN_TTL_MS = 60 * 60 * 1000;
/** Don't hammer upstream: cap concurrent lookups per enrichment pass. */
const MAX_CONCURRENT_LOOKUPS = 12;
const LOOKUP_TIMEOUT_MS = 8_000;

type CacheEntry = {
  route: AircraftRoute | null;
  expiresAt: number;
};

type AdsbdbAirport = {
  iata_code?: string;
  icao_code?: string;
  name?: string;
  municipality?: string;
  latitude?: number;
  longitude?: number;
};

type AdsbdbResponse = {
  response?:
    | string
    | {
        flightroute?: {
          airline?: { name?: string };
          origin?: AdsbdbAirport;
          destination?: AdsbdbAirport;
        };
      };
};

const cache = getPersistentRouteCache();
const inflight = getPersistentRouteInflight();

function getPersistentRouteCache(): Map<string, CacheEntry> {
  const g = globalThis as typeof globalThis & {
    __flightTrackerRouteCache?: Map<string, CacheEntry>;
  };
  if (!g.__flightTrackerRouteCache) g.__flightTrackerRouteCache = new Map();
  return g.__flightTrackerRouteCache;
}

function getPersistentRouteInflight(): Map<string, Promise<AircraftRoute | null>> {
  const g = globalThis as typeof globalThis & {
    __flightTrackerRouteInflight?: Map<string, Promise<AircraftRoute | null>>;
  };
  if (!g.__flightTrackerRouteInflight) g.__flightTrackerRouteInflight = new Map();
  return g.__flightTrackerRouteInflight;
}

function normalizeCallsign(callsign?: string): string | null {
  const trimmed = callsign?.trim().toUpperCase();
  if (!trimmed) return null;
  // adsbdb keys on ICAO/IATA callsigns (e.g. "UAL123"); skip N-number tails
  // and anything without at least an airline prefix + number.
  if (!/^[A-Z0-9]{3,8}$/.test(trimmed)) return null;
  if (isNNumberTail(trimmed)) return null;
  return trimmed;
}

function mapAirport(airport: AdsbdbAirport | undefined): {
  iata?: string;
  icao?: string;
  name?: string;
  municipality?: string;
  lat?: number;
  lon?: number;
} {
  return {
    iata: airport?.iata_code?.trim() || undefined,
    icao: airport?.icao_code?.trim() || undefined,
    name: airport?.name?.trim() || undefined,
    municipality: airport?.municipality?.trim() || undefined,
    lat: typeof airport?.latitude === 'number' ? airport.latitude : undefined,
    lon: typeof airport?.longitude === 'number' ? airport.longitude : undefined,
  };
}

function parseRoute(data: AdsbdbResponse): AircraftRoute | null {
  const response = data.response;
  if (!response || typeof response === 'string') return null;
  const flightroute = response.flightroute;
  if (!flightroute) return null;

  const origin = mapAirport(flightroute.origin);
  const dest = mapAirport(flightroute.destination);
  if (!origin.iata && !origin.icao && !dest.iata && !dest.icao) return null;

  return {
    airlineName: flightroute.airline?.name?.trim() || undefined,
    originIata: origin.iata,
    originIcao: origin.icao,
    originName: origin.name,
    originMunicipality: origin.municipality,
    originLat: origin.lat,
    originLon: origin.lon,
    destIata: dest.iata,
    destIcao: dest.icao,
    destName: dest.name,
    destMunicipality: dest.municipality,
    destLat: dest.lat,
    destLon: dest.lon,
  };
}

async function fetchRoute(callsign: string): Promise<AircraftRoute | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(`${ADSBDB_BASE}/${encodeURIComponent(callsign)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });

    // 404 = unknown callsign (expected, cache as null). Other non-OK = transient.
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`adsbdb responded with ${res.status}`);

    const data = (await res.json()) as AdsbdbResponse;
    return parseRoute(data);
  } finally {
    clearTimeout(timer);
  }
}

async function resolveRoute(callsign: string): Promise<AircraftRoute | null> {
  const now = Date.now();
  const cached = cache.get(callsign);
  if (cached && cached.expiresAt > now) return cached.route;

  const pending = inflight.get(callsign);
  if (pending) return pending;

  const request = (async () => {
    try {
      const route = await fetchRoute(callsign);
      cache.set(callsign, {
        route,
        expiresAt: Date.now() + (route ? ROUTE_TTL_MS : UNKNOWN_TTL_MS),
      });
      return route;
    } catch {
      // Transient failure — keep any stale value, otherwise leave uncached so a
      // later poll retries. Never fabricate a route.
      return cached?.route ?? null;
    } finally {
      inflight.delete(callsign);
    }
  })();

  inflight.set(callsign, request);
  return request;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function run(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]!);
    }
  }

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    () => run()
  );
  await Promise.all(runners);
  return results;
}

/**
 * Attach filed routes from callsign lookups. Position validation happens later
 * when drawing the progress bar — airport codes are shown from the lookup alone.
 */
export async function enrichWithRoutes(
  aircraft: NormalizedAircraft[]
): Promise<NormalizedAircraft[]> {
  const callsigns = aircraft.map((ac) => normalizeCallsign(ac.callsign));
  const unique = Array.from(
    new Set(callsigns.filter((c): c is string => c != null))
  );
  if (unique.length === 0) return aircraft;

  const resolved = await mapWithConcurrency(
    unique,
    MAX_CONCURRENT_LOOKUPS,
    async (callsign) => [callsign, await resolveRoute(callsign)] as const
  );
  const routeByCallsign = new Map(resolved);

  return aircraft.map((ac, i) => {
    const callsign = callsigns[i];
    const route = callsign ? routeByCallsign.get(callsign) : null;
    if (!route) return ac;
    return { ...ac, route };
  });
}
