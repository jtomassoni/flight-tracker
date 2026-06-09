'use client';

import { useState } from 'react';
import { useFlightData } from '@/hooks/useFlightData';
import { useThemeRotation } from '@/hooks/useThemeRotation';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import type { ThemeId } from '@/lib/settings';
import { getTheme, THEME_IDS } from '@/lib/themes';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeDebugPanel from './ThemeDebugPanel';
import ThemeLayout from './layouts';

function stepTheme(current: ThemeId, direction: -1 | 1): ThemeId {
  const index = THEME_IDS.indexOf(current);
  const next = (index + direction + THEME_IDS.length) % THEME_IDS.length;
  return THEME_IDS[next];
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

  return (
    <ThemeProvider key={activeThemeId} themeId={activeThemeId}>
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

      <ThemeDebugPanel
        activeThemeId={activeThemeId}
        isManual={manualTheme !== null}
        autoRotateEnabled={settings.rotateThemes}
        onPrev={goPrev}
        onNext={goNext}
        onResumeAuto={() => setManualTheme(null)}
      />
    </ThemeProvider>
  );
}
