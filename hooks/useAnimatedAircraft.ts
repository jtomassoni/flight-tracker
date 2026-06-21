'use client';

import { useEffect, useRef, useState } from 'react';
import {
  extrapolateAircraft,
  snapshotFromAircraft,
  type AircraftMotionSnapshot,
} from '@/lib/aircraftMotion';
import type { NormalizedAircraft } from '@/types/aircraft';

export function useAnimatedAircraft(
  aircraft: NormalizedAircraft[],
  dataUpdatedAt: Date | null | undefined,
  enabled = true
): NormalizedAircraft[] {
  const snapshotsRef = useRef<Map<string, AircraftMotionSnapshot>>(new Map());
  const [animated, setAnimated] = useState(aircraft);

  useEffect(() => {
    const map = snapshotsRef.current;
    const active = new Set(aircraft.map((ac) => ac.hex));

    for (const hex of map.keys()) {
      if (!active.has(hex)) map.delete(hex);
    }

    for (const ac of aircraft) {
      map.set(ac.hex, snapshotFromAircraft(ac, dataUpdatedAt));
    }

    if (!enabled) {
      setAnimated(aircraft);
    }
  }, [aircraft, dataUpdatedAt, enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    let raf = 0;
    const tick = () => {
      const now = Date.now();
      const map = snapshotsRef.current;
      const next = aircraft.map((ac) => {
        const snapshot = map.get(ac.hex);
        if (!snapshot) return ac;
        return extrapolateAircraft(ac, snapshot, now);
      });
      setAnimated(next);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [aircraft, enabled]);

  return enabled ? animated : aircraft;
}
