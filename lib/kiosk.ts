/** Logical pixel size of a 10.9" iPad Air — used by the theme tester preview */
export const IPAD_SCREEN = {
  portrait: { width: 820, height: 1180 },
  landscape: { width: 1180, height: 820 },
} as const;

export type IpadOrientation = keyof typeof IPAD_SCREEN;

export const IPAD_BEZEL_PX = 16;
export const IPAD_CHIN_PX = 22;
