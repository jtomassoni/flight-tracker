'use client';

import { useEffect, useState } from 'react';
import { useFlightData } from '@/hooks/useFlightData';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type ThemeId } from '@/lib/settings';
import { parseTrackQuery } from '@/lib/callsignMatch';
import { getTheme, THEME_IDS, type LayoutId } from '@/lib/themes';
import ThemeProvider from '@/components/ThemeProvider';
import ScreenManager from './ScreenManager';
import AdminLink from './shared/AdminLink';
import ThemeDebugPanel from './ThemeDebugPanel';
import ThemeLayout from './layouts';

const isDev = process.env.NODE_ENV === 'development';

/** Stable empty list reference for the dev error-preview toggle. */
const EMPTY_AIRCRAFT: [] = [];

function stepTheme(current: ThemeId, direction: -1 | 1): ThemeId {
  const index = THEME_IDS.indexOf(current);
  const next = (index + direction + THEME_IDS.length) % THEME_IDS.length;
  return THEME_IDS[next];
}

export default function DisplayDashboard() {
  const [manualTheme, setManualTheme] = useState<ThemeId | null>(null);
  const [urlTheme, setUrlTheme] = useState<ThemeId | null>(null);
  const [embedded, setEmbedded] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [pollLayout, setPollLayout] = useState<LayoutId>(
    () => getTheme(DEFAULT_SETTINGS.theme).layout
  );

  const {
    displayedAircraft,
    filteredAircraft,
    aircraft,
    status,
    lastUpdated,
    source,
    provider,
    errorMessage,
    settings,
    refresh,
    trackLabel,
    trackStatus,
  } = useFlightData(pollLayout);

  // Shareable links: /display?airline=UA&flight=1234 or /display?track=UA1234
  // Admin embed: /display?embed=1&theme=flightwall
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const airline = params.get('airline');
    const flight = params.get('flight');
    const track = params.get('track');
    const parsed = track ? parseTrackQuery(track) : null;

    if ((airline && flight) || parsed) {
      const current = loadSettings();
      saveSettings({
        ...current,
        trackAirline: parsed?.airline ?? airline ?? '',
        trackFlightNumber: parsed?.flightNumber ?? flight ?? '',
      });
    }

    const themeParam = params.get('theme');
    if (themeParam && THEME_IDS.includes(themeParam as ThemeId)) {
      setUrlTheme(themeParam as ThemeId);
    }
    setEmbedded(params.get('embed') === '1');
  }, []);

  const activeThemeId = manualTheme ?? urlTheme ?? settings.theme;
  const theme = getTheme(activeThemeId);

  useEffect(() => {
    setPollLayout(theme.layout);
  }, [theme.layout]);

  // `previewError` is a dev-only toggle that forces every theme into its own
  // embedded "feed unavailable" state so it can be reviewed per theme. It mimics
  // a real outage: error status, no data, and a sample message.
  const effectiveStatus = previewError ? 'error' : status;
  const effectiveError = previewError
    ? 'Preview — this is how a live-feed outage looks in this theme.'
    : errorMessage;
  const effectiveDisplayed = previewError ? EMPTY_AIRCRAFT : displayedAircraft;
  const effectiveFiltered = previewError ? EMPTY_AIRCRAFT : filteredAircraft;
  const effectiveAll = previewError ? EMPTY_AIRCRAFT : aircraft;
  const featured = effectiveDisplayed[0] ?? null;

  const layout = (
    <ThemeLayout
      displayedAircraft={effectiveDisplayed}
      filteredAircraft={effectiveFiltered}
      allAircraft={effectiveAll}
      featured={featured}
      settings={settings}
      status={effectiveStatus}
      lastUpdated={lastUpdated}
      source={source}
      provider={provider}
      errorMessage={effectiveError}
      onRefresh={refresh}
      theme={theme}
      trackLabel={previewError ? null : trackLabel}
      trackStatus={previewError ? 'off' : trackStatus}
    />
  );

  return (
    <>
      <ScreenManager settings={settings} />
      <ThemeProvider key={activeThemeId} themeId={activeThemeId}>
        <div className="h-full w-full">{layout}</div>
        {!embedded && <AdminLink />}
      </ThemeProvider>

      {isDev && !embedded && (
        <ThemeDebugPanel
          activeThemeId={activeThemeId}
          isManual={manualTheme !== null}
          previewError={previewError}
          onTogglePreviewError={() => setPreviewError((on) => !on)}
          onPrev={() => setManualTheme((prev) => stepTheme(prev ?? activeThemeId, -1))}
          onNext={() => setManualTheme((prev) => stepTheme(prev ?? activeThemeId, 1))}
        />
      )}
    </>
  );
}
