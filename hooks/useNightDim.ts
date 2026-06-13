'use client';

import { useEffect, useState } from 'react';
import { resolveDimOpacity } from '@/lib/nightDim';
import type { DisplaySettings } from '@/lib/settings';

/**
 * Returns the current night-dim overlay opacity (0–1) based on the configured
 * window, recomputing once a minute so the screen dims/brightens on schedule.
 */
export function useNightDim(settings: DisplaySettings): number {
  const { nightDimEnabled, nightDimStart, nightDimEnd, nightDimLevel } = settings;
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const compute = () =>
      setOpacity(
        resolveDimOpacity({
          enabled: nightDimEnabled,
          start: nightDimStart,
          end: nightDimEnd,
          level: nightDimLevel,
        })
      );

    compute();
    const timer = setInterval(compute, 60_000);
    return () => clearInterval(timer);
  }, [nightDimEnabled, nightDimStart, nightDimEnd, nightDimLevel]);

  return opacity;
}
