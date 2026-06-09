import type { IpadOrientation } from '@/lib/kiosk';
import {
  drawLedText,
  drawLedTextCompact,
  drawLedTextScaled,
  LED_FONT,
  ledCharCellH,
  ledCompactCellH,
  ledScaledTextMetrics,
  measureLedText,
  measureLedTextCompact,
  pickFlightIdScale,
  truncateLedText,
  truncateLedTextCompact,
  truncateLedTextScaled,
} from '@/lib/ledFont';
import { drawLedAirlineMark } from '@/lib/ledAirlineMarks';
import type { LedTelemetryField } from '@/lib/ledFlightWall';

/** Classic FlightWall desk panel — 128 cols; rows expand on wall displays to fill height. */
export const LED_GRID = {
  landscape: { cols: 128, rows: 32 },
  portrait: { cols: 64, rows: 64 },
} as const;

export const LED_COLORS = {
  phosphor: '#ececec',
  hero: '#ffffff',
  telemetry: '#72dcff',
  dim: '#b0b0b0',
  muted: '#808080',
  panel: '#000000',
  unlit: '#0a0a0a',
} as const;

const TEXT_THRESHOLD = 100;
/** Logo mark pixels below this alpha are treated as tile background. */
const LOGO_MARK_ALPHA = 140;
/** Quantize logo RGB to discrete LED phosphor steps — kills anti-alias fringe. */
const LOGO_QUANT_STEP = 51;
/** Inset Kiwi PNG sampling to skip opaque white padding at asset edges. */
const LOGO_SRC_INSET = 0.07;

export type LedFlightContent = {
  airlineName: string;
  flightId: string;
  routeHero: string;
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
 * e.g. 128×32 on 16:9 → 128×72 — no vertical stretch.
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
  routeY: number;
  originY: number;
  destY: number;
  telRows: number[];
};

const COMPACT_SAFE = 5;

/** Black panel margin left of the logo tile (LED pixels). */
const LOGO_LEFT_INSET = 2;
/** Margin right of the logo tile within the logo column. */
const LOGO_RIGHT_INSET = 1;
/** Margin above the logo tile (below the flight-ID band). */
const LOGO_TOP_INSET = 1;
/** Black panel rows between the logo and the bottom edge. */
const LOGO_BOTTOM_GAP = 2;

/** Gap between logo tile and right-column flight info (LED pixels). */
const RIGHT_COL_GAP = 3;
/** Horizontal inset inside the right column text band. */
const RIGHT_COL_PAD = 2;
/** Vertical gap between route hero and telemetry block. */
const ROUTE_TEL_GAP = 4;
/** Vertical gap between telemetry rows. */
const TEL_ROW_GAP = 3;

/** Logo column width — ~48% of grid (50% larger than the prior 32% band). */
const LOGO_WIDTH_FRACTION = 0.48;

/** Logo tile size relative to the max square that fits the column. */
const LOGO_SIZE_SCALE = 0.94 * 1.15 * 1.1;

function computeLogoColumnWidth(cols: number): number {
  return Math.max(12, Math.floor(cols * LOGO_WIDTH_FRACTION));
}

/** Left column: flight ID band on top, logo square anchored bottom-left. */
function computeLogoColumn(cols: number, rows: number) {
  const columnW = computeLogoColumnWidth(cols);
  const maxFlightH = 2 * LED_FONT.glyphH + LED_FONT.gapY;
  const flightBandMin = maxFlightH + 2;
  const logoTopMin = flightBandMin + LOGO_TOP_INSET;
  const logoBandW = columnW - LOGO_LEFT_INSET - LOGO_RIGHT_INSET;
  const sizeScale = Math.min(1.1, LOGO_SIZE_SCALE);

  const maxSide = Math.min(
    logoBandW,
    rows - LOGO_TOP_INSET - LOGO_BOTTOM_GAP
  );
  let logoW = Math.max(12, Math.floor(maxSide * sizeScale));
  logoW = Math.min(logoW, logoBandW);
  let logoH = logoW;
  let logoY = rows - logoH - LOGO_BOTTOM_GAP;

  if (logoY < logoTopMin) {
    const fitSide = rows - logoTopMin - LOGO_BOTTOM_GAP;
    logoH = Math.max(12, Math.min(Math.floor(fitSide * sizeScale), fitSide));
    logoW = Math.min(logoH, logoBandW);
    logoH = logoW;
    logoY = rows - logoH - LOGO_BOTTOM_GAP;
  }

  return {
    columnW,
    logoW,
    logoH,
    logoX: LOGO_LEFT_INSET,
    logoY,
    flightX: LOGO_LEFT_INSET,
    flightBandH: logoY,
    flightW: logoW,
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

function centerLedTextX(text: string, bandX: number, bandW: number): number {
  const display = truncateLedText(text, bandW);
  const width = measureLedText(display);
  return bandX + Math.max(0, Math.floor((bandW - width) / 2));
}

function centerLedTextCompactX(text: string, bandX: number, bandW: number): number {
  const display = truncateLedTextCompact(text, bandW);
  const width = measureLedTextCompact(display);
  return bandX + Math.max(0, Math.floor((bandW - width) / 2));
}

/** Route and telemetry stacked in the right panel, spread within the logo band. */
function buildRightContentLayout(
  rows: number,
  heroH: number,
  compactH: number,
  logoY: number,
  logoH: number
): { routeY: number; telRows: number[] } {
  const telBlockH =
    LED_TELEMETRY_COUNT * compactH + (LED_TELEMETRY_COUNT - 1) * TEL_ROW_GAP;
  const stackH = heroH + ROUTE_TEL_GAP + telBlockH;
  const bandInset = 2;
  const bandTop = logoY + bandInset;
  const bandBottom = Math.min(rows - 1, logoY + logoH - bandInset);
  const bandH = Math.max(compactH, bandBottom - bandTop);
  const stackTop =
    stackH >= bandH
      ? Math.max(1, bandTop)
      : bandTop + Math.floor((bandH - stackH) / 2);
  const routeY = stackTop;
  const telStart = stackTop + heroH + ROUTE_TEL_GAP;
  const telRows = Array.from(
    { length: LED_TELEMETRY_COUNT },
    (_, i) => telStart + i * (compactH + TEL_ROW_GAP)
  );
  return { routeY, telRows };
}

function buildLandscapeLayout(cols: number, rows: number): LayoutRegion {
  const pad = 1;
  const logo = computeLogoColumn(cols, rows);
  const compactH = ledCompactCellH();
  const heroH = ledCharCellH();

  const mainX = logo.columnW + RIGHT_COL_GAP + RIGHT_COL_PAD;
  const mainW = cols - mainX - pad - RIGHT_COL_PAD;
  const { routeY, telRows } = buildRightContentLayout(
    rows,
    heroH,
    compactH,
    logo.logoY,
    logo.logoH
  );

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
    routeY,
    originY: 0,
    destY: 0,
    telRows,
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
    drawLogoFallback(ctx, content.logoFallback, layout);
  }

  return logoRect;
}

function drawTelemetryColumn(
  ctx: CanvasRenderingContext2D,
  layout: LayoutRegion,
  telemetry: LedTelemetryField[]
): void {
  const { telX, telW, telRows } = layout;

  for (let i = 0; i < telemetry.length; i += 1) {
    const row = telRows[i];
    const field = telemetry[i];
    if (row == null || field == null) continue;
    drawLedTextCompact(
      ctx,
      field.value,
      centerLedTextCompactX(field.value, telX, telW),
      row,
      LED_COLORS.telemetry,
      telW
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
  rows: number
): void {
  const flightScale = pickFlightIdScale(
    content.flightId,
    layout.flightW,
    layout.flightBandH
  );
  const flightMetrics = ledScaledTextMetrics(
    content.flightId,
    flightScale.scaleX,
    flightScale.scaleY
  );
  const flightY = Math.max(
    1,
    Math.floor((layout.flightBandH - flightMetrics.height) / 2)
  );

  drawLedTextScaled(
    ctx,
    content.flightId,
    centerLedTextXScaled(
      content.flightId,
      layout.flightX,
      layout.flightW,
      flightScale.scaleX
    ),
    flightY,
    LED_COLORS.hero,
    layout.flightW,
    flightScale.scaleX,
    flightScale.scaleY,
    true
  );

  drawLedText(
    ctx,
    content.routeHero,
    centerLedTextX(content.routeHero, layout.mainX, layout.mainW),
    layout.routeY,
    LED_COLORS.phosphor,
    layout.mainW,
    true
  );

  drawTelemetryColumn(ctx, layout, content.telemetry);
}

function drawLogoFallback(
  ctx: CanvasRenderingContext2D,
  fallback: string,
  layout: Pick<LayoutRegion, 'logoX' | 'logoY' | 'logoW' | 'logoH'>
): void {
  const text = fallback.slice(0, layout.logoW >= 16 ? 3 : 2);
  if (layout.logoH >= ledCharCellH() + 2) {
    drawLedText(
      ctx,
      text,
      layout.logoX + 1,
      layout.logoY + Math.floor((layout.logoH - ledCharCellH()) / 2),
      LED_COLORS.phosphor,
      layout.logoW - 2
    );
    return;
  }
  drawLedTextCompact(
    ctx,
    text,
    layout.logoX + 1,
    layout.logoY + Math.floor((layout.logoH - COMPACT_SAFE) / 2),
    LED_COLORS.phosphor
  );
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
  ctx.imageSmoothingEnabled = false;

  if (cols >= rows * 1.6) {
    return renderLandscapeLayout(ctx, cols, rows, content, logo);
  }
  return renderPortraitLayout(ctx, cols, rows, content, logo);
}

function snapTextColor(r: number, g: number, b: number): string | null {
  const lum = r * 0.299 + g * 0.587 + b * 0.114;
  if (lum < 40) return null;
  if (b > r + 18 && b > g + 4) return LED_COLORS.telemetry;
  if (lum >= TEXT_THRESHOLD + 40) return LED_COLORS.hero;
  if (lum >= TEXT_THRESHOLD + 10) return LED_COLORS.phosphor;
  if (lum >= 85) return LED_COLORS.dim;
  return LED_COLORS.muted;
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
  ctx.arc(cx, cy, radius * 0.86, 0, Math.PI * 2);
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
  const radius = Math.min(cellW, cellH) * 0.4;
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

      const textColor = snapTextColor(r, g, b);
      if (textColor) {
        const strength = ledCellBrightness(x, y) * 0.98;
        litCells.push({ cx, cy, color: textColor, strength });
      }
    }
  }

  for (const cell of litCells) {
    drawLitDot(ctx, cell.cx, cell.cy, radius, cell.color, cell.strength);
  }
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
