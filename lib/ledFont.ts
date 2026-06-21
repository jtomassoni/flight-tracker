/**
 * 5×7 airport FIDS glyphs — medium stroke weight for legibility on round LED pixels.
 * Bit order: MSB = left column.
 */
const GLYPHS: Record<string, readonly number[]> = {
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '!': [0x04, 0x04, 0x04, 0x04, 0x00, 0x04, 0x00],
  '+': [0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '·': [0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00],
  '°': [0x06, 0x09, 0x09, 0x06, 0x00, 0x00, 0x00],
  '→': [0x08, 0x04, 0x02, 0x1f, 0x02, 0x04, 0x08],
  '↑': [0x04, 0x0e, 0x15, 0x04, 0x04, 0x04, 0x04],
  '↓': [0x04, 0x04, 0x04, 0x04, 0x15, 0x0e, 0x04],
  '>': [0x08, 0x04, 0x02, 0x04, 0x08, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x04],
  '/': [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x0e, 0x10, 0x10, 0x1f],
  '3': [0x1e, 0x01, 0x0e, 0x01, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x0e, 0x10, 0x1e, 0x11, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x04, 0x04, 0x04],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ':': [0x00, 0x04, 0x00, 0x00, 0x04, 0x00, 0x00],
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0e],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x12, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0e, 0x11, 0x10, 0x0e, 0x01, 0x11, 0x0e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x0a, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x11],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
};

export const LED_FONT = {
  glyphW: 5,
  glyphH: 7,
  gapX: 2,
  gapY: 2,
} as const;

export function ledCharCellW(): number {
  return LED_FONT.glyphW + LED_FONT.gapX;
}

export function ledCharCellH(): number {
  return LED_FONT.glyphH + LED_FONT.gapY;
}

function glyphFor(ch: string): readonly number[] {
  const key = ch.toUpperCase();
  return GLYPHS[key] ?? GLYPHS[' '];
}

export function measureLedText(text: string): number {
  if (!text) return 0;
  return text.length * ledCharCellW() - LED_FONT.gapX;
}

/** Longest first so NORTHEAST matches before NORTH. */
const LED_CARDINAL_WORDS = [
  'NORTHEAST',
  'NORTHWEST',
  'SOUTHEAST',
  'SOUTHWEST',
  'NORTH',
  'SOUTH',
  'EAST',
  'WEST',
] as const;

function trailingCardinal(text: string): { prefix: string; cardinal: string } | null {
  const upper = text.toUpperCase();
  for (const cardinal of LED_CARDINAL_WORDS) {
    if (upper === cardinal) return { prefix: '', cardinal };
    const suffix = ` ${cardinal}`;
    if (upper.endsWith(suffix)) {
      return { prefix: text.slice(0, text.length - suffix.length), cardinal };
    }
  }
  return null;
}

/** Never abbreviate a trailing cardinal — drop the prefix or clip instead. */
function truncateLedChars(text: string, maxChars: number): string {
  if (maxChars <= 0 || !text) return '';
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return text.slice(0, 1);

  const card = trailingCardinal(text);
  if (card) {
    const { prefix, cardinal } = card;
    if (cardinal.length <= maxChars) {
      if (!prefix) return cardinal;
      const combined = `${prefix} ${cardinal}`;
      if (combined.length <= maxChars) return combined;
      const prefixRoom = maxChars - cardinal.length - 1;
      if (prefixRoom <= 0 || prefix.length > prefixRoom) return cardinal;
      return `${prefix.slice(0, prefixRoom)} ${cardinal}`;
    }
    return cardinal;
  }

  return `${text.slice(0, maxChars - 1)}.`;
}

export function truncateLedText(text: string, maxDots: number): string {
  if (maxDots <= 0 || !text) return '';
  const cell = ledCharCellW();
  const maxChars = Math.max(1, Math.floor((maxDots + LED_FONT.gapX) / cell));
  return truncateLedChars(text, maxChars);
}

export function ledScaledCellW(scaleX: number): number {
  return scaleX * LED_FONT.glyphW + LED_FONT.gapX;
}

export function ledScaledTextMetrics(
  text: string,
  scaleX: number,
  scaleY: number
): { width: number; height: number } {
  if (!text) return { width: 0, height: 0 };
  return {
    width: text.length * ledScaledCellW(scaleX) - LED_FONT.gapX,
    height: scaleY * LED_FONT.glyphH,
  };
}

export function truncateLedTextScaled(text: string, maxDots: number, scaleX: number): string {
  if (maxDots <= 0 || !text) return '';
  const cell = ledScaledCellW(scaleX);
  const maxChars = Math.max(1, Math.floor((maxDots + LED_FONT.gapX) / cell));
  return truncateLedChars(text, maxChars);
}

/** Largest uniform scale that fits — no vertical-only stretch. */
export function pickFlightIdScale(
  text: string,
  bandW: number,
  bandH: number
): { scaleX: number; scaleY: number } {
  for (const scale of [2, 1]) {
    const { width, height } = ledScaledTextMetrics(text, scale, scale);
    if (width <= bandW && height + 2 <= bandH) {
      return { scaleX: scale, scaleY: scale };
    }
  }

  return { scaleX: 1, scaleY: 1 };
}

/** Wall kiosk — try intermediate scales so hero flight IDs fill a wider column. */
export function pickWallFlightIdScale(
  text: string,
  bandW: number,
  bandH: number
): { scaleX: number; scaleY: number } {
  for (const scale of [2, 1.5, 1]) {
    const { width, height } = ledScaledTextMetrics(text, scale, scale);
    if (width <= bandW && height + 2 <= bandH) {
      return { scaleX: scale, scaleY: scale };
    }
  }

  return { scaleX: 1, scaleY: 1 };
}

/** Telemetry lines — scale up on tall iPad bands, down when space is tight. */
export function pickTelemetryScale(
  text: string,
  bandW: number,
  bandH: number
): { scaleX: number; scaleY: number } {
  const cellH = ledCharCellH();
  const scales =
    bandH >= cellH * 4
      ? [2, 1.5, 1, 0.85, 0.75, 0.65]
      : bandH >= cellH * 2.5
        ? [1.5, 1, 0.85, 0.75, 0.65]
        : [1, 0.85, 0.75, 0.65];

  for (const scale of scales) {
    const { width, height } = ledScaledTextMetrics(text, scale, scale);
    if (width <= bandW && height + 1 <= bandH) {
      return { scaleX: scale, scaleY: scale };
    }
  }

  return { scaleX: 0.65, scaleY: 0.65 };
}

/** Alt/speed pair — one scale so both halves share a baseline and stay legible. */
export function pickStatsPairScale(
  leftText: string,
  rightText: string,
  leftW: number,
  rightW: number,
  bandH: number
): { scaleX: number; scaleY: number } {
  const cellH = ledCharCellH();
  const scales =
    bandH >= cellH * 2.5
      ? [1.5, 1.25, 1, 0.85, 0.75, 0.65]
      : [1.25, 1, 0.85, 0.75, 0.65];

  for (const scale of scales) {
    const left = truncateLedTextScaled(leftText, leftW, scale);
    const right = truncateLedTextScaled(rightText, rightW, scale);
    const leftMetrics = ledScaledTextMetrics(left, scale, scale);
    const rightMetrics = ledScaledTextMetrics(right, scale, scale);
    const rowH = Math.max(leftMetrics.height, rightMetrics.height);
    if (
      leftMetrics.width <= leftW &&
      rightMetrics.width <= rightW &&
      rowH + 1 <= bandH
    ) {
      return { scaleX: scale, scaleY: scale };
    }
  }

  return { scaleX: 0.65, scaleY: 0.65 };
}

function drawGlyphPixels(
  ctx: CanvasRenderingContext2D,
  glyph: readonly number[],
  ox: number,
  y: number,
  scaleX: number,
  scaleY: number,
  bold: boolean
): void {
  /** 2× scale already doubles pixel area — extra bold smears the glyph. */
  const thicken = bold && scaleX === 1 && scaleY === 1;

  for (let row = 0; row < LED_FONT.glyphH; row += 1) {
    const bits = glyph[row] ?? 0;
    for (let col = 0; col < LED_FONT.glyphW; col += 1) {
      if ((bits >> (LED_FONT.glyphW - 1 - col)) & 1) {
        /**
         * Snap each glyph pixel to the integer LED grid. Fractional scales (e.g.
         * 1.5× hero flight IDs on wall displays) otherwise anti-alias the fillRect
         * edges, leaving partially-lit LEDs that read as dimmer gray dots.
         */
        const x0 = Math.round(ox + col * scaleX);
        const x1 = Math.round(ox + (col + 1) * scaleX);
        const y0 = Math.round(y + row * scaleY);
        const y1 = Math.round(y + (row + 1) * scaleY);
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        if (thicken && row + 1 < LED_FONT.glyphH) {
          ctx.fillRect(x0, Math.round(y + (row + 1) * scaleY), x1 - x0, y1 - y0);
        }
      }
    }
  }
}

export function drawLedTextScaled(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  maxDots: number | undefined,
  scaleX: number,
  scaleY: number,
  bold = false
): void {
  const display =
    maxDots != null ? truncateLedTextScaled(text, maxDots, scaleX) : text;
  if (!display) return;

  const { height } = ledScaledTextMetrics(display, scaleX, scaleY);

  ctx.save();
  if (maxDots != null && maxDots > 0) {
    ctx.beginPath();
    ctx.rect(x, y, maxDots, height);
    ctx.clip();
  }

  ctx.fillStyle = color;
  for (let i = 0; i < display.length; i += 1) {
    const glyph = glyphFor(display[i]!);
    const ox = x + i * ledScaledCellW(scaleX);
    drawGlyphPixels(ctx, glyph, ox, y, scaleX, scaleY, bold);
  }
  ctx.restore();
}

export function drawLedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  maxDots?: number,
  bold = false
): void {
  drawLedTextScaled(ctx, text, x, y, color, maxDots, 1, 1, bold);
}

export function drawLedTextRight(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  y: number,
  color: string,
  maxDots: number,
  bold = false
): void {
  const display = truncateLedText(text, maxDots);
  const width = measureLedText(display);
  const x = Math.max(0, rightX - width);
  drawLedText(ctx, display, x, y, color, rightX - x + 1, bold);
}

/** 4×5 compact glyphs — heavier strokes for telemetry rows on round LEDs. */
const COMPACT_GLYPHS: Record<string, readonly number[]> = {
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00],
  '-': [0x00, 0x00, 0x0f, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x08],
  ',': [0x00, 0x00, 0x00, 0x08, 0x04],
  '/': [0x01, 0x02, 0x04, 0x08, 0x00],
  '0': [0x0e, 0x09, 0x09, 0x09, 0x0e],
  '1': [0x06, 0x0e, 0x06, 0x06, 0x0f],
  '2': [0x0e, 0x01, 0x06, 0x08, 0x0f],
  '3': [0x0e, 0x01, 0x06, 0x01, 0x0e],
  '4': [0x06, 0x0a, 0x0f, 0x02, 0x02],
  '5': [0x0f, 0x08, 0x0e, 0x01, 0x0e],
  '6': [0x06, 0x08, 0x0e, 0x09, 0x0e],
  '7': [0x0f, 0x01, 0x02, 0x04, 0x04],
  '8': [0x0e, 0x09, 0x06, 0x09, 0x0e],
  '9': [0x0e, 0x09, 0x07, 0x01, 0x0e],
  A: [0x0e, 0x09, 0x0f, 0x09, 0x09],
  B: [0x0e, 0x09, 0x0e, 0x09, 0x0e],
  C: [0x0e, 0x08, 0x08, 0x08, 0x0e],
  D: [0x0e, 0x09, 0x09, 0x09, 0x0e],
  E: [0x0f, 0x08, 0x0e, 0x08, 0x0f],
  F: [0x0f, 0x08, 0x0e, 0x08, 0x08],
  G: [0x0e, 0x08, 0x0b, 0x09, 0x0e],
  H: [0x09, 0x09, 0x0f, 0x09, 0x09],
  I: [0x0e, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x0a, 0x04],
  K: [0x09, 0x0a, 0x0c, 0x0a, 0x09],
  L: [0x08, 0x08, 0x08, 0x08, 0x0f],
  M: [0x09, 0x0f, 0x0f, 0x09, 0x09],
  N: [0x09, 0x0d, 0x0b, 0x09, 0x09],
  O: [0x0e, 0x09, 0x09, 0x09, 0x0e],
  P: [0x0e, 0x09, 0x0e, 0x08, 0x08],
  Q: [0x0e, 0x09, 0x09, 0x0b, 0x07],
  R: [0x0e, 0x09, 0x0e, 0x0a, 0x09],
  S: [0x07, 0x08, 0x06, 0x01, 0x0e],
  T: [0x0f, 0x04, 0x04, 0x04, 0x04],
  U: [0x09, 0x09, 0x09, 0x09, 0x0e],
  V: [0x09, 0x09, 0x09, 0x06, 0x04],
  W: [0x09, 0x09, 0x0f, 0x0f, 0x09],
  X: [0x09, 0x06, 0x04, 0x06, 0x09],
  Y: [0x09, 0x09, 0x06, 0x04, 0x04],
  Z: [0x0f, 0x02, 0x04, 0x08, 0x0f],
  '°': [0x06, 0x09, 0x06, 0x00, 0x00],
};

export const LED_FONT_COMPACT = {
  glyphW: 4,
  glyphH: 5,
  gapX: 2,
  gapY: 1,
} as const;

export function ledCompactCellW(): number {
  return LED_FONT_COMPACT.glyphW + LED_FONT_COMPACT.gapX;
}

export function ledCompactCellH(): number {
  return LED_FONT_COMPACT.glyphH + LED_FONT_COMPACT.gapY;
}

function compactGlyphFor(ch: string): readonly number[] {
  const key = ch.toUpperCase();
  return COMPACT_GLYPHS[key] ?? COMPACT_GLYPHS[' '];
}

export function measureLedTextCompact(text: string): number {
  if (!text) return 0;
  return text.length * ledCompactCellW() - LED_FONT_COMPACT.gapX;
}

export function truncateLedTextCompact(text: string, maxDots: number): string {
  if (maxDots <= 0 || !text) return '';
  const cell = ledCompactCellW();
  const maxChars = Math.max(1, Math.floor((maxDots + LED_FONT_COMPACT.gapX) / cell));
  return truncateLedChars(text, maxChars);
}

export function drawLedTextCompact(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  maxDots?: number
): void {
  const display = maxDots != null ? truncateLedTextCompact(text, maxDots) : text;
  if (!display) return;

  ctx.save();
  if (maxDots != null && maxDots > 0) {
    ctx.beginPath();
    ctx.rect(x, y, maxDots, LED_FONT_COMPACT.glyphH);
    ctx.clip();
  }

  ctx.fillStyle = color;
  for (let i = 0; i < display.length; i += 1) {
    const glyph = compactGlyphFor(display[i]!);
    const ox = x + i * ledCompactCellW();

    for (let row = 0; row < LED_FONT_COMPACT.glyphH; row += 1) {
      const bits = glyph[row] ?? 0;
      for (let col = 0; col < LED_FONT_COMPACT.glyphW; col += 1) {
        if ((bits >> (LED_FONT_COMPACT.glyphW - 1 - col)) & 1) {
          ctx.fillRect(ox + col, y + row, 1, 1);
        }
      }
    }
  }
  ctx.restore();
}

export function drawLedTextCompactRight(
  ctx: CanvasRenderingContext2D,
  text: string,
  rightX: number,
  y: number,
  color: string,
  maxDots: number
): void {
  const display = truncateLedTextCompact(text, maxDots);
  const width = measureLedTextCompact(display);
  const x = Math.max(0, rightX - width);
  drawLedTextCompact(ctx, display, x, y, color, rightX - x + 1);
}

/** Label left, value right — fills the telemetry band edge to edge. */
export function drawLedTelemetryPair(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  labelW: number,
  totalW: number,
  labelColor: string,
  valueColor: string
): void {
  drawLedTextCompact(ctx, label, x, y, labelColor, labelW);
  drawLedTextCompactRight(
    ctx,
    value,
    x + totalW,
    y,
    valueColor,
    totalW - labelW - 1
  );
}
