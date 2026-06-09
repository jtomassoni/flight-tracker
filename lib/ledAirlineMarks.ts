/** Procedural LED marks for carriers whose CDN logos collapse at matrix scale. */

type PixelMark = {
  w: number;
  h: number;
  /** Row-major color keys — '.' = transparent */
  pixels: string;
  palette: Record<string, string>;
};

/** Southwest heart-with-wings — 21×21, edge-to-edge on white LED tiles */
const SWA_MARK: PixelMark = {
  w: 21,
  h: 21,
  palette: {
    B: '#304CB2',
    Y: '#FFB612',
    R: '#C8102E',
  },
  pixels: [
    'BBBB....RRRR....BBBBB',
    '.BBBB...RRRR...BBBBB.',
    '.BBBBB..RRRR..BBBBBB.',
    '.BBBBBB.RRRRR.BBBBBB.',
    '.BBBBBBRRRRRRBBBBBBB.',
    '.BBBBBRRRRRRRBBBBBBB.',
    '.BBBBRRRRRRRYBBBBBBB.',
    '.BBBRRRRRRRYYYBBBBBB.',
    '.BBRRRRRRRYYYYBBBBBB.',
    '.BRRRRRRRYYYYYYBBBBB.',
    '.RRRRRRRYYYYYYYBBBBB.',
    '.RRRRRRYYYYYYYYBBBBB.',
    '.RRRRRYYYYYYYYYBBBBB.',
    '.RRRRYYYYYYYYYYBBBBB.',
    '.RRRYYYYYYYYYYYBBBBB.',
    '.RRYYYYYYYYYYYYBBBBB.',
    '.RYYYYYYYYYYYYYBBBBB.',
    '.YYYYYYYYYYYYYYBBBBB.',
    '..YYYYYYYYYYYYBBBBB..',
    '...YYYYYYYYYYBBBBB...',
    '....YYYYYYYYBBBBB....',
  ].join(''),
};

/** SkyWest — triple peak range — 21×21, lime + snow on navy LED tiles */
const SKW_MARK: PixelMark = {
  w: 21,
  h: 21,
  palette: {
    W: '#FFFFFF',
    L: '#C4D600',
  },
  pixels: [
    '.....W....W....W.....',
    '....WLW..WLW..WLW....',
    '...WLLW.WLLW.WLLW....',
    '..WLLLW.WLLLW.WLLW...',
    'WLLLLWWLLLLWWLLLLWLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'WWWWWWWWWWWWWWWWWWWWW',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
    'LLLLLLLLLLLLLLLLLLLLL',
  ].join(''),
};

const MARKS: Record<string, PixelMark> = {
  SWA: SWA_MARK,
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
  const scale = Math.max(1, Math.floor(Math.min(availW / contentW, availH / contentH)));
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
