import type { AircraftRoute, NormalizedAircraft } from '@/types/aircraft';
import { crossTrackDistanceMi, distanceMi } from './geo';

/** Max lateral offset from the great-circle path (allows normal airway deviation). */
const MAX_CROSS_TRACK_MI = 150;
/** dist(origin,ac)+dist(ac,dest) must stay within this factor of leg length. */
const MAX_SEGMENT_RATIO = 1.35;
/** Within this distance of either endpoint, trust the filed route (climb/descent/terminal). */
const NEAR_AIRPORT_MI = 45;

function hasRouteCoordinates(route: AircraftRoute): boolean {
  return (
    route.originLat != null &&
    route.originLon != null &&
    route.destLat != null &&
    route.destLon != null
  );
}

/**
 * A callsign→route lookup returns the airline's *filed* route, which can be
 * wrong for the aircraft currently on screen (stale callsign, repositioning,
 * database mismatch). Only trust the route when the live position lies on the
 * origin→destination segment within normal en-route tolerances.
 */
export function isPlausibleRoute(
  ac: Pick<NormalizedAircraft, 'lat' | 'lon'>,
  route: AircraftRoute
): boolean {
  if (!hasRouteCoordinates(route)) return false;

  const oLat = route.originLat!;
  const oLon = route.originLon!;
  const dLat = route.destLat!;
  const dLon = route.destLon!;

  const legMi = distanceMi(oLat, oLon, dLat, dLon);
  if (!(legMi > 1)) return false;

  const toOrigin = distanceMi(oLat, oLon, ac.lat, ac.lon);
  const toDest = distanceMi(dLat, dLon, ac.lat, ac.lon);
  if (toOrigin <= NEAR_AIRPORT_MI || toDest <= NEAR_AIRPORT_MI) return true;

  const crossTrack = crossTrackDistanceMi(ac.lat, ac.lon, oLat, oLon, dLat, dLon);
  if (crossTrack > MAX_CROSS_TRACK_MI) return false;

  if ((toOrigin + toDest) / legMi > MAX_SEGMENT_RATIO) return false;

  return true;
}

function hasAirportCodes(route: AircraftRoute): boolean {
  return Boolean(
    route.originIata?.trim() ||
      route.originIcao?.trim() ||
      route.destIata?.trim() ||
      route.destIcao?.trim()
  );
}

/** Filed O/D from the callsign lookup — shown even before position validates. */
export function getFiledRoute(ac: NormalizedAircraft): AircraftRoute | undefined {
  const route = ac.route;
  if (!route || !hasAirportCodes(route)) return undefined;
  return route;
}

/** Route metadata only when it matches the aircraft's live position (progress bar). */
export function getValidatedRoute(ac: NormalizedAircraft): AircraftRoute | undefined {
  const route = ac.route;
  if (!route || !isPlausibleRoute(ac, route)) return undefined;
  return route;
}
