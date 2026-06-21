'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FlightsApiResponse } from '@/types/aircraft';
import type { TrackStatus } from '@/types/display';
import {
  LIVE_LAYOUT_POLL_INTERVAL_SEC,
  RADAR_SWEEP_DURATION_SEC,
  SETTINGS_CHANGED_EVENT,
  SETTINGS_STORAGE_KEY,
  SKY_MAP_POLL_INTERVAL_SEC,
  SPLIT_FLAP_POLL_INTERVAL_SEC,
} from '@/lib/constants';
import { applyClientFilters } from '@/lib/filters';
import { isAirborne } from '@/lib/aircraftUtils';
import { limitAircraft, sortByInterestingness } from '@/lib/sorting';
import {
  buildTrackTarget,
  findTrackedAircraft,
  isTrackModeActive,
} from '@/lib/callsignMatch';
import {
  applyDisplayHold,
  EMPTY_DISPLAY_HOLD,
  type DisplayHoldState,
} from '@/lib/displayHold';
import {
  cacheSettingsLocal,
  clampRefreshInterval,
  DEFAULT_SETTINGS,
  fetchServerSettings,
  loadSettings,
  reconcileServerSettings,
  saveSettings,
  type DisplaySettings,
} from '@/lib/settings';
import {
  resolveTrackWatchAfterPoll,
  trackWatchKey,
} from '@/lib/trackWatch';
import { FetchTimeoutError, fetchWithTimeout } from '@/lib/fetchWithTimeout';
import type { LayoutId } from '@/lib/themes';

const LIVE_LAYOUTS = new Set<LayoutId>(['radar-scope', 'google-map', 'led-matrix']);
/** Layouts that trigger their own poll cadence (e.g. radar sweep). */
const LAYOUT_DRIVEN_POLL = new Set<LayoutId>(['radar-scope']);

const RATE_LIMIT_POLL_INTERVAL_SEC = 90;

function resolvePollIntervalSec(refreshIntervalSec: number, layout?: LayoutId): number {
  if (layout === 'google-map') return SKY_MAP_POLL_INTERVAL_SEC;
  if (layout === 'split-flap-board') return SPLIT_FLAP_POLL_INTERVAL_SEC;
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
  const airborneTracked = tracked && isAirborne(tracked) ? tracked : null;
  return {
    filteredAircraft: filtered,
    displayedAircraft: airborneTracked ? [airborneTracked] : [],
    trackLabel: trackTarget.displayLabel,
    trackStatus: airborneTracked ? 'found' : 'not-found',
  };
}

function withDisplayHold(
  resolved: ReturnType<typeof resolveDisplayedAircraft>,
  holdState: DisplayHoldState,
  settings: DisplaySettings
): {
  holdState: DisplayHoldState;
  filteredAircraft: FlightsApiResponse['aircraft'];
  displayedAircraft: FlightsApiResponse['aircraft'];
  trackLabel: string | null;
  trackStatus: TrackStatus;
} {
  const held = applyDisplayHold(resolved.displayedAircraft, holdState, settings);
  const trackTarget = buildTrackTarget(
    settings.trackAirline ?? '',
    settings.trackFlightNumber ?? ''
  );

  let trackStatus = resolved.trackStatus;
  if (
    trackTarget &&
    resolved.displayedAircraft.length === 0 &&
    held.displayed.length > 0 &&
    findTrackedAircraft(held.displayed, trackTarget)
  ) {
    trackStatus = 'found';
  }

  return {
    holdState: { held: held.held, contextKey: held.contextKey },
    filteredAircraft: resolved.filteredAircraft,
    displayedAircraft: held.displayed,
    trackLabel: resolved.trackLabel,
    trackStatus,
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

  const holdRef = useRef<DisplayHoldState>(EMPTY_DISPLAY_HOLD);
  const trackWasAirborneRef = useRef(false);
  const trackWatchKeyRef = useRef('');

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
      if (pollLayoutRef.current === 'google-map') {
        params.set('minFreshSec', String(SKY_MAP_POLL_INTERVAL_SEC));
      }
      if (pollLayoutRef.current === 'radar-scope') {
        params.set('minFreshSec', String(RADAR_SWEEP_DURATION_SEC));
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

      let activeSettings = current;
      const watchKey = trackWatchKey(current);
      if (trackWatchKeyRef.current !== watchKey) {
        trackWatchKeyRef.current = watchKey;
        trackWasAirborneRef.current = false;
      }

      if (watchKey) {
        const watchResult = resolveTrackWatchAfterPoll(
          data.aircraft,
          activeSettings,
          trackWasAirborneRef.current
        );
        trackWasAirborneRef.current = watchResult.wasAirborne;
        if (watchResult.cleared) {
          activeSettings = watchResult.settings;
          saveSettings(activeSettings);
          settingsRef.current = activeSettings;
          setSettings(activeSettings);
          holdRef.current = EMPTY_DISPLAY_HOLD;
          trackWatchKeyRef.current = '';
        }
      }

      const resolved = resolveDisplayedAircraft(data.aircraft, activeSettings);
      const withHold = withDisplayHold(resolved, holdRef.current, activeSettings);
      holdRef.current = withHold.holdState;

      setState({
        aircraft: data.aircraft,
        filteredAircraft: withHold.filteredAircraft,
        displayedAircraft: withHold.displayedAircraft,
        status: navigator.onLine ? 'ready' : 'offline',
        lastUpdated: new Date(data.fetchedAt),
        source: data.source,
        provider: data.provider,
        errorMessage: null,
        trackLabel: withHold.trackLabel,
        trackStatus: withHold.trackStatus,
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
    void fetchServerSettings(controller.signal).then((payload) => {
      if (!payload) return;
      const action = reconcileServerSettings(payload);
      if (action === 'push-local') {
        saveSettings(loadSettings());
        return;
      }
      if (action === 'apply') {
        cacheSettingsLocal(payload.settings);
        setSettings(payload.settings);
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

    const layoutDriven = pollLayout != null && LAYOUT_DRIVEN_POLL.has(pollLayout);

    const poll = async () => {
      const intervalSec = await refresh();
      if (!cancelled && !layoutDriven) {
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
      const withHold = withDisplayHold(resolved, holdRef.current, settings);
      holdRef.current = withHold.holdState;
      return {
        ...prev,
        filteredAircraft: withHold.filteredAircraft,
        displayedAircraft: withHold.displayedAircraft,
        trackLabel: withHold.trackLabel,
        trackStatus: withHold.trackStatus,
      };
    });
  }, [settings]);

  return { ...state, settings, refresh };
}

export { isTrackModeActive };
