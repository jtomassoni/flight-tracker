'use client';

import { useEffect, useRef, useState } from 'react';
import { RADAR_SWEEP_DURATION_SEC } from '@/lib/constants';
import {
  hasSweepCrossedBearing,
  sweepBearingAt,
  toRadarBlips,
  type RadarBlip,
} from '@/lib/radarPosition';
import type { NormalizedAircraft } from '@/types/aircraft';

function blipMap(blips: RadarBlip[]): Map<string, RadarBlip> {
  return new Map(blips.map((blip) => [blip.aircraft.hex, blip]));
}

function orderedBlips(targets: RadarBlip[], displayed: Map<string, RadarBlip>): RadarBlip[] {
  return targets
    .map((target) => displayed.get(target.aircraft.hex))
    .filter((blip): blip is RadarBlip => blip != null);
}

/** Hold each blip at its last swept position until the rotating sweep line passes its bearing. */
export function useRadarSweepBlips(
  aircraft: NormalizedAircraft[],
  centerLat: number,
  centerLon: number,
  maxRadiusMi: number
): RadarBlip[] {
  const aircraftRef = useRef(aircraft);
  aircraftRef.current = aircraft;

  const scopeRef = useRef({ centerLat, centerLon, maxRadiusMi });
  scopeRef.current = { centerLat, centerLon, maxRadiusMi };

  const displayedRef = useRef<Map<string, RadarBlip>>(
    blipMap(toRadarBlips(aircraft, centerLat, centerLon, maxRadiusMi))
  );
  const prevSweepRef = useRef(0);
  const startTimeRef = useRef(0);

  const [displayed, setDisplayed] = useState<RadarBlip[]>(() =>
    orderedBlips(
      toRadarBlips(aircraft, centerLat, centerLon, maxRadiusMi),
      displayedRef.current
    )
  );

  useEffect(() => {
    const initial = toRadarBlips(aircraft, centerLat, centerLon, maxRadiusMi);
    displayedRef.current = blipMap(initial);
    setDisplayed(initial);
    startTimeRef.current = performance.now();
    prevSweepRef.current = sweepBearingAt(0, RADAR_SWEEP_DURATION_SEC);
  }, [centerLat, centerLon, maxRadiusMi]);

  useEffect(() => {
    let raf = 0;

    const tick = (now: number) => {
      const { centerLat: lat, centerLon: lon, maxRadiusMi: radius } = scopeRef.current;
      const targets = toRadarBlips(aircraftRef.current, lat, lon, radius);
      const map = displayedRef.current;

      const elapsed = (now - startTimeRef.current) / 1000;
      const currSweep = sweepBearingAt(elapsed, RADAR_SWEEP_DURATION_SEC);
      const prevSweep = prevSweepRef.current;

      let changed = false;

      for (const target of targets) {
        const hex = target.aircraft.hex;
        if (!map.has(hex)) {
          map.set(hex, target);
          changed = true;
          continue;
        }
        if (hasSweepCrossedBearing(prevSweep, currSweep, target.bearing)) {
          map.set(hex, target);
          changed = true;
        }
      }

      const active = new Set(targets.map((t) => t.aircraft.hex));
      for (const hex of map.keys()) {
        if (!active.has(hex)) {
          map.delete(hex);
          changed = true;
        }
      }

      prevSweepRef.current = currSweep;

      if (changed) {
        setDisplayed(orderedBlips(targets, map));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return displayed;
}
