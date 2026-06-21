'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlightsApiResponse } from '@/types/aircraft';
import { applyClientFilters } from '@/lib/filters';
import { sortByInterestingness, limitAircraft } from '@/lib/sorting';
import { clampRefreshInterval, type DisplaySettings } from '@/lib/settings';
import { FetchTimeoutError, fetchWithTimeout } from '@/lib/fetchWithTimeout';

const NEARBY_LIMIT = 12;

export type NearbyFlightsState = {
  flights: FlightsApiResponse['aircraft'];
  status: 'loading' | 'ready' | 'error' | 'offline';
  lastUpdated: Date | null;
  errorMessage: string | null;
};

export function useNearbyFlights(settings: DisplaySettings) {
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [state, setState] = useState<NearbyFlightsState>({
    flights: [],
    status: 'loading',
    lastUpdated: null,
    errorMessage: null,
  });

  const refresh = useCallback(async () => {
    const current = settingsRef.current;

    setState((prev) => ({
      ...prev,
      status: prev.lastUpdated ? 'ready' : 'loading',
      errorMessage: null,
    }));

    try {
      const params = new URLSearchParams({
        lat: String(current.lat),
        lon: String(current.lon),
        radiusMi: String(current.radiusMi),
      });

      const res = await fetchWithTimeout(`/api/flights?${params.toString()}`);
      if (!res.ok) {
        const reason = await res
          .json()
          .then((body: { error?: string }) => body?.error)
          .catch(() => null);
        throw new Error(reason || `Flight feed unavailable (${res.status})`);
      }

      const data = (await res.json()) as FlightsApiResponse;
      const filtered = applyClientFilters(data.aircraft, current);
      const flights = limitAircraft(sortByInterestingness(filtered), NEARBY_LIMIT);

      setState({
        flights,
        status: navigator.onLine ? 'ready' : 'offline',
        lastUpdated: new Date(data.fetchedAt),
        errorMessage: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage:
          err instanceof FetchTimeoutError
            ? 'Flight data request timed out'
            : err instanceof Error
              ? err.message
              : 'Failed to fetch flights',
      }));
    }

    return clampRefreshInterval(current.refreshIntervalSec);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const intervalSec = await refresh();
      if (!cancelled) {
        timer = setTimeout(poll, intervalSec * 1000);
      }
    };

    poll();

    const onOnline = () => refresh();
    const onOffline = () => setState((prev) => ({ ...prev, status: 'offline' }));

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [
    refresh,
    settings.refreshIntervalSec,
    settings.radiusMi,
    settings.maxAircraft,
    settings.altitudeFilter,
    settings.hideNoCallsign,
    settings.cargoOnly,
    settings.mode,
    settings.lat,
    settings.lon,
    settings.zipCode,
  ]);

  return { ...state, refresh };
}
