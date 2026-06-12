/** Procedural LED marks for carriers whose CDN logos collapse at matrix scale. */

/** Native art size — one mark pixel = one LED on typical logo tiles (~40–60 px). */
export const LED_MARK_NATIVE_SIZE = 41;

type PixelMark = {
  w: number;
  h: number;
  /** Row-major color keys — '.' = transparent */
  pixels: string;
  palette: Record<string, string>;
};

function buildUpTriangleMark(
  size: number,
  padTop: number,
  triRows: number,
  baseRows: number,
  fill: string
): string {
  const rows = Array.from({ length: size }, () => '.'.repeat(size));
  for (let i = 0; i < triRows; i += 1) {
    const width = 2 * i + 1;
    const left = Math.floor((size - width) / 2);
    const y = padTop + i;
    rows[y] =
      '.'.repeat(left) + fill.repeat(width) + '.'.repeat(size - left - width);
  }
  const baseY = padTop + triRows;
  for (let b = 0; b < baseRows; b += 1) {
    rows[baseY + b] = fill.repeat(size);
  }
  return rows.join('');
}

/** Southwest heart — 41×41, tilted twin-lobe; red / blue / gold on navy tile */
const SWA_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    B: '#304CB2',
    Y: '#FFB612',
    R: '#C8102E',
  },
  pixels: [
    '.........................................',
    '.........................................',
    '..........RRRR........RRRRRR.............',
    '..........RRRR........RRRRRR.............',
    '........RRRRRRRRRR..RRRRRRRR.............',
    '........RRRRRRRRRR..RRRRRRRR.............',
    '......RRRRRRRRRRRRRRRRRRRRRRRR...........',
    '......RRRRRRRRRRRRRRRRRRRRRRRR...........',
    '....RRRRRRRRRRRRRRRRBBBBBBBBBBBBBB.......',
    '....RRRRRRRRRRRRRRRRBBBBBBBBBBBBBB.......',
    '....RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBB.....',
    '....RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBB.....',
    '..RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBB.....',
    '..RRRRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBB.....',
    '..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYY...',
    '..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYY...',
    '..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYY.',
    '..RRRRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYY.',
    '..RRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYY.',
    '..RRRRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYY.',
    '..RRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYY.',
    '..RRRRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYY.',
    '..RRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYYYY.',
    '..RRRRRRBBBBBBBBBBBBBBBBBBBBBBYYYYYYYYYY.',
    '..RRRRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYY...',
    '..RRRRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYY...',
    '..RRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYY...',
    '..RRBBBBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYY...',
    '....BBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYYYY...',
    '....BBBBBBBBBBBBBBBBBBYYYYYYYYYYYYYYYY...',
    '......BBBBBBBBBBBBBBYYYYYYYYYYYYYYYY.....',
    '......BBBBBBBBBBBBBBYYYYYYYYYYYYYYYY.....',
    '........BBBBBBBBBBBBYYYYYYYYYYYYYY.......',
    '........BBBBBBBBBBBBYYYYYYYYYYYYYY.......',
    '..........BBBBBBBBBBYYYYYYYYYYYY.........',
    '..........BBBBBBBBBBYYYYYYYYYYYY.........',
    '............BBBBBBBBYYYYYYYYYY...........',
    '............BBBBBBBBYYYYYYYYYY...........',
    '..............BBBBYYYYYYYYYY.............',
    '..............BBBBYYYYYYYYYY.............',
    '................YYYYYYYYYY...............',
  ].join(''),
};

/** Delta widget — 41×41, bold red chevron on navy LED tiles */
const DAL_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    R: '#C8102E',
  },
  pixels: buildUpTriangleMark(LED_MARK_NATIVE_SIZE, 4, 20, 2, 'R'),
};

/** American — flight symbol (diagonal blue/red wings, white eagle gap) — 41×41 on white tile */
const AAL_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    B: '#0078D2',
    R: '#C8102E',
  },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '...BBBB..................................',
    '...BBBBBBB...............................',
    '....BBBBBBB..............................',
    '.....BBBBBBB.............................',
    '......BBBBBBB............................',
    '......BBBBBBBB...........................',
    '.......BBBBBBBB..........................',
    '.......BBBBBBBBB.........................',
    '........BBBBBBBB.........................',
    '.........BBBBBBBB........................',
    '.........BBBBBBBBB.......................',
    '..........BBBBBBBBB......................',
    '...........BBBBBBBBB.....................',
    '.........................................',
    '....................BBBB.................',
    '.....................BBBBB...............',
    '.......................BBBB..............',
    '.....................RRRRR...............',
    '....................RRRRRR...............',
    '...................RRRRRRRR..............',
    '..................RRRRRRRRRR.............',
    '.................RRRRRRRRRRRR............',
    '................RRRRRRRRRRRRR............',
    '................RRRRRRRRRRRRRR...........',
    '...............RRRRRRRRRRRRRRR...........',
    '...............RRRRRRRRRRRRRRR...........',
    '..............RRRRRRRRRRRRRRRR...........',
    '.............RRRRRRRRRRRRRRRRR...........',
    '.............RRRRRRRRRRRRRRRRRR..........',
    '............RRRRRRRRRRRRRRRRRRR..........',
    '............RRRRRRRRRRRRRRRRRRRR.........',
    '...........RRRRRRRRRRRRRRRRRRRRR.........',
    '..........RRRRRRRRRRRRRRRRRRRRRR.........',
    '...........RRRRRRRRRRRRRRRRRRRR..........',
    '.........................................',
    '.........................................',
    '.........................................',
  ].join(''),
};

/** SkyWest — italic bold SW monogram — 41×41, logo blue on navy tile */
const SKW_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    B: '#0072CE',
  },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '......BBBBBBBBBBBBBB..........BB.........',
    '......BBBBBBBBBBBBBB..........BB.........',
    '....BBBBBBBBBBBBBBBBBB....BBBBBBBB.......',
    '....BBBBBBBBBBBBBBBBBB....BBBBBBBB.......',
    '..BBBBBBBB....BBBBBBBBBBBB..BBBBBBBB.....',
    '..BBBBBBBB....BBBBBBBBBBBB..BBBBBBBB.....',
    '..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....',
    '..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....',
    '..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....',
    '..BBBBBBBB......BBBBBB..BB..BBBBBBBB.....',
    '....BBBBBB....BBBBBB....BBBBBB..BBBBBB...',
    '....BBBBBB....BBBBBB....BBBBBB..BBBBBB...',
    '......BBBBBBBBBBBBBB........BBBBBBBB.....',
    '......BBBBBBBBBBBBBB........BBBBBBBB.....',
    '........BBBBBBBBBBBB..........BBBBBB.....',
    '........BBBBBBBBBBBB..........BBBBBB.....',
    '..........BBBBBBBB............BBBBBB.....',
    '..........BBBBBBBB............BBBBBB.....',
    '............BBBB..............BBBBBB.....',
    '............BBBB..............BBBBBB.....',
    '............BBBB................BB.......',
    '............BBBB................BB.......',
    '..........BBBBBB................BB.......',
    '..........BBBBBB................BB.......',
    '........BBBBBBBBBB................BB.....',
    '........BBBBBBBBBB................BB.....',
    '......BBBBBBBBBB.........................',
    '......BBBBBBBBBB.........................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
  ].join(''),
};

const MARKS: Record<string, PixelMark> = {
  AAL: AAL_MARK,
  SWA: SWA_MARK,
  DAL: DAL_MARK,
  SKW: SKW_MARK,
};

export function hasLedAirlineMark(icao: string): boolean {
  return icao in MARKS;
}

type MarkBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

function markBounds(mark: PixelMark): MarkBounds | null {
  let minX = mark.w;
  let minY = mark.h;
  let maxX = -1;
  let maxY = -1;

  for (let row = 0; row < mark.h; row += 1) {
    for (let col = 0; col < mark.w; col += 1) {
      const key = mark.pixels[row * mark.w + col];
      if (!key || key === '.') continue;
      minX = Math.min(minX, col);
      minY = Math.min(minY, row);
      maxX = Math.max(maxX, col);
      maxY = Math.max(maxY, row);
    }
  }

  if (maxX < 0) return null;
  return { minX, minY, maxX, maxY };
}

export function drawLedAirlineMark(
  ctx: CanvasRenderingContext2D,
  icao: string,
  x: number,
  y: number,
  w: number,
  h: number
): boolean {
  const mark = MARKS[icao];
  if (!mark) return false;

  const bounds = markBounds(mark);
  if (!bounds) return false;

  const contentW = bounds.maxX - bounds.minX + 1;
  const contentH = bounds.maxY - bounds.minY + 1;
  const margin = 1;
  const availW = Math.max(1, w - margin * 2);
  const availH = Math.max(1, h - margin * 2);
  const fitScale = Math.min(availW / contentW, availH / contentH);
  /** 1 mark pixel = 1 LED — never upscale (chunky 2× blocks on ~40 px tiles). */
  const scale = Math.min(1, Math.floor(fitScale)) || 1;
  const drawW = contentW * scale;
  const drawH = contentH * scale;
  const ox = x + Math.floor((w - drawW) / 2);
  const oy = y + Math.floor((h - drawH) / 2);

  for (let row = bounds.minY; row <= bounds.maxY; row += 1) {
    for (let col = bounds.minX; col <= bounds.maxX; col += 1) {
      const key = mark.pixels[row * mark.w + col];
      if (!key || key === '.') continue;
      const color = mark.palette[key];
      if (!color) continue;

      const dx = col - bounds.minX;
      const dy = row - bounds.minY;
      ctx.fillStyle = color;
      for (let sy = 0; sy < scale; sy += 1) {
        for (let sx = 0; sx < scale; sx += 1) {
          ctx.fillRect(ox + dx * scale + sx, oy + dy * scale + sy, 1, 1);
        }
      }
    }
  }

  return true;
}
