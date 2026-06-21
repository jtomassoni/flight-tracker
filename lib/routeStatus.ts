import type { NormalizedAircraft, VerticalTrend } from '@/types/aircraft';
import { FIDS_UNKNOWN, fidsDestination, fidsOrigin } from '@/lib/denFids';
import { getDisplayRoute } from '@/lib/routePlausibility';
import { normalizeRouteCallsign } from '@/lib/routeProvider';

export type RouteDisplayStatus = 'resolved' | 'pending' | 'unavailable';
export type RouteFieldKind = 'origin' | 'destination' | 'endpoint';

export const ROUTE_PENDING_LABEL = 'Routing…';
export const ROUTE_UNAVAILABLE_LABEL = FIDS_UNKNOWN;

/** Callsign is eligible for adsbdb route lookup (airline-style, not N-number). */
export function canLookupRouteCallsign(ac: NormalizedAircraft): boolean {
  return normalizeRouteCallsign(ac.callsign) != null;
}

export function routeFieldLabel(
  ac: NormalizedAircraft,
  kind: RouteFieldKind,
  trend: VerticalTrend
): string {
  if (kind === 'origin') return fidsOrigin(ac);
  if (kind === 'destination') return fidsDestination(ac);
  return trend === 'descending' ? fidsOrigin(ac) : fidsDestination(ac);
}

export function getRouteFieldStatus(
  ac: NormalizedAircraft,
  kind: RouteFieldKind,
  trend: VerticalTrend
): RouteDisplayStatus {
  if (getDisplayRoute(ac)) {
    const label = routeFieldLabel(ac, kind, trend);
    if (label !== FIDS_UNKNOWN) return 'resolved';
  }
  if (canLookupRouteCallsign(ac)) return 'pending';
  return 'unavailable';
}

/** @deprecated use getRouteFieldStatus */
export function getRouteEndpointStatus(
  ac: NormalizedAircraft,
  trend: VerticalTrend
): RouteDisplayStatus {
  return getRouteFieldStatus(ac, 'endpoint', trend);
}

export function callsignsPendingRoute(aircraft: NormalizedAircraft[]): string[] {
  const pending = new Set<string>();
  for (const ac of aircraft) {
    const cs = normalizeRouteCallsign(ac.callsign);
    if (!cs) continue;
    const trend: VerticalTrend =
      ac.verticalRateFpm != null && ac.verticalRateFpm < -200
        ? 'descending'
        : ac.verticalRateFpm != null && ac.verticalRateFpm > 200
          ? 'climbing'
          : 'level';
    const needsRoute =
      getRouteFieldStatus(ac, 'origin', trend) === 'pending' ||
      getRouteFieldStatus(ac, 'destination', trend) === 'pending' ||
      getRouteFieldStatus(ac, 'endpoint', trend) === 'pending';
    if (needsRoute) pending.add(cs);
  }
  return Array.from(pending);
}
