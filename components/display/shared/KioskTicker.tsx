'use client';

import {
  Children,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { observeResize } from '@/lib/observeResize';
import { chooseGridColumns, maxGridColumns, singleRowWidthPx } from '@/lib/tickerGrid';

const GRID_GAP_PX = 8;

type KioskTickerProps = {
  children: ReactNode;
  durationSec?: number;
  className?: string;
  /** Minimum card width used to compute grid columns (px). */
  itemMinWidthPx?: number;
};

/** Auto-scrolls horizontally when a single row overflows; otherwise packs cards in a grid. */
export default function KioskTicker({
  children,
  durationSec = 28,
  className = '',
  itemMinWidthPx = 208,
}: KioskTickerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [gridCols, setGridCols] = useState(1);
  const childCount = useMemo(() => Children.count(children), [children]);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const measure = () => {
      const width = outer.clientWidth;
      const maxCols = maxGridColumns(width, itemMinWidthPx, GRID_GAP_PX);
      const cols = chooseGridColumns(childCount, maxCols);
      const scroll =
        cols === childCount &&
        singleRowWidthPx(childCount, itemMinWidthPx, GRID_GAP_PX) > width + 4;

      setGridCols(cols);
      setOverflows(scroll);
    };

    measure();
    return observeResize([outer, inner], measure);
  }, [childCount, children, itemMinWidthPx]);

  const gridStyle: CSSProperties | undefined = overflows
    ? undefined
    : {
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, min(${itemMinWidthPx}px, 100%)))`,
      };

  return (
    <div ref={outerRef} className={`kiosk-ticker-x ${className}`.trim()}>
      <div
        ref={innerRef}
        className={overflows ? 'kiosk-ticker-x__track' : 'kiosk-ticker-x__grid'}
        style={
          overflows
            ? { animationDuration: `${durationSec}s` }
            : gridStyle
        }
      >
        {children}
        {overflows ? <div aria-hidden className="kiosk-ticker-x__dup">{children}</div> : null}
      </div>
    </div>
  );
}
