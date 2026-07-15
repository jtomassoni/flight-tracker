'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    const legacyHandler = () => setMatches(mq.matches);
    mq.addListener(legacyHandler);
    return () => mq.removeListener(legacyHandler);
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
  if (narrow) return 0.85;
  if (halfScreen) return 0.95;
  if (medium) return 1;
  return 1.1;
}
