/** Pick a column count that avoids a single orphaned card on the last row. */
export function chooseGridColumns(itemCount: number, maxCols: number): number {
  if (itemCount <= 1) return 1;

  const cap = Math.min(Math.max(maxCols, 2), itemCount);
  for (let cols = cap; cols >= 2; cols--) {
    if (itemCount % cols !== 1) return cols;
  }

  return itemCount;
}

export function maxGridColumns(containerWidthPx: number, itemMinWidthPx: number, gapPx: number): number {
  if (containerWidthPx <= 0 || itemMinWidthPx <= 0) return 1;
  return Math.max(1, Math.floor((containerWidthPx + gapPx) / (itemMinWidthPx + gapPx)));
}

export function singleRowWidthPx(itemCount: number, itemMinWidthPx: number, gapPx: number): number {
  if (itemCount <= 0) return 0;
  return itemCount * itemMinWidthPx + Math.max(0, itemCount - 1) * gapPx;
}
