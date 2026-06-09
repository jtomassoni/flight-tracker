'use client';

import { useKioskOrientation } from './useKioskOrientation';
import { useKioskViewport } from './useKioskViewport';

/** Shared layout density rules for iPad / desk vs wall displays */
export function useLayoutDensity() {
  const viewport = useKioskViewport();
  const orientation = useKioskOrientation();
  const isDeskPortrait = viewport === 'desk' && orientation === 'portrait';

  return {
    viewport,
    orientation,
    isDeskPortrait,
    panelCount:
      viewport === 'compact' || isDeskPortrait
        ? 1
        : viewport === 'desk'
          ? 2
          : 4,
    galleryCols:
      viewport === 'compact' || isDeskPortrait
        ? 'grid-cols-1'
        : viewport === 'desk'
          ? 'grid-cols-2'
          : 'grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
    trafficCols:
      viewport === 'compact' || isDeskPortrait
        ? 'grid-cols-2'
        : viewport === 'desk'
          ? 'grid-cols-3'
          : 'grid-cols-4 xl:grid-cols-5',
    flapDestChars:
      viewport === 'compact' || isDeskPortrait ? 8 : viewport === 'desk' ? 10 : 14,
    showGalleryStats: viewport !== 'desk',
    showRadarSidebar: viewport !== 'compact',
  };
}
