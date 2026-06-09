/** Procedural LED marks for carriers whose CDN logos collapse at matrix scale. */

/** Native art size — one mark pixel maps to one LED on typical logo tiles (~40–60 px). */
export const LED_MARK_NATIVE_SIZE = 41;

type PixelMark = {
  w: number;
  h: number;
  /** Row-major color keys — '.' = transparent */
  pixels: string;
  palette: Record<string, string>;
};

/** Southwest heart — 41×41 native wall-tile res; tilted twin-lobe red / blue / gold bands */
const SWA_MARK: PixelMark = {
  w: 41,
  h: 41,
  palette: {
    B: '#304CB2',
    Y: '#FFB612',
    R: '#C8102E',
  },
  pixels: [
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
    '................YYYYYYYYYY...............',
    '.........................................',
  ].join(''),
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

/** Delta widget — 41×41, bold red chevron on navy LED tiles */
const DAL_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    R: '#C8102E',
  },
  pixels: buildUpTriangleMark(LED_MARK_NATIVE_SIZE, 4, 20, 2, 'R'),
};

/** American — intertwined AA eagle monogram — 21×21, blue + red on white LED tiles */
const AAL_MARK: PixelMark = {
  w: 21,
  h: 21,
  palette: {
    B: '#0078D2',
    R: '#C8102E',
  },
  pixels: [
    '.....................',
    '.....................',
    '.......BB...RR.......',
    '......BBBB.RRRR......',
    '.....BB..BRR..RR.....',
    '....BB...BRR...RR....',
    '...BBBBBBBRRRRRRR....',
    '..BB.....BR.....RR...',
    '..BB......R......RR..',
    '.BB.......R.......RR.',
    '.BB.......R.......RR.',
    'BB........R........RR',
    'BB........R........RR',
    '.BB......RR......RR..',
    '..BB....RR..RR....RR.',
    '...BBBBRR...RRRRR....',
    '....BB.........RR....',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
  ].join(''),
};

/** SkyWest — italic bold SW monogram — 21×21, logo blue on navy LED tiles */
const SKW_MARK: PixelMark = {
  w: 21,
  h: 21,
  palette: {
    B: '#0072CE',
  },
  pixels: [
    '.....................',
    '.....................',
    '...BBBBB....B........',
    '..BBBBBBB..BBB.......',
    '.BB..BBBB.BB.BB......',
    'BB...BB.B.BB.BB......',
    'BB...BB.B.BB.BB......',
    '.BB..BB...BB.BB......',
    '..BBBBB....BBB.......',
    '...BBBB.....BB.......',
    '....BB......BB.......',
    '.....B......BB.......',
    '.....B.......B.......',
    '....BB.......B.......',
    '...BBB........B......',
    '..BBB................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
    '.....................',
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

  const margin = 0;
  const availW = Math.max(1, w - margin * 2);
  const availH = Math.max(1, h - margin * 2);
  const fitScale = Math.min(availW / mark.w, availH / mark.h);
  /** 1 mark pixel = 1 LED — never upscale (chunky blocks on ~40 px tiles). */
  const scale = Math.min(1, Math.floor(fitScale)) || 1;
  const drawW = mark.w * scale;
  const drawH = mark.h * scale;
  const ox = x + Math.floor((w - drawW) / 2);
  const oy = y + Math.floor((h - drawH) / 2);

  for (let row = 0; row < mark.h; row += 1) {
    for (let col = 0; col < mark.w; col += 1) {
      const key = mark.pixels[row * mark.w + col];
      if (!key || key === '.') continue;
      const color = mark.palette[key];
      if (!color) continue;

      const dx = col;
      const dy = row;
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
