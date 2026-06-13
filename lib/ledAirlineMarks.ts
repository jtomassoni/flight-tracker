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

/** Trefoil shamrock — three overlapping lobes over a curling stem. */
function buildShamrockMark(size: number, fill: string): string {
  const r = size * 0.185;
  const lobes = [
    { cx: size * 0.5, cy: size * 0.27, r },
    { cx: size * 0.27, cy: size * 0.5, r },
    { cx: size * 0.73, cy: size * 0.5, r },
  ];
  const stemTop = size * 0.5;
  const stemBottom = size * 0.92;
  const rows: string[] = [];

  for (let y = 0; y < size; y += 1) {
    let row = '';
    for (let x = 0; x < size; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      let on = false;

      for (const lobe of lobes) {
        const dx = px - lobe.cx;
        const dy = py - lobe.cy;
        if (dx * dx + dy * dy <= lobe.r * lobe.r) {
          on = true;
          break;
        }
      }

      if (!on && py >= stemTop && py <= stemBottom) {
        const t = (py - stemTop) / (stemBottom - stemTop);
        const stemCx = size * 0.5 + size * 0.1 * t * t;
        const halfW = (1 - t) * (size * 0.045) + size * 0.022;
        if (Math.abs(px - stemCx) <= halfW) on = true;
      }

      row += on ? fill : '.';
    }
    rows.push(row);
  }

  return rows.join('');
}

/** Southwest striped heart — 41×41, official 2014 mark with silver outline + dividers */
const SWA_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    B: '#304CB2',
    R: '#D5152E',
    Y: '#FFBF27',
    S: '#CCCCCC',
  },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.............SSSS.......SSSS.............',
    '...........SSSRSSSS...SSSYYSSS...........',
    '..........SSRRRRSSSS.SSYYYYYYSS..........',
    '.........SSRRRRRRSSSSSYYYYYYYYSS.........',
    '.........SSSRRRRRRSSYYYYYYYYYYYS.........',
    '........SSBSSRRRRRRSSYYYYYYYYYYSS........',
    '........SBBBSSRRRRRRSSYYYYYYYYYYS........',
    '........SBBBBSSRRRRRRSSYYYYYYYYYS........',
    '........SBBBBBSSRRRRRRSSYYYYYYYYS........',
    '........SBBBBBBSSRRRRRRSSYYYYYYYS........',
    '........SBBBBBBBSSRRRRRRSSYYYYYYS........',
    '........SBBBBBBBBSSRRRRRRSSYYYYYS........',
    '........SSBBBBBBBBSSRRRRRRSSYYYSS........',
    '.........SBBBBBBBBBSSRRRRRRSSYYS.........',
    '.........SSBBBBBBBBBSSRRRRRRSSSS.........',
    '..........SBBBBBBBBBBSSRRRRRRSS..........',
    '..........SSBBBBBBBBBBSSRRRRRSS..........',
    '...........SBBBBBBBBBBBSSRRRRS...........',
    '...........SSBBBBBBBBBBBSSRRSS...........',
    '............SSBBBBBBBBBBBSSSS............',
    '.............SSBBBBBBBBBBBSS.............',
    '..............SSBBBBBBBBBSS..............',
    '...............SSBBBBBBBSS...............',
    '................SSBBBBBSS................',
    '.................SSSBSSS.................',
    '...................SSS...................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
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
    '..BBBBBB.................................',
    '...BBBBBBB...............................',
    '...BBBBBBBB..............................',
    '....BBBBBBBB.............................',
    '.....BBBBBBBB............................',
    '.....BBBBBBBBB...........................',
    '......BBBBBBBBB..........................',
    '.......BBBBBBBB..........................',
    '.......BBBBBBBBB.........................',
    '........BBBBBBBBB........................',
    '........BBBBBBBBBB.......................',
    '.........BBBBBBBBBB......................',
    '..........BBBBBBBBB......................',
    '...........BBBBBBBBB.....................',
    '.............BBBBBBBB....................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.....................RRRR................',
    '....................RRRRRR...............',
    '...................RRRRRRRR..............',
    '..................RRRRRRRRRR.............',
    '..................RRRRRRRRRR.............',
    '..................RRRRRRRRRRR............',
    '..................RRRRRRRRRRRR...........',
    '..................RRRRRRRRRRRRR..........',
    '...................RRRRRRRRRRRRR.........',
    '...................RRRRRRRRRRRRRR........',
    '....................RRRRRRRRRRRRRR.......',
    '.....................RRRRRRRRRRRRR.......',
    '.....................RRRRRRRRRRRRRR......',
    '......................RRRRRRRRRRRRRR.....',
    '.......................RRRRRRRRRRRRRR....',
    '........................RRRRRRRRRRRRRR...',
    '..........................RRRRRRRRRRRRR..',
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

/** Military — star roundel on olive tile */
const MIL_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: { G: '#3D4F2F', D: '#2C1810', Y: '#C5A572' },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '....................D....................',
    '...............DDDDDYDDDDD...............',
    '..............DDDGGGYGGGDDD..............',
    '............DDDGGGGYGYGGGGDDD............',
    '...........DDGGGGGGYGYGGGGGGDD...........',
    '..........DDGGGGGGGYGYGGGGGGGDD..........',
    '..........DGGGGGGGYGGGYGGGGGGGD..........',
    '.........DDGGGGGGGYGGGYGGGGGGGDD.........',
    '........DDGGGGGGGGYGGGYGGGGGGGGDD........',
    '........DDGGGGGGGGGGGGGGGGGGGGGDD........',
    '.......YYYYYYYYYGGGGGGGGGYYYYYYYYY.......',
    '........YYGGGGGGGGGGGGGGGGGGGGGYY........',
    '........DGYYGGGGGGGGGGGGGGGGGYYGD........',
    '.......DDGGYYGGGGGGGGGGGGGGGYYGGDD.......',
    '........DGGGGYYGGGGGGGGGGGYYGGGGD........',
    '........DGGGGGYYGGGGGGGGGYYGGGGGD........',
    '........DGGGGGGYGGGGGGGGGYGGGGGGD........',
    '........DDGGGGYGGGGGGGGGGGYGGGGDD........',
    '........DDGGGGYGGGGGGGGGGGYGGGGDD........',
    '.........DDGGGYGGGGYYYGGGGYGGGDD.........',
    '..........DGGYGGGGYYGYYGGGGYGGD..........',
    '..........DDGYGGYYGGGGGYYGGYGDD..........',
    '...........DDYGYYGGGGGGGYYGYDD...........',
    '............YYYGGGGGGGGGGGYYY............',
    '............YYDDDGGGGGGGDDDYY............',
    '...............DDDDDDDDDDD...............',
    '....................D....................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
  ].join(''),
};

/** Private jet — sleek profile with gold stripe */
const PVT_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: { S: '#1E293B', G: '#D4AF37', D: '#64748B' },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........SSSSSSSSS.......................',
    '.........SSSSSSSSS.......................',
    '.........SSSSSSSSS.......................',
    '.........SSSSSSSSS.......................',
    '.........SSSSS.......S...................',
    '.........SSSSSSSSSSSSSSSSSSSS............',
    '.........SSSSSSSSSSSSSSSSSSSSSSS.........',
    '.........SSSSSSSSSSSSSSSSSSSSSSSSS.......',
    '.........SSSSSSSSSSSSSSSSSSSSSSSSSSSSS...',
    '.........SSSSSSSSSSSSSSSSSSSSSSSSSSSSS...',
    '.........SSSSSSGGGGGGGGGGGGGGSSSSSSSSS...',
    '.........SSSSSSGGGGGGGGGGGGGGSSSSSSSSS...',
    '.........SSSSSSSSSSSSSSSSSSSSSSSSS.......',
    '............SSSSSSSSSSSSSSSSSSS..........',
    '..............SSSSSDDDDDSSSS.............',
    '..............SSSSSDDDDDSSSS.............',
    '...................DDDDD.................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
  ].join(''),
};

/** General aviation — high-wing single prop */
const GA_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: { W: '#FFFFFF', B: '#166534', R: '#DC2626', D: '#64748B' },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '...................RRR...................',
    '...................RRR...................',
    '...................RRR...................',
    '...................RRR...................',
    '...................RRR...................',
    '.........................................',
    '........BBBBBBBBBBBBBBBBBBBBBBBBB........',
    '........BBBBBBBBBBBBBBBBBBBBBBBBB........',
    '..................WWWWW..................',
    '..................WWWWW..................',
    '..................WWWWW..................',
    '..................WWWWW..................',
    '..................WWWWW..................',
    '...........WWWWWWWWWWWWWWWWWWW...........',
    '...........WWWWWWWWWWWWWWWWWWWWWWW.......',
    '...........WWWWWWWWWWWWWWWWWWWWWWW.......',
    '...........WWWWWWWWWWWWWWWWWWW...........',
    '..................DDDDD..................',
    '..................DDDDD..................',
    '..................DDDDD..................',
    '..................DDDDD..................',
    '.................DDDDDDD.................',
    '.................DDDDDDD.................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
  ].join(''),
};

/** Notable / VIP jet — gold star on plum disc */
const VIP_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: { P: '#581C87', Y: '#FBBF24' },
  pixels: [
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '....................P....................',
    '...............PPPPPYPPPPP...............',
    '.............PPPPPPYYYPPPPPP.............',
    '............PPPPPPPYYYPPPPPPP............',
    '...........PPPPPPPPYYYPPPPPPPP...........',
    '..........PPPPPPPPYYYPYPPPPPPPP..........',
    '.........PPPPPPPPPYYYPYPPPPPPPPP.........',
    '........PPPPPPPPPYPYYYPYPPPPPPPPP........',
    '........PPPPPPPPPYPYPYYYPPPPPPPPP........',
    '.......PPPPPPPPPYYPYPPYYYPPPPPPPPP.......',
    '......YYYYYYYYYYYPYPPPPYYYYYYYYYYYY......',
    '.......YYYYYPPYYPYYPPPPYYPYYYYYYYY.......',
    '.......PYYYYYYYPPPYPPPYYYYPYYYPYYP.......',
    '.......PPPYPYYPPPPPPPPPPPPPYPPYPPP.......',
    '......PPPPPYYPYYPPPPPPPPPPYYYYPPPPP......',
    '.......PPPPPYYPPYYPPPPPYYPYYYPPPPP.......',
    '.......PPPPPPPYYYPPPPPPYYYYPPPPPPP.......',
    '.......PPPPPPPYPPPPPYPPPYPYPPPPPPP.......',
    '.......PPPPPPYYYPPPYYPPPPYYYPPPPPP.......',
    '.......PPPPPPYPYPPYPYPPPPYPYPPPPPP.......',
    '........PPPPPYPYPYPPYPPYYYYYPPPPP........',
    '........PPPPPYYYYPPPYYYYPYYYYPPPP........',
    '.........PPPYYYYYPYYPYYPPPYYYPPP.........',
    '..........PPYYYPYYPPPPPYYPPYYPP..........',
    '...........PYYYYYPPPPPPPPYYYYP...........',
    '...........YYYYPPPPPPPPPPPYYYY...........',
    '...........YYPPPPPPPPPPPPPPPYY...........',
    '...............PPPPPPPPPPP...............',
    '....................P....................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
    '.........................................',
  ].join(''),
};

/** Aer Lingus — green trefoil shamrock on a light tile */
const EIN_MARK: PixelMark = {
  w: LED_MARK_NATIVE_SIZE,
  h: LED_MARK_NATIVE_SIZE,
  palette: {
    G: '#4FB748',
  },
  pixels: buildShamrockMark(LED_MARK_NATIVE_SIZE, 'G'),
};

const MARKS: Record<string, PixelMark> = {
  AAL: AAL_MARK,
  EIN: EIN_MARK,
  SWA: SWA_MARK,
  DAL: DAL_MARK,
  SKW: SKW_MARK,
  MIL: MIL_MARK,
  PVT: PVT_MARK,
  GA: GA_MARK,
  VIP: VIP_MARK,
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
  h: number,
  options?: { maxScale?: number }
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
  const maxScale = options?.maxScale ?? 1;
  /** 1 mark pixel = 1 LED on wall tiles; previews may upscale to fill the canvas. */
  const scale = Math.max(1, Math.min(maxScale, Math.floor(fitScale)) || 1);
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
