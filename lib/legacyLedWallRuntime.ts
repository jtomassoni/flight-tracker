import type { NormalizedAircraft } from '@/types/aircraft';
import {
  airlineLedLogoUrl,
  getAircraftDisplayBrand,
  getAirlineLedWallStyle,
} from '@/lib/airlines';
import {
  formatLedFlightId,
  formatLedOperatorTag,
  formatLedRouteHero,
  ledRouteLabel,
  ledTelemetryFields,
} from '@/lib/ledFlightWall';
import {
  ledGridForOrientation,
  ledWallRowCount,
  loadLedLogo,
  paintLedDots,
  renderLedBuffer,
  type LedFlightContent,
} from '@/lib/ledMatrix';
import type { IpadOrientation } from '@/lib/kiosk';

export function aircraftToLedContent(ac: NormalizedAircraft): LedFlightContent {
  const brand = getAircraftDisplayBrand(ac);
  const wallStyle = getAirlineLedWallStyle(brand);
  const routeLine = ledRouteLabel(ac);
  return {
    airlineName: brand.name,
    flightId: formatLedFlightId(ac, brand),
    operatorTag: formatLedOperatorTag(ac),
    routeHero: formatLedRouteHero(routeLine),
    telemetry: ledTelemetryFields(ac),
    logoUrl: airlineLedLogoUrl(brand),
    logoIcao: brand.icao,
    logoFallback: brand.iata,
    logoBackground: wallStyle.logoBackground,
    logoBorder: wallStyle.logoBorder,
    accentStripe: wallStyle.accentStripe,
    logoPalette: wallStyle.logoPalette,
    logoTileBorder: wallStyle.logoTileBorder,
  };
}

export type LedWallPainter = {
  draw: (content: LedFlightContent) => Promise<void>;
  resize: () => void;
  destroy: () => void;
};

export function detectOrientation(): IpadOrientation {
  return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
}

export function createLedWallPainter(canvas: HTMLCanvasElement): LedWallPainter {
  const buffer = document.createElement('canvas');
  const bufferCtx = buffer.getContext('2d', { willReadFrequently: true });
  let logo: HTMLImageElement | null = null;
  let currentContent: LedFlightContent | null = null;
  let logoUrl: string | undefined;
  let cancelled = false;

    function drawFrame() {
    if (!bufferCtx || cancelled || !currentContent) return;

    const orientation = detectOrientation();
    const { cols, rows: baseRows } = ledGridForOrientation(orientation);
    const dpr = window.devicePixelRatio || 1;
    // innerWidth/innerHeight — reliable on iPad 4 home-screen mode (getBoundingClientRect can lie).
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const rows = ledWallRowCount(cols, baseRows, width, height);
    if (buffer.width !== cols || buffer.height !== rows) {
      buffer.width = cols;
      buffer.height = rows;
    }

    const { logoRect } = renderLedBuffer(bufferCtx, cols, rows, currentContent, logo);
    const imageData = bufferCtx.getImageData(0, 0, cols, rows);
    const displayCtx = canvas.getContext('2d');
    if (!displayCtx) return;

    paintLedDots(displayCtx, imageData, width, height, logoRect, {
      fitFrame: false,
      logoBackground: currentContent.logoBackground,
      logoPalette: currentContent.logoPalette,
    });
  }

  return {
    async draw(content) {
      currentContent = content;
      const nextUrl = content.logoUrl;
      if (nextUrl !== logoUrl) {
        logoUrl = nextUrl;
        logo = nextUrl ? await loadLedLogo(nextUrl) : null;
      }
      if (!cancelled) drawFrame();
    },
    resize() {
      drawFrame();
    },
    destroy() {
      cancelled = true;
    },
  };
}

export const LegacyLedWall = {
  aircraftToLedContent,
  createLedWallPainter,
  detectOrientation,
};
