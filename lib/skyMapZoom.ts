import type { KioskViewport } from '@/hooks/useKioskViewport';

export type SkyMapZoomSettings = {
  /** Wall-mounted / large monitor */
  zoomWall: number;
  /** iPad / desk-sized display */
  zoomDesk: number;
  /** Phone / very small */
  zoomCompact: number;
  minZoom: number;
  maxZoom: number;
};

export const DEFAULT_SKY_MAP_ZOOM: SkyMapZoomSettings = {
  zoomWall: 10,
  zoomDesk: 9,
  zoomCompact: 8,
  minZoom: 7,
  maxZoom: 15,
};

const ABS_MIN = 5;
const ABS_MAX = 18;

function clampInt(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? Math.round(value) : fallback;
  return Math.min(ABS_MAX, Math.max(ABS_MIN, n));
}

export function normalizeSkyMapZoom(input?: Partial<SkyMapZoomSettings>): SkyMapZoomSettings {
  const base = { ...DEFAULT_SKY_MAP_ZOOM, ...input };
  let minZoom = clampInt(base.minZoom, DEFAULT_SKY_MAP_ZOOM.minZoom);
  let maxZoom = clampInt(base.maxZoom, DEFAULT_SKY_MAP_ZOOM.maxZoom);

  if (minZoom >= maxZoom) {
    minZoom = DEFAULT_SKY_MAP_ZOOM.minZoom;
    maxZoom = DEFAULT_SKY_MAP_ZOOM.maxZoom;
  }

  const clampZoom = (value: unknown, fallback: number) =>
    Math.min(maxZoom, Math.max(minZoom, clampInt(value, fallback)));

  return {
    minZoom,
    maxZoom,
    zoomWall: clampZoom(base.zoomWall, DEFAULT_SKY_MAP_ZOOM.zoomWall),
    zoomDesk: clampZoom(base.zoomDesk, DEFAULT_SKY_MAP_ZOOM.zoomDesk),
    zoomCompact: clampZoom(base.zoomCompact, DEFAULT_SKY_MAP_ZOOM.zoomCompact),
  };
}

export function skyMapZoomForViewport(
  zoom: SkyMapZoomSettings,
  viewport: KioskViewport
): number {
  if (viewport === 'wall') return zoom.zoomWall;
  if (viewport === 'desk') return zoom.zoomDesk;
  return zoom.zoomCompact;
}
