'use client';

import { useEffectiveKioskViewport } from '@/contexts/KioskPreviewContext';
import { useMediaQuery } from './useMediaQuery';

export type KioskViewport = 'compact' | 'desk' | 'wall';

function useWindowKioskViewport(): KioskViewport {
  const isCompact = useMediaQuery('(max-width: 639px)');
  const isDesk = useMediaQuery('(max-width: 1279px)');
  if (isCompact) return 'compact';
  if (isDesk) return 'desk';
  return 'wall';
}

/** compact = phone, desk = iPad / small monitor, wall = large wall-mounted display */
export function useKioskViewport(): KioskViewport {
  const windowViewport = useWindowKioskViewport();
  return useEffectiveKioskViewport(windowViewport);
}
