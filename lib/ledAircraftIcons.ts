/**
 * Tiny LED-pixel aircraft silhouettes drawn beside the aircraft-type readout on the
 * FlightWall stats row. One mark differentiates the rough size class at a glance —
 * heavy / mainline jet / regional jet / prop — without needing extra text.
 */

export type LedAircraftIcon = 'heavy' | 'jet' | 'regional' | 'prop';

type IconArt = {
  w: number;
  h: number;
  /** Row-major silhouette — any non-space char = lit, ' ' = off. */
  rows: readonly string[];
};

/** All marks are 11×7, nose pointing right, fuselage on the center row. */
const ICONS: Record<LedAircraftIcon, IconArt> = {
  // Widebody — full-height swept wings read as the biggest airframe.
  heavy: {
    w: 11,
    h: 7,
    rows: [
      '  XX       ',
      '  XXX      ',
      ' XXXXX     ',
      'XXXXXXXXXXX',
      ' XXXXX     ',
      '  XXX      ',
      '  XX       ',
    ],
  },
  // Mainline narrowbody — medium swept wings + tail stabilizers.
  jet: {
    w: 11,
    h: 7,
    rows: [
      '   XX      ',
      '   XXX     ',
      ' X  XXX    ',
      'XXXXXXXXXXX',
      ' X  XXX    ',
      '   XXX     ',
      '   XX      ',
    ],
  },
  // Regional jet — compact wing block, shorter fuselage.
  regional: {
    w: 11,
    h: 7,
    rows: [
      '    X      ',
      '   XXX     ',
      '   XXX     ',
      'XXXXXXXXX  ',
      '   XXX     ',
      '   XXX     ',
      '    X      ',
    ],
  },
  // Turboprop / GA — straight (unswept) wing crossing the fuselage, nose prop.
  prop: {
    w: 11,
    h: 7,
    rows: [
      '    X      ',
      '    X      ',
      '   XXX    X',
      'XXXXXXXXXXX',
      '   XXX    X',
      '    X      ',
      '    X      ',
    ],
  },
};

const HEAVY_TYPE_PREFIXES = ['B74', 'B76', 'B77', 'B78'] as const;
const HEAVY_TYPE_CODES = new Set([
  'A306',
  'A30B',
  'A310',
  'A332',
  'A333',
  'A338',
  'A339',
  'A342',
  'A343',
  'A345',
  'A346',
  'A359',
  'A35K',
  'A388',
  'MD11',
  'IL96',
]);

const REGIONAL_TYPE_PREFIXES = [
  'CRJ',
  'E13',
  'E14',
  'E17',
  'E19',
  'E29',
  'E45',
  'E75',
  'ERJ',
  'SU9',
  'RJ',
] as const;

const PROP_TYPE_PREFIXES = [
  'DH8',
  'DHC',
  'AT4',
  'AT5',
  'AT7',
  'SF3',
  'SW4',
  'SB20',
  'D328',
  'JS3',
  'JS4',
  'E11',
  'E12',
  'B19',
  'C20',
  'C172',
  'C182',
  'C150',
  'C152',
  'C206',
  'C210',
  'C77',
  'PA2',
  'PA3',
  'PA4',
  'P28',
  'SR2',
  'DA4',
  'BE3',
  'M20',
  'TBM',
  'PC12',
  'PC6',
] as const;

function startsWithAny(code: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => code.startsWith(prefix));
}

/** Map an ICAO type designator to the rough size class used for the silhouette. */
export function classifyLedAircraftIcon(rawType?: string, category?: string): LedAircraftIcon {
  const code = (rawType ?? '').trim().toUpperCase();
  if (code) {
    if (HEAVY_TYPE_CODES.has(code) || startsWithAny(code, HEAVY_TYPE_PREFIXES)) return 'heavy';
    if (startsWithAny(code, REGIONAL_TYPE_PREFIXES)) return 'regional';
    if (startsWithAny(code, PROP_TYPE_PREFIXES)) return 'prop';
    return 'jet';
  }

  // No explicit type — lean on ADS-B emitter category for light traffic.
  const cat = (category ?? '').trim().toUpperCase();
  if (cat === 'A1' || cat === 'A2') return 'prop';
  return 'jet';
}

/** Native aspect ratio (width / height) of a silhouette. */
export function ledAircraftIconAspect(kind: LedAircraftIcon): number {
  const art = ICONS[kind];
  return art.w / art.h;
}

/**
 * Draw a silhouette into the LED buffer at the given height. Uses sub-cell fillRect
 * coverage (same as scaled glyph text) so it lines up with small telemetry type.
 * Returns the drawn width in LED columns.
 */
export function drawLedAircraftIcon(
  ctx: CanvasRenderingContext2D,
  kind: LedAircraftIcon,
  x: number,
  yTop: number,
  targetH: number,
  color: string
): number {
  const art = ICONS[kind];
  if (targetH <= 0) return 0;
  const scale = targetH / art.h;

  ctx.fillStyle = color;
  for (let row = 0; row < art.h; row += 1) {
    const line = art.rows[row] ?? '';
    for (let col = 0; col < art.w; col += 1) {
      if ((line[col] ?? ' ') === ' ') continue;
      ctx.fillRect(x + col * scale, yTop + row * scale, scale, scale);
    }
  }

  return art.w * scale;
}
