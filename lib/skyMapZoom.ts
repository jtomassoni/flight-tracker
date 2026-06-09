import type { KioskViewport } from '@/hooks/useKioskViewport';

export type SkyMapZoomMode = 'normal' | 'close';

export const DEFAULT_SKY_MAP_ZOOM: SkyMapZoomMode = 'normal';

const ZOOM_BY_MODE: Record<SkyMapZoomMode, Record<KioskViewport, number>> = {
  normal: { wall: 10, desk: 11, compact: 8 },
  close: { wall: 12, desk: 12, compact: 10 },
};

const MAP_MIN_ZOOM = 7;
const MAP_MAX_ZOOM = 15;

export function normalizeSkyMapZoom(input?: unknown): SkyMapZoomMode {
  if (input === 'close' || input === 'normal') return input;
  return DEFAULT_SKY_MAP_ZOOM;
}

export function skyMapZoomForViewport(mode: SkyMapZoomMode, viewport: KioskViewport): number {
  return ZOOM_BY_MODE[mode][viewport];
}

export function skyMapZoomLimits(): { minZoom: number; maxZoom: number } {
  return { minZoom: MAP_MIN_ZOOM, maxZoom: MAP_MAX_ZOOM };
}
