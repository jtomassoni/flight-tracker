const LED_PALETTES_STORAGE_KEY = 'flight-tracker-led-palettes-v1';

type Rgb = { r: number; g: number; b: number };

function parseHexColor(hex: string): Rgb {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length === 3) {
    return {
      r: parseInt(normalized[0]! + normalized[0], 16),
      g: parseInt(normalized[1]! + normalized[1], 16),
      b: parseInt(normalized[2]! + normalized[2], 16),
    };
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`;
}

function rgbDistance(a: Rgb, b: Rgb): number {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function colorLuminance(c: Rgb): number {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

function colorSaturation(c: Rgb): number {
  const max = Math.max(c.r, c.g, c.b);
  const min = Math.min(c.r, c.g, c.b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function blendOnBackground(r: number, g: number, b: number, a: number, bg: Rgb): Rgb {
  const t = a / 255;
  return {
    r: Math.round(r * t + bg.r * (1 - t)),
    g: Math.round(g * t + bg.g * (1 - t)),
    b: Math.round(b * t + bg.b * (1 - t)),
  };
}

function loadLogoImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!url.startsWith('/')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function readImagePixels(image: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new ImageData(1, 1);
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function bucketKey(r: number, g: number, b: number): string {
  const step = 24;
  return `${Math.round(r / step)},${Math.round(g / step)},${Math.round(b / step)}`;
}

function mergeSimilarColors(
  entries: { rgb: Rgb; weight: number }[],
  threshold = 48
): { rgb: Rgb; weight: number }[] {
  const merged: { rgb: Rgb; weight: number }[] = [];
  for (const entry of entries) {
    const existing = merged.find((m) => rgbDistance(m.rgb, entry.rgb) < threshold);
    if (existing) {
      const total = existing.weight + entry.weight;
      existing.rgb = {
        r: Math.round((existing.rgb.r * existing.weight + entry.rgb.r * entry.weight) / total),
        g: Math.round((existing.rgb.g * existing.weight + entry.rgb.g * entry.weight) / total),
        b: Math.round((existing.rgb.b * existing.weight + entry.rgb.b * entry.weight) / total),
      };
      existing.weight = total;
    } else {
      merged.push({ rgb: { ...entry.rgb }, weight: entry.weight });
    }
  }
  return merged.sort((a, b) => b.weight - a.weight);
}

/**
 * Pull dominant logo fills from an approved PNG — ignores tile background and
 * anti-alias fringe so multicolor marks (e.g. orange sun + blue letter) snap correctly.
 */
export function extractLedLogoPaletteFromImage(
  image: HTMLImageElement,
  logoBackground: string,
  maxColors = 4
): string[] {
  const src = readImagePixels(image);
  const bg = parseHexColor(logoBackground);
  const buckets = new Map<string, { rgb: Rgb; weight: number }>();

  for (let i = 0; i < src.data.length; i += 4) {
    const r = src.data[i] ?? 0;
    const g = src.data[i + 1] ?? 0;
    const b = src.data[i + 2] ?? 0;
    const a = src.data[i + 3] ?? 0;
    if (a < 48) continue;

    const blended = blendOnBackground(r, g, b, a, bg);
    if (rgbDistance(blended, bg) < 36) continue;
    if (colorLuminance(blended) < 24) continue;

    const key = bucketKey(blended.r, blended.g, blended.b);
    const weight = a / 255;
    const prev = buckets.get(key);
    if (prev) {
      const total = prev.weight + weight;
      prev.rgb = {
        r: Math.round((prev.rgb.r * prev.weight + blended.r * weight) / total),
        g: Math.round((prev.rgb.g * prev.weight + blended.g * weight) / total),
        b: Math.round((prev.rgb.b * prev.weight + blended.b * weight) / total),
      };
      prev.weight = total;
    } else {
      buckets.set(key, { rgb: blended, weight });
    }
  }

  const ranked = mergeSimilarColors([...buckets.values()]);
  const vivid = ranked.filter((entry) => colorSaturation(entry.rgb) >= 0.12 || colorLuminance(entry.rgb) > 200);
  const pool = vivid.length >= 2 ? vivid : ranked;

  const palette: string[] = [];
  for (const entry of pool) {
    const hex = rgbToHex(entry.rgb.r, entry.rgb.g, entry.rgb.b);
    if (palette.some((existing) => rgbDistance(parseHexColor(existing), entry.rgb) < 32)) continue;
    if (rgbDistance(entry.rgb, bg) < 36) continue;
    palette.push(hex);
    if (palette.length >= maxColors) break;
  }

  return palette.sort((a, b) => colorSaturation(parseHexColor(b)) - colorSaturation(parseHexColor(a)));
}

export async function analyzeLedLogoPalette(
  logoUrl: string,
  logoBackground: string
): Promise<string[]> {
  const image = await loadLogoImage(logoUrl);
  if (!image) return [];
  return extractLedLogoPaletteFromImage(image, logoBackground);
}

function readStoredPalettes(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LED_PALETTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getStoredLedLogoPalette(icao: string): string[] | null {
  const key = icao.trim().toUpperCase();
  const stored = readStoredPalettes()[key];
  if (!stored?.length) return null;
  return stored;
}

export function storeLedLogoPalette(icao: string, palette: readonly string[]): void {
  if (typeof window === 'undefined' || palette.length === 0) return;
  const key = icao.trim().toUpperCase();
  const all = readStoredPalettes();
  all[key] = [...palette];
  try {
    localStorage.setItem(LED_PALETTES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* storage full — ignore */
  }
}

export function clearStoredLedLogoPalette(icao: string): void {
  if (typeof window === 'undefined') return;
  const key = icao.trim().toUpperCase();
  const all = readStoredPalettes();
  if (!(key in all)) return;
  delete all[key];
  try {
    localStorage.setItem(LED_PALETTES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function resolveLedLogoPalette(
  icao: string,
  fallback: readonly string[]
): readonly string[] {
  return getStoredLedLogoPalette(icao) ?? fallback;
}

export async function analyzeAndStoreLedLogoPalette(
  icao: string,
  logoUrl: string,
  logoBackground: string
): Promise<string[]> {
  const palette = await analyzeLedLogoPalette(logoUrl, logoBackground);
  if (palette.length > 0) {
    storeLedLogoPalette(icao, palette);
  }
  return palette;
}
