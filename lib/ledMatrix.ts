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
  pickTelemetryScale,
  pickWallFlightIdScale,
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
/** Faint edge pixels (thin strokes) still count when luminance pops off the tile fill. */
const LOGO_FAINT_ALPHA = 40;
/** Subsamples per LED axis — catches 1px strokes that miss the cell center. */
const LOGO_CELL_SAMPLES = 3;
/** Quantize logo RGB to discrete LED phosphor steps — kills anti-alias fringe. */
const LOGO_QUANT_STEP = 51;
/** Inset Kiwi PNG sampling to skip opaque white padding at asset edges. */
const LOGO_SRC_INSET = 0.05;

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
  /** Raster scale — cover fills the tile (wordmarks); contain letterboxes. */
  logoScaleMode?: 'contain' | 'cover';
  /** Sparse per-cell LED overrides keyed by "x,y". */
  logoDotOverrides?: Record<string, string>;
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

function colorSaturation(c: { r: number; g: number; b: number }): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function lightestPaletteColor(palette: readonly string[]): string | null {
  let best: string | null = null;
  let bestLum = -1;
  for (const hex of palette) {
    const lum = colorLuminance(parseHexColor(hex));
    if (lum > bestLum) {
      bestLum = lum;
      best = hex;
    }
  }
  return best;
}

function foregroundPaletteColors(
  palette: readonly string[] | undefined,
  bgHex: string
): string[] {
  if (!palette?.length) return [];
  const bg = parseHexColor(bgHex);
  return palette.filter((hex) => rgbDistance(parseHexColor(hex), bg) >= 42);
}

function isBinaryLogoPalette(
  palette: readonly string[] | undefined,
  bgHex: string
): boolean {
  return foregroundPaletteColors(palette, bgHex).length === 1;
}

function snapBinaryLogoColor(
  r: number,
  g: number,
  b: number,
  bg: { r: number; g: number; b: number },
  bgHex: string,
  fgHex: string
): string {
  const sample = { r, g, b };
  if (rgbDistance(sample, bg) < 28) return bgHex;

  const bgLum = colorLuminance(bg);
  const fgLum = colorLuminance(parseHexColor(fgHex));
  const mid = bgLum + (fgLum - bgLum) * 0.44;
  return colorLuminance(sample) >= mid ? fgHex : bgHex;
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

  if (palette && palette.length > 0) {
    const foreground = foregroundPaletteColors(palette, bgHex);
    if (foreground.length === 1) {
      return snapBinaryLogoColor(r, g, b, bg, bgHex, foreground[0]!);
    }

    const sampleLum = colorLuminance(sample);
    const bgLum = colorLuminance(bg);
    const highlight = lightestPaletteColor(palette);
    const sampleSat = colorSaturation(sample);
    // Only snap bright *neutral* pixels (white borders) — not yellow/red brand fills.
    if (highlight && sampleSat < 0.2 && sampleLum > bgLum + 48) {
      const highlightLum = colorLuminance(parseHexColor(highlight));
      if (sampleLum >= highlightLum - 72) {
        return highlight;
      }
    }

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

function readLogoSourcePixel(
  src: ImageData,
  srcW: number,
  srcH: number,
  su: number,
  sv: number
): { r: number; g: number; b: number; a: number } {
  const sx = Math.min(srcW - 1, Math.max(0, Math.floor(su * srcW)));
  const sy = Math.min(srcH - 1, Math.max(0, Math.floor(sv * srcH)));
  const si = (sy * srcW + sx) * 4;
  return {
    r: src.data[si] ?? 0,
    g: src.data[si + 1] ?? 0,
    b: src.data[si + 2] ?? 0,
    a: src.data[si + 3] ?? 0,
  };
}

type LogoCellSample = {
  color: string;
  alpha: number;
  contrast: number;
};

/** Multi-sample one LED cell — prefers strong edges and faint thin strokes. */
function sampleLogoLedCell(
  src: ImageData,
  srcW: number,
  srcH: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  bg: { r: number; g: number; b: number },
  bgHex: string,
  palette?: readonly string[],
  srcInset = LOGO_SRC_INSET
): string {
  const foreground = foregroundPaletteColors(palette, bgHex);
  if (foreground.length === 1) {
    return sampleBinaryLogoLedCell(
      src,
      srcW,
      srcH,
      u0,
      v0,
      u1,
      v1,
      bg,
      bgHex,
      foreground[0]!,
      srcInset
    );
  }

  const bgLum = colorLuminance(bg);
  const samples: LogoCellSample[] = [];

  for (let sy = 0; sy < LOGO_CELL_SAMPLES; sy += 1) {
    for (let sx = 0; sx < LOGO_CELL_SAMPLES; sx += 1) {
      const fu = (sx + 0.5) / LOGO_CELL_SAMPLES;
      const fv = (sy + 0.5) / LOGO_CELL_SAMPLES;
      const su = srcInset + (u0 + fu * (u1 - u0)) * (1 - 2 * srcInset);
      const sv = srcInset + (v0 + fv * (v1 - v0)) * (1 - 2 * srcInset);
      const { r, g, b, a } = readLogoSourcePixel(src, srcW, srcH, su, sv);
      if (a < LOGO_FAINT_ALPHA) continue;

      const blended = blendOnBackground(r, g, b, a, bg);
      const contrast = colorLuminance(blended) - bgLum;
      if (a < LOGO_MARK_ALPHA && contrast < 36) continue;

      const color = snapLogoColor(blended.r, blended.g, blended.b, bg, bgHex, palette);
      if (color === bgHex && a < LOGO_MARK_ALPHA) continue;

      samples.push({ color, alpha: a, contrast });
    }
  }

  if (samples.length === 0) return bgHex;

  const votes = new Map<string, number>();
  for (const sample of samples) {
    const weight = sample.alpha + Math.max(0, sample.contrast) * 1.4;
    votes.set(sample.color, (votes.get(sample.color) ?? 0) + weight);
  }

  let bestColor = bgHex;
  let bestWeight = -1;
  for (const [color, weight] of votes) {
    if (color === bgHex) continue;
    if (weight > bestWeight) {
      bestWeight = weight;
      bestColor = color;
    }
  }

  return bestWeight > 0 ? bestColor : bgHex;
}

/** Two-color wordmarks (JetBlue, etc.) — integrate source bbox per LED cell. */
function sampleBinaryLogoLedCell(
  src: ImageData,
  srcW: number,
  srcH: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  bg: { r: number; g: number; b: number },
  bgHex: string,
  fgHex: string,
  srcInset: number
): string {
  const bgLum = colorLuminance(bg);
  const fgLum = colorLuminance(parseHexColor(fgHex));
  const threshold = bgLum + (fgLum - bgLum) * 0.36;

  const su0 = srcInset + u0 * (1 - 2 * srcInset);
  const su1 = srcInset + u1 * (1 - 2 * srcInset);
  const sv0 = srcInset + v0 * (1 - 2 * srcInset);
  const sv1 = srcInset + v1 * (1 - 2 * srcInset);

  const x0 = Math.max(0, Math.floor(su0 * srcW));
  const x1 = Math.min(srcW, Math.max(x0 + 1, Math.ceil(su1 * srcW)));
  const y0 = Math.max(0, Math.floor(sv0 * srcH));
  const y1 = Math.min(srcH, Math.max(y0 + 1, Math.ceil(sv1 * srcH)));

  let fgWeight = 0;
  let totalWeight = 0;
  let peakLum = 0;

  for (let sy = y0; sy < y1; sy += 1) {
    for (let sx = x0; sx < x1; sx += 1) {
      const si = (sy * srcW + sx) * 4;
      const r = src.data[si] ?? 0;
      const g = src.data[si + 1] ?? 0;
      const b = src.data[si + 2] ?? 0;
      const a = src.data[si + 3] ?? 0;
      if (a < 24) continue;

      const blended = blendOnBackground(r, g, b, a, bg);
      const lum = colorLuminance(blended);
      const weight = a / 255;
      totalWeight += weight;
      peakLum = Math.max(peakLum, lum);
      if (lum >= threshold) {
        fgWeight += weight;
      }
    }
  }

  if (totalWeight === 0) return bgHex;
  const fgFrac = fgWeight / totalWeight;
  if (fgFrac >= 0.24 || peakLum >= threshold + 14) return fgHex;
  if (fgFrac >= 0.14 && peakLum >= threshold + 4) return fgHex;
  return bgHex;
}

function isHighlightPaletteColor(hex: string, palette: readonly string[]): boolean {
  const light = lightestPaletteColor(palette);
  if (!light) return false;
  return hex.toLowerCase() === light.toLowerCase();
}

/** Bridge 1px holes in binary wordmark borders without touching letter counters. */
function repairBinaryLogoTilePerimeter(
  grid: string[][],
  w: number,
  h: number,
  bgHex: string,
  fgHex: string
): void {
  const isBg = (hex: string) => hex.toLowerCase() === bgHex.toLowerCase();
  const isFg = (hex: string) => hex.toLowerCase() === fgHex.toLowerCase();
  const onPerimeter = (lx: number, ly: number) =>
    lx === 0 || lx === w - 1 || ly === 0 || ly === h - 1;
  const snapshot = grid.map((row) => [...row]);

  for (let ly = 0; ly < h; ly += 1) {
    for (let lx = 0; lx < w; lx += 1) {
      if (!onPerimeter(lx, ly) || !isBg(snapshot[ly]![lx]!)) continue;

      if (lx > 0 && lx < w - 1 && isFg(snapshot[ly]![lx - 1]!) && isFg(snapshot[ly]![lx + 1]!)) {
        grid[ly]![lx] = fgHex;
        continue;
      }
      if (ly > 0 && ly < h - 1 && isFg(snapshot[ly - 1]![lx]!) && isFg(snapshot[ly + 1]![lx]!)) {
        grid[ly]![lx] = fgHex;
      }
    }
  }
}

/** Bridge 1px holes in thin highlight strokes (e.g. white heart borders). */
function repairLogoTileThinStrokes(
  grid: string[][],
  w: number,
  h: number,
  bgHex: string,
  palette?: readonly string[]
): void {
  if (!palette?.length) return;
  const highlight = lightestPaletteColor(palette);
  if (!highlight) return;

  const isBg = (hex: string) => hex.toLowerCase() === bgHex.toLowerCase();
  const isStroke = (hex: string) =>
    isHighlightPaletteColor(hex, palette) || hex.toLowerCase() === highlight.toLowerCase();

  const snapshot = grid.map((row) => [...row]);

  for (let ly = 0; ly < h; ly += 1) {
    for (let lx = 0; lx < w; lx += 1) {
      if (!isBg(snapshot[ly]![lx]!)) continue;

      if (lx > 0 && lx < w - 1 && isStroke(snapshot[ly]![lx - 1]!) && isStroke(snapshot[ly]![lx + 1]!)) {
        grid[ly]![lx] = snapshot[ly]![lx - 1]!;
        continue;
      }
      if (ly > 0 && ly < h - 1 && isStroke(snapshot[ly - 1]![lx]!) && isStroke(snapshot[ly + 1]![lx]!)) {
        grid[ly]![lx] = snapshot[ly - 1]![lx]!;
      }
    }
  }
}

/** One buffer cell = one LED; multi-sample + thin-stroke repair. */
function rasterizeLogoToTile(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  background: string,
  palette?: readonly string[],
  tileBorder = true,
  scaleMode?: 'contain' | 'cover'
): void {
  const bg = parseHexColor(background);
  const bgHex = rgbToHex(bg.r, bg.g, bg.b);
  const src = readLogoSource(logo);
  const srcW = src.width;
  const srcH = src.height;

  const binaryPalette = isBinaryLogoPalette(palette, bgHex);
  const binaryFg = binaryPalette ? foregroundPaletteColors(palette, bgHex)[0] : undefined;
  const useCover =
    scaleMode === 'cover' ||
    (scaleMode !== 'contain' && binaryPalette && !tileBorder);
  const scale = useCover ? Math.max(w / srcW, h / srcH) : Math.min(w / srcW, h / srcH);
  const drawW = Math.max(1, Math.floor(srcW * scale));
  const drawH = Math.max(1, Math.floor(srcH * scale));
  const ox = x + Math.floor((w - drawW) / 2);
  const oy = y + Math.floor((h - drawH) / 2);

  const grid: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => bgHex));
  const srcInset = tileBorder ? LOGO_SRC_INSET : 0;

  for (let ly = 0; ly < h; ly += 1) {
    for (let lx = 0; lx < w; lx += 1) {
      const onTileEdge =
        tileBorder &&
        (lx === 0 || lx === w - 1 || ly === 0 || ly === h - 1);
      const inMark =
        lx >= ox - x &&
        lx < ox - x + drawW &&
        ly >= oy - y &&
        ly < oy - y + drawH;

      if (onTileEdge || !inMark) {
        grid[ly]![lx] = bgHex;
        continue;
      }

      const u0 = (lx - (ox - x)) / drawW;
      const v0 = (ly - (oy - y)) / drawH;
      const u1 = u0 + 1 / drawW;
      const v1 = v0 + 1 / drawH;

      grid[ly]![lx] = sampleLogoLedCell(
        src,
        srcW,
        srcH,
        u0,
        v0,
        u1,
        v1,
        bg,
        bgHex,
        palette,
        srcInset
      );
    }
  }

  if (binaryPalette && binaryFg) {
    repairBinaryLogoTilePerimeter(grid, w, h, bgHex, binaryFg);
  } else {
    repairLogoTileThinStrokes(grid, w, h, bgHex, palette);
  }

  for (let ly = 0; ly < h; ly += 1) {
    for (let lx = 0; lx < w; lx += 1) {
      ctx.fillStyle = grid[ly]![lx]!;
      ctx.fillRect(x + lx, y + ly, 1, 1);
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
    | 'logoScaleMode'
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
      content.logoTileBorder !== false,
      content.logoScaleMode
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

/** Visual order: type · phase · speed · altitude. */
function orderedTelemetryFields(telemetry: LedTelemetryField[]): LedTelemetryField[] {
  const typeField = telemetry.find((f) => f.emphasis === 'secondary');
  const speedField = telemetry.find((f) => f.emphasis === 'primary');
  const statusFields = telemetry.filter((f) => f.emphasis === 'status');
  const measureFields = telemetry.filter((f) => f.emphasis === 'measure');
  if (!typeField || !speedField) return telemetry.filter(Boolean);
  return [typeField, ...statusFields, speedField, ...measureFields];
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

/** Four-row stack: type · phase · speed · altitude. */
function allocateStatsDashboardHeights(
  statsZoneH: number,
  gap: number,
  rowCount: 2 | 3 | 4,
  options?: { wall?: boolean }
): { rowHeights: number[]; inset: number } {
  const weights =
    rowCount === 4
      ? [0.14, 0.36, 0.28, 0.22]
      : rowCount === 3
        ? [0.2, 0.44, 0.36]
        : [0.32, 0.68];
  const totalGap = gap * (rowCount - 1);
  const usable = Math.max(rowCount, statsZoneH - totalGap);
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const rowHeights = weights.map((w) => Math.max(1, Math.floor((usable * w) / weightSum)));
  const used = rowHeights.reduce((sum, h) => sum + h, 0);
  rowHeights[rowCount - 1] = Math.max(1, rowHeights[rowCount - 1]! + (usable - used));
  const inset = options?.wall
    ? 0
    : Math.max(0, Math.floor((statsZoneH - used - totalGap) / 2));
  return { rowHeights, inset };
}

/** Airborne — type, phase hero, speed, altitude. */
function drawStatsDashboard(
  ctx: CanvasRenderingContext2D,
  textX: number,
  textW: number,
  statsZoneTop: number,
  statsZoneH: number,
  gap: number,
  wall: boolean,
  typeField: LedTelemetryField,
  statusField: LedTelemetryField,
  primaryField: LedTelemetryField,
  measureField: LedTelemetryField
): void {
  const rowCount = 4;
  const { rowHeights, inset } = allocateStatsDashboardHeights(statsZoneH, gap, rowCount, {
    wall,
  });
  let top = statsZoneTop + inset;
  const phaseScale = wall ? pickWallFlightIdScale : pickFlightIdScale;

  drawStatsTextInBand(
    ctx,
    typeField.value,
    textX,
    top,
    textW,
    rowHeights[0]!,
    ledEmphasisColor(typeField.emphasis),
    'center',
    pickTelemetryScale
  );
  top += rowHeights[0]! + gap;

  drawStatsTextInBand(
    ctx,
    statusField.value,
    textX,
    top,
    textW,
    rowHeights[1]!,
    ledEmphasisColor(statusField.emphasis),
    'center',
    phaseScale
  );
  top += rowHeights[1]! + gap;

  drawStatsTextInBand(
    ctx,
    primaryField.value,
    textX,
    top,
    textW,
    rowHeights[2]!,
    ledEmphasisColor(primaryField.emphasis),
    'center',
    pickTelemetryScale
  );
  top += rowHeights[2]! + gap;

  drawStatsTextInBand(
    ctx,
    measureField.value,
    textX,
    top,
    textW,
    rowHeights[3]!,
    ledEmphasisColor(measureField.emphasis),
    'center',
    pickTelemetryScale
  );
}

/** Ground / taxi — type, status hero, optional altitude. */
function drawStatsGroundLayout(
  ctx: CanvasRenderingContext2D,
  textX: number,
  textW: number,
  statsZoneTop: number,
  statsZoneH: number,
  gap: number,
  wall: boolean,
  typeField: LedTelemetryField,
  heroField: LedTelemetryField,
  measureField?: LedTelemetryField
): void {
  const rowCount = measureField ? 3 : 2;
  const { rowHeights, inset } = allocateStatsDashboardHeights(statsZoneH, gap, rowCount, {
    wall,
  });
  let top = statsZoneTop + inset;
  const heroScale = wall ? pickWallFlightIdScale : pickFlightIdScale;

  drawStatsTextInBand(
    ctx,
    typeField.value,
    textX,
    top,
    textW,
    rowHeights[0]!,
    ledEmphasisColor(typeField.emphasis),
    'center',
    pickTelemetryScale
  );
  top += rowHeights[0]! + gap;

  drawStatsTextInBand(
    ctx,
    heroField.value,
    textX,
    top,
    textW,
    rowHeights[1]!,
    ledEmphasisColor(heroField.emphasis),
    'center',
    heroScale
  );
  top += rowHeights[1]! + gap;

  if (measureField && rowCount >= 3) {
    drawStatsTextInBand(
      ctx,
      measureField.value,
      textX,
      top,
      textW,
      rowHeights[2]!,
      ledEmphasisColor(measureField.emphasis),
      'center',
      pickTelemetryScale
    );
  }
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
      wall,
      typeField,
      statusField,
      primaryField,
      measureField
    );
    return;
  }

  if (typeField && !statusField && primaryField) {
    drawStatsGroundLayout(
      ctx,
      textX,
      textW,
      statsZoneTop,
      statsZoneH,
      gap,
      wall,
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
  | 'logoScaleMode'
  | 'logoDotOverrides'
>;

function applyLogoDotOverridesToBuffer(
  imageData: ImageData,
  overrides: Record<string, string> | undefined
): void {
  if (!overrides) return;
  for (const [key, color] of Object.entries(overrides)) {
    const [xRaw, yRaw] = key.split(',');
    const x = Number.parseInt(xRaw ?? '', 10);
    const y = Number.parseInt(yRaw ?? '', 10);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) continue;
    const rgb = parseRgbColor(color);
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = rgb.r;
    imageData.data[i + 1] = rgb.g;
    imageData.data[i + 2] = rgb.b;
    imageData.data[i + 3] = 255;
  }
}

/** Isolated logo tile for theme-tester previews (same pipeline as FlightWall). */
export async function drawLedLogoTile(
  ctx: CanvasRenderingContext2D,
  size: number,
  content: LedLogoTileContent
): Promise<{ x: number; y: number; w: number; h: number } | null> {
  const layout = { logoX: 0, logoY: 0, logoW: size, logoH: size };
  const logo = content.logoUrl ? await loadLedLogo(content.logoUrl) : null;
  const logoRect = renderLogoMark(ctx, layout, logo, content);
  if (content.logoDotOverrides) {
    const imageData = ctx.getImageData(0, 0, size, size);
    applyLogoDotOverridesToBuffer(imageData, content.logoDotOverrides);
    ctx.putImageData(imageData, 0, 0);
  }
  return logoRect;
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
