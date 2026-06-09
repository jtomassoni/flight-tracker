'use client';

import { useEffect, useState } from 'react';
import { THEME_ROTATION_SEC } from '@/lib/constants';
import type { ThemeId } from '@/lib/settings';
import { THEME_IDS } from '@/lib/themes';

export function useThemeRotation(
  enabled: boolean,
  startTheme: ThemeId,
  intervalSec = THEME_ROTATION_SEC
): ThemeId {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(startTheme);

  useEffect(() => {
    if (!enabled) {
      setActiveTheme(startTheme);
      return;
    }

    let index = THEME_IDS.indexOf(startTheme);
    if (index < 0) index = 0;
    setActiveTheme(THEME_IDS[index]);

    const timer = setInterval(() => {
      index = (index + 1) % THEME_IDS.length;
      setActiveTheme(THEME_IDS[index]);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [enabled, startTheme, intervalSec]);

  return enabled ? activeTheme : startTheme;
}
