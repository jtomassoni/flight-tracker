'use client';

import { useMediaQuery } from './useMediaQuery';
import type { IpadOrientation } from '@/lib/kiosk';

export function useKioskOrientation(): IpadOrientation {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}
