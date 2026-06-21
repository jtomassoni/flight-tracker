'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AircraftRoute, NormalizedAircraft } from '@/types/aircraft';
import { fetchWithTimeout } from '@/lib/fetchWithTimeout';
import { hasContradictoryRoute } from '@/lib/routePlausibility';
import { normalizeRouteCallsign, ROUTE_RETRY_INTERVAL_MS } from '@/lib/routeProvider';
import { callsignsPendingRoute } from '@/lib/routeStatus';

type RouteRetryResponse = {
  routes: Record<string, AircraftRoute | null>;
};

function routesEqual(
  a: Record<string, AircraftRoute | null>,
  b: Record<string, AircraftRoute | null>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

function applyRouteMap(
  aircraft: NormalizedAircraft[],
  routes: Record<string, AircraftRoute | null>
): NormalizedAircraft[] {
  if (Object.keys(routes).length === 0) return aircraft;

  let changed = false;
  const next = aircraft.map((ac) => {
    const callsign = normalizeRouteCallsign(ac.callsign);
    if (!callsign || !(callsign in routes)) return ac;

    const route = routes[callsign];
    if (!route || ac.route === route) return ac;

    const merged = { ...ac, route };
    if (hasContradictoryRoute(merged)) return ac;

    changed = true;
    return merged;
  });

  return changed ? next : aircraft;
}

/**
 * Poll adsbdb for displayed flights missing a validated route.
 * Stops per callsign once resolved or the aircraft leaves the board.
 */
export function useRouteRetry(
  aircraft: NormalizedAircraft[],
  enabled: boolean
): NormalizedAircraft[] {
  const [routePatches, setRoutePatches] = useState<Record<string, AircraftRoute | null>>({});
  const aircraftRef = useRef(aircraft);
  aircraftRef.current = aircraft;

  const pending = useMemo(() => callsignsPendingRoute(aircraft), [aircraft]);
  const pendingKey = pending.join(',');

  useEffect(() => {
    setRoutePatches((prev) => {
      const next: Record<string, AircraftRoute | null> = {};
      for (const cs of pending) {
        if (cs in prev) next[cs] = prev[cs] ?? null;
      }
      return routesEqual(prev, next) ? prev : next;
    });
  }, [pendingKey]);

  useEffect(() => {
    if (!enabled || pending.length === 0) return undefined;

    let cancelled = false;

    const poll = async () => {
      const currentPending = callsignsPendingRoute(aircraftRef.current);
      if (currentPending.length === 0) return;

      try {
        const params = new URLSearchParams({ retry: '1' });
        currentPending.forEach((callsign) => params.append('callsign', callsign));

        const res = await fetchWithTimeout(`/api/routes?${params.toString()}`, undefined, 12_000);
        if (!res.ok || cancelled) return;

        const data = (await res.json()) as RouteRetryResponse;
        if (cancelled || !data.routes) return;

        setRoutePatches((prev) => {
          const merged = { ...prev, ...data.routes };
          return routesEqual(prev, merged) ? prev : merged;
        });
      } catch {
        // Silent — main flight poll continues; we'll retry on the next tick.
      }
    };

    void poll();
    const timer = setInterval(poll, ROUTE_RETRY_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, pendingKey]);

  return useMemo(
    () => applyRouteMap(aircraft, routePatches),
    [aircraft, routePatches]
  );
}
