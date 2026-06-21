/** Procedural LED marks — empty until new assets are approved via blob. */

/** Native art size — one mark pixel = one LED on typical logo tiles (~40–60 px). */
export const LED_MARK_NATIVE_SIZE = 41;

type PixelMark = {
  w: number;
  h: number;
  pixels: string;
  palette: Record<string, string>;
};

const MARKS: Record<string, PixelMark> = {};

export function hasLedAirlineMark(icao: string): boolean {
  return icao in MARKS;
}

export function drawLedAirlineMark(
  _ctx: CanvasRenderingContext2D,
  icao: string,
  _x: number,
  _y: number,
  _w: number,
  _h: number,
  _options?: { maxScale?: number }
): boolean {
  return icao in MARKS;
}
