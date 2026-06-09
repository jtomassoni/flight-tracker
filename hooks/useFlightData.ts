'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlightsApiResponse } from '@/types/aircraft';
import { MIN_POLL_INTERVAL_SEC, SETTINGS_STORAGE_KEY } from '@/lib/constants';
import { applyClientFilters } from '@/lib/filters';
import { limitAircraft, sortByInterestingness } from '@/lib/sorting';
import {
  clampRefreshInterval,
  DEFAULT_SETTINGS,
  loadSettings,
  type DisplaySettings,
} from '@/lib/settings';

export type FlightDataState = {
  aircraft: FlightsApiResponse['aircraft'];
  filteredAircraft: FlightsApiResponse['aircraft'];
  displayedAircraft: FlightsApiResponse['aircraft'];
  status: 'loading' | 'ready' | 'error' | 'offline';
  lastUpdated: Date | null;
  source: FlightsApiResponse['source'] | null;
  provider: string | null;
  errorMessage: string | null;
  settings: DisplaySettings;
};

export function useFlightData() {
  const [settings, setSettings] = useState<DisplaySettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<Omit<FlightDataState, 'settings'>>({
    aircraft: [],
    filteredAircraft: [],
    displayedAircraft: [],
    status: 'loading',
    lastUpdated: null,
    source: null,
    provider: null,
    errorMessage: null,
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const refresh = useCallback(async () => {
    const current = settingsRef.current;
    const intervalSec = clampRefreshInterval(current.refreshIntervalSec);

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

      const res = await fetch(`/api/flights?${params.toString()}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = (await res.json()) as FlightsApiResponse;
      const filtered = applyClientFilters(data.aircraft, current);
      const sorted = sortByInterestingness(filtered);
      const displayed = limitAircraft(sorted, current.maxAircraft);

      setState({
        aircraft: data.aircraft,
        filteredAircraft: filtered,
        displayedAircraft: displayed,
        status: navigator.onLine ? 'ready' : 'offline',
        lastUpdated: new Date(data.fetchedAt),
        source: data.source,
        provider: data.provider,
        errorMessage: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Failed to fetch flights',
      }));
    }

    return intervalSec;
  }, []);

  useEffect(() => {
    setSettings(loadSettings());

    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        setSettings(loadSettings());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const intervalSec = await refresh();
      if (!cancelled) {
        const ms = Math.max(MIN_POLL_INTERVAL_SEC, intervalSec) * 1000;
        timer = setTimeout(poll, ms);
      }
    };

    poll();

    const onOnline = () => refresh();
    const onOffline = () =>
      setState((prev) => ({ ...prev, status: 'offline' }));

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
    settings.mode,
    settings.lat,
    settings.lon,
    settings.zipCode,
  ]);

  // Re-apply client filters when settings change without waiting for next poll
  useEffect(() => {
    setState((prev) => {
      if (prev.aircraft.length === 0) return prev;
      const filtered = applyClientFilters(prev.aircraft, settings);
      const sorted = sortByInterestingness(filtered);
      const displayed = limitAircraft(sorted, settings.maxAircraft);
      return { ...prev, filteredAircraft: filtered, displayedAircraft: displayed };
    });
  }, [settings]);

  return { ...state, settings, refresh };
}
