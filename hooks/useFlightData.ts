'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlightsApiResponse } from '@/types/aircraft';
import type { TrackStatus } from '@/types/display';
import {
  LIVE_LAYOUT_POLL_INTERVAL_SEC,
  SETTINGS_CHANGED_EVENT,
  SETTINGS_STORAGE_KEY,
} from '@/lib/constants';
import { applyClientFilters } from '@/lib/filters';
import { limitAircraft, sortByInterestingness } from '@/lib/sorting';
import {
  buildTrackTarget,
  findTrackedAircraft,
  isTrackModeActive,
} from '@/lib/callsignMatch';
import {
  cacheSettingsLocal,
  clampRefreshInterval,
  DEFAULT_SETTINGS,
  fetchServerSettings,
  loadSettings,
  type DisplaySettings,
} from '@/lib/settings';
import { FetchTimeoutError, fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { LayoutId } from '@/lib/themes';

const LIVE_LAYOUTS = new Set<LayoutId>(['radar-scope', 'google-map', 'led-matrix']);

const RATE_LIMIT_POLL_INTERVAL_SEC = 90;

function resolvePollIntervalSec(refreshIntervalSec: number, layout?: LayoutId): number {
  if (layout && LIVE_LAYOUTS.has(layout)) return LIVE_LAYOUT_POLL_INTERVAL_SEC;
  return clampRefreshInterval(refreshIntervalSec);
}

function resolveDisplayedAircraft(
  aircraft: FlightsApiResponse['aircraft'],
  settings: DisplaySettings
): {
  filteredAircraft: FlightsApiResponse['aircraft'];
  displayedAircraft: FlightsApiResponse['aircraft'];
  trackLabel: string | null;
  trackStatus: TrackStatus;
} {
  const trackTarget = buildTrackTarget(
    settings.trackAirline ?? '',
    settings.trackFlightNumber ?? ''
  );
  const trackActive = trackTarget != null;

  const filtered = trackActive
    ? aircraft
    : applyClientFilters(aircraft, settings);

  if (!trackActive || !trackTarget) {
    const sorted = sortByInterestingness(filtered);
    return {
      filteredAircraft: filtered,
      displayedAircraft: limitAircraft(sorted, settings.maxAircraft),
      trackLabel: null,
      trackStatus: 'off',
    };
  }

  const tracked = findTrackedAircraft(filtered, trackTarget);
  return {
    filteredAircraft: filtered,
    displayedAircraft: tracked ? [tracked] : [],
    trackLabel: trackTarget.displayLabel,
    trackStatus: tracked ? 'found' : 'not-found',
  };
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
  trackLabel: string | null;
  trackStatus: TrackStatus;
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
    trackLabel: null,
    trackStatus: 'off',
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
    const trackTarget = buildTrackTarget(
      current.trackAirline ?? '',
      current.trackFlightNumber ?? ''
    );
    const trackActive = trackTarget != null;

    setState((prev) => ({
      ...prev,
      status: prev.lastUpdated ? 'ready' : 'loading',
      errorMessage: null,
      trackLabel: trackTarget?.displayLabel ?? null,
      trackStatus: trackActive ? (prev.lastUpdated ? prev.trackStatus : 'searching') : 'off',
    }));

    try {
      const params = new URLSearchParams({
        lat: String(current.lat),
        lon: String(current.lon),
        radiusMi: String(current.radiusMi),
      });
      if (trackTarget) {
        params.set('callsign', trackTarget.icaoCallsign);
      }

      const res = await fetchWithTimeout(`/api/flights?${params.toString()}`);
      if (!res.ok) {
        const reason = await res
          .json()
          .then((body: { error?: string }) => body?.error)
          .catch(() => null);
        const err = new Error(reason || `Flight feed unavailable (${res.status})`);
        (err as Error & { httpStatus?: number }).httpStatus = res.status;
        throw err;
      }

      const data = (await res.json()) as FlightsApiResponse;
      const resolved = resolveDisplayedAircraft(data.aircraft, current);

      setState({
        aircraft: data.aircraft,
        filteredAircraft: resolved.filteredAircraft,
        displayedAircraft: resolved.displayedAircraft,
        status: navigator.onLine ? 'ready' : 'offline',
        lastUpdated: new Date(data.fetchedAt),
        source: data.source,
        provider: data.provider,
        errorMessage: null,
        trackLabel: resolved.trackLabel,
        trackStatus: resolved.trackStatus,
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
        trackStatus:
          trackActive && prev.trackStatus === 'searching' ? 'not-found' : prev.trackStatus,
      }));

      const httpStatus =
        err instanceof Error ? (err as Error & { httpStatus?: number }).httpStatus : undefined;
      if (httpStatus === 429) return RATE_LIMIT_POLL_INTERVAL_SEC;
    }

    return intervalSec;
  }, []);

  useEffect(() => {
    const reloadSettings = () => setSettings(loadSettings());
    reloadSettings();

    const controller = new AbortController();
    void fetchServerSettings(controller.signal).then((serverSettings) => {
      if (serverSettings) {
        cacheSettingsLocal(serverSettings);
        setSettings(serverSettings);
      }
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) reloadSettings();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(SETTINGS_CHANGED_EVENT, reloadSettings);
    return () => {
      controller.abort();
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
    settings.trackAirline,
    settings.trackFlightNumber,
  ]);

  useEffect(() => {
    setState((prev) => {
      if (prev.aircraft.length === 0) {
        const trackTarget = buildTrackTarget(
          settings.trackAirline ?? '',
          settings.trackFlightNumber ?? ''
        );
        return {
          ...prev,
          trackLabel: trackTarget?.displayLabel ?? null,
          trackStatus: trackTarget ? 'searching' : 'off',
        };
      }
      const resolved = resolveDisplayedAircraft(prev.aircraft, settings);
      return {
        ...prev,
        filteredAircraft: resolved.filteredAircraft,
        displayedAircraft: resolved.displayedAircraft,
        trackLabel: resolved.trackLabel,
        trackStatus: resolved.trackStatus,
      };
    });
  }, [settings]);

  return { ...state, settings, refresh };
}

export { isTrackModeActive };
