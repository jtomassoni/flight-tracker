'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { observeResize } from '@/lib/observeResize';

type KioskTickerProps = {
  children: ReactNode;
  durationSec?: number;
  className?: string;
};

/** Auto-scrolls horizontally when content overflows — for pointerless kiosks */
export default function KioskTicker({
  children,
  durationSec = 28,
  className = '',
}: KioskTickerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const measure = () => {
      setOverflows(inner.scrollWidth > outer.clientWidth + 4);
    };

    measure();
    return observeResize([outer, inner], measure);
  }, [children]);

  return (
    <div ref={outerRef} className={`kiosk-ticker-x ${className}`.trim()}>
      <div
        ref={innerRef}
        className={overflows ? 'kiosk-ticker-x__track' : 'kiosk-ticker-x__static'}
        style={overflows ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {children}
        {overflows ? <div aria-hidden className="kiosk-ticker-x__dup">{children}</div> : null}
      </div>
    </div>
  );
}
