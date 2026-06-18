import type { IpadOrientation } from '@/lib/kiosk';
import {
  drawLedText,
  drawLedTextCompact,
  drawLedTextCompactRight,
  drawLedTextRight,
  drawLedTextScaled,
  LED_FONT,
  ledCharCellH,
  ledCompactCellH,
  ledScaledCellW,
  ledScaledTextMetrics,
  pickFlightIdScale,
  pickWallFlightIdScale,
  pickTelemetryScale,
  truncateLedTextScaled,
} from '@/lib/ledFont';
import { drawLedAirlineMark } from '@/lib/ledAirlineMarks';
import {
  drawLedAircraftIcon,
  ledAircraftIconAspect,
  type LedAircraftIcon,
} from '@/lib/ledAircraftIcons';
import type { LedTelemetryField } from '@/lib/ledFlightWall';

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
  /** Regional operator code (e.g. SKW) for partner-flown mainline flights. */
  operatorTag?: string;
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
  routeZoneTop: number;
  routeZoneH: number;
  statsZoneTop: number;
  statsZoneH: number;
  useStackedRoute: boolean;
  statsUseFullFont: boolean;
  wall: boolean;
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

/** Gap between logo column and right flight-info column (LED pixels). */
const RIGHT_COL_GAP = 4;
/** Horizontal inset inside the right column text band. */
const RIGHT_COL_PAD = 3;
/** Inset inside the logo-aligned right column band. */
const RIGHT_BAND_INSET = 3;

/** Logo column — leaves room for a hero route stack on the right. */
const LOGO_WIDTH_FRACTION = 0.4;

/** Wall displays — wider logo column and larger tile. */
const WALL_LOGO_WIDTH_FRACTION = 0.48;
const WALL_LOGO_SIZE_SCALE = 1;
const WALL_FLIGHT_TOP_INSET = 4;

/** Logo tile size relative to the max square that fits the column. */
const LOGO_SIZE_SCALE = 0.92;

function isWallDisplay(rows: number): boolean {
  return rows > LED_GRID.landscape.rows + 4;
}

/** Upper band share for stacked origin / arrow / destination. */
const ROUTE_ZONE_RATIO = 0.58;
/** Desk panel — leave more room for full aircraft names + speed in the stats band. */
const DESK_ROUTE_ZONE_RATIO = 0.4;

function computeLogoColumnWidth(cols: number, widthFraction = LOGO_WIDTH_FRACTION): number {
  return Math.max(12, Math.floor(cols * widthFraction));
}

/** Left column: flight ID band on top, logo square anchored bottom-left. */
function computeLogoColumn(cols: number, rows: number) {
  const wall = isWallDisplay(rows);
  const columnW = computeLogoColumnWidth(
    cols,
    wall ? WALL_LOGO_WIDTH_FRACTION : LOGO_WIDTH_FRACTION
  );
  const maxFlightH = 2 * LED_FONT.glyphH + LED_FONT.gapY;
  const flightBandMin = maxFlightH + 2;
  const logoBandW = columnW - LOGO_LEFT_INSET - LOGO_RIGHT_INSET;
  const sizeScale = wall ? WALL_LOGO_SIZE_SCALE : Math.min(1.1, LOGO_SIZE_SCALE);
  const flightHeaderRows = maxFlightH + 4;
  const logoTopMin = wall
    ? flightHeaderRows + LOGO_TOP_INSET + 2
    : flightBandMin + LOGO_TOP_INSET;

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
    flightBandH: wall ? flightHeaderRows : logoY,
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
  return { origin: hero.trim(), dest: '' };
}

/**
 * Weighted zones: route dominates the upper band; aircraft + speed share one
 * anchored stats row below — reads like a designed FIDS panel, not equal slots.
 */
function buildRightContentLayout(
  rows: number,
  logoY: number,
  logoH: number,
  options?: { wall?: boolean; rightBandTop?: number }
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
  let bandTop: number;
  let bandBottom: number;

  if (wall) {
    bandTop = options?.rightBandTop ?? WALL_FLIGHT_TOP_INSET;
    bandBottom = rows - 2;
  } else {
    bandTop = logoY + RIGHT_BAND_INSET;
    bandBottom = rows - 2;
  }

  const bandH = Math.max(ledCompactCellH() * 2, bandBottom - bandTop);
  const routeRatio = wall ? ROUTE_ZONE_RATIO : DESK_ROUTE_ZONE_RATIO;
  const routeZoneH = Math.max(ledCharCellH(), Math.floor(bandH * routeRatio));
  const statsZoneH = bandH - routeZoneH;
  const routeZoneTop = bandTop;
  const statsZoneTop = bandTop + routeZoneH;
  const useStackedRoute =
    wall || routeZoneH >= ledCharCellH() * 2 + 6;
  const statsUseFullFont =
    wall || statsZoneH >= ledCharCellH() + 1;

  return {
    bandTop,
    bandH,
    routeZoneTop,
    routeZoneH,
    statsZoneTop,
    statsZoneH,
    useStackedRoute,
    statsUseFullFont,
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
  const rightLayout = buildRightContentLayout(rows, logo.logoY, logo.logoH, {
    wall,
    rightBandTop: wall ? logo.flightTopInset : undefined,
  });

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
    drawLogoFallback(ctx, content.logoFallback, layout);
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

function drawRouteBlock(
  ctx: CanvasRenderingContext2D,
  layout: LayoutRegion,
  routeHero: string
): void {
  const { mainX, mainW, routeZoneTop, routeZoneH, useStackedRoute, wall } = layout;
  const textX = mainX + 2;
  const textW = mainW - 4;
  const { origin, dest } = parseLedRouteHero(routeHero);
  const pickRouteScale = wall ? pickWallFlightIdScale : pickFlightIdScale;

  if (useStackedRoute && dest) {
    const arrowScale = wall ? 2 : 1;
    const arrowH = wall
      ? ledScaledTextMetrics('→', arrowScale, arrowScale).height
      : ledCharCellH();
    const gap = wall ? 4 : 2;
    const endSlotH = Math.max(
      ledCharCellH(),
      Math.floor((routeZoneH - arrowH - gap * 2) / 2)
    );
    const endScale = pickRouteScale(origin, textW, endSlotH);
    const endMetrics = ledScaledTextMetrics(
      origin,
      endScale.scaleX,
      endScale.scaleY
    );
    const blockH = endMetrics.height * 2 + arrowH + gap * 2;
    let y = wall
      ? routeZoneTop
      : routeZoneTop + Math.round((routeZoneH - blockH) / 2);

    drawLedTextScaled(
      ctx,
      origin,
      centerLedTextXScaled(origin, textX, textW, endScale.scaleX),
      y,
      LED_COLORS.hero,
      textW,
      endScale.scaleX,
      endScale.scaleY,
      endScale.scaleX === 1
    );
    y += endMetrics.height + gap;

    drawLedTextScaled(
      ctx,
      '→',
      centerLedTextXScaled('→', textX, textW, arrowScale),
      y,
      LED_COLORS.phosphor,
      textW,
      arrowScale,
      arrowScale,
      false
    );
    y += arrowH + gap;

    drawLedTextScaled(
      ctx,
      dest,
      centerLedTextXScaled(dest, textX, textW, endScale.scaleX),
      y,
      LED_COLORS.hero,
      textW,
      endScale.scaleX,
      endScale.scaleY,
      endScale.scaleX === 1
    );
    return;
  }

  const scale = pickRouteScale(routeHero, textW, routeZoneH);
  const metrics = ledScaledTextMetrics(
    routeHero,
    scale.scaleX,
    scale.scaleY
  );
  const y = wall
    ? routeZoneTop
    : routeZoneTop + Math.round((routeZoneH - metrics.height) / 2);

  drawLedTextScaled(
    ctx,
    routeHero,
    centerLedTextXScaled(routeHero, textX, textW, scale.scaleX),
    y,
    LED_COLORS.hero,
    textW,
    scale.scaleX,
    scale.scaleY,
    scale.scaleX === 1
  );
}

/** Gap between the type silhouette and its label, relative to the icon height. */
const ICON_GAP_RATIO = 0.35;

/**
 * Draw the aircraft-type line centered as an [icon · label] group. Falls back to a
 * plain centered label when there is no silhouette or it can't fit.
 */
function drawTypeLineWithIcon(
  ctx: CanvasRenderingContext2D,
  text: string,
  icon: LedAircraftIcon | undefined,
  textX: number,
  textW: number,
  y: number,
  scale: { scaleX: number; scaleY: number }
): void {
  const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
  const iconH = metrics.height;
  const iconW = icon ? ledAircraftIconAspect(icon) * iconH : 0;
  const iconGap = icon ? Math.max(1, Math.round(iconH * ICON_GAP_RATIO)) : 0;
  const labelMaxW = Math.max(0, textW - iconW - iconGap);

  if (!icon || labelMaxW < ledScaledCellW(scale.scaleX)) {
    drawLedTextScaled(
      ctx,
      text,
      centerLedTextXScaled(text, textX, textW, scale.scaleX),
      y,
      LED_COLORS.telemetry,
      textW,
      scale.scaleX,
      scale.scaleY,
      scale.scaleX === 1
    );
    return;
  }

  const label = truncateLedTextScaled(text, labelMaxW, scale.scaleX);
  const labelW = ledScaledTextMetrics(label, scale.scaleX, scale.scaleY).width;
  const groupW = iconW + iconGap + labelW;
  const groupX = textX + Math.max(0, Math.floor((textW - groupW) / 2));

  drawLedAircraftIcon(ctx, icon, groupX, y, iconH, LED_COLORS.telemetry);
  drawLedTextScaled(
    ctx,
    label,
    groupX + iconW + iconGap,
    y,
    LED_COLORS.telemetry,
    labelMaxW,
    scale.scaleX,
    scale.scaleY,
    scale.scaleX === 1
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
  const aircraft = telemetry[0]?.value ?? '';
  const aircraftIcon = telemetry[0]?.icon;
  const speed = telemetry[1]?.value ?? '';
  const motion = telemetry[2]?.value ?? '';

  const gap = wall ? 3 : 2;
  /** Lines fitting the band at the base 5×7 font, with the motion line as the first drop. */
  const maxLines = Math.max(
    1,
    Math.floor((statsZoneH + gap) / (LED_FONT.glyphH + gap))
  );
  let lines = motion ? [aircraft, motion, speed] : [aircraft, speed];
  if (lines.length > maxLines) {
    lines = [aircraft, speed].slice(0, Math.max(1, maxLines));
  }

  if (lines.length >= 2) {
    const count = lines.length;
    const slotH = Math.floor((statsZoneH - gap * (count - 1)) / count);
    const pickScale = wall ? pickWallFlightIdScale : pickTelemetryScale;

    lines.forEach((text, i) => {
      const scale = pickScale(text, textW, slotH);
      const metrics = ledScaledTextMetrics(text, scale.scaleX, scale.scaleY);
      const slotTop = statsZoneTop + i * (slotH + gap);
      const y = slotTop + Math.round((slotH - metrics.height) / 2);

      if (i === 0) {
        drawTypeLineWithIcon(ctx, text, aircraftIcon, textX, textW, y, scale);
        return;
      }

      drawLedTextScaled(
        ctx,
        text,
        centerLedTextXScaled(text, textX, textW, scale.scaleX),
        y,
        LED_COLORS.telemetry,
        textW,
        scale.scaleX,
        scale.scaleY,
        scale.scaleX === 1
      );
    });
    return;
  }

  const rowH = ledCompactCellH();
  const rowY = statsZoneTop + Math.round((statsZoneH - rowH) / 2);
  const aircraftScale = pickTelemetryScale(aircraft, textW, statsZoneH);
  const aircraftMetrics = ledScaledTextMetrics(
    aircraft,
    aircraftScale.scaleX,
    aircraftScale.scaleY
  );
  const aircraftY = rowY + Math.round((rowH - aircraftMetrics.height) / 2);

  let aircraftX = textX;
  let aircraftMaxW = textW;
  if (aircraftIcon) {
    const iconH = aircraftMetrics.height;
    const iconW = ledAircraftIconAspect(aircraftIcon) * iconH;
    const iconGap = Math.max(1, Math.round(iconH * ICON_GAP_RATIO));
    if (textW - iconW - iconGap >= ledScaledCellW(aircraftScale.scaleX)) {
      drawLedAircraftIcon(ctx, aircraftIcon, textX, aircraftY, iconH, LED_COLORS.telemetry);
      aircraftX = textX + iconW + iconGap;
      aircraftMaxW = Math.max(0, textW - iconW - iconGap);
    }
  }

  drawLedTextScaled(
    ctx,
    aircraft,
    aircraftX,
    aircraftY,
    LED_COLORS.telemetry,
    aircraftMaxW,
    aircraftScale.scaleX,
    aircraftScale.scaleY,
    aircraftScale.scaleX === 1
  );
  drawLedTextCompactRight(
    ctx,
    speed,
    textX + textW,
    rowY,
    LED_COLORS.telemetry,
    textW
  );
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
  const wall = isWallDisplay(rows);
  const operator = content.operatorTag?.trim() ?? '';
  /** Stack the operator below the flight ID when the band can hold a second compact line. */
  const showOperator =
    operator.length > 0 &&
    layout.flightBandH >= LED_FONT.glyphH + ledCompactCellH() + 2;
  const idBandH = showOperator
    ? layout.flightBandH - ledCompactCellH() - 1
    : layout.flightBandH;

  const flightScale = wall
    ? pickWallFlightIdScale(content.flightId, layout.flightW, idBandH)
    : pickFlightIdScale(content.flightId, layout.flightW, idBandH);
  const flightMetrics = ledScaledTextMetrics(
    content.flightId,
    flightScale.scaleX,
    flightScale.scaleY
  );
  const flightY = wall
    ? layout.flightTopInset
    : Math.max(1, Math.floor((idBandH - flightMetrics.height) / 2));

  drawLedTextScaled(
    ctx,
    content.flightId,
    layout.flightX + 1,
    flightY,
    LED_COLORS.hero,
    layout.flightW - 2,
    flightScale.scaleX,
    flightScale.scaleY,
    true
  );

  if (showOperator) {
    drawLedTextCompact(
      ctx,
      `- ${operator}`,
      layout.flightX + 1,
      flightY + flightMetrics.height + 1,
      LED_COLORS.telemetry,
      layout.flightW - 2
    );
  }

  drawPanelChrome(ctx, layout);
  drawRouteBlock(ctx, layout, content.routeHero);
  drawStatsRow(ctx, layout, content.telemetry);
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

      const textColor = snapTextColor(r, g, b);
      if (textColor) {
        const evenPhosphor =
          textColor === LED_COLORS.hero || textColor === LED_COLORS.phosphor;
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
