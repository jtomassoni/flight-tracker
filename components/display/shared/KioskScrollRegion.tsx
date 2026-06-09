'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type KioskScrollRegionProps = {
  children: ReactNode;
  /** Full scroll cycle duration in seconds */
  durationSec?: number;
  className?: string;
};

/** Auto-scrolls vertically when content overflows — for pointerless kiosks */
export default function KioskScrollRegion({
  children,
  durationSec = 36,
  className = '',
}: KioskScrollRegionProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const measure = () => {
      setOverflows(inner.scrollHeight > outer.clientHeight + 4);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={outerRef} className={`kiosk-scroll-y ${className}`.trim()}>
      <div
        ref={innerRef}
        className={overflows ? 'kiosk-scroll-y__track' : undefined}
        style={overflows ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {children}
        {overflows ? <div aria-hidden>{children}</div> : null}
      </div>
    </div>
  );
}
