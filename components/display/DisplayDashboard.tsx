'use client';

import { useEffect, useState } from 'react';
import { KioskPreviewProvider } from '@/contexts/KioskPreviewContext';
import { useFlightData } from '@/hooks/useFlightData';
import { useThemeRotation } from '@/hooks/useThemeRotation';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import type { IpadOrientation } from '@/lib/kiosk';
import { loadSettings, saveSettings, type ThemeId } from '@/lib/settings';
import { getTheme, THEME_IDS, type LayoutId } from '@/lib/themes';
import ThemeProvider from '@/components/ThemeProvider';
import IpadPreviewFrame from './IpadPreviewFrame';
import AdminLink from './shared/AdminLink';
import ThemeDebugPanel from './ThemeDebugPanel';
import ThemeLayout from './layouts';
import './ipad-preview.css';

const isDev = process.env.NODE_ENV === 'development';

function stepTheme(current: ThemeId, direction: -1 | 1): ThemeId {
  const index = THEME_IDS.indexOf(current);
  const next = (index + direction + THEME_IDS.length) % THEME_IDS.length;
  return THEME_IDS[next];
}

export default function DisplayDashboard() {
  const [manualTheme, setManualTheme] = useState<ThemeId | null>(null);
  const [ipadPreview, setIpadPreview] = useState(false);
  const [ipadOrientation, setIpadOrientation] = useState<IpadOrientation>('landscape');
  const [pollLayout, setPollLayout] = useState<LayoutId>(
    () => getTheme(loadSettings().theme).layout
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
  } = useFlightData(pollLayout);

  const rotatedTheme = useThemeRotation(
    settings.rotateThemes && manualTheme === null,
    settings.theme,
    THEME_ROTATION_SEC
  );

  const activeThemeId = manualTheme ?? rotatedTheme;
  const theme = getTheme(activeThemeId);

  useEffect(() => {
    setPollLayout(theme.layout);
  }, [theme.layout]);

  const featured = displayedAircraft[0] ?? null;

  const layout = (
    <ThemeLayout
      displayedAircraft={displayedAircraft}
      filteredAircraft={filteredAircraft}
      allAircraft={aircraft}
      featured={featured}
      settings={settings}
      status={status}
      lastUpdated={lastUpdated}
      source={source}
      provider={provider}
      errorMessage={errorMessage}
      onRefresh={refresh}
      theme={theme}
    />
  );

  return (
    <>
      <ThemeProvider key={activeThemeId} themeId={activeThemeId}>
        <KioskPreviewProvider enabled={ipadPreview} orientation={ipadOrientation}>
          <div className="h-full w-full">
            {ipadPreview ? (
              <IpadPreviewFrame orientation={ipadOrientation}>{layout}</IpadPreviewFrame>
            ) : (
              layout
            )}
          </div>
          <AdminLink />
        </KioskPreviewProvider>
      </ThemeProvider>

      {isDev && (
        <ThemeDebugPanel
          activeThemeId={activeThemeId}
          isManual={manualTheme !== null}
          autoRotateEnabled={settings.rotateThemes}
          ipadPreview={ipadPreview}
          ipadOrientation={ipadOrientation}
          onToggleIpadPreview={() => setIpadPreview((on) => !on)}
          onRotateIpad={() =>
            setIpadOrientation((o) => (o === 'landscape' ? 'portrait' : 'landscape'))
          }
          onPrev={() => setManualTheme((prev) => stepTheme(prev ?? activeThemeId, -1))}
          onNext={() => setManualTheme((prev) => stepTheme(prev ?? activeThemeId, 1))}
          onToggleAutoRotate={() => {
            const next = !settings.rotateThemes;
            saveSettings({ ...settings, rotateThemes: next });
            if (next) setManualTheme(null);
          }}
          onResumeAuto={() => setManualTheme(null)}
        />
      )}
    </>
  );
}
