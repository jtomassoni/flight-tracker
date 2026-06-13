'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlightsApiResponse } from '@/types/aircraft';
import {
  LIVE_LAYOUT_POLL_INTERVAL_SEC,
  SETTINGS_CHANGED_EVENT,
  SETTINGS_STORAGE_KEY,
} from '@/lib/constants';
import { applyClientFilters } from '@/lib/filters';
import { limitAircraft, sortByInterestingness } from '@/lib/sorting';
import {
  clampRefreshInterval,
  DEFAULT_SETTINGS,
  loadSettings,
  type DisplaySettings,
} from '@/lib/settings';
import { FetchTimeoutError, fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { LayoutId } from '@/lib/themes';

const LIVE_LAYOUTS = new Set<LayoutId>(['radar-scope', 'google-map', 'led-matrix']);

function resolvePollIntervalSec(refreshIntervalSec: number, layout?: LayoutId): number {
  if (layout && LIVE_LAYOUTS.has(layout)) return LIVE_LAYOUT_POLL_INTERVAL_SEC;
  return clampRefreshInterval(refreshIntervalSec);
}

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

export function useFlightData(pollLayout?: LayoutId) {
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

  const pollLayoutRef = useRef(pollLayout);
  pollLayoutRef.current = pollLayout;

  const refresh = useCallback(async () => {
    const current = settingsRef.current;
    const intervalSec = resolvePollIntervalSec(
      current.refreshIntervalSec,
      pollLayoutRef.current
    );

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
        mock: current.useMockData ? '1' : '0',
      });

      const res = await fetchWithTimeout(`/api/flights?${params.toString()}`);
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
        errorMessage:
          err instanceof FetchTimeoutError
            ? 'Flight data request timed out — check network connection'
            : err instanceof Error
              ? err.message
              : 'Failed to fetch flights',
      }));
    }

    return intervalSec;
  }, []);

  useEffect(() => {
    const reloadSettings = () => setSettings(loadSettings());
    reloadSettings();

    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) reloadSettings();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(SETTINGS_CHANGED_EVENT, reloadSettings);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SETTINGS_CHANGED_EVENT, reloadSettings);
    };
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
    pollLayout,
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
    settings.useMockData,
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
