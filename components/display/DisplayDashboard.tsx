'use client';

import { useState } from 'react';
import { KioskPreviewProvider } from '@/contexts/KioskPreviewContext';
import { useFlightData } from '@/hooks/useFlightData';
import { useThemeRotation } from '@/hooks/useThemeRotation';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import type { IpadOrientation } from '@/lib/kiosk';
import type { ThemeId } from '@/lib/settings';
import { getTheme, THEME_IDS } from '@/lib/themes';
import ThemeProvider from '@/components/ThemeProvider';
import IpadPreviewFrame from './IpadPreviewFrame';
import ThemeDebugPanel from './ThemeDebugPanel';
import ThemeLayout from './layouts';
import './ipad-preview.css';

function stepTheme(current: ThemeId, direction: -1 | 1): ThemeId {
  const index = THEME_IDS.indexOf(current);
  const next = (index + direction + THEME_IDS.length) % THEME_IDS.length;
  return THEME_IDS[next];
}

function DisplayContent({
  displayedAircraft,
  filteredAircraft,
  aircraft,
  featured,
  settings,
  status,
  lastUpdated,
  source,
  provider,
  errorMessage,
  refresh,
  theme,
}: {
  displayedAircraft: ReturnType<typeof useFlightData>['displayedAircraft'];
  filteredAircraft: ReturnType<typeof useFlightData>['filteredAircraft'];
  aircraft: ReturnType<typeof useFlightData>['aircraft'];
  featured: ReturnType<typeof useFlightData>['displayedAircraft'][0] | null;
  settings: ReturnType<typeof useFlightData>['settings'];
  status: ReturnType<typeof useFlightData>['status'];
  lastUpdated: ReturnType<typeof useFlightData>['lastUpdated'];
  source: ReturnType<typeof useFlightData>['source'];
  provider: ReturnType<typeof useFlightData>['provider'];
  errorMessage: ReturnType<typeof useFlightData>['errorMessage'];
  refresh: ReturnType<typeof useFlightData>['refresh'];
  theme: ReturnType<typeof getTheme>;
}) {
  return (
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
}

export default function DisplayDashboard() {
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
  } = useFlightData();

  const [manualTheme, setManualTheme] = useState<ThemeId | null>(null);
  const [ipadPreview, setIpadPreview] = useState(false);
  const [ipadOrientation, setIpadOrientation] = useState<IpadOrientation>('landscape');

  const rotatedTheme = useThemeRotation(
    settings.rotateThemes && manualTheme === null,
    settings.theme,
    THEME_ROTATION_SEC
  );

  const activeThemeId = manualTheme ?? rotatedTheme;
  const theme = getTheme(activeThemeId);
  const featured = displayedAircraft[0] ?? null;

  const goPrev = () => {
    setManualTheme((prev) => stepTheme(prev ?? activeThemeId, -1));
  };

  const goNext = () => {
    setManualTheme((prev) => stepTheme(prev ?? activeThemeId, 1));
  };

  const toggleIpadPreview = () => setIpadPreview((on) => !on);

  const rotateIpad = () => {
    setIpadOrientation((o) => (o === 'landscape' ? 'portrait' : 'landscape'));
  };

  const contentProps = {
    displayedAircraft,
    filteredAircraft,
    aircraft,
    featured,
    settings,
    status,
    lastUpdated,
    source,
    provider,
    errorMessage,
    refresh,
    theme,
  };

  return (
    <ThemeProvider key={activeThemeId} themeId={activeThemeId}>
      <KioskPreviewProvider enabled={ipadPreview} orientation={ipadOrientation}>
        {ipadPreview ? (
          <IpadPreviewFrame orientation={ipadOrientation}>
            <div className="display-shell h-full w-full">
              <DisplayContent {...contentProps} />
            </div>
          </IpadPreviewFrame>
        ) : (
          <div className="display-shell h-full w-full">
            <DisplayContent {...contentProps} />
          </div>
        )}

        <ThemeDebugPanel
          activeThemeId={activeThemeId}
          isManual={manualTheme !== null}
          autoRotateEnabled={settings.rotateThemes}
          ipadPreview={ipadPreview}
          ipadOrientation={ipadOrientation}
          onToggleIpadPreview={toggleIpadPreview}
          onRotateIpad={rotateIpad}
          onPrev={goPrev}
          onNext={goNext}
          onResumeAuto={() => setManualTheme(null)}
        />
      </KioskPreviewProvider>
    </ThemeProvider>
  );
}
