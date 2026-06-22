'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches('matches' in e && typeof e.matches === 'boolean' ? e.matches : mq.matches);
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
      return () => mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
    }

    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [query]);

  return matches;
}

/** Coarse pointer (touch) — typical for wall-mounted iPad kiosks */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/** Logo workbench preview scale — keep in sync with --tt-scale in theme-tester.css */
export function useWorkbenchPreviewScale(): number {
  const narrow = useMediaQuery('(max-width: 560px)');
  const halfScreen = useMediaQuery('(max-width: 1100px)');
  const medium = useMediaQuery('(max-width: 1400px)');
  if (narrow) return 0.92;
  if (halfScreen) return 1;
  if (medium) return 1.15;
  return 1.5;
}
