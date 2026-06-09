'use client';

import { useKioskPreview } from '@/contexts/KioskPreviewContext';
import { useMediaQuery } from './useMediaQuery';
import type { IpadOrientation } from '@/lib/kiosk';

export function useKioskOrientation(): IpadOrientation {
  const preview = useKioskPreview();
  const isPortrait = useMediaQuery('(orientation: portrait)');
  if (preview.enabled) return preview.orientation;
  return isPortrait ? 'portrait' : 'landscape';
}
