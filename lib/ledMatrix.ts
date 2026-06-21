import type { IpadOrientation } from '@/lib/kiosk';
import {
  drawLedTextCompact,
  drawLedTextCompactRight,
  drawLedTextRight,
  drawLedTextScaled,
  LED_FONT,
  ledCharCellH,
  ledCompactCellH,
  ledCompactCellW,
  ledScaledTextMetrics,
  measureLedTextCompact,
  pickFlightIdScale,
  pickStatsPairScale,
  pickWallFlightIdScale,
  pickTelemetryScale,
  truncateLedTextCompact,
  truncateLedTextScaled,
} from '@/lib/ledFont';
import { drawLedAirlineMark } from '@/lib/ledAirlineMarks';
import {
  drawLedAircraftIcon,
  LED_PROGRESS_PLANE_H,
  LED_PROGRESS_PLANE_KIND,
  LED_PROGRESS_PLANE_W,
} from '@/lib/ledAircraftIcons';
import type { LedTelemetryEmphasis, LedTelemetryField } from '@/lib/ledFlightWall';

/**
 * FlightWall desk panel resolution — scaled up 15% in BOTH axes (128×32→147×37,
 * 64×64→74×74) for finer letter/number/logo rendering. Keeping both dimensions in
 * step preserves the panel aspect ratio (4:1 landscape, 1:1 portrait) so logos and
 * text hold the same screen real estate. On true wall displays rows auto-expand past
 * this minimum to keep LED cells square.
 */
export const LED_GRID = {
  landscape: { cols: 147, rows: 37 },
  portrait: { cols: 74, rows: 74 },
} as const;

/** Cool blue/white phosphor tiers — each tier maps to a semantic role on the panel. */
export const LED_COLORS = {
  /** Bright white — primary kinetic readouts (speed) and flight ID. */
  hero: '#ffffff',
  /** Cool off-white — altitude and origin labels. */
  phosphor: '#d4e2ec',
  /** Sky cyan — live phase (LANDING) and route accent (destination, progress). */
  telemetry: '#58b8e8',
  /** Steel blue-gray — static metadata (aircraft type) and unflown route track. */
  dim: '#7d96a8',
  muted: '#4a5c68',
  track: '#243848',
  panel: '#000000',
  unlit: '#0a0a0a',
} as const;


function ledEmphasisColor(emphasis?: LedTelemetryEmphasis): string {
  switch (emphasis) {
    case 'primary':
      return LED_COLORS.hero;
    case 'status':
      return LED_COLORS.telemetry;
    case 'measure':
      return LED_COLORS.phosphor;
    case 'secondary':
    default:
      return LED_COLORS.dim;
  }
}

/** Logo mark pixels below this alpha are treated as tile background. */
const LOGO_MARK_ALPHA = 140;
/** Quantize logo RGB to discrete LED phosphor steps — kills anti-alias fringe. */
const LOGO_QUANT_STEP = 51;
/** Inset Kiwi PNG sampling to skip opaque white padding at asset edges. */
const LOGO_SRC_INSET = 0.07;

export type LedFlightContent = {
  airlineName: string;
  flightId: string;
  /** Regional operator code (e.g. SKW) for partner-flown mainline flights. */
  operatorTag?: string;
  routeHero: string;
  /** 0–1 fraction of the route flown (origin→destination); null when unknown. */
  routeProgress?: number | null;
  telemetry: LedTelemetryField[];
  logoUrl?: string;
  logoIcao: string;
  logoFallback: string;
  logoBackground: string;
  logoBorder: string;
  accentStripe: string;
  logoPalette?: readonly string[];
  logoTileBorder?: boolean;
};

const LED_TELEMETRY_COUNT = 2;

export function ledGridForOrientation(orientation: IpadOrientation) {
  return LED_GRID[orientation];
}

/**
 * Wall displays add rows so each LED stays square (cell = viewport width / cols).
 * e.g. 147×37 on 16:9 → 147×83 — no vertical stretch.
 */
export function ledWallRowCount(
  cols: number,
  baseRows: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  if (viewportWidth <= 0 || viewportHeight <= 0) return baseRows;
  const cellSize = viewportWidth / cols;
  return Math.max(baseRows, Math.ceil(viewportHeight / cellSize));
}

type LayoutRegion = {
  pad: number;
  logoW: number;
  logoH: number;
  logoX: number;
  logoY: number;
  mainX: number;
  mainW: number;
  telX: number;
  telW: number;
  flightX: number;
  flightBandH: number;
  flightW: number;
  flightTopInset: number;
  dividerX: number;
  bandTop: number;
  bandH: number;
  /** Full-width top band: origin · progress · destination (replaces flight number). */
  headerX: number;
  headerY: number;
  headerW: number;
  headerH: number;
  routeZoneTop: number;
  routeZoneH: number;
  statsZoneTop: number;
  statsZoneH: number;
  useStackedRoute: boolean;
  statsUseFullFont: boolean;
  wall: boolean;
};

/** Black panel margin left of the logo tile (LED pixels). */
const LOGO_LEFT_INSET = 2;
/** Margin right of the logo tile within the logo column. */
const LOGO_RIGHT_INSET = 1;
/** Margin above the logo tile (below the flight-ID band). */
const LOGO_TOP_INSET = 1;
/** Black panel rows between the logo and the bottom edge. */
const LOGO_BOTTOM_GAP = 2;

/** Gap between logo column and right flight-info column (LED pixels). */
const RIGHT_COL_GAP = 4;
/** Horizontal inset inside the right column text band. */
const RIGHT_COL_PAD = 3;
/** Inset inside the logo-aligned right column band. */
const RIGHT_BAND_INSET = 3;

/** Logo column — leaves room for a hero route stack on the right. */
const LOGO_WIDTH_FRACTION = 0.4;

/** Portrait iPad — wider column so the logo tile can fill the left band. */
const PORTRAIT_LOGO_WIDTH_FRACTION = 0.52;

/** Wall displays — wider logo column and larger tile. */
const WALL_LOGO_WIDTH_FRACTION = 0.48;
const WALL_LOGO_SIZE_SCALE = 1;
const WALL_FLIGHT_TOP_INSET = 1;

/** Logo tile size relative to the max square that fits the column. */
const LOGO_SIZE_SCALE = 1;

function isWallDisplay(rows: number): boolean {
  return rows > LED_GRID.landscape.rows + 4;
}

function isPortraitPanel(cols: number, rows: number): boolean {
  return cols < rows * 1.6;
}

/** Top header: airport codes + progress track with plane marker. */
const HEADER_ROW_H = ledCharCellH() + LED_PROGRESS_PLANE_H + 3;

function computeLogoColumnWidth(cols: number, widthFraction = LOGO_WIDTH_FRACTION): number {
  return Math.max(12, Math.floor(cols * widthFraction));
}

/** Left column: route header band on top, logo square filling the column below. */
function computeLogoColumn(cols: number, rows: number) {
  const wall = isWallDisplay(rows);
  const portrait = isPortraitPanel(cols, rows);
  const widthFraction = wall
    ? WALL_LOGO_WIDTH_FRACTION
    : portrait
      ? PORTRAIT_LOGO_WIDTH_FRACTION
      : LOGO_WIDTH_FRACTION;
  const columnW = computeLogoColumnWidth(cols, widthFraction);
  const headerH = HEADER_ROW_H;
  const logoBandW = columnW - LOGO_LEFT_INSET - LOGO_RIGHT_INSET;
  const logoBandH = rows - headerH - LOGO_TOP_INSET - LOGO_BOTTOM_GAP;
  const sizeScale = wall ? WALL_LOGO_SIZE_SCALE : LOGO_SIZE_SCALE;

  const maxSide = Math.min(logoBandW, logoBandH);
  let logoW = Math.max(12, Math.floor(maxSide * sizeScale));
  logoW = Math.min(logoW, logoBandW);
  const logoH = logoW;
  const logoY =
    headerH +
    LOGO_TOP_INSET +
    Math.max(0, Math.floor((logoBandH - logoH) / 2));

  return {
    columnW,
    logoW,
    logoH,
    logoX: LOGO_LEFT_INSET,
    logoY,
    flightX: LOGO_LEFT_INSET,
    flightBandH: headerH,
    flightW: wall ? logoBandW : logoW,
    flightTopInset: wall ? WALL_FLIGHT_TOP_INSET : 1,
  };
}

function centerLedTextXScaled(
  text: string,
  bandX: number,
  bandW: number,
  scaleX: number
): number {
  const display = truncateLedTextScaled(text, bandW, scaleX);
  const { width } = ledScaledTextMetrics(display, scaleX, 1);
  return bandX + Math.max(0, Math.floor((bandW - width) / 2));
}

/** Split route hero into origin / destination for stacked departure-board layout. */
function parseLedRouteHero(hero: string): { origin: string; dest: string } {
  const arrow = hero.indexOf('→');
  if (arrow >= 0) {
    return {
      origin: hero.slice(0, arrow).trim(),
      dest: hero.slice(arrow + 1).trim(),
    };
  }
  const asciiArrow = hero.indexOf('->');
  if (asciiArrow >= 0) {
    return {
      origin: hero.slice(0, asciiArrow).trim(),
      dest: hero.slice(asciiArrow + 2).trim(),
    };
  }
  const hyphen = hero.indexOf('-');
  if (hyphen >= 0) {
    return {
      origin: hero.slice(0, hyphen).trim(),
      dest: hero.slice(hyphen + 1).trim(),
    };
  }
  return { origin: hero.trim(), dest: '' };
}

/**
 * Stats zone: phase hero (type overlays top-left) · alt/speed pair on one baseline.
 */
function buildRightContentLayout(
  rows: number,
  headerBottom: number,
  options?: { wall?: boolean }
): Pick<
  LayoutRegion,
  | 'bandTop'
  | 'bandH'
  | 'routeZoneTop'
  | 'routeZoneH'
  | 'statsZoneTop'
  | 'statsZoneH'
  | 'useStackedRoute'
  | 'statsUseFullFont'
  | 'wall'
> {
  const wall = options?.wall ?? false;
  const bandTop = headerBottom + 1;
  const bandBottom = rows - 1;
  const bandH = Math.max(ledCompactCellH() * 2, bandBottom - bandTop);

  return {
    bandTop,
    bandH,
    routeZoneTop: bandTop,
    routeZoneH: 0,
    statsZoneTop: bandTop,
    statsZoneH: bandH,
    useStackedRoute: false,
    statsUseFullFont: wall || bandH >= ledCharCellH() + 1,
    wall,
  };
}

function buildLandscapeLayout(cols: number, rows: number): LayoutRegion {
  const pad = 1;
  const logo = computeLogoColumn(cols, rows);
  const wall = isWallDisplay(rows);
  const dividerX = logo.columnW + 1;
  const mainX = logo.columnW + RIGHT_COL_GAP + RIGHT_COL_PAD;
  const mainW = cols - mainX - pad - RIGHT_COL_PAD;
  const headerY = wall ? WALL_FLIGHT_TOP_INSET : 1;
  const headerH = logo.flightBandH;
  const headerBottom = headerY + headerH;
  const rightLayout = buildRightContentLayout(rows, headerBottom, { wall });

  return {
    pad,
    logoW: logo.logoW,
    logoH: logo.logoH,
    logoX: logo.logoX,
    logoY: logo.logoY,
    mainX,
    mainW,
    telX: mainX,
    telW: mainW,
    flightX: logo.flightX,
    flightBandH: logo.flightBandH,
    flightW: logo.flightW,
    flightTopInset: logo.flightTopInset,
    dividerX,
    headerX: pad,
    headerY,
    headerW: cols - 2 * pad,
    headerH,
    ...rightLayout,
  };
}

function buildPortraitLayout(cols: number, rows: number): LayoutRegion {
  return buildLandscapeLayout(cols, rows);
}

function drawLogoTileBackground(
  ctx: CanvasRenderingContext2D,
  layout: Pick<LayoutRegion, 'logoX' | 'logoY' | 'logoW' | 'logoH'>,
  background: string
): void {
  const { logoX, logoY, logoW, logoH } = layout;
  ctx.fillStyle = background;
  ctx.fillRect(logoX, logoY, logoW, logoH);
}

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function quantizeChannel(value: number): number {
  const q = Math.round(value / LOGO_QUANT_STEP) * LOGO_QUANT_STEP;
  return Math.max(0, Math.min(255, q));
}

function quantizeRgb(r: number, g: number, b: number): { r: number; g: number; b: number } {
  return {
    r: quantizeChannel(r),
    g: quantizeChannel(g),
    b: quantizeChannel(b),
  };
}

function colorLuminance(c: { r: number; g: number; b: number }): number {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

/** Snap a logo pixel to the nearest brand fill — kills CDN gradient fringe. */
function snapLogoColor(
  r: number,
  g: number,
  b: number,
  bg: { r: number; g: number; b: number },
  bgHex: string,
  palette?: readonly string[]
): string {
  const sample = { r, g, b };
  if (rgbDistance(sample, bg) < 42) {
    return bgHex;
  }

  if (palette && palette.length === 2) {
    const a = parseHexColor(palette[0]!);
    const bColor = parseHexColor(palette[1]!);
    const lumA = colorLuminance(a);
    const lumB = colorLuminance(bColor);
    const lightHex = lumA >= lumB ? palette[0]! : palette[1]!;
    const darkHex = lumA >= lumB ? palette[1]! : palette[0]!;
    const mid = (lumA + lumB) / 2;
    return colorLuminance(sample) >= mid ? lightHex : darkHex;
  }

  if (palette && palette.length > 0) {
    let best = palette[0]!;
    let bestDist = Infinity;
    for (const hex of palette) {
      const c = parseHexColor(hex);
      const d = rgbDistance(sample, c);
      if (d < bestDist) {
        bestDist = d;
        best = hex;
      }
    }
    return best;
  }

  const q = quantizeRgb(r, g, b);
  return rgbDistance(q, bg) < 42 ? bgHex : rgbToHex(q.r, q.g, q.b);
}

function rgbDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function blendOnBackground(
  r: number,
  g: number,
  b: number,
  a: number,
  bg: { r: number; g: number; b: number }
): { r: number; g: number; b: number } {
  const t = a / 255;
  return {
    r: Math.round(r * t + bg.r * (1 - t)),
    g: Math.round(g * t + bg.g * (1 - t)),
    b: Math.round(b * t + bg.b * (1 - t)),
  };
}

function readLogoSource(logo: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = logo.naturalWidth;
  canvas.height = logo.naturalHeight;
  const srcCtx = canvas.getContext('2d');
  if (!srcCtx) {
    return new ImageData(1, 1);
  }
  srcCtx.drawImage(logo, 0, 0);
  return srcCtx.getImageData(0, 0, canvas.width, canvas.height);
}

/** One buffer cell = one LED; nearest-neighbor sample + hard quantize (no PNG fringe). */
function rasterizeLogoToTile(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  background: string,
  palette?: readonly string[],
  tileBorder = true
): void {
  const bg = parseHexColor(background);
  const bgHex = rgbToHex(bg.r, bg.g, bg.b);
  const src = readLogoSource(logo);
  const srcW = src.width;
  const srcH = src.height;

  const scale = Math.min(w / srcW, h / srcH);
  const drawW = Math.max(1, Math.floor(srcW * scale));
  const drawH = Math.max(1, Math.floor(srcH * scale));
  const ox = x + Math.floor((w - drawW) / 2);
  const oy = y + Math.floor((h - drawH) / 2);

  for (let ly = 0; ly < h; ly += 1) {
    for (let lx = 0; lx < w; lx += 1) {
      const px = x + lx;
      const py = y + ly;
      const onTileEdge =
        tileBorder &&
        (lx === 0 || lx === w - 1 || ly === 0 || ly === h - 1);
      const inMark =
        px >= ox && px < ox + drawW && py >= oy && py < oy + drawH;

      if (onTileEdge || !inMark) {
        ctx.fillStyle = bgHex;
        ctx.fillRect(px, py, 1, 1);
        continue;
      }

      const u = (px - ox + 0.5) / drawW;
      const v = (py - oy + 0.5) / drawH;
      const su = LOGO_SRC_INSET + u * (1 - 2 * LOGO_SRC_INSET);
      const sv = LOGO_SRC_INSET + v * (1 - 2 * LOGO_SRC_INSET);
      const sx = Math.min(srcW - 1, Math.max(0, Math.floor(su * srcW)));
      const sy = Math.min(srcH - 1, Math.max(0, Math.floor(sv * srcH)));
      const si = (sy * srcW + sx) * 4;
      const sr = src.data[si] ?? 0;
      const sg = src.data[si + 1] ?? 0;
      const sb = src.data[si + 2] ?? 0;
      const sa = src.data[si + 3] ?? 0;

      if (sa < LOGO_MARK_ALPHA) {
        ctx.fillStyle = bgHex;
        ctx.fillRect(px, py, 1, 1);
        continue;
      }

      const blended = blendOnBackground(sr, sg, sb, sa, bg);
      ctx.fillStyle = snapLogoColor(
        blended.r,
        blended.g,
        blended.b,
        bg,
        bgHex,
        palette
      );
      ctx.fillRect(px, py, 1, 1);
    }
  }
}

function renderLogoMark(
  ctx: CanvasRenderingContext2D,
  layout: Pick<LayoutRegion, 'logoX' | 'logoY' | 'logoW' | 'logoH'>,
  logo: HTMLImageElement | null,
  content: Pick<
    LedFlightContent,
    | 'logoIcao'
    | 'logoFallback'
    | 'logoBackground'
    | 'logoBorder'
    | 'accentStripe'
    | 'logoPalette'
    | 'logoTileBorder'
  >
): { x: number; y: number; w: number; h: number } | null {
  if (!logo && !content.logoFallback) return null;

  const logoRect = {
    x: layout.logoX,
    y: layout.logoY,
    w: layout.logoW,
    h: layout.logoH,
  };

  drawLogoTileBackground(ctx, layout, content.logoBackground);

  const { logoX, logoY, logoW, logoH } = layout;
  if (drawLedAirlineMark(ctx, content.logoIcao, logoX, logoY, logoW, logoH)) {
    // native pixel mark
  } else if (logo) {
    rasterizeLogoToTile(
      ctx,
      logo,
      logoX,
      logoY,
      logoW,
      logoH,
      content.logoBackground,
      content.logoPalette,
      content.logoTileBorder !== false
    );
  } else {
    drawLogoFallback(ctx, content.logoFallback, layout, content.logoBackground);
  }

  return logoRect;
}

function drawPanelChrome(ctx: CanvasRenderingContext2D, layout: LayoutRegion): void {
  const { statsZoneTop, mainX, mainW } = layout;
  if (layout.statsZoneH > 2) {
    ctx.fillStyle = LED_COLORS.unlit;
    ctx.fillRect(mainX, statsZoneTop - 1, mainW, 1);
  }
}

/**
 * Route progress: origin cap · continuous track (cyan flown / dim remaining) · plane.
 */
function drawRouteProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  progress: number | null | undefined
): void {
  if (w <= 0 || h <= 0) return;

  const planeH = LED_PROGRESS_PLANE_H;
  const planeW = LED_PROGRESS_PLANE_W;
  const planeY = y;
  const trackY = y + Math.floor(planeH / 2);
  const trackStart = x + 1;
  const trackEnd = x + w - 1;

  const frac =
    progress == null ? null : Math.max(0, Math.min(1, progress));

  ctx.fillStyle = LED_COLORS.phosphor;
  ctx.fillRect(x, trackY, 1, 1);

  if (trackStart > trackEnd) return;

  const drawTrackLine = (from: number, to: number, color: string) => {
    if (from > to) return;
    ctx.fillStyle = color;
    for (let col = from; col <= to; col += 1) {
      ctx.fillRect(col, trackY, 1, 1);
    }
  };

  drawTrackLine(trackStart, trackEnd, LED_COLORS.dim);

  const planeFrac = frac ?? 0.08;
  const trackSpan = trackEnd - trackStart;
  const noseCol = trackStart + Math.round(trackSpan * planeFrac);
  const planeX = Math.max(
    x,
    Math.min(noseCol - Math.floor(planeW / 2), x + w - planeW)
  );
  const flownEnd = Math.min(trackEnd, Math.max(trackStart, planeX + Math.floor(planeW / 3)));

  if (frac != null && flownEnd >= trackStart) {
    drawTrackLine(trackStart, flownEnd, LED_COLORS.telemetry);
  }

  drawLedAircraftIcon(ctx, LED_PROGRESS_PLANE_KIND, planeX, planeY, planeH, LED_COLORS.hero);
}

/** Full-width top row: origin (left) · flight ID (center) · destination (right) + progress. */
function drawRouteHeaderRow(
  ctx: CanvasRenderingContext2D,
  layout: Pick<LayoutRegion, 'headerX' | 'headerY' | 'headerW' | 'headerH' | 'wall'>,
  routeHero: string,
  progress: number | null | undefined,
  flightId?: string
): void {
  const { headerX, headerY, headerW, headerH, wall } = layout;
  const { origin, dest } = parseLedRouteHero(routeHero);
  const hasRoute = Boolean(origin || dest);
  if (!hasRoute && !flightId) return;

  const barH = LED_PROGRESS_PLANE_H;
  const textX = headerX + 1;
  const textW = headerW - 2;
  const pickRouteScale = wall ? pickWallFlightIdScale : pickFlightIdScale;

  // Tails / GA without a filed route — hero the registration across the full header.
  if (!hasRoute && flightId) {
    const slotH = headerH - 2;
    const idScale = pickRouteScale(flightId, textW, slotH);
    const idMetrics = ledScaledTextMetrics(flightId, idScale.scaleX, idScale.scaleY);
    const idY = headerY + Math.max(0, Math.floor((slotH - idMetrics.height) / 2));
    drawLedTextScaled(
      ctx,
      flightId,
      centerLedTextXScaled(flightId, textX, textW, idScale.scaleX),
      idY,
      LED_COLORS.hero,
      textW,
      idScale.scaleX,
      idScale.scaleY,
      idScale.scaleX === 1
    );
    return;
  }

  const textSlotH = Math.max(ledCharCellH(), headerH - barH - 1);
  const sideW = Math.floor(textW * 0.22);
  const centerW = Math.max(ledCharCellH() * 3, textW - 2 * sideW);
  const centerX = textX + Math.floor((textW - centerW) / 2);
  const codeMaxW = sideW;
  const routeLabel = origin || dest || '';
  const scale = pickRouteScale(routeLabel || flightId || 'DEN', codeMaxW, textSlotH);
  const destW = dest
    ? ledScaledTextMetrics(dest, scale.scaleX, scale.scaleY).width
    : 0;
  const rowH = ledScaledTextMetrics(routeLabel || flightId || 'X', scale.scaleX, scale.scaleY)
    .height;
  const textY = headerY + Math.max(0, Math.floor((textSlotH - rowH) / 2));
  const snap = scale.scaleX === 1;

  if (origin) {
    drawLedTextScaled(
      ctx,
      origin,
      textX,
      textY,
      LED_COLORS.phosphor,
      codeMaxW,
      scale.scaleX,
      scale.scaleY,
      snap
    );
  }
  if (dest) {
    drawLedTextScaled(
      ctx,
      dest,
      textX + textW - destW,
      textY,
      LED_COLORS.telemetry,
      codeMaxW,
      scale.scaleX,
      scale.scaleY,
      snap
    );
  }
  if (flightId) {
    const idScale = pickRouteScale(flightId, centerW, textSlotH);
    const idMetrics = ledScaledTextMetrics(flightId, idScale.scaleX, idScale.scaleY);
    const idY = headerY + Math.max(0, Math.floor((textSlotH - idMetrics.height) / 2));
    drawLedTextScaled(
      ctx,
      flightId,
      centerLedTextXScaled(flightId, centerX, centerW, idScale.scaleX),
      idY,
      LED_COLORS.hero,
      centerW,
      idScale.scaleX,
      idScale.scaleY,
      idScale.scaleX === 1
    );
  }

  if (hasRoute) {
    const barY = headerY + textSlotH;
    drawRouteProgressBar(ctx, textX, barY, textW, barH, progress);
  }
}

/** Visual order: type · phase · altitude · speed (primary readout last). */
function orderedTelemetryFields(telemetry: LedTelemetryField[]): LedTelemetryField[] {
  const typeField = telemetry.find((f) => f.emphasis === 'secondary');
  const speedField = telemetry.find((f) => f.emphasis === 'primary');
  const statusFields = telemetry.filter((f) => f.emphasis === 'status');
  const measureFields = telemetry.filter((f) => f.emphasis === 'measure');
  if (!typeField || !speedField) return telemetry.filter(Boolean);
  return [typeField, ...statusFields, ...measureFields, speedField];
}

type StatsScalePicker = (
  text: string,
  bandW: number,
  bandH: number
) => { scaleX: number; scaleY: number };

function rightLedTextXScaled(
  text: string,
  bandX: number,
  bandW: number,
  scaleX: number
): number {
  const display = truncateLedTextScaled(text, bandW, scaleX);
  const { width } = ledScaledTextMetrics(display, scaleX, scaleX);
  return bandX + Math.max(0, bandW - width);
}

function allocateStatsSlotHeights(
  lineCount: number,
  zoneH: number,
  gap: number,
  weights: readonly number[]
): number[] {
  const totalGap = gap * Math.max(0, lineCount - 1);
  const usable = Math.max(lineCount, zoneH - totalGap);
  const weightSum = weights.reduce((sum, w) => sum + w, 0) || lineCount;
  const heights = weights.map((w) => Math.max(1, Math.floor((usable * w) / weightSum)));
  const used = heights.reduce((sum, h) => sum + h, 0);
  heights[lineCount - 1] = Math.max(1, heights[lineCount - 1]! + (usable - used));
  return heights;
}

function drawStatsTextInBand(
  ctx: CanvasRenderingContext2D,
  text: string,
  bandX: number,
  bandY: number,
  bandW: number,
  bandH: number,
  color: string,
  align: 'left' | 'center' | 'right',
  scalePicker: StatsScalePicker
): void {
  const scale = scalePicker(text, bandW, bandH);
  const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
  const y = bandY + Math.round((bandH - metrics.height) / 2);
  let x = bandX;
  if (align === 'center') {
    x = centerLedTextXScaled(text, bandX, bandW, scale.scaleX);
  } else if (align === 'right') {
    x = rightLedTextXScaled(text, bandX, bandW, scale.scaleX);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(bandX, bandY, bandW, bandH);
  ctx.clip();
  drawLedTextScaled(
    ctx,
    text,
    x,
    y,
    color,
    bandW,
    scale.scaleX,
    scale.scaleY,
    scale.scaleX === 1
  );
  ctx.restore();
}

/** Two-row stack: hero (with type overlay) + matched alt/speed pair. */
function allocateStatsDashboardHeights(
  statsZoneH: number,
  gap: number
): { heroH: number; dataH: number; inset: number } {
  const dataH = Math.max(ledCharCellH() + 1, Math.floor(statsZoneH * 0.38));
  const heroH = Math.max(ledCharCellH() * 2, statsZoneH - dataH - gap);
  const used = heroH + gap + dataH;
  const inset = Math.max(0, Math.floor((statsZoneH - used) / 2));
  return { heroH, dataH, inset };
}

function drawStatsTypeBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  textX: number,
  textW: number,
  bandY: number,
  color: string
): void {
  drawLedTextCompact(ctx, text, textX, bandY, color, textW);
}

function drawStatsHeroRow(
  ctx: CanvasRenderingContext2D,
  typeField: LedTelemetryField,
  heroField: LedTelemetryField,
  textX: number,
  textW: number,
  bandY: number,
  bandH: number
): void {
  drawStatsTextInBand(
    ctx,
    heroField.value,
    textX,
    bandY,
    textW,
    bandH,
    ledEmphasisColor(heroField.emphasis),
    'center',
    pickFlightIdScale
  );
  drawStatsTypeBadge(
    ctx,
    typeField.value,
    textX,
    textW,
    bandY,
    ledEmphasisColor(typeField.emphasis)
  );
}

function drawStatsPairRow(
  ctx: CanvasRenderingContext2D,
  leftText: string,
  rightText: string,
  leftColor: string,
  rightColor: string,
  textX: number,
  textW: number,
  bandY: number,
  bandH: number
): void {
  const gutter = 3;
  const halfW = Math.floor((textW - gutter) / 2);
  const rightX = textX + halfW + gutter;
  const rightW = textW - halfW - gutter;
  const scale = pickStatsPairScale(leftText, rightText, halfW, rightW, bandH);
  const leftDisplay = truncateLedTextScaled(leftText, halfW, scale.scaleX);
  const rightDisplay = truncateLedTextScaled(rightText, rightW, scale.scaleX);
  const leftMetrics = ledScaledTextMetrics(leftDisplay, scale.scaleX, scale.scaleY);
  const rightMetrics = ledScaledTextMetrics(rightDisplay, scale.scaleX, scale.scaleY);
  const rowH = Math.max(leftMetrics.height, rightMetrics.height);
  const y = bandY + Math.round((bandH - rowH) / 2);
  const dotX = textX + halfW + Math.floor(gutter / 2);

  ctx.save();
  ctx.beginPath();
  ctx.rect(textX, bandY, textW, bandH);
  ctx.clip();

  drawLedTextScaled(
    ctx,
    leftDisplay,
    textX,
    y,
    leftColor,
    halfW,
    scale.scaleX,
    scale.scaleY,
    scale.scaleX === 1
  );
  drawLedTextScaled(
    ctx,
    rightDisplay,
    rightLedTextXScaled(rightDisplay, rightX, rightW, scale.scaleX),
    y,
    rightColor,
    rightW,
    scale.scaleX,
    scale.scaleY,
    scale.scaleX === 1
  );

  if (bandH >= ledCharCellH()) {
    ctx.fillStyle = LED_COLORS.dim;
    ctx.fillRect(dotX, bandY + Math.floor(bandH / 2), 1, 1);
  }

  ctx.restore();
}

/** Two-row dashboard: phase hero + alt/speed pair (type overlays hero). */
function drawStatsDashboard(
  ctx: CanvasRenderingContext2D,
  textX: number,
  textW: number,
  statsZoneTop: number,
  statsZoneH: number,
  gap: number,
  typeField: LedTelemetryField,
  heroField: LedTelemetryField,
  measureField: LedTelemetryField,
  primaryField: LedTelemetryField
): void {
  const { heroH, dataH, inset } = allocateStatsDashboardHeights(statsZoneH, gap);
  let top = statsZoneTop + inset;

  drawStatsHeroRow(ctx, typeField, heroField, textX, textW, top, heroH);
  top += heroH + gap;

  drawStatsPairRow(
    ctx,
    measureField.value,
    primaryField.value,
    LED_COLORS.phosphor,
    LED_COLORS.hero,
    textX,
    textW,
    top,
    dataH
  );
}

/** Ground / taxi — hero row + lone altitude readout. */
function drawStatsGroundLayout(
  ctx: CanvasRenderingContext2D,
  textX: number,
  textW: number,
  statsZoneTop: number,
  statsZoneH: number,
  gap: number,
  typeField: LedTelemetryField,
  heroField: LedTelemetryField,
  measureField: LedTelemetryField
): void {
  const { heroH, dataH, inset } = allocateStatsDashboardHeights(statsZoneH, gap);
  let top = statsZoneTop + inset;

  drawStatsHeroRow(ctx, typeField, heroField, textX, textW, top, heroH);
  top += heroH + gap;

  drawStatsTextInBand(
    ctx,
    measureField.value,
    textX,
    top,
    textW,
    dataH,
    LED_COLORS.phosphor,
    'left',
    pickTelemetryScale
  );
}

function drawStatsRow(
  ctx: CanvasRenderingContext2D,
  layout: LayoutRegion,
  telemetry: LedTelemetryField[]
): void {
  const { mainX, mainW, statsZoneTop, statsZoneH, wall } = layout;
  const textX = mainX + 1;
  const textW = mainW - 2;
  const entries = orderedTelemetryFields(telemetry);

  const gap = wall ? 2 : 1;
  const lines = entries.length > 0 ? entries : [];

  const typeField = entries.find((f) => f.emphasis === 'secondary');
  const statusField = entries.find((f) => f.emphasis === 'status');
  const measureField = entries.find((f) => f.emphasis === 'measure');
  const primaryField = entries.find((f) => f.emphasis === 'primary');

  if (typeField && statusField && measureField && primaryField) {
    drawStatsDashboard(
      ctx,
      textX,
      textW,
      statsZoneTop,
      statsZoneH,
      gap,
      typeField,
      statusField,
      measureField,
      primaryField
    );
    return;
  }

  if (typeField && !statusField && measureField && primaryField) {
    drawStatsGroundLayout(
      ctx,
      textX,
      textW,
      statsZoneTop,
      statsZoneH,
      gap,
      typeField,
      primaryField,
      measureField
    );
    return;
  }

  if (lines.length >= 2) {
    const weights = lines.map(() => 1 / lines.length);
    const slotHeights = allocateStatsSlotHeights(lines.length, statsZoneH, gap, weights);
    let slotTop = statsZoneTop;

    lines.forEach((field, i) => {
      const slotH = slotHeights[i] ?? 1;
      const text = field.value;
      const color = ledEmphasisColor(field.emphasis);
      const scale = pickTelemetryScale(text, textW, slotH);
      const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
      const y = slotTop + Math.round((slotH - metrics.height) / 2);

      ctx.save();
      ctx.beginPath();
      ctx.rect(textX, slotTop, textW, slotH);
      ctx.clip();

      drawLedTextScaled(
        ctx,
        text,
        centerLedTextXScaled(text, textX, textW, scale.scaleX),
        y,
        color,
        textW,
        scale.scaleX,
        scale.scaleY,
        scale.scaleX === 1
      );

      ctx.restore();

      slotTop += slotH + (i < lines.length - 1 ? gap : 0);
    });
    return;
  }

  const field = lines[0];
  const aircraft = field?.value ?? '';
  const typeColor = ledEmphasisColor(field?.emphasis);

  const rowH = ledCompactCellH();
  const rowY = statsZoneTop + Math.round((statsZoneH - rowH) / 2);
  const aircraftScale = pickTelemetryScale(aircraft, textW, statsZoneH);
  const aircraftMetrics = ledScaledTextMetrics(
    aircraft,
    aircraftScale.scaleX,
    aircraftScale.scaleY
  );
  const aircraftY = rowY + Math.round((rowH - aircraftMetrics.height) / 2);

  drawLedTextScaled(
    ctx,
    aircraft,
    textX,
    aircraftY,
    typeColor,
    textW,
    aircraftScale.scaleX,
    aircraftScale.scaleY,
    aircraftScale.scaleX === 1
  );

  const speedField = telemetry.find((f) => f.emphasis === 'primary');
  if (speedField) {
    drawLedTextCompactRight(
      ctx,
      speedField.value,
      textX + textW,
      rowY,
      ledEmphasisColor(speedField.emphasis),
      textW
    );
  }
}

function renderLandscapeLayout(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  content: LedFlightContent,
  logo: HTMLImageElement | null
): { logoRect: { x: number; y: number; w: number; h: number } | null } {
  const layout = buildLandscapeLayout(cols, rows);
  let logoRect: { x: number; y: number; w: number; h: number } | null = null;

  logoRect = renderLogoMark(ctx, layout, logo, content);

  drawLandscapeFlightPanel(ctx, layout, content, rows);

  return { logoRect };
}

function drawLandscapeFlightPanel(
  ctx: CanvasRenderingContext2D,
  layout: LayoutRegion,
  content: LedFlightContent,
  _rows: number
): void {
  drawRouteHeaderRow(
    ctx,
    layout,
    content.routeHero,
    content.routeProgress,
    content.flightId
  );
  drawPanelChrome(ctx, layout);
  drawStatsRow(ctx, layout, content.telemetry);
}

function logoFallbackColor(background: string): string {
  const bg = parseHexColor(background);
  return colorLuminance(bg) > 140 ? LED_COLORS.muted : LED_COLORS.hero;
}

function wrapLogoNameLines(name: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = name.toUpperCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }
    if (current) {
      lines.push(current);
      if (lines.length >= maxLines) return lines;
      current = '';
    }
    if (word.length <= maxCharsPerLine) {
      current = word;
      continue;
    }
    let offset = 0;
    while (offset < word.length && lines.length < maxLines) {
      lines.push(word.slice(offset, offset + maxCharsPerLine));
      offset += maxCharsPerLine;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function pickLogoNameScale(
  text: string,
  bandW: number,
  bandH: number
): { scaleX: number; scaleY: number } {
  for (const scale of [1, 0.85, 0.75, 0.65, 0.55, 0.45]) {
    const display = truncateLedTextScaled(text, bandW, scale);
    const { width, height } = ledScaledTextMetrics(display, scale, scale);
    if (width <= bandW && height + 1 <= bandH) {
      return { scaleX: scale, scaleY: scale };
    }
  }
  return { scaleX: 0.45, scaleY: 0.45 };
}

function drawLogoFallback(
  ctx: CanvasRenderingContext2D,
  fallback: string,
  layout: Pick<LayoutRegion, 'logoX' | 'logoY' | 'logoW' | 'logoH'>,
  background: string
): void {
  const name = fallback.trim().toUpperCase();
  if (!name) return;

  const color = logoFallbackColor(background);
  const pad = 1;
  const innerW = Math.max(1, layout.logoW - pad * 2);
  const innerH = Math.max(1, layout.logoH - pad * 2);
  const baseX = layout.logoX + pad;
  const baseY = layout.logoY + pad;

  const drawSingleLine = () => {
    const { scaleX, scaleY } = pickLogoNameScale(name, innerW, innerH);
    const display = truncateLedTextScaled(name, innerW, scaleX);
    const metrics = ledScaledTextMetrics(display, scaleX, scaleY);
    const x = baseX + Math.floor((innerW - metrics.width) / 2);
    const y = baseY + Math.floor((innerH - metrics.height) / 2);
    drawLedTextScaled(ctx, display, x, y, color, innerW, scaleX, scaleY);
  };

  if (!name.includes(' ')) {
    drawSingleLine();
    return;
  }

  const maxCharsPerLine = Math.max(1, Math.floor((innerW + 2) / ledCompactCellW()));
  const maxLines = Math.max(1, Math.floor(innerH / ledCompactCellH()));
  const lines = wrapLogoNameLines(name, maxCharsPerLine, maxLines);

  if (lines.length <= 1) {
    drawSingleLine();
    return;
  }

  const blockH = lines.length * ledCompactCellH() - 1;
  let y = baseY + Math.floor((innerH - blockH) / 2);
  for (const line of lines) {
    const display = truncateLedTextCompact(line, innerW);
    const width = measureLedTextCompact(display);
    const x = baseX + Math.floor((innerW - width) / 2);
    drawLedTextCompact(ctx, display, x, y, color, innerW);
    y += ledCompactCellH();
  }
}

function renderPortraitLayout(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  content: LedFlightContent,
  logo: HTMLImageElement | null
): { logoRect: { x: number; y: number; w: number; h: number } | null } {
  const layout = buildPortraitLayout(cols, rows);
  let logoRect: { x: number; y: number; w: number; h: number } | null = null;

  logoRect = renderLogoMark(ctx, layout, logo, content);

  drawLandscapeFlightPanel(ctx, layout, content, rows);

  return { logoRect };
}

export function renderLedBuffer(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  content: LedFlightContent,
  logo: HTMLImageElement | null
): { logoRect: { x: number; y: number; w: number; h: number } | null } {
  ctx.fillStyle = LED_COLORS.panel;
  ctx.fillRect(0, 0, cols, rows);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = false;

  if (cols >= rows * 1.6) {
    return renderLandscapeLayout(ctx, cols, rows, content, logo);
  }
  return renderPortraitLayout(ctx, cols, rows, content, logo);
}

/** Snap buffer pixels to the discrete LED text palette (excludes near-black track). */
const SNAP_PALETTE = [
  LED_COLORS.hero,
  LED_COLORS.phosphor,
  LED_COLORS.telemetry,
  LED_COLORS.dim,
  LED_COLORS.muted,
] as const;

function snapTextColor(r: number, g: number, b: number, a = 255): string | null {
  const lum = r * 0.299 + g * 0.587 + b * 0.114;
  if (a < 128 || lum < 40) return null;

  let best: string | null = null;
  let bestDist = Infinity;
  for (const hex of SNAP_PALETTE) {
    const c = parseHexColor(hex);
    const dist = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = hex;
    }
  }

  return bestDist <= 4900 ? best : null;
}

function sampleLogoLedColor(
  r: number,
  g: number,
  b: number,
  logoBackground?: string,
  palette?: readonly string[]
): string {
  if (logoBackground) {
    const bg = parseHexColor(logoBackground);
    const bgHex = rgbToHex(bg.r, bg.g, bg.b);
    return snapLogoColor(r, g, b, bg, bgHex, palette);
  }
  const q = quantizeRgb(r, g, b);
  return rgbToHex(q.r, q.g, q.b);
}

function parseRgbColor(color: string): { r: number; g: number; b: number } {
  if (color.startsWith('rgb(')) {
    const parts = color.match(/\d+/g);
    return {
      r: Number(parts?.[0] ?? 0),
      g: Number(parts?.[1] ?? 0),
      b: Number(parts?.[2] ?? 0),
    };
  }

  const hex = color.replace('#', '');
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function dimColor(r: number, g: number, b: number, factor: number) {
  return {
    r: Math.round(r * factor),
    g: Math.round(g * factor),
    b: Math.round(b * factor),
  };
}

/** Static per-diode brightness — fixed grain, no animated sweep. */
function ledCellBrightness(x: number, y: number): number {
  const hash = ((x * 73 + y * 137) % 97) / 97;
  return 0.9 + hash * 0.1;
}

/** Recessed unlit LED cup — dark bezel with a deep hole. */
function drawUnlitDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): void {
  ctx.fillStyle = '#101010';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#050505';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  ctx.beginPath();
  ctx.arc(cx, cy - radius * 0.16, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();
}

/** Crisp lit diode — solid fill, no bloom or specular spill. */
function drawLitDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  strength: number
): void {
  const { r, g, b } = parseRgbColor(color);
  const body = dimColor(r, g, b, strength);
  ctx.fillStyle = `rgb(${body.r},${body.g},${body.b})`;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.92, 0, Math.PI * 2);
  ctx.fill();
}

export type PaintLedDotsOptions = {
  /** Letterbox to content grid — used for iPad preview. Wall displays fill edge-to-edge. */
  fitFrame?: boolean;
  /** Tile fill behind the logo — used to snap fringe pixels to solid phosphor. */
  logoBackground?: string;
  /** Brand fills for logo LEDs — collapses CDN gradients to 2–3 colors. */
  logoPalette?: readonly string[];
};

type LedPaintViewport = {
  offsetX: number;
  offsetY: number;
  cellW: number;
  cellH: number;
  displayCols: number;
  displayRows: number;
};

/** iPad preview — square cells, letterboxed. */
function ledViewport(
  width: number,
  height: number,
  cols: number,
  rows: number
): LedPaintViewport {
  const gridAspect = cols / rows;
  const displayAspect = width / height;

  let drawW = width;
  let drawH = height;
  if (displayAspect > gridAspect) {
    drawW = height * gridAspect;
  } else {
    drawH = width / gridAspect;
  }

  const cell = drawW / cols;
  return {
    offsetX: (width - drawW) / 2,
    offsetY: (height - drawH) / 2,
    cellW: cell,
    cellH: cell,
    displayCols: cols,
    displayRows: rows,
  };
}

/** Wall display: square pixels, full width + height (buffer row count matches viewport). */
function ledWallViewport(
  width: number,
  height: number,
  cols: number,
  rows: number
): LedPaintViewport {
  const cell = width / cols;
  return {
    offsetX: 0,
    offsetY: 0,
    cellW: cell,
    cellH: cell,
    displayCols: cols,
    displayRows: rows,
  };
}

export function paintLedDots(
  ctx: CanvasRenderingContext2D,
  buffer: ImageData,
  width: number,
  height: number,
  logoRect: { x: number; y: number; w: number; h: number } | null,
  options: PaintLedDotsOptions = {}
): void {
  const { cols, rows } = { cols: buffer.width, rows: buffer.height };
  const viewport = options.fitFrame
    ? ledViewport(width, height, cols, rows)
    : ledWallViewport(width, height, cols, rows);
  const { offsetX, offsetY, cellW, cellH, displayCols, displayRows } = viewport;
  const radius = Math.min(cellW, cellH) * 0.44;
  const data = buffer.data;
  const logoBg = options.logoBackground;
  const logoPalette = options.logoPalette;

  type LitCell = { cx: number; cy: number; color: string; strength: number };
  const litCells: LitCell[] = [];

  ctx.fillStyle = LED_COLORS.panel;
  ctx.fillRect(0, 0, width, height);

  for (let y = 0; y < displayRows; y += 1) {
    for (let x = 0; x < displayCols; x += 1) {
      const cx = offsetX + (x + 0.5) * cellW;
      const cy = offsetY + (y + 0.5) * cellH;
      drawUnlitDot(ctx, cx, cy, radius);

      if (y >= rows || x >= cols) continue;

      const i = (y * cols + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const inLogo =
        logoRect &&
        x >= logoRect.x &&
        x < logoRect.x + logoRect.w &&
        y >= logoRect.y &&
        y < logoRect.y + logoRect.h;

      if (inLogo) {
        const color = sampleLogoLedColor(r, g, b, logoBg, logoPalette);
        litCells.push({ cx, cy, color, strength: 1 });
        continue;
      }

      const textColor = snapTextColor(r, g, b, a);
      if (textColor) {
        const evenPhosphor =
          textColor === LED_COLORS.hero ||
          textColor === LED_COLORS.phosphor ||
          textColor === LED_COLORS.telemetry;
        const strength = evenPhosphor ? 1 : ledCellBrightness(x, y) * 0.98;
        litCells.push({ cx, cy, color: textColor, strength });
      }
    }
  }

  for (const cell of litCells) {
    drawLitDot(ctx, cell.cx, cell.cy, radius, cell.color, cell.strength);
  }
}

export type LedLogoTileContent = Pick<
  LedFlightContent,
  | 'logoUrl'
  | 'logoIcao'
  | 'logoFallback'
  | 'logoBackground'
  | 'logoBorder'
  | 'accentStripe'
  | 'logoPalette'
  | 'logoTileBorder'
>;

/** Isolated logo tile for theme-tester previews (same pipeline as FlightWall). */
export async function drawLedLogoTile(
  ctx: CanvasRenderingContext2D,
  size: number,
  content: LedLogoTileContent
): Promise<{ x: number; y: number; w: number; h: number } | null> {
  const layout = { logoX: 0, logoY: 0, logoW: size, logoH: size };
  const logo = content.logoUrl ? await loadLedLogo(content.logoUrl) : null;
  return renderLogoMark(ctx, layout, logo, content);
}

export function loadLedLogo(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!url.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
